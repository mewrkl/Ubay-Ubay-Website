# TODO: placeholders and open questions

Every placeholder on the site shows as gray bracketed text, for example
`[to be decided]`, and uses `class="tbd"` in the HTML. Search for `tbd` to find them all.
When you fill one in, replace the whole `<span class="tbd">...</span>` and tick it off here.

## Main page (`index.html`)

- [ ] Final submission deadline, somewhere from October 20 to 25, 2026 (intro and How to join)
- [ ] Theme for the on-theme pin (What to make)
- [ ] Pin template file for download (put it in `assets/`)
- [ ] Pin size, file type, and resolution (The pin template)
- [ ] What the green line on the template means (Good to know)
- [ ] Payout timing and method (What you earn)
- [ ] Bundle submission folder link, Google Drive (How to join)
- [ ] Solo pin submission folder link, Google Drive (Good to know > Solo pins)
- [x] Facebook page link: https://www.facebook.com/ubayubay (from the brand kit)
- [ ] Pin idea images. The gallery section is hidden in the HTML until we have images we own or have permission to use.
- [x] Ubay-Ubay logos: badge (intro) and horizontal logo (footer), cropped from the brand kit PDF
- [ ] Optional: replace the cropped logos with proper exports from Canva (SVG or transparent PNG) for extra sharpness
- [ ] Tinkers logo, if it should appear on the site
- [ ] Delete "These guidelines may still change." once the guidelines are final

## Sign-up page (`sign-up.html`)

- [ ] Acceptance letter text (all 9 clauses)
- [ ] Data privacy wording in the letter (RA 10173)

## Values that may still change

- Earnings: bundle ₱240 (artist ₱100, Tinkers ₱140), solo pin ₱50 (artist ₱10, Tinkers ₱40).
  The artist's share shows in "What you earn" and the full split in "Good to know". Change both.
- Submission deadline: October 20 to 25, 2026, final date to be announced (intro and How to join)

## Decided

- Org naming follows the brand kit: "Ubay-Ubay", "pop-up art market", "A Tinkers fundraiser"
- Colors and fonts follow the brand kit. See the Brand section in README.md.

## Open questions

- [ ] Are pins sold during the whole flea market (Nov 5 to 15) or only on the main days (Nov 14 and 15)?
- [ ] Deadline for signing the acceptance letter
- [ ] Does a second bundle need the same mix (2 food, 1 on theme, 1 pop culture)?
- [ ] Can a leftover design (for example the 5th one) be sent as a solo pin?
- [ ] Can the food and pop culture pins be older work? Does the originality clause allow fan art?
- [ ] Free pin bundle: one per artist? Is it the artist's own bundle?
- [ ] Should artists create a folder inside the Drive bin, or upload files straight in?
- [ ] Exact red, gray, and green values in the template file (update `--color-template-*` in `styles.css`)

## Sign-up form fields (decided 2026-09-26)

Required: full name, artist name, email, social handle, one checkbox (agree to the letter
plus data privacy consent), drawn signature. Hidden: spam trap, date signed.
Not collected: last name, mobile number, typed name, separate clause checkboxes,
affiliation, portfolio, bundle plans. See `decisions/0002-minimal-signup-form.md`.
