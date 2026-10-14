// app/api/send-booking-email/route.ts

import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BookingEmailData {
  bookingRef: string;
  name: string; email: string; country: string; whatsapp: string;
  fromName: string; toName: string;
  date: string; time: string;
  returnDate?: string | null; returnTime?: string | null;
  passengers: number; kids: number; bags: number;
  vehicleName: string; vehicleModel: string;
  isRoundTrip: boolean;
  flightTrain: string; address: string; notes: string;
  nightSurcharge: number;
  returnNightSurcharge?: number;
  basePrice: number | null;
  totalPrice: number | null;
  onDemand: boolean;
  paymentMethod: string;
  promoCode?: string | null;
  promoDiscountAmount?: number | null;
}

// ─── Shared row builder ───────────────────────────────────────────────────────
function buildRow(label: string, value: string, accent = false): string {
  return `
  <tr>
    <td style="padding:11px 24px;border-bottom:1px solid #f0f0f0;width:40%;">
      <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;">${label}</span>
    </td>
    <td style="padding:11px 24px;border-bottom:1px solid #f0f0f0;text-align:right;">
      <span style="font-size:13px;font-weight:700;color:${accent ? "#f97316" : "#111827"};">${value || "—"}</span>
    </td>
  </tr>`;
}

// ─── CUSTOMER EMAIL ───────────────────────────────────────────────────────────
function buildCustomerEmail(data: BookingEmailData): string {
  const {
    bookingRef, name, email, country, whatsapp,
    fromName, toName, date, time,
    returnDate, returnTime,
    passengers, kids, bags, vehicleName, vehicleModel,
    isRoundTrip, flightTrain, address, notes,
    nightSurcharge, returnNightSurcharge = 0,
    basePrice, totalPrice, onDemand,
    paymentMethod,
    promoCode,
    promoDiscountAmount = 0,
  } = data;

  const totalPax = passengers + kids;
  const year = new Date().getFullYear();
  const normalizedPromoDiscount = promoDiscountAmount ?? 0;
  const promoRow = promoCode && normalizedPromoDiscount > 0
    ? buildRow("Promo Code", `${promoCode} (-€${normalizedPromoDiscount.toFixed(2)})`, true)
    : "";

  // FIX 1: Pre-build the stats cells as a string to avoid .map() inside template literals
  const statsCells = [
    { label: "Date", value: date, icon: "📅" },
    { label: "Pickup Time", value: time + (nightSurcharge > 0 ? " 🌙" : ""), icon: "🕐" },
    { label: "Passengers", value: `${totalPax}`, icon: "👤" },
    { label: "Luggage", value: `${bags} bag${bags !== 1 ? "s" : ""}`, icon: "🧳" },
  ].map((s, i) => `
    <td style="text-align:center;padding:18px 8px;background:rgba(255,255,255,0.03);border-radius:10px;">
      <div style="font-size:18px;margin-bottom:8px;">${s.icon}</div>
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#666;margin-bottom:4px;">${s.label}</div>
      <div style="font-size:13px;font-weight:700;color:#f5f0e8;">${s.value}</div>
    </td>
    ${i < 3 ? '<td width="6px"></td>' : ""}
  `).join("");

  // FIX 2: Pre-build the "What to Expect" rows
  const expectRows = [
    ["🚘", "Professional Chauffeur", "A licensed, vetted driver in a pristine vehicle awaits you."],
    ["📍", "Meet & Greet Service", "Your chauffeur holds a name sign at arrivals — no searching required."],
    ["📱", "Driver Will Contact You", "Expect a call or WhatsApp message before your pickup time."],
    ["🔄", "Free Cancellation", "Cancel or modify your booking up to 24 hours before pickup."],
    ["🧳", "Porter Service Included", "Your driver will assist with your luggage at no extra charge."],
  ].map(([icon, title, sub]) => `
    <tr>
      <td width="44" style="vertical-align:top;padding:8px 14px 8px 0;">
        <div style="width:40px;height:40px;border-radius:10px;background:#f5f0e8;text-align:center;line-height:40px;font-size:18px;">${icon}</div>
      </td>
      <td style="vertical-align:top;padding:8px 0 8px;border-bottom:1px solid #f3f4f6;">
        <div style="font-size:13px;font-weight:700;color:#111827;margin-bottom:3px;">${title}</div>
        <div style="font-size:12px;color:#6b7280;line-height:1.5;">${sub}</div>
      </td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Booking Confirmed — Super Star Travel</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:Georgia,'Times New Roman',serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:48px 0 64px;">
<tr><td align="center">
<table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;">

  <!-- ═══ HEADER BRAND BAR ═══ -->
  <tr><td style="padding:0 0 28px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td>
        <span style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#f97316;">Super Star Travel</span>
      </td>
      <td style="text-align:right;">
        <span style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#555;">Premium Transfer</span>
      </td>
    </tr></table>
  </td></tr>

  <!-- ═══ HERO CARD ═══ -->
  <tr><td style="background:linear-gradient(160deg,#1a1200 0%,#0f0f0f 40%,#14283c 100%);border-radius:20px;border:1px solid #2a2200;overflow:hidden;">

    <div style="height:3px;background:linear-gradient(90deg,transparent,#f97316,#fb923c,#f97316,transparent);"></div>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:52px 48px 40px;text-align:center;">

        <div style="display:inline-block;width:80px;height:80px;border-radius:50%;border:2px solid #f97316;background:rgba(249,115,22,0.08);margin-bottom:28px;">
          <table width="80" height="80" cellpadding="0" cellspacing="0"><tr><td align="center" valign="middle">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </td></tr></table>
        </div>

        <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:#f97316;">Your Journey is Confirmed</p>
        <h1 style="margin:0 0 16px;font-size:38px;font-weight:400;color:#f5f0e8;line-height:1.1;font-style:italic;">Merci, ${name}.</h1>
        <p style="margin:0 0 32px;font-size:15px;color:rgba(245,240,232,0.5);line-height:1.7;max-width:420px;margin-left:auto;margin-right:auto;">
          Your luxury transfer has been arranged. A professional chauffeur will meet you at the designated point.
        </p>

        <div style="display:inline-block;border:1px solid rgba(249,115,22,0.4);border-radius:4px;padding:14px 32px;background:rgba(249,115,22,0.06);">
          <div style="font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#f97316;margin-bottom:6px;">Booking Reference</div>
          <div style="font-size:26px;font-weight:700;color:#fb923c;letter-spacing:0.15em;font-family:'Courier New',monospace;">${bookingRef}</div>
        </div>

      </td></tr>

      <!-- ─── ROUTE STRIP ─── -->
      <tr><td style="padding:0 48px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(249,115,22,0.15);border-bottom:1px solid rgba(249,115,22,0.15);padding:24px 0;">
          <tr>
            <td style="text-align:center;width:42%;">
              <div style="font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#f97316;margin-bottom:8px;">From</div>
              <div style="font-size:17px;font-weight:700;color:#f5f0e8;line-height:1.3;">${fromName}</div>
            </td>
            <td style="text-align:center;width:16%;">
              <div style="border-top:1px solid rgba(249,115,22,0.4);position:relative;margin:0 8px;">
                <div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);background:#1a1200;padding:0 6px;">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" style="display:block;">
                    <path stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                </div>
              </div>
              ${isRoundTrip ? `<div style="margin-top:14px;font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#ea580c;">Round Trip</div>` : ""}
            </td>
            <td style="text-align:center;width:42%;">
              <div style="font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#f97316;margin-bottom:8px;">To</div>
              <div style="font-size:17px;font-weight:700;color:#f5f0e8;line-height:1.3;">${toName}</div>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- ─── QUICK STATS ─── -->
      <tr><td style="padding:0 48px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>${statsCells}</tr>
        </table>
      </td></tr>

    </table>
  </td></tr>

  <!-- ═══ DETAILS CARDS ═══ -->
  <tr><td style="padding:24px 0 0;">

    <!-- Trip Details -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;margin-bottom:16px;">
      <tr><td style="padding:18px 24px;background:#f9f7f4;border-bottom:2px solid #e8e0d0;">
        <span style="font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#c2410c;">Trip Details</span>
      </td></tr>
      ${buildRow("Trip Type", isRoundTrip ? "🔄 Round Trip (×2 price)" : "→ One Way")}
      ${buildRow("Pickup", fromName)}
      ${buildRow("Drop-off", toName)}
      ${buildRow("Departure Date", date)}
      ${buildRow("Departure Time", time + (nightSurcharge > 0 ? "  🌙 Night fare" : ""))}
      ${isRoundTrip && returnDate ? buildRow("Return Date", returnDate) : ""}
      ${isRoundTrip && returnTime ? buildRow("Return Time", returnTime + (returnNightSurcharge > 0 ? "  🌙 Night fare" : "")) : ""}
      ${buildRow("Adults", `${passengers}`)}
      ${kids > 0 ? buildRow("Children", `${kids}`) : ""}
      ${buildRow("Luggage", `${bags} bag${bags !== 1 ? "s" : ""}`)}
      ${flightTrain ? buildRow("Flight / Train No.", flightTrain) : ""}
      ${address ? buildRow("Address", address) : ""}
      ${notes ? buildRow("Special Requests", notes) : ""}
    </table>

    <!-- Vehicle -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;margin-bottom:16px;">
      <tr><td style="padding:18px 24px;background:#f9f7f4;border-bottom:2px solid #e8e0d0;">
        <span style="font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#c2410c;">Vehicle</span>
      </td></tr>
      <tr><td style="padding:20px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td>
            <div style="font-size:16px;font-weight:700;color:#111827;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.04em;">${vehicleName}</div>
            <div style="font-size:12px;color:#9ca3af;font-style:italic;">${vehicleModel}</div>
          </td>
          <td style="text-align:right;vertical-align:top;">
            <div style="font-size:11px;color:#9ca3af;margin-bottom:4px;">${isRoundTrip ? "Round trip total" : "One way total"}</div>
            <div style="font-size:28px;font-weight:700;color:${onDemand ? "#f97316" : "#111827"};">${onDemand ? "On Demand" : `€${totalPrice}`}</div>
          </td>
        </tr></table>
      </td></tr>
    </table>

    <!-- Fare Breakdown -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;margin-bottom:16px;">
      <tr><td style="padding:18px 24px;background:#f9f7f4;border-bottom:2px solid #e8e0d0;">
        <span style="font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#c2410c;">Fare Breakdown</span>
      </td></tr>
      ${buildRow(`Base fare${isRoundTrip ? " (×2 round trip)" : ""}`, onDemand ? "On Demand" : `€${basePrice}`)}
      ${promoRow}
      ${nightSurcharge > 0 ? buildRow("🌙 Outbound Night Surcharge (10 PM – 6 AM)", `+€${nightSurcharge}`) : ""}
      ${returnNightSurcharge > 0 ? buildRow("🌙 Return Night Surcharge (10 PM – 6 AM)", `+€${returnNightSurcharge}`) : ""}
      <tr>
        <td colspan="2" style="padding:16px 24px;background:#fafaf8;border-top:2px solid #e8e0d0;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="font-size:14px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:0.06em;">Total</td>
            <td style="text-align:right;font-size:28px;font-weight:700;color:#f97316;">${onDemand ? "On Demand" : `€${totalPrice}`}</td>
          </tr></table>
        </td>
      </tr>
    </table>

    <!-- Your Details -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;margin-bottom:16px;">
      <tr><td style="padding:18px 24px;background:#f9f7f4;border-bottom:2px solid #e8e0d0;">
        <span style="font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#c2410c;">Your Details</span>
      </td></tr>
      ${buildRow("Name", name)}
      ${buildRow("Country", country)}
      ${buildRow("WhatsApp", whatsapp)}
      ${buildRow("Email", email)}
      ${buildRow("Payment", paymentMethod === "cash" ? "💵 Cash to driver" : "💳 Card to driver")}
    </table>

  </td></tr>

  <!-- ═══ PAYMENT NOTICE ═══ -->
  <tr><td style="padding:8px 0 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#14283c,#14283c);border-radius:16px;border:1px solid rgba(22,163,74,0.3);overflow:hidden;">
      <tr><td style="padding:28px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td>
            <div style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#fb923c;margin-bottom:8px;">Fixed Price Guarantee</div>
            <div style="font-size:14px;color:rgba(245,240,232,0.7);line-height:1.7;">Your fare is locked. No surge pricing, no hidden fees.<br/>Pay your chauffeur directly upon arrival — ${paymentMethod === "cash" ? "cash" : "card"} accepted.</div>
          </td>
          <td style="text-align:right;vertical-align:middle;padding-left:24px;white-space:nowrap;">
            <div style="font-size:32px;font-weight:700;color:#fb923c;">${onDemand ? "On Demand" : `€${totalPrice}`}</div>
            <div style="font-size:10px;color:rgba(251,146,60,0.65);letter-spacing:0.08em;text-transform:uppercase;">incl. VAT</div>
          </td>
        </tr></table>
      </td></tr>
    </table>
  </td></tr>

  <!-- ═══ WHAT TO EXPECT ═══ -->
  <tr><td style="padding:24px 0 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;">
      <tr><td style="padding:18px 24px;background:#f9f7f4;border-bottom:2px solid #e8e0d0;">
        <span style="font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#c2410c;">What to Expect</span>
      </td></tr>
      <tr><td style="padding:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${expectRows}
        </table>
      </td></tr>
    </table>
  </td></tr>

  <!-- ═══ CONTACT CARD ═══ -->
  <tr><td style="padding:16px 0 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1a1200,#0f0f0f);border-radius:16px;border:1px solid #2a2200;overflow:hidden;">
      <tr><td style="padding:28px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td>
            <div style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#f97316;margin-bottom:10px;">Need to Modify Your Booking?</div>
            <div style="font-size:13px;color:rgba(245,240,232,0.5);line-height:1.9;">
              📧 <a href="mailto:support@superstartravelcabs.com" style="color:#f97316;text-decoration:none;">support@superstartravelcabs.com</a><br/>
              📞 <a href="tel:+94726803498" style="color:#f97316;text-decoration:none;">+94 72 680 3498</a>
            </div>
          </td>
          <td style="text-align:right;vertical-align:middle;">
            <div style="font-size:18px;font-weight:400;color:#f5f0e8;font-style:italic;">Super Star Travel</div>
          </td>
        </tr></table>
      </td></tr>
    </table>
  </td></tr>

  <!-- ═══ FOOTER ═══ -->
  <tr><td style="padding:32px 0 0;text-align:center;">
    <div style="height:1px;background:linear-gradient(90deg,transparent,#2a2200,transparent);margin-bottom:24px;"></div>
    <p style="margin:0 0 6px;font-size:11px;color:#444;letter-spacing:0.06em;">© ${year} Super Star Travel · Colombo, Sri Lanka</p>
    <p style="margin:0;font-size:11px;color:#333;">Booking reference: <span style="color:#f97316;font-family:'Courier New',monospace;font-weight:700;">${bookingRef}</span></p>
  </td></tr>

</table>
</td></tr>
</table>

</body>
</html>`;
}

// ─── ADMIN EMAIL ──────────────────────────────────────────────────────────────
function buildAdminEmail(data: BookingEmailData): string {
  const {
    bookingRef, name, email, whatsapp, country,
    fromName, toName, date, time,
    returnDate, returnTime,
    passengers, kids, bags,
    vehicleName, vehicleModel,
    isRoundTrip, flightTrain, address, notes,
    nightSurcharge, returnNightSurcharge = 0,
    basePrice, totalPrice, onDemand,
    paymentMethod,
    promoCode,
    promoDiscountAmount = 0,
  } = data;

  const totalPax = passengers + kids;
  const year = new Date().getFullYear();
  const now = new Date().toUTCString();
  const normalizedPromoDiscount = promoDiscountAmount ?? 0;
  const promoRow = promoCode && normalizedPromoDiscount > 0
    ? buildRow("Promo Code", `${promoCode} (-€${normalizedPromoDiscount.toFixed(2)})`, true)
    : "";
  const isNight = nightSurcharge > 0;
  const isReturnNight = returnNightSurcharge > 0;

  // FIX 3: Pre-build admin stat cells to avoid .map() inside template literals
  const adminStatCells = [
    {
      label: "Passengers",
      value: `${totalPax}`,
      sub: `${passengers} adult${passengers !== 1 ? "s" : ""}${kids > 0 ? ` + ${kids} child${kids !== 1 ? "ren" : ""}` : ""}`,
    },
    { label: "Luggage", value: `${bags}`, sub: `bag${bags !== 1 ? "s" : ""}` },
    {
      label: "Vehicle",
      value: vehicleName.split(" ").slice(0, 2).join(" "),
      sub: vehicleModel.split(" ").slice(0, 3).join(" "),
    },
    {
      label: "Total Fare",
      value: onDemand ? "On Demand" : `€${totalPrice}`,
      sub: paymentMethod === "cash" ? "💵 Cash" : "💳 Card",
    },
  ].map((s, i) => `
    <td style="text-align:center;padding:22px 12px;${i < 3 ? "border-right:1px solid #f3f4f6;" : ""}">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;margin-bottom:6px;">${s.label}</div>
      <div style="font-size:18px;font-weight:800;color:#111827;margin-bottom:3px;">${s.value}</div>
      <div style="font-size:11px;color:#9ca3af;">${s.sub}</div>
    </td>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>New Booking — ${bookingRef}</title>
</head>
<body style="margin:0;padding:0;background:#f1f3f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f3f5;padding:40px 0 60px;">
<tr><td align="center">
<table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;">

  <!-- ═══ TOP ALERT HEADER ═══ -->
  <tr><td style="background:#111827;border-radius:18px 18px 0 0;padding:0;overflow:hidden;">
    <div style="height:4px;background:linear-gradient(90deg,#18324b,#356b9a,#f97316);"></div>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:24px 32px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle;">
            <div style="display:inline-block;background:rgba(249,115,22,0.15);border:1px solid rgba(249,115,22,0.3);border-radius:6px;padding:4px 12px;margin-bottom:10px;">
              <span style="font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#fb923c;">🚨 New Booking Alert</span>
            </div>
            <div style="font-size:24px;font-weight:800;color:#ffffff;margin-bottom:4px;">${name}</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.45);">${email} &nbsp;·&nbsp; ${whatsapp} &nbsp;·&nbsp; ${country}</div>
          </td>
          <td style="text-align:right;vertical-align:middle;">
            <div style="background:rgba(249,115,22,0.1);border:1.5px solid rgba(249,115,22,0.35);border-radius:10px;padding:12px 20px;display:inline-block;">
              <div style="font-size:9px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#f97316;margin-bottom:4px;">Ref No.</div>
              <div style="font-size:20px;font-weight:900;color:#fb923c;letter-spacing:0.1em;font-family:'Courier New',monospace;">${bookingRef}</div>
            </div>
          </td>
        </tr></table>
      </td></tr>
    </table>
  </td></tr>

  <!-- ═══ ROUTE + DATE BANNER ═══ -->
  <tr><td style="background:#1e293b;padding:18px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td>
        <div style="font-size:16px;font-weight:800;color:#fff;">
          ${fromName}
          <span style="color:#f97316;margin:0 10px;">→</span>
          ${toName}
          ${isRoundTrip ? `<span style="display:inline-block;margin-left:8px;background:#7c2d12;color:#fed7aa;font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:3px 8px;border-radius:4px;">Round Trip</span>` : ""}
        </div>
      </td>
      <td style="text-align:right;white-space:nowrap;">
        <div style="font-size:14px;font-weight:700;color:#f97316;">${date}</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.5);">${time}${isNight ? " 🌙" : ""}</div>
        ${isRoundTrip && returnDate ? `<div style="font-size:11px;color:rgba(245,158,11,0.7);margin-top:4px;">🔄 Return: ${returnDate} ${returnTime ?? ""}${isReturnNight ? " 🌙" : ""}</div>` : ""}
      </td>
    </tr></table>
  </td></tr>

  <!-- ═══ KEY STATS ROW ═══ -->
  <tr><td style="background:#fff;padding:0;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>${adminStatCells}</tr>
    </table>
  </td></tr>

  <!-- ═══ FULL DETAILS TABLE ═══ -->
  <tr><td style="background:#fff;padding:0 0 0;border-top:2px solid #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0">

      <tr><td colspan="2" style="padding:16px 24px 8px;background:#f9fafb;border-top:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6;">
        <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#6b7280;">📋 Booking Information</span>
      </td></tr>
      ${buildRow("Trip Type", isRoundTrip ? "🔄 Round Trip (×2 price)" : "→ One Way")}
      ${buildRow("Pickup Location", fromName)}
      ${buildRow("Drop-off Location", toName)}
      ${buildRow("Departure Date", date)}
      ${buildRow("Departure Time", time + (isNight ? "  🌙 Night surcharge applies" : ""))}
      ${isRoundTrip && returnDate ? buildRow("Return Date", returnDate) : ""}
      ${isRoundTrip && returnTime ? buildRow("Return Time", returnTime + (isReturnNight ? "  🌙 Night surcharge applies" : "")) : ""}
      ${buildRow("Adults", `${passengers}`)}
      ${kids > 0 ? buildRow("Children", `${kids}`) : ""}
      ${buildRow("Total Passengers", `${totalPax}`)}
      ${buildRow("Luggage Bags", `${bags}`)}
      ${flightTrain ? buildRow("Flight / Train No.", flightTrain, true) : ""}
      ${address ? buildRow("Address", address, true) : ""}

      <tr><td colspan="2" style="padding:16px 24px 8px;background:#f9fafb;border-top:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6;">
        <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#6b7280;">🚘 Vehicle</span>
      </td></tr>
      ${buildRow("Vehicle Type", vehicleName)}
      ${buildRow("Model", vehicleModel)}

      <tr><td colspan="2" style="padding:16px 24px 8px;background:#f9fafb;border-top:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6;">
        <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#6b7280;">💶 Fare</span>
      </td></tr>
      ${buildRow(`Base Fare${isRoundTrip ? " (×2 round trip)" : ""}`, onDemand ? "On Demand" : `€${basePrice}`)}
      ${promoRow}
      ${isNight ? buildRow("🌙 Outbound Night Surcharge", `+€${nightSurcharge}`) : ""}
      ${isReturnNight ? buildRow("🌙 Return Night Surcharge", `+€${returnNightSurcharge}`) : ""}
      <tr>
        <td style="padding:14px 24px;border-bottom:1px solid #f0f0f0;border-top:2px solid #111827;background:#f0fdf4;" width="40%">
          <span style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#18324b;">Total Charged</span>
        </td>
        <td style="padding:14px 24px;border-bottom:1px solid #f0f0f0;border-top:2px solid #111827;background:#f0fdf4;text-align:right;">
          <span style="font-size:22px;font-weight:900;color:#f97316;">${onDemand ? "On Demand" : `€${totalPrice}`}</span>
        </td>
      </tr>
      ${buildRow("Payment Method", paymentMethod === "cash" ? "💵 Cash to driver" : "💳 Card to driver")}

      <tr><td colspan="2" style="padding:16px 24px 8px;background:#f9fafb;border-top:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6;">
        <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#6b7280;">👤 Customer</span>
      </td></tr>
      ${buildRow("Full Name", name)}
      ${buildRow("Country", country)}
      ${buildRow("WhatsApp", whatsapp)}
      ${buildRow("Email", email)}
      ${notes ? buildRow("Special Requests", notes, true) : ""}

      <tr><td colspan="2" style="padding:10px 24px;background:#fafafa;border-top:1px solid #f3f4f6;">
        <span style="font-size:10px;color:#d1d5db;">Received: ${now}</span>
      </td></tr>

    </table>
  </td></tr>

  <!-- ═══ ACTION BUTTONS ═══ -->
  <tr><td style="background:#fff;padding:20px 24px 28px;border-top:1px solid #f3f4f6;border-radius:0 0 18px 18px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-right:8px;">
          <a href="mailto:${email}?subject=Re:%20Your%20Paris%20Easy%20Move%20Booking%20${bookingRef}&body=Dear%20${encodeURIComponent(name)},%0A%0AThank%20you%20for%20booking%20with%20Paris%20Easy%20Move.%0A%0AYour%20booking%20reference%20is%20${bookingRef}.%0A%0A"
            style="display:block;text-align:center;padding:14px 20px;background:#111827;color:#fff;border-radius:10px;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;">
            ✉️ &nbsp;Reply to Client
          </a>
        </td>
        <td style="padding:0 8px;">
          <a href="https://wa.me/${whatsapp.replace(/\D/g, "")}"
            style="display:block;text-align:center;padding:14px 20px;background:#16a34a;color:#fff;border-radius:10px;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;">
            💬 &nbsp;WhatsApp Client
          </a>
        </td>
        <td style="padding-left:8px;">
          <a href="tel:${whatsapp.replace(/\D/g, "")}"
            style="display:block;text-align:center;padding:14px 20px;background:#2563eb;color:#fff;border-radius:10px;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;">
            📞 &nbsp;Call Client
          </a>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- ═══ FOOTER ═══ -->
  <tr><td style="padding:20px 0 0;text-align:center;">
    <p style="margin:0;font-size:11px;color:#9ca3af;">Super Star Travel Admin System &nbsp;·&nbsp; support@superstartravelcabs.com &nbsp;·&nbsp; Ref: <strong>${bookingRef}</strong></p>
  </td></tr>

</table>
</td></tr>
</table>

</body>
</html>`;
}

const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

// ─── ROUTE HANDLER ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = body as BookingEmailData;

    // ── Validate required fields early ────────────────────────────────────────
    if (!data.email || !data.bookingRef) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: email or bookingRef" },
        { status: 400 }
      );
    }

    if (!isValidEmail(data.email)) {
      return NextResponse.json(
        { ok: false, error: "Customer email is invalid." },
        { status: 400 }
      );
    }

    const customerHtml = buildCustomerEmail(data);
    const adminHtml    = buildAdminEmail(data);

    const adminTo  = (process.env.ADMIN_EMAIL ?? "support@superstartravelcabs.com").trim();
    const fromAddr = (process.env.EMAIL_FROM ?? process.env.RESEND_FROM ?? "onboarding@resend.dev").trim();

    if (!isValidEmail(adminTo) || !isValidEmail(fromAddr)) {
      return NextResponse.json(
        { ok: false, error: "Missing or invalid sender/recipient email configuration. Set ADMIN_EMAIL and EMAIL_FROM to valid addresses or verify the Resend sender domain." },
        { status: 500 }
      );
    }

    const customerSubject = `✅ Booking Confirmed — ${data.fromName} → ${data.toName} · Ref: ${data.bookingRef}`;
    const adminSubject    = `🚖 New Booking: ${data.name} — ${data.fromName} → ${data.toName} · ${data.date} ${data.time} · ${data.bookingRef}`;

    if (!process.env.RESEND_API_KEY) {
      console.error("[send-booking-email] RESEND_API_KEY is missing. Add it in your environment and verify the sender domain before sending emails.");
      return NextResponse.json(
        { ok: false, error: "RESEND_API_KEY is missing. Add it to the environment and verify the sender email/domain in Resend." },
        { status: 500 }
      );
    }

    // ── OPTION A: Resend ──────────────────────────────────────────────────────
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      const [customerResult, adminResult] = await Promise.all([
        resend.emails.send({
          from: `Super Star Travel <${fromAddr}>`,
          to: data.email,
          subject: customerSubject,
          html: customerHtml,
        }),
        resend.emails.send({
          from: `Super Star Travel <${fromAddr}>`,
          to: adminTo,
          subject: adminSubject,
          html: adminHtml,
        }),
      ]);

      if (customerResult.error || adminResult.error) {
        console.error("[send-booking-email] Resend errors:", customerResult.error, adminResult.error);
        return NextResponse.json(
          { ok: false, error: customerResult.error ?? adminResult.error },
          { status: 500 }
        );
      }

      return NextResponse.json({ ok: true, customer: customerResult, admin: adminResult });
    }

    // ── OPTION B: Nodemailer SMTP ─────────────────────────────────────────────
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("[send-booking-email] No email provider configured. Set RESEND_API_KEY or EMAIL_USER + EMAIL_PASS.");
      return NextResponse.json(
        { ok: false, error: "Email provider not configured on server." },
        { status: 500 }
      );
    }

    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host:   process.env.EMAIL_HOST   ?? "smtp.gmail.com",
      port:   parseInt(process.env.EMAIL_PORT ?? "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();

    await Promise.all([
      transporter.sendMail({
        from: `"Super Star Travel" <${fromAddr}>`,
        to: data.email,
        subject: customerSubject,
        html: customerHtml,
      }),
      transporter.sendMail({
        from: `"Super Star Travel Bookings" <${fromAddr}>`,
        to: adminTo,
        subject: adminSubject,
        html: adminHtml,
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    // FIX 4: Replaced `any` with `unknown` + proper type narrowing
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[send-booking-email] error:", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}