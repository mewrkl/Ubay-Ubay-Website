# TODO: placeholders and open questions

Every placeholder on the site shows as gray bracketed text, for example
`[to be decided]`, and uses `class="tbd"` in the HTML. Search for `tbd` to find them all.
When you fill one in, replace the whole `<span class="tbd">...</span>` and tick it off here.

## Main page (`index.html`)

- [x] Submission deadline: the last day of every month, so the team makes the bundles the month after (bullet under Design 4 pins, FAQ, and How to join step 3)
- [x] On-theme pin: on theme with the artist's own bundle, so no site-wide theme
- [x] Pin template download removed. The team aligns designs to the template.
- [x] Pin file: PNG, 1000 x 1000 px (The pin template)
- [ ] What the green line on the template means (FAQ)
- [ ] Payout timing and method (What you earn)
- [x] Facebook page link: https://www.facebook.com/ubayubay (from the brand kit)
- [ ] Permission from Gumtoo Stickers for the finished bundle example (assets/brand/pin-example-bundle.jpg), or swap in our own photo
- [ ] Pin idea images. The gallery section is hidden in the HTML until we have images we own or have permission to use.
- [x] Ubay-Ubay logos: stacked logo (intro) and cream horizontal logo (footer), cropped from the brand kit PDF
- [ ] Optional: replace the cropped logos with proper exports from Canva (SVG or transparent PNG) for extra sharpness
- [ ] Tinkers logo, if it should appear on the site
- [x] "These guidelines may still change." line removed

## Sign-up page (`sign-up.html`)

- [ ] Acceptance letter text (all 9 clauses)
- [ ] Data privacy wording in the letter (RA 10173)

## Values that may still change

- Earnings: bundle ₱240 (artist ₱100, Tinkers ₱140), solo pin ₱50 (artist ₱10, Tinkers ₱40).
  The artist's share shows in "What you earn" and the full split in the FAQ ("How is each sale split?"). Change both.
- Submission deadline: the last day of every month (Design 4 pins, FAQ, and How to join)

## Decided

- Org naming follows the brand kit: "Ubay-Ubay", "pop-up art market", "A Tinkers fundraiser"
- Colors and fonts follow the brand kit. See the Brand section in README.md.

## Open questions

- [x] No longer tied to UP Cookout. Submissions are ongoing, every month (changed 2026-10-01)
- [ ] Deadline for signing the acceptance letter
- [x] No fixed pin mix. Guideline 1 just asks for 4 pin designs (the old 2 food, 1 on theme, 1 pop culture mix was dropped)
- [ ] What does FASO stand for, and should the site spell it out the first time?
- [ ] Can a leftover design (for example the 5th one) be sent as a solo pin?
- [ ] Can the food and pop culture pins be older work? Does the originality clause allow fan art?
- [x] Free pin bundle: we make copies of the artist's bundle, and 1 free copy goes to them
- [ ] Exact red, gray, and green values in the template file (update `--color-template-*` in `styles.css`)

## Uploads and admin page (decided 2026-10-01, built in Phase 2)

Artists upload on the website with a private link from their email, or optionally during
sign-up. Files and signed letters are stored in the org's Google Drive, and folders are
named automatically. See `decisions/0008-uploads-through-site.md`.

The admin page grows into a staff center (`admin.html`, requested 2026-10-01) with three tabs:
- Submissions: each month's bundles with pin thumbnails and a review status
  (New / Accepted / Needs changes / Declined).
- Artists: a directory of everyone who signed, with clickable socials and an "In the program" tag.
- Prints: accepted bundles marked Printing / Active / Retired, a "Keep for next month" switch,
  and a "Next month's lineup" list that updates itself.
Staff type their name at login so every change is logged. The Google Sheet is the database.

- [ ] Waiting on: the person who decides which Google account runs the Apps Script
- [ ] Who sets and keeps the admin page password? Keep the list of people who know it small (RA 10173).
- [ ] Who besides ubayubaytinkers@gmail.com needs access to the Drive files?
- [ ] Who on staff can change review and print statuses?

## Sign-up form fields (decided 2026-09-26)

Required: full name, artist name, email, social handle, one checkbox (agree to the letter
plus data privacy consent), drawn signature. Hidden: spam trap, date signed.
Not collected: last name, mobile number, typed name, separate clause checkboxes,
affiliation, portfolio, bundle plans. See `decisions/0002-minimal-signup-form.md`.
