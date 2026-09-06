# gyurisc.com

Source for my personal blog at **[gyurisc.com](https://gyurisc.com)** — notes on building things, breaking things, and figuring stuff out.

Built with [Astro](https://astro.build) on top of the [AstroPaper](https://github.com/satnaing/astro-paper) theme by Sat Naing, and deployed on Vercel.

## Requirements

- Node.js >= 22.13
- [pnpm](https://pnpm.io) 11.22.0 — pinned via the `packageManager` field in `package.json`. Run `corepack enable` once and it will be used automatically.

pnpm is the only supported package manager here; `pnpm-lock.yaml` is the only lockfile. Don't run `npm install`.

## Getting started

```bash
pnpm install
pnpm run dev      # http://localhost:4321
```

## Commands

| Command                 | Does                                                                             |
| ----------------------- | -------------------------------------------------------------------------------- |
| `pnpm install`          | Install dependencies                                                             |
| `pnpm run dev`          | Dev server at `localhost:4321`                                                   |
| `pnpm run build`        | Type-check, build to `dist/`, index with Pagefind, copy the index into `public/` |
| `pnpm run preview`      | Serve the built `dist/` locally                                                  |
| `pnpm run sync`         | Regenerate `.astro/` types after editing `src/content.config.ts`                 |
| `pnpm run lint`         | ESLint                                                                           |
| `pnpm run format`       | Prettier, writing changes                                                        |
| `pnpm run format:check` | Prettier check (the CI gate)                                                     |

There is no test suite. CI runs `lint` → `format:check` → `build`; run those three before pushing.

Note that search is powered by [Pagefind](https://pagefind.app), whose index is generated during `pnpm run build` — search results only reflect content as of the last build.

## Writing a post

Posts are Markdown files in `src/data/blog/`. Create a file and give it frontmatter:

```markdown
---
title: The title of the post
description: One-line summary, used for SEO and the post list.
pubDatetime: 2026-01-15T09:00:00Z
tags:
  - astro
  - notes
featured: false
draft: false
---

Post body goes here.
```

- **Required**: `title`, `description`, `pubDatetime`.
- **Optional**: `author` (defaults to me), `modDatetime`, `featured`, `draft`, `tags` (defaults to `["others"]`), `ogImage`, `canonicalURL`, `hideEditPost`, `timezone`.
- The schema is enforced with Zod in `src/content.config.ts` — a mismatch fails the build.

### URLs

Directories become URL segments: `src/data/blog/foo/bar.md` is published at `/posts/foo/bar`, with each segment slugified.

### Drafts and scheduling

- `draft: true` hides a post from all listings.
- A future `pubDatetime` hides the post in production but shows it in dev, so you can preview scheduled writing. There's a 15-minute grace window (`SITE.scheduledPostMargin`).
- Careful: prefixing a _directory_ with `_` does **not** exclude it. Only a filename starting with `_` is skipped by the content glob. Use `draft: true` or `_filename.md`.

## Layout

```
src/
├── assets/          # icons and images
├── components/      # Astro components
├── data/blog/       # the posts
├── layouts/
├── pages/           # routes: index, about, projects, archives, tags, search, rss, og
├── scripts/         # theme toggle
├── styles/global.css
├── utils/           # sorting, filtering, OG image generation
├── config.ts        # site-wide settings
├── constants.ts     # social links
└── content.config.ts
```

## Customizing

- **`src/config.ts`** is the main knob: domain, author, title, post-per-page counts, archive/back-button/edit-post toggles, dynamic OG images, timezone.
- **`src/constants.ts`** holds the social and share links.
- **Theme colors** are CSS variables in `src/styles/global.css` (`--background`, `--foreground`, `--accent`, `--muted`, `--border`) for both light and dark, re-exported to Tailwind v4 via `@theme inline`. Restyle there rather than in individual components.
- **OG images** are generated at build time with Satori + resvg (`src/utils/og-templates/`, `src/utils/generateOgImages.ts`).
- Imports use the `@/*` alias for `./src/*`.

## Conventions

- No `console.*` in committed code (ESLint `no-console: "error"`).
- Prettier formats everything: double quotes, semicolons, 2-space indent, 80 columns. `prettier-plugin-tailwindcss` sorts class names.
- Commit messages follow [Conventional Commits](https://conventionalcommits.org).

## Deployment

Pushes to `main` deploy to production on Vercel. `gyurisc.com` is canonical; `www.gyurisc.com` redirects to it.

The Vercel project sets `ENABLE_EXPERIMENTAL_COREPACK=1` — **don't remove it.** Without it Vercel ignores the pinned pnpm version, falls back to pnpm 9, and the install fails on `pnpm-workspace.yaml` (which exists only to carry the pnpm 11 `allowBuilds` key that lets `sharp` run its install script).

## Credits & license

Theme: [AstroPaper](https://github.com/satnaing/astro-paper) by [Sat Naing](https://satnaing.dev), MIT licensed — see [LICENSE](LICENSE). Blog post content is © Krisztian Gyuris.
