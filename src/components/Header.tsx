"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

/* ─────────────────────────────────────────────
   Edit these once — used in the header and the
   mobile menu.
   ───────────────────────────────────────────── */
const BRAND        = "Super Star Travel";
const SLOGAN       = "Travel Sri Lanka";
const BRAND_LOGO   = "/images/logo.webp";
const PHONE        = { display: "+94 72 680 3498", tel: "+94726803498" };
const WHATSAPP_URL = "https://wa.me/94726803498";
const TELEGRAM_URL = "https://t.me/your_username";           // TODO: your Telegram username
const SIGNAL_URL   = "https://signal.me/#p/+94726803498";

const navLinks = [
  { href: "/",            label: "Home" },
  { href: "/fleet",       label: "Fleet" },
  { href: "/rates",       label: "Rates" },
  { href: "/reservation", label: "Reservation" },
  { href: "/faq",         label: "FAQ" },
  { href: "/contact-us",  label: "Contact" },
];

const chatLinks = [
  {
    key: "whatsapp",
    short: "WhatsApp",
    label: "Chat on WhatsApp",
    href: WHATSAPP_URL,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    key: "telegram",
    short: "Telegram",
    label: "Chat on Telegram",
    href: TELEGRAM_URL,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    key: "signal",
    short: "Signal",
    label: "Message on Signal",
    href: SIGNAL_URL,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10.6" stroke="currentColor" strokeWidth="1.4" strokeDasharray="1.6 2.4" strokeLinecap="round" />
        <path
          fill="currentColor"
          d="M12 4.6c-4.09 0-7.4 3.03-7.4 6.77 0 1.55.57 2.98 1.53 4.12l-.9 3.16 3.3-1.02c.81.3 1.7.46 2.62.46h.1c4.09 0 7.4-3.03 7.4-6.77S16.09 4.6 12 4.6z"
        />
      </svg>
    ),
  },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [pathname]);

  /* Lock page scroll and allow Esc to close while the menu is open */
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const headerClass = `hd${scrolled ? " is-scrolled" : isHome ? " is-home" : ""}`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap');

        .hd, .hd-drawer {
          --h-ink:       #173b32;
          --h-teal:      #2f7d5b;
          --h-teal-deep: #173b32;
          --h-sun:       #2f7d5b;
          --h-sun-deep:  #245e46;
          --h-mint:      #bed3bf;
          --h-ease:      cubic-bezier(.25,.1,.25,1);
          font-family:'Figtree',system-ui,sans-serif;
        }
        .hd *, .hd *::before, .hd *::after,
        .hd-drawer *, .hd-drawer *::before, .hd-drawer *::after { box-sizing:border-box; }
        .hd :focus-visible, .hd-drawer :focus-visible { outline:3px solid var(--h-sun); outline-offset:2px; border-radius:8px; }

        /* ══ Bar: solid on inner pages, clear gradient over the home hero, frosted once scrolled ══ */
        .hd { position:fixed; top:0; left:0; right:0; z-index:9999; color:#fff; background:var(--h-teal-deep); transition:background .4s var(--h-ease), box-shadow .4s var(--h-ease); }
        .hd.is-home { background:linear-gradient(180deg, rgba(6,32,27,.86) 0%, rgba(6,32,27,.5) 55%, rgba(6,32,27,0) 100%); }
        .hd.is-scrolled { background:rgba(23,59,50,.9); -webkit-backdrop-filter:blur(20px) saturate(160%); backdrop-filter:blur(20px) saturate(160%); box-shadow:0 10px 34px rgba(4,24,20,.4); }
        .hd.is-scrolled::after { content:""; position:absolute; left:0; right:0; bottom:0; height:2px; background:linear-gradient(90deg, var(--h-teal-deep), var(--h-teal) 55%, var(--h-sun)); }

        /* 88px unscrolled = --header-h in the hero and the <main> padding-top in layout.tsx */
        .hd-inner { max-width:1520px; margin:0 auto; padding:0 4vw; height:88px; display:flex; align-items:center; justify-content:space-between; gap:16px; transition:height .4s var(--h-ease); }
        .hd.is-scrolled .hd-inner { height:72px; }

        /* ── Brand ── */
        .hd-brand { display:flex; align-items:center; gap:12px; text-decoration:none; color:#fff; min-width:0; }
        /* square logo tile */
        .hd-logo { position:relative; width:56px; height:56px; border-radius:12px; overflow:hidden; flex-shrink:0; background:#fff;
          border:1px solid rgba(255,255,255,.7); box-shadow:0 8px 20px rgba(0,0,0,.28), inset 0 1.5px 0 rgba(255,255,255,.9); transition:width .4s var(--h-ease), height .4s var(--h-ease), transform .25s var(--h-ease); }
        .hd.is-scrolled .hd-logo { width:46px; height:46px; border-radius:10px; }
        .hd-brand:hover .hd-logo { transform:scale(1.04); }
        .hd-brand-text { display:flex; flex-direction:column; min-width:0; }
        .hd-brand-name { font-family:'Bricolage Grotesque',sans-serif; font-size:22px; font-weight:800; letter-spacing:-.015em; line-height:1.08; text-shadow:0 1px 12px rgba(0,0,0,.3); transition:font-size .4s var(--h-ease); }
        .hd.is-scrolled .hd-brand-name { font-size:19px; }
        .hd-brand-slogan { font-size:13px; font-weight:600; color:var(--h-mint); margin-top:2px; text-shadow:0 1px 10px rgba(0,0,0,.3); }

        /* ── Desktop nav ── */
        .hd-nav { display:flex; align-items:center; gap:4px; }
        .hd-link { position:relative; padding:9px 14px; font-size:15px; font-weight:600; color:rgba(255,255,255,.86); text-decoration:none; border-radius:100px; white-space:nowrap; transition:background .22s, color .22s; }
        .hd-link:hover { background:rgba(255,255,255,.14); color:#fff; }
        .hd-link.is-active { color:#fff; background:rgba(255,255,255,.12); box-shadow:inset 0 0 0 1px rgba(255,255,255,.2); }
        .hd-link.is-active::after { content:""; position:absolute; left:50%; bottom:3px; width:16px; height:3px; margin-left:-8px; border-radius:3px; background:var(--h-sun); }

        .hd-right { display:flex; align-items:center; gap:10px; flex-shrink:0; }
        .hd-chat { display:flex; align-items:center; gap:8px; }

        /* glass circle buttons */
        .hd-circle { width:38px; height:38px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; color:#fff; text-decoration:none; position:relative; overflow:hidden;
          background:linear-gradient(145deg, rgba(255,255,255,.26), rgba(255,255,255,.08));
          border:1px solid rgba(255,255,255,.35); box-shadow:0 6px 16px rgba(0,0,0,.2), inset 0 1.5px 0 rgba(255,255,255,.55);
          transition:transform .22s var(--h-ease), background .22s, border-color .22s; }
        .hd-circle:hover { transform:translateY(-2px); }
        .hd-circle[data-k="whatsapp"]:hover { background:#25D366; border-color:#25D366; }
        .hd-circle[data-k="telegram"]:hover { background:#27a7e7; border-color:#27a7e7; }
        .hd-circle[data-k="signal"]:hover   { background:#3a76f0; border-color:#3a76f0; }

        /* primary button: same sun gradient as the hero fare button */
        .hd-book { display:inline-flex; align-items:center; justify-content:center; height:46px; padding:0 24px; border-radius:100px; font-size:15px; font-weight:700; color:#fff; text-decoration:none; white-space:nowrap;
          background:linear-gradient(180deg, #c2410c, #9a3412); box-shadow:0 8px 18px rgba(194,65,12,.38), inset 0 1px 0 rgba(255,255,255,.3);
          transition:height .4s var(--h-ease), transform .22s var(--h-ease), background .22s; }
        .hd.is-scrolled .hd-book { height:42px; }
        .hd-book:hover { background:linear-gradient(180deg, #9a3412, #7c2d12); transform:translateY(-2px); }
        .hd-book:active { transform:none; }

        /* ── Burger + compact Book (mobile only) ── */
        .hd-mobile { display:none; align-items:center; gap:8px; flex-shrink:0; }
        .hd-book-sm { height:40px; padding:0 16px; font-size:14px; }
        .hd.is-scrolled .hd-book-sm { height:40px; }
        .hd-burger { width:44px; height:44px; border-radius:50%; display:flex; flex-direction:column; gap:5px; align-items:center; justify-content:center; cursor:pointer; color:#fff; padding:0;
          background:linear-gradient(145deg, rgba(255,255,255,.26), rgba(255,255,255,.08)); border:1px solid rgba(255,255,255,.35); box-shadow:0 6px 16px rgba(0,0,0,.2), inset 0 1.5px 0 rgba(255,255,255,.55); }
        .hd-burger-line { display:block; width:18px; height:2px; border-radius:2px; background:#fff; }
        .hd-burger-line:nth-child(2) { width:12px; align-self:center; }

        /* Desktop nav needs room: hide Telegram and Signal on mid widths (they stay in the menu) */
        @media (max-width:1279px) { .hd-chat .hd-circle:not([data-k="whatsapp"]) { display:none; } }
        @media (max-width:1079px) {
          .hd-nav, .hd-right { display:none; }
          .hd-mobile { display:flex; }
        }
        @media (max-width:640px) {
          .hd-inner { padding:0 14px; gap:10px; }
          .hd.is-scrolled .hd-inner { height:64px; }
          .hd-logo { width:48px; height:48px; }
          .hd.is-scrolled .hd-logo { width:42px; height:42px; }
          .hd-brand { gap:10px; }
          .hd-brand-name { font-size:17px; line-height:1.05; }
          .hd.is-scrolled .hd-brand-name { font-size:16px; }
          .hd-brand-slogan { display:none; }
        }
        @media (max-width:360px) {
          .hd-brand-name { font-size:15px; }
          .hd-book-sm { padding:0 13px; }
        }

        /* ══ Mobile menu: sheet from the right, big tap targets, thumb-zone actions ══ */
        .hd-drawer { position:fixed; inset:0; z-index:10000; display:flex; justify-content:flex-end; }
        .hd-backdrop { position:absolute; inset:0; background:rgba(4,20,17,.7); -webkit-backdrop-filter:blur(6px); backdrop-filter:blur(6px); animation:hdFade .25s ease both; }
        .hd-panel { position:relative; z-index:1; width:min(380px, 100%); height:100vh; height:100dvh; display:flex; flex-direction:column; overflow-y:auto; overscroll-behavior:contain; color:#fff;
          background:
            radial-gradient(70% 40% at 100% 100%, rgba(47,125,91,.16), transparent 70%),
            radial-gradient(80% 50% at 0% 0%, rgba(47,125,91,.6), transparent 70%),
            linear-gradient(180deg, #173b32 0%, #102c25 100%);
          box-shadow:-20px 0 60px rgba(0,0,0,.4); animation:hdSlide .32s cubic-bezier(.22,1,.36,1) both; }
        @keyframes hdFade { from { opacity:0 } to { opacity:1 } }
        @keyframes hdSlide { from { transform:translateX(100%) } to { transform:none } }

        .hd-d-top { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:16px 16px 14px 18px; border-bottom:1px solid rgba(255,255,255,.14); }
        .hd-d-brand { display:flex; align-items:center; gap:12px; min-width:0; }
        .hd-d-brand .hd-logo { width:46px; height:46px; border-radius:10px; }
        .hd-d-name { font-family:'Bricolage Grotesque',sans-serif; font-size:18px; font-weight:800; letter-spacing:-.01em; line-height:1.1; }
        .hd-d-slogan { font-size:13px; font-weight:600; color:var(--h-mint); margin-top:2px; }
        .hd-close { flex-shrink:0; width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; cursor:pointer; padding:0;
          background:linear-gradient(145deg, rgba(255,255,255,.26), rgba(255,255,255,.08)); border:1px solid rgba(255,255,255,.35); box-shadow:inset 0 1.5px 0 rgba(255,255,255,.55); }

        .hd-d-nav { flex:1; padding:10px 14px; display:flex; flex-direction:column; gap:4px; }
        .hd-d-link { display:flex; align-items:center; justify-content:space-between; min-height:54px; padding:0 16px; border-radius:16px; font-family:'Bricolage Grotesque',sans-serif; font-size:20px; font-weight:700; color:rgba(255,255,255,.88); text-decoration:none; border:1px solid transparent; transition:background .2s, border-color .2s; }
        .hd-d-link:hover, .hd-d-link:active { background:rgba(255,255,255,.1); }
        .hd-d-link.is-active { color:#fff; background:linear-gradient(135deg, rgba(255,255,255,.18), rgba(255,255,255,.06)); border-color:rgba(255,255,255,.24); box-shadow:inset 0 1px 0 rgba(255,255,255,.3); }
        .hd-d-link.is-active::before { content:""; width:4px; height:22px; border-radius:4px; background:var(--h-sun); margin-right:12px; flex-shrink:0; }
        .hd-d-link-label { flex:1; }
        .hd-d-chev { opacity:.5; flex-shrink:0; }

        .hd-d-bottom { padding:16px 18px calc(18px + env(safe-area-inset-bottom, 0px)); border-top:1px solid rgba(255,255,255,.14); display:flex; flex-direction:column; gap:14px; background:rgba(0,0,0,.12); }
        .hd-d-label { font-size:13.5px; font-weight:600; color:rgba(255,255,255,.75); margin-bottom:8px; }
        .hd-d-call { display:flex; align-items:center; justify-content:center; gap:10px; min-height:50px; border-radius:16px; font-size:16px; font-weight:700; color:#fff; text-decoration:none;
          background:linear-gradient(135deg, rgba(255,255,255,.2), rgba(255,255,255,.07)); border:1px solid rgba(255,255,255,.3); box-shadow:inset 0 1px 0 rgba(255,255,255,.4); }
        .hd-d-chats { display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; }
        .hd-d-chat { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; min-height:64px; border-radius:16px; font-size:12.5px; font-weight:600; color:#fff; text-decoration:none;
          background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.2); transition:background .2s, border-color .2s; }
        .hd-d-chat svg { width:22px; height:22px; }
        .hd-d-chat[data-k="whatsapp"]:active, .hd-d-chat[data-k="whatsapp"]:hover { background:#25D366; border-color:#25D366; }
        .hd-d-chat[data-k="telegram"]:active, .hd-d-chat[data-k="telegram"]:hover { background:#27a7e7; border-color:#27a7e7; }
        .hd-d-chat[data-k="signal"]:active,   .hd-d-chat[data-k="signal"]:hover   { background:#3a76f0; border-color:#3a76f0; }
        .hd-d-book { height:54px; font-size:16.5px; width:100%; }

        @media (max-width:420px) { .hd-panel { width:100%; } }
        @media (prefers-reduced-motion:reduce) {
          .hd, .hd-inner, .hd-logo, .hd-brand-name, .hd-book, .hd-link, .hd-circle, .hd-d-link, .hd-d-chat { transition:none; }
          .hd-panel, .hd-backdrop { animation:none; }
        }
      `}</style>

      <header className={headerClass}>
        <div className="hd-inner">

          {/* ── Brand ── */}
          <Link href="/" className="hd-brand" aria-label={`${BRAND} home`}>
            <span className="hd-logo">
              <Image
                src={BRAND_LOGO}
                alt="Super Star Travel logo"
                fill
                sizes="56px"
                style={{ objectFit: "contain", objectPosition: "center", padding: "3px" }}
                priority
              />
            </span>
            <span className="hd-brand-text">
              <span className="hd-brand-name">{BRAND}</span>
              <span className="hd-brand-slogan">{SLOGAN}</span>
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hd-nav" aria-label="Main">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hd-link${isActive(link.href) ? " is-active" : ""}`}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── Desktop right ── */}
          <div className="hd-right">
            <div className="hd-chat">
              {chatLinks.map((c) => (
                <a
                  key={c.key}
                  data-k={c.key}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hd-circle"
                  aria-label={c.label}
                  title={c.label}
                >
                  {c.icon}
                </a>
              ))}
            </div>
            <Link href="/reservation" className="hd-book">Book now</Link>
          </div>

          {/* ── Mobile: Book stays one tap away, menu beside it ── */}
          <div className="hd-mobile">
            <Link href="/reservation" className="hd-book hd-book-sm">Book now</Link>
            <button
              type="button"
              className="hd-burger"
              onClick={() => setIsOpen(true)}
              aria-label="Open menu"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              <span className="hd-burger-line" />
              <span className="hd-burger-line" />
              <span className="hd-burger-line" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile menu ── */}
      {isOpen && (
        <div className="hd-drawer" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="hd-backdrop" onClick={() => setIsOpen(false)} />
          <div className="hd-panel">

            <div className="hd-d-top">
              <div className="hd-d-brand">
                <span className="hd-logo">
                  <Image
                    src={BRAND_LOGO}
                    alt="Super Star Travel logo"
                    fill
                    sizes="46px"
                    style={{ objectFit: "contain", objectPosition: "center", padding: "3px" }}
                  />
                </span>
                <div>
                  <div className="hd-d-name">{BRAND}</div>
                  <div className="hd-d-slogan">{SLOGAN}</div>
                </div>
              </div>
              <button type="button" className="hd-close" aria-label="Close menu" onClick={() => setIsOpen(false)} autoFocus>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="hd-d-nav" aria-label="Mobile">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`hd-d-link${isActive(link.href) ? " is-active" : ""}`}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="hd-d-link-label">{link.label}</span>
                  <svg className="hd-d-chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </Link>
              ))}
            </nav>

            <div className="hd-d-bottom">
              <a href={`tel:${PHONE.tel}`} className="hd-d-call">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z" />
                </svg>
                Call {PHONE.display}
              </a>

              <div>
                <div className="hd-d-label">Or message us directly</div>
                <div className="hd-d-chats">
                  {chatLinks.map((c) => (
                    <a
                      key={c.key}
                      data-k={c.key}
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hd-d-chat"
                      aria-label={c.label}
                    >
                      {c.icon}
                      {c.short}
                    </a>
                  ))}
                </div>
              </div>

              <Link href="/reservation" className="hd-book hd-d-book" onClick={() => setIsOpen(false)}>
                Book now
              </Link>
            </div>

          </div>
        </div>
      )}
    </>
  );
}