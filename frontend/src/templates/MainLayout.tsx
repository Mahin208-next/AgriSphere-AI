import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BanglaAIAssistantWidget } from '../components/BanglaAIAssistantWidget';

interface MainLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ currentTab, onSelectTab, children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbf9] text-earth-900 selection:bg-agri-200 selection:text-agri-950 font-sans">
      <Header currentTab={currentTab} onSelectTab={onSelectTab} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
      {/* Floating Bangla AI Assistant on all pages except the dedicated assistant page */}
      {currentTab !== 'assistant' && <BanglaAIAssistantWidget />}
      <Footer />
    </div>
  );
};

