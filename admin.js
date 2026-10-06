// Staff page (admin.html). Lists sign-ups from the Sheet. Accept sends the welcome
// email with the artist's private upload link, Decline sends a kind "not this time" email.
// callScript() and plainError() come from script.js, which loads first.

(() => {
  const app = document.getElementById('admin-app');
  if (!app) return;

  const SESSION_KEY = 'ubay-staff';
  const loginForm = document.getElementById('login-form');
  const loginStatus = document.getElementById('login-status');
  const listBox = document.getElementById('staff-list');
  const status = document.getElementById('admin-status');
  let creds = null;
  let signups = [];
  let filter = 'needs';

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
    loginForm.hidden = false;
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
      if (!loginForm.hidden) setStatus(loginStatus, plainError(error), true);
    } finally {
      button.disabled = false;
    }
  });

  document.getElementById('logout-button').addEventListener('click', () => showLogin(''));
  document.getElementById('refresh-button').addEventListener('click', () => load().catch(() => {}));

  // ---------- The list ----------

  async function load() {
    setStatus(status, 'Loading sign-ups…');
    const result = await staffCall('staffList');
    signups = result.signups;
    loginForm.hidden = true;
    app.hidden = false;
    document.getElementById('staff-shown').textContent = creds.staff;
    setStatus(status, '');
    render();
  }

  document.querySelectorAll('.chip[data-filter]').forEach((chip) => {
    chip.addEventListener('click', () => {
      filter = chip.dataset.filter;
      document.querySelectorAll('.chip[data-filter]').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      render();
    });
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

  function render() {
    const needs = signups.filter((s) => !s.replied);
    document.getElementById('count-needs').textContent = needs.length;
    document.getElementById('count-all').textContent = signups.length;
    document.getElementById('count-accepted').textContent = signups.filter((s) => s.status === 'Accepted').length;
    document.getElementById('count-declined').textContent = signups.filter((s) => s.status === 'Declined').length;

    let shown = filter === 'needs' ? needs
      : filter === 'all' ? signups
        : signups.filter((s) => s.status === filter);
    // Waiting artists oldest first, everything else newest first.
    shown = [...shown].sort((a, b) => (filter === 'needs' ? 1 : -1) * (a.timestamp < b.timestamp ? -1 : 1));

    listBox.replaceChildren();
    if (!shown.length) {
      const empty = el('div', 'staff-empty');
      empty.append(el('p', 'staff-empty-title', filter === 'needs' ? 'Everyone has a reply.' : 'Nothing here yet.'));
      if (filter !== 'all') {
        const all = el('button', 'button button-ghost', 'Show all sign-ups');
        all.type = 'button';
        all.addEventListener('click', () => document.querySelector('.chip[data-filter="all"]').click());
        empty.append(all);
      }
      listBox.append(empty);
      return;
    }
    shown.forEach((s) => listBox.append(card(s)));
  }

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

  const shortDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '');

  function card(s) {
    const box = el('article', 'staff-card');

    const head = el('div', 'staff-card-head');
    head.append(el('h2', 'staff-name', s.artistName));
    head.append(el('span', 'tag tag-' + s.status.toLowerCase(), s.status));
    if (s.test) head.append(el('span', 'tag tag-test', 'Test'));
    box.append(head);

    const meta = el('p', 'small staff-meta', s.fullName + ' · Signed ' + (s.dateSigned || shortDate(s.timestamp)));
    if (!s.replied) {
      const days = businessDaysSince(s.timestamp);
      const wait = el('span', days > 3 ? 'staff-late' : '', ' · Waiting ' + days + ' business day' + (days === 1 ? '' : 's'));
      meta.append(wait);
    }
    box.append(meta);

    // Contact
    const details = el('dl', 'staff-details');
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
    details.append(emailRow, socialRow);
    box.append(details);

    // Decision
    const actions = el('div', 'staff-actions');
    if (s.status === 'New') {
      actions.append(
        button('Accept', 'primary', () => decide(s, 'accept')),
        button('Decline', 'secondary', () => decide(s, 'decline')),
      );
    } else {
      actions.append(el('p', 'small staff-decided', s.status + ' by ' + (s.decidedBy || 'staff') + ', ' + shortDate(s.decidedAt)));
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
    box.append(actions);

    // Uploads
    if (s.uploads.length) {
      const up = el('div', 'staff-uploads');
      s.uploads.forEach((m) => {
        const parts = m.bundles.map((b) => {
          const pins = b.slots.filter((x) => x.startsWith('pin-')).length;
          return 'Bundle "' + b.name + '": ' + pins + ' of 4 pins' + (b.slots.includes('logo') ? ', logo' : ', no logo yet');
        });
        if (m.solo) parts.push(m.solo + ' solo pin' + (m.solo === 1 ? '' : 's'));
        const line = el('p', 'staff-upload-line');
        line.append(el('strong', '', m.label + ': '), parts.join(' · '));
        const grid = el('div', 'thumbs');
        const show = button('Show designs', 'ghost button-small', (b) => showThumbs(s, m, grid, b));
        line.append(' ', show);
        up.append(line, grid);
      });
      box.append(up);
    } else if (s.status === 'Accepted') {
      box.append(el('p', 'small staff-upload-line', 'No designs uploaded yet.'));
    }
    return box;
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

  async function copy(textToCopy, b) {
    const label = b.textContent;
    try {
      await navigator.clipboard.writeText(textToCopy);
      b.textContent = 'Copied';
    } catch (error) {
      b.textContent = 'Copy failed';
    }
    setTimeout(() => { b.textContent = label; }, 1500);
  }

  function base64ToUrl(data, mimeType) {
    const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
    return URL.createObjectURL(new Blob([bytes], { type: mimeType }));
  }

  async function viewLetter(s, b) {
    // Open the tab right away (browsers block tabs opened after waiting), then fill it.
    const tab = window.open('', '_blank');
    if (tab) tab.document.write('<p style="font-family:sans-serif">Loading the signed letter…</p>');
    b.disabled = true;
    try {
      const file = await staffCall('staffFile', { letterFor: s.id });
      const url = base64ToUrl(file.data, file.mimeType);
      if (tab) {
        tab.location.href = url;
      } else {
        const a = el('a');
        a.href = url;
        a.download = file.name;
        a.click();
      }
    } catch (error) {
      if (tab) tab.close();
      setStatus(status, plainError(error), true);
    } finally {
      b.disabled = false;
    }
  }

  const SLOT_NAMES = { 'pin-1': 'Pin 1', 'pin-2': 'Pin 2', 'pin-3': 'Pin 3', 'pin-4': 'Pin 4', logo: 'Logo', solo: 'Solo pin' };

  async function showThumbs(s, m, grid, b) {
    if (grid.childElementCount) {
      grid.replaceChildren();
      b.textContent = 'Show designs';
      return;
    }
    b.disabled = true;
    b.textContent = 'Loading…';
    try {
      const result = await staffCall('staffThumbs', { signupId: s.id, month: m.month });
      result.thumbs.forEach((t) => {
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
      b.textContent = 'Hide designs';
    } catch (error) {
      b.textContent = 'Show designs';
      setStatus(status, plainError(error), true);
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
    load().catch((error) => { if (!loginForm.hidden) return; showLogin(plainError(error)); });
  } else {
    showLogin('');
  }
})();
