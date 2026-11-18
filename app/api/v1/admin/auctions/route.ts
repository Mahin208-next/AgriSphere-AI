import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/v1/admin/auctions
export async function GET() {
  const db = getDb();
  const auctions = Array.from(db.auctions.values()).map((auc) => {
    const bids = db.bids.get(auc.id) || [];
    return {
      ...auc,
      bidsCount: bids.length,
      bids,
    };
  });
  return NextResponse.json({ auctions });
}

// PUT /api/v1/admin/auctions - End, Accept, or Cancel auction
export async function PUT(req: Request) {
  try {
    const db = getDb();
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Auction ID is required" }, { status: 400 });
    }

    const auction = db.auctions.get(body.id);
    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    if (body.action === "end_now") {
      auction.status = "accepted";
      const listing = db.listings.get(auction.listingId);
      if (listing) {
        listing.status = "sold";
        db.listings.set(listing.id, { ...listing });
      }
    } else if (body.action === "cancel") {
      auction.status = "rejected";
      const listing = db.listings.get(auction.listingId);
      if (listing) {
        listing.status = "active";
        db.listings.set(listing.id, { ...listing });
      }
    } else if (body.status) {
      auction.status = body.status;
    }

    db.auctions.set(body.id, { ...auction });

    db.logAudit(
      "usr_admin_01",
      "System Admin",
      "AUCTION_ADMIN_UPDATED",
      "Auction",
      body.id,
      `Admin executed action ${body.action || body.status} on auction ${auction.id} (Status: ${auction.status}, Current Bid: ৳${auction.currentHighestBid})`
    );

    return NextResponse.json({ success: true, auction });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update auction" }, { status: 500 });
  }
}

// DELETE /api/v1/admin/auctions - Delete auction
export async function DELETE(req: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Auction ID is required" }, { status: 400 });
    }

    const auction = db.auctions.get(id);
    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    db.auctions.delete(id);
    db.bids.delete(id);

    db.logAudit(
      "usr_admin_01",
      "System Admin",
      "AUCTION_ADMIN_DELETED",
      "Auction",
      id,
      `Admin deleted auction ${id}`
    );

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete auction" }, { status: 500 });
  }
}
