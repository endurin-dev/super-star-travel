// src/lib/events.ts
import pool from "@/lib/db"; // your existing pg Pool

export interface EventItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  country?: string;
  city?: string;
  startDate: string;
  endDate?: string;
  websiteUrl?: string;
  featured?: boolean;
  source: string;
}

// ─── DB row → EventItem ───────────────────────────────────────────────────────
function rowToEvent(row: any): EventItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    location: row.location ?? undefined,
    country: row.country ?? undefined,
    city: row.city ?? undefined,
    startDate: row.start_date instanceof Date
      ? row.start_date.toISOString()
      : row.start_date,
    endDate: row.end_date
      ? row.end_date instanceof Date
        ? row.end_date.toISOString()
        : row.end_date
      : undefined,
    websiteUrl: row.website_url ?? undefined,
    featured: row.featured,
    source: row.source,
  };
}

// ─── Ticketmaster (optional) ─────────────────────────────────────────────────
const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY || "";
const TM_BASE = "https://app.ticketmaster.com/discovery/v2";

function tmToEvent(e: any): EventItem {
  const venue = e._embedded?.venues?.[0];
  return {
    id: `tm-${e.id}`,
    title: e.name,
    description: e.info || e.pleaseNote || "",
    imageUrl:
      e.images?.find((i: any) => i.ratio === "16_9" && i.width > 500)?.url ||
      e.images?.[0]?.url || "",
    location: venue?.name || "",
    country: venue?.country?.name || "",
    city: venue?.city?.name || "",
    startDate: e.dates?.start?.dateTime || e.dates?.start?.localDate,
    endDate: e.dates?.end?.dateTime || e.dates?.end?.localDate,
    websiteUrl: e.url,
    featured: false,
    source: "ticketmaster",
  };
}

async function fetchTicketmaster(params: Record<string, string>): Promise<EventItem[]> {
  if (!TICKETMASTER_API_KEY) return [];
  try {
    const qs = new URLSearchParams({
      apikey: TICKETMASTER_API_KEY,
      size: "20",
      sort: "date,asc",
      ...params,
    });
    const res = await fetch(`${TM_BASE}/events.json?${qs}`, {
      next: { revalidate: 21600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data._embedded?.events ?? []).map(tmToEvent);
  } catch {
    return [];
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function getParisEvents(): Promise<EventItem[]> {
  return fetchTicketmaster({ city: "Paris", countryCode: "FR" });
}

export async function getEuropeEvents(): Promise<EventItem[]> {
  const codes = ["FR", "BE", "NL", "DE", "IT", "ES"];
  const results = await Promise.allSettled(
    codes.map((code) => fetchTicketmaster({ countryCode: code, size: "8" }))
  );
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

export async function getFeaturedEvents(): Promise<EventItem[]> {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM events
       WHERE featured = true AND start_date >= NOW()
       ORDER BY start_date ASC
       LIMIT 6`
    );
    return rows.map(rowToEvent);
  } catch {
    return [];
  }
}

export async function getManualEvents(filters?: {
  country?: string;
  search?: string;
  dateFrom?: string;
}): Promise<EventItem[]> {
  const conditions: string[] = ["start_date >= NOW()"];
  const values: any[] = [];
  let idx = 1;

  if (filters?.country) {
    conditions.push(`country = $${idx++}`);
    values.push(filters.country);
  }
  if (filters?.dateFrom) {
    conditions.push(`start_date >= $${idx++}`);
    values.push(new Date(filters.dateFrom));
  }
  if (filters?.search) {
    conditions.push(
      `(title ILIKE $${idx} OR description ILIKE $${idx} OR city ILIKE $${idx})`
    );
    values.push(`%${filters.search}%`);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT * FROM events ${where} ORDER BY start_date ASC`,
    values
  );
  return rows.map(rowToEvent);
}

export function mergeAndSort(events: EventItem[][]): EventItem[] {
  return events
    .flat()
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
}
