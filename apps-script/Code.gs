/**
 * Ubay-Ubay backend (Google Apps Script web app).
 *
 * 1. Sign-up (sign-up.html): saves the signed letter PDF in Drive, adds a row to the
 *    "Signups" tab, and emails the PDF to the artist and to the org.
 * 2. Staff page (admin.html): lists sign-ups. Accept sends the welcome email with the
 *    artist's private upload link, Decline sends a kind "not this time" email.
 * 3. Upload page (upload.html?t=<code>): an accepted artist uploads their bundle. Files go
 *    into that artist's own folder: Ubay-Ubay submissions / Artists / <Artist (Full name)>.
 *
 * Setup is in README.md ("Set up the sign-up form" and "Use the staff page"). After pasting
 * a new version of this file: run setup once, then Deploy > Manage deployments > pencil >
 * Version: New version > Deploy (keeps the same URL).
 *
 * EDIT: Settings live in Project Settings > Script Properties:
 *   ADMIN_PASSWORD     the staff page password (you add this one yourself)
 *   ORG_EMAIL          where the "Signed acceptance" emails go
 *   SITE_URL           the website address, used in the upload links
 *   LETTERS_FOLDER_ID, ARTISTS_FOLDER_ID   the Drive folders (made by setup, leave alone)
 */

const SHEET_NAME = 'Signups';
const SIGNUP_HEADERS = ['Timestamp', 'Full name', 'Artist name', 'Email', 'Social', 'Date signed', 'Letter PDF', 'Test',
  'ID', 'Status', 'Replied', 'Upload code', 'Decided by', 'Decided at', 'Artist folder'];
const UPLOAD_HEADERS = ['Timestamp', 'Signup ID', 'Artist', 'Month', 'Bundle', 'Slot', 'File', 'Drive file ID'];
const LOG_HEADERS = ['Timestamp', 'Staff', 'Action', 'Signup ID', 'Details'];

const DEFAULT_ORG_EMAIL = 'ubayubaytinkers@gmail.com';
const DEFAULT_SITE_URL = 'https://mewrkl.github.io/Ubay-Ubay-Website/';
const TIMEZONE = 'Asia/Manila';
const MAX_PDF_BYTES = 3 * 1024 * 1024;     // a signed letter is about 20 to 300 KB
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // one PNG
const PIN_SIZE = 1000;                     // pins and solo pins are 1000 x 1000 px
const WINDOW_SECONDS = 600;                // the flood guards count over 10 minutes
const MAX_SIGNUPS = 20;
const MAX_UPLOADS = 200;
const MAX_WRONG_PASSWORDS = 10;
const SLOTS = ['pin-1', 'pin-2', 'pin-3', 'pin-4', 'logo', 'solo'];


// ---------- Setup ----------

/** Run this by hand once, and again after pasting a new version (select "setup", click Run). */
function setup() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  ensureTab(book, SHEET_NAME, SIGNUP_HEADERS, 0);
  ensureTab(book, 'Uploads', UPLOAD_HEADERS);
  ensureTab(book, 'Log', LOG_HEADERS);

  // Older rows get an ID and the status "New".
  const table = readTable(SHEET_NAME);
  table.rows.forEach((row) => {
    if (!row.get('ID')) table.set(row, 'ID', Utilities.getUuid());
    if (!row.get('Status')) table.set(row, 'Status', 'New');
  });

  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('LETTERS_FOLDER_ID')) {
    const root = DriveApp.createFolder('Ubay-Ubay submissions');
    props.setProperty('LETTERS_FOLDER_ID', root.createFolder('Signed letters').getId());
  }
  if (!props.getProperty('ARTISTS_FOLDER_ID')) {
    props.setProperty('ARTISTS_FOLDER_ID', rootFolder().createFolder('Artists').getId());
  }
  if (!props.getProperty('ORG_EMAIL')) props.setProperty('ORG_EMAIL', DEFAULT_ORG_EMAIL);
  if (!props.getProperty('SITE_URL')) props.setProperty('SITE_URL', DEFAULT_SITE_URL);

  // Sending one email to yourself makes Google ask for the email permission now,
  // instead of the first artist's sign-up failing.
  MailApp.sendEmail(Session.getEffectiveUser().getEmail(), 'Ubay-Ubay backend is set up',
    'The backend is ready. If this is a new version, publish it: Deploy > Manage deployments > pencil > New version.' +
    (props.getProperty('ADMIN_PASSWORD') ? '' : '\n\nThe staff page needs a password: add ADMIN_PASSWORD in Project Settings > Script Properties.'));
  Logger.log('Done. Submissions folder: ' + rootFolder().getUrl());
}

function ensureTab(book, name, headers, index) {
  let tab = book.getSheetByName(name);
  if (!tab) tab = index === undefined ? book.insertSheet(name) : book.insertSheet(name, index);
  const current = tab.getLastRow() === 0 ? [] : tab.getRange(1, 1, 1, tab.getLastColumn()).getValues()[0];
  const missing = headers.filter((h) => current.indexOf(h) === -1);
  if (missing.length) {
    tab.getRange(1, current.length + 1, 1, missing.length).setValues([missing]);
    tab.setFrozenRows(1);
    tab.getRange(1, 1, 1, current.length + missing.length).setFontWeight('bold');
  }
}


// ---------- Web app entry points ----------

/** Opening the web app URL in a browser shows {"ok":true}, so you can check it is live. */
function doGet() {
  return reply({ ok: true });
}

const ACTIONS = {
  signup: signupAction,
  staffList: staffOnly(staffList),
  staffDecide: staffOnly(staffDecide),
  staffResendLink: staffOnly(staffResendLink),
  staffSetReplied: staffOnly(staffSetReplied),
  staffThumbs: staffOnly(staffThumbs),
  staffFile: staffOnly(staffFile),
  uploadInfo: uploadInfo,
  uploadFile: uploadFile,
};

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = ACTIONS[data.action];
    if (!action) return reply({ ok: false, error: 'Unknown request.' });
    return reply(action(data));
  } catch (err) {
    console.error(err);
    return reply({ ok: false, error: 'Something went wrong on our side. Please try again.' });
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Runs fn while holding the script lock, so two requests never write at the same time. */
function withLock(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

/** Flood guard: true once more than `max` requests of this kind came in the last 10 minutes. */
function tooMany(kind, max) {
  const cache = CacheService.getScriptCache();
  const count = Number(cache.get(kind) || 0) + 1;
  cache.put(kind, String(count), WINDOW_SECONDS);
  return count > max;
}


// ---------- 1. Sign-up ----------

function signupAction(d) {
  // Spam bots fill every field, people never see this one. Pretend it worked.
  if (d.website) return { ok: true };

  const problem = checkSignup(d);
  if (problem) return { ok: false, error: problem };
  if (tooMany('signups', MAX_SIGNUPS)) {
    return { ok: false, error: 'A lot of people are signing right now. Please try again in a few minutes.' };
  }

  const pdfBytes = Utilities.base64Decode(d.pdf);
  if (pdfBytes.length > MAX_PDF_BYTES) return { ok: false, error: 'The signed letter is too large to send.' };

  withLock(() => saveSignup(d, pdfBytes));
  return { ok: true };
}

/** Returns a plain-language problem, or '' when everything is fine. */
function checkSignup(d) {
  const text = (v, max) => typeof v === 'string' && v.trim() !== '' && v.length <= max;
  if (!text(d.fullName, 120)) return 'Please enter your full name.';
  if (!text(d.artistName, 80)) return 'Please enter your artist name.';
  if (!text(d.email, 160) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) return 'Please enter a valid email.';
  if (!text(d.social, 120)) return 'Please enter your social handle.';
  if (d.agree !== true) return 'Please tick the box to agree to the letter.';
  if (typeof d.pdf !== 'string' || !/^[A-Za-z0-9+/=]+$/.test(d.pdf)) return 'The signed letter is missing.';
  return '';
}

function saveSignup(d, pdfBytes) {
  const isTest = d.test === true;
  const fullName = d.fullName.trim();
  const artistName = d.artistName.trim();
  const email = d.email.trim();
  const social = d.social.trim();
  const dateSigned = String(d.dateSigned || '').slice(0, 10) || today('yyyy-MM-dd');

  // 1. The PDF, named ArtistName_FullName_2026-10-06.pdf
  const fileName = [artistName, fullName].map(safeName).join('_') + '_' + dateSigned + (isTest ? '_TEST' : '') + '.pdf';
  const blob = Utilities.newBlob(pdfBytes, 'application/pdf', fileName);
  const file = DriveApp.getFolderById(prop('LETTERS_FOLDER_ID')).createFile(blob);

  // 2. The Sheet row
  appendRow(SHEET_NAME, {
    'Timestamp': new Date(),
    'Full name': fullName,
    'Artist name': artistName,
    'Email': email,
    'Social': social,
    'Date signed': dateSigned,
    'Letter PDF': file.getUrl(),
    'Test': isTest ? 'yes' : '',
    'ID': Utilities.getUuid(),
    'Status': 'New',
  });

  // 3. The emails
  const tag = isTest ? '[TEST] ' : '';
  MailApp.sendEmail({
    to: email,
    subject: tag + 'Your signed Ubay-Ubay acceptance letter',
    body:
      'Hi ' + artistName + ',\n\n' +
      'Thank you for signing up for the Ubay-Ubay pin bundle program! Your signed acceptance letter is attached. Keep it for your records.\n\n' +
      'Our team will review your sign-up and email you from this address within 1 to 3 business days ' +
      'to let you know if you\'re in and what to do next. Please keep an eye on your inbox, and check your Spam folder too.\n\n' +
      'Questions? Reply to this email.\n\n' +
      'Ubay-Ubay, a Tinkers fundraiser (UP Cebu Fine Arts)',
    attachments: [blob],
    name: 'Ubay-Ubay',
    replyTo: orgEmail(),
  });
  MailApp.sendEmail({
    to: orgEmail(),
    subject: tag + 'Signed acceptance: ' + artistName,
    body:
      'A new artist signed the acceptance letter. Accept or decline them on the staff page:\n' +
      siteUrl() + 'admin.html\n\n' +
      'Full name: ' + fullName + '\n' +
      'Artist name: ' + artistName + '\n' +
      'Email: ' + email + '\n' +
      'Social: ' + social + '\n' +
      'Date signed: ' + dateSigned,
    attachments: [blob],
    name: 'Ubay-Ubay sign-up form',
    replyTo: email,
  });
}


// ---------- 2. Staff page ----------

/** Wraps a staff action: checks the password first, and slows down guessing. */
function staffOnly(fn) {
  return (d) => {
    const cache = CacheService.getScriptCache();
    const wrong = Number(cache.get('wrong-passwords') || 0);
    if (wrong >= MAX_WRONG_PASSWORDS) {
      return { ok: false, error: 'Too many wrong passwords. Wait 10 minutes, then try again.', auth: true };
    }
    const password = prop('ADMIN_PASSWORD');
    if (!password) {
      return { ok: false, error: 'The staff password is not set yet. Add ADMIN_PASSWORD in the Apps Script settings.', auth: true };
    }
    if (d.password !== password) {
      cache.put('wrong-passwords', String(wrong + 1), WINDOW_SECONDS);
      Utilities.sleep(1500);
      return { ok: false, error: 'That password is not right.', auth: true };
    }
    const staff = String(d.staff || '').trim().slice(0, 60);
    if (!staff) return { ok: false, error: 'Type your name, so changes show who made them.', auth: true };
    return fn(d, staff);
  };
}

function staffList() {
  const uploads = uploadSummary();
  const signups = readTable(SHEET_NAME).rows.map((row) => {
    const id = row.get('ID');
    const status = row.get('Status') || 'New';
    return {
      id: id,
      timestamp: isoDate(row.get('Timestamp')),
      fullName: text(row.get('Full name')),
      artistName: text(row.get('Artist name')),
      email: text(row.get('Email')),
      social: text(row.get('Social')),
      dateSigned: dayText(row.get('Date signed')),
      test: row.get('Test') === 'yes',
      status: status,
      replied: row.get('Replied') === 'yes',
      decidedBy: text(row.get('Decided by')),
      decidedAt: isoDate(row.get('Decided at')),
      hasLetter: Boolean(fileIdFromUrl(row.get('Letter PDF'))),
      uploadLink: status === 'Accepted' && row.get('Upload code') ? uploadLink(row.get('Upload code')) : '',
      uploads: uploads[id] || [],
    };
  }).filter((s) => s.id);
  return { ok: true, signups: signups };
}

function staffDecide(d, staff) {
  if (d.decision !== 'accept' && d.decision !== 'decline') return { ok: false, error: 'Unknown decision.' };
  return withLock(() => {
    const table = readTable(SHEET_NAME);
    const row = table.find('ID', d.signupId);
    if (!row) return { ok: false, error: 'That sign-up was not found. Refresh the page.' };
    if ((row.get('Status') || 'New') !== 'New') {
      return { ok: false, error: 'This sign-up was already ' + row.get('Status').toLowerCase() + ' by ' + row.get('Decided by') + '.' };
    }

    if (d.decision === 'accept') {
      const code = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
      const folderName = safeName(text(row.get('Artist name'))) + ' (' + safeName(text(row.get('Full name'))) + ')';
      const folder = DriveApp.getFolderById(prop('ARTISTS_FOLDER_ID')).createFolder(folderName);
      table.set(row, 'Upload code', code);
      table.set(row, 'Artist folder', folder.getUrl());
      table.set(row, 'Status', 'Accepted');
      sendAcceptEmail(row, code);
    } else {
      table.set(row, 'Status', 'Declined');
      sendDeclineEmail(row);
    }
    table.set(row, 'Replied', 'yes');
    table.set(row, 'Decided by', staff);
    table.set(row, 'Decided at', new Date());
    log(staff, d.decision === 'accept' ? 'Accepted' : 'Declined', d.signupId, text(row.get('Artist name')));
    return { ok: true };
  });
}

function staffResendLink(d, staff) {
  const row = readTable(SHEET_NAME).find('ID', d.signupId);
  if (!row || row.get('Status') !== 'Accepted' || !row.get('Upload code')) {
    return { ok: false, error: 'Only accepted artists have an upload link.' };
  }
  sendAcceptEmail(row, row.get('Upload code'));
  log(staff, 'Resent upload link', d.signupId, text(row.get('Artist name')));
  return { ok: true };
}

function staffSetReplied(d, staff) {
  return withLock(() => {
    const table = readTable(SHEET_NAME);
    const row = table.find('ID', d.signupId);
    if (!row) return { ok: false, error: 'That sign-up was not found. Refresh the page.' };
    table.set(row, 'Replied', d.replied ? 'yes' : '');
    log(staff, d.replied ? 'Marked replied' : 'Marked not replied', d.signupId, text(row.get('Artist name')));
    return { ok: true };
  });
}

/** Small pictures of one artist's uploads for one month, for the staff page. */
function staffThumbs(d) {
  const rows = readTable('Uploads').rows.filter((r) => r.get('Signup ID') === d.signupId && r.get('Month') === d.month);
  const thumbs = rows.map((r) => {
    try {
      const file = DriveApp.getFileById(r.get('Drive file ID'));
      // Drive makes a small thumbnail a little after the upload. Until then, send the file itself.
      let blob = file.getThumbnail();
      if (!blob && file.getSize() <= 3 * 1024 * 1024) blob = file.getBlob();
      return {
        fileId: r.get('Drive file ID'),
        bundle: text(r.get('Bundle')),
        slot: r.get('Slot'),
        name: text(r.get('File')),
        src: blob ? 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes()) : '',
      };
    } catch (err) {
      return null; // the file was deleted in Drive
    }
  }).filter(Boolean);
  return { ok: true, thumbs: thumbs };
}

/** One full file (a pin or a signed letter) for the staff page, so staff never need Drive. */
function staffFile(d) {
  let fileId = d.fileId;
  if (d.letterFor) {
    const row = readTable(SHEET_NAME).find('ID', d.letterFor);
    fileId = row && fileIdFromUrl(row.get('Letter PDF'));
  }
  let file = null;
  try { file = fileId && DriveApp.getFileById(fileId); } catch (err) { file = null; }
  if (!file) return { ok: false, error: 'That file was not found. It may have been moved or deleted in Drive.' };
  if (!isInside(file, rootFolder().getId())) return { ok: false, error: 'That file is not part of Ubay-Ubay submissions.' };
  return {
    ok: true,
    name: file.getName(),
    mimeType: file.getMimeType(),
    data: Utilities.base64Encode(file.getBlob().getBytes()),
  };
}

function sendAcceptEmail(row, code) {
  MailApp.sendEmail({
    to: text(row.get('Email')),
    subject: testTag(row) + 'You\'re in! Welcome to Ubay-Ubay',
    body:
      'Hi ' + text(row.get('Artist name')) + ',\n\n' +
      'Congratulations! We\'re happy to welcome you to the Ubay-Ubay pin bundle program.\n\n' +
      'Here is your private upload link:\n' + uploadLink(code) + '\n\n' +
      'It is made just for you, so please don\'t share it. Use the same link every month.\n\n' +
      'What to upload for each bundle:\n' +
      '- the bundle name\n' +
      '- 4 pin designs, each a PNG file, 1000 x 1000 px\n' +
      '- your bundle name logo, as a PNG file\n' +
      '- optional: solo pins, PNG, 1000 x 1000 px\n\n' +
      'The deadline is the last day of every month. Designs sent this month are printed next month.\n' +
      'The guidelines are here: ' + siteUrl() + '\n\n' +
      'Questions? Just reply to this email.\n\n' +
      'Ubay-Ubay, a Tinkers fundraiser (UP Cebu Fine Arts)',
    name: 'Ubay-Ubay',
    replyTo: orgEmail(),
  });
}

function sendDeclineEmail(row) {
  MailApp.sendEmail({
    to: text(row.get('Email')),
    subject: testTag(row) + 'About your Ubay-Ubay sign-up',
    body:
      'Hi ' + text(row.get('Artist name')) + ',\n\n' +
      'Thank you for signing up for the Ubay-Ubay pin bundle program, and for your interest in working with us. ' +
      'After reviewing the sign-ups, we can\'t take you into the program this time.\n\n' +
      'This is not a judgment of your art. Spots and timing are limited, and you\'re welcome to sign up again in a future month.\n\n' +
      'Questions? Just reply to this email.\n\n' +
      'Ubay-Ubay, a Tinkers fundraiser (UP Cebu Fine Arts)',
    name: 'Ubay-Ubay',
    replyTo: orgEmail(),
  });
}

/** { signupId: [{ month, bundles: [{ name, slots: [...] }], solo: n }] }, newest month first. */
function uploadSummary() {
  const out = {};
  readTable('Uploads').rows.forEach((r) => {
    const id = r.get('Signup ID');
    const month = text(r.get('Month'));
    const months = out[id] = out[id] || [];
    let m = months.find((x) => x.month === month);
    if (!m) months.push(m = { month: month, label: monthLabel(month), bundles: [], solo: 0 });
    if (r.get('Slot') === 'solo') {
      m.solo += 1;
    } else {
      let b = m.bundles.find((x) => x.name === text(r.get('Bundle')));
      if (!b) m.bundles.push(b = { name: text(r.get('Bundle')), slots: [] });
      if (b.slots.indexOf(r.get('Slot')) === -1) b.slots.push(r.get('Slot'));
    }
  });
  Object.keys(out).forEach((id) => out[id].sort((a, b) => (a.month < b.month ? 1 : -1)));
  return out;
}

function log(staff, action, signupId, details) {
  appendRow('Log', { 'Timestamp': new Date(), 'Staff': staff, 'Action': action, 'Signup ID': signupId, 'Details': details });
}


// ---------- 3. Upload page ----------

/** The accepted artist behind an upload code, or null. */
function artistForCode(code) {
  if (typeof code !== 'string' || !/^[0-9a-f]{64}$/.test(code)) return null;
  const row = readTable(SHEET_NAME).find('Upload code', code);
  return row && row.get('Status') === 'Accepted' ? row : null;
}

const BAD_LINK = 'This upload link doesn\'t work. Use the link in your acceptance email, or email ubayubaytinkers@gmail.com.';

function uploadInfo(d) {
  const row = artistForCode(d.code);
  if (!row) return { ok: false, error: BAD_LINK, badLink: true };
  const month = today('yyyy-MM');
  const mine = (uploadSummary()[row.get('ID')] || []).find((m) => m.month === month);
  const soloNames = readTable('Uploads').rows
    .filter((r) => r.get('Signup ID') === row.get('ID') && r.get('Month') === month && r.get('Slot') === 'solo')
    .map((r) => text(r.get('File')));
  return {
    ok: true,
    artistName: text(row.get('Artist name')),
    month: month,
    monthLabel: monthLabel(month),
    bundles: mine ? mine.bundles : [],
    solo: soloNames,
  };
}

function uploadFile(d) {
  const row = artistForCode(d.code);
  if (!row) return { ok: false, error: BAD_LINK, badLink: true };
  if (SLOTS.indexOf(d.slot) === -1) return { ok: false, error: 'Unknown file slot.' };
  const bundle = String(d.bundle || '').trim();
  if (d.slot !== 'solo' && (!bundle || bundle.length > 60)) return { ok: false, error: 'Type a bundle name (up to 60 letters).' };
  if (typeof d.data !== 'string' || !/^[A-Za-z0-9+/=]+$/.test(d.data)) return { ok: false, error: 'The file is missing.' };
  if (tooMany('uploads', MAX_UPLOADS)) return { ok: false, error: 'A lot of files are coming in right now. Please try again in a few minutes.' };

  const bytes = Utilities.base64Decode(d.data);
  if (bytes.length > MAX_UPLOAD_BYTES) return { ok: false, error: 'This file is bigger than 10 MB.' };
  const size = pngSize(bytes);
  if (!size) return { ok: false, error: 'This file is not a PNG. Save it as PNG and try again.' };
  if (d.slot !== 'logo' && (size.width !== PIN_SIZE || size.height !== PIN_SIZE)) {
    return { ok: false, error: 'Pins must be exactly 1000 x 1000 px. This one is ' + size.width + ' x ' + size.height + '.' };
  }

  return withLock(() => {
    const month = today('yyyy-MM');
    const artistFolder = artistFolderFor(row);
    const folderName = d.slot === 'solo' ? month + ' Solo pins' : month + ' Bundle - ' + safeName(bundle);
    const folder = childFolder(artistFolder, folderName);
    const fileName = d.slot === 'solo'
      ? safeName(String(d.fileName || 'solo').replace(/\.png$/i, '')) + '.png'
      : d.slot + '.png';

    // Sending a pin or logo again replaces the old one (the old file goes to Drive's trash).
    const uploads = readTable('Uploads');
    const old = d.slot === 'solo' ? null : uploads.rows.find((r) =>
      r.get('Signup ID') === row.get('ID') && r.get('Month') === month &&
      text(r.get('Bundle')) === bundle && r.get('Slot') === d.slot);
    if (old) {
      try { DriveApp.getFileById(old.get('Drive file ID')).setTrashed(true); } catch (err) { /* already gone */ }
    }

    const file = folder.createFile(Utilities.newBlob(bytes, 'image/png', fileName));
    const values = {
      'Timestamp': new Date(), 'Signup ID': row.get('ID'), 'Artist': text(row.get('Artist name')),
      'Month': month, 'Bundle': d.slot === 'solo' ? '' : bundle, 'Slot': d.slot, 'File': fileName,
      'Drive file ID': file.getId(),
    };
    if (old) Object.keys(values).forEach((h) => uploads.set(old, h, values[h]));
    else appendRow('Uploads', values);
    return { ok: true };
  });
}

/** Width and height from a PNG's header, or null if the bytes are not a PNG. */
function pngSize(bytes) {
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  if (bytes.length < 24 || sig.some((b, i) => (bytes[i] & 0xff) !== b)) return null;
  const int = (at) => (((bytes[at] & 0xff) << 24) | ((bytes[at + 1] & 0xff) << 16) | ((bytes[at + 2] & 0xff) << 8) | (bytes[at + 3] & 0xff)) >>> 0;
  return { width: int(16), height: int(20) };
}

function artistFolderFor(row) {
  const id = fileIdFromUrl(row.get('Artist folder'));
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (err) { /* deleted, make a new one */ }
  }
  const folder = DriveApp.getFolderById(prop('ARTISTS_FOLDER_ID'))
    .createFolder(safeName(text(row.get('Artist name'))) + ' (' + safeName(text(row.get('Full name'))) + ')');
  const table = readTable(SHEET_NAME);
  table.set(table.find('ID', row.get('ID')), 'Artist folder', folder.getUrl());
  return folder;
}

function childFolder(parent, name) {
  const found = parent.getFoldersByName(name);
  return found.hasNext() ? found.next() : parent.createFolder(name);
}


// ---------- Sheet helpers (read and write by column name) ----------

function readTable(name) {
  const tab = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  const values = tab.getDataRange().getValues();
  const headers = values[0] || [];
  const rows = values.slice(1).map((cells, i) => ({
    rowNumber: i + 2,
    get: (h) => { const c = headers.indexOf(h); return c === -1 ? '' : cells[c]; },
    cells: cells,
  }));
  return {
    rows: rows,
    find: (h, value) => (value ? rows.find((r) => r.get(h) === value) : null),
    set: (row, h, value) => {
      const c = headers.indexOf(h);
      if (c === -1 || !row) return;
      const v = typeof value === 'string' ? noFormula(value) : value;
      tab.getRange(row.rowNumber, c + 1).setValue(v);
      row.cells[c] = value;
    },
  };
}

function appendRow(name, values) {
  const tab = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  const headers = tab.getRange(1, 1, 1, tab.getLastColumn()).getValues()[0];
  tab.appendRow(headers.map((h) => {
    const v = values[h] === undefined ? '' : values[h];
    return typeof v === 'string' ? noFormula(v) : v;
  }));
}


// ---------- Small helpers ----------

function prop(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}
function orgEmail() {
  return prop('ORG_EMAIL') || DEFAULT_ORG_EMAIL;
}
function siteUrl() {
  const url = prop('SITE_URL') || DEFAULT_SITE_URL;
  return url.endsWith('/') ? url : url + '/';
}
function uploadLink(code) {
  return siteUrl() + 'upload.html?t=' + code;
}
function rootFolder() {
  return DriveApp.getFolderById(prop('LETTERS_FOLDER_ID')).getParents().next();
}
function testTag(row) {
  return row.get('Test') === 'yes' ? '[TEST] ' : '';
}
function today(pattern) {
  return Utilities.formatDate(new Date(), TIMEZONE, pattern);
}
function monthLabel(month) {
  const parts = String(month).split('-');
  return Utilities.formatDate(new Date(Number(parts[0]), Number(parts[1]) - 1, 15), TIMEZONE, 'MMMM yyyy');
}
function text(v) {
  return v === null || v === undefined ? '' : String(v);
}
function isoDate(v) {
  return v instanceof Date ? v.toISOString() : text(v);
}
/** Sheets turns "2026-10-06" into a date. This turns it back into text. */
function dayText(v) {
  return v instanceof Date ? Utilities.formatDate(v, TIMEZONE, 'yyyy-MM-dd') : text(v);
}
function fileIdFromUrl(url) {
  const m = text(url).match(/[-\w]{25,}/);
  return m ? m[0] : '';
}
/** True if the file sits somewhere inside the given folder. */
function isInside(file, folderId) {
  let parents = file.getParents();
  for (let depth = 0; depth < 6 && parents.hasNext(); depth++) {
    const parent = parents.next();
    if (parent.getId() === folderId) return true;
    parents = parent.getParents();
  }
  return false;
}

/** Keeps letters, numbers, spaces and dashes, so the file name is safe everywhere. */
function safeName(s) {
  return String(s).replace(/[^\p{L}\p{N} \-]/gu, '').trim().replace(/\s+/g, ' ').slice(0, 60) || 'Artist';
}

/** A value starting with = + - @ would run as a formula in the Sheet. A leading ' stops that. */
function noFormula(s) {
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
