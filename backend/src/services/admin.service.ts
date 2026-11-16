import { dataStore } from "../models/db";

export class AdminService {
  public getOverview() {
    const users = Array.from(dataStore.users.values());
    const listings = Array.from(dataStore.listings.values());
    const auctions = Array.from(dataStore.auctions.values());
    const procurement = Array.from(dataStore.procurementRequests.values());
    const orders = Array.from(dataStore.orders.values());
    const priceRecords = Array.from(dataStore.marketPrices.values());
    const auditLogs = dataStore.auditLogs.slice(0, 50);

    const totalTradeValueBdt = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    const roleCounts: Record<string, number> = {};
    users.forEach((u) => {
      roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
    });

    return {
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
      oversupplyAlerts: Array.from(dataStore.oversupplyAlerts.values()),
    };
  }

  public getOversupplyAlerts() {
    return Array.from(dataStore.oversupplyAlerts.values());
  }
}

export const adminService = new AdminService();

