"use client";

import { useState, useMemo } from "react";

/* Keep these identical to the hero, rates and reservation components */
const BRAND         = "Super Star Travel";
const SITE_URL      = "https://www.superstartravelcabs.com";
const PHONE_DISPLAY = "+94 72 680 3498";
const PHONE_TEL     = "+94726803498";
const WHATSAPP_URL  = "https://wa.me/94726803498";
const CURRENCY      = "$";
const NIGHT_FEE     = 15; // matches NIGHT_SURCHARGE on the reservation page

const faqs = [
  {
    category: "Booking",
    icon: "📋",
    items: [
      {
        q: "How do I book a car, van or bus in Sri Lanka?",
        a: "Use the booking form on our website: choose your pickup and drop-off, date, time and number of passengers, then pick a vehicle and enter your details. It takes about two minutes and you see the fixed fare before you confirm. For custom routes you can also message us on WhatsApp or call.",
      },
      {
        q: "How far in advance should I book?",
        a: "For airport transfers we recommend at least 24 hours ahead. Book earlier for the busy months (December to March, and July to August) and around big festivals such as the Kandy Esala Perahera. Last-minute bookings are welcome, subject to vehicle availability.",
      },
      {
        q: "Can I change or cancel my booking?",
        a: "Yes, cancellation is free. To change the date, time or pickup point, or to cancel, send us a WhatsApp message or call. The earlier you tell us, the easier it is for us to reassign the vehicle and driver.",
      },
      {
        q: "What do I receive after booking?",
        a: "A confirmation by email with your route, vehicle, pickup time and fixed fare. We also message you the driver's contact details before your pickup, so you know who to look for.",
      },
      {
        q: "My route isn't listed. What should I do?",
        a: "Send a quote request through the booking form, or message us on WhatsApp. We reply with a personal fixed fare, usually within a few hours, and you only confirm if you are happy with it.",
      },
    ],
  },
  {
    category: "Airport transfers",
    icon: "✈️",
    items: [
      {
        q: "Where will my driver meet me at Colombo Airport (CMB)?",
        a: "Your driver waits in the arrivals hall at Bandaranaike International Airport, after immigration and customs, holding a sign with your name. This meet-and-greet is included in your fare.",
      },
      {
        q: "What if my flight is delayed?",
        a: "We track your flight using the flight number you give at booking. If you land late, your driver adjusts the pickup time automatically, with no extra waiting charge for flight delays.",
      },
      {
        q: "How long does it take to get from the airport to my hotel?",
        a: "As a rough guide: Negombo 20 to 30 minutes, Colombo 45 to 90 minutes depending on traffic, Galle about 2 to 2.5 hours via the expressway, Kandy 3.5 to 4.5 hours, and Sigiriya around 4 to 5 hours. Traffic and weather can add time, so we plan generously.",
      },
      {
        q: "Do you handle night or early-morning flights?",
        a: "Yes, we operate 24 hours a day, every day. Pickups between 10 PM and 6 AM carry a night surcharge of " + CURRENCY + NIGHT_FEE + " per direction, which is shown in your fare before you confirm.",
      },
      {
        q: "When should I leave for my departure flight?",
        a: "Plan to reach the airport about three hours before an international departure. From Kandy, Sigiriya or the hill country, leave early enough to allow for slow mountain roads, and tell us your flight time so we can suggest a pickup time.",
      },
    ],
  },
  {
    category: "Vehicles",
    icon: "🚐",
    items: [
      {
        q: "What vehicles do you offer?",
        a: "Our fleet includes comfortable cars for small parties, vans for families and groups of up to 8, SUVs, and minibuses for larger groups of up to 16. All are air-conditioned and well maintained. The exact capacity of each vehicle is shown during booking.",
      },
      {
        q: "Which vehicle is right for my group?",
        a: "Count every passenger, including children, and your bags. The booking form suggests the smallest vehicle that fits and warns you if a choice is too small. If you are between sizes, choose the larger one: Sri Lankan roads are winding, and extra space makes long days far more comfortable.",
      },
      {
        q: "How much luggage can I bring?",
        a: "Enter your number of bags when you book and each vehicle shows its limit. If you travel with surfboards, bicycles, golf bags or other bulky items, tell us in advance so we can assign a suitable vehicle.",
      },
      {
        q: "Do you provide buses for large groups?",
        a: "Yes. Minibuses carry up to 16 passengers. For bigger groups, weddings, or corporate events, we can arrange several vehicles or a larger coach. Message us with your group size and dates for a quote.",
      },
      {
        q: "Are child seats available?",
        a: "Yes, child seats and boosters are free. Add a note in the special requests field when you book, with the age of each child, and we will have them fitted. Strollers fit in our vans and minibuses.",
      },
      {
        q: "Can I rent a scooter?",
        a: "Yes, ask us about scooter hire on WhatsApp. Visitors who ride or drive themselves need a valid licence and should check the current requirements for foreign licences in Sri Lanka before travelling.",
      },
    ],
  },
  {
    category: "Tours & driver hire",
    icon: "🗺️",
    items: [
      {
        q: "Can I hire a car and driver for several days?",
        a: "Yes. A multi-day private driver is one of the most relaxed ways to see the island. Your driver stays with you for the whole trip and you set the pace. Popular loops link Colombo, Kandy, Sigiriya, Nuwara Eliya, Ella and the south coast. Tell us your dates and we send a tailored quote.",
      },
      {
        q: "Do you offer day tours and excursions?",
        a: "Yes. Common day trips include Sigiriya and Dambulla, Kandy and the Temple of the Tooth, Galle Fort, and tea country. We can also take you to safari parks such as Yala. Ask for a quote based on your starting point and the places you want to visit.",
      },
      {
        q: "Can we stop along the way for waterfalls, tea factories or viewpoints?",
        a: "Short photo and rest stops on a transfer are no problem. If you want longer sightseeing stops, book a day tour or a multi-day hire, and we will plan the route and timing around them.",
      },
      {
        q: "Can you drop us at a train station for the Kandy to Ella train?",
        a: "Yes. We can drive you to the station, meet you at the end of the journey, and carry on to your next hotel. Train tickets are not included, so book them separately and well ahead, as the scenic routes sell out quickly.",
      },
    ],
  },
  {
    category: "Pricing & payment",
    icon: "💳",
    items: [
      {
        q: "How is the fare calculated?",
        a: "Fares are fixed per vehicle, not per person, and depend on your route and group size. You see the exact price before you book, and there is no surge pricing. Use our rates page to compare routes and vehicles.",
      },
      {
        q: "What is included in the price?",
        a: "Your fare covers the vehicle, fuel, the driver, and the fees on your route, including highway tolls and parking. Airport pickups include meet and greet. The only extras are the night surcharge and any stops or detours you ask for beyond your booked route.",
      },
      {
        q: "How and when do I pay?",
        a: "You pay your driver at the end of the journey, in cash or by card. Nothing is charged online when you book. Ask us at booking if you have a question about currencies or card payments.",
      },
      {
        q: "Is a round trip cheaper?",
        a: "A round trip is priced as two single journeys, so the booking form shows double the one-way fare. You enter the return date and time when you book, and the same driver and vehicle type are arranged for you.",
      },
      {
        q: "How are groups of 9 or more priced?",
        a: "Groups of 9 or more are priced at twice the 8-passenger rate for that route and vehicle. For large groups, minibuses or two vehicles may be better value, so message us for the best option.",
      },
      {
        q: "Do you offer discounts for agents or large bookings?",
        a: "Yes. Travel agents, corporate clients and large groups can ask for special rates. Contact us with your itinerary and we will prepare an offer.",
      },
    ],
  },
  {
    category: "Drivers & safety",
    icon: "🛡️",
    items: [
      {
        q: "Are your drivers licensed and do they speak English?",
        a: "Yes. All our drivers are licensed, experienced and professional, and speak English. Russian-speaking drivers are also available, so mention your language preference when you book.",
      },
      {
        q: "Are the roads safe, and how do drivers handle mountain routes?",
        a: "Our drivers know Sri Lanka's roads well, including winding hill country routes, heavy bus and tuk-tuk traffic, and wet-season conditions. They drive at a steady, safe speed, and our vehicles are regularly serviced and insured. Seat belts are available in every vehicle.",
      },
      {
        q: "Is it safe for solo travellers and families?",
        a: "Yes. Many of our guests are solo travellers, couples and families with children. Your driver's details are sent in advance, and you can message or call us at any time during your trip.",
      },
      {
        q: "What if my driver is late or I need help during the trip?",
        a: "Contact us on WhatsApp or by phone at any hour. We will reach your driver immediately and fix the problem, whether that is a delayed pickup, a change of plan or an issue on the road.",
      },
    ],
  },
  {
    category: "Travel tips",
    icon: "🌴",
    items: [
      {
        q: "Why do journeys take longer than the map suggests?",
        a: "Most roads are single carriageway with towns, buses and tuk-tuks along the way, so average speeds are often 40 to 50 km/h outside expressways. Plan generously and avoid tight connections on long transfers.",
      },
      {
        q: "How does the weather affect travel?",
        a: "Sri Lanka has two monsoons: the south-west monsoon (roughly May to September) mainly affects the west, south and hill country, and the north-east monsoon (roughly October to January) affects the north and east. Heavy rain can slow journeys, and your driver will adjust the route and timing for safety.",
      },
      {
        q: "Do I need a visa to visit Sri Lanka?",
        a: "Most visitors need an Electronic Travel Authorisation (ETA) or a visa before arrival. Rules change, so check the official Sri Lankan government immigration website for your nationality before you travel. We can only help with the transport side.",
      },
      {
        q: "Are there days when traffic or services are affected?",
        a: "Full-moon Poya days and major festivals can mean heavier traffic around temples and busy towns, and alcohol is not sold on Poya days. Tell us your dates and we will let you know if anything may affect your route.",
      },
    ],
  },
];

const ALL = "All";

export default function FAQPage() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [active, setActive]   = useState<string>(ALL);
  const [query, setQuery]     = useState("");

  const categories = [ALL, ...faqs.map(f => f.category)];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs
      .filter(f => active === ALL || f.category === active)
      .map(f => ({
        ...f,
        items: f.items
          .map((item, i) => ({ ...item, key: `${f.category}-${i}` }))
          .filter(item => !q || item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)),
      }))
      .filter(f => f.items.length > 0);
  }, [active, query]);

  const total = visible.reduce((n, s) => n + s.items.length, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: `${SITE_URL}/faq`,
    mainEntity: faqs.flatMap(f => f.items).map(item => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap');

        .fq {
          --h-ink:#173b32; --h-ink-soft:rgba(23,59,50,.80); --h-ink-faint:rgba(23,59,50,.66);
          --h-teal:#2f7d5b; --h-teal-deep:#173b32; --h-sun:#2f7d5b; --h-sun-deep:#245e46;
          --h-field-line:#d3dde0; --h-ease:cubic-bezier(.25,.1,.25,1);
          font-family:'Figtree',system-ui,sans-serif; color:var(--h-ink); min-height:100vh; overflow-x:clip;
          background:
            radial-gradient(60% 34% at 92% 4%, rgba(47,125,91,.26), transparent 70%),
            radial-gradient(65% 40% at 4% 40%, rgba(47,125,91,.18), transparent 70%),
            radial-gradient(60% 34% at 92% 90%, rgba(47,125,91,.20), transparent 70%),
            #f3f7f2;
        }
        .fq *, .fq *::before, .fq *::after { box-sizing:border-box; margin:0; padding:0; }
        .fq button, .fq input { font-family:inherit; }
        .fq :focus-visible { outline:3px solid var(--h-teal); outline-offset:2px; }
        .fq-wrap { max-width:900px; margin:0 auto; padding:0 4vw; }

        .glass {
          background:linear-gradient(135deg, rgba(255,255,255,.80), rgba(255,255,255,.62));
          -webkit-backdrop-filter:blur(22px) saturate(170%); backdrop-filter:blur(22px) saturate(170%);
          border:1px solid rgba(255,255,255,.7);
          box-shadow:0 24px 54px rgba(16,44,37,.14), 0 4px 12px rgba(16,44,37,.08), inset 0 1.5px 0 rgba(255,255,255,.85);
        }

        /* ══ Intro ══ */
        .fq-intro { padding:40px 0 24px; animation:fq-rise .8s var(--h-ease) both; }
        @keyframes fq-rise { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
        .fq-kicker { display:inline-block; font-size:13.5px; font-weight:600; color:var(--h-teal-deep); border-radius:100px; padding:5px 14px; margin-bottom:16px;
          background:linear-gradient(135deg, rgba(255,255,255,.62), rgba(255,255,255,.30));
          -webkit-backdrop-filter:blur(14px) saturate(180%); backdrop-filter:blur(14px) saturate(180%);
          border:1px solid rgba(255,255,255,.7);
          box-shadow:0 6px 18px rgba(23,59,50,.12), inset 0 1.5px 0 rgba(255,255,255,.85); }
        .fq-h1 { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(32px,5vw,60px); font-weight:800; line-height:1.04; letter-spacing:-.02em; margin-bottom:10px; }
        .fq-sub { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(17px,2.2vw,26px); font-weight:600; line-height:1.2; color:var(--h-teal); margin-bottom:14px; }
        .fq-desc { font-size:16px; font-weight:500; line-height:1.55; color:var(--h-ink-soft); max-width:560px; }

        /* ══ Search + category pills ══ */
        .fq-tools { position:relative; overflow:hidden; border-radius:24px; padding:20px 18px 16px; margin-bottom:28px; animation:fq-rise .8s .12s var(--h-ease) both; }
        .fq-tools::before { content:""; position:absolute; left:0; right:0; top:0; height:4px; background:linear-gradient(90deg, var(--h-teal-deep), var(--h-teal) 55%, var(--h-sun)); }
        .fq-search { display:flex; align-items:center; gap:10px; min-height:50px; padding:0 14px; border-radius:14px;
          background:rgba(255,255,255,.78); border:1px solid rgba(255,255,255,.85);
          box-shadow:0 1px 3px rgba(23,59,50,.08), inset 0 1px 0 rgba(255,255,255,.9); transition:border-color .2s, box-shadow .2s; }
        .fq-search:focus-within { border-color:var(--h-teal); box-shadow:0 0 0 3px rgba(47,125,91,.18); }
        .fq-search svg { flex-shrink:0; width:18px; height:18px; color:var(--h-teal); }
        .fq-search input { flex:1; min-width:0; border:none; outline:none; background:transparent; font-size:16px; font-weight:600; color:var(--h-ink); }
        .fq-search input::placeholder { font-weight:500; color:rgba(23,59,50,.45); }
        .fq-clear { border:none; background:none; cursor:pointer; font-size:13px; font-weight:700; color:var(--h-teal-deep); text-decoration:underline; text-underline-offset:3px; padding:4px; }

        .fq-pills { display:flex; gap:6px; margin-top:14px; overflow-x:auto; padding:2px 2px 6px; scrollbar-width:none; }
        .fq-pills::-webkit-scrollbar { display:none; }
        .fq-pill { flex-shrink:0; border:none; cursor:pointer; white-space:nowrap; padding:8px 16px; border-radius:100px; font-size:13.5px; font-weight:700; color:var(--h-ink-soft);
          background:#e8f1e8; box-shadow:inset 0 1px 2px rgba(23,59,50,.12); transition:background .25s, color .2s, box-shadow .25s; }
        .fq-pill:hover { color:var(--h-teal-deep); background:#e8f1e8; }
        .fq-pill[aria-pressed="true"] { background:var(--h-teal-deep); color:#fff; box-shadow:0 2px 8px rgba(23,59,50,.35); }

        /* ══ Sections ══ */
        .fq-count { font-size:14px; font-weight:500; color:var(--h-ink-soft); margin:0 6px 14px; }
        .fq-count b { color:var(--h-ink); font-weight:700; }
        .fq-section { margin-bottom:32px; }
        .fq-shead { display:flex; align-items:center; gap:12px; margin:0 6px 12px; }
        .fq-ico { flex-shrink:0; width:42px; height:42px; border-radius:50%; font-size:19px; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;
          background:linear-gradient(145deg, rgba(255,255,255,.75), rgba(255,255,255,.35));
          border:1px solid rgba(255,255,255,.7); box-shadow:0 6px 16px rgba(23,59,50,.14), inset 0 1.5px 0 rgba(255,255,255,.9); }
        .fq-ico::before { content:""; position:absolute; left:10%; right:10%; top:3%; height:46%; border-radius:50%; background:linear-gradient(180deg, rgba(255,255,255,.65), rgba(255,255,255,0)); pointer-events:none; }
        .fq-ico span { position:relative; }
        .fq-stitle { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(19px,2.4vw,24px); font-weight:700; letter-spacing:-.01em; }
        .fq-snum { margin-left:auto; font-size:13px; font-weight:600; color:var(--h-ink-faint); }

        /* ══ Accordion ══ */
        .fq-list { display:flex; flex-direction:column; gap:10px; }
        .fq-item { border-radius:18px; overflow:hidden; transition:box-shadow .25s; }
        .fq-item.open { box-shadow:0 30px 64px rgba(16,44,37,.18), 0 4px 12px rgba(16,44,37,.08), inset 0 1.5px 0 rgba(255,255,255,.85); }
        .fq-q { width:100%; display:flex; align-items:center; gap:14px; text-align:left; background:none; border:none; color:inherit; cursor:pointer; padding:16px 18px; min-height:60px; }
        .fq-qtext { flex:1; font-size:15.5px; font-weight:700; line-height:1.4; transition:color .2s; }
        .fq-item.open .fq-qtext { color:var(--h-teal-deep); }
        .fq-chev { flex-shrink:0; width:30px; height:30px; padding:7px; border-radius:50%; color:var(--h-teal-deep); background:#f3f7f2; border:1px solid var(--h-field-line); transition:transform .3s, background .2s, color .2s, border-color .2s; }
        .fq-q:hover .fq-chev, .fq-item.open .fq-chev { background:var(--h-teal-deep); border-color:var(--h-teal-deep); color:#fff; }
        .fq-item.open .fq-chev { transform:rotate(180deg); }
        .fq-body { display:grid; grid-template-rows:0fr; transition:grid-template-rows .35s var(--h-ease); }
        .fq-item.open .fq-body { grid-template-rows:1fr; }
        .fq-body > div { overflow:hidden; }
        .fq-a { margin:0 18px 18px; padding:14px 16px; border-radius:14px; font-size:15px; font-weight:500; line-height:1.65; color:var(--h-ink-soft);
          background:rgba(255,244,214,.6); border:1px solid rgba(240,217,154,.8); }

        .fq-empty { border-radius:24px; padding:56px 20px; text-align:center; font-family:'Bricolage Grotesque',sans-serif; font-size:22px; font-weight:700; }
        .fq-empty p { font-family:'Figtree',sans-serif; font-size:14.5px; font-weight:500; color:var(--h-ink-soft); margin:8px 0 20px; }
        .fq-empty button { height:46px; padding:0 26px; border:none; border-radius:14px; cursor:pointer; font-size:14.5px; font-weight:700; color:#fff;
          background:linear-gradient(180deg,#c2410c,#9a3412); box-shadow:0 8px 18px rgba(194,65,12,.38), inset 0 1px 0 rgba(255,255,255,.3); }

        /* ══ CTA ══ */
        .fq-cta { padding:20px 0 64px; }
        .fq-ctacard { position:relative; overflow:hidden; border-radius:24px; padding:34px 32px; color:#fff;
          background:radial-gradient(60% 120% at 100% 0%, rgba(47,125,91,.34), transparent 65%), linear-gradient(135deg, var(--h-teal-deep), var(--h-teal));
          box-shadow:0 34px 70px rgba(23,59,50,.35), 0 6px 16px rgba(16,44,37,.12);
          display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:22px; }
        .fq-ctacard h2 { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(22px,3vw,32px); font-weight:800; letter-spacing:-.02em; margin-bottom:6px; }
        .fq-ctacard p { font-size:15px; font-weight:500; color:rgba(255,255,255,.86); max-width:420px; }
        .fq-btns { display:flex; gap:10px; flex-wrap:wrap; }
        .fq-btn { height:46px; padding:0 22px; border-radius:14px; display:inline-flex; align-items:center; justify-content:center; font-size:14.5px; font-weight:700; text-decoration:none; transition:transform .2s, background .2s; white-space:nowrap; }
        .fq-btn:hover { transform:translateY(-2px); }
        .fq-btn.p { background:linear-gradient(180deg,#c2410c,#9a3412); color:#fff; box-shadow:0 8px 18px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.3); }
        .fq-btn.g { color:#fff; background:linear-gradient(135deg, rgba(255,255,255,.28), rgba(255,255,255,.08)); border:1px solid rgba(255,255,255,.5); box-shadow:inset 0 1.5px 0 rgba(255,255,255,.5); }
        .fq-btn.g:hover { background:rgba(255,255,255,.28); }

        @media (max-width:640px) {
          .fq-intro { padding:24px 0 18px; }
          .fq-tools { padding:18px 14px 12px; border-radius:22px; }
          .fq-q { padding:14px; gap:10px; }
          .fq-qtext { font-size:15px; }
          .fq-a { margin:0 12px 14px; padding:12px 14px; font-size:14.5px; }
          .fq-ctacard { padding:26px 20px; }
          .fq-btns, .fq-btn { width:100%; }
        }
        @supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))) { .glass { background:#fff; } }
        @media (prefers-reduced-transparency:reduce) { .glass { background:#fff; -webkit-backdrop-filter:none; backdrop-filter:none; } }
        @media (prefers-reduced-motion:reduce) { .fq *, .fq *::before { animation:none !important; transition:none !important; } }
      `}</style>

      {/* SEO: FAQPage structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="fq">
        <div className="fq-wrap">

          {/* Intro */}
          <header className="fq-intro">
            <p className="fq-kicker">Help centre · Car, van &amp; bus hire in Sri Lanka</p>
            <h1 className="fq-h1">Frequently asked questions</h1>
            <h2 className="fq-sub">Transfers, tours and driver hire across the island</h2>
            <p className="fq-desc">
              Everything you need to know about booking a private car, van or bus with {BRAND}: airport pickups, fixed fares, vehicles and travelling in Sri Lanka.
            </p>
          </header>

          {/* Search + categories */}
          <section className="fq-tools glass" aria-label="Search and filter questions">
            <label className="fq-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={e => { setQuery(e.target.value); setOpenKey(null); }}
                placeholder="Search questions, e.g. airport, child seat, cancel"
                aria-label="Search questions"
              />
              {query && <button type="button" className="fq-clear" onClick={() => setQuery("")}>Clear</button>}
            </label>
            <div className="fq-pills" role="group" aria-label="Question categories">
              {categories.map(cat => (
                <button key={cat} type="button" className="fq-pill" aria-pressed={active === cat}
                  onClick={() => { setActive(cat); setOpenKey(null); }}>
                  {cat}
                </button>
              ))}
            </div>
          </section>

          {/* Questions */}
          <main>
            {total === 0 ? (
              <div className="fq-empty glass">
                No questions match your search
                <p>Try a different word, or ask us directly on WhatsApp.</p>
                <button type="button" onClick={() => { setQuery(""); setActive(ALL); }}>Clear search</button>
              </div>
            ) : (
              <>
                <p className="fq-count" aria-live="polite"><b>{total}</b> question{total !== 1 ? "s" : ""}</p>

                {visible.map(section => (
                  <section className="fq-section" key={section.category} aria-labelledby={`h-${section.category}`}>
                    <div className="fq-shead">
                      <span className="fq-ico" aria-hidden="true"><span>{section.icon}</span></span>
                      <h3 id={`h-${section.category}`} className="fq-stitle">{section.category}</h3>
                      <span className="fq-snum">{section.items.length}</span>
                    </div>

                    <div className="fq-list">
                      {section.items.map(item => {
                        const isOpen = openKey === item.key;
                        return (
                          <article key={item.key} className={`fq-item glass${isOpen ? " open" : ""}`}>
                            <h4>
                              <button type="button" className="fq-q" aria-expanded={isOpen}
                                aria-controls={`a-${item.key}`} id={`q-${item.key}`}
                                onClick={() => setOpenKey(isOpen ? null : item.key)}>
                                <span className="fq-qtext">{item.q}</span>
                                <svg className="fq-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                                </svg>
                              </button>
                            </h4>
                            <div className="fq-body" id={`a-${item.key}`} role="region" aria-labelledby={`q-${item.key}`}>
                              <div><p className="fq-a">{item.a}</p></div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </>
            )}
          </main>

          {/* CTA */}
          <section className="fq-cta">
            <div className="fq-ctacard">
              <div>
                <h2>Still have a question?</h2>
                <p>We reply on WhatsApp and by phone at any hour. Tell us your route and dates and we will send a fixed fare.</p>
              </div>
              <div className="fq-btns">
                <a href={`tel:${PHONE_TEL}`} className="fq-btn p" aria-label={`Call ${PHONE_DISPLAY}`}>Call {PHONE_DISPLAY}</a>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="fq-btn g">WhatsApp us</a>
                <a href="/reservation" className="fq-btn g">Book a transfer</a>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}