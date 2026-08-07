# MINUTE-FEATURE EXACT CLONE — Novify Landing for NullVoid AI

> **Goal:** 1:1 pixel replica (≤1.5% diff) of screenshot + `UX Pilot …html` source, every minute feature.  
> **No code yet** — deep analyse + install + minute plan. Previous doc `NOVIFY_EXACT_CLONE_DEEP_ANALYSIS.md` is high-level; this is **minute-level**.

---

## 0) Source Access & Ground Truth

| Source | Expect | Status | Minute Action |
|---|---|---|---|
| `UX Pilot - Superfast UX_UI Design with AI.html` | Self-contained Tailwind CDN + `<style>` + `assets/` | **Not found** in sandbox (`/home/user/uploads` outside root) | **Re-upload to `source/Novify.source.html`** inside repo; then `cheerio` parse to extract exact `class=""` strings, `hex` values, `svg` `d=""` paths, `font-family` |
| `Nullvoid.pdf` | Brand guide | **Not found** | Re-upload to `source/Nullvoid.pdf`; extract `logo.svg` vector, `N` construction, brand `hex` |
| `image.png` screenshot | 1 vertical page | **Visible** | Used for **pixel ruler** measurements below (all numbers from direct screenshot ruler @ 1×, cross-checked with UX Pilot typical 1280 container) |

**Until re-upload:** This doc is **screenshot-ruler ground truth**. After re-upload, run `node scripts/extract-novify.mjs` to diff screenshot-vs-HTML and patch any delta (e.g., if HTML uses `bg-[#0b0b12]` not `#0a0a0f`, we adopt HTML hex).

---

## 1) Global Minute Tokens (applied to every section)

| Token | Value | Where | Tailwind | Note |
|---|---|---|---|---|
| **Page bg** | `#050508` hero / `#000` rest | `body` | `bg-[#050508]` `bg-black` | Hero is slightly lifted (`#050508` vs `#000`) for depth |
| **Card bg** | `#0a0a0f` | All cards | `bg-[#0a0a0f]` | `border-white/[0.08]` hairline |
| **Sub-card** | `#11111a` | Ecosystem photo bg | `bg-[#11111a]` | |
| **Border hairline** | `1px rgba(255,255,255,0.08)` | Cards | `border border-white/[0.08]` | Hover → `0.15` |
| **Border strong** | `1px rgba(255,255,255,0.15–0.20)` | Hero top card, pills | `border-white/15` `border-white/20` |
| **Text white** | `#fff` | H1, numbers | `text-white` | |
| **Text white 60** | `rgba(255,255,255,0.60)` | Nav | `text-white/60` | Hover → `100` |
| **Text white 45** | `rgba(255,255,255,0.45)` | Desc | `text-white/45` | |
| **Text white 35** | `0.35` | Labels, trust | `text-white/35` | |
| **Text white 25** | `0.25` | Footer | `text-white/25` | |
| **Purple** | `#8b5cf6` / `#7c3aed` | CTA, glows, dot | `bg-[#7c3aed]` `from-[#8b5cf6]` | CTA `hover:bg-[#6d28d9]` |
| **Purple light** | `#a78bfa` / `#c4b5fd` | Horizon line, H1 gradient | `via-[#a78bfa]` | |
| **Blue** | `#3b82f6` / `#6366f1` | Glow right | `to-[#3b82f6]` | |
| **Teal** | `#34d399` | Bar left | `from-[#34d399]/0.9` | Gradient bar |
| **Pink** | `#ec4899` | Bar right | `to-[#ec4899]/0.7` | |
| **Amber preview** | `#f59e0b` | Preview bar only | `bg-amber-500` | Not part of clone; keep separate |
| **Radius** | `6px` logo, `12px` stats, `14px` hero/team, `16px` ecosystem, `18px` founders, `9999` pills | Per card | `rounded-[12px]` etc | See per-section |
| **Blur** | `blur-[40px]` glow, `blur-[12px]` horizon, `blur-[32px]` shadow, `backdrop-blur-xl` glass (16px) | Glows/glass | `blur-[40px]` `backdrop-blur-xl` | |
| **Shadow card** | `0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)` | All layers | `shadow-[0_12px_40px_rgba(0,0,0,0.5)]` | Top: `0 20px 60px rgba(0,0,0,0.6)` |
| **Container** | `1280px` | All | `max-w-[1280px] mx-auto px-6 md:px-10` | Hero inner `860` for stats |
| **Grid gaps** | `12px` (gap-3) | All grids | `gap-3` | Bars `gap-[3px]` |
| **Section PY** | `48px` mobile `64px` desktop hero/intro, `40px` stats/ecosystem, `48px` connect | Sections | `py-12 md:py-16` etc | |

---

## 2) Minute Typography (every text node)

| Node | Content Example | Size | Weight | Tracking | Leading | Color | Transform |
|---|---|---|---|---|---|---|---|
| **Nav logo** | `NullVoid` | 11px | 600 | `0.18em` uppercase | 1 | white | `uppercase` |
| **Nav links** | `UX Offerings` | 11px | 400 | `wide` | - | `white/60` → hover white | - |
| **Nav CTA** | `Start Designing →` | 12px | 600 | wide | - | black on white | - |
| **Eyebrow** | `The Collaborative System Design Network` | 10px | 500 | `0.18em` uppercase | 1 | `white/70` | uppercase |
| **Hero H1 line1** | `The Premier System Workspace` | 32→56px | 800 | `-0.03em` | 0.9 | white | - |
| **Hero H1 gradient** | `for Engineering Innovation.` | same | 800 | -0.03em | 0.9 | `from-white via-[#c4b5fd] to-white` clip | - |
| **Pill dot** | `●` | 11px inside 36px circle | - | - | - | - | - |
| **CTA left** | `Start Designing` | 12px | 600 | wide | - | white | + `w-2 h-2 bg-white/80` dot |
| **CTA right** | `View Demo →` | 12px | 600 | - | - | black | + `w-4 h-4 bg-black→` |
| **Trust** | `VERCEL` | 10px | 400 | `0.14em` uppercase | - | `white/35` | uppercase |
| **H2 intro** | `Talent Architecture … Transformational` | 22→28px | 600 | tight | tight | white | - |
| **Intro p** | `Every node is crafted…` | 11px | 400 | - | relaxed | `white/45` | max-w 560 |
| **Stats number** | `19 min` | 22px | 300 light | tight | 1 | white | - |
| **Stats label** | `Average time to first` | 10px | 400 | - | tight | `white/40` | - |
| **Stats large label** | `Live canvas ↗` | 10px | 400 | - | - | `white/60` | + `w-3 h-3 bg-white→` |
| **Quote** | `“From initial prompt…` | 13px | 400 | - | relaxed | `white/90` | `“` 20px `white/30` |
| **Quote author** | `Engineering Lead, NullVoid` | 10px | 400 | - | - | `white/40` | + `w-6 h-6 bg-white/10` |
| **Team head** | `We're Architecting…` | 20→24px | 600 | tight | tight | white | max-w 520 |
| **Team badge** | `Spec-driven…` | 10px | 400 | wide | - | `white/60` | + `w-1.5 h-1.5 bg-[#8b5cf6]` dot |
| **Team card title** | `The Ghost AI…` | 11px | 500 | - | snug | white | min-h 36 clamps |
| **Team card desc** | `Gemini 2.0…` | 10px | 400 | - | relaxed | `white/45` | line-clamp-3 |
| **Team footer badge** | `Ghost AI` | 10px | 400 | - | - | `white/30` | + `w-6 h-6 bg-white/06` `◈` |
| **Ecosystem head** | `Embedded in the Ecosystem` | 14px | 600 | tight | - | white | - |
| **Ecosystem card title** | `Dubai Ecosystem Mixer — Feb 2025` | 11px | 500 | - | tight | white | - |
| **Ecosystem card sub** | `Where founders…` | 10px | 400 | - | - | `white/50` | - |
| **Connect head** | `Where Founders…` | 20px | 600 | tight | - | white | - |
| **Connect sub** | `Two workspaces, one canvas` | 10px | 400 | - | - | `white/35` | - |
| **Connect card head** | `Founders` | 11px | 500 | - | - | white | + pill `h-6` |
| **Footer watermark** | `NULLVOID` | 72→148px | 900 | `-0.06em` | 1 | `from-white/[0.07] to-white/[0.02]` clip | `select-none pointer-events-none whitespace-nowrap` |
| **Footer col** | `System Design Workspace` | 10px | 400 | - | relaxed | `white/35` | - |
| **Footer bottom** | `© 2026 NullVoid AI` | 10px | 400 | - | - | `white/25` | - |

**Font stack for exact:** `Satoshi Variable` (Pangram) or `General Sans` → `Space Grotesk` fallback → `Geist Sans` current. Need `woff2` self-host via `next/font/local` with `variable: --font-satoshi` and `tracking-[-0.03em]`. Inter for `10px` labels is okay.

---

## 3) Minute Layout — Every Section with Measurements

### 3.1 Hero
```
nav: h-[56px] flex justify-between px-6 md:px-10 max-w-[1280px] mx-auto
  left: gap-2 (logo 24px + text 11px)
  center: gap-6 (6 links 11px)
  right: px-4 h-7 rounded-full gap-2
hero section: relative bg-[#050508] overflow-hidden
  stars: absolute inset-0 radial 0.8px dots 22px grid opacity 0.35 + purple/blue radial at top
  purple arc: top[-40px] w900 h280 from #8b5cf6/25 blur40 rounded50
  earth: left-1/2 -translate-x-1/2 bottom[-520px] w1600 h900 rounded50 border white/10 overflow-hidden
    inner: from #0a0f1d via #111a2f to #0a0a0f
    line: top 0 h1px via #a78bfa opacity80
    blur: top -2px h30px from #a78bfa/40 blur12px
    glow: -top120 w900 h300 from #8b5cf6/30 blur60 rounded-full
  content: max-w1280 mx-auto px6/10 pt92 pb24 flex-col items-center text-center
    eyebrow: px12 py4 rounded-full border white/10 bg white/04 backdrop-blur 10px tracking 0.18em
    h1: 32→56 800 -0.03em 0.9 max-w820
    pills: mt28 flex gap12 hidden md:flex gap8 (5× w36 h36 rounded-full border white/20 shadow black/40 float 5–6s delay 120ms)
      mobile: flex gap8 (3× w32 h32)
    cta: mt24 flex gap12 (left px24 h36 rounded-full bg #7c3aed shadow 0 0 24px rgba, right bg white)
    3d stack: mt40/48 w560 h240/280 flex-center
      shadow: bottom8 left-1/2 -translate-x-1/2 w420 h80 bg black/60 blur32 rounded-full
      container: w280 h180 [perspective:1200] [preserve-3d]
        7 layers: absolute inset0 rounded18 border white/15 backdrop-blur-xl bg linear white 0.08→0.03 transform translateZ 6*index translateX 2*index translateY -1.5*index rotateX14 rotateY-14 shadow 12px 40px
        top: translateZ48 translateX14 translateY-10 rotateX14 rotateY-14 bg linear 135deg white0.12→purple0.18 backdrop-blur16 shadow 20px 60px border white/20
          N: 84px font-black -0.08em white drop-shadow 0 4px 24px rgba
          highlight: top0 inset-x0 h1px via white/20 + top3 left3 w64 h64 rounded-full from white/15 blur12
      glow behind: left-1/2 top-1/2 -translate -50% w360 h200 from #8b5cf6/20 blur40 -z10
    trust: mt8 w-full border-t white/06 pt16 flex wrap justify-center gap20/32 text 10px 0.14em uppercase white/35 icons 12px
```

### 3.2 Intro + Bars
```
section: bg-black border-t white/06 py48/64
  inner: max-w1280 px6/10 flex-col items-center text-center
    h2: 22→28 600 tight max-w560
    p: mt12 11px relaxed white/45 max-w560
    bars: mt40 w720 h180 perspective1000 flex-col gap3px
      8 bars: h14 rounded4 border white/10 width 560-18*index (min260) bg linear 90deg teal0.9→pink0.7 transform translateZ 4*index rotateX18 shadow 2+index px
      overlay: absolute inset0 from transparent to black/40 pointer-events-none
```

### 3.3 Stats + Quote
```
section: bg-black py40/48 max-w1280 px6/10
  head: flex-col items-center text-center mb32
    h3: 16→18 600 tight white
    p: mt4 10px white/35
  grid: grid-cols-12 gap12 max-w860 mx-auto
    19min: col-span6 md3 rounded12 bg #0a0a0f border white/08 p16 min-h96 flex-col gap24
      number: 22px 300 white + label 10px white/40
    48hrs: same
    10k+: col-span12 md6 row-span2 rounded12 overflow-hidden flex min-h204
      left: flex-1 p16 flex-col number 22px + label 10px mt24 + cta mt-auto gap4 10px white/60 + w12 h12 bg white→
      right: w54% gradient from #1e1b4b via #312e81 to #1e3a8a + radial dots 14px + pills 32px column gap8 top24 right24 + glass N 80x80 rounded14 from white/15 to white/05 border white/15
    5:1: col-span6 md3 same as 19
    98%: col-span6 md3 same
  cta+quote: max-w860 mt24 flex-col items-center gap20
    pill: px20 h32 rounded-full bg white text black 12px 600
    quote: max-w640 text-center 13px white/90 relaxed + “ 20px white/30 + author mt12 flex justify-center gap8 10px white/40 + w24 h24 bg white/10 border white/10
```

### 3.4 Team Grid
```
section: bg #050508 py48 border-t white/06 max-w1280 px6/10
  head: flex-col items-center text-center mb32
    h3: 20→24 600 tight max-w520
    badge: mt12 px12 h24 rounded-full bg white/06 border white/10 10px + dot 6px #8b5cf6
  grid: sm2 lg4 gap12
    8 cards: rounded14 bg #0a0a0f border white/08 p16 min-h160 hover border white/15
      title: 11px 500 min-h36
      desc: mt8 10px white/45 line-clamp-3
      footer: mt-auto pt12 flex items-center gap8
        icon: w24 h24 rounded-full bg white/06 border white/10 10px white/60
        badge: 10px white/30
        arrow: ml-auto w24 h24 rounded-full bg white→ 10px
  more: mt24 flex justify-center
    button: 11px white/40 border white/10 rounded-full px16 h28 bg white/03
```

### 3.5 Ecosystem
```
section: bg black py40 border-t white/06 max-w1280 px6/10
  head: text-center 14px 600 tight white mb24
  grid: md3 gap12 max-w900 mx-auto
    side: rounded16 bg #0a0a0f border white/08 h220 bg #11111a relative group
      img: picsum 600x400 object-cover opacity60 hover80 + gradient from transparent to black/60
      bottom: absolute bottom12 left12 right12 11px white + 10px white/50
    center: rounded16 from #4f46e5 via #7c3aed to #1e1b4b border white/15 p24 min-h220 relative flex-col justify-center text-center
      radial: ellipse at center rgba(255,255,255,0.15) transparent70
      text: 11px white/90 + button mt16 px16 h28 rounded-full bg white text black 12px
```

### 3.6 Connect
```
section: bg black py48 border-t white/06 max-w1280 px6/10
  head: text-center mb24
    h3: 20px 600 tight white
    p: 10px white/35 mt4
  grid: md2 gap16 max-w760 mx-auto
    founders: rounded18 bg #0a0a0f border white/08 p16 pb0 h180 overflow-hidden hover border white/15
      header: flex justify-between 11px white + pill px12 h24 bg white text black 11px
      3d: mt16 h180 flex-end justify-center
        glow: bottom0 left-1/2 -translate-x-1/2 w240 h120 from #8b5cf6/20 blur20 rounded-full
        container: w220 h140 perspective1000
          6 layers: absolute inset0 rounded14 border white/10 bg rgba(255,255,255,0.06→0.01) transform translateZ 5*index translateY -2*index rotateX12 rotateY-12 backdrop-blur10
          top: translateZ30 rotateX12 rotateY-12 from white/10 to white/03 border white/15 N 36px font-black white
    jobs: same but header 11px + 10px white/30 140+ Openings, glass person 160x140 from white/10 to white/02 border white/10 + w40 h40 bg white/20 + bars 64x8 bg white/10
```

### 3.7 Footer
```
footer: bg black border-t white/06 pt40 pb24 overflow-hidden max-w1280 px6/10
  top: flex-col md:flex-row justify-between gap24 text 10px white/35 flex gap40 columns
    col title: white/60 500 mb8
  watermark: mt40 relative select-none pointer-events-none
    text: 72→148px font-black -0.06em leading-none text-transparent bg-clip-text from white/07 to white/02 whitespace-nowrap overflow-hidden
  bottom: mt8 flex-col md:flex-row justify-between gap8 10px white/25 links hover white/50
```

---

## 4) 3D Elements — Minute Physics

| Element | Count | Size | Perspective | Rotate | TranslateZ | Blur | Light |
|---|---|---|---|---|---|---|---|
| **Hero N** | 8 (7+top) | 280×180 | 1200px | X14 Y-14 | 6*index, top 48 | 16px backdrop | Top highlight 1px white/20, 64px white/15 blur12, drop-shadow 4px 24px purple/50 |
| **Earth** | 1 | 1600×900 | - | - | - | 12px line, 60px glow | Line 1px via #a78bfa, glow 30px via #8b5cf6/40 |
| **Bars** | 8 | 14px h, 560→260 w | 1000px | X18 | 4*index | - | Gradient + shadow 12+2*index |
| **Founders** | 7 (6+top) | 220×140 | 1000px | X12 Y-12 | 5*index | 10px | Top N 36px |
| **Person** | 2 | 160×140 + 180×120 behind | 1000px | X12 Y-8 | - | 10px | Avatar 40px white/20 |

**Performance:** CSS `transform: translateZ` is GPU composited, `will-change: transform` on hover, `backface-visibility: hidden`. No JS for initial, JS for `mousemove` tilt (optional): `onMouseMove e => { rotateY = (x - 0.5)*8; rotateX = (y - 0.5)*-8 }` with `framer-motion` `spring: { stiffness: 120, damping: 20 }`.

---

## 5) SVG & Graphics — Minute Paths

**Hero pills:** Expect inline `<svg viewBox="0 0 16 16"><path d="M8 2L14 8L8 14L2 8Z" fill="white" /></svg>` for `◈`. Need to extract exact `d=""` from source HTML; fallback Unicode is placeholder.

**Trust logos:** Likely `<img src="assets/circuit.svg" class="h-4 opacity-40">` with `filter: brightness(0) invert(1) opacity(0.35)`.

**Ecosystem photos:** `picsum` 600×400 `object-cover` `rounded-[16px]` — replace with `next/image` `priority={false}` `placeholder="blur"` `blurDataURL`.

**Earth:** Could be `<svg><ellipse cx="800" cy="450" rx="800" ry="450" fill="url(#grad)" stroke="rgba(255,255,255,0.1)"/></svg>` with `grad` `linearGradient` from `#0a0f1d` to `#1e3a8a`.

**Extraction:** `cheerio('svg').each((i,el)=> fs.writeFileSync(`public/novify/svg-${i}.svg`, $.html(el)))`

---

## 6) Styles — Minute Tailwind & CSS

**Glass:** `background: rgba(255,255,255,0.04); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);` (from `globals.css` `.glass-panel`).

**Hover glass:** `border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.06);`.

**Gradients:** All use `bg-gradient-to-br` / `to-r` with precise stops; ensure `background-size: 200%` for `animate-gradient-shift`.

**Keyframes (already in globals.css):**
```css
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
.animate-float{animation:float 6s ease-in-out infinite}
@keyframes glow-pulse {0%,100%{opacity:0.4}50%{opacity:0.8}}
@keyframes gradient-shift {0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
```

**Need to add for bars stagger:**
```css
@keyframes bar-in {from{opacity:0; transform:translateY(12px) rotateX(18deg)} to{opacity:1; transform:translateY(0) rotateX(18deg)}}
```

---

## 7) Responsive — Minute Breakpoints

| Component | Mobile (<768) | Tablet (768) | Desktop (1024) | Large (1280) |
|---|---|---|---|---|
| **Nav** | 3 pills, hamburger, h-7 pill | 5 pills, 6 links | 5 pills, 6 links | - |
| **Hero h1** | 32px | 48px | 56px | - |
| **Hero 3D** | w280 h240 | w280 h280 | w280 h280 | - |
| **Bars** | w260 min | w560 | w560 | - |
| **Stats grid** | 2-col (6) stacked, 10k+ full width | same | 4-col (3,3,6,3,3) | - |
| **Team** | 1-col | 2-col | 4-col | - |
| **Ecosystem** | 1-col stack | 1-col | 3-col | - |
| **Connect** | 1-col stack | 1-col | 2-col | - |
| **Footer watermark** | 72px | 120px | 148px | - |

**Hidden classes:** `hidden md:flex`, `hidden sm:inline`, `md:hidden`.

---

## 8) Minute Feature Checklist (every UI node)

**Hero:** [ ] stars dots 22px grid 0.35 [ ] purple arc 900×280 blur40 [ ] eyebrow pill 10px 0.18em [ ] H1 32→56 800 -0.03em [ ] gradient via #c4b5fd [ ] 5 pills 36px float 5s delay 120ms [ ] CTA left #7c3aed shadow 24px [ ] CTA right white [ ] 7 layers 280×180 + top N84px [ ] earth 1600×900 bottom -520 [ ] city line 1px via #a78bfa [ ] blur 30px [ ] glow 900×300 blur60 [ ] trust 10px 0.14em 6 logos

**Intro:** [ ] H2 22→28 600 [ ] p 11px white/45 [ ] 8 bars h14 w560→260 gradient teal→pink rotateX18 translateZ

**Stats:** [ ] head 16→18 [ ] 19min card 12px #0a0a0f p16 min-h96 22px 300 [ ] 48hrs same [ ] 10k+ large 12px flex 204h left p16 + right gradient + dots 14px + 3 pills 32px + glass N 80 [ ] 5:1 [ ] 98% [ ] CTA pill h32 [ ] quote 13px + 24px avatar

**Team:** [ ] head 20→24 + badge dot #8b5cf6 [ ] 8 cards 14px 160h 11px/10px + footer 24px→ [ ] Show more pill h28

**Ecosystem:** [ ] head 14px [ ] 3 cards 16px h220 picsum opacity60 hover80 [ ] center gradient #4f46e5→#1e1b4b p24 + radial white/15 + button h28

**Connect:** [ ] head 20px + p 10px [ ] founders 18px 6 layers 220×140 + top N36 [ ] jobs 18px glass person 160×140 + avatar 40px

**Footer:** [ ] top flex gap40 10px [ ] watermark 72→148 900 -0.06em from white/07 [ ] bottom 10px white/25

**Count:** 7+8+5+6+8+3+2 = 39 distinct glass cards + 5 pills + earth.

---

## 9) Installation — Already Done + Next

**Installed (verified `npm list`):**
- `three@0.185.1`, `@react-three/fiber@9.6.1`, `@react-three/drei@10.7.7` ✅
- `framer-motion` (just installed) ✅
- `lenis` ✅
- `cheerio` + `sharp` (dev) ✅

**Still to install for exact (when coding):**
```bash
npm install gsap @gsap/react  # if we choose GSAP over framer for ScrollTrigger parallax
npm install @fontsource/satoshi # or host woff2 locally
```

**No extra 3D needed** — CSS 3D is exact and lighter than R3F for this landing. Keep R3F for dashboard only.

---

## 10) Minute Execution Plan (No Code Yet, Time-Boxed)

### Day 0.5 — Source Lock (after you re-upload)
- 09:00–10:00 `mkdir source && mv ~/uploads/* source/`
- 10:00–11:30 `node scripts/extract-novify.mjs` → `source/inventory.json` (sections, hexes, svgs, imgs, fonts, keyframes)
- 11:30–12:00 Diff screenshot vs HTML: `pixelmatch` screenshot vs `npx vite` HTML render, note deltas (e.g., if HTML bg is `#0b0b12` not `#0a0a0f`, adopt HTML)

### Day 1.0 — Tokens & Fonts Freeze
- 13:00–15:00 Create `context/ui-novify-tokens.md` + `app/globals.css` `.novify` scope with exact hex/radius/shadow/blur tokens
- 15:00–17:00 Host Satoshi `public/fonts/Satoshi-Variable.woff2` + `next/font/local` integration, keep Geist fallback, verify `tracking -0.03em` renders identical via `font-variation-settings`

### Day 1.5 — Assets
- 09:00–12:00 SVGR all `<svg>` → `components/icons/novify/*.tsx`, download `<img>` → `public/novify/` + `sharp` webp/avif + `blurDataURL`
- 13:00–15:00 Optimize earth: if SVG keep vector, else export `earth-horizon.webp` 1600×900 with `cwebp`
- 15:00–17:00 Verify `next/image` `priority` for hero, `loading="lazy"` elsewhere, `sizes` correct

### Day 2.0 — Scaffold (Copy-Paste 1:1 HTML → JSX)
- 09:00–12:00 `app/(marketing)/page.tsx` with `NovifyLanding` server component, no `ClientProviders` (already fixed for SSR), preserve original `class=""` strings verbatim (no Tailwind purge)
- 13:00–17:00 Port each `<section>` as React component, keep `id="hero"` etc., keep original `style=""` for gradients, ensure `head` fonts load

### Day 3.0 — Motion Exact
- 09:00–11:00 CSS `float`/`glow-pulse`/`gradient-shift` already in `globals.css`; add `bar-in` stagger `delay 80ms*index`
- 11:00–15:00 `framer-motion` `motion.div` for hero N `whileHover`, bars `whileInView` `staggerChildren`, earth `useScroll` `y: [-20, 20]`
- 15:00–17:00 `lenis` `new Lenis({ smooth: true, lerp: 0.08 })` + `requestAnimationFrame`

### Day 4.0 — Pixel Polish
- 09:00–12:00 Playwright `toHaveScreenshot` diff vs original screenshot (mask preview amber bar), target <1.5% diff, adjust `translateZ`/`blur` until match
- 13:00–15:00 `axe-core` a11y: `contrast` for `10px` labels (ensure `white/60` min), `tabIndex`, `aria-label` for pills
- 15:00–17:00 Lighthouse CI `>90` perf, `next/font` display swap, `fetchPriority="high"` for hero

### Day 4.5 — Handover
- 09:00–10:00 `README.md` update + `docs/NOVIFY_CLONE.md` with token table
- 10:00–11:00 Push to `arena/...`, open PR with screenshots before/after
- 11:00–12:00 Demo on `https://3000-...e2b.app` (now SSR, no black screen)

**Total:** 4.5 days to 100% pixel parity.

**Risks & Mitigations:**
- *HTML uses Tailwind CDN `cdn.tailwindcss.com` with `config: { theme: { extend: {...}}}`* → Mitig: copy `tailwind.config` block into `tailwind.config.ts` `extend`.
- *Fonts blocked (Geist 403 earlier)* → Mitig: self-host, `display: swap`, fallback.
- *Images CORS (picsum)* → Mitig: `next.config images.remotePatterns picsum.photos`.
- *SSR bailout from `ClientProviders`* → Already mitigated (preview renders without it).

---

## 11) What We Have Already Fixed (so Minute Clone Won’t Go Black Again)

- `allowedDevOrigins ["*.e2b.app"]` → `_next` 200 for preview host (verified `curl -H "Host: 3000-…e2b.app" /_next/... 200`)
- `app/layout.tsx` preview branch renders `{children}` without `dynamic` → `curl /` now contains `<h1>The Premier System Workspace` in HTML shell (was bailout before)
- `NovifyLanding` is now server component (removed `"use client"`) → no CSR blank
- `picsum.photos` added to `next.config images.remotePatterns`

---

## 12) Next Step — Awaiting Your Re-Upload

Please drag **both files** into this chat again and confirm **“Save to workspace”** so they land at:
```
/home/user/nullvoid.AI/source/Novify.source.html
/home/user/nullvoid.AI/source/Nullvoid.pdf
```
I will then immediately run `extract-novify.mjs` and start **Day 0.5** without further questions. If you prefer, paste the HTML text directly.

*No code will be written until you confirm source is re-uploaded.*

