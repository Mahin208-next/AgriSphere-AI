import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: Request) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const cropId = searchParams.get("cropId") || "green_chilli";
  const days = Number(searchParams.get("days")) || 30;

  // Retrieve records for this crop within past `days`
  const records = Array.from(db.marketPrices.values())
    .filter((p) => p.cropId === cropId && p.dataFreshnessDays <= days)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Pivot data for Recharts time series: group by date
  // e.g. { date: "2026-11-09", dhaka: 165, bogura: 130, retailDhaka: 195 }
  const trendMap = new Map<string, any>();

  records.forEach((r) => {
    const existing = trendMap.get(r.date) || { date: r.date };
    if (r.marketId === "mkt_karwan_bazar" || r.district === "Dhaka") {
      existing.dhakaWholesale = r.wholesalePrice;
      existing.dhakaRetail = r.retailPrice;
    } else if (r.marketId === "mkt_mahasthangarh" || r.district === "Bogura") {
      existing.boguraWholesale = r.wholesalePrice;
      existing.boguraRetail = r.retailPrice;
    } else if (r.district === "Gazipur") {
      existing.gazipurWholesale = r.wholesalePrice;
    } else if (r.district === "Chattogram") {
      existing.chattogramWholesale = r.wholesalePrice;
    }
    trendMap.set(r.date, existing);
  });

  const chartData = Array.from(trendMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return NextResponse.json({
    cropId,
    days,
    trendData: chartData,
  });
}
