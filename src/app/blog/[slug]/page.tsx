import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getPostBySlug, getRelatedPosts, BlogSection } from "../blogData";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return blogPosts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: post.keywords.join(", "),
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      type: "article",
      publishedTime: post.publishDate,
      images: [{ url: post.hero }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
      images: [post.hero],
    },
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  "Airport Transfers": "#2f7d5b",
  "Family Travel":     "#2f7d5b",
  "Paris Travel Tips": "#6b8ec9",
};

function renderSection(section: BlogSection, i: number): React.ReactNode {
  switch (section.type) {
    case "h2":
      return <h2 key={i} id={`h2-${i}`} className="article-h2">{section.text}</h2>;
    case "h3":
      return <h3 key={i} className="article-h3">{section.text}</h3>;
    case "p":
      return <p key={i} className="article-p">{section.text}</p>;
    case "ul":
      return (
        <ul key={i} className="article-ul">
          {(section.items ?? []).map((item, j) => (
            <li key={j} className="article-li">{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={i} className="article-ol">
          {(section.items ?? []).map((item, j) => (
            <li key={j} className="article-li">{item}</li>
          ))}
        </ol>
      );
    case "tip":
      return (
        <div key={i} className="article-tip">
          <div className="tip-icon">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="#2f7d5b">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          </div>
          <p>{section.text}</p>
        </div>
      );
    case "quote":
      return (
        <blockquote key={i} className="article-quote">
          <div className="quote-mark" aria-hidden="true">"</div>
          <p>{section.text}</p>
        </blockquote>
      );
    case "cta":
      return (
        <div key={i} className="article-cta">
          <div>
            <div className="article-cta-label">{section.label}</div>
            <div className="article-cta-sub">{section.text}</div>
          </div>
          <a href="/reservation" className="article-cta-btn">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
            Book Now
          </a>
        </div>
      );
    default:
      return null;
  }
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;

  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related  = getRelatedPosts(post.slug, post.category, 3);
  const catColor = CATEGORY_COLORS[post.category] ?? "#2f7d5b";

  const h2Sections = post.content
    .map((s, i) => ({ ...s, originalIndex: i }))
    .filter(s => s.type === "h2");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishDate,
    image: post.hero,
    author: { "@type": "Organization", name: "PEM Transfers", url: "https://pemtransfers.com" },
    publisher: { "@type": "Organization", name: "PEM Transfers" },
    keywords: post.keywords.join(", "),
    articleSection: post.category,
  };

  const faqJsonLd = post.faq
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faq.map(f => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --ink:          #0c0d0f;
          --ink-soft:     #13151a;
          --gold:         #2f7d5b;
          --gold-pale:    rgba(47,125,91,0.09);
          --gold-stroke:  rgba(47,125,91,0.22);
          --ivory:        #f3f7f2;
          --ivory-dim:    rgba(245,240,232,0.72);
          --ivory-faint:  rgba(245,240,232,0.38);
          --stroke:       rgba(245,240,232,0.08);
          --stroke-mid:   rgba(245,240,232,0.13);
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .post-root {
          background: var(--ink);
          color: var(--ivory);
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
        }

        .breadcrumb {
          max-width: 1100px; margin: 0 auto;
          padding: 20px 5vw 0;
          font-size: 12px; color: var(--ivory-faint);
          display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
        }
        .breadcrumb a { color: var(--ivory-faint); text-decoration: none; transition: color .2s; }
        .breadcrumb a:hover { color: var(--gold); }

        .post-hero { max-width: 1100px; margin: 0 auto; padding: 36px 5vw 0; }
        .post-cat {
          display: inline-block;
          font-size: 9.5px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase;
          padding: 4px 14px; border-radius: 100px; margin-bottom: 20px;
        }
        .post-hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(30px, 4.2vw, 58px);
          font-weight: 400; line-height: 1.05;
          margin-bottom: 18px; max-width: 820px;
        }
        .post-hero-meta {
          display: flex; align-items: center; gap: 14px;
          font-size: 12px; color: var(--ivory-faint); margin-bottom: 32px; flex-wrap: wrap;
        }
        .meta-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--ivory-faint); }

        /* ── Hero image — real photo from blogData ── */
        .post-hero-img {
          width: 100%; height: 420px;
          border-radius: 14px; overflow: hidden;
          border: 1px solid var(--stroke-mid);
          position: relative;
        }
        .post-hero-img img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
        }
        /* Subtle bottom gradient so text in the layout below reads well */
        .post-hero-img-gradient {
          position: absolute; bottom: 0; left: 0; right: 0; height: 40%;
          background: linear-gradient(to top, var(--ink) 0%, transparent 100%);
          pointer-events: none;
        }

        .post-layout {
          max-width: 1100px; margin: 0 auto;
          padding: 48px 5vw 80px;
          display: grid;
          grid-template-columns: 1fr 310px;
          gap: 56px;
          align-items: start;
        }

        .article-body { min-width: 0; }

        .article-h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(22px, 2.6vw, 32px);
          font-weight: 500; line-height: 1.15;
          color: var(--ivory); margin: 44px 0 14px;
          padding-top: 8px; border-top: 1px solid var(--stroke);
        }
        .article-h2:first-child { margin-top: 0; border-top: none; }
        .article-h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(18px, 1.8vw, 24px);
          font-weight: 500; color: var(--gold);
          margin: 26px 0 10px; line-height: 1.2;
        }
        .article-p {
          font-size: 15.5px; font-weight: 300; line-height: 1.85;
          color: var(--ivory-dim); margin-bottom: 16px;
        }

        .article-ul,
        .article-ol {
          margin: 0 0 18px 0; padding: 0; list-style: none;
          display: flex; flex-direction: column; gap: 8px;
          counter-reset: list-counter;
        }
        .article-li {
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 15px; font-weight: 300;
          color: var(--ivory-dim); line-height: 1.65;
          counter-increment: list-counter;
        }
        .article-ol .article-li::before {
          content: counter(list-counter) ".";
          color: var(--gold); font-size: 12.5px; font-weight: 600;
          flex-shrink: 0; min-width: 20px; margin-top: 3px;
        }
        .article-ul .article-li::before {
          content: '';
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--gold); flex-shrink: 0; margin-top: 9px;
        }

        .article-tip {
          display: flex; gap: 14px; align-items: flex-start;
          background: rgba(47,125,91,.07);
          border: 1px solid var(--gold-stroke);
          border-left: 3px solid var(--gold);
          border-radius: 10px; padding: 14px 18px; margin: 22px 0;
        }
        .article-tip .tip-icon { flex-shrink: 0; margin-top: 1px; }
        .article-tip p { font-size: 14px; font-weight: 300; color: var(--ivory-dim); line-height: 1.7; margin: 0; }

        .article-quote {
          position: relative;
          border-left: 2px solid var(--gold);
          padding: 18px 22px 18px 30px; margin: 28px 0;
          background: rgba(255,255,255,.03); border-radius: 0 10px 10px 0;
        }
        .quote-mark {
          position: absolute; top: -10px; left: 14px;
          font-family: 'Cormorant Garamond', serif; font-size: 68px;
          color: var(--gold); opacity: .22; line-height: 1; pointer-events: none;
        }
        .article-quote p {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px; font-style: italic; font-weight: 400;
          color: var(--ivory-dim); line-height: 1.65; margin: 0;
        }

        .article-cta {
          display: flex; align-items: center; justify-content: space-between;
          gap: 18px; flex-wrap: wrap;
          background: linear-gradient(135deg, rgba(47,125,91,.09), rgba(47,125,91,.03));
          border: 1px solid var(--gold-stroke); border-radius: 12px;
          padding: 22px 26px; margin: 28px 0;
        }
        .article-cta-label {
          font-family: 'Cormorant Garamond', serif;
          font-size: 21px; font-weight: 500; margin-bottom: 4px;
        }
        .article-cta-sub { font-size: 12px; color: var(--ivory-faint); font-weight: 300; }
        .article-cta-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--gold); color: var(--ink);
          font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
          text-decoration: none; padding: 11px 20px; border-radius: 7px;
          white-space: nowrap; flex-shrink: 0; transition: background .2s;
        }
        .article-cta-btn:hover { background: #5a9a73; }

        .faq-section { margin-top: 48px; padding-top: 36px; border-top: 1px solid var(--stroke-mid); }
        .faq-title {
          font-family: 'Cormorant Garamond', serif; font-size: 30px; font-weight: 400;
          margin-bottom: 24px; display: flex; align-items: center; gap: 14px;
        }
        .faq-title::after { content: ''; flex: 1; height: 1px; background: var(--stroke-mid); }
        .faq-item { border-bottom: 1px solid var(--stroke); padding: 18px 0; }
        .faq-q {
          font-size: 15px; font-weight: 500; color: var(--ivory); margin-bottom: 10px;
          display: flex; align-items: flex-start; gap: 12px;
        }
        .faq-q::before {
          content: 'Q';
          display: inline-flex; align-items: center; justify-content: center;
          width: 22px; height: 22px; border-radius: 50%;
          background: var(--gold-pale); border: 1px solid var(--gold-stroke);
          font-size: 9.5px; font-weight: 700; color: var(--gold);
          flex-shrink: 0; margin-top: 1px;
        }
        .faq-a {
          font-size: 14px; font-weight: 300; color: var(--ivory-faint);
          line-height: 1.75; padding-left: 34px;
        }

        .article-keywords {
          display: flex; flex-wrap: wrap; gap: 8px;
          margin-top: 44px; padding-top: 24px; border-top: 1px solid var(--stroke);
        }
        .keyword-tag {
          font-size: 10px; padding: 4px 12px; border-radius: 100px;
          border: 1px solid var(--stroke-mid); color: var(--ivory-faint); letter-spacing: .08em;
        }

        .post-sidebar {
          position: sticky; top: 100px;
          display: flex; flex-direction: column; gap: 18px;
        }
        .sidebar-card {
          background: var(--ink-soft);
          border: 1px solid var(--stroke-mid);
          border-radius: 12px; overflow: hidden;
        }
        .sidebar-card-head {
          padding: 14px 18px; border-bottom: 1px solid var(--stroke);
          font-size: 9.5px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: var(--gold);
        }

        .sidebar-book {
          padding: 20px 18px;
          background: linear-gradient(135deg, rgba(47,125,91,.08), rgba(47,125,91,.03));
          border: 1px solid var(--gold-stroke); border-radius: 12px; text-align: center;
        }
        .sidebar-book-title {
          font-family: 'Cormorant Garamond', serif; font-size: 21px; font-weight: 500; margin-bottom: 8px;
        }
        .sidebar-book-sub {
          font-size: 12px; font-weight: 300; color: var(--ivory-faint); margin-bottom: 16px; line-height: 1.6;
        }
        .sidebar-book-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: var(--gold); color: var(--ink);
          font-size: 10.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
          text-decoration: none; padding: 11px 18px; border-radius: 7px;
          transition: background .2s; margin-bottom: 14px;
        }
        .sidebar-book-btn:hover { background: #5a9a73; }
        .sidebar-trust { display: flex; flex-direction: column; gap: 7px; }
        .trust-item {
          display: flex; align-items: center; gap: 8px;
          font-size: 11px; color: var(--ivory-faint);
        }
        .trust-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); flex-shrink: 0; }

        .toc-list { padding: 10px 18px 14px; display: flex; flex-direction: column; gap: 1px; }
        .toc-item {
          display: block; font-size: 12.5px; font-weight: 300; color: var(--ivory-faint);
          text-decoration: none; padding: 6px 0; border-bottom: 1px solid var(--stroke);
          transition: color .18s; line-height: 1.4;
        }
        .toc-item:last-child { border-bottom: none; }
        .toc-item:hover { color: var(--gold); }

        /* ── Related posts — thumbnail images ── */
        .related-link {
          display: flex; gap: 12px; align-items: center;
          padding: 12px 18px; border-bottom: 1px solid var(--stroke);
          text-decoration: none; transition: background .18s;
        }
        .related-link:last-child { border-bottom: none; }
        .related-link:hover { background: rgba(255,255,255,.025); }
        .related-thumb {
          width: 52px; height: 44px; border-radius: 6px;
          overflow: hidden; flex-shrink: 0;
          background: var(--ink);
        }
        .related-thumb img {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
          transition: transform .3s ease;
        }
        .related-link:hover .related-thumb img { transform: scale(1.08); }
        .related-title {
          font-size: 12.5px; font-weight: 400; color: var(--ivory-dim);
          line-height: 1.4; transition: color .18s;
        }
        .related-link:hover .related-title { color: var(--gold); }
        .related-cat { font-size: 9px; color: var(--ivory-faint); text-transform: uppercase; letter-spacing: .1em; margin-top: 4px; }

        .wa-sidebar { padding: 18px; }
        .wa-sidebar-top { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .wa-circle {
          width: 38px; height: 38px; border-radius: 50%; background: #25D366;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .wa-sidebar-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: #25D366; color: #fff;
          font-size: 10.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
          text-decoration: none; padding: 10px 14px; border-radius: 7px; transition: background .2s;
        }
        .wa-sidebar-btn:hover { background: #1daf56; }

        @media (max-width: 900px) {
          .post-layout { grid-template-columns: 1fr; gap: 36px; padding: 28px 5vw 52px; }
          .post-sidebar { position: static; }
          .post-hero-img { height: 260px; }
        }
        @media (max-width: 600px) {
          .post-hero    { padding: 24px 20px 0; }
          .post-layout  { padding: 24px 20px 44px; }
          .breadcrumb   { padding: 14px 20px 0; }
          .article-cta  { flex-direction: column; align-items: flex-start; }
          .post-hero-img { height: 200px; }
        }
      `}</style>

      <div className="post-root">

        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span>›</span>
          <a href="/blog">Blog</a>
          <span>›</span>
          <span>{post.category}</span>
          <span>›</span>
          <span style={{ color: "var(--ivory-dim)" }}>
            {post.title.length > 42 ? `${post.title.slice(0, 42)}…` : post.title}
          </span>
        </nav>

        <div className="post-hero">
          <span
            className="post-cat"
            style={{
              background: `${catColor}15`,
              color:       catColor,
              border:     `1px solid ${catColor}35`,
            }}
          >
            {post.category}
          </span>

          <h1 className="post-hero-title">{post.title}</h1>

          <div className="post-hero-meta">
            <span>
              {new Date(post.publishDate).toLocaleDateString("en-GB", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </span>
            <div className="meta-dot" />
            <span>{post.readTime}</span>
            <div className="meta-dot" />
            <span style={{ color: catColor }}>{post.category}</span>
          </div>

          {/* ── Hero image — uses post.hero from blogData ── */}
          <div className="post-hero-img">
            <img
              src={post.hero}
              alt={post.title}
              loading="eager"
            />
            <div className="post-hero-img-gradient" />
          </div>
        </div>

        <div className="post-layout">

          <article className="article-body">
            {post.content.map((section, i) => renderSection(section, i))}

            {post.faq && post.faq.length > 0 && (
              <section className="faq-section" id="faq" itemScope itemType="https://schema.org/FAQPage">
                <h2 className="faq-title">Frequently Asked Questions</h2>
                {post.faq.map((item, i) => (
                  <div key={i} className="faq-item" itemScope itemType="https://schema.org/Question">
                    <div className="faq-q" itemProp="name">{item.q}</div>
                    <div className="faq-a" itemScope itemType="https://schema.org/Answer">
                      <span itemProp="text">{item.a}</span>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {post.keywords && post.keywords.length > 0 && (
              <div className="article-keywords">
                {post.keywords.map(kw => (
                  <span key={kw} className="keyword-tag">{kw}</span>
                ))}
              </div>
            )}
          </article>

          <aside className="post-sidebar">

            <div className="sidebar-book">
              <div className="sidebar-book-title">Book Your Transfer</div>
              <p className="sidebar-book-sub">Fixed price · Meet &amp; Greet · Free child seats · 24/7 available</p>
              <a href="/reservation" className="sidebar-book-btn">
                <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
                Book Now
              </a>
              <div className="sidebar-trust">
                {["Fixed, transparent pricing", "Flight tracking included", "Cancel for free", "Pay on arrival"].map(t => (
                  <div key={t} className="trust-item">
                    <div className="trust-dot" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {h2Sections.length > 0 && (
              <div className="sidebar-card">
                <div className="sidebar-card-head">In This Guide</div>
                <div className="toc-list">
                  {h2Sections.map((s, i) => (
                    <a key={i} href={`#h2-${i}`} className="toc-item">{s.text}</a>
                  ))}
                  {post.faq && post.faq.length > 0 && (
                    <a href="#faq" className="toc-item">Frequently Asked Questions</a>
                  )}
                </div>
              </div>
            )}

            {related.length > 0 && (
              <div className="sidebar-card">
                <div className="sidebar-card-head">Related Guides</div>
                {related.map((rp) => (
                  <Link key={rp.slug} href={`/blog/${rp.slug}`} className="related-link">
                    {/* Thumbnail image — uses related post's hero from blogData */}
                    <div className="related-thumb">
                      <img src={rp.hero} alt={rp.title} loading="lazy" />
                    </div>
                    <div>
                      <div className="related-title">{rp.title}</div>
                      <div className="related-cat">{rp.category} · {rp.readTime}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="sidebar-card">
              <div className="wa-sidebar">
                <div className="wa-sidebar-top">
                  <div className="wa-circle">
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ivory)" }}>Chat on WhatsApp</div>
                    <div style={{ fontSize: 11, color: "var(--ivory-faint)", fontWeight: 300 }}>24/7 instant reply</div>
                  </div>
                </div>
                <a
                  href="https://wa.me/94726803498"
                  target="_blank" rel="noopener noreferrer"
                  className="wa-sidebar-btn"
                >
                  +94 72 680 3498
                </a>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </>
  );
}