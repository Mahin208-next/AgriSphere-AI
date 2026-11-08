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
  ShieldCheck, 
  UserCheck, 
  Menu, 
  X, 
  ChevronDown,
  ShoppingBag
} from "lucide-react";

export default function Header() {
  const { currentUser, allUsers, currentRole, language, setLanguage, t, switchUserRole } = useApp();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t.nav.home, icon: Sprout },
    { href: "/marketplace", label: t.nav.marketplace, icon: ShoppingBag },
    { href: "/auctions", label: t.nav.auctions, icon: Gavel, isLive: true },
    { href: "/market-intelligence", label: t.nav.prices, icon: TrendingUp },
    { href: "/procurement", label: t.nav.procurement, icon: Building2 },
    { href: "/export", label: t.nav.export, icon: Globe2 },
    { href: "/assistant", label: t.nav.assistant, icon: Bot },
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-earth-200 shadow-sm">
      {/* Top Demo Bar & Role Switcher for Hackathon Judges */}
      <div className="bg-agri-950 text-agri-100 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-harvest-500 text-harvest-950">
              {t.common.demoData}
            </span>
            <span className="hidden sm:inline text-agri-300">
              {t.tagline}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 bg-agri-800 hover:bg-agri-700 text-white px-2.5 py-1 rounded text-xs transition"
              >
                <UserCheck className="w-3.5 h-3.5 text-agri-300" />
                <span>{t.common.activeRole}:</span>
                <span className="font-semibold text-harvest-300">
                  {currentUser?.name || "Loading..."} ({t.roles[currentRole] || currentRole})
                </span>
                <ChevronDown className="w-3 h-3 text-agri-300" />
              </button>

              {roleDropdownOpen && (
                <div 
                  className="absolute right-0 mt-1 w-72 bg-white rounded-lg shadow-xl border border-earth-200 py-1.5 z-50 text-earth-800"
                  onMouseLeave={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-earth-100 text-[11px] font-medium text-earth-500 uppercase tracking-wider">
                    {t.common.switchRole} (Judge Preview)
                  </div>
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUserRole(u.id);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-agri-50 flex items-center justify-between transition ${
                        u.id === currentUser?.id ? "bg-agri-100 font-semibold text-agri-900" : ""
                      }`}
                    >
                      <div>
                        <div className="font-medium text-earth-900">{language === "bn" ? (u.nameBn || u.name) : u.name}</div>
                        <div className="text-[11px] text-earth-500">{u.companyName || u.district}</div>
                      </div>
                      <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-earth-100 text-earth-700 font-semibold">
                        {t.roles[u.role] || u.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-agri-900 rounded p-0.5 text-xs">
              <button
                onClick={() => setLanguage("bn")}
                className={`px-2 py-0.5 rounded transition ${
                  language === "bn" ? "bg-agri-600 text-white font-semibold" : "text-agri-300 hover:text-white"
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-2 py-0.5 rounded transition ${
                  language === "en" ? "bg-agri-600 text-white font-semibold" : "text-agri-300 hover:text-white"
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-agri-800 to-agri-600 flex items-center justify-center text-white shadow-md shadow-agri-900/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-harvest-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-agri-950 tracking-tight font-sans">
                  AgriSphere
                </span>
                <span className="font-semibold text-xs px-1.5 py-0.5 rounded bg-agri-100 text-agri-800 border border-agri-200">
                  MarketLink AI
                </span>
              </div>
              <p className="text-[11px] text-earth-500 font-medium">
                {language === "bn" ? "কৃষক ও বাজারের দ্বিমুখী সংযোগ" : "Two-Way Agri-Trading & Market Intelligence"}
              </p>
            </div>
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

          {/* Right Action CTA */}
          <div className="hidden sm:flex items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-agri-700 hover:bg-agri-800 text-white text-xs font-semibold shadow-sm transition"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{t.nav.dashboard}</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center">
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
        </div>
      )}
    </header>
  );
}
