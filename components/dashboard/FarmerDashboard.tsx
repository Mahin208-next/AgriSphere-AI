"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { ProductListing, Auction, ProcurementRequest, DirectContract, OversupplyAlert } from "@/types";
import { CROPS_DATA } from "@/lib/data/crops";
import { 
  PlusCircle, 
  Gavel, 
  TrendingUp, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  AlertTriangle,
  Scale,
  FileText
} from "lucide-react";
import LiveAuctionCard from "../auctions/LiveAuctionCard";
import FarmerAuctionCreatorModal from "../auctions/FarmerAuctionCreatorModal";
import { Camera, Video, Radio } from "lucide-react";

export default function FarmerDashboard() {
  const { currentUser, language, t } = useApp();
  const [listings, setListings] = useState<ProductListing[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [procurements, setProcurements] = useState<ProcurementRequest[]>([]);
  const [contracts, setContracts] = useState<DirectContract[]>([]);
  const [alerts, setAlerts] = useState<OversupplyAlert[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [listRes, aucRes, procRes, cntrRes, alrRes] = await Promise.all([
        fetch("/api/v1/listings"),
        fetch("/api/v1/auctions"),
        fetch("/api/v1/procurement"),
        fetch("/api/v1/contracts"),
        fetch("/api/v1/alerts/oversupply"),
      ]);

      if (listRes.ok) {
        const d = await listRes.json();
        setListings(d.listings || []);
      }
      if (aucRes.ok) {
        const d = await aucRes.json();
        setAuctions(d.auctions || []);
      }
      if (procRes.ok) {
        const d = await procRes.json();
        setProcurements(d.requests || []);
      }
      if (cntrRes.ok) {
        const d = await cntrRes.json();
        setContracts(d.contracts || []);
      }
      if (alrRes.ok) {
        const d = await alrRes.json();
        setAlerts(d.alerts || []);
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);



  const myAuctions = auctions.filter((a) => a.farmerId === currentUser?.id);
  const myAlert = alerts.find((a) => a.district.toLowerCase() === (currentUser?.district || "bogura").toLowerCase());

  return (
    <div className="space-y-8">
      {/* Top Welcome & Actions */}
      <div className="bg-gradient-to-r from-agri-900 to-agri-800 text-white p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-agri-700 text-agri-200 uppercase tracking-wider">
            {language === "bn" ? "কৃষক নিয়ন্ত্রণ কক্ষ" : "Farmer Command Center"}
          </span>
          <h1 className="text-2xl font-black mt-2">
            {language === "bn" ? `স্বাগতম, ${currentUser?.nameBn || currentUser?.name}` : `Welcome, ${currentUser?.name}`}
          </h1>
          <p className="text-xs text-agri-200 mt-1">
            {language === "bn"
              ? `খামার অবস্থান: ${currentUser?.district || "বগুড়া"} • এনআইডি ও বায়োমেট্রিক অনুমোদিত কৃষক`
              : `Farm: ${currentUser?.district} • Verified Smallholder Model Producer`}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 bg-harvest-500 hover:bg-harvest-400 text-harvest-950 font-black rounded-2xl text-xs transition flex items-center gap-2 shadow-lg shadow-harvest-950/20 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{language === "bn" ? "+ নতুন ফসল তালিকা বা লাইভ নিলাম শুরু" : "+ Add Crop / Start Live Auction"}</span>
        </button>
      </div>

      {/* Direct Produce Auction Launch Panel (Photo / Video / Live Stream) */}
      <div className="bg-white rounded-3xl border-2 border-agri-600/30 p-5 sm:p-6 shadow-sm relative overflow-hidden bg-gradient-to-br from-white via-agri-50/20 to-harvest-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-100 text-red-700 border border-red-200">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              {language === "bn" ? "কৃষকের নিজস্ব নিলাম কেন্দ্র (System A)" : "Farmer Direct Auction Center (System A)"}
            </div>
            <h2 className="text-lg sm:text-xl font-black text-earth-900">
              {language === "bn" ? "নিজের ফসল ছবি, ভিডিও বা সরাসরি লাইভে এসে নিলামে তুলুন" : "Sell Your Produce via Live Auction with Photos, Video & Live Stream"}
            </h2>
            <p className="text-xs text-earth-600 leading-relaxed">
              {language === "bn"
                ? "মধ্যস্বত্বভোগীদের কাছে পানির দরে বিক্রি না করে সরাসরি ঢাকাসহ সারা দেশের পাইকার, মিল ও সুপারশপের কাছে লাইভ নিলামে ডাক তুলুন। আপনি ছবি ও ভিডিও আপলোড করতে পারেন অথবা ফোন/ক্যামেরায় সরাসরি লাইভে আসতে পারেন।"
                : "Skip intermediaries. Upload fresh photos, short harvest videos, or go live on camera to let nationwide wholesalers bid in real-time."}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 sm:flex-none px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs transition flex items-center justify-center gap-2 shadow-md shadow-red-600/20"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>{language === "bn" ? "🔴 লাইভে গিয়ে ডাক তুলুন" : "🔴 Go Live & Auction"}</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 sm:flex-none px-4 py-3 bg-agri-800 hover:bg-agri-900 text-white font-bold rounded-2xl text-xs transition flex items-center justify-center gap-2 shadow-md shadow-agri-950/20"
            >
              <Camera className="w-4 h-4 text-harvest-300" />
              <span>{language === "bn" ? "📸 ছবি/ভিডিও আপলোড" : "📸 Upload Photo/Video"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Oversupply Alert Notice if any */}
      {myAlert && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950">
            <div className="font-bold uppercase tracking-wider text-amber-900">
              {language === "bn" ? `⚠️ বাজার সতর্কবার্তা: ${myAlert.districtBn} জেলায় ${myAlert.cropNameBn} অতিরিক্ত জোগান!` : `⚠️ Regional Surplus Alert: ${myAlert.district} (${myAlert.cropNameEn})`}
            </div>
            <p className="mt-1 leading-relaxed">
              {language === "bn"
                ? `চলতি সপ্তাহে তালিকাভুক্ত জোগান ${myAlert.listedSupplyTonnes} টন বনাম চাহিদা ${myAlert.buyerDemandTonnes} টন। এআই সুপারিশ: স্থানীয় হাটে পানির দরে বিক্রি না করে ঢাকা কারওয়ান বাজার বা গাজীপুরের কারখানায় সরাসরি সরবরাহ করুন।`
                : `Listed supply (${myAlert.listedSupplyTonnes}t) exceeds regional demand (${myAlert.buyerDemandTonnes}t). Recommendation: Dispatch to Dhaka terminal market or connect with agro-mills.`}
            </p>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-earth-200 shadow-2xs">
          <div className="text-[11px] sm:text-xs text-earth-500 font-medium">
            {language === "bn" ? "সক্রিয় ফসল তালিকা" : "Active Listings"}
          </div>
          <div className="text-xl sm:text-2xl font-black text-earth-900 mt-1">
            {listings.filter((l) => l.farmerId === currentUser?.id).length}
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-earth-200 shadow-2xs">
          <div className="text-[11px] sm:text-xs text-earth-500 font-medium">
            {language === "bn" ? "লাইভ নিলামে ফসল" : "Live Auctions"}
          </div>
          <div className="text-xl sm:text-2xl font-black text-agri-700 mt-1">
            {myAuctions.filter((a) => a.status === "live").length}
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-earth-200 shadow-2xs">
          <div className="text-[11px] sm:text-xs text-earth-500 font-medium">
            {language === "bn" ? "কারখানা ও ক্রেতার চাহিদা" : "Matching Demands"}
          </div>
          <div className="text-xl sm:text-2xl font-black text-harvest-600 mt-1">
            {procurements.length}
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-earth-200 shadow-2xs">
          <div className="text-[11px] sm:text-xs text-earth-500 font-medium">
            {language === "bn" ? "সরাসরি চুক্তি প্রস্তাব" : "Contract Proposals"}
          </div>
          <div className="text-xl sm:text-2xl font-black text-earth-900 mt-1">
            {contracts.length}
          </div>
        </div>
      </div>

      {/* Section 1: My Live Auctions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-agri-700" />
            <h2 className="text-lg font-bold text-earth-900">
              {language === "bn" ? "আমার সক্রিয় লাইভ নিলামসমূহ" : "My Live Auctions Arena"}
            </h2>
          </div>
          <span className="text-xs text-earth-500">
            {language === "bn" ? "দ্বিমুখী সরাসরি বিডিং" : "Two-way Competitive Bidding"}
          </span>
        </div>

        {myAuctions.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-earth-200 text-center text-earth-500 text-xs">
            {language === "bn" ? "বর্তমানে কোনো নিলাম চালু নেই। নতুন নিলাম শুরু করতে উপরের বাটনে ক্লিক করুন।" : "No auctions active right now. Click '+ Add Crop / Start Live Auction' above to launch one."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myAuctions.map((auc) => (
              <LiveAuctionCard key={auc.id} auction={auc} onRefresh={fetchDashboardData} />
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Direct Contracts Proposed by Agro Mills */}
      {contracts.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-earth-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-agri-700" />
            <h3 className="text-base font-bold text-earth-900">
              {language === "bn" ? "কারখানা ও মিলের সরাসরি ক্রয়ের চুক্তি প্রস্তাব (System C)" : "Direct Forward Contract Proposals (System C)"}
            </h3>
          </div>

          <div className="space-y-3">
            {contracts.map((cntr) => (
              <div
                key={cntr.id}
                className="p-4 bg-earth-50 rounded-xl border border-earth-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-earth-900 text-sm">{cntr.initiatorName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-agri-100 text-agri-800 font-semibold uppercase">
                      {cntr.status}
                    </span>
                  </div>
                  <div className="text-earth-600 mt-1">
                    <span className="font-bold text-agri-900">{cntr.quantity.toLocaleString()} {cntr.unit} {cntr.cropNameEn}</span> @ ৳{cntr.agreedPrice}/kg
                    <span className="text-earth-400"> • {cntr.deliverySchedule}</span>
                  </div>
                  <p className="text-earth-500 mt-1 italic">&ldquo;{cntr.notes}&rdquo;</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-agri-800">
                    ৳{(cntr.quantity * cntr.agreedPrice).toLocaleString()} BDT
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Listing / Start Auction Modal with Photos, Video & Live Broadcast */}
      <FarmerAuctionCreatorModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}

