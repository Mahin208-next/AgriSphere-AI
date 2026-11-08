import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  const bids = db.bids.get(params.id) || [];
  return NextResponse.json({ bids });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  try {
    const body = await req.json();
    const currentUser = db.users.get(db.currentUserId);
    if (!currentUser) {
      return NextResponse.json({ error: "Authentication required to place bids." }, { status: 401 });
    }

    const bidderId = body.bidderId || currentUser.id;
    const amount = Number(body.amount);

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid bid amount submitted." }, { status: 400 });
    }

    const result = db.submitBid({
      auctionId: params.id,
      bidderId,
      amount,
      isAnonymous: !!body.isAnonymous,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      bid: result.bid,
      auction: result.auction,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to submit bid" }, { status: 500 });
  }
}
