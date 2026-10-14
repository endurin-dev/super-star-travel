"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";

/* ─────────────────────────────────────────────
   Edit these once — same details as the Privacy page
   ───────────────────────────────────────────── */
const BRAND        = "Super Star Travel";
const SITE_LABEL   = "www.superstartravelcabs.com";
const EMAIL        = "support@superstartravelcabs.com";
const PHONE_1      = { display: "+94 72 680 3498", tel: "+94726803498" };
const WHATSAPP_URL = "https://wa.me/94726803498";
const ADDRESS      = "Colombo, Sri Lanka";
const LAST_UPDATED = "October 8, 2026";

const sections = [
  {
    num: "01",
    title: "Definitions",
    content: (
      <>
        <p>In these Terms and Conditions, the following definitions apply:</p>
        <ul>
          <li><strong>“Company”</strong> refers to Super Star Travel, a private tourist transport and car-and-driver provider operating in Sri Lanka.</li>
          <li><strong>“Client”</strong> refers to any individual, group, or organisation that makes a booking with the Company.</li>
          <li><strong>“Service”</strong> refers to any airport transfer, island-wide transfer, day tour, multi-day car and driver hire, group or coach transport, or other transportation service provided by the Company.</li>
          <li><strong>“Booking”</strong> refers to a confirmed reservation made via the website, phone, email, or WhatsApp.</li>
          <li><strong>“Driver”</strong> refers to any licensed, experienced driver operating on behalf of the Company.</li>
          <li><strong>“Vehicle”</strong> refers to any car, van, minibus, or bus operated under a Super Star Travel booking.</li>
        </ul>
      </>
    ),
  },
  {
    num: "02",
    title: "Scope of Services & Fleet",
    content: (
      <>
        <p>Super Star Travel provides private tourist transport across Sri Lanka, including but not limited to:</p>
        <ul>
          <li>Airport transfers to and from Bandaranaike International Airport (CMB), Mattala Rajapaksa International Airport (HRI), and domestic airports</li>
          <li>Island-wide transfers between cities, hotels, beaches, hill country towns, and national parks</li>
          <li>Day tours and sightseeing trips with a driver</li>
          <li>Multi-day car and driver hire for round trips and custom itineraries</li>
          <li>Train station and bus station pickups and drop-offs</li>
          <li>Group transport for weddings, events, school or corporate trips, and tour groups</li>
        </ul>
        <p>Our fleet includes <strong>cars</strong> (for small parties), <strong>vans</strong> (for families and mid-sized groups), and <strong>minibuses and buses</strong> (for large groups). The vehicle type, seating capacity, and air-conditioning availability are stated in your booking confirmation. Vehicles are private to the Client and are never shared with other passengers without prior agreement.</p>
      </>
    ),
  },
  {
    num: "03",
    title: "Booking & Confirmation",
    content: (
      <>
        <p>A booking is considered confirmed only when the Client receives a written confirmation (email or WhatsApp message) from Super Star Travel.</p>
        <ul>
          <li>The Client is responsible for providing accurate pickup and drop-off details, flight or train numbers, travel dates and times, passenger count, and luggage information at the time of booking.</li>
          <li>The Company may contact the Client to verify booking details before confirming the reservation.</li>
          <li>Vehicle availability is not guaranteed until the booking is confirmed. During peak seasons and public holidays, we recommend booking as early as possible.</li>
          <li>Super Star Travel reserves the right to decline a booking at its discretion, in which case any payment received will be fully refunded.</li>
          <li>If the Client’s group is larger than first stated, the Company may need to change the Vehicle type, and the price may be adjusted accordingly.</li>
        </ul>
      </>
    ),
  },
  {
    num: "04",
    title: "Pricing & Payment",
    content: (
      <>
        <p>All prices are quoted in the currency stated in your booking confirmation and are agreed in advance.</p>
        <ul>
          <li><strong>Fixed Pricing</strong>: The quoted price is guaranteed at the time of confirmation. There are no hidden fees.</li>
          <li><strong>What Is Included</strong>: Unless your quote says otherwise, the price includes the Vehicle, Driver, fuel, standard waiting time, and applicable taxes. Expressway and highway tolls are included unless stated otherwise in your quote.</li>
          <li><strong>What Is Not Included</strong>: Entrance fees (national parks, safaris, temples, museums), meals, personal expenses, and parking at attractions are paid by the Client unless stated otherwise.</li>
          <li><strong>Night Travel</strong>: A surcharge may apply for pickups or journeys late at night or early in the morning. Any surcharge is stated in your quote before you confirm.</li>
          <li><strong>Payment Methods</strong>: Payment is made as agreed in your booking confirmation, by cash, card, or bank or online transfer. Some bookings, especially large group or multi-day bookings, may require a deposit to secure the Vehicle.</li>
          <li><strong>On-Demand Pricing</strong>: Bespoke itineraries and large group transport are quoted on request and confirmed in writing before the booking is finalised.</li>
          <li>The Company may adjust its prices at any time. Changes do not affect confirmed bookings.</li>
        </ul>
      </>
    ),
  },
  {
    num: "05",
    title: "Day Tours & Multi-Day Hire",
    content: (
      <>
        <p>For day tours and multi-day car and driver hire, the following conditions apply:</p>
        <ul>
          <li><strong>Itinerary</strong>: The itinerary is agreed with the Client in advance. Reasonable changes may be made on the day with the Driver’s agreement, depending on time, distance, and road conditions.</li>
          <li><strong>Daily Hours &amp; Distance</strong>: The daily driving hours and distance allowance are stated in your quote. Extra distance or overtime beyond the agreed limits may be charged at the rate stated in your quote.</li>
          <li><strong>Driver Accommodation &amp; Meals</strong>: For multi-day hire, the arrangement for Driver accommodation and meals (whether included in the price or provided by the Client) is confirmed in your quote.</li>
          <li><strong>Rest Periods</strong>: For safety, Drivers must take reasonable rest breaks. The Company may refuse a request that would require unsafe driving hours.</li>
          <li><strong>Stops</strong>: Additional stops are welcome where time allows. Long delays at stops may affect the rest of the itinerary, and the Company is not responsible for activities missed as a result.</li>
        </ul>
      </>
    ),
  },
  {
    num: "06",
    title: "Cancellation & Modification Policy",
    content: (
      <>
        <p>We understand that travel plans can change. Our cancellation and modification policy is as follows:</p>
        <ul>
          <li><strong>Free Cancellation</strong>: Cancellations made more than 24 hours before the scheduled pickup time incur no charge.</li>
          <li><strong>Late Cancellation</strong>: Cancellations made within 24 hours of the scheduled pickup may be subject to a cancellation fee of up to 50% of the booking value.</li>
          <li><strong>No-Show</strong>: If the Client fails to appear at the agreed pickup location without prior notice, the full fare may be charged.</li>
          <li><strong>Group &amp; Multi-Day Bookings</strong>: Bookings of buses, minibuses, or multi-day hire may have a longer cancellation notice period or a non-refundable deposit. These terms are stated in your quote or booking confirmation.</li>
          <li><strong>Modifications</strong>: Changes to pickup time, location, route, or passenger count can be requested by contacting us at least 12 hours in advance. We will confirm whether the modification is possible and whether the price changes.</li>
          <li>Cancellations and modifications must be communicated in writing via email or WhatsApp to be considered valid.</li>
        </ul>
      </>
    ),
  },
  {
    num: "07",
    title: "Flight Monitoring & Waiting Time",
    content: (
      <>
        <p>Super Star Travel monitors incoming flights using live flight tracking.</p>
        <ul>
          <li><strong>Airport Pickups</strong>: The Driver will track your flight and adjust the pickup time accordingly at no extra charge. Standard complimentary waiting time is 60 minutes after the scheduled landing time.</li>
          <li><strong>Train Station Pickups</strong>: Complimentary waiting time is 30 minutes after the confirmed arrival time.</li>
          <li><strong>Other Pickups</strong>: Complimentary waiting time is 15 minutes from the scheduled pickup time.</li>
          <li>Waiting time beyond the complimentary period may be charged at the rate stated in your quote.</li>
          <li>The Client should provide their flight or train number at the time of booking to enable tracking. The Company is not liable for delays caused by incorrect or missing flight or train information.</li>
          <li>Trains in Sri Lanka can run significantly late. Please share your ticket details and keep your phone reachable so the Driver can adjust.</li>
        </ul>
      </>
    ),
  },
  {
    num: "08",
    title: "Meet & Greet Service",
    content: (
      <>
        <p>For airport and train station pickups, Super Star Travel provides a meet &amp; greet service as standard:</p>
        <ul>
          <li>The Driver will wait in the arrivals area holding a name sign with the Client’s name.</li>
          <li>The Driver will assist with luggage from the arrivals area to the Vehicle.</li>
          <li>The exact meeting point will be confirmed in your booking confirmation.</li>
          <li>If the Client cannot locate the Driver, they should call or WhatsApp the number provided in the confirmation without delay.</li>
        </ul>
      </>
    ),
  },
  {
    num: "09",
    title: "Luggage, Child Seats & Special Requests",
    content: (
      <>
        <p>Super Star Travel endeavours to accommodate all reasonable special requests, subject to availability.</p>
        <ul>
          <li><strong>Luggage</strong>: The Client must declare the number and size of bags at the time of booking. Luggage space differs between cars, vans, and buses. Excess luggage beyond the declared amount may require a larger Vehicle at additional cost, subject to availability.</li>
          <li><strong>Child Seats</strong>: Baby seats and child booster seats are available on request, subject to availability. Requests must be made at the time of booking, and any charge is stated in your quote.</li>
          <li><strong>Accessibility</strong>: If a passenger has reduced mobility or needs assistance, please tell us at the time of booking so we can recommend a suitable Vehicle and help.</li>
          <li><strong>Surfboards, Bicycles &amp; Large Items</strong>: Please tell us in advance. Large items may need a bigger Vehicle or a roof rack, and an extra charge may apply.</li>
          <li><strong>Pets</strong>: Pets are permitted only with prior approval. Additional cleaning charges may apply.</li>
        </ul>
      </>
    ),
  },
  {
    num: "10",
    title: "Vehicle Capacity, Safety & Road Conditions",
    content: (
      <>
        <p>Your safety is our priority. Our Vehicles are maintained for road use, and our Drivers are licensed and experienced on Sri Lankan roads.</p>
        <ul>
          <li><strong>Passenger Capacity</strong>: The number of passengers must never exceed the registered seating capacity of the Vehicle. Seat belts must be worn where fitted.</li>
          <li><strong>Driver’s Discretion</strong>: The Driver may refuse to continue or change a route if conditions are unsafe, for example heavy rain, flooding, landslide risk, damaged roads, or unsafe behaviour by passengers.</li>
          <li><strong>Travel Times</strong>: Journey times given are estimates only. Traffic, roadworks, hill country roads, festival days, and Poya holidays can add significant time, so please allow extra time for important connections, especially flights.</li>
          <li><strong>Route Suitability</strong>: Some destinations, such as rough tracks, national park interiors, or remote hill roads, may not suit certain Vehicle types (for example buses). We will advise you at booking.</li>
          <li><strong>Speed &amp; Driving Standards</strong>: Drivers follow Sri Lankan traffic law and speed limits. Clients must not ask Drivers to drive unsafely or break the law.</li>
        </ul>
      </>
    ),
  },
  {
    num: "11",
    title: "Client Obligations",
    content: (
      <>
        <p>The Client agrees to the following obligations when using Super Star Travel services:</p>
        <ul>
          <li>Be ready at the designated pickup location at the confirmed time.</li>
          <li>Provide accurate booking information, including addresses, passenger numbers, and flight details.</li>
          <li>Ensure all passengers behave respectfully towards the Driver and do not damage the Vehicle.</li>
          <li>Refrain from smoking or using illegal substances in any Vehicle. Food and alcohol may be consumed only with the Driver’s permission. Violations may result in additional cleaning charges.</li>
          <li>Not carry illegal goods, prohibited items, or hazardous materials in the Vehicle.</li>
          <li>Notify the Company promptly of any changes to travel plans.</li>
          <li>Ensure children are accompanied by a responsible adult at all times.</li>
          <li>Keep their own passports, valuables, and travel documents with them at all times.</li>
        </ul>
      </>
    ),
  },
  {
    num: "12",
    title: "Liability & Limitations",
    content: (
      <>
        <p>Super Star Travel takes reasonable care to provide safe and reliable transport. The following limitations of liability apply:</p>
        <ul>
          <li>The Company is not liable for delays caused by traffic, weather, road closures, accidents, protests, strikes, or any circumstances beyond its control.</li>
          <li>The Company is not liable for missed flights, trains, tours, or connections caused by events outside its control. Clients are advised to allow generous time for flights.</li>
          <li>The Company’s liability for any claim shall not exceed the total value of the booking in question, except where the law does not allow this limit.</li>
          <li>The Company is not responsible for personal belongings left in the Vehicle. Lost property that is found will be held for 14 days and arrangements made for collection or return at the Client’s cost.</li>
          <li>The Client is liable for any damage caused to the Vehicle through negligence or deliberate action.</li>
          <li>Clients are strongly encouraged to hold their own travel and medical insurance. Nothing in these Terms limits any rights that cannot be excluded under Sri Lankan law.</li>
        </ul>
      </>
    ),
  },
  {
    num: "13",
    title: "Force Majeure",
    content: (
      <p>Super Star Travel shall not be held liable for any failure to perform its obligations due to events beyond its reasonable control, including but not limited to natural disasters, floods, landslides, severe monsoon weather, fuel shortages, government restrictions, curfews, strikes, pandemic measures, civil unrest, or acts of war. In such cases, the Company will endeavour to provide an alternative solution or issue a full or partial refund at its discretion.</p>
    ),
  },
  {
    num: "14",
    title: "Privacy & Data Protection",
    content: (
      <p>The collection, use, and storage of personal data is governed by our <Link href="/privacy">Privacy Policy</Link>. By making a booking, the Client consents to the processing of their personal data as described therein, in accordance with the Personal Data Protection Act, No. 9 of 2022 of Sri Lanka and, where applicable, the GDPR.</p>
    ),
  },
  {
    num: "15",
    title: "Complaints & Dispute Resolution",
    content: (
      <>
        <p>Super Star Travel is committed to providing an excellent service. In the event of a complaint:</p>
        <ul>
          <li>Complaints should be submitted in writing to <a href={`mailto:${EMAIL}`}>{EMAIL}</a> within 7 days of the service date.</li>
          <li>We will acknowledge your complaint within 48 hours and aim to resolve it within 14 days.</li>
          <li>If a resolution cannot be reached, the Client may refer the matter to the relevant Sri Lankan authority, such as the Sri Lanka Tourism Development Authority or the Consumer Affairs Authority.</li>
        </ul>
      </>
    ),
  },
  {
    num: "16",
    title: "Governing Law",
    content: (
      <p>These Terms and Conditions are governed by and construed in accordance with the laws of Sri Lanka. Any disputes arising from these Terms shall be subject to the jurisdiction of the courts of Sri Lanka.</p>
    ),
  },
  {
    num: "17",
    title: "Amendments",
    content: (
      <p>Super Star Travel reserves the right to amend these Terms and Conditions at any time. The most current version will always be published on our website. Continued use of our services following any amendments constitutes acceptance of the revised Terms.</p>
    ),
  },
];

const CONTACT_NUM = String(sections.length + 1).padStart(2, "0");

export default function TermsAndConditions() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    document.querySelectorAll("[data-section]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const closeJump = () => {
    const d = document.getElementById("tc-jump") as HTMLDetailsElement | null;
    if (d) d.open = false;
  };

  return (
    <>
      <Header />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap');

        html { scroll-behavior:smooth; }
        @media (prefers-reduced-motion:reduce) { html { scroll-behavior:auto; } }

        .tc-root {
          --h-ink:       #173b32;
          --h-ink-soft:  rgba(23,59,50,.82);
          --h-ink-faint: rgba(23,59,50,.66);
          --h-teal:      #2f7d5b;
          --h-teal-deep: #173b32;
          --h-sun:       #2f7d5b;
          --h-sun-deep:  #245e46;
          --h-mint:      #bed3bf;
          --h-line:      rgba(23,59,50,.12);
          --h-ease:      cubic-bezier(.25,.1,.25,1);

          min-height:100vh; font-family:'Figtree',system-ui,sans-serif; color:var(--h-ink); overflow-x:clip;
          background:
            radial-gradient(60% 40% at 90% 85%, rgba(47,125,91,.22), transparent 70%),
            radial-gradient(70% 45% at 5% 60%, rgba(47,125,91,.16), transparent 70%),
            #f3f7f2;
        }
        .tc-root *, .tc-root *::before, .tc-root *::after { box-sizing:border-box; }
        .tc-root :focus-visible { outline:3px solid var(--h-teal); outline-offset:2px; border-radius:6px; }

        /* ══ Title band: continues the solid teal header ══ */
        .tc-hero { position:relative; overflow:hidden; color:#fff; padding:120px 5vw 104px; text-align:left;
          background:
            radial-gradient(60% 90% at 95% 100%, rgba(47,125,91,.2), transparent 70%),
            radial-gradient(70% 90% at 0% 0%, rgba(47,125,91,.7), transparent 70%),
            linear-gradient(180deg, #173b32 0%, #102c25 100%); }
        .tc-hero-inner { max-width:1180px; margin:0 auto; animation:tcRise .7s var(--h-ease) both; }
        @keyframes tcRise { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }
        .tc-kicker { display:inline-block; font-size:13.5px; font-weight:600; color:#fff; border-radius:100px; padding:5px 14px; margin-bottom:16px;
          background:linear-gradient(135deg, rgba(255,255,255,.26), rgba(255,255,255,.08));
          -webkit-backdrop-filter:blur(14px) saturate(180%); backdrop-filter:blur(14px) saturate(180%);
          border:1px solid rgba(255,255,255,.4); box-shadow:0 6px 18px rgba(0,0,0,.18), inset 0 1.5px 0 rgba(255,255,255,.5); }
        .tc-title { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(34px,5.2vw,64px); font-weight:800; letter-spacing:-.02em; line-height:1.04; margin-bottom:12px; text-shadow:0 2px 20px rgba(0,0,0,.25); }
        .tc-lede { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(17px,2vw,24px); font-weight:600; line-height:1.3; color:var(--h-mint); max-width:36ch; }

        /* ══ Layout: content rises over the band, like the booking card on the hero ══ */
        .tc-layout { position:relative; z-index:1; max-width:1180px; margin:-52px auto 0; padding:0 5vw 80px; display:grid; grid-template-columns:240px minmax(0,1fr); gap:32px; align-items:start; }

        /* ── Sidebar contents ── */
        .tc-toc { position:sticky; top:104px; max-height:calc(100vh - 128px); overflow-y:auto; scrollbar-width:none; padding:18px 14px 14px; border-radius:22px;
          background:linear-gradient(135deg, rgba(255,255,255,.88), rgba(255,255,255,.7));
          -webkit-backdrop-filter:blur(20px) saturate(170%); backdrop-filter:blur(20px) saturate(170%);
          border:1px solid rgba(255,255,255,.8); box-shadow:0 24px 50px rgba(16,44,37,.16), 0 4px 12px rgba(16,44,37,.08); }
        .tc-toc::-webkit-scrollbar { display:none; }
        .tc-toc-title { font-family:'Bricolage Grotesque',sans-serif; font-size:16px; font-weight:700; padding:0 8px 10px; margin-bottom:6px; border-bottom:1px solid var(--h-line); }
        .tc-toc-item { display:flex; align-items:flex-start; gap:10px; padding:8px 8px; border-radius:12px; text-decoration:none; color:var(--h-ink-faint); transition:background .2s, color .2s; }
        .tc-toc-item:hover { background:rgba(47,125,91,.08); color:var(--h-ink); }
        .tc-toc-num { flex-shrink:0; width:24px; font-size:12px; font-weight:700; color:rgba(23,59,50,.45); margin-top:1px; font-variant-numeric:tabular-nums; }
        .tc-toc-text { font-size:13.5px; font-weight:500; line-height:1.35; }
        .tc-toc-item.active { background:rgba(47,125,91,.1); color:var(--h-teal-deep); box-shadow:inset 3px 0 0 var(--h-sun); }
        .tc-toc-item.active .tc-toc-num { color:var(--h-teal); }
        .tc-toc-item.active .tc-toc-text { font-weight:700; }

        /* mobile jump menu (replaces the hidden sidebar) */
        .tc-jump { display:none; }

        /* ══ The terms panel ══ */
        .tc-panel { position:relative; overflow:hidden; border-radius:26px; padding:44px 52px 28px;
          background:linear-gradient(135deg, rgba(255,255,255,.96), rgba(255,255,255,.86));
          border:1px solid rgba(255,255,255,.85); box-shadow:0 30px 64px rgba(16,44,37,.18), 0 6px 16px rgba(16,44,37,.08); }
        .tc-panel::before { content:""; position:absolute; left:0; right:0; top:0; height:4px; background:linear-gradient(90deg, var(--h-teal-deep), var(--h-teal) 55%, var(--h-sun)); }

        .tc-intro { font-size:clamp(17px,1.5vw,19px); font-weight:500; line-height:1.65; color:var(--h-ink-soft); max-width:68ch; }
        .tc-intro strong { color:var(--h-teal-deep); font-weight:700; }

        /* important notice */
        .tc-notice { display:flex; gap:14px; align-items:flex-start; margin:24px 0 8px; padding:16px 20px; border-radius:16px; font-size:15.5px; font-weight:500; line-height:1.6; color:var(--h-ink-soft);
          background:rgba(47,125,91,.14); border:1px solid rgba(36,94,70,.35); box-shadow:inset 4px 0 0 var(--h-sun); }
        .tc-notice svg { flex-shrink:0; margin-top:2px; color:var(--h-sun-deep); }
        .tc-notice strong { color:var(--h-ink); font-weight:700; }
        .tc-intro-wrap { padding-bottom:20px; border-bottom:1px solid var(--h-line); }

        .tc-section { scroll-margin-top:104px; padding:34px 0; border-bottom:1px solid var(--h-line); }
        .tc-section:last-of-type { border-bottom:none; }
        .tc-section-head { display:flex; align-items:center; gap:14px; margin-bottom:16px; }
        .tc-section-num { flex-shrink:0; min-width:38px; height:30px; padding:0 10px; border-radius:100px; display:inline-flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:#fff; font-variant-numeric:tabular-nums;
          background:linear-gradient(180deg, #2f7d5b, var(--h-teal-deep)); box-shadow:0 4px 10px rgba(23,59,50,.3), inset 0 1px 0 rgba(255,255,255,.25); }
        .tc-section-title { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(20px,2vw,26px); font-weight:700; letter-spacing:-.01em; line-height:1.2; }

        .tc-body { font-size:16.5px; line-height:1.7; color:var(--h-ink-soft); max-width:70ch; }
        .tc-body p { margin:0 0 12px; }
        .tc-body p:last-child { margin-bottom:0; }
        .tc-body strong { color:var(--h-ink); font-weight:700; }
        .tc-body ul { list-style:none; padding:0; margin:14px 0 0; display:flex; flex-direction:column; gap:11px; }
        .tc-body ul li { display:flex; gap:14px; align-items:flex-start; }
        .tc-body ul li::before { content:''; flex-shrink:0; width:7px; height:7px; margin-top:.62em; border-radius:50%; background:var(--h-teal); box-shadow:0 0 0 3px rgba(47,125,91,.15); }
        .tc-body a { color:var(--h-teal-deep); font-weight:600; text-decoration:underline; text-underline-offset:3px; text-decoration-color:rgba(47,125,91,.4); word-break:break-word; }
        .tc-body .tc-lead { margin-bottom:18px; }

        /* ══ Contact card: same treatment as the footer call to action ══ */
        .tc-contact { position:relative; overflow:hidden; border-radius:22px; padding:30px 32px 26px; color:#fff;
          background:
            radial-gradient(60% 80% at 100% 100%, rgba(47,125,91,.2), transparent 70%),
            linear-gradient(135deg, #2f7d5b, #173b32 60%, #102c25);
          box-shadow:0 22px 44px rgba(23,59,50,.35), inset 0 1px 0 rgba(255,255,255,.18); }
        .tc-contact::before { content:""; position:absolute; left:0; right:0; top:0; height:4px; background:linear-gradient(90deg, rgba(255,255,255,.2), var(--h-sun)); }
        .tc-contact-title { font-family:'Bricolage Grotesque',sans-serif; font-size:20px; font-weight:800; letter-spacing:-.01em; margin-bottom:18px; }
        .tc-contact-list { list-style:none; display:flex; flex-direction:column; gap:14px; margin:0; padding:0; }
        .tc-contact-list li { display:flex; align-items:flex-start; gap:14px; font-size:16px; font-weight:500; line-height:1.4; color:rgba(255,255,255,.88); }
        .tc-contact-list li::before { display:none; }
        .tc-contact-icon { flex-shrink:0; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:var(--h-sun);
          background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.22); box-shadow:inset 0 1px 0 rgba(255,255,255,.3); }
        .tc-contact-text { display:flex; flex-direction:column; gap:3px; padding-top:5px; min-width:0; }
        .tc-body .tc-contact-list a { color:#fff; font-weight:600; text-decoration:none; background:linear-gradient(var(--h-sun), var(--h-sun)) left bottom / 0 2px no-repeat; padding-bottom:1px; transition:background-size .25s var(--h-ease); }
        .tc-body .tc-contact-list a:hover { background-size:100% 2px; }
        .tc-contact-actions { display:flex; gap:10px; flex-wrap:wrap; margin-top:22px; }
        .tc-btn { height:46px; padding:0 22px; border-radius:14px; font-family:'Figtree',sans-serif; font-size:14.5px; font-weight:700; display:inline-flex; align-items:center; justify-content:center; white-space:nowrap; transition:transform .2s, background .2s; }
        .tc-body a.tc-btn { text-decoration:none; background-image:none; padding-bottom:0; }
        .tc-btn-sun { color:#fff !important; background:linear-gradient(180deg, #c2410c, #9a3412) !important; box-shadow:0 8px 18px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.3); }
        .tc-btn-sun:hover { background:linear-gradient(180deg, #9a3412, #7c2d12) !important; transform:translateY(-2px); }
        .tc-btn-glass { color:#fff !important; background:linear-gradient(135deg, rgba(255,255,255,.22), rgba(255,255,255,.07)) !important; border:1px solid rgba(255,255,255,.35); box-shadow:inset 0 1px 0 rgba(255,255,255,.4); }
        .tc-btn-glass:hover { background:rgba(255,255,255,.2) !important; transform:translateY(-2px); }
        .tc-badges { display:flex; flex-wrap:wrap; gap:8px; margin-top:22px; padding-top:20px; border-top:1px solid rgba(255,255,255,.16); }
        .tc-badge { font-size:12.5px; font-weight:600; color:rgba(255,255,255,.9); padding:5px 12px; border-radius:100px; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.22); }

        .tc-end { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px 24px; margin-top:34px; padding-top:22px; border-top:1px solid var(--h-line); }
        .tc-end-note { font-size:13.5px; font-weight:500; color:var(--h-ink-faint); line-height:1.6; }
        .tc-back { display:inline-flex; align-items:center; gap:8px; height:44px; padding:0 20px; border-radius:100px; font-size:14.5px; font-weight:700; color:#fff; text-decoration:none;
          background:linear-gradient(180deg, #c2410c, #9a3412); box-shadow:0 8px 18px rgba(194,65,12,.38), inset 0 1px 0 rgba(255,255,255,.3); transition:transform .2s, background .2s; }
        .tc-back:hover { background:linear-gradient(180deg, #9a3412, #7c2d12); transform:translateY(-2px); }

        /* ══ Tablet and mobile ══ */
        @media (max-width:900px) {
          .tc-hero { padding:104px 5vw 96px; }
          .tc-layout { grid-template-columns:1fr; gap:14px; margin-top:-48px; padding:0 3.5vw 64px; }
          .tc-toc { display:none; }
          .tc-jump { display:block; border-radius:18px; overflow:hidden;
            background:linear-gradient(135deg, rgba(255,255,255,.92), rgba(255,255,255,.78)); -webkit-backdrop-filter:blur(18px); backdrop-filter:blur(18px);
            border:1px solid rgba(255,255,255,.85); box-shadow:0 18px 40px rgba(16,44,37,.18); }
          .tc-jump summary { list-style:none; cursor:pointer; min-height:52px; padding:0 18px; display:flex; align-items:center; justify-content:space-between; gap:12px; font-family:'Bricolage Grotesque',sans-serif; font-size:16px; font-weight:700; }
          .tc-jump summary::-webkit-details-marker { display:none; }
          .tc-jump summary svg { transition:transform .25s var(--h-ease); flex-shrink:0; }
          .tc-jump[open] summary svg { transform:rotate(180deg); }
          .tc-jump-list { padding:4px 10px 12px; display:flex; flex-direction:column; gap:2px; border-top:1px solid var(--h-line); max-height:60vh; overflow-y:auto; }
          .tc-jump-list .tc-toc-item { min-height:46px; align-items:center; }
          .tc-panel { border-radius:22px; padding:30px 22px 22px; }
          .tc-section { padding:28px 0; }
          .tc-contact { padding:26px 20px 22px; }
          .tc-contact-actions { flex-direction:column; }
          .tc-btn { width:100%; height:50px; }
        }
        @media (max-width:480px) {
          .tc-hero { padding:96px 5vw 88px; }
          .tc-body { font-size:16px; }
          .tc-notice { padding:14px 16px; font-size:15px; }
          .tc-end { flex-direction:column; align-items:flex-start; }
          .tc-back { width:100%; justify-content:center; height:50px; }
        }
        @media (prefers-reduced-motion:reduce) {
          .tc-hero-inner { animation:none; }
          .tc-toc-item,.tc-btn,.tc-back,.tc-jump summary svg { transition:none; }
        }
      `}</style>

      <div className="tc-root">
        {/* Title band */}
        <div className="tc-hero">
          <div className="tc-hero-inner">
            <p className="tc-kicker">Last updated: {LAST_UPDATED}</p>
            <h1 className="tc-title">Terms &amp; Conditions</h1>
            <p className="tc-lede">The rules for booking cars, vans and buses with a driver in Sri Lanka.</p>
          </div>
        </div>

        <div className="tc-layout">
          {/* Desktop sidebar */}
          <nav className="tc-toc" aria-label="Table of contents">
            <div className="tc-toc-title">In these terms</div>
            {sections.map((s) => (
              <a
                key={s.num}
                href={`#section-${s.num}`}
                className={`tc-toc-item${activeSection === `section-${s.num}` ? " active" : ""}`}
              >
                <span className="tc-toc-num">{s.num}</span>
                <span className="tc-toc-text">{s.title}</span>
              </a>
            ))}
            <a href="#section-contact" className={`tc-toc-item${activeSection === "section-contact" ? " active" : ""}`}>
              <span className="tc-toc-num">{CONTACT_NUM}</span>
              <span className="tc-toc-text">Contact Us</span>
            </a>
          </nav>

          <main>
            {/* Mobile jump menu */}
            <details className="tc-jump" id="tc-jump" style={{ marginBottom: 14 }}>
              <summary>
                Jump to a section
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
              </summary>
              <div className="tc-jump-list">
                {sections.map((s) => (
                  <a key={s.num} href={`#section-${s.num}`} className="tc-toc-item" onClick={closeJump}>
                    <span className="tc-toc-num">{s.num}</span>
                    <span className="tc-toc-text">{s.title}</span>
                  </a>
                ))}
                <a href="#section-contact" className="tc-toc-item" onClick={closeJump}>
                  <span className="tc-toc-num">{CONTACT_NUM}</span>
                  <span className="tc-toc-text">Contact Us</span>
                </a>
              </div>
            </details>

            <div className="tc-panel">
              <div className="tc-intro-wrap">
                <p className="tc-intro">
                  Please read these Terms and Conditions carefully before using the services of{" "}
                  <strong>{BRAND}</strong>. By making a booking with us, you confirm that you have read, understood, and agreed to be bound by these Terms. These Terms form an agreement between you (the Client) and {BRAND}, a private tourist transport provider in Sri Lanka offering cars, vans, and buses with drivers.
                </p>

                <div className="tc-notice" role="note">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                  </svg>
                  <p>
                    These Terms apply to all bookings made via <strong>{SITE_LABEL}</strong>, by phone, email, or WhatsApp. If you do not agree with any part of these Terms, please do not proceed with a booking.
                  </p>
                </div>
              </div>

              {sections.map((s) => (
                <section key={s.num} id={`section-${s.num}`} data-section className="tc-section">
                  <div className="tc-section-head">
                    <span className="tc-section-num">{s.num}</span>
                    <h2 className="tc-section-title">{s.title}</h2>
                  </div>
                  <div className="tc-body">{s.content}</div>
                </section>
              ))}

              {/* Contact */}
              <section id="section-contact" data-section className="tc-section">
                <div className="tc-section-head">
                  <span className="tc-section-num">{CONTACT_NUM}</span>
                  <h2 className="tc-section-title">Contact Us</h2>
                </div>
                <div className="tc-body">
                  <p className="tc-lead">For any questions, booking amendments, complaints, or general enquiries regarding these Terms, please reach us through the following channels:</p>

                  <div className="tc-contact">
                    <div className="tc-contact-title">{BRAND}: private transfers and tours</div>
                    <ul className="tc-contact-list">
                      <li>
                        <span className="tc-contact-icon" aria-hidden="true">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z" /></svg>
                        </span>
                        <span className="tc-contact-text">{ADDRESS}</span>
                      </li>
                      <li>
                        <span className="tc-contact-icon" aria-hidden="true">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z" /></svg>
                        </span>
                        <span className="tc-contact-text">
                          <a href={`tel:${PHONE_1.tel}`}>{PHONE_1.display}</a>
                        </span>
                      </li>
                      <li>
                        <span className="tc-contact-icon" aria-hidden="true">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4.2l-8 5-8-5V6l8 5 8-5v2.2z" /></svg>
                        </span>
                        <span className="tc-contact-text"><a href={`mailto:${EMAIL}`}>{EMAIL}</a></span>
                      </li>
                      <li>
                        <span className="tc-contact-icon" aria-hidden="true">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" /></svg>
                        </span>
                        <span className="tc-contact-text"><a href={`https://${SITE_LABEL}`}>{SITE_LABEL}</a></span>
                      </li>
                    </ul>

                    <div className="tc-contact-actions">
                      <a href={WHATSAPP_URL} className="tc-btn tc-btn-sun" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
                      <a href={`mailto:${EMAIL}`} className="tc-btn tc-btn-glass">Send an email</a>
                    </div>

                    <div className="tc-badges">
                      <span className="tc-badge">24/7 support</span>
                      <span className="tc-badge">Island-wide pickups</span>
                      <span className="tc-badge">Fixed fares</span>
                      <span className="tc-badge">English &amp; Russian</span>
                    </div>
                  </div>
                </div>
              </section>

              <div className="tc-end">
                <p className="tc-end-note">
                  These Terms and Conditions are governed by the laws of Sri Lanka.<br />
                  © 2026 {BRAND}. All rights reserved.
                </p>
                <Link href="/" className="tc-back">← Back to home</Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}