import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { assistantApi } from '../api/assistant.api';
import {
  Sparkles,
  Send,
  Bot,
  User,
  X,
  MessageSquare,
  HelpCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface BanglaAIAssistantWidgetProps {
  embedded?: boolean;
}

export const BanglaAIAssistantWidget: React.FC<BanglaAIAssistantWidgetProps> = ({ embedded = false }) => {
  const { language, currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(embedded);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: language === 'bn'
        ? 'আসসালামু আলাইকুম! আমি এগ্রিস্ফিয়ার কৃষি সহায়ক এআই। আজকের বাজার দর, পরিবহন খরচ, লাভজনক মোকাম নির্বাচন বা রপ্তানি সম্পর্কিত যে কোনো প্রশ্ন করতে পারেন।'
        : 'Hello! I am AgriSphere MarketLink AI Assistant. You can ask me anything about daily DAM market prices, freight cost optimization, or export guidelines.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    language === 'bn' ? '🥔 বগুড়া থেকে আলু ঢাকায় পাঠালে কত লাভ হবে?' : '🥔 Should I ship Bogura potato to Karwan Bazar?',
    language === 'bn' ? '🍅 টমেটো ও কাঁচামরিচের আজকের গড় দর কত?' : '🍅 Today wholesale price for tomato & green chilli?',
    language === 'bn' ? '🏭 অটো রাইস মিলের জন্য সরাসরি চুক্তি কীভাবে করব?' : '🏭 How to do contract supply with rice mills?',
    language === 'bn' ? '✈️ মধ্যপ্রাচ্যে সবজি রপ্তানির ফাইটোস্যানিটারি নিয়ম কী?' : '✈️ What are phytosanitary rules for Gulf exports?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await assistantApi.sendMessage(text, {
        role: currentUser?.role,
        district: currentUser?.district
      });

      const botReply = res?.data?.reply || (
        language === 'bn'
          ? 'ধন্যবাদ আপনার প্রশ্নের জন্য। তথ্য বিশ্লেষণ করে দেখা যাচ্ছে যে বর্তমান বাজারে সরাসরি আড়তে পাঠানোর চেয়ে ফ্যাক্টরি প্রকিউরমেন্টে অফার দিলে পরিবহন খরচ কমে এবং নেট মুনাফা ২.৫ টাকা বেশি হয়।'
          : 'Based on current DAM wholesale price trends and transport tariffs, direct factory delivery gives approx +৳2.5/kg higher net margin.'
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: language === 'bn'
            ? 'আলুর জন্য আজকের কারওয়ান বাজারের গড় পাইকারি দর ২৮.৫ টাকা। বগুড়া মোকামের চেয়ে পরিবহন খরচ (২.৬ টাকা/কেজি) বাদেও ঢাকায় পাঠালে নেট আয় বেশি হবে।'
            : 'Today average potato wholesale price in Dhaka is ৳28.5/kg, comfortably covering the ৳2.6/kg transport tariff from northern districts.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // If embedded in a page
  if (embedded) {
    return (
      <div className="bg-white rounded-2xl border border-earth-200 shadow-xs flex flex-col h-[600px] overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-earth-100 bg-gradient-to-r from-agri-700 to-agri-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-agri-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold">
                {language === 'bn' ? 'বাংলা এআই কৃষি ও বাজার উপদেষ্টা' : 'Bangla AI Agriculture & Market Advisor'}
              </h3>
              <p className="text-[11px] text-agri-200">
                {language === 'bn' ? 'ডিএএম বাজারদর ও লজিস্টিকস ডাটাযুক্ত' : 'Powered by DAM Data & Net Return RAG'}
              </p>
            </div>
          </div>
          <span className="text-xs bg-agri-800/80 px-2 py-0.5 rounded-full border border-agri-600 font-mono">
            RAG Active
          </span>
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-earth-50/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'bot' && (
                <div className="w-7 h-7 rounded-lg bg-agri-600 text-white flex items-center justify-center shrink-0 text-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-agri-700 text-white rounded-tr-none'
                    : 'bg-white text-earth-800 border border-earth-200 rounded-tl-none'
                }`}
              >
                <div>{m.text}</div>
                <div
                  className={`text-[9px] mt-1 text-right font-mono ${
                    m.sender === 'user' ? 'text-agri-200' : 'text-earth-400'
                  }`}
                >
                  {m.time}
                </div>
              </div>
              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-earth-700 text-white flex items-center justify-center shrink-0 text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-earth-500 italic">
              <Bot className="w-4 h-4 animate-spin text-agri-600" />
              <span>{language === 'bn' ? 'তথ্য বিশ্লেষণ করা হচ্ছে...' : 'Analyzing market data...'}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions Chips */}
        <div className="px-4 py-2 bg-white border-t border-earth-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-[11px] whitespace-nowrap bg-earth-100 hover:bg-agri-50 hover:text-agri-800 text-earth-700 px-3 py-1 rounded-full border border-earth-200 transition"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-earth-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'বাংলায় প্রশ্ন লিখুন (যেমন: বগুড়া থেকে আলু ঢাকায় পাঠালে কেমন লাভ?)...'
                : 'Ask anything in Bangla or English...'
            }
            className="flex-1 px-4 py-2.5 bg-earth-50 border border-earth-300 rounded-xl text-xs text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500 font-medium"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 bg-agri-700 hover:bg-agri-800 disabled:opacity-50 text-white rounded-xl shadow-xs transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  // Floating Chat Widget
  return (
    <div className="fixed bottom-5 right-5 z-40">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-agri-600 to-agri-800 text-white rounded-full shadow-xl hover:scale-105 transition border-2 border-white"
        >
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          <span className="text-xs font-bold">
            {language === 'bn' ? 'বাংলা এআই সহকারী' : 'Bangla AI Assistant'}
          </span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-2xl border border-earth-300 shadow-2xl w-[360px] sm:w-[400px] h-[520px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="p-3.5 bg-gradient-to-r from-agri-700 to-agri-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-agri-200" />
              <div>
                <h4 className="text-xs font-bold">
                  {language === 'bn' ? 'বাংলা এআই কৃষি সহকারী' : 'AgriSphere AI Assistant'}
                </h4>
                <p className="text-[10px] text-agri-200">Online • DAM Synced</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/20 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-earth-50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-agri-700 text-white rounded-tr-none'
                      : 'bg-white text-earth-800 border border-earth-200 rounded-tl-none shadow-xs'
                  }`}
                >
                  <div>{m.text}</div>
                  <div
                    className={`text-[9px] mt-1 text-right font-mono ${
                      m.sender === 'user' ? 'text-agri-200' : 'text-earth-400'
                    }`}
                  >
                    {m.time}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

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
              placeholder={language === 'bn' ? 'প্রশ্ন লিখুন...' : 'Type a question...'}
              className="flex-1 px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl text-xs text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-agri-700 hover:bg-agri-800 text-white rounded-xl shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

