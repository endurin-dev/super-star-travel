import type { ReactNode } from "react";

/* ─────────────────────────────────────────────
   Edit the text here. Icons are a matched set of
   inline SVGs (same grid, stroke weight and style),
   shown inside glossy teal "jelly" badges.
   ───────────────────────────────────────────── */
type Item = { title: string; sub: string; icon: ReactNode };

const svgProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const ITEMS: Item[] = [
  {
    title: "Fixed & Transparent Pricing",
    sub: "No hidden fees",
    icon: (
      <svg {...svgProps}>
        <circle cx="12" cy="12" r="10" />
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
        <path d="M12 18V6" />
      </svg>
    ),
  },
  {
    title: "Safe & Professional Drivers",
    sub: "Licensed & experienced",
    icon: (
      <svg {...svgProps}>
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "24/7 Support",
    sub: "We're always here",
    icon: (
      <svg {...svgProps}>
        <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z" />
        <path d="M21 16v2a4 4 0 0 1-4 4h-5" />
      </svg>
    ),
  },
  {
    title: "Top Rated Service",
    sub: "Trusted by thousands",
    icon: (
      <svg {...svgProps}>
        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
      </svg>
    ),
  },
  {
    title: "Explore Sri Lanka",
    sub: "Airport · Tours · Rentals",
    icon: (
      <svg {...svgProps}>
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    title: "Buses, Cars, Vans & Scooters",
    sub: "A ride for every trip",
    icon: (
      <svg {...svgProps}>
        <path d="M8 6v6" />
        <path d="M15 6v6" />
        <path d="M2 12h19.6" />
        <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
        <circle cx="7" cy="18" r="2" />
        <path d="M9 18h5" />
        <circle cx="16" cy="18" r="2" />
      </svg>
    ),
  },
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap');

  .trust-bar {
    --h-ink:       #173b32;
    --h-ink-soft:  rgba(23,59,50,.82);
    --h-teal:      #2f7d5b;
    --h-teal-deep: #173b32;
    --h-sun:       #2f7d5b;
    --h-line:      rgba(23,59,50,.12);

    position: relative; overflow: hidden; padding: 56px 5vw;
    font-family: 'Figtree', system-ui, sans-serif; color: var(--h-ink);
    background: #fff;
  }
  .trust-bar *, .trust-bar *::before, .trust-bar *::after { box-sizing: border-box; }

  /* ── One frosted panel, six columns ── */
  .trust-list {
    position: relative; overflow: hidden; max-width: 1320px; margin: 0 auto; padding: 26px 8px; list-style: none;
    border-radius: 26px;
    display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); align-items: center;
    background: #fff;
    border: 1px solid rgba(23,59,50,.08);
    box-shadow: 0 22px 48px rgba(16,44,37,.12), 0 3px 10px rgba(16,44,37,.06);
  }
  .trust-list::before {
    content: ""; position: absolute; left: 0; right: 0; top: 0; height: 4px;
    background: linear-gradient(90deg, var(--h-teal-deep), var(--h-teal) 55%, var(--h-sun));
  }
  .trust-item { display: flex; align-items: center; gap: 12px; padding: 6px 16px; min-width: 0; }
  .trust-item + .trust-item { border-left: 1px solid var(--h-line); }

  /* ── Glossy teal "jelly" badge ── */
  .trust-icon {
    flex-shrink: 0; position: relative; overflow: hidden;
    width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center; color: #fff;
    background: linear-gradient(180deg, #2f7d5b, var(--h-teal-deep));
    box-shadow: 0 8px 18px rgba(23,59,50,.32), inset 0 1.5px 0 rgba(255,255,255,.35);
  }
  .trust-icon::before {
    content: ""; position: absolute; left: 10%; right: 10%; top: 3%; height: 46%; border-radius: 50%;
    background: linear-gradient(180deg, rgba(255,255,255,.4), rgba(255,255,255,0)); pointer-events: none;
  }
  .trust-icon svg { position: relative; width: 24px; height: 24px; }

  .trust-text { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .trust-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 15.5px; font-weight: 700; letter-spacing: -.01em; line-height: 1.2; color: var(--h-ink); }
  .trust-sub   { font-size: 13.5px; font-weight: 500; line-height: 1.35; color: var(--h-ink-soft); }

  /* ── Responsive ── */
  @media (max-width: 1199px) {
    .trust-list { grid-template-columns: repeat(3, minmax(0, 1fr)); padding: 12px 8px; }
    .trust-item { padding: 18px 22px; }
    .trust-item + .trust-item { border-left: none; }
    .trust-item:not(:nth-child(3n+1)) { border-left: 1px solid var(--h-line); }
    .trust-item:nth-child(n+4) { border-top: 1px solid var(--h-line); }
  }
  @media (max-width: 699px) {
    .trust-bar { padding: 44px 4vw; }
    .trust-list { grid-template-columns: repeat(2, minmax(0, 1fr)); border-radius: 22px; }
    .trust-item, .trust-item + .trust-item, .trust-item:not(:nth-child(3n+1)), .trust-item:nth-child(n+4) { border: 0; }
    .trust-item { padding: 16px 14px; }
    .trust-item:nth-child(even) { border-left: 1px solid var(--h-line); }
    .trust-item:nth-child(n+3)  { border-top: 1px solid var(--h-line); }
    .trust-icon { width: 44px; height: 44px; }
    .trust-title { font-size: 14.5px; }
    .trust-sub { font-size: 13px; }
  }
  @media (max-width: 440px) {
    .trust-list { grid-template-columns: 1fr; padding: 8px 18px; }
    .trust-item:nth-child(even), .trust-item:nth-child(n+3) { border: 0; }
    .trust-item { padding: 16px 0; }
    .trust-item + .trust-item { border-top: 1px solid var(--h-line); }
  }
`;

export default function TrustBar() {
  return (
    <section className="trust-bar" aria-label="Why travellers choose us">
      <style>{STYLES}</style>
      <ul className="trust-list">
        {ITEMS.map((item) => (
          <li key={item.title} className="trust-item">
            <span className="trust-icon" aria-hidden="true">{item.icon}</span>
            <span className="trust-text">
              <span className="trust-title">{item.title}</span>
              <span className="trust-sub">{item.sub}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}