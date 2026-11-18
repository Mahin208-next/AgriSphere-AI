import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { CROPS_DATA } from "@/lib/data/crops";

function getTimeGreeting(isEnglish: boolean): string {
  const now = new Date();
  // Bangladesh is UTC+6
  const bdHour = (now.getUTCHours() + 6) % 24;
  if (isEnglish) {
    if (bdHour >= 5 && bdHour < 12) return "Good morning!";
    if (bdHour >= 12 && bdHour < 17) return "Good afternoon!";
    if (bdHour >= 17 && bdHour < 21) return "Good evening!";
    return "Hello!";
  } else {
    if (bdHour >= 5 && bdHour < 12) return "শুভ সকাল!";
    if (bdHour >= 12 && bdHour < 17) return "শুভ দুপুর!";
    if (bdHour >= 17 && bdHour < 21) return "শুভ সন্ধ্যা!";
    return "শুভ রাত!";
  }
}

export async function POST(req: Request) {
  const db = getDb();
  try {
    const body = await req.json();
    const query = (body.query || "").trim();
    const isLoggedIn = Boolean(body.isLoggedIn);
    const userRole = body.userRole || null;
    const userName = body.userName || "";

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const lowerQuery = query.toLowerCase();
    const hasBanglaChars = /[অ-হড়-য়০-৯]/.test(query);
    const isEnglishQuery = !hasBanglaChars;
    const greeting = getTimeGreeting(isEnglishQuery);

    // 1. Live Data Sources from the Website Database
    const allAuctions = Array.from(db.auctions.values());
    const nowTime = new Date();
    allAuctions.forEach((a) => {
      if (nowTime >= new Date(a.endTime) && a.isDemo) {
        a.status = "live";
        a.endTime = new Date(nowTime.getTime() + 120 * 60 * 1000).toISOString();
      }
    });
    const liveAuctions = allAuctions.filter((a) => a.status === "live");
    const allListings = Array.from(db.listings.values());
    const allPrices = Array.from(db.marketPrices.values()).filter((p) => p.dataFreshnessDays === 0);
    const allProcurements = Array.from(db.procurementRequests.values()).filter((p) => p.status === "open");
    const allExportRfqs = Array.from(db.exportRfqs.values()).filter((e) => e.status === "open");

    let reply = "";
    let citations: string[] = [];
    let detectedIntent = "general";

    // -------------------------------------------------------------
    // INTENT 1: LIVE AUCTIONS & BIDDING (লাইভ নিলাম / অকশন / বিড)
    // -------------------------------------------------------------
    if (
      lowerQuery.includes("নিলাম") ||
      lowerQuery.includes("auction") ||
      lowerQuery.includes("auctions") ||
      lowerQuery.includes("bid") ||
      lowerQuery.includes("bids") ||
      lowerQuery.includes("bidding") ||
      lowerQuery.includes("ডাক") ||
      lowerQuery.includes("লাইভ") ||
      lowerQuery.includes("বোল")
    ) {
      detectedIntent = "live_auctions";
      citations.push("KrishiSetu AI Live Auction Engine (/auctions)");

      if (isEnglishQuery) {
        reply = `${greeting} Here are the active live auctions currently on AgriSphere:\n\n`;
        if (liveAuctions.length > 0) {
          liveAuctions.forEach((auc, idx) => {
            const currentPrice = auc.currentHighestBid > 0 ? auc.currentHighestBid : auc.startingPrice;
            reply += `${idx + 1}. ${auc.cropNameEn} (${auc.cropNameBn})\n` +
              `• Quantity: ${auc.quantity.toLocaleString()} ${auc.unit} (${auc.grade})\n` +
              `• Location: ${auc.district} (Farmer: ${auc.farmerName})\n` +
              `• Current Highest Bid: BDT ${currentPrice}/${auc.unit} ${auc.currentHighestBidderName ? `(Leader: ${auc.currentHighestBidderName})` : "(Starting Price)"}\n` +
              `• Total Bids: ${auc.totalBids} bids placed\n` +
              `• Anti-Snipe Rule: Active (bidding in the final 2 minutes adds +2 minutes)\n\n`;
          });
          reply += `You can watch live auctions directly at /auctions. Registered buyers can place verified bids in real-time.`;
        } else {
          reply += `There are currently no active live auctions. You can check upcoming lots or list your harvest at /auctions.`;
        }
      } else {
        reply = `${greeting} এগ্রিস্ফিয়ার প্ল্যাটফর্মে বর্তমানে চলমান লাইভ নিলাম তথ্য:\n\n`;
        if (liveAuctions.length > 0) {
          liveAuctions.forEach((auc, idx) => {
            const currentPrice = auc.currentHighestBid > 0 ? auc.currentHighestBid : auc.startingPrice;
            reply += `${idx + 1}. ${auc.cropNameBn} (${auc.cropNameEn})\n` +
              `• পরিমাণ: ${auc.quantity.toLocaleString()} ${auc.unit} (${auc.grade})\n` +
              `• অবস্থান: ${auc.district} (চাষি: ${auc.farmerName})\n` +
              `• বর্তমান সর্বোচ্চ ডাক: ৳${currentPrice}/${auc.unit} ${auc.currentHighestBidderName ? `(শীর্ষ বিডার: ${auc.currentHighestBidderName})` : "(প্রারম্ভিক দর)"}\n` +
              `• মোট বিড সংখ্যা: ${auc.totalBids}টি বিড পড়েছে\n` +
              `• অ্যান্টি-স্নাইপ নিয়ম: সক্রিয় (শেষ ২ মিনিটে বিড হলে ঘড়ি আরও ২ মিনিট বাড়ে)\n\n`;
          });
          reply += `সরাসরি অংশ নিতে /auctions পেজে যান। ক্রেতা হিসেবে লগইন করে আপনি সরাসরি ডাক দিতে পারবেন।`;
        } else {
          reply += `বর্তমানে কোনো লাইভ নিলাম চলমান নেই। নতুন ফসল নিলামে দেখতে বা তুলতে /auctions পেজ পরিদর্শন করুন।`;
        }
      }
    }

    // -------------------------------------------------------------
    // INTENT 2: MARKETPLACE & LISTINGS (মার্কেটপ্লেস / ফসল বিক্রি / পণ্য)
    // -------------------------------------------------------------
    else if (
      lowerQuery.includes("মার্কেটপ্লেস") ||
      lowerQuery.includes("marketplace") ||
      lowerQuery.includes("লিস্টিং") ||
      lowerQuery.includes("listing") ||
      lowerQuery.includes("listings") ||
      lowerQuery.includes("মজুদ") ||
      lowerQuery.includes("পণ্য") ||
      lowerQuery.includes("ফসল আছে") ||
      lowerQuery.includes("বিক্রির জন্য") ||
      lowerQuery.includes("stock") ||
      lowerQuery.includes("available")
    ) {
      detectedIntent = "marketplace_listings";
      citations.push("AgriSphere Verified Crop Directory (/marketplace)");

      if (isEnglishQuery) {
        reply = `${greeting} Here are current farm listings on the AgriSphere Marketplace:\n\n`;
        allListings.slice(0, 4).forEach((item, idx) => {
          reply += `${idx + 1}. ${item.cropNameEn} (${item.cropNameBn})\n` +
            `• Available Volume: ${item.quantity.toLocaleString()} ${item.unit} (${item.grade})\n` +
            `• District: ${item.district}, ${item.upazila}\n` +
            `• Farmer/Seller: ${item.farmerName} ${isLoggedIn ? `(Phone: ${item.farmerPhone})` : "(Login to view direct contact)"}\n` +
            `• Target Price: BDT ${item.expectedPrice || item.startingPrice}/${item.unit}\n\n`;
        });
        reply += `Explore all verified lots with inspection photos at /marketplace.`;
      } else {
        reply = `${greeting} এগ্রিস্ফিয়ার মার্কেটপ্লেসে সরাসরি বিক্রির জন্য তালিকাভুক্ত ফসলসমূহ:\n\n`;
        allListings.slice(0, 4).forEach((item, idx) => {
          reply += `${idx + 1}. ${item.cropNameBn} (${item.cropNameEn})\n` +
            `• মজুদ পরিমাণ: ${item.quantity.toLocaleString()} ${item.unit} (${item.grade})\n` +
            `• উৎপাদন এলাকা: ${item.district}, ${item.upazila}\n` +
            `• খামারি: ${item.farmerName} ${isLoggedIn ? `(মোবাইল: ${item.farmerPhone})` : "(সরাসরি ফোন দেখতে লগইন করুন)"}\n` +
            `• প্রত্যাশিত দর: ৳${item.expectedPrice || item.startingPrice}/${item.unit}\n\n`;
        });
        reply += `ছবি ও মান যাচাইসহ সম্পূর্ণ ফসল তালিকা দেখতে /marketplace পেজ ভিজিট করুন।`;
      }
    }

    // -------------------------------------------------------------
    // INTENT 3: REAL-TIME CROP PRICES & DAM BULLETINS (দাম / দর / Price)
    // -------------------------------------------------------------
    else if (
      lowerQuery.includes("দাম") ||
      lowerQuery.includes("price") ||
      lowerQuery.includes("prices") ||
      lowerQuery.includes("rate") ||
      lowerQuery.includes("rates") ||
      lowerQuery.includes("দর") ||
      lowerQuery.includes("টাকা") ||
      lowerQuery.includes("বাজার দর") ||
      lowerQuery.includes("কত চলছে")
    ) {
      detectedIntent = "price_query";
      citations.push("Department of Agricultural Marketing (DAMBD) Benchmark Index");
      citations.push("AgriSphere Daily Wholesale Price Feed (/market-intelligence)");

      let targetCrop = "green_chilli";
      let matchedCropObj = CROPS_DATA.find((c) =>
        lowerQuery.includes(c.nameBn) ||
        lowerQuery.includes(c.nameEn.toLowerCase()) ||
        lowerQuery.includes(c.id)
      );

      if (!matchedCropObj) {
        if (lowerQuery.includes("মরিচ") || lowerQuery.includes("chilli")) targetCrop = "green_chilli";
        else if (lowerQuery.includes("শসা") || lowerQuery.includes("cucumber")) targetCrop = "cucumber";
        else if (lowerQuery.includes("কুমড়া") || lowerQuery.includes("pumpkin")) targetCrop = "sweet_pumpkin";
        else if (lowerQuery.includes("টমেটো") || lowerQuery.includes("tomato")) targetCrop = "tomato";
        else if (lowerQuery.includes("আলু") || lowerQuery.includes("potato")) targetCrop = "potato";
        else if (lowerQuery.includes("পেঁয়াজ") || lowerQuery.includes("onion")) targetCrop = "onion";
        matchedCropObj = CROPS_DATA.find((c) => c.id === targetCrop) || CROPS_DATA[0];
      } else {
        targetCrop = matchedCropObj.id;
      }

      const matchingPrices = allPrices.filter((p) => p.cropId === targetCrop);

      if (isEnglishQuery) {
        reply = `${greeting} Today's Official Wholesale & Retail Rates for ${matchedCropObj.nameEn} (${matchedCropObj.nameBn}):\n\n`;
        if (matchingPrices.length > 0) {
          matchingPrices.forEach((prc) => {
            reply += `• ${prc.marketNameEn} (${prc.district}): Wholesale BDT ${prc.wholesalePrice}/kg | Retail BDT ${prc.retailPrice}/kg\n`;
          });

          const dhakaP = matchingPrices.find((p) => p.district === "Dhaka");
          const boguraP = matchingPrices.find((p) => p.district === "Bogura");
          if (dhakaP && boguraP) {
            const spread = dhakaP.wholesalePrice - boguraP.wholesalePrice;
            reply += `\nMarket Insight: Dhaka wholesale terminal is trading BDT ${spread}/kg higher than Bogura origin. For bulk dispatches (>1 Tonne), transport costs are approx BDT 4-6/kg, offering positive net profit.\n`;
          }
        } else {
          reply += `Today's average wholesale range across major districts is BDT 35-145/kg depending on grade.\n`;
        }
        reply += `\nCheck 30-day interactive price charts at /market-intelligence.`;
      } else {
        reply = `${greeting} আজকের ${matchedCropObj.nameBn} (${matchedCropObj.nameEn}) যাচাইকৃত পাইকারি ও খুচরা বাজার দর:\n\n`;
        if (matchingPrices.length > 0) {
          matchingPrices.forEach((prc) => {
            reply += `• ${prc.marketNameBn || prc.marketNameEn} (${prc.district}): পাইকারি ৳${prc.wholesalePrice}/কেজি | খুচরা ৳${prc.retailPrice}/কেজি\n`;
          });

          const dhakaP = matchingPrices.find((p) => p.district === "Dhaka");
          const boguraP = matchingPrices.find((p) => p.district === "Bogura");
          if (dhakaP && boguraP) {
            const spread = dhakaP.wholesalePrice - boguraP.wholesalePrice;
            reply += `\nবাজার দর অন্তর্দৃষ্টি: স্থানীয় মোকামের চেয়ে ঢাকায় পাইকারি দর কেজিপ্রতি ৳${spread} বেশি। ১ টনের বেশি ফসল পাঠালে পরিবহন খরচ (কেজিতে প্রায় ৳৪-৬) বাদ দিয়েও বাড়তি লাভ থাকবে।\n`;
          }
        } else {
          reply += `আজকের গড় পাইকারি দর গ্রেড ও মোকামভেদে কেজিপ্রতি ৳৩৫ থেকে ৳১৪৫ পর্যন্ত চলছে।\n`;
        }
        reply += `\n৩০ দিনের বিস্তারিত চার্ট ও লাভ ক্যালকুলেটর দেখতে /market-intelligence পেজ ভিজিট করুন।`;
      }
    }

    // -------------------------------------------------------------
    // INTENT 4: BUYER & FACTORY DEMAND (কারখানা / মিল / buyer / চাহিদা)
    // -------------------------------------------------------------
    else if (
      lowerQuery.includes("buyer") ||
      lowerQuery.includes("buyers") ||
      lowerQuery.includes("ক্রেতা") ||
      lowerQuery.includes("factory") ||
      lowerQuery.includes("factories") ||
      lowerQuery.includes("কারখানা") ||
      lowerQuery.includes("মিল") ||
      lowerQuery.includes("mill") ||
      lowerQuery.includes("mills") ||
      lowerQuery.includes("চাহিদা") ||
      lowerQuery.includes("demand") ||
      lowerQuery.includes("demands") ||
      lowerQuery.includes("procur") ||
      lowerQuery.includes("procuring") ||
      lowerQuery.includes("procurement") ||
      lowerQuery.includes("কিনবে") ||
      lowerQuery.includes("কিনতে") ||
      lowerQuery.includes("buying") ||
      lowerQuery.includes("company") ||
      lowerQuery.includes("companies") ||
      lowerQuery.includes("কোম্পানি") ||
      lowerQuery.includes("প্রাণ") ||
      lowerQuery.includes("pran") ||
      lowerQuery.includes("স্বপ্ন") ||
      lowerQuery.includes("shwapno")
    ) {
      detectedIntent = "procurement_demands";
      citations.push("AgriSphere Industrial Procurement Ledger (/procurement)");

      if (isEnglishQuery) {
        reply = `${greeting} Verified Agro-Industrial & Retail Procurement Demands on AgriSphere:\n\n`;
        allProcurements.slice(0, 3).forEach((req, idx) => {
          reply += `${idx + 1}. ${req.companyName || req.buyerName} (${req.buyerRole.toUpperCase()})\n` +
            `• Required Crop: ${req.cropNameEn} (${req.cropNameBn})\n` +
            `• Target Quantity: ${req.requiredQuantity.toLocaleString()} ${req.unit} (${req.qualityGrade})\n` +
            `• Budget: ${req.isBudgetPrivate ? "Negotiable (Private)" : `BDT ${req.maxBudgetPerUnit}/${req.unit}`}\n` +
            `• Delivery Point: ${req.deliveryLocation}\n` +
            `• Split Supply: ${req.allowSplitFulfillment ? "Yes (Multiple farmers can supply)" : "Single Lot"}\n\n`;
        });
        reply += `Logged-in farmers can submit direct reverse supply offers at /procurement.`;
      } else {
        reply = `${greeting} এগ্রিস্ফিয়ার প্ল্যাটফর্মে সক্রিয় প্রধান শিল্প ও রিটেইল ক্রেতাদের ক্রয়চাহিদা:\n\n`;
        allProcurements.slice(0, 3).forEach((req, idx) => {
          reply += `${idx + 1}. ${req.companyName || req.buyerName} (${req.buyerRole === "factory" ? "কারখানা/মিল" : "সুপারশপ/আড়ত"})\n` +
            `• প্রয়োজনীয় ফসল: ${req.cropNameBn} (${req.cropNameEn})\n` +
            `• চাহিদার পরিমাণ: ${req.requiredQuantity.toLocaleString()} ${req.unit} (${req.qualityGrade})\n` +
            `• বাজেট: ${req.isBudgetPrivate ? "দরকষাকষি সাপেক্ষ" : `৳${req.maxBudgetPerUnit}/${req.unit}`}\n` +
            `• ডেলিভারির স্থান: ${req.deliveryLocation}\n` +
            `• আংশিক সরবরাহ: ${req.allowSplitFulfillment ? "হ্যাঁ (একাধিক চাষি মিলে দিতে পারবেন)" : "না (একক লট)"}\n\n`;
        });
        reply += `কৃষক হিসেবে সরাসরি নিজের দরপ্রস্তাব জমা দিতে /procurement পেজ ব্যবহার করুন।`;
      }
    }

    // -------------------------------------------------------------
    // INTENT 5: EXPORT & INTERNATIONAL RFQ (রপ্তানি / export / বিদেশ / দুবাই)
    // -------------------------------------------------------------
    else if (
      lowerQuery.includes("রপ্তানি") ||
      lowerQuery.includes("export") ||
      lowerQuery.includes("exports") ||
      lowerQuery.includes("exporting") ||
      lowerQuery.includes("বিদেশ") ||
      lowerQuery.includes("foreign") ||
      lowerQuery.includes("দুবাই") ||
      lowerQuery.includes("dubai") ||
      lowerQuery.includes("আমদানি") ||
      lowerQuery.includes("import") ||
      lowerQuery.includes("সার্টিফিকেট") ||
      lowerQuery.includes("certificate") ||
      lowerQuery.includes("phytosanitary") ||
      lowerQuery.includes("globalgap")
    ) {
      detectedIntent = "export_gateway";
      citations.push("Department of Agricultural Extension (DAE Plant Quarantine Wing)");
      citations.push("AgriSphere Cross-Border Export Radar (/export)");

      if (isEnglishQuery) {
        reply = `${greeting} Cross-Border Agricultural Export Intelligence:\n\n` +
          `1. Active International Inquiries (Global RFQs):\n`;
        allExportRfqs.slice(0, 2).forEach((rfq) => {
          reply += `• ${rfq.companyName} (${rfq.country}): Seeking ${rfq.targetQuantityTonnes} Tonnes of ${rfq.cropNameEn} (Target FOB: USD $${rfq.maxTargetFobPriceUsd}/kg, Destination: ${rfq.destinationPort})\n`;
        });
        reply += `\n2. Mandatory Export Compliance for Bangladesh Produce:\n` +
          `• Phytosanitary Certificate: Issued by DAE Quarantine Wing\n` +
          `• MRL Lab Test: Certified pesticide residue limit testing\n` +
          `• Packaging Spec: 4.5kg–5kg ventilated export cartons for air cargo, temperature-controlled reefer containers for sea\n` +
          `• GAP/GlobalGAP: Standard for premium international retailers\n\n` +
          `View international trade contracts at /export.`;
      } else {
        reply = `${greeting} বাংলাদেশ থেকে আন্তর্জাতিক কৃষি পণ্য রপ্তানি তথ্য ও নির্দেশিকা:\n\n` +
          `১. চলমান আন্তর্জাতিক কোটেশন চাহিদা (Global RFQs):\n`;
        allExportRfqs.slice(0, 2).forEach((rfq) => {
          reply += `• ${rfq.companyName} (${rfq.country}): ${rfq.targetQuantityTonnes} টন ${rfq.cropNameBn} ক্রয় করতে চায় (লক্ষ্যমাত্রা FOB: $${rfq.maxTargetFobPriceUsd}/কেজি, গন্তব্য: ${rfq.destinationPort})\n`;
        });
        reply += `\n২. সরকারি ও আন্তর্জাতিক বাধ্যতামূলক ছাড়পত্রসমূহ:\n` +
          `• উদ্ভিদ সঙ্গনিরোধ সনদ (Phytosanitary Certificate): কৃষি সম্প্রসারণ অধিদপ্তর (DAE) থেকে সংগ্রহ করতে হয়\n` +
          `• এমআরএল ল্যাব টেস্ট (MRL Test): কীটনাশকের অবশিষ্টাংশ পরীক্ষা সনদ\n` +
          `• প্যাকেজিং মান: বিমানযোগে ৪.৫-৫ কেজি ভেন্টিলেটেড কার্টন, সমুদ্রপথে রিফার কন্টেইনার\n` +
          `• গ্লোবাল গ্যাপ (GlobalGAP): আন্তর্জাতিক রিটেইলারদের জন্য উত্তম কৃষি চর্চা সনদ\n\n` +
          `বিস্তারিত আন্তর্জাতিক চাহিদা দেখতে /export পেজ পরিদর্শন করুন।`;
      }
    }

    // -------------------------------------------------------------
    // INTENT 6: HOW TO USE / WEBSITE FEATURES / LOGIN RULES
    // -------------------------------------------------------------
    else if (
      lowerQuery.includes("কীভাবে") ||
      lowerQuery.includes("how to") ||
      lowerQuery.includes("নিয়ম") ||
      lowerQuery.includes("rules") ||
      lowerQuery.includes("login") ||
      lowerQuery.includes("লগইন") ||
      lowerQuery.includes("ভূমিকা") ||
      lowerQuery.includes("role") ||
      lowerQuery.includes("অ্যান্টি-স্নাইপ") ||
      lowerQuery.includes("anti-snipe") ||
      lowerQuery.includes("ড্যাশবোর্ড") ||
      lowerQuery.includes("ব্যবহার")
    ) {
      detectedIntent = "website_guide";
      citations.push("AgriSphere Portal User Manual & Role Architecture");

      if (isEnglishQuery) {
        reply = `${greeting} How to Navigate & Use AgriSphere AI:\n\n` +
          `• Role-Based Login Portal (/login): Select your active role from the dropdown (Farmer, Wholesaler/Buyer, Agro-Processor, Retailer, Exporter, Importer, Admin) to sign in.\n` +
          `• For Farmers: Post harvest lots for direct sale on /marketplace, launch live bidding on /auctions, or supply factories on /procurement.\n` +
          `• For Buyers & Wholesalers: Participate in real-time crop bidding on /auctions and manage transparent escrow payments.\n` +
          `• Anti-Snipe Rule: Any bid in the final 2 minutes automatically extends the auction clock by +2 minutes so everyone gets a fair chance.\n` +
          `• AI Profit Calculator: Estimate transport, loading, and commission costs at /market-intelligence to find the highest return market.\n\n` +
          `Public visitors can freely browse all listings, watch live auctions, and explore price trends!`;
      } else {
        reply = `${greeting} এগ্রিস্ফিয়ার (KrishiSetu AI) প্ল্যাটফর্ম ব্যবহারের নিয়ম ও নির্দেশিকা:\n\n` +
          `• লগইন ও ভূমিকা নির্বাচন (/login): লগইন পেজে গিয়ে ড্রপডাউন মেনু থেকে আপনার ভূমিকা (কৃষক, আড়তদার, কারখানা, সুপারশপ, রপ্তানিকারক বা অ্যাডমিন) নির্বাচন করে সহজে প্রবেশ করুন।\n` +
          `• কৃষকদের জন্য: ফসল সরাসরি বিক্রির জন্য /marketplace-এ তালিকাভুক্ত করুন, লাইভ ডাকের জন্য /auctions-এ তুলুন, বা কারখানায় বিক্রির জন্য /procurement-এ দরপ্রস্তাব দিন।\n` +
          `• ক্রেতা ও ব্যবসায়ীদের জন্য: /auctions-এ সরাসরি বিড করুন এবং ন্যায্য মূল্যে সরাসরি মাঠ থেকে পণ্য কিনুন।\n` +
          `• অ্যান্টি-স্নাইপ নিয়ম: নিলামের শেষ ২ মিনিটে কোনো নতুন বিড এলে ঘড়ির সময় স্বয়ংক্রিয়ভাবে আরও ২ মিনিট বেড়ে যায়।\n` +
          `• নিট মুনাফা ক্যালকুলেটর: পরিবহন খরচ বাদ দিয়ে কত টাকা লাভ থাকবে তা যাচাই করতে /market-intelligence-এর ক্যালকুলেটর ব্যবহার করুন।\n\n` +
          `সাধারণ দর্শনার্থী হিসেবে আপনি যেকোনো সময় সব তথ্য, লাইভ নিলাম ও বাজার দর দেখতে পারবেন।`;
      }
    }

    // -------------------------------------------------------------
    // INTENT 7: BEST MARKET RECOMMENDATIONS & PROFIT ESTIMATE (লাভ / হিসাব / ক্যালকুলেটর)
    // -------------------------------------------------------------
    else if (
      lowerQuery.includes("লাভ") ||
      lowerQuery.includes("হিসাব") ||
      lowerQuery.includes("ক্যালকুলেট") ||
      lowerQuery.includes("calculate") ||
      lowerQuery.includes("calculator") ||
      lowerQuery.includes("কোথায় বিক্রি") ||
      lowerQuery.includes("best market") ||
      lowerQuery.includes("profit") ||
      lowerQuery.includes("পরিবহন") ||
      lowerQuery.includes("খরচ") ||
      lowerQuery.includes("নেট লাভ") ||
      lowerQuery.includes("net return")
    ) {
      detectedIntent = "recommendations";
      citations.push("AgriSphere Net-Return Freight Engine (Distance & Fuel Model)");
      citations.push("DAM Wholesale Regional Price Matrix");

      // Dynamic Crop Detection
      let calcCropId = "green_chilli";
      let calcCropNameBn = "কাঁচা মরিচ";
      let calcCropNameEn = "Green Chilli";

      if (lowerQuery.includes("আলু") || lowerQuery.includes("potato")) {
        calcCropId = "potato";
        calcCropNameBn = "আলু";
        calcCropNameEn = "Potato";
      } else if (lowerQuery.includes("টমেটো") || lowerQuery.includes("tomato")) {
        calcCropId = "tomato";
        calcCropNameBn = "টমেটো";
        calcCropNameEn = "Tomato";
      } else if (lowerQuery.includes("শসা") || lowerQuery.includes("cucumber")) {
        calcCropId = "cucumber";
        calcCropNameBn = "শসা";
        calcCropNameEn = "Cucumber";
      } else if (lowerQuery.includes("কুমড়া") || lowerQuery.includes("pumpkin")) {
        calcCropId = "sweet_pumpkin";
        calcCropNameBn = "মিষ্টি কুমড়া";
        calcCropNameEn = "Sweet Pumpkin";
      } else if (lowerQuery.includes("পেঁয়াজ") || lowerQuery.includes("পেয়াজ") || lowerQuery.includes("onion")) {
        calcCropId = "onion";
        calcCropNameBn = "পেঁয়াজ";
        calcCropNameEn = "Onion";
      }

      // Dynamic Quantity Parsing
      let calcQty = 2000;
      if (lowerQuery.includes("১ টন") || lowerQuery.includes("1 ton") || lowerQuery.includes("1000")) calcQty = 1000;
      else if (lowerQuery.includes("২ টন") || lowerQuery.includes("2 ton") || lowerQuery.includes("2000")) calcQty = 2000;
      else if (lowerQuery.includes("৩ টন") || lowerQuery.includes("3 ton") || lowerQuery.includes("3000")) calcQty = 3000;
      else if (lowerQuery.includes("৫ টন") || lowerQuery.includes("5 ton") || lowerQuery.includes("5000")) calcQty = 5000;
      else if (lowerQuery.includes("৫০০") || lowerQuery.includes("500")) calcQty = 500;
      else {
        const numMatch = query.match(/(\d+)\s*(কেজি|kg|টন|ton)/i);
        if (numMatch) {
          const val = parseInt(numMatch[1], 10);
          if (numMatch[2].toLowerCase().includes("টন") || numMatch[2].toLowerCase().includes("ton")) {
            calcQty = val * 1000;
          } else {
            calcQty = val;
          }
        }
      }

      // Dynamic Origin District Detection
      let calcOrigin = "Bogura";
      if (lowerQuery.includes("রংপুর") || lowerQuery.includes("rangpur")) calcOrigin = "Rangpur";
      else if (lowerQuery.includes("দিনাজপুর") || lowerQuery.includes("dinajpur")) calcOrigin = "Dinajpur";
      else if (lowerQuery.includes("যশোর") || lowerQuery.includes("jashore")) calcOrigin = "Jashore";
      else if (lowerQuery.includes("রাজশাহী") || lowerQuery.includes("rajshahi")) calcOrigin = "Rajshahi";
      else if (lowerQuery.includes("ঢাকা") || lowerQuery.includes("dhaka")) calcOrigin = "Dhaka";
      else if (lowerQuery.includes("কুমিল্লা") || lowerQuery.includes("cumilla")) calcOrigin = "Cumilla";

      const recs = db.getBestMarketRecommendations({
        cropId: calcCropId,
        originDistrict: calcOrigin,
        quantityKg: calcQty,
      });

      const top = recs[0];
      const second = recs[1];
      const third = recs[2];

      if (isEnglishQuery) {
        reply = `${greeting} AI Net-Return & Transport Arbitrage Analysis:\n` +
          `Crop: ${calcCropNameEn} | Quantity: ${calcQty.toLocaleString()} kg | Origin: ${calcOrigin}\n\n` +
          `1st Top Net Profit Terminal: ${top.marketName} (${top.district})\n` +
          `• Highway Distance: ${top.distanceKm} km\n` +
          `• Wholesale Price: BDT ${top.marketPricePerKg}/kg\n` +
          `• Gross Sale Revenue: BDT ${top.grossRevenue.toLocaleString()}\n` +
          `• Estimated Covered Van Transport Cost: -BDT ${top.transportCost.toLocaleString()}\n` +
          `• Arat Commission & Labor: -BDT ${top.otherCosts.toLocaleString()}\n` +
          `• Net Profit in Hand: BDT ${top.netEstimatedReturn.toLocaleString()} (Net Profit Margin: ${top.netMarginPercentage}%)\n` +
          `• AI Rationale: ${top.aiRationale}\n\n` +
          (second ? `2nd Alternative: ${second.marketName} (${second.district})\n• Net Profit: BDT ${second.netEstimatedReturn.toLocaleString()} (${second.distanceKm} km, Wholesale BDT ${second.marketPricePerKg}/kg)\n\n` : "") +
          (third ? `3rd Alternative: ${third.marketName} (${third.district})\n• Net Profit: BDT ${third.netEstimatedReturn.toLocaleString()} (${third.distanceKm} km, Wholesale BDT ${third.marketPricePerKg}/kg)\n\n` : "") +
          `Formula used: Net Profit = (Market Price x Quantity) - Transport Cost - Handling/Arat Commission. Ask me anytime to calculate for other crops or quantities!`;
      } else {
        reply = `${greeting} এআই নিট মুনাফা ও পরিবহন খরচ বিশ্লেষণ:\n` +
          `ফসল: ${calcCropNameBn} | পরিমাণ: ${calcQty.toLocaleString()} কেজি | উৎপত্তিস্থল: ${calcOrigin}\n\n` +
          `১ম সেরা নিট লাভ মোকাম: ${top.marketNameBn || top.marketName} (${top.districtBn || top.district})\n` +
          `• মহাসড়ক দূরত্ব: ${top.distanceKm} কিমি\n` +
          `• পাইকারি বাজার দর: ৳${top.marketPricePerKg}/কেজি\n` +
          `• মোট সম্ভাব্য বিক্রয়মূল্য: ৳${top.grossRevenue.toLocaleString()}\n` +
          `• প্রাক্কলিত কাভার্ড ভ্যান পরিবহন ভাড়া: -৳${top.transportCost.toLocaleString()}\n` +
          `• আড়তদারি কমিশন ও কুলি খরচ: -৳${top.otherCosts.toLocaleString()}\n` +
          `• প্রকৃত নিট লাভ: ৳${top.netEstimatedReturn.toLocaleString()} (মুনাফার হার: ${top.netMarginPercentage}%)\n` +
          `• সিদ্ধান্ত যুক্তি: ${top.aiRationaleBn}\n\n` +
          (second ? `বিকল্প #২: ${second.marketNameBn || second.marketName} (${second.districtBn || second.district})\n• নিট লাভ: ৳${second.netEstimatedReturn.toLocaleString()} (দূরত্ব: ${second.distanceKm} কিমি, পাইকারি দর ৳${second.marketPricePerKg}/কেজি)\n\n` : "") +
          (third ? `বিকল্প #৩: ${third.marketNameBn || third.marketName} (${third.districtBn || third.district})\n• নিট লাভ: ৳${third.netEstimatedReturn.toLocaleString()} (দূরত্ব: ${third.distanceKm} কিমি, পাইকারি দর ৳${third.marketPricePerKg}/কেজি)\n\n` : "") +
          `সূত্র: নিট লাভ = (পাইকারি দর x পরিমাণ) - পরিবহন ব্যয় - আড়তদারি খরচ। যেকোনো নতুন ফসল বা পরিমাণের লাভ হিসাব করতে আমাকে লিখে পাঠান!`;
      }
    }

    // -------------------------------------------------------------
    // DEFAULT FALLBACK: INTELLIGENT PLATFORM HELPER
    // -------------------------------------------------------------
    else {
      detectedIntent = "general_support";
      citations.push("AgriSphere Real-time Knowledge Engine");

      if (isEnglishQuery) {
        reply = `${greeting} I am AgriSphere AI Market Assistant.\n\n` +
          `I can provide immediate, verified insights from our live platform database:\n` +
          `1. Live Auctions: Current active crop lots, countdown timers & bidding leaders\n` +
          `2. Market Prices: Real-time DAM wholesale rates for chillies, potatoes, tomatoes, pumpkins & onions\n` +
          `3. Buyer Procurement: Demands from food processors (PRAN, Shwapno, Mokbul Traders)\n` +
          `4. Export Gateway: Dubai & Gulf RFQs, GlobalGAP & Phytosanitary certifications\n` +
          `5. AI Net-Return Calculator: Transport and arbitrage recommendations for your crops\n\n` +
          `Please ask your specific question, for example: "What live auctions are running right now?" or "What is today's potato price in Karwan Bazar?"`;
      } else {
        reply = `${greeting} আমি KrishiSetu AI প্ল্যাটফর্ম সহকারী।\n\n` +
          `আমি আমাদের ওয়েবসাইটের সরাসরি ডেটা থেকে আপনাকে তথ্য দিয়ে সাহায্য করতে পারি:\n` +
          `১. লাইভ নিলাম: চলমান ফসল, বর্তমান সর্বোচ্চ ডাক ও বিডার তথ্য\n` +
          `২. দৈনিক বাজার দর: মরিচ, আলু, টমেটো, শসা, কুমড়া ও পেঁয়াজের সরকারি পাইকারি রেট\n` +
          `৩. কারখানার ক্রয়চাহিদা: প্রাণ, স্বপ্ন বা আড়তদারদের তাজা ফসল কেনার রিকোয়েস্ট\n` +
          `৪. রপ্তানি সুযোগ: দুবাই ও ইউরোপের আন্তর্জাতিক চাহিদা এবং ফাইটোস্যানিটারি ছাড়পত্র\n` +
          `৫. লাভের হিসাব: পরিবহন খরচ বাদে কোন মোকামে বিক্রি করলে বেশি লাভ হবে\n\n` +
          `অনুগ্রহ করে আপনার সুনির্দিষ্ট প্রশ্নটি করুন, যেমন: "বর্তমানে কোন ফসলের লাইভ নিলাম চলছে?" বা "আজকে ঢাকায় কাঁচা মরিচের দাম কত?"`;
      }
    }

    // -------------------------------------------------------------
    // ATTACH USER TIER BADGE & LOGIN REMINDER
    // -------------------------------------------------------------
    let userTierNotice = "";
    if (!isLoggedIn) {
      userTierNotice = isEnglishQuery
        ? `\n\n---\nBasic AI Mode: Sign in to your account for personalized farm profit forecasting, direct buyer contact numbers, and unlimited inquiries.`
        : `\n\n---\nবেসিক এআই মোড: ব্যক্তিগত খামারের মুনাফা বিশ্লেষণ, সরাসরি ক্রেতার ফোন নম্বর ও আনলিমিটেড প্রশ্নের জন্য আপনার অ্যাকাউন্টে লগইন করুন।`;
    } else {
      userTierNotice = isEnglishQuery
        ? `\n\n---\nVerified Pro Assistant (Active Role: ${userRole ? userRole.toUpperCase() : "VERIFIED USER"}${userName ? ` • ${userName}` : ""})`
        : `\n\n---\nযাচাইকৃত প্রো এআই সহকারী (সক্রিয় ভূমিকা: ${userRole || "নিবন্ধিত ব্যবহারকারী"}${userName ? ` • ${userName}` : ""})`;
    }

    reply += userTierNotice;

    // Remove any accidental markdown star asterisks
    reply = reply.replace(/\*\*/g, "");

    db.logAudit(
      db.currentUserId,
      isLoggedIn ? `${userName || "User"} (${userRole})` : "Public Visitor",
      "AI_ASSISTANT_QUERY",
      "Assistant",
      undefined,
      `User query: "${query.substring(0, 80)}" -> Intent: ${detectedIntent}`
    );

    return NextResponse.json({
      query,
      detectedIntent,
      reply,
      citations,
      isLoggedIn,
      userRole,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process chat query" }, { status: 500 });
  }
}
