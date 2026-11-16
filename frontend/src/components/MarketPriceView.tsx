import React, { useState } from 'react';
import type { MarketPrice, Crop } from '../@types';
import { useAuth } from '../hooks/useAuth';
import { formatBDT, formatDate } from '../utils/formatters';
import { t } from '../utils/i18n';
import {
  TrendingUp,
  TrendingDown,
  Building,
  Filter,
  BarChart3,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface MarketPriceViewProps {
  prices: MarketPrice[];
  crops: Crop[];
  districts: any[];
  trends: any[];
  selectedCropId?: string;
  selectedDistrictId?: string;
  onSelectCrop: (cropId: string) => void;
  onSelectDistrict: (districtId: string) => void;
}

export const MarketPriceView: React.FC<MarketPriceViewProps> = ({
  prices,
  crops,
  districts,
  trends,
  selectedCropId,
  selectedDistrictId,
  onSelectCrop,
  onSelectDistrict
}) => {
  const { language } = useAuth();
  const [activeView, setActiveView] = useState<'cards' | 'chart'>('cards');

  // Chart data formatting
  const chartData = trends.map((item) => ({
    date: item.date ? item.date.slice(5) : 'Day',
    wholesale: item.avgWholesalePrice,
    retail: item.avgRetailPrice
  }));

  return (
    <div className="space-y-6">
      {/* Control Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-earth-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-earth-700">
            <Filter className="w-4 h-4 text-agri-600" />
            <span>{language === 'bn' ? 'ফিল্টার:' : 'Filter:'}</span>
          </div>

          {/* Crop Selector */}
          <select
            value={selectedCropId || ''}
            onChange={(e) => onSelectCrop(e.target.value)}
            className="px-3 py-1.5 bg-earth-50 border border-earth-300 rounded-xl text-xs font-semibold text-earth-800 focus:outline-none focus:ring-2 focus:ring-agri-500"
          >
            <option value="">{language === 'bn' ? 'সকল শস্য (Crops)' : 'All Crops'}</option>
            {crops.map((c) => (
              <option key={c.id} value={c.id}>
                {language === 'bn' ? c.nameBn : c.name} ({c.category})
              </option>
            ))}
          </select>

          {/* District Selector */}
          <select
            value={selectedDistrictId || ''}
            onChange={(e) => onSelectDistrict(e.target.value)}
            className="px-3 py-1.5 bg-earth-50 border border-earth-300 rounded-xl text-xs font-semibold text-earth-800 focus:outline-none focus:ring-2 focus:ring-agri-500"
          >
            <option value="">{language === 'bn' ? 'সকল জেলা (Districts)' : 'All 64 Districts'}</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {language === 'bn' ? d.nameBn : d.name} ({d.division})
              </option>
            ))}
          </select>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-earth-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveView('cards')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
              activeView === 'cards' ? 'bg-white text-earth-900 shadow-xs' : 'text-earth-600 hover:text-earth-900'
            }`}
          >
            {language === 'bn' ? 'বাজার দর কার্ড' : 'Price Cards'}
          </button>
          <button
            onClick={() => setActiveView('chart')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1 ${
              activeView === 'chart' ? 'bg-white text-earth-900 shadow-xs' : 'text-earth-600 hover:text-earth-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-agri-600" />
            <span>{language === 'bn' ? '৭ দিনের ট্রেন্ড গ্রাফ' : '7-Day Trend Chart'}</span>
          </button>
        </div>
      </div>

      {/* Chart View */}
      {activeView === 'chart' && (
        <div className="bg-white p-6 rounded-2xl border border-earth-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-earth-900">
                {language === 'bn' ? 'পাইকারি বনাম খুচরা মূল্যের ঐতিহাসিক গতিপ্রকৃতি' : 'Wholesale vs Retail Price Trend (7 Days)'}
              </h3>
              <p className="text-xs text-earth-500">
                {language === 'bn'
                  ? 'বাংলাদেশ কৃষি বিপণন অধিদপ্তর (DAM) দৈনিক যাচাইকৃত মূল্যের গড়'
                  : 'Daily verified average prices synced with Department of Agricultural Marketing (DAM)'}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-agri-700">
                <span className="w-3 h-3 rounded-full bg-agri-600" />
                {language === 'bn' ? 'পাইকারি দর' : 'Wholesale'}
              </span>
              <span className="flex items-center gap-1.5 text-amber-600">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                {language === 'bn' ? 'খুচরা দর' : 'Retail'}
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} unit=" ৳" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any) => [`৳${val}/kg`, '']}
                  />
                  <Line type="monotone" dataKey="wholesale" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} name="Wholesale" />
                  <Line type="monotone" dataKey="retail" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} name="Retail" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-earth-400">
                {language === 'bn' ? 'ট্রেন্ড দেখার জন্য নির্দিষ্ট শস্য নির্বাচন করুন' : 'Select a crop above to view 7-day trend chart'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid of Market Price Cards */}
      {activeView === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prices.map((p) => {
            const spread = p.retailPrice - p.wholesalePrice;
            const spreadPct = Math.round((spread / p.wholesalePrice) * 100);

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-earth-200 p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-agri-100 text-agri-800">
                      {p.crop?.nameBn || p.crop?.name || 'শস্য'}
                    </span>
                    <span className="text-[10px] text-earth-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {p.priceDate ? p.priceDate.slice(0, 10) : 'Today'}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-earth-900">
                    {language === 'bn' ? p.crop?.nameBn || p.crop?.name : p.crop?.name}
                  </h4>

                  <div className="text-xs text-earth-500 mb-3 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-earth-400" />
                    <span>{p.marketName || 'মোকাম'}, {p.district?.nameBn || p.district?.name}</span>
                  </div>

                  {/* Wholesale vs Retail Box */}
                  <div className="grid grid-cols-2 gap-2 bg-earth-50 p-2.5 rounded-xl border border-earth-100 mb-3">
                    <div>
                      <div className="text-[10px] font-medium text-earth-500">
                        {language === 'bn' ? 'পাইকারি দর' : 'Wholesale'}
                      </div>
                      <div className="text-sm font-black text-agri-700 font-mono">
                        {formatBDT(p.wholesalePrice, language)}/{t('kg', language)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-medium text-earth-500">
                        {language === 'bn' ? 'খুচরা দর' : 'Retail'}
                      </div>
                      <div className="text-sm font-black text-amber-700 font-mono">
                        {formatBDT(p.retailPrice, language)}/{t('kg', language)}
                      </div>
                    </div>
                  </div>

                  {/* Spread / Middleman Gap Indicator */}
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="text-earth-600">
                      {language === 'bn' ? 'হাতবদল ব্যবধান (Spread):' : 'Intermediary Spread:'}
                    </span>
                    <span className="font-bold text-earth-800 font-mono">
                      +৳{spread.toFixed(1)} ({spreadPct}%)
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-earth-100 flex items-center justify-between text-[11px] text-earth-500">
                  <span className="font-medium text-agri-700">
                    {p.source || 'DAM Verified'}
                  </span>
                  <button
                    onClick={() => onSelectCrop(p.cropId)}
                    className="font-bold text-agri-800 hover:text-agri-950 flex items-center gap-0.5"
                  >
                    <span>{language === 'bn' ? 'ট্রেন্ড দেখুন' : 'View Trend'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

