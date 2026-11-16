import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  const listing = db.listings.get(params.id);
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const matches = db.getBuyerMatchesForListing(params.id);

  return NextResponse.json({
    listing,
    matches,
    algorithm: "Match Score = 0.35 * Quantity + 0.30 * Location + 0.20 * Price + 0.15 * Timing",
  });
}

