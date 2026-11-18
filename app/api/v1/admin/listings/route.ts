import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/v1/admin/listings - List all listings for admin
export async function GET() {
  const db = getDb();
  const listings = Array.from(db.listings.values());
  return NextResponse.json({ listings });
}

// PUT /api/v1/admin/listings - Update listing (price, quantity, grade, status)
export async function PUT(req: Request) {
  try {
    const db = getDb();
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
    }

    const listing = db.listings.get(body.id);
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (body.quantity !== undefined) listing.quantity = Number(body.quantity);
    if (body.expectedPrice !== undefined) listing.expectedPrice = Number(body.expectedPrice);
    if (body.startingPrice !== undefined) listing.startingPrice = Number(body.startingPrice);
    if (body.grade !== undefined) listing.grade = body.grade;
    if (body.variety !== undefined) listing.variety = body.variety;
    if (body.status !== undefined) listing.status = body.status;

    db.listings.set(body.id, { ...listing });

    db.logAudit(
      "usr_admin_01",
      "System Admin",
      "LISTING_ADMIN_UPDATED",
      "ProductListing",
      body.id,
      `Admin updated listing ${listing.cropNameEn} (Qty: ${listing.quantity}, Price: ৳${listing.expectedPrice}, Status: ${listing.status})`
    );

    return NextResponse.json({ success: true, listing });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update listing" }, { status: 500 });
  }
}

// DELETE /api/v1/admin/listings - Remove a listing
export async function DELETE(req: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
    }

    const listing = db.listings.get(id);
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    db.listings.delete(id);

    db.logAudit(
      "usr_admin_01",
      "System Admin",
      "LISTING_ADMIN_DELETED",
      "ProductListing",
      id,
      `Admin deleted listing ${listing.cropNameEn} owned by ${listing.farmerName}`
    );

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete listing" }, { status: 500 });
  }
}
