import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ProcurementRequest } from "@/types";
import { CROPS_DATA } from "@/lib/data/crops";

export async function GET(req: Request) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const cropId = searchParams.get("cropId");
  const district = searchParams.get("district");
  const buyerId = searchParams.get("buyerId");

  let requests = Array.from(db.procurementRequests.values());

  if (cropId) {
    requests = requests.filter((r) => r.cropId === cropId);
  }
  if (district) {
    requests = requests.filter((r) => r.deliveryDistrict.toLowerCase() === district.toLowerCase());
  }
  if (buyerId) {
    requests = requests.filter((r) => r.buyerId === buyerId);
  }

  // Sort newest first
  requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Handle private budget masking
  const currentUser = db.users.get(db.currentUserId);
  const sanitized = requests.map((r) => {
    const isOwner = currentUser?.id === r.buyerId;
    const isAdmin = currentUser?.role === "admin";
    return {
      ...r,
      maxBudgetPerUnit: (r.isBudgetPrivate && !isOwner && !isAdmin) ? 0 : r.maxBudgetPerUnit,
    };
  });

  return NextResponse.json({ requests: sanitized });
}

export async function POST(req: Request) {
  const db = getDb();
  try {
    const body = await req.json();
    const currentUser = db.users.get(db.currentUserId);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const crop = CROPS_DATA.find((c) => c.id === body.cropId) || CROPS_DATA[0];

    const reqId = `rfp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRequest: ProcurementRequest = {
      id: reqId,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerRole: currentUser.role,
      companyName: currentUser.companyName || body.companyName || currentUser.name,
      cropId: crop.id,
      cropNameEn: crop.nameEn,
      cropNameBn: crop.nameBn,
      requiredQuantity: Number(body.requiredQuantity) || 5000,
      unit: body.unit || "kg",
      qualityGrade: body.qualityGrade || "Grade A",
      maxBudgetPerUnit: Number(body.maxBudgetPerUnit) || 0,
      isBudgetPrivate: !!body.isBudgetPrivate,
      deliveryLocation: body.deliveryLocation || `${currentUser.district} Central Facility`,
      deliveryDistrict: body.deliveryDistrict || currentUser.district || "Dhaka",
      requiredDeliveryDate: body.requiredDeliveryDate || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      allowSplitFulfillment: body.allowSplitFulfillment !== undefined ? !!body.allowSplitFulfillment : true,
      fulfilledQuantity: 0,
      status: "open",
      notes: body.notes || "",
      isDemo: false,
      createdAt: new Date().toISOString(),
    };

    db.procurementRequests.set(reqId, newRequest);

    db.logAudit(
      currentUser.id,
      currentUser.name,
      "PROCUREMENT_REQUEST_CREATED",
      "ProcurementRequest",
      reqId,
      `Buyer created procurement request for ${newRequest.requiredQuantity} ${newRequest.unit} ${crop.nameEn} (Target destination: ${newRequest.deliveryDistrict})`
    );

    return NextResponse.json({ success: true, request: newRequest });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create procurement request" }, { status: 500 });
  }
}
