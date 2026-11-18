import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Order } from "@/types";

export async function GET() {
  const db = getDb();
  const currentUser = db.users.get(db.currentUserId);
  const orders = Array.from(db.orders.values());

  const filtered = currentUser?.role === "admin"
    ? orders
    : orders.filter((o) => o.sellerId === currentUser?.id || o.buyerId === currentUser?.id);

  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ orders: filtered });
}

export async function POST(req: Request) {
  const db = getDb();
  try {
    const body = await req.json();
    const currentUser = db.users.get(db.currentUserId);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingId, quantity, deliveryDistrict, notes } = body;
    const listing = db.listings.get(listingId);
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const buyQty = Number(quantity) || listing.quantity;
    if (buyQty <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    if (buyQty > listing.quantity) {
      return NextResponse.json({
        error: `Requested quantity exceeds available stock (${listing.quantity} ${listing.unit})`,
      }, { status: 400 });
    }

    const unitPrice = listing.expectedPrice || listing.startingPrice;
    const totalAmount = buyQty * unitPrice;
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newOrder: Order = {
      id: orderId,
      referenceType: "direct_contract",
      referenceId: listingId,
      sellerId: listing.farmerId,
      sellerName: listing.farmerName,
      sellerPhone: listing.farmerPhone,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerPhone: currentUser.phone,
      cropNameEn: listing.cropNameEn,
      cropNameBn: listing.cropNameBn,
      quantity: buyQty,
      unit: listing.unit,
      pricePerUnit: unitPrice,
      totalAmount,
      deliveryDistrict: deliveryDistrict || currentUser.district || listing.district,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    db.orders.set(orderId, newOrder);

    // Update remaining quantity on listing
    listing.quantity = Math.max(0, listing.quantity - buyQty);
    if (listing.quantity === 0) {
      listing.status = "sold";
    }

    db.logAudit(
      currentUser.id,
      currentUser.name,
      "DIRECT_PURCHASE_ORDER",
      "Order",
      orderId,
      `Buyer ${currentUser.name} purchased ${buyQty} ${listing.unit} of ${listing.cropNameEn} from ${listing.farmerName} for BDT ${totalAmount}`
    );

    return NextResponse.json({ success: true, order: newOrder });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create order" }, { status: 500 });
  }
}


