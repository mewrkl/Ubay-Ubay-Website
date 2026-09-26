# 0002: Sign-up form asks for the bare minimum

- Status: Accepted
- Date: 2026-09-26
- Source: PRD_ubayubay_cookout_site.md §5 "Acceptance form spec" (the field list this reverses), owner feedback on the Phase 1 build

## Context
The PRD specified 10 required and 5 optional fields: legal name, last name,
artist name, email, mobile, social handle, one checkbox per letter clause,
privacy consent, a drawn signature, a typed name, and optional bundle plans,
affiliation, and portfolio. Built as specified, the form ran over several
phone screens. The owner said it was so long that an artist "would not want
to apply anymore". Most of the audience opens the link from Instagram on a phone.

## Options considered
- **Full PRD field list:** everything the org might need later is collected up
  front, in one place, with a per-clause record of consent.
- **Bare minimum:** full name, artist name, email, social handle, one combined
  agree-plus-privacy checkbox, a drawn signature. Six inputs and one screen of form.
- **Minimum plus mobile number:** the same, with a phone number for urgent coordination.
- **Minimum with a typed signature:** fastest on a phone, with no signature pad.

## Decision
Bare minimum, chosen by the owner. The hidden spam trap and the date-signed field stay.

## Consequences
The form fits in about one phone screen, which lowers the effort to apply.
Phase 2's validation, PDF, and Apps Script handle far fewer fields.
**Given up:**
- No mobile number, so urgent coordination has to go through email or social media.
- No last name, so the org can't pre-check that folder names match the signer.
- One checkbox instead of seven. This is a weaker, less granular record of
  which clauses the artist agreed to. The full letter is still in the signed
  PDF, so the agreement itself is still recorded.
- No bundle-count or affiliation data for print planning. It has to be asked
  for later, or inferred from submissions.

## Generalizes to
**Intake forms: collect at signup vs collect when needed.** When the form sits
at the top of a voluntary funnel (people choosing to apply), ask only for what
you need to act on this step, and defer the rest to people who get through.
This does NOT hold when the later contact channel is unreliable, when the law
or the agreement requires specific data at signing, or when per-item consent
must be provable on its own, in which case separate checkboxes are worth the friction.
