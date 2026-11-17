import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { BANGLADESH_MARKETS } from "@/lib/data/bangladesh-geo";

export async function POST(req: Request) {
  const db = getDb();
  try {
    const body = await req.json();
    const query = (body.query || "").trim();
    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const lowerQuery = query.toLowerCase();

    // 1. Gather Grounded RAG Platform Context
    const todayPrices = Array.from(db.marketPrices.values()).filter((p) => p.dataFreshnessDays === 0);
    const activeAuctions = Array.from(db.auctions.values()).filter((a) => a.status === "live");
    const openProcurements = Array.from(db.procurementRequests.values()).filter((p) => p.status === "open");
    const exportRfqs = Array.from(db.exportRfqs.values()).filter((e) => e.status === "open");

    let responseText = "";
    let citations: string[] = [];
    let detectedIntent = "general";

    // Intent 1: Current Price Inquiry (কাঁচা মরিচ / শসা / কুমড়া / দাম)
    if (
      lowerQuery.includes("দাম") ||
      lowerQuery.includes("price") ||
      lowerQuery.includes("rate") ||
      lowerQuery.includes("দর")
    ) {
      detectedIntent = "price_query";
      let targetCrop = "green_chilli";
      let cropNameBn = "কাঁচা মরিচ";
      let cropNameEn = "Green Chilli";

      if (lowerQuery.includes("শসা") || lowerQuery.includes("cucumber")) {
        targetCrop = "cucumber";
        cropNameBn = "শসা";
        cropNameEn = "Cucumber";
      } else if (lowerQuery.includes("কুমড়া") || lowerQuery.includes("pumpkin")) {
        targetCrop = "sweet_pumpkin";
        cropNameBn = "মিষ্টি কুমড়া";
        cropNameEn = "Sweet Pumpkin";
      } else if (lowerQuery.includes("টমেটো") || lowerQuery.includes("tomato")) {
        targetCrop = "tomato";
        cropNameBn = "টমেটো";
        cropNameEn = "Tomato";
      } else if (lowerQuery.includes("আলু") || lowerQuery.includes("potato")) {
        targetCrop = "potato";
        cropNameBn = "আলু";
        cropNameEn = "Potato";
      }

      const matchingPrices = todayPrices.filter((p) => p.cropId === targetCrop);

      if (matchingPrices.length > 0) {
        const boguraPrice = matchingPrices.find((p) => p.district === "Bogura");
        const dhakaPrice = matchingPrices.find((p) => p.district === "Dhaka");
        const gazipurPrice = matchingPrices.find((p) => p.district === "Gazipur");

        responseText = `🌾 **আজকের ${cropNameBn} (${cropNameEn}) বাজার দর পর্যবেক্ষণ (কৃষি বিপণন অধিদপ্তর - DAMBD):**\n\n` +
          (boguraPrice ? `• **বগুড়া (মহাস্থানগড় মোকাম):** পাইকারি ৳${boguraPrice.wholesalePrice}/কেজি (খুচরা ৳${boguraPrice.retailPrice}/কেজি)\n` : "") +
          (dhakaPrice ? `• **ঢাকা (কারওয়ান বাজার):** পাইকারি ৳${dhakaPrice.wholesalePrice}/কেজি (খুচরা ৳${dhakaPrice.retailPrice}/কেজি)\n` : "") +
          (gazipurPrice ? `• **গাজীপুর (বোর্ড বাজার হাব):** পাইকারি ৳${gazipurPrice.wholesalePrice}/কেজি (খুচরা ৳${gazipurPrice.retailPrice}/কেজি)\n` : "") +
          `\n💡 **পরামর্শ:** স্থানীয় হাট থেকে ঢাকার বড় মোকামে দাম কেজিপ্রতি ৳${(dhakaPrice?.wholesalePrice || 0) - (boguraPrice?.wholesalePrice || 0)} বেশি। আপনার ফসলের পরিমাণ ১ টন বা তার বেশি হলে ঢাকায় পাঠালে পরিবহন খরচ বাদেও বাড়তি নিট লাভ থাকবে।`;

        citations.push(`DAM Daily Agricultural Market Bulletin (তারিখ: ${new Date().toISOString().split("T")[0]})`);
        citations.push(`KrishiSetu AI Real-time Market Node (Verified Wholesale Arat Record)`);
      } else {
        responseText = `দুঃখিত, আজ এই ফসলের নির্ধারিত সরাসরি দামের কোনো যাচাইকৃত রেকর্ড পাওয়া যায়নি। নিকটবর্তী কৃষি বিপণন কর্মকর্তা বা প্ল্যাটফর্মের তালিকাভুক্ত আড়তদারদের সাথে যোগাযোগ করতে পারেন।`;
      }
    }

    // Intent 2: Where to sell for highest net profit? (কোথায় বিক্রি করলে লাভ / লাভ বেশি / best market)
    else if (
      lowerQuery.includes("লাভ") ||
      lowerQuery.includes("কোথায় বিক্রি") ||
      lowerQuery.includes("best market") ||
      lowerQuery.includes("net return") ||
      lowerQuery.includes("sell")
    ) {
      detectedIntent = "recommendation";
      const recs = db.getBestMarketRecommendations({
        cropId: "green_chilli",
        originDistrict: "Bogura",
        quantityKg: 2000,
      });

      const top = recs[0];
      const second = recs[1];

      responseText = `📊 **কৃত্রিম বুদ্ধিমত্তা (AI) নিট মুনাফা বিশ্লেষণ (২ টন কাঁচা মরিচ, অবস্থান: বগুড়া):**\n\n` +
        `🏆 **১ম সেরা সুপারিশ: ${top.marketNameBn} (${top.districtBn})**\n` +
        `• পাইকারি দর: ৳${top.marketPricePerKg}/কেজি\n` +
        `• আনুমানিক মোট বিক্রয়মূল্য: ৳${top.grossRevenue.toLocaleString()}\n` +
        `• আনুমানিক পরিবহন ও লোডিং খরচ: -৳${top.transportCost.toLocaleString()}\n` +
        `• অন্যান্য খরচ (আড়তদারি/লেবার): -৳${top.otherCosts.toLocaleString()}\n` +
        `• **প্রত্যাশিত নিট লাভ: ৳${top.netEstimatedReturn.toLocaleString()}** (নিট মার্জিন ${top.netMarginPercentage}%)\n` +
        `• কারণ: ${top.aiRationaleBn}\n\n` +
        `🥈 **২য় বিকল্প: ${second?.marketNameBn || "স্থানীয় মোকাম"}**\n` +
        `• প্রত্যাশিত নিট লাভ: ৳${second?.netEstimatedReturn.toLocaleString() || "N/A"}\n\n` +
        `⚠️ **সতর্কতা:** পরিবহন খরচ বগুড়া-ঢাকা করিডোরের পিকআপ/কাভার্ড ভ্যান ভাড়ার গড়ের উপর ভিত্তি করে প্রাক্কলিত। চূড়ান্ত সিদ্ধান্ত আপনার নিজের।`;

      citations.push("KrishiSetu AI Freight Distance Matrix (Bogura-Dhaka N5 Highway)");
      citations.push("DAM Wholesale Price Index");
    }

    // Intent 3: Buyer & Factory Demand Matching (buyer আছে / factory / ক্রেতা / কোম্পানি)
    else if (
      lowerQuery.includes("buyer") ||
      lowerQuery.includes("ক্রেতা") ||
      lowerQuery.includes("factory") ||
      lowerQuery.includes("কারখানা") ||
      lowerQuery.includes("কিনতে চাচ্ছে") ||
      lowerQuery.includes("চাহিদা")
    ) {
      detectedIntent = "buyer_matching";
      const reqList = openProcurements.slice(0, 3);

      responseText = `🤝 **প্ল্যাটফর্মে সক্রিয় শীর্ষ ক্রেতা ও কারখানার ক্রয়চাহিদা (Buyer Procurement Requests):**\n\n`;
      reqList.forEach((req, idx) => {
        responseText += `**${idx + 1}. ${req.companyName || req.buyerName}** (${req.buyerRole === "factory" ? "কারখানা/মিল" : "সুপারশপ/আড়ত"})\n` +
          `• ফসল: ${req.cropNameBn} (${req.cropNameEn})\n` +
          `• মোট চাহিদা: ${req.requiredQuantity.toLocaleString()} ${req.unit} (${req.qualityGrade})\n` +
          `• সর্বোচ্চ বাজেট: ${req.isBudgetPrivate ? "দরকষাকষি সাপেক্ষ (গোপন)" : `৳${req.maxBudgetPerUnit}/${req.unit}`}\n` +
          `• ডেলিভারি গন্তব্য: ${req.deliveryLocation}\n` +
          `• আংশিক সরবরাহ সুবিধা: ${req.allowSplitFulfillment ? "হ্যাঁ (একাধিক চাষি মিলে দিতে পারবেন)" : "না (একক সরবরাহ)"}\n\n`;
      });

      responseText += `👉 আপনি আপনার ড্যাশবোর্ড থেকে **'Supplier Offer'** বাটনে ক্লিক করে সরাসরি নিজের দর প্রস্তাব পাঠাতে পারেন।`;
      citations.push("KrishiSetu AI Live Procurement Ledger");
    }

    // Intent 4: Export Opportunities (রপ্তানি / export / বিদেশ / আম / GlobalGAP)
    else if (
      lowerQuery.includes("রপ্তানি") ||
      lowerQuery.includes("export") ||
      lowerQuery.includes("বিদেশে") ||
      lowerQuery.includes("সার্টিফিকেট") ||
      lowerQuery.includes("আম")
    ) {
      detectedIntent = "export_guidance";
      responseText = `🌍 **বাংলাদেশ থেকে কৃষি পণ্য (শাকসবজি, মরিচ ও আম) রপ্তানি নির্দেশিকা:**\n\n` +
        `১. **প্রয়োজনীয় কাগজপত্র ও সনদ:**\n` +
        `• উদ্ভিদ সঙ্গনিরোধ সনদ (Phytosanitary Certificate - কৃষি সম্প্রসারণ অধিদপ্তর DAE)\n` +
        `• কীটনাশকের অবশিষ্টাংশ পরীক্ষা সনদ (MRL Lab Test Report)\n` +
        `• গ্লোবাল গ্যাপ (GlobalGAP) অথবা উত্তম কৃষি চর্চা (GAP) সনদ\n` +
        `• রপ্তানি নিবন্ধন সনদ (ERC) ও প্যাকহাউস পরিদর্শন ক্লিয়ারেন্স\n\n` +
        `২. **প্যাকেজিং ও পরিবহন শর্ত:**\n` +
        `• মধ্যপ্রাচ্যে (সংযুক্ত আরব আমিরাত/সৌদি) বিমানযোগে পাঠানোর জন্য ৪.৫ - ৫ কেজি ভেন্টিলেটেড কার্টন\n` +
        `• যুক্তরাজ্য ও ইউরোপের জন্য তাপমাত্রা নিয়ন্ত্রিত রেফ্রিজারেটেড কন্টেইনার (১২°C - ১৩°C)\n\n` +
        `৩. **চলতি আন্তর্জাতিক চাহিদা (Global RFQ):**\n` +
        `• দুবাইয়ের **Al-Madina General Trading LLC** ১২ টন কাঁচা মরিচের জন্য কোটেশন আহ্বান করেছে (লক্ষ্যমাত্রা FOB $১.৮০/কেজি)।\n\n` +
        `📌 *দ্রষ্টব্য: প্ল্যাটফর্ম সরাসরি কাস্টমস ক্লিয়ারেন্স দেয় না। এটি নিবন্ধিত এক্সপোর্টারদের মাধ্যমে প্রক্রিয়াজাত করা হয়।*`;

      citations.push("Bangladesh Department of Agricultural Extension (Plant Quarantine Wing)");
      citations.push("Hortex Foundation Export Manual");
    }

    // Default Fallback: Intelligent Agriculture Assistant
    else {
      responseText = `নমস্কার! আমি **KrishiSetu AI কৃষি বাজার সহকারী**।\n\n` +
        `আমি আপনাকে নিচের বিষয়গুলোতে সাহায্য করতে পারি:\n` +
        `১. আজকের পাইকারি ও খুচরা বাজার দর যাচাই (কাঁচা মরিচ, শসা, মিষ্টি কুমড়া, টমেটো, আলু ইত্যাদি)\n` +
        `২. ফসল কোথায় বিক্রি করলে খরচ বাদে বেশি লাভ হবে তা প্রাক্কলন\n` +
        `৩. সক্রিয় কারখানা, মিল ও সুপারশপের ক্রয়চাহিদা ও দরপ্রস্তাব জমা\n` +
        `৪. আন্তর্জাতিক বাজারে রপ্তানির সুযোগ ও ছাড়পত্র সম্পর্কিত তথ্য\n\n` +
        `দয়া করে আপনার নির্দিষ্ট ফসল, পরিমাণ বা জেলা উল্লেখ করে প্রশ্ন করুন। উদাহরণ: *"আজকে বগুড়ায় কাঁচা মরিচের দর কত?"*`;
    }

    db.logAudit(
      db.currentUserId,
      "Farmer/User",
      "AI_ASSISTANT_QUERY",
      "Assistant",
      undefined,
      `User query: "${query.substring(0, 80)}" -> Intent: ${detectedIntent}`
    );

    return NextResponse.json({
      query,
      detectedIntent,
      reply: responseText,
      citations,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process chat query" }, { status: 500 });
  }
}

