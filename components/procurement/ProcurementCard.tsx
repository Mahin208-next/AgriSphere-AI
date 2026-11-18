"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ProcurementRequest, SupplierOffer } from "@/types";
import { useApp } from "@/context/AppContext";
import { 
  Building2, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Send, 
  ChevronRight, 
  User, 
  AlertCircle,
  FileText
} from "lucide-react";

interface ProcurementCardProps {
  request: ProcurementRequest;
  onRefresh?: () => void;
}

export default function ProcurementCard({ request, onRefresh }: ProcurementCardProps) {
  const { currentUser, language, t } = useApp();
  const [offers, setOffers] = useState<SupplierOffer[]>([]);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showOffersList, setShowOffersList] = useState(false);
  const [offeredQty, setOfferedQty] = useState<number>(Math.min(1000, request.requiredQuantity));
  const [pricePerUnit, setPricePerUnit] = useState<number>(request.maxBudgetPerUnit || 35);
  const [deliveryDate, setDeliveryDate] = useState<string>(request.requiredDeliveryDate);
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isOwner = currentUser?.id === request.buyerId;

  const fetchOffers = async () => {
    try {
      const res = await fetch(`/api/v1/procurement/${request.id}/offers`);
      if (res.ok) {
        const data = await res.json();
        setOffers(data.offers || []);
      }
    } catch (e) {
      console.error("Error fetching offers:", e);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [request.id]);

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!currentUser) {
      setFeedback({
        type: "error",
        message: language === "bn" ? "প্রস্তাব দেওয়ার আগে অনুগ্রহ করে কৃষক হিসেবে লগইন করুন।" : "Please sign in as a Farmer to submit an offer."
      });
      return;
    }

    if (currentUser.role !== "farmer") {
      setFeedback({
        type: "error",
        message: language === "bn" ? "কেবলমাত্র নিবন্ধিত কৃষকরা সরবরাহ প্রস্তাব দিতে পারেন।" : "Only verified farmers can submit supply offers."
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/v1/procurement/${request.id}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offeredQuantity: offeredQty,
          pricePerUnit,
          qualityGrade: request.qualityGrade,
          estimatedDeliveryDate: deliveryDate,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: data.message });
        setShowOfferForm(false);
        fetchOffers();
        if (onRefresh) onRefresh();
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to submit offer" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      const res = await fetch(`/api/v1/offers/${offerId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: request.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: data.message });
        fetchOffers();
        if (onRefresh) onRefresh();
      } else {
        setFeedback({ type: "error", message: data.error });
      }
    } catch (e: any) {
      setFeedback({ type: "error", message: e.message });
    }
  };

  const remainingQty = request.requiredQuantity - request.fulfilledQuantity;
  const isFulfilled = request.status === "fulfilled" || remainingQty <= 0;

  return (
    <div className="bg-white rounded-2xl border border-earth-200 p-5 shadow-sm hover:shadow-md transition">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-earth-100 text-earth-700 uppercase">
              {request.buyerRole === "factory" ? (language === "bn" ? "কারখানা/মিল" : "Agro Mill") : (language === "bn" ? "পাইকারি/আড়ত" : "Wholesaler")}
            </span>
            <span className="text-xs font-semibold text-agri-800">
              {request.companyName}
            </span>
          </div>

          <h3 className="text-lg font-bold text-earth-900 mt-1">
            {language === "bn" ? request.cropNameBn : request.cropNameEn}
          </h3>
          <p className="text-xs text-earth-500">
            {language === "bn" ? "প্রয়োজনীয় মান:" : "Quality Grade:"} <span className="font-semibold text-earth-700">{request.qualityGrade}</span>
          </p>
        </div>

        <div className="text-right">
          <div className="text-base font-extrabold text-earth-900">
            {request.requiredQuantity.toLocaleString()} {request.unit}
          </div>
          <div className="text-[11px] text-agri-700 font-semibold">
            {request.fulfilledQuantity > 0 ? (
              <span>{request.fulfilledQuantity.toLocaleString()} {request.unit} {language === "bn" ? "সংগৃহীত" : "Fulfilled"}</span>
            ) : (
              <span className="text-harvest-700">{language === "bn" ? "নতুন চাহিদা" : "Seeking Suppliers"}</span>
            )}
          </div>
        </div>
      </div>

      {/* Logistics & Budget bar */}
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2.5 sm:gap-3 p-3 bg-earth-50 rounded-xl text-xs text-earth-700 mb-4">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-agri-600 shrink-0" />
          <span className="truncate">{request.deliveryLocation}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-agri-600 shrink-0" />
          <span>{language === "bn" ? "তারিখ:" : "By:"} {request.requiredDeliveryDate}</span>
        </div>
        <div>
          <span className="text-earth-500">{t.procurement.budget}: </span>
          <span className="font-bold text-earth-900">
            {request.maxBudgetPerUnit > 0 ? `৳${request.maxBudgetPerUnit}/${request.unit}` : (language === "bn" ? "দরকষাকষি সাপেক্ষ (গোপন)" : "Negotiable (Private)")}
          </span>
        </div>
        <div>
          <span className="text-earth-500">{language === "bn" ? "আংশিক সরবরাহ:" : "Split Supply:"} </span>
          <span className="font-semibold text-agri-700">
            {request.allowSplitFulfillment ? (language === "bn" ? "অনুমোদিত" : "Allowed") : (language === "bn" ? "একক লট" : "Single Lot")}
          </span>
        </div>
      </div>

      {/* Description / Notes */}
      {request.notes && (
        <p className="text-xs text-earth-600 italic mb-4">
          &ldquo;{request.notes}&rdquo;
        </p>
      )}

      {/* Feedback Alert */}
      {feedback && (
        <div className={`p-2.5 rounded-lg text-xs mb-3 flex items-center gap-2 ${feedback.type === "success" ? "bg-agri-50 text-agri-800" : "bg-red-50 text-red-800"}`}>
          {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 text-agri-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-earth-100">
        <button
          onClick={() => setShowOffersList(!showOffersList)}
          className="text-xs font-semibold text-agri-800 hover:text-agri-900 flex items-center gap-1"
        >
          <span>{t.procurement.myOffers} ({offers.length})</span>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showOffersList ? "rotate-90" : ""}`} />
        </button>

        {!currentUser ? (
          <Link
            href="/login?redirect=/procurement"
            className="px-3.5 py-1.5 rounded-xl bg-agri-800 hover:bg-agri-900 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-3 h-3" />
            <span>{language === "bn" ? "প্রস্তাব দিতে লগইন করুন" : "Sign In to Offer"}</span>
          </Link>
        ) : !isOwner && !isFulfilled ? (
          <button
            onClick={() => {
              if (currentUser.role !== "farmer") {
                setFeedback({
                  type: "error",
                  message: language === "bn" ? "কেবলমাত্র নিবন্ধিত কৃষকরা সরবরাহ প্রস্তাব দিতে পারেন।" : "Only verified farmers can submit supply offers."
                });
                return;
              }
              setShowOfferForm(!showOfferForm);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-3 h-3" />
            <span>{showOfferForm ? t.common.cancel : t.procurement.submitOffer}</span>
          </button>
        ) : null}
      </div>

      {/* Reverse Offer Form for Farmers */}
      {showOfferForm && (
        <form onSubmit={handleSubmitOffer} className="mt-4 p-4 bg-agri-50/60 rounded-xl border border-agri-200 space-y-3">
          <h4 className="text-xs font-bold text-agri-950 uppercase tracking-wider">
            {language === "bn" ? "কৃষকের সরবরাহ ও দর প্রস্তাব ফর্ম" : "Farmer Reverse Supply Offer"}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-earth-700 font-semibold mb-1">
                {t.procurement.offeredQty} ({request.unit})
              </label>
              <input
                type="number"
                min={100}
                max={request.requiredQuantity}
                value={offeredQty}
                onChange={(e) => setOfferedQty(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-earth-300 rounded-lg font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-earth-700 font-semibold mb-1">
                {t.procurement.offeredPrice}
              </label>
              <input
                type="number"
                min={1}
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-earth-300 rounded-lg font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-earth-700 font-semibold mb-1">
              {language === "bn" ? "বিশেষ দ্রষ্টব্য বা ডেলিভারি নোট:" : "Delivery Note / Remarks:"}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === "bn" ? "যেমন: সরাসরি শেরপুর থেকে কাভার্ড ভ্যানে পৌঁছে দেওয়া যাবে।" : "e.g. Can dispatch immediately from Bogura farm"}
              className="w-full px-3 py-1.5 bg-white border border-earth-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-agri-700 hover:bg-agri-800 text-white rounded-lg text-xs font-bold shadow-sm"
            >
              {submitting ? t.common.loading : (language === "bn" ? "প্রস্তাব নিশ্চিত করুন" : "Confirm Offer")}
            </button>
          </div>
        </form>
      )}

      {/* Offers List Drawer (For Buyer to Accept) */}
      {showOffersList && (
        <div className="mt-3 bg-earth-50 rounded-xl p-3 border border-earth-200 space-y-2">
          {offers.length === 0 ? (
            <p className="text-xs text-earth-500 text-center py-2">
              {language === "bn" ? "এখনও কোনো কৃষক প্রস্তাব জমা দেননি।" : "No farmer offers received yet."}
            </p>
          ) : (
            offers.map((o) => (
              <div
                key={o.id}
                className="bg-white p-3 rounded-lg border border-earth-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-earth-900">{o.farmerName}</span>
                    <span className="text-[11px] text-earth-500">({o.farmerDistrict})</span>
                  </div>
                  <div className="text-xs text-earth-600 mt-0.5">
                    <span className="font-bold text-agri-800">{o.offeredQuantity} {o.unit}</span> @ <span className="font-bold text-earth-900">৳{o.pricePerUnit}/kg</span>
                    <span className="text-earth-400"> (Total: ৳{(o.offeredQuantity * o.pricePerUnit).toLocaleString()})</span>
                  </div>
                  {o.notes && <p className="text-[11px] text-earth-500 mt-0.5 italic">&ldquo;{o.notes}&rdquo;</p>}
                </div>

                <div className="flex items-center gap-2">
                  {o.status === "accepted" ? (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {language === "bn" ? "অর্ডার নিশ্চিতকৃত" : "Accepted"}
                    </span>
                  ) : isOwner ? (
                    <button
                      onClick={() => handleAcceptOffer(o.id)}
                      className="px-3 py-1 bg-harvest-600 hover:bg-harvest-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                    >
                      {t.common.accept}
                    </button>
                  ) : (
                    <span className="text-[11px] text-earth-400 font-medium">
                      {o.status}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

