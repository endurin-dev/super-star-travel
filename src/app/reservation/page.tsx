"use client";

import { useState, useEffect, useRef } from "react";

/* Keep these identical to the hero + rates components */
const CURRENCY      = "$";     // must match the currency stored in /api/rates
const CURRENCY_CODE = "USD";   // sent to analytics

interface TripDetails {
  fromId: string; toId: string;
  fromName: string; toName: string;
  tripType: "one-way" | "round-trip";
  date: string; time: string;
  returnDate: string; returnTime: string;
  passengers: number; kids: number; bags: number;
  flightOrTrain: string;
  dropoffAddress: string;
}
interface Vehicle {
  id: string; name: string; model: string;
  maxPassengers: number; maxLuggage: number;
  img: string; price: number; special?: string; tag?: string;
  active: boolean; sortOrder?: number;
}
interface Location {
  id: string; name: string; categoryIcon: string; categoryName: string; active: boolean;
}
interface Rate {
  fromLocId: string; toLocId: string; vehicleId: string;
  p1: number|null; p2: number|null; p3: number|null; p4: number|null;
  p5: number|null; p6: number|null; p7: number|null; p8: number|null;
  onDemand: boolean; active: boolean;
}
interface Personal {
  name: string; country: string; whatsapp: string; email: string; notes: string;
}
interface PromoCode {
  id: string; code: string; description: string; discountAmount: number;
  validFrom: string; validUntil: string; active: boolean;
}

const NIGHT_SURCHARGE = 15;

const isNightTime = (time: string): boolean => {
  if (!time) return false;
  const [h] = time.split(":").map(Number);
  return h >= 22 || h < 6;
};

const calcPrice = (rate: Rate, pax: number): number | null => {
  if (rate.onDemand) return null;
  if (pax >= 9) return rate.p8 ? rate.p8 * 2 : null;
  const map: Record<number, number|null> = {
    1:rate.p1,2:rate.p2,3:rate.p3,4:rate.p4,
    5:rate.p5,6:rate.p6,7:rate.p7,8:rate.p8,
  };
  return map[pax] ?? null;
};

const COUNTRY_CODES: Record<string, string> = {
  Afghanistan:"+93",Albania:"+355",Algeria:"+213",Andorra:"+376",Angola:"+244",Argentina:"+54",
  Armenia:"+374",Australia:"+61",Austria:"+43",Azerbaijan:"+994",Bahrain:"+973",Bangladesh:"+880",
  Belarus:"+375",Belgium:"+32",Bolivia:"+591","Bosnia and Herzegovina":"+387",Brazil:"+55",
  Bulgaria:"+359",Cambodia:"+855",Cameroon:"+237",Canada:"+1",Chile:"+56",China:"+86",
  Colombia:"+57",Croatia:"+385",Cuba:"+53",Cyprus:"+357","Czech Republic":"+420",Denmark:"+45",
  Ecuador:"+593",Egypt:"+20",Estonia:"+372",Ethiopia:"+251",Finland:"+358",France:"+33",
  Georgia:"+995",Germany:"+49",Ghana:"+233",Greece:"+30",Guatemala:"+502",Hungary:"+36",
  India:"+91",Indonesia:"+62",Iran:"+98",Iraq:"+964",Ireland:"+353",Israel:"+972",Italy:"+39",
  Japan:"+81",Jordan:"+962",Kazakhstan:"+7",Kenya:"+254",Kuwait:"+965",Latvia:"+371",
  Lebanon:"+961",Libya:"+218",Lithuania:"+370",Luxembourg:"+352",Malaysia:"+60",Mexico:"+52",
  Morocco:"+212",Netherlands:"+31","New Zealand":"+64",Nigeria:"+234",Norway:"+47",Oman:"+968",
  Pakistan:"+92",Palestine:"+970",Peru:"+51",Philippines:"+63",Poland:"+48",Portugal:"+351",
  Qatar:"+974",Romania:"+40",Russia:"+7","Saudi Arabia":"+966",Senegal:"+221",Serbia:"+381",
  Singapore:"+65",Slovakia:"+421","South Africa":"+27","South Korea":"+82",Spain:"+34",
  "Sri Lanka":"+94",Sweden:"+46",Switzerland:"+41",Syria:"+963",Taiwan:"+886",Thailand:"+66",
  Tunisia:"+216",Turkey:"+90",Ukraine:"+380","United Arab Emirates":"+971","United Kingdom":"+44",
  "United States":"+1",Uruguay:"+598",Uzbekistan:"+998",Venezuela:"+58",Vietnam:"+84",Yemen:"+967",
};
const COUNTRIES = Object.keys(COUNTRY_CODES);

const DEFAULT_LOCATIONS: Location[] = [
  { id:"l1",name:"Bandaranaike Airport (CMB)",categoryIcon:"✈️",categoryName:"Airport",active:true },
  { id:"l4",name:"Colombo City Centre",categoryIcon:"🏙️",categoryName:"City",active:true },
  { id:"l5",name:"Kandy",categoryIcon:"🎡",categoryName:"Attraction",active:true },
];
const DEFAULT_VEHICLES: Vehicle[] = [
  { id:"sedan",name:"BUSINESS CLASS CAR",model:"Toyota Premio or similar",maxPassengers:3,maxLuggage:2,img:"/images/car.png",price:80,tag:"Most Popular",active:true,sortOrder:1 },
  { id:"van",name:"BUSINESS CLASS VAN",model:"Toyota HiAce or similar",maxPassengers:8,maxLuggage:8,img:"/images/car.png",price:80,tag:"Best for Groups",special:"Can accommodate your stroller",active:true,sortOrder:2 },
  { id:"suv",name:"LUXURY SUV",model:"Toyota Land Cruiser or similar",maxPassengers:5,maxLuggage:5,img:"/images/car.png",price:110,tag:"Premium",active:true,sortOrder:3 },
  { id:"minibus",name:"MINIBUS",model:"Toyota Coaster or similar",maxPassengers:16,maxLuggage:16,img:"/images/car.png",price:150,tag:"Large Groups",special:"Can accommodate multiple strollers & wheelchairs",active:true,sortOrder:4 },
];
const DEFAULT_FEATURES = ["Meet & Greet included","Door-to-door","Porter service","Free child seats & boosters"];

const STEPS = ["Trip","Vehicle","Details","Review"];
const TITLES = ["Where are you going?","Choose your vehicle","Who's travelling?","Check and confirm"];

const money = (n: number) => `${CURRENCY}${Number.isInteger(n) ? n : n.toFixed(2)}`;

function groupByCategory(locs: Location[]) {
  const map = new Map<string, Location[]>();
  locs.forEach(l => {
    const k = `${l.categoryIcon} ${l.categoryName}`;
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(l);
  });
  return map;
}

function F({ label, req, opt, err, hint, children }: {
  label: string; req?: boolean; opt?: boolean; err?: string; hint?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="f">
      <label>{label}{req && <i className="req"> *</i>}{opt && <span className="opt"> optional</span>}</label>
      {children}
      {hint && !err && <div className="hint">{hint}</div>}
      {err && <div className="ferr">{err}</div>}
    </div>
  );
}

function Rows({ rows }: { rows: [string, string][] }) {
  return (
    <div className="rows">
      {rows.map(([l, v]) => (
        <div key={l} className="row"><span>{l}</span><b>{v || "—"}</b></div>
      ))}
    </div>
  );
}

function LocationSelect({ value, onChange, locations, placeholder, error }: {
  value: string; onChange: (id: string) => void; locations: Location[]; placeholder: string; error?: string;
}) {
  const groups = groupByCategory(locations.filter(l => l.active));
  return (
    <>
      <div className={`in${error ? " err" : ""}`}>
        <select value={value} onChange={e => onChange(e.target.value)} style={{ color: value ? undefined : "var(--mute)" }}>
          <option value="" disabled>{placeholder}</option>
          {Array.from(groups.entries()).map(([cat, locs]) => (
            <optgroup key={cat} label={cat}>
              {locs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </optgroup>
          ))}
        </select>
        <span className="caret">▾</span>
      </div>
      {error && <div className="ferr">{error}</div>}
    </>
  );
}

export default function ReservationPage() {
  const [locations,setLocations] = useState<Location[]>(DEFAULT_LOCATIONS);
  const [vehicles, setVehicles]  = useState<Vehicle[]>(DEFAULT_VEHICLES);
  const [features, setFeatures]  = useState<string[]>(DEFAULT_FEATURES);
  const [allRates, setAllRates]  = useState<Rate[]>([]);
  const [dataReady,setDataReady] = useState(false);

  const [step,     setStep]      = useState(0);
  const stepHeadingRef = useRef<HTMLElement>(null);
  const [trip,     setTrip]      = useState<TripDetails>({
    fromId:"",toId:"",fromName:"",toName:"",tripType:"one-way",
    date:"",time:"",returnDate:"",returnTime:"",
    passengers:1,kids:0,bags:1,flightOrTrain:"",dropoffAddress:"",
  });
  const [vehicleId,setVehicleId] = useState("");
  const [personal, setPersonal]  = useState<Personal>({ name:"",country:"",whatsapp:"",email:"",notes:"" });
  const [paymentMethod, setPaymentMethod] = useState<"cash"|"card"|"">("");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoFeedback, setPromoFeedback] = useState<{ type:"success"|"error"; text:string } | null>(null);
  const [sending,  setSending]   = useState(false);
  const [done,     setDone]      = useState(false);
  const [bookingRef,setBookingRef]= useState("");
  const [errors,   setErrors]    = useState<Record<string,string>>({});

  useEffect(() => {
    (async () => {
      try {
        const [lr,vr,fr,rr] = await Promise.all([
          fetch("/api/locations"),fetch("/api/vehicles"),
          fetch("/api/features"),fetch("/api/rates"),
        ]);
        let loadedLocs: Location[] = DEFAULT_LOCATIONS;
        if (lr.ok) { const d=await lr.json(); const a=d.filter((l:any)=>l.active); if(a.length){setLocations(a); loadedLocs=a;} }
        if (vr.ok) { const d=await vr.json(); const a=d.filter((v:any)=>v.active).sort((a:any,b:any)=>(a.sortOrder??0)-(b.sortOrder??0)); if(a.length) setVehicles(a); }
        if (fr.ok) { const d=await fr.json(); const a=d.filter((f:any)=>f.active).map((f:any)=>f.text); if(a.length) setFeatures(a); }
        if (rr.ok) { const d=await rr.json(); setAllRates(d); }

        const sp = new URLSearchParams(window.location.search);
        const fromParam = sp.get("from"), toParam = sp.get("to");
        const dateParam = sp.get("date"), timeParam = sp.get("time");
        const paxParam  = sp.get("passengers"), kidsParam = sp.get("kids");
        const typeParam = sp.get("tripType");
        if (fromParam||toParam||dateParam||timeParam||paxParam||kidsParam||typeParam) {
          const fromName = loadedLocs.find(l=>l.id===fromParam)?.name ?? "";
          const toName   = loadedLocs.find(l=>l.id===toParam)?.name   ?? "";
          setTrip(t => ({
            ...t,
            ...(fromParam ? { fromId:fromParam, fromName } : {}),
            ...(toParam   ? { toId:toParam,     toName   } : {}),
            ...(dateParam ? { date:dateParam }   : {}),
            ...(timeParam ? { time:timeParam }   : {}),
            ...(paxParam  ? { passengers:Math.max(1,parseInt(paxParam)||1) } : {}),
            ...(kidsParam ? { kids:Math.max(0,parseInt(kidsParam)||0) }       : {}),
            ...(typeParam==="round-trip" ? { tripType:"round-trip" as const } : {}),
          }));
        }
      } catch {}
      finally { setDataReady(true); }
    })();
  }, []);

  useEffect(() => {
    if (!personal.country) return;
    setPersonal(p => ({ ...p, whatsapp:p.whatsapp.replace(/^\+\d{1,4}\s?/,"").replace(/^\+/,"") }));
  }, [personal.country]);

  const totalPax    = trip.passengers + trip.kids;
  const isRoundTrip = trip.tripType === "round-trip";
  const nightSurcharge       = isNightTime(trip.time) ? NIGHT_SURCHARGE : 0;
  const returnNightSurcharge = isRoundTrip && isNightTime(trip.returnTime) ? NIGHT_SURCHARGE : 0;

  const getRateRecord = (vId:string): Rate|null => {
    if (!trip.fromId||!trip.toId) return null;
    return allRates.find(r=>r.fromLocId===trip.fromId&&r.toLocId===trip.toId&&r.vehicleId===vId&&r.active)??null;
  };

  const vehiclesWithPrice = vehicles.map(v => {
    const paxExceeded = totalPax>v.maxPassengers;
    const lugExceeded = trip.bags>v.maxLuggage;
    if (!trip.fromId||!trip.toId) {
      const base=v.price;
      const routeBase = isRoundTrip?base*2:base as number;
      return {...v,routePrice:routeBase+nightSurcharge+returnNightSurcharge,baseRoutePrice:routeBase,onDemand:false,noRate:false,paxExceeded,lugExceeded,isDoubled:false};
    }
    const rate=getRateRecord(v.id);
    if (!rate) return {...v,routePrice:null,baseRoutePrice:null,onDemand:false,noRate:true,paxExceeded,lugExceeded,isDoubled:false};
    if (rate.onDemand) return {...v,routePrice:null,baseRoutePrice:null,onDemand:true,noRate:false,paxExceeded,lugExceeded,isDoubled:false};
    const base=calcPrice(rate,totalPax);
    const routeBase=base!==null&&isRoundTrip?base*2:base;
    const final=routeBase!==null?routeBase+nightSurcharge+returnNightSurcharge:null;
    return {...v,routePrice:final,baseRoutePrice:routeBase,onDemand:false,noRate:false,paxExceeded,lugExceeded,isDoubled:totalPax>=9};
  }).filter(v=>!v.noRate);

  const noVehiclesForRoute = !!(trip.fromId && trip.toId && dataReady && vehiclesWithPrice.length === 0);
  const isQuoteRequest = noVehiclesForRoute;

  const fitting = vehiclesWithPrice.filter(v=>!v.paxExceeded&&!v.lugExceeded).sort((a,b)=>a.maxPassengers-b.maxPassengers);
  const recommendedVehicle = fitting[0] ?? null;
  const vehicle = vehiclesWithPrice.find(v=>v.id===vehicleId)??null;
  const confirmedPrice = vehicle?.routePrice ?? 0;
  const normalizedVehicleName = (vehicle?.name ?? "").trim().toLowerCase();
  const isLuxuryPromoVehicle = normalizedVehicleName.includes("luxury class car") || normalizedVehicleName.includes("luxury class van");
  const canApplyPromo = !!vehicle && !vehicle.onDemand && confirmedPrice > 0 && isLuxuryPromoVehicle;
  const promoDiscountAmount = appliedPromo && canApplyPromo
    ? Math.min(appliedPromo.discountAmount * (isRoundTrip ? 2 : 1), confirmedPrice)
    : 0;
  const finalPrice = Math.max(confirmedPrice - promoDiscountAmount, 0);

  useEffect(() => {
    if (appliedPromo && !canApplyPromo) {
      setAppliedPromo(null);
      setPromoCodeInput("");
      setPromoFeedback({ type:"error", text:"Promo code is no longer available for this booking." });
    }
  }, [canApplyPromo, appliedPromo]);

  useEffect(() => {
    if (vehicleId&&trip.fromId&&trip.toId&&!vehiclesWithPrice.some(v=>v.id===vehicleId)) setVehicleId("");
  }, [trip.fromId,trip.toId]);

  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    stepHeadingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const setFrom = (id:string) => { const l=locations.find(x=>x.id===id); setTrip(t=>({...t,fromId:id,fromName:l?.name??"",flightOrTrain:"",dropoffAddress:""})); setVehicleId(""); };
  const setTo   = (id:string) => { const l=locations.find(x=>x.id===id); setTrip(t=>({...t,toId:id,toName:l?.name??"",flightOrTrain:"",dropoffAddress:""})); setVehicleId(""); };

  const handleTripChange = (key:"passengers"|"kids"|"bags",val:number) => {
    setTrip(t=>({...t,[key]:val}));
    if (vehicleId) {
      const v=vehicles.find(x=>x.id===vehicleId);
      if (v) {
        const newPax=key==="passengers"?val+trip.kids:key==="kids"?trip.passengers+val:totalPax;
        const newBags=key==="bags"?val:trip.bags;
        if (newPax>v.maxPassengers||newBags>v.maxLuggage) setVehicleId("");
      }
    }
  };

  const fromLoc=locations.find(l=>l.id===trip.fromId);
  const toLoc  =locations.find(l=>l.id===trip.toId);
  const isFromAirport=fromLoc?.categoryName?.toLowerCase().includes("airport")||fromLoc?.categoryName?.toLowerCase().includes("station");
  const isToAirport  =toLoc?.categoryName?.toLowerCase().includes("airport")  ||toLoc?.categoryName?.toLowerCase().includes("station");
  const isFromCity   =fromLoc?.categoryName?.toLowerCase().includes("city")   ||fromLoc?.categoryName?.toLowerCase().includes("hotel");
  const isToCity     =toLoc?.categoryName?.toLowerCase().includes("city")     ||toLoc?.categoryName?.toLowerCase().includes("hotel");
  const showFlightBox  = !!(trip.fromId&&trip.toId&&(isFromAirport||isToAirport));
  const showAddressBox = !!(trip.fromId&&trip.toId&&(isFromCity||isToCity));
  const flightLabel    = isFromAirport?"Flight / Train No. (at pickup)":"Flight / Train No. (at drop-off)";
  const addressLabel   = isToCity?"Drop-off address":isFromCity?"Pickup address":"Address";

  const validate = () => {
    const e: Record<string,string> = {};
    if (step===0) {
      if (!trip.fromId) e.from="Choose a pickup location";
      if (!trip.toId)   e.to="Choose a drop-off location";
      if (!trip.date) e.date="Required";
      if (!trip.time) e.time="Required";
      if (showFlightBox && !trip.flightOrTrain.trim()) e.flightOrTrain="Required so your driver can track it";
      if (isRoundTrip) {
        if (!trip.returnDate) e.returnDate="Required for round trip";
        if (!trip.returnTime) e.returnTime="Required for round trip";
        if (trip.returnDate&&trip.date&&trip.returnDate<trip.date) e.returnDate="Must be on or after departure date";
      }
    }
    if (step===1&&!vehicleId&&!isQuoteRequest) e.vehicle="Please select a vehicle";
    if (step===2) {
      if (!personal.name.trim())     e.name="Required";
      if (!personal.country.trim())  e.country="Required";
      if (!personal.whatsapp.trim()) e.whatsapp="Required";
      if (!personal.email.trim())    e.email="Required";
      else if (!/\S+@\S+\.\S+/.test(personal.email)) e.email="Enter a valid email";
      if (!paymentMethod && !isQuoteRequest) e.paymentMethod="Please select a payment method";
    }
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const next = () => { if (validate()) setStep(s=>s+1); };
  const back = () => { setStep(s=>s-1); setErrors({}); };

  const applyPromoCode = async () => {
    const trimmed = promoCodeInput.trim();
    if (!trimmed) {
      setAppliedPromo(null);
      setPromoFeedback({ type:"error", text:"Please enter a promo code first." });
      return;
    }
    try {
      const res = await fetch(`/api/promo-codes?code=${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Invalid or expired promo code");
      }
      const promo = await res.json();
      setAppliedPromo(promo);
      setPromoCodeInput(promo.code);
      setPromoFeedback({ type:"success", text:`Promo code ${promo.code} applied successfully.` });
    } catch (err: any) {
      setAppliedPromo(null);
      setPromoFeedback({ type:"error", text: err?.message || "Invalid or expired promo code." });
    }
  };

  const clearAppliedPromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput("");
    setPromoFeedback({ type:"success", text:"Applied promo code removed." });
  };

  const dialCode = COUNTRY_CODES[personal.country] ?? "";

  const submit = async () => {
    setSending(true);
    const code = COUNTRY_CODES[personal.country] ?? "";
    const rawNumber = personal.whatsapp.trim().replace(/^\+\d{1,4}\s?/, "").replace(/^\+/, "");
    const fullWhatsapp = code ? `${code}${rawNumber}` : personal.whatsapp;
    const noteParts = [
      isQuoteRequest ? "⚠️ QUOTE REQUEST — no rate on file for this route" : "",
      isRoundTrip ? "ROUND TRIP" : "",
      isRoundTrip && trip.returnDate ? `Return Date: ${trip.returnDate}` : "",
      isRoundTrip && trip.returnTime ? `Return Time: ${trip.returnTime}` : "",
      trip.flightOrTrain ? `Flight/Train: ${trip.flightOrTrain}` : "",
      trip.dropoffAddress ? `Address: ${trip.dropoffAddress}` : "",
      nightSurcharge > 0 ? `OUTBOUND NIGHT SURCHARGE (+${money(NIGHT_SURCHARGE)})` : "",
      returnNightSurcharge > 0 ? `RETURN NIGHT SURCHARGE (+${money(NIGHT_SURCHARGE)})` : "",
      appliedPromo ? `Promo Code: ${appliedPromo.code} (−${CURRENCY}${promoDiscountAmount.toFixed(2)})` : "",
      appliedPromo ? `Promo Discount: ${CURRENCY}${promoDiscountAmount.toFixed(2)}` : "",
      !isQuoteRequest ? `Payment: ${paymentMethod === "cash" ? "Cash to driver" : "Card to driver"}` : "",
      personal.notes,
    ].filter(Boolean).join(" | ");

    try {
      // ── Quote request: skip DB entirely, just send email ──
      if (isQuoteRequest) {
        const ref = "PEM-" + Date.now().toString(36).toUpperCase();
        try {
          await fetch("/api/send-booking-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingRef: ref,
              name: personal.name,
              email: personal.email,
              country: personal.country,
              whatsapp: fullWhatsapp,
              fromName: trip.fromName,
              toName: trip.toName,
              date: trip.date,
              time: trip.time,
              returnDate: isRoundTrip ? trip.returnDate : null,
              returnTime: isRoundTrip ? trip.returnTime : null,
              passengers: trip.passengers,
              kids: trip.kids,
              bags: trip.bags,
              vehicleName: "Quote Request",
              vehicleModel: "",
              isRoundTrip,
              flightTrain: trip.flightOrTrain,
              address: trip.dropoffAddress,
              notes: noteParts,
              nightSurcharge,
              returnNightSurcharge,
              basePrice: null,
              totalPrice: null,
              onDemand: true,
              paymentMethod: null,
              isQuoteRequest: true,
            }),
          });
        } catch (emailErr) {
          console.error("Quote email send failed:", emailErr);
        }
        setBookingRef(ref);
        setDone(true);
        return;
      }

      // ── Normal booking: save to DB then send email ──
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromLocId: trip.fromId,
          toLocId: trip.toId,
          date: trip.date,
          time: trip.time,
          returnDate: isRoundTrip ? trip.returnDate : null,
          returnTime: isRoundTrip ? trip.returnTime : null,
          passengers: trip.passengers,
          kids: trip.kids,
          bags: trip.bags,
          vehicleId: vehicleId,
          name: personal.name,
          country: personal.country,
          whatsapp: fullWhatsapp,
          email: personal.email,
          notes: noteParts,
          status: "new",
        }),
      });

      if (res.ok) {
        const b = await res.json();
        const ref = (b.id ?? "PEM-" + Date.now().toString(36)).toUpperCase();
        setBookingRef(ref);
        try {
          await fetch("/api/send-booking-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingRef: ref,
              name: personal.name,
              email: personal.email,
              country: personal.country,
              whatsapp: fullWhatsapp,
              fromName: trip.fromName,
              toName: trip.toName,
              date: trip.date,
              time: trip.time,
              returnDate: isRoundTrip ? trip.returnDate : null,
              returnTime: isRoundTrip ? trip.returnTime : null,
              passengers: trip.passengers,
              kids: trip.kids,
              bags: trip.bags,
              vehicleName: vehicle?.name ?? "",
              vehicleModel: vehicle?.model ?? "",
              isRoundTrip,
              flightTrain: trip.flightOrTrain,
              address: trip.dropoffAddress,
              notes: personal.notes,
              nightSurcharge,
              returnNightSurcharge,
              basePrice: vehicle?.baseRoutePrice ?? null,
              totalPrice: finalPrice,
              onDemand: vehicle?.onDemand ?? false,
              paymentMethod,
              promoCode: appliedPromo?.code ?? null,
              promoDiscountAmount: appliedPromo ? promoDiscountAmount : null,
              isQuoteRequest: false,
            }),
          });
        } catch (emailErr) {
          console.error("Email send failed:", emailErr);
        }
        setDone(true);
      } else {
        alert("Something went wrong saving your booking. Please try again.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const counter = (key:"passengers"|"kids"|"bags",min:number,max:number,label:string,sub?:string) => (
    <div className="f">
      <label>{label}{sub && <span className="opt"> {sub}</span>}</label>
      <div className="ctr">
        <button type="button" aria-label={`Fewer ${label}`} disabled={trip[key]<=min} onClick={()=>handleTripChange(key,Math.max(min,trip[key]-1))}>−</button>
        <output>{trip[key]}</output>
        <button type="button" aria-label={`More ${label}`} disabled={trip[key]>=max} onClick={()=>handleTripChange(key,Math.min(max,trip[key]+1))}>+</button>
      </div>
    </div>
  );

  const payLabel = paymentMethod==="cash" ? "Cash to driver" : "Card to driver";

  // Fare breakdown, reused in the review step and the done screen
  const fare = vehicle && !isQuoteRequest ? (
    <div className="fare">
      <div className="row"><span>Base fare{isRoundTrip?" (round trip ×2)":""}{vehicle.isDoubled?" (9+ pax ×2)":""}</span><b>{vehicle.onDemand?"On demand":vehicle.baseRoutePrice!==null?money(vehicle.baseRoutePrice):"—"}</b></div>
      {nightSurcharge>0&&<div className="row night"><span>🌙 Night surcharge, outbound</span><b>+{money(NIGHT_SURCHARGE)}</b></div>}
      {returnNightSurcharge>0&&<div className="row night"><span>🌙 Night surcharge, return</span><b>+{money(NIGHT_SURCHARGE)}</b></div>}
      {appliedPromo&&confirmedPrice>0&&<div className="row promo"><span>Promo {appliedPromo.code}</span><b>−{money(promoDiscountAmount)}</b></div>}
      <div className="row total"><span>Total</span><b>{vehicle.onDemand?"On demand":money(finalPrice)}</b></div>
    </div>
  ) : null;

  // ── DONE SCREEN ──
  if (done) return (
    <div className="tx"><Styles/>
      <div className="done glass">
        <div className={`done-ic${isQuoteRequest?" q":""}`}>{isQuoteRequest?"✉":"✓"}</div>
        <h1>{isQuoteRequest ? "Quote request sent" : "Booking confirmed"}</h1>
        <div className="ref">Ref {bookingRef}</div>
        <p className="lead">
          {isQuoteRequest
            ? <>We don't have a fixed rate for this route yet. We'll email a personal quote to <b>{personal.email}</b>, usually within a few hours. You're under no obligation until you confirm.</>
            : <>A confirmation is on its way to <b>{personal.email}</b>.</>}
        </p>
        <Rows rows={[
          ["Trip", isRoundTrip?"Round trip":"One way"],
          ["Route", `${trip.fromName} → ${trip.toName}`],
          ["Departure", `${trip.date} at ${trip.time}`],
          ...(isRoundTrip ? [["Return", `${trip.returnDate} at ${trip.returnTime}`] as [string,string]] : []),
          ["Passengers", `${totalPax}`],
          ...(!isQuoteRequest ? [["Vehicle", vehicle?.name??"—"] as [string,string], ["Payment", payLabel] as [string,string]] : []),
        ]}/>
        {!isQuoteRequest && fare}
        <a href="/" className="btn dark wide">Back to home</a>
      </div>
    </div>
  );

  const perPax = vehicle && !isQuoteRequest && vehicle.routePrice!==null;
  const navPrice = perPax && !vehicle!.onDemand ? money(finalPrice) : "";

  return (
    <div className="tx"><Styles/>
      <div className="wrap">
        <main className="main">
          <header className="head" ref={stepHeadingRef}>
            <ol className="steps" aria-label="Progress">
              {STEPS.map((s,i)=>(
                <li key={s} className={i===step?"on":i<step?"ok":""} aria-current={i===step?"step":undefined}>
                  <span className="bar"/><span className="lbl">{i<step?"✓ ":""}{s}{i===1&&isQuoteRequest?" (quote)":""}</span>
                </li>
              ))}
            </ol>
            <h1>{step===1&&isQuoteRequest?"Request a quote":TITLES[step]}{!dataReady&&<span className="spin dk"/>}</h1>
          </header>

          <section className="card glass">
            {/* ══ STEP 0 ══ */}
            {step===0&&(
              <div className="stack">
                <div className="seg" role="radiogroup" aria-label="Trip type" data-active={trip.tripType}>
                  <button type="button" role="radio" aria-checked={!isRoundTrip} className={!isRoundTrip?"on":""} onClick={()=>{setTrip(t=>({...t,tripType:"one-way",returnDate:"",returnTime:""}));setVehicleId("");}}>One way</button>
                  <button type="button" role="radio" aria-checked={isRoundTrip} className={isRoundTrip?"on":""} onClick={()=>{setTrip(t=>({...t,tripType:"round-trip"}));setVehicleId("");}}>Round trip <small>price ×2</small></button>
                </div>

                <div className="g2">
                  <F label="Pickup" req><LocationSelect value={trip.fromId} onChange={setFrom} locations={locations} placeholder="Select pickup…" error={errors.from}/></F>
                  <F label="Drop-off" req><LocationSelect value={trip.toId} onChange={setTo} locations={locations} placeholder="Select drop-off…" error={errors.to}/></F>
                </div>

                {showFlightBox&&(
                  <F label={`✈️ ${flightLabel}`} req err={errors.flightOrTrain}>
                    <div className={`in${errors.flightOrTrain?" err":""}`}><input type="text" autoCapitalize="characters" placeholder="e.g. UL504 or EK650" value={trip.flightOrTrain} onChange={e=>setTrip(t=>({...t,flightOrTrain:e.target.value}))}/></div>
                  </F>
                )}
                {showAddressBox&&(
                  <F label={`📍 ${addressLabel}`} opt>
                    <div className="in"><input type="text" autoComplete="street-address" placeholder="e.g. 25 Galle Road, Colombo 03" value={trip.dropoffAddress} onChange={e=>setTrip(t=>({...t,dropoffAddress:e.target.value}))}/></div>
                  </F>
                )}

                <div className="g2">
                  <F label={isRoundTrip?"Departure date":"Date"} req err={errors.date}>
                    <div className={`in${errors.date?" err":""}`}><input type="date" value={trip.date} min={new Date().toISOString().split("T")[0]} onChange={e=>setTrip(t=>({...t,date:e.target.value}))}/></div>
                  </F>
                  <F label={isRoundTrip?"Departure time":"Pickup time"} req err={errors.time}>
                    <div className={`in${errors.time?" err":""}`}><input type="time" value={trip.time} onChange={e=>setTrip(t=>({...t,time:e.target.value}))}/></div>
                  </F>
                </div>
                {isNightTime(trip.time)&&<div className="note night"><span>🌙</span><div><b>Night surcharge +{money(NIGHT_SURCHARGE)}</b><br/>Pickups between 10 PM and 6 AM include an extra fee.</div></div>}

                {isRoundTrip&&(
                  <div className="ret">
                    <div className="ret-h"><b>Return journey</b><span>{trip.toName||"Drop-off"} → {trip.fromName||"Pickup"}</span></div>
                    <div className="g2">
                      <F label="Return date" req err={errors.returnDate}>
                        <div className={`in${errors.returnDate?" err":""}`}><input type="date" value={trip.returnDate} min={trip.date||new Date().toISOString().split("T")[0]} onChange={e=>setTrip(t=>({...t,returnDate:e.target.value}))}/></div>
                      </F>
                      <F label="Return pickup time" req err={errors.returnTime}>
                        <div className={`in${errors.returnTime?" err":""}`}><input type="time" value={trip.returnTime} onChange={e=>setTrip(t=>({...t,returnTime:e.target.value}))}/></div>
                      </F>
                    </div>
                    {isNightTime(trip.returnTime)&&<div className="note night"><span>🌙</span><div><b>Return night surcharge +{money(NIGHT_SURCHARGE)}</b></div></div>}
                  </div>
                )}

                <div className="g3">
                  {counter("passengers",1,16,"Adults")}
                  {counter("kids",0,6,"Children","under 12")}
                  {counter("bags",0,16,"Bags")}
                </div>

                {totalPax>=9&&<div className="note warn"><span>⚡</span><div><b>Large group: {totalPax} passengers</b><br/>9+ pax price is the 8-pax price ×2{isRoundTrip?", then ×2 for round trip":""}.</div></div>}
                {totalPax<9&&!isQuoteRequest&&recommendedVehicle&&<div className="note ok"><span>✓</span><div>For {totalPax} passenger{totalPax!==1?"s":""} we suggest the <b>{recommendedVehicle.name}</b> (up to {recommendedVehicle.maxPassengers} pax).</div></div>}
              </div>
            )}

            {/* ══ STEP 1 — QUOTE ══ */}
            {step===1&&isQuoteRequest&&(
              <div className="stack">
                <div className="note warn big">
                  <span>✉️</span>
                  <div>
                    <b>No fixed fare for {trip.fromName} → {trip.toName} yet</b><br/>
                    Send us your details and we'll reply with a personal quote, usually within a few hours.
                  </div>
                </div>
                <ol className="how">
                  <li>Add your contact details on the next screen</li>
                  <li>We review your route and group size</li>
                  <li>You get a fare by email and WhatsApp</li>
                  <li>Confirm only if you're happy, no obligation</li>
                </ol>
                <Rows rows={[
                  ["Group", `${totalPax} passenger${totalPax!==1?"s":""}, ${trip.bags} bag${trip.bags!==1?"s":""}`],
                  ["Departure", `${trip.date} at ${trip.time}`],
                  ...(isRoundTrip?[["Return", `${trip.returnDate} at ${trip.returnTime}`] as [string,string]]:[]),
                ]}/>
              </div>
            )}

            {/* ══ STEP 1 — VEHICLES ══ */}
            {step===1&&!isQuoteRequest&&(
              <div className="stack">
                {errors.vehicle&&<div className="note bad" role="alert"><span>!</span><div>{errors.vehicle}</div></div>}

                <div className="incl" aria-label="Included with every ride">
                  {features.map(f=><span key={f}>✓ {f}</span>)}
                </div>

                {(isRoundTrip||totalPax>=9||nightSurcharge>0||returnNightSurcharge>0)&&(
                  <div className="note warn"><span>ℹ️</span><div>
                    Prices include:
                    {isRoundTrip&&" round trip (×2)"}
                    {totalPax>=9&&" · 9+ pax rate (×2)"}
                    {(nightSurcharge+returnNightSurcharge)>0&&` · night fee +${money(nightSurcharge+returnNightSurcharge)}`}
                  </div></div>
                )}

                <div className="vlist">
                {vehiclesWithPrice.map(v => {
                  const sel=vehicleId===v.id;
                  const isLocked=v.paxExceeded||v.lugExceeded;
                  const isRecom=recommendedVehicle?.id===v.id&&!sel;
                  const reasons:string[]=[];
                  if(v.paxExceeded) reasons.push(`${totalPax} passengers exceeds the ${v.maxPassengers} limit`);
                  if(v.lugExceeded) reasons.push(`${trip.bags} bags exceeds the ${v.maxLuggage} limit`);
                  const nextFit=fitting.find(x=>x.id!==v.id);
                  return (
                    <div key={v.id} className={`vc${sel?" sel":""}${isLocked?" lock":""}`} onClick={()=>{ if(!isLocked) setVehicleId(sel?"":v.id); }}>
                      <div className="vc-img">
                        <img src={v.img} alt={v.name} loading="lazy"/>
                        <div className="vc-badges">
                          {isRecom&&<span className="bd g">Best fit</span>}
                          {v.tag&&<span className="bd">{v.tag}</span>}
                        </div>
                      </div>
                      <div className="vc-body">
                        <div className="vc-top">
                          <div>
                            <div className="vc-name">{v.name}</div>
                            <div className="vc-model">{v.model}</div>
                          </div>
                          <div className="vc-price">
                            {v.onDemand?<b className="od">On demand</b>:v.routePrice!==null?<><b>{money(v.routePrice)}</b><small>{isRoundTrip?"round trip":"one way"}</small></>:<b>—</b>}
                          </div>
                        </div>
                        <div className="caps">
                          <span className={v.paxExceeded?"x":""}>👤 {totalPax}/{v.maxPassengers} pax</span>
                          <span className={v.lugExceeded?"x":""}>🧳 {trip.bags}/{v.maxLuggage} bags</span>
                          {v.isDoubled&&<span className="w">×2 rate</span>}
                        </div>
                        {v.special&&<div className="special">{v.special}</div>}
                        {isLocked?(
                          <div className="lockmsg">
                            <span>{reasons.join(" · ")}</span>
                            {nextFit&&<button type="button" className="btn sm" onClick={e=>{ e.stopPropagation(); setVehicleId(nextFit.id); }}>Switch to {nextFit.name}</button>}
                          </div>
                        ):(
                          <button type="button" className={`btn ${sel?"dark":"line"} full`} onClick={e=>{ e.stopPropagation(); setVehicleId(sel?"":v.id); }}>{sel?"✓ Selected":"Select"}</button>
                        )}
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            )}

            {/* ══ STEP 2 ══ */}
            {step===2&&(
              <div className="stack">
                {isQuoteRequest&&<div className="note warn"><span>✉️</span><div>We'll send your quote to the email and WhatsApp number below.</div></div>}
                <F label="Full name" req err={errors.name}><div className={`in${errors.name?" err":""}`}><input type="text" autoComplete="name" placeholder="e.g. John Smith" value={personal.name} onChange={e=>setPersonal(p=>({...p,name:e.target.value}))}/></div></F>
                <F label="Country" req err={errors.country}>
                  <div className={`in${errors.country?" err":""}`}>
                    <select value={personal.country} onChange={e=>setPersonal(p=>({...p,country:e.target.value}))} style={{ color: personal.country?undefined:"var(--mute)" }}>
                      <option value="">Select your country…</option>{COUNTRIES.map(c=><option key={c}>{c}</option>)}
                    </select><span className="caret">▾</span>
                  </div>
                </F>
                <div className="g2">
                  <F label="WhatsApp number" req err={errors.whatsapp} hint={dialCode?`Country code ${dialCode} is added automatically`:"Pick a country to add the country code"}>
                    <div className={`in${errors.whatsapp?" err":""}`}>
                      {dialCode&&<span className="dial">{dialCode}</span>}
                      <input type="tel" inputMode="tel" autoComplete="tel-national" placeholder={dialCode?"77 123 4567":"Select country first"} value={personal.whatsapp} onChange={e=>setPersonal(p=>({...p,whatsapp:e.target.value}))}/>
                    </div>
                  </F>
                  <F label="Email" req err={errors.email}><div className={`in${errors.email?" err":""}`}><input type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" value={personal.email} onChange={e=>setPersonal(p=>({...p,email:e.target.value}))}/></div></F>
                </div>
                <F label="Special requests" opt>
                  <div className="in"><textarea rows={3} placeholder="Accessibility needs, extra stops, child seats…" value={personal.notes} onChange={e=>setPersonal(p=>({...p,notes:e.target.value}))}/></div>
                </F>

                {!isQuoteRequest&&isLuxuryPromoVehicle&&(
                  <F label="Promo code" opt>
                    <div className="promo-r">
                      <div className="in"><input type="text" autoCapitalize="characters" placeholder="Enter code" value={promoCodeInput} onChange={e=>setPromoCodeInput(e.target.value)}/></div>
                      <button type="button" className="btn dark" onClick={applyPromoCode}>Apply</button>
                    </div>
                    {promoFeedback&&<div className={`note ${promoFeedback.type==="success"?"ok":"bad"} sm`}>{promoFeedback.text}</div>}
                    {appliedPromo&&canApplyPromo&&(
                      <div className="note ok sm between">
                        <span>✓ {appliedPromo.code}: {money(promoDiscountAmount)} off</span>
                        <button type="button" className="lnk" onClick={clearAppliedPromo}>Remove</button>
                      </div>
                    )}
                  </F>
                )}
                {!isQuoteRequest&&vehicle&&!isLuxuryPromoVehicle&&<div className="note warn sm">Promo codes apply only to the Luxury Class Car and Luxury Class Van.</div>}

                {!isQuoteRequest&&(
                  <F label="Payment method" req err={errors.paymentMethod} hint="You pay your driver directly on arrival. Nothing is charged online.">
                    <div className="pay" role="radiogroup">
                      {([["cash","💵","Cash","Pay in cash on arrival"],["card","💳","Card","Visa & Mastercard accepted"]] as const).map(([k,ic,l,s])=>(
                        <button type="button" key={k} role="radio" aria-checked={paymentMethod===k} className={paymentMethod===k?"on":""} onClick={()=>setPaymentMethod(k)}>
                          <span className="pi">{ic}</span>
                          <span><b>{l} to driver</b><small>{s}</small></span>
                          <span className="rd"/>
                        </button>
                      ))}
                    </div>
                  </F>
                )}
              </div>
            )}

            {/* ══ STEP 3 ══ */}
            {step===3&&(
              <div className="stack">
                {isQuoteRequest&&<div className="note warn big"><span>✉️</span><div><b>This is a quote request</b><br/>No payment is taken. We'll email a personal fare and you can confirm once you're happy.</div></div>}
                <h3 className="sub">Trip</h3>
                <Rows rows={[
                  ["Type", isRoundTrip?"Round trip (×2)":"One way"],
                  ["Pickup", trip.fromName],["Drop-off",trip.toName],
                  ["Departure", `${trip.date} at ${trip.time}`],
                  ...(isRoundTrip?[["Return",`${trip.returnDate} at ${trip.returnTime}`] as [string,string]]:[]),
                  ["Passengers",`${trip.passengers} adult${trip.passengers!==1?"s":""}${trip.kids>0?`, ${trip.kids} child${trip.kids!==1?"ren":""}`:""}`],
                  ["Luggage",`${trip.bags} bag${trip.bags!==1?"s":""}`],
                  ...(trip.flightOrTrain?[["Flight/Train",trip.flightOrTrain] as [string,string]]:[]),
                  ...(trip.dropoffAddress?[["Address",trip.dropoffAddress] as [string,string]]:[]),
                ]}/>
                {vehicle&&!isQuoteRequest&&(<>
                  <h3 className="sub">Vehicle</h3>
                  <div className="vmini"><img src={vehicle.img} alt={vehicle.name}/><div><b>{vehicle.name}</b><small>{vehicle.model}</small></div></div>
                </>)}
                <h3 className="sub">You</h3>
                <Rows rows={[
                  ["Name",personal.name],["Country",personal.country],
                  ["WhatsApp",`${dialCode}${personal.whatsapp}`],["Email",personal.email],
                  ...(!isQuoteRequest?[["Payment",payLabel] as [string,string]]:[]),
                  ...(personal.notes?[["Notes",personal.notes] as [string,string]]:[]),
                ]}/>
                {!isQuoteRequest&&(<><h3 className="sub">Fare</h3>{fare}<p className="fine">Fixed price · all fees included · pay on arrival</p></>)}
              </div>
            )}
          </section>

          <nav className="nav" aria-label="Booking steps">
            {step>0&&<button type="button" onClick={back} className="btn line">Back</button>}
            {navPrice&&step<3&&<div className="navp"><small>Total</small><b>{navPrice}</b></div>}
            {step<3
              ?<button type="button" onClick={next} className="btn dark grow">{step===1&&isQuoteRequest?"Continue with quote":step===2?"Review booking":"Continue"}</button>
              :<button type="button" onClick={submit} disabled={sending} className={`btn grow ${isQuoteRequest?"brass":"go"}`}>
                {sending?<><span className="spin"/> Sending…</>:isQuoteRequest?"Send quote request":`Confirm booking${navPrice?` · ${navPrice}`:""}`}
              </button>}
          </nav>
        </main>

        {/* ── Trip ticket (laptop and up) ── */}
        <aside className="ticket" aria-label="Your trip">
          <div className="tk-top">
            <small>Your transfer</small>
            {trip.fromName||trip.toName?(
              <div className="route">
                <div className="stop"><i/>{trip.fromName||"Pickup"}</div>
                <div className="stop"><i className="e"/>{trip.toName||"Drop-off"}</div>
              </div>
            ):<p className="empty">Choose a pickup and drop-off to see your route.</p>}
            <div className="tk-meta">
              <span>{isRoundTrip?"Round trip":"One way"}</span>
              {trip.date&&<span>{trip.date}{trip.time?` · ${trip.time}`:""}</span>}
              {isRoundTrip&&trip.returnDate&&<span>Return {trip.returnDate}{trip.returnTime?` · ${trip.returnTime}`:""}</span>}
              <span>{trip.passengers} adult{trip.passengers!==1?"s":""}{trip.kids>0?` + ${trip.kids} child${trip.kids!==1?"ren":""}`:""} · {trip.bags} bag{trip.bags!==1?"s":""}</span>
            </div>
          </div>
          <div className="tk-cut"/>
          <div className="tk-bot">
            {isQuoteRequest&&step>=1?<div className="tk-q">Quote request. We'll email you a fare.</div>
              :vehicle?(<>
                <div className="tk-v">{vehicle.name}<small>{vehicle.model}</small></div>
                <div className="tk-price">{vehicle.onDemand?"On demand":vehicle.routePrice!==null?money(finalPrice):"—"}</div>
                {(nightSurcharge+returnNightSurcharge>0||promoDiscountAmount>0)&&<small className="tk-s">{nightSurcharge+returnNightSurcharge>0&&`Incl. night fee +${money(nightSurcharge+returnNightSurcharge)}`}{promoDiscountAmount>0&&` · promo −${money(promoDiscountAmount)}`}</small>}
              </>):<p className="empty">Pick a vehicle to see your fixed fare.</p>}
            <ul className="tk-pts"><li>Fixed pricing</li><li>Pay on arrival</li><li>Free cancellation</li></ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Styles() {
  return (
    <style>{`
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap');

.tx{
  --ink:#173b32; --ink2:rgba(23,59,50,.80); --mute:rgba(23,59,50,.62);
  --teal:#2f7d5b; --teal-d:#173b32; --sun:#2f7d5b; --sun-d:#245e46;
  --line:#d3dde0; --field:rgba(255,255,255,.80);
  --ok:#2f7d5b; --okl:rgba(47,125,91,.10);
  --bad:#b3372f; --badl:#fbebe9;
  --night:#4b3fa0; --nightl:#edebfa;
  --warn:#8a5a12; --warnl:rgba(255,244,214,.85);
  --ease:cubic-bezier(.25,.1,.25,1);
  font-family:'Figtree',system-ui,sans-serif; color:var(--ink); line-height:1.5; -webkit-font-smoothing:antialiased;
  min-height:100vh; overflow-x:clip;
  background:
    radial-gradient(60% 34% at 94% 4%, rgba(47,125,91,.26), transparent 70%),
    radial-gradient(65% 40% at 2% 42%, rgba(47,125,91,.18), transparent 70%),
    radial-gradient(60% 34% at 94% 92%, rgba(47,125,91,.20), transparent 70%),
    #f3f7f2;
}
.tx *,.tx *::before,.tx *::after{box-sizing:border-box}
.tx h1,.tx h3,.tx p,.tx ul,.tx ol{margin:0}
.tx button,.tx select,.tx input,.tx textarea{font-family:inherit}
.tx button{cursor:pointer}
.tx :focus-visible{outline:3px solid var(--teal);outline-offset:2px}

/* shared glass recipe (same as hero) */
.glass{
  background:linear-gradient(135deg,rgba(255,255,255,.80),rgba(255,255,255,.62));
  -webkit-backdrop-filter:blur(22px) saturate(170%);backdrop-filter:blur(22px) saturate(170%);
  border:1px solid rgba(255,255,255,.7);
  box-shadow:0 24px 54px rgba(16,44,37,.16),0 4px 12px rgba(16,44,37,.08),inset 0 1.5px 0 rgba(255,255,255,.85);
}

/* ── Layout ── */
.wrap{max-width:1160px;margin:0 auto;padding:18px 14px 0}
.main{min-width:0}
.ticket{display:none}
@media(min-width:640px){.wrap{padding:28px 24px 0}}
@media(min-width:1024px){
  .wrap{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:28px;padding:36px 32px 64px;align-items:start}
  .ticket{display:block;position:sticky;top:112px}
}
@media(min-width:1280px){.wrap{grid-template-columns:minmax(0,1fr) 360px;gap:36px}}

/* ── Heading + stepper ── */
.head{margin-bottom:16px;scroll-margin-top:104px;animation:rise .7s var(--ease) both}
@keyframes rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
.head h1{font-family:'Bricolage Grotesque',sans-serif;font-size:clamp(26px,4.2vw,40px);line-height:1.1;font-weight:800;letter-spacing:-.02em}
.steps{list-style:none;display:flex;gap:6px;margin:0 0 16px;padding:0}
.steps li{flex:1;min-width:0}
.steps .bar{display:block;height:5px;border-radius:5px;background:rgba(23,59,50,.12);margin-bottom:7px;transition:background .3s}
.steps .lbl{display:block;font-size:12.5px;font-weight:600;color:var(--mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.steps li.on .bar{background:linear-gradient(90deg,var(--teal),var(--sun))}
.steps li.on .lbl{color:var(--ink)}
.steps li.ok .bar{background:var(--teal-d)}.steps li.ok .lbl{color:var(--teal-d)}

/* ── Card ── */
.card{position:relative;overflow:hidden;border-radius:24px;padding:20px 16px}
.card::before{content:"";position:absolute;left:0;right:0;top:0;height:4px;background:linear-gradient(90deg,var(--teal-d),var(--teal) 55%,var(--sun))}
@media(min-width:640px){.card{padding:30px 28px}}
.stack{display:flex;flex-direction:column;gap:16px}
.g2{display:grid;grid-template-columns:1fr;gap:16px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
@media(min-width:640px){.g2{grid-template-columns:1fr 1fr}.g3{gap:14px}}

/* ── Fields ── */
.f{display:flex;flex-direction:column;gap:6px;min-width:0}
.f>label{font-size:13.5px;font-weight:600;color:var(--ink)}
.req{color:var(--sun-d);font-style:normal}
.opt{font-weight:500;color:var(--mute);font-size:12px}
.hint{font-size:12px;color:var(--mute)}
.ferr{font-size:12.5px;color:var(--bad);font-weight:600}
.in{display:flex;align-items:center;position:relative;min-height:50px;border-radius:14px;
  background:var(--field);border:1px solid rgba(255,255,255,.9);
  box-shadow:0 1px 3px rgba(23,59,50,.10),inset 0 1px 0 rgba(255,255,255,.9);
  transition:border-color .2s,box-shadow .2s,background .2s}
.in:hover{background:rgba(255,255,255,.94)}
.in:focus-within{border-color:var(--teal);box-shadow:0 0 0 3px rgba(47,125,91,.18)}
.in.err{border-color:var(--bad);box-shadow:0 0 0 3px rgba(179,55,47,.12)}
.in input,.in select,.in textarea{width:100%;border:0;outline:0;background:transparent;font-size:16px;font-weight:600;color:var(--ink);min-height:48px;padding:0 14px;appearance:none;-webkit-appearance:none;color-scheme:light;min-width:0}
.in input::placeholder,.in textarea::placeholder{font-weight:500;color:rgba(23,59,50,.42)}
.in select{padding-right:34px;cursor:pointer;text-overflow:ellipsis}
.in select option,.in select optgroup{background:#fff;color:var(--ink)}
.in textarea{padding:12px 14px;resize:none;min-height:92px;font-weight:500}
.caret{position:absolute;right:14px;pointer-events:none;color:var(--teal)}
.dial{align-self:stretch;display:flex;align-items:center;padding:0 12px;background:rgba(47,125,91,.08);border-right:1px solid var(--line);font-weight:700;font-size:14px;border-radius:13px 0 0 13px;color:var(--teal-d)}

/* ── Trip type segmented control with sliding thumb ── */
.seg{position:relative;display:grid;grid-template-columns:1fr 1fr;padding:4px;border-radius:100px;background:#e8f1e8;box-shadow:inset 0 1px 2px rgba(23,59,50,.14)}
.seg::before{content:"";position:absolute;top:4px;bottom:4px;left:4px;width:calc(50% - 4px);border-radius:100px;background:var(--teal-d);box-shadow:0 2px 8px rgba(23,59,50,.35);transition:transform .38s cubic-bezier(.3,1.25,.5,1)}
.seg[data-active="round-trip"]::before{transform:translateX(100%)}
.seg button{position:relative;z-index:1;border:0;background:transparent;border-radius:100px;min-height:44px;font-weight:700;color:var(--ink2);font-size:15px;transition:color .2s}
.seg button small{font-weight:600;opacity:.75;font-size:12px;margin-left:4px}
.seg button.on{color:#fff}

/* ── Counters ── */
.ctr{display:grid;grid-template-columns:42px 1fr 42px;align-items:center;min-height:50px;border-radius:14px;background:var(--field);border:1px solid rgba(255,255,255,.9);box-shadow:0 1px 3px rgba(23,59,50,.10),inset 0 1px 0 rgba(255,255,255,.9);padding:0 4px}
.ctr button{width:34px;height:34px;justify-self:center;border-radius:50%;border:1px solid var(--line);background:#f3f7f2;color:var(--teal-d);font-size:19px;line-height:1;display:flex;align-items:center;justify-content:center;padding:0;transition:background .18s,color .18s,transform .15s}
.ctr button:not(:disabled):hover{background:var(--teal-d);border-color:var(--teal-d);color:#fff}
.ctr button:not(:disabled):active{transform:scale(.92)}
.ctr button:disabled{opacity:.4;cursor:not-allowed}
.ctr output{text-align:center;font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:19px}
@media(max-width:420px){.ctr{grid-template-columns:32px 1fr 32px;padding:0 2px}.ctr button{width:28px;height:28px;font-size:17px}.f>label .opt{display:block}}

/* ── Notes ── */
.note{display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-radius:14px;font-size:13.5px;line-height:1.45;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.8)}
.note>span{flex-shrink:0}
.note.sm{padding:8px 12px;font-size:12.5px;font-weight:600;margin-top:6px}
.note.night{background:var(--nightl);color:var(--night)}
.note.warn{background:var(--warnl);color:var(--warn);border-color:rgba(240,217,154,.9)}
.note.ok{background:var(--okl);color:var(--teal-d)}
.note.bad{background:var(--badl);color:var(--bad);font-weight:600}
.note.big{padding:16px;font-size:14.5px}
.note.between{justify-content:space-between;align-items:center}
.lnk{border:0;background:none;color:inherit;text-decoration:underline;font-weight:700;font-size:12.5px;padding:4px}
.ret{border:1.5px dashed var(--sun-d);background:rgba(255,244,214,.6);border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:14px}
.ret-h{display:flex;flex-direction:column;font-size:13px;color:var(--warn)}.ret-h b{font-family:'Bricolage Grotesque',sans-serif;font-size:16px;color:var(--ink)}
.how{padding:0;list-style:none;counter-reset:s;display:flex;flex-direction:column;gap:8px}
.how li{counter-increment:s;display:flex;gap:12px;align-items:center;font-size:14.5px;font-weight:500;padding:10px 12px;border-radius:14px;background:var(--field);border:1px solid rgba(255,255,255,.9)}
.how li::before{content:counter(s);width:26px;height:26px;border-radius:50%;background:var(--teal-d);color:#fff;font-size:12.5px;font-weight:700;display:grid;place-items:center;flex-shrink:0}

/* ── Vehicles ── */
.incl{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:13px;color:var(--teal-d);font-weight:600}
.vlist{display:flex;flex-direction:column;gap:14px}
.vc{display:grid;grid-template-columns:1fr;border-radius:20px;overflow:hidden;cursor:pointer;background:rgba(255,255,255,.78);border:1.5px solid rgba(255,255,255,.9);box-shadow:0 8px 22px rgba(16,44,37,.10);transition:border-color .2s,box-shadow .25s,transform .25s}
.vc:hover:not(.lock){box-shadow:0 16px 34px rgba(16,44,37,.16);transform:translateY(-2px)}
.vc.sel{border-color:var(--teal);box-shadow:0 0 0 3px rgba(47,125,91,.22),0 16px 34px rgba(16,44,37,.14)}
.vc.lock{background:rgba(255,255,255,.5);cursor:default}.vc.lock .vc-img,.vc.lock .vc-top{opacity:.55}
.vc-img{position:relative;background:#e8f1e8;aspect-ratio:16/9}
.vc-img img{width:100%;height:100%;object-fit:cover;display:block}
.vc-badges{position:absolute;top:10px;left:10px;display:flex;gap:6px;flex-wrap:wrap}
.bd{background:rgba(255,255,255,.82);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:var(--teal-d);font-size:12px;font-weight:700;padding:3px 11px;border-radius:999px;border:1px solid rgba(255,255,255,.9)}
.bd.g{background:var(--teal-d);color:#fff;border-color:var(--teal-d)}
.vc-body{padding:14px 16px 16px;display:flex;flex-direction:column;gap:10px;justify-content:space-between}
.vc-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
.vc-name{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:17px;line-height:1.2}
.vc-model{font-size:13px;color:var(--mute)}
.vc-price{text-align:right;flex-shrink:0;display:flex;flex-direction:column;padding:5px 11px;border-radius:12px;background:rgba(255,244,214,.78);border:1px solid rgba(240,217,154,.9)}
.vc-price b{font-family:'Bricolage Grotesque',sans-serif;font-size:24px;font-weight:800;letter-spacing:-.02em;line-height:1.05;color:var(--teal-d);font-variant-numeric:tabular-nums}
.vc-price b.od{font-size:15px}
.vc-price small{font-size:11px;font-weight:600;color:var(--mute)}
.caps{display:flex;flex-wrap:wrap;gap:6px;font-size:12px;font-weight:600}
.caps span{background:rgba(47,125,91,.08);padding:4px 10px;border-radius:100px;color:var(--teal-d)}
.caps .x{background:var(--badl);color:var(--bad)}.caps .w{background:var(--warnl);color:var(--warn)}
.special{font-size:12.5px;color:var(--warn);font-weight:600}
.lockmsg{display:flex;flex-direction:column;gap:8px;align-items:flex-start;font-size:12.5px;font-weight:600;color:var(--bad)}
@media(min-width:720px){.vc{grid-template-columns:230px 1fr}.vc-img{aspect-ratio:auto;min-height:100%}}
@media(min-width:1024px) and (max-width:1199px){.vc{grid-template-columns:190px 1fr}}

/* ── Payment ── */
.pay{display:grid;grid-template-columns:1fr;gap:10px}
@media(min-width:640px){.pay{grid-template-columns:1fr 1fr}}
.pay button{display:flex;align-items:center;gap:12px;text-align:left;min-height:68px;padding:14px;border-radius:16px;color:var(--ink);background:var(--field);border:1.5px solid rgba(255,255,255,.9);box-shadow:0 1px 3px rgba(23,59,50,.10);transition:border-color .2s,box-shadow .2s}
.pay button:hover{background:rgba(255,255,255,.94)}
.pay button.on{border-color:var(--teal);box-shadow:0 0 0 3px rgba(47,125,91,.18)}
.pay .pi{font-size:24px}.pay b{display:block;font-size:14.5px}.pay small{display:block;font-size:12px;color:var(--mute)}
.pay .rd{margin-left:auto;width:20px;height:20px;border-radius:50%;border:2px solid var(--line);flex-shrink:0;background:#fff}
.pay .on .rd{border:6px solid var(--teal-d)}
.promo-r{display:grid;grid-template-columns:1fr auto;gap:8px}

/* ── Review + fare ── */
.sub{font-family:'Bricolage Grotesque',sans-serif;font-size:15px;font-weight:700;color:var(--teal);margin-bottom:-8px}
.rows,.fare{border-radius:16px;overflow:hidden;background:rgba(255,255,255,.72);border:1px solid rgba(255,255,255,.9);box-shadow:inset 0 1px 3px rgba(23,59,50,.05)}
.row{display:flex;justify-content:space-between;gap:16px;padding:11px 16px;font-size:14px;border-bottom:1px solid rgba(23,59,50,.08)}
.row:last-child{border-bottom:0}.row span{color:var(--mute)}.row b{font-weight:600;text-align:right;word-break:break-word}
.fare .row.night{background:var(--nightl)}.fare .row.night span,.fare .row.night b{color:var(--night)}
.fare .row.promo{background:var(--okl)}.fare .row.promo span,.fare .row.promo b{color:var(--teal-d)}
.fare .row.total{border-bottom:0;padding:15px 16px;background:linear-gradient(135deg,var(--teal-d),var(--teal))}
.fare .row.total span,.fare .row.total b{color:#fff;font-family:'Bricolage Grotesque',sans-serif;font-size:19px;font-weight:800}
.fine{margin-top:-6px;font-size:12.5px;color:var(--mute)}
.vmini{display:flex;gap:14px;align-items:center;border-radius:16px;padding:12px;background:rgba(255,255,255,.72);border:1px solid rgba(255,255,255,.9)}
.vmini img{width:80px;height:54px;border-radius:10px;object-fit:cover;background:#e8f1e8}.vmini b{display:block;font-size:14.5px}.vmini small{color:var(--mute);font-size:12.5px}

/* ── Buttons + nav ── */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:50px;padding:0 24px;border-radius:14px;font-weight:700;font-size:15px;border:0;text-decoration:none;transition:background .2s,transform .2s,box-shadow .2s}
.btn:hover:not(:disabled){transform:translateY(-2px)}
.btn:active{transform:scale(.98)}
.btn.dark,.btn.go{background:linear-gradient(180deg,#c2410c,#9a3412);color:#fff;box-shadow:0 8px 18px rgba(194,65,12,.38),inset 0 1px 0 rgba(255,255,255,.3)}
.btn.dark:hover:not(:disabled),.btn.go:hover:not(:disabled){background:linear-gradient(180deg,#9a3412,#7c2d12)}
.btn.brass{background:linear-gradient(180deg,#c2410c,#9a3412);color:#fff;box-shadow:0 8px 18px rgba(194,65,12,.38),inset 0 1px 0 rgba(255,255,255,.3)}
.btn.brass:hover:not(:disabled){background:linear-gradient(180deg,#9a3412,#7c2d12)}
.btn.line{background:rgba(255,255,255,.85);color:var(--teal-d);border:1.5px solid var(--line)}
.btn.line:hover{border-color:var(--teal);background:#fff}
.btn.sm{min-height:38px;font-size:13px;padding:0 14px;background:linear-gradient(180deg,#c2410c,#9a3412);color:#fff}
.btn.full{width:100%}.btn.wide{width:100%;margin-top:20px}.btn.grow{flex:1}
.btn:disabled{opacity:.6;cursor:not-allowed}

/* mobile: pinned glass action bar */
.nav{position:sticky;bottom:0;z-index:20;display:flex;gap:10px;align-items:center;margin:16px -14px 0;padding:12px 14px calc(12px + env(safe-area-inset-bottom));
  background:linear-gradient(135deg,rgba(255,255,255,.9),rgba(255,255,255,.78));-webkit-backdrop-filter:blur(18px) saturate(170%);backdrop-filter:blur(18px) saturate(170%);
  border-top:1px solid rgba(255,255,255,.8);box-shadow:0 -10px 30px rgba(16,44,37,.10)}
.navp{display:flex;flex-direction:column;line-height:1.1;padding:0 4px}.navp small{font-size:11px;font-weight:600;color:var(--mute)}
.navp b{font-family:'Bricolage Grotesque',sans-serif;font-size:21px;font-weight:800;color:var(--teal-d)}
@media(min-width:640px){.nav{margin-left:-24px;margin-right:-24px;padding-left:24px;padding-right:24px}}
@media(min-width:1024px){
  .nav{position:static;margin:20px 0 0;padding:0;background:none;border:0;box-shadow:none;-webkit-backdrop-filter:none;backdrop-filter:none}
  .navp{display:none}.btn.grow{flex:0 0 auto;min-width:240px;margin-left:auto}
}
.spin{width:18px;height:18px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:sp .7s linear infinite;display:inline-block}
.spin.dk{border-color:rgba(23,59,50,.2);border-top-color:var(--teal);width:14px;height:14px;margin-left:10px}
@keyframes sp{to{transform:rotate(360deg)}}

/* ── Trip ticket (laptop+) ── */
.ticket{color:#fff;filter:drop-shadow(0 24px 40px rgba(23,59,50,.28))}
.tk-top,.tk-bot{padding:22px;background:radial-gradient(70% 90% at 100% 0%,rgba(47,125,91,.30),transparent 65%),linear-gradient(135deg,var(--teal-d),var(--teal))}
.tk-bot{background:linear-gradient(135deg,var(--teal-d),#173b32)}
.tk-top{border-radius:24px 24px 0 0}.tk-bot{border-radius:0 0 24px 24px}
.tk-top>small{font-size:12.5px;color:rgba(255,255,255,.7);font-weight:600}
.route{margin:12px 0 14px;display:flex;flex-direction:column;gap:12px;position:relative}
.stop{display:flex;gap:12px;align-items:center;font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:16px;line-height:1.2}
.stop i{width:11px;height:11px;border-radius:50%;background:var(--sun);flex-shrink:0}
.stop i.e{background:transparent;border:2.5px solid var(--sun)}
.route::before{content:"";position:absolute;left:5px;top:14px;bottom:14px;border-left:2px dotted rgba(255,255,255,.4)}
.tk-meta{display:flex;flex-direction:column;gap:4px;font-size:13.5px;font-weight:500;color:rgba(255,255,255,.85)}
.tk-cut{height:0;position:relative;background:#173b32}
.tk-cut::before{content:"";position:absolute;left:20px;right:20px;top:-1px;border-top:2px dashed rgba(255,255,255,.28);z-index:1}
.tk-v{font-weight:700;font-size:14.5px}.tk-v small{display:block;font-weight:500;color:rgba(255,255,255,.65);font-size:12.5px}
.tk-price{font-family:'Bricolage Grotesque',sans-serif;font-size:44px;font-weight:800;letter-spacing:-.02em;line-height:1.1;margin:8px 0 2px;color:#bfd8c2;font-variant-numeric:tabular-nums}
.tk-s{color:rgba(255,255,255,.7);font-size:12.5px}.tk-q{color:#bfd8c2;font-weight:700}
.tk-pts{list-style:none;margin:16px 0 0;padding:14px 0 0;border-top:1px solid rgba(255,255,255,.18);display:flex;flex-direction:column;gap:6px;font-size:13.5px;font-weight:500;color:rgba(255,255,255,.85)}
.tk-pts li::before{content:"✓";color:#bed3bf;margin-right:8px;font-weight:700}
.empty{margin:0;font-size:13.5px;color:rgba(255,255,255,.7)}

/* ── Done screen ── */
.done{position:relative;max-width:580px;margin:28px 14px 56px;padding:34px 20px;border-radius:24px;text-align:center}
@media(min-width:640px){.done{margin:40px auto 64px;padding:40px 32px}}
.done>.rows,.done>.fare{text-align:left;margin-top:20px}
.done-ic{width:70px;height:70px;border-radius:50%;background:var(--okl);color:var(--teal-d);display:grid;place-items:center;font-size:32px;font-weight:700;margin:0 auto 16px;box-shadow:inset 0 1.5px 0 rgba(255,255,255,.8)}
.done-ic.q{background:rgba(255,244,214,.9);color:var(--warn)}
.done h1{font-family:'Bricolage Grotesque',sans-serif;font-size:clamp(26px,5vw,34px);font-weight:800;letter-spacing:-.02em}
.ref{display:inline-block;margin:10px 0;padding:4px 14px;border-radius:100px;background:rgba(255,244,214,.85);border:1px solid rgba(240,217,154,.9);font-weight:700;font-size:13px}
.lead{color:var(--ink2);font-size:15px;margin-top:6px}

@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){.glass,.nav{background:#fff}}
@media(prefers-reduced-transparency:reduce){.glass,.nav{background:#fff;-webkit-backdrop-filter:none;backdrop-filter:none}}
@media(prefers-reduced-motion:reduce){.tx *,.tx *::before{transition:none!important;animation:none!important}}
    `}</style>
  );
}