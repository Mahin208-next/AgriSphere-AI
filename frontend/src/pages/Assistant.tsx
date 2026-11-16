import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { BanglaAIAssistantWidget } from '../components/BanglaAIAssistantWidget';
import { Sparkles, Bot, ShieldCheck, HelpCircle } from 'lucide-react';

export const Assistant: React.FC = () => {
  const { language } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-agri-100 text-agri-800 text-xs font-bold border border-agri-200">
          <Sparkles className="w-3.5 h-3.5 text-agri-600" />
          <span>{language === 'bn' ? 'কৃত্রিম বুদ্ধিমত্তা চালিত কৃষি পরামর্শক' : 'AI-Powered Agricultural Advisor'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-earth-900 tracking-tight">
          {language === 'bn' ? 'বাংলা এআই কৃষি ও বাজার উপদেষ্টা' : 'Bangla AI Agriculture & Market Advisor'}
        </h2>
        <p className="text-xs sm:text-sm text-earth-500 max-w-xl mx-auto">
          {language === 'bn'
            ? 'ডিএএম বাজারদর, পরিবহন খরচ ও লাভজনক মোকাম বিশ্লেষণ করতে সরাসরি বাংলায় কথা বলুন বা প্রশ্ন করুন।'
            : 'Ask questions in natural Bangla or English regarding DAM daily prices, transport costs, and optimal selling strategies.'}
        </p>
      </div>

      <BanglaAIAssistantWidget embedded={true} />
    </div>
  );
};

