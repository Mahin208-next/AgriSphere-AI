import { dataStore, CROPS_CATALOG } from "../models/db";
import { Auction, Bid, Order, ProductListing, User } from "../@types";

export class AuctionService {
  public getAllAuctions(status?: string, currentUser?: User) {
    const now = new Date();
    const auctions = Array.from(dataStore.auctions.values());

    // Auto-close check
    auctions.forEach((a) => {
      if (a.status === "live" && now >= new Date(a.endTime)) {
        a.status = "closed";
      }
    });

    let filtered = auctions;
    if (status) {
      filtered = filtered.filter((a) => a.status === status);
    }

    // Mask private reserve price if not farmer owner or admin
    const sanitized = filtered.map((a) => {
      const isOwner = currentUser?.id === a.farmerId;
      const isAdmin = currentUser?.role === "admin";
      return {
        ...a,
        reservePrice: isOwner || isAdmin ? a.reservePrice : undefined,
      };
    });

    sanitized.sort((a, b) => {
      if (a.status === "live" && b.status !== "live") return -1;
      if (b.status === "live" && a.status !== "live") return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return sanitized;
  }

  public getAuctionById(id: string, currentUser?: User) {
    const auction = dataStore.auctions.get(id);
    if (!auction) throw new Error("Auction not found");

    const now = new Date();
    if (auction.status === "live" && now >= new Date(auction.endTime)) {
      auction.status = "closed";
    }

    const bids = dataStore.bids.get(auction.id) || [];
    const listing = dataStore.listings.get(auction.listingId);
    const isOwner = currentUser?.id === auction.farmerId;
    const isAdmin = currentUser?.role === "admin";

    return {
      auction: {
        ...auction,
        reservePrice: isOwner || isAdmin ? auction.reservePrice : undefined,
      },
      bids,
      listing,
      serverTime: now.toISOString(),
      isOwner,
    };
  }

  public createListingAndAuction(currentUser: User, body: any) {
    const crop = CROPS_CATALOG.find((c) => c.id === body.cropId) || CROPS_CATALOG[0];
    const listingId = `list_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const isAuction = !!body.isAuction;
    let auctionId: string | undefined = undefined;

    const listing: ProductListing = {
      id: listingId,
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      farmerPhone: currentUser.phone,
      cropId: crop.id,
      cropNameEn: crop.nameEn,
      cropNameBn: crop.nameBn,
      variety: body.variety || "Local Selection",
      quantity: Number(body.quantity) || 1000,
      unit: body.unit || "kg",
      grade: body.grade || "Grade A",
      district: currentUser.district || body.district || "Bogura",
      upazila: currentUser.upazila || body.upazila || "Sadar",
      startingPrice: Number(body.startingPrice) || 25,
      expectedPrice: Number(body.expectedPrice) || 30,
      privateReservePrice: Number(body.privateReservePrice) || Number(body.startingPrice) || 25,
      isAuction,
      status: isAuction ? "in_auction" : "active",
      images: body.images && body.images.length > 0 ? body.images : [crop.image],
      harvestDate: body.harvestDate || new Date().toISOString().split("T")[0],
      description: body.description || "",
      isDemo: false,
      createdAt: new Date().toISOString(),
    };

    if (isAuction) {
      auctionId = `auc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const durationMinutes = Number(body.auctionDurationMinutes) || 30;
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

      const auction: Auction = {
        id: auctionId,
        listingId,
        farmerId: currentUser.id,
        farmerName: currentUser.name,
        cropNameEn: crop.nameEn,
        cropNameBn: crop.nameBn,
        quantity: listing.quantity,
        unit: listing.unit,
        grade: listing.grade,
        district: listing.district,
        startingPrice: listing.startingPrice,
        minIncrement: Number(body.minIncrement) || 1,
        reservePrice: listing.privateReservePrice,
        currentHighestBid: 0,
        status: "live",
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        antiSnipeWindowSeconds: 120,
        autoExtendTimeSeconds: 120,
        totalBids: 0,
        isDemo: false,
        createdAt: startTime.toISOString(),
      };

      dataStore.auctions.set(auctionId, auction);
      listing.auctionId = auctionId;
    }

    dataStore.listings.set(listingId, listing);

    dataStore.logAudit(
      currentUser.id,
      currentUser.name,
      "LISTING_CREATED",
      "ProductListing",
      listingId,
      `Farmer created ${isAuction ? "live auction" : "direct"} listing for ${listing.quantity} ${listing.unit} ${crop.nameEn}`
    );

    return { listing, auctionId };
  }

  public submitBid(params: {
    auctionId: string;
    bidderId: string;
    amount: number;
    isAnonymous?: boolean;
  }) {
    const auction = dataStore.auctions.get(params.auctionId);
    if (!auction) throw new Error("Auction not found");

    const bidder = dataStore.users.get(params.bidderId);
    if (!bidder) throw new Error("Bidder profile not found");

    if (auction.farmerId === params.bidderId) {
      throw new Error("Sellers are strictly prohibited from bidding on their own listings.");
    }

    const now = new Date();
    const auctionEnd = new Date(auction.endTime);

    if (now >= auctionEnd || auction.status !== "live") {
      auction.status = "closed";
      throw new Error("Auction has already closed for bidding.");
    }

    const minRequired =
      auction.currentHighestBid > 0
        ? auction.currentHighestBid + auction.minIncrement
        : auction.startingPrice;

    if (params.amount < minRequired) {
      throw new Error(
        `Bid must be at least BDT ${minRequired}/kg (Current BDT ${auction.currentHighestBid || auction.startingPrice} + Increment BDT ${auction.minIncrement})`
      );
    }

    if (auction.currentHighestBidderId === params.bidderId && params.amount <= auction.currentHighestBid) {
      throw new Error("You already hold the highest bid for this auction.");
    }

    // Anti-Snipe Check: If bid arrives in last antiSnipeWindowSeconds (2 mins), extend clock!
    const remainingSeconds = (auctionEnd.getTime() - now.getTime()) / 1000;
    let antiSnipeTriggered = false;

    if (remainingSeconds <= auction.antiSnipeWindowSeconds) {
      const newEndTime = new Date(auctionEnd.getTime() + auction.autoExtendTimeSeconds * 1000);
      auction.endTime = newEndTime.toISOString();
      antiSnipeTriggered = true;
    }

    const auctionBids = dataStore.bids.get(params.auctionId) || [];
    auctionBids.forEach((b) => {
      if (b.status === "active") b.status = "outbid";
    });

    const newBid: Bid = {
      id: `bid_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      auctionId: params.auctionId,
      bidderId: bidder.id,
      bidderName: params.isAnonymous ? "Anonymous Buyer" : bidder.companyName || bidder.name,
      bidderRole: bidder.role,
      bidderCompany: bidder.companyName,
      amount: params.amount,
      timestamp: now.toISOString(),
      isAnonymous: !!params.isAnonymous,
      status: "active",
    };

    auctionBids.unshift(newBid);
    dataStore.bids.set(params.auctionId, auctionBids);

    auction.currentHighestBid = params.amount;
    auction.currentHighestBidderId = bidder.id;
    auction.currentHighestBidderName = newBid.bidderName;
    auction.totalBids += 1;

    dataStore.logAudit(
      bidder.id,
      bidder.name,
      "BID_PLACED",
      "Auction",
      auction.id,
      `Placed bid of BDT ${params.amount}/kg on ${auction.cropNameEn}.${antiSnipeTriggered ? " Anti-snipe triggered: +2 min extension." : ""}`
    );

    dataStore.broadcast({
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
      message: antiSnipeTriggered
        ? "Bid submitted successfully! Anti-snipe protection activated: Auction extended by 2 minutes."
        : `Bid of BDT ${params.amount}/kg accepted. You are the highest bidder!`,
      bid: newBid,
      auction,
    };
  }

  public acceptAuctionOffer(params: {
    auctionId: string;
    farmerId: string;
    bidId?: string;
  }) {
    const auction = dataStore.auctions.get(params.auctionId);
    if (!auction) throw new Error("Auction not found");

    if (auction.farmerId !== params.farmerId) {
      throw new Error("Only the listing farmer can accept an auction offer.");
    }

    const auctionBids = dataStore.bids.get(params.auctionId) || [];
    const selectedBid = params.bidId
      ? auctionBids.find((b) => b.id === params.bidId)
      : auctionBids.find((b) => b.status === "active" || b.amount === auction.currentHighestBid);

    if (!selectedBid) throw new Error("No valid bid found to accept.");

    const buyer = dataStore.users.get(selectedBid.bidderId);
    const farmer = dataStore.users.get(auction.farmerId);

    auction.status = "accepted";
    auction.acceptedBidId = selectedBid.id;
    selectedBid.status = "accepted";

    const listing = dataStore.listings.get(auction.listingId);
    if (listing) listing.status = "sold";

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

    dataStore.orders.set(order.id, order);

    dataStore.logAudit(
      farmer?.id,
      farmer?.name,
      "AUCTION_ACCEPTED",
      "Order",
      order.id,
      `Farmer accepted bid of BDT ${selectedBid.amount}/kg from ${selectedBid.bidderName}. Order #${order.id} generated.`
    );

    dataStore.broadcast({
      type: "AUCTION_CLOSED",
      data: { auctionId: auction.id, status: "accepted", orderId: order.id },
      timestamp: new Date().toISOString(),
    });

    return {
      message: `Congratulations! Offer from ${selectedBid.bidderName} accepted. Order #${order.id} generated.`,
      order,
    };
  }
}

export const auctionService = new AuctionService();

