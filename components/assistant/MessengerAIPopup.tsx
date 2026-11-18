"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  Bot,
  Send,
  Sparkles,
  User,
  ShieldCheck,
  X,
  Minus,
  RefreshCw,
  MessageSquare,
  Calculator,
  ChevronRight,
  LogIn
} from "lucide-react";

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

export default function MessengerAIPopup() {
  const { currentUser, currentRole, language, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_init",
      sender: "bot",
      text: language === "bn"
        ? `${getTimeGreeting(false)} আমি KrishiSetu AI প্ল্যাটফর্ম সহকারী।\n\nআপনি যেকোনো ফসল, পরিমাণ ও জেলার নাম লিখলে আমি পরিবহন খরচ বাদে সেরা মোকামের নিট লাভ হিসাব করে দেব। এছাড়াও লাইভ নিলাম ও বাজার দর সম্পর্কে যেকোনো প্রশ্ন করতে পারেন।`
        : `${getTimeGreeting(true)} I am KrishiSetu AI Platform Assistant.\n\nTell me your crop volume and location, and I will calculate your net take-home profit across top markets after transport and fees.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [teaserIndex, setTeaserIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const teaserMessages = [
    {
      bn: "এআই নিট লাভ ক্যালকুলেটর",
      en: "AI Net-Return Calculator",
      prompt: "আমার ফসলের নিট লাভ হিসাব করে দাও",
    },
    {
      bn: "আজকের পাইকারি বাজার দর জানুন",
      en: "Check Today's Wholesale Prices",
      prompt: "আজকের সরকারি পাইকারি বাজার দর কত?",
    },
    {
      bn: "লাইভ নিলামে কী ফসল আছে?",
      en: "Explore Active Live Auctions",
      prompt: "লাইভ নিলামে কী ফসল আছে?",
    },
    {
      bn: "পরিবহন খরচ ও সেরা মোকাম যাচাই",
      en: "Calculate Freight & Top Market",
      prompt: "পরিবহন খরচ ও সেরা মোকামের লাভ হিসাব করে দাও",
    },
  ];

  const quickCalcChips = [
    { bn: "আমার ২ টন কাঁচা মরিচের লাভ কত?", en: "Calculate profit for 2 tonnes of chilli" },
    { bn: "১ টন আলুর লাভ হিসাব করে দাও", en: "Where to sell 1 ton potatoes for best net profit?" },
    { bn: "৫০০ কেজি টমেটোর পরিবহন খরচ কত?", en: "Transport cost for 500 kg tomatoes" },
    { bn: "লাইভ নিলামে কী ফসল আছে?", en: "What live auctions are active now?" },
  ];

  // Auto popup 1 message, then hide, and 10 minutes later popup another one
  useEffect(() => {
    if (isOpen) {
      setShowTeaser(false);
      return;
    }

    let isMounted = true;
    let hideTimer: any = null;
    let nextPopupTimer: any = null;
    const TEN_MINUTES_MS = 10 * 60 * 1000; // 10 minutes

    const runCycle = () => {
      // Pop up teaser
      if (isMounted) setShowTeaser(true);

      // Keep it visible for 7 seconds so the user can read/click it, then hide
      hideTimer = setTimeout(() => {
        if (isMounted) {
          setShowTeaser(false);

          // 10 minutes later, pop up another one
          nextPopupTimer = setTimeout(() => {
            if (isMounted) {
              setTeaserIndex((prev) => (prev + 1) % teaserMessages.length);
              runCycle();
            }
          }, TEN_MINUTES_MS);
        }
      }, 7000);
    };

    // Initial appearance after 2.5 seconds
    const initialTimer = setTimeout(() => {
      runCycle();
    }, 2500);

    return () => {
      isMounted = false;
      clearTimeout(initialTimer);
      if (hideTimer) clearTimeout(hideTimer);
      if (nextPopupTimer) clearTimeout(nextPopupTimer);
    };
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isOpen]);

  // Listen to external custom event to open chat (e.g. from page buttons)
  useEffect(() => {
    const handleOpenChat = (e: any) => {
      setIsOpen(true);
      if (e.detail?.prompt) {
        handleSend(e.detail.prompt);
      }
    };
    window.addEventListener("open-ai-chat", handleOpenChat);
    return () => window.removeEventListener("open-ai-chat", handleOpenChat);
  }, []);

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
            ? "দুঃখিত, সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।"
            : "Sorry, network error processing your query. Please retry.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-50 select-none">
      {/* Expanded Messenger Modal */}
      {isOpen ? (
        <div className="bg-white rounded-3xl border border-earth-300 shadow-2xl w-[calc(100vw-24px)] sm:w-[410px] max-w-[420px] h-[560px] sm:h-[580px] max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Messenger Header */}
          <div className="bg-gradient-to-r from-agri-950 via-agri-900 to-agri-800 text-white p-3 sm:p-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-agri-700/80 border border-agri-600 flex items-center justify-center text-harvest-300">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-agri-950" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                    {language === "bn" ? "কৃষিসেতু এআই সহকারী" : "KrishiSetu AI Assistant"}
                  </h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-700/80 text-emerald-200 shrink-0">
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-agri-300 truncate">
                  {language === "bn" ? "নিট লাভ ক্যালকুলেটর ও লাইভ বাজার তথ্য" : "Net Profit & Live Market Intelligence"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setMessages([
                    {
                      id: "msg_init",
                      sender: "bot",
                      text: language === "bn"
                        ? `${getTimeGreeting(false)} আমি KrishiSetu AI সহকারী। আপনার ফসল ও পরিমাণ লিখুন, আমি সেরা মোকামের লাভ হিসাব করে দেব।`
                        : `${getTimeGreeting(true)} I am KrishiSetu AI Assistant. Tell me your crop volume to calculate profit.`,
                      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    },
                  ])
                }
                className="p-1 sm:p-1.5 text-agri-300 hover:text-white rounded-lg hover:bg-agri-700/50 transition"
                title="Reset conversation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 sm:p-1.5 text-agri-300 hover:text-white rounded-lg hover:bg-agri-700/50 transition"
                title="Minimize"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 sm:p-1.5 text-agri-300 hover:text-white rounded-lg hover:bg-agri-700/50 transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Calc Prompt Chips */}
          <div className="bg-earth-50 border-b border-earth-200 px-3 py-2 overflow-x-auto flex gap-1.5 shrink-0">
            {quickCalcChips.map((chip, idx) => {
              const label = language === "bn" ? chip.bn : chip.en;
              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSend(label)}
                  className="px-2.5 py-1 rounded-full bg-white border border-earth-200 text-[11px] text-earth-700 hover:border-agri-600 hover:text-agri-800 transition whitespace-nowrap shadow-2xs font-medium flex items-center gap-1"
                >
                  <Calculator className="w-3 h-3 text-agri-600" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#fdfdfb]">
            {messages.map((msg) => {
              const isBot = msg.sender === "bot";
              const cleanText = (msg.text || "").replace(/\*\*/g, "");

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isBot ? "" : "flex-row-reverse"}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs ${isBot ? "bg-agri-700 text-white" : "bg-earth-800 text-white"
                      }`}
                  >
                    {isBot ? <Bot className="w-3.5 h-3.5 text-harvest-300" /> : <User className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[84%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${isBot
                        ? "bg-white text-earth-900 border border-earth-200"
                        : "bg-agri-700 text-white font-medium"
                      }`}
                  >
                    <div className="whitespace-pre-wrap">{cleanText}</div>

                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-earth-100 text-[9px] text-earth-500">
                        <span className="font-bold text-agri-800">
                          {language === "bn" ? "সূত্র: " : "Source: "}
                        </span>
                        <span>{msg.citations.join(" • ")}</span>
                      </div>
                    )}

                    <div
                      className={`text-[8px] mt-1.5 text-right font-mono ${isBot ? "text-earth-400" : "text-agri-200"
                        }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-agri-900 bg-white p-2.5 rounded-2xl border border-agri-200 w-fit shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-agri-600 animate-spin" />
                <span className="text-[11px] font-medium">
                  {isCalculating
                    ? (language === "bn" ? "লাভ ও পরিবহন খরচ হিসাব হচ্ছে..." : "Calculating net return & freight...")
                    : (language === "bn" ? "অপেক্ষা করুন..." : "Please wait...")}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Messenger Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white border-t border-earth-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                language === "bn"
                  ? "লিখুন... যেমন: ২ টন আলু বগুড়া থেকে লাভ কত?"
                  : "Ask anything... e.g. Profit for 2 ton potatoes"
              }
              className="flex-1 px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl text-xs text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-600 font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 bg-agri-700 hover:bg-agri-800 disabled:bg-earth-300 text-white rounded-xl text-xs font-bold transition shadow-sm"
              title="Send"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        /* Floating Launcher Bubble */
        <div className="flex items-center gap-2">
          {/* Speech Teaser Tooltip that pops up, hides, and repeats another one 10 min later */}
          <div
            className={`transition-all duration-500 ease-in-out transform origin-right ${
              showTeaser
                ? "opacity-100 translate-x-0 scale-100 pointer-events-auto"
                : "opacity-0 translate-x-4 scale-95 pointer-events-none"
            }`}
          >
            {(() => {
              const currentTeaser = teaserMessages[teaserIndex] || teaserMessages[0];
              return (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(true);
                    if (currentTeaser.prompt) {
                      handleSend(currentTeaser.prompt);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white border border-earth-200 text-xs font-bold text-earth-800 shadow-xl hover:border-agri-600 hover:shadow-2xl transition-all cursor-pointer whitespace-nowrap"
                >
                  <Calculator className="w-3.5 h-3.5 text-agri-600 shrink-0" />
                  <span>{language === "bn" ? currentTeaser.bn : currentTeaser.en}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-earth-400 shrink-0" />
                </button>
              );
            })()}
          </div>

          {/* Messenger Circle Button */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-agri-900 to-agri-700 hover:from-agri-800 hover:to-agri-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center cursor-pointer border-2 border-white/20"
            title="Open KrishiSetu AI Assistant"
          >
            <div className="relative">
              <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-harvest-300" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400 border-2 border-agri-950 animate-pulse" />
            </div>
            {/* Ping effect */}
            <span className="absolute inset-0 rounded-full bg-agri-400 opacity-20 animate-ping pointer-events-none" />
          </button>
        </div>
      )}
    </div>
  );
}
