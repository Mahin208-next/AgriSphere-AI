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
  ChevronDown,
  ShoppingBag,
  LogIn,
  LogOut
} from "lucide-react";

export default function Header() {
  const { currentUser, allUsers, currentRole, language, setLanguage, t, switchUserRole, logout } = useApp();
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
  ];

  // Exclude admin from public header role switchers
  const publicUsers = allUsers.filter((u) => u.role !== "admin");

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-earth-200 shadow-sm">
      {/* Top Demo Bar & Role Switcher */}
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
                <span>{currentUser ? `${t.common.activeRole}:` : (language === "bn" ? "প্রোফাইল:" : "Profile:")}</span>
                <span className="font-semibold text-harvest-300">
                  {currentUser
                    ? `${currentUser.name} (${t.roles[currentRole || "farmer"] || currentRole})`
                    : (language === "bn" ? "সাধারণ পরিদর্শক" : "Public Visitor")}
                </span>
                <ChevronDown className="w-3 h-3 text-agri-300" />
              </button>

              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-1 w-72 bg-white rounded-lg shadow-xl border border-earth-200 py-1.5 z-50 text-earth-800"
                  onMouseLeave={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-earth-100 text-[11px] font-medium text-earth-500 uppercase tracking-wider flex items-center justify-between">
                    <span>{t.common.switchRole} (Preview)</span>
                    <Link
                      href="/login"
                      onClick={() => setRoleDropdownOpen(false)}
                      className="text-agri-700 hover:underline font-bold text-[10px]"
                    >
                      {language === "bn" ? "লগইন পাতা" : "Login Page"}
                    </Link>
                  </div>
                  {publicUsers.map((u) => (
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
                        <div className="font-medium text-earth-900">
                          {language === "bn" ? (u.nameBn || u.name) : u.name}
                        </div>
                        <div className="text-[11px] text-earth-500">{u.companyName || u.district}</div>
                      </div>
                      <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-earth-100 text-earth-700 font-semibold">
                        {t.roles[u.role] || u.role}
                      </span>
                    </button>
                  ))}
                  {currentUser && (
                    <div className="border-t border-earth-100 mt-1 pt-1 px-2">
                      <button
                        onClick={() => {
                          logout();
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded flex items-center gap-1.5 font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{language === "bn" ? "লগআউট করুন" : "Sign Out"}</span>
                      </button>
                    </div>
                  )}
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
            {currentUser ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-agri-700 hover:bg-agri-800 text-white text-xs font-semibold shadow-sm transition"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{t.nav.dashboard}</span>
                </Link>
                <button
                  onClick={() => logout()}
                  title={language === "bn" ? "লগআউট" : "Logout"}
                  className="p-2 rounded-lg text-earth-500 hover:text-red-600 hover:bg-red-50 border border-earth-200 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-agri-800 hover:bg-agri-900 text-white text-xs font-bold shadow-sm transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "লগইন করুন" : "Sign In"}</span>
              </Link>
            )}
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

          <div className="pt-2 border-t border-earth-100 mt-2 space-y-1">
            {currentUser ? (
              <>
                <Link
                  href="/dashboard"
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
