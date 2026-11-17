"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { ExportRFQ, ExportQuotation } from "@/types";
import { 
  Globe2, 
  Plane, 
  Ship, 
  ShieldCheck, 
  FileCheck2, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  Send,
  Building,
  Info
} from "lucide-react";

export default function ExportRadarView() {
  const { currentUser, language, t } = useApp();
  const [rfqs, setRfqs] = useState<ExportRFQ[]>([]);
  const [selectedRfq, setSelectedRfq] = useState<ExportRFQ | null>(null);
  const [fobPrice, setFobPrice] = useState<number>(1.75);
  const [leadTime, setLeadTime] = useState<number>(4);
  const [packaging, setPackaging] = useState<string>("4.5 kg Corrugated ventilated export cartons with temperature data logger");
  const [notes, setNotes] = useState<string>("");
  const [showRfqModal, setShowRfqModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // New RFQ form states (for Importer)
  const [newCropName, setNewCropName] = useState("Green Chilli");
  const [newCountry, setNewCountry] = useState("United Arab Emirates");
  const [newQty, setNewQty] = useState(10);
  const [newPort, setNewPort] = useState("Dubai International Airport (Air Cargo)");
  const [newTargetFob, setNewTargetFob] = useState(1.80);

  const fetchRfqs = async () => {
    try {
      const res = await fetch("/api/v1/export/rfqs");
      if (res.ok) {
        const data = await res.json();
        setRfqs(data.rfqs || []);
      }
    } catch (e) {
      console.error("Error fetching RFQs:", e);
    }
  };

  useEffect(() => {
    fetchRfqs();
  }, []);

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfq) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/v1/export/rfqs/${selectedRfq.id}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fobPriceUsd: fobPrice,
          leadTimeDays: leadTime,
          packagingOffered: packaging,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({
          type: "success",
          message: language === "bn" ? "আন্তর্জাতিক কোটেশন সফলভাবে জমা হয়েছে!" : "Quotation successfully submitted to importer!",
        });
        setSelectedRfq(null);
        fetchRfqs();
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to submit quote" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/v1/export/rfqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropNameEn: newCropName,
          cropNameBn: newCropName === "Green Chilli" ? "কাঁচা মরিচ" : "মিষ্টি কুমড়া",
          country: newCountry,
          targetQuantityTonnes: newQty,
          destinationPort: newPort,
          maxTargetFobPriceUsd: newTargetFob,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({
          type: "success",
          message: language === "bn" ? "নতুন আন্তর্জাতিক আরএফকিউ প্রকাশিত হয়েছে!" : "International RFQ published successfully!",
        });
        setShowRfqModal(false);
        fetchRfqs();
      } else {
        setFeedback({ type: "error", message: data.error });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Importer RFQ CTA */}
      <div className="bg-gradient-to-r from-agri-950 via-agri-900 to-agri-800 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-harvest-500 text-harvest-950 mb-2">
            <Globe2 className="w-3.5 h-3.5" />
            <span>{t.export.title}</span>
          </div>
          <h2 className="text-xl font-bold">
            {language === "bn" ? "আন্তর্জাতিক কৃষি রপ্তানি ও সরাসরি আরএফকিউ" : "Global Agricultural Trade & Importer RFQs"}
          </h2>
          <p className="text-xs text-agri-200 mt-1 max-w-2xl leading-relaxed">
            {t.export.subtitle}
          </p>
        </div>

        {currentUser?.role === "importer" || currentUser?.role === "admin" ? (
          <button
            onClick={() => setShowRfqModal(true)}
            className="px-4 py-2.5 bg-harvest-500 hover:bg-harvest-400 text-harvest-950 font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-sm shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.export.postRfq}</span>
          </button>
        ) : null}
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === "success" ? "bg-agri-50 text-agri-800 border border-agri-200" : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 text-agri-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* RFQ List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rfqs.map((rfq) => (
          <div
            key={rfq.id}
            className="bg-white rounded-2xl border border-earth-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              {/* Top Bar */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-agri-800 bg-agri-50 px-2 py-0.5 rounded border border-agri-200">
                      {rfq.country}
                    </span>
                    <span className="text-xs text-earth-500 font-semibold">{rfq.companyName}</span>
                  </div>
                  <h3 className="text-base font-bold text-earth-900 mt-1">
                    {language === "bn" ? rfq.cropNameBn : rfq.cropNameEn}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-base font-extrabold text-agri-800">
                    {rfq.targetQuantityTonnes} Tonnes
                  </span>
                  <div className="text-[11px] text-earth-400 font-medium">
                    {rfq.targetDeliveryMonth}
                  </div>
                </div>
              </div>

              {/* Specs & Requirements */}
              <div className="bg-earth-50 rounded-xl p-3.5 space-y-2 text-xs text-earth-700 mb-4 border border-earth-100">
                <div className="flex justify-between">
                  <span className="text-earth-500">{language === "bn" ? "প্রয়োজনীয় গ্রেড:" : "Required Grade:"}</span>
                  <span className="font-semibold text-earth-900">{rfq.requiredGrade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-earth-500">{language === "bn" ? "গন্তব্য বন্দর:" : "Destination Port:"}</span>
                  <span className="font-semibold text-earth-900">{rfq.destinationPort}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-earth-500">{language === "bn" ? "প্যাকেজিং মান:" : "Packaging Spec:"}</span>
                  <span className="font-semibold text-earth-900 truncate max-w-[200px]">{rfq.packagingType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-earth-500">{language === "bn" ? "টার্গেট এফওবি মূল্য:" : "Target FOB Price:"}</span>
                  <span className="font-bold text-agri-800">USD ${rfq.maxTargetFobPriceUsd}/kg</span>
                </div>
              </div>

              {/* Compliance Badges */}
              <div className="mb-4">
                <div className="text-[11px] font-bold text-earth-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-agri-600" />
                  <span>{t.export.certifications}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {rfq.certificationsRequired.map((cert, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-agri-50 text-agri-800 border border-agri-200"
                    >
                      ✓ {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-3 border-t border-earth-100 flex items-center justify-between">
              <span className="text-xs text-earth-500">
                {(rfq as any).quotationCount || 1} {language === "bn" ? "কোটেশন জমা পড়েছে" : "Quotes Submitted"}
              </span>

              <button
                onClick={() => setSelectedRfq(rfq)}
                className="px-4 py-2 bg-agri-700 hover:bg-agri-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.export.submitQuote}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Compliance Disclaimer Notice */}
      <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 text-xs text-amber-950 leading-relaxed flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold uppercase tracking-wider text-[11px] text-amber-900 mb-0.5">
            {language === "bn" ? "রপ্তানি বাণিজ্য আইনি ও কারিগরি সতর্কতা:" : "Official Export Trade Notice:"}
          </div>
          <p>
            {language === "bn"
              ? "প্রকৃত আন্তর্জাতিক বাণিজ্যের ক্ষেত্রে উদ্ভিদ সঙ্গনিরোধ সনদ (Phytosanitary Certificate - DAE), কীটনাশক অবশিষ্টাংশ পরীক্ষা (MRL Lab Testing), ব্যাংক লেটার অব ক্রেডিট (LC) বা কনফার্মড এসক্রো, এবং কাস্টমস ক্লিয়ারেন্স প্রযোজ্য। প্ল্যাটফর্মটি রপ্তানিকারক ও আমদানিকারকের সংযোগ ঘটায় কিন্তু সরাসরি কাস্টমস নিষ্পত্তিকারক নয়।"
              : "Cross-border agricultural trade requires destination quarantine compliance, lab-tested MRL limits, official Phytosanitary inspection, and formal Letter of Credit (LC) banking facilities. KrishiSetu AI facilitates transparency and buyer discovery."}
          </p>
        </div>
      </div>

      {/* Exporter Submit Quote Modal */}
      {selectedRfq && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-earth-200">
            <h3 className="text-base font-bold text-earth-900 mb-1">
              {language === "bn" ? "আন্তর্জাতিক এক্সপোর্টার কোটেশন দাখিল" : "Submit Formal Exporter Quotation"}
            </h3>
            <p className="text-xs text-earth-500 mb-4">
              RFQ: {selectedRfq.cropNameEn} ({selectedRfq.targetQuantityTonnes} Tonnes to {selectedRfq.country})
            </p>

            <form onSubmit={handleQuoteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-earth-700 font-semibold mb-1">
                  {language === "bn" ? "প্রস্তাবিত এফওবি মূল্য (FOB Price in USD/kg):" : "Proposed FOB Price (USD/kg):"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={fobPrice}
                  onChange={(e) => setFobPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl font-bold text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-earth-700 font-semibold mb-1">
                  {language === "bn" ? "সরবরাহ প্রস্তুতকরণ সময় (Lead Time Days):" : "Lead Time (Days to Port Dispatch):"}
                </label>
                <input
                  type="number"
                  value={leadTime}
                  onChange={(e) => setLeadTime(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-earth-700 font-semibold mb-1">
                  {language === "bn" ? "প্যাকেজিং ও তাপমাত্রা নিয়ন্ত্রণ বিবরণ:" : "Packaging & Cold-Chain Spec:"}
                </label>
                <input
                  type="text"
                  value={packaging}
                  onChange={(e) => setPackaging(e.target.value)}
                  className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-earth-700 font-semibold mb-1">
                  {language === "bn" ? "লজিস্টিকস ও টেস্ট নোট:" : "Traceability & Inspection Notes:"}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Sourced from certified Bogura GAP farmer clusters with lot traceability."
                  className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRfq(null)}
                  className="px-4 py-2 border border-earth-300 text-earth-700 rounded-xl font-semibold"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-agri-700 hover:bg-agri-800 text-white rounded-xl font-bold shadow-sm"
                >
                  {submitting ? t.common.loading : (language === "bn" ? "কোটেশন পাঠান" : "Submit Quote")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Importer Create RFQ Modal */}
      {showRfqModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-earth-200">
            <h3 className="text-base font-bold text-earth-900 mb-1">
              {language === "bn" ? "নতুন আন্তর্জাতিক আরএফকিউ প্রকাশ করুন" : "Post International Procurement RFQ"}
            </h3>
            <p className="text-xs text-earth-500 mb-4">
              {language === "bn" ? "বাংলাদেশি এক্সপোর্টার ও এগ্রিগেটরদের কাছে আপনার ক্রয়চাহিদা প্রেরণ করুন" : "Connect directly with verified Bangladeshi exporters and farm aggregators"}
            </p>

            <form onSubmit={handleCreateRfq} className="space-y-3 text-xs">
              <div>
                <label className="block text-earth-700 font-semibold mb-1">Crop / Commodity:</label>
                <input
                  type="text"
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-earth-700 font-semibold mb-1">Country:</label>
                  <input
                    type="text"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-earth-700 font-semibold mb-1">Volume (Tonnes):</label>
                  <input
                    type="number"
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-earth-700 font-semibold mb-1">Destination Port:</label>
                <input
                  type="text"
                  value={newPort}
                  onChange={(e) => setNewPort(e.target.value)}
                  className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-earth-700 font-semibold mb-1">Target FOB Price (USD/kg):</label>
                <input
                  type="number"
                  step="0.01"
                  value={newTargetFob}
                  onChange={(e) => setNewTargetFob(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRfqModal(false)}
                  className="px-4 py-2 border border-earth-300 text-earth-700 rounded-xl font-semibold"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-agri-700 hover:bg-agri-800 text-white rounded-xl font-bold shadow-sm"
                >
                  {submitting ? t.common.loading : "Publish RFQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

