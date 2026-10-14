"use client";
import { useState, useEffect, type MouseEvent } from "react";

/* ─────────────────────────────────────────────
   Edit these once — used across the whole hero
   and in the JSON-LD structured data.
   ───────────────────────────────────────────── */
const BRAND         = "Super Star Travel";           // TODO: your business name
const SITE_URL      = "https://www.superstartravelcabs.com";
const PHONE_DISPLAY = "+94 72 680 3498";
const PHONE_TEL     = "+94726803498";
const WHATSAPP_URL  = "https://wa.me/94726803498";
const CURRENCY      = "$";                           // must match the currency stored in your /api/rates

const MAX_ADULTS = 16;
const MAX_KIDS   = 6;

interface Rate {
  fromLocId: string; toLocId: string; vehicleId: string;
  p1: number|null; p2: number|null; p3: number|null; p4: number|null;
  p5: number|null; p6: number|null; p7: number|null; p8: number|null;
  onDemand: boolean; active: boolean;
}
interface Location {
  id: string; name: string; categoryIcon: string; categoryName: string; active: boolean;
}

/* Open the native date/time picker when the person taps anywhere on the field,
   not just on the tiny calendar icon. Falls back silently where unsupported. */
const openPicker = (e: MouseEvent<HTMLInputElement>) => {
  try { e.currentTarget.showPicker?.(); } catch { /* unsupported or blocked: native behaviour still works */ }
};

export default function HeroSection() {
  const [tripType, setTripType] = useState<"one-way"|"round-trip">("one-way");
  const [fromId, setFromId]     = useState("");
  const [toId, setToId]         = useState("");
  const [date, setDate]         = useState("");
  const [time, setTime]         = useState("");
  const [adults, setAdults]     = useState(1);
  const [kids, setKids]         = useState(0);
  const [showPrice, setShowPrice] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [allRates, setAllRates]   = useState<Rate[]>([]);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    Promise.all([fetch("/api/locations"), fetch("/api/rates")])
      .then(async ([lr, rr]) => {
        if (lr.ok) { const d = await lr.json(); setLocations(d.filter((l: Location) => l.active)); }
        if (rr.ok) { const d = await rr.json(); setAllRates(d.filter((r: Rate) => r.active)); }
      }).catch(() => {});
  }, []);

  const grouped = locations.reduce<Record<string, Location[]>>((acc, l) => {
    const k = `${l.categoryIcon} ${l.categoryName}`;
    if (!acc[k]) acc[k] = [];
    acc[k].push(l);
    return acc;
  }, {});

  const totalPax = adults + kids;

  // Fare shown is the lowest across all vehicles on the chosen route
  const getLowestPrice = (): number | null => {
    if (!fromId || !toId) return null;
    const routeRates = allRates.filter(r => r.fromLocId === fromId && r.toLocId === toId && !r.onDemand);
    if (routeRates.length === 0) return null;
    const pax = Math.min(totalPax, 9);
    const prices: number[] = [];
    routeRates.forEach(r => {
      let p: number | null = null;
      if (pax >= 9) p = r.p8 ? r.p8 * 2 : null;
      else { const map: Record<number, number|null> = {1:r.p1,2:r.p2,3:r.p3,4:r.p4,5:r.p5,6:r.p6,7:r.p7,8:r.p8}; p = map[pax] ?? null; }
      if (p !== null) prices.push(p);
    });
    if (prices.length === 0) return null;
    const base = Math.min(...prices);
    return tripType === "round-trip" ? base * 2 : base;
  };

  const lowestPrice = getLowestPrice();
  const isOnDemand  = !!(fromId && toId && lowestPrice === null &&
    allRates.some(r => r.fromLocId === fromId && r.toLocId === toId && r.onDemand));

  const bookingUrl = () => {
    const p = new URLSearchParams();
    if (fromId) p.set("from", fromId);
    if (toId)   p.set("to",   toId);
    if (date)   p.set("date", date);
    if (time)   p.set("time", time);
    p.set("passengers", String(adults));
    p.set("kids",       String(kids));
    p.set("tripType",   tripType);
    return `/reservation?${p.toString()}`;
  };

  /* Fare tile sub-line: one short message per state, so text never overlaps */
  const fareSub = !showPrice
    ? "Choose a route, then tap “Show my fare”"
    : tripType === "round-trip"
      ? "Out & back · fixed fare"
      : "Fixed fare · all fees included";

  /* After “Show my fare” is tapped, highlight whichever route field is still empty */
  const missingFrom = showPrice && !fromId;
  const missingTo   = showPrice && !toId;

  /* ── SEO: structured data (LocalBusiness / TravelAgency) ── */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: BRAND,
    url: SITE_URL,
    image: `${SITE_URL}/images/banner.webp`,
    telephone: PHONE_TEL,
    description:
      "Private car, van, bus and scooter hire with English-speaking drivers in Sri Lanka. Airport transfers from Colombo Bandaranaike Airport (CMB), island-wide taxi rides and multi-day tours with fixed fares.",
    knowsLanguage: ["en", "ru"],
    priceRange: "$$",
    areaServed: { "@type": "Country", name: "Sri Lanka" },
    address: { "@type": "PostalAddress", addressCountry: "LK" },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      opens: "00:00", closes: "23:59",
    },
    // Add "aggregateRating" only once you have real, verifiable reviews on the page.
  };

  return (
    <div className="hero-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap');

        .hero-root {
          --header-h:     88px;   /* must equal the <main> padding-top in layout.tsx (Header height when not scrolled) */
          --h-ink:        #173b32;
          --h-ink-soft:   rgba(23,59,50,.80);
          --h-ink-faint:  rgba(23,59,50,.66);
          --h-teal:       #2f7d5b;
          --h-teal-deep:  #173b32;
          --h-sun:        #2f7d5b;
          --h-sun-deep:   #245e46;
          --h-danger:     #c93a3a;
          --h-glass:      rgba(255,255,255,.80);
          --h-stroke:     rgba(23,59,50,.14);
          --h-field-line: #d3dde0;
          --h-ease:       cubic-bezier(.25,.1,.25,1);
          --field-h:      52px;   /* one height for every control in the form */
          overflow-x:clip;
        }
        .hero-root *, .hero-root *::before, .hero-root *::after { box-sizing:border-box; margin:0; padding:0; }
        .hero-root :focus-visible { outline:3px solid var(--h-teal); outline-offset:2px; }

        /* ══ Shell — image defines the height, nothing is cropped ══ */
        .hero {
          --overlap:110px; position:relative; font-family:'Figtree',system-ui,sans-serif; color:var(--h-ink);
          margin-top:calc(var(--header-h) * -1); margin-bottom:28px;
          background:
            radial-gradient(60% 40% at 88% 78%, rgba(47,125,91,.28), transparent 70%),
            radial-gradient(70% 45% at 8% 62%, rgba(47,125,91,.20), transparent 70%),
            #f3f7f2;
        }
        .hero-bg { position:relative; }
        .hero-bg-img { display:block; width:100%; height:auto; }
        .hero-bg-scrim { display:none; }
        .hero-body { position:relative; padding:22px 4vw 14px; max-width:1480px; margin:0 auto; width:100%; }

        /* ══ Left copy ══ */
        .hero-left { min-width:0; max-width:620px; animation:rise .8s var(--h-ease) both; }
        @keyframes rise { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
        @keyframes fareIn { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:none} }
        .hero-kicker { display:inline-block; font-size:13.5px; font-weight:600; color:var(--h-teal-deep); border-radius:100px; padding:5px 14px; margin-bottom:16px;
          background:linear-gradient(135deg, rgba(255,255,255,.62), rgba(255,255,255,.30));
          -webkit-backdrop-filter:blur(14px) saturate(180%); backdrop-filter:blur(14px) saturate(180%);
          border:1px solid rgba(255,255,255,.7);
          box-shadow:0 6px 18px rgba(23,59,50,.14), inset 0 1.5px 0 rgba(255,255,255,.85), inset 0 -1px 0 rgba(255,255,255,.25); }
        .hero-h1 { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(30px,5.2vw,74px); font-weight:800; line-height:1.04; letter-spacing:-.02em; color:var(--h-ink); margin-bottom:12px; }
        .hero-h1-sub { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(17px,2.4vw,30px); font-weight:600; line-height:1.2; color:var(--h-teal); margin-bottom:16px; }
        .hero-desc { font-size:16px; font-weight:500; line-height:1.55; color:var(--h-ink-soft); max-width:480px; margin-bottom:20px; }
        .hero-desc strong { color:var(--h-ink); font-weight:700; }
        /* Feature row: icon circle + short label */
        .features { list-style:none; display:flex; flex-wrap:wrap; gap:12px 26px; }
        .feature { display:flex; align-items:center; gap:10px; }
        .feature-icon { flex-shrink:0; width:42px; height:42px; border-radius:50%; color:var(--h-teal-deep); display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;
          background:linear-gradient(145deg, rgba(255,255,255,.75), rgba(255,255,255,.35));
          -webkit-backdrop-filter:blur(12px) saturate(180%); backdrop-filter:blur(12px) saturate(180%);
          border:1px solid rgba(255,255,255,.7);
          box-shadow:0 6px 16px rgba(23,59,50,.18), inset 0 1.5px 0 rgba(255,255,255,.9), inset 0 -1px 0 rgba(255,255,255,.3); }
        .feature-icon::before { content:""; position:absolute; left:10%; right:10%; top:3%; height:46%; border-radius:50%; background:linear-gradient(180deg, rgba(255,255,255,.65), rgba(255,255,255,0)); pointer-events:none; }
        .feature-icon svg { position:relative; z-index:1; }
        .feature-text { font-size:13px; font-weight:600; line-height:1.25; color:var(--h-ink); }

        /* ══ Booking bar ══ */
        .booking-wrap { position:relative; top:0; z-index:5; width:100%; max-width:1120px; margin:0 auto; padding:0 4vw; animation:rise .8s .12s var(--h-ease) both; }

        /* Near-solid frosted card: stays crisp over both the photo and the page background */
        .booking-card {
          position:relative; overflow:hidden; border-radius:24px;
          background:linear-gradient(135deg, rgba(255,255,255,.88), rgba(255,255,255,.72));
          -webkit-backdrop-filter:blur(22px) saturate(170%);
          backdrop-filter:blur(22px) saturate(170%);
          border:1px solid rgba(255,255,255,.7);
          box-shadow:
            0 34px 70px rgba(16,44,37,.28),
            0 6px 16px rgba(16,44,37,.12);
        }
        /* thin brand accent along the top edge */
        .booking-card::before {
          content:""; position:absolute; left:0; right:0; top:0; height:4px; z-index:2;
          background:linear-gradient(90deg, var(--h-teal-deep), var(--h-teal) 55%, var(--h-sun));
        }
        .booking-card > * { position:relative; z-index:1; }

        .bar-head { display:flex; align-items:center; justify-content:space-between; gap:8px 16px; flex-wrap:wrap; padding:10px 18px 6px; }
        .card-band-title { font-family:'Bricolage Grotesque',sans-serif; font-size:17px; font-weight:700; color:var(--h-ink); line-height:1.1; }

        /* segmented control with sliding thumb */
        .ttabs { position:relative; display:flex; width:min(100%,230px); padding:3px; border-radius:100px; background:#e8f1e8; box-shadow:inset 0 1px 2px rgba(23,59,50,.14); }
        .ttabs::before { content:""; position:absolute; top:3px; bottom:3px; left:3px; width:calc(50% - 3px); border-radius:100px; background:var(--h-teal-deep); box-shadow:0 2px 8px rgba(23,59,50,.35); transition:transform .38s cubic-bezier(.3,1.25,.5,1); }
        .ttabs[data-active="round-trip"]::before { transform:translateX(100%); }
        .ttab { position:relative; z-index:1; flex:1; min-height:32px; padding:4px 8px; font:inherit; font-size:13.5px; font-weight:600; text-align:center; color:var(--h-ink-soft); cursor:pointer; border:none; background:transparent; border-radius:100px; transition:color .2s var(--h-ease); touch-action:manipulation; -webkit-tap-highlight-color:transparent; }
        .ttab.active { color:#fff; }

        .card-body { padding:0 18px 10px; }

        /* Laptop: two even rows of four, then passengers + fare + action */
        .bar-grid { display:grid; grid-template-columns:repeat(12,1fr); gap:8px; align-items:stretch; }
        .f-from,.f-to,.f-date,.f-time { grid-column:span 3; }
        .f-adults,.f-kids { grid-column:span 3; }
        .f-action { grid-column:span 6; }
        .bar-action { display:flex; gap:10px; align-items:stretch; }

        /* ── Fields: the whole box is the hit area ── */
        .dt-field, .pax-block {
          min-height:var(--field-h);
          background:rgba(255,255,255,.9);
          border:1.5px solid rgba(23,59,50,.12); border-radius:14px;
          box-shadow:0 1px 3px rgba(23,59,50,.08), inset 0 1px 0 rgba(255,255,255,.9);
        }
        .dt-field { position:relative; display:block; cursor:pointer; min-width:0; transition:border-color .2s, box-shadow .2s, background .2s; }
        .dt-field:hover { background:#fff; border-color:rgba(47,125,91,.45); }
        .dt-field:focus-within { background:#fff; border-color:var(--h-teal); box-shadow:0 0 0 4px rgba(47,125,91,.18); }
        .dt-field.is-invalid { border-color:var(--h-danger); box-shadow:0 0 0 4px rgba(201,58,58,.14); }
        .dt-field.is-invalid .dt-field-label { color:var(--h-danger); }

        .dt-field-label { position:absolute; z-index:1; top:7px; left:14px; right:14px; display:flex; align-items:center; gap:6px; font-size:12.5px; font-weight:600; line-height:1.2; color:var(--h-ink-faint); pointer-events:none; }

        /* The input fills the entire field, so a click anywhere opens the select or picker */
        .dt-input {
          position:absolute; inset:0; width:100%; height:100%; min-width:0;
          padding:23px 14px 4px; background:transparent; border:none; border-radius:14px; outline:none;
          font-family:'Figtree',sans-serif; font-size:15.5px; font-weight:600; line-height:1.3; color:var(--h-ink);
          cursor:pointer; color-scheme:light; text-overflow:ellipsis; text-align:left;
          -webkit-appearance:none; appearance:none;
        }
        .dt-input option, .dt-input optgroup { background:#fff; color:var(--h-ink); }
        select.dt-input {
          padding-right:40px;
          background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230b6b5a' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 14px center / 16px;
        }
        .dt-input::-webkit-date-and-time-value { text-align:left; }           /* iOS Safari centres this by default */
        .dt-input::-webkit-calendar-picker-indicator { cursor:pointer; opacity:.7; width:20px; height:20px; padding:0; margin:0; }
        .dt-input::-webkit-calendar-picker-indicator:hover { opacity:1; }

        /* ── Passenger steppers: big, clearly-spaced buttons ── */
        .pax-block { padding:4px 8px 4px 14px; display:flex; align-items:center; justify-content:space-between; gap:8px; }
        .pax-info { display:flex; flex-direction:column; gap:1px; flex:1; min-width:0; }
        .pax-label { font-size:12.5px; font-weight:600; line-height:1.2; color:var(--h-ink-faint); }
        .pax-val { font-family:'Bricolage Grotesque',sans-serif; font-size:19px; font-weight:700; color:var(--h-ink); line-height:1.1; font-variant-numeric:tabular-nums; }
        .pax-controls { display:flex; gap:8px; }
        .pax-btn {
          width:36px; height:36px; border-radius:50%; border:1.5px solid var(--h-field-line); background:#f3f7f2; color:var(--h-teal-deep);
          font-size:22px; line-height:1; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0;
          touch-action:manipulation; -webkit-tap-highlight-color:transparent; user-select:none;
          transition:transform .15s, background .18s, color .18s, border-color .18s, opacity .18s;
        }
        .pax-btn:hover:not(:disabled) { background:var(--h-teal-deep); border-color:var(--h-teal-deep); color:#fff; }
        .pax-btn:active:not(:disabled) { transform:scale(.92); }
        .pax-btn:disabled { opacity:.35; cursor:not-allowed; }

        /* ── Fare slot: always rendered at a fixed size, so nothing ever jumps ── */
        .fare-box {
          flex:1 1 0; min-width:0; min-height:var(--field-h); padding:0 16px; border-radius:14px;
          display:flex; align-items:center; justify-content:space-between; gap:12px; overflow:hidden;
          background:rgba(255,244,214,.85);
          border:1.5px solid rgba(240,217,154,.95);
        }
        .fare-meta { display:flex; flex-direction:column; gap:3px; min-width:0; flex:1 1 auto; }
        .fare-meta-title { font-size:15px; font-weight:700; color:var(--h-ink); line-height:1.2; white-space:nowrap; }
        .fare-meta-sub { font-size:12.5px; font-weight:500; color:var(--h-ink-faint); line-height:1.25; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .fare-value { display:flex; align-items:baseline; gap:8px; flex-shrink:0; animation:fareIn .35s var(--h-ease) both; }
        .fare-from { font-size:13px; font-weight:600; color:var(--h-ink-faint); }
        .fare-amount { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(24px,2vw,30px); font-weight:800; letter-spacing:-.02em; line-height:1; color:var(--h-teal-deep); font-variant-numeric:tabular-nums; display:flex; align-items:flex-start; gap:2px; }
        .fare-amount sup { font-size:.46em; font-weight:700; margin-top:.2em; }
        .fare-text { font-family:'Bricolage Grotesque',sans-serif; font-size:18px; font-weight:700; color:var(--h-teal-deep); flex-shrink:0; animation:fareIn .35s var(--h-ease) both; }
        .fare-hint { font-size:13.5px; font-weight:700; color:var(--h-danger); flex-shrink:0; }

        /* action buttons — same size in both states */
        .card-submit, .card-submit-book {
          flex:0 0 164px; min-height:var(--field-h); border-radius:14px; font-family:'Figtree',sans-serif; font-size:16px; font-weight:700; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px; text-decoration:none; border:none;
          touch-action:manipulation; -webkit-tap-highlight-color:transparent;
          transition:background .2s, transform .2s, box-shadow .2s;
        }
        .card-submit { background:linear-gradient(180deg, #c2410c, #9a3412); color:#fff; box-shadow:0 8px 18px rgba(194,65,12,.38), inset 0 1px 0 rgba(255,255,255,.3); }
        .card-submit:hover { background:linear-gradient(180deg, #9a3412, #7c2d12); transform:translateY(-2px); }
        .card-submit-book { background:linear-gradient(180deg, #c2410c, #9a3412); color:#fff; box-shadow:0 8px 18px rgba(194,65,12,.38), inset 0 1px 0 rgba(255,255,255,.3); }
        .card-submit-book:hover { background:linear-gradient(180deg, #9a3412, #7c2d12); transform:translateY(-2px); }

        .card-note { display:flex; align-items:center; justify-content:center; gap:20px; margin-top:8px; padding-top:6px; border-top:1px solid rgba(23,59,50,.08); flex-wrap:wrap; list-style:none; }
        .card-note-item { display:flex; align-items:center; gap:6px; font-size:12.5px; font-weight:600; color:var(--h-ink-soft); }

        .wa-float { position:fixed; bottom:24px; right:24px; z-index:999; width:52px; height:52px; background:#25D366; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 24px rgba(0,0,0,.3); transition:transform .25s; }
        .wa-float:hover { transform:scale(1.1); }

        /* ══ Desktop: text overlays the full image, bar hangs below its bottom edge ══ */
        @media (min-width:1200px) {
          .hero { --overlap:clamp(55px,4.2vw,90px); margin-bottom:calc(var(--overlap) + 20px); background:#fff; }

          /* dark scrim on the left so white copy is readable over the photo */
          .hero-bg-scrim { display:block; position:absolute; inset:0; background:
            linear-gradient(90deg, rgba(8,25,45,.78) 0%, rgba(8,25,45,.55) 38%, rgba(8,25,45,.10) 68%, transparent 100%),
            linear-gradient(0deg, rgba(8,25,45,.18) 0%, transparent 30%); }

          .hero-body { position:absolute; inset:0; display:flex; align-items:center; padding:calc(var(--header-h) + 8px) 5vw clamp(150px,11.5vw,210px); }
          .booking-wrap { position:absolute; left:0; right:0; top:auto; bottom:calc(var(--overlap) * -1); padding:0 3vw; }
          .hero-left { max-width:46vw; }
          .hero-kicker { font-size:12.5px; padding:4px 13px; margin-bottom:10px; color:#fff; background:linear-gradient(135deg, rgba(255,255,255,.28), rgba(255,255,255,.08)); border-color:rgba(255,255,255,.45); text-shadow:0 1px 8px rgba(0,0,0,.3); box-shadow:0 8px 22px rgba(0,0,0,.22), inset 0 1.5px 0 rgba(255,255,255,.55), inset 0 -1px 0 rgba(255,255,255,.15); }
          .hero-h1 { font-size:clamp(28px,3.3vw,56px); line-height:1.05; margin-bottom:6px; color:#fff; text-shadow:0 2px 20px rgba(0,0,0,.35); }
          .hero-h1-sub { font-size:clamp(15px,1.55vw,26px); margin-bottom:8px; color:#bed3bf; text-shadow:0 1px 12px rgba(0,0,0,.3); }
          .hero-desc { font-size:clamp(13.5px,1.1vw,16px); line-height:1.45; max-width:none; margin-bottom:12px; color:rgba(255,255,255,.92); text-shadow:0 1px 10px rgba(0,0,0,.3); }
          .hero-desc strong { color:#fff; }
          .features { margin-top:4px; }
          .feature-icon { width:42px; height:42px; color:#fff; background:linear-gradient(145deg, rgba(255,255,255,.34), rgba(255,255,255,.10)); border-color:rgba(255,255,255,.55); box-shadow:0 8px 20px rgba(0,0,0,.25), inset 0 1.5px 0 rgba(255,255,255,.7), inset 0 -1px 0 rgba(255,255,255,.18); }
          .feature-icon svg { filter:drop-shadow(0 1px 2px rgba(0,0,0,.35)); }
          .feature-text { color:#fff; text-shadow:0 1px 10px rgba(0,0,0,.35); }
        }

        /* ══ Tablet ══ */
        @media (max-width:1199px) {
          .hero-body { padding:22px 5vw 14px; }
          .bar-grid { grid-template-columns:repeat(6,1fr); }
          .f-from,.f-to,.f-date,.f-time,.f-adults,.f-kids { grid-column:span 3; }
          .f-action { grid-column:span 6; }
        }

        /* ══ Mobile ══ */
        @media (max-width:767px) {
          .hero-root { --field-h:56px; }
          .hero { margin-bottom:24px; }
          .hero-body { padding:18px 4vw 14px; }
          .hero-kicker { font-size:12.5px; margin-bottom:12px; }
          .hero-h1 { font-size:29px; margin-bottom:8px; }
          .hero-h1-sub { font-size:17px; margin-bottom:12px; }
          .hero-desc { font-size:15px; margin-bottom:14px; }
          .features { flex-direction:column; gap:10px; }
          .booking-wrap { padding:0 3vw; }
          .booking-card { border-radius:22px; }
          .bar-head { flex-direction:column; align-items:stretch; gap:8px; padding:14px 14px 8px; }
          .card-band-title { font-size:18px; }
          .ttabs { width:100%; }
          .ttab { min-height:40px; padding:8px 4px; font-size:14.5px; }
          .card-body { padding:0 14px 12px; }
          .bar-grid { grid-template-columns:repeat(2,1fr); gap:8px; }
          /* route and passengers get full-width rows; date and time sit side by side */
          .f-from,.f-to,.f-adults,.f-kids,.f-action { grid-column:span 2; }
          .f-date,.f-time { grid-column:span 1; }
          .dt-input { font-size:16px; }               /* 16px stops iOS zooming in on focus */
          .dt-field-label { left:12px; right:12px; font-size:12px; }
          .dt-input { padding-left:12px; padding-right:12px; }
          select.dt-input { padding-right:40px; }
          .pax-block { padding:4px 10px 4px 14px; }
          .pax-val { font-size:20px; }
          .pax-controls { gap:10px; }
          .pax-btn { width:44px; height:44px; font-size:22px; }
          .bar-action { flex-direction:column; }
          .fare-box { flex:none; width:100%; min-height:56px; }
          .card-submit, .card-submit-book { flex:none; width:100%; min-height:52px; font-size:16px; }
          .card-note { gap:6px 18px; margin-top:8px; padding-top:8px; }
        }
        @media (max-width:400px) {
          .card-body { padding:0 12px 14px; }
          .wa-float { bottom:16px; right:16px; width:46px; height:46px; }
        }

        /* graceful fallbacks */
        @supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))) {
          .booking-card { background:#fff; }
        }
        @media (prefers-reduced-transparency:reduce) {
          .booking-card { background:#fff; -webkit-backdrop-filter:none; backdrop-filter:none; }
        }
        @media (prefers-reduced-motion:reduce) {
          .hero-left,.booking-wrap,.fare-value,.fare-text { animation:none; }
          .card-submit,.card-submit-book,.wa-float,.ttabs::before,.pax-btn,.dt-field { transition:none; }
        }
      `}</style>

      {/* SEO: structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-bg">
          {/* Real <img> (not CSS background) so it can be preloaded, is indexable and has alt text.
              width/height must match the real file so the full image shows with no crop. */}
          <img
            className="hero-bg-img"
            src="/images/banner.webp"
            alt="Scenic Sri Lanka landscape with tea hills and winding roads, popular with tourists travelling by private car"
            width={1920}
            height={1080}
            fetchPriority="high"
            decoding="async"
          />
          <div className="hero-bg-scrim" aria-hidden="true" />
        </div>

        <div className="hero-body">

          {/* ══ Left copy ══ */}
          <div className="hero-left">
            <p className="hero-kicker">Colombo Airport · Kandy · Sigiriya · Ella · Galle</p>
            <h1 id="hero-title" className="hero-h1">Private car &amp; driver hire in Sri Lanka</h1>
            <h2 className="hero-h1-sub">Airport transfers, island-wide taxis &amp; tailor-made tours</h2>
            <p className="hero-desc">
              <strong>Licensed English-speaking drivers</strong> in air-conditioned cars and vans.
              Fixed fares quoted upfront, with airport meet &amp; greet at CMB.
            </p>
            <ul className="features">
              <li className="feature">
                <span className="feature-icon" aria-hidden="true">
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
                </span>
                <span className="feature-text">Airport<br />Transfers</span>
              </li>
              <li className="feature">
                <span className="feature-icon" aria-hidden="true">
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z"/></svg>
                </span>
                <span className="feature-text">Day Tours<br />&amp; Excursions</span>
              </li>
              <li className="feature">
                <span className="feature-icon" aria-hidden="true">
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                </span>
                <span className="feature-text">Fixed<br />Transparent Pricing</span>
              </li>
            </ul>
          </div>

        </div>

        {/* ══ Booking bar ══ */}
        <div className="booking-wrap">
          <div className="booking-card" role="group" aria-labelledby="booking-title">

            <div className="bar-head">
              <div>
                <h2 id="booking-title" className="card-band-title">Get an instant fare</h2>
              </div>
              <div className="ttabs" role="group" aria-label="Trip type" data-active={tripType}>
                {(["one-way","round-trip"] as const).map(t => (
                  <button key={t} type="button" className={`ttab${tripType === t ? " active" : ""}`}
                    aria-pressed={tripType === t}
                    onClick={() => { setTripType(t); setShowPrice(false); }}>
                    {t === "one-way" ? "One way" : "Round trip"}
                  </button>
                ))}
              </div>
            </div>

            <div className="card-body">
              <div className="bar-grid">
                {/* From */}
                <label className={`dt-field f-from${missingFrom ? " is-invalid" : ""}`}>
                  <span className="dt-field-label">
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
                    From
                  </span>
                  <select id="hero-from" className="dt-input" value={fromId} aria-invalid={missingFrom}
                    onChange={e => { setFromId(e.target.value); setShowPrice(false); }}>
                    <option value="">Airport, hotel or city…</option>
                    {Object.entries(grouped).map(([cat, locs]) => (
                      <optgroup key={cat} label={cat}>
                        {locs.filter(l => l.id !== toId).map(l => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>

                {/* To */}
                <label className={`dt-field f-to${missingTo ? " is-invalid" : ""}`}>
                  <span className="dt-field-label">
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                      <circle cx="12" cy="9" r="2.5"/>
                    </svg>
                    To
                  </span>
                  <select id="hero-to" className="dt-input" value={toId} aria-invalid={missingTo}
                    onChange={e => { setToId(e.target.value); setShowPrice(false); }}>
                    <option value="">Destination…</option>
                    {Object.entries(grouped).map(([cat, locs]) => (
                      <optgroup key={cat} label={cat}>
                        {locs.filter(l => l.id !== fromId).map(l => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>

                {/* Date */}
                <label className="dt-field f-date">
                  <span className="dt-field-label">
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H5V8h14v13zM7 10h5v5H7z"/>
                    </svg>
                    Pickup date
                  </span>
                  <input type="date" className="dt-input" value={date} min={today}
                    onClick={openPicker}
                    onChange={e => { setDate(e.target.value); setShowPrice(false); }} />
                </label>

                {/* Time */}
                <label className="dt-field f-time">
                  <span className="dt-field-label">
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 11H11V7h1.5v4.79l4.12 2.45-.75 1.26L12.5 13z"/>
                    </svg>
                    Pickup time
                  </span>
                  <input type="time" className="dt-input" value={time}
                    onClick={openPicker}
                    onChange={e => { setTime(e.target.value); setShowPrice(false); }} />
                </label>

                {/* Adults */}
                <div className="pax-block f-adults">
                  <div className="pax-info">
                    <span className="pax-label">Adults</span>
                    <span className="pax-val" aria-live="polite">{adults}</span>
                  </div>
                  <div className="pax-controls">
                    <button type="button" className="pax-btn" aria-label="Remove one adult" disabled={adults <= 1}
                      onClick={() => { setAdults(Math.max(1, adults - 1)); setShowPrice(false); }}>−</button>
                    <button type="button" className="pax-btn" aria-label="Add one adult" disabled={adults >= MAX_ADULTS}
                      onClick={() => { setAdults(Math.min(MAX_ADULTS, adults + 1)); setShowPrice(false); }}>+</button>
                  </div>
                </div>

                {/* Children */}
                <div className="pax-block f-kids">
                  <div className="pax-info">
                    <span className="pax-label">Children</span>
                    <span className="pax-val" aria-live="polite">{kids}</span>
                  </div>
                  <div className="pax-controls">
                    <button type="button" className="pax-btn" aria-label="Remove one child" disabled={kids <= 0}
                      onClick={() => { setKids(Math.max(0, kids - 1)); setShowPrice(false); }}>−</button>
                    <button type="button" className="pax-btn" aria-label="Add one child" disabled={kids >= MAX_KIDS}
                      onClick={() => { setKids(Math.min(MAX_KIDS, kids + 1)); setShowPrice(false); }}>+</button>
                  </div>
                </div>

                {/* Fare slot + action — fixed size, never changes the layout */}
                <div className="bar-action f-action">
                  <div className="fare-box" role="status" aria-live="polite">
                    <div className="fare-meta">
                      <span className="fare-meta-title">{tripType === "round-trip" ? "Round trip" : "One way"}</span>
                      <span className="fare-meta-sub">{fareSub}</span>
                    </div>

                    {showPrice && (
                      isOnDemand ? (
                        <span className="fare-text">Price on request</span>
                      ) : lowestPrice !== null ? (
                        <span className="fare-value" key={`${fromId}-${toId}-${totalPax}-${tripType}`}>
                          <span className="fare-from">From</span>
                          <span className="fare-amount"><sup>{CURRENCY}</sup>{lowestPrice.toLocaleString()}</span>
                        </span>
                      ) : (
                        <span className="fare-hint">Select a route</span>
                      )
                    )}
                  </div>

                  {!showPrice
                    ? <button type="button" className="card-submit" onClick={() => setShowPrice(true)}>
                        <svg width={18} height={18} viewBox="0 0 24 24" fill="var(--h-ink)" aria-hidden="true"><path d="M21.41 11.58l-9-9A2 2 0 0011 2H4a2 2 0 00-2 2v7a2 2 0 00.59 1.42l9 9A2 2 0 0013 22a2 2 0 001.41-.59l7-7A2 2 0 0022 13a2 2 0 00-.59-1.42zM5.5 7A1.5 1.5 0 114 5.5 1.5 1.5 0 015.5 7z"/></svg>
                        Show my fare
                      </button>
                    : <a href={bookingUrl()} className="card-submit-book">
                        <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                        Book now
                      </a>
                  }
                </div>
              </div>

              <ul className="card-note">
                <li className="card-note-item">
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="var(--h-teal)" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  Free cancellation
                </li>
                <li className="card-note-item">
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="var(--h-teal)" aria-hidden="true"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
                  Pay the driver
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp */}
      <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="wa-float" aria-label="Chat with us on WhatsApp">
        <svg width={28} height={28} viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}