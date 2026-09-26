# Ubay Ubay x UP Cookout 2026 artist call

A small website that invites artists to design button pin bundles for the
Ubay Ubay stall at UP Cookout 2026. Plain HTML, CSS, and JavaScript. No build step.

## Files

| File | What it is |
|---|---|
| `index.html` | The main page: intro, what to make, the pin template, earnings, "Good to know", how to join |
| `sign-up.html` | The acceptance letter and the short sign-up form |
| `styles.css` | How both pages look. Colors, text sizes, and spacing are at the top. |
| `script.js` | The form logic (added in Phase 2) |
| `assets/fonts/` | The brand fonts, Sunday and Agrandir, as web files |
| `assets/brand/` | The Ubay-Ubay logos (badge and horizontal) |
| `assets/` | Also the place for the pin template file and pin idea images |
| `TODO.md` | Every placeholder still on the site, and open questions |
| `decisions/` | Short records of why things were built the way they were |

## See the site on your computer

Double-click `index.html`. It opens in your browser. After you save a change,
refresh the browser tab to see it.

To see the phone layout, open your browser's developer tools (F12), click the
phone icon, and pick a width of 360.

## Edit the text

1. Open `index.html` or `sign-up.html` in any text editor (VS Code, Notepad++, or even Notepad).
2. Search for `EDIT:`. Each of those comments sits right above text that is likely to change.
3. Change only the words between the tags. For example, in
   `<p>Design 4 pins and give your bundle a name.</p>` change the sentence and leave `<p>` and `</p>` alone.
4. Save and refresh the browser.

Keep each section short: a title, one or two sentences, and at most one picture or button.
Extra detail belongs in "Good to know".

### Placeholders

Anything not decided yet shows as gray text in brackets. In the code it looks like this:

```html
Theme: <span class="tbd">[to be decided]</span>
```

When the value is decided, replace the whole `<span ...>...</span>` with the real text,
and tick the matching line in `TODO.md`.

### Add a "Good to know" row

Copy one whole `<details class="more">` block on `index.html`, paste it below the others,
and change the title in `<summary>` and the text inside `<div class="more-body">`:

```html
<details class="more">
  <summary>Your question or topic</summary>
  <div class="more-body">
    <p>The answer goes here.</p>
  </div>
</details>
```

### Values that appear twice

- Earnings: "What you earn" and "Full price breakdown" on `index.html`.
- Footer: at the bottom of both pages. Keep them the same.

Search for the old value (for example `₱100`) to find every copy.

### The acceptance letter

The letter is in `sign-up.html`, between `ACCEPTANCE LETTER: START` and `ACCEPTANCE LETTER: END`.
Keep each clause as a heading followed by paragraphs:

```html
<h2>1. Parties and event</h2>
<p>The clause text goes here.</p>
```

The signed PDF (Phase 2) copies its text from this block, so the page and the PDF always match.

### Links

- Submission folders: search `index.html` for `link to be added`. The comment above each one
  shows the exact line to paste in, with your Google Drive link.
- Pin template download: search for `Download the template`. Put the file in `assets/`,
  set `href="assets/your-file-name.png"`, and delete `aria-disabled="true"`.

### Copy rules

- No em dashes. No semicolons.
- Formal but simple English. Sentence case.
- Buttons say exactly what they do ("Sign and send", not "Submit").

## Change colors, fonts, or sizes

Open `styles.css`. The `:root` block at the top lists every color, the four text sizes,
and the spacing, each with a short note. Change a value there and it updates on both pages.

## Brand

The look follows `UBAY-UBAY BRANDKIT.pdf`. The PDF is kept out of the public repo.

- **Colors:** cream `#f6f1e7` (page), navy `#2b2c49` (text and buttons), and four accents:
  coral `#eb6648`, pink `#f055b1`, violet `#8c5eff`, green `#749e25`.
  The accents only appear on the top band, the section title labels, the pins, and the step numbers.
- **Fonts:**
  - Agrandir Grand Heavy: the big headline
  - Sunday: section titles and the top band
  - Agrandir Regular and Text Bold: everything else

  Neither font has a ₱ sign, so prices show ₱ in the phone's own font. That is expected.
- **Logos:** `assets/brand/badge.png` and `assets/brand/logo-horizontal.png` were cropped from the brand kit PDF.
  To use sharper versions, export them from Canva with the same file names and replace these files.

### Font licenses

- **Sunday:** Fontfabric free font license. Web use with `@font-face` is allowed.
- **Agrandir:** Pangram Pangram. The org holds a web license. Keep the purchase receipt somewhere the team can find it.
- Only the four `.woff` files in `assets/fonts/` are published. The full font folders
  (`Agrandir-Font-Family/`, `Sunday/`) are listed in `.gitignore` and stay on your computer.

## Set up the form backend

Coming in Phase 2.

## Put the site online

Coming in Phase 4.
