/**
 * Ubay-Ubay sign-up backend (Google Apps Script web app).
 *
 * What it does when an artist taps "Sign and send" on sign-up.html:
 *   1. Saves the signed letter PDF in Drive: Ubay-Ubay submissions / Signed letters
 *   2. Adds a row to the "Signups" tab of the Google Sheet this script is attached to
 *   3. Emails the PDF to the artist and to the org
 *
 * Setup is in README.md ("Set up the sign-up form"). In short: paste this file into
 * Extensions > Apps Script of the Sheet, run setup once, then Deploy > New deployment >
 * Web app (Execute as: Me, Who has access: Anyone).
 *
 * EDIT: Settings live in Project Settings > Script Properties (made by setup):
 *   ORG_EMAIL          where the "Signed acceptance" emails go
 *   LETTERS_FOLDER_ID  the Drive folder for signed PDFs (do not change by hand)
 */

const SHEET_NAME = 'Signups';
const HEADERS = ['Timestamp', 'Full name', 'Artist name', 'Email', 'Social', 'Date signed', 'Letter PDF', 'Test'];
const DEFAULT_ORG_EMAIL = 'ubayubaytinkers@gmail.com';
const MAX_PDF_BYTES = 3 * 1024 * 1024;   // a signed letter is about 100 to 300 KB
const MAX_POSTS = 20;                    // flood guard: at most this many sign-ups...
const WINDOW_SECONDS = 600;              // ...every 10 minutes

/** Run this once by hand (select "setup" at the top, then click Run). */
function setup() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  let tab = sheet.getSheetByName(SHEET_NAME);
  if (!tab) tab = sheet.insertSheet(SHEET_NAME, 0);
  if (tab.getLastRow() === 0) {
    tab.appendRow(HEADERS);
    tab.setFrozenRows(1);
    tab.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }

  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('LETTERS_FOLDER_ID')) {
    const root = DriveApp.createFolder('Ubay-Ubay submissions');
    const letters = root.createFolder('Signed letters');
    props.setProperty('LETTERS_FOLDER_ID', letters.getId());
  }
  if (!props.getProperty('ORG_EMAIL')) props.setProperty('ORG_EMAIL', DEFAULT_ORG_EMAIL);

  // Sending one email to yourself makes Google ask for the email permission now,
  // instead of the first artist's sign-up failing.
  MailApp.sendEmail(Session.getEffectiveUser().getEmail(), 'Ubay-Ubay sign-up form is set up',
    'The sign-up backend is ready. Next: Deploy > New deployment > Web app.');
  Logger.log('Done. Letters folder: ' + DriveApp.getFolderById(props.getProperty('LETTERS_FOLDER_ID')).getUrl());
}

/** Opening the web app URL in a browser shows {"ok":true}, so you can check it is live. */
function doGet() {
  return reply({ ok: true });
}

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Spam bots fill every field, people never see this one. Pretend it worked.
    if (data.website) return reply({ ok: true });

    if (data.action !== 'signup') return reply({ ok: false, error: 'Unknown request.' });

    const problem = checkSignup(data);
    if (problem) return reply({ ok: false, error: problem });

    if (tooManyPosts()) {
      return reply({ ok: false, error: 'A lot of people are signing right now. Please try again in a few minutes.' });
    }

    const pdfBytes = Utilities.base64Decode(data.pdf);
    if (pdfBytes.length > MAX_PDF_BYTES) return reply({ ok: false, error: 'The signed letter is too large to send.' });

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      saveSignup(data, pdfBytes);
    } finally {
      lock.releaseLock();
    }
    return reply({ ok: true });
  } catch (err) {
    console.error(err);
    return reply({ ok: false, error: 'Something went wrong on our side. Please try again.' });
  }
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

function tooManyPosts() {
  const cache = CacheService.getScriptCache();
  const count = Number(cache.get('posts') || 0) + 1;
  cache.put('posts', String(count), WINDOW_SECONDS);
  return count > MAX_POSTS;
}

function saveSignup(d, pdfBytes) {
  const props = PropertiesService.getScriptProperties();
  const isTest = d.test === true;
  const fullName = d.fullName.trim();
  const artistName = d.artistName.trim();
  const email = d.email.trim();
  const social = d.social.trim();
  const dateSigned = String(d.dateSigned || '').slice(0, 10) ||
    Utilities.formatDate(new Date(), 'Asia/Manila', 'yyyy-MM-dd');

  // 1. The PDF, named ArtistName_FullName_2026-10-06.pdf
  const fileName = [artistName, fullName].map(safeName).join('_') + '_' + dateSigned + (isTest ? '_TEST' : '') + '.pdf';
  const blob = Utilities.newBlob(pdfBytes, 'application/pdf', fileName);
  const file = DriveApp.getFolderById(props.getProperty('LETTERS_FOLDER_ID')).createFile(blob);

  // 2. The Sheet row
  const tab = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  tab.appendRow([new Date(), fullName, artistName, email, social, dateSigned, file.getUrl(), isTest ? 'yes' : '']
    .map(cell => typeof cell === 'string' ? noFormula(cell) : cell));

  // 3. The emails
  const tag = isTest ? '[TEST] ' : '';
  MailApp.sendEmail({
    to: email,
    subject: tag + 'Your signed Ubay-Ubay acceptance letter',
    body:
      'Hi ' + artistName + ',\n\n' +
      'Thank you for joining the Ubay-Ubay pin bundle program! Your signed acceptance letter is attached. Keep it for your records.\n\n' +
      'Next step: we will email you your private upload link, where you send your 4 pin designs. ' +
      'Designs are due on the last day of each month.\n\n' +
      'Questions? Reply to this email.\n\n' +
      'Ubay-Ubay, a Tinkers fundraiser (UP Cebu Fine Arts)',
    attachments: [blob],
    name: 'Ubay-Ubay',
    replyTo: props.getProperty('ORG_EMAIL') || DEFAULT_ORG_EMAIL,
  });
  MailApp.sendEmail({
    to: props.getProperty('ORG_EMAIL') || DEFAULT_ORG_EMAIL,
    subject: tag + 'Signed acceptance: ' + artistName,
    body:
      'A new artist signed the acceptance letter.\n\n' +
      'Full name: ' + fullName + '\n' +
      'Artist name: ' + artistName + '\n' +
      'Email: ' + email + '\n' +
      'Social: ' + social + '\n' +
      'Date signed: ' + dateSigned + '\n\n' +
      'Signed letter in Drive: ' + file.getUrl(),
    attachments: [blob],
    name: 'Ubay-Ubay sign-up form',
    replyTo: email,
  });
}

/** Keeps letters, numbers, spaces and dashes, so the file name is safe everywhere. */
function safeName(s) {
  return s.replace(/[^\p{L}\p{N} \-]/gu, '').trim().replace(/\s+/g, ' ').slice(0, 60) || 'Artist';
}

/** A value starting with = + - @ would run as a formula in the Sheet. A leading ' stops that. */
function noFormula(s) {
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
