import { Router } from "express";
import { dataStore, CROPS_CATALOG } from "../models/db";

const router = Router();

// GET /api/v1/listings
router.get("/", (req, res) => {
  const { cropId, district, isAuction, farmerId } = req.query;
  let listings = Array.from(dataStore.listings.values());

  if (cropId) listings = listings.filter((l) => l.cropId === cropId);
  if (district) listings = listings.filter((l) => l.district.toLowerCase() === String(district).toLowerCase());
  if (isAuction !== undefined) listings = listings.filter((l) => l.isAuction === (isAuction === "true"));
  if (farmerId) listings = listings.filter((l) => l.farmerId === farmerId);

  listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ listings });
});

// POST /api/v1/listings
router.post("/", (req, res) => {
  try {
    const body = req.body;
    const currentUser = dataStore.users.get(dataStore.currentUserId);
    if (!currentUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const isAuction = !!body.isAuction;
    if (isAuction && currentUser.role !== "farmer") {
      return res.status(403).json({ error: "Only verified farmers can create live auctions." });
    }

    const crop = CROPS_CATALOG.find((c) => c.id === body.cropId) || CROPS_CATALOG[0];
    const listingId = `list_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const isAuction = !!body.isAuction;
    let auctionId: string | undefined = undefined;

    const listing: any = {
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
      videoUrl: body.videoUrl || undefined,
      isLiveStream: !!body.isLiveStream,
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

      const auction: any = {
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
        images: listing.images,
        videoUrl: listing.videoUrl,
        isLiveStream: listing.isLiveStream,
        createdAt: startTime.toISOString(),
      };

      dataStore.auctions.set(auctionId, auction);
      listing.auctionId = auctionId;
    }

    dataStore.listings.set(listingId, listing);
    res.json({ success: true, listing, auctionId });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create listing" });
  }
});

export default router;
