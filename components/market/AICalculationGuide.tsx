"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { 
  Bot, 
  Sparkles, 
  TrendingUp,
  MessageSquare
} from "lucide-react";

export default function AICalculationGuide() {
  const { language } = useApp();

  return (
    <div className="bg-gradient-to-br from-agri-950 via-agri-900 to-earth-900 text-white rounded-3xl p-5 sm:p-8 md:p-10 shadow-lg border border-agri-800 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-harvest-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-harvest-500/20 border border-harvest-400/30 text-harvest-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === "bn" ? "এআই নিট মুনাফা ক্যালকুলেশন" : "AI Net-Return Arbitrage Engine"}</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-normal">
            {language === "bn"
              ? "এআই দিয়ে কীভাবে নিট মুনাফা ও পরিবহন খরচ হিসাব করবেন?"
              : "How to Calculate Your Net Profit & Transport Costs Using AI"}
          </h2>

          <p className="text-xs sm:text-sm text-agri-200 max-w-2xl mx-auto leading-relaxed">
            {language === "bn"
              ? "জটিল ফরম পূরণের প্রয়োজন নেই! সাধারণ ভাষায় এআই মেসেঞ্জারকে আপনার ফসলের পরিমাণ ও জেলা জানিয়ে দিন — এআই স্বয়ংক্রিয়ভাবে মহাসড়ক দূরত্ব, কাভার্ড ভ্যান ভাড়া ও আড়তদারি কমিশন বাদ দিয়ে সেরা ৩টি মোকামের নিট লাভ হিসাব করে দেবে।"
              : "No rigid forms needed! Just tell our AI assistant your crop volume and location — it automatically computes highway distances, freight costs, and commission to rank the Top 3 highest profit markets for you."}
          </p>
        </div>

        {/* 3 Step Visual Guide Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 sm:p-5 space-y-2.5 sm:space-y-3 hover:bg-white/15 transition">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-harvest-500 text-harvest-950 flex items-center justify-center font-extrabold text-sm shadow-sm">
              ১
            </div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-harvest-400" />
              <span>{language === "bn" ? "এআই মেসেঞ্জার চালু করুন" : "Open AI Messenger"}</span>
            </h3>
            <p className="text-xs text-agri-200 leading-relaxed">
              {language === "bn"
                ? "স্ক্রিনের নিচের ডানদিকের ভাসমান মেসেঞ্জার আইকন অথবা নিচের বাটনে ক্লিক করুন।"
                : "Click the floating Messenger bubble at the bottom right or click the start button below."}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 sm:p-5 space-y-2.5 sm:space-y-3 hover:bg-white/15 transition">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-harvest-500 text-harvest-950 flex items-center justify-center font-extrabold text-sm shadow-sm">
              ২
            </div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-harvest-400" />
              <span>{language === "bn" ? "সাধারণ ভাষায় লিখুন" : "Describe Your Crop"}</span>
            </h3>
            <p className="text-xs text-agri-200 leading-relaxed">
              {language === "bn"
                ? "যেমন: 'আমার ২ টন কাঁচা মরিচ বগুড়া থেকে কোথায় বিক্রি করলে বেশি লাভ?' অথবা '১ টন আলুর লাভ কত?'"
                : "e.g. 'Calculate net return for 2 tons of chilli from Bogura' or 'Where to sell 1 ton of potatoes?'"}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 sm:p-5 space-y-2.5 sm:space-y-3 hover:bg-white/15 transition">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-harvest-500 text-harvest-950 flex items-center justify-center font-extrabold text-sm shadow-sm">
              ৩
            </div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-harvest-400" />
              <span>{language === "bn" ? "সেরা ৩ মোকামের তুলনা পান" : "Instant Top 3 Markets"}</span>
            </h3>
            <p className="text-xs text-agri-200 leading-relaxed">
              {language === "bn"
                ? "এআই পাইকারি দর, কাভার্ড ভ্যান ভাড়া ও আড়তদারি খরচ বাদ দিয়ে আপনার হাতে কত টাকা থাকবে তা জানিয়ে দেবে।"
                : "AI computes gross revenue, fuel/freight costs, and commission to give your exact take-home profit."}
            </p>
          </div>
        </div>

        {/* Calculation Formula Banner */}
        <div className="bg-agri-950/80 border border-agri-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-xs">
          <div className="space-y-1 text-center md:text-left w-full md:w-auto">
            <span className="font-bold text-harvest-400 uppercase tracking-wider text-[10px] sm:text-[11px] block">
              {language === "bn" ? "গাণিতিক হিসাবের সূত্র:" : "Transparent Calculation Formula:"}
            </span>
            <div className="font-mono text-white text-[11px] sm:text-xs md:text-sm font-semibold break-words">
              Net Profit = (Wholesale Price × Qty) − Freight Cost − (Aratdar Fee + Labor)
            </div>
          </div>

          <div className="text-center md:text-right shrink-0">
            <span className="text-[11px] text-agri-300 font-medium">
              {language === "bn" ? "বাংলাদেশ ৬৪ জেলা সড়ক মডেল সমন্বিত" : "Grounded in Bangladesh 64-District Road Model"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
