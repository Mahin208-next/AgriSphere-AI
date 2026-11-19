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
  AlertCircle,
  LogOut,
  ChevronLeft,
  Server,
  FileCheck,
  Globe2,
  ExternalLink,
  Eye,
  EyeOff
} from "lucide-react";

export default function AdminPage() {
  const { currentUser, isAdmin, adminLogin, adminLogout, language, setLanguage } = useApp();
  const [passkey, setPasskey] = useState("admin2026");
  const [showPasskey, setShowPasskey] = useState(false);
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

  // If already authenticated as Platform Admin: Render Separated Admin Portal
  if (isAdmin && currentUser?.role === "admin") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
        {/* Dedicated Admin Portal Navigation Bar */}
        <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3.5 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            {/* Left: Brand & Secure Badge */}
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="KrishiSetu AI"
                  className="h-9 w-auto object-contain bg-white/95 p-1 rounded-lg"
                />
              </Link>
              <div className="h-6 w-px bg-slate-800 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                  {language === "bn" ? "সুপার-অ্যাডমিন কন্ট্রোল রুম" : "Super-Admin Control Room"}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  RESTRICTED
                </span>
              </div>
            </div>

            {/* Right: Actions, Language & Profile */}
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              {/* Language Switcher */}
              <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setLanguage("bn")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                    language === "bn"
                      ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                    language === "en"
                      ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  EN
                </button>
              </div>

              {/* View Public Website */}
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === "bn" ? "ওয়েবসাইট দেখুন" : "View Site"}</span>
              </Link>

              {/* Admin Profile Info */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-white">{currentUser.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">({currentUser.email})</span>
              </div>

              {/* Admin Logout */}
              <button
                onClick={() => adminLogout()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "অ্যাডমিন লগআউট" : "Logout"}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Admin Dashboard Workspace */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AdminDashboard />
        </main>

        {/* Isolated Admin Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/80 px-4 py-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              {language === "bn"
                ? "কৃষিসেতু এআই — সেন্ট্রাল অ্যাডমিনিস্ট্রেটিভ সিস্টেম ও অডিট মনিটর"
                : "KrishiSetu AI — Central Super-Admin Operational Console & Regulatory Suite"}
            </div>
            <div className="text-[11px] font-mono text-slate-600">
              Isolated Gateway: /admin • Node: Production Serverless
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Not authenticated as Admin: Render Dedicated Admin Security Gateway
  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col justify-between font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Gateway Topbar */}
      <header className="px-4 sm:px-8 py-4 flex items-center justify-between border-b border-slate-900 bg-slate-950/50">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="KrishiSetu AI"
            className="h-8 sm:h-9 w-auto object-contain bg-white/95 p-1 rounded-lg"
          />
        </Link>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setLanguage("bn")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                language === "bn"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              বাংলা
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                language === "en"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              EN
            </button>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>{language === "bn" ? "ওয়েবসাইট" : "Site"}</span>
          </Link>
        </div>
      </header>

      {/* Main Gateway Card */}
      <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6">
        <div className="max-w-md w-full space-y-6">
          {/* Gateway Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex p-3 rounded-2xl bg-slate-900 border border-slate-800 text-amber-400 shadow-xl shadow-amber-500/5">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-2">
                🔒 Super Administrator Gateway
              </span>
              <h1 className="text-2xl font-extrabold leading-normal text-white">
                {language === "bn" ? "প্ল্যাটফর্ম অ্যাডমিন সিকিউরিটি গেটওয়ে" : "Platform Administrator Gateway"}
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {language === "bn"
                  ? "এই পোর্টালটি শুধুমাত্র প্ল্যাটফর্ম নিয়ন্ত্রকদের জন্য। সাধারণ ব্যবহারকারীরা পাবলিক সাইট ব্রাউজ করবেন।"
                  : "Restricted administrative zone. Public users should access via standard portal."}
              </p>
            </div>
          </div>

          {/* Security Login Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-5">
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
                    className="w-full px-3 py-2 text-xs border border-slate-800 rounded-lg bg-slate-950 text-slate-400 cursor-not-allowed font-mono"
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
                    type={showPasskey ? "text" : "password"}
                    required
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    placeholder="পাসকি লিখুন (যেমন: admin2026)"
                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-700 rounded-lg bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasskey(!showPasskey)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                  >
                    {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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

      {/* Gateway Footer */}
      <footer className="px-4 py-3 text-center text-xs text-slate-600 border-t border-slate-900">
        KrishiSetu AI • Super-Admin Security Subsystem
      </footer>
    </div>
  );
}
