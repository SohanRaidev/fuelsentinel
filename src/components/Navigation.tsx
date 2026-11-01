// Navigation Header and iOS Bottom Dock
// Pixel-Perfect Implementation Matching User Mockup:
// - Top Header: Green Shield Brand Logo + "Fuel Sentinel" + Bell with '2' Badge + Profile Avatar
// - Bottom Dock: Dashboard, Vehicles, Location, Alerts, More

import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import {
  ShieldFuelBrandIcon,
  NotificationBellIcon,
  UserAvatarIcon,
  HomeNavIcon,
  CarChassisIcon,
  MapPinCrosshairIcon,
  MenuHamburgerIcon,
  FuelPumpIcon,
  DiagnosticsChipIcon,
  HistoryLogIcon,
  SettingsIcon,
  VolumeHighIcon,
  VolumeMuteIcon,
  CloseIcon
} from './Icons';

export type ScreenId =
  | 'dashboard'
  | 'fuel'
  | 'location'
  | 'alerts'
  | 'history'
  | 'diagnostics'
  | 'setup'
  | 'firebase';

interface NavigationProps {
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  onOpenInstallPrompt: () => void;
  canInstall: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeScreen,
  onSelectScreen,
  onOpenInstallPrompt,
  canInstall
}) => {
  const {
    alerts,
    isAudioMuted,
    toggleAudioMute
  } = useTelemetry();

  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const unacknowledgedAlertsCount = alerts.filter(
    (a) => a.status === 'ACTIVE_UNACKNOWLEDGED' && a.severity === 'CRITICAL'
  ).length;

  const handleSelect = (id: ScreenId) => {
    onSelectScreen(id);
    setMoreMenuOpen(false);
  };

  return (
    <>
      {/* 1. DESKTOP TOP HEADER (Visible on screen width >= 768px) */}
      <header className="desktop-nav-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="brand-group" onClick={() => onSelectScreen('dashboard')} style={{ cursor: 'pointer' }}>
            <ShieldFuelBrandIcon size={36} />
            <div>
              <span className="brand-title" style={{ fontSize: '18px' }}>Fuel Sentinel</span>
              <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>Fleet Telemetry &amp; Security</div>
            </div>
          </div>

          <div className="desktop-conn-badge">
            <span className="pulsing-dot" style={{ backgroundColor: '#16A34A' }} />
            <span>ESP32 LINK ACTIVE</span>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="desktop-nav-links">
          <button
            className={`desktop-tab-btn ${activeScreen === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectScreen('dashboard')}
          >
            <HomeNavIcon size={18} color={activeScreen === 'dashboard' ? '#15803D' : '#6B7280'} />
            <span>Dashboard</span>
          </button>

          <button
            className={`desktop-tab-btn ${activeScreen === 'location' ? 'active' : ''}`}
            onClick={() => onSelectScreen('location')}
          >
            <MapPinCrosshairIcon size={18} color={activeScreen === 'location' ? '#15803D' : '#6B7280'} />
            <span>Routes &amp; GPS</span>
          </button>

          <button
            className={`desktop-tab-btn ${activeScreen === 'fuel' ? 'active' : ''}`}
            onClick={() => onSelectScreen('fuel')}
          >
            <FuelPumpIcon size={18} color={activeScreen === 'fuel' ? '#15803D' : '#6B7280'} />
            <span>Fuel Audit</span>
          </button>

          <button
            className={`desktop-tab-btn ${activeScreen === 'alerts' ? 'active' : ''}`}
            onClick={() => onSelectScreen('alerts')}
          >
            <span style={{ position: 'relative', display: 'flex' }}>
              <ShieldFuelBrandIcon size={18} />
              {unacknowledgedAlertsCount > 0 && (
                <span className="desktop-badge-dot" />
              )}
            </span>
            <span>Relays &amp; Alerts</span>
          </button>

          <button
            className={`desktop-tab-btn ${activeScreen === 'setup' ? 'active' : ''}`}
            onClick={() => onSelectScreen('setup')}
          >
            <CarChassisIcon size={18} color={activeScreen === 'setup' ? '#15803D' : '#6B7280'} />
            <span>Vehicles</span>
          </button>

          <button
            className={`desktop-tab-btn ${activeScreen === 'diagnostics' ? 'active' : ''}`}
            onClick={() => onSelectScreen('diagnostics')}
          >
            <DiagnosticsChipIcon size={18} color={activeScreen === 'diagnostics' ? '#15803D' : '#6B7280'} />
            <span>Diagnostics</span>
          </button>

          <button
            className={`desktop-tab-btn ${activeScreen === 'history' ? 'active' : ''}`}
            onClick={() => onSelectScreen('history')}
          >
            <HistoryLogIcon size={18} color={activeScreen === 'history' ? '#15803D' : '#6B7280'} />
            <span>History</span>
          </button>

          <button
            className={`desktop-tab-btn ${activeScreen === 'firebase' ? 'active' : ''}`}
            onClick={() => onSelectScreen('firebase')}
          >
            <SettingsIcon size={18} color={activeScreen === 'firebase' ? '#15803D' : '#6B7280'} />
            <span>Settings</span>
          </button>
        </nav>

        {/* Right Action Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={toggleAudioMute}
            className="header-icon-btn"
            title={isAudioMuted ? 'Unmute Siren Alarm' : 'Mute Siren Alarm'}
          >
            {isAudioMuted ? <VolumeMuteIcon size={20} color="#DC2626" /> : <VolumeHighIcon size={20} color="#15803D" />}
          </button>

          <button
            onClick={() => onSelectScreen('alerts')}
            className="header-icon-btn"
            title="Security Alerts"
          >
            <NotificationBellIcon
              size={22}
              color="#111827"
              badge={unacknowledgedAlertsCount > 0 ? unacknowledgedAlertsCount : 2}
            />
          </button>

          <button
            onClick={() => onSelectScreen('firebase')}
            className="header-icon-btn"
            title="Settings & Hardware Link"
          >
            <UserAvatarIcon size={34} />
          </button>
        </div>
      </header>

      {/* 2. MOBILE TOP HEADER (Visible on screen width < 768px) */}
      <header className="mobile-header">
        <div className="brand-group" onClick={() => onSelectScreen('dashboard')}>
          <ShieldFuelBrandIcon size={34} />
          <span className="brand-title">Fuel Sentinel</span>
        </div>

        <div className="header-actions">
          {/* Notification Bell with red badge '2' */}
          <button
            onClick={() => onSelectScreen('alerts')}
            className="header-icon-btn"
            title="Security Alerts"
          >
            <NotificationBellIcon
              size={22}
              color="#111827"
              badge={unacknowledgedAlertsCount > 0 ? unacknowledgedAlertsCount : 2}
            />
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={() => onSelectScreen('firebase')}
            className="header-icon-btn"
            title="Settings & Hardware Link"
          >
            <UserAvatarIcon size={32} />
          </button>
        </div>
      </header>

      {/* FIXED BOTTOM NAVIGATION DOCK (5 TABS MATCHING MOCKUP) */}
      <nav className="ios-bottom-nav">
        {/* 1. Dashboard */}
        <button
          className={`nav-tab-item ${activeScreen === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleSelect('dashboard')}
        >
          <HomeNavIcon
            size={22}
            color={activeScreen === 'dashboard' ? '#15803D' : '#9CA3AF'}
          />
          <span>Dashboard</span>
        </button>

        {/* 2. Vehicles */}
        <button
          className={`nav-tab-item ${activeScreen === 'setup' ? 'active' : ''}`}
          onClick={() => handleSelect('setup')}
        >
          <CarChassisIcon
            size={22}
            color={activeScreen === 'setup' ? '#15803D' : '#9CA3AF'}
          />
          <span>Vehicles</span>
        </button>

        {/* 3. Location */}
        <button
          className={`nav-tab-item ${activeScreen === 'location' ? 'active' : ''}`}
          onClick={() => handleSelect('location')}
        >
          <MapPinCrosshairIcon
            size={22}
            color={activeScreen === 'location' ? '#15803D' : '#9CA3AF'}
          />
          <span>Location</span>
        </button>

        {/* 4. Alerts */}
        <button
          className={`nav-tab-item ${activeScreen === 'alerts' ? 'active' : ''}`}
          onClick={() => handleSelect('alerts')}
        >
          <NotificationBellIcon
            size={22}
            color={activeScreen === 'alerts' ? '#15803D' : '#9CA3AF'}
            badge={unacknowledgedAlertsCount > 0 ? unacknowledgedAlertsCount : 2}
          />
          <span>Alerts</span>
        </button>

        {/* 5. More */}
        <button
          className={`nav-tab-item ${['fuel', 'diagnostics', 'firebase', 'history'].includes(activeScreen) ? 'active' : ''}`}
          onClick={() => setMoreMenuOpen(true)}
        >
          <MenuHamburgerIcon
            size={22}
            color={['fuel', 'diagnostics', 'firebase', 'history'].includes(activeScreen) ? '#15803D' : '#9CA3AF'}
          />
          <span>More</span>
        </button>
      </nav>

      {/* MORE SCREEN DRAWER / MODAL */}
      {moreMenuOpen && (
        <div className="brutal-modal-backdrop" onClick={() => setMoreMenuOpen(false)}>
          <div
            className="ios-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '420px',
              width: '92%',
              margin: 'auto',
              borderRadius: '20px',
              padding: '18px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '17px', fontWeight: 700, color: '#111827' }}>
                Additional Tools &amp; Settings
              </span>
              <button
                onClick={() => setMoreMenuOpen(false)}
                className="header-icon-btn"
                style={{ padding: '4px' }}
              >
                <CloseIcon size={16} color="#6B7280" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => handleSelect('fuel')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FuelPumpIcon size={20} color="#15803D" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>Fuel Analytics &amp; Calibration</div>
                  <div style={{ fontSize: '11.5px', color: '#6B7280' }}>5-point resistance calibration &amp; dL/dt chart</div>
                </div>
              </button>

              <button
                onClick={() => handleSelect('diagnostics')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DiagnosticsChipIcon size={20} color="#2563EB" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>Hardware Link &amp; Sensor Pins</div>
                  <div style={{ fontSize: '11.5px', color: '#6B7280' }}>ESP32 GPIO 34, 25, 26, 22, 23 telemetry</div>
                </div>
              </button>

              <button
                onClick={() => handleSelect('history')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HistoryLogIcon size={20} color="#374151" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>Security Event Logs</div>
                  <div style={{ fontSize: '11.5px', color: '#6B7280' }}>Audit trail of fuel drops &amp; ignition events</div>
                </div>
              </button>

              <button
                onClick={() => handleSelect('firebase')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SettingsIcon size={20} color="#D97706" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>Device Credentials &amp; Cloud Bridge</div>
                  <div style={{ fontSize: '11.5px', color: '#6B7280' }}>Auth tokens, template IDs &amp; Firebase setup</div>
                </div>
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                <button
                  onClick={toggleAudioMute}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#F9FAFB',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#374151'
                  }}
                >
                  {isAudioMuted ? <VolumeMuteIcon size={16} /> : <VolumeHighIcon size={16} />}
                  <span>{isAudioMuted ? 'UNMUTE ALARM' : 'MUTE ALARM'}</span>
                </button>

                {canInstall && (
                  <button
                    onClick={() => {
                      setMoreMenuOpen(false);
                      onOpenInstallPrompt();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px',
                      borderRadius: '10px',
                      border: '1px solid #16A34A',
                      backgroundColor: '#F0FDF4',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#15803D'
                    }}
                  >
                    INSTALL APP (PWA)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
