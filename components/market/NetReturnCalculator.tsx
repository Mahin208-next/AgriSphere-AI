"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { MarketRecommendation } from "@/types";
import { CROPS_DATA } from "@/lib/data/crops";
import { BANGLADESH_DISTRICTS } from "@/lib/data/bangladesh-geo";
import {
  Calculator,
  TrendingUp,
  Truck,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Info,
  Scale,
  Send,
  Bot,
  HelpCircle,
  Copy,
  Check,
  RefreshCw,
  Coins,
  ShieldAlert,
  Sliders,
  DollarSign
} from "lucide-react";

export default function NetReturnCalculator() {
  const { language, t } = useApp();

  // Core Calculator Inputs
  const [cropId, setCropId] = useState<string>("green_chilli");
  const [customCropName, setCustomCropName] = useState<string>("");
  const [originDistrict, setOriginDistrict] = useState<string>("Bogura");
  const [quantityInput, setQuantityInput] = useState<number>(2000);
  const [unit, setUnit] = useState<"kg" | "mon" | "ton">("kg");
  const [vehicleType, setVehicleType] = useState<"covered_van" | "pickup" | "truck_10ton" | "local_trolley">("covered_van");
  const [useCustomPrice, setUseCustomPrice] = useState<boolean>(false);
  const [customPrice, setCustomPrice] = useState<number>(180);
  const [customFeePercent, setCustomFeePercent] = useState<number>(1.5);

  // Results & Calculation State
  const [loading, setLoading] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<MarketRecommendation[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  // AI Direct Question Assistant
  const [aiQuestion, setAiQuestion] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string>("");

  // Convert quantity to standard KG for algorithm
  const totalQuantityKg =
    unit === "ton" ? quantityInput * 1000 :
    unit === "mon" ? quantityInput * 40 :
    quantityInput;

  const quickQuestions = [
    {
      titleBn: "🥔 ৩ টন আলু: রংপুর থেকে ঢাকায় নিট লাভ কত?",
      titleEn: "🥔 3 tons Potato: Rangpur to Dhaka net profit?",
      query: "আমার রংপুর থেকে ৩ টন আলু ঢাকায় শ্যামবাজারে পাঠালে পরিবহন খরচ বাদে নিট কত টাকা লাভ থাকবে?",
      preset: { cropId: "potato", district: "Rangpur", qty: 3, unit: "ton" as const }
    },
    {
      titleBn: "🌶️ ২ টন কাঁচা মরিচ: বগুড়া বনাম ঢাকার মোকাম",
      titleEn: "🌶️ 2 tons Chilli: Bogura vs Dhaka market",
      query: "২০০০ কেজি কাঁচা মরিচ বগুড়া থেকে বিক্রি করলে স্থানীয় মোকাম ভালো নাকি ঢাকায় পাঠানো ভালো?",
      preset: { cropId: "green_chilli", district: "Bogura", qty: 2000, unit: "kg" as const }
    },
    {
      titleBn: "🧅 ৫ টন পেঁয়াজ: পাবনা থেকে কাওরান বাজার",
      titleEn: "🧅 5 tons Onion: Pabna to Karwan Bazar",
      query: "পাবনা থেকে ৫ টন পেঁয়াজ কাওরান বাজারে বিক্রি করলে কাভার্ড ভ্যান ভাড়াসহ মোট নিট রিটার্ন কত আসবে?",
      preset: { cropId: "onion", district: "Pabna", qty: 5, unit: "ton" as const }
    },
    {
      titleBn: "🥒 ৫০ মণ শসা: শেরপুর থেকে সেরা ৩টি মোকাম",
      titleEn: "🥒 50 maunds Cucumber: Sherpur top 3 markets",
      query: "শেরপুর থেকে ৫০ মণ শসা কোথায় পাঠালে সবচেয়ে বেশি নিট দাম পাওয়া যাবে?",
      preset: { cropId: "cucumber", district: "Sherpur", qty: 50, unit: "mon" as const }
    },
  ];

  const calculateRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/recommendations/markets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropId: cropId === "custom" ? "green_chilli" : cropId,
          originDistrict,
          quantityKg: totalQuantityKg,
          customWholesalePrice: useCustomPrice ? customPrice : undefined,
          vehicleType,
          customFeePercent,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (e) {
      console.error("Error calculating net return:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateRecommendations();
  }, [cropId, originDistrict, totalQuantityKg, useCustomPrice, customPrice, vehicleType, customFeePercent]);

  // Handle direct AI Ask
  const handleAskAI = async (queryText?: string) => {
    const q = (queryText || aiQuestion).trim();
    if (!q) return;

    setAiLoading(true);
    setAiResponse("");

    try {
      const res = await fetch("/api/v1/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: q,
          userDistrict: originDistrict,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.reply || data.response || "দুঃখিত, কোনো উত্তর পাওয়া যায়নি।");
      } else {
        setAiResponse("এআই সার্ভারে সংযোগ করা সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
    } catch (err) {
      setAiResponse("সংযোগ ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyPreset = (preset: { cropId: string; district: string; qty: number; unit: "kg" | "mon" | "ton" }, query: string) => {
    setCropId(preset.cropId);
    setOriginDistrict(preset.district);
    setQuantityInput(preset.qty);
    setUnit(preset.unit);
    setAiQuestion(query);
    handleAskAI(query);
  };

  const handleCopySummary = () => {
    if (recommendations.length === 0) return;
    const top = recommendations[0];
    const cropName = cropId === "custom" && customCropName ? customCropName : CROPS_DATA.find(c => c.id === cropId)?.nameBn || cropId;
    
    const summaryText = 
      `🌾 কৃষি সেতু এআই নিট মুনাফা হিসাব 🌾\n` +
      `ফসল: ${cropName}\n` +
      `পরিমাণ: ${quantityInput} ${unit === "mon" ? "মণ" : unit === "ton" ? "টন" : "কেজি"} (${totalQuantityKg.toLocaleString()} কেজি)\n` +
      `উৎপত্তিস্থল: ${originDistrict}\n\n` +
      `🏆 সেরা বিক্রয় মোকাম: ${top.marketNameBn} (${top.districtBn})\n` +
      `• সড়ক দূরত্ব: ${top.distanceKm} কিমি\n` +
      `• পাইকারি দর: ৳${top.marketPricePerKg}/কেজি\n` +
      `• মোট বিক্রয় আয়: ৳${top.grossRevenue.toLocaleString()}\n` +
      `• প্রাক্কলিত পরিবহন ভাড়া: -৳${top.transportCost.toLocaleString()}\n` +
      `• আড়তদারি ও আনলোড: -৳${top.otherCosts.toLocaleString()}\n` +
      `------------------------------------\n` +
      `💰 চূড়ান্ত নিট মুনাফা: ৳${top.netEstimatedReturn.toLocaleString()}\n` +
      `প্রতি কেজিতে নিট লাভ: ৳${(top.netEstimatedReturn / totalQuantityKg).toFixed(1)}/কেজি (${top.netMarginPercentage}% মার্জিন)\n\n` +
      `যাচাইকৃত উৎস: কৃষি বিপণন অধিদপ্তর (DAM) ও কৃষি সেতু এআই।`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* 1. Intelligent AI Question Bar */}
      <div className="bg-gradient-to-r from-agri-900 via-agri-800 to-earth-900 rounded-3xl p-5 sm:p-7 text-white shadow-md border border-agri-700/60 relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-harvest-400 text-harvest-950 flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                  <span>{language === "bn" ? "এআই নিট মুনাফা ও পরিবহন প্রশ্নোত্তরি" : "AI Net-Return Q&A Assistant"}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    ⚡ NVIDIA Nemotron-3 550B
                  </span>
                </h3>
                <p className="text-[11px] text-agri-200">
                  {language === "bn"
                    ? "যেকোনো ফসল, পরিমাণ বা মোকাম নিয়ে সাধারণ ভাষায় প্রশ্ন করুন — এআই তাৎক্ষণিক নিট লাভ ও সেরা সিদ্ধান্ত জানাবে।"
                    : "Ask any question in plain language — AI calculates transport tariffs, market spreads, and net take-home cash."}
                </p>
              </div>
            </div>
          </div>

          {/* Question Input Form */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAskAI();
                }}
                placeholder={
                  language === "bn"
                    ? "যেমন: আমার ৩ টন আলু রংপুর থেকে ঢাকায় পাঠালে পরিবহন খরচ বাদ দিয়ে কত টাকা লাভ থাকবে?"
                    : "e.g. Calculate net profit for 3 tons of potatoes from Rangpur to Dhaka wholesale market"
                }
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-harvest-400 focus:bg-white/15"
              />
            </div>
            <button
              onClick={() => handleAskAI()}
              disabled={aiLoading || !aiQuestion.trim()}
              className="px-5 py-3 rounded-2xl bg-harvest-500 hover:bg-harvest-600 disabled:opacity-50 text-harvest-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition shrink-0"
            >
              {aiLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{language === "bn" ? "উত্তর দিন" : "Ask AI"}</span>
            </button>
          </div>

          {/* Quick Clickable Suggestions */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-semibold text-agri-300">
              {language === "bn" ? "💡 দ্রুত উদাহরণের উপর ক্লিক করে পরীক্ষা করুন:" : "💡 Quick example questions:"}
            </div>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((qq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(qq.preset, qq.query)}
                  className="text-[11px] px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition text-left"
                >
                  {language === "bn" ? qq.titleBn : qq.titleEn}
                </button>
              ))}
            </div>
          </div>

          {/* AI Response Box */}
          {aiResponse && (
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 mt-3 space-y-2 text-xs sm:text-sm leading-relaxed text-earth-100">
              <div className="flex items-center justify-between text-xs font-bold text-harvest-300 border-b border-white/10 pb-2">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-harvest-400" />
                  {language === "bn" ? "এআই পরামর্শ ও গাণিতিক বিশ্লেষণ:" : "AI Strategic Recommendation:"}
                </span>
                <span className="text-[10px] text-white/60">Grounded with Live DAM BD Data</span>
              </div>
              <div className="whitespace-pre-line text-xs sm:text-sm text-white/90 font-medium">
                {aiResponse}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Interactive Universal Multi-Market Calculator Panel */}
      <div className="bg-white rounded-3xl border border-earth-200 p-5 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-earth-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-agri-100 text-agri-800 mb-2">
              <Calculator className="w-3.5 h-3.5 text-agri-700" />
              <span>{language === "bn" ? "ইউনিভার্সাল মাল্টি-মোকাম নিট মুনাফা ক্যালকুলেটর" : "Universal Multi-Market Net Return Engine"}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-earth-900">
              {language === "bn" ? "সব ধরনের ফসলের পরিবহন ও সেরা মোকাম তুলনা" : "Compare Transport & Net Take-Home for Any Crop"}
            </h2>
            <p className="text-xs text-earth-500 mt-0.5">
              {language === "bn"
                ? "মহাসড়ক দূরত্ব, কাভার্ড ভ্যান ভাড়া ও আড়তদারি কমিশন স্বয়ংক্রিয়ভাবে বাদ দিয়ে সেরা ৩টি মোকামের নিট লাভ যাচাই করুন।"
                : "Accounts for real-time highway km, haulage tariffs, and aratdar commission to uncover your true net take-home profit."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-earth-100 hover:bg-earth-200 text-earth-700 text-xs font-semibold transition"
              title="হিসাবের সারসংক্ষেপ কপি করুন"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (language === "bn" ? "কপি হয়েছে!" : "Copied!") : (language === "bn" ? "হিসাব কপি করুন" : "Copy Summary")}</span>
            </button>
          </div>
        </div>

        {/* Input Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Crop Selector */}
          <div>
            <label className="block text-xs font-bold text-earth-700 mb-1.5">
              {language === "bn" ? "১. ফসল নির্বাচন করুন" : "1. Select Agricultural Produce"}
            </label>
            <select
              value={cropId}
              onChange={(e) => setCropId(e.target.value)}
              className="w-full px-3 py-2.5 bg-earth-50 border border-earth-300 rounded-xl text-xs sm:text-sm font-semibold text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500"
            >
              {CROPS_DATA.map((c) => (
                <option key={c.id} value={c.id}>
                  {language === "bn" ? `${c.nameBn} (${c.nameEn})` : `${c.nameEn} (${c.nameBn})`}
                </option>
              ))}
              <option value="custom">
                {language === "bn" ? "➕ অন্যান্য / কাস্টম ফসল..." : "➕ Other / Custom Crop..."}
              </option>
            </select>

            {cropId === "custom" && (
              <input
                type="text"
                placeholder={language === "bn" ? "ফসলের নাম লিখুন (যেমন: ড্রাগন ফল, হলুদ)" : "Enter Crop Name (e.g. Turmeric)"}
                value={customCropName}
                onChange={(e) => setCustomCropName(e.target.value)}
                className="mt-2 w-full px-3 py-2 bg-agri-50/50 border border-agri-300 rounded-xl text-xs font-semibold text-earth-900"
              />
            )}
          </div>

          {/* Origin District */}
          <div>
            <label className="block text-xs font-bold text-earth-700 mb-1.5">
              {language === "bn" ? "২. উৎপত্তিস্থল (আপনার জেলা)" : "2. Origin District"}
            </label>
            <select
              value={originDistrict}
              onChange={(e) => setOriginDistrict(e.target.value)}
              className="w-full px-3 py-2.5 bg-earth-50 border border-earth-300 rounded-xl text-xs sm:text-sm font-semibold text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500"
            >
              {BANGLADESH_DISTRICTS.map((d) => (
                <option key={d.id} value={d.nameEn}>
                  {language === "bn" ? `${d.nameBn} (${d.division})` : `${d.nameEn} (${d.division})`}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Unit Switcher */}
          <div>
            <label className="block text-xs font-bold text-earth-700 mb-1.5">
              {language === "bn" ? "৩. ফসলের পরিমাণ" : "3. Harvest Volume"}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                value={quantityInput}
                onChange={(e) => setQuantityInput(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2.5 bg-earth-50 border border-earth-300 rounded-xl text-xs sm:text-sm font-semibold text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="px-2.5 py-2.5 bg-earth-100 border border-earth-300 rounded-xl text-xs font-bold text-earth-800"
              >
                <option value="kg">{language === "bn" ? "কেজি" : "kg"}</option>
                <option value="mon">{language === "bn" ? "মণ (৪০ কেজি)" : "maund"}</option>
                <option value="ton">{language === "bn" ? "টন (১০০০ কেজি)" : "ton"}</option>
              </select>
            </div>
            <p className="text-[10px] text-earth-400 mt-1">
              = {totalQuantityKg.toLocaleString()} {language === "bn" ? "কেজি মোট ওজন" : "kg total"}
            </p>
          </div>

          {/* Vehicle Type Selector */}
          <div>
            <label className="block text-xs font-bold text-earth-700 mb-1.5">
              {language === "bn" ? "৪. পরিবহনের ধরন" : "4. Vehicle & Logistics"}
            </label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-earth-50 border border-earth-300 rounded-xl text-xs sm:text-sm font-semibold text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500"
            >
              <option value="covered_van">
                {language === "bn" ? "কাভার্ড ভ্যান (বৃষ্টি ও রোদ সুরক্ষিত)" : "Covered Van (Weatherproof)"}
              </option>
              <option value="pickup">
                {language === "bn" ? "খোলা পিকআপ (ছোট ও মাঝারি লট)" : "Open Pickup (Small-Med Lot)"}
              </option>
              <option value="truck_10ton">
                {language === "bn" ? "১০ টন বড় ট্রাক (বাল্ক সাশ্রয়ী ভাড়া)" : "10-Ton Truck (Bulk Logistics)"}
              </option>
              <option value="local_trolley">
                {language === "bn" ? "স্থানীয় ট্রলি/নসিমন (স্বল্প দূরত্ব)" : "Local Trolley (Short-haul)"}
              </option>
            </select>
          </div>
        </div>

        {/* Advanced Pricing & Commission Customization Toggle */}
        <div className="pt-2 border-t border-earth-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-earth-700">
              <input
                type="checkbox"
                checked={useCustomPrice}
                onChange={(e) => setUseCustomPrice(e.target.checked)}
                className="w-4 h-4 text-agri-700 rounded border-earth-300 focus:ring-agri-500"
              />
              <span>{language === "bn" ? "কাস্টম বিক্রয় দর প্রবেশ করান" : "Override with Custom Price"}</span>
            </label>

            {useCustomPrice && (
              <div className="flex items-center gap-1.5">
                <span className="text-earth-500">৳</span>
                <input
                  type="number"
                  min={1}
                  value={customPrice}
                  onChange={(e) => setCustomPrice(Math.max(1, Number(e.target.value)))}
                  className="w-20 px-2 py-1 bg-white border border-earth-300 rounded-lg text-xs font-bold text-earth-900"
                />
                <span className="text-earth-500">{language === "bn" ? "/কেজি" : "/kg"}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-earth-600">
            <span>{language === "bn" ? "আড়তদারি কমিশন:" : "Aratdar Fee:"}</span>
            <select
              value={customFeePercent}
              onChange={(e) => setCustomFeePercent(Number(e.target.value))}
              className="px-2 py-1 bg-earth-50 border border-earth-200 rounded-lg text-xs font-semibold text-earth-800"
            >
              <option value={1.5}>১.৫% (আড়ত সাধারণ দর)</option>
              <option value={2.0}>২.০% (স্ট্যান্ডার্ড কমিশন)</option>
              <option value={3.0}>৩.০% (বিশেষ মোড়কীকরণসহ)</option>
              <option value={0}>০% (সরাসরি প্রাতিষ্ঠানিক বিক্রয়)</option>
            </select>
          </div>
        </div>

        {/* Comparison Cards: Top 3 Markets */}
        {loading ? (
          <div className="py-12 text-center text-earth-400 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-agri-600" />
            <span>{language === "bn" ? "সেরা মোকামগুলোর নিট লাভ হিসাব করা হচ্ছে..." : "Computing optimal net-return markets..."}</span>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="py-12 text-center text-earth-400 text-sm">
            {language === "bn" ? "কোনো বাজার তথ্য পাওয়া যায়নি।" : "No market data found for this selection."}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recommendations.slice(0, 3).map((rec, index) => {
                const isTopRank = index === 0;
                return (
                  <div
                    key={rec.marketId}
                    className={`rounded-2xl border p-5 flex flex-col justify-between transition ${
                      isTopRank
                        ? "bg-gradient-to-b from-agri-50/80 to-white border-agri-500 shadow-md ring-2 ring-agri-500/20"
                        : "bg-white border-earth-200 hover:border-earth-300"
                    }`}
                  >
                    <div>
                      {/* Top Rank Badge */}
                      <div className="flex items-center justify-between mb-3">
                        {isTopRank ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-agri-700 text-white shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {language === "bn" ? "১ম সেরা নিট লাভ" : "#1 Best Net Return"}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-earth-500">
                            {language === "bn" ? `বিকল্প #${index + 1}` : `Option #${index + 1}`}
                          </span>
                        )}

                        <span className="text-[11px] font-semibold text-earth-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-agri-600" />
                          {rec.distanceKm} km
                        </span>
                      </div>

                      {/* Market Title */}
                      <h3 className="text-base font-bold text-earth-900 leading-normal">
                        {language === "bn" ? rec.marketNameBn : rec.marketName}
                      </h3>
                      <p className="text-xs text-earth-500 mt-0.5">
                        {language === "bn" ? rec.districtBn : rec.district} ({rec.priceSource} Verified)
                      </p>

                      {/* Estimated Net Return Highlight */}
                      <div className="my-4 p-3.5 bg-earth-50 rounded-xl border border-earth-200">
                        <div className="text-[11px] text-earth-500 font-medium">
                          {language === "bn" ? "চূড়ান্ত নিট মুনাফা (হাতে থাকবে):" : "Net Take-Home Return:"}
                        </div>
                        <div className="text-2xl font-black text-agri-800 mt-0.5">
                          ৳{rec.netEstimatedReturn.toLocaleString()}
                        </div>
                        <div className="text-[11px] font-bold text-agri-700 mt-1">
                          {language === "bn"
                            ? `প্রতি কেজিতে নিট ৳${(rec.netEstimatedReturn / totalQuantityKg).toFixed(1)} (${rec.netMarginPercentage}% মার্জিন)`
                            : `Net BDT ${(rec.netEstimatedReturn / totalQuantityKg).toFixed(1)}/kg (${rec.netMarginPercentage}% margin)`}
                        </div>
                      </div>

                      {/* Detailed Math Breakdown */}
                      <div className="space-y-1.5 text-xs text-earth-600 border-t border-earth-100 pt-3 mb-4">
                        <div className="flex justify-between">
                          <span>{language === "bn" ? "পাইকারি বিক্রয় দর:" : "Wholesale Price:"}</span>
                          <span className="font-bold text-earth-900">৳{rec.marketPricePerKg}/kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{language === "bn" ? "মোট বিক্রয় রাজস্ব:" : "Gross Revenue:"}</span>
                          <span className="font-semibold text-earth-800">৳{rec.grossRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <span>{language === "bn" ? `পরিবহন ব্যয় (${rec.distanceKm} কিমি):` : `Transport (${rec.distanceKm} km):`}</span>
                          <span className="font-bold">-৳{rec.transportCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <span>{language === "bn" ? "আড়তদারি ও কুলি খরচ:" : "Aratdar & Handling:"}</span>
                          <span className="font-bold">-৳{rec.otherCosts.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Rationale */}
                    <div className="bg-earth-100/70 p-3 rounded-xl border border-earth-200 text-xs text-earth-700 leading-relaxed">
                      <div className="text-[10px] font-bold text-agri-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-agri-600" />
                        <span>{language === "bn" ? "এআই পরামর্শ ও কারণ" : "AI Rationale"}</span>
                      </div>
                      <p className="text-[11px]">
                        {language === "bn" ? rec.aiRationaleBn : rec.aiRationale}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Profit Margin Advantage Note */}
            {recommendations.length >= 2 && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    {language === "bn"
                      ? `🏆 মোকাম #${1} (${recommendations[0].marketNameBn})-এ বিক্রি করলে বিকল্প মোকাম #${2}-এর চেয়ে আপনার অতিরিক্ত নিট মুনাফা হবে ৳${Math.max(0, recommendations[0].netEstimatedReturn - recommendations[1].netEstimatedReturn).toLocaleString()} টাকা!`
                      : `🏆 Choosing Market #1 (${recommendations[0].marketName}) yields BDT ${Math.max(0, recommendations[0].netEstimatedReturn - recommendations[1].netEstimatedReturn).toLocaleString()} extra net profit over Option #2!`}
                  </span>
                </div>
                <button
                  onClick={handleCopySummary}
                  className="font-bold text-emerald-800 hover:underline shrink-0"
                >
                  {language === "bn" ? "হিসাব সেভ করুন →" : "Save Breakdown →"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Transparent Methodology Disclaimer */}
        <div className="flex items-start gap-2.5 bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            {language === "bn"
              ? "⚠️ পরিবহন ও নিট মুনাফা হিসাবের কাঠামো: বাংলাদেশ আন্তঃজেলা কাভার্ড ভ্যান ও পিকআপ ভাড়ার প্রমিত কাঠামোর উপর ভিত্তি করে হিসাব করা হয়েছে। স্থানীয় হাটে তাৎক্ষণিক দরকষাকষি ও জ্বালানি মূল্যের তারতম্যে প্রকৃত খরচ কিছুটা কম-বেশি হতে পারে। কৃষক সর্বদা নিজ বিবেচনায় সিদ্ধান্ত নেবেন।"
              : "⚠️ Methodology: Freight rates are modeled on inter-district haulage tariffs for Bangladesh highways. Real freight may fluctuate with fuel spot prices and return-trip availability."}
          </p>
        </div>
      </div>
    </div>
  );
}
