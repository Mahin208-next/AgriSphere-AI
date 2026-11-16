import { dataStore, CROPS_CATALOG } from "../models/db";
import { BANGLADESH_DISTRICTS, BANGLADESH_MARKETS, calculateDistanceKm } from "../helpers/geo.helper";
import { estimateTransportCost } from "../helpers/transport.helper";
import { computeBuyerMatches } from "../helpers/matching.helper";
import { MarketRecommendation } from "../@types";

export class RecommendationService {
  public getMarketRecommendations(params: {
    cropId: string;
    originDistrict: string;
    quantityKg: number;
    grade?: string;
  }): MarketRecommendation[] {
    const origin =
      BANGLADESH_DISTRICTS.find(
        (d) =>
          d.nameEn.toLowerCase() === params.originDistrict.toLowerCase() ||
          d.id === params.originDistrict.toLowerCase()
      ) || BANGLADESH_DISTRICTS.find((d) => d.id === "bogura")!;

    const crop = CROPS_CATALOG.find((c) => c.id === params.cropId) || CROPS_CATALOG[0];

    const todayPrices = Array.from(dataStore.marketPrices.values()).filter(
      (p) => p.cropId === crop.id && p.dataFreshnessDays === 0
    );

    const recommendations: MarketRecommendation[] = [];

    BANGLADESH_MARKETS.forEach((mkt) => {
      const priceRecord =
        todayPrices.find((p) => p.marketId === mkt.id) ||
        todayPrices.find((p) => p.district.toLowerCase() === mkt.district.toLowerCase()) ||
        todayPrices[0];

      if (!priceRecord) return;

      const distanceKm = calculateDistanceKm(origin.lat, origin.lng, mkt.lat, mkt.lng);
      const isPerishable = crop.category === "vegetable" || crop.category === "spice";
      const { transportCost, handlingCost } = estimateTransportCost(params.quantityKg, distanceKm, isPerishable);

      const marketFee = Math.round(priceRecord.wholesalePrice * params.quantityKg * 0.015);
      const otherCosts = handlingCost + marketFee;
      const grossRevenue = Math.round(priceRecord.wholesalePrice * params.quantityKg);
      const netEstimatedReturn = grossRevenue - transportCost - otherCosts;
      const netMarginPercentage = Math.round((netEstimatedReturn / grossRevenue) * 1000) / 10;

      let confidenceScore = 95;
      if (priceRecord.priceSource === "DAM") confidenceScore = 97;
      if (distanceKm > 250) confidenceScore -= 5;

      const districtBn = BANGLADESH_DISTRICTS.find((d) => d.nameEn === mkt.district)?.nameBn || mkt.district;

      let aiRationale = "";
      let aiRationaleBn = "";

      if (distanceKm <= 20) {
        aiRationale = `Local assembly hub with minimal transport overhead (${distanceKm} km). Recommended for immediate same-day liquidity and zero transit weight loss.`;
        aiRationaleBn = `নিকটস্থ মোকাম হওয়ায় পরিবহন খরচ সর্বনিম্ন (${distanceKm} কিমি)। দ্রুত নগদ বিক্রয় ও ওজনে টান না পড়ার জন্য আদর্শ।`;
      } else if (netEstimatedReturn > grossRevenue * 0.85 && priceRecord.wholesalePrice > 140) {
        aiRationale = `High-value terminal destination in ${mkt.district}. Even after BDT ${transportCost.toLocaleString()} logistics, net profit is maximized (+${netMarginPercentage}% return).`;
        aiRationaleBn = `${districtBn}-এর বড় পাইকারি বাজারে পণ্যমূল্য চড়া। প্রায় ${transportCost.toLocaleString()} টাকা পরিবহন খরচের পরও সামগ্রিক নিট মুনাফা সর্বোচ্চ থাকবে।`;
      } else {
        aiRationale = `Secondary commercial market. Offers steady demand with moderate freight expenses.`;
        aiRationaleBn = `স্থিতিশীল মাঝারি পাইকারি বাজার। মাঝামাঝি পরিবহন খরচে গ্রহণযোগ্য নিট লাভ পাওয়া যাবে।`;
      }

      recommendations.push({
        marketId: mkt.id,
        marketName: mkt.nameEn,
        marketNameBn: mkt.nameBn,
        district: mkt.district,
        districtBn,
        distanceKm,
        marketPricePerKg: priceRecord.wholesalePrice,
        grossRevenue,
        transportCost,
        otherCosts,
        netEstimatedReturn,
        netMarginPercentage,
        confidenceScore,
        dataFreshnessDays: priceRecord.dataFreshnessDays,
        priceSource: priceRecord.priceSource,
        aiRationale,
        aiRationaleBn,
      });
    });

    recommendations.sort((a, b) => b.netEstimatedReturn - a.netEstimatedReturn);
    return recommendations;
  }

  public getMatchesForListing(listingId: string) {
    const listing = dataStore.listings.get(listingId);
    if (!listing) throw new Error("Listing not found");

    const openRequests = Array.from(dataStore.procurementRequests.values()).filter(
      (r) => r.status === "open" || r.status === "partially_fulfilled"
    );

    return computeBuyerMatches(listing, openRequests);
  }
}

export const recommendationService = new RecommendationService();

