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
  LogOut,
  Sprout,
  ShoppingBag,
  Building2,
  Store,
  Globe2,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import { UserRole } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, currentRole, allUsers, switchUserRole, loginByRole, logout, language, t } = useApp();

  useEffect(() => {
    if (currentUser?.role === "admin") {
      router.replace("/admin");
    }
  }, [currentUser, router]);

  // If visitor is NOT logged in: Show Access Gate
  if (!currentUser) {
    const quickRoles: { role: UserRole; nameBn: string; nameEn: string; icon: React.ElementType; color: string; bg: string }[] = [
      { role: "farmer", nameBn: "কৃষক (Farmer)", nameEn: "Farmer", icon: Sprout, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
      { role: "buyer", nameBn: "পাইকারি ক্রেতা (Buyer)", nameEn: "Wholesaler", icon: ShoppingBag, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
      { role: "factory", nameBn: "এগ্রো-মিল (Factory)", nameEn: "Mill Owner", icon: Building2, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
      { role: "retailer", nameBn: "সুপারশপ (Retailer)", nameEn: "Supermarket", icon: Store, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
      { role: "exporter", nameBn: "রপ্তানিকারক (Exporter)", nameEn: "Exporter", icon: Globe2, color: "text-teal-700", bg: "bg-teal-50 border-teal-200" },
    ];

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

          {/* 1-Click Role Testing Quick Access for Evaluators */}
          <div className="pt-6 border-t border-earth-100 space-y-3 text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-earth-700 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-harvest-600" />
              <span>
                {language === "bn" ? "বা দ্রুত ১-ক্লিকে ভূমিকা নির্বাচন করে প্রবেশ করুন:" : "Or 1-click test entry by role:"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {quickRoles.map((qr) => {
                const Icon = qr.icon;
                return (
                  <button
                    key={qr.role}
                    onClick={() => loginByRole(qr.role)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold text-earth-800 hover:bg-white hover:shadow-xs transition ${qr.bg}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${qr.color}`} />
                    <span className="truncate">{language === "bn" ? qr.nameBn : qr.nameEn}</span>
                  </button>
                );
              })}
            </div>
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

  // Public roles only in switcher (exclude Admin from public dashboard switcher)
  const publicUsers = allUsers.filter((u) => u.role !== "admin");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Active User Top Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-earth-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-agri-50 border border-agri-200 flex items-center justify-center text-agri-700">
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
          {/* Role switcher for quick judge preview */}
          <div className="hidden md:flex items-center gap-1.5 text-xs">
            <span className="text-earth-500 text-[11px] font-medium mr-1">
              {language === "bn" ? "রোল পরিবর্তন:" : "Switch Role:"}
            </span>
            {publicUsers.map((u) => {
              const isSelected = u.id === currentUser?.id;
              return (
                <button
                  key={u.id}
                  onClick={() => switchUserRole(u.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    isSelected
                      ? "bg-agri-800 text-white font-bold shadow-xs"
                      : "bg-earth-100 text-earth-600 hover:bg-earth-200 hover:text-earth-900"
                  }`}
                >
                  {t.roles[u.role] || u.role}
                </button>
              );
            })}
          </div>

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
