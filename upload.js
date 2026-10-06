// Upload page (upload.html?t=<code>). The code in the link tells the Apps Script
// which accepted artist this is, so every file lands in their own Drive folder.
// callScript() and plainError() come from script.js, which loads first.

(() => {
  const app = document.getElementById('upload-app');
  if (!app) return;

  const PIN_SIZE = 1000;
  const MAX_BYTES = 10 * 1024 * 1024;
  const code = new URLSearchParams(location.search).get('t') || '';
  const loading = document.getElementById('upload-loading');
  const bad = document.getElementById('upload-bad');
  const badText = document.getElementById('upload-bad-text');
  const retry = document.getElementById('upload-retry');
  let info = null;
  let sending = false;

  // ---------- Who is this, and what have they sent this month ----------

  const showBad = (message, canRetry) => {
    loading.hidden = true;
    app.hidden = true;
    bad.hidden = false;
    badText.textContent = message;
    retry.hidden = !canRetry;
  };

  async function load() {
    if (!code) {
      showBad('This page needs your private upload link. Use the link in your acceptance email, or email ubayubaytinkers@gmail.com.', false);
      return;
    }
    loading.hidden = false;
    bad.hidden = true;
    try {
      info = await callScript({ action: 'uploadInfo', code });
      document.querySelectorAll('[data-upload]').forEach((el) => {
        el.textContent = info[el.dataset.upload];
      });
      renderMine();
      loading.hidden = true;
      app.hidden = false;
    } catch (error) {
      showBad(plainError(error), !(error.result && error.result.badLink));
    }
  }

  async function refresh() {
    try {
      info = await callScript({ action: 'uploadInfo', code });
      renderMine();
    } catch (error) { /* the list just stays as it was */ }
  }

  retry.addEventListener('click', load);

  const SLOT_NAMES = { 'pin-1': 'Pin 1', 'pin-2': 'Pin 2', 'pin-3': 'Pin 3', 'pin-4': 'Pin 4', logo: 'Logo' };

  function renderMine() {
    const box = document.getElementById('upload-mine');
    box.replaceChildren();
    if (!info.bundles.length && !info.solo.length) {
      const p = document.createElement('p');
      p.className = 'small';
      p.textContent = 'Nothing yet.';
      box.append(p);
      return;
    }
    const list = document.createElement('ul');
    list.className = 'list upload-mine';
    info.bundles.forEach((bundle) => {
      const pins = ['pin-1', 'pin-2', 'pin-3', 'pin-4'].filter((s) => bundle.slots.includes(s)).length;
      const missing = Object.keys(SLOT_NAMES).filter((s) => !bundle.slots.includes(s)).map((s) => SLOT_NAMES[s]);
      const li = document.createElement('li');
      const name = document.createElement('strong');
      name.textContent = bundle.name;
      li.append('Bundle ', name, ': ' + pins + ' of 4 pins' + (bundle.slots.includes('logo') ? ' and the logo.' : '.'));
      if (missing.length) li.append(' Still missing: ' + missing.join(', ') + '.');
      list.append(li);
    });
    if (info.solo.length) {
      const li = document.createElement('li');
      li.textContent = info.solo.length + ' solo pin' + (info.solo.length === 1 ? '' : 's') + ': ' + info.solo.join(', ');
      list.append(li);
    }
    box.append(list);
  }

  // ---------- File checks ----------

  const imageSize = (file) => new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight, url }); };
    img.onerror = () => { resolve(null); };
    img.src = url;
  });

  /** Returns { url } when the file is fine, or { error } saying what to fix. */
  async function checkFile(file, mustBePinSize) {
    if (file.type !== 'image/png' && !/\.png$/i.test(file.name)) return { error: 'Not a PNG' };
    if (file.size > MAX_BYTES) return { error: 'Bigger than 10 MB' };
    const size = await imageSize(file);
    if (!size) return { error: 'Can’t open this file' };
    if (mustBePinSize && (size.width !== PIN_SIZE || size.height !== PIN_SIZE)) {
      return { error: size.width + ' x ' + size.height + ', needs 1000 x 1000', url: size.url };
    }
    return { url: size.url };
  }

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('This file could not be read.'));
    reader.readAsDataURL(file);
  });

  window.addEventListener('beforeunload', (event) => {
    if (sending) event.preventDefault();
  });

  // ---------- Bundle ----------

  const bundleForm = document.getElementById('bundle-form');
  const bundleName = document.getElementById('bundle-name');
  const bundleError = document.getElementById('bundle-name-error');
  const bundleSend = document.getElementById('bundle-send');
  const bundleStatus = document.getElementById('bundle-status');
  const slots = [...document.querySelectorAll('#bundle-slots .slot')].map((label) => ({
    slot: label.dataset.slot,
    name: SLOT_NAMES[label.dataset.slot],
    label,
    input: label.querySelector('input'),
    preview: label.querySelector('.slot-preview'),
    state: label.querySelector('.slot-state'),
    file: null,
    error: '',
  }));

  const setStatus = (el, message, isError) => {
    el.textContent = message;
    el.classList.toggle('is-error', Boolean(isError));
  };

  const setSlot = (s, file, check) => {
    s.file = file;
    s.error = check ? check.error || '' : '';
    s.preview.replaceChildren();
    if (check && check.url) {
      const img = document.createElement('img');
      img.src = check.url;
      img.alt = '';
      s.preview.append(img);
    }
    s.state.textContent = !file ? 'Choose PNG' : s.error || 'Ready';
    s.label.classList.toggle('is-ready', Boolean(file) && !s.error);
    s.label.classList.toggle('is-error', Boolean(s.error));
  };

  slots.forEach((s) => {
    s.input.addEventListener('change', async () => {
      const file = s.input.files[0];
      if (!file) return setSlot(s, null);
      setSlot(s, file, await checkFile(file, s.slot !== 'logo'));
    });
  });

  bundleForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;

    const typed = bundleName.value.trim();
    bundleError.textContent = typed ? '' : 'Type your bundle name.';
    bundleName.setAttribute('aria-invalid', typed ? 'false' : 'true');
    if (!typed) { bundleName.focus(); return; }

    // The same name as a bundle sent this month (any capitals) adds to or fixes that bundle.
    const existing = info.bundles.find((b) => b.name.toLowerCase() === typed.toLowerCase());
    const name = existing ? existing.name : typed;
    const chosen = slots.filter((s) => s.file);

    if (slots.some((s) => s.error)) {
      setStatus(bundleStatus, 'Fix the files marked in red first.', true);
      return;
    }
    if (!existing && chosen.length < slots.length) {
      setStatus(bundleStatus, 'For a new bundle, pick all 4 pins and the logo.', true);
      return;
    }
    if (!chosen.length) {
      setStatus(bundleStatus, 'Pick the files you want to send.', true);
      return;
    }

    sending = true;
    bundleSend.disabled = true;
    try {
      for (let i = 0; i < chosen.length; i++) {
        const s = chosen[i];
        setStatus(bundleStatus, 'Sending ' + s.name.toLowerCase() + ' (' + (i + 1) + ' of ' + chosen.length + ')…');
        s.state.textContent = 'Sending…';
        await callScript({ action: 'uploadFile', code, bundle: name, slot: s.slot, fileName: s.file.name, data: await toBase64(s.file) });
        s.input.value = '';
        setSlot(s, null);
        s.state.textContent = 'Sent';
        s.label.classList.add('is-sent');
      }
      setStatus(bundleStatus, 'Bundle "' + name + '" sent. Thank you!');
      bundleSend.textContent = 'Send bundle';
      bundleName.value = '';
      await refresh();
    } catch (error) {
      setStatus(bundleStatus, plainError(error) + ' Tap Try again to send the rest. Files marked Sent are saved.', true);
      bundleSend.textContent = 'Try again';
      slots.forEach((s) => { if (s.file && s.state.textContent === 'Sending…') s.state.textContent = 'Not sent'; });
    } finally {
      sending = false;
      bundleSend.disabled = false;
    }
  });

  // A fresh pick clears the "Sent" marks from the last bundle.
  bundleName.addEventListener('input', () => {
    slots.forEach((s) => { if (!s.file) { s.label.classList.remove('is-sent'); s.state.textContent = 'Choose PNG'; } });
  });

  // ---------- Solo pins ----------

  const soloForm = document.getElementById('solo-form');
  const soloInput = document.getElementById('solo-files');
  const soloError = document.getElementById('solo-error');
  const soloSend = document.getElementById('solo-send');
  const soloStatus = document.getElementById('solo-status');

  soloForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    const files = [...soloInput.files];
    soloError.textContent = '';
    if (!files.length) {
      soloError.textContent = 'Pick one or more PNG files.';
      return;
    }
    const problems = [];
    for (const file of files) {
      const check = await checkFile(file, true);
      if (check.error) problems.push(file.name + ': ' + check.error);
    }
    if (problems.length) {
      soloError.textContent = problems.join('. ') + '.';
      return;
    }

    sending = true;
    soloSend.disabled = true;
    let sent = 0;
    try {
      for (const file of files) {
        setStatus(soloStatus, 'Sending ' + (sent + 1) + ' of ' + files.length + '…');
        await callScript({ action: 'uploadFile', code, slot: 'solo', fileName: file.name, data: await toBase64(file) });
        sent += 1;
      }
      setStatus(soloStatus, files.length === 1 ? 'Solo pin sent. Thank you!' : files.length + ' solo pins sent. Thank you!');
      soloInput.value = '';
      await refresh();
    } catch (error) {
      setStatus(soloStatus, plainError(error) + ' ' + sent + ' of ' + files.length + ' were sent. Pick the rest and try again.', true);
      await refresh();
    } finally {
      sending = false;
      soloSend.disabled = false;
    }
  });

  load();
})();
