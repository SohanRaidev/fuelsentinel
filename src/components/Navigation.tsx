// Navigation Header and iOS Bottom Dock
// Pixel-Perfect Implementation Matching User Mockup:
// - Top Header: Green Shield Brand Logo + "Divine Fuel" + Bell with '2' Badge + Profile Avatar
// - Bottom Dock: Dashboard, Vehicles, Location, Alerts, More

import React from 'react';
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
  VolumeMuteIcon
} from './Icons';

export type ScreenId =
  | 'dashboard'
  | 'fuel'
  | 'location'
  | 'alerts'
  | 'history'
  | 'diagnostics'
  | 'setup'
  | 'firebase'
  | 'profile'
  | 'more';

interface NavigationProps {
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  onOpenInstallPrompt: () => void;
  canInstall: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeScreen,
  onSelectScreen
}) => {
  const {
    alerts,
    isAudioMuted,
    toggleAudioMute,
    isHardwareOnline
  } = useTelemetry();

  const unacknowledgedAlertsCount = alerts.filter(
    (a) => a.status === 'ACTIVE_UNACKNOWLEDGED' && a.severity === 'CRITICAL'
  ).length;

  const handleSelect = (id: ScreenId) => {
    onSelectScreen(id);
  };

  return (
    <>
      {/* 1. DESKTOP TOP HEADER (Visible on screen width >= 768px) */}
      <header className="desktop-nav-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="brand-group" onClick={() => onSelectScreen('dashboard')} style={{ cursor: 'pointer' }}>
            <ShieldFuelBrandIcon size={36} />
            <div>
              <span className="brand-title" style={{ fontSize: '18px' }}>Divine Fuel</span>
              <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>Fleet Telemetry &amp; Security</div>
            </div>
          </div>

          <div
            className="desktop-conn-badge"
            style={{
              backgroundColor: isHardwareOnline ? '#F0FDF4' : '#FEF2F2',
              borderColor: isHardwareOnline ? '#BBF7D0' : '#FECACA',
              color: isHardwareOnline ? '#15803D' : '#DC2626'
            }}
          >
            <span
              className="pulsing-dot"
              style={{ backgroundColor: isHardwareOnline ? '#16A34A' : '#DC2626' }}
            />
            <span>{isHardwareOnline ? 'DEVICE LIVE ONLINE' : 'DEVICE OFFLINE'}</span>
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
            <span>Security Alerts</span>
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
            className={`desktop-tab-btn ${activeScreen === 'more' ? 'active' : ''}`}
            onClick={() => onSelectScreen('more')}
          >
            <SettingsIcon size={18} color={activeScreen === 'more' ? '#15803D' : '#6B7280'} />
            <span>More Hub</span>
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
              badge={unacknowledgedAlertsCount > 0 ? unacknowledgedAlertsCount : undefined}
            />
          </button>

          <button
            onClick={() => handleSelect('profile')}
            className={`header-icon-btn ${activeScreen === 'profile' ? 'active' : ''}`}
            title="Account Profile"
            style={{
              borderRadius: '50%',
              outline: activeScreen === 'profile' ? '2px solid #15803D' : 'none'
            }}
          >
            <UserAvatarIcon size={34} />
          </button>
        </div>
      </header>

      {/* 2. MOBILE TOP HEADER (Visible on screen width < 768px) */}
      <header className="mobile-header">
        <div className="brand-group" onClick={() => onSelectScreen('dashboard')}>
          <ShieldFuelBrandIcon size={34} />
          <div>
            <span className="brand-title">Divine Fuel</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isHardwareOnline ? '#16A34A' : '#DC2626'
                }}
              />
              <span style={{ fontSize: '9.5px', fontWeight: 700, color: isHardwareOnline ? '#15803D' : '#DC2626' }}>
                {isHardwareOnline ? 'DEVICE ONLINE' : 'DEVICE OFFLINE'}
              </span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          {/* Notification Bell */}
          <button
            onClick={() => onSelectScreen('alerts')}
            className="header-icon-btn"
            title="Security Alerts"
          >
            <NotificationBellIcon
              size={22}
              color="#111827"
              badge={unacknowledgedAlertsCount > 0 ? unacknowledgedAlertsCount : undefined}
            />
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={() => handleSelect('profile')}
            className={`header-icon-btn ${activeScreen === 'profile' ? 'active' : ''}`}
            title="Account Profile"
            style={{
              borderRadius: '50%',
              outline: activeScreen === 'profile' ? '2px solid #15803D' : 'none'
            }}
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
            badge={unacknowledgedAlertsCount > 0 ? unacknowledgedAlertsCount : undefined}
          />
          <span>Alerts</span>
        </button>

        {/* 5. More Hub */}
        <button
          className={`nav-tab-item ${['more', 'fuel', 'diagnostics', 'firebase', 'history'].includes(activeScreen) ? 'active' : ''}`}
          onClick={() => handleSelect('more')}
        >
          <MenuHamburgerIcon
            size={22}
            color={['more', 'fuel', 'diagnostics', 'firebase', 'history'].includes(activeScreen) ? '#15803D' : '#9CA3AF'}
          />
          <span style={{ color: ['more', 'fuel', 'diagnostics', 'firebase', 'history'].includes(activeScreen) ? '#15803D' : undefined, fontWeight: ['more', 'fuel', 'diagnostics', 'firebase', 'history'].includes(activeScreen) ? 700 : 500 }}>
            More
          </span>
        </button>
      </nav>
    </>
  );
};
