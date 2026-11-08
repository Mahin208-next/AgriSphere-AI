"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { ProcurementRequest } from "@/types";
import { CROPS_DATA } from "@/lib/data/crops";
import { Building2, PlusCircle, Filter } from "lucide-react";
import ProcurementCard from "@/components/procurement/ProcurementCard";

export default function ProcurementPage() {
  const { currentUser, language, t } = useApp();
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const fetchProcurements = async () => {
    try {
      const res = await fetch("/api/v1/procurement");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcurements();
  }, []);

  const filtered = requests.filter((r) => {
    if (selectedCrop !== "all" && r.cropId !== selectedCrop) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-earth-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-agri-100 text-agri-800 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-earth-900">
              {t.procurement.title}
            </h1>
          </div>
          <p className="text-xs text-earth-500 mt-1 max-w-2xl">
            {t.procurement.subtitle}
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="px-3 py-2 bg-white border border-earth-200 rounded-xl text-xs font-semibold text-earth-800 shadow-2xs focus:outline-none"
          >
            <option value="all">{t.common.allCrops}</option>
            {CROPS_DATA.map((c) => (
              <option key={c.id} value={c.id}>
                {language === "bn" ? c.nameBn : c.nameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Procurement Demands */}
      {loading ? (
        <div className="py-20 text-center text-sm text-earth-400">
          {t.common.loading}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-earth-200 p-8 text-earth-500 text-xs">
          {language === "bn" ? "কোনো ক্রয়চাহিদা পাওয়া যায়নি।" : "No procurement requests found for this filter."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((req) => (
            <ProcurementCard key={req.id} request={req} onRefresh={fetchProcurements} />
          ))}
        </div>
      )}
    </div>
  );
}
