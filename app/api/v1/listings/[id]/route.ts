import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  const listing = db.listings.get(params.id);
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const currentUser = db.users.get(db.currentUserId);
  const isOwner = currentUser?.id === listing.farmerId;
  const isAdmin = currentUser?.role === "admin";

  // Hide privateReservePrice if not owner or admin
  const sanitizedListing = {
    ...listing,
    privateReservePrice: (isOwner || isAdmin) ? listing.privateReservePrice : undefined,
  };

  return NextResponse.json({ listing: sanitizedListing });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  const listing = db.listings.get(params.id);
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const currentUser = db.users.get(db.currentUserId);
  if (currentUser?.id !== listing.farmerId && currentUser?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  db.listings.delete(params.id);
  if (listing.auctionId) {
    db.auctions.delete(listing.auctionId);
  }

  db.logAudit(currentUser?.id, currentUser?.name, "LISTING_DELETED", "ProductListing", params.id, `Deleted listing for ${listing.cropNameEn}`);

  return NextResponse.json({ success: true, message: "Listing deleted" });
}

