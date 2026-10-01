# 0008: Artists upload designs on the website, stored in the org's Google Drive

- Status: Accepted
- Date: 2026-10-01
- Source: PRD §2.7 and §7 (both now amended), owner's message relayed from the org

## Context
The site is a static page on GitHub Pages, which can serve files but can't
receive them. The PRD said artists would upload to shared Google Drive folders
that they name themselves (`LastName_BundleName_ArtistName`), and it listed
"uploading through the website" as out of scope. The org pushed back: artists
shouldn't have to manage folders. The website should have its own "bins", and
signed letters should go to the admins behind the scenes. Artists still give
their Gmail. The sign-up form already planned a Google Apps Script web app (a
free script on the org's Google account that receives form posts) to email
the signed PDF.

## Options considered
- **Shared Drive links (the old PRD):** no code at all. Drive handles large
  files, resuming, and previews. Artists can see and fix their own folder.
- **Upload on the site, stored in the org's Drive through Apps Script:** artists
  never see Drive and never type a folder name. Folders are named and sorted
  automatically. It reuses the script Phase 2 was already building, costs
  nothing, and the files stay in an account the org already owns.
- **Upload on the site, stored in a file-storage service (Firebase, Supabase):**
  a real storage API with proper upload handling and access rules, and it
  doesn't depend on Apps Script's limits.

## Decision
Upload on the site, stored in the org's Drive through Apps Script. Each artist
gets a private upload link (`upload.html?t=<random token>`) in the email that
carries their signed copy. Attaching designs on the sign-up form is optional.
The script checks the token and the deadline, then files PNGs under
`Artists/ArtistName (Full Name)/Bundle - <name>/` or `.../Solo pins/`.

## Consequences
Artists have one place to go and can't misname or misplace anything. The org
gets a tidy folder tree and a Sheet row per upload. **Given up:**
- Zero code. The old way needed none, and now Phase 2 is roughly twice as big.
- Drive's own upload handling: resumable uploads, big files, and previews.
  Files now go as base64 (a text form of the file), one per request. That's
  fine for 1 to 3 MB PNGs but would break for large files or video.
- Artists can no longer look at their submitted folder in Drive. They only see
  what the upload page shows them.
- Anyone holding a forwarded upload link can upload as that artist. The link
  is the only key, because there are no accounts.
- A storage service would have given real access control and room to grow.

## Generalizes to
**Static site that needs to receive files: borrow a storage account you already
own through a small script, instead of adding a backend.** This holds when
files are small, there are tens to hundreds of users, the deadline is short,
and links can stand in for logins. It does NOT hold for large files (video,
print-ready PDFs over about 20 MB), thousands of uploaders, files that need
strict per-user privacy, or anything that has to outlive one event. In those
cases, use a real storage service with signed upload URLs.
