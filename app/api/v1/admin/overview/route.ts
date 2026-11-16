import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const users = Array.from(db.users.values());
  const listings = Array.from(db.listings.values());
  const auctions = Array.from(db.auctions.values());
  const procurement = Array.from(db.procurementRequests.values());
  const orders = Array.from(db.orders.values());
  const priceRecords = Array.from(db.marketPrices.values());
  const auditLogs = db.auditLogs.slice(0, 50);

  const totalTradeValueBdt = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const roleCounts: Record<string, number> = {};
  users.forEach((u) => {
    roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
  });

  return NextResponse.json({
    stats: {
      totalUsers: users.length,
      farmersCount: roleCounts["farmer"] || 0,
      buyersCount: (roleCounts["buyer"] || 0) + (roleCounts["retailer"] || 0),
      factoryCount: roleCounts["factory"] || 0,
      exporterCount: roleCounts["exporter"] || 0,
      importerCount: roleCounts["importer"] || 0,
      activeListings: listings.filter((l) => l.status === "active" || l.status === "in_auction").length,
      activeAuctions: auctions.filter((a) => a.status === "live").length,
      openProcurementRequests: procurement.filter((p) => p.status === "open").length,
      completedOrdersCount: orders.length,
      totalTradeVolumeBdt: totalTradeValueBdt,
      priceRecordsCount: priceRecords.length,
    },
    users,
    auditLogs,
    oversupplyAlerts: Array.from(db.oversupplyAlerts.values()),
  });
}

