import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { BANGLADESH_DISTRICTS, BANGLADESH_MARKETS } from "@/lib/data/bangladesh-geo";
import { CROPS_DATA } from "@/lib/data/crops";

export async function GET(req: Request) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const cropId = searchParams.get("cropId");
  const district = searchParams.get("district");
  const marketId = searchParams.get("marketId");
  const onlyToday = searchParams.get("onlyToday") !== "false";

  let records = Array.from(db.marketPrices.values());

  if (onlyToday) {
    records = records.filter((r) => r.dataFreshnessDays === 0);
  }
  if (cropId) {
    records = records.filter((r) => r.cropId === cropId);
  }
  if (district) {
    records = records.filter((r) => r.district.toLowerCase() === district.toLowerCase());
  }
  if (marketId) {
    records = records.filter((r) => r.marketId === marketId);
  }

  // Sort by date desc
  records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json({
    prices: records,
    crops: CROPS_DATA,
    districts: BANGLADESH_DISTRICTS,
    markets: BANGLADESH_MARKETS,
  });
}
