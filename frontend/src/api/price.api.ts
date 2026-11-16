import { apiClient } from "./client";
import { Crop, District, Market, MarketPriceRecord } from "../@types";

export const priceApi = {
  getPrices: (cropId?: string, district?: string, marketId?: string, onlyToday = true) => {
    const params = new URLSearchParams();
    if (cropId) params.append("cropId", cropId);
    if (district) params.append("district", district);
    if (marketId) params.append("marketId", marketId);
    params.append("onlyToday", String(onlyToday));

    return apiClient<{
      success: boolean;
      prices: MarketPriceRecord[];
      crops: Crop[];
      districts: District[];
      markets: Market[];
    }>(`/prices?${params.toString()}`);
  },
  comparePrices: (cropId = "green_chilli") =>
    apiClient<{
      success: boolean;
      crop: Crop;
      marketsComparison: MarketPriceRecord[];
      highestMarket: MarketPriceRecord | null;
      lowestMarket: MarketPriceRecord | null;
      priceSpreadBdt: number;
    }>(`/prices/compare?cropId=${cropId}`),
  getTrends: (cropId = "green_chilli", days = 30) =>
    apiClient<{
      success: boolean;
      cropId: string;
      days: number;
      trendData: any[];
    }>(`/prices/trends?cropId=${cropId}&days=${days}`),
  importCsv: (csvText: string) =>
    apiClient<{ success: boolean; importedCount: number; records: MarketPriceRecord[] }>(
      "/prices/import",
      {
        method: "POST",
        body: JSON.stringify({ csvText }),
      }
    ),
};

