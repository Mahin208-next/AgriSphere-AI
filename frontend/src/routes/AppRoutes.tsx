import React from 'react';
import { Home } from '../pages/Home';
import { Auctions } from '../pages/Auctions';
import { Procurement } from '../pages/Procurement';
import { MarketIntelligence } from '../pages/MarketIntelligence';
import { Assistant } from '../pages/Assistant';
import { ExportRadar } from '../pages/ExportRadar';
import { Dashboard } from '../pages/Dashboard';

interface AppRoutesProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({ currentTab, onNavigate }) => {
  switch (currentTab) {
    case 'home':
      return <Home onNavigate={onNavigate} />;
    case 'auctions':
      return <Auctions />;
    case 'procurement':
      return <Procurement />;
    case 'intelligence':
      return <MarketIntelligence />;
    case 'assistant':
      return <Assistant />;
    case 'export':
      return <ExportRadar />;
    case 'dashboard':
      return <Dashboard />;
    default:
      return <Home onNavigate={onNavigate} />;
  }
};

