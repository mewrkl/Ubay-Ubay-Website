# 0003: Acceptance letter and form on a separate page

- Status: Accepted
- Date: 2026-09-26
- Source: owner feedback on the Phase 1 build, PRD_ubayubay_cookout_site.md §4 (which placed the letter and form in Section 3 of a single page)

## Context
The PRD describes one scrollable page: intro, guidelines, "If you're
interested" (steps, full letter, form), then footer. Built that way, the owner
found the page cluttered. Artists who were still deciding whether to join hit a
wall of legal text and form fields. The owner's reference
(andimilportfolio.carrd.co) is a short, calm, single-column page.

## Options considered
- **Everything on one page (PRD):** no page load, everything in one place, and
  the letter sits right beside the guidelines it formalizes.
- **Separate sign-up page:** the main page ends with one "Read the letter and
  sign up" button. The letter and form live on `sign-up.html`, so the paperwork
  only appears after someone decides to join.
- **Same page with the letter folded:** one page, and the letter is hidden
  behind a toggle, but the form still takes up space.
- **Link to a Google Form:** simplest to build and manage, but it loses the
  drawn signature and the automatic signed-PDF email.

## Decision
Separate sign-up page, chosen by the owner. Both pages share `styles.css`,
`script.js`, and the same footer.

## Consequences
The main page stays short enough to read in one scroll, and the sign-up page
has a single job. **Given up:**
- The PRD's "one page" simplicity. There are now two HTML files, and the footer
  is duplicated in both.
- One extra tap and page load between reading the guidelines and signing. In
  an in-app browser, a slow load there can lose an artist.
- The guidelines are no longer visible while signing. A "Back to the
  guidelines" link is the only bridge.

## Generalizes to
**Progressive disclosure: split the decision from the commitment.** When most
visitors are deciding whether to act, keep the persuasion page free of the
paperwork and move the commitment step behind one clear button. This does NOT
hold when the paperwork is short enough to sit inline without dominating the
page, or when every extra navigation step measurably costs conversions, as on
very slow networks. In those cases, fold the content on the same page instead.
