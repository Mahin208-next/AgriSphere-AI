import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  const auction = db.auctions.get(params.id);
  if (!auction) {
    return NextResponse.json({ error: "Auction not found" }, { status: 404 });
  }

  const now = new Date();
  if (auction.status === "live" && now >= new Date(auction.endTime)) {
    auction.status = "closed";
  }

  const currentUser = db.users.get(db.currentUserId);
  const isOwner = currentUser?.id === auction.farmerId;
  const isAdmin = currentUser?.role === "admin";

  const bids = db.bids.get(auction.id) || [];
  const listing = db.listings.get(auction.listingId);

  const sanitizedAuction = {
    ...auction,
    reservePrice: (isOwner || isAdmin) ? auction.reservePrice : undefined,
  };

  return NextResponse.json({
    auction: sanitizedAuction,
    bids,
    listing,
    serverTime: now.toISOString(),
    isOwner,
  });
}

