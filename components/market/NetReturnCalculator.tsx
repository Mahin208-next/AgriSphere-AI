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
  Scale
} from "lucide-react";

export default function NetReturnCalculator() {
  const { language, t } = useApp();
  const [cropId, setCropId] = useState<string>("green_chilli");
  const [originDistrict, setOriginDistrict] = useState<string>("Bogura");
  const [quantityKg, setQuantityKg] = useState<number>(2000);
  const [loading, setLoading] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<MarketRecommendation[]>([]);
  const [formulaNotice, setFormulaNotice] = useState<string>("");

  const calculateRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/recommendations/markets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropId,
          originDistrict,
          quantityKg,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations || []);
        setFormulaNotice(data.formula);
      }
    } catch (e) {
      console.error("Error calculating net return:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateRecommendations();
  }, [cropId, originDistrict, quantityKg]);

  return (
    <div className="bg-white rounded-2xl border border-earth-200 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-earth-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-agri-100 text-agri-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-agri-600" />
            <span>{t.market.netReturnCalc}</span>
          </div>
          <h2 className="text-xl font-bold text-earth-900">
            {language === "bn" ? "সর্বোচ্চ নিট মুনাফা গন্তব্য ক্যালকুলেটর" : "AI Optimal Selling Destination Engine"}
          </h2>
          <p className="text-xs text-earth-500 mt-1">
            {language === "bn"
              ? "বাজার দর, সড়ক দূরত্ব, পরিবহন ভাড়া ও আড়তদারি কমিশন বাদ দিয়ে আপনার প্রকৃত নিট লাভ তুলনা করুন।"
              : "Compare real net margins across regional and terminal markets accounting for freight and handling."}
          </p>
        </div>

        {/* Formula Badge */}
        <div className="bg-earth-50 border border-earth-200 rounded-xl p-3 text-xs text-earth-700">
          <div className="text-[11px] font-bold text-earth-500 uppercase tracking-wider mb-0.5">
            {language === "bn" ? "হিসাব সূত্র (Formula):" : "Core Return Formula:"}
          </div>
          <div className="font-mono text-xs font-bold text-agri-800">
            Net Return = (Market Price × Qty) - Transport - Handling
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block text-xs font-bold text-earth-700 mb-1.5">
            {t.market.selectCrop}
          </label>
          <select
            value={cropId}
            onChange={(e) => setCropId(e.target.value)}
            className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl text-sm font-semibold text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500"
          >
            {CROPS_DATA.map((c) => (
              <option key={c.id} value={c.id}>
                {language === "bn" ? `${c.nameBn} (${c.nameEn})` : `${c.nameEn} (${c.nameBn})`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-earth-700 mb-1.5">
            {language === "bn" ? "ফসলের উৎপত্তিস্থল (আপনার জেলা)" : "Origin District"}
          </label>
          <select
            value={originDistrict}
            onChange={(e) => setOriginDistrict(e.target.value)}
            className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl text-sm font-semibold text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500"
          >
            {BANGLADESH_DISTRICTS.map((d) => (
              <option key={d.id} value={d.nameEn}>
                {language === "bn" ? `${d.nameBn} (${d.division})` : `${d.nameEn} (${d.division})`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-earth-700 mb-1.5">
            {language === "bn" ? "মোট ফসলের পরিমাণ (কেজি)" : "Crop Volume (kg)"}
          </label>
          <input
            type="number"
            min={100}
            step={100}
            value={quantityKg}
            onChange={(e) => setQuantityKg(Math.max(50, Number(e.target.value)))}
            className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl text-sm font-semibold text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500"
          />
        </div>
      </div>

      {/* Comparison Cards */}
      {loading ? (
        <div className="py-12 text-center text-earth-400 text-sm">
          {t.common.loading}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="py-12 text-center text-earth-400 text-sm">
          {language === "bn" ? "কোনো বাজার তথ্য পাওয়া যায়নি।" : "No market data found for this selection."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {recommendations.slice(0, 3).map((rec, index) => {
            const isTopRank = index === 0;
            return (
              <div
                key={rec.marketId}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition ${
                  isTopRank
                    ? "bg-gradient-to-b from-agri-50/70 to-white border-agri-400 shadow-md ring-2 ring-agri-500/20"
                    : "bg-white border-earth-200 hover:border-earth-300"
                }`}
              >
                <div>
                  {/* Top Rank Badge */}
                  <div className="flex items-center justify-between mb-3">
                    {isTopRank ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-agri-600 text-white shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {language === "bn" ? "১ম সেরা নিট লাভ" : "#1 Best Net Return"}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-earth-500">
                        {language === "bn" ? `বিকল্প #${index + 1}` : `Option #${index + 1}`}
                      </span>
                    )}

                    <span className="text-[11px] font-semibold text-earth-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-agri-600" />
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
                      {t.market.netReturn}
                    </div>
                    <div className="text-2xl font-black text-agri-800 mt-0.5">
                      ৳{rec.netEstimatedReturn.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-semibold text-agri-700 mt-1">
                      {language === "bn"
                        ? `প্রতি কেজিতে নিট লাভ ৳${(rec.netEstimatedReturn / quantityKg).toFixed(1)} (${rec.netMarginPercentage}% মার্জিন)`
                        : `Net BDT ${(rec.netEstimatedReturn / quantityKg).toFixed(1)}/kg (${rec.netMarginPercentage}% margin)`}
                    </div>
                  </div>

                  {/* Detailed Math Breakdown */}
                  <div className="space-y-1.5 text-xs text-earth-600 border-t border-earth-100 pt-3 mb-4">
                    <div className="flex justify-between">
                      <span>{language === "bn" ? "পাইকারি দর:" : "Wholesale Price:"}</span>
                      <span className="font-bold text-earth-800">৳{rec.marketPricePerKg}/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t.market.grossRevenue}:</span>
                      <span className="font-semibold text-earth-800">৳{rec.grossRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>{t.market.transportEst} ({rec.distanceKm} km):</span>
                      <span className="font-semibold">-৳{rec.transportCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>{t.market.handlingEst}:</span>
                      <span className="font-semibold">-৳{rec.otherCosts.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* AI Rationale */}
                <div className="bg-earth-100/60 p-3 rounded-xl border border-earth-200 text-xs text-earth-700 leading-relaxed">
                  <div className="text-[10px] font-bold text-agri-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-agri-600" />
                    <span>{t.market.aiRecommendation}</span>
                  </div>
                  <p className="text-[11px]">
                    {language === "bn" ? rec.aiRationaleBn : rec.aiRationale}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Calibration and disclaimer notice */}
      <div className="mt-6 flex items-start gap-2 bg-amber-50/60 p-3 rounded-xl border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p>
          {language === "bn"
            ? "⚠️ দ্রষ্টব্য: পরিবহন ব্যয় বাংলাদেশ আন্তঃজেলা কাভার্ড ভ্যান ও পিকআপ ভাড়ার প্রমিত কাঠামোর উপর ভিত্তি করে হিসাব করা হয়েছে। স্থানীয় হাটে তাৎক্ষণিক দরকষাকষি ও জ্বালানি মূল্যের তারতম্যে প্রকৃত খরচ কিছুটা কম-বেশি হতে পারে। কৃষক সর্বদা নিজ বিবেচনায় সিদ্ধান্ত নেবেন।"
            : "⚠️ Note: Freight and handling estimates are modeled on typical Bangladesh inter-district haulage tariffs. The farmer always retains ultimate discretion over where and when to sell."}
        </p>
      </div>
    </div>
  );
}

