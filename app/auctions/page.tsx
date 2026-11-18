"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Auction } from "@/types";
import { Gavel, Clock, ShieldCheck, Filter, PlusCircle, Radio, Camera, AlertCircle } from "lucide-react";
import LiveAuctionCard from "@/components/auctions/LiveAuctionCard";
import FarmerAuctionCreatorModal from "@/components/auctions/FarmerAuctionCreatorModal";
import { fetchWithCache, invalidateCache } from "@/lib/client-cache";

export default function AuctionsPage() {
  const router = useRouter();
  const { currentUser, language, t } = useApp();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roleAlert, setRoleAlert] = useState<string | null>(null);

  const fetchAuctions = async (bypassCache = false) => {
    try {
      if (bypassCache) invalidateCache("/api/v1/auctions");
      const data = await fetchWithCache<{ auctions: Auction[] }>("/api/v1/auctions");
      if (data?.auctions) {
        setAuctions(data.auctions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const handleOpenCreateAuction = () => {
    setRoleAlert(null);
    if (!currentUser) {
      router.push("/login?redirect=/auctions");
      return;
    }
    if (currentUser.role !== "farmer") {
      setRoleAlert(
        language === "bn"
          ? "কেবলমাত্র কৃষকরা নতুন ফসল নিলামে তুলতে পারেন। অনুগ্রহ করে কৃষক প্রোফাইলে লগইন করুন।"
          : "Only verified farmers can list crops for auction. Please sign in as a Farmer."
      );
      return;
    }
    setShowCreateModal(true);
  };

  const filteredAuctions = auctions.filter((a) => {
    if (filterStatus === "all") return true;
    return a.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-earth-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-agri-100 text-agri-800 flex items-center justify-center shrink-0">
              <Gavel className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-earth-900">
              {t.auction.title}
            </h1>
          </div>
          <p className="text-xs text-earth-500 mt-1 max-w-2xl leading-relaxed">
            {t.auction.subtitle}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
          {/* Put Crop in Auction Button */}
          <button
            onClick={handleOpenCreateAuction}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-red-600 to-agri-700 hover:from-red-700 hover:to-agri-800 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md shadow-agri-950/20"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse shrink-0" />
            <span>{language === "bn" ? "+ নিজের ফসল নিলামে তুলুন (ছবি/ভিডিও/লাইভ)" : "+ Put Crop in Auction (Photo/Video/Live)"}</span>
          </button>

          {/* Filters */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-earth-200 text-xs shadow-2xs overflow-x-auto max-w-full">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                filterStatus === "all" ? "bg-agri-700 text-white shadow-xs" : "text-earth-600 hover:text-earth-900"
              }`}
            >
              {language === "bn" ? "সকল নিলাম" : "All Auctions"} ({auctions.length})
            </button>
            <button
              onClick={() => setFilterStatus("live")}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                filterStatus === "live" ? "bg-agri-700 text-white shadow-xs" : "text-earth-600 hover:text-earth-900"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <span>{language === "bn" ? "লাইভ চলমান" : "Live Active"} ({auctions.filter((a) => a.status === "live").length})</span>
            </button>
            <button
              onClick={() => setFilterStatus("accepted")}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                filterStatus === "accepted" ? "bg-agri-700 text-white shadow-xs" : "text-earth-600 hover:text-earth-900"
              }`}
            >
              {language === "bn" ? "সম্পন্ন" : "Sold"} ({auctions.filter((a) => a.status === "accepted").length})
            </button>
          </div>
        </div>
      </div>

      {/* Role Alert Notice if any */}
      {roleAlert && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{roleAlert}</span>
          </div>
          <button
            onClick={() => router.push("/login?redirect=/auctions")}
            className="px-3 py-1.5 rounded-lg bg-amber-700 text-white font-bold text-xs hover:bg-amber-800 transition"
          >
            {language === "bn" ? "কৃষক হিসেবে লগইন করুন" : "Sign In as Farmer"}
          </button>
        </div>
      )}

      {/* Grid of Live Auction Cards */}
      {loading ? (
        <div className="py-20 text-center text-sm text-earth-400">
          {t.common.loading}
        </div>
      ) : filteredAuctions.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-earth-200 p-8 text-earth-500 text-xs">
          {language === "bn" ? "কোনো নিলাম পাওয়া যায়নি।" : "No auctions found in this category."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auc) => (
            <LiveAuctionCard key={auc.id} auction={auc} onRefresh={fetchAuctions} />
          ))}
        </div>
      )}

      {/* Auction Launch Modal */}
      <FarmerAuctionCreatorModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchAuctions}
      />
    </div>
  );
}
