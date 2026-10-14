"use client";

import React from "react";

const packages = [
  {
    num: "01",
    tag: "Priority Route",
    title: "CDG Airport to Disneyland",
    desc: "Seamless terminal-to-magic transition with professional meet-and-greet and real-time flight tracking.",
    time: "≈ 45 min",
    fare: "€105",
    bg: "https://private-driver-paris-airport-transfer.com/wp-content/uploads/2025/10/mercedes-v-class-van-private-driver-paris-luxury-fleet.jpeg",
  },
  {
    num: "02",
    tag: "Family Choice",
    title: "Orly Airport to Disneyland",
    desc: "Fast, spacious door-to-door transfer ideal for families — generous luggage & stroller capacity.",
    time: "≈ 40 min",
    fare: "€95",
    bg: "https://www.parisride.com/wp-content/uploads/2025/10/Disneyland-Paris.png",
  },
  {
    num: "03",
    tag: "Executive",
    title: "Paris to Palace of Versailles",
    desc: "Arrive in timeless elegance. Private narrated approach avoiding crowds and queues.",
    time: "≈ 50 min",
    fare: "€110",
    bg: "https://parisprestigecab.com/assets/versailles-BzoH0iLQ.jpg",
  },
];

const googleReviews = [
  {
    name: "Sarah Mitchell",
    avatar: "SM",
    color: "#4285F4",
    date: "2 weeks ago",
    rating: 5,
    text: "Absolutely seamless from CDG to our Disney hotel. Driver was waiting with a name sign and handled all luggage effortlessly.",
    trip: "CDG → Disneyland",
  },
  {
    name: "James Thornton",
    avatar: "JT",
    color: "#EA4335",
    date: "1 month ago",
    rating: 5,
    text: "Perfect Versailles day trip transfer. Punctual, courteous driver who shared excellent tips for avoiding crowds.",
    trip: "Paris → Versailles",
  },
];

function Stars({ count, color = "#2f7d5b", size = 14 }: { count: number; color?: string; size?: number }) {
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < count ? color : "none"} stroke={color} strokeWidth="1.8">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function LuxuryTransportPortal() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,500&family=JetBrains+Mono:wght@400;500;700&display=swap');

        :root {
          --gold:        #2f7d5b;
          --gold-dark:    #245e46;
          --slate:        #0f172a;
          --slate-light:  #1e293b;
          --text:         #dfe8de;
          --text-muted:   #94a3b8;
          --bg:           #f3f7f2;
          --card-bg:      #ffffff;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }

        .portal-wrapper {
          background: var(--bg);
          color: var(--slate);
          min-height: 100vh;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: clamp(60px, 10vw, 120px) 24px;
        }

        /* Packages Section */
        .pkg-header {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 80px;
        }

        .pkg-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--gold);
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }

        .pkg-header h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3rem, 7vw, 5.5rem);
          font-weight: 600;
          line-height: 0.95;
          margin: 0 0 1.2rem;
        }

        .pkg-header h2 i {
          font-style: italic;
          color: var(--gold);
        }

        .pkg-header p {
          font-size: 1.15rem;
          color: var(--text-muted);
        }

        .pkg-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 32px;
          margin-bottom: 140px;
        }

        .pkg-card {
          background: var(--card-bg);
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 16px 48px rgba(0,0,0,0.06);
          transition: all 0.45s cubic-bezier(0.165, 0.84, 0.44, 1);
          border: 1px solid rgba(47,125,91,0.08);
        }

        .pkg-card:hover {
          transform: translateY(-16px);
          box-shadow: 0 28px 64px rgba(0,0,0,0.12);
          border-color: rgba(47,125,91,0.24);
        }

        .pkg-img {
          height: 260px;
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .pkg-img::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 40%, rgba(15,23,42,0.65) 100%);
        }

        .pkg-content {
          padding: 36px 32px 40px;
        }

        .pkg-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--gold);
          letter-spacing: 2.5px;
          text-transform: uppercase;
          display: inline-block;
          margin-bottom: 12px;
        }

        .pkg-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.4rem;
          font-weight: 600;
          margin: 0 0 16px;
          line-height: 1.1;
        }

        .pkg-desc {
          color: var(--text-muted);
          font-size: 1.05rem;
          line-height: 1.65;
          margin-bottom: 32px;
        }

        .pkg-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 24px;
          border-top: 1px solid rgba(47,125,91,0.12);
        }

        .pkg-price {
          font-size: 2.1rem;
          font-weight: 700;
        }

        .pkg-price span {
          font-size: 0.9rem;
          font-weight: 400;
          color: var(--text-muted);
        }

        .book-btn {
          background: var(--slate);
          color: white;
          padding: 14px 32px;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .book-btn:hover {
          background: var(--gold);
          color: var(--slate);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(47,125,91,0.3);
        }

        /* ────────────────────────────────────────
           Reviews Section – Google & TripAdvisor
        ──────────────────────────────────────── */
        .rv-section {
          background: linear-gradient(135deg, var(--slate) 0%, var(--slate-light) 100%);
          color: white;
          position: relative;
          overflow: hidden;
        }

        .rv-bg-overlay {
          position: absolute;
          inset: 0;
          background: url('https://cdn.prod.website-files.com/61fc302889864bb79c5ef818/6776940902bd53c8936afab8_luxury-mercedes-s-class-paris-chauffeur-service-dbs-experience.webp') center/cover no-repeat;
          opacity: 0.10;
          mix-blend-mode: screen;
          pointer-events: none;
        }

        .rv-trust-bar {
          text-align: center;
          margin-bottom: 80px;
          padding: 48px 32px;
          background: rgba(255,255,255,0.06);
          border-radius: 28px;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(47,125,91,0.18);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        }

        .rv-trust-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.8rem, 6vw, 4.8rem);
          margin: 0 0 24px;
          font-weight: 600;
        }

        .stats-row {
          display: flex;
          justify-content: center;
          gap: clamp(48px, 8vw, 120px);
          flex-wrap: wrap;
          align-items: center;
          margin: 32px 0;
        }

        .stat-block {
          text-align: center;
        }

        .stat-number {
          font-size: 4.2rem;
          font-weight: 700;
          line-height: 1;
        }

        .stat-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1rem;
          color: rgba(255,255,255,0.75);
          margin-top: 8px;
          letter-spacing: 1px;
        }

        .divider {
          width: 2px;
          height: 70px;
          background: linear-gradient(to bottom, transparent, var(--gold), transparent);
          opacity: 0.4;
        }

        .rv-testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
          gap: 40px;
        }

        .testimonial-card {
          background: rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 40px 36px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(47,125,91,0.15);
          box-shadow: 0 12px 40px rgba(0,0,0,0.25);
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .testimonial-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.35);
          border-color: rgba(47,125,91,0.35);
        }

        .accent-bar {
          position: absolute;
          top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, var(--gold), #245e46);
        }

        .review-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .avatar {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        .review-name {
          font-size: 1.3rem;
          font-weight: 600;
        }

        .review-date {
          color: rgba(255,255,255,0.6);
          font-size: 0.95rem;
        }

        .review-text {
          font-size: 1.15rem;
          line-height: 1.7;
          font-style: italic;
          margin: 0 0 28px;
          color: rgba(255,255,255,0.92);
        }

        .review-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .trip-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9rem;
          background: rgba(47,125,91,0.12);
          color: var(--gold);
          padding: 6px 16px;
          border-radius: 12px;
          border: 1px solid rgba(47,125,91,0.2);
        }

        @media (max-width: 900px) {
          .stats-row { gap: 60px; }
          .rv-testimonials-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 600px) {
          .container { padding: 60px 16px; }
        }
      `}</style>

      <div className="portal-wrapper">
        {/* Reviews Section */}
        <div className="rv-section">
          <div className="rv-bg-overlay" />

          <div className="container">
            <div className="rv-trust-bar">
              <h2 className="rv-trust-title">Uncompromising Excellence</h2>

              <div className="stats-row">
                <div className="stat-block">
                  <div className="stat-number" style={{ color: "var(--gold)" }}>4.9</div>
                  <Stars count={5} color="#2f7d5b" size={28} />
                  <div className="stat-label">GOOGLE</div>
                </div>

                <div className="divider" />

                <div className="stat-block">
                  <div className="stat-number" style={{ color: "#2f7d5b" }}>5.0</div>
                  <Stars count={5} color="#2f7d5b" size={28} />
                  <div className="stat-label">TRIPADVISOR</div>
                </div>
              </div>

              <p style={{ fontSize: "1.15rem", opacity: 0.9, maxWidth: 720, margin: "0 auto" }}>
                The most highly regarded private chauffeur service in Paris — loved by travelers worldwide.
              </p>
            </div>

            <div className="rv-testimonials-grid">
              {googleReviews.map((rev, i) => (
                <div key={i} className="testimonial-card">
                  <div className="accent-bar" />

                  <div className="review-header">
                    <div className="avatar" style={{ background: rev.color }}>
                      {rev.avatar}
                    </div>
                    <div>
                      <div className="review-name">{rev.name}</div>
                      <div className="review-date">{rev.date}</div>
                    </div>
                  </div>

                  <p className="review-text">“{rev.text}”</p>

                  <div className="review-footer">
                    <span className="trip-tag">{rev.trip}</span>
                    <Stars count={5} size={20} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "80px", opacity: 0.9 }}>
              <p style={{ fontSize: "1.1rem" }}>
                Join hundreds of delighted travelers — your perfect Paris journey awaits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}