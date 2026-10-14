import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

const shape = (r: any) => ({
  id: r.id,
  name: r.name,
  active: r.active,
  categoryId:   r.category_id   ?? null,
  categoryName: r.category_name ?? "Uncategorised",
  categoryIcon: r.category_icon ?? "📍",
});

export async function GET() {
  const { rows } = await pool.query(`
    SELECT l.*, lc.name AS category_name, lc.icon AS category_icon
    FROM locations l
    LEFT JOIN location_categories lc ON l.category_id = lc.id
    ORDER BY lc.sort_order NULLS LAST, l.name
  `);
  return NextResponse.json(rows.map(shape));
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  await pool.query(
    `INSERT INTO locations (id, name, category_id, active)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (id) DO UPDATE SET name=$2, category_id=$3, active=$4`,
    [b.id, b.name, b.categoryId ?? null, b.active ?? true]
  );
  const { rows } = await pool.query(`
    SELECT l.*, lc.name AS category_name, lc.icon AS category_icon
    FROM locations l LEFT JOIN location_categories lc ON l.category_id = lc.id
    WHERE l.id = $1`, [b.id]);
  return NextResponse.json(shape(rows[0]));
}

export async function PUT(req: NextRequest) {
  const b = await req.json();
  await pool.query(
    `UPDATE locations SET name=$2, category_id=$3, active=$4 WHERE id=$1`,
    [b.id, b.name, b.categoryId ?? null, b.active]
  );
  const { rows } = await pool.query(`
    SELECT l.*, lc.name AS category_name, lc.icon AS category_icon
    FROM locations l LEFT JOIN location_categories lc ON l.category_id = lc.id
    WHERE l.id = $1`, [b.id]);
  return NextResponse.json(shape(rows[0]));
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  await pool.query("DELETE FROM locations WHERE id=$1", [id]);
  return NextResponse.json({ success: true });
}