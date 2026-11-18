"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { UserRole } from "@/types";
import {
  Sprout,
  ShoppingBag,
  Building2,
  Store,
  Globe2,
  Lock,
  Phone,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck
} from "lucide-react";

interface RoleOption {
  role: UserRole;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
  icon: React.ElementType;
  color: string;
  bgLight: string;
  borderLight: string;
  badgeBn: string;
  badgeEn: string;
  demoUser: {
    id: string;
    nameBn: string;
    nameEn: string;
    phone: string;
    companyBn: string;
    companyEn: string;
  };
}

const PUBLIC_ROLES: RoleOption[] = [
  {
    role: "farmer",
    titleBn: "কৃষক / খামারি",
    titleEn: "Farmer / Producer",
    descBn: "নিজের ফসল লাইভ নিলামে তুলুন, ছবি ও ভিডিও আপলোড করুন, এআই পূর্বাভাস ও সরাসরি দাম পান।",
    descEn: "Host live crop auctions, upload photos/videos, access AI market predictions & best prices.",
    icon: Sprout,
    color: "text-emerald-700",
    bgLight: "bg-emerald-50",
    borderLight: "border-emerald-200",
    badgeBn: "সরাসরি মাঠ থেকে বিক্রয়",
    badgeEn: "Direct Farm Sales",
    demoUser: {
      id: "usr_farmer_rafiq",
      nameBn: "মোঃ রফিকুল ইসলাম",
      nameEn: "Md. Rafiqul Islam",
      phone: "+880 1711-234567",
      companyBn: "সবুজ বাংলা ডেইরি ও এগ্রো ফার্ম (বগুড়া)",
      companyEn: "Green Bangla Agro Farm, Bogura",
    },
  },
  {
    role: "buyer",
    titleBn: "পাইকারি ক্রেতা / আড়তদার",
    titleEn: "Wholesaler / Aratdar",
    descBn: "সরাসরি কৃষকের নিলামে বিড করুন, বাল্ক লট কিনুন এবং ডিজিটাল ইনভয়েস পরিচালনা করুন।",
    descEn: "Place real-time bids on farm auctions, buy wholesale lots with transparent escrows.",
    icon: ShoppingBag,
    color: "text-blue-700",
    bgLight: "bg-blue-50",
    borderLight: "border-blue-200",
    badgeBn: "পাইকারি বাজার",
    badgeEn: "Wholesale Market",
    demoUser: {
      id: "usr_buyer_mokbul",
      nameBn: "হাজী মকবুল হোসেন",
      nameEn: "Haji Mokbul Hossain",
      phone: "+880 1819-876543",
      companyBn: "মেসার্স মকবুল ট্রেডার্স (কাওরান বাজার, ঢাকা)",
      companyEn: "Mokbul Traders, Karwan Bazar, Dhaka",
    },
  },
  {
    role: "factory",
    titleBn: "এগ্রো-মিল ও খাদ্য কারখানা",
    titleEn: "Agro-Processor / Factory",
    descBn: "বাল্ক প্রকিউরমেন্ট রিকোয়েস্ট তৈরি করুন, কৃষকদের কাছ থেকে সরাসরি সরবরাহ প্রস্তাব নিন।",
    descEn: "Post bulk crop demand RFQs, receive verified farmer offers with quality tests.",
    icon: Building2,
    color: "text-amber-700",
    bgLight: "bg-amber-50",
    borderLight: "border-amber-200",
    badgeBn: "শিল্প কাঁচামাল সোর্সিং",
    badgeEn: "Industrial Procurement",
    demoUser: {
      id: "usr_factory_pran",
      nameBn: "প্রাণ এগ্রো প্রসেসিং লিমিটেড",
      nameEn: "PRAN Agro Processing Ltd",
      phone: "+880 1912-345678",
      companyBn: "প্রাণ-আরএফএল গ্রুপ প্রকিউরমেন্ট উইং",
      companyEn: "PRAN-RFL Group Procurement Wing",
    },
  },
  {
    role: "retailer",
    titleBn: "সুপারশপ ও রিটেইলার",
    titleEn: "Supermarket / Retailer",
    descBn: "দৈনিক তাজা ফল ও সবজি ফার্ম-টু-শেলফ সোর্সিং, প্রিমিয়াম গ্রেড কোয়ালিটি ও ট্রেসেবিলিটি।",
    descEn: "Farm-to-shelf direct sourcing for fresh produce with QR traceability & GAP checks.",
    icon: Store,
    color: "text-purple-700",
    bgLight: "bg-purple-50",
    borderLight: "border-purple-200",
    badgeBn: "দৈনিক তাজা পণ্য",
    badgeEn: "Retail Chain Sourcing",
    demoUser: {
      id: "usr_retailer_shwapno",
      nameBn: "স্বপ্ন সুপারশপ (এসিআই লজিস্টিকস)",
      nameEn: "Shwapno Super Shop (ACI Logistics)",
      phone: "+880 1611-456789",
      companyBn: "স্বপ্ন ফ্রেশ প্রডিউস নেটওয়ার্ক",
      companyEn: "Shwapno Fresh Produce Division",
    },
  },
  {
    role: "exporter",
    titleBn: "কৃষি পণ্য রপ্তানিকারক",
    titleEn: "Agricultural Exporter",
    descBn: "আন্তর্জাতিক আরএফকিউ (RFQ) রেসপন্স, ফাইটোস্যানিটারি কমপ্লায়েন্স ও বৈদেশিক মুদ্রা চুক্তি।",
    descEn: "Respond to global buyer inquiries with phytosanitary compliance & FOB trade tracking.",
    icon: Globe2,
    color: "text-teal-700",
    bgLight: "bg-teal-50",
    borderLight: "border-teal-200",
    badgeBn: "আন্তর্জাতিক বাণিজ্য",
    badgeEn: "Global Agricultural Trade",
    demoUser: {
      id: "usr_exporter_bengal",
      nameBn: "বেঙ্গল ফ্রেশ প্রোডাক্টস লিমিটেড",
      nameEn: "Bengal Fresh Produce Ltd",
      phone: "+880 1715-998877",
      companyBn: "বাংলাদেশ এগ্রো এক্সপোর্টার্স অ্যাসোসিয়েশন",
      companyEn: "Bangladesh Agro Exporters Association",
    },
  },
];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/dashboard";

  const { login, loginByRole, language } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>("farmer");
  const [phoneNumber, setPhoneNumber] = useState("01711234567");
  const [password, setPassword] = useState("demo1234");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const currentRoleConfig = PUBLIC_ROLES.find((r) => r.role === selectedRole) || PUBLIC_ROLES[0];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg("");
    const target = PUBLIC_ROLES.find((r) => r.role === role);
    if (target) {
      setPhoneNumber(target.demoUser.phone.replace(/[^0-9]/g, ""));
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // Login by selected demo role user
      const success = await login(currentRoleConfig.demoUser.id);
      if (success) {
        router.push(redirectTarget);
      } else {
        // Fallback to role-based login
        const roleSuccess = await loginByRole(selectedRole);
        if (roleSuccess) {
          router.push(redirectTarget);
        } else {
          setErrorMsg(
            language === "bn"
              ? "লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
              : "Login failed. Please check credentials and try again."
          );
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbf9] py-10 px-4 sm:px-6 flex flex-col justify-center">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <img
              src="/logo.png"
              alt="KrishiSetu AI"
              className="h-14 sm:h-16 w-auto object-contain mx-auto transition-transform group-hover:scale-105"
            />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-earth-900 tracking-tight">
              {language === "bn" ? "ব্যবহারকারী লগইন ও ভূমিকা নির্বাচন" : "Portal Login & Role Selection"}
            </h1>
            <p className="text-earth-600 text-sm sm:text-base mt-1 max-w-xl mx-auto">
              {language === "bn"
                ? "আপনার ভূমিকা (Role) নির্বাচন করে সিস্টেমে প্রবেশ করুন। সাধারণ পরিদর্শকরা যেকোনো সময় মুক্তভাবে মূল সাইট পরিদর্শন করতে পারবেন।"
                : "Select your active business role to sign in. Public visitors can freely explore the public marketplace without logging in."}
            </p>
          </div>
        </div>

        {/* Role Selector Grid */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-earth-700">
            {language === "bn" ? "১. আপনার ভূমিকা নির্বাচন করুন (Select Role):" : "1. Select Your Role:"}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PUBLIC_ROLES.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.role;
              return (
                <button
                  type="button"
                  key={r.role}
                  onClick={() => handleRoleSelect(r.role)}
                  className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `bg-white ${r.borderLight} shadow-md ring-2 ring-agri-600 ring-offset-1`
                      : "bg-white border-earth-200 hover:border-earth-300 hover:bg-earth-50/50 shadow-2xs"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-lg ${r.bgLight} flex items-center justify-center ${r.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-earth-100 text-earth-700">
                        {language === "bn" ? r.badgeBn : r.badgeEn}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-earth-900">
                        {language === "bn" ? r.titleBn : r.titleEn}
                      </h3>
                      <p className="text-xs text-earth-600 mt-1 line-clamp-2">
                        {language === "bn" ? r.descBn : r.descEn}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-earth-100 flex items-center justify-between text-[11px]">
                    <span className="text-earth-500 font-medium truncate">
                      {language === "bn" ? r.demoUser.nameBn : r.demoUser.nameEn}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 font-bold text-agri-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-agri-600" />
                        {language === "bn" ? "নির্বাচিত" : "Active"}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Role Form Container */}
        <div className="bg-white rounded-2xl border border-earth-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-earth-100 pb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${currentRoleConfig.bgLight} flex items-center justify-center ${currentRoleConfig.color}`}>
                <currentRoleConfig.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-earth-900">
                    {language === "bn" ? currentRoleConfig.titleBn : currentRoleConfig.titleEn}
                  </h2>
                  <span className="text-[11px] font-semibold bg-agri-100 text-agri-800 px-2 py-0.5 rounded">
                    {language === "bn" ? "অনুমোদিত অ্যাকাউন্ট" : "Verified Account"}
                  </span>
                </div>
                <p className="text-xs text-earth-600">
                  {language === "bn" ? currentRoleConfig.demoUser.companyBn : currentRoleConfig.demoUser.companyEn}
                </p>
              </div>
            </div>

            {/* Instant Demo Quick-Access */}
            <button
              type="button"
              onClick={() => handleLogin()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-harvest-500 hover:bg-harvest-600 text-harvest-950 font-bold text-xs shadow-xs transition"
            >
              <Sparkles className="w-4 h-4 text-harvest-900" />
              <span>{language === "bn" ? "১-ক্লিকে ডেমো প্রবেশ" : "1-Click Instant Demo Access"}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-earth-700 mb-1">
                  {language === "bn" ? "মোবাইল নম্বর / ইমেইল" : "Phone Number / Email"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-earth-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-earth-300 rounded-lg focus:ring-2 focus:ring-agri-600 focus:border-agri-600 text-earth-900 bg-earth-50/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-700 mb-1">
                  {language === "bn" ? "পাসওয়ার্ড / পাসকোড" : "Password / PIN"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="w-4 h-4 text-earth-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 text-sm border border-earth-300 rounded-lg focus:ring-2 focus:ring-agri-600 focus:border-agri-600 text-earth-900 bg-earth-50/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-earth-400 hover:text-earth-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-earth-500">
                {language === "bn"
                  ? "💡 মূল্যায়নকারীদের সুবিধার জন্য ডেমো পাসকোড স্বয়ংক্রিয় পূরণ করা আছে।"
                  : "💡 Demo credentials are pre-configured for instant evaluator access."}
              </span>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-agri-800 hover:bg-agri-900 text-white font-bold text-sm shadow-sm transition disabled:opacity-50"
              >
                <span>{loading ? (language === "bn" ? "প্রবেশ করা হচ্ছে..." : "Signing in...") : (language === "bn" ? "লগইন করুন" : "Sign In")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Public Visitor Notice & Quick Links */}
        <div className="text-center pt-2 pb-6 space-y-2">
          <p className="text-xs text-earth-600">
            {language === "bn"
              ? "লগইন না করেও আপনি সাধারণ পরিদর্শক হিসেবে মার্কেটপ্লেস ও লাইভ নিলাম দেখতে পারেন।"
              : "You can also explore public auctions and marketplace without logging in."}
          </p>
          <div className="flex items-center justify-center gap-4 text-xs font-semibold text-agri-700">
            <Link href="/marketplace" className="hover:underline">
              {language === "bn" ? "→ কৃষি মার্কেটপ্লেস দেখুন" : "→ Explore Marketplace"}
            </Link>
            <span className="text-earth-300">•</span>
            <Link href="/auctions" className="hover:underline">
              {language === "bn" ? "→ লাইভ নিলাম দেখুন" : "→ Watch Live Auctions"}
            </Link>
            <span className="text-earth-300">•</span>
            <Link href="/market-intelligence" className="hover:underline">
              {language === "bn" ? "→ বাজার দর দেখুন" : "→ Market Prices"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fbfbf9] text-earth-600 text-sm">
          Loading login portal...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
