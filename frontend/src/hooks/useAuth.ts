import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole, Language } from '../@types';
import { authApi } from '../api/auth.api';

export interface Persona {
  id: string;
  name: string;
  nameBn: string;
  phone: string;
  role: UserRole;
  roleLabel: string;
  roleLabelBn: string;
  badge: string;
  district: string;
  districtBn: string;
}

export const DEMO_PERSONAS: Persona[] = [
  {
    id: 'user_farmer_1',
    name: 'Md. Rafiqul Islam',
    nameBn: 'মোঃ রফিকুল ইসলাম',
    phone: '01711000001',
    role: 'FARMER',
    roleLabel: 'Farmer (Producer)',
    roleLabelBn: 'কৃষক (উৎপাদক)',
    badge: '🌾 Bogura Potato Grower',
    district: 'Bogura',
    districtBn: 'বগুড়া'
  },
  {
    id: 'user_farmer_2',
    name: 'Abdul Malek',
    nameBn: 'আব্দুল মালেক',
    phone: '01711000002',
    role: 'FARMER',
    roleLabel: 'Farmer (Producer)',
    roleLabelBn: 'কৃষক (উৎপাদক)',
    badge: '🌾 Dinajpur Rice Farmer',
    district: 'Dinajpur',
    districtBn: 'দিনাজপুর'
  },
  {
    id: 'user_buyer_1',
    name: 'Kalam Agro Trading',
    nameBn: 'কালাম এগ্রো ট্রেডিং',
    phone: '01811000001',
    role: 'BUYER',
    roleLabel: 'Wholesaler / Aratdar',
    roleLabelBn: 'পাইকার / আড়তদার',
    badge: '🏢 Karwan Bazar Trader',
    district: 'Dhaka',
    districtBn: 'ঢাকা'
  },
  {
    id: 'user_factory_1',
    name: 'Bengal Food & Agro Mills',
    nameBn: 'বেঙ্গল ফুড অ্যান্ড এগ্রো মিলস',
    phone: '01911000001',
    role: 'FACTORY',
    roleLabel: 'Food Factory / Mill',
    roleLabelBn: 'খাদ্য কারখানা / চাল কল',
    badge: '🏭 Gazipur Industrial Park',
    district: 'Gazipur',
    districtBn: 'গাজীপুর'
  },
  {
    id: 'user_retailer_1',
    name: 'SabjiGhor Express Retail',
    nameBn: 'সবজিঘর এক্সপ্রেস রিটেইল',
    phone: '01611000001',
    role: 'RETAILER',
    roleLabel: 'Retailer / Supermarket',
    roleLabelBn: 'খুচরা বিক্রেতা / সুপারশপ',
    badge: '🛒 Dhanmondi Outlet',
    district: 'Dhaka',
    districtBn: 'ঢাকা'
  },
  {
    id: 'user_exporter_1',
    name: 'Green Bengal Global Exports',
    nameBn: 'গ্রিন বেঙ্গল গ্লোবাল এক্সপোর্টস',
    phone: '01511000001',
    role: 'EXPORTER',
    roleLabel: 'Exporter / Aggregator',
    roleLabelBn: 'রপ্তানিকারক / এগ্রিগেটর',
    badge: '🚢 Chittagong Export Hub',
    district: 'Chattogram',
    districtBn: 'চট্টগ্রাম'
  },
  {
    id: 'user_importer_1',
    name: 'Al-Karam Gulf Trading LLC',
    nameBn: 'আল-কারাম গাল্ফ ট্রেডিং',
    phone: '+971501234567',
    role: 'IMPORTER',
    roleLabel: 'International Importer',
    roleLabelBn: 'আন্তর্জাতিক আমদানিকারক',
    badge: '✈️ Dubai, UAE',
    district: 'Dubai',
    districtBn: 'দুবাই'
  },
  {
    id: 'user_admin_1',
    name: 'System Administrator',
    nameBn: 'সিস্টেম অ্যাডমিনিস্ট্রেটর',
    phone: '01999999999',
    role: 'ADMIN',
    roleLabel: 'Platform Administrator',
    roleLabelBn: 'প্ল্যাটফর্ম অ্যাডমিন',
    badge: '🛡️ DAM & Verified Admin',
    district: 'Dhaka',
    districtBn: 'ঢাকা'
  }
];

interface AuthContextType {
  currentUser: User | null;
  activePersona: Persona;
  language: Language;
  token: string | null;
  isAuthenticated: boolean;
  setLanguage: (lang: Language) => void;
  switchPersona: (personaId: string) => void;
  login: (phone: string, pin: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePersona, setActivePersona] = useState<Persona>(DEMO_PERSONAS[0]);
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('agrisphere_lang') as Language) || 'bn';
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return {
      id: DEMO_PERSONAS[0].id,
      name: DEMO_PERSONAS[0].name,
      phone: DEMO_PERSONAS[0].phone,
      role: DEMO_PERSONAS[0].role,
      isVerified: true,
      district: DEMO_PERSONAS[0].district,
      languagePreference: 'bn'
    };
  });
  const [token, setToken] = useState<string | null>('demo_token_farmer_1');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('agrisphere_lang', lang);
  };

  const switchPersona = (personaId: string) => {
    const found = DEMO_PERSONAS.find((p) => p.id === personaId) || DEMO_PERSONAS[0];
    setActivePersona(found);
    const mockUser: User = {
      id: found.id,
      name: language === 'bn' ? found.nameBn : found.name,
      phone: found.phone,
      role: found.role,
      isVerified: true,
      district: found.district,
      languagePreference: language
    };
    setCurrentUser(mockUser);
    setToken(`demo_token_${found.id}`);
  };

  const login = async (phone: string, _pin: string): Promise<boolean> => {
    const matched = DEMO_PERSONAS.find((p) => p.phone === phone);
    if (matched) {
      switchPersona(matched.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    switchPersona(DEMO_PERSONAS[0].id);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activePersona,
        language,
        token,
        isAuthenticated: !!currentUser,
        setLanguage,
        switchPersona,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

