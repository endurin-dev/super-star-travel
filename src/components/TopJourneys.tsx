"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Rate {
  fromLocId: string;
  toLocId: string;
  fromLocName: string;
  toLocName: string;
  p1: number | null;
  active: boolean;
  onDemand: boolean;
}

interface Journey {
  fromLocId: string;
  toLocId: string;
  from: string;
  to: string;
  price: number;
}

const CURRENCY = "$";
const MAX_JOURNEYS = 4;

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap');

  .journeys-section {
    --h-ink:       #173b32;
    --h-ink-faint: rgba(23,59,50,.66);
    --h-teal:      #2f7d5b;
    --h-teal-deep: #173b32;
    --h-sun:       #2f7d5b;
    --h-sun-deep:  #245e46;
    --h-mint:      #bed3bf;
    --h-ease:      cubic-bezier(.25,.1,.25,1);

    position: relative; overflow: hidden; padding: 56px 5vw 60px; color: #fff;
    background: #173b32 url('/images/banner.webp') center 43% / cover no-repeat;
    font-family: 'Figtree', system-ui, sans-serif;
  }
  .journeys-section *, .journeys-section *::before, .journeys-section *::after { box-sizing: border-box; }
  .journeys-section :focus-visible { outline: 3px solid var(--h-sun); outline-offset: 3px; border-radius: 12px; }
  /* teal scrim: dark behind the copy, lets the photo show on the right */
  .journeys-section::before {
    content: ""; position: absolute; inset: 0; pointer-events: none;
    background:
      linear-gradient(90deg, rgba(6,40,34,.94) 0%, rgba(23,59,50,.8) 32%, rgba(23,59,50,.38) 100%),
      linear-gradient(0deg, rgba(6,40,34,.35) 0%, transparent 40%);
  }
  .journeys-shell {
    position: relative; z-index: 1; max-width: 1440px; margin: 0 auto;
    display: grid; grid-template-columns: minmax(250px, 1fr) repeat(4, minmax(170px, 1fr)); gap: 16px; align-items: stretch;
  }

  /* ── Copy ── */
  .journeys-copy { align-self: center; padding: 4px 18px 4px 0; }
  .journeys-kicker {
    display: inline-block; margin-bottom: 14px; padding: 5px 14px; border-radius: 100px; font-size: 13.5px; font-weight: 600; color: #fff;
    background: linear-gradient(135deg, rgba(255,255,255,.26), rgba(255,255,255,.08));
    -webkit-backdrop-filter: blur(14px) saturate(180%); backdrop-filter: blur(14px) saturate(180%);
    border: 1px solid rgba(255,255,255,.4); box-shadow: 0 6px 18px rgba(0,0,0,.18), inset 0 1.5px 0 rgba(255,255,255,.5);
  }
  .journeys-title { margin: 0 0 8px; font-family: 'Bricolage Grotesque', sans-serif; font-size: clamp(30px, 3.2vw, 46px); font-weight: 800; letter-spacing: -.02em; line-height: 1.04; text-shadow: 0 2px 20px rgba(0,0,0,.3); }
  .journeys-subtitle { margin: 0 0 20px; font-family: 'Bricolage Grotesque', sans-serif; font-size: clamp(16px, 1.5vw, 20px); font-weight: 600; line-height: 1.35; color: var(--h-mint); max-width: 28ch; text-shadow: 0 1px 12px rgba(0,0,0,.3); }
  .journeys-all {
    display: inline-flex; align-items: center; gap: 8px; height: 46px; padding: 0 22px; border-radius: 100px; font-size: 15px; font-weight: 700; text-decoration: none;
    color: #fff; background: linear-gradient(180deg, #c2410c, #9a3412); box-shadow: 0 8px 18px rgba(194,65,12,.38), inset 0 1px 0 rgba(255,255,255,.3);
    transition: transform .2s var(--h-ease), background .2s, gap .2s;
  }
  .journeys-all:hover { gap: 12px; background: linear-gradient(180deg, #9a3412, #7c2d12); transform: translateY(-2px); }

  /* ── Route cards: frosted white, route is the hero ── */
  .journey-card {
    position: relative; min-width: 0; display: flex; flex-direction: column; padding: 7px 7px 16px; border-radius: 22px; text-decoration: none; color: var(--h-ink);
    background: linear-gradient(135deg, rgba(255,255,255,.97), rgba(255,255,255,.88)); border: 1px solid rgba(255,255,255,.9);
    box-shadow: 0 18px 40px rgba(2,24,20,.3), 0 3px 8px rgba(2,24,20,.12);
    transition: transform .25s var(--h-ease), box-shadow .25s var(--h-ease);
  }
  .journey-card:hover { transform: translateY(-5px); box-shadow: 0 26px 52px rgba(2,24,20,.38), 0 4px 10px rgba(2,24,20,.14); }
  .journey-image { display: block; width: 100%; height: 64px; margin-bottom: 16px; border-radius: 16px; background-image: url('/images/banner.webp'); background-size: cover; background-position: center; }
  .journey-card:nth-child(2) .journey-image { background-position: 18% 55%; }
  .journey-card:nth-child(3) .journey-image { background-position: 43% 65%; }
  .journey-card:nth-child(4) .journey-image { background-position: 67% 48%; }
  .journey-card:nth-child(5) .journey-image { background-position: 88% 54%; }
  .journey-body { display: flex; flex-direction: column; flex: 1; padding: 0 12px; }

  /* Route: origin and destination stacked, joined by a dotted line */
  .journey-route { position: relative; display: flex; flex-direction: column; gap: 14px; padding-left: 28px; margin-bottom: 18px; }
  .journey-stop { position: relative; display: block; min-width: 0; }
  .journey-stop::before {
    content: ""; position: absolute; left: -28px; top: 18px; width: 14px; height: 14px; border-radius: 50%;
    background: #fff; border: 3px solid var(--h-teal);
  }
  .journey-stop:last-child::before {
    background: var(--h-sun); border-color: var(--h-sun-deep);
    box-shadow: 0 0 0 4px rgba(47,125,91,.28);
  }
  .journey-stop:first-child::after {
    content: ""; position: absolute; left: -22px; top: 36px; height: calc(100% - 4px); width: 0;
    border-left: 2px dotted rgba(47,125,91,.5);
  }
  .journey-stop-label { display: block; font-size: 12.5px; font-weight: 600; line-height: 1.2; color: var(--h-ink-faint); }
  .journey-stop-name {
    display: block; margin-top: 3px; font-family: 'Bricolage Grotesque', sans-serif; font-size: 18px; font-weight: 700;
    letter-spacing: -.01em; line-height: 1.2; overflow-wrap: anywhere;
  }

  .journey-foot { display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; margin-top: auto; padding-top: 12px; border-top: 1px solid rgba(23,59,50,.1); }
  .journey-from { display: block; font-size: 12.5px; font-weight: 600; color: var(--h-ink-faint); line-height: 1.2; }
  .journey-price { display: block; margin-top: 2px; font-family: 'Bricolage Grotesque', sans-serif; font-size: 24px; font-weight: 800; letter-spacing: -.02em; line-height: 1; color: var(--h-teal-deep); font-variant-numeric: tabular-nums; }
  .journey-go {
    flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; color: #fff;
    background: linear-gradient(180deg, #c2410c, #9a3412); box-shadow: 0 6px 14px rgba(194,65,12,.35), inset 0 1px 0 rgba(255,255,255,.3);
    transition: background .2s, transform .2s var(--h-ease);
  }
  .journey-card:hover .journey-go { background: linear-gradient(180deg, #c2410c, #9a3412); color: #fff; transform: translateX(2px); }

  /* ── Loading placeholders ── */
  .journey-skel {
    min-height: 250px; border-radius: 22px; border: 1px solid rgba(255,255,255,.35);
    background: linear-gradient(100deg, rgba(255,255,255,.14) 30%, rgba(255,255,255,.3) 50%, rgba(255,255,255,.14) 70%);
    background-size: 200% 100%; animation: journey-shimmer 1.4s linear infinite;
  }
  @keyframes journey-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

  /* ── Responsive ── */
  @media (max-width: 1100px) {
    .journeys-shell { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .journeys-copy { grid-column: 1 / -1; padding: 0 0 6px; }
  }
  @media (max-width: 860px) {
    .journeys-shell { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 680px) {
    .journeys-section { padding: 44px 0 48px 5vw; background-position: 44% center; }
    .journeys-section::before { background: linear-gradient(180deg, rgba(6,40,34,.9) 0%, rgba(23,59,50,.78) 100%); }
    /* one swipeable row; the next card peeks in */
    .journeys-shell { display: flex; flex-wrap: nowrap; gap: 12px; padding-right: 5vw; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -webkit-overflow-scrolling: touch; align-items: stretch; }
    .journeys-shell::-webkit-scrollbar { display: none; }
    .journeys-copy { flex: 0 0 100%; padding: 0 5vw 8px 0; scroll-snap-align: start; }
    .journey-card, .journey-skel { flex: 0 0 74%; scroll-snap-align: start; }
    .journeys-all { width: 100%; justify-content: center; height: 50px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .journeys-all, .journey-card, .journey-go { transition: none; }
    .journey-skel { animation: none; }
  }
`;

export default function TopJourneys() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rates")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load rates");
        const rates: Rate[] = await response.json();
        const cheapestByRoute = new Map<string, Journey>();

        rates.forEach((rate) => {
          if (!rate.active || rate.onDemand || rate.p1 == null) return;

          const key = `${rate.fromLocId}:${rate.toLocId}`;
          const current = cheapestByRoute.get(key);
          if (!current || rate.p1 < current.price) {
            cheapestByRoute.set(key, {
              fromLocId: rate.fromLocId,
              toLocId: rate.toLocId,
              from: rate.fromLocName,
              to: rate.toLocName,
              price: rate.p1,
            });
          }
        });

        setJourneys(
          Array.from(cheapestByRoute.values())
            .sort((a, b) => a.price - b.price)
            .slice(0, MAX_JOURNEYS),
        );
      })
      .catch(() => setJourneys([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && journeys.length === 0) return null;

  return (
    <section className="journeys-section" aria-labelledby="journeys-heading" aria-busy={loading}>
      <style>{STYLES}</style>
      <div className="journeys-shell">
        <div className="journeys-copy">
          <span className="journeys-kicker">Featured routes</span>
          <h2 id="journeys-heading" className="journeys-title">Top journeys</h2>
          <p className="journeys-subtitle">Fixed fares for popular routes across Sri Lanka.</p>
          <Link href="/rates" className="journeys-all">View all routes <ArrowIcon /></Link>
        </div>

        {loading ? (
          [0, 1, 2, 3].map((i) => <div key={i} className="journey-skel" aria-hidden="true" />)
        ) : journeys.map((journey) => {
          const params = new URLSearchParams({
            from: journey.fromLocId,
            to: journey.toLocId,
            passengers: "1",
            kids: "0",
            tripType: "one-way",
          });

          return (
            <Link
              key={`${journey.fromLocId}-${journey.toLocId}`}
              href={`/reservation?${params.toString()}`}
              className="journey-card"
              aria-label={`${journey.from} to ${journey.to}, from ${CURRENCY}${journey.price}`}
            >
              <span className="journey-image" aria-hidden="true" />
              <span className="journey-body">
                <span className="journey-route">
                  <span className="journey-stop">
                    <span className="journey-stop-label">From</span>
                    <span className="journey-stop-name">{journey.from}</span>
                  </span>
                  <span className="journey-stop">
                    <span className="journey-stop-label">To</span>
                    <span className="journey-stop-name">{journey.to}</span>
                  </span>
                </span>
                <span className="journey-foot">
                  <span>
                    <span className="journey-from">Fare from</span>
                    <span className="journey-price">{CURRENCY}{journey.price}</span>
                  </span>
                  <span className="journey-go" aria-hidden="true"><ArrowIcon /></span>
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}