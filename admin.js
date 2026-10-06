// Staff page (admin.html). A dashboard of sign-ups from the Sheet. Accept sends the
// welcome email with the artist's private upload link, Decline sends a kind
// "not this time" email. callScript() and plainError() come from script.js.

(() => {
  const app = document.getElementById('admin-app');
  if (!app) return;

  const SESSION_KEY = 'ubay-staff';
  const loginBox = document.getElementById('login-box');
  const loginForm = document.getElementById('login-form');
  const loginStatus = document.getElementById('login-status');
  const topUser = document.getElementById('staff-top-user');
  const listBox = document.getElementById('staff-list');
  const status = document.getElementById('admin-status');
  const thisMonth = (() => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit' })
      .formatToParts(new Date()).map((x) => [x.type, x.value]));
    return p.year + '-' + p.month;
  })();

  let creds = null;
  let signups = [];
  const open = new Set();       // the rows whose details are showing
  const thumbCache = new Map(); // "signupId|month" -> thumbnails

  try { creds = JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch (error) { creds = null; }

  const setStatus = (el, message, isError) => {
    el.textContent = message;
    el.classList.toggle('is-error', Boolean(isError));
  };

  /** A staff request. A wrong or changed password sends you back to the login box. */
  async function staffCall(action, extra) {
    try {
      return await callScript({ action, staff: creds.staff, password: creds.password, ...extra });
    } catch (error) {
      if (error.result && error.result.auth) showLogin(error.message);
      throw error;
    }
  }

  // ---------- Log in and out ----------

  function showLogin(message) {
    creds = null;
    try { sessionStorage.removeItem(SESSION_KEY); } catch (error) { /* private mode */ }
    app.hidden = true;
    topUser.hidden = true;
    loginBox.hidden = false;
    setStatus(loginStatus, message || '', Boolean(message));
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const staff = document.getElementById('staff-name').value.trim();
    const password = document.getElementById('staff-password').value;
    if (!staff || !password) {
      setStatus(loginStatus, 'Type your name and the staff password.', true);
      return;
    }
    const button = document.getElementById('login-button');
    button.disabled = true;
    setStatus(loginStatus, 'Checking…');
    creds = { staff, password };
    try {
      await load();
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(creds)); } catch (error) { /* private mode */ }
      document.getElementById('staff-password').value = '';
      setStatus(loginStatus, '');
    } catch (error) {
      if (!loginBox.hidden) setStatus(loginStatus, plainError(error), true);
    } finally {
      button.disabled = false;
    }
  });

  document.getElementById('logout-button').addEventListener('click', () => showLogin(''));
  document.getElementById('refresh-button').addEventListener('click', () => {
    thumbCache.clear();
    load().catch((error) => setStatus(status, plainError(error), true));
  });

  // ---------- Loading and filtering ----------

  async function load() {
    if (!signups.length) showSkeleton();
    setStatus(status, '');
    const result = await staffCall('staffList');
    signups = result.signups;
    loginBox.hidden = true;
    app.hidden = false;
    topUser.hidden = false;
    document.getElementById('staff-shown').textContent = creds.staff;
    render();
  }

  function showSkeleton() {
    listBox.replaceChildren(...[1, 2, 3].map(() => el('div', 'srow srow-skeleton')));
  }

  // ---------- Filters ----------
  // The filter values live in the form below the tiles AND in the page address
  // (?status=Accepted&replied=no...), so Refresh keeps them and a link can be shared.

  const filterForm = document.getElementById('staff-filters');
  const field = {
    q: document.getElementById('f-q'),
    status: document.getElementById('f-status'),
    replied: document.getElementById('f-replied'),
    uploads: document.getElementById('f-uploads'),
    signed: document.getElementById('f-signed'),
    sort: document.getElementById('f-sort'),
    hideTest: document.getElementById('f-hide-test'),
  };
  const CLEAR = { q: '', status: 'all', replied: 'all', uploads: 'all', signed: 'any', sort: 'oldest', hideTest: false };
  // What each tile sets. A tile looks "on" when the filters match it exactly.
  const TILES = {
    needs: { replied: 'no' },
    Accepted: { status: 'Accepted', sort: 'newest' },
    Declined: { status: 'Declined', sort: 'newest' },
    uploads: { uploads: 'month', sort: 'newest' },
  };

  const readFilters = () => ({
    q: field.q.value.trim(),
    status: field.status.value,
    replied: field.replied.value,
    uploads: field.uploads.value,
    signed: field.signed.value,
    sort: field.sort.value,
    hideTest: field.hideTest.checked,
  });

  function writeFilters(f) {
    Object.keys(CLEAR).forEach((k) => {
      const v = f[k] === undefined ? CLEAR[k] : f[k];
      if (k === 'hideTest') field.hideTest.checked = Boolean(v);
      else field[k].value = v;
    });
  }

  function saveFiltersToAddress(f) {
    const params = new URLSearchParams();
    Object.keys(CLEAR).forEach((k) => {
      if (String(f[k]) !== String(CLEAR[k])) params.set(k, k === 'hideTest' ? '1' : f[k]);
    });
    const query = params.toString();
    history.replaceState(null, '', location.pathname + (query ? '?' + query : '') + location.hash);
  }

  function filtersFromAddress() {
    const params = new URLSearchParams(location.search);
    if (![...params.keys()].length) return { ...CLEAR, ...TILES.needs }; // first visit: who needs a reply
    const f = { ...CLEAR };
    Object.keys(CLEAR).forEach((k) => {
      if (params.has(k)) f[k] = k === 'hideTest' ? params.get(k) === '1' : params.get(k);
    });
    return f;
  }

  function applyFilters(f) {
    writeFilters(f);
    render();
  }

  writeFilters(filtersFromAddress());
  filterForm.addEventListener('input', () => render());
  filterForm.addEventListener('change', () => render());
  filterForm.addEventListener('submit', (event) => event.preventDefault());
  field.hideTest.addEventListener('change', () => render());

  document.querySelectorAll('.stat-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      const preset = TILES[tile.dataset.filter];
      const on = tile.getAttribute('aria-pressed') === 'true';
      applyFilters(on ? CLEAR : { ...CLEAR, hideTest: field.hideTest.checked, ...preset });
    });
  });
  document.getElementById('clear-filters').addEventListener('click', () => applyFilters(CLEAR));

  const copyEmailsButton = document.getElementById('copy-emails');
  copyEmailsButton.addEventListener('click', () => {
    const emails = [...new Set(lastShown.map((s) => s.email))];
    copy(emails.join(', '), copyEmailsButton, 'Copied ' + emails.length + ' email' + (emails.length === 1 ? '' : 's'));
  });

  /** Weekdays between the sign-up and now, so "1 to 3 business days" can be checked. */
  function businessDaysSince(iso) {
    const start = new Date(iso);
    if (isNaN(start)) return 0;
    let days = 0;
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
    const today = new Date();
    while (day <= today) {
      if (day.getDay() !== 0 && day.getDay() !== 6) days += 1;
      day.setDate(day.getDate() + 1);
    }
    return days;
  }

  const uploadedThisMonth = (s) => s.uploads.some((m) => m.month === thisMonth);

  /** True when the sign-up date falls in the chosen "Signed" range. */
  function signedIn(range, iso) {
    if (range === 'any') return true;
    const d = new Date(iso);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    if (range === 'week') return now - d <= 7 * 24 * 3600 * 1000;
    if (range === 'month') return d >= monthStart;
    if (range === 'last-month') return d >= lastMonthStart && d < monthStart;
    return d < lastMonthStart; // older
  }

  /** "Status: New · Not replied yet" for the line above the list. */
  function describe(f) {
    const parts = [];
    const label = (sel) => sel.options[sel.selectedIndex].text;
    if (f.status !== 'all') parts.push('Status: ' + label(field.status));
    if (f.replied !== 'all') parts.push(label(field.replied));
    if (f.uploads !== 'all') parts.push(label(field.uploads));
    if (f.signed !== 'any') parts.push('Signed: ' + label(field.signed).toLowerCase());
    if (f.hideTest) parts.push('No test sign-ups');
    if (f.q) parts.push('Matching "' + f.q + '"');
    return parts;
  }

  let lastShown = [];

  function render() {
    const f = readFilters();
    saveFiltersToAddress(f);

    // The tiles count everyone, whatever the filters are.
    const needs = signups.filter((s) => !s.replied);
    const oldest = needs.reduce((max, s) => Math.max(max, businessDaysSince(s.timestamp)), 0);
    document.getElementById('count-needs').textContent = needs.length;
    document.getElementById('note-needs').textContent = needs.length ? 'Oldest waiting ' + oldest + ' business day' + (oldest === 1 ? '' : 's') : 'All caught up';
    document.querySelector('.stat-tile[data-filter="needs"]').classList.toggle('is-late', oldest > 3);
    document.getElementById('count-accepted').textContent = signups.filter((s) => s.status === 'Accepted').length;
    document.getElementById('count-declined').textContent = signups.filter((s) => s.status === 'Declined').length;
    document.getElementById('count-uploads').textContent = signups.filter(uploadedThisMonth).length;
    document.querySelectorAll('.stat-tile').forEach((tile) => {
      const preset = { ...CLEAR, hideTest: f.hideTest, ...TILES[tile.dataset.filter] };
      const matches = ['status', 'replied', 'uploads', 'signed', 'q'].every((k) => String(preset[k]) === String(f[k]));
      tile.setAttribute('aria-pressed', String(matches));
    });

    const q = f.q.toLowerCase();
    let shown = signups.filter((s) =>
      (f.status === 'all' || s.status === f.status) &&
      (f.replied === 'all' || (f.replied === 'yes') === s.replied) &&
      (f.uploads === 'all' ||
        (f.uploads === 'month' && uploadedThisMonth(s)) ||
        (f.uploads === 'any' && s.uploads.length > 0) ||
        (f.uploads === 'none' && s.uploads.length === 0)) &&
      signedIn(f.signed, s.timestamp) &&
      !(f.hideTest && s.test) &&
      (!q || [s.artistName, s.fullName, s.email, s.social].some((v) => v.toLowerCase().includes(q))));

    shown = [...shown].sort((a, b) => {
      if (f.sort === 'name') return a.artistName.localeCompare(b.artistName, 'en', { sensitivity: 'base' });
      const older = a.timestamp < b.timestamp ? -1 : 1;
      return f.sort === 'newest' ? -older : older;
    });
    lastShown = shown;

    const parts = describe(f);
    document.getElementById('staff-showing').textContent =
      'Showing ' + shown.length + ' of ' + signups.length + (parts.length ? ' · ' + parts.join(' · ') : '');
    document.getElementById('clear-filters').hidden = !parts.length;
    copyEmailsButton.textContent = 'Copy ' + shown.length + ' email' + (shown.length === 1 ? '' : 's');
    copyEmailsButton.disabled = !shown.length;

    listBox.replaceChildren();
    if (!shown.length) {
      const empty = el('div', 'staff-empty');
      const onlyNeeds = parts.length === 1 && f.replied === 'no';
      empty.append(el('p', 'staff-empty-title',
        !signups.length ? 'No sign-ups yet.'
          : onlyNeeds ? 'Everyone has a reply. Nice work.'
            : 'No one matches these filters.'));
      if (parts.length) {
        const all = el('button', 'button button-ghost', 'Clear filters');
        all.type = 'button';
        all.addEventListener('click', () => applyFilters(CLEAR));
        empty.append(all);
      }
      listBox.append(empty);
      return;
    }

    const head = el('div', 'srow-titles');
    head.setAttribute('aria-hidden', 'true');
    ['Artist', 'Full name', 'Email', 'Signed', 'Status', 'Waiting', ''].forEach((t) => head.append(el('span', '', t)));
    listBox.append(head);
    shown.forEach((s) => listBox.append(row(s)));
  }

  // ---------- One row ----------

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function button(label, kind, onClick) {
    const b = el('button', 'button button-' + kind, label);
    b.type = 'button';
    b.addEventListener('click', () => onClick(b));
    return b;
  }

  function socialLink(handle) {
    const h = handle.trim();
    if (/^https?:\/\//i.test(h)) return h;
    const name = h.replace(/^@/, '').replace(/[^\w.]/g, '');
    return name ? 'https://www.instagram.com/' + name + '/' : '';
  }

  const shortDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }) : '');
  const longDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '');

  function row(s) {
    const box = el('article', 'srow');
    const isOpen = open.has(s.id);
    box.classList.toggle('is-open', isOpen);

    // The summary line is one button that opens and closes the details.
    const head = el('button', 'srow-head');
    head.type = 'button';
    head.setAttribute('aria-expanded', String(isOpen));
    head.setAttribute('aria-controls', 'srow-' + s.id);

    const name = el('span', 'srow-artist');
    name.append(el('strong', '', s.artistName));
    if (s.test) name.append(el('span', 'tag tag-test', 'Test'));
    const days = businessDaysSince(s.timestamp);
    const waiting = el('span', 'srow-wait' + (!s.replied && days > 3 ? ' is-late' : ''),
      s.replied ? '' : days + (days === 1 ? ' day' : ' days'));
    const chevron = el('span', 'srow-chevron');
    chevron.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

    head.append(
      name,
      el('span', 'srow-full', s.fullName),
      el('span', 'srow-email', s.email),
      el('span', 'srow-date', s.dateSigned ? shortDate(s.dateSigned + 'T12:00:00') : shortDate(s.timestamp)),
      el('span', 'srow-status'),
      waiting,
      chevron,
    );
    head.querySelector('.srow-status').append(el('span', 'tag tag-' + s.status.toLowerCase(), s.status));
    head.addEventListener('click', () => {
      if (open.has(s.id)) open.delete(s.id); else open.add(s.id);
      const nowOpen = open.has(s.id);
      box.classList.toggle('is-open', nowOpen);
      head.setAttribute('aria-expanded', String(nowOpen));
      body.hidden = !nowOpen;
      if (nowOpen) loadAllThumbs(s, body);
    });
    box.append(head);

    const body = details(s);
    body.id = 'srow-' + s.id;
    body.hidden = !isOpen;
    box.append(body);
    if (isOpen) loadAllThumbs(s, body);
    return box;
  }

  function details(s) {
    const body = el('div', 'srow-body');

    // Contact
    const contact = el('dl', 'staff-details');
    const emailRow = el('div');
    const emailValue = el('dd');
    const mail = el('a', '', s.email);
    mail.href = 'mailto:' + s.email;
    emailValue.append(mail, ' ', button('Copy', 'ghost button-small', (b) => copy(s.email, b)));
    emailRow.append(el('dt', '', 'Email'), emailValue);
    const socialRow = el('div');
    const socialValue = el('dd');
    const url = socialLink(s.social);
    if (url) {
      const a = el('a', '', s.social);
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      socialValue.append(a);
    } else {
      socialValue.textContent = s.social;
    }
    socialRow.append(el('dt', '', 'Social'), socialValue);
    const signedRow = el('div');
    signedRow.append(el('dt', '', 'Signed'), el('dd', '', longDate(s.timestamp) + (s.replied ? '' : ', waiting ' + businessDaysSince(s.timestamp) + ' business days')));
    contact.append(emailRow, socialRow, signedRow);
    body.append(contact);

    // Decision and other actions
    const actions = el('div', 'staff-actions');
    if (s.status === 'New') {
      actions.append(
        button('Accept', 'primary', () => decide(s, 'accept')),
        button('Decline', 'secondary', () => decide(s, 'decline')),
      );
    } else {
      actions.append(el('p', 'small staff-decided', s.status + ' by ' + (s.decidedBy || 'staff') + ' on ' + longDate(s.decidedAt) + '.'));
      if (s.uploadLink) {
        actions.append(
          button('Resend upload link', 'secondary', (b) => resend(s, b)),
          button('Copy upload link', 'ghost', (b) => copy(s.uploadLink, b)),
        );
      }
    }
    if (s.hasLetter) actions.append(button('View letter', 'ghost', (b) => viewLetter(s, b)));

    const replied = el('label', 'staff-replied');
    const tick = el('input');
    tick.type = 'checkbox';
    tick.checked = s.replied;
    tick.addEventListener('change', () => setReplied(s, tick));
    replied.append(tick, ' Replied');
    actions.append(replied);
    body.append(actions);

    // Designs
    const designs = el('div', 'staff-uploads');
    if (s.uploads.length) {
      s.uploads.forEach((m) => {
        const parts = m.bundles.map((b) => {
          const pins = b.slots.filter((x) => x.startsWith('pin-')).length;
          return 'Bundle "' + b.name + '": ' + pins + ' of 4 pins' + (b.slots.includes('logo') ? ', logo' : ', no logo yet');
        });
        if (m.solo) parts.push(m.solo + ' solo pin' + (m.solo === 1 ? '' : 's'));
        const line = el('p', 'staff-upload-line');
        line.append(el('strong', '', m.label + ': '), parts.join(' · '));
        const grid = el('div', 'thumbs');
        grid.dataset.month = m.month;
        designs.append(line, grid);
      });
    } else {
      designs.append(el('p', 'small staff-upload-line',
        s.status === 'Accepted' ? 'No designs uploaded yet.' : 'Designs show here once the artist is accepted and uploads.'));
    }
    body.append(designs);
    return body;
  }

  // ---------- Designs (thumbnails) ----------

  const SLOT_NAMES = { 'pin-1': 'Pin 1', 'pin-2': 'Pin 2', 'pin-3': 'Pin 3', 'pin-4': 'Pin 4', logo: 'Logo', solo: 'Solo pin' };

  function loadAllThumbs(s, body) {
    body.querySelectorAll('.thumbs[data-month]').forEach((grid) => {
      if (!grid.childElementCount) showThumbs(s, grid.dataset.month, grid);
    });
  }

  async function showThumbs(s, month, grid) {
    const key = s.id + '|' + month;
    grid.replaceChildren(...[1, 2, 3, 4, 5].map(() => el('span', 'thumb thumb-skeleton')));
    try {
      if (!thumbCache.has(key)) thumbCache.set(key, (await staffCall('staffThumbs', { signupId: s.id, month })).thumbs);
      grid.replaceChildren();
      thumbCache.get(key).forEach((t) => {
        const caption = (t.bundle ? t.bundle + ', ' : '') + (t.slot === 'solo' ? t.name : SLOT_NAMES[t.slot]);
        const tile = el('button', 'thumb');
        tile.type = 'button';
        tile.setAttribute('aria-label', 'Open ' + caption + ' full size');
        if (t.src) {
          const img = el('img');
          img.src = t.src;
          img.alt = '';
          tile.append(img);
        }
        tile.append(el('span', 'thumb-caption', caption));
        tile.addEventListener('click', () => openImage(t.fileId, s.artistName + ': ' + caption));
        grid.append(tile);
      });
    } catch (error) {
      grid.replaceChildren(el('p', 'small is-error', 'The designs could not load. ' + plainError(error)));
    }
  }

  // ---------- Actions ----------

  const confirmDialog = document.getElementById('confirm-dialog');
  function ask(title, message, yesLabel) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-text').textContent = message;
    document.getElementById('confirm-yes').textContent = yesLabel;
    return new Promise((resolve) => {
      const done = (answer) => {
        confirmDialog.removeEventListener('close', onClose);
        confirmDialog.querySelectorAll('[data-answer]').forEach((b) => { b.onclick = null; });
        if (confirmDialog.open) confirmDialog.close();
        resolve(answer);
      };
      const onClose = () => done(false);
      confirmDialog.addEventListener('close', onClose);
      confirmDialog.querySelectorAll('[data-answer]').forEach((b) => {
        b.onclick = () => done(b.dataset.answer === 'yes');
      });
      confirmDialog.showModal();
    });
  }

  async function decide(s, decision) {
    const accept = decision === 'accept';
    const ok = await ask(
      accept ? 'Accept ' + s.artistName + '?' : 'Decline ' + s.artistName + '?',
      accept
        ? 'This emails ' + s.email + ' a welcome message with their private upload link.'
        : 'This emails ' + s.email + ' a kind "not this time" message. It can\'t be undone from this page.',
      accept ? 'Accept and send email' : 'Decline and send email',
    );
    if (!ok) return;
    setStatus(status, accept ? 'Sending the welcome email to ' + s.artistName + '…' : 'Sending the email to ' + s.artistName + '…');
    try {
      await staffCall('staffDecide', { signupId: s.id, decision });
      await load();
      setStatus(status, (accept ? 'Accepted ' : 'Declined ') + s.artistName + '. The email is sent.');
    } catch (error) {
      setStatus(status, plainError(error), true);
    }
  }

  async function resend(s, b) {
    const ok = await ask('Resend the upload link?', 'This emails the welcome message with the upload link to ' + s.email + ' again.', 'Resend email');
    if (!ok) return;
    b.disabled = true;
    try {
      await staffCall('staffResendLink', { signupId: s.id });
      setStatus(status, 'Upload link sent again to ' + s.email + '.');
    } catch (error) {
      setStatus(status, plainError(error), true);
    } finally {
      b.disabled = false;
    }
  }

  async function setReplied(s, tick) {
    tick.disabled = true;
    try {
      await staffCall('staffSetReplied', { signupId: s.id, replied: tick.checked });
      s.replied = tick.checked;
      setStatus(status, s.artistName + (tick.checked ? ' marked as replied.' : ' marked as waiting for a reply.'));
      render();
    } catch (error) {
      tick.checked = !tick.checked;
      setStatus(status, plainError(error), true);
    } finally {
      tick.disabled = false;
    }
  }

  async function copy(textToCopy, b, doneLabel) {
    const label = b.textContent;
    try {
      await navigator.clipboard.writeText(textToCopy);
      b.textContent = doneLabel || 'Copied';
    } catch (error) {
      b.textContent = 'Copy failed';
    }
    setTimeout(() => { if (b.textContent !== label) b.textContent = label; }, 1800);
  }

  function base64ToUrl(data, mimeType) {
    const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
    return URL.createObjectURL(new Blob([bytes], { type: mimeType }));
  }

  // ---------- The signed letter, in a popup ----------
  // PDF.js (from cdnjs, pinned) draws each PDF page as a picture, so the letter shows
  // on phones too. It only loads the first time someone opens a letter.
  // Pinned to 4.10.38 on purpose: version 6 needs JavaScript features most browsers
  // don't have yet, and fails to draw.
  const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/';
  let pdfjs = null;
  function loadPdfJs() {
    if (!pdfjs) {
      pdfjs = import(PDFJS + 'pdf.min.mjs').then((lib) => {
        lib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.mjs';
        return lib;
      });
      pdfjs.catch(() => { pdfjs = null; }); // let the next try load it again
    }
    return pdfjs;
  }

  const letterDialog = document.getElementById('letter-dialog');
  const letterPages = document.getElementById('letter-pages');
  const letterOpen = document.getElementById('letter-open');
  const letterDownload = document.getElementById('letter-download');
  let letterFile = null; // { url, name } of the letter showing now
  letterDialog.addEventListener('click', (event) => { if (event.target === letterDialog) letterDialog.close(); });
  letterOpen.addEventListener('click', () => { if (letterFile) window.open(letterFile.url, '_blank', 'noopener'); });
  letterDownload.addEventListener('click', () => {
    if (!letterFile) return;
    const a = el('a');
    a.href = letterFile.url;
    a.download = letterFile.name;
    a.click();
  });

  async function viewLetter(s, b) {
    document.getElementById('letter-title').textContent = s.artistName + ': signed letter';
    letterFile = null;
    letterOpen.disabled = true;
    letterDownload.disabled = true;
    letterPages.replaceChildren(el('p', 'small', 'Loading the signed letter…'));
    letterDialog.showModal();
    b.disabled = true;
    let file = null;
    let lib = null;
    try {
      [file, lib] = await Promise.all([staffCall('staffFile', { letterFor: s.id }), loadPdfJs().catch(() => null)]);
    } catch (error) {
      letterPages.replaceChildren(el('p', 'small is-error', plainError(error)));
      b.disabled = false;
      return;
    }
    letterFile = { url: base64ToUrl(file.data, file.mimeType), name: file.name };
    letterOpen.disabled = false;
    letterDownload.disabled = false;
    const cantShow = () => letterPages.replaceChildren(el('p', 'small', 'The letter can’t be shown here. Use Open in new tab or Download.'));
    if (!lib) {
      cantShow();
      b.disabled = false;
      return;
    }
    try {
      const bytes = Uint8Array.from(atob(file.data), (c) => c.charCodeAt(0));
      const pdf = await lib.getDocument({ data: bytes }).promise;
      letterPages.replaceChildren();
      const width = letterPages.clientWidth || 600;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      for (let n = 1; n <= pdf.numPages; n++) {
        const page = await pdf.getPage(n);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: (width / base.width) * ratio });
        const canvas = el('canvas', 'letter-page');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', 'Page ' + n + ' of ' + pdf.numPages);
        letterPages.append(canvas);
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      }
    } catch (error) {
      cantShow();
    } finally {
      b.disabled = false;
    }
  }

  const imageDialog = document.getElementById('image-dialog');
  imageDialog.addEventListener('click', (event) => { if (event.target === imageDialog) imageDialog.close(); });

  async function openImage(fileId, caption) {
    const box = document.getElementById('image-full');
    document.getElementById('image-title').textContent = caption;
    box.replaceChildren(el('p', 'small', 'Loading the full picture…'));
    imageDialog.showModal();
    try {
      const file = await staffCall('staffFile', { fileId });
      const img = el('img');
      img.src = base64ToUrl(file.data, file.mimeType);
      img.alt = caption;
      box.replaceChildren(img);
    } catch (error) {
      box.replaceChildren(el('p', 'small is-error', plainError(error)));
    }
  }

  // ---------- Start ----------

  if (creds && creds.staff && creds.password) {
    load().catch((error) => { if (loginBox.hidden) showLogin(plainError(error)); });
  } else {
    showLogin('');
  }
})();
