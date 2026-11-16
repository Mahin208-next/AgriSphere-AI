"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Auction, ProcurementRequest, Order } from "@/types";
import { CROPS_DATA } from "@/lib/data/crops";
import { BANGLADESH_DISTRICTS } from "@/lib/data/bangladesh-geo";
import { 
  Building2, 
  Gavel, 
  PlusCircle, 
  ShoppingBag, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  FileText
} from "lucide-react";
import LiveAuctionCard from "../auctions/LiveAuctionCard";
import ProcurementCard from "../procurement/ProcurementCard";

export default function BuyerDashboard() {
  const { currentUser, language, t } = useApp();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [procurements, setProcurements] = useState<ProcurementRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Procurement Form state
  const [cropId, setCropId] = useState("tomato");
  const [requiredQty, setRequiredQty] = useState(10000);
  const [qualityGrade, setQualityGrade] = useState("Grade A");
  const [maxBudget, setMaxBudget] = useState(38);
  const [isPrivate, setIsPrivate] = useState(false);
  const [deliveryDistrict, setDeliveryDistrict] = useState(currentUser?.district || "Dhaka");
  const [deliveryLocation, setDeliveryLocation] = useState("Central Distribution Warehouse, Tejgaon, Dhaka");
  const [deliveryDate, setDeliveryDate] = useState(new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0]);
  const [allowSplit, setAllowSplit] = useState(true);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchBuyerData = async () => {
    setLoading(true);
    try {
      const [aucRes, procRes, ordRes] = await Promise.all([
        fetch("/api/v1/auctions"),
        fetch("/api/v1/procurement"),
        fetch("/api/v1/orders"),
      ]);

      if (aucRes.ok) {
        const d = await aucRes.json();
        setAuctions(d.auctions || []);
      }
      if (procRes.ok) {
        const d = await procRes.json();
        setProcurements(d.requests || []);
      }
      if (ordRes.ok) {
        const d = await ordRes.json();
        setOrders(d.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyerData();
  }, []);

  const handleCreateProcurement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/procurement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropId,
          requiredQuantity: requiredQty,
          qualityGrade,
          maxBudgetPerUnit: maxBudget,
          isBudgetPrivate: isPrivate,
          deliveryDistrict,
          deliveryLocation,
          requiredDeliveryDate: deliveryDate,
          allowSplitFulfillment: allowSplit,
          notes,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        fetchBuyerData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const myProcurements = procurements.filter((p) => p.buyerId === currentUser?.id);
  const totalPurchaseBdt = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-agri-950 via-agri-900 to-agri-800 text-white p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-harvest-500 text-harvest-950 uppercase tracking-wider">
            {currentUser?.role === "factory" ? (language === "bn" ? "কারখানা ও প্রসেসিং হাব" : "Agro Factory / Mill Hub") : (language === "bn" ? "পাইকারি মোকাম ও আড়ত" : "Wholesale Buyer")}
          </span>
          <h1 className="text-2xl font-black mt-2">
            {currentUser?.companyName || currentUser?.name}
          </h1>
          <p className="text-xs text-agri-200 mt-1">
            {language === "bn"
              ? `কর্পোরেট ক্রয় কেন্দ্র • জেলা: ${currentUser?.district} • ট্রেড লাইসেন্স ও ট্যাক্স যাচাইকৃত`
              : `Procurement Wing • ${currentUser?.district} • Verified Business Account`}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 bg-harvest-500 hover:bg-harvest-400 text-harvest-950 font-black rounded-2xl text-xs transition flex items-center gap-2 shadow-lg shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.procurement.postRequest}</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-earth-200 shadow-2xs">
          <div className="text-xs text-earth-500 font-medium">
            {language === "bn" ? "আমার ক্রয়চাহিদা" : "My Demands"}
          </div>
          <div className="text-2xl font-black text-earth-900 mt-1">
            {myProcurements.length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-earth-200 shadow-2xs">
          <div className="text-xs text-earth-500 font-medium">
            {language === "bn" ? "লাইভ নিলামে সুযোগ" : "Live Bidding Opportunities"}
          </div>
          <div className="text-2xl font-black text-agri-700 mt-1">
            {auctions.filter((a) => a.status === "live").length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-earth-200 shadow-2xs">
          <div className="text-xs text-earth-500 font-medium">
            {language === "bn" ? "নিশ্চিতকৃত অর্ডার" : "Completed Orders"}
          </div>
          <div className="text-2xl font-black text-earth-900 mt-1">
            {orders.length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-earth-200 shadow-2xs">
          <div className="text-xs text-earth-500 font-medium">
            {language === "bn" ? "মোট ক্রয়মূল্য (টাকা)" : "Total Sourced (BDT)"}
          </div>
          <div className="text-2xl font-black text-agri-800 mt-1">
            ৳{totalPurchaseBdt.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Section 1: My Procurement Requests (System B) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-agri-700" />
            <h2 className="text-lg font-bold text-earth-900">
              {language === "bn" ? "আমার প্রকাশিত পাইকারি ক্রয়চাহিদা (System B)" : "My Bulk Procurement Requests"}
            </h2>
          </div>
          <span className="text-xs text-earth-500">
            {language === "bn" ? "কৃষকের বিপরীত সরবরাহ প্রস্তাব গ্রহণ করুন" : "Review Farmer Reverse Offers"}
          </span>
        </div>

        {myProcurements.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-earth-200 text-center text-earth-500 text-xs">
            {language === "bn" ? "আপনার কোনো খোলা ক্রয়চাহিদা নেই। উপরে '+ নতুন ক্রয়চাহিদা প্রকাশ করুন' এ ক্লিক করুন।" : "No procurement requests published yet. Click above to post your requirement."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myProcurements.map((req) => (
              <ProcurementCard key={req.id} request={req} onRefresh={fetchBuyerData} />
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Active Farmer Auctions Open for Bidding (System A) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-agri-700" />
            <h2 className="text-lg font-bold text-earth-900">
              {language === "bn" ? "কৃষকদের চলমান লাইভ নিলাম (সরাসরি বিড করুন)" : "Live Farmer Auctions (Bid Directly)"}
            </h2>
          </div>
          <span className="text-xs text-earth-500">
            {language === "bn" ? "সার্ভার ভ্যালিডেটেড বিডিং" : "Server-Validated Bidding"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {auctions
            .filter((a) => a.status === "live")
            .map((auc) => (
              <LiveAuctionCard key={auc.id} auction={auc} onRefresh={fetchBuyerData} />
            ))}
        </div>
      </div>

      {/* Post Procurement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-earth-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-earth-900 mb-1">
              {t.procurement.postRequest}
            </h3>
            <p className="text-xs text-earth-500 mb-4">
              {language === "bn"
                ? "আপনার প্রয়োজনীয় ফসল, পরিমাণ ও সর্বোচ্চ বাজেট উল্লেখ করুন যাতে চাষিরা সরাসরি প্রস্তাব দিতে পারে"
                : "Post bulk demand for farmers to discover and submit competitive supply offers"}
            </p>

            <form onSubmit={handleCreateProcurement} className="space-y-4 text-xs">
              <div>
                <label className="block text-earth-700 font-bold mb-1">
                  {t.market.selectCrop}
                </label>
                <select
                  value={cropId}
                  onChange={(e) => setCropId(e.target.value)}
                  className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl font-bold"
                >
                  {CROPS_DATA.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameEn} ({c.nameBn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-earth-700 font-bold mb-1">
                    {t.procurement.requiredQty} (kg):
                  </label>
                  <input
                    type="number"
                    min={500}
                    value={requiredQty}
                    onChange={(e) => setRequiredQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-earth-700 font-bold mb-1">
                    {language === "bn" ? "প্রয়োজনীয় গ্রেড:" : "Quality Grade:"}
                  </label>
                  <input
                    type="text"
                    value={qualityGrade}
                    onChange={(e) => setQualityGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-earth-700 font-bold mb-1">
                    {t.procurement.budget} (BDT/kg):
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl font-bold"
                    required
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-earth-800">
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="rounded text-agri-600 focus:ring-agri-500 w-4 h-4"
                    />
                    <span>{t.procurement.privateBudget}</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-earth-700 font-bold mb-1">
                    {t.procurement.destination}:
                  </label>
                  <select
                    value={deliveryDistrict}
                    onChange={(e) => setDeliveryDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl font-bold"
                  >
                    {BANGLADESH_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.nameEn}>
                        {d.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-earth-700 font-bold mb-1">
                    {t.procurement.deadline}:
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-earth-700 font-bold mb-1">
                  {language === "bn" ? "ডেলিভারি ঠিকানা ও সুবিধা:" : "Specific Facility Address:"}
                </label>
                <input
                  type="text"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-agri-950 p-2.5 bg-agri-50 rounded-xl border border-agri-200">
                  <input
                    type="checkbox"
                    checked={allowSplit}
                    onChange={(e) => setAllowSplit(e.target.checked)}
                    className="rounded text-agri-600 focus:ring-agri-500 w-4 h-4"
                  />
                  <span>{t.procurement.splitAllowed}</span>
                </label>
              </div>

              <div>
                <label className="block text-earth-700 font-semibold mb-1">
                  {language === "bn" ? "বিশেষ শর্তাবলী বা নোট:" : "Terms & Inspection Details:"}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Instant payment upon quality inspection; crates provided."
                  className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-earth-300 text-earth-700 rounded-xl font-semibold"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-agri-700 hover:bg-agri-800 text-white rounded-xl font-bold shadow-md"
                >
                  {submitting ? t.common.loading : t.procurement.postRequest}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

