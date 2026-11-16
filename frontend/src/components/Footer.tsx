import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Sprout, ShieldCheck, HeartHandshake, PhoneCall, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language } = useAuth();

  return (
    <footer className="bg-earth-900 text-earth-200 mt-16 border-t border-earth-800">
      {/* Transparency & Ethical AI Banner */}
      <div className="border-b border-earth-800/80 bg-earth-950/60 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-earth-400">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-agri-400 shrink-0" />
            <div>
              <p className="font-semibold text-earth-200">
                {language === 'bn'
                  ? 'স্বচ্ছতা ও নৈতিক এআই নীতিমালা'
                  : 'Transparency & Responsible AI Disclosure'}
              </p>
              <p className="text-[11px] mt-0.5">
                {language === 'bn'
                  ? 'বাজার দর বাংলাদেশ কৃষি বিপণন অধিদপ্তর (DAM) থেকে সংগৃহীত। প্ল্যাটফর্ম কোনো সিন্ডিকেট নির্মূল বা নির্দিষ্ট আয়ের মিথ্যা প্রতিশ্রুতি দেয় না। চূড়ান্ত সিদ্ধান্ত কৃষকের হাতে।'
                  : 'Market prices are synced from the Department of Agricultural Marketing (DAM). AgriSphere does not guarantee specific incomes or the elimination of cartels. Final trading decisions always remain with the farmer.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-earth-900 px-3 py-1.5 rounded-lg border border-earth-800">
            <PhoneCall className="w-4 h-4 text-amber-400" />
            <span className="text-[11px]">
              {language === 'bn' ? 'কৃষি কল সেন্টার:' : 'Farmer Helpline:'}{' '}
              <strong className="text-white font-mono">16123</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-agri-600 flex items-center justify-center text-white">
              <Sprout className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-white text-base">AgriSphere</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-agri-800 text-agri-300 rounded">AI</span>
          </div>
          <p className="text-xs text-earth-400 leading-relaxed">
            {language === 'bn'
              ? 'কৃষক ও প্রাতিষ্ঠানিক ক্রেতাদের মাঝে প্রত্যক্ষ বাণিজ্যিক সংযোগ, রিয়েল-টাইম নিলাম এবং কৃত্রিম বুদ্ধিমত্তা চালিত বাজার বুদ্ধিমত্তা।'
              : 'Direct commercial connectivity, real-time auctions, and AI-driven agricultural market intelligence bridging farmers with institutional buyers.'}
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            {language === 'bn' ? 'ট্রেডিং মডিউল' : 'Trading Modules'}
          </h4>
          <ul className="space-y-2 text-xs text-earth-400">
            <li>System A: {language === 'bn' ? 'কৃষক লাইভ অকশন (অ্যান্টি-স্নাইপ)' : 'Farmer Live Auctions'}</li>
            <li>System B: {language === 'bn' ? 'বায়ার রিভার্স প্রকিউরমেন্ট' : 'Buyer Reverse Procurement'}</li>
            <li>{language === 'bn' ? 'স্প্লিট ফুলফিলমেন্ট চুক্তি' : 'Split-Lot Multi-Farmer Fulfillment'}</li>
            <li>{language === 'bn' ? 'আন্তর্জাতিক এক্সপোর্ট রাডার' : 'Global Export Radar & RFQs'}</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            {language === 'bn' ? 'বাজার বুদ্ধিমত্তা' : 'Market Intelligence'}
          </h4>
          <ul className="space-y-2 text-xs text-earth-400">
            <li>{language === 'bn' ? '৬৪ জেলার ডিএএম (DAM) লাইভ দর' : '64 District DAM Live Prices'}</li>
            <li>{language === 'bn' ? 'এআই নেট রিটার্ন ক্যালকুলেটর' : 'AI Net-Return Route Optimizer'}</li>
            <li>{language === 'bn' ? 'বাংলা এআই কৃষক সহকারী (RAG)' : 'Bangla AI Agriculture Advisor'}</li>
            <li>{language === 'bn' ? 'অতিরিক্ত সরবরাহ পূর্বাভাস' : 'Oversupply & Glut Early Warning'}</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            {language === 'bn' ? 'হ্যাকথন মূল্যায়ন' : 'Hackathon Verification'}
          </h4>
          <p className="text-xs text-earth-400 mb-2">
            FarmMarket International Builder Challenge 2026.
          </p>
          <div className="bg-earth-800/80 p-2.5 rounded-lg border border-earth-700/60 text-[11px] text-earth-300 space-y-1">
            <div>⚡ Full-Stack Express + React 18 + Prisma</div>
            <div>⚡ Real-time SSE Live Bidding System</div>
            <div>⚡ 8 Preloaded Evaluation Personas</div>
          </div>
        </div>
      </div>

      <div className="border-t border-earth-800 py-4 px-4 text-center text-xs text-earth-500">
        © 2026 AgriSphere MarketLink AI. {language === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
      </div>
    </footer>
  );
};

