# Ubay-Ubay artist invitation

A small website that invites artists to design button pin bundles for the
Ubay-Ubay stall and the FASO merch table. Submissions are ongoing and close at the
end of every month. Plain HTML, CSS, and JavaScript. No build step.

## Files

| File | What it is |
|---|---|
| `index.html` | The main page: intro, the 4 numbered guidelines (design, pin template, earnings, FAQ), how to join |
| `sign-up.html` | The acceptance letter and the short sign-up form |
| `styles.css` | How both pages look. Colors, text sizes, and spacing are at the top. |
| `script.js` | Small page behaviors, and the sign-up form: checks, signature pad, PDF, sending |
| `upload.html`, `upload.js` | The private upload page accepted artists open from their welcome email |
| `admin.html`, `admin.js` | The staff page: sign-ups, Accept and Decline, uploaded designs |
| `apps-script/Code.gs` | The sign-up backend, pasted into Google Apps Script (see "Set up the sign-up form") |
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
Extra detail belongs in the FAQ (Frequently asked questions, in the guidelines).

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

- Earnings: "What you earn" and the FAQ question "How is each sale split?" on `index.html`.
- Deadline (the last day of every month): the last bullet of "Design 4 pins", with the date in pink text, the FAQ question "When is the deadline?",
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

The signed PDF copies its text from this block, so the page and the PDF always match.

### Copy rules

- No em dashes. No semicolons.
- Formal but simple English. Sentence case.
- Buttons say exactly what they do ("Sign and send", not "Submit").
- Links to other websites open in a new tab. Add `target="_blank" rel="noopener noreferrer"` to any new
  outside link, like the Instagram and Facebook links in the footer.

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
  Coral fills the space around the centered sheet (`--color-backdrop`). A lighter green (`#8bb33a`,
  so navy text stays readable) is the band behind "What you earn", and pink the band behind
  "Frequently asked questions", both with navy text. "Pin Template" sits on a deep purple (`#6c3fe0`) with cream text. Everywhere else the sheet is cream and navy.
- **Page bands, top to bottom:** intro (cream), invitation (navy), Design 4 pins (cream), Pin Template (purple),
  What you earn (green), FAQ (pink), "How to join" (cream), footer (navy). The backgrounds are what separate the parts.
  Inside a navy zone (`class="zone zone-navy"`), text and lines switch to their light versions automatically.
- **Scroll animation:** anything with `class="reveal"` fades in the first time it scrolls into view,
  and the sample bundle picture grows in slightly. It is switched off for visitors who turned on
  "reduce motion" on their phone, and without JavaScript everything simply shows.
  To stop a part from animating, remove `reveal` from its class.
- **Fonts:**
  - Agrandir Text Bold, uppercase: every title, including "The guidelines", "How to join", the sign-up page title,
    and the numbered guideline titles, for example "2. PIN TEMPLATE". Type the number as part of the title.
  - Agrandir Grand Heavy is loaded in styles.css (`--font-headline`) but not used right now.
  - Agrandir Regular and Text Bold: everything else

  Neither font has a ₱ sign, so prices show ₱ in the phone's own font. That is expected.
- **Logos:** `assets/brand/logo-wordmark-navy.png` (the UBAY-UBAY word in the sticky header, cream background) and `assets/brand/logo-horizontal-cream.png` (navy footer) were cropped from the brand kit PDF.
  `assets/brand/logo-stacked.png` (transparent, stacked) is kept but no longer used on the site.
  To use sharper versions, export them from Canva with the same file names and replace these files.
- **Sample bundle picture:** `assets/brand/pin-sample-guideline.png`, shown under guideline 1. Keep file names free of spaces.
- **Pin template picture:** `assets/brand/pin-template.png` (transparent around the pin), shown under guideline 2.
  The "NOT VISIBLE" and "SIDE OF THE PIN" labels and the shading are drawn on top of it in `index.html`.

### Font licenses

- **Agrandir:** Pangram Pangram. The org holds a web license. Keep the purchase receipt somewhere the team can find it.
- Only the three Agrandir `.woff` files in `assets/fonts/` are published. The full font folders
  (`Agrandir-Font-Family/`, `Sunday/`) are listed in `.gitignore` and stay on your computer.
  The site no longer uses Sunday. It only appears inside the logo images.

## Set up the sign-up form

When an artist taps "Sign and send", the page makes the signed letter as a PDF and sends
it to a small Google Apps Script program on the org's Google account. That program:

- saves the PDF in Google Drive, in `Ubay-Ubay submissions / Signed letters`
- adds a row to a Google Sheet (name, artist name, email, social, date, PDF link)
- emails the PDF to the artist and to ubayubaytinkers@gmail.com

The code is in `apps-script/Code.gs`. Setting it up takes about 10 minutes, once.
Do every step while logged in to **ubayubaytinkers@gmail.com**.

### 1. Make the Sheet and paste the code

1. Go to [sheets.new](https://sheets.new). Name the new sheet `Ubay-Ubay sign-ups`.
2. In the menu, click **Extensions > Apps Script**. A code editor opens in a new tab.
3. Delete everything in the editor (the empty `function myFunction() {}`).
4. Open `apps-script/Code.gs` from this folder, copy all of it, and paste it into the editor.
5. Click the save icon (or press Ctrl+S). Name the project `Ubay-Ubay sign-up` if it asks.

### 2. Run setup once

1. At the top of the editor, next to **Run**, pick `setup` from the dropdown.
2. Click **Run**.
3. Google asks for permission. Click **Review permissions** and pick ubayubaytinkers@gmail.com.
4. You will see **"Google hasn't verified this app"**. That is normal for a script you wrote yourself.
   Click **Advanced**, then **Go to Ubay-Ubay sign-up (unsafe)**, then **Allow**.
5. Wait for "Execution completed". Setup made:
   - a **Signups** tab in the Sheet
   - a **Ubay-Ubay submissions / Signed letters** folder in Drive
   - a test email to ubayubaytinkers@gmail.com saying the form is set up

### 3. Put it online (deploy)

1. Click the blue **Deploy** button (top right) > **New deployment**.
2. Click the gear icon next to "Select type" and pick **Web app**.
3. Set **Execute as: Me** and **Who has access: Anyone**. (Anyone is needed so artists
   can send the form without logging in to Google. They can only send a letter, never read anything.)
4. Click **Deploy**, then copy the **Web app URL**. It ends in `/exec`.
5. Open that URL in your browser. It should show `{"ok":true}`.

### 4. Connect the website

In `script.js`, find `const SIGNUP_URL = '';` and paste the URL between the quotes:

```js
const SIGNUP_URL = 'https://script.google.com/macros/s/AKfy.../exec';
```

Save, then raise the `script.js?v=` number on both pages (see the EDIT comment at the top of each).

### Test mode

While the letter is still placeholder text, the form runs in test mode:
- a red "Test mode" line shows under the intro
- every PDF page says "TEST - not a real signed letter"
- emails start with `[TEST]`, and the Sheet row says `yes` in the Test column

When the letter is final, set `const TEST_MODE = false;` in `script.js` **and** delete the
"Test mode" line in `sign-up.html` (search for `Test mode`).

### Changing the script later

If `Code.gs` changes, paste the new code into the editor, save, then click
**Deploy > Manage deployments**, the pencil icon, **Version: New version**, **Deploy**.
That keeps the same URL, so the website doesn't need changing.
(Do not use "New deployment" again. That makes a new URL.)

### Settings

In the Apps Script editor, the gear icon (**Project Settings**) > **Script Properties**:
- `ORG_EMAIL` is where "Signed acceptance" emails go. Change it there, no code needed.
- `LETTERS_FOLDER_ID` points to the Signed letters folder. Leave it alone.

Free Gmail can send about 100 emails a day. Each sign-up sends 2.

## Use the staff page

The staff page is `admin.html` (https://mewrkl.github.io/Ubay-Ubay-Website/admin.html).
Open it from the small "Staff login" link at the bottom of any page. Search engines are told to skip it.

### Set the staff password (once)

In the Apps Script editor: the gear icon (**Project Settings**) > **Script Properties** >
**Add script property**. Name: `ADMIN_PASSWORD`. Value: a long password only staff know.
Click **Save**. To change it later, edit the value. Everyone then logs in with the new one.

Share the password only with the staff who need it. The staff page shows artists' personal
details (Data Privacy Act). After 10 wrong passwords in 10 minutes, the page locks for 10 minutes.

### Every day

1. Open the staff page, type your name and the password, and click **Log in**.
   Your name is saved next to everything you accept, decline, or change.
2. The page opens on **Needs a reply**: everyone still waiting, longest wait first. Red means
   more than 3 business days, which is longer than the sign-up page promises.
3. The 4 tiles at the top (Needs a reply, Accepted, Declined, Uploaded this month) are shortcuts.
   Click one to show only those, and click it again to show everyone.
4. For anything else, use the filter bar: search, **Status**, **Replied**, **Uploads**,
   **Signed**, and **Sort**, plus **Hide test sign-ups**. **Clear filters** resets them.
   The filters stay in the page address, so Refresh keeps them, and you can send the link to
   another staff member to show them the same list.
5. **Copy emails** copies every email in the list you're looking at. Paste it into Gmail's
   **Bcc** box to message, for example, all accepted artists at once.
6. Click an artist's row to open it. The social handle opens their Instagram.
   **View letter** shows their signed letter right on the page, with **Open in new tab**
   and **Download** if you need the file.
7. **Accept** emails the artist a welcome message with their private upload link.
   **Decline** emails a kind "not this time" message. Both ask first, and can only be done once.
8. If you answered someone from Gmail instead, tick **Replied** so they leave the waiting list.
9. When an accepted artist uploads, their row shows what they sent each month, with pictures.
   Click a picture to see it full size.
10. Lost link? **Resend upload link** emails it again. **Copy upload link** copies it for you.

The files are also in Drive (`Ubay-Ubay submissions / Artists / <artist> / <month> Bundle - <name>`),
and every action is in the Sheet's **Log** tab, but daily work never needs either.

### After pasting a new version of Code.gs

1. Select `setup` at the top of the editor and click **Run**. It adds any new Sheet columns and
   tabs, and keeps everything already there.
2. **Deploy > Manage deployments**, the pencil icon, **Version: New version**, **Deploy**.

## Put the site online

Coming in Phase 4.
