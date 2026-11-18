"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { TrendingUp, Calculator } from "lucide-react";
import MarketPriceView from "@/components/market/MarketPriceView";
import AICalculationGuide from "@/components/market/AICalculationGuide";

function MarketIntelligenceContent() {
  const { language, t } = useApp();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "prices";
  const [activeTab, setActiveTab] = useState<"prices" | "calculator">(
    initialTab === "calculator" ? "calculator" : "prices"
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-earth-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-agri-100 text-agri-800 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-earth-900">
              {t.market.title}
            </h1>
          </div>
          <p className="text-xs text-earth-500 mt-1 max-w-2xl leading-relaxed">
            {t.market.subtitle}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-earth-200 text-xs shadow-2xs w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab("prices")}
            className={`flex-1 sm:flex-none justify-center px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "prices" ? "bg-agri-700 text-white shadow-xs" : "text-earth-600 hover:text-earth-900"
            }`}
          >
            <TrendingUp className="w-4 h-4 shrink-0" />
            <span>{language === "bn" ? "বাজার দর ও চার্ট" : "Price Trends"}</span>
          </button>

          <button
            onClick={() => setActiveTab("calculator")}
            className={`flex-1 sm:flex-none justify-center px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "calculator" ? "bg-agri-700 text-white shadow-xs" : "text-earth-600 hover:text-earth-900"
            }`}
          >
            <Calculator className="w-4 h-4 shrink-0" />
            <span>{language === "bn" ? "এআই নিট মুনাফা ক্যালকুলেটর" : "AI Net-Return Engine"}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Body */}
      {activeTab === "prices" ? (
        <MarketPriceView />
      ) : (
        <AICalculationGuide />
      )}
    </div>
  );
}

export default function MarketIntelligencePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-earth-400">Loading Market Intelligence...</div>}>
      <MarketIntelligenceContent />
    </Suspense>
  );
}
