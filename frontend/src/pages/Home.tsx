import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAuctions } from '../hooks/useAuctions';
import { usePrices } from '../hooks/usePrices';
import { LiveAuctionCard } from '../components/LiveAuctionCard';
import { formatBDT } from '../utils/formatters';
import { t } from '../utils/i18n';
import {
  Sprout,
  Gavel,
  ShoppingBag,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Users,
  Globe,
  Flame
} from 'lucide-react';

interface HomeProps {
  onNavigate: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { language, activePersona } = useAuth();
  const { auctions, placeBid, acceptBid } = useAuctions();
  const { prices } = usePrices();

  // Active live auctions preview
  const liveAuctions = auctions.slice(0, 3);
  // DAM price ticker items
  const tickerPrices = prices.slice(0, 6);

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-agri-950 via-agri-900 to-earth-950 text-white overflow-hidden p-6 sm:p-12 shadow-xl border border-agri-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-agri-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-agri-800/80 border border-agri-600/60 text-xs font-semibold text-agri-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>FarmMarket International Hackathon 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {language === 'bn' ? (
              <>
                প্রতিটি কৃষক, <span className="text-transparent bg-clip-text bg-gradient-to-r from-agri-300 via-amber-200 to-emerald-300">প্রতিটি বাজারে।</span>
              </>
            ) : (
              <>
                Connecting Every Farmer to <span className="text-transparent bg-clip-text bg-gradient-to-r from-agri-300 via-amber-200 to-emerald-300">Every Market.</span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-earth-300 leading-relaxed font-normal">
            {language === 'bn'
              ? 'কৃষকের লাইভ নিলাম, পাইকার ও অটো রাইস মিলের স্প্লিট প্রকিউরমেন্ট, ডিএএম (DAM) লাইভ বাজারদর এবং এআই পরিবহন অপ্টিমাইজার—সবই একটি প্ল্যাটফর্মে।'
              : 'Two-way competitive agricultural trading: Real-time farmer auctions with anti-snipe safeguards, buyer reverse procurement with split fulfillment, and AI net-return logistics.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('auctions')}
              className="px-5 py-3 rounded-xl bg-agri-500 hover:bg-agri-600 text-earth-950 font-bold text-xs sm:text-sm shadow-lg hover:shadow-agri-500/20 transition flex items-center gap-2"
            >
              <Gavel className="w-4 h-4" />
              <span>{language === 'bn' ? 'লাইভ নিলাম দেখুন (System A)' : 'Explore Live Auctions'}</span>
            </button>

            <button
              onClick={() => onNavigate('procurement')}
              className="px-5 py-3 rounded-xl bg-earth-800 hover:bg-earth-700 text-white font-bold text-xs sm:text-sm border border-earth-700 transition flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{language === 'bn' ? 'বায়ারদের চাহিদা (System B)' : 'Buyer Procurement'}</span>
            </button>

            <button
              onClick={() => onNavigate('intelligence')}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-agri-200 font-semibold text-xs sm:text-sm transition flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4" />
              <span>{language === 'bn' ? '৬৪ জেলার বাজারদর' : 'DAM Prices'}</span>
            </button>
          </div>
        </div>

        {/* Quick Persona Ribbon */}
        <div className="mt-8 pt-4 border-t border-agri-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-earth-400">
          <div className="flex items-center gap-2">
            <span className="text-agri-300 font-semibold">{language === 'bn' ? 'আপনার বর্তমান ভূমিকা:' : 'Active Persona:'}</span>
            <span className="text-white font-bold">{activePersona.badge}</span>
            <span className="text-earth-400">({activePersona.roleLabel})</span>
          </div>
          <span className="text-agri-400 font-mono text-[11px]">⚡ Real-time SSE Connected</span>
        </div>
      </div>

      {/* Live DAM Market Price Ticker */}
      <div className="bg-white rounded-2xl border border-earth-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-xs font-bold text-earth-800 uppercase tracking-wider">
              {language === 'bn' ? 'ডিএএম (DAM) আজকের দৈনিক পাইকারি ও খুচরা দর' : 'DAM Verified Daily Market Rates'}
            </h3>
          </div>
          <button
            onClick={() => onNavigate('intelligence')}
            className="text-xs text-agri-700 hover:text-agri-900 font-bold flex items-center gap-1"
          >
            <span>{language === 'bn' ? 'সবগুলো দেখুন' : 'View All'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {tickerPrices.map((p) => (
            <div key={p.id} className="p-3 bg-earth-50 rounded-xl border border-earth-100 text-xs">
              <div className="font-bold text-earth-900 truncate">
                {language === 'bn' ? p.crop?.nameBn || p.crop?.name : p.crop?.name}
              </div>
              <div className="text-[10px] text-earth-500 truncate">{p.district?.nameBn || p.district?.name}</div>
              <div className="mt-2 flex items-baseline justify-between font-mono">
                <span className="font-black text-agri-700 text-sm">৳{p.wholesalePrice}</span>
                <span className="text-[10px] text-earth-400">খুচরা ৳{p.retailPrice}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-Way System Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System A Card */}
        <div className="bg-white rounded-2xl border border-agri-200 p-6 shadow-xs hover:border-agri-400 transition space-y-4">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-agri-100 text-agri-800 flex items-center justify-center">
              <Gavel className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-agri-700 text-white tracking-wider">
              System A
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-earth-900">
              {language === 'bn' ? 'কৃষক লাইভ নিলাম (Farmer Live Auction)' : 'Farmer-Initiated Live Auctions'}
            </h3>
            <p className="text-xs text-earth-600 mt-1 leading-relaxed">
              {language === 'bn'
                ? 'কৃষক নিজেই তার ফসল তালিকাভুক্ত করে শুরুর দর নির্ধারণ করেন। যাচাইকৃত পাইকার ও মিল মালিকরা রিয়েল-টাইমে প্রতিযোগিতামূলক বিড জমা দেন। শেষ ৩ মিনিটে নতুন বিড আসলে স্বয়ংক্রিয়ভাবে সময় বৃদ্ধি (Anti-Sniping) পায়।'
                : 'Farmers create product listings with base prices. Verified buyers compete via live bidding. Smart anti-sniping safeguards extend the clock if bids arrive in the final 3 minutes.'}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('auctions')}
              className="text-xs font-bold text-agri-700 hover:text-agri-900 flex items-center gap-1"
            >
              <span>{language === 'bn' ? 'চলমান নিলামগুলোতে অংশ নিন' : 'Browse Live Auctions'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* System B Card */}
        <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-xs hover:border-blue-400 transition space-y-4">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-700 text-white tracking-wider">
              System B
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-earth-900">
              {language === 'bn' ? 'বায়ার প্রকিউরমেন্ট ও রিভার্স অফার' : 'Buyer Procurement & Split Lots'}
            </h3>
            <p className="text-xs text-earth-600 mt-1 leading-relaxed">
              {language === 'bn'
                ? 'প্রাণ, আকিজ বা অটো রাইস মিলের মতো বড় প্রতিষ্ঠানগুলো বিশাল পরিমাণের চাহিদা প্রকাশ করে। ক্ষুদ্র ও মাঝারি কৃষকরা আংশিক লট (Split Fulfillment) অফার দিতে পারেন।'
                : 'Mills and enterprise buyers post high-volume supply requirements. Farmers submit competitive supply offers, fulfilling partial lots until total demand is satisfied.'}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('procurement')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              <span>{language === 'bn' ? 'বায়ারদের চাহিদা পূরণ করুন' : 'View Procurement RFQs'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Featured Live Auctions Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-earth-900">
              {language === 'bn' ? 'চলমান লাইভ অকশনসমূহ' : 'Featured Live Auctions'}
            </h3>
          </div>
          <button
            onClick={() => onNavigate('auctions')}
            className="text-xs text-agri-700 hover:text-agri-900 font-bold flex items-center gap-1"
          >
            <span>{language === 'bn' ? 'সকল নিলাম দেখুন' : 'View All Auctions'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {liveAuctions.map((auc) => (
            <LiveAuctionCard
              key={auc.id}
              auction={auc}
              onBid={async (id, amt) => {
                await placeBid(id, activePersona.id, amt);
              }}
              onAccept={async (id, bidId) => {
                await acceptBid(id, bidId);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

