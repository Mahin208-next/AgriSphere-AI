import { PrismaClient } from "@prisma/client";
import {
  User,
  FarmerProfile,
  BusinessProfile,
  Crop,
  MarketPriceRecord,
  ProductListing,
  Auction,
  Bid,
  ProcurementRequest,
  SupplierOffer,
  DirectContract,
  ExportRFQ,
  ExportQuotation,
  Order,
  OversupplyAlert,
  AuditLog,
} from "../@types";

export const prisma = new PrismaClient();

export type DatabaseEvent = {
  type: "BID_PLACED" | "AUCTION_CLOSED" | "OFFER_SUBMITTED" | "OFFER_ACCEPTED" | "PRICE_UPDATED" | "ALERT_CREATED";
  data: any;
  timestamp: string;
};

type EventListener = (event: DatabaseEvent) => void;

// Crop Seed Catalog
export const CROPS_CATALOG: Crop[] = [
  {
    id: "green_chilli",
    nameEn: "Green Chilli",
    nameBn: "কাঁচা মরিচ",
    category: "spice",
    defaultUnit: "kg",
    image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80",
    supportedGrades: ["Grade A (Fresh Export Quality)", "Grade B (Standard Market)", "Grade C (Processing/Drying)"],
    damReferenceCode: "DAM-SPICE-001",
  },
  {
    id: "cucumber",
    nameEn: "Cucumber",
    nameBn: "শসা",
    category: "vegetable",
    defaultUnit: "kg",
    image: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=800&q=80",
    supportedGrades: ["Grade A (Crisp Uniform Green)", "Grade B (Standard Table)", "Grade C (Local Salad/Pickle)"],
    damReferenceCode: "DAM-VEG-014",
  },
  {
    id: "sweet_pumpkin",
    nameEn: "Sweet Pumpkin",
    nameBn: "মিষ্টি কুমড়া",
    category: "vegetable",
    defaultUnit: "kg",
    image: "https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&w=800&q=80",
    supportedGrades: ["Grade A (Mature Golden Flesh)", "Grade B (Medium Harvest)", "Grade C (Processing Cut)"],
    damReferenceCode: "DAM-VEG-029",
  },
  {
    id: "tomato",
    nameEn: "Tomato",
    nameBn: "টমেটো",
    category: "vegetable",
    defaultUnit: "kg",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80",
    supportedGrades: ["Grade A (Firm Crimson Red)", "Grade B (Semi-Ripe Salad)", "Grade C (Paste & Processing)"],
    damReferenceCode: "DAM-VEG-003",
  },
  {
    id: "potato",
    nameEn: "Potato (Diamond/Cardinal)",
    nameBn: "গোল আলু (ডায়মন্ড/কার্ডিনাল)",
    category: "vegetable",
    defaultUnit: "kg",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80",
    supportedGrades: ["Grade A (Export / Table >50mm)", "Grade B (Market >35mm)", "Grade C (Chip & Mill Grade)"],
    damReferenceCode: "DAM-TUBER-001",
  },
  {
    id: "onion",
    nameEn: "Onion (Taherpuri/Local)",
    nameBn: "দেশি পেঁয়াজ (তাহেরপুরী)",
    category: "spice",
    defaultUnit: "kg",
    image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80",
    supportedGrades: ["Grade A (Cured Dry Tight Skin)", "Grade B (Medium Bulb)", "Grade C (Small/Commercial)"],
    damReferenceCode: "DAM-SPICE-002",
  },
];

// Helper to calculate relative ISO offsets
const now = new Date();
const getOffsetTime = (offsetMinutes: number) =>
  new Date(now.getTime() + offsetMinutes * 60 * 1000).toISOString();
const getOffsetDays = (offsetDays: number) => {
  const d = new Date(now.getTime() + offsetDays * 24 * 60 * 60 * 1000);
  return d.toISOString().split("T")[0];
};

export class AgriDataStore {
  public users: Map<string, User> = new Map();
  public farmerProfiles: Map<string, FarmerProfile> = new Map();
  public businessProfiles: Map<string, BusinessProfile> = new Map();
  public marketPrices: Map<string, MarketPriceRecord> = new Map();
  public listings: Map<string, ProductListing> = new Map();
  public auctions: Map<string, Auction> = new Map();
  public bids: Map<string, Bid[]> = new Map();
  public procurementRequests: Map<string, ProcurementRequest> = new Map();
  public supplierOffers: Map<string, SupplierOffer[]> = new Map();
  public directContracts: Map<string, DirectContract> = new Map();
  public exportRfqs: Map<string, ExportRFQ> = new Map();
  public exportQuotations: Map<string, ExportQuotation[]> = new Map();
  public orders: Map<string, Order> = new Map();
  public oversupplyAlerts: Map<string, OversupplyAlert> = new Map();
  public auditLogs: AuditLog[] = [];

  public currentUserId: string = "usr_farmer_rafiq";
  private listeners: Set<EventListener> = new Set();

  constructor() {
    this.seed();
  }

  public subscribe(listener: EventListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public broadcast(event: DatabaseEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in SSE listener:", err);
      }
    });
  }

  public logAudit(
    userId: string | undefined,
    userName: string | undefined,
    action: string,
    entityType: string,
    entityId: string | undefined,
    details: string
  ) {
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      userName,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) this.auditLogs.pop();
    return log;
  }

  private seed() {
    // 1. Users
    const initialUsers: User[] = [
      {
        id: "usr_farmer_rafiq",
        name: "Md. Rafiqul Islam",
        nameBn: "মোঃ রফিকুল ইসলাম",
        email: "rafiqul.farmer@agrisphere.bd",
        phone: "+880 1711-234567",
        role: "farmer",
        district: "Bogura",
        upazila: "Sherpur",
        verified: true,
        avatarUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80",
        createdAt: "2026-10-01T08:00:00Z",
      },
      {
        id: "usr_buyer_mokbul",
        name: "Haji Mokbul Enterprise",
        nameBn: "হাজী মোকবুল এন্টারপ্রাইজ",
        email: "mokbul.arat@agrisphere.bd",
        phone: "+880 1819-345678",
        role: "buyer",
        district: "Dhaka",
        upazila: "Tejgaon / Karwan Bazar",
        companyName: "Mokbul Agro Wholesalers & Commission Agent",
        verified: true,
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        createdAt: "2026-10-05T09:30:00Z",
      },
      {
        id: "usr_factory_pran",
        name: "ACI & Pran Foods Agro-Hub",
        nameBn: "এসিআই ও প্রাণ এগ্রো প্রসেসিং হাব",
        email: "procurement@pranfoods.bd",
        phone: "+880 1912-789012",
        role: "factory",
        district: "Gazipur",
        upazila: "Board Bazar",
        companyName: "Apex Agro Foods & Milling Corporation",
        verified: true,
        avatarUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80",
        createdAt: "2026-10-10T11:00:00Z",
      },
      {
        id: "usr_retailer_shwapno",
        name: "Shwapno Direct Sourcing Hub",
        nameBn: "স্বপ্ন সুপারশপ ক্রয় কেন্দ্র",
        email: "sourcing@shwapno.bd",
        phone: "+880 1714-556677",
        role: "retailer",
        district: "Dhaka",
        upazila: "Gulshan",
        companyName: "ACI Logistics / Shwapno Retailers",
        verified: true,
        avatarUrl: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=200&q=80",
        createdAt: "2026-10-12T14:20:00Z",
      },
      {
        id: "usr_exporter_bengal",
        name: "Bengal Fresh Agro Exports Ltd.",
        nameBn: "বেঙ্গল ফ্রেশ এগ্রো এক্সপোর্টস লিঃ",
        email: "export@bengalfresh.com",
        phone: "+880 1713-998877",
        role: "exporter",
        district: "Chattogram",
        upazila: "Agrabad",
        companyName: "Bengal Fresh Agricultural Logistics & Export Corp",
        verified: true,
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        createdAt: "2026-10-15T16:00:00Z",
      },
      {
        id: "usr_importer_gulf",
        name: "Al-Madina Fresh Fruits & Veg LLC",
        nameBn: "আল-মদিনা ফ্রেশ ফ্রুটস অ্যান্ড ভেজিটেবলস (দুবাই)",
        email: "import@almadinafruits.ae",
        phone: "+971 4 298 7654",
        role: "importer",
        district: "Dhaka",
        companyName: "Al-Madina General Trading LLC (Dubai, UAE)",
        verified: true,
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        createdAt: "2026-10-18T10:00:00Z",
      },
      {
        id: "usr_admin_platform",
        name: "AgriSphere System Administrator",
        nameBn: "ঢাকা সেন্ট্রাল প্ল্যাটফর্ম অ্যাডমিনিস্ট্রেটর",
        email: "admin@agrisphere.bd",
        phone: "+880 1700-000001",
        role: "admin",
        district: "Dhaka",
        upazila: "Khamarbari / Farmgate",
        companyName: "AgriSphere MarketLink AI Authority & DAM Observer",
        verified: true,
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
        createdAt: "2026-09-01T00:00:00Z",
      },
    ];
    initialUsers.forEach((u) => this.users.set(u.id, u));

    // 2. Market Prices (DAM)
    const todayStr = getOffsetDays(0);
    const initialPrices: MarketPriceRecord[] = [
      {
        id: "prc_chilli_bogura_today",
        cropId: "green_chilli",
        cropNameEn: "Green Chilli",
        cropNameBn: "কাঁচা মরিচ",
        marketId: "mkt_mahasthangarh",
        marketNameEn: "Mahasthangarh Agri Hub",
        marketNameBn: "মহাস্থানগড় সবজি মোকাম",
        district: "Bogura",
        wholesalePrice: 130,
        retailPrice: 155,
        minPrice: 125,
        maxPrice: 160,
        priceUnit: "BDT/kg",
        date: todayStr,
        priceSource: "DAM",
        verificationStatus: "verified",
        dataFreshnessDays: 0,
        isDemo: false,
      },
      {
        id: "prc_chilli_dhaka_today",
        cropId: "green_chilli",
        cropNameEn: "Green Chilli",
        cropNameBn: "কাঁচা মরিচ",
        marketId: "mkt_karwan_bazar",
        marketNameEn: "Karwan Bazar Wholesale Arat",
        marketNameBn: "কারওয়ান বাজার পাইকারি আড়ত",
        district: "Dhaka",
        wholesalePrice: 165,
        retailPrice: 195,
        minPrice: 155,
        maxPrice: 200,
        priceUnit: "BDT/kg",
        date: todayStr,
        priceSource: "DAM",
        verificationStatus: "verified",
        dataFreshnessDays: 0,
        isDemo: false,
      },
      {
        id: "prc_cuc_bogura_today",
        cropId: "cucumber",
        cropNameEn: "Cucumber",
        cropNameBn: "শসা",
        marketId: "mkt_mahasthangarh",
        marketNameEn: "Mahasthangarh Agri Hub",
        marketNameBn: "মহাস্থানগড় সবজি মোকাম",
        district: "Bogura",
        wholesalePrice: 28,
        retailPrice: 38,
        minPrice: 25,
        maxPrice: 40,
        priceUnit: "BDT/kg",
        date: todayStr,
        priceSource: "DAM",
        verificationStatus: "verified",
        dataFreshnessDays: 0,
        isDemo: false,
      },
      {
        id: "prc_cuc_dhaka_today",
        cropId: "cucumber",
        cropNameEn: "Cucumber",
        cropNameBn: "শসা",
        marketId: "mkt_karwan_bazar",
        marketNameEn: "Karwan Bazar Wholesale Arat",
        marketNameBn: "কারওয়ান বাজার পাইকারি আড়ত",
        district: "Dhaka",
        wholesalePrice: 42,
        retailPrice: 55,
        minPrice: 38,
        maxPrice: 60,
        priceUnit: "BDT/kg",
        date: todayStr,
        priceSource: "DAM",
        verificationStatus: "verified",
        dataFreshnessDays: 0,
        isDemo: false,
      },
      {
        id: "prc_pmp_bogura_today",
        cropId: "sweet_pumpkin",
        cropNameEn: "Sweet Pumpkin",
        cropNameBn: "মিষ্টি কুমড়া",
        marketId: "mkt_mahasthangarh",
        marketNameEn: "Mahasthangarh Agri Hub",
        marketNameBn: "মহাস্থানগড় সবজি মোকাম",
        district: "Bogura",
        wholesalePrice: 22,
        retailPrice: 32,
        minPrice: 20,
        maxPrice: 35,
        priceUnit: "BDT/kg",
        date: todayStr,
        priceSource: "DAM",
        verificationStatus: "verified",
        dataFreshnessDays: 0,
        isDemo: false,
      },
      {
        id: "prc_pmp_dhaka_today",
        cropId: "sweet_pumpkin",
        cropNameEn: "Sweet Pumpkin",
        cropNameBn: "মিষ্টি কুমড়া",
        marketId: "mkt_karwan_bazar",
        marketNameEn: "Karwan Bazar Wholesale Arat",
        marketNameBn: "কারওয়ান বাজার পাইকারি আড়ত",
        district: "Dhaka",
        wholesalePrice: 34,
        retailPrice: 46,
        minPrice: 30,
        maxPrice: 50,
        priceUnit: "BDT/kg",
        date: todayStr,
        priceSource: "DAM",
        verificationStatus: "verified",
        dataFreshnessDays: 0,
        isDemo: false,
      },
    ];
    initialPrices.forEach((p) => this.marketPrices.set(p.id, p));

    // 3. Historical Price Records (30 Days)
    for (let i = 1; i <= 30; i++) {
      const dStr = getOffsetDays(-i);
      const sin = Math.sin(i / 4);
      this.marketPrices.set(`hist_chilli_dhaka_${i}`, {
        id: `hist_chilli_dhaka_${i}`,
        cropId: "green_chilli",
        cropNameEn: "Green Chilli",
        cropNameBn: "কাঁচা মরিচ",
        marketId: "mkt_karwan_bazar",
        marketNameEn: "Karwan Bazar Wholesale Arat",
        marketNameBn: "কারওয়ান বাজার পাইকারি আড়ত",
        district: "Dhaka",
        wholesalePrice: Math.round(165 + sin * 10 - i * 0.4),
        retailPrice: Math.round((165 + sin * 10 - i * 0.4) * 1.25),
        minPrice: 150,
        maxPrice: 180,
        priceUnit: "BDT/kg",
        date: dStr,
        priceSource: "DAM",
        verificationStatus: "verified",
        dataFreshnessDays: i,
        isDemo: false,
      });

      this.marketPrices.set(`hist_chilli_bogura_${i}`, {
        id: `hist_chilli_bogura_${i}`,
        cropId: "green_chilli",
        cropNameEn: "Green Chilli",
        cropNameBn: "কাঁচা মরিচ",
        marketId: "mkt_mahasthangarh",
        marketNameEn: "Mahasthangarh Agri Hub",
        marketNameBn: "মহাস্থানগড় সবজি মোকাম",
        district: "Bogura",
        wholesalePrice: Math.round(130 + sin * 8 - i * 0.35),
        retailPrice: Math.round((130 + sin * 8 - i * 0.35) * 1.22),
        minPrice: 120,
        maxPrice: 145,
        priceUnit: "BDT/kg",
        date: dStr,
        priceSource: "DAM",
        verificationStatus: "verified",
        dataFreshnessDays: i,
        isDemo: false,
      });
    }

    // 4. Product Listings & Live Auctions
    const list1: ProductListing = {
      id: "list_chilli_rafiq",
      farmerId: "usr_farmer_rafiq",
      farmerName: "Md. Rafiqul Islam",
      farmerPhone: "+880 1711-234567",
      cropId: "green_chilli",
      cropNameEn: "Green Chilli",
      cropNameBn: "কাঁচা মরিচ",
      variety: "Bindu Hot Pepper",
      quantity: 1800,
      unit: "kg",
      grade: "Grade A",
      district: "Bogura",
      upazila: "Sherpur",
      startingPrice: 125,
      expectedPrice: 145,
      privateReservePrice: 135,
      isAuction: true,
      auctionId: "auc_chilli_live_01",
      status: "in_auction",
      images: ["https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80"],
      harvestDate: todayStr,
      description: "Freshly harvested Grade A Bindu green chillies from Bogura model farm.",
      isDemo: true,
      createdAt: getOffsetTime(-45),
    };
    this.listings.set(list1.id, list1);

    const auc1: Auction = {
      id: "auc_chilli_live_01",
      listingId: list1.id,
      farmerId: list1.farmerId,
      farmerName: list1.farmerName,
      cropNameEn: "Green Chilli",
      cropNameBn: "কাঁচা মরিচ",
      quantity: 1800,
      unit: "kg",
      grade: "Grade A",
      district: "Bogura",
      startingPrice: 125,
      minIncrement: 2,
      reservePrice: 135,
      currentHighestBid: 141,
      currentHighestBidderId: "usr_buyer_mokbul",
      currentHighestBidderName: "Haji Mokbul Enterprise",
      status: "live",
      startTime: getOffsetTime(-30),
      endTime: getOffsetTime(28),
      antiSnipeWindowSeconds: 120,
      autoExtendTimeSeconds: 120,
      totalBids: 5,
      isDemo: true,
      createdAt: getOffsetTime(-30),
    };
    this.auctions.set(auc1.id, auc1);

    this.bids.set(auc1.id, [
      {
        id: "bid_c5",
        auctionId: auc1.id,
        bidderId: "usr_buyer_mokbul",
        bidderName: "Haji Mokbul Enterprise",
        bidderRole: "buyer",
        bidderCompany: "Mokbul Agro Wholesalers",
        amount: 141,
        timestamp: getOffsetTime(-3),
        isAnonymous: false,
        status: "active",
      },
      {
        id: "bid_c4",
        auctionId: auc1.id,
        bidderId: "usr_retailer_shwapno",
        bidderName: "Shwapno Direct Sourcing Hub",
        bidderRole: "retailer",
        bidderCompany: "Shwapno",
        amount: 138,
        timestamp: getOffsetTime(-9),
        isAnonymous: false,
        status: "outbid",
      },
    ]);

    // 5. Procurement Requests
    const proc1: ProcurementRequest = {
      id: "rfp_mill_tomato_01",
      buyerId: "usr_factory_pran",
      buyerName: "ACI & Pran Foods Agro-Hub",
      buyerRole: "factory",
      companyName: "Apex Agro Foods & Milling Corporation",
      cropId: "tomato",
      cropNameEn: "Tomato",
      cropNameBn: "টমেটো",
      requiredQuantity: 15000,
      unit: "kg",
      qualityGrade: "Grade A/B Processing",
      maxBudgetPerUnit: 38,
      isBudgetPrivate: false,
      deliveryLocation: "Pran Agro-Industrial Park, Gazipur",
      deliveryDistrict: "Gazipur",
      requiredDeliveryDate: getOffsetDays(5),
      allowSplitFulfillment: true,
      fulfilledQuantity: 4000,
      status: "open",
      notes: "Requires firm pulp, minimal damage, crate packed.",
      isDemo: true,
      createdAt: getOffsetTime(-300),
    };
    this.procurementRequests.set(proc1.id, proc1);

    // 6. Oversupply Alerts
    this.oversupplyAlerts.set("alert_bogura_chilli", {
      id: "alert_bogura_chilli",
      district: "Bogura",
      districtBn: "বগুড়া",
      cropNameEn: "Green Chilli",
      cropNameBn: "কাঁচা মরিচ",
      listedSupplyTonnes: 45,
      buyerDemandTonnes: 26,
      surplusTonnes: 19,
      imbalanceRatio: 1.73,
      riskLevel: "moderate",
      suggestedActionsEn: [
        "Consider dispatching to Dhaka Karwan Bazar where prices are BDT 35/kg higher",
        "Explore forward procurement requests from Gazipur agro-processing plants",
      ],
      suggestedActionsBn: [
        "ঢাকার কারওয়ান বাজারে পাঠানোর কথা বিবেচনা করুন, যেখানে দাম কেজিপ্রতি ৩৫ টাকা বেশি",
        "গাজীপুরের এগ্রো প্রসেসিং কারখানার ক্রয়ের চাহিদা যাচাই করুন",
      ],
      updatedAt: new Date().toISOString(),
    });
  }
}

export const dataStore = new AgriDataStore();

