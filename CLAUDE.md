# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Krisztian Gyuris's personal blog (https://gyurisc.com), built on the **AstroPaper** Astro theme. `README.md` is the upstream theme's README (authored by Sat Naing) — it documents the theme, not this site. Treat it as theme reference, not as a description of Krisztian's blog.

Deployed on Vercel — see [Deployment](#deployment) for the project, the required corepack env var, and the domain layout.

## Commands

pnpm is the package manager — `pnpm-lock.yaml` is the only lockfile; do not run `npm install` here. The version is pinned by the `packageManager` field in `package.json` (pnpm 11.22.0). CI reads it via `pnpm/action-setup@v4`; Vercel reads it **only because `ENABLE_EXPERIMENTAL_COREPACK=1` is set on the project** — see [Deployment](#deployment). pnpm 11 requires Node >= 22.13.

`pnpm-workspace.yaml` exists solely to hold `allowBuilds` (esbuild, sharp). pnpm 11 blocks dependency build scripts by default, and `sharp` needs its install script for Astro's image pipeline — without this file the build fails. Note that pnpm 11 no longer reads the `pnpm` field in `package.json`, and `allowBuilds` replaced the older `onlyBuiltDependencies` key.

```bash
pnpm install
pnpm run dev           # dev server at localhost:4321
pnpm run build         # astro check && astro build && pagefind index && copy index into public/
pnpm run preview       # serve ./dist
pnpm run sync          # regenerate .astro/ types after content.config.ts changes
pnpm run lint          # eslint
pnpm run format        # prettier --write .
pnpm run format:check  # prettier --check . (CI gate)
```

There is no test suite. CI (`.github/workflows/ci.yml`) runs exactly `lint` → `format:check` → `build`; run those three before pushing.

Note `build` does more than compile: it type-checks via `astro check`, runs Pagefind over `dist`, then copies `dist/pagefind` into `public/`. Search only reflects content as of the last build.

## Deployment

Vercel project `gyurisc-com` under team `gyurisc-s-team`; Framework Preset is Astro, and `vercel.json` declares `framework: astro` as well. Pushes to `main` deploy to production.

**`ENABLE_EXPERIMENTAL_COREPACK=1` is set on the Vercel project — do not remove it.** Vercel ignores the `packageManager` field unless corepack is enabled. Without it, Vercel infers the pnpm version from the lockfile plus the project's 2023 creation date and picks **pnpm 9**, which then rejects `pnpm-workspace.yaml`: that file holds only the pnpm 11 `allowBuilds` key, and pnpm 9 requires every workspace file to carry a non-empty `packages:` field.

```
Using pnpm@9.x based on project creation date
 ERROR  packages field missing or empty
Error: Command "pnpm install" exited with 1
```

A healthy build instead logs `Detected ENABLE_EXPERIMENTAL_COREPACK=1 and "pnpm@11.22.0" in package.json`, runs sharp's install script, and ends with `Done in ...s using pnpm v11.22.0`.

This failure is invisible locally and in CI — both already run pnpm 11, so Vercel is the only environment that drops to 9. Adding `packages:` to `pnpm-workspace.yaml` would silence the error but leave Vercel on pnpm 9 while everything else runs 11 (and `allowBuilds` would be a no-op there); prefer keeping the versions identical. If corepack support ever breaks, override the project's Install Command to `corepack enable && pnpm install --frozen-lockfile` rather than editing the workspace file.

**Domains.** `gyurisc.com` is canonical and serves the site; `www.gyurisc.com` is a 308 redirect to it. Keep `SITE.website` (`src/config.ts`) pointed at whichever host returns 200 — canonical tags, sitemap, RSS and OG URLs all derive from it, so a mismatch aims every canonical at a redirect.

Vercel is also the DNS provider (`ns1`/`ns2.vercel-dns.com`), so records are edited with `vercel dns ls|add|rm`, not at the registrar. The zone carries ProtonMail MX/SPF/DKIM/DMARC records — never remove those when editing DNS. If a domain sits at `pending_domain_verification` despite correct DNS, check for more than one `vc-domain-verify=` TXT under `_vercel.gyurisc.com`: a leftover record from a previously linked service blocks the claim, and only the API surfaces the real reason (`txt_on_another_project`) — the dashboard just shows a generic pending state.

## Content model

Blog posts are Markdown in `src/data/blog/`, loaded by the `blog` collection in `src/content.config.ts` with glob `**/[^_]*.md`.

- **Underscore prefix excludes files, not directories.** The glob `**/[^_]*.md` only skips files whose *basename* starts with `_`. A `_`-prefixed directory is still loaded and published — `getPath` (`src/utils/getPath.ts`) merely strips that segment from the URL, so `_drafts/foo.md` ships at `/posts/foo`. To keep a post out of the build, use `draft: true` or an `_` on the filename.
- **Directories become URL segments.** `src/data/blog/foo/bar.md` → `/posts/foo/bar`, with each segment slugified. Routing is `src/pages/posts/[...slug]/index.astro`, which builds `params.slug` from `getPath`.
- **Frontmatter schema** (enforced by Zod, build fails on mismatch): required `title`, `description`, `pubDatetime`; optional `author` (defaults to `SITE.author`), `modDatetime`, `featured`, `draft`, `tags` (defaults `["others"]`), `ogImage`, `canonicalURL`, `hideEditPost`, `timezone`.
- **Draft/scheduled behavior** lives in `src/utils/postFilter.ts`: `draft: true` posts are always hidden from listings; posts with a future `pubDatetime` are hidden in production but visible in dev. `SITE.scheduledPostMargin` (15 min) is the grace window.
- Sorting is by `modDatetime ?? pubDatetime`, descending (`src/utils/getSortedPosts.ts`).
- `src/data/blog/examples/` holds upstream demo posts authored by Sat Naing — not Krisztian's writing.

## Architecture notes

- **`src/config.ts` is the central knob.** `SITE` controls domain, author, title, pagination counts, archive/back-button/edit-post toggles, dynamic OG images, timezone. Most feature flags live here rather than in components. Social links live in `src/constants.ts`.
- **Path alias**: `@/*` → `./src/*` (tsconfig). Use it in imports rather than relative paths.
- **OG images are generated at build time** — Satori renders JSX-ish templates in `src/utils/og-templates/{post,site}.js` to SVG, then `@resvg/resvg-js` converts to PNG (`src/utils/generateOgImages.ts`). Exposed as endpoints `src/pages/og.png.ts` and `src/pages/posts/[...slug]/index.png.ts`. `@resvg/resvg-js` is excluded from Vite's `optimizeDeps`.
- **Theming** is CSS-variable based in `src/styles/global.css`: `:root`/`html[data-theme="light"]` and `html[data-theme="dark"]` define `--background/--foreground/--accent/--muted/--border`, re-exported to Tailwind v4 via `@theme inline`. `src/scripts/theme.ts` toggles the `data-theme` attribute. To restyle the site, edit those variables — not individual components.
- **Tailwind v4** is wired through the `@tailwindcss/vite` plugin (no `tailwind.config`); custom utilities like `max-w-app` / `app-layout` are declared with `@utility` in `global.css`.
- **Code blocks** use Shiki with `min-light`/`night-owl` dual themes plus transformers for diff/highlight notation and a custom filename transformer (`src/utils/transformers/fileName.js`).
- **Search** is Pagefind (`src/pages/search.astro` mounts `@pagefind/default-ui`), which is why the index is built and copied during `pnpm run build`.

## Conventions

- ESLint sets `no-console: "error"` — no `console.*` in committed code.
- Prettier config (`.prettierrc.mjs`): double quotes, semicolons, 2-space tabs, 80 cols, `arrowParens: "avoid"`, `trailingComma: "es5"`. `prettier-plugin-tailwindcss` sorts class names; let it.
- Commits follow Conventional Commits (`cz.yaml`, Commitizen `cz_conventional_commits`).
- `PUBLIC_GOOGLE_SITE_VERIFICATION` is the only env var, declared in `astro.config.ts`'s env schema and optional.
