import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { CROPS_DATA } from "@/lib/data/crops";

export async function GET(req: Request) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const cropId = searchParams.get("cropId") || "green_chilli";

  const crop = CROPS_DATA.find((c) => c.id === cropId) || CROPS_DATA[0];

  // Compare prices across all markets for today
  const todayPrices = Array.from(db.marketPrices.values()).filter(
    (p) => p.cropId === crop.id && p.dataFreshnessDays === 0
  );

  todayPrices.sort((a, b) => b.wholesalePrice - a.wholesalePrice);

  return NextResponse.json({
    crop,
    marketsComparison: todayPrices,
    highestMarket: todayPrices[0] || null,
    lowestMarket: todayPrices[todayPrices.length - 1] || null,
    priceSpreadBdt: todayPrices.length > 1 ? todayPrices[0].wholesalePrice - todayPrices[todayPrices.length - 1].wholesalePrice : 0,
  });
}
