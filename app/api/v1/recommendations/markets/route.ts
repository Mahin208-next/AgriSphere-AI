import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  const db = getDb();
  try {
    const body = await req.json();
    const cropId = body.cropId || "green_chilli";
    const originDistrict = body.originDistrict || "Bogura";
    const quantityKg = Number(body.quantityKg) || 1000;
    const grade = body.grade || "Grade A";
    const customWholesalePrice = body.customWholesalePrice ? Number(body.customWholesalePrice) : undefined;
    const vehicleType = body.vehicleType || "covered_van";
    const customFeePercent = body.customFeePercent !== undefined ? Number(body.customFeePercent) : undefined;

    const recommendations = db.getBestMarketRecommendations({
      cropId,
      originDistrict,
      quantityKg,
      grade,
      customWholesalePrice,
      vehicleType,
      customFeePercent,
    });

    return NextResponse.json({
      cropId,
      originDistrict,
      quantityKg,
      recommendations,
      formula: "Net Return = (Market Price * Quantity) - Transport Cost - Handling/Market Costs",
      disclaimer: "Transport costs are calibrated estimates based on Bangladesh freight haulage models. Final net return may vary with spot truck availability, negotiation, and cargo handling.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to calculate recommendations" }, { status: 500 });
  }
}

