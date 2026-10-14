"use client";

import React from "react";

const packages = [
  {
    num: "01",
    tag: "Priority Route",
    title: "CDG Airport to Disneyland",
    desc: "Experience a seamless transition from the terminal to the magic. Includes professional meet-and-greet and flight synchronization.",
    time: "≈ 45 min",
    bg: "https://private-driver-paris-airport-transfer.com/wp-content/uploads/2025/10/mercedes-v-class-van-private-driver-paris-luxury-fleet.jpeg",
  },
  {
    num: "02",
    tag: "Family Choice",
    title: "Orly Airport to Disneyland",
    desc: "The swiftest gateway for families. Door-to-door service in premium vehicles with ample space for all your luggage and strollers.",
    time: "≈ 40 min",
    bg: "https://www.parisride.com/wp-content/uploads/2025/10/Disneyland-Paris.png",
  },
  {
    num: "03",
    tag: "Long Distance",
    title: "Beauvais to Disneyland",
    desc: "Transform a long trek into a relaxing retreat. Our executive vans offer climate control and refreshments for the 90-minute journey.",
    time: "≈ 90 min",
    bg: "https://www.pelago.com/img/products/FR-France/private-transfer-disneyland-to-paris-airport-cdg-by-luxury-van/2d5e5a21-23a2-4879-aa4c-f5d835d4478b_private-transfer-disneyland-to-paris-airport-cdg-by-luxury-van.jpg",
  },
  {
    num: "04",
    tag: "Royal Heritage",
    title: "Paris to Palace of Versailles",
    desc: "Arrive at the Sun King's gates in style. Avoid the crowds of the RER and enjoy a private, narrated approach to the Château.",
    time: "≈ 50 min",
    bg: "https://parisprestigecab.com/assets/versailles-BzoH0iLQ.jpg",
  },
  {
    num: "05",
    tag: "Urban Arrival",
    title: "CDG Airport to Paris City Center",
    desc: "Effortless entry into the heart of Paris. Meet & greet at arrivals, direct hotel drop-off with luxury sedan or van — no queues, no stress.",
    time: "≈ 45–60 min",
    bg: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=2070",
  },
  {
    num: "06",
    tag: "Iconic Return",
    title: "Paris City Center to CDG Airport",
    desc: "Seamless departure with timed pickup from your hotel. Flight monitoring, luggage assistance, and premium comfort for your journey home.",
    time: "≈ 45–60 min",
    bg: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=2070",
  },
];

export default function PremiumPackages() {
  return (
    <section style={styles.section}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600;700&display=swap');

        .package-card {
          background: white;
          border: 1px solid rgba(47,125,91,0.12);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.4s ease;
          position: relative;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
        }

        .package-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 60px rgba(10,31,68,0.12);
          border-color: #2f7d5b40;
        }

        .image-wrapper {
          height: 240px;
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(10,31,68,0.65) 0%, transparent 60%);
        }

        .content {
          padding: 32px 28px 36px;
        }

        .tag {
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 2px;
          color: #2f7d5b;
          text-transform: uppercase;
          margin-bottom: 12px;
          display: block;
        }

        .title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.6rem, 2.3vw, 2rem);
          font-weight: 500;
          line-height: 1.18;
          margin: 0 0 14px;
          color: #102c25;
        }

        .desc {
          font-size: 0.98rem;
          line-height: 1.68;
          color: #2f7d5b;
          margin-bottom: 28px;
        }

        .meta {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          padding-top: 20px;
          border-top: 1px solid rgba(47,125,91,0.12);
          gap: 8px;
        }

        .meta-label {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: #63756b;
        }

        .meta-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #102c25;
        }

        .book-btn {
          padding: 14px 38px;
          background: #c2410c;
          color: #fff;
          border: 2px solid #c2410c;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.92rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: all 0.35s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .book-btn:hover {
          background: #9a3412;
          color: #fff;
          transform: translateY(-2px);
        }

        .num-badge {
          position: absolute;
          top: 24px;
          left: 28px;
          width: 48px;
          height: 48px;
          background: #102c25;
          color: #2f7d5b;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 1.3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 3px solid #2f7d5b;
          z-index: 2;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        @media (max-width: 640px) {
          .image-wrapper { height: 220px; }
          .content { padding: 28px 24px 32px; }
          .num-badge { top: 20px; left: 20px; width: 44px; height: 44px; font-size: 1.2rem; }
        }
      `}</style>

      <div style={styles.header}>
        <div style={styles.eyebrow}>Signature Journeys</div>
        <h2 style={styles.mainTitle}>
          Premium <span style={{ color: "#2f7d5b" }}>Experiences</span>
        </h2>
        <p style={styles.subtitle}>
          Curated private transfers — fixed fares, luxury vehicles, absolute discretion.
        </p>
      </div>

      <div style={styles.packagesGrid}>
        {packages.map((pkg, index) => (
          <div key={index} style={styles.packageCard} className="package-card">
            <div className="num-badge">{pkg.num}</div>

            <div
              className="image-wrapper"
              style={{ backgroundImage: `url(${pkg.bg})` }}
            >
              <div className="image-overlay" />
            </div>

            <div className="content">
              <span className="tag">{pkg.tag}</span>
              <h3 className="title">{pkg.title}</h3>
              <p className="desc">{pkg.desc}</p>

              <div className="meta">
                <span className="meta-label">Duration</span>
                <span className="meta-value">{pkg.time}</span>
              </div>

              <div style={{ marginTop: 28 }}>
                <a href="reservation" className="book-btn">
                  Book This Journey →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    background: "#ffffff",
    padding: "clamp(60px, 8vh, 90px) 5vw",
    color: "#102c25",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  header: {
    textAlign: "center",
    maxWidth: 920,
    margin: "0 auto 50px",
  },
  eyebrow: {
    fontSize: "clamp(13px, 1vw, 14.5px)",
    fontWeight: 600,
    letterSpacing: "0.28em",
    color: "#2f7d5b",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  mainTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(2.8rem, 6vw, 4.8rem)",
    fontWeight: 500,
    lineHeight: 1.05,
    margin: "0 0 16px",
  },
  subtitle: {
    fontSize: "clamp(1.05rem, 1.4vw, 1.2rem)",
    lineHeight: 1.65,
    color: "#2f7d5b",
    maxWidth: 680,
    margin: "0 auto",
  },
  packagesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
    gap: 32,
    maxWidth: 1400,
    margin: "0 auto",
  },
  packageCard: {
    position: "relative",
  },
};