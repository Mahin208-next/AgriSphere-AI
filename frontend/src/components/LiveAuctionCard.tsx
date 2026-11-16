import React, { useState, useEffect } from 'react';
import type { Auction } from '../@types';
import { useAuth } from '../hooks/useAuth';
import { formatBDT, formatKg, formatTimeRemaining } from '../utils/formatters';
import { t } from '../utils/i18n';
import {
  Gavel,
  Clock,
  ShieldCheck,
  TrendingUp,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';

interface LiveAuctionCardProps {
  auction: Auction;
  onBid: (auctionId: string, amount: number) => Promise<any>;
  onAccept: (auctionId: string, bidId: string) => Promise<any>;
}

export const LiveAuctionCard: React.FC<LiveAuctionCardProps> = ({ auction, onBid, onAccept }) => {
  const { currentUser, language } = useAuth();
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });
  const [bidAmount, setBidAmount] = useState<number>(() => {
    const minInc = auction.minBidIncrement || 1;
    return (auction.currentHighestBid || auction.startingPricePerUnit) + minInc;
  });
  const [submitting, setSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Countdown timer effect
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const end = new Date(auction.endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [auction.endTime]);

  // Update default bid whenever highest bid changes
  useEffect(() => {
    const minInc = auction.minBidIncrement || 1;
    const base = auction.currentHighestBid || auction.startingPricePerUnit;
    setBidAmount(base + minInc);
  }, [auction.currentHighestBid, auction.startingPricePerUnit, auction.minBidIncrement]);

  const isOwner = currentUser?.id === auction.sellerId || (auction as any).listing?.farmerId === currentUser?.id;
  const isEligibleBidder = currentUser?.role && ['BUYER', 'FACTORY', 'RETAILER', 'EXPORTER'].includes(currentUser.role);
  const highestBid = auction.currentHighestBid || auction.startingPricePerUnit;
  const minRequiredBid = highestBid + (auction.minBidIncrement || 1);

  const handlePlaceBid = async (amount: number) => {
    if (amount < minRequiredBid) {
      setFeedback({
        type: 'error',
        text: language === 'bn'
          ? `ন্যূনতম বিড হতে হবে ৳${minRequiredBid}`
          : `Minimum bid must be ৳${minRequiredBid}`
      });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);
      await onBid(auction.id, amount);
      setFeedback({
        type: 'success',
        text: language === 'bn' ? 'বিড সফলভাবে জমা হয়েছে!' : 'Bid placed successfully!'
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.message || 'Bid submission failed'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    try {
      setSubmitting(true);
      await onAccept(auction.id, bidId);
      setFeedback({
        type: 'success',
        text: language === 'bn' ? 'অফার গ্রহণ করা হয়েছে ও অর্ডার তৈরি হয়েছে!' : 'Offer accepted & Order generated!'
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.message || 'Failed to accept bid'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isReserveMet = (auction as any).reserveMet || (auction.reservePricePerUnit && (auction.currentHighestBid || 0) >= auction.reservePricePerUnit);

  return (
    <div className="bg-white rounded-2xl border border-earth-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between">
      {/* Header Banner */}
      <div>
        <div className="p-4 sm:p-5 border-b border-earth-100 bg-gradient-to-r from-earth-50 to-agri-50/40">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-agri-100 text-agri-800 border border-agri-200">
                  {auction.crop?.nameBn || auction.crop?.name || 'শস্য'}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-earth-100 text-earth-700">
                  {auction.qualityGrade || 'Grade A'}
                </span>
                {auction.antiSnipeExtensions && auction.antiSnipeExtensions > 0 ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-600" />
                    +{auction.antiSnipeExtensions * 3}m Ext
                  </span>
                ) : null}
              </div>

              <h3 className="text-lg font-bold text-earth-900 mt-1">
                {language === 'bn' ? auction.crop?.nameBn || auction.crop?.name : auction.crop?.name}
              </h3>

              <div className="flex items-center gap-2 text-xs text-earth-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-earth-400" />
                <span>
                  {auction.district?.nameBn || auction.district?.name || 'বাংলাদেশ'}, {auction.upazila || ''}
                </span>
                <span>•</span>
                <span className="font-semibold text-earth-700">
                  {formatKg(auction.quantityKg, language)}
                </span>
              </div>
            </div>

            {/* Live Countdown Clock */}
            <div className={`px-3 py-1.5 rounded-xl border text-center ${
              timeLeft.isExpired
                ? 'bg-earth-100 border-earth-300 text-earth-600'
                : timeLeft.hours === 0 && timeLeft.minutes < 5
                ? 'bg-red-50 border-red-300 text-red-700 animate-pulse'
                : 'bg-white border-agri-300 text-agri-800 shadow-xs'
            }`}>
              <div className="text-[10px] font-semibold uppercase flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                {timeLeft.isExpired ? (language === 'bn' ? 'সমাপ্ত' : 'CLOSED') : (language === 'bn' ? 'বাকি সময়' : 'REMAINING')}
              </div>
              <div className="font-mono font-black text-sm tracking-tight mt-0.5">
                {timeLeft.isExpired
                  ? '00:00:00'
                  : `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Bidding Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Price Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 bg-earth-50/70 p-3 rounded-xl border border-earth-100">
            <div>
              <div className="text-[11px] text-earth-500 font-medium">
                {language === 'bn' ? 'শুরুর দর' : 'Starting Price'}
              </div>
              <div className="text-sm font-bold text-earth-700 font-mono">
                {formatBDT(auction.startingPricePerUnit, language)}/{t('kg', language)}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-earth-500 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-agri-600" />
                {language === 'bn' ? 'বর্তমান সর্বোচ্চ বিড' : 'Highest Bid'}
              </div>
              <div className="text-lg font-black text-agri-700 font-mono">
                {formatBDT(highestBid, language)}/{t('kg', language)}
              </div>
            </div>
          </div>

          {/* Reserve Price & Anti-snipe indicators */}
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-agri-600" />
              <span className="text-earth-600">
                {language === 'bn' ? 'রিজার্ভ দর:' : 'Reserve:'}
              </span>
              <span className={`font-semibold ${isReserveMet ? 'text-emerald-700' : 'text-amber-700'}`}>
                {isReserveMet
                  ? (language === 'bn' ? 'অতিক্রম করেছে ✓' : 'Reserve Met ✓')
                  : (language === 'bn' ? 'এখনও পৌঁছায়নি' : 'Reserve Pending')}
              </span>
            </div>

            <span className="text-earth-500 text-[11px]">
              {language === 'bn' ? `মোট বিড: ${auction.totalBids || auction.bids?.length || 0} টি` : `${auction.totalBids || auction.bids?.length || 0} bids`}
            </span>
          </div>

          {/* Feedback message */}
          {feedback && (
            <div className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
              feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Bidder action panel (Buyers, Factories, Retailers) */}
          {!timeLeft.isExpired && isEligibleBidder && !isOwner && (
            <div className="pt-2 border-t border-earth-100 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-earth-700">
                  {language === 'bn' ? 'দ্রুত বিড যোগ করুন:' : 'Quick Bid:'}
                </span>
                {[1, 2, 5].map((inc) => (
                  <button
                    key={inc}
                    onClick={() => handlePlaceBid(highestBid + inc)}
                    disabled={submitting}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-agri-50 text-agri-800 border border-agri-300 hover:bg-agri-100 transition"
                  >
                    +৳{inc}
                  </button>
                ))}
              </div>

              {/* Custom Bid Input */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-earth-400">৳</span>
                  <input
                    type="number"
                    min={minRequiredBid}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 bg-white border border-earth-300 rounded-xl text-xs font-bold text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500 font-mono"
                    placeholder={`Min ৳${minRequiredBid}`}
                  />
                </div>
                <button
                  onClick={() => handlePlaceBid(bidAmount)}
                  disabled={submitting || bidAmount < minRequiredBid}
                  className="px-4 py-2 bg-agri-700 hover:bg-agri-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                >
                  <Gavel className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'বিড দিন' : 'Place Bid'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Owner Acceptance Controls (Farmer) */}
          {isOwner && (
            <div className="pt-2 border-t border-earth-100 bg-amber-50/60 p-3 rounded-xl border border-amber-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                  <Award className="w-4 h-4 text-amber-600" />
                  {language === 'bn' ? 'কৃষক নিয়ন্ত্রণ প্যানেল (আপনার নিলাম)' : 'Seller Controls (Your Auction)'}
                </span>
                <span className="text-[10px] text-amber-700 font-mono">
                  {language === 'bn' ? 'রিজার্ভ:' : 'Reserve:'} ৳{auction.reservePricePerUnit || 'N/A'}
                </span>
              </div>

              {auction.bids && auction.bids.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-[11px] text-earth-600">
                    {language === 'bn'
                      ? 'সর্বোচ্চ অফারটি গ্রহণ করে সরাসরি সেলস অর্ডার তৈরি করতে পারেন:'
                      : 'Accept top bid to immediately finalize sales order:'}
                  </p>
                  <button
                    onClick={() => handleAcceptBid(auction.bids![0].id)}
                    disabled={submitting || auction.status === 'ACCEPTED'}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {auction.status === 'ACCEPTED'
                        ? (language === 'bn' ? 'বিক্রয় সম্পন্ন হয়েছে ✓' : 'Sale Finalized ✓')
                        : (language === 'bn' ? `৳${highestBid}/কেজি অফার গ্রহণ করুন` : `Accept ৳${highestBid}/kg Bid`)}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="text-[11px] text-amber-800">
                  {language === 'bn' ? 'এখনও কোনো বিড আসেনি। ক্রেতারা বিড দিলে এখানে তালিকাভুক্ত হবে।' : 'No bids yet. Live bids will show here for acceptance.'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Details & Bid History Drawer Toggle */}
      <div className="px-4 py-3 bg-earth-50 border-t border-earth-100 flex items-center justify-between text-xs">
        <span className="text-[11px] text-earth-500 font-mono">
          ID: {auction.id.slice(0, 8)}...
        </span>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-agri-700 hover:text-agri-900 font-semibold flex items-center gap-1 transition"
        >
          <span>
            {showHistory
              ? (language === 'bn' ? 'ইতিহাস লুকান' : 'Hide History')
              : (language === 'bn' ? 'বিড ইতিহাস দেখুন' : 'Bid History')}
          </span>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showHistory ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Expandable Bid History List */}
      {showHistory && (
        <div className="border-t border-earth-200 bg-white p-4 max-h-48 overflow-y-auto divide-y divide-earth-100">
          <div className="text-[11px] font-bold text-earth-700 uppercase mb-2">
            {language === 'bn' ? 'অডিট ট্রেল ও বিড টাইমস্ট্যাম্প' : 'Audit Trail & Bid Log'}
          </div>
          {auction.bids && auction.bids.length > 0 ? (
            auction.bids.map((b, idx) => (
              <div key={b.id || idx} className="py-1.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-earth-800">৳{b.amountPerUnit}</span>
                  <span className="text-[10px] text-earth-400 ml-1.5">
                    ({b.bidder?.businessProfile?.companyName || b.bidder?.name || 'Verified Buyer'})
                  </span>
                </div>
                <span className="text-[10px] text-earth-400 font-mono">
                  {new Date(b.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))
          ) : (
            <div className="text-xs text-earth-400 py-2 text-center">
              {language === 'bn' ? 'কোনো বিড ইতিহাস পাওয়া যায়নি' : 'No bids recorded yet'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

