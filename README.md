# Ubay-Ubay x UP Cookout 2026 artist invitation

A small website that invites artists to design button pin bundles for the
Ubay-Ubay stall at UP Cookout 2026. Plain HTML, CSS, and JavaScript. No build step.

## Files

| File | What it is |
|---|---|
| `index.html` | The main page: intro, the 4 numbered guidelines (design, pin template, earnings, FAQ), how to join |
| `sign-up.html` | The acceptance letter and the short sign-up form |
| `styles.css` | How both pages look. Colors, text sizes, and spacing are at the top. |
| `script.js` | The form logic (added in Phase 2) |
| `assets/fonts/` | The brand font, Agrandir, as web files |
| `assets/brand/` | The Ubay-Ubay logos and the sample bundle picture |
| `assets/` | Also the place for pin idea images |
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
Extra detail belongs in the FAQ (number 4 in the guidelines).

### Placeholders

Anything not decided yet shows as gray text in brackets. In the code it looks like this:

```html
Theme: <span class="tbd">[to be decided]</span>
```

When the value is decided, replace the whole `<span ...>...</span>` with the real text,
and tick the matching line in `TODO.md`.

### Add an FAQ question

Copy one whole `<details class="more">` block on `index.html`, paste it below the others,
and change the question in `<summary>` and the answer inside `<div class="more-body">`:

```html
<details class="more">
  <summary>Your question?</summary>
  <div class="more-body">
    <p>The answer goes here.</p>
  </div>
</details>
```

### Values that appear twice

- Earnings: "3. What you earn" and the FAQ question "How is each sale split?" on `index.html`.
- Deadline: the highlighted last bullet of "1. Design 4 pins", the FAQ question "When is the deadline?",
  and step 3 of "How to join" on `index.html`. Change all three.
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

### Copy rules

- No em dashes. No semicolons.
- Formal but simple English. Sentence case.
- Buttons say exactly what they do ("Sign and send", not "Submit").

## Change colors, fonts, or sizes

Open `styles.css`. The `:root` block at the top lists every color, the four text sizes,
and the spacing, each with a short note. Change a value there and it updates on both pages.

**After any change to `styles.css` or `script.js`, raise the version number** in both
`index.html` and `sign-up.html`. For example, change `styles.css?v=8` and `script.js?v=8` to `?v=9`.
Browsers keep a saved copy of these files for about 10 minutes. Without a new number, a visitor
can get the new page with the old styles, which looks broken. The same applies to images:
if you replace a logo with a file of the same name, it can take about 10 minutes to show everywhere.

## Brand

The look follows `UBAY-UBAY BRANDKIT.pdf`. The PDF is kept out of the public repo.

- **Colors:** cream `#f6f1e7` (page), navy `#2b2c49` (text and buttons), and four accents:
  coral `#eb6648`, pink `#f055b1`, violet `#8c5eff`, green `#749e25`.
  Coral is a full-width band behind "3. What you earn" and pink a full-width band behind
  "4. Frequently asked questions", both with navy text. Everywhere else the page is cream and navy.
- **Page bands, top to bottom:** intro (cream), guidelines 1 and 2 (navy), 3 What you earn (orange),
  4 FAQ (pink), "How to join" (cream), footer (navy). The backgrounds are what separate the parts.
  Inside a navy zone (`class="zone zone-navy"`), text and lines switch to their light versions automatically.
- **Scroll animation:** anything with `class="reveal"` fades in the first time it scrolls into view,
  and the sample bundle picture grows in slightly. It is switched off for visitors who turned on
  "reduce motion" on their phone, and without JavaScript everything simply shows.
  To stop a part from animating, remove `reveal` from its class.
- **Fonts:**
  - Agrandir Grand Heavy: zone titles ("The guidelines", "How to join") and the sign-up page title
  - Agrandir Text Bold: the numbered guideline titles, for example "2. PIN TEMPLATE". Type the number as part of the title.
  - Agrandir Regular and Text Bold: everything else

  Neither font has a ₱ sign, so prices show ₱ in the phone's own font. That is expected.
- **Logos:** `assets/brand/logo-stacked.png` (intro, transparent background) and `assets/brand/logo-horizontal-cream.png` (navy footer) were cropped from the brand kit PDF.
  To use sharper versions, export them from Canva with the same file names and replace these files.
- **Sample bundle picture:** `assets/brand/pin-sample-guideline.png`, shown under guideline 1. Keep file names free of spaces.
- **Pin template picture:** `assets/brand/pin-template.png` (transparent around the pin), shown under guideline 2.
  The "NOT VISIBLE" and "SIDE OF THE PIN" labels and the shading are drawn on top of it in `index.html`.

### Font licenses

- **Agrandir:** Pangram Pangram. The org holds a web license. Keep the purchase receipt somewhere the team can find it.
- Only the three Agrandir `.woff` files in `assets/fonts/` are published. The full font folders
  (`Agrandir-Font-Family/`, `Sunday/`) are listed in `.gitignore` and stay on your computer.
  The site no longer uses Sunday. It only appears inside the logo images.

## Set up the form backend

Coming in Phase 2.

## Put the site online

Coming in Phase 4.
