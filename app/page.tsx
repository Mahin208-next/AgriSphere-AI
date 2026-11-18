"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { Auction, MarketPriceRecord } from "@/types";
import { 
  Sprout, 
  Gavel, 
  Building2, 
  TrendingUp, 
  Globe2, 
  Bot, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Scale, 
  Clock, 
  MapPin, 
  ChevronRight,
  Truck
} from "lucide-react";
import LiveAuctionCard from "@/components/auctions/LiveAuctionCard";
import AICalculationGuide from "@/components/market/AICalculationGuide";
import { fetchWithCache } from "@/lib/client-cache";

export default function HomePage() {
  const { language, t } = useApp();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [todayPrices, setTodayPrices] = useState<MarketPriceRecord[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [aucData, prcData] = await Promise.all([
          fetchWithCache<{ auctions: Auction[] }>("/api/v1/auctions"),
          fetchWithCache<{ prices: MarketPriceRecord[] }>("/api/v1/prices?onlyToday=true"),
        ]);
        if (isMounted) {
          if (aucData?.auctions) setAuctions(aucData.auctions);
          if (prcData?.prices) setTodayPrices(prcData.prices);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const liveAuctions = auctions.filter((a) => a.status === "live");

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-agri-950 via-agri-900 to-agri-900 text-white pt-12 sm:pt-16 pb-16 sm:pb-20 px-4 sm:px-6">
        {/* Decorative Grid Glow */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-5">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              {language === "bn" ? (
                <>
                  প্রতিটি কৃষককে সরাসরি <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-harvest-300 via-harvest-400 to-agri-300">
                    প্রতিটি বাজারের সাথে
                  </span>{" "}
                  সংযুক্ত করা
                </>
              ) : (
                <>
                  Connecting Every Farmer <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-harvest-300 via-harvest-400 to-agri-300">
                    To Every Market
                  </span>
                </>
              )}
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-agri-200 max-w-2xl mx-auto leading-relaxed">
              {language === "bn"
                ? "কৃষকের লাইভ নিলাম, পাইকারি ক্রেতা ও মিলের ক্রয়চাহিদা, কৃষি বিপণন অধিদপ্তরের (DAM) দৈনিক বাজার দর এবং এআই নিট মুনাফা মডেলের সমন্বয়ে দ্বিমুখী কৃষি ট্রেডিং নেটওয়ার্ক।"
                : "A unified two-way agricultural trading network featuring farmer live auctions, agro-mill reverse procurements, national market price intelligence, and AI net-return recommendations."}
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 pt-3">
              <Link
                href="/auctions"
                className="px-5 sm:px-6 py-3 rounded-xl bg-harvest-500 hover:bg-harvest-400 text-harvest-950 text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-harvest-950/20"
              >
                <Gavel className="w-4 h-4 shrink-0" />
                <span>{language === "bn" ? "লাইভ নিলাম দেখুন (System A)" : "Explore Live Auctions (System A)"}</span>
              </Link>

              <Link
                href="/procurement"
                className="px-5 sm:px-6 py-3 rounded-xl bg-agri-800 hover:bg-agri-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 border border-agri-700 shadow-sm"
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span>{language === "bn" ? "কারখানা ও পাইকারি চাহিদা (System B)" : "Buyer Demands (System B)"}</span>
              </Link>

              <Link
                href="/market-intelligence"
                className="px-5 sm:px-6 py-3 rounded-xl bg-agri-950/80 hover:bg-agri-900 text-agri-200 text-xs font-bold transition flex items-center justify-center gap-2 border border-agri-800"
              >
                <TrendingUp className="w-4 h-4 text-agri-400 shrink-0" />
                <span>{language === "bn" ? "জাতীয় বাজার দর ও এআই" : "DAM Price Intelligence"}</span>
              </Link>
            </div>
          </div>

          {/* Real-time Ticker: DAM Daily Prices */}
          <div className="mt-10 sm:mt-12 bg-agri-900/60 backdrop-blur-md rounded-2xl border border-agri-800 p-3.5 sm:p-4 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3 text-xs text-agri-300">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-agri-200 text-[11px] sm:text-xs">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-ping shrink-0" />
                <span className="truncate">{language === "bn" ? "আজকের পাইকারি বাজার দর (কৃষি বিপণন অধিদপ্তর - DAMBD)" : "Daily DAM Wholesale Market Benchmark"}</span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-mono text-agri-400">
                Live Data Feeds
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {todayPrices.slice(0, 4).map((p) => (
                <div key={p.id} className="bg-agri-950/60 rounded-xl p-3 border border-agri-800/80">
                  <div className="text-[11px] text-agri-300 truncate">
                    {language === "bn" ? p.cropNameBn : p.cropNameEn} ({p.district})
                  </div>
                  <div className="text-base font-extrabold text-white mt-0.5">
                    ৳{p.wholesalePrice} <span className="text-xs text-agri-400 font-normal">/kg</span>
                  </div>
                  <div className="text-[10px] text-harvest-400 mt-0.5">
                    Retail: ৳{p.retailPrice}/kg
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Core Innovation: Two-Way Trading System Architecture */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-agri-700 uppercase tracking-wider bg-agri-50 px-3 py-1 rounded-full border border-agri-200">
              {language === "bn" ? "প্ল্যাটফর্মের মূল উদ্ভাবন" : "Core Trading Innovation"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-earth-900 mt-2">
              {language === "bn" ? "দ্বিমুখী প্রতিযোগিতামূলক কৃষি ট্রেডিং ব্যবস্থা" : "Two-Way Competitive Agricultural Trading"}
            </h2>
            <p className="text-xs sm:text-sm text-earth-500 mt-2">
              {language === "bn"
                ? "কৃষক ও ক্রেতা—উভয় পক্ষই স্বাধীনভাবে মূল্য নির্ধারণ ও প্রতিযোগিতামূলক কেনাবেচায় অংশ নিতে পারেন।"
                : "Eliminating traditional market syndication and information asymmetry through bilateral discovery."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* System A Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-earth-200 shadow-sm relative overflow-hidden group hover:border-agri-400 transition">
              <div className="absolute top-0 right-0 w-32 h-32 bg-agri-50 rounded-full blur-2xl group-hover:bg-agri-100 transition" />
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-agri-100 text-agri-800 flex items-center justify-center">
                  <Gavel className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-agri-700 uppercase tracking-wider">SYSTEM A</span>
                  <h3 className="text-lg font-bold text-earth-900">
                    {language === "bn" ? "কৃষকের লাইভ নিলাম মঞ্চ" : "Farmer-Initiated Live Auctions"}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-earth-600 leading-relaxed mb-6">
                {language === "bn"
                  ? "কৃষক নিজের ফসল তালিকাভুক্ত করে ন্যূনতম প্রারম্ভিক দর ও রিজার্ভ মূল্য নির্ধারণ করে নিলাম শুরু করেন। পাইকার ও মিলমালিকরা রিয়েল-টাইম বিড করেন। কৃষকের সিদ্ধান্তই চূড়ান্ত।"
                  : "Farmers list their harvest with expected starting and private reserve prices. Verified buyers compete with real-time server-validated bids and anti-snipe extensions."}
              </p>

              <div className="space-y-2.5 text-xs text-earth-700 mb-6 bg-earth-50 p-4 rounded-2xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-agri-600 shrink-0" />
                  <span>{language === "bn" ? "রিয়েল-টাইম কাউন্টডাউন ও অ্যান্টি-স্নাইপ সময় বর্ধন" : "Real-time countdown with automatic anti-snipe extension"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-agri-600 shrink-0" />
                  <span>{language === "bn" ? "গোপন রিজার্ভ মূল্য দ্বারা কৃষক সুরক্ষা" : "Private reserve price protection preventing distress sales"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-agri-600 shrink-0" />
                  <span>{language === "bn" ? "চাষির সম্মতির পর স্বয়ংক্রিয় অর্ডার জেনারেশন" : "Immutable bid history and farmer final acceptance approval"}</span>
                </div>
              </div>

              <Link
                href="/auctions"
                className="inline-flex items-center gap-2 text-xs font-bold text-agri-800 hover:text-agri-950 transition"
              >
                <span>{language === "bn" ? "চলমান নিলামে প্রবেশ করুন" : "Browse Active Live Auctions"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* System B Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-earth-200 shadow-sm relative overflow-hidden group hover:border-harvest-400 transition">
              <div className="absolute top-0 right-0 w-32 h-32 bg-harvest-50 rounded-full blur-2xl group-hover:bg-harvest-100 transition" />
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-harvest-100 text-harvest-800 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-harvest-700 uppercase tracking-wider">SYSTEM B</span>
                  <h3 className="text-lg font-bold text-earth-900">
                    {language === "bn" ? "ক্রেতা ও মিলের ক্রয়চাহিদা ও বিপরীত প্রস্তাব" : "Buyer Bulk Procurement & Reverse Offers"}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-earth-600 leading-relaxed mb-6">
                {language === "bn"
                  ? "খাদ্য প্রস্তুতকারী মিল, সুপারমার্কেট ও পাইকাররা সরাসরি ক্রয়ের নির্দিষ্ট পরিমাণ, মান ও বাজেট প্রকাশ করেন। এলাকার কৃষকরা সরাসরি বিপরীত সরবরাহ প্রস্তাব পাঠান।"
                  : "Agro-processing factories, mills, and supermarkets publish bulk procurement requirements. Local farmers discover demands and submit supply offers with partial fulfillment support."}
              </p>

              <div className="space-y-2.5 text-xs text-earth-700 mb-6 bg-earth-50 p-4 rounded-2xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-harvest-600 shrink-0" />
                  <span>{language === "bn" ? "একাধিক চাষি মিলে আংশিক সরবরাহ সুবিধা (Split Fulfillment)" : "Multi-supplier aggregation allowing smallholders to fulfill large mill orders"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-harvest-600 shrink-0" />
                  <span>{language === "bn" ? "সরাসরি কারখানা সরবরাহ ও মধ্যস্বত্বভোগী হ্রাসের চুক্তি" : "Direct factory-gate supply eliminating multi-tier intermediaries"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-harvest-600 shrink-0" />
                  <span>{language === "bn" ? "দরকষাকষি সাপেক্ষ অথবা গোপন বাজেট সুবিধা" : "Configurable budget privacy protecting institutional buyers"}</span>
                </div>
              </div>

              <Link
                href="/procurement"
                className="inline-flex items-center gap-2 text-xs font-bold text-harvest-800 hover:text-harvest-950 transition"
              >
                <span>{language === "bn" ? "কারখানা ও পাইকারি চাহিদা দেখুন" : "Explore Procurement Demands"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Live Auction Showcase Section */}
        {liveAuctions.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <h2 className="text-xl font-bold text-earth-900">
                    {language === "bn" ? "চলমান লাইভ নিলাম প্রিভিউ" : "Live Auctions In Progress"}
                  </h2>
                </div>
                <p className="text-xs text-earth-500 mt-1">
                  {language === "bn" ? "প্রকৃত সময়ে বিড আপডেট এবং অ্যান্টি-স্নাইপ সুরক্ষা সহ লাইভ নিলাম" : "Real-time bidding with verified buyer accreditation and anti-snipe clock"}
                </p>
              </div>

              <Link
                href="/auctions"
                className="text-xs font-bold text-agri-700 hover:text-agri-900 flex items-center gap-1"
              >
                <span>{language === "bn" ? "সবগুলো দেখুন" : "View All"}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {liveAuctions.slice(0, 2).map((auc) => (
                <LiveAuctionCard key={auc.id} auction={auc} />
              ))}
            </div>
          </section>
        )}

        {/* AI Net-Return Engine Preview */}
        <section>
          <AICalculationGuide />
        </section>

        {/* Global Opportunity Radar Intro */}
        <section className="bg-gradient-to-r from-earth-900 to-agri-950 text-white rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-harvest-500 text-harvest-950 uppercase tracking-wider">
              {t.export.title}
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-snug">
              {language === "bn" ? "বাংলাদেশি কৃষিপণ্যের আন্তর্জাতিক রপ্তানি সুযোগ" : "Access Global Agricultural Export Markets"}
            </h2>
            <p className="text-xs sm:text-sm text-earth-300 leading-relaxed">
              {language === "bn"
                ? "দুবাই, সৌদি আরব, যুক্তরাজ্য ও ইউরোপের আন্তর্জাতিক আমদানিকারকদের কাঁচা মরিচ, শসা, মিষ্টি কুমড়া ও তাজা আমের সরাসরি আরএফকিউ (RFQ) চাহিদা।"
                : "Discover direct importer RFQs from the UAE, Saudi Arabia, UK, and European grocers seeking verified Bangladeshi fresh produce."}
            </p>
            <div className="pt-2">
              <Link
                href="/export"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-agri-600 hover:bg-agri-500 text-white text-xs font-bold transition shadow-sm"
              >
                <Globe2 className="w-4 h-4" />
                <span>{language === "bn" ? "রপ্তানি সুযোগ ও সনদ যাচাই" : "Explore International RFQs"}</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

