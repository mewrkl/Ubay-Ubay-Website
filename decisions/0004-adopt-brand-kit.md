# 0004: Adopt the Ubay-Ubay brand kit for colors, fonts, and logo

- Status: Accepted
- Date: 2026-09-26
- Source: UBAY-UBAY BRANDKIT.pdf (not in the repo), PRD_ubayubay_cookout_site.md §3 (the rules this reverses), owner's answers in the brand restyle planning round

## Context
The first builds used placeholder styling: a white page, a single cobalt
accent, and system fonts. That followed a generic design skill and a PRD rule
banning a "cream background with terracotta accent" as an AI-generated tell.
The owner then supplied the official brand kit. It has a cream page, navy text,
four bright accents (coral, pink, violet, green), the Sunday display font, the
Agrandir text family, and a multicolor logo. The brand itself is cream plus a
coral accent, so the PRD ban and the brand directly conflict. The owner had
also rejected an earlier version as cluttered, so how much color to use was a
real question.

## Options considered
- **Keep the neutral placeholder styling:** quiet, maximum contrast, no font
  licensing questions, and it matches the PRD rule.
- **Brand kit, color in touches:** cream page and navy text, with accents only on
  the top letter band, section title labels, pins, and step numbers. Brand fonts,
  and the logo badge as the hero.
- **Brand kit, full color blocks:** each section is a solid accent panel, like the
  posters. The most on-brand option, and the loudest.

## Decision
Brand kit, with color in touches, chosen by the owner. The fonts are self-hosted
as WOFF files. Sunday is covered by the Fontfabric EULA, which allows web use,
and the org holds an Agrandir web license. The logos are cropped from the PDF.

## Consequences
The site now matches the org's posters and social media, so artists recognize it
as Ubay-Ubay. **Given up:**
- The PRD's "avoid cream plus terracotta" rule, knowingly.
- Some contrast. Navy text on the accent labels is only 3.4 to 4.4:1, which is
  acceptable for large titles only. That is why accents never carry body text.
- About 125 KB of font downloads. The fonts can flash in late on slow
  in-app browsers.
- The ₱ sign renders in a fallback font.
- Cropped PNG logos are less sharp than vector exports.
- Depending on the Agrandir license means the site's look depends on the org
  keeping its license valid.

## Generalizes to
**A client brand overrides generic "anti-default" taste rules.** Generic design
rules exist to prevent a look that says nothing. Once there is a real brand, it
is the identity, even when it overlaps with a listed "tell". Keep the generic
rules' underlying goals by limiting where the brand's loud elements go
(accents on labels and decoration, body text in the high-contrast pair). This
does NOT hold when the brand's colors fail accessibility for their intended use,
such as body text or buttons. Then keep the brand hue for decoration and
derive a compliant shade for anything people must read or press.
