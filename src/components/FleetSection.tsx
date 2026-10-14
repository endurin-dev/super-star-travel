"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const BRAND        = "Super Star Travel";
const SITE_URL     = "https://www.superstartravelcabs.com";
const WHATSAPP     = "https://wa.me/94726803498";
const CURRENCY     = "$";                 // same as the home page fleet section
const FALLBACK_IMG = "/images/car.png";

type Vehicle = {
  id: string;
  name: string;
  model: string;
  maxPassengers: number;
  maxLuggage: number;
  img: string;
  price: number | null;
  tag: string;
  special: string;
  active: boolean;
  sortOrder: number;
};

type Size = "all" | "small" | "medium" | "large";

const SIZES: { key: Size; label: string; test: (n: number) => boolean }[] = [
  { key: "all",    label: "All vehicles",   test: () => true },
  { key: "small",  label: "1–3 passengers", test: (n) => n <= 3 },
  { key: "medium", label: "4–6 passengers", test: (n) => n >= 4 && n <= 6 },
  { key: "large",  label: "7+ passengers",  test: (n) => n >= 7 },
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap');

  .fleet-page {
    --h-ink:       #173b32;
    --h-ink-soft:  rgba(23,59,50,.80);
    --h-ink-faint: rgba(23,59,50,.66);
    --h-teal:      #2f7d5b;
    --h-teal-deep: #173b32;
    --h-sun:       #2f7d5b;
    --h-sun-deep:  #245e46;
    --h-mint:      #bed3bf;
    --h-line:      rgba(23,59,50,.12);
    --h-ease:      cubic-bezier(.25,.1,.25,1);

    position: relative; min-height: 100vh; overflow-x: clip;
    font-family: 'Figtree', system-ui, sans-serif; color: var(--h-ink);
    background:
      radial-gradient(60% 40% at 90% 85%, rgba(47,125,91,.22), transparent 70%),
      radial-gradient(70% 45% at 5% 55%, rgba(47,125,91,.16), transparent 70%),
      #f3f7f2;
  }
  .fleet-page *, .fleet-page *::before, .fleet-page *::after { box-sizing: border-box; }
  .fleet-page :focus-visible { outline: 3px solid var(--h-teal); outline-offset: 2px; border-radius: 8px; }

  /* ══ Title band: continues the solid teal header ══ */
  .fleet-hero {
    position: relative; overflow: hidden; color: #fff; padding: 56px 5vw 112px;
    background:
      radial-gradient(60% 90% at 95% 100%, rgba(47,125,91,.2), transparent 70%),
      radial-gradient(70% 90% at 0% 0%, rgba(47,125,91,.7), transparent 70%),
      linear-gradient(180deg, #173b32 0%, #102c25 100%);
  }
  .fleet-hero-inner { max-width: 1240px; margin: 0 auto; animation: fleet-rise .7s var(--h-ease) both; }
  @keyframes fleet-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
  .fleet-kicker {
    display: inline-block; font-size: 13.5px; font-weight: 600; color: #fff; border-radius: 100px; padding: 5px 14px; margin-bottom: 16px;
    background: linear-gradient(135deg, rgba(255,255,255,.26), rgba(255,255,255,.08));
    -webkit-backdrop-filter: blur(14px) saturate(180%); backdrop-filter: blur(14px) saturate(180%);
    border: 1px solid rgba(255,255,255,.4); box-shadow: 0 6px 18px rgba(0,0,0,.18), inset 0 1.5px 0 rgba(255,255,255,.5);
  }
  .fleet-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: clamp(34px, 5.2vw, 62px); font-weight: 800; letter-spacing: -.02em; line-height: 1.04; margin: 0 0 12px; text-shadow: 0 2px 20px rgba(0,0,0,.25); }
  .fleet-subtitle { font-family: 'Bricolage Grotesque', sans-serif; font-size: clamp(17px, 2vw, 24px); font-weight: 600; line-height: 1.3; color: var(--h-mint); max-width: 40ch; margin: 0; }

  .fleet-shell { position: relative; z-index: 1; max-width: 1240px; margin: -64px auto 0; padding: 0 5vw 72px; }

  /* ══ Filter bar: frosted card that rises over the band, like the hero booking card ══ */
  .fleet-bar {
    position: relative; overflow: hidden; display: flex; align-items: center; justify-content: space-between; gap: 12px 20px; flex-wrap: wrap;
    margin-bottom: 24px; padding: 18px 20px 14px; border-radius: 22px;
    background: linear-gradient(135deg, rgba(255,255,255,.92), rgba(255,255,255,.78));
    -webkit-backdrop-filter: blur(22px) saturate(170%); backdrop-filter: blur(22px) saturate(170%);
    border: 1px solid rgba(255,255,255,.85);
    box-shadow: 0 30px 60px rgba(16,44,37,.2), 0 6px 16px rgba(16,44,37,.1);
  }
  .fleet-bar::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 4px; background: linear-gradient(90deg, var(--h-teal-deep), var(--h-teal) 55%, var(--h-sun)); }
  .fleet-chips { display: flex; gap: 8px; flex-wrap: wrap; }
  .fleet-chip {
    display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 16px; border-radius: 100px; cursor: pointer; white-space: nowrap;
    background: #fff; color: var(--h-ink); border: 1px solid var(--h-line);
    font-family: 'Figtree', sans-serif; font-size: 14px; font-weight: 600;
    transition: background .2s, color .2s, border-color .2s, box-shadow .2s;
  }
  .fleet-chip small { font-size: 12.5px; font-weight: 700; color: var(--h-teal); font-variant-numeric: tabular-nums; }
  .fleet-chip:hover { border-color: var(--h-teal); color: var(--h-teal-deep); }
  .fleet-chip[aria-pressed="true"] { background: linear-gradient(180deg, #c2410c, #9a3412); border-color: #9a3412; color: #fff; box-shadow: 0 6px 14px rgba(194,65,12,.3), inset 0 1px 0 rgba(255,255,255,.3); }
  .fleet-chip[aria-pressed="true"] small { color: var(--h-mint); }
  .fleet-count { margin: 0; font-size: 14px; font-weight: 600; color: var(--h-ink-faint); }

  /* ══ Grid ══ */
  .fleet-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(255px, 1fr)); gap: 20px; }

  .fleet-card {
    display: flex; flex-direction: column; padding: 8px 8px 16px; border-radius: 24px;
    background: linear-gradient(135deg, rgba(255,255,255,.96), rgba(255,255,255,.86));
    border: 1px solid rgba(255,255,255,.9);
    box-shadow: 0 18px 40px rgba(16,44,37,.12), 0 3px 8px rgba(16,44,37,.06);
    transition: transform .28s var(--h-ease), box-shadow .28s var(--h-ease);
  }
  .fleet-card:hover { transform: translateY(-5px); box-shadow: 0 26px 52px rgba(16,44,37,.18), 0 4px 10px rgba(16,44,37,.08); }

  .fleet-image { position: relative; aspect-ratio: 4 / 3; border-radius: 17px; overflow: hidden; background: linear-gradient(135deg, #f3f7f2, #f3f7f2); }
  .fleet-image img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .5s var(--h-ease); }
  .fleet-card:hover .fleet-image img { transform: scale(1.04); }
  .fleet-tag {
    position: absolute; left: 10px; top: 10px; z-index: 1; padding: 5px 12px; border-radius: 100px;
    background: linear-gradient(180deg, #2f7d5b, var(--h-sun-deep)); color: var(--h-ink);
    font-size: 12.5px; font-weight: 700; line-height: 1.2; box-shadow: 0 6px 14px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.55);
  }

  .fleet-body { display: flex; flex-direction: column; flex: 1; padding: 16px 12px 0; }
  .fleet-name { margin: 0 0 2px; font-family: 'Bricolage Grotesque', sans-serif; font-size: 21px; font-weight: 800; letter-spacing: -.01em; line-height: 1.15; color: var(--h-ink); }
  .fleet-model { margin: 0 0 14px; font-size: 14px; font-weight: 500; color: var(--h-ink-faint); line-height: 1.3; }

  .fleet-specs { list-style: none; margin: 0 0 16px; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px 12px; }
  .fleet-specs li { display: flex; align-items: center; gap: 9px; font-size: 14px; font-weight: 600; color: var(--h-ink-soft); line-height: 1.25; min-width: 0; }
  .fleet-specs li:last-child { grid-column: 1 / -1; }
  .fleet-spec-icon { flex-shrink: 0; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--h-teal-deep); background: rgba(47,125,91,.1); border: 1px solid rgba(47,125,91,.16); }

  .fleet-price { margin-top: auto; display: flex; align-items: baseline; gap: 6px; padding: 14px 0 14px; border-top: 1px solid var(--h-line); }
  .fleet-price-from { font-size: 13.5px; font-weight: 600; color: var(--h-ink-faint); }
  .fleet-price-amount { font-family: 'Bricolage Grotesque', sans-serif; font-size: 30px; font-weight: 800; letter-spacing: -.02em; color: var(--h-teal-deep); line-height: 1; font-variant-numeric: tabular-nums; }
  .fleet-price-unit { font-size: 13.5px; font-weight: 600; color: var(--h-ink-faint); }
  .fleet-price-quote { font-family: 'Bricolage Grotesque', sans-serif; font-size: 20px; font-weight: 700; color: var(--h-teal-deep); }

  .fleet-button {
    display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; min-height: 46px; padding: 0 16px; border-radius: 14px; cursor: pointer;
    font-family: 'Figtree', sans-serif; font-size: 14.5px; font-weight: 700; text-decoration: none; border: none;
    color: #fff; background: linear-gradient(180deg, #c2410c, #9a3412); box-shadow: 0 8px 18px rgba(194,65,12,.38), inset 0 1px 0 rgba(255,255,255,.3);
    transition: transform .2s var(--h-ease), background .2s;
  }
  .fleet-button:hover { background: linear-gradient(180deg, #9a3412, #7c2d12); transform: translateY(-2px); }
  .fleet-button.sun { color: #fff; background: linear-gradient(180deg, #c2410c, #9a3412); box-shadow: 0 8px 18px rgba(194,65,12,.38), inset 0 1px 0 rgba(255,255,255,.3); }
  .fleet-button.sun:hover { background: linear-gradient(180deg, #9a3412, #7c2d12); }
  .fleet-button.outline { color: var(--h-teal-deep); background: #fff; border: 1px solid var(--h-teal); box-shadow: none; }
  .fleet-button.outline:hover { background: rgba(47,125,91,.08); }
  .fleet-button.inline { display: inline-flex; width: auto; padding: 0 22px; }

  /* ══ States ══ */
  .fleet-skel {
    border-radius: 24px; height: 440px; border: 1px solid rgba(255,255,255,.8);
    background: linear-gradient(100deg, rgba(255,255,255,.55) 30%, rgba(255,255,255,.9) 50%, rgba(255,255,255,.55) 70%);
    background-size: 200% 100%; animation: fleet-shimmer 1.4s linear infinite;
  }
  @keyframes fleet-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

  .fleet-state {
    grid-column: 1 / -1; text-align: center; padding: 52px 22px; border-radius: 24px;
    background: linear-gradient(135deg, rgba(255,255,255,.96), rgba(255,255,255,.86)); border: 1px solid rgba(255,255,255,.9);
    box-shadow: 0 18px 40px rgba(16,44,37,.12);
  }
  .fleet-state h3 { font-family: 'Bricolage Grotesque', sans-serif; margin: 0 0 8px; font-size: 26px; font-weight: 800; letter-spacing: -.01em; color: var(--h-ink); }
  .fleet-state p { margin: 0 auto 20px; max-width: 46ch; color: var(--h-ink-soft); font-size: 16px; line-height: 1.6; }
  .fleet-state-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }

  /* ══ Call to action: same treatment as the footer card ══ */
  .fleet-cta {
    position: relative; overflow: hidden; margin-top: 48px; padding: 34px 34px 32px; border-radius: 24px; color: #fff;
    background: radial-gradient(60% 90% at 100% 100%, rgba(47,125,91,.22), transparent 70%), linear-gradient(135deg, #2f7d5b, #173b32 60%, #102c25);
    display: flex; align-items: center; justify-content: space-between; gap: 20px 32px; flex-wrap: wrap;
    box-shadow: 0 26px 52px rgba(23,59,50,.35), inset 0 1px 0 rgba(255,255,255,.18);
  }
  .fleet-cta::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 4px; background: linear-gradient(90deg, rgba(255,255,255,.2), var(--h-sun)); }
  .fleet-cta h2 { font-family: 'Bricolage Grotesque', sans-serif; margin: 0 0 6px; font-size: clamp(22px, 2.6vw, 32px); font-weight: 800; letter-spacing: -.015em; line-height: 1.15; }
  .fleet-cta p { margin: 0; max-width: 46ch; font-size: 16px; font-weight: 500; color: rgba(255,255,255,.82); line-height: 1.55; }
  .fleet-cta-actions { display: flex; gap: 10px; flex-wrap: wrap; }
  .fleet-cta .fleet-button.ghost { color: #fff; background: linear-gradient(135deg, rgba(255,255,255,.22), rgba(255,255,255,.07)); border: 1px solid rgba(255,255,255,.35); box-shadow: inset 0 1px 0 rgba(255,255,255,.4); }
  .fleet-cta .fleet-button.ghost:hover { background: rgba(255,255,255,.2); }

  /* ══ Responsive ══ */
  @media (max-width: 900px) {
    .fleet-hero { padding: 40px 5vw 104px; }
    .fleet-shell { padding: 0 3.5vw 64px; margin-top: -60px; }
  }
  @media (max-width: 640px) {
    .fleet-bar { padding: 14px 14px 12px; border-radius: 20px; }
    /* one scrollable row of filters instead of wrapping onto several lines */
    .fleet-chips { flex-wrap: nowrap; overflow-x: auto; margin: 0 -14px; padding: 2px 14px 6px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
    .fleet-chips::-webkit-scrollbar { display: none; }
    .fleet-chip { min-height: 44px; flex-shrink: 0; }
  }
  @media (max-width: 520px) {
    .fleet-hero { padding: 32px 5vw 100px; }
    .fleet-grid { grid-template-columns: 1fr; }
    .fleet-button { min-height: 50px; }
    .fleet-cta { padding: 28px 20px 24px; }
    .fleet-cta-actions { width: 100%; flex-direction: column; }
    .fleet-cta-actions .fleet-button { width: 100%; }
  }
  @media (prefers-reduced-motion: reduce) {
    .fleet-hero-inner { animation: none; }
    .fleet-card, .fleet-button, .fleet-chip, .fleet-image img { transition: none; }
    .fleet-card:hover .fleet-image img { transform: none; }
    .fleet-skel { animation: none; }
  }
`;

const Arrow = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export default function FleetPage() {
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
        if (!res.ok) throw new Error("Failed to load vehicles");
        const data: Vehicle[] = await res.json();
        setVehicles(
          data
            .filter((v) => v.active)
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name))
        );
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.error("Fleet load error:", err);
        setError("We could not load the fleet.");
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
    v ? `${WHATSAPP}?text=${encodeURIComponent(`Hello, I would like to book the ${v.name} (${v.model}).`)}` : WHATSAPP;

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
    <main className="fleet-page">
      <style>{STYLES}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="fleet-hero">
        <div className="fleet-hero-inner">
          <p className="fleet-kicker">Cars, vans and buses with a driver</p>
          <h1 className="fleet-title">Choose your perfect ride</h1>
          <p className="fleet-subtitle">
            Clean, comfortable, well-maintained vehicles for every group size. Pick one, then book online or message us.
          </p>
        </div>
      </div>

      <div className="fleet-shell">
        <div className="fleet-bar">
          <div className="fleet-chips" role="group" aria-label="Filter by group size">
            {SIZES.map((s) => (
              <button key={s.key} type="button" className="fleet-chip" aria-pressed={size === s.key} onClick={() => setSize(s.key)}>
                {s.label}
                {!loading && !error && <small>{counts[s.key]}</small>}
              </button>
            ))}
          </div>
          <p className="fleet-count" aria-live="polite">
            {loading ? "Loading fleet…" : error ? "" : `${visible.length} ${visible.length === 1 ? "vehicle" : "vehicles"} available`}
          </p>
        </div>

        <div className="fleet-grid">
          {loading && [0, 1, 2, 3].map((i) => <div key={i} className="fleet-skel" aria-hidden="true" />)}

          {!loading && error && (
            <div className="fleet-state" role="alert">
              <h3>{error}</h3>
              <p>Check your connection and try again, or message us and we will recommend a vehicle for your trip.</p>
              <div className="fleet-state-actions">
                <button type="button" className="fleet-button sun inline" onClick={() => setReloadKey((k) => k + 1)}>Try again</button>
                <a href={waLink()} target="_blank" rel="noopener noreferrer" className="fleet-button outline inline">WhatsApp us</a>
              </div>
            </div>
          )}

          {!loading && !error && visible.length === 0 && (
            <div className="fleet-state">
              <h3>{vehicles.length === 0 ? "No vehicles listed yet" : "No vehicles for this group size"}</h3>
              <p>
                {vehicles.length === 0
                  ? "Our fleet is being updated. Message us and we will arrange a vehicle for your trip."
                  : "Try a different group size, or message us and we will find a vehicle that fits."}
              </p>
              <div className="fleet-state-actions">
                {vehicles.length > 0 && (
                  <button type="button" className="fleet-button sun inline" onClick={() => setSize("all")}>Show all vehicles</button>
                )}
                <a href={waLink()} target="_blank" rel="noopener noreferrer" className="fleet-button outline inline">WhatsApp us</a>
              </div>
            </div>
          )}

          {!loading && !error && visible.map((vehicle) => (
            <article key={vehicle.id} className="fleet-card">
              <div className="fleet-image">
                {vehicle.tag && <span className="fleet-tag">{vehicle.tag}</span>}
                <img
                  src={vehicle.img || FALLBACK_IMG}
                  alt={`${vehicle.name} ${vehicle.model}`.trim()}
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    const target = event.currentTarget as HTMLImageElement;
                    if (!target.src.endsWith(FALLBACK_IMG)) target.src = FALLBACK_IMG;
                  }}
                />
              </div>

              <div className="fleet-body">
                <h2 className="fleet-name">{vehicle.name}</h2>
                {vehicle.model && <p className="fleet-model">{vehicle.model}</p>}

                <ul className="fleet-specs">
                  <li>
                    <span className="fleet-spec-icon" aria-hidden="true">
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="3.5" />
                        <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
                      </svg>
                    </span>
                    {vehicle.maxPassengers} passengers
                  </li>
                  <li>
                    <span className="fleet-spec-icon" aria-hidden="true">
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="5" y="7" width="14" height="13" rx="2" />
                        <path d="M9 7V4h6v3M9 11v5M15 11v5" />
                      </svg>
                    </span>
                    {vehicle.maxLuggage} luggage
                  </li>
                  <li>
                    <span className="fleet-spec-icon" aria-hidden="true">
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="4" width="10" height="16" rx="1.5" />
                        <path d="M4 10h10M14 8h2.5a1.5 1.5 0 011.5 1.5V16a1.5 1.5 0 003 0V9l-2.5-2.5" />
                      </svg>
                    </span>
                    {vehicle.special || "Air-conditioned"}
                  </li>
                </ul>

                <div className="fleet-price">
                  {vehicle.price ? (
                    <>
                      <span className="fleet-price-from">From</span>
                      <span className="fleet-price-amount">{CURRENCY}{vehicle.price}</span>
                      <span className="fleet-price-unit">/ trip</span>
                    </>
                  ) : (
                    <span className="fleet-price-quote">Custom quote</span>
                  )}
                </div>

                <Link href={`/reservation?vehicleId=${encodeURIComponent(vehicle.id)}`} className="fleet-button">
                  Book now <Arrow />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <section className="fleet-cta" aria-labelledby="fleet-cta-heading">
          <div>
            <h2 id="fleet-cta-heading">Not sure which vehicle fits?</h2>
            <p>Tell us your group size, luggage and route and we will recommend one with a fixed fare.</p>
          </div>
          <div className="fleet-cta-actions">
            <Link href="/reservation" className="fleet-button sun inline">Book now <Arrow /></Link>
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="fleet-button ghost inline">WhatsApp us</a>
          </div>
        </section>
      </div>
    </main>
  );
}