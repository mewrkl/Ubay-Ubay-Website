# 0006: Soft scroll reveal on each block, plus pins popping in

- Status: Accepted
- Date: 2026-09-26
- Source: PRD_ubayubay_cookout_site.md §3 "Motion" (reversed in part), owner request for "small scrolling animations to make the site feel more premium"

## Context
The PRD asked for minimal motion, "one deliberate moment", and listed
"fade-and-slide-up on every section" as an AI-generated tell to avoid. The
design skill also bans scroll-triggered reveals. The owner, after seeing the
static site, asked for small scroll animations so the site feels more
premium, and chose from three options.

## Options considered
- **Soft fade-in plus pins popping:** each block fades and rises 12px, once, the
  first time it enters view (500ms). The 4 pins in "What to make" scale in one
  after another. It is the most "alive" option and still quiet.
- **Fade-in only:** the same reveal without the pin moment. The calmest option.
- **Pins only:** one deliberate moment, exactly as the PRD described.

## Decision
Soft fade-in plus pins popping, chosen by the owner. It uses
`IntersectionObserver`, and each block animates only once. A small inline script in
the `<head>` enables it only when the browser supports it and the visitor has
not set "reduce motion". Without JavaScript, all content shows.
The pin pop uses a smooth ease-out, not an overshoot bounce.

## Consequences
Scrolling feels responsive and finished. Tested in a real headless Chrome: the
blocks start hidden, reveal when scrolled to, and show immediately with reduced
motion. **Given up:**
- The PRD's "one moment" restraint and the "not on every section" rule.
- A small risk: if `script.js` fails to load while the head script ran, the
  revealed blocks would stay invisible. This was accepted because both files
  come from the same host.
- Anyone who jumps to an anchor sees blocks fade in as they scroll back up,
  which slightly delays reading.

## Generalizes to
**Reveal-on-scroll as polish.** On a short, content-light marketing page, a
single, subtle, once-only reveal adds perceived quality at almost no cost,
provided it is gated on reduced motion and content stays visible without
JavaScript. This does NOT hold for pages people scan quickly or return to
often (docs, dashboards, long forms), where any delay before text is readable
becomes friction.
