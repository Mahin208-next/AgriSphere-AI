import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const currentUser = db.users.get(db.currentUserId);
  const orders = Array.from(db.orders.values());

  const filtered = currentUser?.role === "admin"
    ? orders
    : orders.filter((o) => o.sellerId === currentUser?.id || o.buyerId === currentUser?.id);

  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ orders: filtered });
}
