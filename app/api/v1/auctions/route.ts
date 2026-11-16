import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: Request) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const now = new Date();
  const auctions = Array.from(db.auctions.values());

  // Check auto-close on expired auctions
  auctions.forEach((a) => {
    if (a.status === "live" && now >= new Date(a.endTime)) {
      a.status = "closed";
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

