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
  ArrowRight,
  Scale,
  Layers,
  Sprout,
  DollarSign
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
  const [isCustomCrop, setIsCustomCrop] = useState(false);
  const [customCropNameBn, setCustomCropNameBn] = useState("");
  const [customCropNameEn, setCustomCropNameEn] = useState("");
  const [customCropImage, setCustomCropImage] = useState("");
  const [postVariety, setPostVariety] = useState("বিন্দু জাতের বাছাইকৃত কাঁচা মরিচ");
  const [postQuantity, setPostQuantity] = useState<string>("1000");
  const [postUnit, setPostUnit] = useState<"kg" | "mon" | "tonne">("kg");
  const [postGrade, setPostGrade] = useState<"Grade A" | "Grade B" | "Standard">("Grade A");
  const [postPrice, setPostPrice] = useState<string>("140");
  const [postDistrict, setPostDistrict] = useState(currentUser?.district || "Bogura");
  const [postUpazila, setPostUpazila] = useState(currentUser?.upazila || "Sadar");
  const [postPhone, setPostPhone] = useState(currentUser?.phone || "+880 1711-234567");
  const [postNotes, setPostNotes] = useState("");
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [postSuccess, setPostSuccess] = useState<string | null>(null);

  // Buy Now Modal State
  const [buyingItem, setBuyingItem] = useState<ProductListing | null>(null);
  const [buyQuantity, setBuyQuantity] = useState<string>("100");
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

    const qtyNumber = Number(postQuantity) || 1;
    const priceNumber = Number(postPrice) || 1;

    let finalCropNameBn = "";
    let finalCropNameEn = "";
    let finalImage = "";

    if (isCustomCrop || postCropId === "custom") {
      finalCropNameBn = customCropNameBn.trim() || "কৃষকের নিজস্ব ফসল";
      finalCropNameEn = customCropNameEn.trim() || "Farmer Custom Harvest";
      finalImage = customCropImage.trim() || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80";
    } else {
      const cropObj = CROPS_DATA.find((c) => c.id === postCropId) || CROPS_DATA[0];
      finalCropNameBn = cropObj.nameBn;
      finalCropNameEn = cropObj.nameEn;
      finalImage = cropObj.image;
    }

    try {
      const res = await fetch("/api/v1/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropId: isCustomCrop ? "custom" : postCropId,
          customCropNameBn: finalCropNameBn,
          customCropNameEn: finalCropNameEn,
          variety: postVariety,
          quantity: qtyNumber,
          unit: postUnit,
          grade: postGrade,
          expectedPrice: priceNumber,
          startingPrice: priceNumber,
          district: postDistrict,
          upazila: postUpazila,
          description: postNotes,
          isAuction: false, // Pure Direct Sale
          images: [finalImage],
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
    setBuyQuantity(String(Math.min(100, item.quantity)));
    setOrderSuccess(null);
    setOrderError(null);
  };

  const handleConfirmPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyingItem) return;

    setBuySubmitting(true);
    setOrderError(null);

    const qty = Number(buyQuantity) || 1;

    try {
      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: buyingItem.id,
          quantity: qty,
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

      {/* MODAL 1: POST CROP FOR DIRECT SALE (ORGANIZED & CUSTOM CROP SUPPORT) */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl border border-earth-200 max-h-[94vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowPostModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-earth-400 hover:text-earth-700 hover:bg-earth-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-3.5 mb-6 pr-8 border-b border-earth-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                <ShoppingBag className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                  {language === "bn" ? "কৃষি বাজার সরাসরি বিক্রয়" : "Direct Sale Portal"}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-earth-900 mt-1">
                  {language === "bn" ? "সরাসরি বিক্রির জন্য ফসল পোস্ট করুন" : "Post Harvest for Direct Purchase"}
                </h2>
                <p className="text-xs text-earth-500 mt-0.5">
                  {language === "bn"
                    ? "কোনো নিলাম নয়; নিজের নির্ধারিত পাইকারি মূল্যে সারা দেশের পাইকারি ক্রেতা ও মিল মালিকদের কাছে সরাসরি বিক্রি করুন।"
                    : "Sell at your own fixed price directly to wholesalers, factories, and retailers nationwide."}
                </p>
              </div>
            </div>

            {postSuccess && (
              <div className="mb-4 p-4 rounded-2xl bg-green-50 border border-green-200 flex items-center gap-3 text-green-900 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <span>{postSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePostCrop} className="space-y-5 text-xs">
              {/* SECTION 1: CROP & VARIETY (CUSTOM CROP ALLOWED) */}
              <div className="bg-earth-50/70 p-4 rounded-2xl border border-earth-200/80 space-y-3.5">
                <div className="flex items-center gap-2 text-earth-800 font-bold text-xs uppercase tracking-wide">
                  <Sprout className="w-4 h-4 text-emerald-700" />
                  <span>{language === "bn" ? "১. ফসলের নাম ও জাত নির্বাচন" : "1. Crop Commodity & Variety"}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-earth-700 font-bold mb-1.5 h-5 flex items-center text-xs">
                      {language === "bn" ? "ফসলের ধরন / তালিকা:" : "Crop Commodity:"}
                    </label>
                    <select
                      value={postCropId}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "custom") {
                          setIsCustomCrop(true);
                          setPostCropId("custom");
                          setPostVariety("");
                        } else {
                          setIsCustomCrop(false);
                          setPostCropId(val);
                          const c = CROPS_DATA.find((item) => item.id === val);
                          if (c) setPostVariety(`${c.nameBn} - বাছাইকৃত গ্রেড`);
                        }
                      }}
                      className="w-full h-11 px-3 bg-white border border-earth-300 rounded-xl font-bold text-earth-900 shadow-2xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    >
                      <optgroup label={language === "bn" ? "জনপ্রিয় ফসল ও ফলসমূহ" : "Popular Produce"}>
                        {CROPS_DATA.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nameBn} ({c.nameEn})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label={language === "bn" ? "কাস্টম ফসল" : "Custom Produce"}>
                        <option value="custom" className="text-emerald-700 font-bold">
                          {language === "bn" ? "➕ অন্য ফসল বা ফল (নিজের মতো লিখুন)" : "➕ Add Custom Crop / Fruit"}
                        </option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="text-earth-700 font-bold mb-1.5 h-5 flex items-center text-xs">
                      {language === "bn" ? "জাত / ভ্যারাইটি বিবরণ:" : "Variety / Spec:"}
                    </label>
                    <input
                      type="text"
                      value={postVariety}
                      onChange={(e) => setPostVariety(e.target.value)}
                      placeholder={language === "bn" ? "যেমন: বিন্দু, হিমসাগর, হাইব্রিড, ইত্যাদি" : "e.g., Himsagar, Hybrid"}
                      className="w-full h-11 px-3 bg-white border border-earth-300 rounded-xl font-medium text-earth-900 shadow-2xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* DYNAMIC CUSTOM CROP INPUT BOX */}
                {(isCustomCrop || postCropId === "custom") && (
                  <div className="p-3.5 bg-amber-50/70 border border-amber-300 rounded-xl space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{language === "bn" ? "নতুন ফসলের বিবরণ (কৃষকের নিজস্ব ফসল):" : "Custom Crop Details:"}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-earth-700 font-semibold mb-1 text-xs">
                          {language === "bn" ? "ফসলের বাংলা নাম লিখুন *" : "Crop Name (Bangla) *"}
                        </label>
                        <input
                          type="text"
                          required
                          value={customCropNameBn}
                          onChange={(e) => setCustomCropNameBn(e.target.value)}
                          placeholder="যেমন: লিচু, আম, ড্রাগন ফল, পেয়ারা, তরমুজ..."
                          className="w-full h-11 px-3 bg-white border border-amber-300 rounded-xl text-earth-900 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-earth-700 font-semibold mb-1 text-xs">
                          {language === "bn" ? "ইংরেজি নাম (ঐচ্ছিক):" : "Crop Name (English):"}
                        </label>
                        <input
                          type="text"
                          value={customCropNameEn}
                          onChange={(e) => setCustomCropNameEn(e.target.value)}
                          placeholder="e.g. Litchi, Dragon Fruit"
                          className="w-full h-11 px-3 bg-white border border-earth-300 rounded-xl text-earth-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: QUANTITY, WEIGHT & PRICE SETTING (UNIFORM ALIGNED BOXES & LIVE TOTAL) */}
              <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-200/80 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs uppercase tracking-wide">
                    <Scale className="w-4 h-4 text-emerald-700" />
                    <span>{language === "bn" ? "২. বিক্রয়যোগ্য পরিমাণ, ওজন ও মূল্য নির্ধারণ" : "2. Quantity, Weight & Pricing"}</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    {language === "bn" ? "সংখ্যা টাইপ বা এডিট করুন" : "Freely editable numbers"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-start">
                  {/* 1. Quantity input */}
                  <div className="flex flex-col">
                    <label className="text-earth-700 font-bold mb-1.5 h-6 flex items-center text-xs whitespace-nowrap">
                      {language === "bn" ? "বিক্রয়যোগ্য পরিমাণ:" : "Total Quantity:"}
                    </label>
                    <input
                      type="number"
                      step="any"
                      min={1}
                      required
                      value={postQuantity}
                      onChange={(e) => setPostQuantity(e.target.value)}
                      placeholder="1000"
                      className="w-full h-11 px-3 bg-white border border-earth-300 rounded-xl font-bold text-sm text-earth-900 shadow-2xs focus:ring-2 focus:ring-emerald-600 focus:outline-none transition"
                    />
                    {/* Quick increment pills */}
                    <div className="flex items-center gap-1.5 mt-2 h-5">
                      {[100, 500, 1000].map((delta) => (
                        <button
                          key={delta}
                          type="button"
                          onClick={() => setPostQuantity(String((Number(postQuantity) || 0) + delta))}
                          className="px-2 py-0.5 rounded bg-earth-100 hover:bg-earth-200 text-earth-700 text-[10px] font-bold transition"
                        >
                          +{delta}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Unit Selector */}
                  <div className="flex flex-col">
                    <label className="text-earth-700 font-bold mb-1.5 h-6 flex items-center text-xs whitespace-nowrap">
                      {language === "bn" ? "পরিমাপের একক:" : "Unit of Measure:"}
                    </label>
                    <select
                      value={postUnit}
                      onChange={(e) => setPostUnit(e.target.value as any)}
                      className="w-full h-11 px-3 bg-white border border-earth-300 rounded-xl font-bold text-sm text-earth-900 shadow-2xs focus:ring-2 focus:ring-emerald-600 focus:outline-none transition cursor-pointer"
                    >
                      <option value="kg">কেজি (kg)</option>
                      <option value="mon">মণ (Mon - 40 kg)</option>
                      <option value="tonne">টন (Tonne)</option>
                    </select>
                    <div className="text-[10px] text-earth-500 mt-2 h-5 flex items-center font-medium">
                      {postUnit === "kg" ? "১ কেজি = ১,০০০ গ্রাম" : postUnit === "mon" ? "১ মণ = ৪০ কেজি" : "১ টন = ১,০০০ কেজি"}
                    </div>
                  </div>

                  {/* 3. Price input */}
                  <div className="flex flex-col">
                    <label className="text-earth-700 font-bold mb-1.5 h-6 flex items-center text-xs whitespace-nowrap">
                      {language === "bn" ? "নির্ধারিত দর (টাকা/একক):" : "Direct Price (BDT):"}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-earth-500 select-none">৳</span>
                      <input
                        type="number"
                        step="any"
                        min={1}
                        required
                        value={postPrice}
                        onChange={(e) => setPostPrice(e.target.value)}
                        placeholder="140"
                        className="w-full h-11 pl-7 pr-3 bg-white border border-earth-300 rounded-xl font-bold text-sm text-earth-900 shadow-2xs focus:ring-2 focus:ring-emerald-600 focus:outline-none transition"
                      />
                    </div>
                    <div className="text-[10px] text-earth-500 mt-2 h-5 flex items-center font-medium">
                      প্রতি {postUnit === "kg" ? "কেজি" : postUnit === "mon" ? "মণ" : "টন"} এর পাইকারি মূল্য
                    </div>
                  </div>
                </div>

                {/* LIVE ESTIMATED LOT TOTAL VALUE */}
                <div className="p-3.5 bg-white rounded-xl border border-emerald-300 shadow-2xs flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-harvest-600" />
                      <span>{language === "bn" ? "মোট প্রাক্কলিত লটের মূল্য (Total Value):" : "Estimated Lot Total:"}</span>
                    </div>
                    <div className="text-[11px] text-earth-500 mt-0.5">
                      {Number(postQuantity) || 0} {postUnit} × ৳{Number(postPrice) || 0}
                    </div>
                  </div>
                  <div className="text-xl font-black text-emerald-900 font-mono">
                    ৳{((Number(postQuantity) || 0) * (Number(postPrice) || 0)).toLocaleString()} <span className="text-xs font-bold text-emerald-700">BDT</span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: GRADE & LOCATION */}
              <div className="bg-earth-50/70 p-4 rounded-2xl border border-earth-200/80 space-y-3.5">
                <div className="flex items-center gap-2 text-earth-800 font-bold text-xs uppercase tracking-wide">
                  <MapPin className="w-4 h-4 text-agri-700" />
                  <span>{language === "bn" ? "৩. মান ও ডেলিভারি অবস্থান" : "3. Quality Grade & Location"}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-earth-700 font-bold mb-1.5 h-5 flex items-center text-xs">
                      {language === "bn" ? "মান ও গ্রেড:" : "Quality Grade:"}
                    </label>
                    <select
                      value={postGrade}
                      onChange={(e) => setPostGrade(e.target.value as any)}
                      className="w-full h-11 px-3 bg-white border border-earth-300 rounded-xl font-bold text-earth-900 shadow-2xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    >
                      <option value="Grade A">Grade A (সুপারশপ/রপ্তানি মান — সেরা গুণমান)</option>
                      <option value="Grade B">Grade B (সাধারণ পাইকারি আড়ত মান)</option>
                      <option value="Standard">Standard (মানসম্মত সাধারণ ফসল)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-earth-700 font-bold mb-1.5 h-5 flex items-center text-xs">
                      {language === "bn" ? "অবস্থান (জেলা):" : "District:"}
                    </label>
                    <select
                      value={postDistrict}
                      onChange={(e) => setPostDistrict(e.target.value)}
                      className="w-full h-11 px-3 bg-white border border-earth-300 rounded-xl font-bold text-earth-900 shadow-2xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    >
                      {BANGLADESH_DISTRICTS.map((d) => (
                        <option key={d.id} value={d.nameEn}>
                          {d.nameEn} ({d.nameBn})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-earth-700 font-bold mb-1.5 h-5 flex items-center text-xs">
                    {language === "bn" ? "উপজেলা / মোকামের ঠিকানা:" : "Upazila / Local Hub:"}
                  </label>
                  <input
                    type="text"
                    value={postUpazila}
                    onChange={(e) => setPostUpazila(e.target.value)}
                    placeholder="যেমন: শেরপুর / মহাস্থান মোকাম"
                    className="w-full h-11 px-3 bg-white border border-earth-300 rounded-xl font-medium text-earth-900 shadow-2xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION 4: HARVEST NOTES */}
              <div className="space-y-1.5">
                <label className="block text-earth-700 font-bold">
                  {language === "bn" ? "৪. ফসল সম্পর্কে বিশেষ বিবরণ বা কৃষকের নোট:" : "4. Special Notes & Guarantees:"}
                </label>
                <textarea
                  rows={2}
                  value={postNotes}
                  onChange={(e) => setPostNotes(e.target.value)}
                  placeholder={
                    language === "bn"
                      ? "যেমন: আজ সকালে তোলা ফ্রেশ ফসল। সরাসরি খামার থেকে ট্রাক লোড করে দেওয়ার ব্যবস্থা আছে।"
                      : "e.g., Freshly harvested this morning. Direct truck loading available from farm."
                  }
                  className="w-full px-3 py-2 bg-white border border-earth-300 rounded-xl text-earth-900 text-xs focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-4 border-t border-earth-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-earth-500 font-medium">
                  {language === "bn" ? "✓ সরাসরি কৃষি বাজারের লাইভ তালিকায় যুক্ত হবে" : "✓ Will instantly appear in live Krishi Bazar"}
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="px-4 py-2.5 border border-earth-300 text-earth-700 rounded-xl font-bold hover:bg-earth-100 transition"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={postSubmitting}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-sm flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{postSubmitting ? t.common.loading : (language === "bn" ? "পোস্ট প্রকাশ করুন" : "Publish Listing")}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DIRECT PURCHASE / ORDER MODAL (EDITABLE NUMBERS) */}
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
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
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
                  <div className="p-3.5 bg-earth-50 rounded-2xl border border-earth-200 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-earth-500">মজুত পরিমাণ</div>
                      <div className="font-bold text-earth-900">{buyingItem.quantity.toLocaleString()} {buyingItem.unit}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-earth-500">নির্ধারিত দর</div>
                      <div className="font-black text-emerald-800">৳{buyingItem.expectedPrice || buyingItem.startingPrice}/{buyingItem.unit}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-earth-500">অবস্থান</div>
                      <div className="font-medium text-earth-700">{buyingItem.district}</div>
                    </div>
                  </div>

                  {/* Quantity input with free typing & presets */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-earth-700 font-bold">
                        {language === "bn" ? `ক্রয়ের পরিমাণ (${buyingItem.unit}) টাইপ করুন:` : `Purchase Quantity (${buyingItem.unit}):`}
                      </label>
                      <span className="text-[10px] text-earth-500">মজুত: {buyingItem.quantity} {buyingItem.unit}</span>
                    </div>
                    <input
                      type="number"
                      step="any"
                      min={1}
                      max={buyingItem.quantity}
                      required
                      value={buyQuantity}
                      onChange={(e) => setBuyQuantity(e.target.value)}
                      placeholder="যেমন: 100"
                      className="w-full px-3.5 py-2.5 bg-emerald-50/50 border border-emerald-300 rounded-xl font-black text-base text-emerald-950 focus:ring-2 focus:ring-emerald-600"
                    />

                    {/* Quick quantity selector pills */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-earth-500 font-semibold">কুইক সিলেক্ট:</span>
                      {[50, 100, 200].filter(q => q <= buyingItem.quantity).map((qty) => (
                        <button
                          key={qty}
                          type="button"
                          onClick={() => setBuyQuantity(String(qty))}
                          className="px-2 py-0.5 rounded bg-earth-100 hover:bg-earth-200 text-earth-700 text-[10px] font-bold"
                        >
                          {qty} {buyingItem.unit}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setBuyQuantity(String(buyingItem.quantity))}
                        className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold"
                      >
                        সবটুকু ({buyingItem.quantity})
                      </button>
                    </div>
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
                            {d.nameEn} ({d.nameBn})
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
                      <p className="text-[10px] text-emerald-700">
                        {Number(buyQuantity) || 0} {buyingItem.unit} × ৳{buyingItem.expectedPrice || buyingItem.startingPrice}
                      </p>
                    </div>
                    <div className="text-xl font-black text-emerald-900 font-mono">
                      ৳{((Number(buyQuantity) || 0) * (buyingItem.expectedPrice || buyingItem.startingPrice)).toLocaleString()} BDT
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setBuyingItem(null)}
                      className="px-4 py-2.5 border border-earth-300 text-earth-700 rounded-xl font-bold hover:bg-earth-100 transition"
                    >
                      {t.common.cancel}
                    </button>
                    <button
                      type="submit"
                      disabled={buySubmitting}
                      className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-sm flex items-center gap-1.5 transition disabled:opacity-50"
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
