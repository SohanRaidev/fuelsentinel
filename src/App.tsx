// Divine Fuel - Modern Automotive PWA Main Application

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
import { ProfileScreen } from './screens/ProfileScreen';
import { AuthScreen } from './screens/AuthScreen';
import { MoreHubScreen } from './screens/MoreHubScreen';
import { TheftAlarmModal } from './components/TheftAlarmModal';

interface MainCockpitProps {
  onLogout: () => void;
}

const MainCockpit: React.FC<MainCockpitProps> = ({ onLogout }) => {
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

  // Prompt the user to install the app on initial website visit (unless already in standalone PWA mode)
  useEffect(() => {
    const isStandalone = typeof window !== 'undefined' && (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
    const wasDismissed = sessionStorage.getItem('divine_fuel_install_dismissed') === 'true';

    if (!isStandalone && !wasDismissed) {
      const promptTimer = setTimeout(() => {
        setInstallModalOpen(true);
      }, 700);
      return () => clearTimeout(promptTimer);
    }
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
          'firebase',
          'profile',
          'more'
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
          {activeScreen === 'more' && (
            <MoreHubScreen
              onNavigate={handleSelectScreen}
              onOpenInstallPrompt={() => setInstallModalOpen(true)}
            />
          )}
          {activeScreen === 'profile' && (
            <ProfileScreen
              onOpenInstallPrompt={() => setInstallModalOpen(true)}
              onLogout={onLogout}
            />
          )}
        </div>
      </main>

      {/* High-Priority Theft Alarm Pop-up Modal */}
      <TheftAlarmModal />

      {/* PWA Install Instructions Modal */}
      <PwaPrompt isOpen={installModalOpen} onClose={() => setInstallModalOpen(false)} />
    </div>
  );
};

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('divine_fuel_authenticated') === 'true';
  });

  const handleLoginSuccess = () => {
    localStorage.setItem('divine_fuel_authenticated', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('divine_fuel_authenticated');
    setIsAuthenticated(false);
  };

  return (
    <TelemetryProvider>
      {!isAuthenticated ? (
        <AuthScreen onLogin={handleLoginSuccess} />
      ) : (
        <MainCockpit onLogout={handleLogout} />
      )}
    </TelemetryProvider>
  );
}

export default App;
