"use client";

import React, { useState, useEffect } from "react";
import { Auction, Bid } from "@/types";
import { useApp } from "@/context/AppContext";
import { 
  Gavel, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Building2,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  Camera,
  Video as VideoIcon,
  Radio
} from "lucide-react";

interface LiveAuctionCardProps {
  auction: Auction;
  onRefresh?: () => void;
}

export default function LiveAuctionCard({ auction, onRefresh }: LiveAuctionCardProps) {
  const { currentUser, language, t } = useApp();
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number; isExpired: boolean }>({
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });
  const [showBidHistory, setShowBidHistory] = useState(false);
  const [acceptingOffer, setAcceptingOffer] = useState(false);

  const isFarmerOwner = currentUser?.id === auction.farmerId;
  const minRequiredBid = auction.currentHighestBid > 0 
    ? auction.currentHighestBid + auction.minIncrement 
    : auction.startingPrice;

  // Fetch bid history for this auction
  const fetchBids = async () => {
    try {
      const res = await fetch(`/api/v1/auctions/${auction.id}/bids`);
      if (res.ok) {
        const data = await res.json();
        setBids(data.bids || []);
      }
    } catch (e) {
      console.error("Error fetching bids:", e);
    }
  };

  useEffect(() => {
    fetchBids();
    setBidAmount(minRequiredBid);
  }, [auction.id, auction.currentHighestBid, minRequiredBid]);

  // Live countdown timer calculation
  useEffect(() => {
    const calculateTime = () => {
      const diff = new Date(auction.endTime).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0, isExpired: true });
      } else {
        const totalSec = Math.floor(diff / 1000);
        const mins = Math.floor(totalSec / 60);
        const secs = totalSec % 60;
        setTimeLeft({ minutes: mins, seconds: secs, isExpired: false });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [auction.endTime]);

  // Handle Bid Placement
  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (isFarmerOwner) {
      setFeedback({ type: "error", message: language === "bn" ? "বিক্রেতা হিসেবে নিজের নিলামে বিড করা যাবে না।" : "Sellers are prohibited from bidding on their own listings." });
      return;
    }

    if (bidAmount < minRequiredBid) {
      setFeedback({ 
        type: "error", 
        message: language === "bn" 
          ? `ন্যূনতম দর হতে হবে ৳${minRequiredBid}/কেজি (বর্তমান দর ৳${auction.currentHighestBid || auction.startingPrice} + বৃদ্ধি ৳${auction.minIncrement})` 
          : `Minimum bid is BDT ${minRequiredBid}/kg` 
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/auctions/${auction.id}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: bidAmount,
          isAnonymous,
          bidderId: currentUser?.id,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: data.message });
        fetchBids();
        if (onRefresh) onRefresh();
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to submit bid." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Network error submitting bid" });
    } finally {
      setSubmitting(false);
    }
  };

  // Farmer Accepts Offer
  const handleAcceptOffer = async () => {
    if (!confirm(language === "bn" ? "আপনি কি নিশ্চিতভাবে এই সর্বোচ্চ দর গ্রহণ করে অর্ডার জেনারেট করতে চান?" : "Are you sure you want to accept this highest bid and finalize the order?")) {
      return;
    }

    setAcceptingOffer(true);
    try {
      const res = await fetch(`/api/v1/auctions/${auction.id}/accept-offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: data.message });
        if (onRefresh) onRefresh();
      } else {
        setFeedback({ type: "error", message: data.error || "Could not accept offer." });
      }
    } catch (e: any) {
      setFeedback({ type: "error", message: e.message });
    } finally {
      setAcceptingOffer(false);
    }
  };

  const isAuctionLive = auction.status === "live" && !timeLeft.isExpired;

  return (
    <div className="bg-white rounded-2xl border border-earth-200 overflow-hidden shadow-sm hover:shadow-md transition">
      {/* Top Header / Live Badge */}
      <div className="bg-gradient-to-r from-agri-900 to-agri-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAuctionLive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-200 border border-red-400/30">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              {t.common.liveBadge}
            </span>
          ) : auction.status === "accepted" ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/20 text-green-200 border border-green-400/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              {language === "bn" ? "বিক্রি সম্পন্ন" : "Sold & Completed"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-earth-500/20 text-earth-200">
              {language === "bn" ? "নিলাম সমাপ্ত" : "Closed"}
            </span>
          )}

          <span className="text-xs text-agri-200 font-medium">
            {auction.district} • {auction.farmerName}
          </span>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-1.5 text-harvest-300 font-mono text-sm font-semibold bg-agri-950/60 px-3 py-1 rounded-lg border border-agri-700">
          <Clock className="w-3.5 h-3.5 text-harvest-400" />
          {isAuctionLive ? (
            <span>
              {String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
            </span>
          ) : (
            <span className="text-earth-400 text-xs">{language === "bn" ? "সময় শেষ" : "Ended"}</span>
          )}
        </div>
      </div>

      <div className="p-5">
        {/* Media Showcase: Live Stream / Video / Uploaded Photo */}
        {auction.isLiveStream ? (
          <div className="mb-4 rounded-xl overflow-hidden border border-red-500 bg-black aspect-video max-h-48 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/70 flex flex-col justify-between p-3 z-10 pointer-events-none">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white flex items-center gap-1 shadow animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  🔴 {language === "bn" ? "কৃষক সরাসরি লাইভে" : "Farmer Live Broadcast"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                  <Radio className="w-3 h-3 text-red-400 animate-pulse" />
                  <span>{language === "bn" ? "ফিল্ড স্ট্রিমিং" : "Field Stream"}</span>
                </span>
              </div>
              <div className="text-[11px] text-white/90 font-medium truncate">
                🌾 {auction.farmerName} • {auction.district}
              </div>
            </div>
            <img
              src={auction.images?.[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"}
              alt="Live stream preview"
              className="w-full h-full object-cover filter brightness-90 animate-pulse duration-1000"
            />
          </div>
        ) : auction.videoUrl ? (
          <div className="mb-4 rounded-xl overflow-hidden border border-earth-300 bg-black aspect-video max-h-48 relative">
            <video src={auction.videoUrl} controls className="w-full h-full object-cover" />
          </div>
        ) : auction.images && auction.images.length > 0 ? (
          <div className="mb-4 rounded-xl overflow-hidden border border-earth-200 bg-earth-100 aspect-video max-h-40 relative group">
            <img
              src={auction.images[0]}
              alt={auction.cropNameEn}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs flex items-center gap-1">
              <Camera className="w-3 h-3 text-harvest-400" />
              <span>{language === "bn" ? "কৃষকের আপলোডকৃত ছবি" : "Verified Photo"}</span>
            </span>
          </div>
        ) : null}

        {/* Title & Specs */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-earth-900 leading-snug">
              {language === "bn" ? auction.cropNameBn : auction.cropNameEn}
            </h3>
            <p className="text-xs text-earth-500 mt-0.5">
              {language === "bn" ? "মান ও গ্রেড:" : "Grade:"} <span className="font-medium text-agri-700">{auction.grade}</span>
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded-lg bg-agri-50 border border-agri-200 text-agri-800 text-xs font-bold">
              {auction.quantity.toLocaleString()} {auction.unit}
            </span>
          </div>
        </div>

        {/* Pricing Matrix */}
        <div className="grid grid-cols-2 gap-3 p-3.5 bg-earth-50 rounded-xl border border-earth-200/80 mb-4">
          <div>
            <div className="text-[11px] text-earth-500 font-medium">
              {t.auction.startingPrice}
            </div>
            <div className="text-base font-bold text-earth-800 mt-0.5">
              ৳{auction.startingPrice} <span className="text-xs font-normal text-earth-500">/{auction.unit}</span>
            </div>
            <div className="text-[10px] text-earth-500">
              +{auction.minIncrement} {t.auction.minIncrement}
            </div>
          </div>

          <div className="border-l border-earth-200 pl-3">
            <div className="text-[11px] text-agri-800 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-agri-600" />
              {t.auction.currentBid}
            </div>
            <div className="text-xl font-extrabold text-agri-700 mt-0.5">
              {auction.currentHighestBid > 0 ? (
                <>
                  ৳{auction.currentHighestBid} <span className="text-xs font-normal text-earth-500">/{auction.unit}</span>
                </>
              ) : (
                <span className="text-sm font-semibold text-earth-400">
                  {language === "bn" ? "কোনো বিড আসেনি" : "No Bids Yet"}
                </span>
              )}
            </div>
            {auction.currentHighestBidderName && (
              <div className="text-[10px] text-earth-600 truncate mt-0.5">
                {language === "bn" ? "শীর্ষ:" : "Leader:"} <span className="font-semibold text-agri-900">{auction.currentHighestBidderName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Anti-Snipe Extension Badge & Reserve Notice */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-earth-500 gap-2 mb-4 bg-amber-50/70 p-2 rounded-lg border border-amber-200/50">
          <span className="flex items-center gap-1 text-harvest-800 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-harvest-600" />
            {t.auction.antiSnipeNotice}
          </span>
          <span className="font-semibold text-earth-600">
            {auction.totalBids} {t.auction.bidsCount}
          </span>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-lg text-xs mb-4 flex items-start gap-2 ${
              feedback.type === "success"
                ? "bg-agri-50 text-agri-800 border border-agri-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-agri-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Bidding Action Section */}
        {isAuctionLive ? (
          <form onSubmit={handlePlaceBid} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-earth-400">৳</span>
                <input
                  type="number"
                  min={minRequiredBid}
                  step={auction.minIncrement}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  disabled={submitting || isFarmerOwner}
                  className="w-full pl-7 pr-3 py-2 border border-earth-300 rounded-xl text-sm font-bold text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500 disabled:bg-earth-100"
                  placeholder={String(minRequiredBid)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting || isFarmerOwner}
                className="px-4 py-2 bg-agri-700 hover:bg-agri-800 disabled:bg-earth-300 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Gavel className="w-3.5 h-3.5" />
                <span>{submitting ? t.common.loading : t.auction.placeBid}</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-earth-500">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-agri-600 focus:ring-agri-500 w-3.5 h-3.5"
                />
                <span>{language === "bn" ? "নাম গোপন রেখে বিড করুন" : "Bid Anonymously"}</span>
              </label>

              <span className="text-[11px] text-earth-400">
                {language === "bn" ? `মোট কমিটমেন্ট: ৳${(bidAmount * auction.quantity).toLocaleString()}` : `Total Commitment: BDT ${(bidAmount * auction.quantity).toLocaleString()}`}
              </span>
            </div>
          </form>
        ) : null}

        {/* Farmer Acceptance Button */}
        {isFarmerOwner && auction.currentHighestBid > 0 && auction.status !== "accepted" && (
          <div className="mt-4 pt-3 border-t border-earth-200">
            <button
              onClick={handleAcceptOffer}
              disabled={acceptingOffer}
              className="w-full py-2.5 px-4 bg-harvest-600 hover:bg-harvest-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {language === "bn"
                  ? `৳${auction.currentHighestBid}/কেজি অফার গ্রহণ করুন ও অর্ডার নিশ্চিত করুন`
                  : `Accept Offer of BDT ${auction.currentHighestBid}/kg & Generate Order`}
              </span>
            </button>
            {auction.reservePrice && (
              <p className="text-[11px] text-center text-earth-500 mt-1.5">
                {language === "bn" ? `আপনার নির্ধারিত রিজার্ভ মূল্য: ৳${auction.reservePrice}/কেজি` : `Your private reserve: BDT ${auction.reservePrice}/kg`}
              </p>
            )}
          </div>
        )}

        {/* Toggle Bid History */}
        <div className="mt-4 pt-3 border-t border-earth-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setShowBidHistory(!showBidHistory)}
            className="text-agri-800 hover:text-agri-900 font-semibold flex items-center gap-1"
          >
            <span>{t.auction.history} ({bids.length})</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showBidHistory ? "rotate-90" : ""}`} />
          </button>

          <span className="text-[11px] text-earth-400">
            {language === "bn" ? "সার্ভার টাইম ভ্যালিডেটেড" : "Server Time Validated"}
          </span>
        </div>

        {/* Bid History Drawer */}
        {showBidHistory && (
          <div className="mt-3 bg-earth-50 rounded-xl p-3 border border-earth-200 space-y-2 max-h-48 overflow-y-auto">
            {bids.length === 0 ? (
              <p className="text-xs text-earth-500 text-center py-2">
                {language === "bn" ? "এখনও কোনো বিড পড়েনি।" : "No bids recorded yet."}
              </p>
            ) : (
              bids.map((b, idx) => (
                <div
                  key={b.id}
                  className={`flex items-center justify-between text-xs py-1.5 px-2 rounded-lg ${
                    idx === 0 ? "bg-agri-100/70 font-semibold text-agri-950" : "text-earth-700 hover:bg-earth-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-4 text-earth-400">#{bids.length - idx}</span>
                    <span>{b.bidderName}</span>
                    {idx === 0 && (
                      <span className="text-[10px] bg-agri-600 text-white px-1.5 py-0.2 rounded font-bold">
                        LEADER
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-agri-800">৳{b.amount}/kg</span>
                    <span className="text-[10px] text-earth-400 font-mono">
                      {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

