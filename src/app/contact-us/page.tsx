"use client";

import { useState } from "react";

/* ─────────────────────────────────────────────
   Edit these once — same constants as the other pages
   ───────────────────────────────────────────── */
const BRAND       = "Super Star Travel";
const SITE_URL    = "https://www.superstartravelcabs.com";
const SITE_LABEL  = "www.superstartravelcabs.com";
const EMAIL       = "support@superstartravelcabs.com";
const PHONE_1     = { display: "+94 72 680 3498", tel: "+94726803498", wa: "https://wa.me/94726803498" };
const ADDRESS     = "Colombo, Sri Lanka";
const MAP_SRC     = "https://www.google.com/maps?q=Colombo,+Sri+Lanka&output=embed";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactUs() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", subject: "", message: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.firstName || !form.email || !form.message) {
      setErrorMsg("Please fill in your name, email and message.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      setStatus("success");
      setForm({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      setErrorMsg((err as Error).message || "Failed to send. Please try again.");
      setStatus("error");
    }
  };

  /* SEO: structured data */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: `${SITE_URL}/contact`,
    mainEntity: {
      "@type": "TravelAgency",
      name: BRAND,
      url: SITE_URL,
      email: EMAIL,
      telephone: PHONE_1.tel,
      address: { "@type": "PostalAddress", addressLocality: "Colombo", addressCountry: "LK" },
      contactPoint: [PHONE_1].map(p => ({
        "@type": "ContactPoint", telephone: p.tel, contactType: "customer service",
        availableLanguage: ["English", "Russian"],
      })),
    },
  };

  const cards = [
    {
      key: "address", label: "Location", href: undefined as string | undefined,
      icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></>,
      value: <>{BRAND}</>, sub: <>{ADDRESS}<br />Island-wide pickups, 24 / 7</>,
    },
    {
      key: "email", label: "Email", href: `mailto:${EMAIL}`,
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>,
      value: <>{EMAIL}</>, sub: <>We reply within 1 hour</>,
    },
    {
      key: "web", label: "Website", href: SITE_URL,
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/>,
      value: <>{SITE_LABEL}</>, sub: <>Book online anytime</>,
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap');

        .cp-root {
          --h-ink:#173b32; --h-ink-soft:rgba(23,59,50,.80); --h-ink-faint:rgba(23,59,50,.66);
          --h-teal:#2f7d5b; --h-teal-deep:#173b32; --h-sun:#2f7d5b; --h-sun-deep:#245e46;
          --h-field-line:#d3dde0; --h-ease:cubic-bezier(.25,.1,.25,1);
          font-family:'Figtree',system-ui,sans-serif; color:var(--h-ink); min-height:100vh; overflow-x:clip;
          background:
            radial-gradient(60% 34% at 92% 4%, rgba(47,125,91,.26), transparent 70%),
            radial-gradient(65% 40% at 4% 46%, rgba(47,125,91,.18), transparent 70%),
            radial-gradient(60% 34% at 92% 92%, rgba(47,125,91,.20), transparent 70%),
            #f3f7f2;
        }
        .cp-root *, .cp-root *::before, .cp-root *::after { box-sizing:border-box; margin:0; padding:0; }
        .cp-root button, .cp-root input, .cp-root select, .cp-root textarea { font-family:inherit; }
        .cp-root :focus-visible { outline:3px solid var(--h-teal); outline-offset:2px; }
        .cp-wrap { max-width:1120px; margin:0 auto; padding:0 4vw; }

        .glass {
          background:linear-gradient(135deg, rgba(255,255,255,.80), rgba(255,255,255,.62));
          -webkit-backdrop-filter:blur(22px) saturate(170%); backdrop-filter:blur(22px) saturate(170%);
          border:1px solid rgba(255,255,255,.7);
          box-shadow:0 24px 54px rgba(16,44,37,.14), 0 4px 12px rgba(16,44,37,.08), inset 0 1.5px 0 rgba(255,255,255,.85);
        }

        /* ══ Intro ══ */
        .cp-intro { padding:40px 0 28px; animation:cp-rise .8s var(--h-ease) both; }
        @keyframes cp-rise { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
        @keyframes cp-spin { to{transform:rotate(360deg)} }
        .cp-kicker { display:inline-block; font-size:13.5px; font-weight:600; color:var(--h-teal-deep); border-radius:100px; padding:5px 14px; margin-bottom:16px;
          background:linear-gradient(135deg, rgba(255,255,255,.62), rgba(255,255,255,.30));
          -webkit-backdrop-filter:blur(14px) saturate(180%); backdrop-filter:blur(14px) saturate(180%);
          border:1px solid rgba(255,255,255,.7);
          box-shadow:0 6px 18px rgba(23,59,50,.12), inset 0 1.5px 0 rgba(255,255,255,.85); }
        .cp-h1 { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(32px,5vw,62px); font-weight:800; line-height:1.04; letter-spacing:-.02em; margin-bottom:10px; }
        .cp-sub { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(17px,2.2vw,26px); font-weight:600; line-height:1.2; color:var(--h-teal); margin-bottom:14px; }
        .cp-desc { font-size:16px; font-weight:500; line-height:1.55; color:var(--h-ink-soft); max-width:580px; }

        /* ══ Layout ══ */
        .cp-grid { display:grid; grid-template-columns:1fr 1.1fr; gap:28px; align-items:start; padding-bottom:28px; }
        @media (max-width:900px) { .cp-grid { grid-template-columns:1fr; gap:22px; } }

        /* ══ Left: quick actions + info ══ */
        .cp-left { display:flex; flex-direction:column; gap:12px; animation:cp-rise .8s .12s var(--h-ease) both; }
        .cp-quick { position:relative; overflow:hidden; border-radius:24px; padding:22px 20px 20px; }
        .cp-quick::before, .cp-form::before { content:""; position:absolute; left:0; right:0; top:0; height:4px; background:linear-gradient(90deg, var(--h-teal-deep), var(--h-teal) 55%, var(--h-sun)); }
        .cp-qtitle { font-family:'Bricolage Grotesque',sans-serif; font-size:18px; font-weight:700; margin-bottom:12px; }
        .cp-phones { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        @media (max-width:520px) { .cp-phones { grid-template-columns:1fr; } }
        .cp-phone { display:flex; flex-direction:column; gap:1px; padding:10px 14px 11px; border-radius:14px; text-decoration:none; color:inherit;
          background:rgba(255,255,255,.78); border:1px solid rgba(255,255,255,.85);
          box-shadow:0 1px 3px rgba(23,59,50,.08), inset 0 1px 0 rgba(255,255,255,.9); transition:border-color .2s, box-shadow .2s, transform .2s; }
        .cp-phone:hover { border-color:var(--h-teal); box-shadow:0 0 0 3px rgba(47,125,91,.14); transform:translateY(-2px); }
        .cp-phone small { font-size:11.5px; font-weight:600; color:var(--h-ink-faint); }
        .cp-phone b { font-family:'Bricolage Grotesque',sans-serif; font-size:18px; font-weight:700; font-variant-numeric:tabular-nums; }
        .cp-qbtns { display:flex; gap:8px; margin-top:12px; flex-wrap:wrap; }
        .cp-qbtn { flex:1 1 150px; height:46px; border-radius:14px; display:inline-flex; align-items:center; justify-content:center; gap:8px; font-size:14.5px; font-weight:700; text-decoration:none; transition:transform .2s, background .2s; }
        .cp-qbtn:hover { transform:translateY(-2px); }
        .cp-qbtn svg { width:17px; height:17px; }
        .cp-qbtn.wa { background:linear-gradient(180deg,#c2410c,#9a3412); color:#fff; box-shadow:0 8px 18px rgba(194,65,12,.38), inset 0 1px 0 rgba(255,255,255,.3); }
        .cp-qbtn.wa:hover { background:linear-gradient(180deg,#9a3412,#7c2d12); }
        .cp-qbtn.call { background:linear-gradient(180deg,#c2410c,#9a3412); color:#fff; box-shadow:0 8px 18px rgba(194,65,12,.38), inset 0 1px 0 rgba(255,255,255,.3); }
        .cp-qbtn.call:hover { background:linear-gradient(180deg,#9a3412,#7c2d12); }

        .cp-card { display:flex; align-items:center; gap:14px; padding:16px 18px; border-radius:20px; text-decoration:none; color:inherit; transition:transform .25s, box-shadow .25s; }
        a.cp-card:hover { transform:translateY(-2px); box-shadow:0 30px 60px rgba(16,44,37,.18), 0 4px 12px rgba(16,44,37,.08), inset 0 1.5px 0 rgba(255,255,255,.85); }
        .cp-ico { flex-shrink:0; width:42px; height:42px; border-radius:50%; color:var(--h-teal-deep); display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;
          background:linear-gradient(145deg, rgba(255,255,255,.75), rgba(255,255,255,.35));
          border:1px solid rgba(255,255,255,.7); box-shadow:0 6px 16px rgba(23,59,50,.14), inset 0 1.5px 0 rgba(255,255,255,.9); }
        .cp-ico::before { content:""; position:absolute; left:10%; right:10%; top:3%; height:46%; border-radius:50%; background:linear-gradient(180deg, rgba(255,255,255,.65), rgba(255,255,255,0)); pointer-events:none; }
        .cp-ico svg { position:relative; width:19px; height:19px; }
        .cp-clabel { font-size:12px; font-weight:600; color:var(--h-ink-faint); }
        .cp-cvalue { font-size:15px; font-weight:700; line-height:1.35; word-break:break-word; }
        .cp-csub { font-size:13px; font-weight:500; color:var(--h-ink-faint); line-height:1.4; margin-top:1px; }

        .cp-socials { display:flex; gap:8px; flex-wrap:wrap; }
        .cp-social { display:inline-flex; align-items:center; gap:8px; height:42px; padding:0 16px; border-radius:100px; text-decoration:none; font-size:13.5px; font-weight:700; color:var(--h-teal-deep);
          background:rgba(255,255,255,.78); border:1px solid rgba(255,255,255,.85); box-shadow:0 1px 3px rgba(23,59,50,.08), inset 0 1px 0 rgba(255,255,255,.9); transition:background .2s, color .2s, transform .2s; }
        .cp-social:hover { background:var(--h-teal-deep); color:#fff; transform:translateY(-2px); }
        .cp-social svg { width:15px; height:15px; }

        .cp-map { position:relative; overflow:hidden; border-radius:20px; height:200px; padding:0; }
        .cp-map iframe { position:absolute; inset:0; width:100%; height:100%; border:0; }
        .cp-map-label { position:absolute; left:12px; bottom:12px; z-index:1; font-size:12.5px; font-weight:700; color:var(--h-teal-deep); padding:6px 14px; border-radius:100px;
          background:linear-gradient(135deg, rgba(255,255,255,.9), rgba(255,255,255,.7)); -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,.9); }

        /* ══ Right: form ══ */
        .cp-form { position:relative; overflow:hidden; border-radius:24px; padding:30px 26px 24px; animation:cp-rise .8s .2s var(--h-ease) both; }
        @media (max-width:640px) { .cp-form { padding:26px 16px 20px; border-radius:22px; } }
        .cp-ftitle { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(22px,2.6vw,28px); font-weight:800; letter-spacing:-.02em; margin-bottom:4px; }
        .cp-fsub { font-size:14.5px; font-weight:500; color:var(--h-ink-soft); margin-bottom:20px; line-height:1.5; }
        .cp-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        @media (max-width:520px) { .cp-row { grid-template-columns:1fr; } }
        .cp-field { display:flex; flex-direction:column; gap:6px; margin-bottom:12px; min-width:0; }
        .cp-row .cp-field { margin-bottom:12px; }
        .cp-label { font-size:13.5px; font-weight:600; }
        .cp-req { color:var(--h-sun-deep); font-style:normal; }
        .cp-input, .cp-select, .cp-textarea {
          width:100%; min-height:50px; padding:0 14px; border-radius:14px; outline:none; font-size:16px; font-weight:600; color:var(--h-ink); color-scheme:light;
          background:rgba(255,255,255,.78); border:1px solid rgba(255,255,255,.85);
          box-shadow:0 1px 3px rgba(23,59,50,.10), inset 0 1px 0 rgba(255,255,255,.9); transition:border-color .2s, box-shadow .2s, background .2s; }
        .cp-input:hover, .cp-select:hover, .cp-textarea:hover { background:rgba(255,255,255,.94); }
        .cp-input:focus, .cp-select:focus, .cp-textarea:focus { border-color:var(--h-teal); box-shadow:0 0 0 3px rgba(47,125,91,.18); }
        .cp-input::placeholder, .cp-textarea::placeholder { font-weight:500; color:rgba(23,59,50,.42); }
        .cp-select { appearance:none; -webkit-appearance:none; cursor:pointer; padding-right:36px;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%230b6b5a' stroke-width='2.4'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat:no-repeat; background-position:right 14px center; }
        .cp-select option { background:#fff; color:var(--h-ink); }
        .cp-textarea { resize:vertical; min-height:130px; padding:12px 14px; line-height:1.55; font-weight:500; }

        .cp-banner { display:flex; align-items:flex-start; gap:10px; padding:12px 14px; border-radius:14px; font-size:14px; font-weight:600; line-height:1.45; margin:4px 0 12px; }
        .cp-banner svg { width:18px; height:18px; flex-shrink:0; margin-top:1px; }
        .cp-banner.ok { background:rgba(47,125,91,.12); color:var(--h-teal-deep); border:1px solid rgba(47,125,91,.25); }
        .cp-banner.bad { background:#fbebe9; color:#b3372f; border:1px solid rgba(179,55,47,.25); }

        .cp-submit { width:100%; height:50px; margin-top:6px; border:none; border-radius:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px;
          font-size:15px; font-weight:700; color:#fff;
          background:linear-gradient(180deg,#c2410c,#9a3412); box-shadow:0 8px 18px rgba(194,65,12,.38), inset 0 1px 0 rgba(255,255,255,.3); transition:background .2s, transform .2s; }
        .cp-submit:hover:not(:disabled) { background:linear-gradient(180deg,#9a3412,#7c2d12); transform:translateY(-2px); }
        .cp-submit:disabled { opacity:.65; cursor:not-allowed; }
        .cp-submit svg { width:17px; height:17px; }
        .cp-note { display:flex; align-items:center; justify-content:center; gap:6px; margin-top:14px; padding-top:12px; border-top:1px solid rgba(23,59,50,.08); font-size:12.5px; font-weight:600; color:var(--h-ink-soft); text-align:center; }
        .cp-note svg { width:13px; height:13px; color:var(--h-teal); flex-shrink:0; }

        /* ══ CTA ══ */
        .cp-cta { padding:20px 0 64px; }
        .cp-ctacard { position:relative; overflow:hidden; border-radius:24px; padding:34px 32px; color:#fff;
          background:radial-gradient(60% 120% at 100% 0%, rgba(47,125,91,.34), transparent 65%), linear-gradient(135deg, var(--h-teal-deep), var(--h-teal));
          box-shadow:0 34px 70px rgba(23,59,50,.35), 0 6px 16px rgba(16,44,37,.12);
          display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:22px; }
        .cp-ctacard h2 { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(22px,3vw,32px); font-weight:800; letter-spacing:-.02em; margin-bottom:6px; }
        .cp-ctacard p { font-size:15px; font-weight:500; color:rgba(255,255,255,.86); }
        .cp-btns { display:flex; gap:10px; flex-wrap:wrap; }
        .cp-btn { height:46px; padding:0 26px; border-radius:14px; display:inline-flex; align-items:center; justify-content:center; font-size:14.5px; font-weight:700; text-decoration:none; transition:transform .2s, background .2s; }
        .cp-btn:hover { transform:translateY(-2px); }
        .cp-btn.p { background:linear-gradient(180deg,#c2410c,#9a3412); color:#fff; box-shadow:0 8px 18px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.3); }
        .cp-btn.g { color:#fff; background:linear-gradient(135deg, rgba(255,255,255,.28), rgba(255,255,255,.08)); border:1px solid rgba(255,255,255,.5); box-shadow:inset 0 1.5px 0 rgba(255,255,255,.5); }
        .cp-btn.g:hover { background:rgba(255,255,255,.28); }

        @media (max-width:640px) {
          .cp-intro { padding:24px 0 20px; }
          .cp-quick { padding:20px 14px 16px; border-radius:22px; }
          .cp-ctacard { padding:26px 20px; }
          .cp-btns, .cp-btn { width:100%; }
        }
        @supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))) { .glass { background:#fff; } }
        @media (prefers-reduced-transparency:reduce) { .glass { background:#fff; -webkit-backdrop-filter:none; backdrop-filter:none; } }
        @media (prefers-reduced-motion:reduce) { .cp-root *, .cp-root *::before { animation:none !important; transition:none !important; } }
      `}</style>

      {/* SEO: structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="cp-root">
        <div className="cp-wrap">

          {/* Intro */}
          <header className="cp-intro">
            <p className="cp-kicker">Colombo · Available 24 / 7</p>
            <h1 className="cp-h1">Contact us</h1>
            <h2 className="cp-sub">Talk to a real person about your Sri Lanka transport</h2>
            <p className="cp-desc">
              Need an airport transfer, a day tour or a car and driver for your whole trip? Message us on WhatsApp, call, or send the form and we will reply with a fixed fare.
            </p>
          </header>

          <div className="cp-grid">

            {/* LEFT */}
            <div className="cp-left">
              <section className="cp-quick glass" aria-labelledby="cp-qtitle">
                <h2 id="cp-qtitle" className="cp-qtitle">Fastest way to reach us</h2>
                <div className="cp-phones">
                  {[PHONE_1].map(p => (
                    <a key={p.tel} href={p.wa} target="_blank" rel="noopener noreferrer" className="cp-phone">
                      <small>Phone / WhatsApp</small>
                      <b>{p.display}</b>
                    </a>
                  ))}
                </div>
                <div className="cp-qbtns">
                  <a href={PHONE_1.wa} target="_blank" rel="noopener noreferrer" className="cp-qbtn wa">
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0012.05 0z"/></svg>
                    WhatsApp
                  </a>
                  <a href={`tel:${PHONE_1.tel}`} className="cp-qbtn call">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    Call now
                  </a>
                </div>
              </section>

              {cards.map(c => {
                const inner = (
                  <>
                    <span className="cp-ico" aria-hidden="true">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">{c.icon}</svg>
                    </span>
                    <div>
                      <div className="cp-clabel">{c.label}</div>
                      <div className="cp-cvalue">{c.value}</div>
                      <div className="cp-csub">{c.sub}</div>
                    </div>
                  </>
                );
                return c.href
                  ? <a key={c.key} href={c.href} className="cp-card glass"
                      {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{inner}</a>
                  : <div key={c.key} className="cp-card glass">{inner}</div>;
              })}

              <div className="cp-socials">
                <a href="https://facebook.com/CeylonCompassTravels" target="_blank" rel="noopener noreferrer" className="cp-social">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  Facebook
                </a>
                <a href="https://instagram.com/CeylonCompassTravels" target="_blank" rel="noopener noreferrer" className="cp-social">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                  Instagram
                </a>
              </div>

              <div className="cp-map glass">
                <iframe src={MAP_SRC} title={`Map of ${ADDRESS}`} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                <span className="cp-map-label">📍 {ADDRESS}</span>
              </div>
            </div>

            {/* RIGHT: form */}
            <section className="cp-form glass" aria-labelledby="cp-ftitle">
              <h2 id="cp-ftitle" className="cp-ftitle">Send us a message</h2>
              <p className="cp-fsub">Tell us your route, dates and group size and we will reply with a fixed fare within the hour.</p>

              <div className="cp-row">
                <div className="cp-field">
                  <label className="cp-label" htmlFor="cp-first">First name <i className="cp-req">*</i></label>
                  <input id="cp-first" type="text" name="firstName" autoComplete="given-name" placeholder="John" className="cp-input" value={form.firstName} onChange={handleChange} />
                </div>
                <div className="cp-field">
                  <label className="cp-label" htmlFor="cp-last">Last name</label>
                  <input id="cp-last" type="text" name="lastName" autoComplete="family-name" placeholder="Smith" className="cp-input" value={form.lastName} onChange={handleChange} />
                </div>
              </div>

              <div className="cp-row">
                <div className="cp-field">
                  <label className="cp-label" htmlFor="cp-email">Email <i className="cp-req">*</i></label>
                  <input id="cp-email" type="email" name="email" inputMode="email" autoComplete="email" placeholder="you@example.com" className="cp-input" value={form.email} onChange={handleChange} />
                </div>
                <div className="cp-field">
                  <label className="cp-label" htmlFor="cp-phone">Phone / WhatsApp</label>
                  <input id="cp-phone" type="tel" name="phone" inputMode="tel" autoComplete="tel" placeholder="+44 7700 900000" className="cp-input" value={form.phone} onChange={handleChange} />
                </div>
              </div>

              <div className="cp-field">
                <label className="cp-label" htmlFor="cp-subject">Subject</label>
                <select id="cp-subject" name="subject" className="cp-select" value={form.subject} onChange={handleChange} style={{ color: form.subject ? undefined : "rgba(23,59,50,.5)" }}>
                  <option value="">Select a subject</option>
                  <option value="booking">New booking</option>
                  <option value="tour">Day tour or multi-day driver hire</option>
                  <option value="quote">Request a quote</option>
                  <option value="modify">Change an existing booking</option>
                  <option value="cancel">Cancellation</option>
                  <option value="other">General enquiry</option>
                </select>
              </div>

              <div className="cp-field">
                <label className="cp-label" htmlFor="cp-message">Message <i className="cp-req">*</i></label>
                <textarea id="cp-message" name="message" className="cp-textarea" value={form.message} onChange={handleChange}
                  placeholder="Pickup and drop-off, date, number of passengers and bags, and any special requests such as child seats…" />
              </div>

              <div aria-live="polite">
                {status === "success" && (
                  <div className="cp-banner ok" role="status">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Message sent! We will get back to you within the hour.
                  </div>
                )}
                {status === "error" && (
                  <div className="cp-banner bad" role="alert">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {errorMsg}
                  </div>
                )}
              </div>

              <button type="button" className="cp-submit" onClick={handleSubmit} disabled={status === "loading"}>
                {status === "loading" ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" style={{ animation: "cp-spin 1s linear infinite" }} aria-hidden="true"><path strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10"/></svg>
                    Sending…
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                    Send message
                  </>
                )}
              </button>

              <p className="cp-note">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622z"/></svg>
                We typically reply within 60 minutes, 24 / 7
              </p>
            </section>
          </div>

          {/* CTA */}
          <section className="cp-cta">
            <div className="cp-ctacard">
              <div>
                <h2>Ready to book your transfer?</h2>
                <p>Reserve online in two minutes, or message us for a custom route.</p>
              </div>
              <div className="cp-btns">
                <a href="/reservation" className="cp-btn p">Book now</a>
                <a href={PHONE_1.wa} target="_blank" rel="noopener noreferrer" className="cp-btn g">WhatsApp us</a>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}