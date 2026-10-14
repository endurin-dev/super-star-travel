// app/api/rates/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

const shape = (r: any) => ({
  id:          r.id,
  fromLocId:   r.from_loc_id,
  toLocId:     r.to_loc_id,
  vehicleId:   r.vehicle_id,
  fromLocName: r.from_loc_name,
  toLocName:   r.to_loc_name,
  vehicleName: r.vehicle_name,
  p1:  r.p1,  p2: r.p2,  p3: r.p3,  p4: r.p4,
  p5:  r.p5,  p6: r.p6,  p7: r.p7,  p8: r.p8,
  // p9+ = p8 * 2 (calculated on client, not stored)
  onDemand: r.on_demand,
  active:   r.active,
});

const JOIN = `
  SELECT r.*,
    fl.name AS from_loc_name,
    tl.name AS to_loc_name,
    v.name  AS vehicle_name
  FROM rates r
  JOIN locations fl ON r.from_loc_id = fl.id
  JOIN locations tl ON r.to_loc_id   = tl.id
  JOIN vehicles   v ON r.vehicle_id  = v.id
`;

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  let q = JOIN + " WHERE 1=1";
  const params: any[] = [];
  if (sp.get("from"))    { params.push(sp.get("from"));    q += ` AND r.from_loc_id=$${params.length}`; }
  if (sp.get("to"))      { params.push(sp.get("to"));      q += ` AND r.to_loc_id=$${params.length}`; }
  if (sp.get("vehicle")) { params.push(sp.get("vehicle")); q += ` AND r.vehicle_id=$${params.length}`; }
  q += " ORDER BY fl.name, tl.name, v.name";
  const { rows } = await pool.query(q, params);
  return NextResponse.json(rows.map(shape));
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const vals = b.onDemand
    ? [null,null,null,null,null,null,null,null]
    : [b.p1||null,b.p2||null,b.p3||null,b.p4||null,b.p5||null,b.p6||null,b.p7||null,b.p8||null];
  const { rows } = await pool.query(
    `INSERT INTO rates (id,from_loc_id,to_loc_id,vehicle_id,p1,p2,p3,p4,p5,p6,p7,p8,on_demand,active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     ON CONFLICT (from_loc_id,to_loc_id,vehicle_id) DO UPDATE
       SET p1=$5,p2=$6,p3=$7,p4=$8,p5=$9,p6=$10,p7=$11,p8=$12,on_demand=$13,active=$14
     RETURNING id`,
    [b.id,b.fromLocId,b.toLocId,b.vehicleId,...vals,b.onDemand??false,b.active??true]
  );
  const { rows: full } = await pool.query(JOIN + " WHERE r.id=$1", [rows[0].id]);
  return NextResponse.json(shape(full[0]));
}

export async function PUT(req: NextRequest) {
  const b = await req.json();
  const vals = b.onDemand
    ? [null,null,null,null,null,null,null,null]
    : [b.p1||null,b.p2||null,b.p3||null,b.p4||null,b.p5||null,b.p6||null,b.p7||null,b.p8||null];
  await pool.query(
    `UPDATE rates SET
       from_loc_id=$2,to_loc_id=$3,vehicle_id=$4,
       p1=$5,p2=$6,p3=$7,p4=$8,p5=$9,p6=$10,p7=$11,p8=$12,
       on_demand=$13,active=$14
     WHERE id=$1`,
    [b.id,b.fromLocId,b.toLocId,b.vehicleId,...vals,b.onDemand??false,b.active??true]
  );
  const { rows } = await pool.query(JOIN + " WHERE r.id=$1", [b.id]);
  return NextResponse.json(shape(rows[0]));
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  await pool.query("DELETE FROM rates WHERE id=$1", [id]);
  return NextResponse.json({ success: true });
}