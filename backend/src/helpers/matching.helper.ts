import { ProductListing, ProcurementRequest, BuyerMatchResult } from "../@types";
import { BANGLADESH_DISTRICTS, calculateDistanceKm } from "./geo.helper";

export function computeBuyerMatches(
  listing: ProductListing,
  openRequests: ProcurementRequest[]
): BuyerMatchResult[] {
  const originDistrict = BANGLADESH_DISTRICTS.find(
    (d) => d.nameEn.toLowerCase() === listing.district.toLowerCase()
  );

  const results: BuyerMatchResult[] = [];

  openRequests.forEach((req) => {
    if (req.cropId !== listing.cropId) return;

    // 1. Quantity Compatibility (0-100)
    const remainingNeeded = req.requiredQuantity - req.fulfilledQuantity;
    let qScore = 0;
    if (listing.quantity >= remainingNeeded) {
      qScore = 100;
    } else {
      qScore = req.allowSplitFulfillment
        ? Math.round((listing.quantity / remainingNeeded) * 100)
        : Math.max(10, Math.round((listing.quantity / remainingNeeded) * 70));
    }

    // 2. Location Compatibility (0-100)
    const destDistrict = BANGLADESH_DISTRICTS.find(
      (d) => d.nameEn.toLowerCase() === req.deliveryDistrict.toLowerCase()
    );
    let distKm = 100;
    if (originDistrict && destDistrict) {
      distKm = calculateDistanceKm(originDistrict.lat, originDistrict.lng, destDistrict.lat, destDistrict.lng);
    }
    let lScore = 100;
    if (distKm <= 20) lScore = 100;
    else if (distKm <= 80) lScore = 85;
    else if (distKm <= 180) lScore = 70;
    else if (distKm <= 300) lScore = 50;
    else lScore = 30;

    // 3. Price Compatibility (0-100)
    let pScore = 80;
    if (req.maxBudgetPerUnit > 0) {
      const expected = listing.expectedPrice || listing.startingPrice;
      if (expected <= req.maxBudgetPerUnit) {
        pScore = 100;
      } else {
        const diff = expected - req.maxBudgetPerUnit;
        pScore = Math.max(20, Math.round(100 - (diff / req.maxBudgetPerUnit) * 150));
      }
    }

    // 4. Timing Compatibility (0-100)
    const tScore = 90;

    const overall = Math.round(0.35 * qScore + 0.30 * lScore + 0.20 * pScore + 0.15 * tScore);

    const breakdownEn = [
      `Quantity: ${qScore}/100 (${listing.quantity} kg available vs ${remainingNeeded} kg required)`,
      `Location: ${lScore}/100 (${Math.round(distKm)} km from ${listing.district} to ${req.deliveryDistrict})`,
      `Price: ${pScore}/100 (Farmer asking BDT ${listing.expectedPrice || listing.startingPrice} vs Buyer budget BDT ${req.maxBudgetPerUnit})`,
      `Timing: ${tScore}/100 (Immediate harvest availability)`,
    ];

    const breakdownBn = [
      `পরিমাণ সামঞ্জস্য: ${qScore}/100 (প্রয়োজন ${remainingNeeded} কেজি, রয়েছে ${listing.quantity} কেজি)`,
      `দূরত্ব ও অবস্থান: ${lScore}/100 (${listing.district} থেকে ${req.deliveryDistrict} দূরত্ব প্রায় ${Math.round(distKm)} কিমি)`,
      `মূল্য সামঞ্জস্য: ${pScore}/100 (চাহিদা বাজেট ৳${req.maxBudgetPerUnit}, প্রত্যাশিত ৳${listing.expectedPrice || listing.startingPrice})`,
      `সময়োপযোগিতা: ${tScore}/100 (তাজা ফসল সরাসরি সরবরাহের উপযোগী)`,
    ];

    results.push({
      matchId: `mat_${listing.id}_${req.id}`,
      procurementId: req.id,
      buyerName: req.buyerName,
      companyName: req.companyName,
      buyerDistrict: req.deliveryDistrict,
      cropNameEn: req.cropNameEn,
      cropNameBn: req.cropNameBn,
      requiredQuantity: req.requiredQuantity,
      availableQuantity: listing.quantity,
      unit: req.unit,
      maxBudget: req.maxBudgetPerUnit,
      farmerPrice: listing.expectedPrice || listing.startingPrice,
      quantityScore: qScore,
      locationScore: lScore,
      priceScore: pScore,
      timingScore: tScore,
      overallScore: overall,
      canCombineWithOthers: req.allowSplitFulfillment && listing.quantity < remainingNeeded,
      matchBreakdown: breakdownEn,
      matchBreakdownBn: breakdownBn,
    });
  });

  results.sort((a, b) => b.overallScore - a.overallScore);
  return results;
}

