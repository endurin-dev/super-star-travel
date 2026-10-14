"use client";

import { useEffect, useMemo, useState } from "react";

/* ─────────────────────────────────────────────
   Edit these once — same constants as the other pages
   ───────────────────────────────────────────── */
const BRAND       = "Super Star Travel";
const SITE_URL    = "https://www.superstartravelcabs.com";
const PHONE_1     = { display: "+94 72 680 3498", tel: "+94726803498", wa: "https://wa.me/94726803498" };
const FALLBACK_IMG = "/images/car.png";

/* Price display: change these to match how `price` is stored in your database */
const CURRENCY    = "$";
const PRICE_UNIT  = "per km";

type Vehicle = {
  id: string;
  name: string;
  model: string;
  maxPassengers: number;
  maxLuggage: number;
  img: string;
  price: number | string;
  tag: string;
  special: string;
  active: boolean;
  sortOrder: number;
};

type Size = "all" | "small" | "medium" | "large";

const SIZES: { key: Size; label: string; test: (n: number) => boolean }[] = [
  { key: "all",    label: "All vehicles", test: () => true },
  { key: "small",  label: "1–3 guests",   test: (n) => n <= 3 },
  { key: "medium", label: "4–6 guests",   test: (n) => n >= 4 && n <= 6 },
  { key: "large",  label: "7+ guests",    test: (n) => n >= 7 },
];

const formatPrice = (p: number | string) => {
  const n = Number(p);
  if (!Number.isFinite(n)) return String(p);
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
};

export default function Fleet() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [size, setSize] = useState<Size>("all");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError("");

    (async () => {
      try {
        const res = await fetch("/api/vehicles", { cache: "no-store", signal: ctrl.signal });
        if (!res.ok) throw new Error("Could not load the fleet.");
        const data: Vehicle[] = await res.json();
        setVehicles(
          data
            .filter((v) => v.active)
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name))
        );
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message || "Could not load the fleet.");
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [reloadKey]);

  const visible = useMemo(() => {
    const t = SIZES.find((s) => s.key === size)!.test;
    return vehicles.filter((v) => t(v.maxPassengers));
  }, [vehicles, size]);

  const counts = useMemo(() => {
    const out = {} as Record<Size, number>;
    SIZES.forEach((s) => { out[s.key] = vehicles.filter((v) => s.test(v.maxPassengers)).length; });
    return out;
  }, [vehicles]);

  const waLink = (v?: Vehicle) =>
    v
      ? `${PHONE_1.wa}?text=${encodeURIComponent(`Hello, I would like to book the ${v.name} (${v.model}).`)}`
      : PHONE_1.wa;

  /* SEO: structured data */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    url: `${SITE_URL}/fleet`,
    name: `Our fleet | ${BRAND}`,
    about: { "@type": "TravelAgency", name: BRAND, url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: vehicles.map((v, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${v.name} (${v.model})`,
      })),
    },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap');

        .fl-root {
          --h-ink:#173b32; --h-ink-soft:rgba(23,59,50,.80); --h-ink-faint:rgba(23,59,50,.66);
          --h-teal:#2f7d5b; --h-teal-deep:#173b32; --h-sun:#2f7d5b; --h-sun-deep:#245e46;
          --h-ease:cubic-bezier(.25,.1,.25,1);
          font-family:'Figtree',system-ui,sans-serif; color:var(--h-ink); min-height:100vh; overflow-x:clip;
          background:
            radial-gradient(60% 34% at 92% 4%, rgba(47,125,91,.26), transparent 70%),
            radial-gradient(65% 40% at 4% 46%, rgba(47,125,91,.18), transparent 70%),
            radial-gradient(60% 34% at 92% 92%, rgba(47,125,91,.20), transparent 70%),
            #f3f7f2;
        }
        .fl-root *, .fl-root *::before, .fl-root *::after { box-sizing:border-box; margin:0; padding:0; }
        .fl-root button { font-family:inherit; }
        .fl-root :focus-visible { outline:3px solid var(--h-teal); outline-offset:2px; }
        .fl-wrap { max-width:1120px; margin:0 auto; padding:0 4vw; }

        .glass {
          background:linear-gradient(135deg, rgba(255,255,255,.80), rgba(255,255,255,.62));
          -webkit-backdrop-filter:blur(22px) saturate(170%); backdrop-filter:blur(22px) saturate(170%);
          border:1px solid rgba(255,255,255,.7);
          box-shadow:0 24px 54px rgba(16,44,37,.14), 0 4px 12px rgba(16,44,37,.08), inset 0 1.5px 0 rgba(255,255,255,.85);
        }

        /* ══ Intro ══ */
        .fl-intro { padding:40px 0 22px; animation:fl-rise .8s var(--h-ease) both; }
        @keyframes fl-rise { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
        @keyframes fl-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .fl-kicker { display:inline-block; font-size:13.5px; font-weight:600; color:var(--h-teal-deep); border-radius:100px; padding:5px 14px; margin-bottom:16px;
          background:linear-gradient(135deg, rgba(255,255,255,.62), rgba(255,255,255,.30));
          -webkit-backdrop-filter:blur(14px) saturate(180%); backdrop-filter:blur(14px) saturate(180%);
          border:1px solid rgba(255,255,255,.7);
          box-shadow:0 6px 18px rgba(23,59,50,.12), inset 0 1.5px 0 rgba(255,255,255,.85); }
        .fl-h1 { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(32px,5vw,62px); font-weight:800; line-height:1.04; letter-spacing:-.02em; margin-bottom:10px; }
        .fl-sub { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(17px,2.2vw,26px); font-weight:600; line-height:1.2; color:var(--h-teal); margin-bottom:14px; }
        .fl-desc { font-size:16px; font-weight:500; line-height:1.55; color:var(--h-ink-soft); max-width:600px; }

        /* ══ Filters ══ */
        .fl-bar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; padding:6px 0 20px; }
        .fl-chips { display:flex; gap:8px; flex-wrap:wrap; }
        .fl-chip { height:42px; padding:0 16px; border-radius:100px; cursor:pointer; display:inline-flex; align-items:center; gap:8px;
          font-size:14px; font-weight:700; color:var(--h-teal-deep);
          background:rgba(255,255,255,.78); border:1px solid rgba(255,255,255,.85);
          box-shadow:0 1px 3px rgba(23,59,50,.08), inset 0 1px 0 rgba(255,255,255,.9); transition:background .2s, color .2s, transform .2s; }
        .fl-chip:hover { transform:translateY(-2px); }
        .fl-chip small { font-size:12px; font-weight:700; opacity:.7; font-variant-numeric:tabular-nums; }
        .fl-chip[aria-pressed="true"] { background:var(--h-teal-deep); color:#fff; border-color:var(--h-teal-deep); }
        .fl-count { font-size:14px; font-weight:600; color:var(--h-ink-faint); }

        /* ══ Grid ══ */
        .fl-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:22px; padding-bottom:28px; }
        @media (max-width:420px) { .fl-grid { grid-template-columns:1fr; } }

        .fl-card { position:relative; overflow:hidden; border-radius:24px; display:flex; flex-direction:column; transition:transform .25s, box-shadow .25s; }
        .fl-card:hover { transform:translateY(-3px); box-shadow:0 30px 60px rgba(16,44,37,.18), 0 4px 12px rgba(16,44,37,.08), inset 0 1.5px 0 rgba(255,255,255,.85); }
        .fl-card::before { content:""; position:absolute; left:0; right:0; top:0; height:4px; z-index:2; background:linear-gradient(90deg, var(--h-teal-deep), var(--h-teal) 55%, var(--h-sun)); }

        .fl-photo { position:relative; aspect-ratio:16/10; display:flex; align-items:center; justify-content:center; padding:26px 22px 8px;
          background:radial-gradient(70% 80% at 50% 70%, rgba(255,255,255,.9), rgba(255,255,255,0) 75%); }
        .fl-photo img { max-width:100%; max-height:100%; object-fit:contain; filter:drop-shadow(0 14px 14px rgba(16,44,37,.22)); }
        .fl-tag { position:absolute; left:14px; top:18px; font-size:12.5px; font-weight:700; color:var(--h-ink); padding:5px 12px; border-radius:100px;
          background:linear-gradient(180deg,#2f7d5b,var(--h-sun-deep)); box-shadow:0 4px 10px rgba(36,94,70,.35), inset 0 1px 0 rgba(255,255,255,.55); }

        .fl-body { display:flex; flex-direction:column; gap:12px; padding:6px 20px 20px; flex:1; }
        .fl-name { font-family:'Bricolage Grotesque',sans-serif; font-size:22px; font-weight:800; letter-spacing:-.02em; line-height:1.15; }
        .fl-model { font-size:14px; font-weight:600; color:var(--h-ink-faint); margin-top:2px; }

        .fl-specs { display:flex; gap:8px; flex-wrap:wrap; }
        .fl-spec { display:inline-flex; align-items:center; gap:8px; height:36px; padding:0 12px; border-radius:100px; font-size:13.5px; font-weight:700; color:var(--h-teal-deep);
          background:rgba(255,255,255,.78); border:1px solid rgba(255,255,255,.85); box-shadow:0 1px 3px rgba(23,59,50,.08), inset 0 1px 0 rgba(255,255,255,.9); }
        .fl-spec svg { width:16px; height:16px; }

        .fl-special { font-size:14px; font-weight:500; line-height:1.5; color:var(--h-ink-soft); }

        .fl-foot { margin-top:auto; padding-top:12px; border-top:1px solid rgba(23,59,50,.08); display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
        .fl-price small { display:block; font-size:12px; font-weight:600; color:var(--h-ink-faint); }
        .fl-price b { font-family:'Bricolage Grotesque',sans-serif; font-size:24px; font-weight:800; font-variant-numeric:tabular-nums; }
        .fl-price span { font-size:13px; font-weight:600; color:var(--h-ink-faint); margin-left:4px; }
        .fl-actions { display:flex; gap:8px; }
        .fl-btn { height:44px; padding:0 18px; border-radius:14px; display:inline-flex; align-items:center; justify-content:center; gap:8px; font-size:14.5px; font-weight:700; text-decoration:none; transition:transform .2s, background .2s; }
        .fl-btn:hover { transform:translateY(-2px); }
        .fl-btn svg { width:17px; height:17px; }
        .fl-btn.p { background:linear-gradient(180deg,#c2410c,#9a3412); color:#fff; box-shadow:0 8px 18px rgba(194,65,12,.38), inset 0 1px 0 rgba(255,255,255,.3); }
        .fl-btn.p:hover { background:linear-gradient(180deg,#9a3412,#7c2d12); }
        .fl-btn.wa { width:44px; padding:0; background:linear-gradient(180deg,#c2410c,#9a3412); color:#fff; box-shadow:0 8px 18px rgba(194,65,12,.38), inset 0 1px 0 rgba(255,255,255,.3); }
        .fl-btn.wa:hover { background:linear-gradient(180deg,#9a3412,#7c2d12); }

        /* ══ Skeleton / states ══ */
        .fl-skel { border-radius:24px; height:400px; border:1px solid rgba(255,255,255,.7);
          background:linear-gradient(100deg, rgba(255,255,255,.55) 30%, rgba(255,255,255,.9) 50%, rgba(255,255,255,.55) 70%); background-size:200% 100%; animation:fl-shimmer 1.4s linear infinite; }
        .fl-state { border-radius:24px; padding:44px 26px; text-align:center; grid-column:1 / -1; }
        .fl-state h3 { font-family:'Bricolage Grotesque',sans-serif; font-size:22px; font-weight:800; margin-bottom:8px; }
        .fl-state p { font-size:15px; font-weight:500; color:var(--h-ink-soft); max-width:420px; margin:0 auto 18px; line-height:1.5; }
        .fl-state .fl-btn { display:inline-flex; border:none; cursor:pointer; }

        /* ══ CTA ══ */
        .fl-cta { padding:20px 0 64px; }
        .fl-ctacard { position:relative; overflow:hidden; border-radius:24px; padding:34px 32px; color:#fff;
          background:radial-gradient(60% 120% at 100% 0%, rgba(47,125,91,.34), transparent 65%), linear-gradient(135deg, var(--h-teal-deep), var(--h-teal));
          box-shadow:0 34px 70px rgba(23,59,50,.35), 0 6px 16px rgba(16,44,37,.12);
          display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:22px; }
        .fl-ctacard h2 { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(22px,3vw,32px); font-weight:800; letter-spacing:-.02em; margin-bottom:6px; }
        .fl-ctacard p { font-size:15px; font-weight:500; color:rgba(255,255,255,.86); }
        .fl-btns { display:flex; gap:10px; flex-wrap:wrap; }
        .fl-btn.g { color:#fff; background:linear-gradient(135deg, rgba(255,255,255,.28), rgba(255,255,255,.08)); border:1px solid rgba(255,255,255,.5); box-shadow:inset 0 1.5px 0 rgba(255,255,255,.5); padding:0 26px; }
        .fl-btn.g:hover { background:rgba(255,255,255,.28); }
        .fl-ctacard .fl-btn.p { padding:0 26px; box-shadow:0 8px 18px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.55); }

        @media (max-width:640px) {
          .fl-intro { padding:24px 0 16px; }
          .fl-ctacard { padding:26px 20px; }
          .fl-btns, .fl-btns .fl-btn { width:100%; }
          .fl-foot { flex-direction:column; align-items:stretch; }
          .fl-actions .fl-btn.p { flex:1; }
        }
        @supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))) { .glass { background:#fff; } }
        @media (prefers-reduced-transparency:reduce) { .glass { background:#fff; -webkit-backdrop-filter:none; backdrop-filter:none; } }
        @media (prefers-reduced-motion:reduce) { .fl-root *, .fl-root *::before { animation:none !important; transition:none !important; } }
      `}</style>

      {/* SEO: structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="fl-root">
        <div className="fl-wrap">

          {/* Intro */}
          <header className="fl-intro">
            <p className="fl-kicker">Our fleet · Air-conditioned, licensed drivers</p>
            <h1 className="fl-h1">Vehicle fleet</h1>
            <h2 className="fl-sub">Pick the right car for your group and your luggage</h2>
            <p className="fl-desc">
              From a compact car for two to a van for the whole family, every vehicle comes with an English-speaking driver and a fixed fare agreed before you travel.
            </p>
          </header>

          {/* Filters */}
          <div className="fl-bar">
            <div className="fl-chips" role="group" aria-label="Filter by group size">
              {SIZES.map((s) => (
                <button key={s.key} type="button" className="fl-chip" aria-pressed={size === s.key} onClick={() => setSize(s.key)}>
                  {s.label}
                  {!loading && !error && <small>{counts[s.key]}</small>}
                </button>
              ))}
            </div>
            <p className="fl-count" aria-live="polite">
              {loading ? "Loading vehicles…" : error ? "" : `${visible.length} ${visible.length === 1 ? "vehicle" : "vehicles"} available`}
            </p>
          </div>

          {/* Grid */}
          <div className="fl-grid">
            {loading && [0, 1, 2].map((i) => <div key={i} className="fl-skel" aria-hidden="true" />)}

            {!loading && error && (
              <div className="fl-state glass" role="alert">
                <h3>We could not load the fleet</h3>
                <p>{error} Check your connection and try again, or message us and we will recommend a vehicle.</p>
                <div className="fl-actions" style={{ justifyContent: "center" }}>
                  <button type="button" className="fl-btn p" onClick={() => setReloadKey((k) => k + 1)}>Try again</button>
                  <a href={waLink()} target="_blank" rel="noopener noreferrer" className="fl-btn g">WhatsApp us</a>
                </div>
              </div>
            )}

            {!loading && !error && visible.length === 0 && (
              <div className="fl-state glass">
                <h3>{vehicles.length === 0 ? "No vehicles listed yet" : "No vehicles for this group size"}</h3>
                <p>
                  {vehicles.length === 0
                    ? "Our fleet is being updated. Message us and we will arrange a vehicle for your trip."
                    : "Try a different group size, or message us and we will find a vehicle that fits."}
                </p>
                {vehicles.length > 0 && (
                  <button type="button" className="fl-btn p" onClick={() => setSize("all")}>Show all vehicles</button>
                )}
              </div>
            )}

            {!loading && !error && visible.map((v) => (
              <article key={v.id} className="fl-card glass" aria-labelledby={`fl-n-${v.id}`}>
                <div className="fl-photo">
                  {v.tag && <span className="fl-tag">{v.tag}</span>}
                  <img
                    src={v.img || FALLBACK_IMG}
                    alt={`${v.name} ${v.model}`}
                    loading="lazy"
                    onError={(e) => {
                      const el = e.currentTarget;
                      if (!el.src.endsWith(FALLBACK_IMG)) el.src = FALLBACK_IMG;
                    }}
                  />
                </div>

                <div className="fl-body">
                  <div>
                    <h3 id={`fl-n-${v.id}`} className="fl-name">{v.name}</h3>
                    <p className="fl-model">{v.model}</p>
                  </div>

                  <div className="fl-specs">
                    <span className="fl-spec" title="Maximum passengers">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-4.13a4 4 0 11-8 0 4 4 0 018 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      Up to {v.maxPassengers} guests
                    </span>
                    <span className="fl-spec" title="Maximum luggage">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6V5a2 2 0 012-2h2a2 2 0 012 2v1m-10 0h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z"/></svg>
                      {v.maxLuggage} {v.maxLuggage === 1 ? "bag" : "bags"}
                    </span>
                  </div>

                  {v.special && <p className="fl-special">{v.special}</p>}

                  <div className="fl-foot">
                    <div className="fl-price">
                      <small>From</small>
                      <b>{CURRENCY}{formatPrice(v.price)}</b>
                      <span>{PRICE_UNIT}</span>
                    </div>
                    <div className="fl-actions">
                      <a href={`/reservation?vehicle=${encodeURIComponent(v.id)}`} className="fl-btn p">Book this vehicle</a>
                      <a href={waLink(v)} target="_blank" rel="noopener noreferrer" className="fl-btn wa" aria-label={`Ask about the ${v.name} on WhatsApp`}>
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0012.05 0z"/></svg>
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* CTA */}
          <section className="fl-cta">
            <div className="fl-ctacard">
              <div>
                <h2>Not sure which vehicle fits?</h2>
                <p>Tell us your group size, bags and route and we will recommend one with a fixed fare.</p>
              </div>
              <div className="fl-btns">
                <a href="/reservation" className="fl-btn p">Book now</a>
                <a href={waLink()} target="_blank" rel="noopener noreferrer" className="fl-btn g">WhatsApp us</a>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}