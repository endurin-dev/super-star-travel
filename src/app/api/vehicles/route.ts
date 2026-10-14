// app/api/vehicles/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

const shape = (r: any) => ({
  id: r.id, name: r.name, model: r.model,
  maxPassengers: r.max_passengers,
  maxLuggage:    r.max_luggage,
  img:       r.img,
  price:     r.price,
  tag:       r.tag,
  special:   r.special,
  active:    r.active,
  sortOrder: r.sort_order,
});

export async function GET() {
  const { rows } = await pool.query(
    "SELECT * FROM vehicles ORDER BY sort_order, name"
  );
  return NextResponse.json(rows.map(shape));
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const { rows } = await pool.query(
    `INSERT INTO vehicles
       (id,name,model,max_passengers,max_luggage,img,price,tag,special,active,sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (id) DO UPDATE SET
       name=$2, model=$3, max_passengers=$4, max_luggage=$5, img=$6,
       price=$7, tag=$8, special=$9, active=$10, sort_order=$11
     RETURNING *`,
    [b.id, b.name, b.model, b.maxPassengers, b.maxLuggage,
     b.img ?? "/images/car.png", b.price, b.tag ?? "", b.special ?? "",
     b.active ?? true, b.sortOrder ?? 0]
  );
  return NextResponse.json(shape(rows[0]));
}

export async function PUT(req: NextRequest) {
  const b = await req.json();
  const { rows } = await pool.query(
    `UPDATE vehicles SET
       name=$2, model=$3, max_passengers=$4, max_luggage=$5, img=$6,
       price=$7, tag=$8, special=$9, active=$10, sort_order=$11
     WHERE id=$1 RETURNING *`,
    [b.id, b.name, b.model, b.maxPassengers, b.maxLuggage,
     b.img ?? "/images/car.png", b.price, b.tag ?? "", b.special ?? "",
     b.active, b.sortOrder ?? 0]
  );
  return NextResponse.json(shape(rows[0]));
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  await pool.query("DELETE FROM vehicles WHERE id=$1", [id]);
  return NextResponse.json({ success: true });
}