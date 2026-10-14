"use client";
// app/admin/Dashboard.tsx

import { useState, useEffect, useRef } from "react";
import RatesTab from "./RatesTab";
import CalendarTab from "./CalendarTab";
import EventsTab from "./EventsTab";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Category { id:string; name:string; icon:string; sortOrder:number; active:boolean; }
interface Location { id:string; name:string; categoryId:string|null; categoryName:string; categoryIcon:string; active:boolean; }
interface Vehicle  { id:string; name:string; model:string; maxPassengers:number; maxLuggage:number; img:string; price:number; tag:string; special:string; active:boolean; sortOrder:number; }
interface Feature  { id:string; text:string; active:boolean; sort_order:number; }
interface PromoCode {
  id:string; code:string; description:string; discountAmount:number; validFrom:string; validUntil:string; active:boolean;
}
interface Rate     {
  id:string; fromLocId:string; toLocId:string; vehicleId:string;
  fromLocName:string; toLocName:string; vehicleName:string;
  p1:number|null; p2:number|null; p3:number|null; p4:number|null;
  p5:number|null; p6:number|null; p7:number|null; p8:number|null;
  onDemand:boolean; active:boolean;
}
interface Booking  {
  id:string; from:string; to:string; fromLocId?:string; toLocId?:string;
  date:string; time:string; passengers:number; kids:number; bags:number;
  vehicleId:string; name:string; country:string; whatsapp:string;
  email:string; notes:string; status:"new"|"confirmed"|"cancelled"; createdAt:string;
}

// ─── Price calculator (matches reservation page) ──────────────
const calcPrice = (rate: Rate, pax: number): number | null => {
  if (rate.onDemand) return null;
  if (pax >= 9) return rate.p8 ? rate.p8 * 2 : null;
  const map: Record<number, number|null> = {
    1:rate.p1, 2:rate.p2, 3:rate.p3, 4:rate.p4,
    5:rate.p5, 6:rate.p6, 7:rate.p7, 8:rate.p8,
  };
  return map[pax] ?? null;
};

// ─── Parse booking notes for structured fields ────────────────
function parseNotes(notes: string) {
  const parts = notes.split("|").map(s => s.trim()).filter(Boolean);
  let isRoundTrip = false;
  let flightTrain = "";
  let address     = "";
  const freeText: string[] = [];

  parts.forEach(p => {
    if (p === "ROUND TRIP")             isRoundTrip = true;
    else if (p.startsWith("Flight/Train: ")) flightTrain = p.replace("Flight/Train: ", "");
    else if (p.startsWith("Address: "))     address     = p.replace("Address: ", "");
    else                                    freeText.push(p);
  });

  return { isRoundTrip, flightTrain, address, freeText: freeText.join(" | ") };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

const api = async (url: string, method = "GET", body?: unknown) => {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// ─── Reusable UI atoms ───────────────────────────────────────────────────────
const IS: React.CSSProperties = {
  width:"100%", border:"1.5px solid #e5e7eb", borderRadius:8,
  padding:"10px 12px", fontSize:13, color:"#111827",
  outline:"none", fontFamily:"inherit", background:"#fff",
  boxSizing:"border-box" as const,
};
const LS: React.CSSProperties = {
  fontSize:11, fontWeight:600, color:"#374151", marginBottom:4,
  display:"block", letterSpacing:"0.05em", textTransform:"uppercase" as const,
};

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <label style={{ position:"relative", display:"inline-block", width:40, height:22, cursor:"pointer", flexShrink:0 }}>
      <input type="checkbox" checked={on} onChange={onChange} style={{ opacity:0, width:0, height:0 }} />
      <span style={{ position:"absolute", inset:0, background:on ? "#16a34a" : "#d1d5db", borderRadius:22, transition:".2s" }}>
        <span style={{ position:"absolute", width:16, height:16, left:on ? 21 : 3, bottom:3, background:"#fff", borderRadius:"50%", transition:".2s" }} />
      </span>
    </label>
  );
}

function Chip({ color, children }: { color: string; children: React.ReactNode }) {
  const map: Record<string, string[]> = {
    green: ["#dcfce7","#16a34a"], red:  ["#fee2e2","#dc2626"],
    amber: ["#ffedd5","#f97316"], blue: ["#dbeafe","#2563eb"],
    purple:["#ede9fe","#7c3aed"], gray: ["#f3f4f6","#6b7280"],
    orange:["#fff7ed","#ea580c"],
  };
  const [bg, c] = map[color] ?? map.gray;
  return <span style={{ background:bg, color:c, fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:999, whiteSpace:"nowrap" }}>{children}</span>;
}

function Modal({ title, width = 540, onClose, children }: { title:string; width?:number; onClose:()=>void; children:React.ReactNode }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.55)", backdropFilter:"blur(4px)" }} onClick={onClose} />
      <div style={{ position:"relative", background:"#fff", borderRadius:16, width:"100%", maxWidth:width, maxHeight:"92vh", overflow:"auto", boxShadow:"0 24px 80px rgba(0,0,0,.2)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 24px", borderBottom:"1px solid #f0f0f0", position:"sticky", top:0, background:"#fff", zIndex:1 }}>
          <h3 style={{ fontSize:16, fontWeight:700, color:"#111827", margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#9ca3af", lineHeight:1 }}>×</button>
        </div>
        <div style={{ padding:24 }}>{children}</div>
      </div>
    </div>
  );
}

function Toast({ msg, type }: { msg:string; type:"success"|"error" }) {
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:99999, background:type==="success" ? "#16a34a" : "#dc2626", color:"#fff", padding:"12px 20px", borderRadius:10, fontWeight:600, fontSize:14, boxShadow:"0 8px 24px rgba(0,0,0,.2)", animation:"toastIn .3s ease" }}>
      {type==="success" ? "✓" : "✗"} {msg}
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
type Tab = "overview"|"bookings"|"calendar"|"categories"|"locations"|"vehicles"|"features"|"rates"|"events"|"promo-codes"|"settings";

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab]               = useState<Tab>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast]           = useState<{ msg:string; type:"success"|"error" } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations,  setLocations]  = useState<Location[]>([]);
  const [vehicles,   setVehicles]   = useState<Vehicle[]>([]);
  const [features,   setFeatures]   = useState<Feature[]>([]);
  const [promoCodes, setPromoCodes]  = useState<PromoCode[]>([]);
  const [rates,      setRates]      = useState<Rate[]>([]);
  const [bookings,   setBookings]   = useState<Booking[]>([]);
  const [loaded,     setLoaded]     = useState(false);

  const showToast = (msg: string, type: "success"|"error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    Promise.all([
      api("/api/location-categories"),
      api("/api/locations"),
      api("/api/vehicles"),
      api("/api/features"),
      api("/api/promo-codes"),
      api("/api/rates"),
      api("/api/bookings"),
    ]).then(([cats, locs, vehs, feats, promos, rts, books]) => {
      setCategories(cats); setLocations(locs); setVehicles(vehs);
      setFeatures(feats); setPromoCodes(promos); setRates(rts); setBookings(books);
      setLoaded(true);
    }).catch(() => { showToast("Failed to load data from database", "error"); setLoaded(true); });
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileNavOpen]);

  const NAV: { id: Tab; label: string; icon: string }[] = [
    { id:"overview",   label:"Overview",    icon:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id:"bookings",   label:"Bookings",    icon:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { id:"calendar",   label:"Calendar",    icon:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { id:"categories", label:"Categories",  icon:"M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
    { id:"locations",  label:"Locations",   icon:"M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" },
    { id:"vehicles",   label:"Vehicles",    icon:"M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1" },
    { id:"features",   label:"Features",    icon:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id:"rates",      label:"Rates",       icon:"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    // { id:"events",     label:"Events",      icon:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { id:"promo-codes", label:"Promo Codes", icon:"M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
    { id:"settings",   label:"Settings",    icon:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  ];

  const newCount = bookings.filter(b => b.status === "new").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        .db,.db *,.db *::before,.db *::after{box-sizing:border-box}
        body{font-family:'Sora',sans-serif;background:#f5f7fa;color:#18324b}
        .db{--db-ink:#18324b;--db-blue:#356b9a;--db-orange:#f97316;--db-surface:#fff;--db-line:#e7edf3;display:flex;min-height:100vh;background:#f5f7fa;color:var(--db-ink)}
        .db-side{width:258px;min-width:258px;background:linear-gradient(180deg,#18324b,#14283c);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto;flex-shrink:0;padding:20px 12px 14px}
        .db-brand{display:flex;align-items:center;gap:12px;padding:3px 10px 22px;margin-bottom:16px;border-bottom:1px solid rgba(255,255,255,.12)}
        .db-brand-mark{width:40px;height:40px;border-radius:13px;display:grid;place-items:center;background:#f97316;color:#18324b;font-weight:900;font-size:18px;box-shadow:0 8px 20px rgba(249,115,22,.22)}
        .db-brand-title{color:#fff;font-weight:700;font-size:13px;letter-spacing:-.02em}
        .db-brand-sub{color:rgba(255,255,255,.46);font-size:10px;margin-top:3px;letter-spacing:.08em;text-transform:uppercase}
        .db-side-label{font-size:9px;font-weight:700;color:rgba(255,255,255,.38);letter-spacing:.14em;text-transform:uppercase;padding:0 12px 8px}
        .db-main{flex:1;min-width:0;display:flex;flex-direction:column}
        .db-topbar{background:rgba(255,255,255,.94);border-bottom:1px solid #e7edf3;padding:0 32px;height:76px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;backdrop-filter:blur(14px)}
        .db-topbar-title{font-size:18px;font-weight:700;color:#18324b;letter-spacing:-.03em}
        .db-topbar-sub{font-size:11px;color:#64748b;margin-top:4px}
        .db-body{flex:1;padding:30px 34px;overflow-y:auto;max-width:1600px;width:100%;margin:0 auto}
        .db-content-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin:0 0 24px}
        .db-eyebrow{font-size:10px;letter-spacing:.13em;text-transform:uppercase;color:#64748b;font-weight:700;margin-bottom:7px}
        .db-page-title{font-size:24px;line-height:1.2;letter-spacing:-.04em;color:#18324b;font-weight:750}
        .db-page-note{font-size:12px;color:#64748b;margin-top:6px}
        .db-quick-actions{display:flex;gap:10px;flex-wrap:wrap}
        .db-quick-action{border:1px solid #e7edf3;background:#fff;color:#18324b;border-radius:12px;padding:12px 15px;font:600 11px 'Sora',sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(24,50,75,.035);transition:all .15s}
        .db-quick-action:hover{border-color:#fed7aa;background:#fff7ed;transform:translateY(-1px)}
        .db-overview-grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important}
        .db-stat-card{border-color:#e7edf3!important;border-radius:15px!important;box-shadow:0 4px 16px rgba(24,50,75,.035)}
        .db-mobile-menu,.db-backdrop{display:none}
        .ni{display:flex;align-items:center;gap:12px;padding:11px 12px;margin:3px 0;border-radius:10px;font-size:12px;font-weight:500;cursor:pointer;transition:all .18s;color:rgba(255,255,255,.68);width:100%;border:0;background:transparent;text-align:left;font-family:inherit}
        .ni:hover{background:rgba(255,255,255,.08);color:#fff}
        .ni.on{background:rgba(249,115,22,.16);color:#ffad75;box-shadow:inset 3px 0 #f97316}
        .ni svg{width:17px;height:17px;flex-shrink:0}
        .ni-count{margin-left:auto;background:#f97316;color:#18324b;font-size:10px;font-weight:800;padding:2px 7px;border-radius:999px}
        .db-user{display:flex;align-items:center;gap:10px}
        .db-user-name{font-size:12px;color:#475569;font-weight:600}
        .db-avatar{width:36px;height:36px;border-radius:12px;background:#fff0e5;color:#c2410c;display:grid;place-items:center;font-size:13px;font-weight:800;border:1px solid #fed7aa}
        .card{background:#fff;border:1px solid #e7edf3;border-radius:16px;overflow:hidden;box-shadow:0 4px 18px rgba(24,50,75,.035)}
        .card-hdr{padding:16px 20px;border-bottom:1px solid #edf1f5;display:flex;align-items:center;justify-content:space-between}
        .t{width:100%;border-collapse:collapse;font-size:12px}
        .t th{background:#f5f7fa;padding:11px 13px;text-align:left;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#64748b;border-bottom:1px solid #e7edf3;white-space:nowrap}
        .t td{padding:12px 13px;border-bottom:1px solid #f0f3f7;vertical-align:middle;color:#475569}
        .t tr:last-child td{border-bottom:none}
        .t tr:hover td{background:#f8fafc}
        .btn{display:inline-flex;align-items:center;gap:7px;padding:9px 14px;border-radius:9px;font-size:11px;font-weight:650;cursor:pointer;border:none;font-family:'Sora',sans-serif;transition:all .15s;white-space:nowrap}
        .b-dark{background:#18324b;color:#fff}.b-dark:hover{background:#284761}
        .b-gold{background:#f97316;color:#18324b}.b-gold:hover{background:#fb923c}
        .b-ghost{background:#f1f5f9;color:#475569}.b-ghost:hover{background:#e7edf3}
        .b-red{background:#fee2e2;color:#dc2626}.b-red:hover{background:#fecaca}
        .b-blue{background:#e7f0f8;color:#356b9a}.b-blue:hover{background:#d7e6f2}
        .b-sm{padding:5px 9px;font-size:10px;border-radius:7px}
        .fg{display:flex;flex-direction:column;gap:4px;margin-bottom:12px}
        .fg2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .db input:focus,.db select:focus,.db textarea:focus{border-color:#f97316!important;box-shadow:0 0 0 3px rgba(249,115,22,.12)!important;outline:none!important}
        @keyframes toastIn{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes backupSpin{to{transform:rotate(360deg)}}
        @keyframes backupFadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:1024px){.db-side{width:230px;min-width:230px}.db-body{padding:24px}}
        @media(max-width:760px){
          .db-side{position:fixed;z-index:1002;left:0;top:0;bottom:0;height:100dvh;width:min(290px,86vw);min-width:0;transform:translateX(-105%);transition:transform .22s ease;box-shadow:18px 0 50px rgba(16,36,55,.2)}
          .db-side.open{transform:translateX(0)}
          .db-backdrop.open{display:block;position:fixed;inset:0;background:rgba(15,32,49,.42);z-index:1001}
          .db-mobile-menu{display:grid;place-items:center;width:40px;height:40px;border:1px solid #e7edf3;border-radius:11px;background:#fff;color:#18324b;cursor:pointer}
          .db-topbar{height:68px;padding:0 16px;gap:10px}
          .db-topbar-left{display:flex;align-items:center;gap:11px;min-width:0}
          .db-topbar-title{font-size:15px}
          .db-topbar-sub,.db-user-name{display:none}
          .db-body{padding:22px 16px}
          .db-page-title{font-size:21px}
        }
        @media(max-width:850px){.db-overview-grid{grid-template-columns:minmax(0,1fr)!important}}
        @media(max-width:520px){.db-body{padding:18px 12px}.db-content-head{align-items:flex-start;flex-direction:column;margin-bottom:18px}.db-user{gap:0}.fg2{grid-template-columns:1fr}.db-quick-actions{display:grid;grid-template-columns:1fr 1fr}.db-quick-action{padding:11px 8px}}
        @media(prefers-reduced-motion:reduce){.db *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
      `}</style>

      <div className="db">
        {toast && <Toast msg={toast.msg} type={toast.type} />}

        <div className={`db-backdrop${mobileNavOpen ? " open" : ""}`} onClick={() => setMobileNavOpen(false)} />
        <aside className={`db-side${mobileNavOpen ? " open" : ""}`}>
          <div className="db-brand">
            <div className="db-brand-mark">S</div>
            <div><div className="db-brand-title">Super Star Travel</div><div className="db-brand-sub">Operations console</div></div>
          </div>
          <nav style={{ padding:"10px 0", flex:1 }}>
            <div className="db-side-label">Workspace</div>
            {NAV.map(n => (
              <button key={n.id} type="button" className={`ni${tab === n.id ? " on" : ""}`} onClick={() => { setTab(n.id); setMobileNavOpen(false); }} aria-current={tab === n.id ? "page" : undefined}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d={n.icon} />
                </svg>
                <span>{n.label}</span>
                {n.id === "bookings" && newCount > 0 && (
                  <span className="ni-count">{newCount}</span>
                )}
              </button>
            ))}
          </nav>
          <div style={{ padding:"12px 0 0", borderTop:"1px solid rgba(255,255,255,.12)" }}>
            <button type="button" className="ni" onClick={onLogout}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" style={{ width:15, height:15 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        <div className="db-main">
          <div className="db-topbar">
            <div className="db-topbar-left">
              <button type="button" className="db-mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label="Open admin navigation" aria-expanded={mobileNavOpen}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
              <div>
                <div className="db-topbar-title">{NAV.find(n => n.id === tab)?.label}</div>
                <div className="db-topbar-sub">Super Star Travel <span aria-hidden="true">·</span> Admin workspace</div>
              </div>
            </div>
            <div className="db-user">
              <span className="db-user-name">Administrator</span>
              <div className="db-avatar" aria-label="Administrator profile">A</div>
            </div>
          </div>
          <div className="db-body">
            <div className="db-content-head">
              <div>
                <div className="db-eyebrow">Travel operations</div>
                <h1 className="db-page-title">{tab === "overview" ? "Good to see you, admin" : NAV.find(n => n.id === tab)?.label}</h1>
                <p className="db-page-note">{tab === "overview" ? "Your business at a glance. Review activity and keep today’s operations moving." : `Manage ${NAV.find(n => n.id === tab)?.label.toLowerCase()} for your travel service.`}</p>
              </div>
              {newCount > 0 && tab !== "bookings" && (
                <button type="button" className="btn b-gold" onClick={() => setTab("bookings")}>
                  Review {newCount} new booking{newCount === 1 ? "" : "s"} <span aria-hidden="true">→</span>
                </button>
              )}
            </div>
            {!loaded && <div style={{ padding:48, textAlign:"center", color:"#9ca3af", fontSize:14 }}>Loading data from database…</div>}
            {loaded && tab === "overview"   && <OverviewTab   bookings={bookings} locations={locations} vehicles={vehicles} rates={rates} features={features} categories={categories} onNavigate={setTab} />}
            {loaded && tab === "bookings"   && <BookingsTab   bookings={bookings} setBookings={setBookings} vehicles={vehicles} rates={rates} showToast={showToast} />}
            {loaded && tab === "calendar"   && <CalendarTab   bookings={bookings} vehicles={vehicles} />}
            {loaded && tab === "categories" && <CategoriesTab categories={categories} setCategories={setCategories} showToast={showToast} />}
            {loaded && tab === "locations"  && <LocationsTab  locations={locations} setLocations={setLocations} categories={categories} showToast={showToast} />}
            {loaded && tab === "vehicles"   && <VehiclesTab   vehicles={vehicles} setVehicles={setVehicles} showToast={showToast} />}
            {loaded && tab === "features"   && <FeaturesTab   features={features} setFeatures={setFeatures} showToast={showToast} />}
            {loaded && tab === "rates"      && <RatesTab rates={rates} setRates={setRates} locations={locations} vehicles={vehicles} showToast={showToast} />}
            {/* {loaded && tab === "events"     && <EventsTab />} */}
            {loaded && tab === "promo-codes" && <PromoCodesTab promoCodes={promoCodes} setPromoCodes={setPromoCodes} showToast={showToast} />}
            {loaded && tab === "settings"   && <SettingsTab   showToast={showToast} />}
          </div>
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════
//  OVERVIEW
// ════════════════════════════════════════════════════════════════
// OverviewTab.tsx — drop-in replacement for the OverviewTab function in Dashboard.tsx
// Paste this function in place of the existing OverviewTab function.

function OverviewTab({ bookings, locations, vehicles, rates, features, categories, onNavigate }: any) {
  const sc: Record<string, string> = { new:"amber", confirmed:"green", cancelled:"red" };

  const stats = [
    { label:"Total Bookings",   val:bookings.length,                              sub:`${bookings.filter((b:any)=>b.status==="new").length} awaiting confirmation`, color:"#111827" },
    { label:"Active Locations", val:locations.filter((l:any)=>l.active).length,   sub:`of ${locations.length} total`,   color:"#2563eb" },
    { label:"Active Vehicles",  val:vehicles.filter((v:any)=>v.active).length,    sub:`of ${vehicles.length} total`,    color:"#16a34a" },
    { label:"Active Routes",    val:rates.filter((r:any)=>r.active).length,       sub:`of ${rates.length} total`,       color:"#f97316" },
    { label:"Categories",       val:categories.filter((c:any)=>c.active).length,  sub:`${categories.length} total`,     color:"#7c3aed" },
    { label:"Features",         val:features.filter((f:any)=>f.active).length,    sub:"shown on vehicle cards",         color:"#0891b2" },
  ];

  // ── Country chart data ──────────────────────────────────────
  const countryCounts: Record<string, number> = {};
  bookings.forEach((b: any) => {
    const c = b.country || "Unknown";
    countryCounts[c] = (countryCounts[c] || 0) + 1;
  });
  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const maxCountryCount = topCountries[0]?.[1] || 1;

  // ── Bookings by month (last 6 months) ──────────────────────
  const now = new Date();
  const monthLabels: string[] = [];
  const monthData: number[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }));
    const count = bookings.filter((b: any) => {
      if (!b.date) return false;
      const bd = new Date(b.date);
      return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth();
    }).length;
    monthData.push(count);
  }
  const maxMonthCount = Math.max(...monthData, 1);

  // ── Top routes ──────────────────────────────────────────────
  const routeCounts: Record<string, number> = {};
  bookings.forEach((b: any) => {
    if (!b.from || !b.to) return;
    const key = `${b.from}|||${b.to}`;
    routeCounts[key] = (routeCounts[key] || 0) + 1;
  });
  const topRoutes = Object.entries(routeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, count]) => {
      const [from, to] = key.split("|||");
      return { from, to, count };
    });

  // ── Upcoming bookings (next 7 days, confirmed or new) ──────
  const todayStr = new Date().toISOString().split("T")[0];
  const in7 = new Date();
  in7.setDate(in7.getDate() + 7);
  const in7Str = in7.toISOString().split("T")[0];

  const upcomingBookings = bookings
    .filter((b: any) => b.date >= todayStr && b.date <= in7Str && b.status !== "cancelled")
    .sort((a: any, b: any) => (a.date + a.time) > (b.date + b.time) ? 1 : -1)
    .slice(0, 6);

  const urgencyColor = (date: string) => {
    const diff = Math.ceil((new Date(date).getTime() - new Date(todayStr).getTime()) / 86400000);
    if (diff === 0) return { bg: "#fef2f2", border: "#fecaca", text: "#dc2626", label: "Today" };
    if (diff === 1) return { bg: "#fff7ed", border: "#fed7aa", text: "#ea580c", label: "Tomorrow" };
    return { bg: "#f0fdf4", border: "#bbf7d0", text: "#16a34a", label: `In ${diff}d` };
  };

  const countryBarColors = [
    "#111827","#1f2937","#374151","#4b5563","#6b7280","#9ca3af","#d1d5db","#e5e7eb"
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* ── Stat cards ── */}
      <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
        {stats.map(s => (
          <div key={s.label} className="db-stat-card" style={{ background:"#fff", border:"1px solid #f0f0f0", borderRadius:12, padding:"16px 20px", flex:"1 1 140px" }}>
            <div style={{ fontSize:28, fontWeight:800, color:s.color, lineHeight:1 }}>{s.val}</div>
            <div style={{ fontSize:13, fontWeight:600, color:"#111827", marginTop:6 }}>{s.label}</div>
            <div style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="db-quick-actions" aria-label="Quick actions">
        <button type="button" className="db-quick-action" onClick={() => onNavigate("bookings")}>＋ Manage bookings</button>
        <button type="button" className="db-quick-action" onClick={() => onNavigate("calendar")}>▦ Open schedule</button>
        <button type="button" className="db-quick-action" onClick={() => onNavigate("rates")}>↗ Update route rates</button>
        <button type="button" className="db-quick-action" onClick={() => onNavigate("events")}>☆ Manage events</button>
      </div>

      {/* ── Row: Country chart + Monthly trend ── */}
      <div className="db-overview-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

        {/* Bookings by Country */}
        <div style={{ background:"#fff", border:"1px solid #f0f0f0", borderRadius:14, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid #f0f0f0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontWeight:700, fontSize:14, color:"#111827" }}>Bookings by Country</span>
            <span style={{ fontSize:11, color:"#9ca3af" }}>{Object.keys(countryCounts).length} countries</span>
          </div>
          <div style={{ padding:"16px 18px" }}>
            {topCountries.length === 0 ? (
              <div style={{ textAlign:"center", color:"#9ca3af", fontSize:13, padding:24 }}>No booking data yet</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {topCountries.map(([country, count], i) => (
                  <div key={country}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:12, fontWeight:600, color:"#374151" }}>{country}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:"#111827" }}>{count}</span>
                    </div>
                    <div style={{ height:7, background:"#f3f4f6", borderRadius:99, overflow:"hidden" }}>
                      <div style={{
                        height:"100%",
                        width:`${(count / maxCountryCount) * 100}%`,
                        background: countryBarColors[i] || "#e5e7eb",
                        borderRadius:99,
                        transition:"width .4s ease"
                      }}/>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Monthly booking trend */}
        <div style={{ background:"#fff", border:"1px solid #f0f0f0", borderRadius:14, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid #f0f0f0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontWeight:700, fontSize:14, color:"#111827" }}>Bookings — Last 6 Months</span>
            <span style={{ fontSize:11, color:"#9ca3af" }}>{bookings.length} total</span>
          </div>
          <div style={{ padding:"16px 18px 8px" }}>
            {/* Bar chart */}
            <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:120, marginBottom:8 }}>
              {monthData.map((val, i) => {
                const heightPct = maxMonthCount > 0 ? (val / maxMonthCount) : 0;
                const isCurrentMonth = i === 5;
                return (
                  <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                    <span style={{ fontSize:10, fontWeight:700, color:isCurrentMonth?"#f97316":"#9ca3af", minHeight:16, display:"flex", alignItems:"center" }}>
                      {val > 0 ? val : ""}
                    </span>
                    <div style={{
                      width:"100%",
                      height: Math.max(heightPct * 84, val > 0 ? 4 : 0),
                      background: isCurrentMonth ? "#f97316" : "#111827",
                      borderRadius:"4px 4px 2px 2px",
                      transition:"height .4s ease",
                      opacity: isCurrentMonth ? 1 : 0.75
                    }}/>
                  </div>
                );
              })}
            </div>
            {/* X-axis labels */}
            <div style={{ display:"flex", gap:6 }}>
              {monthLabels.map((label, i) => (
                <div key={i} style={{ flex:1, textAlign:"center", fontSize:10, color: i===5?"#f97316":"#9ca3af", fontWeight: i===5?700:400 }}>
                  {label}
                </div>
              ))}
            </div>
            {/* Status breakdown */}
            <div style={{ display:"flex", gap:12, marginTop:14, paddingTop:12, borderTop:"1px solid #f0f0f0" }}>
              {[
                { label:"New",       count:bookings.filter((b:any)=>b.status==="new").length,       color:"#f97316" },
                { label:"Confirmed", count:bookings.filter((b:any)=>b.status==="confirmed").length, color:"#16a34a" },
                { label:"Cancelled", count:bookings.filter((b:any)=>b.status==="cancelled").length, color:"#dc2626" },
              ].map(s => (
                <div key={s.label} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11 }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:s.color, flexShrink:0 }}/>
                  <span style={{ color:"#6b7280" }}>{s.label}</span>
                  <span style={{ fontWeight:700, color:"#111827" }}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row: Top Routes + Upcoming Alerts ── */}
      <div className="db-overview-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

        {/* Top Routes */}
        <div style={{ background:"#fff", border:"1px solid #f0f0f0", borderRadius:14, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid #f0f0f0" }}>
            <span style={{ fontWeight:700, fontSize:14, color:"#111827" }}>Most Booked Routes</span>
          </div>
          <div style={{ padding:"8px 0" }}>
            {topRoutes.length === 0 ? (
              <div style={{ textAlign:"center", color:"#9ca3af", fontSize:13, padding:24 }}>No routes yet</div>
            ) : (
              topRoutes.map((route, i) => {
                const maxCount = topRoutes[0]?.count || 1;
                const pct = (route.count / maxCount) * 100;
                const medals = ["🥇","🥈","🥉"];
                return (
                  <div key={i} style={{ padding:"10px 18px", borderBottom: i < topRoutes.length-1 ? "1px solid #f8f9fb" : "none" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                      <span style={{ fontSize:14, flexShrink:0 }}>{medals[i] || `#${i+1}`}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:"#111827", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {route.from}
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#9ca3af", marginTop:1 }}>
                          <span>→</span>
                          <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{route.to}</span>
                        </div>
                      </div>
                      <div style={{ flexShrink:0, textAlign:"right" }}>
                        <div style={{ fontSize:16, fontWeight:800, color:"#111827", lineHeight:1 }}>{route.count}</div>
                        <div style={{ fontSize:9, color:"#9ca3af", textTransform:"uppercase", letterSpacing:".06em", marginTop:1 }}>trips</div>
                      </div>
                    </div>
                    <div style={{ height:4, background:"#f3f4f6", borderRadius:99, overflow:"hidden" }}>
                      <div style={{
                        height:"100%",
                        width:`${pct}%`,
                        background: i===0?"#f97316":i===1?"#9ca3af":"#d1d5db",
                        borderRadius:99
                      }}/>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming booking alerts */}
        <div style={{ background:"#fff", border:"1px solid #f0f0f0", borderRadius:14, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid #f0f0f0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontWeight:700, fontSize:14, color:"#111827" }}>Upcoming — Next 7 Days</span>
            {upcomingBookings.length > 0 && (
              <span style={{ background:"#fee2e2", color:"#dc2626", fontSize:10, fontWeight:800, padding:"3px 9px", borderRadius:999 }}>
                {upcomingBookings.length} trip{upcomingBookings.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div style={{ padding:"8px 0", maxHeight:360, overflowY:"auto" }}>
            {upcomingBookings.length === 0 ? (
              <div style={{ textAlign:"center", color:"#9ca3af", fontSize:13, padding:24 }}>
                <div style={{ fontSize:28, marginBottom:8 }}>🗓️</div>
                No upcoming trips in next 7 days
              </div>
            ) : (
              upcomingBookings.map((b: any, i: number) => {
                const urg = urgencyColor(b.date);
                const { isRoundTrip } = parseNotes(b.notes ?? "");
                const veh = vehicles.find((v: any) => v.id === b.vehicleId);
                return (
                  <div key={b.id} style={{
                    padding:"10px 18px",
                    borderBottom: i < upcomingBookings.length-1 ? "1px solid #f8f9fb" : "none",
                    borderLeft:`3px solid ${urg.border}`,
                    background: i % 2 === 0 ? "#fff" : "#fafafa"
                  }}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                          <span style={{ fontSize:12, fontWeight:700, color:"#111827" }}>{b.name}</span>
                          {isRoundTrip && (
                            <span style={{ fontSize:9, background:"#fff7ed", color:"#ea580c", padding:"1px 5px", borderRadius:4, fontWeight:700, flexShrink:0 }}>RT</span>
                          )}
                          {b.status === "new" && (
                            <span style={{ fontSize:9, background:"#ffedd5", color:"#f97316", padding:"1px 5px", borderRadius:4, fontWeight:700, flexShrink:0 }}>NEW</span>
                          )}
                        </div>
                        <div style={{ fontSize:11, color:"#6b7280", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {b.from} → {b.to}
                        </div>
                        <div style={{ fontSize:10, color:"#9ca3af" }}>
                          {veh?.name ?? b.vehicleId} · {b.passengers + b.kids} pax · {b.bags} bags
                        </div>
                      </div>
                      <div style={{ flexShrink:0, textAlign:"right" }}>
                        <div style={{
                          fontSize:10, fontWeight:800, padding:"3px 8px", borderRadius:6,
                          background:urg.bg, border:`1px solid ${urg.border}`, color:urg.text,
                          marginBottom:3, whiteSpace:"nowrap"
                        }}>
                          {urg.label}
                        </div>
                        <div style={{ fontSize:11, fontWeight:600, color:"#374151" }}>{b.time}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Bookings table ── */}
      <div className="card">
        <div className="card-hdr"><span style={{ fontWeight:700, fontSize:14 }}>Recent Bookings</span></div>
        <div style={{ overflowX:"auto" }}>
          <table className="t">
            <thead><tr><th>Client</th><th>Route</th><th>Date & Time</th><th>Status</th></tr></thead>
            <tbody>
              {bookings.length === 0 && <tr><td colSpan={4} style={{ padding:28, textAlign:"center", color:"#9ca3af" }}>No bookings yet</td></tr>}
              {bookings.slice(0, 8).map((b: any) => {
                const { isRoundTrip } = parseNotes(b.notes ?? "");
                return (
                  <tr key={b.id}>
                    <td><div style={{ fontWeight:600 }}>{b.name}</div><div style={{ fontSize:11, color:"#9ca3af" }}>{b.email}</div></td>
                    <td style={{ fontSize:12 }}>
                      {b.from} → {b.to}
                      {isRoundTrip && <span style={{ marginLeft:6, fontSize:10, background:"#fff7ed", color:"#ea580c", padding:"1px 6px", borderRadius:4, fontWeight:700 }}>RT</span>}
                    </td>
                    <td style={{ fontSize:12 }}>{b.date} {b.time}</td>
                    <td><Chip color={sc[b.status] ?? "gray"}>{b.status || "Unknown"}</Chip></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  BOOKINGS
// ════════════════════════════════════════════════════════════════
function BookingsTab({ bookings, setBookings, vehicles, rates, showToast }: { bookings:Booking[]; setBookings:any; vehicles:Vehicle[]; rates:Rate[]; showToast:any }) {
  const [sel,    setSel]    = useState<Booking | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const sc: Record<string, { chip:string; label:string; icon:string; bg:string; bar:string }> = {
    new:       { chip:"amber",  label:"Awaiting",  icon:"⏳", bg:"#fff7ed", bar:"#f59e0b" },
    confirmed: { chip:"green",  label:"Confirmed", icon:"✅", bg:"#f0fdf4", bar:"#16a34a" },
    cancelled: { chip:"red",    label:"Cancelled", icon:"❌", bg:"#fef2f2", bar:"#dc2626" },
  };
  const statusStyle = (status: string | undefined) =>
    sc[status ?? ""] ?? {
      chip:"gray", label:status || "Unknown", icon:"⚠️", bg:"#f3f4f6", bar:"#9ca3af",
    };

  const vName  = (id: string) => vehicles.find(v => v.id === id)?.name ?? id;
  const vModel = (id: string) => vehicles.find(v => v.id === id)?.model ?? "";

  const getPrice = (b: Booking): string => {
    const totalPax = b.passengers + b.kids;
    const rate = rates.find(r =>
      r.fromLocId === (b as any).fromLocId &&
      r.toLocId   === (b as any).toLocId   &&
      r.vehicleId === b.vehicleId
    );
    if (!rate) return "—";
    if (rate.onDemand) return "On Demand";
    const { isRoundTrip } = parseNotes(b.notes ?? "");
    const base = calcPrice(rate, totalPax);
    if (base === null) return "—";
    const final = isRoundTrip ? base * 2 : base;
    return `€${final}${isRoundTrip ? " (RT)" : ""}`;
  };

  const ref = (id: string) => id.slice(0,8).toUpperCase();

  const rows = bookings.filter(b => {
    if (filter !== "all" && b.status !== filter) return false;
    if (search && !`${b.name} ${b.from} ${b.to} ${b.email} ${b.id}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const upd = async (id: string, status: Booking["status"]) => {
    try { await api("/api/bookings","PUT",{id,status}); setBookings((bs:Booking[])=>bs.map(b=>b.id===id?{...b,status}:b)); showToast(`Marked ${status}`); }
    catch { showToast("Update failed","error"); }
  };
  const del = async (id: string) => {
    if (!confirm("Permanently delete this booking?")) return;
    try { await api(`/api/bookings?id=${id}`,"DELETE"); setBookings((bs:Booking[])=>bs.filter(b=>b.id!==id)); setSel(null); showToast("Deleted"); }
    catch { showToast("Delete failed","error"); }
  };

  const stats = [
    { label:"Total",     val:bookings.length,                                  color:"#111827", bg:"#f8f9fb" },
    { label:"New",       val:bookings.filter(b=>b.status==="new").length,       color:"#f97316", bg:"#fff7ed" },
    { label:"Confirmed", val:bookings.filter(b=>b.status==="confirmed").length, color:"#16a34a", bg:"#f0fdf4" },
    { label:"Cancelled", val:bookings.filter(b=>b.status==="cancelled").length, color:"#dc2626", bg:"#fef2f2" },
  ];

  return (
    <div>
      <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
        {stats.map(s => (
          <div key={s.label} style={{ background:s.bg, border:"1px solid #f0f0f0", borderRadius:12, padding:"12px 20px", flex:"1 1 100px", cursor:"pointer" }}
            onClick={()=>setFilter(s.label.toLowerCase()==="total"?"all":s.label.toLowerCase())}>
            <div style={{ fontSize:26, fontWeight:800, color:s.color, lineHeight:1 }}>{s.val}</div>
            <div style={{ fontSize:11, color:"#9ca3af", marginTop:3, fontWeight:600, textTransform:"uppercase", letterSpacing:".06em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14, alignItems:"center" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, ref, route, email…"
          style={{...IS, width:240, padding:"8px 11px"}}/>
        <div style={{ display:"flex", gap:5 }}>
          {(["all","new","confirmed","cancelled"] as const).map(f => (
            <button key={f} className={`btn b-sm ${filter===f?"b-dark":"b-ghost"}`} onClick={()=>setFilter(f)}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
              {f==="new" && bookings.filter(b=>b.status==="new").length > 0 && (
                <span style={{ background:"#ef4444", color:"#fff", fontSize:9, borderRadius:999, padding:"0 4px", marginLeft:3 }}>
                  {bookings.filter(b=>b.status==="new").length}
                </span>
              )}
            </button>
          ))}
        </div>
        <span style={{ marginLeft:"auto", fontSize:11, color:"#9ca3af" }}>{rows.length} result{rows.length!==1?"s":""}</span>
      </div>

      <div className="card">
        <div style={{ overflowX:"auto" }}>
          <table className="t">
            <thead>
              <tr>
                <th>Ref</th><th>Client</th><th>Route</th><th>Date / Time</th>
                <th>Vehicle</th><th>Pax</th><th style={{textAlign:"right"}}>Price</th>
                <th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length===0 && (
                <tr><td colSpan={9} style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>📭</div>No bookings found
                </td></tr>
              )}
              {rows.map(b => {
                const s = statusStyle(b.status);
                const price = getPrice(b);
                const { isRoundTrip } = parseNotes(b.notes ?? "");
                return (
                  <tr key={b.id} style={{ borderLeft:`3px solid ${s.bar}` }}>
                    <td>
                      <span style={{ fontFamily:"monospace", fontSize:11, fontWeight:700, background:"#f3f4f6", padding:"3px 7px", borderRadius:5, color:"#374151", letterSpacing:".06em" }}>
                        {ref(b.id)}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight:600, fontSize:13 }}>{b.name}</div>
                      <div style={{ fontSize:11, color:"#9ca3af" }}>{b.email}</div>
                    </td>
                    <td>
                      <div style={{ fontSize:12, fontWeight:500, display:"flex", alignItems:"center", gap:5 }}>
                        {b.from}
                        {isRoundTrip && <span style={{ fontSize:9, background:"#fff7ed", color:"#ea580c", padding:"1px 5px", borderRadius:4, fontWeight:700, flexShrink:0 }}>RT</span>}
                      </div>
                      <div style={{ fontSize:11, color:"#9ca3af" }}>→ {b.to}</div>
                    </td>
                    <td>
                      <div style={{ fontSize:12 }}>{b.date}</div>
                      <div style={{ fontSize:11, color:"#9ca3af" }}>{b.time}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight:600, fontSize:12 }}>{vName(b.vehicleId)}</div>
                      <div style={{ fontSize:10, color:"#9ca3af" }}>{vModel(b.vehicleId)}</div>
                    </td>
                    <td style={{ fontSize:12, whiteSpace:"nowrap" }}>
                      {b.passengers+b.kids} 👤&nbsp;&nbsp;{b.bags} 🧳
                    </td>
                    <td style={{ textAlign:"right" }}>
                      <span style={{ fontWeight:800, fontSize:14, color: price==="On Demand"?"#f97316":price==="—"?"#d1d5db":"#111827" }}>
                        {price}
                      </span>
                    </td>
                    <td><Chip color={s.chip}>{s.icon} {s.label}</Chip></td>
                    <td>
                      <div style={{ display:"flex", gap:4 }}>
                        <button className="btn b-ghost b-sm" onClick={()=>setSel(b)}>View</button>
                        {b.status==="new" && (
                          <button className="btn b-sm" style={{ background:"#dcfce7", color:"#16a34a" }} onClick={()=>upd(b.id,"confirmed")}>✓</button>
                        )}
                        {b.status!=="cancelled" && (
                          <button className="btn b-red b-sm" onClick={()=>upd(b.id,"cancelled")}>✗</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── BOOKING DETAIL MODAL ── */}
      {sel && (() => {
        const s    = statusStyle(sel.status);
        const price = getPrice(sel);
        const veh   = vehicles.find(v => v.id === sel.vehicleId);
        const totalPax = sel.passengers + sel.kids;
        const { isRoundTrip, flightTrain, address, freeText } = parseNotes(sel.notes ?? "");

        return (
          <div style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
            <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.65)", backdropFilter:"blur(6px)" }} onClick={()=>setSel(null)}/>
            <div style={{ position:"relative", width:"100%", maxWidth:600, maxHeight:"94vh", overflow:"auto", borderRadius:20, boxShadow:"0 32px 100px rgba(0,0,0,.35)" }}>

              <div style={{ background:"linear-gradient(135deg,#0a1f44 0%,#1a3a6e 100%)", padding:"28px 28px 22px", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,.04)" }}/>
                <div style={{ position:"absolute", bottom:-30, left:60, width:100, height:100, borderRadius:"50%", background:"rgba(249,115,22,.08)" }}/>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", position:"relative" }}>
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, letterSpacing:".14em", textTransform:"uppercase", color:"rgba(255,255,255,.4)", marginBottom:6 }}>Booking Voucher</div>
                    <div style={{ fontSize:22, fontWeight:800, color:"#fff", lineHeight:1.2, marginBottom:4 }}>{sel.name}</div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,.5)" }}>{sel.email}</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
                    <button onClick={()=>setSel(null)} style={{ background:"rgba(255,255,255,.1)", border:"none", color:"rgba(255,255,255,.7)", width:30, height:30, borderRadius:"50%", fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"flex-end" }}>
                      {isRoundTrip && <div style={{ background:"#ea580c", color:"#fff", fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:999, letterSpacing:".06em" }}>🔄 ROUND TRIP</div>}
                      <div style={{ background:s.bar, color:"#fff", fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:999, letterSpacing:".06em", textTransform:"uppercase" }}>{s.icon} {s.label}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display:"flex", marginTop:20, background:"rgba(0,0,0,.2)", borderRadius:12, overflow:"hidden" }}>
                  <div style={{ flex:1, padding:"12px 18px", borderRight:"1px solid rgba(255,255,255,.07)" }}>
                    <div style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,.35)", letterSpacing:".12em", textTransform:"uppercase", marginBottom:4 }}>Reference</div>
                    <div style={{ fontFamily:"monospace", fontSize:15, fontWeight:800, color:"#f97316", letterSpacing:".1em" }}>PEM-{ref(sel.id)}</div>
                  </div>
                  <div style={{ flex:1, padding:"12px 18px", borderRight:"1px solid rgba(255,255,255,.07)" }}>
                    <div style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,.35)", letterSpacing:".12em", textTransform:"uppercase", marginBottom:4 }}>Total Fare</div>
                    <div style={{ fontSize:18, fontWeight:900, color: price==="On Demand"?"#f97316":"#4ade80" }}>{price}</div>
                  </div>
                  <div style={{ flex:1, padding:"12px 18px" }}>
                    <div style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,.35)", letterSpacing:".12em", textTransform:"uppercase", marginBottom:4 }}>Booked On</div>
                    <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,.7)" }}>
                      {new Date(sel.createdAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background:"#fff", padding:"0 0 24px" }}>
                <div style={{ background:"linear-gradient(135deg,#f8faff,#f0f4ff)", borderBottom:"1px solid #e8edf5", padding:"18px 28px" }}>
                  <div style={{ display:"flex", alignItems:"center" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:9, fontWeight:700, color:"#9ca3af", letterSpacing:".1em", textTransform:"uppercase", marginBottom:4 }}>From</div>
                      <div style={{ fontWeight:800, fontSize:15, color:"#111827" }}>{sel.from}</div>
                    </div>
                    <div style={{ padding:"0 16px", display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                      <div style={{ width:32, height:32, borderRadius:"50%", background:"#0a1f44", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="#f97316" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                        </svg>
                      </div>
                      {isRoundTrip && <div style={{ fontSize:9, color:"#ea580c", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em" }}>+ Return</div>}
                    </div>
                    <div style={{ flex:1, textAlign:"right" }}>
                      <div style={{ fontSize:9, fontWeight:700, color:"#9ca3af", letterSpacing:".1em", textTransform:"uppercase", marginBottom:4 }}>To</div>
                      <div style={{ fontWeight:800, fontSize:15, color:"#111827" }}>{sel.to}</div>
                    </div>
                  </div>
                </div>

                <div style={{ padding:"20px 28px 0" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
                    {[
                      { icon:"📅", label:"Date",        val:sel.date },
                      { icon:"🕐", label:"Pickup Time",  val:sel.time },
                      { icon:"👤", label:"Passengers",   val:`${sel.passengers} adult${sel.passengers!==1?"s":""} · ${sel.kids} child${sel.kids!==1?"ren":""}` },
                      { icon:"🧳", label:"Luggage",       val:`${sel.bags} bag${sel.bags!==1?"s":""}` },
                      { icon:"🔄", label:"Trip Type",     val:isRoundTrip ? "Round Trip (×2 price)" : "One Way" },
                      ...(flightTrain ? [{ icon:"✈️", label:"Flight / Train No.", val:flightTrain }] : []),
                      ...(address     ? [{ icon:"📍", label:"Address",            val:address }]     : []),
                    ].map(r => (
                      <div key={r.label} style={{ background:"#f8f9fb", borderRadius:10, padding:"10px 14px", display:"flex", alignItems:"flex-start", gap:10 }}>
                        <span style={{ fontSize:16, marginTop:1 }}>{r.icon}</span>
                        <div>
                          <div style={{ fontSize:9, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:".08em" }}>{r.label}</div>
                          <div style={{ fontSize:13, fontWeight:600, color: r.label==="Trip Type" && isRoundTrip ? "#ea580c" : "#111827", marginTop:1 }}>{r.val}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {veh && (
                    <div style={{ border:"1.5px solid #e5e7eb", borderRadius:12, overflow:"hidden", marginBottom:14, display:"flex", alignItems:"center" }}>
                      <img src={veh.img} alt={veh.name} style={{ width:90, height:66, objectFit:"cover", flexShrink:0, background:"#f3f4f6" }}/>
                      <div style={{ padding:"10px 14px", flex:1 }}>
                        <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:".06em", color:"#111827" }}>{veh.name}</div>
                        <div style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>{veh.model}</div>
                        <div style={{ display:"flex", gap:10, marginTop:4, fontSize:10, color:"#6b7280", fontWeight:600 }}>
                          <span>👤 Max {veh.maxPassengers}</span>
                          <span>🧳 Max {veh.maxLuggage}</span>
                          <span>Total: {totalPax} pax</span>
                        </div>
                      </div>
                      <div style={{ padding:"0 18px", textAlign:"center" }}>
                        <div style={{ fontSize:20, fontWeight:900, color:"#111827" }}>{price}</div>
                        <div style={{ fontSize:9, color:"#9ca3af", marginTop:2, textTransform:"uppercase", letterSpacing:".06em" }}>
                          {isRoundTrip ? "Round trip" : "Fixed fare"}
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display:"flex", alignItems:"center", gap:8, margin:"4px 0 14px", color:"#d1d5db" }}>
                    <div style={{ flex:1, height:1, background:"repeating-linear-gradient(90deg,#d1d5db 0,#d1d5db 6px,transparent 6px,transparent 12px)" }}/>
                    <span style={{ fontSize:14 }}>✂</span>
                    <div style={{ flex:1, height:1, background:"repeating-linear-gradient(90deg,#d1d5db 0,#d1d5db 6px,transparent 6px,transparent 12px)" }}/>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
                    {[
                      { label:"Country",  val:sel.country,  icon:"🌍" },
                      { label:"WhatsApp", val:sel.whatsapp, icon:"💬" },
                      { label:"Email",    val:sel.email,    icon:"✉️" },
                      ...(freeText ? [{ label:"Special Requests", val:freeText, icon:"📝" }] : []),
                    ].map(r => (
                      <div key={r.label} style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"8px 12px", background:"#fafafa", borderRadius:9, border:"1px solid #f0f0f0" }}>
                        <span style={{ fontSize:14, marginTop:1 }}>{r.icon}</span>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontSize:9, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:".08em" }}>{r.label}</div>
                          <div style={{ fontSize:12, fontWeight:600, color:"#111827", marginTop:1, wordBreak:"break-all" }}>{r.val}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display:"flex", gap:8 }}>
                    {sel.status!=="confirmed" && (
                      <button className="btn b-dark" style={{ flex:1, justifyContent:"center", padding:"11px" }}
                        onClick={()=>{upd(sel.id,"confirmed");setSel(null);}}>✓ Confirm Booking</button>
                    )}
                    {sel.status!=="cancelled" && (
                      <button className="btn" style={{ flex:1, justifyContent:"center", padding:"11px", background:"#fff7ed", color:"#c2410c", border:"1.5px solid #fed7aa" }}
                        onClick={()=>{upd(sel.id,"cancelled");setSel(null);}}>✗ Cancel</button>
                    )}
                    <button className="btn b-red" style={{ padding:"11px 14px" }} onClick={()=>del(sel.id)}>🗑</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  CATEGORIES
// ════════════════════════════════════════════════════════════════
function CategoriesTab({ categories, setCategories, showToast }: { categories:Category[]; setCategories:any; showToast:any }) {
  const [modal, setModal] = useState<"add"|"edit"|null>(null);
  const [edit,  setEdit]  = useState<Category|null>(null);
  const [form,  setForm]  = useState({ name:"", icon:"📍", sortOrder:0 });

  const openAdd  = () => { setForm({ name:"", icon:"📍", sortOrder:categories.length }); setEdit(null); setModal("add"); };
  const openEdit = (c:Category) => { setForm({ name:c.name, icon:c.icon, sortOrder:c.sortOrder }); setEdit(c); setModal("edit"); };

  const save = async () => {
    if (!form.name.trim()) return showToast("Name required","error");
    try {
      if (modal==="add") { const s=await api("/api/location-categories","POST",{id:uid(),...form,active:true}); setCategories((cs:Category[])=>[...cs,s]); showToast("Category added"); }
      else if (edit)     { const s=await api("/api/location-categories","PUT",{...edit,...form}); setCategories((cs:Category[])=>cs.map(c=>c.id===edit.id?s:c)); showToast("Updated"); }
      setModal(null);
    } catch { showToast("Save failed","error"); }
  };
  const del = async (id:string) => { try { await api(`/api/location-categories?id=${id}`,"DELETE"); setCategories((cs:Category[])=>cs.filter(c=>c.id!==id)); showToast("Deleted"); } catch { showToast("Delete failed","error"); } };
  const tog = async (c:Category) => { const u={...c,active:!c.active}; await api("/api/location-categories","PUT",u); setCategories((cs:Category[])=>cs.map(x=>x.id===c.id?u:x)); };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}>
        <button className="btn b-gold" onClick={openAdd}>+ Add Category</button>
      </div>
      <div className="card">
        <table className="t">
          <thead><tr><th>Icon</th><th>Name</th><th>Sort Order</th><th>Active</th><th>Actions</th></tr></thead>
          <tbody>
            {categories.length===0 && <tr><td colSpan={5} style={{ padding:24, textAlign:"center", color:"#9ca3af" }}>No categories yet</td></tr>}
            {categories.map((c:Category) => (
              <tr key={c.id}>
                <td style={{ fontSize:22 }}>{c.icon}</td>
                <td style={{ fontWeight:600 }}>{c.name}</td>
                <td style={{ color:"#9ca3af" }}>{c.sortOrder}</td>
                <td><Toggle on={c.active} onChange={()=>tog(c)} /></td>
                <td><div style={{ display:"flex", gap:4 }}><button className="btn b-ghost b-sm" onClick={()=>openEdit(c)}>Edit</button><button className="btn b-red b-sm" onClick={()=>del(c.id)}>Del</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <Modal title={modal==="add"?"Add Category":"Edit Category"} onClose={()=>setModal(null)}>
          <div className="fg2" style={{ marginBottom:12 }}>
            <div className="fg" style={{ marginBottom:0 }}><label style={LS}>Name *</label><input style={IS} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Airport"/></div>
            <div className="fg" style={{ marginBottom:0 }}><label style={LS}>Icon (emoji)</label><input style={IS} value={form.icon} onChange={e=>setForm(f=>({...f,icon:e.target.value}))} placeholder="✈️"/></div>
          </div>
          <div className="fg"><label style={LS}>Sort Order</label><input style={IS} type="number" value={form.sortOrder} onChange={e=>setForm(f=>({...f,sortOrder:+e.target.value}))}/></div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn b-ghost" style={{ flex:1 }} onClick={()=>setModal(null)}>Cancel</button>
            <button className="btn b-dark"  style={{ flex:1 }} onClick={save}>{modal==="add"?"Add Category":"Save Changes"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  LOCATIONS
// ════════════════════════════════════════════════════════════════
function LocationsTab({ locations, setLocations, categories, showToast }: { locations:Location[]; setLocations:any; categories:Category[]; showToast:any }) {
  const [modal, setModal] = useState<"add"|"edit"|null>(null);
  const [edit,  setEdit]  = useState<Location|null>(null);
  const [form,  setForm]  = useState({ name:"", categoryId:"" });
  const [fcat,  setFcat]  = useState("All");

  const openAdd  = () => { setForm({ name:"", categoryId:categories[0]?.id??"" }); setEdit(null); setModal("add"); };
  const openEdit = (l:Location) => { setForm({ name:l.name, categoryId:l.categoryId??"" }); setEdit(l); setModal("edit"); };

  const save = async () => {
    if (!form.name.trim()) return showToast("Name required","error");
    try {
      if (modal==="add") { const s=await api("/api/locations","POST",{id:uid(),...form,active:true}); setLocations((ls:Location[])=>[...ls,s]); showToast("Location added"); }
      else if (edit)     { const s=await api("/api/locations","PUT",{...edit,...form}); setLocations((ls:Location[])=>ls.map(l=>l.id===edit.id?s:l)); showToast("Updated"); }
      setModal(null);
    } catch { showToast("Save failed","error"); }
  };
  const del = async (id:string) => { try { await api(`/api/locations?id=${id}`,"DELETE"); setLocations((ls:Location[])=>ls.filter(l=>l.id!==id)); showToast("Deleted"); } catch { showToast("Delete failed","error"); } };
  const tog = async (l:Location) => { const u={...l,active:!l.active}; await api("/api/locations","PUT",u); setLocations((ls:Location[])=>ls.map(x=>x.id===l.id?u:x)); };

  const catNames = ["All",...Array.from(new Set(locations.map(l=>l.categoryName))).sort()];
  const shown    = fcat==="All" ? locations : locations.filter(l=>l.categoryName===fcat);

  return (
    <div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14, alignItems:"center" }}>
        {catNames.map(c => <button key={c} className={`btn b-sm ${fcat===c?"b-dark":"b-ghost"}`} onClick={()=>setFcat(c)}>{c}</button>)}
        <button className="btn b-gold" style={{ marginLeft:"auto" }} onClick={openAdd}>+ Add Location</button>
      </div>
      <div className="card">
        <table className="t">
          <thead><tr><th>Name</th><th>Category</th><th>Active</th><th>Actions</th></tr></thead>
          <tbody>
            {shown.length===0 && <tr><td colSpan={4} style={{ padding:24, textAlign:"center", color:"#9ca3af" }}>No locations</td></tr>}
            {shown.map((l:Location) => (
              <tr key={l.id}>
                <td style={{ fontWeight:500 }}>{l.name}</td>
                <td><span style={{ marginRight:5 }}>{l.categoryIcon}</span>{l.categoryName}</td>
                <td><Toggle on={l.active} onChange={()=>tog(l)} /></td>
                <td><div style={{ display:"flex", gap:4 }}><button className="btn b-ghost b-sm" onClick={()=>openEdit(l)}>Edit</button><button className="btn b-red b-sm" onClick={()=>del(l.id)}>Del</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <Modal title={modal==="add"?"Add Location":"Edit Location"} onClose={()=>setModal(null)}>
          <div className="fg"><label style={LS}>Location Name *</label><input style={IS} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Charles de Gaulle Airport"/></div>
          <div className="fg">
            <label style={LS}>Category</label>
            <select style={IS} value={form.categoryId} onChange={e=>setForm(f=>({...f,categoryId:e.target.value}))}>
              <option value="">— No category —</option>
              {categories.map((c:Category) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn b-ghost" style={{ flex:1 }} onClick={()=>setModal(null)}>Cancel</button>
            <button className="btn b-dark"  style={{ flex:1 }} onClick={save}>{modal==="add"?"Add Location":"Save Changes"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  VEHICLES
// ════════════════════════════════════════════════════════════════
function VehiclesTab({ vehicles, setVehicles, showToast }: { vehicles:Vehicle[]; setVehicles:any; showToast:any }) {
  const empty = { name:"", model:"", maxPassengers:4, maxLuggage:4, img:"/images/car.png", price:80, tag:"", special:"", active:true, sortOrder:0 };
  const [modal, setModal] = useState<"add"|"edit"|null>(null);
  const [edit,  setEdit]  = useState<Vehicle|null>(null);
  const [form,  setForm]  = useState<typeof empty>(empty);
  const f = (k:string,v:any) => setForm(p=>({...p,[k]:v}));

  const openAdd  = () => { setForm({...empty,sortOrder:vehicles.length}); setEdit(null); setModal("add"); };
  const openEdit = (v:Vehicle) => { setForm({ name:v.name, model:v.model, maxPassengers:v.maxPassengers, maxLuggage:v.maxLuggage, img:v.img, price:v.price, tag:v.tag, special:v.special, active:v.active, sortOrder:v.sortOrder }); setEdit(v); setModal("edit"); };

  const save = async () => {
    if (!form.name.trim()||!form.model.trim()) return showToast("Name and model required","error");
    try {
      if (modal==="add") { const s=await api("/api/vehicles","POST",{...form,id:uid()}); setVehicles((vs:Vehicle[])=>[...vs,s]); showToast("Vehicle added"); }
      else if (edit)     { const s=await api("/api/vehicles","PUT",{...edit,...form}); setVehicles((vs:Vehicle[])=>vs.map(v=>v.id===edit.id?s:v)); showToast("Updated"); }
      setModal(null);
    } catch { showToast("Save failed","error"); }
  };
  const del = async (id:string) => { try { await api(`/api/vehicles?id=${id}`,"DELETE"); setVehicles((vs:Vehicle[])=>vs.filter(v=>v.id!==id)); showToast("Deleted"); } catch { showToast("Delete failed","error"); } };
  const tog = async (v:Vehicle) => { const u={...v,active:!v.active}; await api("/api/vehicles","PUT",u); setVehicles((vs:Vehicle[])=>vs.map(x=>x.id===v.id?u:x)); };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}>
        <button className="btn b-gold" onClick={openAdd}>+ Add Vehicle</button>
      </div>
      <div className="card">
        <div style={{ overflowX:"auto" }}>
          <table className="t">
            <thead><tr><th>Vehicle</th><th>Capacity</th><th>Price</th><th>Tag</th><th>Active</th><th>Actions</th></tr></thead>
            <tbody>
              {vehicles.length===0 && <tr><td colSpan={6} style={{ padding:24,textAlign:"center",color:"#9ca3af" }}>No vehicles</td></tr>}
              {vehicles.map((v:Vehicle) => (
                <tr key={v.id}>
                  <td>
                    <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                      <img src={v.img} alt={v.name} style={{ width:64, height:44, borderRadius:7, objectFit:"cover", background:"#f3f4f6", flexShrink:0 }} onError={e=>{(e.currentTarget as any).style.background="#f3f4f6";}}/>
                      <div><div style={{ fontWeight:700, fontSize:12, textTransform:"uppercase", letterSpacing:".04em" }}>{v.name}</div><div style={{ fontSize:11, color:"#9ca3af" }}>{v.model}</div></div>
                    </div>
                  </td>
                  <td style={{ fontSize:12 }}>👤 {v.maxPassengers} · 🧳 {v.maxLuggage}</td>
                  <td style={{ fontWeight:700, fontSize:14 }}>€{v.price}</td>
                  <td>{v.tag ? <Chip color="amber">{v.tag}</Chip> : <span style={{ color:"#d1d5db" }}>—</span>}</td>
                  <td><Toggle on={v.active} onChange={()=>tog(v)} /></td>
                  <td><div style={{ display:"flex", gap:4 }}><button className="btn b-ghost b-sm" onClick={()=>openEdit(v)}>Edit</button><button className="btn b-red b-sm" onClick={()=>del(v.id)}>Del</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <Modal title={modal==="add"?"Add Vehicle":"Edit Vehicle"} onClose={()=>setModal(null)}>
          <div className="fg2"><div className="fg" style={{marginBottom:0}}><label style={LS}>Name *</label><input style={IS} value={form.name} onChange={e=>f("name",e.target.value)} placeholder="BUSINESS CLASS CAR"/></div><div className="fg" style={{marginBottom:0}}><label style={LS}>Model *</label><input style={IS} value={form.model} onChange={e=>f("model",e.target.value)} placeholder="Mercedes-Benz E-Class"/></div></div>
          <div className="fg2" style={{marginTop:12}}><div className="fg" style={{marginBottom:0}}><label style={LS}>Max Passengers</label><input style={IS} type="number" min={1} value={form.maxPassengers} onChange={e=>f("maxPassengers",+e.target.value)}/></div><div className="fg" style={{marginBottom:0}}><label style={LS}>Max Luggage Bags</label><input style={IS} type="number" min={0} value={form.maxLuggage} onChange={e=>f("maxLuggage",+e.target.value)}/></div></div>
          <div className="fg2" style={{marginTop:12}}><div className="fg" style={{marginBottom:0}}><label style={LS}>Base Price (€)</label><input style={IS} type="number" min={0} value={form.price} onChange={e=>f("price",+e.target.value)}/></div><div className="fg" style={{marginBottom:0}}><label style={LS}>Tag Label</label><input style={IS} value={form.tag} onChange={e=>f("tag",e.target.value)} placeholder="Most Popular"/></div></div>
          <div className="fg" style={{marginTop:12}}><label style={LS}>Image Path</label><input style={IS} value={form.img} onChange={e=>f("img",e.target.value)} placeholder="/images/car.png"/></div>
          <div className="fg"><label style={LS}>Special Note (optional)</label><input style={IS} value={form.special} onChange={e=>f("special",e.target.value)} placeholder="Accommodates strollers"/></div>
          <div className="fg"><label style={LS}>Sort Order</label><input style={IS} type="number" value={form.sortOrder} onChange={e=>f("sortOrder",+e.target.value)}/></div>
          <label style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18, cursor:"pointer" }}>
            <Toggle on={form.active} onChange={()=>f("active",!form.active)}/><span style={{ fontSize:13,fontWeight:500 }}>Active (visible on reservation page)</span>
          </label>
          <div style={{ display:"flex", gap:8 }}><button className="btn b-ghost" style={{flex:1}} onClick={()=>setModal(null)}>Cancel</button><button className="btn b-dark" style={{flex:2}} onClick={save}>{modal==="add"?"Add Vehicle":"Save Changes"}</button></div>
        </Modal>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  FEATURES
// ════════════════════════════════════════════════════════════════
function PromoCodesTab({ promoCodes, setPromoCodes, showToast }: { promoCodes:PromoCode[]; setPromoCodes:any; showToast:any }) {
  const empty = { id:"", code:"", description:"", discountAmount:10, validFrom:"", validUntil:"", active:true };
  const [modal, setModal] = useState<"add"|"edit"|null>(null);
  const [edit, setEdit] = useState<PromoCode | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);

  const openAdd = () => {
    setForm({ ...empty, validFrom: new Date().toISOString().split("T")[0] });
    setEdit(null);
    setModal("add");
  };

  const openEdit = (p: PromoCode) => {
    setForm({ ...p });
    setEdit(p);
    setModal("edit");
  };

  const save = async () => {
    if (!form.code.trim()) return showToast("Promo code required", "error");
    if (!form.validFrom || !form.validUntil) return showToast("Date range required", "error");
    if (form.validFrom > form.validUntil) return showToast("Valid until must be on or after valid from", "error");
    if (form.discountAmount < 0) return showToast("Discount amount must be 0 or greater", "error");

    try {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        description: form.description.trim(),
        discountAmount: Number(form.discountAmount),
      };

      if (modal === "add") {
        const saved = await api("/api/promo-codes", "POST", { ...payload, id: uid() });
        setPromoCodes((prev: PromoCode[]) => [...prev, saved]);
        showToast("Promo code added");
      } else if (edit) {
        const saved = await api("/api/promo-codes", "PUT", { ...edit, ...payload });
        setPromoCodes((prev: PromoCode[]) => prev.map((p) => p.id === edit.id ? saved : p));
        showToast("Promo code updated");
      }

      setModal(null);
    } catch (err: any) {
      showToast(err?.message || "Save failed", "error");
    }
  };

  const del = async (id: string) => {
    try {
      await api(`/api/promo-codes?id=${id}`, "DELETE");
      setPromoCodes((prev: PromoCode[]) => prev.filter((p) => p.id !== id));
      showToast("Promo code deleted");
    } catch (err: any) {
      showToast(err?.message || "Delete failed", "error");
    }
  };

  const toggle = async (p: PromoCode) => {
    const updated = { ...p, active: !p.active };
    try {
      const saved = await api("/api/promo-codes", "PUT", updated);
      setPromoCodes((prev: PromoCode[]) => prev.map((x) => x.id === p.id ? saved : x));
    } catch (err: any) {
      showToast(err?.message || "Toggle failed", "error");
    }
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}>
        <button className="btn b-gold" onClick={openAdd}>+ Add Promo Code</button>
      </div>

      <div className="card">
        <div style={{ overflowX:"auto" }}>
          <table className="t">
            <thead>
              <tr>
                <th>Code</th><th>Description</th><th>Discount ($)</th><th>Valid Period</th><th>Active</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promoCodes.length === 0 && (
                <tr><td colSpan={6} style={{ padding:24, textAlign:"center", color:"#9ca3af" }}>No promo codes</td></tr>
              )}
              {promoCodes.map((p: PromoCode) => (
                <tr key={p.id}>
                  <td style={{ fontWeight:800, color:"#111827" }}>{p.code}</td>
                  <td style={{ color:"#374151" }}>{p.description || "—"}</td>
                  <td style={{ fontWeight:700, color:"#16a34a" }}>€{Number(p.discountAmount ?? 0).toFixed(2)}</td>
                  <td style={{ color:"#6b7280", fontSize:12 }}>
                    {p.validFrom} → {p.validUntil}
                  </td>
                  <td><Toggle on={p.active} onChange={() => toggle(p)} /></td>
                  <td>
                    <div style={{ display:"flex", gap:4 }}>
                      <button className="btn b-ghost b-sm" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn b-red b-sm" onClick={() => del(p.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={modal === "add" ? "Add Promo Code" : "Edit Promo Code"} onClose={() => setModal(null)}>
          <div className="fg"><label style={LS}>Code *</label><input style={IS} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="WELCOME10" /></div>
          <div className="fg"><label style={LS}>Description</label><input style={IS} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Welcome discount" /></div>
          <div className="fg2">
            <div className="fg" style={{ marginBottom:0 }}>
              <label style={LS}>Discount Amount ($)</label>
              <input style={IS} type="number" min={0} step={0.01} value={form.discountAmount} onChange={e => setForm(f => ({ ...f, discountAmount: Number(e.target.value) }))} />
            </div>
            <div className="fg" style={{ marginBottom:0 }}>
              <label style={LS}>Active</label>
              <div style={{ display:"flex", alignItems:"center", height:42, paddingLeft:8, border:"1.5px solid #e5e7eb", borderRadius:8, background:"#fff" }}>
                <Toggle on={form.active} onChange={() => setForm(f => ({ ...f, active: !f.active }))} />
              </div>
            </div>
          </div>
          <div className="fg2" style={{ marginTop:12 }}>
            <div className="fg" style={{ marginBottom:0 }}>
              <label style={LS}>Valid From *</label>
              <input style={IS} type="date" value={form.validFrom} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))} />
            </div>
            <div className="fg" style={{ marginBottom:0 }}>
              <label style={LS}>Valid Until *</label>
              <input style={IS} type="date" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} />
            </div>
          </div>
          <div style={{ display:"flex", gap:8, marginTop:18 }}>
            <button className="btn b-ghost" style={{ flex:1 }} onClick={() => setModal(null)}>Cancel</button>
            <button className="btn b-dark" style={{ flex:1 }} onClick={save}>{modal === "add" ? "Add Promo Code" : "Save Changes"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function FeaturesTab({ features, setFeatures, showToast }: { features:Feature[]; setFeatures:any; showToast:any }) {
  const [text,   setText]   = useState("");
  const [editId, setEditId] = useState<string|null>(null);
  const [editTx, setEditTx] = useState("");

  const add = async () => {
    if (!text.trim()) return showToast("Text required","error");
    try { const s=await api("/api/features","POST",{id:uid(),text:text.trim(),active:true,sort_order:features.length}); setFeatures((fs:Feature[])=>[...fs,s]); setText(""); showToast("Feature added"); }
    catch { showToast("Add failed","error"); }
  };
  const del = async (id:string) => { try { await api(`/api/features?id=${id}`,"DELETE"); setFeatures((fs:Feature[])=>fs.filter(f=>f.id!==id)); showToast("Removed"); } catch { showToast("Delete failed","error"); } };
  const tog = async (feat:Feature) => { const u={...feat,active:!feat.active}; await api("/api/features","PUT",u); setFeatures((fs:Feature[])=>fs.map(f=>f.id===feat.id?u:f)); };
  const saveEdit = async (id:string) => {
    if (!editTx.trim()) return;
    const feat=features.find((f:Feature)=>f.id===id); if(!feat) return;
    const u={...feat,text:editTx.trim()};
    await api("/api/features","PUT",u); setFeatures((fs:Feature[])=>fs.map(f=>f.id===id?u:f)); setEditId(null); showToast("Updated");
  };

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        <input style={{...IS,flex:1,padding:"9px 12px"}} value={text} onChange={e=>setText(e.target.value)} placeholder="e.g. Complimentary water bottles" onKeyDown={e=>e.key==="Enter"&&add()}/>
        <button className="btn b-gold" onClick={add}>Add Feature</button>
      </div>
      <div className="card">
        <table className="t">
          <thead><tr><th>#</th><th>Feature Text</th><th>Visible</th><th>Actions</th></tr></thead>
          <tbody>
            {features.length===0 && <tr><td colSpan={4} style={{ padding:24,textAlign:"center",color:"#9ca3af" }}>No features</td></tr>}
            {features.map((f:Feature,i:number) => (
              <tr key={f.id}>
                <td style={{ color:"#9ca3af", fontSize:12 }}>{i+1}</td>
                <td>{editId===f.id ? <input style={{...IS,padding:"6px 9px",fontSize:13}} value={editTx} onChange={e=>setEditTx(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")saveEdit(f.id);if(e.key==="Escape")setEditId(null);}} autoFocus/> : <span style={{ fontWeight:500 }}>{f.text}</span>}</td>
                <td><Toggle on={f.active} onChange={()=>tog(f)} /></td>
                <td>
                  <div style={{ display:"flex", gap:4 }}>
                    {editId===f.id
                      ? <><button className="btn b-dark b-sm" onClick={()=>saveEdit(f.id)}>Save</button><button className="btn b-ghost b-sm" onClick={()=>setEditId(null)}>Cancel</button></>
                      : <><button className="btn b-ghost b-sm" onClick={()=>{setEditId(f.id);setEditTx(f.text);}}>Edit</button><button className="btn b-red b-sm" onClick={()=>del(f.id)}>Del</button></>
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop:10, padding:"10px 14px", background:"#fff7ed", border:"1px solid #fdba74", borderRadius:9, fontSize:12, color:"#9a3412" }}>
        ⚠️ These features appear on every vehicle card on the reservation page. Toggle to show/hide without deleting.
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  SETTINGS  (includes DB Backup card)
// ════════════════════════════════════════════════════════════════
function SettingsTab({ showToast }: { showToast:any }) {
  const [pw, setPw] = useState({ cur:"", nw:"", cf:"" });
  const [co, setCo] = useState({ name:"Super Star Travel", phone:"+94 72 680 3498", email:"support@superstartravelcabs.com", address:"Colombo, Sri Lanka" });

  // ── Backup state ──────────────────────────────────────────────
  type BackupStatus = "idle"|"loading"|"success"|"error";
  const [backupStatus,  setBackupStatus]  = useState<BackupStatus>("idle");
  const [backupMessage, setBackupMessage] = useState("");
  const [lastBackup,    setLastBackup]    = useState<string|null>(null);

  const triggerBackup = async () => {
    setBackupStatus("loading");
    setBackupMessage("");
    try {
      const secret = process.env.NEXT_PUBLIC_BACKUP_SECRET ?? "";
      const url    = `/api/db-backup${secret ? `?secret=${secret}` : ""}`;
      const res    = await fetch(url);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.details || err.error || "Backup request failed");
      }

      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match       = disposition.match(/filename="?([^"]+)"?/);
      const filename    = match?.[1] ?? "backup.sql";

      const blob        = await res.blob();
      const dlUrl       = URL.createObjectURL(blob);
      const a           = document.createElement("a");
      a.href            = dlUrl;
      a.download        = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(dlUrl);

      setLastBackup(`${filename} — ${new Date().toLocaleString()}`);
      setBackupStatus("success");
      setBackupMessage("Backup downloaded successfully");
      showToast("Database backup downloaded");
    } catch (err: any) {
      setBackupStatus("error");
      setBackupMessage(err.message ?? "An unexpected error occurred");
      showToast("Backup failed", "error");
    }
  };
  // ─────────────────────────────────────────────────────────────

  const changePw = () => {
    if (pw.cur !== "paris2024") return showToast("Current password incorrect","error");
    if (pw.nw.length < 6)       return showToast("New password too short (min 6)","error");
    if (pw.nw !== pw.cf)        return showToast("Passwords don't match","error");
    showToast("Password updated — update ADMIN_PASS constant in page.tsx to persist");
    setPw({ cur:"", nw:"", cf:"" });
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:560 }}>

      {/* ── Company Info ── */}
      <div className="card">
        <div className="card-hdr"><span style={{ fontWeight:700 }}>Company Information</span></div>
        <div style={{ padding:20, display:"flex", flexDirection:"column", gap:10 }}>
          {(["name","phone","email","address"] as const).map(k=>(
            <div key={k} className="fg" style={{ marginBottom:0 }}>
              <label style={LS}>{k.charAt(0).toUpperCase()+k.slice(1)}</label>
              <input style={IS} value={co[k]} onChange={e=>setCo(c=>({...c,[k]:e.target.value}))}/>
            </div>
          ))}
          <button className="btn b-dark" style={{ alignSelf:"flex-start", marginTop:4 }} onClick={()=>showToast("Saved")}>Save Info</button>
        </div>
      </div>

      {/* ── Change Password ── */}
      <div className="card">
        <div className="card-hdr"><span style={{ fontWeight:700 }}>Change Password</span></div>
        <div style={{ padding:20, display:"flex", flexDirection:"column", gap:10 }}>
          {([["cur","Current Password"],["nw","New Password"],["cf","Confirm New Password"]] as const).map(([k,l])=>(
            <div key={k} className="fg" style={{ marginBottom:0 }}>
              <label style={LS}>{l}</label>
              <input style={IS} type="password" value={pw[k]} onChange={e=>setPw(p=>({...p,[k]:e.target.value}))}/>
            </div>
          ))}
          <button className="btn b-dark" style={{ alignSelf:"flex-start", marginTop:4 }} onClick={changePw}>Update Password</button>
        </div>
      </div>

      {/* ── Database Backup ── */}
      <div className="card">
        <div className="card-hdr" style={{ background:"#f0fdf4" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"#dcfce7", border:"1px solid #bbf7d0", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
                <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:"#111827" }}>Database Backup</div>
              <div style={{ fontSize:11, color:"#6b7280" }}>ceyloncompasstravels · PostgreSQL</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, background:"#dcfce7", border:"1px solid #bbf7d0", padding:"4px 10px", borderRadius:999 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#16a34a", display:"inline-block", animation:"backupSpin 0s, pulse 2s infinite" }}/>
            <span style={{ fontSize:11, fontWeight:700, color:"#16a34a", letterSpacing:".04em" }}>CONNECTED</span>
          </div>
        </div>

        <div style={{ padding:20 }}>
          {/* Info rows */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
            {[
              { label:"Database",  val:"ceyloncompasstravels" },
              { label:"Format",    val:"Plain SQL (.sql)" },
              { label:"Host",      val:"localhost:5432" },
              { label:"Includes",  val:"Schema + All Data" },
            ].map(r => (
              <div key={r.label} style={{ background:"#f8f9fb", borderRadius:8, padding:"8px 12px" }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:".06em", marginBottom:2 }}>{r.label}</div>
                <div style={{ fontSize:12, fontWeight:600, color:"#374151", fontFamily:"monospace" }}>{r.val}</div>
              </div>
            ))}
          </div>

          {/* Button */}
          {backupStatus === "loading" ? (
            <button disabled style={{ width:"100%", background:"#f3f4f6", border:"1.5px solid #e5e7eb", borderRadius:8, padding:"11px", display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontSize:13, fontWeight:600, color:"#9ca3af", cursor:"not-allowed" }}>
              <span style={{ width:14, height:14, border:"2px solid #d1d5db", borderTopColor:"#9ca3af", borderRadius:"50%", display:"inline-block", animation:"backupSpin .7s linear infinite" }}/>
              Generating backup…
            </button>
          ) : (
            <button
              onClick={triggerBackup}
              style={{ width:"100%", background:"#111827", color:"#fff", border:"none", borderRadius:8, padding:"11px", display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontSize:13, fontWeight:700, cursor:"pointer", transition:"all .15s", fontFamily:"'Sora',sans-serif" }}
              onMouseEnter={e=>(e.currentTarget.style.background="#1f2937")}
              onMouseLeave={e=>(e.currentTarget.style.background="#111827")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download Backup Now
            </button>
          )}

          {/* Status message */}
          {(backupStatus === "success" || backupStatus === "error") && (
            <div
              onClick={() => { setBackupStatus("idle"); setBackupMessage(""); }}
              title="Click to dismiss"
              style={{
                marginTop:10, padding:"9px 12px", borderRadius:8, fontSize:12, fontWeight:600,
                display:"flex", alignItems:"center", gap:8, cursor:"pointer",
                animation:"backupFadeIn .2s ease",
                ...(backupStatus === "success"
                  ? { background:"#f0fdf4", border:"1px solid #bbf7d0", color:"#16a34a" }
                  : { background:"#fef2f2", border:"1px solid #fecaca", color:"#dc2626" })
              }}
            >
              {backupStatus === "success"
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              }
              {backupMessage}
              <span style={{ marginLeft:"auto", fontSize:10, opacity:.6 }}>click to dismiss</span>
            </div>
          )}

          {/* Last backup */}
          {lastBackup && (
            <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid #f0f0f0" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:".06em", marginBottom:3 }}>Last backup</div>
              <div style={{ fontSize:11, color:"#6b7280", fontFamily:"monospace", wordBreak:"break-all" }}>{lastBackup}</div>
            </div>
          )}

          <p style={{ fontSize:11, color:"#9ca3af", marginTop:12, lineHeight:1.5 }}>
            Runs <code style={{ background:"#f3f4f6", padding:"1px 5px", borderRadius:4, fontSize:10 }}>pg_dump</code> on the server and streams the file directly to your browser. No files are stored on the server.
          </p>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="card" style={{ border:"1px solid #fecaca" }}>
        <div className="card-hdr" style={{ background:"#fef2f2" }}><span style={{ fontWeight:700, color:"#dc2626" }}>Danger Zone</span></div>
        <div style={{ padding:20 }}>
          <p style={{ fontSize:13, color:"#6b7280", marginBottom:12 }}>Re-run schema.sql on your database to reset all tables to defaults.</p>
          <code style={{ display:"block", background:"#f8f9fb", border:"1px solid #e5e7eb", borderRadius:8, padding:"10px 14px", fontSize:12, color:"#374151", marginBottom:12 }}>
            psql -U parisadmin -d ceyloncompasstravels -f schema.sql
          </code>
        </div>
      </div>

    </div>
  );
}