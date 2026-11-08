import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  const offers = db.supplierOffers.get(params.id) || [];
  return NextResponse.json({ offers });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  try {
    const body = await req.json();
    const currentUser = db.users.get(db.currentUserId);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = db.submitSupplierOffer({
      requestId: params.id,
      farmerId: currentUser.id,
      offeredQuantity: Number(body.offeredQuantity),
      pricePerUnit: Number(body.pricePerUnit),
      qualityGrade: body.qualityGrade || "Grade A",
      estimatedDeliveryDate: body.estimatedDeliveryDate || new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
      notes: body.notes,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message, offer: result.offer });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to submit supplier offer" }, { status: 500 });
  }
}
