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
  ShieldCheck,
  Phone,
  KeyRound,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  ChevronDown
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

const ALL_ROLES: RoleOption[] = [
  {
    role: "farmer",
    titleBn: "কৃষক / খামারি",
    titleEn: "Farmer / Producer",
    descBn: "নিজের ফসল সরাসরি লাইভ নিলামে তুলুন, ডিজিটাল দরদাম ও ন্যায্য মূল্য গ্রহণ করুন।",
    descEn: "Host live crop auctions, manage harvests & connect directly with buyers.",
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
    descEn: "Place real-time bids on farm auctions & source wholesale agricultural produce.",
    icon: ShoppingBag,
    color: "text-blue-700",
    bgLight: "bg-blue-50",
    borderLight: "border-blue-200",
    badgeBn: "পাইকারি বাজার",
    badgeEn: "Wholesale Trading",
    demoUser: {
      id: "usr_buyer_mokbul",
      nameBn: "হাজী মোকবুল হোসেন",
      nameEn: "Haji Mokbul Hossain",
      phone: "+880 1819-345678",
      companyBn: "মেসার্স মোকবুল এন্টারপ্রাইজ (কাওরান বাজার, ঢাকা)",
      companyEn: "Mokbul Traders, Karwan Bazar, Dhaka",
    },
  },
  {
    role: "factory",
    titleBn: "এগ্রো-মিল ও খাদ্য কারখানা",
    titleEn: "Agro-Processor / Factory",
    descBn: "বাল্ক প্রকিউরমেন্ট রিকোয়েস্ট তৈরি করুন, কৃষকদের কাছ থেকে সরাসরি সরবরাহ প্রস্তাব নিন।",
    descEn: "Post bulk crop demand RFQs & receive verified farmer supplier contracts.",
    icon: Building2,
    color: "text-amber-700",
    bgLight: "bg-amber-50",
    borderLight: "border-amber-200",
    badgeBn: "শিল্প কাঁচামাল সোর্সিং",
    badgeEn: "Industrial Procurement",
    demoUser: {
      id: "usr_factory_pran",
      nameBn: "এসিআই ও প্রাণ এগ্রো প্রসেসিং হাব",
      nameEn: "ACI & PRAN Agro Processing Hub",
      phone: "+880 1912-789012",
      companyBn: "অ্যাপেক্স এগ্রো ফুডস অ্যান্ড মিলিং কর্পোরেশন",
      companyEn: "Apex Agro Foods & Milling Corp",
    },
  },
  {
    role: "retailer",
    titleBn: "সুপারশপ ও রিটেইলার",
    titleEn: "Supermarket / Retailer",
    descBn: "দৈনিক তাজা ফল ও সবজি সরাসরি ফার্ম-টু-শেলফ সোর্সিং ও ট্রেসেবিলিটি মনিটরিং।",
    descEn: "Farm-to-shelf direct sourcing for fresh produce with QR traceability & GAP checks.",
    icon: Store,
    color: "text-purple-700",
    bgLight: "bg-purple-50",
    borderLight: "border-purple-200",
    badgeBn: "দৈনিক তাজা পণ্য",
    badgeEn: "Retail Chain Sourcing",
    demoUser: {
      id: "usr_retailer_shwapno",
      nameBn: "স্বপ্ন সুপারশপ ক্রয় কেন্দ্র",
      nameEn: "Shwapno Direct Sourcing Hub",
      phone: "+880 1714-556677",
      companyBn: "স্বপ্ন রিটেইল নেটওয়ার্ক (এসিআই লজিস্টিকস)",
      companyEn: "Shwapno Fresh Produce Division",
    },
  },
  {
    role: "exporter",
    titleBn: "কৃষি পণ্য রপ্তানিকারক",
    titleEn: "Agricultural Exporter",
    descBn: "আন্তর্জাতিক আরএফকিউ (RFQ) রেসপন্স, ফাইটোস্যানিটারি কমপ্লায়েন্স ও বৈদেশিক মুদ্রা চুক্তি।",
    descEn: "Respond to global buyer inquiries with phytosanitary compliance & FOB tracking.",
    icon: Globe2,
    color: "text-teal-700",
    bgLight: "bg-teal-50",
    borderLight: "border-teal-200",
    badgeBn: "আন্তর্জাতিক বাণিজ্য",
    badgeEn: "Global Trade",
    demoUser: {
      id: "usr_exporter_bengal",
      nameBn: "বেঙ্গল ফ্রেশ এগ্রো এক্সপোর্টস লিঃ",
      nameEn: "Bengal Fresh Agro Exports Ltd",
      phone: "+880 1713-998877",
      companyBn: "বাংলাদেশ এগ্রো এক্সপোর্টার্স অ্যাসোসিয়েশন",
      companyEn: "Bangladesh Agro Exporters Association",
    },
  },
  {
    role: "importer",
    titleBn: "আন্তর্জাতিক আমদানিকারক (দুবাই / জিসিসি)",
    titleEn: "International Importer (Dubai / GCC)",
    descBn: "বাংলাদেশি সার্টিফাইড তাজা ফল ও সবজির জন্য সরাসরি আন্তর্জাতিক কোটেশন ও এলসি চুক্তি।",
    descEn: "Direct B2B import procurement with certified GAP standards from Bangladesh.",
    icon: Globe2,
    color: "text-sky-700",
    bgLight: "bg-sky-50",
    borderLight: "border-sky-200",
    badgeBn: "আন্তর্জাতিক আমদানি",
    badgeEn: "Global Importer",
    demoUser: {
      id: "usr_importer_gulf",
      nameBn: "আল-মদিনা ফ্রেশ ফ্রুটস অ্যান্ড ভেজিটেবলস",
      nameEn: "Al-Madina Fresh Fruits & Veg LLC",
      phone: "+971 4 298 7654",
      companyBn: "আল-মদিনা জেনারেল ট্রেডিং এলএলসি (দুবাই, সংযুক্ত আরব আমিরাত)",
      companyEn: "Al-Madina General Trading LLC, Dubai",
    },
  },
];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/dashboard";

  const { login, loginByRole, adminLogin, language, setLanguage } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>("farmer");
  const [phoneNumber, setPhoneNumber] = useState("01711234567");
  const [password, setPassword] = useState("demo1234");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const currentRoleConfig = ALL_ROLES.find((r) => r.role === selectedRole) || ALL_ROLES[0];
  const Icon = currentRoleConfig.icon;

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg("");
    const target = ALL_ROLES.find((r) => r.role === role);
    if (target) {
      setPassword("demo1234");
      setPhoneNumber(target.demoUser.phone.replace(/[^0-9]/g, ""));
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // Try login by selected demo role user ID
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
    <div className="min-h-screen bg-[#fcfbf9] py-8 sm:py-12 px-3 sm:px-6 flex flex-col justify-center">
      <div className="max-w-xl mx-auto w-full space-y-5 sm:space-y-6">
        {/* Top Header & Logo */}
        <div className="text-center space-y-2.5 sm:space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <img
              src="/logo.png"
              alt="KrishiSetu AI"
              className="h-12 sm:h-16 w-auto object-contain mx-auto transition-transform group-hover:scale-105"
            />
          </Link>
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-earth-900 leading-normal">
              {language === "bn" ? "লগইন পোর্টাল" : "Sign In to Your Account"}
            </h1>
            <p className="text-earth-600 text-xs sm:text-sm mt-1">
              {language === "bn"
                ? "আপনার অ্যাকাউন্টে প্রবেশ করতে কীভাবে লগইন করতে চান তা নির্বাচন করুন"
                : "Select how you want to log in and sign in with your role profile"}
            </p>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="bg-white rounded-2xl border border-earth-200 shadow-md p-4 sm:p-8 space-y-5 sm:space-y-6">
          {/* How do you want to login? Dropdown */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-earth-700 flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between gap-1">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-agri-700 shrink-0" />
                <span>
                  {language === "bn"
                    ? "আপনি কীভাবে লগইন করতে চান? (ভূমিকা নির্বাচন করুন):"
                    : "How do you want to log in? (Select Role):"}
                </span>
              </span>
              <span className="text-[11px] font-semibold text-agri-700 shrink-0">
                {language === "bn"
                  ? `${ALL_ROLES.length.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d])}টি ভূমিকা উপলব্ধ`
                  : `${ALL_ROLES.length} Roles Available`}
              </span>
            </label>

            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="w-full appearance-none bg-earth-50/80 hover:bg-earth-50 border-2 border-agri-600/40 focus:border-agri-700 focus:bg-white focus:ring-4 focus:ring-agri-600/10 rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-earth-900 cursor-pointer transition shadow-2xs pr-10"
              >
                {ALL_ROLES.map((r) => (
                  <option key={r.role} value={r.role} className="py-2 text-earth-900 bg-white">
                    {language === "bn"
                      ? `${r.titleBn} — (${r.titleEn})`
                      : `${r.titleEn} — (${r.titleBn})`}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-agri-700">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Active Selected Role Card Preview */}
          <div className={`p-4 rounded-xl border ${currentRoleConfig.borderLight} ${currentRoleConfig.bgLight} transition-all space-y-2.5`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-lg bg-white shadow-2xs flex items-center justify-center ${currentRoleConfig.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-earth-900">
                    {language === "bn" ? currentRoleConfig.titleBn : currentRoleConfig.titleEn}
                  </h3>
                  <p className="text-[11px] text-earth-600">
                    {language === "bn" ? currentRoleConfig.demoUser.companyBn : currentRoleConfig.demoUser.companyEn}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-earth-700 border border-earth-200 shadow-2xs shrink-0">
                {language === "bn" ? currentRoleConfig.badgeBn : currentRoleConfig.badgeEn}
              </span>
            </div>

            <p className="text-xs text-earth-700 pt-1 border-t border-earth-200/50">
              {language === "bn" ? currentRoleConfig.descBn : currentRoleConfig.descEn}
            </p>

            <div className="text-[11px] text-earth-600 flex items-center justify-between pt-0.5">
              <span>
                {language === "bn" ? "প্রোফাইল নাম:" : "Profile Name:"}{" "}
                <strong className="text-earth-900">{language === "bn" ? currentRoleConfig.demoUser.nameBn : currentRoleConfig.demoUser.nameEn}</strong>
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form Credentials */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-earth-700 mb-1">
                  {language === "bn" ? "মোবাইল নম্বর / ইউজার আইডি" : "Phone Number / User ID"}
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
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-earth-300 rounded-xl focus:ring-2 focus:ring-agri-600 focus:border-agri-600 text-earth-900 bg-earth-50/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-700 mb-1">
                  {language === "bn" ? "পাসওয়ার্ড / পাসকোড" : "Password / Passcode"}
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
                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-earth-300 rounded-xl focus:ring-2 focus:ring-agri-600 focus:border-agri-600 text-earth-900 bg-earth-50/40"
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

            {/* Quick Demo Helper Hint */}
            <p className="text-[11px] text-earth-500">
              {language === "bn"
                ? "💡 মূল্যায়নের সুবিধার জন্য নির্বাচিত ভূমিকার ডেমো তথ্য স্বয়ংক্রিয় পূরণ করা আছে।"
                : "💡 Demo credentials for the selected role are pre-filled for immediate access."}
            </p>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-agri-800 hover:bg-agri-900 text-white font-bold text-sm shadow-sm transition disabled:opacity-50"
              >
                <span>
                  {loading
                    ? (language === "bn" ? "প্রবেশ করা হচ্ছে..." : "Signing In...")
                    : (language === "bn" ? `${currentRoleConfig.titleBn} হিসেবে লগইন` : `Sign In as ${currentRoleConfig.titleEn}`)}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Public Visitor Return Links */}
        <div className="text-center pt-2 pb-6 space-y-2">
          <p className="text-xs text-earth-600">
            {language === "bn"
              ? "লগইন না করেও সাধারণ পরিদর্শক হিসেবে মূল সাইটের উন্মুক্ত ফিচারগুলো ঘুরে দেখতে পারেন:"
              : "You can also explore public features as a visitor without signing in:"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-agri-700">
            <Link href="/" className="hover:underline">
              {language === "bn" ? "হোম পেজ" : "Home"}
            </Link>
            <span className="text-earth-300">•</span>
            <Link href="/marketplace" className="hover:underline">
              {language === "bn" ? "মার্কেটপ্লেস" : "Marketplace"}
            </Link>
            <span className="text-earth-300">•</span>
            <Link href="/auctions" className="hover:underline">
              {language === "bn" ? "লাইভ নিলাম" : "Live Auctions"}
            </Link>
            <span className="text-earth-300">•</span>
            <Link href="/market-intelligence" className="hover:underline">
              {language === "bn" ? "বাজার দর" : "Market Prices"}
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
        <div className="min-h-screen flex items-center justify-center bg-[#fcfbf9] text-earth-600 text-sm">
          Loading login portal...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
