import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePrices } from '../hooks/usePrices';
import { MarketPriceView } from '../components/MarketPriceView';
import { NetReturnCalculator } from '../components/NetReturnCalculator';
import {
  TrendingUp,
  AlertTriangle,
  Building,
  ShieldCheck,
  Calculator,
  Flame,
  ArrowRight
} from 'lucide-react';

export const MarketIntelligence: React.FC = () => {
  const { language } = useAuth();
  const [selectedCropId, setSelectedCropId] = useState<string>('crop_potato');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const { prices, crops, districts, trends, loading } = usePrices(selectedCropId, selectedDistrictId);

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-earth-900 text-white p-6 rounded-2xl shadow-md border border-emerald-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>National Agricultural Market Intelligence</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-1">
            {language === 'bn' ? 'জাতীয় বাজার দর ও এআই নেট-রিটার্ন বুদ্ধিমত্তা' : 'National DAM Prices & AI Net-Return Engine'}
          </h2>
          <p className="text-xs text-emerald-200 mt-1 max-w-xl">
            {language === 'bn'
              ? 'কৃষি বিপণন অধিদপ্তর (DAM) দৈনিক পাইকারি ও খুচরা মূল্যের লাইভ ডাটা এবং পরিবহন খরচ বাদ দিয়ে সর্বোচ্চ লাভ নির্ধারণী এআই ক্যালকুলেটর।'
              : 'Direct integration with Department of Agricultural Marketing (DAM) 64-district verified rates with Haversine freight cost analysis.'}
          </p>
        </div>

        <div className="bg-emerald-800/60 p-3 rounded-xl border border-emerald-700 text-xs space-y-1">
          <div className="text-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>DAM Government Verified</span>
          </div>
          <div className="text-emerald-300 text-[11px]">Updated Daily 06:00 AM</div>
        </div>
      </div>

      {/* Oversupply / Glut Early Warning Alert */}
      <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="font-bold text-amber-900">
            {language === 'bn' ? '⚠️ অতিরিক্ত সরবরাহ পূর্বাভাস সতর্কতা (Oversupply Alert)' : '⚠️ Regional Oversupply Early Warning'}
          </div>
          <p className="text-amber-800 leading-relaxed">
            {language === 'bn'
              ? 'রংপুর ও নীলফামারী মোকামে বাঁধাকপি ও টমেটোর সরবরাহ স্বাভাবিকের চেয়ে ৪০% বেশি। স্থানীয় পাইকারি দর প্রতি কেজি ৳১৪-এ নেমে এসেছে। এআই পরামর্শ: ঢাকাগামী ট্রাকে যৌথ লজিস্টিকসে পণ্য পাঠালে নেট আয় প্রতি কেজিতে ৳৪ বেশি হওয়ার সম্ভাবনা রয়েছে।'
              : 'Rangpur regional wholesale arrivals for cabbage are 40% above 30-day moving average. Prices dropping to ৳14/kg. AI recommendation: Consolidate freight to Dhaka/Chittagong to salvage +৳4/kg net margin.'}
          </p>
        </div>
      </div>

      {/* AI Net-Return Engine */}
      <NetReturnCalculator />

      {/* DAM Daily Market Prices & Chart */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-earth-900">
            {language === 'bn' ? 'দৈনিক বাজারদর বিশ্লেষণ ও চার্ট' : 'Daily Market Prices & Trend Visualizer'}
          </h3>
          <span className="text-xs text-earth-500 font-medium">
            {prices.length} {language === 'bn' ? 'টি মোকামের তথ্য' : 'market records'}
          </span>
        </div>

        <MarketPriceView
          prices={prices}
          crops={crops}
          districts={districts}
          trends={trends}
          selectedCropId={selectedCropId}
          selectedDistrictId={selectedDistrictId}
          onSelectCrop={(cId) => setSelectedCropId(cId)}
          onSelectDistrict={(dId) => setSelectedDistrictId(dId)}
        />
      </div>
    </div>
  );
};

