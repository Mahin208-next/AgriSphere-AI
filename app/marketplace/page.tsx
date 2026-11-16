"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { ProductListing } from "@/types";
import { CROPS_DATA } from "@/lib/data/crops";
import { BANGLADESH_DISTRICTS } from "@/lib/data/bangladesh-geo";
import { 
  ShoppingBag, 
  MapPin, 
  Calendar, 
  Gavel, 
  Tag, 
  ShieldCheck, 
  Search, 
  ArrowRight,
  Filter
} from "lucide-react";

export default function MarketplacePage() {
  const { language, t } = useApp();
  const [listings, setListings] = useState<ProductListing[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch("/api/v1/listings");
        if (res.ok) {
          const data = await res.json();
          setListings(data.listings || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const filtered = listings.filter((l) => {
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
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-agri-100 text-agri-800 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-black text-earth-900">
            {t.nav.marketplace}
          </h1>
        </div>
        <p className="text-xs text-earth-500 mt-1 max-w-2xl">
          {language === "bn"
            ? "বাংলাদেশি কৃষকদের সরাসরি উৎপাদিত তাজা ফসল তালিকা। সরাসরি ক্রয় করুন অথবা লাইভ নিলামে অংশ নিন।"
            : "Browse verified agricultural product listings straight from smallholders and commercial farming clusters."}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-earth-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
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

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="px-3 py-2 bg-earth-50 border border-earth-200 rounded-xl text-xs font-semibold text-earth-800 focus:outline-none"
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
            className="px-3 py-2 bg-earth-50 border border-earth-200 rounded-xl text-xs font-semibold text-earth-800 focus:outline-none"
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

      {/* Listings Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm text-earth-400">
          {t.common.loading}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-earth-200 p-8 text-earth-500 text-xs">
          {language === "bn" ? "কোনো ফসল পাওয়া যায়নি।" : "No listings match your search criteria."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-earth-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Crop Image */}
                <div className="relative h-44 w-full bg-earth-100 overflow-hidden">
                  <img
                    src={item.images[0] || "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80"}
                    alt={item.cropNameEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {item.isAuction ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white flex items-center gap-1 shadow-sm">
                        <Gavel className="w-3 h-3" />
                        <span>LIVE AUCTION</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-agri-700 text-white shadow-sm">
                        DIRECT SALE
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[11px] font-mono font-bold">
                    {item.quantity.toLocaleString()} {item.unit}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4">
                  <div className="flex items-center justify-between text-xs text-earth-500 mb-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-agri-600" />
                      {item.district}, {item.upazila}
                    </span>
                    <span className="font-semibold text-agri-700">{item.grade}</span>
                  </div>

                  <h3 className="text-base font-bold text-earth-900 leading-snug">
                    {language === "bn" ? item.cropNameBn : item.cropNameEn}
                  </h3>
                  {item.variety && (
                    <p className="text-xs text-earth-500 mt-0.5">
                      {item.variety}
                    </p>
                  )}

                  {/* Price Box */}
                  <div className="my-3 p-2.5 bg-earth-50 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-earth-500 font-medium">
                        {language === "bn" ? "প্রত্যাশিত দর" : "Expected Price"}
                      </div>
                      <div className="text-base font-black text-agri-800">
                        ৳{item.expectedPrice || item.startingPrice} <span className="text-xs font-normal text-earth-500">/{item.unit}</span>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-earth-500">
                      <div>{item.farmerName}</div>
                      <div className="text-agri-700 font-semibold">{item.farmerPhone}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 pt-0">
                {item.isAuction ? (
                  <Link
                    href={`/auctions`}
                    className="w-full py-2 bg-agri-700 hover:bg-agri-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Gavel className="w-3.5 h-3.5" />
                    <span>{language === "bn" ? "লাইভ নিলামে অংশ নিন" : "Participate in Auction"}</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => alert(`Farmer Contact: ${item.farmerPhone}`)}
                    className="w-full py-2 bg-earth-800 hover:bg-earth-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>{language === "bn" ? "চাষির সাথে যোগাযোগ করুন" : "Direct Purchase Inquiry"}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

