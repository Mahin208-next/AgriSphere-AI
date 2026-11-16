import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAuctions } from '../hooks/useAuctions';
import { formatBDT, formatKg, formatDate } from '../utils/formatters';
import { t } from '../utils/i18n';
import {
  Layers,
  UserCheck,
  Gavel,
  ShoppingBag,
  Award,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { currentUser, activePersona, language } = useAuth();
  const { auctions } = useAuctions();

  // Role-specific stats
  const role = currentUser?.role || 'FARMER';
  const myAuctions = auctions.filter((a) => a.sellerId === currentUser?.id || (a as any).listing?.farmerId === currentUser?.id);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-earth-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-agri-600 to-agri-800 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-agri-600/20">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-earth-900">{currentUser?.name}</h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verified
              </span>
            </div>
            <div className="text-xs text-earth-500 mt-0.5 flex items-center gap-2">
              <span className="font-semibold text-agri-700">{activePersona.badge}</span>
              <span>•</span>
              <span>{activePersona.district}</span>
              <span>•</span>
              <span className="font-mono text-earth-600">{currentUser?.phone}</span>
            </div>
          </div>
        </div>

        <div className="bg-earth-50 p-3 rounded-xl border border-earth-200 text-xs">
          <div className="text-earth-500 font-semibold uppercase text-[10px]">
            {language === 'bn' ? 'ব্যবহারকারী রোল' : 'Account Role'}
          </div>
          <div className="font-black text-earth-900 font-mono text-sm mt-0.5">
            {activePersona.roleLabel}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-earth-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-earth-500 font-medium">
            <span>{language === 'bn' ? 'চলমান নিলাম' : 'Active Auctions'}</span>
            <Gavel className="w-4 h-4 text-agri-600" />
          </div>
          <div className="text-2xl font-black text-earth-900 font-mono mt-2">
            {myAuctions.length || auctions.length}
          </div>
          <div className="text-[11px] text-agri-700 mt-1">Real-time live updates</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-earth-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-earth-500 font-medium">
            <span>{language === 'bn' ? 'সম্পন্ন চুক্তি / অর্ডার' : 'Completed Deals'}</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-earth-900 font-mono mt-2">
            12
          </div>
          <div className="text-[11px] text-emerald-700 mt-1">100% On-time delivery</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-earth-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-earth-500 font-medium">
            <span>{language === 'bn' ? 'মোট বিক্রয় ভলিউম' : 'Total Volume'}</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-earth-900 font-mono mt-2">
            28,500 <span className="text-xs font-normal text-earth-500">kg</span>
          </div>
          <div className="text-[11px] text-blue-700 mt-1">Direct commercial trade</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-earth-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-earth-500 font-medium">
            <span>{language === 'bn' ? 'রেটিং ও বিশ্বাসযোগ্যতা' : 'Trust Score'}</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-earth-900 font-mono mt-2">
            4.9 / 5.0
          </div>
          <div className="text-[11px] text-amber-700 mt-1">Verified Partner</div>
        </div>
      </div>

      {/* Role-Specific Content Area */}
      <div className="bg-white rounded-2xl border border-earth-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-earth-100 pb-4">
          <h3 className="text-base font-bold text-earth-900">
            {language === 'bn' ? 'সাম্প্রতিক কার্যক্রম ও অডিট ট্রেল' : 'Recent Trading Activities & Audit Trail'}
          </h3>
          <span className="text-xs text-earth-500 font-mono">Immutable Log</span>
        </div>

        <div className="divide-y divide-earth-100 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-earth-900">
                  {language === 'bn' ? 'আলু লাইভ নিলামে সর্বোচ্চ বিড গ্রহণ সম্পন্ন' : 'Potato Live Auction: Highest Bid Accepted (৳28.5/kg)'}
                </div>
                <div className="text-[10px] text-earth-500">
                  Buyer: Kalam Agro Trading • 2,000 kg • Shibganj, Bogura
                </div>
              </div>
            </div>
            <span className="text-[10px] text-earth-400 font-mono">Today 11:42 AM</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-earth-900">
                  {language === 'bn' ? 'বেঙ্গল ফুড মিলসের প্রকিউরমেন্টে ৩,০০০ কেজি স্প্লিট অফার জমা' : 'Submitted 3,000kg Split Offer to Bengal Food Mills'}
                </div>
                <div className="text-[10px] text-earth-500">
                  Requirement: 15,000 kg • Rate: ৳32/kg • Status: Pending Approval
                </div>
              </div>
            </div>
            <span className="text-[10px] text-earth-400 font-mono">Yesterday 04:15 PM</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-earth-900">
                  {language === 'bn' ? 'ডিজিটাল সরবরাহ চুক্তি নং AGR-2026-081 সাক্ষরিত' : 'Digital Supply Contract #AGR-2026-081 Executed'}
                </div>
                <div className="text-[10px] text-earth-500">
                  Auto Rice Mill Supply Agreement • Dinajpur Miniket 50 MT
                </div>
              </div>
            </div>
            <span className="text-[10px] text-earth-400 font-mono">02 Nov 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};

