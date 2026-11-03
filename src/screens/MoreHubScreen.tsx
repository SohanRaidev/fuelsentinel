// Divine Fuel - Additional Tools & Fleet Utilities Hub
// Clean, Dedicated Native iOS-style Screen (Replaces modal overlay to prevent glitching across tabs)

import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import type { ScreenId } from '../components/Navigation';
import {
  FuelPumpIcon,
  DiagnosticsChipIcon,
  CarChassisIcon,
  HistoryLogIcon,
  SettingsIcon,
  UserAvatarIcon,
  ChevronRightIcon,
  ShieldSecureIcon
} from '../components/Icons';

interface MoreHubScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenInstallPrompt?: () => void;
}

export const MoreHubScreen: React.FC<MoreHubScreenProps> = ({ onNavigate, onOpenInstallPrompt }) => {
  const { isHardwareOnline, vehicle } = useTelemetry();

  const isStandalone = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );

  const hubItems = [
    {
      id: 'fuel' as ScreenId,
      title: 'Fuel Audit & Sensor Calibration',
      desc: '2-Point voltage calibration (V_FULL, V_EMPTY), capacity & resistance curves',
      icon: <FuelPumpIcon size={24} color="#15803D" />,
      tag: 'Core Fuel'
    },
    {
      id: 'diagnostics' as ScreenId,
      title: 'System Diagnostics & Pin Monitor',
      desc: 'Live datastreams V0-V9, ADC millivolts, Wi-Fi RSSI & hardware telemetry',
      icon: <DiagnosticsChipIcon size={24} color="#0284C7" />,
      tag: isHardwareOnline ? 'Device Live' : 'Device Offline'
    },
    {
      id: 'setup' as ScreenId,
      title: 'Vehicle Fleet Management',
      desc: `Switch active vehicle (${vehicle.name} - ${vehicle.plate}), dual ESP32 settings & tank geometry`,
      icon: <CarChassisIcon size={24} color="#111827" />,
      tag: 'Multi-Vehicle'
    },
    {
      id: 'history' as ScreenId,
      title: 'Telemetry Event History & CSV',
      desc: 'Audit trail of diesel fills, trips, siphon alerts, and CSV spreadsheet export',
      icon: <HistoryLogIcon size={24} color="#D97706" />,
      tag: 'Audit Logs'
    },
    {
      id: 'firebase' as ScreenId,
      title: 'IoT Gateway & Cloud Sync',
      desc: 'Blynk IoT auth tokens, template credentials, and poll rates',
      icon: <SettingsIcon size={24} color="#4B5563" />,
      tag: 'Config'
    },
    {
      id: 'profile' as ScreenId,
      title: 'Operator Profile & Security Contacts',
      desc: 'Fleet administrator name, emergency phone number & siren audio controls',
      icon: <UserAvatarIcon size={24} />,
      tag: 'Admin'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 14px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 1. HERO HEADER CARD */}
      <div className="ios-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              backgroundColor: '#ECFDF5',
              border: '2px solid #15803D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#15803D'
            }}
          >
            <ShieldSecureIcon size={30} />
          </div>

          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>
              Fleet Hub &amp; Tools
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
              Configure vehicle calibration, hardware diagnostics, and security logs
            </div>
          </div>
        </div>
      </div>

      {/* 2. HUB ITEM CARDS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {hubItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="ios-card"
            style={{
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {item.icon}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#111827' }}>
                    {item.title}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '6px',
                      backgroundColor: '#F3F4F6',
                      color: '#4B5563'
                    }}
                  >
                    {item.tag}
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#6B7280', marginTop: '2px', maxWidth: '480px' }}>
                  {item.desc}
                </div>
              </div>
            </div>

            <ChevronRightIcon size={18} color="#9CA3AF" />
          </div>
        ))}
      </div>

      {/* 3. PWA INSTALL BANNER IF RUNNING IN BROWSER */}
      {!isStandalone && onOpenInstallPrompt && (
        <div
          className="ios-card"
          style={{
            padding: '16px',
            backgroundColor: '#F0FDF4',
            border: '1.5px solid #BBF7D0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#15803D' }}>
              Install Divine Fuel PWA
            </div>
            <div style={{ fontSize: '11px', color: '#166534', marginTop: '2px' }}>
              Run as a standalone native app with offline support and instant notifications
            </div>
          </div>

          <button
            onClick={onOpenInstallPrompt}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#15803D',
              color: '#FFFFFF',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            INSTALL
          </button>
        </div>
      )}
    </div>
  );
};
