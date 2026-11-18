"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { Bot, Send, Sparkles, User, ShieldCheck, Clock, RefreshCw, LogIn, CheckCircle2 } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  citations?: string[];
  timestamp: string;
}

function getTimeGreeting(isEnglish: boolean = false): string {
  const hour = new Date().getHours();
  if (isEnglish) {
    if (hour >= 5 && hour < 12) return "Good morning!";
    if (hour >= 12 && hour < 17) return "Good afternoon!";
    if (hour >= 17 && hour < 21) return "Good evening!";
    return "Hello!";
  } else {
    if (hour >= 5 && hour < 12) return "শুভ সকাল!";
    if (hour >= 12 && hour < 17) return "শুভ দুপুর!";
    if (hour >= 17 && hour < 21) return "শুভ সন্ধ্যা!";
    return "শুভ রাত!";
  }
}

export default function BanglaAIAssistantWidget() {
  const { currentUser, currentRole, language, t } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_init",
      sender: "bot",
      text: language === "bn"
        ? `${getTimeGreeting(false)} আমি KrishiSetu AI প্ল্যাটফর্ম সহকারী।\n\nআমাদের ওয়েবসাইটের চলমান লাইভ নিলাম, আজকের সরকারি পাইকারি বাজার দর, মার্কেটপ্লেসের ফসল, কারখানার ক্রয়চাহিদা এবং বিদেশে রপ্তানি সম্পর্কিত যেকোনো প্রশ্ন করুন — আমি সরাসরি ওয়েবসাইটের তথ্য থেকে উত্তর দেব।`
        : `${getTimeGreeting(true)} I am the KrishiSetu AI Platform Assistant.\n\nAsk me anything about active live auctions, wholesale rates, marketplace crop lots, or factory procurement demands — I will answer using verified platform data.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    {
      en: "What live auctions are active right now?",
      bn: "বর্তমানে কি কোনো ফসলের লাইভ নিলাম চলছে?",
    },
    {
      en: "What is today's wholesale price of Green Chilli?",
      bn: "আজকে কাঁচা মরিচের পাইকারি দাম কত?",
    },
    {
      en: "Which factories are procuring crops right now?",
      bn: "কারখানাগুলো বর্তমানে কোন কোন ফসল কিনতে চাচ্ছে?",
    },
    {
      en: "What crops are available in the marketplace?",
      bn: "মার্কেটপ্লেসে বিক্রির জন্য কী কী ফসল আছে?",
    },
    {
      en: "Where to sell 2 tonnes of chilli for maximum net return?",
      bn: "আমার ২ টন মরিচ কোথায় বিক্রি করলে পরিবহন খরচ বাদে বেশি লাভ হবে?",
    },
    {
      en: "What certificates are required to export to Dubai?",
      bn: "দুবাই বা ইউরোপে কৃষি পণ্য রপ্তানি করতে কী কী সনদ লাগে?",
    },
    {
      en: "How does the anti-snipe live auction rule work?",
      bn: "লাইভ নিলামে অ্যান্টি-স্নাইপ নিয়ম কীভাবে কাজ করে?",
    },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const isCalcQuery = /হিসাব|লাভ|খরচ|ক্যালকুলেট|ক্যালকুলেশন|মুনাফা|পরিবহন|ভাড়া|calculate|calculation|profit|cost|freight|return|arbitrage/i.test(textToSend);
    setIsCalculating(isCalcQuery);

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToSend,
          isLoggedIn: Boolean(currentUser),
          userRole: currentRole || currentUser?.role,
          userName: currentUser?.name,
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Clean any stray asterisks
        const cleanReply = (data.reply || "").replace(/\*\*/g, "");
        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          sender: "bot",
          text: cleanReply,
          citations: data.citations,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "bot",
          text: language === "bn"
            ? "দুঃখিত, সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
            : "Sorry, network error processing your query. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-earth-200 shadow-sm flex flex-col h-[560px] sm:h-[650px] md:h-[700px] max-h-[85vh] overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-agri-950 via-agri-900 to-agri-800 text-white p-3.5 sm:p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-agri-700/80 border border-agri-600 flex items-center justify-center text-harvest-300 shadow-xs shrink-0">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-base font-bold text-white truncate">
                {language === "bn" ? "KrishiSetu AI বাংলা কৃষি সহকারী" : "KrishiSetu AI Market Assistant"}
              </h3>
              <span className="hidden min-[420px]:inline px-2 py-0.5 rounded text-[10px] font-bold bg-agri-700 text-agri-100 border border-agri-600 shrink-0">
                Live Data Connected
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-agri-200 truncate">
              {language === "bn"
                ? "কৃষি বিপণন অধিদপ্তর (DAMBD), লাইভ নিলাম ও কারখানার চাহিদার সাথে সংযুক্ত"
                : "Real-time Grounded with DAM Market Feeds, Live Auctions & B2B Procurements"}
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: "msg_init",
                sender: "bot",
                text: language === "bn"
                  ? `${getTimeGreeting(false)} আমি KrishiSetu AI প্ল্যাটফর্ম সহকারী। আজকের লাইভ নিলাম, সরকারি পাইকারি বাজার দর, মার্কেটপ্লেসের ফসল, কারখানার চাহিদা বা রপ্তানি সম্পর্কিত যেকোনো প্রশ্ন করুন।`
                  : `${getTimeGreeting(true)} I am the KrishiSetu AI Platform Assistant. Ask me anything about live auctions, wholesale prices, crop lots, or export inquiries.`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ])
          }
          className="p-1.5 sm:p-2 text-agri-300 hover:text-white rounded-xl hover:bg-agri-700/50 transition shrink-0"
          title="Reset conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* User Tier Status Banner */}
      {!currentUser ? (
        <div className="bg-amber-50/90 px-3.5 sm:px-4 py-2 sm:py-2.5 border-b border-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-amber-900">
            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 font-bold text-[10px] uppercase shrink-0">
              {language === "bn" ? "বেসিক এআই মোড" : "Basic AI Mode"}
            </span>
            <span className="text-[11px] sm:text-xs">
              {language === "bn"
                ? "সাধারণ পরিদর্শক হিসেবে আপনি সাধারণ তথ্য পাচ্ছেন। ব্যক্তিগত খামার বিশ্লেষণ ও আনলিমিটেড প্রশ্নের জন্য লগইন করুন।"
                : "Public guest mode. Sign in to unlock verified farmer profit forecasting & full capabilities."}
            </span>
          </div>

          <Link
            href="/login?redirect=/assistant"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-agri-800 hover:bg-agri-900 text-white font-bold text-[11px] shadow-xs transition shrink-0"
          >
            <LogIn className="w-3 h-3 text-harvest-300" />
            <span>{language === "bn" ? "প্রো এআই আনলক করতে লগইন" : "Sign In to Unlock Pro AI"}</span>
          </Link>
        </div>
      ) : (
        <div className="bg-emerald-50/90 px-3.5 sm:px-4 py-2 border-b border-emerald-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-emerald-950 font-medium">
            <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold text-[10px] uppercase shrink-0">
              {language === "bn" ? "প্রো এআই সক্রিয়" : "Pro AI Active"}
            </span>
            <span className="font-bold text-earth-900 truncate">
              {currentUser.name}
            </span>
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
              {t.roles[currentRole || "farmer"] || currentRole}
            </span>
          </div>

          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === "bn" ? "ব্যক্তিগত প্ল্যাটফর্ম সংযোগ সক্রিয়" : "Full Platform Grounding Enabled"}</span>
          </span>
        </div>
      )}

      {/* Suggested Quick Prompts */}
      <div className="bg-earth-50 border-b border-earth-200 p-2.5 overflow-x-auto flex gap-2 shrink-0">
        {samplePrompts.map((p, idx) => {
          const promptLabel = language === "bn" ? p.bn : p.en;
          return (
            <button
              key={idx}
              onClick={() => handleSend(promptLabel)}
              className="px-3 py-1.5 rounded-full bg-white border border-earth-200 text-xs text-earth-700 hover:border-agri-600 hover:text-agri-800 transition whitespace-nowrap shadow-2xs font-medium"
            >
              <span className="text-agri-600 mr-1 font-bold">✦</span>
              {promptLabel}
            </button>
          );
        })}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-earth-50/30">
        {messages.map((msg) => {
          const isBot = msg.sender === "bot";
          const cleanText = (msg.text || "").replace(/\*\*/g, "");

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isBot ? "" : "flex-row-reverse"}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs ${isBot ? "bg-agri-700 text-white" : "bg-earth-800 text-white"
                  }`}
              >
                {isBot ? <Bot className="w-4 h-4 text-harvest-300" /> : <User className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed shadow-2xs ${isBot
                  ? "bg-white text-earth-900 border border-earth-200"
                  : "bg-agri-700 text-white font-medium"
                  }`}
              >
                <div className="whitespace-pre-wrap">{cleanText}</div>

                {/* Citations if available */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-earth-100 text-[10px] text-earth-500 space-y-1">
                    <div className="font-bold uppercase tracking-wider text-agri-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-agri-600" />
                      <span>{language === "bn" ? "যাচাইকৃত তথ্যের প্ল্যাটফর্ম সূত্র:" : "Verified Platform Data Citations:"}</span>
                    </div>
                    {msg.citations.map((cite, i) => (
                      <div key={i} className="text-earth-600 font-mono">
                        • {cite}
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[9px] mt-2 text-right font-mono ${isBot ? "text-earth-400" : "text-agri-200"
                    }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2.5 text-xs text-agri-900 bg-white p-3 rounded-2xl border border-agri-200 w-fit shadow-2xs">
            <Sparkles className="w-4 h-4 text-agri-600 animate-spin" />
            <span className="font-medium">
              {language === "bn" ? "এআই প্ল্যাটফর্ম ডাটাবেজ থেকে তথ্য অনুসন্ধান করছে..." : "AI searching platform database..."}
              {isCalculating
                ? (language === "bn" ? "লাভ ও পরিবহন খরচ হিসাব হচ্ছে..." : "Calculating net return & freight...")
                : (language === "bn" ? "অপেক্ষা করুন..." : "Please wait...")}
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-white border-t border-earth-200 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            language === "bn"
              ? "যেকোনো প্রশ্ন লিখুন... (যেমন: লাইভ নিলামে কী ফসল আছে? বা কাঁচা মরিচের দাম কত?)"
              : "Ask anything... (e.g. What live auctions are running? or What is today's chilli price?)"
          }
          className="flex-1 px-4 py-2.5 bg-earth-50 border border-earth-300 rounded-xl text-xs text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500 font-medium"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-5 py-2.5 bg-agri-700 hover:bg-agri-800 disabled:bg-earth-300 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{language === "bn" ? "পাঠান" : "Send"}</span>
        </button>
      </form>
    </div>
  );
}
