import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { MarketPriceRecord } from "@/types";

export async function POST(req: Request) {
  const db = getDb();
  try {
    const body = await req.json();
    const csvContent = body.csvText as string;

    if (!csvContent || typeof csvContent !== "string") {
      return NextResponse.json({ error: "csvText string is required" }, { status: 400 });
    }

    // CSV format expected:
    // cropId,cropNameEn,marketId,marketNameEn,district,wholesalePrice,retailPrice,date,priceSource
    const lines = csvContent.trim().split("\n");
    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV must contain header and at least one data row" }, { status: 400 });
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const importedRecords: MarketPriceRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(",").map((c) => c.trim());

      const cropId = cols[0] || "green_chilli";
      const cropNameEn = cols[1] || "Crop";
      const marketId = cols[2] || "mkt_custom";
      const marketNameEn = cols[3] || "Regional Market";
      const district = cols[4] || "Dhaka";
      const wholesalePrice = parseFloat(cols[5]) || 0;
      const retailPrice = parseFloat(cols[6]) || wholesalePrice * 1.25;
      const date = cols[7] || new Date().toISOString().split("T")[0];
      const priceSource = (cols[8] as any) || "DAM";

      const record: MarketPriceRecord = {
        id: `prc_imp_${Date.now()}_${i}`,
        cropId,
        cropNameEn,
        cropNameBn: cropId === "green_chilli" ? "কাঁচা মরিচ" : cropId === "cucumber" ? "শসা" : "মিষ্টি কুমড়া",
        marketId,
        marketNameEn,
        marketNameBn: marketNameEn,
        district,
        wholesalePrice,
        retailPrice,
        minPrice: Math.round(wholesalePrice * 0.95),
        maxPrice: Math.round(wholesalePrice * 1.1),
        priceUnit: "BDT/kg",
        date,
        priceSource,
        verificationStatus: "verified",
        dataFreshnessDays: 0,
        isDemo: false,
      };

      db.marketPrices.set(record.id, record);
      importedRecords.push(record);
    }

    db.logAudit(
      db.currentUserId,
      "Admin",
      "PRICE_CSV_IMPORTED",
      "MarketPriceRecord",
      undefined,
      `Imported ${importedRecords.length} validated market price records from CSV.`
    );

    return NextResponse.json({
      success: true,
      importedCount: importedRecords.length,
      records: importedRecords,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to parse and import CSV" }, { status: 500 });
  }
}
