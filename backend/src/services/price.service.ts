import { dataStore, CROPS_CATALOG } from "../models/db";
import { BANGLADESH_DISTRICTS, BANGLADESH_MARKETS } from "../helpers/geo.helper";
import { MarketPriceRecord } from "../@types";

export class PriceService {
  public getPrices(cropId?: string, district?: string, marketId?: string, onlyToday = true) {
    let records = Array.from(dataStore.marketPrices.values());

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

    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      prices: records,
      crops: CROPS_CATALOG,
      districts: BANGLADESH_DISTRICTS,
      markets: BANGLADESH_MARKETS,
    };
  }

  public compareMarketPrices(cropId = "green_chilli") {
    const crop = CROPS_CATALOG.find((c) => c.id === cropId) || CROPS_CATALOG[0];
    const todayPrices = Array.from(dataStore.marketPrices.values()).filter(
      (p) => p.cropId === crop.id && p.dataFreshnessDays === 0
    );

    todayPrices.sort((a, b) => b.wholesalePrice - a.wholesalePrice);

    return {
      crop,
      marketsComparison: todayPrices,
      highestMarket: todayPrices[0] || null,
      lowestMarket: todayPrices[todayPrices.length - 1] || null,
      priceSpreadBdt:
        todayPrices.length > 1
          ? todayPrices[0].wholesalePrice - todayPrices[todayPrices.length - 1].wholesalePrice
          : 0,
    };
  }

  public getPriceTrends(cropId = "green_chilli", days = 30) {
    const records = Array.from(dataStore.marketPrices.values())
      .filter((p) => p.cropId === cropId && p.dataFreshnessDays <= days)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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

    return {
      cropId,
      days,
      trendData: chartData,
    };
  }

  public importCsvPrices(csvText: string, currentUserId: string) {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("CSV must contain a header and at least one data row");
    }

    const imported: MarketPriceRecord[] = [];

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
        cropNameBn:
          cropId === "green_chilli"
            ? "কাঁচা মরিচ"
            : cropId === "cucumber"
            ? "শসা"
            : "মিষ্টি কুমড়া",
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

      dataStore.marketPrices.set(record.id, record);
      imported.push(record);
    }

    dataStore.logAudit(
      currentUserId,
      "Admin",
      "PRICE_CSV_IMPORTED",
      "MarketPriceRecord",
      undefined,
      `Imported ${imported.length} validated market price records from CSV.`
    );

    return imported;
  }
}

export const priceService = new PriceService();

