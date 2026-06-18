# TubeOperator — Project Guide

<!-- AUTO-MANAGED: project-description -->
## Overview

TubeOperator is a creator education platform for YouTube + AI. It is a headless WordPress CMS frontend built with Astro 6 (SSG), deployed on Cloudflare Pages. The site covers strategies, tools, and systems for creators who want to grow YouTube channels as a business.

<!-- END AUTO-MANAGED -->

<!-- AUTO-MANAGED: build-commands -->
## Build & Development Commands

```bash
# Dev server (localhost:4321) — Astro only, no Pages Functions
cd astro-site && npm run dev

# Dev server with Pages Functions — Wrangler listens on :4321 (what you visit),
# proxies to Astro on :4322 (internal). Separates ports to avoid bind conflict.
cd astro-site && npm run pages:dev
# Equivalent: wrangler pages dev --proxy 4322 --port 4321 -- astro dev --port 4322

# Production build (runs astro build then pagefind to generate search index in dist/)
cd astro-site && npm run build

# Deploy (Cloudflare Pages via Wrangler)
cd astro-site && npx wrangler pages deploy dist
```

<!-- END AUTO-MANAGED -->

<!-- AUTO-MANAGED: architecture -->
## Architecture

- **Framework:** Astro 6 (SSG) — purely static (`output: 'static'`, no adapter); `trailingSlash: 'always'`, `build.format: 'directory'`
- **CMS:** WordPress (headless) — data fetched at build via `WP_API_URL` env var through `src/lib/wordpress.ts`
- **Hosting:** Cloudflare Pages (`wrangler.jsonc` → `pages_build_output_dir: ./dist`)
- **Runtime API:** Cloudflare Pages Functions (`functions/` dir at astro-site root) — served by Cloudflare at runtime, no Astro adapter needed
- **i18n:** Polylang Pro on the WP side; language prefix routing handled by WP REST API queries
- **Styling:** Component-scoped `<style>` in each `.astro` file + one global `<style is:global>` in `BaseLayout.astro`
- **Env vars:** `WP_API_URL` (build-time WP API); `GHL_PRIVATE_TOKEN`, `GHL_LOCATION_ID`, `GHL_LANGUAGE_FIELD_ID` (runtime, required by `/api/subscribe`). For local dev: build-time vars go in `astro-site/.env`; runtime secrets for Pages Functions go in `astro-site/.dev.vars` (Wrangler reads this automatically). Set all vars in the Cloudflare dashboard for production. `GHL_LANGUAGE_FIELD_ID` is optional — if unset, language custom field is skipped.

```
tubeoperator/
├── astro-site/
│   ├── functions/
│   │   └── api/
│   │       └── subscribe.js  # Cloudflare Pages Function — POST /api/subscribe
│   ├── src/
│   │   ├── components/     # Astro components (e.g. SubscribeGate.astro)
│   │   ├── layouts/        # BaseLayout.astro — shared shell for all pages
│   │   ├── lib/            # TypeScript helpers (wordpress.ts, splitGate.ts)
│   │   └── pages/          # File-based routes (all static)
│   │       ├── index.astro
│   │       ├── [slug].astro  # Blog posts & category archives (unified router)
│   │       ├── blog/
│   │       ├── category/
│   │       │   └── index.astro # Category directory page
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

- **Routes:** File-based — `src/pages/[slug].astro` handles all blog posts and category archives (slugs from WP). `src/pages/category/index.astro` renders the list of all categories.
- **Data fetching:** Always use helpers in `src/lib/wordpress.ts` (`getPosts`, `getCategories`). Never call the WP API directly from components.
- **Layouts:** All pages use `src/layouts/BaseLayout.astro` — pass `title`, `description`, `activePage` props
- **Naming:** kebab-case for files and CSS classes; camelCase for Astro variables and TypeScript
- **Images:** Featured images come from WP media URLs. Static assets go in `public/`
- **Gate logic:** `src/lib/splitGate.ts` splits post content at a `<!-- gate -->` comment; gate reveal uses cookies (`to_sub=1` or `to_gate_dismiss=1`)
- **Cloudflare Pages Functions:** Runtime API handlers live in `functions/` at the astro-site root (e.g. `functions/api/subscribe.js`). Use `export async function onRequestPost({ request, env })` — no Astro adapter or `prerender` flag needed.

<!-- END AUTO-MANAGED -->

<!-- AUTO-MANAGED: patterns -->
## Detected Patterns

- **Global CSS tokens:** All design tokens (colors, spacing, radii, shadows, fonts) are declared in `BaseLayout.astro`'s `<style is:global>` and must match `design.md`. Never hardcode color/spacing values in components. The global `body` rule sets the typography baseline: `font-family: var(--font-body)`, `font-weight: 500` (medium weight — not the browser default 400), `font-size: 18px`, `line-height: 1.7`, and `-webkit-font-smoothing: antialiased`.
- **WP REST API with `_embed`:** All fetch calls in `wordpress.ts` use `?_embed` to inline featured media and author data in one request.
- **Minimal header variant:** Pages like `/survey` pass `minimalHeader={true}` to `BaseLayout` to suppress the full nav.
- **Gate paywall:** `splitGate.ts` splits post HTML at `<!-- gate -->`; the gate UI is in `SubscribeGate.astro`. Client-side JS reveals locked content when either `to_sub=1` or `to_gate_dismiss=1` cookie is present.
- **Node ≥22 required:** `package.json` engines field enforces `>=22.12.0`.
- **Pagefind search index:** `npm run build` runs `astro build && pagefind --site dist` — pagefind generates a static search index in `dist/` automatically. `data-pagefind-ignore` attributes in `BaseLayout.astro` exclude header, footer, and mobile nav from indexing.
- **RSS feed and XML sitemap at build time:** `src/pages/rss.xml.ts` generates `/rss.xml` via `@astrojs/rss`; `@astrojs/sitemap` generates `/sitemap-index.xml`. Both are built as static files — no runtime needed.
- **`@astrojs/cloudflare` installed but inactive:** Listed in `package.json` dependencies but not imported in `astro.config.mjs`. Leftover from a prior SSR experiment. The site remains purely static (`output: 'static'`) with no adapter.
- **TOC generation:** In `[slug].astro`, h2 headings are extracted from raw WP HTML via regex at build time, slugified, and their `id` attributes are injected before rendering. The sidebar renders a sticky `<nav class="toc">` with IntersectionObserver-based active-link highlighting; TOC is hidden on mobile (≤980px).
- **Article two-column grid:** Post pages use `.art-grid { grid-template-columns: 1fr 360px }` (content + sticky sidebar), collapsing to single column at 980px. The `<header class="art-header">` (category tag, h1, meta row) is nested inside `.art-grid > .art-main` — not above the grid. It has a bottom border separator. There is no breadcrumb nav on post pages. The `.cat-tag` in the article header is a clickable `<a href="/{categorySlug}/">` link to the category archive.
- **Breadcrumbs:** Category archive pages (type === 'category' in `[slug].astro`) render a `<nav class="crumb">` breadcrumb: Home → /category/ → current category name. The blog index page (`blog/index.astro`) also has its own `.crumb` breadcrumb: Home → Blog. Post pages have no breadcrumb. The `.crumb` styles are scoped in each respective file.
- **Author avatar CDN fallback:** WP gravatar URLs containing `d=mm`, `d=blank`, or `d=identicon` (default/missing avatar) fall back to `https://cdn.tubeoperator.com/web/2026/06/avatar.png`.
- **catColors lookup table:** Category-to-color mapping `{ Algorithm, Thumbnails, Editing, Scripting, Growth, Monetization }` is duplicated inline in both `[slug].astro` and `blog/index.astro` — not yet extracted to a shared helper.
- **Native subscribe forms (active pattern):** Both `index.astro` (homepage hero `.nl-form`) and `SubscribeGate.astro` (post gate `.gate-form`) use native `<form>` elements that POST to `/api/subscribe`. Homepage sends `{ email, source: 'homepage-newsletter', language: navigator.language }` and on success redirects to `/survey?email=<encoded-email>&country=<country>` — the `country` value comes from `{ country }` in the JSON response (CF-IPCountry echo; omitted when absent). Gate sends `{ email, source: 'blog-gate', language: navigator.language }`, sets `to_sub=1` cookie, and reveals locked content. GHL iframe blocks are preserved as HTML comments in both files but are NOT active.
- **`/api/subscribe` endpoint:** `functions/api/subscribe.js` (Cloudflare Pages Function) — validates email, then POSTs to `https://services.leadconnectorhq.com/contacts/` (GHL REST API, `Version: v3` header) using `GHL_PRIVATE_TOKEN` and `GHL_LOCATION_ID`. Includes `tags: ['newsletter subscriber']`, `country` from `CF-IPCountry` header (Cloudflare-injected, absent in local dev), and optionally `customFields` with `language` value when `GHL_LANGUAGE_FIELD_ID` is set. On success returns `{ success: true, country }` — the `country` field echoes back the Cloudflare-detected country code (e.g. `"US"`) so the client can forward it to the survey URL or other downstream flows; it is `undefined` in local dev where `CF-IPCountry` is absent. On error returns `{ error }` JSON. Moved from `src/pages/api/subscribe.ts` to avoid ASSETS binding conflict with Cloudflare. When GHL returns HTTP 400 with `"duplicated"` in the response body (already-subscribed contact), the endpoint treats this as `{ success: true, country }` — duplicate submissions do not surface an error to the user.
- **GHL iframe embeds (survey only):** `survey.astro` uses an active GHL iframe widget from `api.automator.vn`. The iframe uses `data-base-src` (not `src`) and an `is:inline` script that runs before `form_embed.js` to build the final `iframe.src` by forwarding `email` and `country` query params from the page URL — this prefills matching hidden fields in the GHL survey. No `data-layout` frontmatter string is used on this page.
- **WordPress block image alignments:** `.prose` CSS in `[slug].astro` handles all WP block alignment classes using direct align-class selectors (`.alignX`) — matching every WP variant (`figure.alignX`, `img.alignX`, `.wp-block-image.alignX`) in one rule. `.aligncenter` uses `text-align:center;margin:32px auto` with a nested `.aligncenter img { margin-left:auto;margin-right:auto;display:block }`. `.alignleft`/`.alignright` float with text wrap, capped at 50% width. `.alignwide` uses a modest negative-margin breakout. `.alignfull` is full-width with border-radius removed. Base `img` is `display:block` left-aligned by default (not auto-centered). Floats collapse to full-width at 640px. `.prose::after` clearfix contains trailing floats.
- **Category archive card styles:** `.art-card`, `.art-cover`, and `.art-body` are defined in `[slug].astro` (not a shared component) for the category archive card grid. `.art-cover` uses `aspect-ratio: 16/9` with `background-size: cover`. Category archive cards show `<span class="art-cat">` category label above the title; blog index cards (`blog/index.astro`) do NOT show a category label — only the title. Category archives include client-side pagination: `POSTS_PER_PAGE = 9`, controlled by JS show/hide on `.art-card[data-index]` with a `.pagination` nav (Prev/Next + numbered pages).
- **Pagefind live search on blog index:** `blog/index.astro` embeds a search bar wired to the Pagefind index. On input (debounced 250ms), it lazy-loads `/pagefind/pagefind.js` (preloads on focus), hides the default blog content (`#blog-default-content`), and renders up to 15 results in `#search-results-grid` using `.art-card` markup. Search result cards include a `<p>` excerpt below the title (using `r.excerpt`) — standard blog/category cards do NOT show an excerpt. Clearing the input restores the default layout.
- **Related posts same-category preference:** In `[slug].astro`, related posts first collect same-category posts (excluding the current post). If ≥3 exist they are used; otherwise falls back to all posts sorted by recency. Always sliced to 3.
- **`gift-box` lead magnet (commented out):** The `.gift-box` section at the bottom of post pages in `[slug].astro` is wrapped in a JSX block comment (`{/* ... */}`) and does NOT render. When re-enabled, the form uses `onsubmit="return false"` and is NOT wired to `/api/subscribe`. Do not confuse it with the gate form in `SubscribeGate.astro`.
- **`nl-band` newsletter band (commented out):** In `blog/index.astro`, the `.nl-band` section between the featured post and the card grid is also wrapped in a JSX block comment (`{/* ... */}`) and does NOT render. It was a cosmetic-only form (`onsubmit="return false"`). Re-enable alongside `.gift-box` when a real lead magnet is ready.
- **Hardcoded `aggregateRating` in schema:** BlogPosting JSON-LD on post pages includes an `aggregateRating` block with static values (`ratingValue: "4.9"`, `reviewCount: "124"`). These are not pulled from a real data source.

<!-- END AUTO-MANAGED -->

<!-- MANUAL -->
## Design

All UI/styling decisions reference **`design.md`** at this directory root.
Do not invent new color values, font sizes, or spacing — use the tokens defined there.

## Gotchas

- **Subscribe forms are native (not GHL iframes).** Both `index.astro` (homepage hero) and `SubscribeGate.astro` (post gate) use native `<form>` elements posting to `/api/subscribe`. The GHL iframe embed blocks are preserved as HTML comments in both files for reference — do not uncomment or reactivate them unless intentionally switching back. `survey.astro` still uses an active GHL iframe (`api.automator.vn`) but does NOT use the `data-layout` frontmatter pattern — instead an `is:inline` script dynamically sets the iframe `src` from `data-base-src` + URL query params (`email`, `country`) before `form_embed.js` loads.
- **`catColors` is duplicated.** The category-to-hex mapping exists identically in both `[slug].astro` and `blog/index.astro`. If adding a new category color, update both files until this is extracted to a shared lib.
- **Two gate unlock cookies.** Locked post content is revealed when either `to_sub=1` OR `to_gate_dismiss=1` is set — both must be checked in any gate-related client-side logic.
- **Author avatar from WP may be a gravatar placeholder.** Always apply the CDN fallback check (`d=mm`, `d=blank`, `d=identicon`) before rendering author avatars.
- **Two local env files for Pages Functions dev.** `astro-site/.env` holds build-time vars (e.g. `WP_API_URL`). `astro-site/.dev.vars` holds runtime secrets consumed by Pages Functions (e.g. `GHL_PRIVATE_TOKEN`, `GHL_LOCATION_ID`). Both are gitignored. Use `npm run pages:dev` (not `npm run dev`) when you need the `/api/subscribe` function to work locally — plain `astro dev` does not load `.dev.vars` or serve `functions/`. The `pages:dev` script binds Wrangler on port 4321 (what you open in the browser) and Astro internally on port 4322 — this two-port split avoids a bind conflict where both processes previously tried to use 4321.
- **Duplicate subscribers are silently accepted.** `/api/subscribe` checks for GHL's HTTP 400 `"duplicated"` error and returns `{ success: true, country }` instead of surfacing it as an error. This means the homepage redirect to `/survey?email=<encoded-email>` and the gate cookie+reveal flow both complete normally for already-subscribed emails — no special handling needed on the client side. The `country` field in the success response is the Cloudflare-detected ISO country code (absent in local dev) — clients use it to append `&country=<code>` to the survey URL.
- **Agent/task artifacts are gitignored.** `astro-site/.gitignore` excludes `spec.md`, `task.md`, `./design`, and `.agent` — files generated by Claude Code or other AI tooling during development sessions. Do not commit these.
- **`gift-box` and `nl-band` are temporarily hidden.** The `.gift-box` section in `[slug].astro` and the `.nl-band` section in `blog/index.astro` are both wrapped in JSX block comments (`{/* ... */}`) and do NOT render. When re-enabled, their forms use `onsubmit="return false"` and do NOT post to `/api/subscribe`. Only the gate form in `SubscribeGate.astro` and the homepage hero `.nl-form` are real subscribe endpoints.
<!-- END MANUAL -->
