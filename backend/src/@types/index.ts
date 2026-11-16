export type UserRole =
  | "farmer"
  | "buyer"
  | "factory"
  | "retailer"
  | "exporter"
  | "importer"
  | "admin";

export interface User {
  id: string;
  name: string;
  nameBn?: string;
  email: string;
  phone: string;
  role: UserRole;
  district: string;
  upazila?: string;
  verified: boolean;
  avatarUrl?: string;
  companyName?: string;
  createdAt: string;
}

export interface FarmerProfile {
  userId: string;
  farmName: string;
  totalAcreage: number;
  primaryCrops: string[];
  nidVerified: boolean;
  division: string;
  district: string;
  upazila: string;
  village?: string;
}

export interface BusinessProfile {
  userId: string;
  companyName: string;
  businessType: "mill" | "wholesaler" | "exporter" | "retailer" | "importer";
  tradeLicenseNumber?: string;
  taxId?: string;
  country: string;
  district: string;
  procurementCapacityMonthlyTonnes?: number;
  verified: boolean;
}

export interface Crop {
  id: string;
  nameEn: string;
  nameBn: string;
  category: "vegetable" | "spice" | "grain" | "fruit" | "cash_crop";
  defaultUnit: "kg" | "mon" | "tonne";
  image: string;
  supportedGrades: string[];
  damReferenceCode?: string;
}

export interface District {
  id: string;
  nameEn: string;
  nameBn: string;
  division: string;
  lat: number;
  lng: number;
}

export interface Market {
  id: string;
  nameEn: string;
  nameBn: string;
  district: string;
  division: string;
  marketType: "wholesale" | "retail" | "assembly" | "terminal";
  lat: number;
  lng: number;
}

export interface MarketPriceRecord {
  id: string;
  cropId: string;
  cropNameEn: string;
  cropNameBn: string;
  marketId: string;
  marketNameEn: string;
  marketNameBn: string;
  district: string;
  wholesalePrice: number;
  retailPrice: number;
  minPrice: number;
  maxPrice: number;
  priceUnit: "BDT/kg" | "BDT/mon";
  date: string;
  priceSource: "DAM" | "AgriPriceBD" | "Platform" | "Manual" | "Demo";
  verificationStatus: "verified" | "unverified" | "disputed";
  dataFreshnessDays: number;
  isDemo?: boolean;
}

export interface ProductListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  cropId: string;
  cropNameEn: string;
  cropNameBn: string;
  variety?: string;
  quantity: number;
  unit: "kg" | "mon" | "tonne";
  grade: "Grade A" | "Grade B" | "Standard";
  district: string;
  upazila: string;
  startingPrice: number;
  expectedPrice: number;
  privateReservePrice: number;
  isAuction: boolean;
  auctionId?: string;
  status: "active" | "in_auction" | "sold" | "cancelled";
  images: string[];
  harvestDate: string;
  description?: string;
  isDemo: boolean;
  createdAt: string;
}

export interface Auction {
  id: string;
  listingId: string;
  farmerId: string;
  farmerName: string;
  cropNameEn: string;
  cropNameBn: string;
  quantity: number;
  unit: "kg" | "mon" | "tonne";
  grade: string;
  district: string;
  startingPrice: number;
  minIncrement: number;
  reservePrice: number;
  currentHighestBid: number;
  currentHighestBidderId?: string;
  currentHighestBidderName?: string;
  status: "pending" | "live" | "closed" | "accepted" | "rejected";
  startTime: string;
  endTime: string;
  antiSnipeWindowSeconds: number;
  autoExtendTimeSeconds: number;
  totalBids: number;
  acceptedBidId?: string;
  isDemo: boolean;
  createdAt: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderName: string;
  bidderRole: UserRole;
  bidderCompany?: string;
  amount: number;
  timestamp: string;
  isAnonymous: boolean;
  status: "active" | "outbid" | "accepted" | "rejected";
}

export interface ProcurementRequest {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerRole: UserRole;
  companyName: string;
  cropId: string;
  cropNameEn: string;
  cropNameBn: string;
  requiredQuantity: number;
  unit: "kg" | "mon" | "tonne";
  qualityGrade: string;
  maxBudgetPerUnit: number;
  isBudgetPrivate: boolean;
  deliveryLocation: string;
  deliveryDistrict: string;
  requiredDeliveryDate: string;
  allowSplitFulfillment: boolean;
  fulfilledQuantity: number;
  status: "open" | "partially_fulfilled" | "fulfilled" | "closed";
  notes?: string;
  isDemo: boolean;
  createdAt: string;
}

export interface SupplierOffer {
  id: string;
  requestId: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerDistrict: string;
  offeredQuantity: number;
  unit: "kg" | "mon" | "tonne";
  pricePerUnit: number;
  qualityGrade: string;
  estimatedDeliveryDate: string;
  notes?: string;
  status: "pending" | "accepted" | "rejected";
  isDemo: boolean;
  createdAt: string;
}

export interface DirectContract {
  id: string;
  initiatorId: string;
  initiatorName: string;
  initiatorRole: UserRole;
  recipientId: string;
  recipientName: string;
  cropNameEn: string;
  cropNameBn: string;
  quantity: number;
  unit: "kg" | "mon" | "tonne";
  agreedPrice: number;
  priceType: "fixed" | "negotiable";
  paymentTerms: string;
  deliverySchedule: string;
  deliveryLocation: string;
  expirationDate: string;
  status: "draft" | "proposed" | "accepted" | "rejected" | "negotiating";
  notes?: string;
  isDemo: boolean;
  createdAt: string;
}

export interface ExportRFQ {
  id: string;
  importerId: string;
  importerName: string;
  companyName: string;
  country: string;
  cropNameEn: string;
  cropNameBn: string;
  targetQuantityTonnes: number;
  requiredGrade: string;
  packagingType: string;
  destinationPort: string;
  targetDeliveryMonth: string;
  certificationsRequired: string[];
  maxTargetFobPriceUsd?: number;
  status: "open" | "quoted" | "closed";
  notes?: string;
  isDemo: boolean;
  createdAt: string;
}

export interface ExportQuotation {
  id: string;
  rfqId: string;
  exporterId: string;
  exporterName: string;
  companyName: string;
  fobPriceUsd: number;
  leadTimeDays: number;
  packagingOffered: string;
  certificationsProvided: string[];
  status: "submitted" | "under_review" | "accepted" | "rejected";
  notes?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  referenceType: "auction" | "procurement" | "direct_contract";
  referenceId: string;
  sellerId: string;
  sellerName: string;
  sellerPhone?: string;
  buyerId: string;
  buyerName: string;
  buyerPhone?: string;
  cropNameEn: string;
  cropNameBn: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  deliveryDistrict: string;
  status: "confirmed" | "in_transit" | "delivered" | "completed" | "cancelled";
  createdAt: string;
}

export interface MarketRecommendation {
  marketId: string;
  marketName: string;
  marketNameBn: string;
  district: string;
  districtBn: string;
  distanceKm: number;
  marketPricePerKg: number;
  grossRevenue: number;
  transportCost: number;
  otherCosts: number;
  netEstimatedReturn: number;
  netMarginPercentage: number;
  confidenceScore: number;
  dataFreshnessDays: number;
  priceSource: string;
  aiRationale: string;
  aiRationaleBn: string;
}

export interface BuyerMatchResult {
  matchId: string;
  procurementId: string;
  buyerName: string;
  companyName: string;
  buyerDistrict: string;
  cropNameEn: string;
  cropNameBn: string;
  requiredQuantity: number;
  availableQuantity: number;
  unit: string;
  maxBudget: number;
  farmerPrice: number;
  quantityScore: number;
  locationScore: number;
  priceScore: number;
  timingScore: number;
  overallScore: number;
  canCombineWithOthers: boolean;
  matchBreakdown: string[];
  matchBreakdownBn: string[];
}

export interface OversupplyAlert {
  id: string;
  district: string;
  districtBn: string;
  cropNameEn: string;
  cropNameBn: string;
  listedSupplyTonnes: number;
  buyerDemandTonnes: number;
  surplusTonnes: number;
  imbalanceRatio: number;
  riskLevel: "low" | "moderate" | "high";
  suggestedActionsEn: string[];
  suggestedActionsBn: string[];
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

