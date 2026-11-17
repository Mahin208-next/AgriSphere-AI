import React, { useState } from 'react';
import { useAuth, DEMO_PERSONAS } from '../hooks/useAuth';
import { useRealtime } from '../hooks/useRealtime';
import { t } from '../utils/i18n';
import {
  Sprout,
  Globe,
  Bell,
  UserCheck,
  ChevronDown,
  Layers,
  Sparkles,
  TrendingUp,
  Gavel,
  ShoppingBag,
  FileText
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onSelectTab }) => {
  const { activePersona, switchPersona, language, setLanguage, currentUser } = useAuth();
  const { notifications, connected } = useRealtime();
  const [showPersonaDropdown, setShowPersonaDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { id: 'home', label: t('navHome', language), icon: Sprout },
    { id: 'auctions', label: t('navAuctions', language), icon: Gavel, badge: 'LIVE' },
    { id: 'procurement', label: t('navProcurement', language), icon: ShoppingBag },
    { id: 'intelligence', label: t('navIntelligence', language), icon: TrendingUp },
    { id: 'assistant', label: t('navAssistant', language), icon: Sparkles },
    { id: 'export', label: t('navExport', language), icon: Globe, badge: 'INTL' },
    { id: 'dashboard', label: t('navDashboard', language), icon: Layers }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-earth-200 shadow-xs">
      {/* Top Banner: Hackathon & Persona Switcher */}
      <div className="bg-earth-900 text-earth-100 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-earth-300">
              {language === 'bn' ? 'সরাসরি কৃষক-টু-ক্রেতা ট্রেডিং প্ল্যাটফর্ম' : 'Direct Farmer-to-Buyer Trading Platform'}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {connected ? 'DAM Live Connected' : 'Connecting...'}
            </span>
          </div>

          {/* Quick Persona Switcher for Hackathon Judges */}
          <div className="relative flex items-center gap-2">
            <span className="text-earth-300 hidden md:inline text-[11px]">
              {language === 'bn' ? 'ভূমিকা পরিবর্তন করুন:' : 'Judge Persona Switcher:'}
            </span>
            <button
              onClick={() => setShowPersonaDropdown(!showPersonaDropdown)}
              className="flex items-center gap-1.5 bg-earth-800 hover:bg-earth-700 text-earth-100 px-2.5 py-1 rounded-md text-xs font-medium border border-earth-700 transition"
            >
              <UserCheck className="w-3.5 h-3.5 text-agri-400" />
              <span className="font-semibold text-agri-300">
                {language === 'bn' ? activePersona.roleLabelBn : activePersona.roleLabel}
              </span>
              <span className="hidden lg:inline text-earth-300">({activePersona.name})</span>
              <ChevronDown className="w-3 h-3 text-earth-400" />
            </button>

            {/* Persona Dropdown */}
            {showPersonaDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-80 bg-white text-earth-900 rounded-xl shadow-2xl border border-earth-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1.5 border-b border-earth-100 text-[11px] font-bold uppercase tracking-wider text-earth-500">
                  {language === 'bn' ? 'টেস্টিং ডেমো একাউন্ট নির্বাচন করুন' : 'Select Testing Persona for Evaluation'}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {DEMO_PERSONAS.map((persona) => {
                    const isSelected = activePersona.id === persona.id;
                    return (
                      <button
                        key={persona.id}
                        onClick={() => {
                          switchPersona(persona.id);
                          setShowPersonaDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-start gap-2.5 transition hover:bg-agri-50 ${
                          isSelected ? 'bg-agri-100/70 font-semibold' : ''
                        }`}
                      >
                        <span className="text-base mt-0.5">{persona.badge.split(' ')[0]}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-earth-900">
                              {language === 'bn' ? persona.nameBn : persona.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-earth-100 text-earth-700 font-mono">
                              {persona.role}
                            </span>
                          </div>
                          <div className="text-[11px] text-agri-700">
                            {language === 'bn' ? persona.roleLabelBn : persona.roleLabel} • {persona.district}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Language Switcher */}
            <div className="flex items-center border border-earth-700 rounded-md overflow-hidden bg-earth-800">
              <button
                onClick={() => setLanguage('bn')}
                className={`px-2 py-0.5 text-xs font-bold transition ${
                  language === 'bn' ? 'bg-agri-600 text-white' : 'text-earth-300 hover:text-white'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 text-xs font-bold transition ${
                  language === 'en' ? 'bg-agri-600 text-white' : 'text-earth-300 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-agri-600 to-agri-800 flex items-center justify-center text-white shadow-md shadow-agri-600/20 group-hover:scale-105 transition">
            <Sprout className="w-6 h-6 text-agri-200" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-earth-900 tracking-tight">AgriSphere</span>
              <span className="text-xs font-black uppercase px-1.5 py-0.5 bg-agri-100 text-agri-800 rounded tracking-wider">
                MarketLink AI
              </span>
            </div>
            <p className="text-[10px] text-earth-500 font-medium">
              {language === 'bn' ? 'প্রতিটি কৃষক, প্রতিটি বাজারে' : 'Connecting Every Farmer to Every Market'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  isActive
                    ? 'bg-agri-700 text-white shadow-xs'
                    : 'text-earth-700 hover:text-agri-800 hover:bg-earth-100/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-agri-200' : 'text-earth-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded-full font-black ${
                      isActive ? 'bg-agri-800 text-agri-200' : 'bg-red-500 text-white animate-pulse'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Notifications & Role Badge */}
        <div className="flex items-center gap-2.5">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-earth-600 hover:text-earth-900 hover:bg-earth-100 relative transition"
              title="Real-time Notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-earth-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-earth-100 flex items-center justify-between">
                  <span className="font-bold text-xs text-earth-800">
                    {language === 'bn' ? 'সরাসরি বিজ্ঞপ্তি' : 'Live Notifications'} ({notifications.length})
                  </span>
                  <span className="text-[10px] text-agri-600 font-semibold">Real-time SSE</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-earth-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-earth-400">
                      {language === 'bn' ? 'কোনো নতুন বিজ্ঞপ্তি নেই' : 'No notifications yet'}
                    </div>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={i} className="p-3 text-xs hover:bg-earth-50 transition">
                        <div className="font-semibold text-earth-800">
                          {language === 'bn' && n.messageBn ? n.messageBn : n.message || n.type}
                        </div>
                        <div className="text-[10px] text-earth-400 mt-1">
                          {new Date(n.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Badge */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-earth-200">
            <div className="w-8 h-8 rounded-full bg-agri-100 text-agri-800 font-bold flex items-center justify-center text-xs border border-agri-300">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="text-left text-xs">
              <div className="font-bold text-earth-900 leading-tight truncate max-w-[120px]">
                {currentUser?.name}
              </div>
              <div className="text-[10px] text-agri-700 font-medium">{activePersona.badge}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav Scroller */}
      <div className="lg:hidden flex items-center gap-1 px-4 py-2 overflow-x-auto border-t border-earth-100 bg-earth-50 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                isActive ? 'bg-agri-700 text-white' : 'text-earth-700 bg-white border border-earth-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

