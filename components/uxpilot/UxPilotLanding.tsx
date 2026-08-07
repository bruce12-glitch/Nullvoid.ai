import Link from "next/link";

/* UX PILOT EXACT — rebuilt from scratch per screenshot, minute-exact */
function Nav({ isPreview }: { isPreview: boolean }) {
  return (
    <nav className="absolute top-0 inset-x-0 z-50 h-[56px] flex items-center justify-between px-6 md:px-10 max-w-[1280px] mx-auto">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-[6px] bg-white flex items-center justify-center">
          <span className="text-black font-black text-[12px] leading-none">∅</span>
        </div>
        <span className="text-white text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ fontFamily: "var(--font-satoshi), var(--font-geist-sans), sans-serif" }}>NullVoid</span>
      </div>
      <div className="hidden md:flex items-center gap-6 text-[11px] tracking-wide text-white/60">
        <a href="#" className="hover:text-white transition-colors">Home</a>
        <a href="#" className="hover:text-white transition-colors">Marketing</a>
        <a href="#" className="hover:text-white transition-colors">UX Offerings</a>
        <a href="#" className="hover:text-white transition-colors">About</a>
        <a href="#" className="hover:text-white transition-colors">Blog</a>
        <a href="#" className="hover:text-white transition-colors">Contact</a>
      </div>
      <Link href={isPreview ? "/dashboard" : "/sign-in"} className="hidden md:inline-flex items-center gap-2 px-4 h-7 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 transition-colors">
        Start Designing <span className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[10px]">→</span>
      </Link>
      <div className="md:hidden flex items-center gap-2">
        <Link href={isPreview ? "/dashboard" : "/sign-in"} className="px-3 h-7 rounded-full bg-white text-black text-xs font-semibold">Dashboard</Link>
      </div>
    </nav>
  );
}

function Hero({ isPreview }: { isPreview: boolean }) {
  return (
    <section className="relative bg-[#050508] overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.18),transparent_60%),radial-gradient(ellipse_at_center,_rgba(59,130,246,0.12),transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.35]" style={{ backgroundImage: `radial-gradient(white 0.8px, transparent 0.8px)`, backgroundSize: '22px 22px' }} />
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[-520px] w-[1600px] h-[900px] rounded-[50%] border border-white/10 overflow-hidden">
        <div className="absolute inset-0 rounded-[50%] bg-gradient-to-b from-[#0a0f1d] via-[#111a2f] to-[#0a0a0f]" />
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#a78bfa] to-transparent opacity-80" />
        <div className="absolute top-[-2px] inset-x-0 h-[30px] bg-gradient-to-b from-[#a78bfa]/40 via-[#8b5cf6]/20 to-transparent blur-[12px]" />
        <div className="absolute -top-[120px] left-1/2 -translate-x-1/2 w-[900px] h-[300px] bg-gradient-to-r from-[#8b5cf6]/30 via-[#6366f1]/20 to-[#3b82f6]/30 blur-[60px] rounded-full" />
      </div>
      <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 w-[900px] h-[280px] bg-gradient-to-b from-[#8b5cf6]/25 via-[#7c3aed]/15 to-transparent blur-[40px] rounded-[50%] pointer-events-none" />
      <Nav isPreview={isPreview} />
      <div className="relative max-w-[1280px] mx-auto px-6 md:px-10 pt-[92px] pb-6 flex flex-col items-center text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur text-[10px] tracking-[0.18em] uppercase text-white/70 mb-5">
          The Collaborative System Design Network
        </div>
        <h1 className="text-[32px] md:text-[48px] lg:text-[56px] font-[800] tracking-[-0.03em] leading-[0.9] text-white max-w-[820px]" style={{ fontFamily: "var(--font-satoshi), var(--font-geist-sans), sans-serif" }}>
          The Premier System Workspace
          <br />
          <span className="bg-gradient-to-r from-white via-[#c4b5fd] to-white bg-clip-text text-transparent">for Engineering Innovation.</span>
        </h1>
        <div className="mt-7 flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            {[
              { bg: "from-[#8b5cf6] to-[#a78bfa]", icon: "◈" },
              { bg: "from-white to-white", icon: "⬡", dark: true },
              { bg: "from-[#c4b5fd] to-[#e9d5ff]", icon: "⬢" },
              { bg: "from-[#1e1b4b] to-[#312e81]", icon: "⬣", border: true },
              { bg: "from-white to-white", icon: "⬢", dark: true },
            ].map((p, i) => (
              <div key={i} className={`w-9 h-9 rounded-full bg-gradient-to-br ${p.bg} flex items-center justify-center text-[11px] shadow-lg shadow-black/40 border ${p.border ? "border-white/15" : "border-white/20"} animate-float`} style={{ animationDelay: `${i * 120}ms`, animationDuration: `${5 + i * 0.4}s` }}>
                <span className={p.dark ? "text-black" : "text-white"}>{p.icon}</span>
              </div>
            ))}
          </div>
          <div className="md:hidden flex gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black text-xs">◈</div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa] flex items-center justify-center text-white text-xs">⬡</div>
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black text-xs">⬢</div>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Link href={isPreview ? "/dashboard" : "/sign-in"} className="inline-flex items-center gap-2 px-6 h-9 rounded-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-semibold tracking-wide transition-colors shadow-[0_0_24px_rgba(124,58,237,0.5)]">
            <span className="w-2 h-2 rounded-full bg-white/80" /> Start Designing
          </Link>
          <Link href={isPreview ? "/editor" : "/sign-in"} className="inline-flex items-center gap-2 px-6 h-9 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 transition-colors">
            View Demo <span className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[10px]">→</span>
          </Link>
        </div>
        <div className="relative mt-10 md:mt-12 w-full max-w-[560px] h-[240px] md:h-[280px] flex items-center justify-center [perspective:1200px]">
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[420px] h-[80px] bg-black/60 blur-[32px] rounded-full" />
          <div className="relative w-[280px] h-[180px] [transform-style:preserve-3d]">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="absolute inset-0 rounded-[18px] border border-white/15 backdrop-blur-xl" style={{ background: `linear-gradient(180deg, rgba(255,255,255,${0.08 - i * 0.008}) 0%, rgba(255,255,255,${0.03 - i * 0.003}) 100%)`, transform: `translateZ(${i * 6}px) translateX(${i * 2}px) translateY(${i * -1.5}px) rotateX(14deg) rotateY(-14deg)`, boxShadow: "0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)" }} />
            ))}
            <div className="absolute inset-0 rounded-[18px] border border-white/20 overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 45%, rgba(139,92,246,0.18) 100%)", backdropFilter: "blur(16px)", transform: "translateZ(48px) translateX(14px) translateY(-10px) rotateX(14deg) rotateY(-14deg)", boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
              <div className="text-[84px] font-black tracking-[-0.08em] leading-none text-white drop-shadow-[0_4px_24px_rgba(139,92,246,0.5)]" style={{ fontFamily: "var(--font-satoshi), var(--font-geist-sans), sans-serif" }}>N</div>
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="absolute top-3 left-3 w-16 h-16 rounded-full bg-gradient-to-br from-white/15 to-transparent blur-[12px]" />
            </div>
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[200px] bg-gradient-to-r from-[#8b5cf6]/20 via-[#6366f1]/15 to-[#3b82f6]/20 blur-[40px] rounded-full -z-10" />
        </div>
        <div className="mt-2 w-full border-t border-white/[0.06] pt-4">
          <div className="flex flex-wrap items-center justify-center gap-5 md:gap-8 text-[10px] tracking-[0.14em] uppercase text-white/35">
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border border-white/20 flex items-center justify-center text-[7px]">●</span> VERCEL</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-white/10 flex items-center justify-center text-[8px]">⬢</span> Liveblocks</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border border-white/20 flex items-center justify-center">◈</span> NEON</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-white text-black flex items-center justify-center text-[7px] font-bold">◆</span> Trigger.dev</span>
            <span className="hidden md:inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border border-white/20 flex items-center justify-center text-[7px]">⬡</span> Gemini</span>
            <span className="hidden md:inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-white/10 flex items-center justify-center">◎</span> Prisma</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Intro() {
  return (
    <section className="bg-black border-t border-white/[0.06] py-12 md:py-16">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 flex flex-col items-center text-center">
        <h2 className="text-[22px] md:text-[28px] font-semibold tracking-tight text-white leading-tight max-w-[560px]" style={{ fontFamily: "var(--font-satoshi), var(--font-geist-sans), sans-serif" }}>
          System Architecture With NullVoid isn&apos;t Transactional. It&apos;s <span className="text-white">Transformational</span>
        </h2>
        <p className="mt-3 text-[11px] leading-relaxed text-white/45 max-w-[560px]">Every node is crafted with intent. Every edge tells a story. We don&apos;t just diagram — we architect with you, translating founder vision into production-ready systems.</p>
        <div className="relative mt-10 w-full max-w-[720px] h-[180px] flex flex-col items-center justify-center gap-[3px] [perspective:1000px]">
          {Array.from({ length: 8 }).map((_, i) => {
            const w = 560 - i * 18;
            const opacity = 1 - i * 0.08;
            return <div key={i} className="h-[14px] rounded-[4px] border border-white/10 backdrop-blur animate-fade-in" style={{ width: `${Math.max(260, w)}px`, background: `linear-gradient(90deg, rgba(52,211,153,${0.9 * opacity}) 0%, rgba(99,102,241,${0.85 * opacity}) 45%, rgba(139,92,246,${0.85 * opacity}) 75%, rgba(236,72,153,${0.7 * opacity}) 100%)`, transform: `translateZ(${i * 4}px) rotateX(18deg)`, boxShadow: `0 ${2 + i}px ${12 + i * 2}px rgba(0,0,0,0.4)`, animationDelay: `${i * 80}ms` }} />;
          })}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="bg-black py-10 md:py-12">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10">
        <div className="flex flex-col items-center text-center mb-8">
          <h3 className="text-base md:text-lg font-semibold text-white tracking-tight" style={{ fontFamily: "var(--font-satoshi), var(--font-geist-sans), sans-serif" }}>Driving Growth. Delivering Care</h3>
          <p className="mt-1 text-[10px] text-white/35">We don&apos;t just ship diagrams — we ship understanding.</p>
        </div>
        <div className="grid grid-cols-12 gap-3 max-w-[860px] mx-auto">
          <div className="col-span-6 md:col-span-3 rounded-[12px] bg-[#0a0a0f] border border-white/[0.08] p-4 flex flex-col gap-6 min-h-[96px]">
            <div className="text-[22px] font-light tracking-tight text-white leading-none">19 min</div>
            <div className="text-[10px] leading-tight text-white/40">Average time to first architecture</div>
          </div>
          <div className="col-span-6 md:col-span-3 rounded-[12px] bg-[#0a0a0f] border border-white/[0.08] p-4 flex flex-col gap-6 min-h-[96px]">
            <div className="text-[22px] font-light tracking-tight text-white leading-none">48 hrs</div>
            <div className="text-[10px] leading-tight text-white/40">Avg. saved per architecture vs manual</div>
          </div>
          <div className="col-span-12 md:col-span-6 row-span-2 rounded-[12px] bg-[#0a0a0f] border border-white/[0.08] overflow-hidden relative min-h-[204px] flex">
            <div className="flex-1 p-4 flex flex-col">
              <div className="text-[22px] font-light tracking-tight text-white leading-none">10k+</div>
              <div className="text-[10px] leading-tight text-white/40 mt-6">Nodes generated globally</div>
              <div className="mt-auto inline-flex items-center gap-1 text-[10px] text-white/60">Live canvas <span className="w-3 h-3 rounded-full bg-white text-black flex items-center justify-center text-[8px]">↗</span></div>
            </div>
            <div className="w-[54%] relative overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e3a8a]">
              <div className="absolute inset-0 opacity-60" style={{ backgroundImage: `radial-gradient(white 0.7px, transparent 0.7px)`, backgroundSize: '14px 14px' }} />
              <div className="absolute top-6 right-6 flex flex-col gap-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black text-xs shadow-lg">⬢</div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa] flex items-center justify-center text-white text-xs shadow-lg">◈</div>
                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-black text-xs shadow-lg">⬡</div>
              </div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-20 h-20 rounded-[14px] bg-gradient-to-br from-white/15 to-white/5 border border-white/15 backdrop-blur flex items-center justify-center text-white font-black text-3xl">N</div>
            </div>
          </div>
          <div className="col-span-6 md:col-span-3 rounded-[12px] bg-[#0a0a0f] border border-white/[0.08] p-4 flex flex-col gap-6 min-h-[96px]">
            <div className="text-[22px] font-light tracking-tight text-white leading-none">5:1</div>
            <div className="text-[10px] leading-tight text-white/40">Avg. iteration ratio</div>
          </div>
          <div className="col-span-6 md:col-span-3 rounded-[12px] bg-[#0a0a0f] border border-white/[0.08] p-4 flex flex-col gap-6 min-h-[96px]">
            <div className="text-[22px] font-light tracking-tight text-white leading-none">98%</div>
            <div className="text-[10px] leading-tight text-white/40">Of teams ship faster after first session</div>
          </div>
        </div>
        <div className="max-w-[860px] mx-auto mt-6 flex flex-col items-center gap-5">
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-5 h-8 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 transition-colors">Explore Workspace <span className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[10px]">↗</span></Link>
          <div className="max-w-[640px] text-center">
            <div className="text-white/90 text-[13px] leading-relaxed"><span className="text-white/30 text-xl leading-none">“</span> From initial prompt to production-ready spec, we handle the translation that matters most. This is human-led thinking, supercharged by technology, not replaced by it.</div>
            <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-white/40"><span className="w-6 h-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px]">◈</span> Engineering Lead, NullVoid • Trusted by systems teams</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Team() {
  const cards = [
    { title: "The Ghost AI that scales with your vision", desc: "Gemini 2.0 maps intent to nodes and edges in seconds. No boilerplate, no guesswork — just architecture that understands context.", badge: "Ghost AI" },
    { title: "Where real-time meets real understanding", desc: "Live cursors, presence, and CRDT sync at 30Hz. See who’s editing which node, in real time.", badge: "Liveblocks" },
    { title: "WebGPU performance, WebGL2 resilience", desc: "Hardware-accelerated 3D with automatic fallback. 60 FPS even with 200+ nodes.", badge: "3D Canvas" },
    { title: "Every spec tells a story", desc: "One-click Markdown spec from canvas state. Stored in Vercel Blob, linked to project, ready to share.", badge: "Specs" },
    { title: "Starter templates, infinite possibilities", desc: "Microservices, event-driven, CI/CD — import and adapt. Same schema, instant remix.", badge: "Templates" },
    { title: "Auth that respects ownership", desc: "Clerk-powered projects with owner + collaborators. Secure by design, simple to invite.", badge: "Clerk" },
    { title: "Observability baked in", desc: "Sentry tracing + PostHog analytics. Know what ships, and how it performs.", badge: "Telemetry" },
    { title: "The dark workspace you’ll love", desc: "Near-black surfaces, vivid accents, glassmorphism. Built for focus, designed for flow.", badge: "Design" },
  ];
  return (
    <section className="bg-[#050508] py-12 border-t border-white/[0.06]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10">
        <div className="flex flex-col items-center text-center mb-8">
          <h3 className="text-[20px] md:text-[24px] font-semibold tracking-tight text-white leading-tight max-w-[520px]" style={{ fontFamily: "var(--font-satoshi), var(--font-geist-sans), sans-serif" }}>We&apos;re Architecting the Infrastructure<br /> Layer of the Digital Future</h3>
          <div className="mt-3 inline-flex items-center gap-2 px-3 h-6 rounded-full bg-white/[0.06] border border-white/10 text-[10px] tracking-wide text-white/60"><span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" /> Spec-driven agentic development</div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {cards.map((c, i) => (
            <div key={i} className="rounded-[14px] bg-[#0a0a0f] border border-white/[0.08] p-4 flex flex-col min-h-[160px] hover:border-white/15 transition-colors group">
              <div className="text-[11px] font-medium leading-snug text-white min-h-[36px]">{c.title}</div>
              <div className="mt-2 text-[10px] leading-relaxed text-white/45 line-clamp-3">{c.desc}</div>
              <div className="mt-auto pt-3 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-[10px] text-white/60">◈</span><span className="text-[10px] text-white/30">{c.badge}</span><span className="ml-auto w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-[10px]">↗</span></div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center"><button className="text-[11px] tracking-wide text-white/40 hover:text-white/70 transition-colors border border-white/10 rounded-full px-4 h-7 bg-white/[0.03]">Show more ↓</button></div>
      </div>
    </section>
  );
}

function Ecosystem() {
  return (
    <section className="bg-black py-10 border-t border-white/[0.06]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10">
        <h3 className="text-center text-sm font-semibold text-white tracking-tight mb-6" style={{ fontFamily: "var(--font-satoshi), var(--font-geist-sans), sans-serif" }}>Embedded in the Ecosystem</h3>
        <div className="grid md:grid-cols-3 gap-3 max-w-[900px] mx-auto">
          <div className="rounded-[16px] overflow-hidden bg-[#0a0a0f] border border-white/[0.08] relative group">
            <div className="h-[220px] bg-[#11111a] relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" /><img src="https://picsum.photos/seed/novify1/600/400" alt="Event" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" /><div className="absolute bottom-3 left-3 right-3"><div className="text-[11px] font-medium text-white leading-tight">Dubai Ecosystem Mixer — Feb 2025</div><div className="text-[10px] text-white/50">Where founders and talent met IRL</div></div></div>
          </div>
          <div className="rounded-[16px] overflow-hidden bg-gradient-to-br from-[#4f46e5] via-[#7c3aed] to-[#1e1b4b] border border-white/15 relative p-6 flex flex-col justify-center text-center min-h-[220px]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.15),transparent_70%)]" />
            <div className="relative"><div className="text-[11px] leading-relaxed text-white/90">Partnerships with Swift, Chainlink, DYDX, Talos and leading ecosystem protocols — embedding talent where innovation happens.</div><button className="mt-4 inline-flex items-center gap-1 px-4 h-7 rounded-full bg-white text-black text-xs font-semibold mx-auto">Our Partners <span className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[10px]">↗</span></button></div>
          </div>
          <div className="rounded-[16px] overflow-hidden bg-[#0a0a0f] border border-white/[0.08] relative group">
            <div className="h-[220px] bg-[#11111a] relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" /><img src="https://picsum.photos/seed/novify2/600/400" alt="Event" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" /><div className="absolute bottom-3 left-3 right-3"><div className="text-[11px] font-medium text-white leading-tight">Design Systems Live — Berlin 2025</div><div className="text-[10px] text-white/50">200+ systems teams, one canvas</div></div></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Connect({ isPreview }: { isPreview: boolean }) {
  return (
    <section className="bg-black py-12 border-t border-white/[0.06]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10">
        <div className="text-center mb-6">
          <h3 className="text-[20px] font-semibold tracking-tight text-white" style={{ fontFamily: "var(--font-satoshi), var(--font-geist-sans), sans-serif" }}>Where Founders and Top Talent Connect</h3>
          <p className="text-[10px] text-white/35 mt-1">Two workspaces, one canvas — designed for intent and outcome.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 max-w-[760px] mx-auto">
          <div className="rounded-[18px] bg-[#0a0a0f] border border-white/[0.08] p-4 pb-0 overflow-hidden relative group hover:border-white/15 transition-colors">
            <div className="flex items-center justify-between"><span className="text-[11px] font-medium text-white">Founders</span><Link href={isPreview ? "/dashboard" : "/sign-in"} className="inline-flex items-center gap-1 px-3 h-6 rounded-full bg-white text-black text-[11px] font-semibold">For Founders <span className="w-3 h-3 rounded-full bg-black text-white flex items-center justify-center text-[8px]">↗</span></Link></div>
            <div className="mt-4 relative h-[180px] flex items-end justify-center"><div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[240px] h-[120px] bg-gradient-to-t from-[#8b5cf6]/20 to-transparent blur-[20px] rounded-full" /><div className="relative w-[220px] h-[140px] [perspective:1000px]">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="absolute inset-0 rounded-[14px] border border-white/10" style={{ background: `rgba(255,255,255,${0.06 - i * 0.008})`, transform: `translateZ(${i * 5}px) translateY(${i * -2}px) rotateX(12deg) rotateY(-12deg)`, backdropFilter: "blur(10px)" }} />))}<div className="absolute inset-0 rounded-[14px] bg-gradient-to-br from-white/10 to-white/[0.03] border border-white/15 backdrop-blur flex items-center justify-center" style={{ transform: "translateZ(30px) rotateX(12deg) rotateY(-12deg)" }}><span className="text-4xl font-black text-white">N</span></div></div></div>
          </div>
          <div className="rounded-[18px] bg-[#0a0a0f] border border-white/[0.08] p-4 pb-0 overflow-hidden relative group hover:border-white/15 transition-colors">
            <div className="flex items-center justify-between"><span className="text-[11px] font-medium text-white">Job Opportunities</span><span className="text-[10px] text-white/30">140+ Openings</span></div>
            <div className="mt-4 relative h-[180px] flex items-end justify-center overflow-hidden"><div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0f]" /><div className="relative w-[220px] h-[160px] flex items-end justify-center"><div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[160px] h-[140px] rounded-[14px] bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 backdrop-blur flex flex-col items-center justify-center gap-2"><div className="w-10 h-10 rounded-full bg-white/20 border border-white/20 flex items-center justify-center text-white">◎</div><div className="w-16 h-2 rounded-full bg-white/10" /><div className="w-12 h-2 rounded-full bg-white/5" /></div><div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[180px] h-[120px] rounded-[14px] bg-white/[0.03] border border-white/10 -z-10" style={{ transform: "rotateX(12deg) rotateY(-8deg)" }} /></div></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-black border-t border-white/[0.06] pt-10 pb-6 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row justify-between gap-6 text-[10px] leading-relaxed text-white/35">
          <div className="flex gap-10">
            <div><div className="text-white/60 font-medium mb-2">NullVoid</div><div>System Design Workspace</div><div>AI Architecture Agent</div><div>Collaborative Canvas</div></div>
            <div><div className="text-white/60 font-medium mb-2">Resources</div><div>Docs</div><div>Changelog</div><div>Templates</div></div>
          </div>
          <div className="text-right hidden md:block"><div className="text-white font-medium tracking-wide">NULLVOID</div><div>Where Systems Come to Life.</div><div className="text-white/20">Build • Collaborate • Ship</div></div>
        </div>
        <div className="mt-10 relative select-none pointer-events-none"><div className="text-[72px] md:text-[120px] lg:text-[148px] font-black tracking-[-0.06em] leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/[0.07] to-white/[0.02] whitespace-nowrap overflow-hidden">NULLVOID</div></div>
        <div className="mt-2 flex flex-col md:flex-row items-center justify-between gap-2 text-[10px] text-white/25"><span>© 2026 NullVoid AI • Dark workspace • Spec-driven • Ghost AI</span><span className="flex gap-4"><a href="#" className="hover:text-white/50">Privacy</a><a href="#" className="hover:text-white/50">Terms</a><a href="#" className="hover:text-white/50">GitHub</a></span></div>
      </div>
    </footer>
  );
}

export function UxPilotLanding({ isPreview }: { isPreview: boolean }) {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col selection:bg-[#8b5cf6]/30">
      <Hero isPreview={isPreview} />
      <Intro />
      <Stats />
      <Team />
      <Ecosystem />
      <Connect isPreview={isPreview} />
      <Footer />
    </div>
  );
}
