import React, { useState } from 'react';
import { AuthProvider } from './src/hooks/useAuth';
import { MainLayout } from './src/templates/MainLayout';
import { AppRoutes } from './src/routes/AppRoutes';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');

  return (
    <AuthProvider>
      <MainLayout currentTab={currentTab} onSelectTab={setCurrentTab}>
        <AppRoutes currentTab={currentTab} onNavigate={setCurrentTab} />
      </MainLayout>
    </AuthProvider>
  );
};

export default App;

