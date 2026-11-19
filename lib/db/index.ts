import {
  User,
  FarmerProfile,
  BusinessProfile,
  MarketPriceRecord,
  ProductListing,
  Auction,
  Bid,
  ProcurementRequest,
  SupplierOffer,
  DirectContract,
  ExportRFQ,
  ExportQuotation,
  Order,
  OversupplyAlert,
  AuditLog,
  MarketRecommendation,
  BuyerMatchResult,
} from "@/types";
import {
  INITIAL_USERS,
  INITIAL_FARMER_PROFILES,
  INITIAL_BUSINESS_PROFILES,
  INITIAL_MARKET_PRICES,
  GENERATE_HISTORICAL_PRICES,
  INITIAL_LISTINGS,
  INITIAL_AUCTIONS,
  INITIAL_BIDS,
  INITIAL_PROCUREMENT_REQUESTS,
  INITIAL_SUPPLIER_OFFERS,
  INITIAL_DIRECT_CONTRACTS,
  INITIAL_EXPORT_RFQS,
  INITIAL_EXPORT_QUOTATIONS,
  INITIAL_ORDERS,
  INITIAL_OVERSUPPLY_ALERTS,
  INITIAL_AUDIT_LOGS,
} from "../data/initial-db";
import { BANGLADESH_DISTRICTS, BANGLADESH_MARKETS, calculateDistanceKm, estimateTransportCost } from "../data/bangladesh-geo";
import { CROPS_DATA } from "../data/crops";

// Singleton Database in Global Scope for Next.js App Router API and Server Components
declare global {
  // eslint-disable-next-line no-var
  var __agriDb: AgriDatabase | undefined;
}

export type DatabaseEvent = {
  type: "BID_PLACED" | "AUCTION_CLOSED" | "OFFER_SUBMITTED" | "OFFER_ACCEPTED" | "PRICE_UPDATED" | "ALERT_CREATED";
  data: any;
  timestamp: string;
};

type EventListener = (event: DatabaseEvent) => void;

export class AgriDatabase {
  public users: Map<string, User> = new Map();
  public farmerProfiles: Map<string, FarmerProfile> = new Map();
  public businessProfiles: Map<string, BusinessProfile> = new Map();
  public marketPrices: Map<string, MarketPriceRecord> = new Map();
  public listings: Map<string, ProductListing> = new Map();
  public auctions: Map<string, Auction> = new Map();
  public bids: Map<string, Bid[]> = new Map(); // auctionId -> Bid[]
  public procurementRequests: Map<string, ProcurementRequest> = new Map();
  public supplierOffers: Map<string, SupplierOffer[]> = new Map(); // requestId -> SupplierOffer[]
  public directContracts: Map<string, DirectContract> = new Map();
  public exportRfqs: Map<string, ExportRFQ> = new Map();
  public exportQuotations: Map<string, ExportQuotation[]> = new Map(); // rfqId -> ExportQuotation[]
  public orders: Map<string, Order> = new Map();
  public oversupplyAlerts: Map<string, OversupplyAlert> = new Map();
  public auditLogs: AuditLog[] = [];
  
  private listeners: Set<EventListener> = new Set();
  public currentUserId: string = "usr_farmer_rafiq"; // Default active user for quick demo

  constructor() {
    this.seed();
  }

  private seed() {
    INITIAL_USERS.forEach((u) => this.users.set(u.id, { ...u }));
    INITIAL_FARMER_PROFILES.forEach((p) => this.farmerProfiles.set(p.userId, { ...p }));
    INITIAL_BUSINESS_PROFILES.forEach((b) => this.businessProfiles.set(b.userId, { ...b }));

    INITIAL_MARKET_PRICES.forEach((prc) => this.marketPrices.set(prc.id, { ...prc }));
    GENERATE_HISTORICAL_PRICES().forEach((prc) => this.marketPrices.set(prc.id, { ...prc }));

    INITIAL_LISTINGS.forEach((l) => this.listings.set(l.id, { ...l }));
    INITIAL_AUCTIONS.forEach((a) => this.auctions.set(a.id, { ...a }));

    // Group bids by auction
    INITIAL_BIDS.forEach((b) => {
      const existing = this.bids.get(b.auctionId) || [];
      existing.push({ ...b });
      this.bids.set(b.auctionId, existing);
    });

    INITIAL_PROCUREMENT_REQUESTS.forEach((r) => this.procurementRequests.set(r.id, { ...r }));
    
    INITIAL_SUPPLIER_OFFERS.forEach((o) => {
      const existing = this.supplierOffers.get(o.requestId) || [];
      existing.push({ ...o });
      this.supplierOffers.set(o.requestId, existing);
    });

    INITIAL_DIRECT_CONTRACTS.forEach((c) => this.directContracts.set(c.id, { ...c }));
    INITIAL_EXPORT_RFQS.forEach((rfq) => this.exportRfqs.set(rfq.id, { ...rfq }));

    INITIAL_EXPORT_QUOTATIONS.forEach((q) => {
      const existing = this.exportQuotations.get(q.rfqId) || [];
      existing.push({ ...q });
      this.exportQuotations.set(q.rfqId, existing);
    });

    INITIAL_ORDERS.forEach((o) => this.orders.set(o.id, { ...o }));
    INITIAL_OVERSUPPLY_ALERTS.forEach((a) => this.oversupplyAlerts.set(a.id, { ...a }));
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
  }

  public subscribe(listener: EventListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public broadcast(event: DatabaseEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in event listener:", err);
      }
    });
  }

  public logAudit(userId: string | undefined, userName: string | undefined, action: string, entityType: string, entityId: string | undefined, details: string) {
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      userName,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return log;
  }

  // --- AUCTION ENGINE WITH SERVER ATOMICITY & ANTI-SNIPING ---
  public submitBid(params: {
    auctionId: string;
    bidderId: string;
    amount: number;
    isAnonymous?: boolean;
  }): { success: boolean; message: string; bid?: Bid; auction?: Auction } {
    const auction = this.auctions.get(params.auctionId);
    if (!auction) {
      return { success: false, message: "Auction not found" };
    }

    const bidder = this.users.get(params.bidderId);
    if (!bidder) {
      return { success: false, message: "Bidder profile not found" };
    }

    // Role check: farmer cannot bid on their own listing
    if (auction.farmerId === params.bidderId) {
      return { success: false, message: "Sellers are strictly prohibited from bidding on their own listings." };
    }

    const now = new Date();
    const auctionEnd = new Date(auction.endTime);

    // Auto-close check
    if (now >= auctionEnd || auction.status !== "live") {
      auction.status = "closed";
      return { success: false, message: "Auction has already ended and is closed for bidding." };
    }

    // Validation: min increment
    const minRequired = auction.currentHighestBid > 0 
      ? auction.currentHighestBid + auction.minIncrement 
      : auction.startingPrice;

    if (params.amount < minRequired) {
      return { 
        success: false, 
        message: `Bid must be at least BDT ${minRequired}/kg (Starting/Current BDT ${auction.currentHighestBid || auction.startingPrice} + Increment BDT ${auction.minIncrement})` 
      };
    }

    // Prevent bidder from outbidding their own current highest bid unless raising purposefully
    if (auction.currentHighestBidderId === params.bidderId && params.amount <= auction.currentHighestBid) {
      return { success: false, message: "You already hold the highest bid for this auction." };
    }

    // Anti-Snipe Check: If bid arrives within antiSnipeWindowSeconds (e.g. 2 mins) of end time, extend end time!
    const remainingSeconds = (auctionEnd.getTime() - now.getTime()) / 1000;
    let antiSnipeTriggered = false;

    if (remainingSeconds <= auction.antiSnipeWindowSeconds) {
      const newEndTime = new Date(auctionEnd.getTime() + auction.autoExtendTimeSeconds * 1000);
      auction.endTime = newEndTime.toISOString();
      antiSnipeTriggered = true;
    }

    // Mark previous active bids as outbid
    const auctionBids = this.bids.get(params.auctionId) || [];
    auctionBids.forEach((b) => {
      if (b.status === "active") b.status = "outbid";
    });

    const newBid: Bid = {
      id: `bid_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      auctionId: params.auctionId,
      bidderId: bidder.id,
      bidderName: params.isAnonymous ? "Anonymous Buyer" : (bidder.companyName || bidder.name),
      bidderRole: bidder.role,
      bidderCompany: bidder.companyName,
      amount: params.amount,
      timestamp: now.toISOString(),
      isAnonymous: !!params.isAnonymous,
      status: "active",
    };

    auctionBids.unshift(newBid);
    this.bids.set(params.auctionId, auctionBids);

    auction.currentHighestBid = params.amount;
    auction.currentHighestBidderId = bidder.id;
    auction.currentHighestBidderName = newBid.bidderName;
    auction.totalBids += 1;

    // Log audit
    this.logAudit(
      bidder.id,
      bidder.name,
      "BID_PLACED",
      "Auction",
      auction.id,
      `Placed bid of BDT ${params.amount}/kg on ${auction.cropNameEn} (${auction.quantity} ${auction.unit}). Total commitment BDT ${(params.amount * auction.quantity).toLocaleString()}.${antiSnipeTriggered ? " Anti-snipe triggered: +2 min extension." : ""}`
    );

    // Broadcast Realtime Event
    this.broadcast({
      type: "BID_PLACED",
      data: {
        auctionId: auction.id,
        highestBid: auction.currentHighestBid,
        highestBidderName: auction.currentHighestBidderName,
        totalBids: auction.totalBids,
        endTime: auction.endTime,
        antiSnipeTriggered,
        newBid,
      },
      timestamp: now.toISOString(),
    });

    return {
      success: true,
      message: antiSnipeTriggered 
        ? `Bid submitted successfully! Anti-snipe protection activated: Auction extended by 2 minutes.`
        : `Bid of BDT ${params.amount}/kg accepted. You are currently the highest bidder!`,
      bid: newBid,
      auction,
    };
  }

  public acceptAuctionOffer(params: {
    auctionId: string;
    farmerId: string;
    bidId?: string;
  }): { success: boolean; message: string; order?: Order } {
    const auction = this.auctions.get(params.auctionId);
    if (!auction) return { success: false, message: "Auction not found." };

    if (auction.farmerId !== params.farmerId) {
      return { success: false, message: "Only the listing farmer can accept an auction offer." };
    }

    const auctionBids = this.bids.get(params.auctionId) || [];
    const selectedBid = params.bidId 
      ? auctionBids.find((b) => b.id === params.bidId)
      : auctionBids.find((b) => b.status === "active" || b.amount === auction.currentHighestBid);

    if (!selectedBid) {
      return { success: false, message: "No valid bid found to accept." };
    }

    const buyer = this.users.get(selectedBid.bidderId);
    const farmer = this.users.get(auction.farmerId);

    auction.status = "accepted";
    auction.acceptedBidId = selectedBid.id;
    selectedBid.status = "accepted";

    // Update product listing
    const listing = this.listings.get(auction.listingId);
    if (listing) {
      listing.status = "sold";
    }

    // Create Order Record
    const order: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      referenceType: "auction",
      referenceId: auction.id,
      sellerId: auction.farmerId,
      sellerName: farmer?.name || auction.farmerName,
      sellerPhone: farmer?.phone,
      buyerId: selectedBid.bidderId,
      buyerName: buyer?.name || selectedBid.bidderName,
      buyerPhone: buyer?.phone,
      cropNameEn: auction.cropNameEn,
      cropNameBn: auction.cropNameBn,
      quantity: auction.quantity,
      unit: auction.unit,
      pricePerUnit: selectedBid.amount,
      totalAmount: selectedBid.amount * auction.quantity,
      deliveryDistrict: buyer?.district || "Dhaka",
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    this.orders.set(order.id, order);

    this.logAudit(
      farmer?.id,
      farmer?.name,
      "AUCTION_ACCEPTED",
      "Order",
      order.id,
      `Farmer accepted bid of BDT ${selectedBid.amount}/kg from ${selectedBid.bidderName}. Order ${order.id} generated for total BDT ${order.totalAmount.toLocaleString()}.`
    );

    this.broadcast({
      type: "AUCTION_CLOSED",
      data: { auctionId: auction.id, status: "accepted", orderId: order.id },
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      message: `Congratulations! Offer from ${selectedBid.bidderName} accepted. Official Order #${order.id} generated.`,
      order,
    };
  }

  // --- BUYER PROCUREMENT & REVERSE OFFER SYSTEM ---
  public submitSupplierOffer(params: {
    requestId: string;
    farmerId: string;
    offeredQuantity: number;
    pricePerUnit: number;
    qualityGrade: string;
    estimatedDeliveryDate: string;
    notes?: string;
  }): { success: boolean; message: string; offer?: SupplierOffer } {
    const request = this.procurementRequests.get(params.requestId);
    if (!request) return { success: false, message: "Procurement request not found." };

    if (request.status === "closed" || request.status === "fulfilled") {
      return { success: false, message: "This procurement request is already fulfilled or closed." };
    }

    const farmer = this.users.get(params.farmerId);
    if (!farmer) return { success: false, message: "Farmer user profile not found." };

    // Partial fulfillment validation
    const remainingQty = request.requiredQuantity - request.fulfilledQuantity;
    if (!request.allowSplitFulfillment && params.offeredQuantity < request.requiredQuantity) {
      return { success: false, message: `This buyer requires full single-supplier delivery of ${request.requiredQuantity} ${request.unit}. Split supply is disabled.` };
    }

    const offer: SupplierOffer = {
      id: `ofr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      requestId: request.id,
      farmerId: farmer.id,
      farmerName: farmer.name,
      farmerPhone: farmer.phone,
      farmerDistrict: farmer.district,
      offeredQuantity: params.offeredQuantity,
      unit: request.unit,
      pricePerUnit: params.pricePerUnit,
      qualityGrade: params.qualityGrade,
      estimatedDeliveryDate: params.estimatedDeliveryDate,
      notes: params.notes,
      status: "pending",
      isDemo: true,
      createdAt: new Date().toISOString(),
    };

    const offers = this.supplierOffers.get(request.id) || [];
    offers.unshift(offer);
    this.supplierOffers.set(request.id, offers);

    this.logAudit(
      farmer.id,
      farmer.name,
      "OFFER_SUBMITTED",
      "ProcurementRequest",
      request.id,
      `Farmer submitted offer of ${params.offeredQuantity} ${request.unit} at BDT ${params.pricePerUnit}/kg for ${request.cropNameEn}.`
    );

    this.broadcast({
      type: "OFFER_SUBMITTED",
      data: { requestId: request.id, offer },
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      message: `Your supply offer of ${params.offeredQuantity} ${request.unit} @ BDT ${params.pricePerUnit}/kg submitted to ${request.companyName || request.buyerName}.`,
      offer,
    };
  }

  public acceptSupplierOffer(params: {
    requestId: string;
    offerId: string;
    buyerId: string;
  }): { success: boolean; message: string; order?: Order } {
    const request = this.procurementRequests.get(params.requestId);
    if (!request) return { success: false, message: "Procurement request not found." };

    if (request.buyerId !== params.buyerId) {
      return { success: false, message: "Only the posting buyer can accept offers for this procurement." };
    }

    const offers = this.supplierOffers.get(params.requestId) || [];
    const offer = offers.find((o) => o.id === params.offerId);
    if (!offer) return { success: false, message: "Offer not found." };

    offer.status = "accepted";
    request.fulfilledQuantity += offer.offeredQuantity;

    if (request.fulfilledQuantity >= request.requiredQuantity) {
      request.status = "fulfilled";
    } else {
      request.status = "partially_fulfilled";
    }

    const buyer = this.users.get(request.buyerId);
    const farmer = this.users.get(offer.farmerId);

    const order: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      referenceType: "procurement",
      referenceId: request.id,
      sellerId: offer.farmerId,
      sellerName: farmer?.name || offer.farmerName,
      sellerPhone: farmer?.phone || offer.farmerPhone,
      buyerId: request.buyerId,
      buyerName: buyer?.name || request.buyerName,
      buyerPhone: buyer?.phone,
      cropNameEn: request.cropNameEn,
      cropNameBn: request.cropNameBn,
      quantity: offer.offeredQuantity,
      unit: offer.unit,
      pricePerUnit: offer.pricePerUnit,
      totalAmount: offer.offeredQuantity * offer.pricePerUnit,
      deliveryDistrict: request.deliveryDistrict,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    this.orders.set(order.id, order);

    this.logAudit(
      buyer?.id,
      buyer?.name,
      "OFFER_ACCEPTED",
      "Order",
      order.id,
      `Buyer accepted supplier offer of ${offer.offeredQuantity} ${offer.unit} at BDT ${offer.pricePerUnit}/kg from ${offer.farmerName}. Generated order #${order.id}.`
    );

    this.broadcast({
      type: "OFFER_ACCEPTED",
      data: { requestId: request.id, offerId: offer.id, orderId: order.id },
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      message: `Supplier offer accepted! Order #${order.id} generated for BDT ${order.totalAmount.toLocaleString()}.`,
      order,
    };
  }

  // --- AI NET-RETURN RECOMMENDATION ENGINE ---
  public getBestMarketRecommendations(params: {
    cropId: string;
    originDistrict: string;
    quantityKg: number;
    grade?: string;
    customWholesalePrice?: number;
    vehicleType?: "covered_van" | "pickup" | "truck_10ton" | "local_trolley";
    customFeePercent?: number;
  }): MarketRecommendation[] {
    const origin = BANGLADESH_DISTRICTS.find(
      (d) => d.nameEn.toLowerCase() === params.originDistrict.toLowerCase() || d.id === params.originDistrict.toLowerCase()
    ) || BANGLADESH_DISTRICTS.find((d) => d.id === "bogura")!;

    const crop = CROPS_DATA.find((c) => c.id === params.cropId) || CROPS_DATA[0];

    // Baseline fallback prices per kg for all crops if not in DAM live records
    const defaultCropPrices: Record<string, number> = {
      green_chilli: 180,
      cucumber: 35,
      sweet_pumpkin: 28,
      tomato: 65,
      potato: 32,
      onion: 85,
      mango: 95,
      litchi: 160,
      guava: 55,
      dragon_fruit: 220,
      watermelon: 30,
      papaya: 25,
      brinjal: 48,
      rice_paddy: 38,
      maize: 29,
      mustard: 92,
      garlic: 195,
      ginger: 210,
      cauliflower: 40,
      cabbage: 30,
      carrot: 55,
      bitter_gourd: 60,
      pointed_gourd: 45,
      banana: 40,
      pineapple: 50,
      lentil: 125,
      wheat: 42,
      jute: 75,
    };

    // Find all today's price records for this crop across all markets
    const todayPrices = Array.from(this.marketPrices.values()).filter(
      (p) => p.cropId === crop.id && p.dataFreshnessDays === 0
    );

    const vehicleMultiplier =
      params.vehicleType === "covered_van" ? 1.15 :
      params.vehicleType === "truck_10ton" ? 0.85 :
      params.vehicleType === "local_trolley" ? 0.75 : 1.0;

    const feePercent = params.customFeePercent !== undefined ? params.customFeePercent / 100 : 0.015;

    const recommendations: MarketRecommendation[] = [];

    BANGLADESH_MARKETS.forEach((mkt) => {
      // Find matching price record or fallback to district price or default benchmark
      const priceRecord = todayPrices.find((p) => p.marketId === mkt.id) 
        || todayPrices.find((p) => p.district.toLowerCase() === mkt.district.toLowerCase())
        || todayPrices[0];

      let basePrice = params.customWholesalePrice && params.customWholesalePrice > 0
        ? params.customWholesalePrice
        : priceRecord ? priceRecord.wholesalePrice : (defaultCropPrices[crop.id] || 45);

      // Terminal wholesale hub premium (Karwan Bazar, Shyambazar, Reazuddin)
      if (mkt.marketType === "wholesale" && (mkt.district === "Dhaka" || mkt.district === "Chattogram")) {
        basePrice = Math.round(basePrice * 1.08); // +8% terminal market premium
      }

      const distanceKm = calculateDistanceKm(origin.lat, origin.lng, mkt.lat, mkt.lng);
      const isPerishable = crop.category === "vegetable" || crop.category === "spice";
      const { transportCost: rawTransport, handlingCost } = estimateTransportCost(params.quantityKg, distanceKm, isPerishable);
      const transportCost = Math.round(rawTransport * vehicleMultiplier);

      // Market fee / aratdar commission
      const marketFee = Math.round(basePrice * params.quantityKg * feePercent);
      const otherCosts = handlingCost + marketFee;

      const grossRevenue = Math.round(basePrice * params.quantityKg);
      const netEstimatedReturn = grossRevenue - transportCost - otherCosts;
      const netMarginPercentage = grossRevenue > 0 ? Math.round((netEstimatedReturn / grossRevenue) * 1000) / 10 : 0;

      // Confidence score based on data source and distance
      let confidenceScore = 95;
      if (priceRecord?.priceSource === "DAM") confidenceScore = 97;
      if (priceRecord?.priceSource === "Platform") confidenceScore = 99;
      if (distanceKm > 250) confidenceScore -= 4;

      // Explainable Rationale
      let aiRationale = "";
      let aiRationaleBn = "";

      const districtBn = BANGLADESH_DISTRICTS.find((d) => d.nameEn === mkt.district)?.nameBn || mkt.district;

      if (distanceKm <= 25) {
        aiRationale = `Local assembly hub with minimal transport overhead (${distanceKm} km). Recommended for immediate same-day cash liquidity and zero transit weight loss.`;
        aiRationaleBn = `নিকটস্থ মোকাম হওয়ায় পরিবহন খরচ সর্বনিম্ন (${distanceKm} কিমি)। দ্রুত নগদ বিক্রয় ও ওজনে টান না পড়ার জন্য আদর্শ।`;
      } else if (netEstimatedReturn > grossRevenue * 0.82 && basePrice >= 50) {
        aiRationale = `High-value terminal destination in ${mkt.district}. Even after BDT ${transportCost.toLocaleString()} logistics, net profit is maximized (+${netMarginPercentage}% return).`;
        aiRationaleBn = `${districtBn}-এর বড় পাইকারি বাজারে পণ্যমূল্য চড়া। প্রায় ৳${transportCost.toLocaleString()} পরিবহন ব্যয়ের পরও সামগ্রিক নিট মুনাফা সর্বোচ্চ থাকবে।`;
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
        marketPricePerKg: basePrice,
        grossRevenue,
        transportCost,
        otherCosts,
        netEstimatedReturn,
        netMarginPercentage,
        confidenceScore,
        dataFreshnessDays: priceRecord?.dataFreshnessDays ?? 0,
        priceSource: priceRecord?.priceSource ?? "DAM",
        aiRationale,
        aiRationaleBn,
      });
    });

    // Rank strictly by Net Estimated Return descending
    recommendations.sort((a, b) => b.netEstimatedReturn - a.netEstimatedReturn);
    return recommendations;
  }

  // --- EXPLAINABLE AI BUYER-FARMER MATCHING ENGINE ---
  // Match Score = 0.35 * Q + 0.30 * L + 0.20 * P + 0.15 * T
  public getBuyerMatchesForListing(listingId: string): BuyerMatchResult[] {
    const listing = this.listings.get(listingId);
    if (!listing) return [];

    const originDistrict = BANGLADESH_DISTRICTS.find(
      (d) => d.nameEn.toLowerCase() === listing.district.toLowerCase()
    );

    const openRequests = Array.from(this.procurementRequests.values()).filter(
      (r) => r.cropId === listing.cropId && (r.status === "open" || r.status === "partially_fulfilled")
    );

    const results: BuyerMatchResult[] = [];

    openRequests.forEach((req) => {
      // 1. Quantity Compatibility (0 - 100)
      const remainingNeeded = req.requiredQuantity - req.fulfilledQuantity;
      let qScore = 0;
      if (listing.quantity >= remainingNeeded) {
        qScore = 100;
      } else {
        qScore = req.allowSplitFulfillment 
          ? Math.round((listing.quantity / remainingNeeded) * 100)
          : Math.max(10, Math.round((listing.quantity / remainingNeeded) * 70));
      }

      // 2. Location Compatibility (0 - 100)
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

      // 3. Price Compatibility (0 - 100)
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

      // 4. Timing Compatibility (0 - 100)
      const tScore = 90; // Fresh harvest aligned with delivery window

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
}

// Singleton accessor
export function getDb(): AgriDatabase {
  if (!global.__agriDb) {
    global.__agriDb = new AgriDatabase();
  }
  return global.__agriDb;
}
