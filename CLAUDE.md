# TubeOperator — Project Guide

## Commands

```bash
# Dev server (localhost:4321)
cd astro-site && npm run dev

# Production build
cd astro-site && npm run build

# Deploy (Cloudflare Pages via Wrangler)
cd astro-site && npx wrangler pages deploy dist
```

## Architecture

- **Framework:** Astro 6 (SSG) — all pages statically generated at build time
- **CMS:** WordPress (headless) — data fetched at build via `WP_API_URL` env var through `src/lib/wordpress.ts`
- **Hosting:** Cloudflare Pages (`wrangler.jsonc` → `pages_build_output_dir: ./dist`)
- **i18n:** Polylang Pro on the WP side; language prefix routing handled by WP REST API queries
- **Styling:** Component-scoped `<style>` in each `.astro` file + one global `<style is:global>` in `BaseLayout.astro`

## Conventions

- **Routes:** File-based — `src/pages/[slug].astro` handles all blog posts (slugs from WP)
- **Data fetching:** Always use helpers in `src/lib/wordpress.ts` (`getPosts`, `getCategories`). Never call the WP API directly from components.
- **Layouts:** All pages use `src/layouts/BaseLayout.astro` — pass `title`, `description`, `activePage` props
- **Naming:** kebab-case for files and CSS classes; camelCase for Astro variables and TypeScript
- **Images:** Featured images come from WP media URLs. Static assets go in `public/`
- **Gate logic:** `src/lib/splitGate.ts` splits post content at a `<!-- gate -->` comment; gate reveal uses cookies (`to_sub=1`)

## Design

All UI/styling decisions reference **`design.md`** at this directory root.
Do not invent new color values, font sizes, or spacing — use the tokens defined there.

## Gotchas

<!-- Add edge cases and surprises here as they're discovered -->
