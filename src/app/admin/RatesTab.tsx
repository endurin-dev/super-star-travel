"use client";
// app/admin/RatesTab.tsx

import { useState, useRef } from "react";

interface Rate {
  id: string;
  fromLocId: string; toLocId: string; vehicleId: string;
  fromLocName: string; toLocName: string; vehicleName: string;
  p1: number | null;
  p2: number | null;
  p3: number | null;
  p4: number | null;
  p5: number | null;
  p6: number | null;
  p7: number | null;
  p8: number | null;
  // 9+ = p8 * 2 automatically
  onDemand: boolean; active: boolean;
}
interface Location { id: string; name: string; categoryIcon: string; active: boolean; }
interface Vehicle  { id: string; name: string; tag: string; active: boolean; }

// ── Price calculator ─────────────────────────────────────────
// Used here AND in reservation page
export const calcPrice = (
  rate: Pick<Rate,"p1"|"p2"|"p3"|"p4"|"p5"|"p6"|"p7"|"p8"|"onDemand">,
  pax: number
): number | null => {
  if (rate.onDemand) return null;
  if (pax >= 9) return rate.p8 ? rate.p8 * 2 : null;  // auto-double p8
  const map: Record<number, number|null> = {
    1: rate.p1, 2: rate.p2, 3: rate.p3, 4: rate.p4,
    5: rate.p5, 6: rate.p6, 7: rate.p7, 8: rate.p8,
  };
  return map[pax] ?? null;
};

const PAX_FIELDS = [
  { key:"p1", label:"1 Pax" },
  { key:"p2", label:"2 Pax" },
  { key:"p3", label:"3 Pax" },
  { key:"p4", label:"4 Pax" },
  { key:"p5", label:"5 Pax" },
  { key:"p6", label:"6 Pax" },
  { key:"p7", label:"7 Pax" },
  { key:"p8", label:"8 Pax" },
] as const;

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

const IS: React.CSSProperties = {
  width:"100%", border:"1.5px solid #e5e7eb", borderRadius:8,
  padding:"10px 12px", fontSize:13, color:"#111827",
  outline:"none", fontFamily:"inherit", background:"#fff",
  boxSizing:"border-box" as const,
};
const LS: React.CSSProperties = {
  fontSize:11, fontWeight:600, color:"#374151",
  marginBottom:4, display:"block", letterSpacing:"0.05em",
  textTransform:"uppercase" as const,
};

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <label style={{ position:"relative", display:"inline-block", width:40, height:22, cursor:"pointer" }}>
      <input type="checkbox" checked={on} onChange={onChange} style={{ opacity:0, width:0, height:0 }} />
      <span style={{ position:"absolute", inset:0, background:on?"#16a34a":"#d1d5db", borderRadius:22, transition:".2s" }}>
        <span style={{ position:"absolute", width:16, height:16, left:on?21:3, bottom:3, background:"#fff", borderRadius:"50%", transition:".2s" }} />
      </span>
    </label>
  );
}

const emptyPrices = () => ({ p1:"",p2:"",p3:"",p4:"",p5:"",p6:"",p7:"",p8:"" });

export default function RatesTab({
  rates, setRates, locations, vehicles, showToast,
}: {
  rates: Rate[];
  setRates: React.Dispatch<React.SetStateAction<Rate[]>>;
  locations: Location[];
  vehicles: Vehicle[];
  showToast: (m: string, t?: "success"|"error") => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [modal,      setModal]      = useState<"add"|"edit"|"bulk"|null>(null);
  const [edit,       setEdit]       = useState<Rate|null>(null);
  const [search,     setSearch]     = useState("");
  const [filterFrom, setFilterFrom] = useState("All");
  const [filterVeh,  setFilterVeh]  = useState("All");
  const [paxView,    setPaxView]    = useState<"all"|string>("all"); // which pax col to show in table

  // ── Single add/edit form ──────────────────────────────────────
  const emptyForm = {
    fromLocId:"", toLocId:"", vehicleId:"",
    p1:null as number|null, p2:null as number|null,
    p3:null as number|null, p4:null as number|null,
    p5:null as number|null, p6:null as number|null,
    p7:null as number|null, p8:null as number|null,
    onDemand:false, active:true,
  };
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const ff = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  // ── Bulk add form — one row per vehicle, prices per pax ───────
  const [bulkRoute, setBulkRoute] = useState({ fromLocId:"", toLocId:"", onDemand:false, active:true });
  // vehiclePrices[vehicleId][paxKey] = price string
  const [vehiclePrices, setVehiclePrices] = useState<Record<string, Record<string,string>>>({});

  const openAdd = () => { setForm(emptyForm); setEdit(null); setModal("add"); };
  const openEdit = (r: Rate) => {
    setForm({
      fromLocId:r.fromLocId, toLocId:r.toLocId, vehicleId:r.vehicleId,
      p1:r.p1, p2:r.p2, p3:r.p3, p4:r.p4,
      p5:r.p5, p6:r.p6, p7:r.p7, p8:r.p8,
      onDemand:r.onDemand, active:r.active,
    });
    setEdit(r); setModal("edit");
  };
  const openBulk = () => {
    setBulkRoute({ fromLocId:"", toLocId:"", onDemand:false, active:true });
    const init: Record<string, Record<string,string>> = {};
    vehicles.filter(v=>v.active).forEach(v => { init[v.id] = emptyPrices(); });
    setVehiclePrices(init);
    setModal("bulk");
  };

  // ── Helpers to parse/build price payload ──────────────────────
  const toNum = (s: string) => { const n = parseInt(s); return isNaN(n) ? null : n; };
  const formPrices = (prices: Record<string,string>) => ({
    p1: toNum(prices.p1), p2: toNum(prices.p2),
    p3: toNum(prices.p3), p4: toNum(prices.p4),
    p5: toNum(prices.p5), p6: toNum(prices.p6),
    p7: toNum(prices.p7), p8: toNum(prices.p8),
  });

  // ── Save single rate ──────────────────────────────────────────
  const save = async () => {
    if (!form.fromLocId||!form.toLocId) return showToast("From and To required","error");
    if (form.fromLocId===form.toLocId)  return showToast("Cannot be the same location","error");
    if (!form.vehicleId)                return showToast("Vehicle required","error");
    if (!form.onDemand && !form.p1)     return showToast("Enter at least 1-pax price or mark On Demand","error");
    try {
      const payload = form.onDemand
        ? { ...form, p1:null,p2:null,p3:null,p4:null,p5:null,p6:null,p7:null,p8:null }
        : form;
      if (modal==="add") {
        const saved = await api("/api/rates","POST",{ ...payload, id:uid() });
        setRates(rs => {
          const ex = rs.find(r=>r.fromLocId===form.fromLocId&&r.toLocId===form.toLocId&&r.vehicleId===form.vehicleId);
          return ex ? rs.map(r=>r.fromLocId===form.fromLocId&&r.toLocId===form.toLocId&&r.vehicleId===form.vehicleId?saved:r) : [...rs,saved];
        });
        showToast("Rate added");
      } else if (edit) {
        const saved = await api("/api/rates","PUT",{ ...edit,...payload });
        setRates(rs=>rs.map(r=>r.id===edit.id?saved:r));
        showToast("Rate updated");
      }
      setModal(null);
    } catch { showToast("Save failed","error"); }
  };

  // ── Save bulk (all vehicles for one route) ────────────────────
  const saveBulk = async () => {
    if (!bulkRoute.fromLocId||!bulkRoute.toLocId) return showToast("From and To required","error");
    if (bulkRoute.fromLocId===bulkRoute.toLocId)  return showToast("Cannot be the same location","error");
    const activeVehicles = vehicles.filter(v=>v.active);
    const hasAnyPrice = activeVehicles.some(v => Object.values(vehiclePrices[v.id]??{}).some(x=>x.trim()));
    if (!bulkRoute.onDemand && !hasAnyPrice) return showToast("Enter at least one price or enable On Demand","error");

    let added = 0;
    for (const v of activeVehicles) {
      const prices = formPrices(vehiclePrices[v.id] ?? emptyPrices());
      const hasPrice = Object.values(prices).some(x=>x!==null);
      if (!bulkRoute.onDemand && !hasPrice) continue;
      try {
        const saved = await api("/api/rates","POST",{
          id: uid(),
          fromLocId: bulkRoute.fromLocId,
          toLocId:   bulkRoute.toLocId,
          vehicleId: v.id,
          ...(bulkRoute.onDemand ? { p1:null,p2:null,p3:null,p4:null,p5:null,p6:null,p7:null,p8:null } : prices),
          onDemand: bulkRoute.onDemand,
          active:   bulkRoute.active,
        });
        setRates(rs => {
          const ex = rs.find(r=>r.fromLocId===bulkRoute.fromLocId&&r.toLocId===bulkRoute.toLocId&&r.vehicleId===v.id);
          return ex
            ? rs.map(r=>r.fromLocId===bulkRoute.fromLocId&&r.toLocId===bulkRoute.toLocId&&r.vehicleId===v.id?saved:r)
            : [...rs,saved];
        });
        added++;
      } catch {}
    }
    showToast(`Saved ${added} rate${added!==1?"s":""}`);
    setModal(null);
  };

  const del = async (id: string) => {
    if (!confirm("Delete this rate?")) return;
    try { await api(`/api/rates?id=${id}`,"DELETE"); setRates(rs=>rs.filter(r=>r.id!==id)); showToast("Deleted"); }
    catch { showToast("Delete failed","error"); }
  };

  const tog = async (r: Rate) => {
    const u = { ...r, active:!r.active };
    await api("/api/rates","PUT",u);
    setRates(rs=>rs.map(x=>x.id===r.id?u:x));
  };

  // ── Excel import ──────────────────────────────────────────────
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const XLSX = await import("xlsx");
      const data = await file.arrayBuffer();
      const rows: any[] = XLSX.utils.sheet_to_json(XLSX.read(data).Sheets[XLSX.read(data).SheetNames[0]]);
      let n = 0;
      const p = (v: any) => { if (!v) return null; const x=parseInt(String(v).replace(/[€\s]/g,"")); return isNaN(x)?null:x; };
      for (const row of rows) {
        const fromName    = (row["DEPART"]??row["From"]??"").toString().trim();
        const toName      = (row["ARRIVAL"]??row["To"]??"").toString().trim();
        const vehicleName = (row["VEHICLE"]??row["Vehicle"]??"").toString().trim();
        if (!fromName||!toName||!vehicleName) continue;
        const fromLoc = locations.find(l=>l.name.toLowerCase()===fromName.toLowerCase());
        const toLoc   = locations.find(l=>l.name.toLowerCase()===toName.toLowerCase());
        const veh     = vehicles.find(v=>v.name.toLowerCase().includes(vehicleName.toLowerCase())||vehicleName.toLowerCase().includes(v.id));
        if (!fromLoc||!toLoc||!veh) continue;
        try {
          const saved = await api("/api/rates","POST",{
            id: uid(),
            fromLocId: fromLoc.id, toLocId: toLoc.id, vehicleId: veh.id,
            p1:p(row["1 PAX"]??row["P1"]), p2:p(row["2 PAX"]??row["P2"]),
            p3:p(row["3 PAX"]??row["P3"]), p4:p(row["4 PAX"]??row["P4"]),
            p5:p(row["5 PAX"]??row["P5"]), p6:p(row["6 PAX"]??row["P6"]),
            p7:p(row["7 PAX"]??row["P7"]), p8:p(row["8 PAX"]??row["P8"]),
            onDemand: false, active: true,
          });
          setRates(rs=>{ const ex=rs.find(r=>r.fromLocId===fromLoc.id&&r.toLocId===toLoc.id&&r.vehicleId===veh.id); return ex?rs.map(r=>r.fromLocId===fromLoc.id&&r.toLocId===toLoc.id&&r.vehicleId===veh.id?saved:r):[...rs,saved]; });
          n++;
        } catch {}
      }
      showToast(`Imported ${n} rates`);
    } catch { showToast("Import failed","error"); }
    if (fileRef.current) fileRef.current.value="";
  };

  // ── Table filtering ───────────────────────────────────────────
  const uniqueFroms = ["All",...Array.from(new Set(rates.map(r=>r.fromLocName))).sort()];
  const uniqueVehs  = ["All",...Array.from(new Set(rates.map(r=>r.vehicleName))).sort()];
  const shown = rates.filter(r => {
    if (filterFrom!=="All" && r.fromLocName!==filterFrom) return false;
    if (filterVeh!=="All"  && r.vehicleName!==filterVeh)  return false;
    if (search && !`${r.fromLocName} ${r.toLocName} ${r.vehicleName}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Vehicle color badges
  const vehColor: Record<string,{bg:string;c:string}> = {
    sedan:{bg:"#dbeafe",c:"#2563eb"}, van:{bg:"#dcfce7",c:"#16a34a"},
    suv:{bg:"#ffedd5",c:"#f97316"},   minibus:{bg:"#ede9fe",c:"#7c3aed"},
  };
  const vBadge = (vId: string, name: string) => {
    const s = vehColor[vId] ?? {bg:"#f3f4f6",c:"#6b7280"};
    return <span style={{background:s.bg,color:s.c,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:999}}>{name}</span>;
  };

  const fmtPrice = (r: Rate, pax: number) => {
    if (r.onDemand) return <span style={{fontSize:10,color:"#9ca3af",fontStyle:"italic"}}>On demand</span>;
    const price = calcPrice(r, pax);
    if (price===null) return <span style={{color:"#d1d5db"}}>—</span>;
    const isDouble = pax >= 9;
    return (
      <span>
        <span style={{fontWeight:700,fontSize:13}}>€{price}</span>
        {isDouble && <span style={{fontSize:9,color:"#f97316",marginLeft:3}}>×2</span>}
      </span>
    );
  };

  // Which pax column to show
  const paxCols = paxView === "all"
    ? [1,2,3,4,5,6,7,8,9]
    : [parseInt(paxView)];

  // ── Price input grid (reused in both modals) ──────────────────
  const PriceGrid = ({
    prices, onChange, color = "#111827"
  }: {
    prices: Record<string,string>;
    onChange: (k: string, v: string) => void;
    color?: string;
  }) => (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:10 }}>
      {PAX_FIELDS.map(({key,label}) => (
        <div key={key}>
          <label style={{...LS, color, fontSize:10}}>{label}</label>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",fontSize:12,fontWeight:700,color,pointerEvents:"none"}}>€</span>
            <input
              style={{...IS, paddingLeft:20, padding:"8px 8px 8px 20px", fontSize:13, textAlign:"center" as const}}
              type="number" min={0} placeholder="—"
              value={prices[key] ?? ""}
              onChange={e=>onChange(key, e.target.value)}
            />
          </div>
        </div>
      ))}
      {/* 9+ preview */}
      <div style={{gridColumn:"span 4", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:8, padding:"8px 12px", display:"flex", alignItems:"center", gap:8}}>
        <span style={{fontSize:11,color:"#16a34a",fontWeight:700}}>9+ Pax:</span>
        <span style={{fontSize:13,fontWeight:800,color:"#111827"}}>
          {prices.p8 ? `€${parseInt(prices.p8)*2}` : "Auto (8 pax × 2)"}
        </span>
        <span style={{fontSize:10,color:"#6b7280",marginLeft:4}}>calculated automatically</span>
      </div>
    </div>
  );

  return (
    <div>
      {/* ── Toolbar ── */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search routes…"
          style={{...IS,width:180,padding:"8px 11px"}}/>
        <select value={filterFrom} onChange={e=>setFilterFrom(e.target.value)}
          style={{...IS,width:170,padding:"8px 11px",cursor:"pointer"}}>
          {uniqueFroms.map(f=><option key={f}>{f}</option>)}
        </select>
        <select value={filterVeh} onChange={e=>setFilterVeh(e.target.value)}
          style={{...IS,width:160,padding:"8px 11px",cursor:"pointer"}}>
          {uniqueVehs.map(v=><option key={v}>{v}</option>)}
        </select>

        {/* Pax column selector */}
        <select value={paxView} onChange={e=>setPaxView(e.target.value)}
          style={{...IS,width:150,padding:"8px 11px",cursor:"pointer"}}>
          <option value="all">All pax columns</option>
          {[1,2,3,4,5,6,7,8,9].map(n=><option key={n} value={n}>{n}{n===9?"+ Pax":" Pax"}</option>)}
        </select>

        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <label style={{display:"inline-flex",alignItems:"center",gap:5,padding:"7px 13px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",background:"#dbeafe",color:"#2563eb",border:"none"}}>
            ↑ Import Excel
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} style={{display:"none"}}/>
          </label>
          <button onClick={openBulk}
            style={{display:"inline-flex",alignItems:"center",gap:5,padding:"7px 13px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",background:"#f0fdf4",color:"#16a34a",border:"1px solid #bbf7d0"}}>
            ⚡ Add Route (All Vehicles)
          </button>
          <button onClick={openAdd}
            style={{display:"inline-flex",alignItems:"center",gap:5,padding:"7px 13px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",background:"#f97316",color:"#0a0f1a",border:"none"}}>
            + Add Single Rate
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
        {[
          {l:"Total Rates",v:rates.length,                                              c:"#111827"},
          {l:"Active",     v:rates.filter(r=>r.active).length,                         c:"#16a34a"},
          {l:"On Demand",  v:rates.filter(r=>r.onDemand).length,                       c:"#f97316"},
          {l:"Routes",     v:new Set(rates.map(r=>`${r.fromLocId}-${r.toLocId}`)).size, c:"#2563eb"},
        ].map(s=>(
          <div key={s.l} style={{background:"#fff",border:"1px solid #f0f0f0",borderRadius:10,padding:"10px 16px",minWidth:100}}>
            <div style={{fontSize:22,fontWeight:800,color:s.c}}>{s.v}</div>
            <div style={{fontSize:11,color:"#9ca3af",marginTop:1}}>{s.l}</div>
          </div>
        ))}
        <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"10px 16px",flex:1}}>
          <div style={{fontSize:12,fontWeight:700,color:"#16a34a",marginBottom:2}}>💡 Pricing Rule</div>
          <div style={{fontSize:11,color:"#166534"}}>1–8 pax: individual prices · 9+ pax: 8-pax price × 2 (auto)</div>
        </div>
      </div>

      {/* ── Import hint ── */}
      <div style={{background:"#fff7ed",border:"1px solid #fdba74",borderRadius:9,padding:"10px 14px",fontSize:12,color:"#9a3412",marginBottom:14}}>
        📋 Excel columns: <strong>DEPART, ARRIVAL, VEHICLE, 1 PAX, 2 PAX, 3 PAX, 4 PAX, 5 PAX, 6 PAX, 7 PAX, 8 PAX</strong>
      </div>

      {/* ── Table ── */}
      <div style={{background:"#fff",border:"1px solid #f0f0f0",borderRadius:14,overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{background:"#f8f9fb"}}>
                {["From","To","Vehicle"].map(h=>(
                  <th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:700,letterSpacing:".07em",textTransform:"uppercase" as const,color:"#9ca3af",borderBottom:"1px solid #f0f0f0",whiteSpace:"nowrap"}}>{h}</th>
                ))}
                {paxCols.map(n=>(
                  <th key={n} style={{padding:"9px 10px",textAlign:"center",fontSize:11,fontWeight:700,letterSpacing:".07em",textTransform:"uppercase" as const,color: n===9?"#f97316":"#9ca3af",borderBottom:"1px solid #f0f0f0",whiteSpace:"nowrap",background:n===9?"#fff7ed":"#f8f9fb"}}>
                    {n===9?"9+ ×2":`${n} Pax`}
                  </th>
                ))}
                {["Active","Actions"].map(h=>(
                  <th key={h} style={{padding:"9px 12px",textAlign:"center",fontSize:11,fontWeight:700,letterSpacing:".07em",textTransform:"uppercase" as const,color:"#9ca3af",borderBottom:"1px solid #f0f0f0"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.length===0 && (
                <tr><td colSpan={4+paxCols.length+2} style={{padding:28,textAlign:"center",color:"#9ca3af"}}>No rates found</td></tr>
              )}
              {shown.map(r=>(
                <tr key={r.id} style={{borderBottom:"1px solid #f8f9fb",opacity:r.active?1:0.5}}>
                  <td style={{padding:"10px 12px"}}>
                    <span style={{background:"#f3f4f6",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700}}>{r.fromLocName}</span>
                  </td>
                  <td style={{padding:"10px 12px",fontSize:13}}>{r.toLocName}</td>
                  <td style={{padding:"10px 12px"}}>{vBadge(r.vehicleId,r.vehicleName)}</td>
                  {paxCols.map(n=>(
                    <td key={n} style={{padding:"10px 10px",textAlign:"center",background:n===9?"rgba(251,191,36,0.04)":"transparent"}}>
                      {fmtPrice(r,n)}
                    </td>
                  ))}
                  <td style={{padding:"10px 12px",textAlign:"center"}}>
                    <Toggle on={r.active} onChange={()=>tog(r)}/>
                  </td>
                  <td style={{padding:"10px 12px"}}>
                    <div style={{display:"flex",gap:4,justifyContent:"center"}}>
                      <button onClick={()=>openEdit(r)} style={{padding:"4px 9px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",background:"#f3f4f6",color:"#374151",border:"none"}}>Edit</button>
                      <button onClick={()=>del(r.id)}   style={{padding:"4px 9px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",background:"#fee2e2",color:"#dc2626",border:"none"}}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ BULK MODAL ══ */}
      {modal==="bulk" && (
        <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.55)",backdropFilter:"blur(4px)"}} onClick={()=>setModal(null)}/>
          <div style={{position:"relative",background:"#fff",borderRadius:16,width:"100%",maxWidth:680,maxHeight:"92vh",overflow:"auto",boxShadow:"0 24px 80px rgba(0,0,0,.2)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 24px",borderBottom:"1px solid #f0f0f0",position:"sticky",top:0,background:"#fff",zIndex:1}}>
              <div>
                <h3 style={{fontSize:16,fontWeight:700,color:"#111827",margin:0}}>Add Route — All Vehicles</h3>
                <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{vehicles.filter(v=>v.active).length} vehicles · 8 prices each · 9+ auto-doubles</div>
              </div>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}}>×</button>
            </div>
            <div style={{padding:24}}>
              {/* Route */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                <div>
                  <label style={LS}>Departure *</label>
                  <select style={IS} value={bulkRoute.fromLocId} onChange={e=>setBulkRoute(r=>({...r,fromLocId:e.target.value}))}>
                    <option value="">— Select —</option>
                    {locations.filter(l=>l.active).map(l=><option key={l.id} value={l.id}>{l.categoryIcon} {l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={LS}>Destination *</label>
                  <select style={IS} value={bulkRoute.toLocId} onChange={e=>setBulkRoute(r=>({...r,toLocId:e.target.value}))}>
                    <option value="">— Select —</option>
                    {locations.filter(l=>l.active).map(l=><option key={l.id} value={l.id} disabled={l.id===bulkRoute.fromLocId}>{l.categoryIcon} {l.name}</option>)}
                  </select>
                </div>
              </div>

              {/* On Demand */}
              <label style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,cursor:"pointer",padding:"10px 14px",background:bulkRoute.onDemand?"#fff7ed":"#f8f9fb",borderRadius:10,border:`1.5px solid ${bulkRoute.onDemand?"#fdba74":"#e5e7eb"}`}}>
                <Toggle on={bulkRoute.onDemand} onChange={()=>setBulkRoute(r=>({...r,onDemand:!r.onDemand}))}/>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:bulkRoute.onDemand?"#f97316":"#374151"}}>On Demand</div>
                  <div style={{fontSize:11,color:"#9ca3af",marginTop:1}}>No fixed price — customer contacts for quote</div>
                </div>
              </label>

              {/* Per-vehicle price grids */}
              {!bulkRoute.onDemand && (() => {
                const activeVehicles = vehicles.filter(v=>v.active);
                if (activeVehicles.length===0) return (
                  <div style={{padding:"14px 16px",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,fontSize:13,color:"#dc2626",marginBottom:14}}>
                    No active vehicles. Add vehicles first.
                  </div>
                );
                const colors = ["#2563eb","#16a34a","#f97316","#7c3aed","#0891b2","#db2777","#ea580c","#356b9a"];
                return activeVehicles.map((v,i) => {
                  const color = colors[i % colors.length];
                  const existing = rates.find(r=>r.fromLocId===bulkRoute.fromLocId&&r.toLocId===bulkRoute.toLocId&&r.vehicleId===v.id);
                  return (
                    <div key={v.id} style={{marginBottom:20,padding:16,background:"#fafafa",borderRadius:12,border:`1.5px solid ${color}22`}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                        <div style={{width:10,height:10,borderRadius:"50%",background:color,flexShrink:0}}/>
                        <span style={{fontSize:13,fontWeight:800,color,textTransform:"uppercase" as const,letterSpacing:".04em"}}>{v.name}</span>
                        {v.tag && <span style={{fontSize:10,color:"#9ca3af"}}>({v.tag})</span>}
                        {existing && <span style={{marginLeft:"auto",fontSize:10,color:"#9ca3af"}}>⚠ existing rate will be overwritten</span>}
                      </div>
                      <PriceGrid
                        prices={vehiclePrices[v.id] ?? emptyPrices()}
                        onChange={(k,val) => setVehiclePrices(p=>({...p,[v.id]:{...(p[v.id]??emptyPrices()),[k]:val}}))}
                        color={color}
                      />
                    </div>
                  );
                });
              })()}

              {/* Active */}
              <label style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,cursor:"pointer"}}>
                <Toggle on={bulkRoute.active} onChange={()=>setBulkRoute(r=>({...r,active:!r.active}))}/>
                <span style={{fontSize:13,fontWeight:500}}>Active (visible on rates page)</span>
              </label>

              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setModal(null)} style={{flex:1,padding:"12px",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer",background:"#f3f4f6",color:"#374151",border:"none"}}>Cancel</button>
                <button onClick={saveBulk} style={{flex:2,padding:"12px",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer",background:"#111827",color:"#fff",border:"none"}}>Save Rates for All Vehicles</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ SINGLE ADD/EDIT MODAL ══ */}
      {(modal==="add"||modal==="edit") && (
        <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.55)",backdropFilter:"blur(4px)"}} onClick={()=>setModal(null)}/>
          <div style={{position:"relative",background:"#fff",borderRadius:16,width:"100%",maxWidth:560,maxHeight:"92vh",overflow:"auto",boxShadow:"0 24px 80px rgba(0,0,0,.2)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 24px",borderBottom:"1px solid #f0f0f0",position:"sticky",top:0,background:"#fff",zIndex:1}}>
              <h3 style={{fontSize:16,fontWeight:700,color:"#111827",margin:0}}>
                {modal==="add"?"Add Single Rate":`Edit — ${edit?.fromLocName} → ${edit?.toLocName}`}
              </h3>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}}>×</button>
            </div>
            <div style={{padding:24}}>
              {/* Route + Vehicle */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                <div>
                  <label style={LS}>Departure *</label>
                  <select style={IS} value={form.fromLocId} onChange={e=>ff("fromLocId",e.target.value)}>
                    <option value="">— Select —</option>
                    {locations.filter(l=>l.active).map(l=><option key={l.id} value={l.id}>{l.categoryIcon} {l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={LS}>Destination *</label>
                  <select style={IS} value={form.toLocId} onChange={e=>ff("toLocId",e.target.value)}>
                    <option value="">— Select —</option>
                    {locations.filter(l=>l.active).map(l=><option key={l.id} value={l.id} disabled={l.id===form.fromLocId}>{l.categoryIcon} {l.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{marginBottom:14}}>
                <label style={LS}>Vehicle *</label>
                <select style={IS} value={form.vehicleId} onChange={e=>ff("vehicleId",e.target.value)}>
                  <option value="">— Select vehicle —</option>
                  {vehicles.filter(v=>v.active).map(v=><option key={v.id} value={v.id}>{v.name}{v.tag?` — ${v.tag}`:""}</option>)}
                </select>
              </div>

              {/* On Demand */}
              <label style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,cursor:"pointer"}}>
                <Toggle on={form.onDemand} onChange={()=>ff("onDemand",!form.onDemand)}/>
                <span style={{fontSize:13,fontWeight:600,color:form.onDemand?"#f97316":"#374151"}}>On Demand</span>
              </label>

              {/* Price grid */}
              {!form.onDemand && (
                <>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase" as const,color:"#9ca3af",marginBottom:10}}>
                    Price per passenger count (€)
                  </div>
                  <PriceGrid
                    prices={{
                      p1: form.p1?.toString()??"", p2: form.p2?.toString()??"",
                      p3: form.p3?.toString()??"", p4: form.p4?.toString()??"",
                      p5: form.p5?.toString()??"", p6: form.p6?.toString()??"",
                      p7: form.p7?.toString()??"", p8: form.p8?.toString()??"",
                    }}
                    onChange={(k, val) => ff(k, val===""?null:parseInt(val))}
                  />
                </>
              )}

              {/* Active */}
              <label style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,cursor:"pointer"}}>
                <Toggle on={form.active} onChange={()=>ff("active",!form.active)}/>
                <span style={{fontSize:13,fontWeight:500}}>Active</span>
              </label>

              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setModal(null)} style={{flex:1,padding:"12px",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer",background:"#f3f4f6",color:"#374151",border:"none"}}>Cancel</button>
                <button onClick={save} style={{flex:2,padding:"12px",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer",background:"#111827",color:"#fff",border:"none"}}>{modal==="add"?"Add Rate":"Save Changes"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}