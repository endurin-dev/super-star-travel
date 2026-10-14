// app/api/features/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const { rows } = await pool.query(
    "SELECT * FROM features ORDER BY sort_order, id"
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const { rows } = await pool.query(
    `INSERT INTO features (id, text, active, sort_order)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (id) DO UPDATE SET text=$2, active=$3, sort_order=$4
     RETURNING *`,
    [b.id, b.text, b.active ?? true, b.sort_order ?? 0]
  );
  return NextResponse.json(rows[0]);
}

export async function PUT(req: NextRequest) {
  const b = await req.json();
  const { rows } = await pool.query(
    `UPDATE features SET text=$2, active=$3, sort_order=$4
     WHERE id=$1 RETURNING *`,
    [b.id, b.text, b.active, b.sort_order ?? 0]
  );
  return NextResponse.json(rows[0]);
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  await pool.query("DELETE FROM features WHERE id=$1", [id]);
  return NextResponse.json({ success: true });
}