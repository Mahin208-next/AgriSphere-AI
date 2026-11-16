import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { DirectContract } from "@/types";

export async function GET() {
  const db = getDb();
  const currentUser = db.users.get(db.currentUserId);
  const contracts = Array.from(db.directContracts.values());

  const filtered = currentUser?.role === "admin"
    ? contracts
    : contracts.filter((c) => c.initiatorId === currentUser?.id || c.recipientId === currentUser?.id);

  return NextResponse.json({ contracts: filtered });
}

export async function POST(req: Request) {
  const db = getDb();
  try {
    const body = await req.json();
    const currentUser = db.users.get(db.currentUserId);
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const contractId = `cntr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newContract: DirectContract = {
      id: contractId,
      initiatorId: currentUser.id,
      initiatorName: currentUser.name,
      initiatorRole: currentUser.role,
      recipientId: body.recipientId || "usr_farmer_rafiq",
      recipientName: body.recipientName || "Farmer",
      cropNameEn: body.cropNameEn || "Potato",
      cropNameBn: body.cropNameBn || "আলু",
      quantity: Number(body.quantity) || 5000,
      unit: body.unit || "kg",
      agreedPrice: Number(body.agreedPrice) || 30,
      priceType: body.priceType || "fixed",
      paymentTerms: body.paymentTerms || "Net 7 days after QA delivery",
      deliverySchedule: body.deliverySchedule || "Monthly 2 shipments",
      deliveryLocation: body.deliveryLocation || "Gazipur Mill Plant",
      expirationDate: body.expirationDate || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      status: "proposed",
      notes: body.notes || "",
      isDemo: false,
      createdAt: new Date().toISOString(),
    };

    db.directContracts.set(contractId, newContract);

    db.logAudit(
      currentUser.id,
      currentUser.name,
      "CONTRACT_PROPOSED",
      "DirectContract",
      contractId,
      `Direct supply contract proposed to ${newContract.recipientName} for ${newContract.quantity} ${newContract.unit} ${newContract.cropNameEn}`
    );

    return NextResponse.json({ success: true, contract: newContract });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create contract proposal" }, { status: 500 });
  }
}

