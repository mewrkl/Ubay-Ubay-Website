// Ubay-Ubay artist call pages (index.html and sign-up.html).
// The sign-up form (checks, signature pad, PDF, sending) is at the bottom.

// Scroll animation: anything with class="reveal" fades in the first time it
// scrolls into view. The small script in the <head> only turns this on when the
// browser supports it and the visitor has not asked for reduced motion.
// Without JavaScript, everything simply shows.
if (document.documentElement.classList.contains('js-reveal')) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px' });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

// Sticky header: once it reaches the top of the screen, add .is-stuck so the
// stylesheet can square its top corners and draw a line under it.
const siteHeader = document.querySelector('.site-header');
if (siteHeader) {
  const updateHeader = () => {
    siteHeader.classList.toggle('is-stuck', siteHeader.getBoundingClientRect().top <= 0);
  };
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
}

// "See example" in guideline 1: open the example picture on top of the page.
// The dialog closes with its X button, the Esc key, or a click outside the picture.
const exampleDialog = document.getElementById('example-dialog');
if (exampleDialog && typeof exampleDialog.showModal === 'function') {
  document.querySelectorAll('[data-open-example]').forEach((button) => {
    button.addEventListener('click', () => exampleDialog.showModal());
  });
  exampleDialog.addEventListener('click', (event) => {
    if (event.target === exampleDialog) exampleDialog.close();
  });
}

// Header logo: tap to show the short Ubay-Ubay description on phones (hover
// already shows it on computers). Tapping anywhere else or pressing Esc closes it.
const logoTip = document.querySelector('.logo-tip');
if (logoTip) {
  const trigger = logoTip.querySelector('.logo-tip-trigger');
  const setOpen = (open) => {
    logoTip.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
  };
  trigger.addEventListener('click', (event) => {
    event.stopPropagation();
    setOpen(!logoTip.classList.contains('is-open'));
  });
  document.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
      trigger.blur();
    }
  });
}


// ---------- Sign-up form (sign-up.html only) ----------
// The artist fills in the form and signs. This code checks it, makes the signed
// letter as a PDF, and sends it to the Google Apps Script web app
// (apps-script/Code.gs), which saves it to Drive, logs it in the Sheet, and emails it.

// EDIT: The Web app URL from Apps Script (Deploy > Manage deployments). It ends in /exec.
// While it is empty, the form works up to sending, then says sending isn't switched on yet.
const SIGNUP_URL = '';
// EDIT: Test mode stamps TEST on the PDF and the emails. When the letter is final, set this
// to false AND delete the "Test mode" line near the top of sign-up.html.
const TEST_MODE = true;

const signupForm = document.getElementById('acceptance-form');
if (signupForm) setUpSignup(signupForm);

function setUpSignup(form) {
  const status = document.getElementById('form-status');
  const submit = document.getElementById('signup-submit');
  const canvas = document.getElementById('signature-pad');
  const done = document.getElementById('signup-done');

  const showStatus = (message, isError) => {
    status.textContent = message;
    status.classList.toggle('is-error', Boolean(isError));
  };

  if (!window.SignaturePad || !window.jspdf) {
    showStatus('Part of this page did not load. Check your internet connection and reload the page.', true);
    submit.disabled = true;
    return;
  }

  // Signature pad. The canvas is drawn at the screen's pixel density so the
  // signature stays sharp, and redrawn when the width changes (phone rotation).
  const pad = new window.SignaturePad(canvas, { penColor: '#2b2c49', minWidth: 0.8, maxWidth: 2.6 });
  let canvasWidth = 0;
  const sizeCanvas = () => {
    if (canvas.offsetWidth === canvasWidth) return;
    canvasWidth = canvas.offsetWidth;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const strokes = pad.toData();
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d').scale(ratio, ratio);
    pad.clear();
    pad.fromData(strokes);
  };
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);

  // The checks. Each returns a message saying how to fix it, or '' when it's fine.
  const value = (id) => document.getElementById(id).value.trim();
  const checks = [
    { el: 'full-name', test: () => value('full-name') ? '' : 'Enter your full name.' },
    { el: 'artist-name', test: () => value('artist-name') ? '' : 'Enter your artist name. It can be the same as your full name.' },
    { el: 'email', test: () => {
      if (!value('email')) return 'Enter your email, so we can send you your signed letter.';
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value('email')) ? '' : 'Check your email. It should look like name@gmail.com.';
    } },
    { el: 'social', test: () => value('social') ? '' : 'Enter your social handle, for example @artistname.' },
    { el: 'agree', test: () => document.getElementById('agree').checked ? '' : 'Tick this box to agree to the letter.' },
    { el: 'signature-pad', error: 'signature-error', test: () => pad.isEmpty() ? 'Sign in the box above.' : '' },
  ];
  const signatureCheck = checks[checks.length - 1];

  const runCheck = (c) => {
    const message = c.test();
    document.getElementById(c.error || c.el + '-error').textContent = message;
    document.getElementById(c.el).setAttribute('aria-invalid', message ? 'true' : 'false');
    return message;
  };
  const checkAll = () => checks.filter((c) => runCheck(c)).map((c) => document.getElementById(c.el));

  // Errors show after the first try to send, then update as the artist fixes things.
  let tried = false;
  checks.forEach((c) => {
    const el = document.getElementById(c.el);
    el.addEventListener('blur', () => { if (tried) runCheck(c); });
    el.addEventListener('change', () => { if (tried) runCheck(c); });
  });
  pad.addEventListener('endStroke', () => { if (tried) runCheck(signatureCheck); });

  document.getElementById('signature-clear').addEventListener('click', () => {
    pad.clear();
    if (tried) runCheck(signatureCheck);
  });

  let sending = false;
  let lastPdf = null;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    tried = true;

    const problems = checkAll();
    if (problems.length) {
      showStatus(problems.length === 1 ? 'One thing needs fixing above.' : problems.length + ' things need fixing above.', true);
      problems[0].focus();
      return;
    }

    const details = {
      fullName: value('full-name'),
      artistName: value('artist-name'),
      email: value('email'),
      social: value('social'),
      dateSigned: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
    };
    document.getElementById('date-signed').value = details.dateSigned;

    sending = true;
    submit.disabled = true;
    submit.textContent = 'Sending…';
    showStatus('Sending your signed letter. This takes a few seconds.');

    try {
      lastPdf = buildLetterPdf(details, pad, canvas);
      if (!SIGNUP_URL) throw new Error('Sending isn’t switched on yet, so nothing was sent. Everything you typed is still here.');

      const response = await fetch(SIGNUP_URL, {
        method: 'POST',
        // text/plain stops the browser from asking Apps Script for permission first (it can't answer that).
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'signup',
          ...details,
          agree: true,
          test: TEST_MODE,
          website: document.getElementById('website').value,
          pdf: lastPdf.output('datauristring').split(',')[1],
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!result.ok) throw new Error(result.error || 'Something went wrong on our side.');

      showDone(details);
    } catch (error) {
      // fetch throws a TypeError when there is no connection.
      const message = error instanceof TypeError
        ? 'We couldn’t reach the server. Check your internet connection.'
        : error.message;
      showStatus(/still here/.test(message) ? message : message + ' Tap Try again. Everything you typed is still here.', true);
      submit.textContent = 'Try again';
    } finally {
      sending = false;
      submit.disabled = false;
    }
  });

  const showDone = (details) => {
    done.querySelectorAll('[data-done]').forEach((el) => {
      el.textContent = details[el.dataset.done];
    });
    form.hidden = true;
    done.hidden = false;
    done.scrollIntoView({ block: 'start' });
    done.focus({ preventScroll: true });
  };

  document.getElementById('signup-download').addEventListener('click', () => {
    if (lastPdf) lastPdf.save(letterFileName(value('artist-name')));
  });
}

function letterFileName(artistName) {
  const safe = artistName.replace(/[^\p{L}\p{N} -]/gu, '').trim() || 'artist';
  return 'Ubay-Ubay acceptance letter - ' + safe + '.pdf';
}

// The signed letter: the letter text exactly as it is on the page, then the
// artist's details, their signature, and the date. A4, Helvetica.
function buildLetterPdf(details, pad, canvas) {
  // compress keeps the file small (the signature picture is about 900 KB without it).
  const doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'a4', compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 56;
  const width = pageW - margin * 2;
  let y = margin;

  // Helvetica has no peso sign or curly quotes, so swap them for plain ones.
  const clean = (s) => s.replace(/₱\s?/g, 'PHP ').replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-').replace(/…/g, '...').replace(/\s+/g, ' ').trim();

  const roomFor = (height) => {
    if (y + height > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const write = (text, size, style, spaceAfter) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(43, 44, 73);
    const lineHeight = size * 1.45;
    doc.splitTextToSize(clean(text), width).forEach((line) => {
      roomFor(lineHeight);
      doc.text(line, margin, y + size);
      y += lineHeight;
    });
    y += spaceAfter;
  };

  // The letter, block by block, from the page.
  document.querySelectorAll('#letter-text > *').forEach((el) => {
    if (el.classList.contains('letter-heading')) {
      write(el.textContent, 16, 'bold', 8);
    } else if (el.tagName === 'H2') {
      y += 8;
      write(el.textContent, 12, 'bold', 2);
    } else if (el.tagName === 'UL' || el.tagName === 'OL') {
      el.querySelectorAll('li').forEach((li, i) => {
        write((el.tagName === 'OL' ? (i + 1) + '. ' : '- ') + li.textContent, 11, 'normal', 2);
      });
      y += 6;
    } else {
      write(el.textContent, 11, 'normal', 6);
    }
  });

  // The artist's details and signature stay together on one page.
  const sigW = 220;
  const sigH = sigW * (canvas.height / canvas.width);
  y += 16;
  roomFor(200 + sigH + 50);
  write('Signed by', 12, 'bold', 4);
  write('Full name: ' + details.fullName, 11, 'normal', 0);
  write('Artist name: ' + details.artistName, 11, 'normal', 0);
  write('Email: ' + details.email, 11, 'normal', 0);
  write('Social handle: ' + details.social, 11, 'normal', 6);
  write(document.querySelector('label[for="agree"]').textContent, 11, 'normal', 12);

  // The signature, 220pt wide, over a line with the name and date under it.
  roomFor(sigH + 50);
  doc.addImage(pad.toDataURL('image/png'), 'PNG', margin, y, sigW, sigH);
  y += sigH + 4;
  doc.setDrawColor(43, 44, 73);
  doc.setLineWidth(0.75);
  doc.line(margin, y, margin + sigW, y);
  y += 4;
  write(details.fullName, 11, 'bold', 0);
  write('Date signed: ' + details.dateSigned, 11, 'normal', 0);

  // Page numbers, and the TEST stamp on every page while in test mode.
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(90, 91, 115);
    doc.text('Ubay-Ubay artist acceptance letter, page ' + i + ' of ' + pages, margin, pageH - 28);
    if (TEST_MODE) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(198, 40, 40);
      doc.text('TEST - not a real signed letter', margin, 32);
    }
  }
  return doc;
}
