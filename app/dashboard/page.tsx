"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import FarmerDashboard from "@/components/dashboard/FarmerDashboard";
import BuyerDashboard from "@/components/dashboard/BuyerDashboard";
import ExportRadarView from "@/components/export/ExportRadarView";
import {
  UserCheck,
  Lock,
  ArrowRight,
  LogOut
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, currentRole, logout, language, t } = useApp();

  useEffect(() => {
    if (currentUser?.role === "admin") {
      router.replace("/admin");
    }
  }, [currentUser, router]);

  // If visitor is NOT logged in: Show Access Gate
  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="bg-white rounded-3xl border border-earth-200 shadow-sm p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div className="max-w-lg mx-auto space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-earth-100 text-earth-700">
              {language === "bn" ? "প্রবেশাধিকার সংরক্ষিত" : "Role Protected Portal"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-earth-900 leading-normal">
              {language === "bn" ? "ড্যাশবোর্ড দেখতে লগইন করুন" : "Please Sign In to Access Dashboard"}
            </h1>
            <p className="text-sm text-earth-600">
              {language === "bn"
                ? "কৃষক, পাইকারি ক্রেতা, মিল মালিক বা রপ্তানিকারক হিসেবে লগইন করে আপনার ব্যক্তিগত ড্যাশবোর্ড, লাইভ নিলাম ও বাল্ক অর্ডার পরিচালনা করুন।"
                : "Sign in with your verified business role to manage your crops, live auctions, bids, and procurement contracts."}
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login?redirect=/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-agri-800 hover:bg-agri-900 text-white font-bold text-sm shadow-sm transition"
            >
              <span>{language === "bn" ? "লগইন পেজে যান" : "Go to Login Page"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Public Notice */}
        <div className="text-center text-xs text-earth-500">
          <Link href="/marketplace" className="text-agri-700 font-semibold hover:underline">
            {language === "bn" ? "← মূল মার্কেটপ্লেস ঘুরে দেখুন" : "← Explore Public Marketplace"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Active User Top Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-earth-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-agri-50 border border-agri-200 flex items-center justify-center text-agri-700 shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-earth-900">
                {language === "bn" ? (currentUser.nameBn || currentUser.name) : currentUser.name}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-agri-100 text-agri-800 border border-agri-200">
                {t.roles[currentRole || "farmer"] || currentRole}
              </span>
            </div>
            <p className="text-[11px] text-earth-500">
              {currentUser.companyName || currentUser.district} • {currentUser.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => logout()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-earth-100 hover:bg-red-50 hover:text-red-700 text-earth-700 text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{language === "bn" ? "লগআউট" : "Logout"}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Role-Based View */}
      {currentRole === "farmer" && <FarmerDashboard />}
      {(currentRole === "buyer" || currentRole === "factory" || currentRole === "retailer") && <BuyerDashboard />}
      {(currentRole === "exporter" || currentRole === "importer") && <ExportRadarView />}
    </div>
  );
}
