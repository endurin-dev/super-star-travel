"use client";
// app/admin/CalendarTab.tsx

import { useState, useMemo } from "react";

interface Booking {
  id: string; from: string; to: string;
  date: string; time: string;
  passengers: number; kids: number; bags: number;
  vehicleId: string; name: string; country: string;
  whatsapp: string; email: string; notes: string;
  status: "new"|"confirmed"|"cancelled"; createdAt: string;
}
interface Vehicle { id: string; name: string; img: string; }

function parseNotes(notes: string) {
  const parts = (notes ?? "").split("|").map(s => s.trim()).filter(Boolean);
  let isRoundTrip = false;
  let flightTrain = "";
  const freeText: string[] = [];
  parts.forEach(p => {
    if (p === "ROUND TRIP")                   isRoundTrip = true;
    else if (p.startsWith("Flight/Train: "))  flightTrain = p.replace("Flight/Train: ", "");
    else if (!p.startsWith("Address: "))      freeText.push(p);
  });
  return { isRoundTrip, flightTrain, freeText: freeText.join(" | ") };
}

const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Vehicle color mapping for visual variety
const VEH_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  sedan:   { bg:"#e7f0f8", text:"#356b9a", border:"#b8cee0" },
  van:     { bg:"#f1f5f9", text:"#475569", border:"#cbd5e1" },
  suv:     { bg:"#ffedd5", text:"#9a3412", border:"#fb923c" },
  minibus: { bg:"#fff7ed", text:"#c2410c", border:"#fdba74" },
};
const defaultColor = { bg:"#f3f4f6", text:"#374151", border:"#d1d5db" };
const getVehColor = (id: string) => VEH_COLORS[id] ?? defaultColor;

export default function CalendarTab({
  bookings, vehicles,
}: {
  bookings: Booking[];
  vehicles: Vehicle[];
}) {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [sel,   setSel]   = useState<Booking | null>(null);
  const [view,  setView]  = useState<"month"|"list">("month");

  // Only confirmed bookings
  const confirmed = useMemo(
    () => bookings.filter(b => b.status === "confirmed"),
    [bookings]
  );

  // Group confirmed bookings by date string "YYYY-MM-DD"
  const byDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    confirmed.forEach(b => {
      if (!b.date) return;
      const existing = map.get(b.date) ?? [];
      map.set(b.date, [...existing, b]);
    });
    return map;
  }, [confirmed]);

  // Calendar grid for current month
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  const prevMonth = () => { if (month===0) { setMonth(11); setYear(y=>y-1); } else setMonth(m=>m-1); };
  const nextMonth = () => { if (month===11) { setMonth(0); setYear(y=>y+1); } else setMonth(m=>m+1); };

  const vName = (id: string) => vehicles.find(v=>v.id===id)?.name ?? id;

  // List view: bookings sorted by date for current month
  const monthStr = `${year}-${String(month+1).padStart(2,"0")}`;
  const listBookings = useMemo(() =>
    confirmed
      .filter(b => b.date?.startsWith(monthStr))
      .sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
    [confirmed, monthStr]
  );

  const S = {
    card: {
      background:"#fff", border:"1px solid #f0f0f0",
      borderRadius:14, overflow:"hidden" as const,
    },
  };

  return (
    <div>
      <style>{`
        .cal-day{min-height:90px;border-right:1px solid #e7edf3;border-bottom:1px solid #e7edf3;padding:7px;vertical-align:top;position:relative;cursor:default}
        .cal-day:hover{background:#f8fafc}
        .cal-day.today{background:#fff7ed}
        .cal-day.other-month{background:#f8fafc}
        .cal-day.has-bookings{cursor:pointer}
        .cal-event{display:flex;align-items:center;gap:4px;padding:2px 6px;border-radius:5px;font-size:11px;font-weight:600;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;border-width:1px;border-style:solid}
        .cal-event:hover{opacity:.85}
        .cal-hdr-cell{padding:9px 6px;text-align:center;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#64748b;border-right:1px solid #e7edf3;border-bottom:1px solid #e7edf3;background:#f8fafc}
        .cal-more{font-size:10px;color:#6b7280;font-weight:600;padding:1px 5px;border-radius:4px;background:#f3f4f6;cursor:pointer;display:inline-block;margin-top:1px}
        .cal-more:hover{background:#e5e7eb}
        @keyframes calFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .cal-fade{animation:calFadeIn .2s ease}
        .view-btn{padding:7px 14px;border-radius:9px;font-size:11px;font-weight:650;cursor:pointer;border:1px solid #e5e7eb;font-family:inherit;transition:all .15s}
        .view-btn.active{background:#18324b;color:#fff;border-color:#18324b}
        .view-btn:not(.active){background:#fff;color:#374151}
        .view-btn:not(.active):hover{background:#f3f4f6}
      `}</style>

      {/* ── Header ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={prevMonth} style={{ width:34,height:34,borderRadius:8,border:"1px solid #e5e7eb",background:"#fff",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>‹</button>
          <div style={{ minWidth:180, textAlign:"center" }}>
            <div style={{ fontSize:18, fontWeight:700, color:"#111827" }}>{MONTHS[month]} {year}</div>
            <div style={{ fontSize:11, color:"#9ca3af", marginTop:1 }}>{confirmed.filter(b=>b.date?.startsWith(monthStr)).length} confirmed booking{confirmed.filter(b=>b.date?.startsWith(monthStr)).length!==1?"s":""}</div>
          </div>
          <button onClick={nextMonth} style={{ width:34,height:34,borderRadius:8,border:"1px solid #e5e7eb",background:"#fff",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>›</button>
          <button onClick={()=>{ setYear(today.getFullYear()); setMonth(today.getMonth()); }}
            style={{ padding:"5px 12px",borderRadius:7,border:"1px solid #e5e7eb",background:"#fff",cursor:"pointer",fontSize:11,fontWeight:600,color:"#374151" }}>
            Today
          </button>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {/* Legend */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {vehicles.filter(v=>confirmed.some(b=>b.vehicleId===v.id)).map(v => {
              const c = getVehColor(v.id);
              return (
                <div key={v.id} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#374151" }}>
                  <div style={{ width:10,height:10,borderRadius:3,background:c.bg,border:`1px solid ${c.border}`,flexShrink:0 }}/>
                  {v.name}
                </div>
              );
            })}
          </div>
          {/* View toggle */}
          <div style={{ display:"flex", gap:4 }}>
            <button className={`view-btn${view==="month"?" active":""}`} onClick={()=>setView("month")}>Month</button>
            <button className={`view-btn${view==="list"?" active":""}`} onClick={()=>setView("list")}>List</button>
          </div>
        </div>
      </div>

      {/* ── Month view ── */}
      {view === "month" && (
        <div style={S.card}>
          <table style={{ width:"100%", borderCollapse:"collapse", tableLayout:"fixed" }}>
            <thead>
              <tr>
                {DAYS.map(d => (
                  <th key={d} className="cal-hdr-cell" style={{ width:`${100/7}%` }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const cells: React.ReactNode[] = [];
                let day = 1;
                // blank cells before month starts
                for (let i = 0; i < firstDay; i++) cells.push(null);
                while (day <= daysInMonth) cells.push(day++);
                // pad to full weeks
                while (cells.length % 7 !== 0) cells.push(null);

                const rows: React.ReactNode[][] = [];
                for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i+7));

                return rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => {
                      if (cell === null) {
                        return <td key={ci} className="cal-day other-month"/>;
                      }
                      const d = cell as number;
                      const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                      const dayBookings = byDate.get(dateStr) ?? [];
                      const isToday = dateStr === todayStr;
                      const MAX_SHOW = 3;
                      const shown = dayBookings.slice(0, MAX_SHOW);
                      const extra = dayBookings.length - MAX_SHOW;

                      return (
                        <td key={ci} className={`cal-day${isToday?" today":""}${dayBookings.length>0?" has-bookings":""}`}>
                          {/* Day number */}
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                            <span style={{
                              fontSize:12, fontWeight:isToday?700:500,
                              color:isToday?"#16a34a":"#374151",
                              background:isToday?"#dcfce7":"transparent",
                              width:22,height:22,borderRadius:"50%",
                              display:"flex",alignItems:"center",justifyContent:"center",
                              flexShrink:0,
                            }}>{d}</span>
                          </div>

                          {/* Events */}
                          {shown.map(b => {
                            const c = getVehColor(b.vehicleId);
                            const { isRoundTrip } = parseNotes(b.notes);
                            return (
                              <div key={b.id} className="cal-event cal-fade"
                                style={{ background:c.bg, color:c.text, borderColor:c.border }}
                                onClick={e=>{ e.stopPropagation(); setSel(b); }}>
                                <span style={{ fontSize:10, flexShrink:0 }}>{b.time?.slice(0,5)}</span>
                                <span style={{ overflow:"hidden", textOverflow:"ellipsis" }}>
                                  {b.name.split(" ")[0]}{isRoundTrip?" 🔄":""}
                                </span>
                              </div>
                            );
                          })}
                          {extra > 0 && (
                            <div className="cal-more" onClick={e=>{ e.stopPropagation(); setSel(dayBookings[MAX_SHOW]); }}>
                              +{extra} more
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      )}

      {/* ── List view ── */}
      {view === "list" && (
        <div style={S.card}>
          {listBookings.length === 0 ? (
            <div style={{ padding:"60px 20px", textAlign:"center", color:"#9ca3af" }}>
              <div style={{ fontSize:32, marginBottom:8 }}>📅</div>
              No confirmed bookings in {MONTHS[month]} {year}
            </div>
          ) : (
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ background:"#f8f9fb" }}>
                  {["Date","Time","Client","Route","Vehicle","Pax","Type"].map(h=>(
                    <th key={h} style={{ padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:700,letterSpacing:".07em",textTransform:"uppercase" as const,color:"#9ca3af",borderBottom:"1px solid #f0f0f0",whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listBookings.map((b, i) => {
                  const c = getVehColor(b.vehicleId);
                  const { isRoundTrip } = parseNotes(b.notes);
                  // Group header for date change
                  const prevDate = i > 0 ? listBookings[i-1].date : null;
                  const showDateHeader = b.date !== prevDate;
                  return (
                    <>
                      {showDateHeader && (
                        <tr key={`hdr-${b.date}`}>
                          <td colSpan={7} style={{ padding:"10px 12px 4px", fontSize:11, fontWeight:700, color:"#374151", letterSpacing:".06em", textTransform:"uppercase" as const, background:"#f8f9fb", borderBottom:"1px solid #f0f0f0" }}>
                            {(() => {
                              const dt = new Date(b.date+"T00:00:00");
                              return dt.toLocaleDateString("en-GB",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});
                            })()}
                          </td>
                        </tr>
                      )}
                      <tr key={b.id} style={{ borderBottom:"1px solid #f8f9fb", cursor:"pointer" }}
                        onClick={()=>setSel(b)}>
                        <td style={{ padding:"10px 12px", fontWeight:600, color:"#111827" }}>
                          {new Date(b.date+"T00:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short"})}
                        </td>
                        <td style={{ padding:"10px 12px", fontFamily:"monospace", fontWeight:600, color:"#374151" }}>{b.time?.slice(0,5)}</td>
                        <td style={{ padding:"10px 12px" }}>
                          <div style={{ fontWeight:600 }}>{b.name}</div>
                          <div style={{ fontSize:11, color:"#9ca3af" }}>{b.country}</div>
                        </td>
                        <td style={{ padding:"10px 12px", fontSize:12 }}>
                          <div>{b.from}</div>
                          <div style={{ color:"#9ca3af" }}>→ {b.to}</div>
                        </td>
                        <td style={{ padding:"10px 12px" }}>
                          <span style={{ background:c.bg, color:c.text, border:`1px solid ${c.border}`, fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:5 }}>
                            {vName(b.vehicleId)}
                          </span>
                        </td>
                        <td style={{ padding:"10px 12px", fontSize:12, whiteSpace:"nowrap" as const }}>
                          {b.passengers+b.kids} 👤 {b.bags} 🧳
                        </td>
                        <td style={{ padding:"10px 12px" }}>
                          {isRoundTrip
                            ? <span style={{ fontSize:11,fontWeight:700,background:"#fff7ed",color:"#ea580c",padding:"2px 8px",borderRadius:5,border:"1px solid #fed7aa" }}>🔄 RT</span>
                            : <span style={{ fontSize:11,fontWeight:700,background:"#f0fdf4",color:"#16a34a",padding:"2px 8px",borderRadius:5,border:"1px solid #bbf7d0" }}>→ OW</span>
                          }
                        </td>
                      </tr>
                    </>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Booking detail panel ── */}
      {sel && (
        <div style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.55)", backdropFilter:"blur(4px)" }} onClick={()=>setSel(null)}/>
          <div style={{ position:"relative", background:"#fff", borderRadius:16, width:"100%", maxWidth:480, maxHeight:"90vh", overflow:"auto", boxShadow:"0 24px 80px rgba(0,0,0,.25)" }} className="cal-fade">

            {/* Colored top bar based on vehicle */}
            {(() => {
              const c = getVehColor(sel.vehicleId);
              const { isRoundTrip, flightTrain, freeText } = parseNotes(sel.notes);
              return (
                <>
                  <div style={{ background:c.bg, borderBottom:`2px solid ${c.border}`, padding:"18px 20px 14px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <div style={{ fontSize:10, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase" as const, color:c.text, marginBottom:4 }}>Confirmed Booking</div>
                        <div style={{ fontSize:20, fontWeight:800, color:"#111827", lineHeight:1.2 }}>{sel.name}</div>
                        <div style={{ fontSize:12, color:"#6b7280", marginTop:2 }}>{sel.email} · {sel.country}</div>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column" as const, alignItems:"flex-end", gap:6 }}>
                        <button onClick={()=>setSel(null)} style={{ background:"rgba(0,0,0,.08)", border:"none", borderRadius:"50%", width:28, height:28, fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                        <div style={{ fontFamily:"monospace", fontSize:13, fontWeight:800, color:c.text }}>
                          {sel.id.slice(0,8).toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding:"16px 20px" }}>
                    {/* Route */}
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, padding:"10px 14px", background:"#f8f9fb", borderRadius:10 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:9, fontWeight:700, color:"#9ca3af", textTransform:"uppercase" as const, letterSpacing:".08em" }}>From</div>
                        <div style={{ fontSize:13, fontWeight:700, color:"#111827" }}>{sel.from}</div>
                      </div>
                      <div style={{ width:24, height:24, borderRadius:"50%", background:"#111827", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <svg width={10} height={10} fill="none" viewBox="0 0 24 24" stroke="#f97316" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                      </div>
                      <div style={{ flex:1, textAlign:"right" as const }}>
                        <div style={{ fontSize:9, fontWeight:700, color:"#9ca3af", textTransform:"uppercase" as const, letterSpacing:".08em" }}>To</div>
                        <div style={{ fontSize:13, fontWeight:700, color:"#111827" }}>{sel.to}</div>
                      </div>
                    </div>

                    {/* Info grid */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
                      {[
                        { icon:"📅", label:"Date",        val: new Date(sel.date+"T00:00:00").toLocaleDateString("en-GB",{weekday:"short",day:"2-digit",month:"short",year:"numeric"}) },
                        { icon:"🕐", label:"Time",         val: sel.time?.slice(0,5) },
                        { icon:"👤", label:"Passengers",   val: `${sel.passengers} adults · ${sel.kids} children` },
                        { icon:"🧳", label:"Luggage",       val: `${sel.bags} bag${sel.bags!==1?"s":""}` },
                        { icon:"🚗", label:"Vehicle",       val: vName(sel.vehicleId) },
                        { icon:"🔄", label:"Trip type",     val: isRoundTrip ? "Round Trip (×2)" : "One Way" },
                        ...(flightTrain ? [{ icon:"✈️", label:"Flight / Train", val: flightTrain }] : []),
                        ...(sel.whatsapp ? [{ icon:"💬", label:"WhatsApp",       val: sel.whatsapp }] : []),
                      ].map(r => (
                        <div key={r.label} style={{ background:"#f8f9fb", borderRadius:9, padding:"8px 12px", display:"flex", gap:8, alignItems:"flex-start" }}>
                          <span style={{ fontSize:14, marginTop:1 }}>{r.icon}</span>
                          <div>
                            <div style={{ fontSize:9, fontWeight:700, color:"#9ca3af", textTransform:"uppercase" as const, letterSpacing:".08em" }}>{r.label}</div>
                            <div style={{ fontSize:12, fontWeight:600, color: r.label==="Trip type"&&isRoundTrip?"#ea580c":"#111827", marginTop:1 }}>{r.val}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {freeText && (
                      <div style={{ padding:"10px 14px", background:"#fff7ed", border:"1px solid #fdba74", borderRadius:9, fontSize:12, color:"#9a3412", marginBottom:14 }}>
                        <span style={{ fontWeight:700 }}>📝 Notes:</span> {freeText}
                      </div>
                    )}

                    <button onClick={()=>setSel(null)} style={{ width:"100%", padding:"11px", borderRadius:9, background:"#111827", color:"#fff", border:"none", cursor:"pointer", fontWeight:700, fontSize:13, fontFamily:"inherit" }}>
                      Close
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}