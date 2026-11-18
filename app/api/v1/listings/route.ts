import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ProductListing, Auction } from "@/types";
import { CROPS_DATA } from "@/lib/data/crops";

export async function GET(req: Request) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const cropId = searchParams.get("cropId");
  const district = searchParams.get("district");
  const isAuction = searchParams.get("isAuction");
  const farmerId = searchParams.get("farmerId");

  let listings = Array.from(db.listings.values());

  if (cropId) {
    listings = listings.filter((l) => l.cropId === cropId);
  }
  if (district) {
    listings = listings.filter((l) => l.district.toLowerCase() === district.toLowerCase());
  }
  if (isAuction !== null) {
    const isAucBool = isAuction === "true";
    listings = listings.filter((l) => l.isAuction === isAucBool);
  }
  if (farmerId) {
    listings = listings.filter((l) => l.farmerId === farmerId);
  }

  // Sort newest first
  listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ listings });
}

export async function POST(req: Request) {
  const db = getDb();
  try {
    const body = await req.json();
    const currentUser = db.users.get(db.currentUserId);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAuction = !!body.isAuction;
    if (isAuction && currentUser.role !== "farmer") {
      return NextResponse.json(
        { error: "Only verified farmers can create live auctions." },
        { status: 403 }
      );
    }

    const crop = CROPS_DATA.find((c) => c.id === body.cropId);
    const cropNameBn = body.customCropNameBn || body.cropNameBn || crop?.nameBn || "অন্যান্য ফসল";
    const cropNameEn = body.customCropNameEn || body.cropNameEn || crop?.nameEn || "Custom Produce";
    const defaultImage = crop?.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80";

    const listingId = `list_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    let auctionId: string | undefined = undefined;

    const listing: ProductListing = {
      id: listingId,
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      farmerPhone: currentUser.phone,
      cropId: body.cropId || "custom",
      cropNameEn,
      cropNameBn,
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
      images: body.images && body.images.length > 0 ? body.images : [defaultImage],
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

      const auction: Auction = {
        id: auctionId,
        listingId,
        farmerId: currentUser.id,
        farmerName: currentUser.name,
        cropNameEn,
        cropNameBn,
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
        antiSnipeWindowSeconds: 120, // 2 mins
        autoExtendTimeSeconds: 120, // +2 mins
        totalBids: 0,
        isDemo: false,
        images: listing.images,
        videoUrl: listing.videoUrl,
        isLiveStream: listing.isLiveStream,
        createdAt: startTime.toISOString(),
      };

      db.auctions.set(auctionId, auction);
      listing.auctionId = auctionId;
    }

    db.listings.set(listingId, listing);

    db.logAudit(
      currentUser.id,
      currentUser.name,
      "LISTING_CREATED",
      "ProductListing",
      listingId,
      `Farmer created ${isAuction ? "live auction" : "direct"} listing for ${listing.quantity} ${listing.unit} of ${cropNameEn} (Expected: BDT ${listing.expectedPrice}/kg)`
    );

    return NextResponse.json({ success: true, listing, auctionId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create listing" }, { status: 500 });
  }
}

