"use client";

import { useState, useEffect, useMemo } from "react";

/* Keep these identical to the hero component */
const CURRENCY     = "$";                          // must match the currency stored in /api/rates
const WHATSAPP_URL = "https://wa.me/94726803498";

interface Rate {
  id: string;
  fromLocId: string; toLocId: string; vehicleId: string;
  fromLocName: string; toLocName: string; vehicleName: string;
  p1: number|null; p2: number|null; p3: number|null; p4: number|null;
  p5: number|null; p6: number|null; p7: number|null; p8: number|null;
  onDemand: boolean; active: boolean;
}
interface Vehicle {
  id: string; name: string; model: string;
  maxPassengers: number; img: string; tag: string;
  active: boolean; sortOrder: number;
}
type PaxKey = "p1"|"p2"|"p3"|"p4"|"p5"|"p6"|"p7"|"p8";
type Pax = "all"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9";

const PAX_KEYS: PaxKey[] = ["p1","p2","p3","p4","p5","p6","p7","p8"];
const PAX_OPTIONS: Pax[] = ["all","1","2","3","4","5","6","7","8","9"];

interface Row {
  fromLocId: string; toLocId: string;
  fromLocName: string; toLocName: string;
  vehicleId: string; vehicleName: string; vehicleImg: string; vehicleTag: string;
  prices: Record<PaxKey, number|null>;
  p9plus: number|null; // 8-pax price × 2
  onDemand: boolean;
}

const priceFor = (r: Row, pax: Pax): number|null => {
  if (pax === "all") return null;
  if (pax === "9") return r.p9plus;
  return r.prices[`p${pax}` as PaxKey];
};

export default function RatesPage() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [veh, setVeh] = useState("all");
  const [pax, setPax] = useState<Pax>("all");
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const [rr, vr] = await Promise.all([fetch("/api/rates"), fetch("/api/vehicles")]);
        if (rr.ok) { const d: Rate[] = await rr.json(); setRates(d.filter(r => r.active)); }
        if (vr.ok) { const d: Vehicle[] = await vr.json(); setVehicles(d.filter(v => v.active).sort((a,b) => a.sortOrder - b.sortOrder)); }
      } catch { setError(true); }
      finally { setLoading(false); }
    })();
  }, []);

  const rows = useMemo<Row[]>(() => {
    const vMap = new Map(vehicles.map(v => [v.id, v]));
    return rates.map(r => {
      const v = vMap.get(r.vehicleId);
      return {
        fromLocId: r.fromLocId, toLocId: r.toLocId,
        fromLocName: r.fromLocName, toLocName: r.toLocName,
        vehicleId: r.vehicleId,
        vehicleName: v?.name ?? r.vehicleName,
        vehicleImg: v?.img ?? "/images/car.png",
        vehicleTag: v?.tag ?? "",
        prices: { p1:r.p1, p2:r.p2, p3:r.p3, p4:r.p4, p5:r.p5, p6:r.p6, p7:r.p7, p8:r.p8 },
        p9plus: r.p8 ? r.p8 * 2 : null,
        onDemand: r.onDemand,
      };
    });
  }, [rates, vehicles]);

  const groups = useMemo(() => {
    const map = new Map<string, Row[]>();
    rows.forEach(r => {
      const k = `${r.fromLocId}__${r.toLocId}`;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(r);
    });
    return Array.from(map.entries()).map(([key, items]) => ({
      key, items,
      fromLocId: items[0].fromLocId, toLocId: items[0].toLocId,
      fromLocName: items[0].fromLocName, toLocName: items[0].toLocName,
    }));
  }, [rows]);

  const fromOptions = useMemo(() =>
    Array.from(new Map(groups.map(g => [g.fromLocId, g.fromLocName])).entries()).sort((a,b) => a[1].localeCompare(b[1])), [groups]);
  const toOptions = useMemo(() =>
    Array.from(new Map(groups.map(g => [g.toLocId, g.toLocName])).entries()).sort((a,b) => a[1].localeCompare(b[1])), [groups]);

  const filtered = useMemo(() =>
    groups
      .filter(g => (!from || g.fromLocId === from) && (!to || g.toLocId === to))
      .map(g => ({
        ...g,
        items: g.items.filter(r => {
          if (veh !== "all" && r.vehicleId !== veh) return false;
          if (pax !== "all" && !r.onDemand && priceFor(r, pax) === null) return false;
          return true;
        }),
      }))
      .filter(g => g.items.length > 0),
    [groups, from, to, veh, pax]);

  const startingPrice = (items: Row[]): number|null => {
    const vals: number[] = [];
    items.forEach(r => {
      if (r.onDemand) return;
      if (pax === "all") PAX_KEYS.forEach(k => { const v = r.prices[k]; if (v !== null) vals.push(v); });
      else { const v = priceFor(r, pax); if (v !== null) vals.push(v); }
    });
    return vals.length ? Math.min(...vals) : null;
  };

  const hasFilter = from || to || veh !== "all" || pax !== "all";
  const reset = () => { setFrom(""); setTo(""); setVeh("all"); setPax("all"); };
  const toggle = (k: string) => setOpenKeys(prev => {
    const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n;
  });
  const shortName = (n: string) => n.split("(")[0].trim();

  const assurances = [
    "Fixed prices, no hidden fees",
    "Pay the driver",
    "Available 24 / 7",
    "Child seats included free",
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap');

        .rt {
          --h-ink:#173b32; --h-ink-soft:rgba(23,59,50,.80); --h-ink-faint:rgba(23,59,50,.66);
          --h-teal:#2f7d5b; --h-teal-deep:#173b32; --h-sun:#2f7d5b; --h-sun-deep:#245e46;
          --h-field-line:#d3dde0; --h-ease:cubic-bezier(.25,.1,.25,1);
          font-family:'Figtree',system-ui,sans-serif; color:var(--h-ink); min-height:100vh; overflow-x:clip;
          background:
            radial-gradient(60% 34% at 92% 6%, rgba(47,125,91,.26), transparent 70%),
            radial-gradient(65% 40% at 4% 38%, rgba(47,125,91,.18), transparent 70%),
            radial-gradient(60% 34% at 92% 88%, rgba(47,125,91,.20), transparent 70%),
            #f3f7f2;
        }
        .rt *, .rt *::before, .rt *::after { box-sizing:border-box; margin:0; padding:0; }
        .rt button, .rt select { font-family:inherit; }
        .rt :focus-visible { outline:3px solid var(--h-teal); outline-offset:2px; }
        .rt-wrap { max-width:1120px; margin:0 auto; padding:0 4vw; }

        /* shared glass recipe */
        .glass {
          background:linear-gradient(135deg, rgba(255,255,255,.80), rgba(255,255,255,.62));
          -webkit-backdrop-filter:blur(22px) saturate(170%); backdrop-filter:blur(22px) saturate(170%);
          border:1px solid rgba(255,255,255,.7);
          box-shadow:0 24px 54px rgba(16,44,37,.16), 0 4px 12px rgba(16,44,37,.08), inset 0 1.5px 0 rgba(255,255,255,.85);
        }

        /* ══ Intro ══ */
        .rt-intro { padding:40px 0 26px; animation:rt-rise .8s var(--h-ease) both; }
        @keyframes rt-rise { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
        .rt-kicker { display:inline-block; font-size:13.5px; font-weight:600; color:var(--h-teal-deep); border-radius:100px; padding:5px 14px; margin-bottom:16px;
          background:linear-gradient(135deg, rgba(255,255,255,.62), rgba(255,255,255,.30));
          -webkit-backdrop-filter:blur(14px) saturate(180%); backdrop-filter:blur(14px) saturate(180%);
          border:1px solid rgba(255,255,255,.7);
          box-shadow:0 6px 18px rgba(23,59,50,.12), inset 0 1.5px 0 rgba(255,255,255,.85); }
        .rt-h1 { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(32px,5vw,62px); font-weight:800; line-height:1.04; letter-spacing:-.02em; margin-bottom:10px; }
        .rt-h1-sub { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(17px,2.2vw,26px); font-weight:600; line-height:1.2; color:var(--h-teal); margin-bottom:14px; }
        .rt-desc { font-size:16px; font-weight:500; line-height:1.55; color:var(--h-ink-soft); max-width:560px; }
        .rt-assure { list-style:none; display:flex; flex-wrap:wrap; gap:12px 26px; margin-top:22px; }
        .rt-assure li { display:flex; align-items:center; gap:10px; font-size:13px; font-weight:600; }
        .rt-ico { flex-shrink:0; width:30px; height:30px; border-radius:50%; color:var(--h-teal-deep); display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;
          background:linear-gradient(145deg, rgba(255,255,255,.75), rgba(255,255,255,.35));
          border:1px solid rgba(255,255,255,.7); box-shadow:0 5px 14px rgba(23,59,50,.14), inset 0 1.5px 0 rgba(255,255,255,.9); }
        .rt-ico::before { content:""; position:absolute; left:10%; right:10%; top:3%; height:46%; border-radius:50%; background:linear-gradient(180deg, rgba(255,255,255,.65), rgba(255,255,255,0)); }
        .rt-ico svg { position:relative; width:14px; height:14px; }

        /* ══ Filter card ══ */
        .rt-filters { position:relative; overflow:hidden; border-radius:24px; padding:22px 20px 18px; margin-bottom:34px; animation:rt-rise .8s .12s var(--h-ease) both; }
        .rt-filters::before { content:""; position:absolute; left:0; right:0; top:0; height:4px; background:linear-gradient(90deg, var(--h-teal-deep), var(--h-teal) 55%, var(--h-sun)); }
        .rt-fhead { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:12px; }
        .rt-ftitle { font-family:'Bricolage Grotesque',sans-serif; font-size:18px; font-weight:700; }
        .rt-reset { background:none; border:none; cursor:pointer; font-size:13px; font-weight:700; color:var(--h-teal-deep); text-decoration:underline; text-underline-offset:4px; padding:4px; }
        .rt-reset:hover { color:var(--h-teal); }
        .rt-fgrid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
        .rt-field { display:flex; flex-direction:column; gap:1px; padding:6px 12px 7px; border-radius:14px; cursor:pointer; min-width:0;
          background:rgba(255,255,255,.78); border:1px solid rgba(255,255,255,.85);
          box-shadow:0 1px 3px rgba(23,59,50,.08), inset 0 1px 0 rgba(255,255,255,.9); transition:border-color .2s, box-shadow .2s, background .2s; }
        .rt-field:hover { background:rgba(255,255,255,.92); }
        .rt-field:focus-within { border-color:var(--h-teal); box-shadow:0 0 0 3px rgba(47,125,91,.18); }
        .rt-flabel { font-size:11.5px; font-weight:600; color:var(--h-ink-faint); }
        .rt-select { width:100%; appearance:none; -webkit-appearance:none; background:transparent; border:none; outline:none; cursor:pointer;
          font-size:14.5px; font-weight:600; color:var(--h-ink); padding:2px 22px 0 0; text-overflow:ellipsis; color-scheme:light;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%230b6b5a' stroke-width='2.4'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat:no-repeat; background-position:right 2px center; }
        .rt-select option { background:#fff; color:var(--h-ink); }

        .rt-paxrow { display:flex; align-items:center; gap:14px; margin-top:14px; flex-wrap:wrap; }
        .rt-paxlbl { font-size:12.5px; font-weight:600; color:var(--h-ink-faint); }
        .rt-seg { display:inline-flex; flex-wrap:wrap; gap:3px; padding:3px; border-radius:100px; background:#e8f1e8; box-shadow:inset 0 1px 2px rgba(23,59,50,.14); }
        .rt-seg button { border:none; background:transparent; cursor:pointer; min-width:38px; padding:7px 13px; border-radius:100px; font-size:13px; font-weight:700; color:var(--h-ink-soft); transition:background .25s, color .2s, box-shadow .25s; }
        .rt-seg button:hover { color:var(--h-teal-deep); }
        .rt-seg button[aria-pressed="true"] { background:var(--h-teal-deep); color:#fff; box-shadow:0 2px 8px rgba(23,59,50,.35); }

        /* ══ Results ══ */
        .rt-summary { display:flex; justify-content:space-between; align-items:baseline; flex-wrap:wrap; gap:6px 20px; margin-bottom:14px; padding:0 6px; }
        .rt-count { font-size:14px; font-weight:500; color:var(--h-ink-soft); }
        .rt-count b { color:var(--h-ink); font-weight:700; }
        .rt-note { font-size:13px; font-weight:600; color:var(--h-teal-deep); }

        .rt-list { display:flex; flex-direction:column; gap:12px; }
        .rt-route { border-radius:20px; overflow:hidden; transition:box-shadow .25s; }
        .rt-route.open { box-shadow:0 30px 64px rgba(16,44,37,.2), 0 4px 12px rgba(16,44,37,.08), inset 0 1.5px 0 rgba(255,255,255,.85); }
        .rt-rhead { width:100%; display:grid; grid-template-columns:1fr auto 28px; align-items:center; gap:18px; background:none; border:none; color:inherit; text-align:left; cursor:pointer; padding:18px 20px; }
        .rt-rhead:hover .rt-chev { background:var(--h-teal-deep); color:#fff; border-color:var(--h-teal-deep); }
        .rt-path { display:flex; align-items:center; flex-wrap:wrap; gap:4px 12px; min-width:0; }
        .rt-from { font-size:13.5px; font-weight:700; color:var(--h-teal); }
        .rt-sep { color:var(--h-ink-faint); font-size:15px; }
        .rt-to { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(18px,2.2vw,24px); font-weight:700; letter-spacing:-.01em; line-height:1.2; }
        .rt-fare { display:flex; align-items:baseline; gap:8px; padding:7px 14px; border-radius:14px; white-space:nowrap;
          background:rgba(255,244,214,.78); border:1px solid rgba(240,217,154,.9); }
        .rt-fare small { font-size:12px; font-weight:600; color:var(--h-ink-faint); }
        .rt-amt { font-family:'Bricolage Grotesque',sans-serif; font-size:24px; font-weight:800; letter-spacing:-.02em; line-height:1; color:var(--h-teal-deep); font-variant-numeric:tabular-nums; }
        .rt-amt sup { font-size:.5em; font-weight:700; margin-right:2px; vertical-align:top; position:relative; top:.15em; }
        .rt-fare.req { background:rgba(255,255,255,.7); border-color:var(--h-field-line); }
        .rt-chev { width:28px; height:28px; padding:6px; border-radius:50%; color:var(--h-teal-deep); background:#f3f7f2; border:1px solid var(--h-field-line); transition:transform .3s, background .2s, color .2s, border-color .2s; }
        .rt-chev.open { transform:rotate(180deg); }

        .rt-tablewrap { overflow-x:auto; margin:0 14px 16px; border-radius:16px; background:rgba(255,255,255,.72); border:1px solid rgba(255,255,255,.85); box-shadow:inset 0 1px 3px rgba(23,59,50,.06); }
        .rt-table { width:100%; border-collapse:separate; border-spacing:0; min-width:700px; }
        .rt-table th { font-size:12px; font-weight:700; color:var(--h-ink-faint); text-align:center; padding:12px 10px; white-space:nowrap; background:rgba(47,125,91,.07); border-bottom:1px solid var(--h-field-line); }
        .rt-table th:first-child, .rt-table td:first-child { text-align:left; position:sticky; left:0; z-index:1; min-width:230px; padding-left:16px; }
        .rt-table th:first-child { background:#f3f7f2; }
        .rt-table td:first-child { background:#f3f7f2; }
        .rt-table td { padding:12px 10px; text-align:center; border-bottom:1px solid rgba(23,59,50,.07); font-variant-numeric:tabular-nums; }
        .rt-table tbody tr:last-child td { border-bottom:none; }
        .rt-table tbody tr:hover td { background:rgba(255,244,214,.45); }
        .rt-table tbody tr:hover td:first-child { background:#e8f1e8; }
        .rt-table .nine { border-left:2px solid rgba(47,125,91,.55); }
        .rt-v { display:flex; align-items:center; gap:12px; }
        .rt-vimg { width:64px; height:42px; object-fit:cover; border-radius:10px; background:#e8f1e8; flex-shrink:0; box-shadow:0 2px 6px rgba(23,59,50,.14); }
        .rt-vname { font-size:14px; font-weight:700; }
        .rt-vtag { display:inline-block; margin-top:3px; font-size:11.5px; font-weight:600; color:var(--h-teal-deep); background:rgba(47,125,91,.1); border-radius:100px; padding:1px 9px; }
        .rt-price { font-family:'Bricolage Grotesque',sans-serif; font-size:16.5px; font-weight:700; color:var(--h-ink); }
        .rt-price.big { font-size:24px; font-weight:800; letter-spacing:-.02em; color:var(--h-teal-deep); }
        .rt-na { color:rgba(23,59,50,.25); }
        .rt-demand { font-size:13px; font-weight:600; color:var(--h-ink-faint); }

        .rt-foot { margin-top:22px; padding:0 6px; font-size:13px; line-height:1.65; font-weight:500; color:var(--h-ink-faint); max-width:70ch; }

        .rt-state { border-radius:24px; padding:64px 20px; text-align:center; font-family:'Bricolage Grotesque',sans-serif; font-size:22px; font-weight:700; }
        .rt-state p { font-family:'Figtree',sans-serif; font-size:14.5px; font-weight:500; color:var(--h-ink-soft); margin:8px 0 20px; }
        .rt-state button { height:46px; padding:0 26px; border:none; border-radius:14px; cursor:pointer; font-size:14.5px; font-weight:700; color:#fff;
          background:linear-gradient(180deg,#c2410c,#9a3412); box-shadow:0 8px 18px rgba(194,65,12,.38), inset 0 1px 0 rgba(255,255,255,.3); transition:transform .2s, background .2s; }
        .rt-state button:hover { transform:translateY(-2px); background:linear-gradient(180deg,#9a3412,#7c2d12); }
        .rt-bar { height:4px; width:120px; margin:0 auto 20px; border-radius:4px; background:linear-gradient(90deg, var(--h-teal-deep), var(--h-teal), var(--h-sun), var(--h-teal));
          background-size:200% 100%; animation:rt-slide 1.4s linear infinite; }
        @keyframes rt-slide { from{background-position:200% 0} to{background-position:-200% 0} }

        /* ══ CTA ══ */
        .rt-cta { padding:56px 0 64px; }
        .rt-ctacard { position:relative; overflow:hidden; border-radius:24px; padding:34px 32px; color:#fff;
          background:radial-gradient(60% 120% at 100% 0%, rgba(47,125,91,.34), transparent 65%), linear-gradient(135deg, var(--h-teal-deep), var(--h-teal));
          box-shadow:0 34px 70px rgba(23,59,50,.35), 0 6px 16px rgba(16,44,37,.12);
          display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:22px; }
        .rt-ctacard h2 { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(22px,3vw,32px); font-weight:800; letter-spacing:-.02em; margin-bottom:6px; }
        .rt-ctacard p { font-size:15px; font-weight:500; color:rgba(255,255,255,.86); }
        .rt-btns { display:flex; gap:10px; flex-wrap:wrap; }
        .rt-btn { height:46px; padding:0 26px; border-radius:14px; display:inline-flex; align-items:center; justify-content:center; font-size:14.5px; font-weight:700; text-decoration:none; transition:transform .2s, background .2s; }
        .rt-btn:hover { transform:translateY(-2px); }
        .rt-btn.p { background:linear-gradient(180deg,#c2410c,#9a3412); color:#fff; box-shadow:0 8px 18px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.3); }
        .rt-btn.g { color:#fff; background:linear-gradient(135deg, rgba(255,255,255,.28), rgba(255,255,255,.08)); border:1px solid rgba(255,255,255,.5); box-shadow:inset 0 1.5px 0 rgba(255,255,255,.5); }
        .rt-btn.g:hover { background:rgba(255,255,255,.28); }

        @media (max-width:900px) { .rt-fgrid { grid-template-columns:1fr 1fr; } }
        @media (max-width:640px) {
          .rt-intro { padding:24px 0 20px; }
          .rt-assure { flex-direction:column; gap:10px; }
          .rt-fgrid { grid-template-columns:1fr; }
          .rt-field { padding:9px 12px; }
          .rt-select { font-size:16px; }
          .rt-seg button { padding:9px 12px; }
          .rt-rhead { grid-template-columns:1fr 28px; gap:10px 12px; padding:16px 14px; }
          .rt-fare { grid-column:1; grid-row:2; justify-self:start; }
          .rt-chev { grid-column:2; grid-row:1; }
          .rt-tablewrap { margin:0 10px 12px; }
          .rt-ctacard { padding:26px 20px; }
          .rt-btns, .rt-btn { width:100%; }
        }
        @supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))) { .glass { background:#fff; } }
        @media (prefers-reduced-transparency:reduce) { .glass { background:#fff; -webkit-backdrop-filter:none; backdrop-filter:none; } }
        @media (prefers-reduced-motion:reduce) { .rt *, .rt *::before { animation:none !important; transition:none !important; } }
      `}</style>

      <div className="rt">
        <div className="rt-wrap">

          {/* Intro */}
          <header className="rt-intro">
            <p className="rt-kicker">Fixed fares · Private transfers</p>
            <h1 className="rt-h1">Transfer rates</h1>
            <h2 className="rt-h1-sub">One price per vehicle, whatever the group size</h2>
            <p className="rt-desc">
              Choose your route and number of passengers to see exactly what you will pay. Prices are per vehicle, not per person.
            </p>
            <ul className="rt-assure">
              {assurances.map(t => (
                <li key={t}>
                  <span className="rt-ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </header>

          {/* Filters */}
          <section className="rt-filters glass" aria-labelledby="rt-ftitle">
            <div className="rt-fhead">
              <h2 id="rt-ftitle" className="rt-ftitle">Find your route</h2>
              {hasFilter && <button type="button" className="rt-reset" onClick={reset}>Clear filters</button>}
            </div>

            <div className="rt-fgrid">
              <label className="rt-field" htmlFor="rt-from">
                <span className="rt-flabel">Pick-up</span>
                <select id="rt-from" className="rt-select" value={from} onChange={e => setFrom(e.target.value)}>
                  <option value="">All pick-up points</option>
                  {fromOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                </select>
              </label>
              <label className="rt-field" htmlFor="rt-to">
                <span className="rt-flabel">Drop-off</span>
                <select id="rt-to" className="rt-select" value={to} onChange={e => setTo(e.target.value)}>
                  <option value="">All destinations</option>
                  {toOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                </select>
              </label>
              <label className="rt-field" htmlFor="rt-veh">
                <span className="rt-flabel">Vehicle</span>
                <select id="rt-veh" className="rt-select" value={veh} onChange={e => setVeh(e.target.value)}>
                  <option value="all">All vehicles</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </label>
            </div>

            <div className="rt-paxrow">
              <span className="rt-paxlbl" id="rt-pax-lbl">Passengers</span>
              <div className="rt-seg" role="group" aria-labelledby="rt-pax-lbl">
                {PAX_OPTIONS.map(p => (
                  <button key={p} type="button" aria-pressed={pax === p} onClick={() => setPax(p)}>
                    {p === "all" ? "All" : p === "9" ? "9+" : p}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Results */}
          <main>
            {loading ? (
              <div className="rt-state glass"><div className="rt-bar" />Loading rates</div>
            ) : error ? (
              <div className="rt-state glass">
                Rates could not be loaded
                <p>Check your connection and try again.</p>
                <button type="button" onClick={() => window.location.reload()}>Reload page</button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rt-state glass">
                No routes match your selection
                <p>Try a different vehicle or passenger count.</p>
                <button type="button" onClick={reset}>Clear filters</button>
              </div>
            ) : (
              <>
                <div className="rt-summary">
                  <div className="rt-count" aria-live="polite">
                    <b>{filtered.length}</b> of {groups.length} routes
                    {pax !== "all" && <> for {pax === "9" ? "9 or more" : pax} passenger{pax === "1" ? "" : "s"}</>}
                  </div>
                  {pax === "9" && <div className="rt-note">Groups of 9 or more are priced at twice the 8-passenger rate.</div>}
                </div>

                <div className="rt-list">
                  {filtered.map(g => {
                    const isOpen = openKeys.has(g.key) || filtered.length === 1;
                    const start = startingPrice(g.items);
                    const showAll = pax === "all";
                    return (
                      <article key={g.key} className={`rt-route glass${isOpen ? " open" : ""}`}>
                        <button type="button" className="rt-rhead" aria-expanded={isOpen} onClick={() => toggle(g.key)}>
                          <div className="rt-path">
                            <span className="rt-from">{shortName(g.fromLocName)}</span>
                            <span className="rt-sep" aria-hidden="true">→</span>
                            <span className="rt-to">{g.toLocName}</span>
                          </div>
                          {start !== null ? (
                            <div className="rt-fare">
                              <small>{pax === "all" ? "From" : "Price from"}</small>
                              <span className="rt-amt"><sup>{CURRENCY}</sup>{start.toLocaleString()}</span>
                            </div>
                          ) : (
                            <div className="rt-fare req"><small>Price on request</small></div>
                          )}
                          <svg className={`rt-chev${isOpen ? " open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                          </svg>
                        </button>

                        {isOpen && (
                          <div className="rt-tablewrap">
                            <table className="rt-table" style={showAll ? undefined : { minWidth: 0 }}>
                              <thead>
                                <tr>
                                  <th scope="col">Vehicle</th>
                                  {showAll ? (
                                    <>
                                      {PAX_KEYS.map((k, i) => <th key={k} scope="col">{i + 1} pax</th>)}
                                      <th scope="col" className="nine">9+ pax</th>
                                    </>
                                  ) : (
                                    <th scope="col">{pax === "9" ? "9+ passengers" : `${pax} passenger${pax === "1" ? "" : "s"}`}</th>
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {g.items.map(r => (
                                  <tr key={r.vehicleId}>
                                    <td>
                                      <div className="rt-v">
                                        <img src={r.vehicleImg} alt="" className="rt-vimg"
                                          onError={e => { (e.currentTarget as HTMLImageElement).src = "/images/car.png"; }} />
                                        <div>
                                          <div className="rt-vname">{r.vehicleName}</div>
                                          {r.vehicleTag && <span className="rt-vtag">{r.vehicleTag}</span>}
                                        </div>
                                      </div>
                                    </td>
                                    {r.onDemand ? (
                                      <td colSpan={showAll ? 9 : 1}><span className="rt-demand">On demand — contact us for a quote</span></td>
                                    ) : showAll ? (
                                      <>
                                        {PAX_KEYS.map(k => (
                                          <td key={k}>
                                            {r.prices[k] !== null
                                              ? <span className="rt-price">{CURRENCY}{r.prices[k]}</span>
                                              : <span className="rt-na">–</span>}
                                          </td>
                                        ))}
                                        <td className="nine">
                                          {r.p9plus !== null
                                            ? <span className="rt-price">{CURRENCY}{r.p9plus}</span>
                                            : <span className="rt-na">–</span>}
                                        </td>
                                      </>
                                    ) : (
                                      <td>
                                        {priceFor(r, pax) !== null
                                          ? <span className="rt-price big">{CURRENCY}{priceFor(r, pax)}</span>
                                          : <span className="rt-na">–</span>}
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>

                <p className="rt-foot">
                  Prices are per vehicle, not per person. Groups of 9 or more are priced at twice the 8-passenger rate.
                  For routes marked on demand, message us and we will confirm a fixed price.
                </p>
              </>
            )}
          </main>

          {/* CTA */}
          <section className="rt-cta">
            <div className="rt-ctacard">
              <div>
                <h2>Ready to book your transfer?</h2>
                <p>Reserve online in two minutes, or message us for a custom route.</p>
              </div>
              <div className="rt-btns">
                <a href="/reservation" className="rt-btn p">Book now</a>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="rt-btn g">WhatsApp us</a>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}