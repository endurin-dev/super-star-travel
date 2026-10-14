"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────
   Edit these — everything else is data-driven
   ───────────────────────────────────────────── */
const BRAND     = "Super Star Travel";
const BG_IMAGE  = "";                        // optional faint decorative image, e.g. "/images/palm-leaves.webp"
const GAP       = 18;                        // px gap between review cards (keep in sync with .why-track gap)

type Feature = { icon: "shield" | "clock" | "star" | "pin"; title: string; lines: [string, string] };
type Review  = { name: string; country: string; text: string; rating: number; avatar?: string };

const FEATURES: Feature[] = [
  { icon: "shield", title: "Safe and professional", lines: ["Experienced drivers and", "well-maintained vehicles"] },
  { icon: "clock",  title: "24/7 support",          lines: ["We are always here", "when you need us"] },
  { icon: "star",   title: "Top rated",             lines: ["Trusted by thousands", "of travellers"] },
  { icon: "pin",    title: "Explore Sri Lanka",     lines: ["Airport transfers, tours", "and car rentals"] },
];

// Only publish reviews that are real and that you have permission to show.
const REVIEWS: Review[] = [
  { name: "Sarah Williams", country: "United Kingdom", rating: 5, avatar: "/images/reviews/sarah.webp",
    text: "Excellent service! The driver was on time, very friendly and the car was spotless. Highly recommended!" },
  { name: "Michael Tan", country: "Singapore", rating: 5, avatar: "/images/reviews/michael.webp",
    text: "We booked a van for our family trip. Everything was smooth and professional. Great experience!" },
  { name: "Anna Müller", country: "Germany", rating: 5, avatar: "/images/reviews/anna.webp",
    text: "Comfortable ride, fair price and amazing support. Will definitely use again!" },
  // Add more — the carousel scrolls.
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap');

  .why-section {
    --h-ink:       #173b32;
    --h-ink-soft:  rgba(23,59,50,.82);
    --h-ink-faint: rgba(23,59,50,.66);
    --h-teal:      #2f7d5b;
    --h-teal-deep: #173b32;
    --h-sun:       #2f7d5b;
    --h-sun-deep:  #245e46;
    --h-line:      rgba(23,59,50,.12);
    --h-ease:      cubic-bezier(.25,.1,.25,1);

    position: relative; overflow: hidden; padding: 64px 5vw 72px;
    font-family: 'Figtree', system-ui, sans-serif; color: var(--h-ink);
    background:
      radial-gradient(60% 50% at 92% 90%, rgba(47,125,91,.22), transparent 70%),
      radial-gradient(70% 55% at 4% 40%, rgba(47,125,91,.16), transparent 70%),
      #f3f7f2;
  }
  .why-section *, .why-section *::before, .why-section *::after { box-sizing: border-box; }
  .why-section :focus-visible { outline: 3px solid var(--h-teal); outline-offset: 2px; border-radius: 10px; }
  .why-bg { position: absolute; top: 0; right: 0; width: min(34%, 420px); height: 100%; background-size: cover; background-position: left center; opacity: .14; pointer-events: none; }
  .why-shell { position: relative; max-width: 1240px; margin: 0 auto; }

  /* ── Heading ── */
  .why-title { font-family: 'Bricolage Grotesque', sans-serif; margin: 0 0 8px; font-size: clamp(30px, 3.8vw, 48px); font-weight: 800; line-height: 1.06; letter-spacing: -.02em; }
  .why-subtitle { margin: 0 0 32px; max-width: 52ch; font-family: 'Bricolage Grotesque', sans-serif; font-size: clamp(17px, 1.8vw, 22px); font-weight: 600; line-height: 1.35; color: var(--h-teal); }

  /* ── Features: one frosted panel, four columns ── */
  .why-features {
    position: relative; overflow: hidden; list-style: none; margin: 0 0 48px; padding: 28px 8px; border-radius: 26px;
    display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
    background: linear-gradient(135deg, rgba(255,255,255,.94), rgba(255,255,255,.8));
    -webkit-backdrop-filter: blur(20px) saturate(170%); backdrop-filter: blur(20px) saturate(170%);
    border: 1px solid rgba(255,255,255,.85); box-shadow: 0 26px 56px rgba(16,44,37,.14), 0 4px 12px rgba(16,44,37,.06);
  }
  .why-features::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 4px; background: linear-gradient(90deg, var(--h-teal-deep), var(--h-teal) 55%, var(--h-sun)); }
  .why-feature { display: flex; align-items: center; gap: 16px; padding: 6px 24px; }
  .why-feature + .why-feature { border-left: 1px solid var(--h-line); }
  .why-feature-icon {
    flex-shrink: 0; width: 56px; height: 56px; border-radius: 50%; display: grid; place-items: center; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(180deg, #2f7d5b, var(--h-teal-deep)); box-shadow: 0 8px 18px rgba(23,59,50,.32), inset 0 1.5px 0 rgba(255,255,255,.35);
  }
  .why-feature-icon::before { content: ""; position: absolute; left: 10%; right: 10%; top: 3%; height: 46%; border-radius: 50%; background: linear-gradient(180deg, rgba(255,255,255,.4), rgba(255,255,255,0)); pointer-events: none; }
  .why-feature-icon svg { position: relative; width: 28px; height: 28px; }
  .why-feature-title { margin: 0 0 4px; font-family: 'Bricolage Grotesque', sans-serif; font-size: 18px; font-weight: 700; letter-spacing: -.01em; line-height: 1.2; }
  .why-feature-text { margin: 0; font-size: 14.5px; font-weight: 500; line-height: 1.45; color: var(--h-ink-soft); }

  /* ── Reviews ── */
  .why-reviews-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
  .why-reviews-title { font-family: 'Bricolage Grotesque', sans-serif; margin: 0; font-size: clamp(22px, 2.4vw, 30px); font-weight: 800; letter-spacing: -.015em; }
  .why-arrows { display: flex; gap: 10px; flex-shrink: 0; }
  .why-arrow {
    width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; padding: 0; cursor: pointer; color: #fff;
    background: linear-gradient(180deg, #c2410c, #9a3412); border: none; box-shadow: 0 8px 18px rgba(194,65,12,.32), inset 0 1px 0 rgba(255,255,255,.3);
    transition: transform .2s var(--h-ease), background .2s, opacity .2s;
  }
  .why-arrow:hover:not(:disabled) { background: linear-gradient(180deg, #9a3412, #7c2d12); transform: translateY(-2px); }
  .why-arrow:disabled { opacity: .35; cursor: default; box-shadow: none; }

  .why-track {
    display: flex; gap: ${GAP}px; min-width: 0; padding: 6px 4px 18px; margin: 0 -4px;
    overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth;
    scrollbar-width: none; -ms-overflow-style: none;
  }
  .why-track::-webkit-scrollbar { display: none; }

  .why-card {
    flex: 0 0 calc((100% - ${GAP * 2}px) / 3); scroll-snap-align: start; margin: 0;
    display: flex; align-items: flex-start; gap: 16px; padding: 22px 22px 20px; border-radius: 24px;
    background: linear-gradient(135deg, rgba(255,255,255,.96), rgba(255,255,255,.86)); border: 1px solid rgba(255,255,255,.9);
    box-shadow: 0 18px 40px rgba(16,44,37,.12), 0 3px 8px rgba(16,44,37,.06);
  }
  .why-avatar {
    flex-shrink: 0; width: 60px; height: 60px; border-radius: 50%; overflow: hidden; display: grid; place-items: center;
    font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 20px; color: var(--h-teal-deep);
    background: linear-gradient(145deg, #e8f1e8, #d9e8d8); box-shadow: 0 0 0 3px #fff, 0 0 0 5px rgba(47,125,91,.25);
  }
  .why-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .why-card-body { min-width: 0; display: flex; flex-direction: column; gap: 12px; }
  .why-quote { margin: 0; font-size: 15.5px; font-weight: 500; line-height: 1.6; color: var(--h-ink); }
  .why-meta { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 6px 12px; }
  .why-name { display: block; font-size: 14.5px; font-weight: 700; line-height: 1.2; }
  .why-country { display: block; font-size: 13.5px; font-weight: 500; color: var(--h-ink-faint); margin-top: 2px; }
  .why-stars { display: flex; gap: 2px; fill: var(--h-sun); flex-shrink: 0; filter: drop-shadow(0 1px 1px rgba(36,94,70,.35)); }

  /* ── Responsive ── */
  @media (max-width: 1100px) {
    .why-features { grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: 22px; padding: 26px 8px; }
    .why-feature:nth-child(odd)  { border-left: none; }
    .why-feature:nth-child(even) { border-left: 1px solid var(--h-line); }
    .why-card { flex-basis: calc((100% - ${GAP}px) / 2); }
  }
  @media (max-width: 700px) {
    .why-section { padding: 48px 4vw 56px; }
    .why-features { grid-template-columns: 1fr; row-gap: 0; padding: 8px 18px; border-radius: 22px; }
    .why-feature, .why-feature:nth-child(even) { border-left: none; padding: 16px 0; }
    .why-feature + .why-feature { border-top: 1px solid var(--h-line); }
    .why-arrows { display: none; }                 /* swipe on touch */
    .why-card { flex-basis: 86%; padding: 20px 18px 18px; }   /* next card peeks in, so the row reads as swipeable */
    .why-track { padding-right: 4vw; }
  }
  @media (prefers-reduced-motion: reduce) {
    .why-track { scroll-behavior: auto; }
    .why-arrow { transition: none; }
  }
`;

const ICONS: Record<Feature["icon"], JSX.Element> = {
  shield: (<><path d="M24 5l15 6v11c0 10-6.5 17.5-15 21C15.5 39.5 9 32 9 22V11l15-6z" /><path d="M17 24l5 5 9-10" /></>),
  clock:  (<><circle cx="24" cy="24" r="18" /><path d="M24 13v11l7 5" /></>),
  star:   (<path d="M24 6l5.4 11 12.1 1.7-8.8 8.5 2.1 12L24 33.6 13.2 39.2l2.1-12-8.8-8.5L18.6 17 24 6z" />),
  pin:    (<><path d="M24 43s14-12.5 14-23A14 14 0 0010 20c0 10.5 14 23 14 23z" /><circle cx="24" cy="20" r="5" /></>),
};

const Chevron = ({ dir }: { dir: "left" | "right" }) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
  </svg>
);

const Star = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2l3 6.9 7.5.7-5.7 5 1.7 7.4L12 18.1 5.5 22l1.7-7.4-5.7-5 7.5-.7L12 2z" />
  </svg>
);

const initials = (name: string) => name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

function Avatar({ review }: { review: Review }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="why-avatar">
      {review.avatar && !failed ? (
        <img src={review.avatar} alt={`${review.name}, ${review.country}`} loading="lazy" decoding="async" width={60} height={60} onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{initials(review.name)}</span>
      )}
    </div>
  );
}

export default function WhyChooseUs() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [updateArrows]);

  const scrollByCard = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".why-card");
    const step = card ? card.offsetWidth + GAP : el.clientWidth;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <section className="why-section" aria-labelledby="why-heading">
      <style>{STYLES}</style>
      {BG_IMAGE && <div className="why-bg" style={{ backgroundImage: `url(${BG_IMAGE})` }} aria-hidden="true" />}

      <div className="why-shell">
        <h2 id="why-heading" className="why-title">Why choose {BRAND}?</h2>
        <p className="why-subtitle">More than just a ride. A better way to explore Sri Lanka.</p>

        <ul className="why-features">
          {FEATURES.map((f) => (
            <li key={f.title} className="why-feature">
              <span className="why-feature-icon" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  {ICONS[f.icon]}
                </svg>
              </span>
              <div>
                <h3 className="why-feature-title">{f.title}</h3>
                <p className="why-feature-text">
                  {f.lines[0]}
                  {f.lines[1] && (<><br />{f.lines[1]}</>)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="why-reviews-head">
          <h3 className="why-reviews-title">What our customers say</h3>
          <div className="why-arrows">
            <button type="button" className="why-arrow" aria-label="Previous reviews" disabled={!canPrev} onClick={() => scrollByCard(-1)}><Chevron dir="left" /></button>
            <button type="button" className="why-arrow" aria-label="Next reviews" disabled={!canNext} onClick={() => scrollByCard(1)}><Chevron dir="right" /></button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="why-track"
          onScroll={updateArrows}
          role="region"
          aria-roledescription="carousel"
          aria-label="Customer reviews"
          tabIndex={0}
        >
          {REVIEWS.map((r) => (
            <figure key={r.name} className="why-card">
              <Avatar review={r} />
              <div className="why-card-body">
                <blockquote className="why-quote" style={{ margin: 0 }}>&ldquo;{r.text}&rdquo;</blockquote>
                <figcaption className="why-meta">
                  <span>
                    <span className="why-name">{r.name}</span>
                    <span className="why-country">{r.country}</span>
                  </span>
                  <span className="why-stars" role="img" aria-label={`${r.rating} out of 5 stars`}>
                    {Array.from({ length: r.rating }).map((_, i) => <Star key={i} />)}
                  </span>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}