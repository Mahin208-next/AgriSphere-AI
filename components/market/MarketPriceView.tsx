"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { MarketPriceRecord } from "@/types";
import { CROPS_DATA } from "@/lib/data/crops";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Building2, 
  ShieldCheck, 
  Activity, 
  BarChart3,
  Scale
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from "recharts";

export default function MarketPriceView() {
  const { language, t } = useApp();
  const [selectedCropId, setSelectedCropId] = useState<string>("green_chilli");
  const [trendDays, setTrendDays] = useState<number>(30);
  const [prices, setPrices] = useState<MarketPriceRecord[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch today's prices for selected crop
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch(`/api/v1/prices?cropId=${selectedCropId}&onlyToday=true`);
        if (res.ok) {
          const data = await res.json();
          setPrices(data.prices || []);
        }
      } catch (err) {
        console.error("Error fetching prices:", err);
      }
    };
    fetchPrices();
  }, [selectedCropId]);

  // Fetch trend time-series for Recharts
  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/prices/trends?cropId=${selectedCropId}&days=${trendDays}`);
        if (res.ok) {
          const data = await res.json();
          setTrendData(data.trendData || []);
        }
      } catch (err) {
        console.error("Error fetching trend data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [selectedCropId, trendDays]);

  const selectedCrop = CROPS_DATA.find((c) => c.id === selectedCropId) || CROPS_DATA[0];

  return (
    <div className="space-y-6">
      {/* Crop Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-earth-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-earth-500 uppercase tracking-wider mb-1">
            {t.market.selectCrop}
          </div>
          <div className="flex flex-wrap gap-2">
            {CROPS_DATA.map((c) => {
              const isSelected = c.id === selectedCropId;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCropId(c.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-agri-700 text-white shadow-sm"
                      : "bg-earth-100 text-earth-700 hover:bg-earth-200"
                  }`}
                >
                  <span>{language === "bn" ? c.nameBn : c.nameEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trend timeframe buttons */}
        <div className="flex items-center bg-earth-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setTrendDays(7)}
            className={`px-3 py-1 rounded-lg font-bold transition ${
              trendDays === 7 ? "bg-white text-agri-800 shadow-sm" : "text-earth-600 hover:text-earth-900"
            }`}
          >
            {t.market.trend7d}
          </button>
          <button
            onClick={() => setTrendDays(30)}
            className={`px-3 py-1 rounded-lg font-bold transition ${
              trendDays === 30 ? "bg-white text-agri-800 shadow-sm" : "text-earth-600 hover:text-earth-900"
            }`}
          >
            {t.market.trend30d}
          </button>
        </div>
      </div>

      {/* Today's Market Price Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {prices.map((p) => {
          const spread = p.retailPrice - p.wholesalePrice;
          return (
            <div
              key={p.id}
              className="bg-white p-4 rounded-2xl border border-earth-200 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-agri-800 bg-agri-50 px-2 py-0.5 rounded border border-agri-200">
                  {p.district}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-agri-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {p.priceSource}
                </span>
              </div>

              <h4 className="text-sm font-bold text-earth-900 truncate mb-3">
                {language === "bn" ? p.marketNameBn : p.marketNameEn}
              </h4>

              <div className="grid grid-cols-2 gap-2 p-2.5 bg-earth-50 rounded-xl mb-3">
                <div>
                  <div className="text-[10px] text-earth-500 font-medium">
                    {t.market.wholesalePrice}
                  </div>
                  <div className="text-base font-extrabold text-agri-800">
                    ৳{p.wholesalePrice}
                    <span className="text-[10px] font-normal text-earth-500">/kg</span>
                  </div>
                </div>

                <div className="border-l border-earth-200 pl-2">
                  <div className="text-[10px] text-earth-500 font-medium">
                    {t.market.retailPrice}
                  </div>
                  <div className="text-base font-extrabold text-earth-700">
                    ৳{p.retailPrice}
                    <span className="text-[10px] font-normal text-earth-500">/kg</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-earth-500">
                <span>{language === "bn" ? "খুচরা মার্জিন:" : "Retail Spread:"}</span>
                <span className="font-semibold text-harvest-700">+৳{spread}/kg</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Historical Trend Chart (Recharts) */}
      <div className="bg-white p-6 rounded-2xl border border-earth-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-agri-600" />
              <h3 className="text-base font-bold text-earth-900">
                {language === "bn" ? `${selectedCrop.nameBn} - ঐতিহাসিক মূল্য ওঠানামা` : `${selectedCrop.nameEn} - Historical Price Dynamics`}
              </h3>
            </div>
            <p className="text-xs text-earth-500 mt-0.5">
              {language === "bn"
                ? `গত ${trendDays} দিনের ঢাকা কারওয়ান বাজার বনাম বগুড়া মোকামের পাইকারি ও খুচরা দর বিশ্লেষণ`
                : `Past ${trendDays}-day trend comparison: Dhaka Karwan Bazar vs Bogura Assembly Hub`}
            </p>
          </div>

          <div className="text-[11px] text-earth-400 font-mono">
            Source: DAM Bangladesh Agriculture Index
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-72 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-sm text-earth-400">
              {t.common.loading}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#78716c' }} 
                  tickFormatter={(val) => val.slice(5)} 
                />
                <YAxis 
                  unit="৳" 
                  tick={{ fontSize: 11, fill: '#78716c' }} 
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '12px', 
                    border: '1px solid #e7e5e4',
                    fontSize: '12px' 
                  }}
                  formatter={(val: any) => [`৳${val}/kg`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line 
                  type="monotone" 
                  dataKey="dhakaWholesale" 
                  name={language === "bn" ? "ঢাকা পাইকারি" : "Dhaka Wholesale"} 
                  stroke="#16a34a" 
                  strokeWidth={2.5} 
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="boguraWholesale" 
                  name={language === "bn" ? "বগুড়া পাইকারি" : "Bogura Wholesale"} 
                  stroke="#f59e0b" 
                  strokeWidth={2} 
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="dhakaRetail" 
                  name={language === "bn" ? "ঢাকা খুচরা" : "Dhaka Retail"} 
                  stroke="#0f766e" 
                  strokeDasharray="4 4" 
                  strokeWidth={1.5} 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

