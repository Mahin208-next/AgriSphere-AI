"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Sprout,
  Gavel,
  TrendingUp,
  Building2,
  Globe2,
  LayoutDashboard,
  UserCheck,
  Menu,
  X,
  ShoppingBag,
  LogIn,
  LogOut,
  ShieldCheck
} from "lucide-react";

export default function Header() {
  const { currentUser, currentRole, language, setLanguage, t, logout } = useApp();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Isolate Admin Panel: Do not render standard consumer header on /admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navLinks = [
    { href: "/", label: t.nav.home, shortBn: "মূলপাতা", shortEn: "Home", icon: Sprout },
    { href: "/marketplace", label: t.nav.marketplace, shortBn: "বাজার", shortEn: "Market", icon: ShoppingBag },
    { href: "/auctions", label: t.nav.auctions, shortBn: "নিলাম", shortEn: "Auctions", icon: Gavel, isLive: true },
    { href: "/market-intelligence", label: t.nav.prices, shortBn: "বাজার দর", shortEn: "Prices", icon: TrendingUp },
    { href: "/procurement", label: t.nav.procurement, shortBn: "চাহিদা", shortEn: "Demands", icon: Building2 },
    { href: "/export", label: t.nav.export, shortBn: "রপ্তানি", shortEn: "Export", icon: Globe2 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-earth-200 shadow-2xs w-full max-w-full">
      {/* Main Header Container with Responsive Padding */}
      <div className="w-full max-w-[1920px] mx-auto px-2 sm:px-4 md:px-5 lg:px-4 xl:px-6 2xl:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-16 gap-1 sm:gap-2 lg:gap-2.5 xl:gap-3 2xl:gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group py-1 shrink-0">
            <img
              src="/logo.png"
              alt="KrishiSetu AI"
              className="h-7 sm:h-8 md:h-8.5 xl:h-9.5 2xl:h-10 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          {/* Desktop Navigation - Smart Responsive for 1024px+ Laptops */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 2xl:gap-1.5 shrink-0">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center gap-1 xl:gap-1.5 px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 py-1 xl:py-1.5 rounded-lg text-xs 2xl:text-sm font-medium whitespace-nowrap transition ${
                    isActive
                      ? "bg-agri-50 text-agri-800 font-semibold"
                      : "text-earth-600 hover:text-agri-800 hover:bg-earth-50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 ${isActive ? "text-agri-700" : "text-earth-400"}`} />
                  {/* Full label on wide screens (xl+), smart compact label on 1024px laptops */}
                  <span className="hidden xl:inline">{item.label}</span>
                  <span className="inline xl:hidden">{language === "bn" ? item.shortBn : item.shortEn}</span>
                  {item.isLive && (
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls - Tight & Protected from Overflows */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2.5 2xl:gap-3 shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center bg-earth-100 rounded-lg p-0.5 text-xs font-semibold border border-earth-200 shrink-0">
              <button
                type="button"
                onClick={() => setLanguage("bn")}
                className={`px-2 py-0.5 xl:px-2.5 xl:py-1 rounded-md text-[11px] xl:text-xs transition ${
                  language === "bn"
                    ? "bg-agri-700 text-white shadow-xs font-bold"
                    : "text-earth-600 hover:text-earth-900"
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2 py-0.5 xl:px-2.5 xl:py-1 rounded-md text-[11px] xl:text-xs transition ${
                  language === "en"
                    ? "bg-agri-700 text-white shadow-xs font-bold"
                    : "text-earth-600 hover:text-earth-900"
                }`}
              >
                EN
              </button>
            </div>

            {/* User Session State */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
                {/* Unified User Profile & Dashboard Navigation Pill */}
                <Link
                  href={currentRole === "admin" ? "/admin" : "/dashboard"}
                  className="flex items-center gap-1.5 px-2 xl:px-2.5 py-1 xl:py-1.5 rounded-xl bg-agri-50 hover:bg-agri-100 border border-agri-200 text-xs transition shrink-0 group"
                  title={t.nav.dashboard}
                >
                  <div className="w-5.5 h-5.5 xl:w-6 xl:h-6 rounded-full bg-agri-700 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                    {currentUser.role === "admin" ? (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5" />
                    )}
                  </div>
                  {/* Full details on 2xl screens */}
                  <div className="text-left hidden 2xl:block">
                    <div className="font-bold text-earth-900 text-xs truncate max-w-[100px]">
                      {language === "bn" ? (currentUser.nameBn || currentUser.name) : currentUser.name}
                    </div>
                    <div className="text-[10px] uppercase font-semibold text-agri-700 truncate max-w-[100px]">
                      {t.roles[currentRole || "farmer"] || currentRole}
                    </div>
                  </div>
                  {/* Concise dashboard trigger on laptops */}
                  <div className="flex items-center gap-1 font-bold text-[11px] xl:text-xs text-agri-800">
                    <LayoutDashboard className="w-3.5 h-3.5 text-agri-700 shrink-0" />
                    <span className="2xl:hidden">{t.nav.dashboard}</span>
                  </div>
                </Link>

                {/* Separate Dashboard Button on very wide desktop screens (2xl) */}
                <Link
                  href={currentRole === "admin" ? "/admin" : "/dashboard"}
                  className="hidden 2xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-semibold shadow-sm transition whitespace-nowrap shrink-0"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.nav.dashboard}</span>
                </Link>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={() => logout()}
                  title={language === "bn" ? "লগআউট" : "Logout"}
                  className="p-1.5 xl:p-2 rounded-xl text-earth-500 hover:text-red-600 hover:bg-red-50 border border-earth-200 transition shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 xl:px-4 py-1.5 xl:py-2 rounded-xl bg-agri-800 hover:bg-agri-900 text-white text-xs font-bold shadow-sm transition whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span>{language === "bn" ? "লগইন করুন" : "Sign In"}</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle & Lang Switcher (< 1024px) */}
          <div className="flex lg:hidden items-center gap-1.5 shrink-0">
            <div className="flex items-center bg-earth-100 rounded-md p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLanguage("bn")}
                className={`px-2 py-0.5 rounded transition ${
                  language === "bn" ? "bg-agri-700 text-white font-bold" : "text-earth-600"
                }`}
              >
                বাং
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2 py-0.5 rounded transition ${
                  language === "en" ? "bg-agri-700 text-white font-bold" : "text-earth-600"
                }`}
              >
                EN
              </button>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-lg text-earth-600 hover:text-earth-900 hover:bg-earth-100 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (< 1024px) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-earth-200 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? "bg-agri-100 text-agri-900 font-semibold" : "text-earth-700 hover:bg-earth-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-agri-700" />
                  <span>{item.label}</span>
                </div>
                {item.isLive && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">
                    LIVE
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-earth-100 mt-2 space-y-1">
            {currentUser ? (
              <>
                <div className="px-3 py-2 bg-agri-50 rounded-lg flex items-center justify-between">
                  <span className="font-bold text-xs text-earth-900">
                    {language === "bn" ? (currentUser.nameBn || currentUser.name) : currentUser.name}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-agri-200 text-agri-900">
                    {t.roles[currentRole || "farmer"] || currentRole}
                  </span>
                </div>
                <Link
                  href={currentRole === "admin" ? "/admin" : "/dashboard"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                    pathname === "/dashboard" ? "bg-agri-100 text-agri-900 font-semibold" : "text-earth-700 hover:bg-earth-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4 text-agri-700" />
                    <span>{t.nav.dashboard}</span>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{language === "bn" ? "লগআউট" : "Logout"}</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold bg-agri-800 text-white"
              >
                <LogIn className="w-4 h-4" />
                <span>{language === "bn" ? "লগইন করুন" : "Sign In"}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
