# Roadmap

Running list of what's next for gyurisc.com. Newest work at the top of each
section; delete items once they're done rather than marking them complete.

## Writing

_Nothing queued._

## Site

- [ ] **Decide on analytics for gyurisc.com itself.** The site currently has no
      analytics of any kind — no Datafast, no GA, nothing. Publishing a post
      arguing for analytics while running none here is a gap worth closing.
- [ ] **Decide whether WedpicsQR's $65/mo is public.** It was left off the
      projects page; `src/data/projects.ts` is a one-line change either way.

## Housekeeping

- [x] **Line endings normalized.** `.gitattributes` now pins `* text=auto
      eol=lf`, so Windows checkouts stop producing CRLF files that
      `format:check` rejects locally while CI (Linux) passes. Delete this entry
      once it's been through a fresh clone without complaint.
