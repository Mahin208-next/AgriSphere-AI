import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  try {
    const body = await req.json().catch(() => ({}));
    const currentUser = db.users.get(db.currentUserId);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = db.acceptAuctionOffer({
      auctionId: params.id,
      farmerId: currentUser.id,
      bidId: body.bidId,
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
    return NextResponse.json({ error: err.message || "Failed to accept offer" }, { status: 500 });
  }
}

