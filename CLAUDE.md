# TubeOperator — Project Guide

<!-- AUTO-MANAGED: project-description -->
## Overview

TubeOperator is a creator education platform for YouTube + AI. It is a headless WordPress CMS frontend built with Astro 6 (SSG), deployed on Cloudflare Pages. The site covers strategies, tools, and systems for creators who want to grow YouTube channels as a business.

<!-- END AUTO-MANAGED -->

<!-- AUTO-MANAGED: build-commands -->
## Build & Development Commands

```bash
# Dev server (localhost:4321)
cd astro-site && npm run dev

# Production build
cd astro-site && npm run build

# Deploy (Cloudflare Pages via Wrangler)
cd astro-site && npx wrangler pages deploy dist
```

<!-- END AUTO-MANAGED -->

<!-- AUTO-MANAGED: architecture -->
## Architecture

- **Framework:** Astro 6 (SSG) — `output: 'static'` with `@astrojs/cloudflare` adapter; individual API routes opt into SSR via `export const prerender = false`
- **CMS:** WordPress (headless) — data fetched at build via `WP_API_URL` env var through `src/lib/wordpress.ts`
- **Hosting:** Cloudflare Pages (`wrangler.jsonc` → `pages_build_output_dir: ./dist`)
- **i18n:** Polylang Pro on the WP side; language prefix routing handled by WP REST API queries
- **Styling:** Component-scoped `<style>` in each `.astro` file + one global `<style is:global>` in `BaseLayout.astro`
- **Env vars:** `WP_API_URL` (build-time WP API); `GHL_PRIVATE_TOKEN`, `GHL_LOCATION_ID`, `GHL_LANGUAGE_FIELD_ID` (runtime, required by `/api/subscribe`). Copy `.env.example` → `astro-site/.env` for local dev; set in Cloudflare dashboard for production. `GHL_LANGUAGE_FIELD_ID` is optional — if unset, language custom field is skipped.

```
tubeoperator/
├── astro-site/
│   ├── src/
│   │   ├── components/     # Astro components (e.g. SubscribeGate.astro)
│   │   ├── layouts/        # BaseLayout.astro — shared shell for all pages
│   │   ├── lib/            # TypeScript helpers (wordpress.ts, splitGate.ts)
│   │   └── pages/          # File-based routes
│   │       ├── index.astro
│   │       ├── [slug].astro  # All blog posts
│   │       ├── blog/
│   │       ├── survey.astro
│   │       ├── contact.astro
│   │       ├── welcome.astro
│   │       └── 404.astro
│   ├── public/             # Static assets (favicon, images)
│   ├── package.json
│   └── wrangler.jsonc
├── design.md               # Design system spec — color tokens, typography, components
└── CLAUDE.md
```

<!-- END AUTO-MANAGED -->

<!-- AUTO-MANAGED: conventions -->
## Code Conventions

- **Routes:** File-based — `src/pages/[slug].astro` handles all blog posts (slugs from WP)
- **Data fetching:** Always use helpers in `src/lib/wordpress.ts` (`getPosts`, `getCategories`). Never call the WP API directly from components.
- **Layouts:** All pages use `src/layouts/BaseLayout.astro` — pass `title`, `description`, `activePage` props
- **Naming:** kebab-case for files and CSS classes; camelCase for Astro variables and TypeScript
- **Images:** Featured images come from WP media URLs. Static assets go in `public/`
- **Gate logic:** `src/lib/splitGate.ts` splits post content at a `<!-- gate -->` comment; gate reveal uses cookies (`to_sub=1` or `to_gate_dismiss=1`)
- **API routes:** Files under `src/pages/api/` use `export const prerender = false` to opt into Cloudflare SSR within the otherwise static site.

<!-- END AUTO-MANAGED -->

<!-- AUTO-MANAGED: patterns -->
## Detected Patterns

- **Global CSS tokens:** All design tokens (colors, spacing, radii, shadows, fonts) are declared in `BaseLayout.astro`'s `<style is:global>` and must match `design.md`. Never hardcode color/spacing values in components.
- **WP REST API with `_embed`:** All fetch calls in `wordpress.ts` use `?_embed` to inline featured media and author data in one request.
- **Minimal header variant:** Pages like `/survey` pass `minimalHeader={true}` to `BaseLayout` to suppress the full nav.
- **Gate paywall:** `splitGate.ts` splits post HTML at `<!-- gate -->`; the gate UI is in `SubscribeGate.astro`. Client-side JS reveals locked content when either `to_sub=1` or `to_gate_dismiss=1` cookie is present.
- **Node ≥22 required:** `package.json` engines field enforces `>=22.12.0`.
- **TOC generation:** In `[slug].astro`, h2 headings are extracted from raw WP HTML via regex at build time, slugified, and their `id` attributes are injected before rendering. The sidebar renders a sticky `<nav class="toc">` with IntersectionObserver-based active-link highlighting; TOC is hidden on mobile (≤980px).
- **Article two-column grid:** Post pages use `.art-grid { grid-template-columns: 1fr 360px }` (content + sticky sidebar), collapsing to single column at 980px.
- **Author avatar CDN fallback:** WP gravatar URLs containing `d=mm`, `d=blank`, or `d=identicon` (default/missing avatar) fall back to `https://cdn.tubeoperator.com/web/2026/06/avatar.png`.
- **catColors lookup table:** Category-to-color mapping `{ Algorithm, Thumbnails, Editing, Scripting, Growth, Monetization }` is duplicated inline in both `[slug].astro` and `blog/index.astro` — not yet extracted to a shared helper.
- **Native subscribe forms (active pattern):** Both `index.astro` (homepage hero `.nl-form`) and `SubscribeGate.astro` (post gate `.gate-form`) use native `<form>` elements that POST to `/api/subscribe`. Homepage sends `{ email, source: 'homepage-newsletter', language: navigator.language }` and redirects to `/welcome/` on success. Gate sends `{ email, source: 'blog-gate', language: navigator.language }`, sets `to_sub=1` cookie, and reveals locked content. GHL iframe blocks are preserved as HTML comments in both files but are NOT active.
- **`/api/subscribe` endpoint:** `src/pages/api/subscribe.ts` (`prerender = false`) — validates email, then POSTs to `https://services.leadconnectorhq.com/contacts/` (GHL REST API, `Version: v3` header) using `GHL_PRIVATE_TOKEN` and `GHL_LOCATION_ID`. Includes `tags: ['newsletter subscriber']`, `country` from `CF-IPCountry` header (Cloudflare-injected, absent in local dev), and optionally `customFields` with `language` value when `GHL_LANGUAGE_FIELD_ID` is set. Returns `{ success: true }` or `{ error }` JSON.
- **GHL iframe embeds (survey only):** `survey.astro` still uses an active GHL iframe widget from `api.automator.vn` — the `is:inline` script and `data-layout` frontmatter string pattern applies there.

<!-- END AUTO-MANAGED -->

<!-- MANUAL -->
## Design

All UI/styling decisions reference **`design.md`** at this directory root.
Do not invent new color values, font sizes, or spacing — use the tokens defined there.

## Gotchas

- **Subscribe forms are native (not GHL iframes).** Both `index.astro` (homepage hero) and `SubscribeGate.astro` (post gate) use native `<form>` elements posting to `/api/subscribe`. The GHL iframe embed blocks are preserved as HTML comments in both files for reference — do not uncomment or reactivate them unless intentionally switching back. `survey.astro` still uses an active GHL iframe and follows the `is:inline` + frontmatter `data-layout` string pattern.
- **`catColors` is duplicated.** The category-to-hex mapping exists identically in both `[slug].astro` and `blog/index.astro`. If adding a new category color, update both files until this is extracted to a shared lib.
- **Two gate unlock cookies.** Locked post content is revealed when either `to_sub=1` OR `to_gate_dismiss=1` is set — both must be checked in any gate-related client-side logic.
- **Author avatar from WP may be a gravatar placeholder.** Always apply the CDN fallback check (`d=mm`, `d=blank`, `d=identicon`) before rendering author avatars.
<!-- END MANUAL -->
