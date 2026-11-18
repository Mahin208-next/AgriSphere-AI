"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { ProductListing } from "@/types";
import { CROPS_DATA } from "@/lib/data/crops";
import { BANGLADESH_DISTRICTS } from "@/lib/data/bangladesh-geo";
import { 
  ShoppingBag, 
  MapPin, 
  Calendar, 
  Tag, 
  ShieldCheck, 
  Search, 
  PlusCircle, 
  CheckCircle2, 
  X, 
  Phone, 
  Truck, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { fetchWithCache, invalidateCache } from "@/lib/client-cache";

export default function MarketplacePage() {
  const router = useRouter();
  const { currentUser, language, t } = useApp();
  const [listings, setListings] = useState<ProductListing[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Post Crop Modal State
  const [showPostModal, setShowPostModal] = useState(false);
  const [postCropId, setPostCropId] = useState("green_chilli");
  const [postVariety, setPostVariety] = useState("বিন্দু জাতের বাছাইকৃত কাঁচা মরিচ");
  const [postQuantity, setPostQuantity] = useState(1000);
  const [postUnit, setPostUnit] = useState<"kg" | "mon" | "tonne">("kg");
  const [postGrade, setPostGrade] = useState<"Grade A" | "Grade B" | "Standard">("Grade A");
  const [postPrice, setPostPrice] = useState(140);
  const [postDistrict, setPostDistrict] = useState(currentUser?.district || "Bogura");
  const [postUpazila, setPostUpazila] = useState(currentUser?.upazila || "Sadar");
  const [postPhone, setPostPhone] = useState(currentUser?.phone || "+880 1711-234567");
  const [postNotes, setPostNotes] = useState("");
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [postSuccess, setPostSuccess] = useState<string | null>(null);

  // Buy Now Modal State
  const [buyingItem, setBuyingItem] = useState<ProductListing | null>(null);
  const [buyQuantity, setBuyQuantity] = useState<number>(100);
  const [buyDistrict, setBuyDistrict] = useState<string>(currentUser?.district || "Dhaka");
  const [buyAddress, setBuyAddress] = useState<string>("কারওয়ান বাজার মোকাম / তেজগাঁও ওয়্যারহাউজ");
  const [buySubmitting, setBuySubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  const fetchListings = async (bypassCache = false) => {
    try {
      if (bypassCache) invalidateCache("/api/v1/listings");
      const data = await fetchWithCache<{ listings: ProductListing[] }>("/api/v1/listings?isAuction=false");
      if (data?.listings) {
        setListings(data.listings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleOpenPostModal = () => {
    if (!currentUser) {
      router.push("/login?redirect=/marketplace");
      return;
    }
    setPostSuccess(null);
    setShowPostModal(true);
  };

  const handlePostCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostSubmitting(true);
    setPostSuccess(null);

    const cropObj = CROPS_DATA.find((c) => c.id === postCropId) || CROPS_DATA[0];

    try {
      const res = await fetch("/api/v1/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropId: postCropId,
          variety: postVariety,
          quantity: postQuantity,
          unit: postUnit,
          grade: postGrade,
          expectedPrice: postPrice,
          startingPrice: postPrice,
          district: postDistrict,
          upazila: postUpazila,
          description: postNotes,
          isAuction: false, // Pure Direct Sale
          images: [cropObj.image],
        }),
      });

      if (res.ok) {
        setPostSuccess(
          language === "bn"
            ? "আপনার ফসল সরাসরি বিক্রির জন্য কৃষি বাজারে সফলভাবে পোস্ট হয়েছে!"
            : "Your produce has been successfully listed for direct sale in Krishi Bazar!"
        );
        fetchListings(true);
        setTimeout(() => {
          setShowPostModal(false);
          setPostSuccess(null);
        }, 1500);
      } else {
        const d = await res.json();
        alert(d.error || "Failed to post listing");
      }
    } catch (err: any) {
      alert("Error posting crop: " + err.message);
    } finally {
      setPostSubmitting(false);
    }
  };

  const handleOpenBuyModal = (item: ProductListing) => {
    if (!currentUser) {
      router.push("/login?redirect=/marketplace");
      return;
    }
    setBuyingItem(item);
    setBuyQuantity(Math.min(100, item.quantity));
    setOrderSuccess(null);
    setOrderError(null);
  };

  const handleConfirmPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyingItem) return;

    setBuySubmitting(true);
    setOrderError(null);

    try {
      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: buyingItem.id,
          quantity: buyQuantity,
          deliveryDistrict: buyDistrict,
          notes: buyAddress,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrderSuccess(data.order);
        fetchListings(true);
      } else {
        setOrderError(data.error || "Failed to confirm order.");
      }
    } catch (err: any) {
      setOrderError(err.message || "Failed to confirm purchase.");
    } finally {
      setBuySubmitting(false);
    }
  };

  // Filter listings: STRICTLY Direct Sale Only (no auctions!)
  const filtered = listings.filter((l) => {
    if (l.isAuction) return false; // Absolutely no auction items in Krishi Bazar
    if (l.quantity <= 0) return false;
    if (selectedCrop !== "all" && l.cropId !== selectedCrop) return false;
    if (selectedDistrict !== "all" && l.district.toLowerCase() !== selectedDistrict.toLowerCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = l.cropNameEn.toLowerCase().includes(q) || 
                    l.cropNameBn.toLowerCase().includes(q) ||
                    l.farmerName.toLowerCase().includes(q) ||
                    l.district.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header with Direct Sale Post Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-earth-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-earth-900">
                  {language === "bn" ? "কৃষি বাজার (সরাসরি কেনাবেচা)" : "Krishi Bazar — Direct Marketplace"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  DIRECT SALE ONLY
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-earth-500 mt-1.5 max-w-2xl leading-relaxed">
            {language === "bn"
              ? "নিলাম ছাড়া সরাসরি নির্ধারিত পাইকারি দরে কৃষিপণ্য কেনাবেচা। কৃষক ও বিক্রেতারা সরাসরি ফসল পোস্ট করতে পারেন এবং ক্রেতারা তাৎক্ষণিক অর্ডার দিয়ে কিনতে পারেন।"
              : "Fixed-price agricultural marketplace without bidding. Farmers post harvests for direct purchase and buyers buy instantly with confirmed orders."}
          </p>
        </div>

        <button
          onClick={handleOpenPostModal}
          className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-emerald-700 to-agri-800 hover:from-emerald-800 hover:to-agri-900 text-white font-bold rounded-2xl text-xs transition flex items-center justify-center gap-2 shadow-md shadow-agri-950/20 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-harvest-300" />
          <span>{language === "bn" ? "+ সরাসরি বিক্রির জন্য ফসল পোস্ট করুন" : "+ Post Crop for Direct Sale"}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-earth-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-earth-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === "bn" ? "ফসল বা জেলা দিয়ে খুঁজুন..." : "Search crops or location..."}
            className="w-full pl-9 pr-3 py-2 bg-earth-50 border border-earth-200 rounded-xl text-xs text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500 font-medium"
          />
        </div>

        <div className="flex flex-col min-[420px]:flex-row flex-wrap items-stretch min-[420px]:items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="flex-1 min-[420px]:flex-none px-3 py-2 bg-earth-50 border border-earth-200 rounded-xl text-xs font-semibold text-earth-800 focus:outline-none"
          >
            <option value="all">{t.common.allCrops}</option>
            {CROPS_DATA.map((c) => (
              <option key={c.id} value={c.id}>
                {language === "bn" ? c.nameBn : c.nameEn}
              </option>
            ))}
          </select>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="flex-1 min-[420px]:flex-none px-3 py-2 bg-earth-50 border border-earth-200 rounded-xl text-xs font-semibold text-earth-800 focus:outline-none"
          >
            <option value="all">{t.common.allDistricts}</option>
            {BANGLADESH_DISTRICTS.map((d) => (
              <option key={d.id} value={d.nameEn}>
                {d.nameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Direct Sale Listings Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm text-earth-400">
          {t.common.loading}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-earth-200 p-8 text-earth-500 text-xs">
          {language === "bn" ? "কৃষি বাজারে সরাসরি বিক্রির কোনো ফসল পাওয়া যায়নি।" : "No direct sale listings match your search criteria."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-earth-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                {/* Crop Image */}
                <div className="relative h-48 w-full bg-earth-100 overflow-hidden">
                  <img
                    src={item.images[0] || "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80"}
                    alt={item.cropNameEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Direct Sale Badge */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white flex items-center gap-1 shadow-md">
                      ✓ {language === "bn" ? "সরাসরি বিক্রয়" : "DIRECT SALE"}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-xs text-white text-[11px] font-mono font-bold">
                    {item.quantity.toLocaleString()} {item.unit} {language === "bn" ? "মজুত" : "In Stock"}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-earth-500 mb-1.5">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-agri-600" />
                      {item.district}, {item.upazila}
                    </span>
                    <span className="font-bold text-agri-800 bg-agri-50 px-2 py-0.5 rounded-lg border border-agri-200">
                      {item.grade}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-earth-900 leading-normal">
                    {language === "bn" ? item.cropNameBn : item.cropNameEn}
                  </h3>
                  {item.variety && (
                    <p className="text-xs text-earth-500 mt-0.5 font-medium">
                      {item.variety}
                    </p>
                  )}

                  {/* Direct Fixed Price Box */}
                  <div className="my-3.5 p-3.5 bg-earth-50/80 rounded-2xl border border-earth-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-earth-500">
                        {language === "bn" ? "নির্ধারিত পাইকারি মূল্য" : "Direct Sale Price"}
                      </div>
                      <div className="text-xl font-black text-emerald-800 mt-0.5">
                        ৳{item.expectedPrice || item.startingPrice} <span className="text-xs font-normal text-earth-500">/{item.unit}</span>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-earth-600">
                      <div className="font-bold text-earth-900">{item.farmerName}</div>
                      <div className="text-agri-700 font-semibold">{item.farmerPhone}</div>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-earth-600 italic line-clamp-2 mb-2">
                      &ldquo;{item.description}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons: Direct Purchase / Contact */}
              <div className="p-5 pt-0 space-y-2">
                {!currentUser ? (
                  <Link
                    href="/login?redirect=/marketplace"
                    className="w-full py-2.5 bg-agri-800 hover:bg-agri-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>{language === "bn" ? "সরাসরি কিনতে লগইন করুন" : "Sign In to Buy Directly"}</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenBuyModal(item)}
                      className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{language === "bn" ? "সরাসরি কিনুন" : "Buy Directly"}</span>
                    </button>

                    <a
                      href={`tel:${item.farmerPhone}`}
                      className="px-3 py-2.5 bg-earth-100 hover:bg-earth-200 text-earth-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border border-earth-300"
                      title={language === "bn" ? "চাষিকে কল করুন" : "Call Farmer"}
                    >
                      <Phone className="w-3.5 h-3.5 text-agri-700" />
                      <span className="hidden min-[420px]:inline">{language === "bn" ? "কল" : "Call"}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: POST CROP FOR DIRECT SALE */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-earth-200 max-h-[92vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowPostModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-earth-400 hover:text-earth-700 hover:bg-earth-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3.5 mb-5 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                  {language === "bn" ? "কৃষি বাজার সরাসরি বিক্রয়" : "Krishi Bazar Direct Listing"}
                </span>
                <h2 className="text-xl font-black text-earth-900 mt-1">
                  {language === "bn" ? "সরাসরি বিক্রির জন্য ফসল পোস্ট করুন" : "Post Harvest for Direct Purchase"}
                </h2>
                <p className="text-xs text-earth-500 mt-0.5">
                  {language === "bn"
                    ? "কোনো নিলাম নয়; নির্ধারিত পাইকারি মূল্যে সারা দেশের ক্রেতাদের কাছে বিক্রি করুন।"
                    : "Sell at a fixed price to wholesalers, mills, and supermarkets nationwide."}
                </p>
              </div>
            </div>

            {postSuccess && (
              <div className="mb-4 p-4 rounded-2xl bg-green-50 border border-green-200 flex items-center gap-3 text-green-900 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <span>{postSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePostCrop} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-earth-700 font-bold mb-1">
                    {language === "bn" ? "ফসলের ধরন:" : "Crop Commodity:"}
                  </label>
                  <select
                    value={postCropId}
                    onChange={(e) => {
                      setPostCropId(e.target.value);
                      const c = CROPS_DATA.find((item) => item.id === e.target.value);
                      if (c) setPostVariety(`${c.nameBn} - বাছাইকৃত গ্রেড`);
                    }}
                    className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl font-bold text-earth-900"
                  >
                    {CROPS_DATA.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameEn} ({c.nameBn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-earth-700 font-bold mb-1">
                    {language === "bn" ? "জাত / ভ্যারাইটি বিবরণ:" : "Variety:"}
                  </label>
                  <input
                    type="text"
                    value={postVariety}
                    onChange={(e) => setPostVariety(e.target.value)}
                    className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl font-medium text-earth-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-earth-700 font-bold mb-1">
                    {language === "bn" ? "পরিমাণ:" : "Quantity:"}
                  </label>
                  <input
                    type="number"
                    min={20}
                    value={postQuantity}
                    onChange={(e) => setPostQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl font-bold text-earth-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-earth-700 font-bold mb-1">
                    {language === "bn" ? "একক (Unit):" : "Unit:"}
                  </label>
                  <select
                    value={postUnit}
                    onChange={(e) => setPostUnit(e.target.value as any)}
                    className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl font-bold text-earth-900"
                  >
                    <option value="kg">কেজি (kg)</option>
                    <option value="mon">মণ (Mon - 40 kg)</option>
                    <option value="tonne">টন (Tonne)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-earth-700 font-bold mb-1">
                    {language === "bn" ? "সরাসরি বিক্রয় মূল্য (টাকা/একক):" : "Direct Price (BDT/unit):"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={postPrice}
                    onChange={(e) => setPostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-emerald-50 border border-emerald-400 rounded-xl font-black text-emerald-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-earth-700 font-bold mb-1">
                    {language === "bn" ? "মান ও গ্রেড:" : "Quality Grade:"}
                  </label>
                  <select
                    value={postGrade}
                    onChange={(e) => setPostGrade(e.target.value as any)}
                    className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl font-bold text-earth-900"
                  >
                    <option value="Grade A">Grade A (সুপারশপ/রপ্তানি মান)</option>
                    <option value="Grade B">Grade B (সাধারণ পাইকারি মান)</option>
                    <option value="Standard">Standard (মানসম্মত সাধারণ মান)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-earth-700 font-bold mb-1">
                    {language === "bn" ? "অবস্থান (জেলা):" : "District:"}
                  </label>
                  <select
                    value={postDistrict}
                    onChange={(e) => setPostDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl font-bold text-earth-900"
                  >
                    {BANGLADESH_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.nameEn}>
                        {d.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-earth-700 font-bold mb-1">
                  {language === "bn" ? "ফসল সম্পর্কে বিশেষ বিবরণ:" : "Harvest Notes / Description:"}
                </label>
                <textarea
                  rows={2}
                  value={postNotes}
                  onChange={(e) => setPostNotes(e.target.value)}
                  placeholder="যেমন: আজ সকালে তোলা ফ্রেশ ফসল। সরাসরি ট্রাক লোড করে দেওয়ার ব্যবস্থা আছে।"
                  className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl text-earth-900"
                />
              </div>

              <div className="pt-3 border-t border-earth-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2.5 border border-earth-300 text-earth-700 rounded-xl font-bold"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={postSubmitting}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{postSubmitting ? t.common.loading : (language === "bn" ? "পোস্ট প্রকাশ করুন" : "Publish Listing")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DIRECT PURCHASE / ORDER MODAL */}
      {buyingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-earth-200 max-h-[92vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setBuyingItem(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-earth-400 hover:text-earth-700 hover:bg-earth-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {orderSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-earth-900">
                    {language === "bn" ? "অর্ডার সফলভাবে নিশ্চিত হয়েছে!" : "Order Confirmed Successfully!"}
                  </h3>
                  <p className="text-xs text-earth-600 mt-1">
                    {language === "bn" ? `অর্ডার আইডি: ${orderSuccess.id}` : `Order ID: ${orderSuccess.id}`}
                  </p>
                </div>

                <div className="bg-earth-50 p-4 rounded-2xl border border-earth-200 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-earth-500">পণ্য:</span>
                    <span className="font-bold text-earth-900">{orderSuccess.cropNameBn || orderSuccess.cropNameEn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-earth-500">পরিমাণ:</span>
                    <span className="font-bold text-earth-900">{orderSuccess.quantity} {orderSuccess.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-earth-500">দর:</span>
                    <span className="font-bold text-emerald-800">৳{orderSuccess.pricePerUnit}/{orderSuccess.unit}</span>
                  </div>
                  <div className="flex justify-between border-t border-earth-200 pt-2 text-sm font-black">
                    <span>মোট প্রদেয় মূল্য:</span>
                    <span className="text-emerald-800">৳{orderSuccess.totalAmount.toLocaleString()} BDT</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-earth-600 pt-1">
                    <span>বিক্রেতা কৃষক:</span>
                    <span>{orderSuccess.sellerName} ({orderSuccess.sellerPhone})</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setBuyingItem(null)}
                  className="w-full py-3 bg-agri-800 hover:bg-agri-900 text-white rounded-xl font-bold text-xs shadow-sm transition"
                >
                  {language === "bn" ? "কৃষি বাজারে ফিরে যান" : "Return to Marketplace"}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3.5 mb-5 pr-8">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      DIRECT PURCHASE
                    </span>
                    <h2 className="text-xl font-black text-earth-900 mt-1">
                      {language === "bn" ? "সরাসরি ক্রয়ের অর্ডার দিন" : "Place Direct Purchase Order"}
                    </h2>
                    <p className="text-xs text-earth-500 mt-0.5">
                      {language === "bn" ? buyingItem.cropNameBn : buyingItem.cropNameEn} • {buyingItem.farmerName}
                    </p>
                  </div>
                </div>

                {orderError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-800 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{orderError}</span>
                  </div>
                )}

                <form onSubmit={handleConfirmPurchase} className="space-y-4 text-xs">
                  {/* Item Summary Bar */}
                  <div className="p-3 bg-earth-50 rounded-2xl border border-earth-200 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-earth-500">মজুত পরিমাণ</div>
                      <div className="font-bold text-earth-900">{buyingItem.quantity.toLocaleString()} {buyingItem.unit}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-earth-500">দর</div>
                      <div className="font-black text-emerald-800">৳{buyingItem.expectedPrice || buyingItem.startingPrice}/{buyingItem.unit}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-earth-500">অবস্থান</div>
                      <div className="font-medium text-earth-700">{buyingItem.district}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-earth-700 font-bold mb-1">
                      {language === "bn" ? `ক্রয়ের পরিমাণ (${buyingItem.unit}):` : `Purchase Quantity (${buyingItem.unit}):`}
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={buyingItem.quantity}
                      value={buyQuantity}
                      onChange={(e) => setBuyQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-300 rounded-xl font-black text-base text-emerald-950"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-earth-700 font-bold mb-1">
                        {language === "bn" ? "ডেলিভারি জেলা:" : "Delivery District:"}
                      </label>
                      <select
                        value={buyDistrict}
                        onChange={(e) => setBuyDistrict(e.target.value)}
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
                        {language === "bn" ? "গন্তব্য মোকাম / ঠিকানা:" : "Delivery Address:"}
                      </label>
                      <input
                        type="text"
                        value={buyAddress}
                        onChange={(e) => setBuyAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Order Total Highlight */}
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-emerald-900 font-bold">মোট প্রদেয় মূল্য (Total Bill):</span>
                      <p className="text-[10px] text-emerald-700">কমিশনমুক্ত সরাসরি কৃষক দর</p>
                    </div>
                    <div className="text-xl font-black text-emerald-900 font-mono">
                      ৳{(buyQuantity * (buyingItem.expectedPrice || buyingItem.startingPrice)).toLocaleString()} BDT
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setBuyingItem(null)}
                      className="px-4 py-2.5 border border-earth-300 text-earth-700 rounded-xl font-bold"
                    >
                      {t.common.cancel}
                    </button>
                    <button
                      type="submit"
                      disabled={buySubmitting}
                      className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{buySubmitting ? t.common.loading : (language === "bn" ? "অর্ডার নিশ্চিত করুন" : "Confirm Purchase")}</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
