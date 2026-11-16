import React, { useState } from 'react';
import type { ProcurementRequest, SupplierOffer } from '../@types';
import { useAuth } from '../hooks/useAuth';
import { formatBDT, formatKg, formatDate } from '../utils/formatters';
import { t } from '../utils/i18n';
import {
  Building2,
  MapPin,
  Calendar,
  Send,
  CheckCircle2,
  Clock,
  Layers,
  ChevronDown,
  AlertCircle
} from 'lucide-react';

interface ProcurementCardProps {
  request: ProcurementRequest;
  onSubmitOffer: (requestId: string, offer: { quantityKg: number; offeredPricePerUnit: number; deliveryDate?: string; notes?: string }) => Promise<any>;
  onAcceptOffer: (requestId: string, offerId: string) => Promise<any>;
}

export const ProcurementCard: React.FC<ProcurementCardProps> = ({ request, onSubmitOffer, onAcceptOffer }) => {
  const { currentUser, language } = useAuth();
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showOffersList, setShowOffersList] = useState(false);
  const [offerQty, setOfferQty] = useState<number>(Math.min(request.minOfferQuantityKg || 1000, request.targetQuantityKg));
  const [offerPrice, setOfferPrice] = useState<number>(request.maxBudgetPerUnit || 35);
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isOwner = currentUser?.id === request.buyerId;
  const isFarmer = currentUser?.role === 'FARMER';
  const fulfilledQty = request.fulfilledQuantityKg || 0;
  const targetQty = request.targetQuantityKg || 1;
  const progressPct = Math.min(100, Math.round((fulfilledQty / targetQty) * 100));
  const remainingQty = Math.max(0, targetQty - fulfilledQty);

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setStatusMsg(null);
      await onSubmitOffer(request.id, {
        quantityKg: offerQty,
        offeredPricePerUnit: offerPrice,
        deliveryDate,
        notes
      });
      setStatusMsg({
        type: 'success',
        text: language === 'bn' ? 'সরবরাহ অফার সফলভাবে পাঠানো হয়েছে!' : 'Supply offer submitted successfully!'
      });
      setShowOfferModal(false);
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err?.message || 'Offer submission failed'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (offerId: string) => {
    try {
      setSubmitting(true);
      await onAcceptOffer(request.id, offerId);
      setStatusMsg({
        type: 'success',
        text: language === 'bn' ? 'অফার অনুমোদিত ও প্রকিউরমেন্ট আপডেট হয়েছে!' : 'Offer approved & procurement volume updated!'
      });
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err?.message || 'Failed to accept offer'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-earth-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-earth-100 bg-earth-50/60">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  {request.crop?.nameBn || request.crop?.name || 'শস্য চাহিদা'}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-earth-100 text-earth-700">
                  {request.qualityGrade || 'Standard'}
                </span>
                {request.isSplitAllowed && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {language === 'bn' ? 'স্প্লিট লট সমর্থিত' : 'Split Lots OK'}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-earth-900 mt-1">
                {request.title || `${request.crop?.name || 'Crop'} Bulk Procurement`}
              </h3>

              <div className="flex items-center gap-2 text-xs text-earth-600 mt-1">
                <Building2 className="w-3.5 h-3.5 text-earth-400" />
                <span className="font-semibold text-earth-800">
                  {request.buyer?.businessProfile?.companyName || request.buyer?.name || 'Agro Mill / Buyer'}
                </span>
                <span>•</span>
                <MapPin className="w-3.5 h-3.5 text-earth-400" />
                <span>{request.deliveryLocation || request.district?.name || 'বাংলাদেশ'}</span>
              </div>
            </div>

            {/* Target Budget Tag */}
            <div className="text-right">
              <div className="text-[10px] font-medium text-earth-500 uppercase">
                {language === 'bn' ? 'সর্বোচ্চ বাজেট' : 'Max Budget'}
              </div>
              <div className="text-base font-black text-emerald-700 font-mono">
                {formatBDT(request.maxBudgetPerUnit || 0, language)}/{t('kg', language)}
              </div>
            </div>
          </div>
        </div>

        {/* Requirements Body & Split Fulfillment Bar */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Progress Bar for Split Lots */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-earth-600 font-medium">
                {language === 'bn' ? 'চাহিদা পূরণ অগ্রগতি:' : 'Fulfillment Progress:'}
              </span>
              <span className="font-bold text-earth-900 font-mono">
                {formatKg(fulfilledQty, language)} / {formatKg(targetQty, language)} ({progressPct}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-earth-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  progressPct >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-earth-500 mt-1">
              <span>{language === 'bn' ? `অবশিষ্ট প্রয়োজন: ${formatKg(remainingQty, language)}` : `Remaining: ${formatKg(remainingQty, language)}`}</span>
              <span>{language === 'bn' ? `ন্যূনতম অফার: ${formatKg(request.minOfferQuantityKg || 500, language)}` : `Min offer: ${formatKg(request.minOfferQuantityKg || 500, language)}`}</span>
            </div>
          </div>

          {/* Delivery & Timeline Info */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-earth-50 p-2.5 rounded-xl border border-earth-100">
            <div className="flex items-center gap-1.5 text-earth-600">
              <Calendar className="w-3.5 h-3.5 text-earth-400" />
              <span>
                {language === 'bn' ? 'সরবরাহের শেষ সময়:' : 'Delivery Deadline:'}{' '}
                <strong className="text-earth-800">{formatDate(request.deliveryDeadline, language)}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-earth-600 justify-end">
              <Clock className="w-3.5 h-3.5 text-earth-400" />
              <span>
                {language === 'bn' ? 'মোট অফার:' : 'Total Offers:'}{' '}
                <strong className="text-earth-800">{request.offers?.length || 0} টি</strong>
              </span>
            </div>
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
              statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Farmer Action: Submit Offer */}
          {isFarmer && remainingQty > 0 && (
            <div>
              <button
                onClick={() => setShowOfferModal(true)}
                className="w-full py-2.5 bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {language === 'bn' ? 'কৃষক হিসেবে সরবরাহ অফার দিন' : 'Submit Supply Offer (Reverse Bid)'}
                </span>
              </button>
            </div>
          )}

          {/* Buyer Action: Manage Received Offers */}
          {isOwner && request.offers && request.offers.length > 0 && (
            <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">
                  {language === 'bn' ? 'প্রাপ্ত কৃষক অফারসমূহ' : 'Farmer Supply Offers'} ({request.offers.length})
                </span>
                <button
                  onClick={() => setShowOffersList(!showOffersList)}
                  className="text-xs text-blue-700 font-semibold hover:underline flex items-center gap-0.5"
                >
                  {showOffersList ? (language === 'bn' ? 'লুকান' : 'Hide') : (language === 'bn' ? 'দেখুন' : 'View')}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showOffersList ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showOffersList && (
                <div className="space-y-2 pt-1 max-h-48 overflow-y-auto">
                  {request.offers.map((offer: SupplierOffer) => (
                    <div
                      key={offer.id}
                      className="p-2.5 bg-white rounded-lg border border-blue-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-earth-800">
                          {offer.farmer?.name || 'Farmer'} • {formatKg(offer.quantityKg, language)} @ ৳{offer.offeredPricePerUnit}/kg
                        </div>
                        <div className="text-[10px] text-earth-500">
                          {offer.farmer?.district || 'Bangladesh'} • Delivery: {offer.deliveryDate ? formatDate(offer.deliveryDate, language) : 'ASAP'}
                        </div>
                      </div>

                      {offer.status === 'ACCEPTED' ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Accepted ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAccept(offer.id)}
                          disabled={submitting}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-xs transition"
                        >
                          Accept Lot
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-earth-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-earth-900 mb-1">
              {language === 'bn' ? 'সরবরাহ প্রস্তাব দিন (রিভার্স অফার)' : 'Submit Supply Quotation'}
            </h3>
            <p className="text-xs text-earth-500 mb-4">
              {language === 'bn'
                ? `আপনি ${request.crop?.nameBn || request.crop?.name}-এর আংশিক বা পূর্ণ চাহিদার জন্য অফার দিতে পারেন।`
                : `Provide quantity and rate for ${request.crop?.name || 'Crop'} fulfillment.`}
            </p>

            <form onSubmit={handleSubmitOffer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-earth-700 mb-1">
                  {language === 'bn' ? 'সরবরাহ পরিমাণ (কেজি)' : 'Offer Quantity (kg)'}
                </label>
                <input
                  type="number"
                  min={request.minOfferQuantityKg || 100}
                  max={remainingQty}
                  value={offerQty}
                  onChange={(e) => setOfferQty(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-earth-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-agri-500 focus:outline-none"
                />
                <span className="text-[10px] text-earth-400">
                  {language === 'bn' ? `সর্বোচ্চ অনুমোদনযোগ্য: ${remainingQty} কেজি` : `Max allowed: ${remainingQty} kg`}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-700 mb-1">
                  {language === 'bn' ? 'দর প্রতি কেজি (টাকা)' : 'Price Per Kg (BDT)'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-earth-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-agri-500 focus:outline-none"
                />
                <span className="text-[10px] text-earth-400">
                  {language === 'bn' ? `বায়ারের বাজেট: ৳${request.maxBudgetPerUnit}/কেজি` : `Buyer budget: ৳${request.maxBudgetPerUnit}/kg`}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-700 mb-1">
                  {language === 'bn' ? 'সম্ভাব্য সরবরাহের তারিখ' : 'Estimated Delivery Date'}
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-earth-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-agri-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-700 mb-1">
                  {language === 'bn' ? 'মন্তব্য বা প্যাকিং বিশদ' : 'Notes / Packaging specifications'}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 50kg jute bags, harvested fresh yesterday..."
                  className="w-full px-3 py-2 border border-earth-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-agri-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 border border-earth-300 text-earth-700 text-xs font-bold rounded-xl hover:bg-earth-50 transition"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  {submitting ? 'Submitting...' : language === 'bn' ? 'প্রস্তাব জমা দিন' : 'Send Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

