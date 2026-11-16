import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const alerts = Array.from(db.oversupplyAlerts.values());
  return NextResponse.json({ alerts });
}

