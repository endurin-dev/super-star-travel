"use client";

import React from "react";

export default function ReadyToBook() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

        :root {
          --bg: #102c25;
          --emerald: #2f7d5b;
          --emerald-dark: #245e46;
          --text: #f3f7f2;
          --text-muted: rgba(245,240,232,0.55);
          --border: rgba(47,125,91,0.22);
          --glass: rgba(255,255,255,0.04);
        }

        .rtb-section {
          background: var(--bg);
          color: var(--text);
          font-family: 'Space Grotesk', system-ui, sans-serif;
          position: relative;
          overflow: hidden;
          padding: clamp(100px, 14vw, 160px) 5vw;
        }

        .rtb-bg {
          position: absolute; inset: 0;
          background: url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=90&w=2400') center/cover no-repeat;
          opacity: 0.07;
          filter: brightness(0.6) contrast(1.1);
        }

        .rtb-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 90% 120% at 50% 40%, rgba(47,125,91,0.08) 0%, transparent 65%);
          pointer-events: none;
        }

        .rtb-dots {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle at 10px 10px, rgba(47,125,91,0.05) 1.5px, transparent 1.5px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .rtb-topline {
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, var(--emerald) 30%, var(--emerald) 70%, transparent);
          opacity: 0.7;
        }

        .rtb-inner {
          position: relative;
          max-width: 1100px;
          margin: 0 auto;
          text-align: center;
        }

        .rtb-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'Space Mono', monospace;
          font-size: 0.78rem; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--emerald);
          background: rgba(47,125,91,0.08);
          border: 1px solid var(--border);
          border-radius: 50px;
          padding: 8px 20px;
          margin-bottom: 2.2rem;
        }

        .rtb-eyebrow-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--emerald);
          box-shadow: 0 0 12px rgba(47,125,91,0.6);
          animation: pulse 2.4s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(47,125,91,0.4); }
          50%       { box-shadow: 0 0 20px rgba(47,125,91,0.9); }
        }

        .rtb-heading {
          font-size: clamp(3.2rem, 7.5vw, 6.2rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
          margin-bottom: 1.4rem;
          color: var(--text);
        }

        .rtb-heading em {
          font-style: normal;
          color: var(--emerald);
        }

        .rtb-sub {
          font-size: clamp(1.1rem, 2.5vw, 1.35rem);
          font-weight: 400;
          color: var(--text-muted);
          line-height: 1.65;
          max-width: 680px;
          margin: 0 auto 3.5rem;
        }

        .rtb-trust {
          display: flex; flex-wrap: wrap; justify-content: center;
          gap: 14px; margin-bottom: 3.8rem;
        }

        .rtb-trust-pill {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--glass);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(245,240,232,0.08);
          border-radius: 999px;
          padding: 10px 18px 10px 14px;
          font-family: 'Space Mono', monospace;
          font-size: 0.82rem; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(245,240,232,0.60);
          transition: all 0.25s ease;
        }

        .rtb-trust-pill:hover {
          background: rgba(47,125,91,0.08);
          border-color: rgba(47,125,91,0.30);
          color: var(--text);
        }

        .rtb-trust-pill svg {
          width: 16px; height: 16px;
          color: var(--emerald);
        }

        .rtb-ctas {
          display: flex; flex-wrap: wrap; justify-content: center;
          gap: 1.2rem; margin-bottom: 5rem;
        }

        .rtb-btn {
          position: relative;
          overflow: hidden;
          display: inline-flex; align-items: center; gap: 12px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.05rem; font-weight: 700;
          letter-spacing: -0.01em;
          padding: 18px 40px;
          border-radius: 16px;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          white-space: nowrap;
        }

        .rtb-btn-primary {
          background: linear-gradient(180deg, #c2410c, #9a3412);
          color: #fff;
          box-shadow: 0 8px 32px rgba(194,65,12,0.35);
        }

        .rtb-btn-primary:hover {
          background: linear-gradient(180deg, #9a3412, #7c2d12);
          transform: translateY(-3px);
          box-shadow: 0 16px 48px rgba(194,65,12,0.45);
        }

        .rtb-btn-primary::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%);
          opacity: 0.6;
          transition: opacity 0.4s;
        }

        .rtb-btn-primary:hover::after { opacity: 0.9; }

        .rtb-btn-secondary {
          background: var(--glass);
          backdrop-filter: blur(12px);
          border: 1.5px solid rgba(245,240,232,0.10);
          color: var(--text);
        }

        .rtb-btn-secondary:hover {
          background: rgba(47,125,91,0.08);
          border-color: rgba(47,125,91,0.35);
          transform: translateY(-3px);
        }

        .rtb-or {
          font-family: 'Space Mono', monospace;
          font-size: 0.9rem; font-weight: 700;
          color: rgba(245,240,232,0.22);
          padding: 0 1rem;
          align-self: center;
        }

        .rtb-stats {
          display: flex; flex-wrap: wrap; justify-content: center;
          gap: 1px; margin-top: 4rem;
          border-radius: 20px;
          overflow: hidden;
          background: var(--glass);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(245,240,232,0.07);
          box-shadow: 0 12px 48px rgba(0,0,0,0.4);
        }

        .rtb-stat {
          flex: 1 1 180px;
          padding: 2.2rem 1.8rem;
          text-align: center;
          border-right: 1px solid rgba(245,240,232,0.06);
          transition: all 0.3s ease;
        }

        .rtb-stat:hover { background: rgba(47,125,91,0.06); }
        .rtb-stat:last-child { border-right: none; }

        .rtb-stat-num {
          font-size: clamp(1.8rem, 4.5vw, 2.8rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
          margin-bottom: 0.5rem;
          color: var(--text);
        }

        .rtb-stat-num span {
          color: var(--emerald);
          font-weight: 700;
        }

        .rtb-stat-label {
          font-family: 'Space Mono', monospace;
          font-size: 0.78rem; font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeup { animation: fadeUp 0.8s both; }

        @media (max-width: 768px) {
          .rtb-ctas { flex-direction: column; gap: 1rem; }
          .rtb-or { display: none; }
          .rtb-stats { flex-direction: column; gap: 1px; }
          .rtb-stat { border-right: none; border-bottom: 1px solid rgba(245,240,232,0.06); }
          .rtb-stat:last-child { border-bottom: none; }
        }
      `}</style>

      <section className="rtb-section">
        <div className="rtb-bg" />
        <div className="rtb-glow" />
        <div className="rtb-dots" />
        <div className="rtb-topline" />

        <div className="rtb-inner">
          <div className="rtb-eyebrow animate-fadeup" style={{ animationDelay: "0.1s" }}>
            <span className="rtb-eyebrow-dot" />
            INSTANT BOOKING
          </div>

          <h2 className="rtb-heading animate-fadeup" style={{ animationDelay: "0.2s" }}>
            Your Paris transfer<br /><em>— confirmed in seconds</em>
          </h2>

          <p className="rtb-sub animate-fadeup" style={{ animationDelay: "0.35s" }}>
            Transparent fixed pricing • Luxury vehicles • Professional English-speaking drivers •
            Real-time flight tracking • No hidden fees • Pay on arrival
          </p>

          <div className="rtb-trust animate-fadeup" style={{ animationDelay: "0.5s" }}>
            {[
              { label: "Fixed Fare",      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622z" },
              { label: "Pay on Arrival",  icon: "M17 9V7a5 5 0 00-10 0v2m-3 0h16a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2v-9a2 2 0 012-2z" },
              { label: "Free Cancel 24h", icon: "M6 18L18 6M6 6l12 12" },
              { label: "24/7 Support",    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "Flight Monitored",icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" },
            ].map((item, i) => (
              <div key={i} className="rtb-trust-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                {item.label}
              </div>
            ))}
          </div>

          <div className="rtb-ctas animate-fadeup" style={{ animationDelay: "0.65s" }}>
            <a href="/booking" className="rtb-btn rtb-btn-primary">
              Book Your Transfer Now
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>

            <span className="rtb-or">or</span>

            <a href="tel:+94726803498" className="rtb-btn rtb-btn-secondary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +94 72 680 3498
            </a>

            <a href="https://wa.me/94726803498" target="_blank" rel="noopener noreferrer" className="rtb-btn rtb-btn-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
                <path d="M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0012.05 0z" />
              </svg>
              WhatsApp Chat
            </a>
          </div>

          <div className="rtb-stats animate-fadeup" style={{ animationDelay: "0.8s" }}>
            {[
              { num: "1200", suffix: "+",   label: "Rides Completed" },
              { num: "4.9",  suffix: "★",   label: "Average Rating" },
              { num: "24",   suffix: "/7",  label: "Support" },
              { num: "0",    suffix: "€",   label: "Hidden Fees" },
              { num: "15",   suffix: "min", label: "Response Time" },
            ].map((stat, i) => (
              <div key={i} className="rtb-stat">
                <div className="rtb-stat-num">
                  {stat.num}<span>{stat.suffix}</span>
                </div>
                <div className="rtb-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}