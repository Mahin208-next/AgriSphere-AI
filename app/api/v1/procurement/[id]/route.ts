import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  const request = db.procurementRequests.get(params.id);
  if (!request) {
    return NextResponse.json({ error: "Procurement request not found" }, { status: 404 });
  }

  const offers = db.supplierOffers.get(request.id) || [];
  const currentUser = db.users.get(db.currentUserId);
  const isOwner = currentUser?.id === request.buyerId;
  const isAdmin = currentUser?.role === "admin";

  const sanitized = {
    ...request,
    maxBudgetPerUnit: (request.isBudgetPrivate && !isOwner && !isAdmin) ? 0 : request.maxBudgetPerUnit,
  };

  return NextResponse.json({
    request: sanitized,
    offers,
    isOwner,
  });
}
