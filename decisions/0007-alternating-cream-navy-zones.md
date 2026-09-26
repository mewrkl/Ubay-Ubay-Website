# 0007: Zones alternate cream and navy

- Status: Accepted
- Date: 2026-09-26
- Supersedes: 0005

## Context
Record 0005 split the page into an intro on cream, the guidelines on a light
off-white panel, and "How to join" on navy. After seeing it, the owner asked
for "cream, navy, cream, navy" instead of "cream, white, navy, cream". This
was a direct instruction with little deliberation. It's recorded because it
reverses 0005.

## Options considered
- **Keep 0005 (cream, light panel, navy, cream):** the long guidelines stay on a
  light background, which is easiest to read, and navy is reserved for the one action.
- **Alternate cream and navy:** intro cream, guidelines navy, how to join cream,
  footer navy. The strongest, most obvious separation, and it uses more of the
  brand's navy.

## Decision
Alternate cream and navy, as the owner asked. Inside `.zone-navy`, the line,
hint, and well color variables are redefined, so rows, tables, folder names,
and placeholders switch to light versions without extra rules. The drawings keep
their own light fills and a fixed `--color-ink-2` for their small labels. The
footer uses a cream-on-navy logo cropped from the brand kit.

## Consequences
Each part of the page is unmistakable, even while scrolling fast. **Given up:**
- The longest reading section (the guidelines) is now light text on dark, which
  is slightly more tiring for long reading than dark on light.
- The call to action no longer has the only dark background. The navy
  "Read the letter and sign up" button on cream carries that job alone.
- The template drawing sits on navy. Its outer "not visible" ring is now a dim
  translucent band instead of a light one.

## Generalizes to
**Alternating dark and light bands to mark structure.** Alternating works when a
page has a few large, clearly different parts and readers scroll rather than
read closely. It does NOT hold when a dark band contains long body text or
dense tables. In that case, keep the dark band for short content (headers,
calls to action, footers) and put the reading material on light.
