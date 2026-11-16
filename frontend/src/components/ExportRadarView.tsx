import React, { useState } from 'react';
import type { ExportRfq } from '../@types';
import { useAuth } from '../hooks/useAuth';
import { exportApi } from '../api/export.api';
import { formatDate } from '../utils/formatters';
import {
  Globe,
  Plane,
  Ship,
  FileCheck,
  Building,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Send,
  ShieldCheck
} from 'lucide-react';

interface ExportRadarViewProps {
  rfqs: ExportRfq[];
  onRefresh?: () => void;
}

export const ExportRadarView: React.FC<ExportRadarViewProps> = ({ rfqs, onRefresh }) => {
  const { currentUser, language } = useAuth();
  const [selectedRfq, setSelectedRfq] = useState<ExportRfq | null>(null);
  const [quotePriceUsd, setQuotePriceUsd] = useState<number>(0.45);
  const [incoterm, setIncoterm] = useState<string>('FOB Chattogram');
  const [packagingDetails, setPackagingDetails] = useState<string>('10kg Corrugated Ventilated Boxes');
  const [certifications, setCertifications] = useState<string>('Phytosanitary, GlobalGAP');
  const [validDays, setValidDays] = useState<number>(14);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isExporter = currentUser?.role === 'EXPORTER' || currentUser?.role === 'ADMIN';

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfq) return;

    try {
      setSubmitting(true);
      setMsg(null);
      await exportApi.submitQuotation(selectedRfq.id, {
        exporterId: currentUser?.id || 'user_exporter_1',
        offeredPricePerUnitUsd: quotePriceUsd,
        incoterm,
        packagingDetails,
        certificationsOffered: certifications.split(',').map((s) => s.trim()),
        validUntil: new Date(Date.now() + validDays * 86400000).toISOString()
      });
      setMsg({
        type: 'success',
        text: language === 'bn' ? 'আন্তর্জাতিক কোটেশন সফলভাবে জমা হয়েছে!' : 'Export quotation submitted successfully to international buyer!'
      });
      setSelectedRfq(null);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setMsg({
        type: 'error',
        text: err?.message || 'Quotation submission failed'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-blue-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider">
            <Globe className="w-4 h-4 text-blue-400" />
            <span>{language === 'bn' ? 'গ্লোবাল এগ্রি-ট্রেড পোর্টাল' : 'Global Agri-Trade Radar'}</span>
          </div>
          <h2 className="text-xl font-black mt-1">
            {language === 'bn' ? 'আন্তর্জাতিক ক্রেতা চাহিদা ও রপ্তানি সুযোগ' : 'International RFQs & Export Opportunities'}
          </h2>
          <p className="text-xs text-blue-200 mt-1 max-w-xl">
            {language === 'bn'
              ? 'মধ্যপ্রাচ্য, যুক্তরাজ্য ও ইউরোপীয় আমদানিকারকদের সাথে বাংলাদেশি প্রত্যয়িত রপ্তানিকারকদের সংযোগ।'
              : 'Direct connection between verified Bangladeshi aggregators and importers in UAE, Saudi Arabia, UK & EU.'}
          </p>
        </div>

        <div className="bg-blue-800/60 p-3 rounded-xl border border-blue-700 text-xs space-y-1">
          <div className="flex items-center gap-2 text-blue-200">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>Phytosanitary & DAE Compliance</span>
          </div>
          <div className="flex items-center gap-2 text-blue-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Letter of Credit (LC) / ESCROW</span>
          </div>
        </div>
      </div>

      {/* Compliance Warning */}
      <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>{language === 'bn' ? 'বাণিজ্যিক সতর্কতা:' : 'Trade Compliance Notice:'}</strong>{' '}
          {language === 'bn'
            ? 'আন্তর্জাতিক বাণিজ্যে কৃষি সম্প্রসারণ অধিদপ্তরের (DAE) ফাইটোস্যানিটারি সার্টিফিকেট, প্যাকিং মান ও কাস্টমস ছাড়পত্র বাধ্যতামূলক।'
            : 'Cross-border agricultural trade requires Department of Agricultural Extension (DAE) clearance, phyto-quarantine certification, and customs documentation.'}
        </div>
      </div>

      {/* Notification Message */}
      {msg && (
        <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
          msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* RFQ Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rfqs.map((rfq) => {
          const isFOB = rfq.incoterms?.includes('FOB') || true;

          return (
            <div
              key={rfq.id}
              className="bg-white rounded-2xl border border-earth-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="p-4 bg-earth-50/80 border-b border-earth-100 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {rfq.destinationCountry || 'UAE'}
                    </span>
                    <h3 className="text-base font-bold text-earth-900 mt-1">
                      {rfq.crop?.name || 'Fresh Produce'} (Grade {rfq.qualityGrade || 'A'})
                    </h3>
                    <div className="text-xs text-earth-500 flex items-center gap-1 mt-0.5">
                      <Building className="w-3 h-3 text-earth-400" />
                      <span>{rfq.buyer?.businessProfile?.companyName || rfq.buyer?.name || 'Gulf Importer'}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-earth-400 font-semibold uppercase">Target FOB</div>
                    <div className="text-base font-black text-indigo-700 font-mono">
                      ${rfq.targetPriceUsdPerUnit || 0.45}/kg
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 bg-earth-50 p-2.5 rounded-xl border border-earth-100">
                    <div>
                      <span className="text-earth-500 text-[10px]">Required Volume</span>
                      <div className="font-bold text-earth-800 font-mono">
                        {(rfq.quantityRequiredKg / 1000).toFixed(0)} Metric Tons
                      </div>
                    </div>
                    <div>
                      <span className="text-earth-500 text-[10px]">Port of Entry</span>
                      <div className="font-bold text-earth-800 truncate">
                        {rfq.destinationPort || 'Jebel Ali, Dubai'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-earth-500 text-[10px] block mb-1">Packaging Standards:</span>
                    <div className="text-earth-700 bg-earth-50 p-2 rounded-lg font-mono text-[11px] border border-earth-200">
                      {rfq.packagingRequirements || '10kg corrugated export cartons, pre-cooled'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-earth-500">
                    <span>Deadline:</span>
                    <strong className="text-earth-700 font-mono">{formatDate(rfq.deliveryDeadline, language)}</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                {isExporter ? (
                  <button
                    onClick={() => {
                      setSelectedRfq(rfq);
                      setQuotePriceUsd(rfq.targetPriceUsdPerUnit || 0.45);
                    }}
                    className="w-full py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'রপ্তানি কোটেশন পাঠান' : 'Submit Export Quotation'}</span>
                  </button>
                ) : (
                  <div className="text-center text-[11px] text-earth-400 py-2 border-t border-earth-100">
                    {language === 'bn' ? 'কেবল প্রত্যয়িত রপ্তানিকারকরা কোটেশন দিতে পারবেন' : 'Verified Exporters & Aggregators Only'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quote Submission Modal */}
      {selectedRfq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-earth-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-earth-900 mb-1">
              {language === 'bn' ? 'আন্তর্জাতিক রপ্তানি কোটেশন ফরম' : 'Commercial Export Quotation Submission'}
            </h3>
            <p className="text-xs text-earth-500 mb-4">
              RFQ: {selectedRfq.crop?.name} to {selectedRfq.destinationCountry} ({selectedRfq.destinationPort})
            </p>

            <form onSubmit={handleSubmitQuote} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-earth-700 mb-1">
                    Offered Rate (USD / kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={quotePriceUsd}
                    onChange={(e) => setQuotePriceUsd(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-earth-700 mb-1">
                    Incoterm
                  </label>
                  <select
                    value={incoterm}
                    onChange={(e) => setIncoterm(e.target.value)}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="FOB Chattogram">FOB Chattogram (Sea)</option>
                    <option value="FOB Dhaka Airport">FOB Dhaka Airport (Air)</option>
                    <option value="CIF Jebel Ali">CIF Jebel Ali Dubai</option>
                    <option value="CFR Jeddah">CFR Jeddah Saudi Arabia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-earth-700 mb-1">
                  Packaging & Palletization
                </label>
                <input
                  type="text"
                  value={packagingDetails}
                  onChange={(e) => setPackagingDetails(e.target.value)}
                  className="w-full px-3 py-2 border border-earth-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-earth-700 mb-1">
                  Offered Certifications (comma separated)
                </label>
                <input
                  type="text"
                  value={certifications}
                  onChange={(e) => setCertifications(e.target.value)}
                  className="w-full px-3 py-2 border border-earth-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-earth-700 mb-1">
                  Quotation Validity (Days)
                </label>
                <input
                  type="number"
                  value={validDays}
                  onChange={(e) => setValidDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-earth-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedRfq(null)}
                  className="px-4 py-2 border border-earth-300 text-earth-700 font-bold rounded-xl hover:bg-earth-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl transition shadow-xs"
                >
                  {submitting ? 'Submitting...' : 'Confirm Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

