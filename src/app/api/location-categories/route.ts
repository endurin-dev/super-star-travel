import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const { rows } = await pool.query(
    "SELECT * FROM location_categories ORDER BY sort_order, name"
  );
  return NextResponse.json(rows.map(r => ({
    id: r.id, name: r.name, icon: r.icon,
    sortOrder: r.sort_order, active: r.active,
  })));
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const { rows } = await pool.query(
    `INSERT INTO location_categories (id,name,icon,sort_order,active)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (id) DO UPDATE SET name=$2,icon=$3,sort_order=$4,active=$5
     RETURNING *`,
    [b.id, b.name, b.icon ?? "📍", b.sortOrder ?? 0, b.active ?? true]
  );
  const r = rows[0];
  return NextResponse.json({ id:r.id, name:r.name, icon:r.icon, sortOrder:r.sort_order, active:r.active });
}

export async function PUT(req: NextRequest) {
  const b = await req.json();
  const { rows } = await pool.query(
    `UPDATE location_categories SET name=$2,icon=$3,sort_order=$4,active=$5
     WHERE id=$1 RETURNING *`,
    [b.id, b.name, b.icon ?? "📍", b.sortOrder ?? 0, b.active]
  );
  const r = rows[0];
  return NextResponse.json({ id:r.id, name:r.name, icon:r.icon, sortOrder:r.sort_order, active:r.active });
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  await pool.query("DELETE FROM location_categories WHERE id=$1", [id]);
  return NextResponse.json({ success: true });
}