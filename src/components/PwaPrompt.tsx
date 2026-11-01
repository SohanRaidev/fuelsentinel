// PWA Install Drawer and Mobile Operating System Guide

import React from 'react';
import { pwaManager } from '../utils/pwa';
import { CanisterIcon, CloseIcon, CheckmarkIcon } from './Icons';

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
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="brutal-panel"
        style={{
          maxWidth: '520px',
          width: '100%',
          backgroundColor: 'var(--bg-surface)',
          boxShadow: '6px 6px 0px var(--border-color)'
        }}
      >
        <div className="brutal-panel-header">
          <span className="brutal-panel-title">
            <CanisterIcon size={18} />
            INSTALL FUEL SENTINEL PWA
          </span>
          <button onClick={onClose} className="btn-brutal btn-brutal-sm btn-brutal-subtle" style={{ padding: '4px' }}>
            <CloseIcon size={16} />
          </button>
        </div>

        {isAlreadyInstalled ? (
          <div>
            <div
              className="badge-brutal badge-brutal-secure"
              style={{ padding: '8px 12px', fontSize: '13px', width: '100%', marginBottom: '14px' }}
            >
              <CheckmarkIcon size={18} /> APP IS ALREADY RUNNING IN STANDALONE PWA MODE
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-secondary)', marginBottom: '16px' }}>
              Fuel Sentinel is active as a standalone Progressive Web App on this device with offline caching and background telemetry support.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={onClose} className="btn-brutal btn-brutal-primary">
                CLOSE
              </button>
            </div>
          </div>
        ) : isIos ? (
          <div>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-primary)', marginBottom: '14px', fontWeight: 600 }}>
              Apple iOS Safari does not support automated 1-click prompts. Follow these 3 steps to install:
            </p>

            <ol
              style={{
                paddingLeft: '20px',
                fontSize: '13px',
                color: 'var(--ink-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '18px'
              }}
            >
              <li>
                Tap the <strong>Share</strong> button at the bottom of Safari (the square icon with the upward arrow).
              </li>
              <li>
                Scroll down the share sheet and tap <strong>"Add to Home Screen"</strong>.
              </li>
              <li>
                Tap <strong>"Add"</strong> in the top-right corner to save Fuel Sentinel to your home screen.
              </li>
            </ol>

            <div
              className="brutal-panel-inset"
              style={{ marginBottom: '16px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
            >
              Includes offline caching, full-screen automotive instrument dashboard, and instant push theft alarm wake-up.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={onClose} className="btn-brutal btn-brutal-primary">
                DONE
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-secondary)', marginBottom: '14px' }}>
              Install Fuel Sentinel to your home screen or desktop application launcher for instant access without URL bars, offline telemetry caching, and immediate theft push notifications.
            </p>

            <div
              className="brutal-panel-inset"
              style={{ marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontFamily: 'var(--font-mono)' }}>
                <CheckmarkIcon size={14} color="var(--accent-secure)" />
                <span>Zero app store installation required</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontFamily: 'var(--font-mono)' }}>
                <CheckmarkIcon size={14} color="var(--accent-secure)" />
                <span>Runs offline with service worker cache</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontFamily: 'var(--font-mono)' }}>
                <CheckmarkIcon size={14} color="var(--accent-secure)" />
                <span>Immediate high-priority theft siren alarm alerts</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={onClose} className="btn-brutal btn-brutal-subtle">
                MAYBE LATER
              </button>
              {canInstallNative ? (
                <button onClick={handleInstallClick} className="btn-brutal btn-brutal-primary">
                  INSTALL TO DEVICE NOW
                </button>
              ) : (
                <button onClick={onClose} className="btn-brutal btn-brutal-primary">
                  OPEN IN BROWSER MENU &rarr; INSTALL
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
