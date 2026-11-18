"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  KeyRound,
  ArrowRight,
  Sparkles,
  AlertCircle,
  LogOut,
  ChevronLeft,
  Server,
  FileCheck
} from "lucide-react";

export default function AdminPage() {
  const { currentUser, isAdmin, adminLogin, adminLogout, language } = useApp();
  const [passkey, setPasskey] = useState("admin2026");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAdminAuth = async (e?: React.FormEvent, customKey?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const keyToUse = customKey || passkey;
    const res = await adminLogin(keyToUse);
    if (!res.success) {
      setErrorMsg(
        res.error ||
          (language === "bn"
            ? "ভুল অ্যাডমিন পাসকি। সঠিক পাসকি দিয়ে পুনরায় চেষ্টা করুন।"
            : "Invalid administrator passkey. Please check and retry.")
      );
    }
    setLoading(false);
  };

  // If already authenticated as Platform Admin
  if (isAdmin && currentUser?.role === "admin") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Admin Active Session Bar */}
        <div className="bg-earth-900 text-white p-4 rounded-2xl shadow-md border border-earth-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-agri-600/30 border border-agri-500/40 flex items-center justify-center text-agri-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base text-white">
                  {language === "bn" ? "প্ল্যাটফর্ম সুপার-অ্যাডমিন পোর্টাল" : "Platform Super-Admin Gateway"}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded">
                  RESTRICTED ACCESS
                </span>
              </div>
              <p className="text-xs text-earth-300">
                {language === "bn"
                  ? `লগইনকৃত: ${currentUser.name} (${currentUser.email})`
                  : `Authenticated: ${currentUser.name} (${currentUser.email})`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-earth-800 hover:bg-earth-700 text-xs text-earth-200 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{language === "bn" ? "ওয়েবসাইট দেখুন" : "View Site"}</span>
            </Link>

            <button
              onClick={() => adminLogout()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-xs transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === "bn" ? "অ্যাডমিন লগআউট" : "Admin Logout"}</span>
            </button>
          </div>
        </div>

        {/* Loaded Admin Dashboard */}
        <AdminDashboard />
      </div>
    );
  }

  // Not authenticated as Admin: Render Dedicated Admin Login Gateway
  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 bg-[#0f172a] text-white">
      <div className="max-w-md w-full space-y-6">
        {/* Gateway Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-earth-800/80 border border-earth-700 text-amber-400 shadow-lg">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-2">
              🔒 Super Administrator Gateway
            </span>
            <h1 className="text-2xl font-extrabold leading-normal text-white">
              {language === "bn" ? "প্ল্যাটফর্ম অ্যাডমিন সিকিউরিটি গেটওয়ে" : "Platform Administrator Gateway"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {language === "bn"
                ? "এই পোর্টালটি শুধুমাত্র প্ল্যাটফর্ম নিয়ন্ত্রকদের জন্য। পাবলিক ব্যবহারকারীরা সাধারণ লগইন পেজ ব্যবহার করবেন।"
                : "Restricted administrative zone. Public users should access via standard login."}
            </p>
          </div>
        </div>

        {/* Security Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/70 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={(e) => handleAdminAuth(e)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === "bn" ? "অ্যাডমিন আইডি" : "Administrator ID"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value="admin@krishisetu.ai (Platform Controller)"
                  className="w-full px-3 py-2 text-xs border border-slate-700 rounded-lg bg-slate-800/60 text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  {language === "bn" ? "নিরাপত্তা পাসকি (Passkey)" : "Admin Security Passkey"}
                </label>
                <span className="text-[11px] text-amber-400 font-mono">admin2026</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="পাসকি লিখুন (যেমন: admin2026)"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-700 rounded-lg bg-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition disabled:opacity-50"
            >
              <span>
                {loading
                  ? (language === "bn" ? "যাচাই করা হচ্ছে..." : "Authenticating...")
                  : (language === "bn" ? "অ্যাডমিন প্যানেলে প্রবেশ করুন" : "Access Admin Portal")}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Button for Evaluators */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={() => handleAdminAuth(undefined, "admin2026")}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {language === "bn" ? "১-ক্লিকে অ্যাডমিন অনুমোদন (হ্যাকাতন জাজ ডেমো)" : "1-Click Admin Access (Judge Demo)"}
              </span>
            </button>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>{language === "bn" ? "← মূল ওয়েবসাইটে ফিরে যান" : "← Return to Main Website"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
