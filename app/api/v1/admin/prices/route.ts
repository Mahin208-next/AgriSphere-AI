import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { MarketPriceRecord } from "@/types";

// GET /api/v1/admin/prices - List all prices
export async function GET() {
  const db = getDb();
  const prices = Array.from(db.marketPrices.values());
  return NextResponse.json({ prices });
}

// POST /api/v1/admin/prices - Add new market price record
export async function POST(req: Request) {
  try {
    const db = getDb();
    const body = await req.json();

    const recordId = `rec_${body.marketId || "mkt"}_${body.cropId}_${Date.now()}`;
    const newRecord: MarketPriceRecord = {
      id: recordId,
      cropId: body.cropId,
      cropNameEn: body.cropNameEn || body.cropId,
      cropNameBn: body.cropNameBn || body.cropId,
      marketId: body.marketId || "mkt_central",
      marketNameEn: body.marketNameEn || "District Hub",
      marketNameBn: body.marketNameBn || "মোকাম আড়ত",
      district: body.district || "Dhaka",
      wholesalePrice: Number(body.wholesalePrice) || 0,
      retailPrice: Number(body.retailPrice) || 0,
      minPrice: Number(body.minPrice) || Number(body.wholesalePrice) * 0.95,
      maxPrice: Number(body.maxPrice) || Number(body.retailPrice) * 1.05,
      priceUnit: "BDT/kg",
      date: new Date().toISOString().split("T")[0],
      priceSource: body.priceSource || "DAM",
      verificationStatus: "verified",
      dataFreshnessDays: 0,
    };

    db.marketPrices.set(recordId, newRecord);

    db.logAudit(
      "usr_admin_01",
      "System Admin",
      "MARKET_PRICE_CREATED",
      "MarketPriceRecord",
      recordId,
      `Admin added price record for ${newRecord.cropNameEn} in ${newRecord.district} (Wholesale: ৳${newRecord.wholesalePrice}, Retail: ৳${newRecord.retailPrice})`
    );

    return NextResponse.json({ success: true, price: newRecord });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create price" }, { status: 500 });
  }
}

// PUT /api/v1/admin/prices - Update price record
export async function PUT(req: Request) {
  try {
    const db = getDb();
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Price record ID is required" }, { status: 400 });
    }

    const price = db.marketPrices.get(body.id);
    if (!price) {
      return NextResponse.json({ error: "Price record not found" }, { status: 404 });
    }

    if (body.wholesalePrice !== undefined) price.wholesalePrice = Number(body.wholesalePrice);
    if (body.retailPrice !== undefined) price.retailPrice = Number(body.retailPrice);
    if (body.priceSource !== undefined) price.priceSource = body.priceSource;

    db.marketPrices.set(body.id, { ...price });

    db.logAudit(
      "usr_admin_01",
      "System Admin",
      "MARKET_PRICE_UPDATED",
      "MarketPriceRecord",
      body.id,
      `Admin updated price for ${price.cropNameEn} (${price.district}): Wholesale ৳${price.wholesalePrice}, Retail ৳${price.retailPrice}`
    );

    return NextResponse.json({ success: true, price });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update price" }, { status: 500 });
  }
}

// DELETE /api/v1/admin/prices
export async function DELETE(req: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Price record ID is required" }, { status: 400 });
    }

    db.marketPrices.delete(id);

    db.logAudit(
      "usr_admin_01",
      "System Admin",
      "MARKET_PRICE_DELETED",
      "MarketPriceRecord",
      id,
      `Admin deleted price record ${id}`
    );

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete price" }, { status: 500 });
  }
}
