"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { Sprout, ShieldCheck, HeartHandshake, FileText, CheckCircle2 } from "lucide-react";

export default function Footer() {
  const { language, t } = useApp();

  return (
    <footer className="bg-earth-900 text-earth-300 pt-12 pb-8 border-t border-earth-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-agri-600 flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-base tracking-tight">AgriSphere</span>
            </div>
            <p className="text-xs text-earth-400 leading-relaxed">
              {t.tagline}. {language === "bn" ? "কৃষক ও প্রাতিষ্ঠানিক ক্রেতাদের মাঝে সরাসরি দ্বিমুখী ডিজিটাল বিপণন ও এআই বাজার বুদ্ধিমত্তা।" : "A unified two-way agricultural trading and decision intelligence platform for Bangladesh."}
            </p>
            <div className="flex items-center gap-2 text-xs text-harvest-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>{language === "bn" ? "আন্তর্জাতিক বিল্ডার হ্যাকাথন প্রোটোটাইপ" : "International Builder Hackathon MVP"}</span>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              {language === "bn" ? "মূল প্ল্যাটফর্ম ফিচার" : "Core Innovations"}
            </h4>
            <ul className="space-y-2 text-xs text-earth-400">
              <li>
                <Link href="/auctions" className="hover:text-agri-400 transition">
                  {language === "bn" ? "১. কৃষকের লাইভ নিলাম (System A)" : "1. Farmer Live Auctions (System A)"}
                </Link>
              </li>
              <li>
                <Link href="/procurement" className="hover:text-agri-400 transition">
                  {language === "bn" ? "২. ক্রেতার পাইকারি চাহিদা (System B)" : "2. Buyer Reverse Demands (System B)"}
                </Link>
              </li>
              <li>
                <Link href="/market-intelligence" className="hover:text-agri-400 transition">
                  {language === "bn" ? "৩. জাতীয় বাজার দর (DAM Data)" : "3. National Market Prices (DAM BD)"}
                </Link>
              </li>
              <li>
                <Link href="/market-intelligence?tab=calculator" className="hover:text-agri-400 transition">
                  {language === "bn" ? "৪. এআই নিট মুনাফা মডেল" : "4. AI Net-Return Engine"}
                </Link>
              </li>
              <li>
                <Link href="/export" className="hover:text-agri-400 transition">
                  {language === "bn" ? "৫. গ্লোবাল এক্সপোর্ট রাডার" : "5. Global Export Radar"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Target Crops & Coverage */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              {language === "bn" ? "প্রাথমিক কাভার্ড ফসল" : "Initial Priority Crops"}
            </h4>
            <ul className="space-y-2 text-xs text-earth-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-agri-500" />
                <span>{language === "bn" ? "কাঁচা মরিচ (Green Chilli)" : "Green Chilli (কাঁচা মরিচ)"}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-agri-500" />
                <span>{language === "bn" ? "শসা (Cucumber)" : "Cucumber (শসা)"}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-agri-500" />
                <span>{language === "bn" ? "মিষ্টি কুমড়া (Sweet Pumpkin)" : "Sweet Pumpkin (মিষ্টি কুমড়া)"}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-agri-500" />
                <span>{language === "bn" ? "টমেটো ও আলু (Tomato & Potato)" : "Tomato & Potato (টমেটো ও আলু)"}</span>
              </li>
            </ul>
          </div>

          {/* Responsible Innovation Disclaimer */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              {language === "bn" ? "নীতিমালা ও দায়িত্বশীলতা" : "Product Principles"}
            </h4>
            <div className="p-3 bg-earth-800 rounded-lg text-[11px] text-earth-400 leading-relaxed space-y-1.5">
              <p>
                {language === "bn"
                  ? "• কৃষক ক্ষমতায়ন ও মূল্যের স্বচ্ছতা নিশ্চিতকরণ।"
                  : "• Farmer empowerment and transparent market discovery."}
              </p>
              <p>
                {language === "bn"
                  ? "• এআই সিদ্ধান্ত সহায়তাকারী, কৃষকের সম্মতির বিকল্প নয়।"
                  : "• AI assists decisions; the farmer always retains final control."}
              </p>
              <p>
                {language === "bn"
                  ? "• কোনো ভুয়া ক্রেতা বা কৃত্রিম মূল্য দাবি করা হয় না।"
                  : "• Demonstrations clearly differentiate demo and verified DAM records."}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-earth-800 flex flex-col sm:flex-row items-center justify-between text-xs text-earth-500 gap-2">
          <p>© 2026 AgriSphere MarketLink AI. FarmMarket Challenge MVP.</p>
          <p className="flex items-center gap-1">
            <span>Powered by Next.js, Tailwind CSS & Department of Agricultural Marketing (DAM) Open Records</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
