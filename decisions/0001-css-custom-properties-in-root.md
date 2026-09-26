# 0001: CSS colors and spacing as :root custom properties

- Status: Accepted
- Date: 2026-09-26
- Source: PRD_ubayubay_cookout_site.md §3 "Code and design rules" (the rule this reverses), Phase 1 kickoff message from the project owner

## Context
The PRD said: "Do not use a `:root` block of named custom properties (design
tokens). Keep the CSS plain and readable." The goal was CSS that anyone in the
student org could read without knowing about variables. At the start of
Phase 1 the owner reversed this ("you can use roots"), because content and
styling will keep changing during the build and they want to edit things in
one place. Little deliberation beyond that. The owner made the call, and the
build followed it.

## Options considered
- **Plain hex values everywhere (the PRD rule):** every rule is readable on
  its own, and nobody has to know what `var(--x)` means or look anything up.
- **A `:root` block of named custom properties:** each color, font, and
  spacing value is set once with a comment. Changing the accent or matching
  the pin template colors is a one-line edit instead of find-and-replace
  across the file.

## Decision
`styles.css` opens with a commented `:root` block: colors (including the
three pin-template line colors), font stacks, a 4px-based spacing scale,
gutter, section gap, and radii. The rest of the file refers to these by name.

## Consequences
Swapping the placeholder accent or fixing the template colors once the real
file arrives takes one edit, with no risk of missing an instance. Page gutter
and section spacing change at one breakpoint by overriding two variables.
**Given up:** a rule can no longer be read on its own. An editor who sees
`var(--color-note-text)` has to scroll to the top to learn it is amber-brown.
Non-developers also have one more concept to learn. A few one-off values
(pure white `#ffffff`, the fold-zone gray `#e4e4e4`) are still hard-coded, so
"everything is in :root" is not quite true.

## Generalizes to
**Centralized design values vs locally readable styles.** Name values
centrally when they are expected to change, or when the same value appears in
many rules (brand color, placeholder colors, spacing scale). This does NOT
hold when the stylesheet is tiny and rarely edited, or when its main readers
will copy single rules into other places (email HTML, CMS snippets), where
inline literals are the only thing that survives.
