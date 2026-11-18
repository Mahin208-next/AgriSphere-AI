"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { AuditLog, OversupplyAlert, User, UserRole, ProductListing, Auction, ProcurementRequest, MarketPriceRecord } from "@/types";
import { CROPS_DATA } from "@/lib/data/crops";
import { BANGLADESH_DISTRICTS } from "@/lib/data/bangladesh-geo";
import { 
  ShieldCheck, 
  Users, 
  UploadCloud, 
  AlertTriangle, 
  Activity, 
  CheckCircle2, 
  FileText,
  TrendingUp,
  Database,
  ShoppingBag,
  Gavel,
  Building2,
  Globe2,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  X,
  Lock,
  Unlock,
  RefreshCw,
  Sparkles,
  UserCheck,
  Check,
  Radio,
  SlidersHorizontal,
  ExternalLink
} from "lucide-react";

export default function AdminDashboard() {
  const { currentUser, language, t } = useApp();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "listings" | "auctions" | "procurement" | "prices" | "audit">("overview");

  // Data states
  const [stats, setStats] = useState<any>({});
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [alerts, setAlerts] = useState<OversupplyAlert[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<ProductListing[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [procurements, setProcurements] = useState<ProcurementRequest[]>([]);
  const [prices, setPrices] = useState<MarketPriceRecord[]>([]);

  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // User Management State ("fixed all the user")
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    nameBn: "",
    role: "farmer" as UserRole,
    phone: "",
    email: "",
    district: "Bogura",
    upazila: "Sadar",
    companyName: "",
    verified: true,
  });

  // Listing Management State
  const [editingListing, setEditingListing] = useState<ProductListing | null>(null);

  // Price & CSV State
  const [csvText, setCsvText] = useState(
`cropId,cropNameEn,marketId,marketNameEn,district,wholesalePrice,retailPrice,date,priceSource
green_chilli,Green Chilli,mkt_karwan_bazar,Karwan Bazar Wholesale,Dhaka,168,198,2026-11-09,DAM
cucumber,Cucumber,mkt_mahasthangarh,Mahasthangarh Agri Hub,Bogura,29,39,2026-11-09,DAM
sweet_pumpkin,Sweet Pumpkin,mkt_shyambazar,Shyambazar Wholesale,Dhaka,35,46,2026-11-09,DAM`
  );
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<MarketPriceRecord | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [overviewRes, usersRes, listingsRes, auctionsRes, procRes, pricesRes] = await Promise.all([
        fetch("/api/v1/admin/overview"),
        fetch("/api/v1/admin/users"),
        fetch("/api/v1/admin/listings"),
        fetch("/api/v1/admin/auctions"),
        fetch("/api/v1/admin/procurement"),
        fetch("/api/v1/admin/prices"),
      ]);

      if (overviewRes.ok) {
        const d = await overviewRes.json();
        setStats(d.stats || {});
        setAuditLogs(d.auditLogs || []);
        setAlerts(d.oversupplyAlerts || []);
      }
      if (usersRes.ok) {
        const d = await usersRes.json();
        setUsers(d.users || []);
      }
      if (listingsRes.ok) {
        const d = await listingsRes.json();
        setListings(d.listings || []);
      }
      if (auctionsRes.ok) {
        const d = await auctionsRes.json();
        setAuctions(d.auctions || []);
      }
      if (procRes.ok) {
        const d = await procRes.json();
        setProcurements(d.requests || []);
      }
      if (pricesRes.ok) {
        const d = await pricesRes.json();
        setPrices(d.prices || []);
      }
    } catch (e: any) {
      console.error("Admin data fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const triggerNotify = (msg: string, isError = false) => {
    if (isError) {
      setActionError(msg);
      setTimeout(() => setActionError(null), 4000);
    } else {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // --- USER FIX / EDIT HANDLERS ("fixed all the user") ---
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser),
      });
      const data = await res.json();
      if (res.ok) {
        triggerNotify(language === "bn" ? `ব্যবহারকারী "${editingUser.name}" সফলভাবে আপডেট ও ফিক্স করা হয়েছে!` : `User "${editingUser.name}" successfully fixed and updated!`);
        setEditingUser(null);
        fetchAllData();
      } else {
        triggerNotify(data.error || "Failed to update user", true);
      }
    } catch (err: any) {
      triggerNotify(err.message, true);
    }
  };

  const handleToggleVerifyUser = async (user: User) => {
    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          verified: !user.verified,
        }),
      });
      if (res.ok) {
        triggerNotify(user.verified ? `Verification removed for ${user.name}` : `Verified badge granted to ${user.name}`);
        fetchAllData();
      }
    } catch (err: any) {
      triggerNotify(err.message, true);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user "${user.name}" (${user.role})?`)) return;

    try {
      const res = await fetch(`/api/v1/admin/users?id=${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        triggerNotify(`User ${user.name} removed successfully.`);
        fetchAllData();
      } else {
        triggerNotify(data.error || "Cannot delete user", true);
      }
    } catch (err: any) {
      triggerNotify(err.message, true);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserForm),
      });
      const data = await res.json();
      if (res.ok) {
        triggerNotify(`New user "${newUserForm.name}" created successfully with role: ${newUserForm.role}`);
        setShowAddUserModal(false);
        setNewUserForm({
          name: "",
          nameBn: "",
          role: "farmer",
          phone: "",
          email: "",
          district: "Bogura",
          upazila: "Sadar",
          companyName: "",
          verified: true,
        });
        fetchAllData();
      } else {
        triggerNotify(data.error || "Failed to create user", true);
      }
    } catch (err: any) {
      triggerNotify(err.message, true);
    }
  };

  // --- LISTINGS EDIT HANDLERS ---
  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;

    try {
      const res = await fetch("/api/v1/admin/listings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingListing),
      });
      if (res.ok) {
        triggerNotify(`Listing ${editingListing.cropNameEn} updated successfully.`);
        setEditingListing(null);
        fetchAllData();
      }
    } catch (err: any) {
      triggerNotify(err.message, true);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm("Are you sure you want to remove this listing?")) return;
    try {
      const res = await fetch(`/api/v1/admin/listings?id=${listingId}`, { method: "DELETE" });
      if (res.ok) {
        triggerNotify("Listing deleted successfully.");
        fetchAllData();
      }
    } catch (err: any) {
      triggerNotify(err.message, true);
    }
  };

  // --- AUCTION ACTION HANDLERS ---
  const handleAuctionAction = async (auctionId: string, action: "end_now" | "cancel") => {
    try {
      const res = await fetch("/api/v1/admin/auctions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: auctionId, action }),
      });
      if (res.ok) {
        triggerNotify(action === "end_now" ? "Auction ended & highest bid accepted." : "Auction cancelled.");
        fetchAllData();
      }
    } catch (err: any) {
      triggerNotify(err.message, true);
    }
  };

  const handleDeleteAuction = async (auctionId: string) => {
    if (!confirm("Are you sure you want to delete this auction?")) return;
    try {
      const res = await fetch(`/api/v1/admin/auctions?id=${auctionId}`, { method: "DELETE" });
      if (res.ok) {
        triggerNotify("Auction record removed.");
        fetchAllData();
      }
    } catch (err: any) {
      triggerNotify(err.message, true);
    }
  };

  // --- PROCUREMENT ACTION HANDLERS ---
  const handleToggleProcurementStatus = async (req: ProcurementRequest, newStatus: string) => {
    try {
      const res = await fetch("/api/v1/admin/procurement", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: req.id, status: newStatus }),
      });
      if (res.ok) {
        triggerNotify(`Demand status set to: ${newStatus}`);
        fetchAllData();
      }
    } catch (err: any) {
      triggerNotify(err.message, true);
    }
  };

  const handleDeleteProcurement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this procurement tender?")) return;
    try {
      const res = await fetch(`/api/v1/admin/procurement?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        triggerNotify("Procurement request removed.");
        fetchAllData();
      }
    } catch (err: any) {
      triggerNotify(err.message, true);
    }
  };

  // --- PRICE RECORD HANDLERS ---
  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrice) return;
    try {
      const res = await fetch("/api/v1/admin/prices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPrice),
      });
      if (res.ok) {
        triggerNotify(`Price for ${editingPrice.cropNameEn} updated successfully.`);
        setEditingPrice(null);
        fetchAllData();
      }
    } catch (err: any) {
      triggerNotify(err.message, true);
    }
  };

  const handleDeletePrice = async (id: string) => {
    if (!confirm("Are you sure you want to remove this price record?")) return;
    try {
      const res = await fetch(`/api/v1/admin/prices?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        triggerNotify("Price record deleted.");
        fetchAllData();
      }
    } catch (err: any) {
      triggerNotify(err.message, true);
    }
  };

  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    setImporting(true);
    setImportResult(null);

    try {
      const res = await fetch("/api/v1/admin/prices/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText }),
      });

      const data = await res.json();
      if (res.ok) {
        setImportResult(`Successfully imported ${data.importedCount} verified DAM market price records into live database.`);
        fetchAllData();
      } else {
        setImportResult(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setImportResult(`Import failed: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    if (userRoleFilter !== "all" && u.role !== userRoleFilter) return false;
    if (userSearch) {
      const q = userSearch.toLowerCase();
      const match = u.name.toLowerCase().includes(q) || 
                    (u.nameBn && u.nameBn.toLowerCase().includes(q)) ||
                    u.phone.includes(q) ||
                    (u.district && u.district.toLowerCase().includes(q)) ||
                    (u.companyName && u.companyName.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-900/90 border border-emerald-500 text-white text-xs font-bold flex items-center justify-between shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="p-1 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-red-900/90 border border-red-500 text-white text-xs font-bold flex items-center justify-between shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="p-1 hover:text-red-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Admin Tabbed Navigation Bar */}
      <div className="bg-white p-2 rounded-2xl border border-earth-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "overview" ? "bg-earth-900 text-white shadow-xs" : "text-earth-600 hover:bg-earth-100"
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>{language === "bn" ? "ওভারভিউ ও মেট্রিক্স" : "Overview & KPIs"}</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "users" ? "bg-earth-900 text-white shadow-xs" : "text-earth-600 hover:bg-earth-100"
            }`}
          >
            <Users className="w-4 h-4 text-blue-500" />
            <span>{language === "bn" ? "ব্যবহারকারী নিয়ন্ত্রণ ও ফিক্স" : "Users Management"}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-900 font-mono">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("listings")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "listings" ? "bg-earth-900 text-white shadow-xs" : "text-earth-600 hover:bg-earth-100"
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <span>{language === "bn" ? "কৃষি বাজার পোস্টসমূহ" : "Direct Produce Listings"}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-mono">
              {listings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("auctions")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "auctions" ? "bg-earth-900 text-white shadow-xs" : "text-earth-600 hover:bg-earth-100"
            }`}
          >
            <Gavel className="w-4 h-4 text-red-500" />
            <span>{language === "bn" ? "লাইভ নিলাম নিয়ন্ত্রণ" : "Live Auctions Control"}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-100 text-red-900 font-mono">
              {auctions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("procurement")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "procurement" ? "bg-earth-900 text-white shadow-xs" : "text-earth-600 hover:bg-earth-100"
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-500" />
            <span>{language === "bn" ? "পাইকারি চাহিদা (RFPs)" : "Buyer Demands"}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-900 font-mono">
              {procurements.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("prices")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "prices" ? "bg-earth-900 text-white shadow-xs" : "text-earth-600 hover:bg-earth-100"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-teal-500" />
            <span>{language === "bn" ? "জাতীয় বাজার দর ও CSV" : "DAM Prices & CSV"}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 text-teal-900 font-mono">
              {prices.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "audit" ? "bg-earth-900 text-white shadow-xs" : "text-earth-600 hover:bg-earth-100"
            }`}
          >
            <Activity className="w-4 h-4 text-purple-500" />
            <span>{language === "bn" ? "অডিট ট্রেইল" : "Audit Trail"}</span>
          </button>
        </div>

        <button
          onClick={fetchAllData}
          disabled={loading}
          className="p-2 rounded-xl border border-earth-300 hover:bg-earth-100 text-earth-700 transition"
          title="Refresh All Database Records"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-agri-700" : ""}`} />
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: OVERVIEW & PLATFORM KPIS */}
      {/* ===================================================================== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-earth-200 shadow-2xs">
              <div className="text-xs text-earth-500 font-medium flex items-center justify-between">
                <span>Total Registered Users</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-earth-900 mt-1">
                {stats.totalUsers || users.length}
              </div>
              <div className="text-[11px] text-earth-500 mt-1">
                {stats.farmersCount || 0} Farmers • {stats.buyersCount || 0} Buyers • {stats.factoryCount || 0} Mills
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-earth-200 shadow-2xs">
              <div className="text-xs text-earth-500 font-medium flex items-center justify-between">
                <span>Total Trade Settlement</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-900 mt-1">
                ৳{(stats.totalTradeVolumeBdt || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-earth-500 mt-1">
                {stats.completedOrdersCount || 0} Direct Orders Confirmed
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-earth-200 shadow-2xs">
              <div className="text-xs text-earth-500 font-medium flex items-center justify-between">
                <span>Active Live Auctions</span>
                <Gavel className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-2xl font-black text-red-950 mt-1">
                {auctions.filter((a) => a.status === "live").length}
              </div>
              <div className="text-[11px] text-earth-500 mt-1">
                {listings.length} Produce Lots in Krishi Bazar
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-earth-200 shadow-2xs">
              <div className="text-xs text-earth-500 font-medium flex items-center justify-between">
                <span>Corporate Demand Tenders</span>
                <Building2 className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-950 mt-1">
                {procurements.filter((p) => p.status === "open").length}
              </div>
              <div className="text-[11px] text-earth-500 mt-1">
                {prices.length} DAM Price Benchmarks Synced
              </div>
            </div>
          </div>

          {/* Quick Management Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => setActiveTab("users")}
              className="p-5 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl shadow-xs hover:border-blue-400 cursor-pointer transition"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-earth-900">
                {language === "bn" ? "ব্যবহারকারী অ্যাকাউন্ট ঠিক ও সম্পাদনা" : "Manage & Fix User Profiles"}
              </h3>
              <p className="text-xs text-earth-500 mt-1">
                {language === "bn" 
                  ? "কৃষক, পাইকার, মিল ও রপ্তানিকারকদের প্রোফাইল যাচাইকরণ ও প্রয়োজনীয় ডাটা পরিবর্তন করুন।" 
                  : "Fix phone numbers, assign verified badges, reset roles, or suspend bad accounts."}
              </p>
            </div>

            <div 
              onClick={() => setActiveTab("listings")}
              className="p-5 bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-2xl shadow-xs hover:border-emerald-400 cursor-pointer transition"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-earth-900">
                {language === "bn" ? "সরাসরি কৃষি বাজার মনিটরিং" : "Direct Crop Listings Control"}
              </h3>
              <p className="text-xs text-earth-500 mt-1">
                {language === "bn"
                  ? "সরাসরি পাইকারি বাজারে পোস্টকৃত সকল ফসলের দর, পরিমাণ ও মান তদারকি করুন।"
                  : "Supervise fixed-price harvest lots, edit pricing anomalies, or approve verified farmers."}
              </p>
            </div>

            <div 
              onClick={() => setActiveTab("auctions")}
              className="p-5 bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-2xl shadow-xs hover:border-red-400 cursor-pointer transition"
            >
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center mb-3">
                <Gavel className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-earth-900">
                {language === "bn" ? "লাইভ নিলাম ও বিডিং তত্ত্বাবধান" : "Live Bidding & Auction Guard"}
              </h3>
              <p className="text-xs text-earth-500 mt-1">
                {language === "bn"
                  ? "চলমান নিলামে কার্টেল বা ভুয়া বিডার শনাক্ত করুন এবং প্রয়োজনে তৎক্ষণাৎ নিলাম সমাপ্ত বা বাতিল করুন।"
                  : "Prevent artificial price suppression, terminate compromised auctions, and enforce fair trades."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: USERS MANAGEMENT ("FIXED ALL THE USER") */}
      {/* ===================================================================== */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-earth-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-base text-earth-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>{language === "bn" ? "ব্যবহারকারী প্রোফাইল ফিক্স ও ম্যানেজমেন্ট" : "User Accounts Control & Profile Fix"}</span>
                </h3>
                <p className="text-xs text-earth-500 mt-0.5">
                  {language === "bn"
                    ? "সকল কৃষকের ডাটা, ফোন নম্বর, জেলা, ভেরিফিকেশন ব্যাজ ও ভূমিকা এখান থেকে পরিবর্তন ও ঠিক করা যায়।"
                    : "Fix user credentials, update phone numbers, assign verified status, and change user roles."}
                </p>
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{language === "bn" ? "+ নতুন ইউজার যোগ করুন" : "+ Add New User"}</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 relative">
                <Search className="w-4 h-4 text-earth-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder={language === "bn" ? "নাম, ফোন নম্বর, জেলা বা কোম্পানি দিয়ে খুঁজুন..." : "Search by name, phone, district, company..."}
                  className="w-full pl-9 pr-3 py-2 bg-earth-50 border border-earth-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl text-xs font-bold text-earth-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">{language === "bn" ? "সকল ভূমিকা (All Roles)" : "All Roles"}</option>
                  <option value="farmer">কৃষক (Farmer)</option>
                  <option value="buyer">পাইকারি ক্রেতা (Buyer)</option>
                  <option value="factory">মিল মালিক (Factory)</option>
                  <option value="retailer">সুপারশপ (Retailer)</option>
                  <option value="exporter">রপ্তানিকারক (Exporter)</option>
                  <option value="importer">আমদানিকারক (Importer)</option>
                  <option value="admin">অ্যাডমিন (Admin)</option>
                </select>
              </div>
            </div>

            {/* User List Table */}
            <div className="overflow-x-auto rounded-xl border border-earth-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-earth-100/70 text-earth-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-3.5">User Profile</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3">Verification</th>
                    <th className="py-3 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-100 font-medium">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-blue-50/30 transition">
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-earth-200 flex items-center justify-center font-bold text-earth-800 text-xs shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-earth-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.nameBn && <span className="text-[11px] text-earth-500">({u.nameBn})</span>}
                            </div>
                            <div className="text-[10px] text-earth-400 font-mono">{u.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === "farmer" ? "bg-emerald-100 text-emerald-800" :
                          u.role === "buyer" ? "bg-blue-100 text-blue-800" :
                          u.role === "factory" ? "bg-amber-100 text-amber-800" :
                          u.role === "retailer" ? "bg-purple-100 text-purple-800" :
                          u.role === "exporter" ? "bg-teal-100 text-teal-800" :
                          u.role === "importer" ? "bg-cyan-100 text-cyan-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {t.roles[u.role] || u.role}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="text-earth-900 font-bold">{u.phone}</div>
                        <div className="text-[10px] text-earth-400">{u.email}</div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="text-earth-800">{u.district || "—"}</div>
                        {u.companyName && (
                          <div className="text-[10px] text-earth-500 truncate max-w-[120px] font-semibold">
                            {u.companyName}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleVerifyUser(u)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition ${
                            u.verified 
                              ? "bg-green-100 text-green-800 hover:bg-green-200" 
                              : "bg-earth-100 text-earth-600 hover:bg-earth-200"
                          }`}
                          title="Click to toggle verification badge"
                        >
                          <ShieldCheck className="w-3 h-3 text-current" />
                          <span>{u.verified ? (language === "bn" ? "যাচাইকৃত" : "Verified") : (language === "bn" ? "অযাচাইকৃত" : "Unverified")}</span>
                        </button>
                      </td>

                      <td className="py-3 px-3.5 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => setEditingUser({ ...u })}
                          className="px-2.5 py-1 rounded-lg bg-earth-100 hover:bg-blue-100 text-earth-800 hover:text-blue-800 font-bold transition inline-flex items-center gap-1 text-[11px]"
                          title="Edit & Fix User Details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>{language === "bn" ? "ঠিক করুন" : "Fix"}</span>
                        </button>

                        {u.id !== "usr_admin_01" && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1 rounded-lg hover:bg-red-50 text-earth-400 hover:text-red-600 transition"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: KRISHI BAZAR (DIRECT LISTINGS) */}
      {/* ===================================================================== */}
      {activeTab === "listings" && (
        <div className="bg-white p-5 rounded-2xl border border-earth-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-earth-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-700" />
                <span>{language === "bn" ? "সরাসরি কৃষি বাজার পোস্ট তদারকি ও সম্পাদন" : "Direct Crop Listings Management"}</span>
              </h3>
              <p className="text-xs text-earth-500 mt-0.5">
                {language === "bn"
                  ? "কৃষকদের নির্ধারিত দরে সরাসরি বিক্রির পোস্টসমূহ পরিবর্তন, মূল্য আপডেট বা মুছে ফেলুন।"
                  : "Supervise, adjust prices, edit quantity, or delete inappropriate produce postings."}
              </p>
            </div>
            <span className="text-xs font-bold text-earth-600 bg-earth-100 px-3 py-1 rounded-lg">
              {listings.length} Total Harvest Posts
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-earth-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-earth-100/70 text-earth-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-3.5">Produce / Crop</th>
                  <th className="py-3 px-3">Farmer</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Fixed Price</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-100 font-medium">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-emerald-50/20 transition">
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={l.images[0] || "/placeholder.jpg"}
                          alt={l.cropNameEn}
                          className="w-9 h-9 rounded-lg object-cover border border-earth-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-earth-900">{l.cropNameBn} ({l.cropNameEn})</div>
                          <div className="text-[10px] text-earth-500">{l.variety} • {l.grade}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-earth-900">{l.farmerName}</div>
                      <div className="text-[10px] text-earth-500">{l.farmerPhone}</div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap font-bold text-earth-900">
                      {l.quantity.toLocaleString()} {l.unit}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap font-black text-emerald-800">
                      ৳{l.expectedPrice || l.startingPrice} <span className="text-[10px] font-normal text-earth-500">/{l.unit}</span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap text-earth-700">
                      {l.district}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        l.status === "active" ? "bg-green-100 text-green-800" :
                        l.status === "sold" ? "bg-blue-100 text-blue-800" :
                        "bg-earth-100 text-earth-600"
                      }`}>
                        {l.status}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => setEditingListing({ ...l })}
                        className="px-2.5 py-1 rounded-lg bg-earth-100 hover:bg-emerald-100 text-earth-800 hover:text-emerald-800 font-bold text-[11px] transition inline-flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteListing(l.id)}
                        className="p-1 rounded-lg hover:bg-red-50 text-earth-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: LIVE AUCTIONS CONTROL */}
      {/* ===================================================================== */}
      {activeTab === "auctions" && (
        <div className="bg-white p-5 rounded-2xl border border-earth-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-earth-900 flex items-center gap-2">
                <Gavel className="w-5 h-5 text-red-600" />
                <span>{language === "bn" ? "লাইভ নিলাম কেন্দ্রীয় নিয়ন্ত্রণ ও হস্তক্ষেপ" : "Live Auctions Central Command"}</span>
              </h3>
              <p className="text-xs text-earth-500 mt-0.5">
                {language === "bn"
                  ? "চলমান নিলামের দর, সময়সীমা বা ভুয়া ডাক তদারকি করুন এবং প্রয়োজনে অবিলম্বে নিলাম শেষ বা বাতিল করুন।"
                  : "Supervise bidding in real-time, accept winning bids, or terminate fraudulent auctions."}
              </p>
            </div>
            <span className="text-xs font-bold text-red-800 bg-red-50 border border-red-200 px-3 py-1 rounded-lg">
              {auctions.filter((a) => a.status === "live").length} Live Active Auctions
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-earth-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-earth-100/70 text-earth-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-3.5">Auction Item</th>
                  <th className="py-3 px-3">Farmer</th>
                  <th className="py-3 px-3">Floor Price</th>
                  <th className="py-3 px-3">Highest Bid</th>
                  <th className="py-3 px-3">Top Bidder</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3.5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-100 font-medium">
                {auctions.map((auc) => (
                  <tr key={auc.id} className="hover:bg-red-50/20 transition">
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="font-bold text-earth-900">{auc.cropNameBn} ({auc.cropNameEn})</div>
                      <div className="text-[10px] text-earth-400 font-mono">{auc.id} • {auc.quantity} {auc.unit}</div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap text-earth-800 font-semibold">
                      {auc.farmerName}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap text-earth-600">
                      ৳{auc.startingPrice}/{auc.unit}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap font-black text-red-600 text-sm">
                      ৳{auc.currentHighestBid || auc.startingPrice}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap text-earth-700">
                      {auc.currentHighestBidderName || "—"}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        auc.status === "live" ? "bg-red-100 text-red-700 animate-pulse" :
                        auc.status === "accepted" ? "bg-green-100 text-green-800" :
                        "bg-earth-100 text-earth-600"
                      }`}>
                        {auc.status}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 text-right whitespace-nowrap space-x-1.5">
                      {auc.status === "live" && (
                        <>
                          <button
                            onClick={() => handleAuctionAction(auc.id, "end_now")}
                            className="px-2.5 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-[11px] transition shadow-2xs"
                            title="Accept Current Highest Bid & Settle"
                          >
                            Accept & Settle
                          </button>

                          <button
                            onClick={() => handleAuctionAction(auc.id, "cancel")}
                            className="px-2 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 font-bold text-[11px] transition"
                            title="Cancel Auction"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDeleteAuction(auc.id)}
                        className="p-1 rounded-lg hover:bg-red-50 text-earth-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: BUYER DEMANDS (PROCUREMENT RFPS) */}
      {/* ===================================================================== */}
      {activeTab === "procurement" && (
        <div className="bg-white p-5 rounded-2xl border border-earth-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-earth-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                <span>{language === "bn" ? "প্রাতিষ্ঠানিক ও পাইকারি ক্রয়চাহিদা ব্যবস্থাপনা" : "Buyer Procurement Tenders (RFPs)"}</span>
              </h3>
              <p className="text-xs text-earth-500 mt-0.5">
                {language === "bn"
                  ? "মিল ও আড়তদারদের উন্মুক্ত টেন্ডার চাহিদা তদারকি করুন।"
                  : "Supervise agro-processing demands, budget allocations, and supplier bids."}
              </p>
            </div>
            <span className="text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg">
              {procurements.length} Total Demands
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-earth-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-earth-100/70 text-earth-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-3.5">Buyer Company</th>
                  <th className="py-3 px-3">Crop Required</th>
                  <th className="py-3 px-3">Required Qty</th>
                  <th className="py-3 px-3">Budget</th>
                  <th className="py-3 px-3">Delivery Destination</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-100 font-medium">
                {procurements.map((req) => (
                  <tr key={req.id} className="hover:bg-amber-50/20 transition">
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="font-bold text-earth-900">{req.companyName || req.buyerName}</div>
                      <div className="text-[10px] text-earth-400 font-mono">{req.id}</div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-earth-800">{req.cropNameBn} ({req.cropNameEn})</div>
                      <div className="text-[10px] text-earth-500">{req.qualityGrade}</div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap font-bold text-earth-900">
                      {req.requiredQuantity.toLocaleString()} {req.unit}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap font-black text-amber-800">
                      ৳{req.maxBudgetPerUnit} <span className="text-[10px] font-normal text-earth-500">/{req.unit}</span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap text-earth-700">
                      {req.deliveryDistrict}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <select
                        value={req.status}
                        onChange={(e) => handleToggleProcurementStatus(req, e.target.value)}
                        className="px-2 py-1 rounded text-[10px] font-bold bg-earth-100 border border-earth-300 focus:outline-none"
                      >
                        <option value="open">OPEN</option>
                        <option value="fulfilled">FULFILLED</option>
                        <option value="closed">CLOSED</option>
                        <option value="cancelled">CANCELLED</option>
                      </select>
                    </td>

                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteProcurement(req.id)}
                        className="p-1 rounded-lg hover:bg-red-50 text-earth-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 6: DAM MARKET PRICES & CSV SYNC */}
      {/* ===================================================================== */}
      {activeTab === "prices" && (
        <div className="space-y-6">
          {/* CSV Bulk Importer */}
          <div className="bg-white p-5 rounded-2xl border border-earth-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-teal-700" />
              <h3 className="font-bold text-base text-earth-900">
                {language === "bn" ? "কৃষি বিপণন অধিদপ্তর (DAM) দৈনিক বাজার দর CSV ইমপোর্ট" : "Import DAM Official Market Prices (CSV)"}
              </h3>
            </div>
            <p className="text-xs text-earth-500">
              {language === "bn"
                ? "প্রতিদিনের পাইকারি ও খুচরা দর সিএসভি ফরম্যাটে আপলোড করুন। এআই নিট মুনাফা ক্যালকুলেটর স্বয়ংক্রিয়ভাবে আপডেট হবে।"
                : "Batch import validated market wholesale and retail price records into the active database."}
            </p>

            {importResult && (
              <div className="p-3 rounded-xl text-xs bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{importResult}</span>
              </div>
            )}

            <form onSubmit={handleImportCsv} className="space-y-3">
              <textarea
                rows={4}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full font-mono text-xs p-3 bg-earth-50 border border-earth-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />

              <div className="flex justify-between items-center">
                <span className="text-[11px] text-earth-400 font-mono">
                  Format: cropId, cropNameEn, marketId, marketNameEn, district, wholesalePrice, retailPrice, date, priceSource
                </span>
                <button
                  type="submit"
                  disabled={importing}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{importing ? "Processing..." : "Validate & Import CSV"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Daily Prices Live Table */}
          <div className="bg-white p-5 rounded-2xl border border-earth-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-earth-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                <span>{language === "bn" ? "ডাটাবেজে সংরক্ষিত বাজার দর রেকর্ডস" : "Live Price Benchmarks in Database"}</span>
              </h3>
              <span className="text-xs font-mono text-earth-500">{prices.length} Records</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-earth-200 max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-earth-100/70 text-earth-700 font-bold uppercase text-[10px] sticky top-0 bg-earth-100">
                  <tr>
                    <th className="py-2.5 px-3">Crop Commodity</th>
                    <th className="py-2.5 px-3">Market & District</th>
                    <th className="py-2.5 px-3">Wholesale Price</th>
                    <th className="py-2.5 px-3">Retail Price</th>
                    <th className="py-2.5 px-3">Spread</th>
                    <th className="py-2.5 px-3">Source</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-100 font-mono text-[11px]">
                  {prices.slice(0, 30).map((p) => (
                    <tr key={p.id} className="hover:bg-teal-50/20 transition">
                      <td className="py-2.5 px-3 font-sans font-bold text-earth-900 whitespace-nowrap">
                        {p.cropNameEn} ({p.cropNameBn})
                      </td>
                      <td className="py-2.5 px-3 font-sans text-earth-700 whitespace-nowrap">
                        {p.marketNameEn}, {p.district}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-teal-800 whitespace-nowrap">
                        ৳{p.wholesalePrice}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-earth-800 whitespace-nowrap">
                        ৳{p.retailPrice}
                      </td>
                      <td className="py-2.5 px-3 text-earth-500 whitespace-nowrap">
                        ৳{p.retailPrice - p.wholesalePrice}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-sans">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-earth-200 text-earth-800">
                          {p.priceSource}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1 font-sans">
                        <button
                          onClick={() => setEditingPrice({ ...p })}
                          className="px-2 py-0.5 rounded bg-earth-100 hover:bg-teal-100 text-earth-800 hover:text-teal-800 text-[10px] font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePrice(p.id)}
                          className="p-1 hover:text-red-600 text-earth-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 7: AUDIT TRAIL */}
      {/* ===================================================================== */}
      {activeTab === "audit" && (
        <div className="bg-white p-5 rounded-2xl border border-earth-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-base text-earth-900">
                {language === "bn" ? "সার্ভার লেনদেন ও বিডিং অডিট ট্রেইল (Immutable Audit Trail)" : "Real-time Platform Audit Log"}
              </h3>
            </div>
            <span className="text-xs text-earth-400 font-mono">
              {auditLogs.length} Events Logged
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-earth-200">
            <table className="w-full text-left text-xs text-earth-700">
              <thead className="bg-earth-50 border-y border-earth-200 text-earth-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">User / Actor</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Entity</th>
                  <th className="py-2.5 px-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-earth-50/60">
                    <td className="py-2.5 px-3 text-earth-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 font-sans font-bold text-earth-900 whitespace-nowrap">
                      {log.userName || "System"}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-800 font-semibold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-earth-500">{log.entityType}</td>
                    <td className="py-2.5 px-3 font-sans text-earth-800 max-w-md truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: EDIT / FIX USER MODAL ("fixed all the user") */}
      {/* ===================================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-earth-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-earth-100">
              <div className="flex items-center gap-2 text-earth-900 font-black text-sm">
                <Edit className="w-4 h-4 text-blue-600" />
                <span>{language === "bn" ? "ইউজার তথ্য ঠিক / ফিক্স করুন" : "Fix User Profile Details"}</span>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-1 rounded-full hover:bg-earth-100 text-earth-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-earth-700 font-bold mb-1">Full Name (English):</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-earth-300 rounded-xl font-bold text-earth-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-earth-700 font-bold mb-1">Name (Bangla):</label>
                <input
                  type="text"
                  value={editingUser.nameBn || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, nameBn: e.target.value })}
                  className="w-full px-3 py-2 border border-earth-300 rounded-xl text-earth-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-earth-700 font-bold mb-1">Role Profile:</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl font-bold text-earth-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="farmer">Farmer (কৃষক)</option>
                    <option value="buyer">Wholesaler (আড়তদার)</option>
                    <option value="factory">Mill Owner (মিল মালিক)</option>
                    <option value="retailer">Retailer (সুপারশপ)</option>
                    <option value="exporter">Exporter (রপ্তানিকারক)</option>
                    <option value="importer">Importer (আমদানিকারক)</option>
                    <option value="admin">Platform Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-earth-700 font-bold mb-1">Phone Number:</label>
                  <input
                    type="text"
                    required
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl font-bold text-earth-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-earth-700 font-bold mb-1">District:</label>
                  <select
                    value={editingUser.district || "Dhaka"}
                    onChange={(e) => setEditingUser({ ...editingUser, district: e.target.value })}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl font-bold text-earth-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {BANGLADESH_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.nameEn}>{d.nameEn} ({d.nameBn})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-earth-700 font-bold mb-1">Company / Enterprise:</label>
                  <input
                    type="text"
                    value={editingUser.companyName || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, companyName: e.target.value })}
                    placeholder="e.g., Pran Agro, Rafiq Farm"
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl text-earth-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between p-3 bg-earth-50 rounded-xl border border-earth-200">
                <span className="font-bold text-earth-800 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Government / Bio-metric Verification Status:</span>
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(editingUser.verified)}
                  onChange={(e) => setEditingUser({ ...editingUser, verified: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-earth-300 rounded-xl font-bold text-earth-700 hover:bg-earth-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Save & Fix User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: ADD NEW USER MODAL */}
      {/* ===================================================================== */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-earth-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-earth-100">
              <div className="flex items-center gap-2 text-earth-900 font-black text-sm">
                <PlusCircle className="w-4 h-4 text-blue-600" />
                <span>Create New User Account</span>
              </div>
              <button onClick={() => setShowAddUserModal(false)} className="p-1 rounded-full hover:bg-earth-100 text-earth-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-earth-700 font-bold mb-1">Full Name (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Md. Anisur Rahman"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-earth-300 rounded-xl font-bold text-earth-900"
                />
              </div>

              <div>
                <label className="block text-earth-700 font-bold mb-1">Name (Bangla):</label>
                <input
                  type="text"
                  placeholder="যেমন: মো: আনিসুর রহমান"
                  value={newUserForm.nameBn}
                  onChange={(e) => setNewUserForm({ ...newUserForm, nameBn: e.target.value })}
                  className="w-full px-3 py-2 border border-earth-300 rounded-xl text-earth-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-earth-700 font-bold mb-1">User Role *</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl font-bold text-earth-900"
                  >
                    <option value="farmer">Farmer (কৃষক)</option>
                    <option value="buyer">Wholesaler (আড়তদার)</option>
                    <option value="factory">Mill Owner (মিল মালিক)</option>
                    <option value="retailer">Retailer (সুপারশপ)</option>
                    <option value="exporter">Exporter (রপ্তানিকারক)</option>
                    <option value="importer">Importer (আমদানিকারক)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-earth-700 font-bold mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+880 17XX-XXXXXX"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl font-bold text-earth-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-earth-700 font-bold mb-1">District:</label>
                  <select
                    value={newUserForm.district}
                    onChange={(e) => setNewUserForm({ ...newUserForm, district: e.target.value })}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl font-bold text-earth-900"
                  >
                    {BANGLADESH_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.nameEn}>{d.nameEn} ({d.nameBn})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-earth-700 font-bold mb-1">Company / Farm Name:</label>
                  <input
                    type="text"
                    placeholder="e.g. Modern Agro"
                    value={newUserForm.companyName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl text-earth-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 border border-earth-300 rounded-xl font-bold text-earth-700 hover:bg-earth-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: EDIT LISTING MODAL */}
      {/* ===================================================================== */}
      {editingListing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-earth-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-earth-100">
              <div className="flex items-center gap-2 text-earth-900 font-black text-sm">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>Edit Produce Listing ({editingListing.cropNameEn})</span>
              </div>
              <button onClick={() => setEditingListing(null)} className="p-1 rounded-full hover:bg-earth-100 text-earth-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveListing} className="space-y-3 text-xs">
              <div>
                <label className="block text-earth-700 font-bold mb-1">Available Quantity ({editingListing.unit}):</label>
                <input
                  type="number"
                  required
                  value={editingListing.quantity}
                  onChange={(e) => setEditingListing({ ...editingListing, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-earth-300 rounded-xl font-bold text-earth-900"
                />
              </div>

              <div>
                <label className="block text-earth-700 font-bold mb-1">Fixed Wholesale Price (BDT/{editingListing.unit}):</label>
                <input
                  type="number"
                  required
                  value={editingListing.expectedPrice || editingListing.startingPrice}
                  onChange={(e) => setEditingListing({ ...editingListing, expectedPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-earth-300 rounded-xl font-bold text-earth-900"
                />
              </div>

              <div>
                <label className="block text-earth-700 font-bold mb-1">Listing Status:</label>
                <select
                  value={editingListing.status}
                  onChange={(e) => setEditingListing({ ...editingListing, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-earth-300 rounded-xl font-bold text-earth-900"
                >
                  <option value="active">ACTIVE (Live in Krishi Bazar)</option>
                  <option value="sold">SOLD / FULFILLED</option>
                  <option value="paused">PAUSED</option>
                  <option value="cancelled">CANCELLED</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingListing(null)}
                  className="px-4 py-2 border border-earth-300 rounded-xl font-bold text-earth-700 hover:bg-earth-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: EDIT PRICE RECORD MODAL */}
      {/* ===================================================================== */}
      {editingPrice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-earth-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-earth-100">
              <div className="flex items-center gap-2 text-earth-900 font-black text-sm">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                <span>Edit DAM Price: {editingPrice.cropNameEn} ({editingPrice.district})</span>
              </div>
              <button onClick={() => setEditingPrice(null)} className="p-1 rounded-full hover:bg-earth-100 text-earth-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrice} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-earth-700 font-bold mb-1">Wholesale Price (BDT/kg):</label>
                  <input
                    type="number"
                    required
                    value={editingPrice.wholesalePrice}
                    onChange={(e) => setEditingPrice({ ...editingPrice, wholesalePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl font-bold text-earth-900"
                  />
                </div>

                <div>
                  <label className="block text-earth-700 font-bold mb-1">Retail Price (BDT/kg):</label>
                  <input
                    type="number"
                    required
                    value={editingPrice.retailPrice}
                    onChange={(e) => setEditingPrice({ ...editingPrice, retailPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl font-bold text-earth-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPrice(null)}
                  className="px-4 py-2 border border-earth-300 rounded-xl font-bold text-earth-700 hover:bg-earth-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold shadow-sm"
                >
                  Save Benchmark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
