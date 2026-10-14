// src/app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { CreateEventSchema, UpdateEventSchema } from "@/lib/validations/event";

// ─── GET /api/events ──────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country  = searchParams.get("country");
    const featured = searchParams.get("featured");
    const search   = searchParams.get("search");

    const conditions: string[] = ["start_date >= NOW()"];
    const values: any[] = [];
    let idx = 1;

    if (country) {
      conditions.push(`country = $${idx++}`);
      values.push(country);
    }
    if (featured === "true") {
      conditions.push(`featured = true`);
    }
    if (search) {
      conditions.push(
        `(title ILIKE $${idx} OR description ILIKE $${idx} OR city ILIKE $${idx})`
      );
      values.push(`%${search}%`);
      idx++;
    }

    const where = `WHERE ${conditions.join(" AND ")}`;
    const { rows } = await pool.query(
      `SELECT * FROM events ${where} ORDER BY start_date ASC`,
      values
    );

    return NextResponse.json({ events: rows });
  } catch (error) {
    console.error("GET /api/events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

// ─── POST /api/events ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = CreateEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const d = parsed.data;

    const { rows } = await pool.query(
      `INSERT INTO events
         (title, description, image_url, location, country, city,
          start_date, end_date, website_url, featured, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        d.title,
        d.description || null,
        d.imageUrl    || null,
        d.location    || null,
        d.country     || null,
        d.city        || null,
        new Date(d.startDate),
        d.endDate ? new Date(d.endDate) : null,
        d.websiteUrl  || null,
        d.featured ?? false,
        d.source ?? "manual",
      ]
    );

    return NextResponse.json({ event: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/events:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

// ─── PUT /api/events ──────────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = UpdateEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const d = parsed.data;

    // Build SET clause dynamically — only update fields that were sent
    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const fieldMap: Record<string, any> = {
      title:       d.title,
      description: d.description,
      image_url:   d.imageUrl,
      location:    d.location,
      country:     d.country,
      city:        d.city,
      website_url: d.websiteUrl,
      featured:    d.featured,
      source:      d.source,
    };

    for (const [col, val] of Object.entries(fieldMap)) {
      if (val !== undefined) {
        setClauses.push(`${col} = $${idx++}`);
        values.push(val === "" ? null : val);
      }
    }
    if (d.startDate) {
      setClauses.push(`start_date = $${idx++}`);
      values.push(new Date(d.startDate));
    }
    if (d.endDate !== undefined) {
      setClauses.push(`end_date = $${idx++}`);
      values.push(d.endDate ? new Date(d.endDate) : null);
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(d.id); // last param = WHERE id = $N
    const { rows } = await pool.query(
      `UPDATE events SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event: rows[0] });
  } catch (error) {
    console.error("PUT /api/events:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

// ─── DELETE /api/events ───────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    const { rowCount } = await pool.query(
      `DELETE FROM events WHERE id = $1`,
      [id]
    );

    if (rowCount === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/events:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
