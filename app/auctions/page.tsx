"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Auction } from "@/types";
import { Gavel, Clock, ShieldCheck, Filter } from "lucide-react";
import LiveAuctionCard from "@/components/auctions/LiveAuctionCard";

export default function AuctionsPage() {
  const { language, t } = useApp();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const fetchAuctions = async () => {
    try {
      const res = await fetch("/api/v1/auctions");
      if (res.ok) {
        const data = await res.json();
        setAuctions(data.auctions || []);
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

  const filteredAuctions = auctions.filter((a) => {
    if (filterStatus === "all") return true;
    return a.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-earth-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-agri-100 text-agri-800 flex items-center justify-center">
              <Gavel className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-earth-900">
              {t.auction.title}
            </h1>
          </div>
          <p className="text-xs text-earth-500 mt-1 max-w-2xl">
            {t.auction.subtitle}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-earth-200 text-xs shadow-2xs">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filterStatus === "all" ? "bg-agri-700 text-white shadow-xs" : "text-earth-600 hover:text-earth-900"
            }`}
          >
            {language === "bn" ? "সকল নিলাম" : "All Auctions"} ({auctions.length})
          </button>
          <button
            onClick={() => setFilterStatus("live")}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              filterStatus === "live" ? "bg-agri-700 text-white shadow-xs" : "text-earth-600 hover:text-earth-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>{language === "bn" ? "লাইভ চলমান" : "Live Active"} ({auctions.filter((a) => a.status === "live").length})</span>
          </button>
          <button
            onClick={() => setFilterStatus("accepted")}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filterStatus === "accepted" ? "bg-agri-700 text-white shadow-xs" : "text-earth-600 hover:text-earth-900"
            }`}
          >
            {language === "bn" ? "সম্পন্ন" : "Sold"} ({auctions.filter((a) => a.status === "accepted").length})
          </button>
        </div>
      </div>

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
    </div>
  );
}
