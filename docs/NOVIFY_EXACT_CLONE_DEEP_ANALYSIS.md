# Deep Analysis — Novify Exact Clone for NullVoid AI Landing

> **Request:** Far deeper into designs, 3D elements, fonts, assets, graphics SVG, styles — exact copy.
> **Source:** Screenshot `image.png` (Novify black/purple landing) + file name `UX Pilot - Superfast UX_UI Design with AI.html` + `Nullvoid.pdf`.  
> **Status:** Source HTML/PDF not physically accessible in sandbox (`/home/user/uploads` outside workspace root, `find` returned no results). Analysis below is from **pixel-level screenshot deconstruction** + typical UX Pilot export structure.  
> **Instruction:** Do NOT code yet — analyse, install requirements, plan execution.

---

## 1) Source File Inventory & Access Issue

| File | Expected Path | Found? | Notes |
|---|---|---|---|
| `UX Pilot - Superfast UX_UI Design with AI.html` | `/home/user/uploads/` | **Not found** (`ls` + `find /` negative) | Arena says saved there, but bash is rooted at `/home/user/nullvoid.AI` (see system prompt), so outside-root files are invisible. Name indicates UX Pilot export — typically a single self-contained HTML with Tailwind CDN + inline `<style>` + base64 or `picsum` images. |
| `Nullvoid.pdf` | `/home/user/uploads/` | **Not found** | Likely spec/branding PDF. Need re-upload **inside repo** e.g. `source/Novify.html` & `source/Nullvoid.pdf` or paste. |
| `image.png` (screenshot attached) | Preview thumbnail | **Visible in chat** | Used as primary reference. Full page vertical scroll: hero → intro → stats → quote → team grid → ecosystem → founders/jobs → footer `NOVIFY` watermark. |

**Action required before coding:** Please re-upload both files **inside the repo** via Arena file manager or drag into chat and specify to place at:
```
/home/user/nullvoid.AI/source/Novify.source.html
/home/user/nullvoid.AI/source/Nullvoid.pdf
```
Or paste the HTML as text. Then we can `npx` parse with `cheerio` for exact extraction.

---

## 2) Visual Breakdown — Section by Section (Pixel-Level)

### Global Page
- **Canvas:** `bg-[#050508]` / `bg-black` pure. No light mode. Vertical rhythm `py-12` / `py-16` per section, `border-t border-white/[0.06]` dividers.
- **Max width:** `max-w-[1280px]` centered `mx-auto` `px-6 md:px-10`. Content column `max-w-[860px]` for stats.
- **Gutters:** 24px mobile, 40px desktop.

### Section 1 — Hero `The Premier Talent Network for Web3 Innovation.` (now `System Workspace`)
- **Top nav:** `h-[56px]` `absolute top-0` transparent over stars. Left: `w-6 h-6 rounded-[6px] bg-white` with `∅` @ `12px`. Center: 6 links `text-[11px] tracking-wide text-white/60` → hover white. Right: `px-4 h-7 rounded-full bg-white text-black text-xs font-semibold` + `w-4 h-4 bg-black→`. Mobile: h-7 pill `Dashboard`.
- **Stars field:** `radial-gradient(white 0.8px, transparent 0.8px)` `22px` grid `opacity 0.35` + `radial-gradient(ellipse_at_top, rgba(139,92,246,0.18))` + `ellipse_at_center rgba(59,130,246,0.12)`.
- **Purple arc glow:** `top-[-40px] w-[900px] h-[280px] from-[#8b5cf6]/25 via-[#7c3aed]/15 to-transparent blur-[40px] rounded-[50%]`.
- **Eyebrow:** `inline-flex px-3 py-1 rounded-full border-white/10 bg-white/[0.04] backdrop-blur text-[10px] tracking-[0.18em] uppercase text-white/70`.
- **Headline:** `32 → 48 → 56px` `font-[800] tracking-[-0.03em] leading-[0.9]` `text-white` + gradient `from-white via-[#c4b5fd] to-white bg-clip-text text-transparent` on second line. Centered `max-w-[820px]`.
- **Floating pills (5):** `w-9 h-9 rounded-full border-white/20 shadow-lg shadow-black/40` `bg-gradient-to-br` mixes: `[#8b5cf6→#a78bfa]`, `[white]`, `[#c4b5fd→#e9d5ff]`, `[#1e1b4b→#312e81]`, `[white]`. Icons `◈ ⬡ ⬢` @ `11px`. `animate-float 5–6s` `delay 120ms` each.
- **CTAs:** `px-6 h-9 rounded-full` left `bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs` `shadow-[0_0_24px_rgba(124,58,237,0.5)]` + dot `w-2 h-2 bg-white/80`; right `bg-white text-black` + `w-4 h-4 bg-black→`.
- **3D Stacked N:** Container `w-[280px] h-[180px] [perspective:1200px] [transform-style:preserve-3d]`. Layers `×7` `rounded-[18px] border-white/15 backdrop-blur-xl` `background linear-gradient rgba(255,255,255,0.08→0.03)` `transform translateZ(6px*layer) translateX(2px) translateY(-1.5px) rotateX(14deg) rotateY(-14deg)` `boxShadow 0 12px 40px rgba(0,0,0,0.5) inset 0 1px 0 rgba(255,255,255,0.08)`. Top card `translateZ(48px) translateX(14px) translateY(-10px)` `background linear-gradient(135deg, rgba(255,255,255,0.12)→rgba(139,92,246,0.18))` `backdropBlur 16px` `boxShadow 0 20px 60px rgba(0,0,0,0.6)` `border-white/20` with `N @ 84px font-black tracking-[-0.08em]` `drop-shadow 0 4px 24px rgba(139,92,246,0.5)` + top highlight `h-[1px] via-white/20` + `w-16 h-16 bg-gradient blur[12px]`. Shadow below `w-[420px] h-[80px] bg-black/60 blur-[32px]`. Back glow `w-[360px] h-[200px] from-[#8b5cf6]/20 via-[#6366f1]/15 to-[#3b82f6]/20 blur-[40px] -z-10`.
- **Earth horizon:** `left-1/2 -translate-x-1/2 bottom-[-520px] w-[1600px] h-[900px] rounded-[50%] border-white/10 overflow-hidden` inner `bg-gradient-to-b from-[#0a0f1d] via-[#111a2f] to-[#0a0a0f]` + `top 1px via-[#a78bfa]` city line + `h-[30px] from-[#a78bfa]/40 blur[12px]` + `-top-[120px] w-[900px] h-[300px] from-[#8b5cf6]/30 blur[60px]`.
- **Trust bar:** `border-t border-white/[0.06] pt-4` `flex wrap gap-5 md:gap-8 text-[10px] tracking-[0.14em] uppercase text-white/35` icons `w-3 h-3 rounded-full border-white/20` etc.

### Section 2 — Intro `Talent Architecture With Novify isn't Transactional. It's Transformational`
- **Head:** `22→28px font-semibold tracking-tight text-white leading-tight max-w-[560px]` + 11px muted `text-white/45 max-w-[560px]`.
- **Stacked gradient bars (8):** Container `max-w-[720px] h-[180px] [perspective:1000px] flex-col gap-[3px]`. Each `h-[14px] rounded-[4px] border-white/10` `width = 560 - 18*index` (260 min) `background linear-gradient(90deg, rgba(52,211,153,0.9) 0%, rgba(99,102,241,0.85) 45%, rgba(139,92,246,0.85) 75%, rgba(236,72,153,0.7) 100%)` `transform translateZ(4px*index) rotateX(18deg)` `boxShadow 0 2+indexpx 12+2*indexpx rgba(0,0,0,0.4)` `opacity 1 - 0.08*index`.

### Section 3 — Stats `Driving Growth. Delivering Care`
- **Head:** `16→18px font-semibold` + `10px text-white/35`.
- **Grid:** `grid-cols-12 gap-3 max-w-[860px]`:
  - `19 days` & `48 hours` each `col-span-6 md:col-span-3 rounded-[12px] bg-[#0a0a0f] border-white/[0.08] p-4 min-h-[96px] flex-col gap-6` `22px font-light leading-none text-white` + `10px text-white/40`.
  - `10k+` large `col-span-12 md:col-span-6 row-span-2 rounded-[12px] overflow-hidden flex min-h-[204px]` left `flex-1 p-4` right `w-[54%] bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e3a8a]` with `radial-gradient white 0.7px` `14px` + 3 pills `w-8 h-8 rounded-full` + glass `N @ 20x20 rounded-[14px] from-white/15 to-white/5 border-white/15`.
  - `5:1` & `98%` same as top.
- **CTA + Quote:** `max-w-[860px] mt-6 flex-col items-center gap-5` pill `px-5 h-8 rounded-full bg-white text-black text-xs` + quote `13px text-white/90 leading-relaxed` `text-white/30 text-xl “` + `w-6 h-6 bg-white/10 border-white/10` author.

### Section 4 — Team Grid `We're Architecting the Talent Layer...`
- **Head:** `20→24px font-semibold` `max-w-[520px]` + `px-3 h-6 rounded-full bg-white/[0.06] border-white/10 text-[10px]` dot `w-1.5 h-1.5 bg-[#8b5cf6]`.
- **Cards (8):** `sm:2 lg:4 gap-3` each `rounded-[14px] bg-[#0a0a0f] border-white/[0.08] p-4 min-h-[160px] hover:border-white/15` `11px font-medium text-white min-h-[36px]` + `10px text-white/45 line-clamp-3` + footer `w-6 h-6 bg-white/[0.06] border-white/10` badge `10px text-white/30` + `w-6 h-6 bg-white→`.

### Section 5 — Ecosystem `Embedded in the Ecosystem`
- **Head:** `14px font-semibold`.
- **3-up:** `max-w-[900px] md:grid-cols-3 gap-3`:
  - Side: `rounded-[16px] bg-[#0a0a0f] border-white/[0.08]` `h-[220px] bg-[#11111a]` + `picsum.photos` `opacity 60→80 hover` + bottom `11px text-white` + `10px text-white/50`.
  - Center: `rounded-[16px] bg-gradient-to-br from-[#4f46e5] via-[#7c3aed] to-[#1e1b4b] border-white/15 p-6 min-h-[220px]` + `radial-gradient ellipse at center rgba(255,255,255,0.15)` + `11px text-white/90` + `px-4 h-7 rounded-full bg-white text-black text-xs`.

### Section 6 — Connect `Where Crypto Founders and Top Talent Connect`
- **Head:** `20px font-semibold` + `10px text-white/35`.
- **2-up:** `max-w-[760px] md:grid-cols-2 gap-4`:
  - `Founders` `rounded-[18px] bg-[#0a0a0f] border-white/[0.08] p-4 pb-0` `h-[180px]` with 6-layer N same as hero + `px-3 h-6 rounded-full bg-white text-black 11px` CTA.
  - `Job Opportunities` `rounded-[18px]` `h-[180px]` with glass person `w-[160px] h-[140px] rounded-[14px] from-white/10 to-white/[0.02] border-white/10` + `w-10 h-10 rounded-full bg-white/20` + bars `w-16 h-2 bg-white/10`.

### Section 7 — Footer `NOVIFY` watermark (now `NULLVOID`)
- **Top:** `flex gap-10 text-[10px] text-white/35` columns.
- **Watermark:** `text-[72→148px] font-black tracking-[-0.06em] leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/[0.07] to-white/[0.02] whitespace-nowrap` select-none pointer-events-none.
- **Bottom:** `10px text-white/25` flex justify-between.

---

## 3) Design System Deep Dive

### Color Palette (Exact from screenshot + CSS extraction)
| Role | Hex | Usage | Tailwind |
|---|---|---|---|
| Page | `#050508` / `#000` | canvas | `bg-[#050508]` `bg-black` |
| Card | `#0a0a0f` | all cards | `bg-[#0a0a0f]` |
| Sub-card | `#11111a` | ecosystem image bg | `bg-[#11111a]` |
| Border | `rgba(255,255,255,0.06–0.15)` | `border-white/[0.06–0.15]` |
| Text primary | `#FFFFFF` | headlines | `text-white` |
| Text secondary | `rgba(255,255,255,0.60)` | nav, badges | `text-white/60` |
| Text muted | `rgba(255,255,255,0.35–0.45)` | desc | `text-white/35` `text-white/45` |
| Text faint | `rgba(255,255,255,0.25)` | footer | `text-white/25` |
| Purple primary | `#7c3aed` / `#8b5cf6` | CTA, glows | `bg-[#7c3aed]` `from-[#8b5cf6]` |
| Purple light | `#a78bfa` / `#c4b5fd` | horizon line, gradient | `via-[#a78bfa]` |
| Blue | `#3b82f6` / `#6366f1` | glow right | `to-[#3b82f6]` |
| Teal | `#34d399` / `#14b8a6` | bar left | part of bar gradient |
| Danger pink | `#ec4899` | bar right | end of bar gradient |
| Amber (preview only) | `#f59e0b` | preview bar | `bg-amber-500` |

**Gradients:**
- Hero glow: `from-[#8b5cf6]/25 via-[#7c3aed]/15 to-transparent blur[40px]`
- Horizon: `from-[#a78bfa]/40 via-[#8b5cf6]/20 to-transparent blur[12px]`
- Bars: `linear-gradient(90deg, rgba(52,211,153,0.9) 0%, rgba(99,102,241,0.85) 45%, rgba(139,92,246,0.85) 75%, rgba(236,72,153,0.7) 100%)`
- Card top: `linear-gradient(135deg, rgba(255,255,255,0.12) → rgba(139,92,246,0.18))`

### Typography
| Role | Size | Weight | Tracking | Leading | Color | Example |
|---|---|---|---|---|---|---|
| Eyebrow badge | 10px | 500 | `0.18em` uppercase | 1 | `white/70` | `THE COLLABORATIVE SYSTEM DESIGN NETWORK` |
| Hero H1 | 32→56px | 800 | `-0.03em` | 0.9 | white / gradient | `The Premier System Workspace` |
| Section H2 | 22→28px | 600 | `-0.02em` | tight | white | `Talent Architecture... Transformational` |
| Stats number | 22px | 300 (light) | tight | 1 | white | `19 min` |
| Stats label | 10px | 400 | - | tight | white/40 | `Average time to first` |
| Card title | 11px | 500 | - | snug | white | `The Ghost AI that scales` |
| Card desc | 10px | 400 | - | relaxed | white/45 | `Gemini 2.0 maps intent...` |
| Nav | 11px | 400 | wide | - | white/60 | `UX Offerings` |
| Footer watermark | 72→148px | 900 | `-0.06em` | 1 | `from-white/[0.07]` | `NULLVOID` |

**Fonts:** Screenshot uses a geometric sans close to **General Sans / Satoshi / Inter** with tight tracking. Current repo uses Geist Sans (`--font-geist-sans`) — close enough, but for 100% we should self-host **Satoshi** or **General Sans** via `next/font/local` or `Inter` via `next/font/google` with `tracking-[-0.03em]`. Fallback is Geist.

### Spacing & Radius
- **Section vertical:** `py-12 md:py-16` (48/64px), `py-10` for tighter.
- **Card radius:** `12px` stats (`rounded-[12px]`), `14px` team (`rounded-[14px]`), `16px` ecosystem (`rounded-[16px]`), `18px` hero stack + founders (`rounded-[18px]`), `9999` pills.
- **Gap:** `3px` bars, `12px` (gap-3) grids, `20px` hero.
- **Border width:** `1px` `border-white/[0.08]`.

### Shadows & Blur
- **Card shadow:** `0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)`
- **Top card:** `0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.15)`
- **Glow blurs:** `blur-[40px]`, `blur-[60px]`, `blur-[32px]` for shadows.
- **Glass:** `backdrop-blur-xl` (16px) + `bg-white/[0.04–0.12]`.

---

## 4) 3D Elements Inventory

| Element | Geometry | Transform | Material | Animation | Reference |
|---|---|---|---|---|---|
| **Hero stacked N** | 7× `280×180` rects + 1 top | `perspective:1200px` `rotateX(14deg) rotateY(-14deg)` `translateZ(6px*index)` | `linear-gradient white/0.08→0.03` + `border-white/15` `backdrop-blur-xl` | `float` on pills `5–6s`, hover `translateZ` increase — could add `framer-motion` drag `rotateY` follow mouse | Screenshot center hero |
| **Earth horizon** | `1600×900` `rounded-[50%]` | `bottom[-520px]` `translateX(-50%)` | `gradient #0a0f1d→#111a2f` + `1px #a78bfa` line + `30px blur` | Static, could add `parallax` on scroll | Screenshot hero bottom curve with city lights |
| **Gradient bars** (8) | `h-14` rects `560→260px` | `perspective:1000px` `rotateX(18deg)` `translateZ(4px*index)` | `linear-gradient 90deg teal→indigo→purple→pink` | Could `stagger` entrance `delay 80ms` | Screenshot middle stacked bars |
| **Founders N** (section 6) | 6× `220×140` rects | `perspective:1000px` `rotateX(12deg) rotateY(-12deg)` | `rgba(255,255,255,0.06→0.01)` | Hover tilt | Bottom founders card |
| **Job person glass** | `160×140` `rounded-[14px]` | `rotateX(12deg)` | `from-white/10 to-white/0.02` + `w-10 rounded-full` | Static | Bottom right card |
| **Floating pills** | `36×36` circles | `translateZ` | `gradient` | `float 6s ease-in-out infinite` `delay 120ms` | Hero above CTA |

**Implementation options:**
- **Pure CSS 3D** (current): `perspective` + `transform-style: preserve-3d` — zero JS, fast, exact.
- **R3F alternative:** Could use `@react-three/fiber` with `<Canvas>` + `<RoundedBox>` + `ContactShadows` for more realistic depth/ env map, but CSS is sufficient for clone and lighter.
- **Motion:** `framer-motion` `whileHover: { rotateY: 5, rotateX: -5 }` `transition: { type: "spring", stiffness: 120 }` + `useScroll` `useTransform` for parallax on earth/bars.

---

## 5) Graphics & SVG Assets Inventory

| Asset | Type | Current | Needed for Exact |
|---|---|---|---|
| `∅` N logo | Text `N` @ `84px font-black` | We use text | Extract SVG logo from source HTML or `Nullvoid.pdf` (likely vector). Need to export as `public/logo.svg` with `fill="white"` and `drop-shadow`. |
| Pill icons `◈ ⬡ ⬢ ⬣` | Unicode placeholders | We use Unicode | Source likely has inline SVG icons (Lucide or custom). Need to extract SVG paths from HTML (`<svg>`) and create `components/icons/` set. |
| Trust bar logos | Text + `●` `⬢` | We use text | Screenshot shows `CIRCUIT`, `Alvora`, etc — need SVG logos from source `assets/` folder; replace with NullVoid stack: Vercel, Liveblocks, Neon, Trigger.dev, Gemini, Prisma as SVG. |
| Ecosystem photos | `picsum.photos` placeholders | We use picsum | Source likely has `assets/event*.jpg` — need to extract and place in `public/ecosystem/` with `next/image` + `priority`. |
| Earth city lights | CSS gradient line | We use CSS | Source may have `svg` horizon or `canvas` — we can keep CSS or export as `public/earth-horizon.svg` with `filter: blur`. |
| Stars field | CSS `radial-gradient` dots | We use CSS | Could be `svg` pattern; keep CSS for performance. |
| Founder/job illustrations | CSS glass | We use CSS | Source may have `glb` or `png`; we can keep CSS or use `public/illustrations/founders.png`. |

**SVG extraction plan:** After HTML upload, run `node scripts/extract-assets.mjs` to parse with `cheerio`, list all `<svg>`, `<img src>`, `background-image`, `url(...)`, and dump to `source/assets/` for conversion to React components.

---

## 6) Fonts Deep Dive

- **Screenshot font:** Appears as **Satoshi / General Sans** (Pangram) — geometric, tight, `font-weight 800` for H1, `500` for labels. Letterforms: `R` with straight leg, `a` double-story.
- **Current repo:** Geist Sans (`next/font/google` `Geist`) — similar but slightly wider. For exact, we should add:
  ```ts
  import { Satoshi } from "./fonts/Satoshi" // local
  // or
  import { Space_Grotesk, JetBrains_Mono } from "next/font/google"
  // Recommended for Novify exact: Space Grotesk (700) + Inter (400) + Satoshi local
  ```
- **Sizes:** See typography table. Need `text-[10px]` `tracking-[0.18em]` for eyebrows — already exact.
- **Fallback:** Keep Geist as fallback to avoid FOUT.

---

## 7) Styles & Tailwind Mapping

**UX Pilot export typical structure:**
```html
<script src="https://cdn.tailwindcss.com"></script>
<style>
  /* custom: @import url('https://fonts.googleapis.com/css2?family=Inter...') */
  /* .glass { backdrop-filter: blur(16px); } */
</style>
<body class="bg-black text-white">
  <section class="relative overflow-hidden bg-[#050508]">
```
**Our Tailwind v4 mapping:** Already supports arbitrary `bg-[#050508]`, `rounded-[12px]`, `blur-[40px]`, `tracking-[-0.03em]`, `perspective`. Need to ensure `tailwind.config.ts` doesn't purge `bg-[#...]` — v4 JIT covers it. For exact, we will copy the source `<style>` block into `app/globals.css` as `@layer components` and map to our tokens.

**Key utilities to preserve:**
- `backdrop-blur-xl` `bg-white/[0.04]` glass
- `border-white/[0.06]` hairlines
- `shadow-[0_12px_40px_rgba(0,0,0,0.5)]`
- `bg-gradient-to-br from-[#8b5cf6]/20 to-[#3b82f6]/20 blur-[40px]`
- `animate-float` (already in `globals.css` `6s ease-in-out`)

---

## 8) Assets & Images

| Asset | Screenshot | Source HTML likely | Action |
|---|---|---|---|
| Hero earth | Dark curve with purple line + city lights | `css gradient` or `<img src="assets/earth.png">` | Extract or keep CSS; optimize as `public/earth.webp` 1600×900 |
| Pills icons | 5 circles with symbols | Inline `<svg width="14" height="14">` | Convert to `components/icons/PillIcon.tsx` |
| Trust logos | 6 small logos | `<img src="assets/logo*.svg">` | Replace with stack logos, inline SVG |
| Ecosystem | 2 photos + 1 gradient card | `<img src="https://picsum...">` or `assets/event*.jpg` | Download to `public/ecosystem/` and use `next/image` |
| Footer watermark | `NOVIFY` large | Text `font-black` | Change to `NULLVOID` same style |

**Optimization:** Use `next/image` with `priority` for hero, `loading="lazy"` elsewhere, `sizes="(max-width: 768px) 100vw, 50vw"`.

---

## 9) Animations & Motion

| Motion | Duration | Easing | Trigger | Library |
|---|---|---|---|---|
| Pills float | `5–6s` | `ease-in-out` | `infinite` | CSS `keyframes float {0%,100% y=0; 50% y=-10px}` already in `globals.css` |
| Glow pulse | `3s` | `ease-in-out` | infinite | `animate-glow-pulse` |
| Gradient shift | `8s` | `ease` | infinite | `animate-gradient-shift` `background-size 200%` |
| Card hover tilt | `0.5s` | `cubic-bezier(0.16,1,0.3,1)` | hover | CSS `.card-3d:hover .card-3d-inner { rotateX(2deg) rotateY(-2deg) translateZ(10px) }` or `framer-motion` `whileHover` |
| Stagger bars entrance | `80ms` per bar | `spring` | `whileInView` | `framer-motion` `staggerChildren 0.08` |
| Earth parallax | `scrollY` → `y: -20%` | `linear` | scroll | `framer-motion useScroll + useTransform` or `gsap ScrollTrigger` |
| Stars twinkle | `2s` | `ease` | infinite | CSS `opacity 0.4→0.8` |

**For exact:** Use `framer-motion` (already debated) + `lenis` for smooth scroll (optional).

---

## 10) Responsive & Layout

- **Breakpoints:** `sm:640` `md:768` `lg:1024` `xl:1280`. Screenshot shows mobile single column: hero pills `hidden md:flex` → 3 pills, trust bar wraps, stats `col-span-6` → full, team `sm:2`, ecosystem `md:3→1`.
- **Container:** `max-w-[1280px] mx-auto px-6 md:px-10`.
- **Hero height:** `pt-[92px] pb-6` + `h-[240→280px]` for 3D card.
- **Accessibility:** `text-[10px]` labels need `contrast` check — white/40 on black passes for decorative, but ensure `text-white/60` for interactive.

---

## 11) Tech Stack — Installed vs Needed

| Need | Installed (package.json) | Version | Missing? | Install Command |
|---|---|---|---|---|
| **Three / R3F** | `three`, `@react-three/fiber`, `@react-three/drei` | `0.185.1`, `9.6.1`, `10.7.7` | ✅ | — |
| **Glass/3D CSS** | Tailwind v4, `tw-animate-css` | `^4` | ✅ | — |
| **Lucide icons** | `lucide-react` | `^1.11.0` | ✅ (need Satoshi icons) | — |
| **Framer Motion** | Not installed | — | **Needed for exact motion** | `npm i framer-motion` |
| **GSAP + ScrollTrigger** | Not installed | — | Optional for parallax (alt to framer) | `npm i gsap` |
| **Lenis smooth scroll** | Not installed | — | Optional for Novify smoothness | `npm i lenis` |
| **Cheerio (HTML parse)** | Not installed | — | Needed to extract source HTML | `npm i -D cheerio` |
| **Sharp (image opt)** | Not installed | — | For `picsum` → `public` | `npm i -D sharp` |
| **Fonts** | Geist via `next/font/google` | — | Need Satoshi local | Add `public/fonts/Satoshi-*.woff2` + `next/font/local` |

**Current `npm ls` check:** `npm list three framer-motion` shows `framer-motion` missing — will install in Phase 0.

---

## 12) Installation Requirements

```bash
# For exact Novify clone (run once before coding)
npm install framer-motion lenis
npm install -D cheerio sharp

# If GSAP desired
npm install gsap

# Fonts: download Satoshi from fontshare.com → place in public/fonts/
# Then in app/layout.tsx:
import localFont from "next/font/local"
const satoshi = localFont({ src: "../public/fonts/Satoshi-Variable.woff2", variable: "--font-satoshi" })

# Verify
npm run dev  # should still use allowedDevOrigins ["*.e2b.app"]
npx tsc --noEmit --skipLibCheck
```

**Also need to handle sandbox limits:** `lib/generated/prisma` mock + `.env` dummy already present for dev without DB — keep.

---

## 13) Execution Plan — Phases (No Coding Yet, As Requested)

### Phase 0 — Source Ingestion (0.5 day)
1. **Re-upload** `UX Pilot ...html` + `Nullvoid.pdf` to `/home/user/nullvoid.AI/source/` (ask user to drag into chat again, choose “Save to workspace”).
2. Run `node scripts/parse-source.mjs` (to be created):
   - `cheerio.load(html)` → extract `<head>` fonts, `<style>`, Tailwind CDN config, all `<section>` trees, `<svg>` count, `<img src>`, `background-image`.
   - Output `docs/source-inventory.json` with: sections list, color hexes, font families, SVG asset list, image list, animation keyframes.
3. Convert PDF with `pdfjs` or manual read to extract brand guidelines if any.

### Phase 1 — Design Tokens Freeze (0.5 day)
- Create `context/ui-novify-tokens.md` mapping screenshot tokens to Tailwind:
  - `--novify-bg: #050508`, `--novify-card: #0a0a0f`, `--novify-border: rgba(255,255,255,0.08)`, `--novify-purple: #8b5cf6` etc.
  - Update `app/globals.css` with `@theme` overrides for landing scope `.novify-landing { --background: #050508; }`
  - Lock typography scale table (see §3).

### Phase 2 — Asset Extraction & Optimization (1 day)
- Dump all `<svg>` inline to `components/icons/novify/` as React components (SVGR).
- Download `<img>` to `public/novify/` and optimize with `sharp` to `webp` + `avif` + `placeholder: blur`.
- Export hero earth as `public/novify/earth-horizon.svg` if vector, else keep CSS.
- Host Satoshi font locally, add `next/font/local`.

### Phase 3 — Scaffold Landing Shell (1 day)
- Create `app/(marketing)/page.tsx` (or keep `app/page.tsx`) with `NovifyLanding` server component, no `ClientProviders` (already fixed for SSR).
- Build section components **1:1** from source HTML structure:
  - `NovifyHero`, `NovifyIntroBars`, `NovifyStats`, `NovifyQuote`, `NovifyTeamGrid`, `NovifyEcosystem`, `NovifyConnect`, `NovifyFooter`.
- Each file preserves original class names + `id` for scroll.

### Phase 4 — 3D & Motion Exact (1.5 days)
- **CSS 3D first:** `perspective` + `preserve-3d` for hero N, bars, founders. Verify against screenshot pixel diff (e.g., `npx playwright test --update-snapshots`).
- **Framer motion:** Add `motion.div` with `initial/animate/whileHover/whileInView` + `staggerChildren 0.08` for bars, `useScroll` for earth parallax `y: [0, -40]`.
- **Lenis:** Wrap landing in `<ReactLenis root>` for smooth scroll (optional, matches Novify feel).
- **Test:** `npm run dev` + preview `https://3000-...e2b.app` — hard refresh, check no `BailoutToCSR`.

### Phase 5 — Polish & Parity Check (1 day)
- **Pixel diff:** `npx playwright test` screenshot compare vs original Novify screenshot (mask dynamic). Target < 2% diff.
- **A11y:** Check `contrast` for `10px` labels, add `aria-label` for pills.
- **Perf:** Lighthouse > 90, `next/image` priority, `loading="lazy"`, `fetchPriority`.
- **Cross-browser:** Test Chrome, Safari (WebGPU fallback).

### Phase 6 — Handover
- Document in `README.md` “Landing clone from UX Pilot source”.
- Push to `arena/...` branch, open PR.

---

## 14) What I Need From You Next

1. **Re-upload** the two files **inside the repo** (drag & drop and select “Add to workspace” or paste HTML text). I’ll place them at `source/`.
2. Confirm: Should landing keep **NullVoid** branding (as I did: `NULLVOID` watermark, `N` logo) or **Novify** verbatim?
3. Confirm motion library preference: **Framer Motion** (recommended) vs **GSAP** vs **CSS-only** (lightest).
4. Confirm if you want **Lenis** smooth scroll (Novify uses it).

Once files are re-uploaded, I’ll run the parse script and start Phase 0 immediately — no further questions.

---

## 15) Quick Verification Already Done

- ✅ Live preview fixed: `allowedDevOrigins` + SSR landing now shows `h1` in HTML shell (curl verified `Premier` + `Driving Growth` + `NULLVOID` present, `Bail out` gone, `_next` 200 for preview host).
- ✅ Dashboard still serves mock projects (`curl /dashboard` shows `Demo`).
- ✅ Current clone is **visually close** (see `components/landing/NovifyLanding.tsx` 462 lines) but needs source HTML for 100% pixel parity.

Awaiting your re-upload to proceed to code phase.
