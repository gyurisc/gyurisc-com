# Roadmap

Running list of what's next for gyurisc.com. Newest work at the top of each
section; delete items once they're done rather than marking them complete.

## Writing

- [ ] **Rewrite the Search Console draft post.**
      `src/data/blog/search-console-only-tells-half-the-story.md` is a ~590-word
      first draft marked `draft: true`, so it's hidden from listings and the RSS
      feed until the flag comes off. The argument is that Google Search Console
      reports one channel (Google's own results page) and therefore misses AI
      assistant and community referrals entirely — told through Adriatic Atlas.

      Known weak spot: the draft carries no real numbers, so it leans on the
      *shape* of the traffic rather than evidence. Even one concrete figure —
      Search Console clicks vs. analytics sessions for the same week — would do
      more for the piece than any paragraph currently in it.

      To publish: remove `draft: true` and set `pubDatetime` to the real date.

## Site

- [ ] **Decide on analytics for gyurisc.com itself.** The site currently has no
      analytics of any kind — no Datafast, no GA, nothing. Publishing a post
      arguing for analytics while running none here is a gap worth closing.
- [ ] **Decide whether WedpicsQR's $65/mo is public.** It was left off the
      projects page; `src/data/projects.ts` is a one-line change either way.

## Housekeeping

- [ ] **Fix the local pnpm version.** The `pnpm` on PATH is 9.10.0 while
      `package.json` pins `pnpm@11.22.0`, so a plain `pnpm run <script>` fails
      with `packages field missing or empty` — pnpm 9 rejects
      `pnpm-workspace.yaml`, which holds only the pnpm 11 `allowBuilds` key.
      `corepack pnpm` resolves 11.22.0 correctly. Note CLAUDE.md currently
      states local and CI both run pnpm 11; that's true of CI, not of this
      machine.

- [x] **Line endings normalized.** `.gitattributes` now pins `* text=auto
      eol=lf`, so Windows checkouts stop producing CRLF files that
      `format:check` rejects locally while CI (Linux) passes. Delete this entry
      once it's been through a fresh clone without complaint.
