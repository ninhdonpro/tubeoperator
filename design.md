# TubeOperator — Design System Spec

A portable reference for designing pages in the TubeOperator style. Hand this file to any
AI/designer to keep new screens on-brand. Brand: warm, editorial, authority — creator
education for YouTube + AI. Calm cream canvas, a deep (non-neon) YouTube red as the single
accent, generous spacing, and large, readable type.

---

## 1. Brand principles

1. **Warm & editorial, not "SaaS".** Content and credibility lead; sell with words, bylines and proof.
2. **Red is a signal, not a wash.** Use brand red for one primary action per view, links, active states, and small accents — never as a large neon fill.
3. **Large & airy.** Big type, generous whitespace, soft corners, flat low shadows.
4. **Two voices.** A *product/UI* voice (Plus Jakarta Sans) and an *editorial content* voice (Lora serif headings inside articles).

---

## 2. Color tokens

### Brand red (deepened YouTube red — not neon `#FF0000`)
| Token | Hex | Use |
|---|---|---|
| `--red-50`  | `#FDECEB` | tint backgrounds, badge bg, focus halo |
| `--red-100` | `#FAD0CD` | focus halo, soft fills |
| `--red-200` | `#F4A39C` | borders on tinted blocks |
| `--red-300` | `#EE756B` | underline accent |
| `--red-400` | `#E8483B` | — |
| `--red-500` | `#E62117` | **brand primary** (buttons, accents, active) |
| `--red-600` | `#C81C13` | hover, kicker text |
| `--red-700` | `#A3150E` | **red text on light surfaces (AA)** |
| `--red-800` | `#7D100A` | text on tint |
| `--red-900` | `#4F0A06` | deepest |

### Neutrals (ink)
`--ink-900 #0F0F0F` · `--ink-800 #1B1B1B` · `--ink-700 #2C2C2C` · `--ink-600 #4A4A4A` ·
`--ink-500 #6B6B6B` · `--ink-400 #909090` · `--ink-300 #C4C4C4` · `--ink-200 #E4E0DB` ·
`--ink-100 #F0ECE6` · `--ink-50 #F8F5F1`

### Surfaces
`--bg-page #FBF4EE` (warm cream — page background) · `--bg-surface #FFFFFF` (cards) ·
`--bg-cream #FAF3EC` (secondary surface) · `--bg-dark #1B1B1B` (dark CTA panels)

### Semantic / notification (each = color + light bg pair)
| Role | Color | Background |
|---|---|---|
| danger | `#E62117` | `#FDECEB` |
| warning | `#E8920C` | `#FCF0DC` |
| gold | `#F2B600` | `#FBF3D2` |
| success | `#1DA45A` | `#E6F6EE` |
| info | `#2563EB` | `#E8EFFE` |

### Category palette (decorative only — kept visually distinct from semantic)
Algorithm `#E62117` (brand) · Thumbnails `#4F46E5` (indigo) · Editing `#F2683C` (coral) ·
Scripting `#0E9488` (teal) · Growth `#7C3AED` (purple) · Monetization `#0F0F0F` (ink).

**Color rules**
- Red = accent only. Red *text* on light surfaces must use `--red-700 #A3150E` for AA contrast (pure `#E62117` is for fills, UI, large/bold text).
- Category colors are decorative (cover images, dots) and must stay distinct from the semantic palette so an indigo cover is never confused with a blue *info* state. Always pair category color dots with a text label.

---

## 3. Typography

### Families & roles
| Variable | Font | Role |
|---|---|---|
| `--font-display` | **Plus Jakarta Sans** | Everything by default: UI, nav, buttons, titles, body, marketing |
| `--font-serif` | **Lora** | ONLY inside article/post content: section headings (`h2`), leads, and pull-quotes |
| `--font-mono` | **JetBrains Mono** | code, tokens |

> Body and most headings are Plus Jakarta Sans. Lora is a small editorial accent reserved for
> the *inside* of long-form posts. Do not use Lora for page titles, nav, buttons, or UI.

### Scale (desktop)
| Element | Size | Weight | Tracking |
|---|---|---|---|
| H1 / page title | 46–52px | 800 | -0.03em |
| H2 / section | 30–34px | 700–800 | -0.02em |
| H3 | 19–21px | 700 | -0.01em |
| Lead | 20–22px | 400 | — |
| Body | 18px | 400 | — |
| Long-form prose | 20px / line-height 1.85 | 400 | — |
| Small / meta | 14–16px | 400–600 | — |
| Micro-label (uppercase) | 12–13px | 700 | +0.05–0.1em |

Line-height: headings 1.1–1.2, body 1.7, long-form 1.85.

### Rules
- **Title Case** for UI headings and buttons (`text-transform:capitalize`). Body is sentence case.
- Two weights carry the work: **400** (regular) and **700/800** (bold). Avoid 600 for headings.
- Proper nouns keep their casing ("YouTube", "AI") — `capitalize` preserves these.
- On macOS, avoid `-webkit-font-smoothing:antialiased` if bold headings look too thin (it renders weights lighter).

---

## 4. Spacing, radius, elevation, motion

**Spacing scale (4px base):** 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Section vertical padding — 88px; horizontal 48–72px.
- "Description — first component" gap = **32px**; stacked sub-blocks = **48px**.

**Radius:** sm 8 · md 12 · lg 18 · xl 28 · pill 999.
- Cards use lg/xl. Buttons/inputs use sm. Pills use 999. No rounded corners on single-sided borders.

**Elevation (flat, soft):**
- `sh-1` `0 1px 2px rgba(15,15,15,.05)` — resting cards
- `sh-2` `0 2px 8px rgba(15,15,15,.06)`
- `sh-3` `0 8px 24px rgba(15,15,15,.08)` — hover
- `red glow` `0 8px 22px rgba(230,33,23,.24)` — primary button only

**Motion:** duration 200ms, easing `cubic-bezier(.4,0,.2,1)`, hover lift `translateY(-2px…-3px)`.

---

## 5. Components

**Buttons** — radius sm, bold, Title Case, 15–17px.
- Primary: red `#E62117` fill, white text, red glow. One per view. Hover → `#C81C13` + lift.
- Secondary: ink-900 fill, white text.
- Outline: transparent, 1.5px ink-300 inset border → red border + red text on hover.
- Ghost: transparent, red text, red-50 hover.
- Disabled: ink-200 bg, ink-400 text.
- Sizes: sm `13×26`, md `17×30`, lg `20×42`.

**Badges / pills** — pill radius, 13–14px, 700.
- Brand: red (red fill/white), soft (red-50/red-700), dark (ink-900/white).
- Semantic: success/warning/info/danger/neutral using the bg + dark-shade-of-family text.

**Cards** — white, 1px `--ink-200` border, radius lg/xl, `sh-1`; hover `sh-3` + lift. Tinted/CTA cards use `--bg-cream` or `--bg-dark`.

**Inputs** — 1.5px ink-200 border, radius sm, 16–17px. Focus = red-500 border + 3px red-100 halo. Error = danger border + danger-bg halo. Search = pill radius + leading magnifier icon. Toggle on = red-500.

**Article card** — colored cover (category color, 16:9 placeholder ok), category tag (red-600 uppercase 12–13px), title (Jakarta 700, 21–23px), excerpt (ink-500), byline (avatar + author + read time). Hover lift.

**Newsletter block** — dark panel (`#1B1B1B`), red "Weekly" badge, name "The Operator's Brief", email input + red Subscribe.

**Navigation** — cream bar, pill active state (red-50 bg / red-700 text), one red CTA on the right.

**Footer** — cream, small uppercase ink-400 labels, ink-600 links → red on hover.

**Alerts** — bg + dark-text from the semantic family, with a filled circular icon in the family color.

---

## 6. Accessibility

- Brand red `#E62117` passes AA for bold/large text and UI components; for red *body text* on light use `--red-700 #A3150E` (~6:1).
- Minimum interactive target — 44–50px tall.
- No font smaller than 12px.
- Category dots always accompanied by a text label (never color alone).
- Single light theme (no dark mode shipped).

---

## 7. Logo

Red rounded-square tile (`#E62117`, radius ~11px, soft red glow) containing a single white,
rounded **play triangle**. Wordmark: "Tube" in ink-900 + "Operator" in red `#E62117`, Plus
Jakarta Sans 800.

---

## 8. Quick CSS variable block (paste-ready)

```css
:root{
  --red-50:#FDECEB;--red-100:#FAD0CD;--red-200:#F4A39C;--red-300:#EE756B;--red-400:#E8483B;
  --red-500:#E62117;--red-600:#C81C13;--red-700:#A3150E;--red-800:#7D100A;--red-900:#4F0A06;
  --ink-900:#0F0F0F;--ink-800:#1B1B1B;--ink-700:#2C2C2C;--ink-600:#4A4A4A;--ink-500:#6B6B6B;
  --ink-400:#909090;--ink-300:#C4C4C4;--ink-200:#E4E0DB;--ink-100:#F0ECE6;--ink-50:#F8F5F1;
  --bg-page:#FBF4EE;--bg-surface:#FFFFFF;--bg-cream:#FAF3EC;--bg-dark:#1B1B1B;
  --danger:#E62117;--warning:#E8920C;--gold:#F2B600;--success:#1DA45A;--info:#2563EB;
  --font-display:'Plus Jakarta Sans',system-ui,sans-serif;
  --font-serif:'Lora',Georgia,serif;
  --font-mono:'JetBrains Mono',ui-monospace,monospace;
  --r-sm:8px;--r-md:12px;--r-lg:18px;--r-xl:28px;--r-pill:999px;
  --sh-1:0 1px 2px rgba(15,15,15,.05);--sh-2:0 2px 8px rgba(15,15,15,.06);
  --sh-3:0 8px 24px rgba(15,15,15,.08);--sh-red:0 8px 22px rgba(230,33,23,.24);
  --ease:cubic-bezier(.4,0,.2,1);
}
```

Google Fonts: `Plus+Jakarta+Sans:wght@400;500;600;700;800` · `Lora:ital,wght@0,600;0,700;1,500` · `JetBrains+Mono:wght@400;500`.
