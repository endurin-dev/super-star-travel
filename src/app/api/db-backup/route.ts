import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const execAsync = promisify(exec);

// ─── AUTH GUARD ───────────────────────────────────────────────────────────────
// Set BACKUP_SECRET in your .env and pass it as ?secret= query param
const BACKUP_SECRET = process.env.BACKUP_SECRET;

// ─── Parse DATABASE_URL ───────────────────────────────────────────────────────
// Supports: postgresql://user:password@host:port/dbname
function parseDatabaseUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname || "localhost",
    port: parsed.port || "5432",
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ""),
  };
}

export async function GET(req: NextRequest) {
  // Auth check
  const secret = req.nextUrl.searchParams.get("secret");
  if (BACKUP_SECRET && secret !== BACKUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json(
      { error: "DATABASE_URL environment variable is not set" },
      { status: 500 }
    );
  }

  let db: ReturnType<typeof parseDatabaseUrl>;
  try {
    db = parseDatabaseUrl(databaseUrl);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse DATABASE_URL" },
      { status: 500 }
    );
  }

  // Temp file path
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `backup-${db.database}-${timestamp}.sql`;
  const tmpPath = path.join(os.tmpdir(), filename);

  try {
    const pgDumpCmd = [
      `PGPASSWORD="${db.password}"`,
      `pg_dump`,
      `-h ${db.host}`,
      `-p ${db.port}`,
      `-U ${db.user}`,
      `-d ${db.database}`,
      `--no-password`,
      `-F p`,
      `-f "${tmpPath}"`,
    ].join(" ");

    await execAsync(pgDumpCmd);

    const fileBuffer = fs.readFileSync(tmpPath);
    fs.unlinkSync(tmpPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    console.error("Backup failed:", error);
    return NextResponse.json(
      { error: "Backup failed", details: error.message },
      { status: 500 }
    );
  }
}