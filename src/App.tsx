// Fuel Sentinel - Neo-Brutalist Automotive PWA Main Application

import React, { useState, useEffect } from 'react';
import { TelemetryProvider } from './context/TelemetryContext';
import { Navigation, type ScreenId } from './components/Navigation';
import { PwaPrompt } from './components/PwaPrompt';
import { pwaManager } from './utils/pwa';

// Screen Components
import { DashboardScreen } from './screens/DashboardScreen';
import { FuelScreen } from './screens/FuelScreen';
import { LocationScreen } from './screens/LocationScreen';
import { AlertsScreen } from './screens/AlertsScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { DiagnosticsScreen } from './screens/DiagnosticsScreen';
import { VehicleSetupScreen } from './screens/VehicleSetupScreen';
import { AuthSettingsScreen } from './screens/AuthSettingsScreen';

const MainCockpit: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('dashboard');
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [canInstall, setCanInstall] = useState(() => pwaManager.canInstall() || pwaManager.isIosDevice());

  // Monitor PWA install availability
  useEffect(() => {
    pwaManager.registerServiceWorker();
    const unsub = pwaManager.subscribe(() => {
      setCanInstall(pwaManager.canInstall() || pwaManager.isIosDevice());
    });
    return unsub;
  }, []);

  // Sync with URL Hash for PWA shortcuts and direct bookmarking
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as ScreenId;
      if (
        [
          'dashboard',
          'fuel',
          'location',
          'alerts',
          'history',
          'diagnostics',
          'setup',
          'firebase'
        ].includes(hash)
      ) {
        setActiveScreen(hash);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleSelectScreen = (screen: ScreenId) => {
    setActiveScreen(screen);
    window.location.hash = screen;
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="mobile-app-shell">
      {/* 1. Top Header & Section Navigation */}
      <Navigation
        activeScreen={activeScreen}
        onSelectScreen={handleSelectScreen}
        onOpenInstallPrompt={() => setInstallModalOpen(true)}
        canInstall={canInstall}
      />

      {/* 2. Screen Body */}
      <main style={{ flex: 1, paddingBottom: '16px' }}>
        <div key={activeScreen} className="screen-transition">
          {activeScreen === 'dashboard' && <DashboardScreen onNavigate={handleSelectScreen} />}
          {activeScreen === 'fuel' && <FuelScreen />}
          {activeScreen === 'location' && <LocationScreen />}
          {activeScreen === 'alerts' && <AlertsScreen />}
          {activeScreen === 'history' && <HistoryScreen />}
          {activeScreen === 'diagnostics' && <DiagnosticsScreen />}
          {activeScreen === 'setup' && <VehicleSetupScreen />}
          {activeScreen === 'firebase' && <AuthSettingsScreen />}
        </div>
      </main>

      {/* PWA Install Instructions Modal */}
      <PwaPrompt isOpen={installModalOpen} onClose={() => setInstallModalOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <TelemetryProvider>
      <MainCockpit />
    </TelemetryProvider>
  );
}

export default App;
