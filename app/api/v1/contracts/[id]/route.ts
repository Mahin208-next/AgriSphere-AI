import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  try {
    const body = await req.json();
    const contract = db.directContracts.get(params.id);
    if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });

    const currentUser = db.users.get(db.currentUserId);
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (body.status) {
      contract.status = body.status;
      if (body.counterPrice) {
        contract.agreedPrice = Number(body.counterPrice);
        contract.status = "negotiating";
      }

      db.logAudit(
        currentUser.id,
        currentUser.name,
        "CONTRACT_STATUS_UPDATED",
        "DirectContract",
        contract.id,
        `Contract status updated to ${contract.status} by ${currentUser.name}`
      );
    }

    return NextResponse.json({ success: true, contract });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update contract" }, { status: 500 });
  }
}

