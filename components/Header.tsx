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
  Bot,
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

  const navLinks = [
    { href: "/", label: t.nav.home, icon: Sprout },
    { href: "/marketplace", label: t.nav.marketplace, icon: ShoppingBag },
    { href: "/auctions", label: t.nav.auctions, icon: Gavel, isLive: true },
    { href: "/market-intelligence", label: t.nav.prices, icon: TrendingUp },
    { href: "/procurement", label: t.nav.procurement, icon: Building2 },
    { href: "/export", label: t.nav.export, icon: Globe2 },
    { href: "/assistant", label: t.nav.assistant, icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-earth-200 shadow-sm">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group py-1">
            <img
              src="/logo.png"
              alt="KrishiSetu AI — Connecting Farmers to Every Market"
              className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-agri-50 text-agri-800 font-semibold"
                      : "text-earth-600 hover:text-agri-800 hover:bg-earth-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-agri-700" : "text-earth-400"}`} />
                  <span>{item.label}</span>
                  {item.isLive && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action CTA & Controls */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-earth-100 rounded-lg p-0.5 text-xs font-semibold border border-earth-200">
              <button
                type="button"
                onClick={() => setLanguage("bn")}
                className={`px-2.5 py-1 rounded-md transition ${
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
                className={`px-2.5 py-1 rounded-md transition ${
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
              <div className="flex items-center gap-2">
                {/* Active Profile Info */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-agri-50 border border-agri-200 text-xs">
                  <div className="w-6 h-6 rounded-full bg-agri-700 text-white flex items-center justify-center font-bold text-[11px]">
                    {currentUser.role === "admin" ? (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-earth-900 text-xs truncate max-w-[130px]">
                      {language === "bn" ? (currentUser.nameBn || currentUser.name) : currentUser.name}
                    </div>
                    <div className="text-[10px] uppercase font-semibold text-agri-700">
                      {t.roles[currentRole || "farmer"] || currentRole}
                    </div>
                  </div>
                </div>

                {/* Dashboard Shortcut */}
                <Link
                  href={currentRole === "admin" ? "/admin" : "/dashboard"}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-semibold shadow-sm transition"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{t.nav.dashboard}</span>
                </Link>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={() => logout()}
                  title={language === "bn" ? "লগআউট" : "Logout"}
                  className="p-2 rounded-xl text-earth-500 hover:text-red-600 hover:bg-red-50 border border-earth-200 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-agri-800 hover:bg-agri-900 text-white text-xs font-bold shadow-sm transition"
              >
                <LogIn className="w-4 h-4" />
                <span>{language === "bn" ? "লগইন করুন" : "Sign In"}</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle & Lang Switcher */}
          <div className="flex sm:hidden items-center gap-2">
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
              className="p-2 rounded-lg text-earth-600 hover:text-earth-900 hover:bg-earth-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-earth-200 px-4 pt-2 pb-4 space-y-1">
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
