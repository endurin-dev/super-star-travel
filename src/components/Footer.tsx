import Link from "next/link";
import Image from "next/image";

/* ─────────────────────────────────────────────
   Edit these — everything else is data-driven
   ───────────────────────────────────────────── */
const BRAND    = "Super Star Travel";
const TAGLINE  = "Private drivers in Sri Lanka";
const BRAND_LOGO = "/images/logo.webp";
const DESC     =
  "Private transfers and chauffeur-driven tours across Sri Lanka. Airport pickups from Colombo (CMB), day trips to Kandy, Sigiriya, Ella and Galle. Fixed fares, licensed drivers, 24/7.";
const ADDRESS  = "Colombo, Sri Lanka";
const EMAIL    = "support@superstartravelcabs.com";
const PHONES   = [{ display: "+94 72 680 3498", tel: "+94726803498" }];
const WHATSAPP = "https://wa.me/94726803498";

// Set to null to hide the rating chips. Only show ratings you can verify.
const RATINGS: { source: string; score: string; color: string }[] | null = [
  { source: "Google",      score: "4.9", color: "#2f7d5b" },
  { source: "TripAdvisor", score: "5.0", color: "#00AA6C" },
];

const PAYMENTS = ["Cash", "Visa", "Mastercard"];     // set to [] to hide
// Optional licence badge, e.g. { image: "/images/license.webp", label: "SLTDA registered", value: "Reg. No. 12345" }
const LICENSE: { image: string; label: string; value: string } | null = null;

const EXPLORE = [
  { label: "Our fleet",      href: "/fleet" },
  { label: "Popular routes", href: "/routes" },
  { label: "About us",       href: "/about" },
  { label: "Reviews",        href: "/reviews" },
  { label: "FAQ",            href: "/faq" },
  { label: "Contact",        href: "/contact" },
];

const LEGAL = [
  { label: "Terms & conditions", href: "/terms" },
  { label: "Privacy policy",     href: "/privacy-policy" },
];

const SOCIALS = [
  {
    label: "Facebook",
    href: "https://facebook.com/CeylonCompassTravels",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com/CeylonCompassTravels",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: WHATSAPP,
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    label: "TripAdvisor",
    href: "https://tripadvisor.com",
    icon: (
      <svg width="17" height="17" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="14" cy="20" r="5" fill="currentColor" opacity="0.9" />
        <circle cx="26" cy="20" r="5" fill="currentColor" opacity="0.9" />
        <circle cx="14" cy="20" r="2.2" fill="#173b32" />
        <circle cx="26" cy="20" r="2.2" fill="#173b32" />
        <path d="M8 16 Q14 9 20 13 Q26 9 32 16" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
];

function StarIcon({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap');

        .ft-root {
          --h-ink:       #173b32;
          --h-teal:      #2f7d5b;
          --h-teal-deep: #173b32;
          --h-sun:       #2f7d5b;
          --h-sun-deep:  #245e46;
          --h-mint:      #bed3bf;
          --h-ease:      cubic-bezier(.25,.1,.25,1);
          --ft-overlap:  56px;

          position:relative; margin-top:calc(var(--ft-overlap) + 24px);
          font-family:'Figtree',system-ui,sans-serif; color:#fff;
          background:
            radial-gradient(60% 70% at 92% 100%, rgba(47,125,91,.14), transparent 70%),
            radial-gradient(70% 80% at 0% 40%, rgba(47,125,91,.55), transparent 70%),
            linear-gradient(180deg, #173b32 0%, #102c25 55%, #102c25 100%);
        }
        .ft-root *, .ft-root *::before, .ft-root *::after { box-sizing:border-box; margin:0; padding:0; }
        .ft-root :focus-visible { outline:3px solid var(--h-sun); outline-offset:3px; border-radius:6px; }

        /* ══ CTA card: echoes the hero booking card and overlaps the footer's top edge ══ */
        .ft-cta-wrap { position:relative; top:calc(var(--ft-overlap) * -1); margin-bottom:calc(var(--ft-overlap) * -1); max-width:1040px; margin-left:auto; margin-right:auto; padding:0 4vw; }
        .ft-cta {
          position:relative; overflow:hidden; border-radius:24px;
          display:flex; align-items:center; justify-content:space-between; gap:20px 32px; flex-wrap:wrap;
          padding:28px 32px 26px; color:var(--h-ink);
          background:linear-gradient(135deg, rgba(255,255,255,.96), rgba(255,255,255,.86));
          border:1px solid rgba(255,255,255,.8);
          box-shadow:0 30px 60px rgba(4,24,20,.32), 0 6px 16px rgba(4,24,20,.14);
        }
        .ft-cta::before { content:""; position:absolute; left:0; right:0; top:0; height:4px; background:linear-gradient(90deg, var(--h-teal-deep), var(--h-teal) 55%, var(--h-sun)); }
        .ft-cta-title { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(20px,2.3vw,28px); font-weight:800; letter-spacing:-.015em; line-height:1.15; margin-bottom:6px; }
        .ft-cta-sub { font-size:14.5px; font-weight:500; color:rgba(23,59,50,.74); line-height:1.45; max-width:44ch; }
        .ft-cta-actions { display:flex; gap:10px; flex-wrap:wrap; }
        .ft-btn { height:46px; padding:0 22px; border-radius:14px; font-family:'Figtree',sans-serif; font-size:14.5px; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; gap:8px; border:none; cursor:pointer; transition:transform .2s, background .2s, box-shadow .2s; white-space:nowrap; }
        .ft-btn-sun { color:#fff; background:linear-gradient(180deg, #c2410c, #9a3412); box-shadow:0 8px 18px rgba(194,65,12,.38), inset 0 1px 0 rgba(255,255,255,.3); }
        .ft-btn-sun:hover { background:linear-gradient(180deg, #9a3412, #7c2d12); transform:translateY(-2px); }
        .ft-btn-teal { color:#fff; background:linear-gradient(180deg, #c2410c, #9a3412); box-shadow:0 8px 18px rgba(194,65,12,.38), inset 0 1px 0 rgba(255,255,255,.3); }
        .ft-btn-teal:hover { background:linear-gradient(180deg, #9a3412, #7c2d12); transform:translateY(-2px); }

        /* ══ Main grid ══ */
        .ft-inner { max-width:1200px; margin:0 auto; padding:8px 5vw 0; }
        .ft-body { display:grid; grid-template-columns:1.5fr 1fr 1.2fr; gap:48px 56px; padding:28px 0 36px; border-bottom:1px solid rgba(255,255,255,.14); }

        .ft-logo-row { display:flex; align-items:center; gap:14px; margin-bottom:16px; }
        .ft-logo-circle { width:54px; height:54px; border-radius:50%; overflow:hidden; flex-shrink:0; position:relative;
          background:linear-gradient(145deg, rgba(255,255,255,.95), rgba(255,255,255,.8));
          border:1px solid rgba(255,255,255,.8); box-shadow:0 8px 20px rgba(0,0,0,.25), inset 0 1.5px 0 rgba(255,255,255,.9); }
        .ft-brand-name { font-family:'Bricolage Grotesque',sans-serif; font-size:21px; font-weight:800; letter-spacing:-.01em; line-height:1.1; }
        .ft-brand-tagline { font-size:13.5px; font-weight:600; color:var(--h-mint); margin-top:3px; }
        .ft-brand-desc { font-size:14.5px; font-weight:500; line-height:1.6; color:rgba(255,255,255,.78); max-width:44ch; margin-bottom:20px; }

        .ft-ratings { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px; }
        .ft-chip { display:flex; align-items:center; gap:8px; padding:6px 12px; border-radius:100px; font-size:12.5px; font-weight:600; color:rgba(255,255,255,.88);
          background:linear-gradient(135deg, rgba(255,255,255,.16), rgba(255,255,255,.06));
          -webkit-backdrop-filter:blur(12px) saturate(160%); backdrop-filter:blur(12px) saturate(160%);
          border:1px solid rgba(255,255,255,.22); box-shadow:inset 0 1px 0 rgba(255,255,255,.35); }
        .ft-chip-score { font-family:'Bricolage Grotesque',sans-serif; font-size:16px; font-weight:800; color:#fff; line-height:1; }
        .ft-stars { display:flex; gap:1px; }

        .ft-socials { display:flex; gap:10px; }
        .ft-social { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; text-decoration:none; position:relative; overflow:hidden;
          background:linear-gradient(145deg, rgba(255,255,255,.26), rgba(255,255,255,.08));
          border:1px solid rgba(255,255,255,.35);
          box-shadow:0 6px 16px rgba(0,0,0,.22), inset 0 1.5px 0 rgba(255,255,255,.55);
          transition:background .2s, color .2s, transform .2s; }
        .ft-social:hover { background:var(--h-sun); color:var(--h-ink); border-color:var(--h-sun); transform:translateY(-2px); }

        .ft-col-title { font-family:'Bricolage Grotesque',sans-serif; font-size:17px; font-weight:700; margin-bottom:16px; }
        .ft-list { list-style:none; display:flex; flex-direction:column; gap:11px; }
        .ft-link { font-size:14.5px; font-weight:500; color:rgba(255,255,255,.8); text-decoration:none; background:linear-gradient(var(--h-sun), var(--h-sun)) left bottom / 0 2px no-repeat; padding-bottom:2px; transition:color .2s, background-size .25s var(--h-ease); }
        .ft-link:hover { color:#fff; background-size:100% 2px; }

        .ft-contact-list { list-style:none; display:flex; flex-direction:column; gap:14px; }
        .ft-contact-item { display:flex; align-items:flex-start; gap:12px; font-size:14.5px; font-weight:500; line-height:1.4; color:rgba(255,255,255,.8); }
        .ft-contact-icon { flex-shrink:0; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:var(--h-sun);
          background:rgba(255,255,255,.09); border:1px solid rgba(255,255,255,.18); }
        .ft-contact-text { display:flex; flex-direction:column; gap:3px; padding-top:4px; min-width:0; }
        .ft-contact-item a { color:rgba(255,255,255,.88); text-decoration:none; word-break:break-word; transition:color .2s; }
        .ft-contact-item a:hover { color:var(--h-sun); }

        /* ══ Bottom bar ══ */
        .ft-bottom { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px 28px; padding:20px 0 26px; }
        .ft-copy { font-size:13px; font-weight:500; color:rgba(255,255,255,.62); }
        .ft-legal { list-style:none; display:flex; gap:20px; flex-wrap:wrap; }
        .ft-legal .ft-link { font-size:13px; color:rgba(255,255,255,.68); }
        .ft-pay { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .ft-pay-label { font-size:13px; font-weight:500; color:rgba(255,255,255,.62); }
        .ft-pay-chip { padding:4px 11px; border-radius:100px; font-size:12px; font-weight:600; color:rgba(255,255,255,.85); background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.2); }

        .ft-reg-badge { display:flex; align-items:center; gap:12px; padding:8px 16px 8px 8px; border-radius:16px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.2); }
        .ft-reg-img-wrap { width:48px; height:48px; border-radius:10px; overflow:hidden; flex-shrink:0; position:relative; border:1px solid rgba(255,255,255,.3); }
        .ft-reg-text { display:flex; flex-direction:column; gap:3px; }
        .ft-reg-label { font-size:13px; font-weight:700; color:#fff; line-height:1.1; }
        .ft-reg-value { font-size:12.5px; font-weight:500; color:rgba(255,255,255,.68); line-height:1.1; }

        /* ══ Tablet ══ */
        @media (max-width:960px) {
          .ft-body { grid-template-columns:1fr 1fr; gap:40px 40px; }
          .ft-brand { grid-column:span 2; }
        }

        /* ══ Mobile ══ */
        @media (max-width:640px) {
          .ft-root { --ft-overlap:44px; }
          .ft-cta-wrap { padding:0 3vw; }
          .ft-cta { padding:24px 20px 22px; border-radius:22px; }
          .ft-cta-actions { width:100%; flex-direction:column; }
          .ft-btn { width:100%; height:50px; }
          .ft-body { grid-template-columns:1fr; gap:36px; }
          .ft-brand { grid-column:auto; }
          .ft-bottom { flex-direction:column; align-items:flex-start; }
        }

        /* graceful fallbacks */
        @supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))) {
          .ft-chip { background:rgba(255,255,255,.14); }
        }
        @media (prefers-reduced-motion:reduce) {
          .ft-btn,.ft-social,.ft-link,.ft-contact-item a { transition:none; }
        }
      `}</style>

      <footer className="ft-root">
        {/* ── Call to action ── */}
        <div className="ft-cta-wrap">
          <div className="ft-cta">
            <div>
              <h2 className="ft-cta-title">Planning a trip around Sri Lanka?</h2>
              <p className="ft-cta-sub">Get a fixed fare in a few seconds, or message us and we will arrange your driver.</p>
            </div>
            <div className="ft-cta-actions">
              <Link href="/reservation" className="ft-btn ft-btn-sun">Get an instant fare</Link>
              <a href={WHATSAPP} className="ft-btn ft-btn-teal" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
            </div>
          </div>
        </div>

        <div className="ft-inner">
          <div className="ft-body">
            {/* ── Brand ── */}
            <div className="ft-brand">
              <div className="ft-logo-row">
                <div className="ft-logo-circle">
                  <Image
                    src={BRAND_LOGO}
                    alt={`${BRAND} logo`}
                    fill
                    sizes="54px"
                    style={{ objectFit: "contain", padding: "6px" }}
                  />
                </div>
                <div>
                  <div className="ft-brand-name">{BRAND}</div>
                  <div className="ft-brand-tagline">{TAGLINE}</div>
                </div>
              </div>

              <p className="ft-brand-desc">{DESC}</p>

              {RATINGS && RATINGS.length > 0 && (
                <div className="ft-ratings">
                  {RATINGS.map((r) => (
                    <div className="ft-chip" key={r.source}>
                      <span className="ft-chip-score">{r.score}</span>
                      <div className="ft-stars" role="img" aria-label={`${r.score} out of 5 on ${r.source}`}>
                        {[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} color={r.color} />)}
                      </div>
                      <span>{r.source}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="ft-socials">
                {SOCIALS.map((s) => (
                  <a key={s.label} href={s.href} className="ft-social" aria-label={s.label} target="_blank" rel="noopener noreferrer">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* ── Explore ── */}
            <nav aria-label="Explore">
              <h3 className="ft-col-title">Explore</h3>
              <ul className="ft-list">
                {EXPLORE.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="ft-link">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* ── Contact ── */}
            <div>
              <h3 className="ft-col-title">Get in touch</h3>
              <ul className="ft-contact-list">
                <li className="ft-contact-item">
                  <span className="ft-contact-icon" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z"/></svg>
                  </span>
                  <span className="ft-contact-text">
                    {PHONES.map((p) => (
                      <a key={p.tel} href={`tel:${p.tel}`}>{p.display}</a>
                    ))}
                  </span>
                </li>
                <li className="ft-contact-item">
                  <span className="ft-contact-icon" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4.2l-8 5-8-5V6l8 5 8-5v2.2z"/></svg>
                  </span>
                  <span className="ft-contact-text">
                    <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                  </span>
                </li>
                <li className="ft-contact-item">
                  <span className="ft-contact-icon" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z"/></svg>
                  </span>
                  <span className="ft-contact-text">{ADDRESS}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* ── Bottom bar ── */}
          <div className="ft-bottom">
            <p className="ft-copy">© {currentYear} {BRAND}. All rights reserved.</p>

            <ul className="ft-legal" aria-label="Legal">
              {LEGAL.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="ft-link">{link.label}</Link>
                </li>
              ))}
            </ul>

            {PAYMENTS.length > 0 && (
              <div className="ft-pay">
                <span className="ft-pay-label">We accept</span>
                {PAYMENTS.map((p) => <span key={p} className="ft-pay-chip">{p}</span>)}
              </div>
            )}

            {LICENSE && (
              <div className="ft-reg-badge">
                <div className="ft-reg-img-wrap">
                  <Image src={LICENSE.image} alt={LICENSE.label} fill sizes="48px" style={{ objectFit: "cover" }} />
                </div>
                <div className="ft-reg-text">
                  <span className="ft-reg-label">{LICENSE.label}</span>
                  <span className="ft-reg-value">{LICENSE.value}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}