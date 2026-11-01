// PWA Install Prompt & Operating System Setup Dialog
// Clean Modern iOS Design with Automated Launch Prompt and Fast 1-Tap Installation

import React from 'react';
import { pwaManager } from '../utils/pwa';
import { ShieldFuelBrandIcon, CloseIcon, CheckmarkIcon } from './Icons';

interface PwaPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaPrompt: React.FC<PwaPromptProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const isIos = pwaManager.isIosDevice();
  const canInstallNative = pwaManager.canInstall();
  const isAlreadyInstalled = pwaManager.checkInstalled();

  const handleInstallClick = async () => {
    const res = await pwaManager.triggerInstallPrompt();
    if (res === 'accepted') {
      sessionStorage.setItem('divine_fuel_install_dismissed', 'true');
      onClose();
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('divine_fuel_install_dismissed', 'true');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(17, 24, 39, 0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="ios-card"
        style={{
          maxWidth: '460px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #E5E7EB',
          position: 'relative'
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldFuelBrandIcon size={28} />
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#111827' }}>
                Install Divine Fuel
              </div>
              <div style={{ fontSize: '11.5px', color: '#15803D', fontWeight: 700 }}>
                Vehicle Telemetry &amp; Anti-Theft App
              </div>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="header-icon-btn"
            style={{ padding: '6px', borderRadius: '50%' }}
            title="Close"
          >
            <CloseIcon size={16} color="#6B7280" />
          </button>
        </div>

        {isAlreadyInstalled ? (
          <div>
            <div
              style={{
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                padding: '12px 14px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}
            >
              <CheckmarkIcon size={18} color="#15803D" />
              <span>App is already running in standalone PWA mode!</span>
            </div>
            <p style={{ fontSize: '13px', color: '#4B5563', marginBottom: '20px', lineHeight: 1.5 }}>
              Divine Fuel is active as a standalone Progressive Web App on this device with offline caching, high-priority siren alarms, and background telemetry.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleDismiss}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#15803D',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Continue
              </button>
            </div>
          </div>
        ) : isIos ? (
          <div>
            <p style={{ fontSize: '13px', color: '#374151', marginBottom: '14px', lineHeight: 1.4 }}>
              Install Divine Fuel to your home screen for instant full-screen dashboard access, lock-screen theft alerts, and zero browser bars:
            </p>

            <div
              style={{
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '16px',
                padding: '14px 16px',
                marginBottom: '18px'
              }}
            >
              <ol
                style={{
                  margin: 0,
                  paddingLeft: '20px',
                  fontSize: '12.5px',
                  color: '#1F2937',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <li>
                  Tap the <strong>Share</strong> button at the bottom of Safari (the square icon with the upward arrow).
                </li>
                <li>
                  Scroll down the share sheet and tap <strong>"Add to Home Screen"</strong>.
                </li>
                <li>
                  Tap <strong>"Add"</strong> in the top-right corner to save Divine Fuel to your home screen.
                </li>
              </ol>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={handleDismiss}
                style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  color: '#4B5563',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                Continue in Browser
              </button>
              <button
                onClick={handleDismiss}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#15803D',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                Got It
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '13px', color: '#4B5563', marginBottom: '14px', lineHeight: 1.5 }}>
              Install Divine Fuel to your home screen or desktop application launcher for instant access without URL bars, loud theft ringing, and offline telemetry caching.
            </p>

            <div
              style={{
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '16px',
                padding: '12px 14px',
                marginBottom: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#1F2937' }}>
                <CheckmarkIcon size={16} color="#15803D" />
                <span>Runs like native app without address bars</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#1F2937' }}>
                <CheckmarkIcon size={16} color="#15803D" />
                <span>Loud phone siren ringing on rapid fuel siphoning</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#1F2937' }}>
                <CheckmarkIcon size={16} color="#15803D" />
                <span>Real-time GPS tracking &amp; trip fuel loss logs</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={handleDismiss}
                style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  color: '#4B5563',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                Maybe Later
              </button>

              {canInstallNative ? (
                <button
                  onClick={handleInstallClick}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#15803D',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(21, 128, 61, 0.3)'
                  }}
                >
                  INSTALL APP NOW
                </button>
              ) : (
                <button
                  onClick={handleDismiss}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#15803D',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer'
                  }}
                >
                  Continue in Browser
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
