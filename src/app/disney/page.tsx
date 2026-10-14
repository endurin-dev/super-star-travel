"use client";

import { useState } from "react";
import Link from "next/link";

/* =====================================================================
   TODO BEFORE GO-LIVE
   ---------------------------------------------------------------------
   1. Make sure /images/Luxury-van-Mercedes-V-class.jpg and
      /images/disney.webp exist in public/images before deploying.
   2. Confirm the phone/WhatsApp number (+94 72 680 3498) and business
      name ("Paris Easy Move") below are correct.
   3. Confirm the 4.9 Google / 5.0 TripAdvisor ratings match your
      current live ratings (hero trust strip + reviews heading).
   4. This page is 100% transfer-service content (no park descriptions,
      ride lists, or "about the resort" sections) — intentional, for
      Quality Score / ad relevance on the transfer keywords.
===================================================================== */

const ROUTES = [
  { name: "CDG Airport → Disneyland", eta: "~45 min", slug: "cdg-disney" },
  { name: "Orly Airport → Disneyland", eta: "~60 min", slug: "orly-disney" },
  { name: "Beauvais Airport → Disneyland", eta: "~75 min", slug: "beauvais-disney" },
  { name: "Paris City → Disneyland", eta: "~40 min", slug: "paris-disney" },
];

const VALUE_PROPS = [
  { icon: "💶", title: "Fixed Price, No Surprises", body: "The price you're quoted is the price you pay — no meter, no hidden tolls, no luggage fees." },
  { icon: "✈️", title: "Flight Tracked, Always Waiting", body: "We track your flight in real time and adjust automatically — land late and your driver is still there." },
  { icon: "🧸", title: "Free Child Seats Included", body: "Infant and booster seats fitted before you land, at no extra cost." },
  { icon: "👋", title: "Meet & Greet at Arrivals", body: "Your driver waits inside the terminal with a name board and helps with every bag." },
];

const STEPS = [
  { title: "Book Online or WhatsApp", body: "Enter your flight number and hotel details in under two minutes." },
  { title: "We Track Your Flight", body: "Landed early or delayed — your driver already knows and adjusts." },
  { title: "Meet & Greet", body: "Your driver is waiting inside arrivals with a name board, ready to help with bags." },
  { title: "Direct to Disneyland", body: "Relax in a private vehicle straight to your hotel or the park gates — on your schedule, with total comfort and flexibility." },
];

const FAQS = [
  { q: "How far in advance should I book?", a: "We recommend booking as soon as your flights are confirmed, especially during school holidays and peak season when availability tightens." },
  { q: "What if my flight is delayed?", a: "No problem — we track your flight in real time and adjust your driver's arrival automatically. There's no extra fee for reasonable delays." },
  { q: "Do you provide child seats?", a: "Yes, infant and booster seats are included at no extra cost — just let us know the ages when you book." },
  { q: "How many passengers and how much luggage?", a: "Standard vehicles seat up to 3 passengers with luggage; larger groups can book a 7-seater van. Message us on WhatsApp if you're unsure." },
  { q: "Is the price really fixed?", a: "Yes — the quote you receive at booking is what you pay. No meter, no surge pricing, no last-minute add-ons." },
  { q: "Can I book a round trip?", a: "Absolutely — many families book both the arrival and return transfer together. Ask about our round-trip rate." },
];

const REVIEWS = [
  {
    text: "Our driver Kavindu arrived exactly when our plane landed even though we booked an hour ahead in case of delays. … When we got through airport security, he came to meet us at arrivals to help-roll our bags to the car park. … We ordered a 6 sitter and the van was so clean and new it had a TV and led lights on the roof with some bottles of water. … the service was UNMATCHED.",
    author: "Rayaa Onog",
    source: "Google",
  },
  {
    text: "Very professional service!! Staff is very professional!! Highly recommend it to Everyone!",
    author: "John David",
    source: "Google",
  },
  {
    text: "The service was very professional and on time. The driver was polite and cooperative, the whole journey was comfortable. Communication was also easy and clear. I am very satisfied, will use again in the future.",
    author: "Sylvain Legrand",
    source: "Google",
  },
];

const PHONE_DISPLAY = "+94 72 680 3498";
const PHONE_TEL = "+94726803498";
const WHATSAPP_URL = "https://wa.me/94726803498";

export default function DisneylandTransferPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <style>{`
        .pem { --ink:#14161a; --ink-2:#1f2228; --gold:#2f7d5b; --gold-light:#5a9a73;
          --cream:#faf7f2; --cream-2:#f1ebe1; --line:#e7ddc9; --text:#2a2a2a; --muted:#6b6b6b;
          --radius:14px; --maxw:1180px;
          --pad-x:20px; --pad-y:64px;
          font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
          color:var(--text); background:var(--cream); line-height:1.55; font-size:16px;
          overflow-x:hidden; width:100%;
          -webkit-text-size-adjust:100%;
        }
        .pem *{ box-sizing:border-box; }
        .pem h1,.pem h2,.pem h3,.pem h4{ font-family:Georgia,"Times New Roman",Times,serif; font-weight:600; margin:0 0 .5em; color:var(--ink); overflow-wrap:break-word; }
        .pem h1{ font-size:clamp(1.85rem, 6.5vw, 2.5rem); line-height:1.15; }
        .pem h2{ font-size:clamp(1.5rem, 5vw, 2rem); line-height:1.2; }
        .pem em{ font-style:normal; color:var(--gold); }
        .pem a{ color:inherit; text-decoration:none; }
        .pem img{ max-width:100%; height:auto; display:block; }
        .pem .wrap{ max-width:var(--maxw); margin:0 auto; padding:0 var(--pad-x); }
        .pem .btn{ display:inline-flex; align-items:center; justify-content:center; gap:8px;
          padding:14px 26px; border-radius:999px; font-weight:600; font-size:.95rem; text-align:center;
          cursor:pointer; border:2px solid transparent; transition:transform .15s ease,opacity .15s ease;
          min-height:48px; -webkit-tap-highlight-color:transparent; }
        .pem .btn:hover{ transform:translateY(-1px); }
        .pem .btn-gold{ background:var(--gold); color:#1a1200; }
        .pem .btn-gold:hover{ background:var(--gold-light); }
        .pem .btn-outline{ background:transparent; border-color:rgba(255,255,255,.55); color:#fff; }
        .pem .btn-outline:hover{ border-color:#fff; }
        .pem .btn-block{ width:100%; }
        .pem section{ padding:var(--pad-y) 0; }
        .pem .eyebrow{ text-transform:uppercase; letter-spacing:.14em; font-size:.75rem; font-weight:700; color:var(--gold); margin-bottom:14px; display:block; }
        .pem .center{ text-align:center; }
        .pem .lead{ color:var(--muted); font-size:1.05rem; max-width:640px; }
        .pem .center .lead{ margin-left:auto; margin-right:auto; }

        /* HERO */
        .pem .hero{ position:relative; color:#fff;
          background:linear-gradient(180deg,rgba(15,16,19,.55),rgba(15,16,19,.82)),
            url('/images/disney.webp') center/cover no-repeat;
          padding:110px 0 90px; }
        .pem .hero h1{ color:#fff; max-width:780px; }
        .pem .hero .lead{ color:#e9e5da; max-width:600px; font-size:1.1rem; }
        .pem .hero-ctas{ display:flex; gap:14px; flex-wrap:wrap; margin-top:30px; }
        .pem .trust-strip{ margin-top:46px; display:flex; flex-wrap:wrap; gap:14px 28px; padding-top:26px; border-top:1px solid rgba(255,255,255,.18); font-size:.88rem; color:#d8d2c4; }
        .pem .trust-strip .item{ display:flex; align-items:center; gap:8px; }
        .pem .trust-strip strong{ color:#fff; }

        /* VALUE PROPS */
        .pem .grid-4{ display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }
        .pem .value-card{ background:#fff; border:1px solid var(--line); border-radius:var(--radius); padding:28px 22px; text-align:left; }
        .pem .value-card .icon{ width:46px; height:46px; flex-shrink:0; border-radius:50%; background:var(--cream-2); display:flex; align-items:center; justify-content:center; font-size:1.3rem; margin-bottom:16px; }
        .pem .value-card h3{ font-size:1.05rem; margin-bottom:8px; font-family:-apple-system,sans-serif; }
        .pem .value-card p{ color:var(--muted); font-size:.92rem; margin:0; }

        /* ROUTES */
        .pem .routes-section{ background:var(--ink); color:#fff; }
        .pem .routes-section h2{ color:#fff; }
        .pem .grid-routes{ display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-top:40px; }
        .pem .route-card{ background:var(--ink-2); border:1px solid rgba(255,255,255,.09); border-radius:var(--radius); padding:26px 22px; display:flex; flex-direction:column; gap:14px; }
        .pem .route-card .route-name{ font-weight:700; font-size:1.02rem; }
        .pem .route-card .route-meta{ font-size:.82rem; color:#b7b2a5; display:flex; gap:14px; flex-wrap:wrap; }
        .pem .route-card .btn{ margin-top:auto; white-space:normal; }
        .pem .price-note{ font-size:.78rem; color:#a8a294; margin-top:28px; text-align:center; }

        /* HOW IT WORKS */
        .pem .steps{ display:grid; grid-template-columns:repeat(4,1fr); gap:24px; margin-top:44px; }
        .pem .step{ position:relative; padding-left:52px; }
        .pem .step .num{ position:absolute; left:0; top:0; width:38px; height:38px; border-radius:50%; background:var(--ink); color:var(--gold-light); display:flex; align-items:center; justify-content:center; font-family:Georgia,serif; font-weight:700; }
        .pem .step h3{ font-size:1rem; font-family:-apple-system,sans-serif; margin-bottom:6px; }
        .pem .step p{ font-size:.9rem; color:var(--muted); margin:0; }

        /* FLEET */
        .pem .fleet-section{ display:grid; grid-template-columns:1fr 1fr; gap:48px; align-items:center; }
        .pem .fleet-section img{ border-radius:var(--radius); width:100%; }
        .pem .fleet-list{ list-style:none; margin:22px 0 0; padding:0; display:grid; gap:12px; }
        .pem .fleet-list li{ display:flex; gap:10px; font-size:.95rem; color:var(--text); }
        .pem .fleet-list li::before{ content:"✓"; color:var(--gold); font-weight:700; flex-shrink:0; }

        /* COMPLIANCE */
        .pem .compliance{ background:var(--cream-2); border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
        .pem .compliance-row{ display:flex; flex-wrap:wrap; gap:14px 36px; justify-content:center; padding:30px 0; font-size:.85rem; color:var(--muted); text-align:center; }
        .pem .compliance strong{ color:var(--ink); }

        /* REVIEWS */
        .pem .grid-3{ display:grid; grid-template-columns:repeat(3,1fr); gap:24px; margin-top:40px; }
        .pem .review-card{ background:#fff; border:1px solid var(--line); border-radius:var(--radius); padding:26px; display:flex; flex-direction:column; }
        .pem .review-card .stars{ color:var(--gold); letter-spacing:2px; margin-bottom:10px; }
        .pem .review-card p{ font-size:.92rem; color:var(--text); font-style:italic; margin:0;
          display:-webkit-box; -webkit-line-clamp:8; -webkit-box-orient:vertical; overflow:hidden; }
        .pem .review-card .who{ margin-top:auto; padding-top:14px; font-size:.82rem; color:var(--muted); font-style:normal; }

        /* FAQ */
        .pem .faq-item{ border-bottom:1px solid var(--line); }
        .pem .faq-q{ width:100%; text-align:left; background:none; border:none; padding:20px 0; font-size:1rem; font-weight:600; color:var(--ink); cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:16px; font-family:Georgia,serif; min-height:48px; -webkit-tap-highlight-color:transparent; }
        .pem .faq-q .plus{ color:var(--gold); font-size:1.3rem; transition:transform .2s ease; flex-shrink:0; }
        .pem .faq-item.open .plus{ transform:rotate(45deg); }
        .pem .faq-a{ max-height:0; overflow:hidden; transition:max-height .25s ease; font-size:.92rem; color:var(--muted); }
        .pem .faq-a p{ margin:0; }
        .pem .faq-item.open .faq-a{ max-height:400px; padding-bottom:18px; }

        /* FINAL CTA */
        .pem .final-cta{ background:linear-gradient(135deg,var(--ink),#2a2416); color:#fff; text-align:center; border-radius:var(--radius); padding:56px 30px; }
        .pem .final-cta h2{ color:#fff; }
        .pem .final-cta .phone-big{ font-family:Georgia,serif; font-size:1.5rem; color:var(--gold-light); margin-top:18px; }
        .pem .final-ctas{ display:flex; gap:14px; justify-content:center; flex-wrap:wrap; margin-top:24px; }

        /* STICKY MOBILE CTA */
        .pem .mobile-cta-bar{ display:none; position:fixed; bottom:0; left:0; right:0; z-index:60; background:var(--ink); border-top:1px solid rgba(255,255,255,.12); padding:10px 14px calc(10px + env(safe-area-inset-bottom)); gap:10px; }
        .pem .mobile-cta-bar a{ flex:1; text-align:center; padding:12px 8px; border-radius:10px; font-size:.85rem; font-weight:700; min-height:44px; display:flex; align-items:center; justify-content:center; }
        .pem .mobile-cta-bar .call{ background:rgba(255,255,255,.1); color:#fff; }
        .pem .mobile-cta-bar .wa{ background:#2fae60; color:#fff; }
        .pem .mobile-cta-bar .book{ background:var(--gold); color:#1a1200; }

        /* ---------- TABLET (<= 960px) ---------- */
        @media (max-width:960px){
          .pem .grid-4{ grid-template-columns:repeat(2,1fr); }
          .pem .grid-routes{ grid-template-columns:repeat(2,1fr); }
          .pem .steps{ grid-template-columns:repeat(2,1fr); }
        }

        /* ---------- SMALL TABLET (<= 860px) ---------- */
        @media (max-width:860px){
          .pem .fleet-section{ grid-template-columns:1fr; gap:28px; }
          .pem .grid-3{ grid-template-columns:1fr; gap:18px; margin-top:28px; }
          .pem .review-card p{ -webkit-line-clamp:10; }
        }

        /* ---------- MOBILE (<= 760px) ---------- */
        @media (max-width:760px){
          .pem{ --pad-x:16px; --pad-y:44px; padding-bottom:calc(72px + env(safe-area-inset-bottom)); }
          .pem .mobile-cta-bar{ display:flex; }
          .pem .lead{ font-size:1rem; }

          .pem .hero{ padding:56px 0 44px; }
          .pem .hero .lead{ font-size:1rem; }
          .pem .hero-ctas{ flex-direction:column; gap:12px; margin-top:24px; }
          .pem .hero-ctas .btn{ width:100%; }
          .pem .trust-strip{ display:grid; grid-template-columns:1fr 1fr; gap:12px 16px; margin-top:32px; padding-top:20px; font-size:.82rem; }

          .pem .final-cta{ padding:40px 20px; }
          .pem .final-cta .phone-big{ font-size:1.25rem; }
          .pem .final-ctas{ flex-direction:column; }
          .pem .final-ctas .btn{ width:100%; }
        }

        /* ---------- PHONE (<= 560px) ---------- */
        @media (max-width:560px){
          .pem .grid-4{ grid-template-columns:1fr; gap:14px; margin-top:28px !important; }
          .pem .value-card{ display:flex; gap:14px; align-items:flex-start; padding:20px 18px; }
          .pem .value-card .icon{ margin-bottom:0; }

          .pem .grid-routes{ grid-template-columns:1fr; gap:14px; margin-top:28px; }
          .pem .route-card{ padding:20px 18px; gap:12px; }

          .pem .steps{ grid-template-columns:1fr; gap:22px; margin-top:32px; }

          .pem .compliance-row{ flex-direction:column; gap:10px; padding:24px 0; }

          .pem .review-card{ padding:20px; }
          .pem .faq-q{ font-size:.95rem; padding:16px 0; }
        }

        /* ---------- VERY SMALL (<= 360px) ---------- */
        @media (max-width:360px){
          .pem .trust-strip{ grid-template-columns:1fr; }
          .pem .mobile-cta-bar{ padding-left:10px; padding-right:10px; gap:6px; }
          .pem .mobile-cta-bar a{ font-size:.78rem; padding:12px 4px; }
        }
      `}</style>

      <div className="pem">
        {/* ===================== HERO ===================== */}
        <section className="hero">
          <div className="wrap">
            <span className="eyebrow" style={{ color: "var(--gold-light)" }}>Disneyland Paris Transfers</span>
            <h1>Your Private, Door-to-Door Transfer to <em>Disneyland Paris</em></h1>
            <p className="lead">Travel on your own schedule, in total comfort, with luggage and kids sorted before you even land. A private driver takes you door-to-door from CDG, Orly, Beauvais or your Paris hotel — straight to the Disneyland gates, fixed price, no surprises.</p>
            <div className="hero-ctas">
              <Link className="btn btn-gold" href="/reservation">Book Your Transfer</Link>
              <a className="btn btn-outline" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp Us Now</a>
            </div>
            <div className="trust-strip">
              <div className="item">⭐ <strong>4.9</strong>&nbsp;Google</div>
              <div className="item">⭐ <strong>5.0</strong>&nbsp;TripAdvisor</div>
              <div className="item">🛡️ <strong>Licensed VTC</strong> Île-de-France</div>
              <div className="item">🤝 <strong>Meet &amp; Greet</strong> Guaranteed</div>
            </div>
          </div>
        </section>

        {/* ===================== VALUE PROPS ===================== */}
        <section>
          <div className="wrap">
            <div className="center" style={{ marginBottom: 8 }}>
              <span className="eyebrow">Why Families Choose Us</span>
              <h2>Comfort and Flexibility, Built Around You</h2>
              <p className="lead">The details that matter when you're travelling with children and luggage.</p>
            </div>
            <div className="grid-4" style={{ marginTop: 40 }}>
              {VALUE_PROPS.map((v) => (
                <div key={v.title} className="value-card">
                  <div className="icon">{v.icon}</div>
                  <div>
                    <h3>{v.title}</h3>
                    <p>{v.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== ROUTES ===================== */}
        <section className="routes-section">
          <div className="wrap">
            <div className="center">
              <span className="eyebrow" style={{ color: "var(--gold-light)" }}>Routes</span>
              <h2>Choose Your Route to Disneyland Paris</h2>
              <p className="lead" style={{ color: "#c9c3b5" }}>Every transfer seats up to 3 passengers with luggage. Need a larger group? WhatsApp us for a 7-seater quote.</p>
            </div>
            <div className="grid-routes">
              {ROUTES.map((r) => (
                <div key={r.slug} className="route-card">
                  <div className="route-name">{r.name}</div>
                  <div className="route-meta"><span>⏱ {r.eta}</span><span>👥 Up to 3</span></div>
                  <Link className="btn btn-gold btn-block" href={`/reservation?route=${r.slug}`}>Get Your Fixed Price</Link>
                </div>
              ))}
            </div>
            <p className="price-note">Fixed price per vehicle, not per person. Not sure which airport? <a href={WHATSAPP_URL} style={{ color: "var(--gold-light)", textDecoration: "underline" }}>WhatsApp us your flight number</a> for an instant quote.</p>
          </div>
        </section>

        {/* ===================== HOW IT WORKS ===================== */}
        <section>
          <div className="wrap">
            <div className="center">
              <span className="eyebrow">How It Works</span>
              <h2>Four Steps to the Happiest Place on Earth</h2>
            </div>
            <div className="steps">
              {STEPS.map((s, i) => (
                <div key={s.title} className="step">
                  <div className="num">{i + 1}</div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== FLEET ===================== */}
        <section style={{ background: "var(--cream-2)" }}>
          <div className="wrap fleet-section">
            <img src="/images/Luxury-van-Mercedes-V-class.jpg" alt="Luxury Mercedes V-Class private transfer van" />
            <div>
              <span className="eyebrow">Our Fleet</span>
              <h2>Comfortable, Private, Built for Families</h2>
              <p className="lead">Executive sedans and Mercedes V-Class vans, air-conditioned and driven by licensed professionals — sized to fit strollers, suitcases, and everything Disneyland sends you home with.</p>
              <ul className="fleet-list">
                <li>Seats 1–7 passengers plus luggage</li>
                <li>Free child and booster seats, fitted in advance</li>
                <li>Air-conditioned, non-shared, door-to-door</li>
                <li>Licensed, French-speaking professional drivers</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ===================== COMPLIANCE STRIP ===================== */}
        <section className="compliance" style={{ padding: 0 }}>
          <div className="wrap">
            <div className="compliance-row">
              <div><strong>Licensed VTC</strong> Île-de-France</div>
              <div><strong>SIRET</strong> Verified</div>
              <div><strong>Fully Insured</strong></div>
              <div><strong>24/7</strong> Availability</div>
              <div><strong>Cash, Visa, Mastercard, Amex</strong> Accepted</div>
            </div>
          </div>
        </section>

        {/* ===================== REVIEWS ===================== */}
        <section>
          <div className="wrap">
            <div className="center">
              <span className="eyebrow">What Families Say</span>
              <h2>Rated 4.9 on Google · 5.0 on TripAdvisor</h2>
            </div>
            <div className="grid-3">
              {REVIEWS.map((r, i) => (
                <div key={i} className="review-card">
                  <div className="stars">★★★★★</div>
                  <p>&quot;{r.text}&quot;</p>
                  <div className="who">— {r.author}, {r.source}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== FAQ ===================== */}
        <section style={{ background: "var(--cream-2)" }}>
          <div className="wrap" style={{ maxWidth: 820 }}>
            <div className="center">
              <span className="eyebrow">Questions</span>
              <h2>Before You Book</h2>
            </div>
            <div style={{ marginTop: 30 }}>
              {FAQS.map((f, i) => (
                <div key={f.q} className={`faq-item${openFaq === i ? " open" : ""}`}>
                  <button
                    className="faq-q"
                    aria-expanded={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span>{f.q}</span> <span className="plus">+</span>
                  </button>
                  <div className="faq-a"><p>{f.a}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== FINAL CTA ===================== */}
        <section>
          <div className="wrap">
            <div className="final-cta">
              <span className="eyebrow" style={{ color: "var(--gold-light)" }}>Ready When You Are</span>
              <h2>Ready for a Stress-Free Start to Your Disneyland Trip?</h2>
              <p style={{ color: "#d8d2c4", maxWidth: 520, margin: "10px auto 0" }}>Fixed price. Free child seats. A driver waiting with your name on it.</p>
              <div className="phone-big">📞 {PHONE_DISPLAY}</div>
              <div className="final-ctas">
                <Link className="btn btn-gold" href="/reservation">Book Your Transfer</Link>
                <a className="btn btn-outline" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp Us</a>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== STICKY MOBILE CTA ===================== */}
        <div className="mobile-cta-bar">
          <a className="call" href={`tel:${PHONE_TEL}`}>📞 Call</a>
          <a className="wa" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <Link className="book" href="/reservation">Book Now</Link>
        </div>
      </div>
    </>
  );
}