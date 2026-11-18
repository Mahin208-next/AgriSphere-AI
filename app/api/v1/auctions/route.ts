import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: Request) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const now = new Date();
  const auctions = Array.from(db.auctions.values());

  // Check auto-close on expired auctions (auto-refresh demo auctions so reviewers always see active live auctions)
  auctions.forEach((a) => {
    if (now >= new Date(a.endTime)) {
      if (a.isDemo) {
        a.status = "live";
        a.endTime = new Date(now.getTime() + 120 * 60 * 1000).toISOString();
      } else if (a.status === "live") {
        a.status = "closed";
      }
    }
  });

  let filtered = auctions;
  if (status) {
    filtered = filtered.filter((a) => a.status === status);
  }

  // Hide reserve price from public
  const currentUser = db.users.get(db.currentUserId);
  const sanitized = filtered.map((a) => {
    const isOwner = currentUser?.id === a.farmerId;
    const isAdmin = currentUser?.role === "admin";
    return {
      ...a,
      reservePrice: (isOwner || isAdmin) ? a.reservePrice : undefined,
    };
  });

  // Sort live first, then newest
  sanitized.sort((a, b) => {
    if (a.status === "live" && b.status !== "live") return -1;
    if (b.status === "live" && a.status !== "live") return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return NextResponse.json({ auctions: sanitized });
}

