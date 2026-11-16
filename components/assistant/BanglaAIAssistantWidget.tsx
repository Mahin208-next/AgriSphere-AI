"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Bot, Send, Sparkles, User, ShieldCheck, Clock, RefreshCw } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  citations?: string[];
  timestamp: string;
}

export default function BanglaAIAssistantWidget() {
  const { language, t } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_init",
      sender: "bot",
      text: language === "bn"
        ? "নমস্কার! আমি AgriSphere AI কৃষি বাজার সহকারী। আজকের বাজার দর, ফসল বিক্রয়ের সেরা মোকাম, মিল বা কারখানার চাহিদা এবং বিদেশে রপ্তানি সম্পর্কিত যেকোনো প্রশ্ন করুন।"
        : "Hello! I am AgriSphere AI Market Assistant. Ask me about current crop prices, optimal selling markets, agro-mill procurements, or agricultural export compliance.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    {
      en: "What is today's wholesale price of Green Chilli?",
      bn: "আজকে কাঁচা মরিচের পাইকারি দাম কত?",
    },
    {
      en: "Where to sell 2 tonnes of potatoes for maximum net return?",
      bn: "আমার ২ টন আলু কোথায় বিক্রি করলে বেশি লাভ হবে?",
    },
    {
      en: "Are there any factories looking to buy tomatoes?",
      bn: "কোন factory টমেটো কিনতে চাচ্ছে?",
    },
    {
      en: "What certifications are required to export mangoes to the UAE?",
      bn: "বিদেশে আম রপ্তানি করতে কী কী কাগজপত্র প্রয়োজন?",
    },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

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
        body: JSON.stringify({ query: textToSend }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          sender: "bot",
          text: data.reply,
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
    <div className="bg-white rounded-2xl border border-earth-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-agri-900 to-agri-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-agri-700/80 border border-agri-600 flex items-center justify-center text-harvest-300">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">
                {language === "bn" ? "AgriSphere বাংলা এআই কৃষি সহকারী" : "Bangla AI Market Assistant"}
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-agri-700 text-agri-200">
                RAG Active
              </span>
            </div>
            <p className="text-[11px] text-agri-300">
              {language === "bn" ? "কৃষি বিপণন অধিদপ্তর ও লাইভ বাজার তথ্যের সাথে সরাসরি সংযুক্ত" : "Grounded with DAM BD Market Records & Live Listings"}
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
                  ? "নমস্কার! আমি AgriSphere AI কৃষি বাজার সহকারী। আজকের বাজার দর, ফসল বিক্রয়ের সেরা মোকাম, মিল বা কারখানার চাহিদা এবং বিদেশে রপ্তানি সম্পর্কিত যেকোনো প্রশ্ন করুন।"
                  : "Hello! I am AgriSphere AI Market Assistant. Ask me about current crop prices, optimal selling markets, agro-mill procurements, or agricultural export compliance.",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ])
          }
          className="p-1.5 text-agri-300 hover:text-white rounded-lg hover:bg-agri-700/50 transition"
          title="Reset chat"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="bg-earth-50 border-b border-earth-200 p-2.5 overflow-x-auto flex gap-2 shrink-0">
        {samplePrompts.map((p, idx) => {
          const promptLabel = language === "bn" ? p.bn : p.en;
          return (
            <button
              key={idx}
              onClick={() => handleSend(promptLabel)}
              className="px-3 py-1.5 rounded-full bg-white border border-earth-200 text-xs text-earth-700 hover:border-agri-500 hover:text-agri-800 transition whitespace-nowrap shadow-2xs font-medium"
            >
              <span className="text-agri-600 mr-1">✦</span>
              {promptLabel}
            </button>
          );
        })}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-earth-50/40">
        {messages.map((msg) => {
          const isBot = msg.sender === "bot";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isBot ? "" : "flex-row-reverse"}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isBot ? "bg-agri-700 text-white" : "bg-earth-800 text-white"
                }`}
              >
                {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-2xs ${
                  isBot
                    ? "bg-white text-earth-900 border border-earth-200"
                    : "bg-agri-700 text-white font-medium"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Citations if available */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-earth-100 text-[10px] text-earth-500 space-y-1">
                    <div className="font-bold uppercase tracking-wider text-agri-800 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-agri-600" />
                      <span>{language === "bn" ? "যাচাইকৃত তথ্যের সূত্র:" : "Verified Source Citations:"}</span>
                    </div>
                    {msg.citations.map((cite, i) => (
                      <div key={i} className="text-earth-600">
                        • {cite}
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[9px] mt-1.5 text-right font-mono ${
                    isBot ? "text-earth-400" : "text-agri-200"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-agri-800 bg-white p-3 rounded-2xl border border-agri-200 w-fit">
            <Sparkles className="w-4 h-4 text-agri-600 animate-spin" />
            <span>{language === "bn" ? "এআই তথ্য বিশ্লেষণ করছে..." : "AI analyzing market intelligence..."}</span>
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
              ? "বাংলা, ইংরেজি বা বাংলিশে প্রশ্ন লিখুন... (যেমন: কাঁচা মরিচের দাম কত?)"
              : "Ask anything in Bangla, English, or Banglish..."
          }
          className="flex-1 px-4 py-2.5 bg-earth-50 border border-earth-300 rounded-xl text-xs text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500 font-medium"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-4 py-2.5 bg-agri-700 hover:bg-agri-800 disabled:bg-earth-300 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.common.submit}</span>
        </button>
      </form>
    </div>
  );
}

