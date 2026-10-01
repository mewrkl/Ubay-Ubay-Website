# PRD: Ubay Ubay x UP Cookout 2026 Artist Call Website

> **Changed 2026-10-01:** the site is no longer about UP Cookout. It is an ongoing artist call
> for pin bundles sold at the Ubay-Ubay stall and the FASO merch table. Submissions close on the
> last day of every month, and the team makes the bundles the month after. Artists design 4 pins
> and a bundle name logo. A FASO artist designs the backcard. We make copies of each bundle, and
> 1 free copy goes to the artist. The pin mix stays (2 food, 1 new original on theme, 1 pop culture).
> Where this document mentions Cookout or its dates, this note wins. See `decisions/0010-ongoing-monthly-call.md`.

## Read this first (instructions for Claude Code)

You are building a small static website. Before writing any design or code, read our frontend design skill in this project and follow it.

Work in phases. **Stop at the end of every phase, show what you did, and wait for my approval before moving on.**

- **Phase 0: Questions and design plan.** Read this whole document. List anything unclear, missing, or contradictory and ask me about it. Then propose a design plan (palette, type, layout with ASCII wireframes, principles) as the design skill describes. Do not write code yet.
- **Phase 1: Static skeleton.** Build all four sections with the real content below. No form logic, no scroll motion yet.
- **Phase 2: Acceptance form.** Form fields, validation, signature pad, PDF generation, and the Google Apps Script backend.
- **Phase 3: Motion and polish.** Scroll motion, mobile checks, accessibility checks.
- **Phase 4: Deploy** to GitHub Pages.

Anything marked **[TBD]** is not decided yet. Anything marked **[TENTATIVE]** may change. Never invent final values for these. Use a clearly visible placeholder and keep a running list of them in `TODO.md`.

If something in this document is ambiguous, ask me instead of guessing.

---

## 1. Project summary

**What:** A single scrollable page that invites artists to design button pins that Ubay Ubay will print and sell at its stall during UP Cookout 2026.

**Who we are:** Ubay Ubay is a popup bazaar under Tinkers, an organization in UP Cebu's fine arts department. We hold popup events in school to raise money and support local artists. [TBD: exact org naming to use on the site, "Ubay Ubay", "Tinkers", or "Ubay Ubay by Tinkers"]

**What UP Cookout is:** One of UP Cebu's biggest annual events and a platform for socio-political expression, organized by the UP Cebu University Student Council and Unified Student Organizations. The flea market runs November 5 to 15, 2026, and the main Cookout days are November 14 and 15, 2026.

**Audience:** Student and local artists. Most will open the link from Instagram or Facebook on a phone, which means it will often load inside an in-app browser.

**Goal:** Get artists to read the guidelines, sign the acceptance letter, and submit their designs.

---

## 2. Tech stack

| Part | Choice | Why |
|---|---|---|
| Site | Plain HTML, CSS, vanilla JS. No framework, no build step. | One page, small team, easy for anyone in the org to edit later. |
| Scroll motion | `IntersectionObserver` plus CSS transitions | No animation library needed for minimal motion. |
| Drawn signature | `signature_pad` from a CDN, pinned version | Small, works with touch and mouse. |
| Signed letter | `jsPDF` from a CDN, pinned version | Builds the signed acceptance letter as a PDF in the browser. |
| Form backend | Google Apps Script web app, owned by the `ubayubaytinkers@gmail.com` Google account | Free, sends email with a PDF attachment from our own Gmail, and logs every signup to a Google Sheet. |
| Hosting | GitHub Pages | Free and simple for a static site. |

**File structure:**

```
/
├── index.html
├── styles.css
├── script.js
├── assets/          (logos, pin template, sample images)
├── apps-script/
│   └── Code.gs      (paste into Google Apps Script)
├── README.md        (how to edit content, set up Apps Script, deploy)
└── TODO.md          (running list of TBD and TENTATIVE items)
```

Keep all page text in `index.html`, with HTML comments marking tentative blocks so non-developers in the org can edit the text without touching JS.

---

## 3. Code and design rules

**CSS**
- Do not use a `:root` block of named custom properties (design tokens). Keep the CSS plain and readable.
- The site must not look AI-generated. Follow the design skill, and avoid its listed tells: cream background with terracotta accent, SaaS card grids with identical rounded cards and soft shadows, all-caps eyebrow labels above every heading, `→` on every button, fade-and-slide-up on every section.
- Simple but creative. Spend the boldness in one place.
- Mobile first. Test at 360px width.

**JavaScript**
- Functional and short. No unnecessary abstractions or helper layers.
- Everything must still read fine with JS off, except the form.

**Motion**
- Minimal. One deliberate moment is better than effects on every section.
- Respect `prefers-reduced-motion`.

**Accessibility**
- Semantic HTML, visible keyboard focus, labels on every form field, good color contrast.

**Copy rules (the site speaks in our voice)**
- No em dashes. No semicolons.
- Formal but simple English. No buzzwords or fancy wording.
- Sentence case. Buttons say exactly what they do ("Sign and send", not "Submit").

**Design direction hints (proposals only, confirm in Phase 0)**
- The subject is button pins and the Cookout stall. The pin circle, the pin template rings, and the hanging backcard (with its hang hole) are natural visual material.
- Avoid copying the Cookout event branding. This is Ubay Ubay's page.

---

## 4. Page structure and content

### Section 1: Intro (the hook)

Purpose: in one screen, tell artists who we are, what we want, and why they should keep scrolling.

Must include:
- Who we are (one or two sentences).
- That we are inviting artists to design button pins that we will sell at UP Cookout 2026.
- A short line on what UP Cookout is and when it happens.
- What they get: a cut of every sale and a free pin bundle.
- A way to jump to the guidelines and to the signup section.

Draft copy (placeholder, I will revise):

> **Your art on a pin at UP Cookout 2026**
>
> Ubay Ubay is inviting artists to design button pin bundles for our stall at UP Cookout 2026, one of UP Cebu's biggest annual events. You make the art. We print, pack, and sell it. You earn a cut of every sale.

### Section 2: Guidelines [TENTATIVE, all of it]

Build this as a clear skeleton that is easy to update. Show a visible note that the guidelines may still change.

**2.1 What we are asking for**
- Each bundle has 4 pins. The artist designs all 4 pins and the bundle name.
- Required mix for each bundle:
  - 2 food designs (a favorite food, or any food)
  - 1 new original artwork on theme [TBD: what "on theme" means]
  - 1 pop culture reference (internet culture, anime, and similar)
- Reminder: this is for Cookout.

**2.2 More designs, more bundles**
- Artists can make as many designs as they want. Only 4 designs go into one bundle.
- Making 5 designs does not earn more. Making 8 designs means 2 bundles and a bigger cut.

**2.3 Pin template**
- Designs must be circular.
- Only the area inside the red line appears clearly on the front.
- The area between the red line and the gray line folds around the side of the pin. It is still visible from the side.
- Anything past the gray line is not visible.
- There is space for perimeter text near the edge.
- Green line meaning: [TBD]
- Render the template as an inline SVG diagram with a short legend.
- Offer a downloadable template file: [TBD asset]
- Pin size and file specs (diameter, format, resolution): [TBD]

**2.4 Packaging (backcard)**
- Artists only design the pins and the bundle name.
- The backcard is made by an assigned Ubay Ubay artist so all bundles look consistent.
- Backcard layout, top to bottom: bundle name (designed by the artist), "UP Cookout 2026", the 4 pins with the Ubay Ubay logo in the center, the artist's social handle at the bottom.
- Material: vellum board or hard paper with pre-punched holes for the 4 pins.
- To request additions to the card, message @anachimotte on Instagram.
- Show a simple illustration of the backcard layout (built in HTML/SVG, not a photo of another brand's product).

**2.5 Solo pins**
- Only artists who submitted a bundle can send solo pin designs.
- Solo pin art does not have to be new or on theme.
- Solo pins are uploaded with the same private upload link as the bundle.

**2.6 Earnings [TENTATIVE]**

| Item | Price | Artist gets | Tinkers gets |
|---|---|---|---|
| Bundle (4 pins) | ₱240 | ₱100 | ₱140 |
| Solo pin | ₱50 | ₱10 | ₱40 |

- Every accepted artist also gets a free pin bundle.
- Payout timing and method: [TBD]

**2.7 Submission**
- Deadline: the last day of every month. The team makes the bundles the month after.
- Artists upload on the website (changed 2026-10-01, see `decisions/0008-uploads-through-site.md`):
  - After signing, each artist gets an email with their signed copy and a private upload link (`upload.html?t=<token>`).
  - They can also attach designs on the sign-up form. This is optional.
  - Files go to the org's Google Drive. Artists never see Drive or name folders. The Apps Script creates
    `Artists/ArtistName (Full Name)/Bundle - <bundle name>/` and `.../Solo pins/` automatically.
  - Checks: PNG only, 1000 x 1000 px, exactly 4 files per bundle, uploads after the deadline count for the next month.

**2.8 Pin ideas**
- A small gallery of example pins for inspiration. [TBD: images. Use only images we own or have permission to use.]

### Section 3: If you're interested

This is a real sequence, so numbered steps are fine here.

1. Read the guidelines above.
2. Read and sign the acceptance letter below.
3. Check your email for a copy of your signed letter.
4. Upload your designs on the website with your private upload link before the deadline.

**Acceptance letter:** [TBD, the text is still being written]
- Display the full letter text on the page in a readable, scrollable block.
- Build it so the letter text lives in one clearly marked place in `index.html`, and the same text is used in the PDF.
- Until the real letter is ready, use a clearly marked placeholder with these clause headings: parties and event, what the artist will submit, deadlines, earnings and payout, ownership and permission to print and sell, originality, curation and right to decline designs, data privacy consent, signature.

**Form:** see Section 5.

### Section 4: Thank you footer

- A short thank-you message to artists.
- Contact: `ubayubaytinkers@gmail.com`, @anachimotte on Instagram for backcard requests, Ubay Ubay on Facebook [TBD: exact links].
- Tinkers / Ubay Ubay logo [TBD asset].

---

## 5. Acceptance form spec

### Fields

**Required**
| Field | Type | Notes |
|---|---|---|
| Full legal name | text | Used in the agreement |
| Last name | text | Used for the submission folder name |
| Artist name | text | Shown on the backcard |
| Email | email | Where their copy of the signed letter goes |
| Mobile number | tel | Philippine format, for urgent coordination |
| Social handle for the backcard | text | Example: @artistname on Instagram |
| Agreement checkboxes | checkbox | One per key clause, all must be ticked |
| Data privacy consent | checkbox | Consent under the Data Privacy Act of 2012 (RA 10173) to collect and use their details for this event only |
| Drawn signature | signature pad | With a "Clear signature" button |
| Typed full name | text | Printed under the signature |

**Optional**
| Field | Type | Notes |
|---|---|---|
| Bundle title | text | Can be tentative |
| Number of bundles planned | select: 1, 2, 3 or more | Helps us plan printing |
| Planning to send solo pins? | select: yes, no, maybe | |
| Affiliation | select: UP Cebu student, student from another school, not a student | Plus school name if another school |
| Portfolio link | url | Helps us see their style |

**Hidden**
- Honeypot field for spam bots.
- Date signed, filled in automatically.

**Do not collect:** GCash or bank details, home address, birthday. Payout details will be collected later, only from artists whose work sells.

### Submit flow

1. Validate all required fields. Show errors next to each field, in plain words that say how to fix it.
2. Build a PDF with: the full letter text, the artist's filled-in details, the signature image, the typed name, and the date.
3. Send the form data and the PDF (base64) to the Apps Script web app with `fetch`. Use `Content-Type: text/plain` to avoid the CORS preflight.
4. Disable the button and show a sending state while it runs.
5. On success, show a confirmation with a short summary and the next step (upload designs with the private upload link from the email).
6. On failure, keep everything the artist entered and show a clear error with a retry button.

Do not rely on a file download as the artist's copy. In-app browsers often block downloads. The emailed copy is the main copy. A download button can be offered as an extra.

### Apps Script backend (`apps-script/Code.gs`)

- `doPost(e)` parses the JSON body and decodes the PDF.
- Sends the signed PDF to `ubayubaytinkers@gmail.com`. Subject: `Signed acceptance: [Artist name]`.
- Sends a copy of the signed PDF to the artist's email.
- Appends a row to a Google Sheet: timestamp and all form fields (not the PDF).
- Rejects the request if the honeypot is filled.
- Returns a JSON success or error response.
- Deployed as a web app: execute as the owner, access for anyone.
- Write step-by-step setup instructions in `README.md` for someone who has never used Apps Script.

---

## 6. Assets we still need to provide [TBD]

- Ubay Ubay logo and Tinkers logo
- Pin template file for download
- Pin idea images (our own or with permission)
- Social media links
- Final acceptance letter text

---

## 7. Out of scope

- Collecting payment or payout details
- User accounts or logins for artists (the private upload link is enough)

Moved into scope on 2026-10-01 (see decisions 0008 and 0009): uploads through the website, and a
password-protected admin page (`admin.html`) that lists signups, signed letters, and uploads.
