import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "./blogData";

export const metadata: Metadata = {
  title: "Paris Travel Blog | Airport Transfers, Tips & Guides | PEM Transfers",
  description: "Expert guides on Paris airport transfers, family travel tips, chauffeur services, and everything you need to know before visiting Paris. Written by locals.",
  keywords: "Paris travel blog, CDG airport transfer guide, Paris taxi tips, Disneyland Paris transfer, Paris family travel",
  openGraph: {
    title: "Paris Travel Blog | PEM Transfers",
    description: "Expert guides for travellers visiting Paris — airport transfers, family tips, chauffeur services and more.",
    type: "website",
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  "Airport Transfers": "#2f7d5b",
  "Family Travel":     "#2f7d5b",
  "Paris Travel Tips": "#6b8ec9",
};

export default function BlogIndex() {
  if (!blogPosts || blogPosts.length === 0) {
    return (
      <div style={{ background: "#0c0d0f", color: "#f3f7f2", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <p>No blog posts found.</p>
      </div>
    );
  }

  const featured = blogPosts[0];
  const rest     = blogPosts.slice(1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --ink:          #0c0d0f;
          --ink-soft:     #13151a;
          --gold:         #2f7d5b;
          --gold-pale:    rgba(47,125,91,0.10);
          --gold-stroke:  rgba(47,125,91,0.22);
          --ivory:        #f3f7f2;
          --ivory-dim:    rgba(245,240,232,0.70);
          --ivory-faint:  rgba(245,240,232,0.35);
          --stroke:       rgba(245,240,232,0.08);
          --stroke-mid:   rgba(245,240,232,0.14);
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .blog-root {
          background: var(--ink);
          color: var(--ivory);
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
        }

        .breadcrumb {
          max-width: 1440px; margin: 0 auto;
          padding: 20px 5vw 0;
          font-size: 12px; color: var(--ivory-faint);
          display: flex; gap: 8px; align-items: center;
        }
        .breadcrumb a { color: var(--ivory-faint); text-decoration: none; transition: color .2s; }
        .breadcrumb a:hover { color: var(--gold); }

        .blog-header {
          position: relative;
          padding: 56px 5vw 48px;
          border-bottom: 1px solid var(--stroke-mid);
          overflow: hidden;
          max-width: 1440px; margin: 0 auto;
        }
        .blog-header::before {
          content: '';
          position: absolute; top: -120px; right: -80px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(47,125,91,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .blog-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .blog-eyebrow-line { width: 28px; height: 1px; background: var(--gold); }
        .blog-eyebrow-text { font-size: 11px; font-weight: 500; letter-spacing: .22em; text-transform: uppercase; color: var(--gold); }
        .blog-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(38px, 5vw, 68px); font-weight: 400; line-height: .95; margin-bottom: 16px; }
        .blog-title em { font-style: italic; color: var(--gold); font-weight: 300; }
        .blog-subtitle { font-size: 15px; font-weight: 300; color: var(--ivory-faint); max-width: 520px; line-height: 1.7; }

        .blog-filters {
          max-width: 1440px; margin: 0 auto;
          padding: 24px 5vw;
          display: flex; gap: 8px; flex-wrap: wrap;
          border-bottom: 1px solid var(--stroke);
        }
        .filter-pill {
          padding: 6px 18px; border-radius: 100px;
          border: 1px solid var(--stroke-mid);
          font-size: 10.5px; font-weight: 500; letter-spacing: .12em; text-transform: uppercase;
          color: var(--ivory-faint); text-decoration: none; cursor: pointer;
          transition: all .2s;
          background: transparent;
        }
        .filter-pill:hover,
        .filter-pill.active { border-color: var(--gold-stroke); color: var(--gold); background: var(--gold-pale); }

        .blog-main { max-width: 1440px; margin: 0 auto; padding: 48px 5vw 80px; }

        /* ── Featured post ── */
        .featured-post {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          border: 1px solid var(--stroke-mid);
          border-radius: 18px;
          overflow: hidden;
          margin-bottom: 52px;
          background: var(--ink-soft);
          transition: border-color .25s;
          text-decoration: none;
        }
        .featured-post:hover { border-color: var(--gold-stroke); }

        /* Image panel — real photo */
        .featured-img {
          position: relative;
          min-height: 400px;
          overflow: hidden;
        }
        .featured-img img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .5s ease;
        }
        .featured-post:hover .featured-img img { transform: scale(1.04); }
        /* Right-edge fade into card content */
        .featured-img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(19,21,26,0.75) 100%);
          pointer-events: none;
        }

        /* Content side */
        .featured-content {
          padding: 40px 40px 36px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .post-category {
          display: inline-block;
          font-size: 9.5px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase;
          padding: 4px 12px; border-radius: 100px; margin-bottom: 18px;
        }
        .featured-post-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(22px, 2.6vw, 36px);
          font-weight: 500; line-height: 1.1;
          margin-bottom: 14px;
          color: var(--ivory);
          text-decoration: none; display: block;
          transition: color .2s;
        }
        .featured-post:hover .featured-post-title { color: var(--gold); }
        .post-excerpt {
          font-size: 14px; font-weight: 300; line-height: 1.75;
          color: var(--ivory-faint); margin-bottom: 24px;
        }
        .post-meta {
          display: flex; align-items: center; gap: 14px;
          font-size: 11px; color: var(--ivory-faint); margin-bottom: 24px; flex-wrap: wrap;
        }
        .post-meta-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--ivory-faint); }
        .read-more {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase;
          color: var(--gold); text-decoration: none; transition: gap .2s;
        }
        .read-more:hover { gap: 14px; }

        /* ── Post grid ── */
        .post-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 22px;
        }
        .post-card {
          border: 1px solid var(--stroke-mid); border-radius: 14px;
          overflow: hidden; background: var(--ink-soft);
          display: flex; flex-direction: column;
          transition: all .25s; text-decoration: none;
        }
        .post-card:hover { border-color: var(--gold-stroke); transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,.4); }

        /* Card image — real photo */
        .card-img {
          height: 190px;
          overflow: hidden; position: relative;
        }
        .card-img img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .45s ease;
        }
        .post-card:hover .card-img img { transform: scale(1.06); }
        .card-img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 30%, rgba(19,21,26,0.65) 100%);
          pointer-events: none;
        }

        .card-body { padding: 20px 22px 22px; flex: 1; display: flex; flex-direction: column; }
        .card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 19px; font-weight: 500; line-height: 1.2;
          color: var(--ivory); margin-bottom: 10px; transition: color .2s;
        }
        .post-card:hover .card-title { color: var(--gold); }
        .card-excerpt { font-size: 13px; font-weight: 300; line-height: 1.65; color: var(--ivory-faint); flex: 1; margin-bottom: 16px; }
        .card-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 14px; border-top: 1px solid var(--stroke);
          font-size: 11px; color: var(--ivory-faint);
        }
        .card-read { color: var(--gold); font-weight: 600; letter-spacing: .1em; text-transform: uppercase; font-size: 9.5px; }

        /* ── CTA strip ── */
        .blog-cta-strip {
          background: linear-gradient(135deg, rgba(47,125,91,.08), rgba(47,125,91,.03));
          border: 1px solid var(--gold-stroke); border-radius: 14px;
          padding: 32px 36px; margin: 52px 0 0;
          display: flex; align-items: center; justify-content: space-between;
          gap: 20px; flex-wrap: wrap;
        }
        .cta-strip-text h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px; font-weight: 500; margin-bottom: 6px;
        }
        .cta-strip-text p { font-size: 13px; color: var(--ivory-faint); font-weight: 300; }
        .cta-strip-btn {
          display: inline-flex; align-items: center; gap: 10px;
          background: var(--gold); color: var(--ink);
          font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
          text-decoration: none; padding: 13px 26px; border-radius: 8px;
          white-space: nowrap; transition: background .2s; flex-shrink: 0;
        }
        .cta-strip-btn:hover { background: #5a9a73; }

        @media (max-width: 900px) {
          .featured-post { grid-template-columns: 1fr; }
          .featured-img  { min-height: 240px; }
          .featured-content { padding: 26px 26px 28px; }
          /* On mobile the overlay should fade bottom→top not right→left */
          .featured-img-overlay {
            background: linear-gradient(180deg, transparent 0%, rgba(19,21,26,0.75) 100%);
          }
        }
        @media (max-width: 600px) {
          .blog-header   { padding: 48px 20px 36px; }
          .blog-filters  { padding: 20px 20px; }
          .blog-main     { padding: 28px 20px 52px; }
          .blog-cta-strip { padding: 22px 20px; flex-direction: column; align-items: flex-start; }
          .post-grid     { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="blog-root">

        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span>›</span>
          <span>Blog</span>
        </nav>

        <header className="blog-header">
          <div className="blog-eyebrow">
            <div className="blog-eyebrow-line" />
            <span className="blog-eyebrow-text">Paris Transfer Guides</span>
          </div>
          <h1 className="blog-title">Paris Travel <em>Guides</em></h1>
          <p className="blog-subtitle">
            Expert guides on airport transfers, family travel, chauffeur services,
            and everything you need for a seamless trip to Paris — written by people who know the city.
          </p>
        </header>

        <div className="blog-filters">
          <span className="filter-pill active">All Articles</span>
          {["Airport Transfers", "Family Travel", "Paris Travel Tips"].map(cat => (
            <span key={cat} className="filter-pill">{cat}</span>
          ))}
        </div>

        <main className="blog-main">

          {/* ── Featured post ── */}
          <article className="featured-post">
            {/* Image panel — uses hero URL from blogData */}
            <div className="featured-img">
              <img
                src={featured.hero}
                alt={featured.title}
                loading="eager"
              />
              <div className="featured-img-overlay" />
            </div>

            {/* Content panel */}
            <div className="featured-content">
              <span
                className="post-category"
                style={{
                  background: `${CATEGORY_COLORS[featured.category]}18`,
                  color:       CATEGORY_COLORS[featured.category],
                  border:     `1px solid ${CATEGORY_COLORS[featured.category]}33`,
                }}
              >
                {featured.category}
              </span>

              <Link href={`/blog/${featured.slug}`} className="featured-post-title">
                {featured.title}
              </Link>

              <div className="post-meta">
                <span>
                  {new Date(featured.publishDate).toLocaleDateString("en-GB", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </span>
                <div className="post-meta-dot" />
                <span>{featured.readTime}</span>
              </div>

              <p className="post-excerpt">{featured.excerpt}</p>

              <Link href={`/blog/${featured.slug}`} className="read-more">
                Read Full Guide →
              </Link>
            </div>
          </article>

          {/* ── Post grid ── */}
          <div className="post-grid">
            {rest.map(post => {
              const color = CATEGORY_COLORS[post.category] ?? "#2f7d5b";
              return (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="post-card">
                  {/* Card image — uses hero URL from blogData */}
                  <div className="card-img">
                    <img
                      src={post.hero}
                      alt={post.title}
                      loading="lazy"
                    />
                    <div className="card-img-overlay" />
                  </div>

                  {/* Card body */}
                  <div className="card-body">
                    <span
                      className="post-category"
                      style={{
                        background: `${color}15`,
                        color,
                        border:    `1px solid ${color}30`,
                        fontSize:  "9px",
                        padding:   "3px 10px",
                        marginBottom: 10,
                        display:   "inline-block",
                      }}
                    >
                      {post.category}
                    </span>
                    <div className="card-title">{post.title}</div>
                    <p className="card-excerpt">{post.excerpt}</p>
                    <div className="card-footer">
                      <span>{post.readTime}</span>
                      <span className="card-read">Read →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ── CTA strip ── */}
          <div className="blog-cta-strip">
            <div className="cta-strip-text">
              <h3>Ready to book your Paris transfer?</h3>
              <p>Fixed prices · Flight tracking · Free child seats · Meet &amp; Greet at arrivals</p>
            </div>
            <a href="/reservation" className="cta-strip-btn">
              <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
              Book Now
            </a>
          </div>
        </main>
      </div>
    </>
  );
}