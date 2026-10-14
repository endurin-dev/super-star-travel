"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";

/* ─────────────────────────────────────────────
   Edit these once — same details as the Contact page
   ───────────────────────────────────────────── */
const BRAND        = "Super Star Travel";
const SITE_LABEL   = "www.superstartravelcabs.com";
const EMAIL        = "support@superstartravelcabs.com";
const PHONE_1      = { display: "+94 72 680 3498", tel: "+94726803498" };
const WHATSAPP_URL = "https://wa.me/94726803498";
const ADDRESS      = "Colombo, Sri Lanka";
const LAST_UPDATED = "October 8, 2026";

const sections = [
  {
    num: "01",
    title: "Information We Collect",
    content: (
      <>
        <p>We collect the following categories of information:</p>
        <ul>
          <li><strong>Personal &amp; Booking Information</strong>: Full name, email address, phone or WhatsApp number, pickup and drop-off locations, flight or train numbers, travel dates and times, number of passengers, and any special requests (child seats, luggage, accessibility needs, etc.).</li>
          <li><strong>Payment Information</strong>: Payment details are handled as agreed in your booking confirmation. If we use an online payment partner, card details are processed by that partner and we do not store full card numbers.</li>
          <li><strong>Technical &amp; Usage Data</strong>: IP address, browser type, device information, pages visited, and cookies when you use our website.</li>
          <li><strong>Communication Data</strong>: Messages sent through our contact form, email, WhatsApp, or phone when you make a booking enquiry.</li>
        </ul>
      </>
    ),
  },
  {
    num: "02",
    title: "How We Use Your Information",
    content: (
      <>
        <p>We use your data to:</p>
        <ul>
          <li>Process and confirm your airport transfers, day tours, multi-day car and driver hire, and other island-wide transfers in Sri Lanka</li>
          <li>Provide meet &amp; greet service, flight tracking, and door-to-door private transport</li>
          <li>Reply to your enquiries and send important updates about your booking by email, WhatsApp, or phone</li>
          <li>Improve our services and website experience</li>
          <li>Send occasional travel tips and offers, only if you have agreed. You can unsubscribe at any time</li>
          <li>Comply with legal and regulatory requirements that apply to our business in Sri Lanka</li>
        </ul>
      </>
    ),
  },
  {
    num: "03",
    title: "Legal Basis for Processing",
    content: (
      <>
        <p>We process your personal data in line with the Personal Data Protection Act, No. 9 of 2022 of Sri Lanka. If you are in the European Union or the United Kingdom, we also respect the rights the GDPR gives you. We process data on the following bases:</p>
        <ul>
          <li>Performance of a contract (your booking and transfer or tour service)</li>
          <li>Legitimate business interests (service improvement, security, and communication about your trip)</li>
          <li>Your consent (for marketing messages and non-essential cookies)</li>
          <li>Legal obligations (accounting, tax, and other requirements under Sri Lankan law)</li>
        </ul>
      </>
    ),
  },
  {
    num: "04",
    title: "Sharing Your Information",
    content: (
      <>
        <p>We never sell your personal data. We only share information when strictly necessary:</p>
        <ul>
          <li>With the driver assigned to your trip, who receives only the minimum data needed to complete your journey (your name, pickup details, and contact number)</li>
          <li>With trusted service providers such as our hosting, email, messaging, analytics, and payment providers</li>
          <li>When required by law or by Sri Lankan authorities</li>
        </ul>
      </>
    ),
  },
  {
    num: "05",
    title: "Cookies and Tracking",
    content: (
      <p>We use essential cookies to enable bookings and website functionality. Analytics cookies help us understand visitor behaviour, for example which pages are most useful. You can manage or disable cookies through your browser settings at any time.</p>
    ),
  },
  {
    num: "06",
    title: "Data Security",
    content: (
      <p>We use reasonable security measures, including encrypted connections, secure servers, and access controls, to protect your information. No method of transmission over the internet is completely secure, so we cannot guarantee absolute security, but we take the protection of your data seriously.</p>
    ),
  },
  {
    num: "07",
    title: "Your Rights",
    content: (
      <>
        <p>You have the right to:</p>
        <ul>
          <li>Access, correct, or delete your personal data</li>
          <li>Withdraw your consent at any time</li>
          <li>Object to or restrict certain processing</li>
          <li>Request a copy of your data in a portable format, where applicable</li>
          <li>Complain to the Data Protection Authority of Sri Lanka, or to your local data protection authority if you live in the EU or UK</li>
        </ul>
        <p style={{ marginTop: "1rem" }}>To exercise any of these rights, simply contact us using the details below.</p>
      </>
    ),
  },
  {
    num: "08",
    title: "Data Retention",
    content: (
      <p>We keep your data only for as long as necessary to fulfil your booking, meet legal obligations such as accounting and tax record-keeping, or resolve any disputes. When data is no longer needed, we delete it or anonymise it.</p>
    ),
  },
  {
    num: "09",
    title: "International Transfers",
    content: (
      <p>Your data is primarily processed in Sri Lanka. Some of our service providers, such as email, messaging, analytics, or hosting providers, may process data in other countries. Where this happens, we take reasonable steps to make sure your data is protected to a standard comparable to this policy.</p>
    ),
  },
  {
    num: "10",
    title: "Children’s Privacy",
    content: (
      <p>Our website is not directed at children under 18. We do not knowingly collect personal data from minors. Bookings for travel with children should be made by a parent or guardian.</p>
    ),
  },
  {
    num: "11",
    title: "Changes to This Policy",
    content: (
      <p>We may update this Privacy Policy from time to time. The “Last updated” date at the top of this page will always reflect the most recent version.</p>
    ),
  },
];

const CONTACT_NUM = String(sections.length + 1).padStart(2, "0");

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    document.querySelectorAll("[data-section]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const closeJump = () => {
    const d = document.getElementById("pp-jump") as HTMLDetailsElement | null;
    if (d) d.open = false;
  };

  return (
    <>
      <Header />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap');

        html { scroll-behavior:smooth; }
        @media (prefers-reduced-motion:reduce) { html { scroll-behavior:auto; } }

        .pp-root {
          --h-ink:       #173b32;
          --h-ink-soft:  rgba(23,59,50,.82);
          --h-ink-faint: rgba(23,59,50,.66);
          --h-teal:      #2f7d5b;
          --h-teal-deep: #173b32;
          --h-sun:       #2f7d5b;
          --h-sun-deep:  #245e46;
          --h-mint:      #bed3bf;
          --h-line:      rgba(23,59,50,.12);
          --h-ease:      cubic-bezier(.25,.1,.25,1);

          min-height:100vh; font-family:'Figtree',system-ui,sans-serif; color:var(--h-ink); overflow-x:clip;
          background:
            radial-gradient(60% 40% at 90% 85%, rgba(47,125,91,.22), transparent 70%),
            radial-gradient(70% 45% at 5% 60%, rgba(47,125,91,.16), transparent 70%),
            #f3f7f2;
        }
        .pp-root *, .pp-root *::before, .pp-root *::after { box-sizing:border-box; }
        .pp-root :focus-visible { outline:3px solid var(--h-teal); outline-offset:2px; border-radius:6px; }

        /* ══ Title band: continues the solid teal header ══ */
        .pp-hero { position:relative; overflow:hidden; color:#fff; padding:120px 5vw 104px; text-align:left;
          background:
            radial-gradient(60% 90% at 95% 100%, rgba(47,125,91,.2), transparent 70%),
            radial-gradient(70% 90% at 0% 0%, rgba(47,125,91,.7), transparent 70%),
            linear-gradient(180deg, #173b32 0%, #102c25 100%); }
        .pp-hero-inner { max-width:1180px; margin:0 auto; animation:ppRise .7s var(--h-ease) both; }
        @keyframes ppRise { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }
        .pp-kicker { display:inline-block; font-size:13.5px; font-weight:600; color:#fff; border-radius:100px; padding:5px 14px; margin-bottom:16px;
          background:linear-gradient(135deg, rgba(255,255,255,.26), rgba(255,255,255,.08));
          -webkit-backdrop-filter:blur(14px) saturate(180%); backdrop-filter:blur(14px) saturate(180%);
          border:1px solid rgba(255,255,255,.4); box-shadow:0 6px 18px rgba(0,0,0,.18), inset 0 1.5px 0 rgba(255,255,255,.5); }
        .pp-title { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(34px,5.2vw,64px); font-weight:800; letter-spacing:-.02em; line-height:1.04; margin-bottom:12px; text-shadow:0 2px 20px rgba(0,0,0,.25); }
        .pp-lede { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(17px,2vw,24px); font-weight:600; line-height:1.3; color:var(--h-mint); max-width:36ch; }

        /* ══ Layout: the content rises over the band, like the booking card on the hero ══ */
        .pp-layout { position:relative; z-index:1; max-width:1180px; margin:-52px auto 0; padding:0 5vw 80px; display:grid; grid-template-columns:240px minmax(0,1fr); gap:32px; align-items:start; }

        /* ── Sidebar contents ── */
        .pp-toc { position:sticky; top:104px; max-height:calc(100vh - 128px); overflow-y:auto; scrollbar-width:none; padding:18px 14px 14px; border-radius:22px;
          background:linear-gradient(135deg, rgba(255,255,255,.88), rgba(255,255,255,.7));
          -webkit-backdrop-filter:blur(20px) saturate(170%); backdrop-filter:blur(20px) saturate(170%);
          border:1px solid rgba(255,255,255,.8); box-shadow:0 24px 50px rgba(16,44,37,.16), 0 4px 12px rgba(16,44,37,.08); }
        .pp-toc::-webkit-scrollbar { display:none; }
        .pp-toc-title { font-family:'Bricolage Grotesque',sans-serif; font-size:16px; font-weight:700; padding:0 8px 10px; margin-bottom:6px; border-bottom:1px solid var(--h-line); }
        .pp-toc-item { display:flex; align-items:flex-start; gap:10px; padding:8px 8px; border-radius:12px; text-decoration:none; color:var(--h-ink-faint); transition:background .2s, color .2s; }
        .pp-toc-item:hover { background:rgba(47,125,91,.08); color:var(--h-ink); }
        .pp-toc-num { flex-shrink:0; width:24px; font-size:12px; font-weight:700; color:rgba(23,59,50,.45); margin-top:1px; font-variant-numeric:tabular-nums; }
        .pp-toc-text { font-size:13.5px; font-weight:500; line-height:1.35; }
        .pp-toc-item.active { background:rgba(47,125,91,.1); color:var(--h-teal-deep); box-shadow:inset 3px 0 0 var(--h-sun); }
        .pp-toc-item.active .pp-toc-num { color:var(--h-teal); }
        .pp-toc-item.active .pp-toc-text { font-weight:700; }

        /* mobile jump menu (replaces the hidden sidebar) */
        .pp-jump { display:none; }

        /* ══ The policy panel ══ */
        .pp-panel { position:relative; overflow:hidden; border-radius:26px; padding:44px 52px 28px;
          background:linear-gradient(135deg, rgba(255,255,255,.96), rgba(255,255,255,.86));
          border:1px solid rgba(255,255,255,.85); box-shadow:0 30px 64px rgba(16,44,37,.18), 0 6px 16px rgba(16,44,37,.08); }
        .pp-panel::before { content:""; position:absolute; left:0; right:0; top:0; height:4px; background:linear-gradient(90deg, var(--h-teal-deep), var(--h-teal) 55%, var(--h-sun)); }

        .pp-intro { font-size:clamp(17px,1.5vw,19px); font-weight:500; line-height:1.65; color:var(--h-ink-soft); max-width:68ch; padding-bottom:32px; margin-bottom:8px; border-bottom:1px solid var(--h-line); }
        .pp-intro strong { color:var(--h-teal-deep); font-weight:700; }

        .pp-section { scroll-margin-top:104px; padding:34px 0; border-bottom:1px solid var(--h-line); }
        .pp-section:last-of-type { border-bottom:none; }
        .pp-section-head { display:flex; align-items:center; gap:14px; margin-bottom:16px; }
        .pp-section-num { flex-shrink:0; min-width:38px; height:30px; padding:0 10px; border-radius:100px; display:inline-flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:#fff; font-variant-numeric:tabular-nums;
          background:linear-gradient(180deg, #2f7d5b, var(--h-teal-deep)); box-shadow:0 4px 10px rgba(23,59,50,.3), inset 0 1px 0 rgba(255,255,255,.25); }
        .pp-section-title { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(20px,2vw,26px); font-weight:700; letter-spacing:-.01em; line-height:1.2; }

        .pp-body { font-size:16.5px; line-height:1.7; color:var(--h-ink-soft); max-width:70ch; }
        .pp-body p { margin:0 0 12px; }
        .pp-body p:last-child { margin-bottom:0; }
        .pp-body strong { color:var(--h-ink); font-weight:700; }
        .pp-body ul { list-style:none; padding:0; margin:14px 0 0; display:flex; flex-direction:column; gap:11px; }
        .pp-body ul li { display:flex; gap:14px; align-items:flex-start; }
        .pp-body ul li::before { content:''; flex-shrink:0; width:7px; height:7px; margin-top:.62em; border-radius:50%; background:var(--h-teal); box-shadow:0 0 0 3px rgba(47,125,91,.15); }
        .pp-body a { color:var(--h-teal-deep); font-weight:600; text-decoration:underline; text-underline-offset:3px; text-decoration-color:rgba(47,125,91,.4); }

        /* ══ Contact card: same treatment as the footer call to action ══ */
        .pp-contact { position:relative; overflow:hidden; border-radius:22px; padding:30px 32px 26px; color:#fff; max-width:none;
          background:
            radial-gradient(60% 80% at 100% 100%, rgba(47,125,91,.2), transparent 70%),
            linear-gradient(135deg, #2f7d5b, #173b32 60%, #102c25);
          box-shadow:0 22px 44px rgba(23,59,50,.35), inset 0 1px 0 rgba(255,255,255,.18); }
        .pp-contact::before { content:""; position:absolute; left:0; right:0; top:0; height:4px; background:linear-gradient(90deg, rgba(255,255,255,.2), var(--h-sun)); }
        .pp-contact-title { font-family:'Bricolage Grotesque',sans-serif; font-size:20px; font-weight:800; letter-spacing:-.01em; margin-bottom:18px; }
        .pp-contact-list { list-style:none; display:flex; flex-direction:column; gap:14px; margin:0; padding:0; }
        .pp-contact-list li { display:flex; align-items:flex-start; gap:14px; font-size:16px; font-weight:500; line-height:1.4; color:rgba(255,255,255,.88); }
        .pp-contact-list li::before { display:none; }
        .pp-contact-icon { flex-shrink:0; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:var(--h-sun);
          background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.22); box-shadow:inset 0 1px 0 rgba(255,255,255,.3); }
        .pp-contact-text { display:flex; flex-direction:column; gap:3px; padding-top:5px; min-width:0; }
        .pp-contact .pp-contact-list a { color:#fff; font-weight:600; text-decoration:none; word-break:break-word; background:linear-gradient(var(--h-sun), var(--h-sun)) left bottom / 0 2px no-repeat; padding-bottom:1px; transition:background-size .25s var(--h-ease); }
        .pp-contact .pp-contact-list a:hover { background-size:100% 2px; }
        .pp-contact-actions { display:flex; gap:10px; flex-wrap:wrap; margin-top:22px; }
        .pp-btn { height:46px; padding:0 22px; border-radius:14px; font-family:'Figtree',sans-serif; font-size:14.5px; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; white-space:nowrap; transition:transform .2s, background .2s; }
        .pp-contact .pp-btn { background-image:none; padding-bottom:0; }
        .pp-btn-sun { color:#fff; background:linear-gradient(180deg, #c2410c, #9a3412); box-shadow:0 8px 18px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.3); }
        .pp-btn-sun:hover { background:linear-gradient(180deg, #9a3412, #7c2d12); transform:translateY(-2px); }
        .pp-btn-glass { color:#fff; background:linear-gradient(135deg, rgba(255,255,255,.22), rgba(255,255,255,.07)); border:1px solid rgba(255,255,255,.35); box-shadow:inset 0 1px 0 rgba(255,255,255,.4); }
        .pp-btn-glass:hover { background:rgba(255,255,255,.2); transform:translateY(-2px); }
        .pp-badges { display:flex; flex-wrap:wrap; gap:8px; margin-top:22px; padding-top:20px; border-top:1px solid rgba(255,255,255,.16); }
        .pp-badge { font-size:12.5px; font-weight:600; color:rgba(255,255,255,.9); padding:5px 12px; border-radius:100px; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.22); }

        .pp-end { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px 24px; margin-top:34px; padding-top:22px; border-top:1px solid var(--h-line); }
        .pp-end-note { font-size:13.5px; font-weight:500; color:var(--h-ink-faint); line-height:1.6; }
        .pp-back { display:inline-flex; align-items:center; gap:8px; height:44px; padding:0 20px; border-radius:100px; font-size:14.5px; font-weight:700; color:#fff; text-decoration:none;
          background:linear-gradient(180deg, #c2410c, #9a3412); box-shadow:0 8px 18px rgba(194,65,12,.38), inset 0 1px 0 rgba(255,255,255,.3); transition:transform .2s, background .2s; }
        .pp-back:hover { background:linear-gradient(180deg, #9a3412, #7c2d12); transform:translateY(-2px); }

        /* ══ Tablet and mobile ══ */
        @media (max-width:900px) {
          .pp-hero { padding:104px 5vw 96px; }
          .pp-layout { grid-template-columns:1fr; gap:14px; margin-top:-48px; padding:0 3.5vw 64px; }
          .pp-toc { display:none; }
          .pp-jump { display:block; border-radius:18px; overflow:hidden;
            background:linear-gradient(135deg, rgba(255,255,255,.92), rgba(255,255,255,.78)); -webkit-backdrop-filter:blur(18px); backdrop-filter:blur(18px);
            border:1px solid rgba(255,255,255,.85); box-shadow:0 18px 40px rgba(16,44,37,.18); }
          .pp-jump summary { list-style:none; cursor:pointer; min-height:52px; padding:0 18px; display:flex; align-items:center; justify-content:space-between; gap:12px; font-family:'Bricolage Grotesque',sans-serif; font-size:16px; font-weight:700; }
          .pp-jump summary::-webkit-details-marker { display:none; }
          .pp-jump summary svg { transition:transform .25s var(--h-ease); flex-shrink:0; }
          .pp-jump[open] summary svg { transform:rotate(180deg); }
          .pp-jump-list { padding:4px 10px 12px; display:flex; flex-direction:column; gap:2px; border-top:1px solid var(--h-line); max-height:60vh; overflow-y:auto; }
          .pp-jump-list .pp-toc-item { min-height:46px; align-items:center; }
          .pp-panel { border-radius:22px; padding:30px 22px 22px; }
          .pp-section { padding:28px 0; }
          .pp-contact { padding:26px 20px 22px; }
          .pp-contact-actions { flex-direction:column; }
          .pp-btn { width:100%; height:50px; }
        }
        @media (max-width:480px) {
          .pp-hero { padding:96px 5vw 88px; }
          .pp-body { font-size:16px; }
          .pp-end { flex-direction:column; align-items:flex-start; }
          .pp-back { width:100%; justify-content:center; height:50px; }
        }
        @media (prefers-reduced-motion:reduce) {
          .pp-hero-inner { animation:none; }
          .pp-toc-item,.pp-btn,.pp-back,.pp-jump summary svg { transition:none; }
        }
      `}</style>

      <div className="pp-root">
        {/* Title band */}
        <div className="pp-hero">
          <div className="pp-hero-inner">
            <p className="pp-kicker">Last updated: {LAST_UPDATED}</p>
            <h1 className="pp-title">Privacy Policy</h1>
            <p className="pp-lede">How we collect, use and protect your personal information.</p>
          </div>
        </div>

        <div className="pp-layout">
          {/* Desktop sidebar */}
          <nav className="pp-toc" aria-label="Table of contents">
            <div className="pp-toc-title">In this policy</div>
            {sections.map((s) => (
              <a
                key={s.num}
                href={`#section-${s.num}`}
                className={`pp-toc-item${activeSection === `section-${s.num}` ? " active" : ""}`}
              >
                <span className="pp-toc-num">{s.num}</span>
                <span className="pp-toc-text">{s.title}</span>
              </a>
            ))}
            <a href="#section-contact" className={`pp-toc-item${activeSection === "section-contact" ? " active" : ""}`}>
              <span className="pp-toc-num">{CONTACT_NUM}</span>
              <span className="pp-toc-text">Contact Us</span>
            </a>
          </nav>

          <main>
            {/* Mobile jump menu */}
            <details className="pp-jump" id="pp-jump" style={{ marginBottom: 14 }}>
              <summary>
                Jump to a section
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
              </summary>
              <div className="pp-jump-list">
                {sections.map((s) => (
                  <a key={s.num} href={`#section-${s.num}`} className="pp-toc-item" onClick={closeJump}>
                    <span className="pp-toc-num">{s.num}</span>
                    <span className="pp-toc-text">{s.title}</span>
                  </a>
                ))}
                <a href="#section-contact" className="pp-toc-item" onClick={closeJump}>
                  <span className="pp-toc-num">{CONTACT_NUM}</span>
                  <span className="pp-toc-text">Contact Us</span>
                </a>
              </div>
            </details>

            <div className="pp-panel">
              <p className="pp-intro">
                At <strong>{BRAND}</strong> (private transfers, day tours, and car and driver hire in Sri Lanka), we are committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you visit{" "}
                <strong>{SITE_LABEL}</strong>, make a booking, or use our airport transfer, day tour, or driver hire services.
              </p>

              {sections.map((s) => (
                <section key={s.num} id={`section-${s.num}`} data-section className="pp-section">
                  <div className="pp-section-head">
                    <span className="pp-section-num">{s.num}</span>
                    <h2 className="pp-section-title">{s.title}</h2>
                  </div>
                  <div className="pp-body">{s.content}</div>
                </section>
              ))}

              {/* Contact */}
              <section id="section-contact" data-section className="pp-section">
                <div className="pp-section-head">
                  <span className="pp-section-num">{CONTACT_NUM}</span>
                  <h2 className="pp-section-title">Contact Us</h2>
                </div>
                <div className="pp-body">
                  <div className="pp-contact">
                    <div className="pp-contact-title">{BRAND}: private transfers and tours</div>
                    <ul className="pp-contact-list">
                      <li>
                        <span className="pp-contact-icon" aria-hidden="true">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z" /></svg>
                        </span>
                        <span className="pp-contact-text">{ADDRESS}</span>
                      </li>
                      <li>
                        <span className="pp-contact-icon" aria-hidden="true">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z" /></svg>
                        </span>
                        <span className="pp-contact-text">
                          <a href={`tel:${PHONE_1.tel}`}>{PHONE_1.display}</a>
                        </span>
                      </li>
                      <li>
                        <span className="pp-contact-icon" aria-hidden="true">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4.2l-8 5-8-5V6l8 5 8-5v2.2z" /></svg>
                        </span>
                        <span className="pp-contact-text"><a href={`mailto:${EMAIL}`}>{EMAIL}</a></span>
                      </li>
                    </ul>

                    <div className="pp-contact-actions">
                      <a href={WHATSAPP_URL} className="pp-btn pp-btn-sun" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
                      <a href={`mailto:${EMAIL}`} className="pp-btn pp-btn-glass">Send an email</a>
                    </div>

                    <div className="pp-badges">
                      <span className="pp-badge">24/7 support</span>
                      <span className="pp-badge">Island-wide pickups</span>
                      <span className="pp-badge">Fixed fares</span>
                      <span className="pp-badge">English &amp; Russian</span>
                    </div>
                  </div>
                </div>
              </section>

              <div className="pp-end">
                <p className="pp-end-note">
                  This Privacy Policy is governed by the laws of Sri Lanka.<br />
                  © 2026 {BRAND}. All rights reserved.
                </p>
                <Link href="/" className="pp-back">← Back to home</Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}