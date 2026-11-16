import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  try {
    const body = await req.json();
    const currentUser = db.users.get(db.currentUserId);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestId = body.requestId;
    if (!requestId) {
      return NextResponse.json({ error: "requestId is required" }, { status: 400 });
    }

    const result = db.acceptSupplierOffer({
      requestId,
      offerId: params.id,
      buyerId: currentUser.id,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      order: result.order,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to accept supplier offer" }, { status: 500 });
  }
}

