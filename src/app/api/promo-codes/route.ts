import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

const ensureTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS promo_codes (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      discount_percent NUMERIC(5,2) NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
      valid_from DATE NOT NULL,
      valid_until DATE NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
};

const shape = (r: any) => ({
  id: r.id,
  code: r.code,
  description: r.description ?? "",
  discountAmount: Number(r.discount_percent),
  validFrom: r.valid_from,
  validUntil: r.valid_until,
  active: r.active,
});

export async function GET(req: NextRequest) {
  await ensureTable();

  const code = new URL(req.url).searchParams.get("code");

  if (code) {
    const normalized = code.trim().toUpperCase();
    const { rows } = await pool.query(
      `
        SELECT *
        FROM promo_codes
        WHERE code = $1
          AND active = TRUE
          AND valid_from <= CURRENT_DATE
          AND valid_until >= CURRENT_DATE
      `,
      [normalized]
    );

    if (!rows[0]) {
      return NextResponse.json(
        { error: "Invalid or expired promo code" },
        { status: 404 }
      );
    }

    return NextResponse.json(shape(rows[0]));
  }

  const { rows } = await pool.query(
    `SELECT * FROM promo_codes ORDER BY active DESC, valid_until DESC, code`
  );

  return NextResponse.json(rows.map(shape));
}

export async function POST(req: NextRequest) {
  await ensureTable();

  const body = await req.json();
  const code = String(body.code ?? "").trim().toUpperCase();
  const description = String(body.description ?? "");
  const discountAmount = Number(body.discountAmount ?? body.discountPercent ?? 0);
  const validFrom = String(body.validFrom ?? "");
  const validUntil = String(body.validUntil ?? "");

  if (!code) {
    return NextResponse.json({ error: "Promo code is required" }, { status: 400 });
  }
  if (!validFrom || !validUntil) {
    return NextResponse.json({ error: "Valid from and valid until dates are required" }, { status: 400 });
  }
  if (validFrom > validUntil) {
    return NextResponse.json({ error: "Valid until must be on or after valid from" }, { status: 400 });
  }
  if (discountAmount < 0) {
    return NextResponse.json({ error: "Discount amount must be 0 or greater" }, { status: 400 });
  }

  const id = body.id ?? Math.random().toString(36).slice(2, 10);

  try {
    const { rows } = await pool.query(
      `
        INSERT INTO promo_codes (id, code, description, discount_percent, valid_from, valid_until, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `,
      [id, code, description, discountAmount, validFrom, validUntil, body.active ?? true]
    );

    return NextResponse.json(shape(rows[0]), { status: 201 });
  } catch (err: any) {
    if (err?.code === "23505") {
      return NextResponse.json({ error: "Promo code already exists" }, { status: 409 });
    }

    return NextResponse.json(
      { error: err?.message ?? "Failed to create promo code" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  await ensureTable();

  const body = await req.json();
  const code = String(body.code ?? "").trim().toUpperCase();
  const description = String(body.description ?? "");
  const discountAmount = Number(body.discountAmount ?? body.discountPercent ?? 0);
  const validFrom = String(body.validFrom ?? "");
  const validUntil = String(body.validUntil ?? "");

  if (!body.id) {
    return NextResponse.json({ error: "Promo ID is required" }, { status: 400 });
  }
  if (!code) {
    return NextResponse.json({ error: "Promo code is required" }, { status: 400 });
  }
  if (!validFrom || !validUntil) {
    return NextResponse.json({ error: "Valid from and valid until dates are required" }, { status: 400 });
  }
  if (validFrom > validUntil) {
    return NextResponse.json({ error: "Valid until must be on or after valid from" }, { status: 400 });
  }
  if (discountAmount < 0) {
    return NextResponse.json({ error: "Discount amount must be 0 or greater" }, { status: 400 });
  }

  try {
    const { rows } = await pool.query(
      `
        UPDATE promo_codes
        SET code = $2,
            description = $3,
            discount_percent = $4,
            valid_from = $5,
            valid_until = $6,
            active = $7
        WHERE id = $1
        RETURNING *
      `,
      [body.id, code, description, discountAmount, validFrom, validUntil, body.active ?? true]
    );

    if (!rows[0]) {
      return NextResponse.json({ error: "Promo code not found" }, { status: 404 });
    }

    return NextResponse.json(shape(rows[0]));
  } catch (err: any) {
    if (err?.code === "23505") {
      return NextResponse.json({ error: "Promo code already exists" }, { status: 409 });
    }

    return NextResponse.json(
      { error: err?.message ?? "Failed to update promo code" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  await ensureTable();

  const id = new URL(req.url).searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Promo ID is required" }, { status: 400 });
  }

  await pool.query("DELETE FROM promo_codes WHERE id=$1", [id]);
  return NextResponse.json({ success: true });
}
