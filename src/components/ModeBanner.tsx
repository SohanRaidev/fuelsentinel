// Mode Banner: Live Blynk IoT Cloud vs Simulation Mode
// Transparently displays connection to User's Blynk Datastreams (TMPL3V68moLoN)

import React, { useState } from 'react';
import { useTelemetry, type SimulationScenario } from '../context/TelemetryContext';
import { DiagnosticsChipIcon, ShieldAlertIcon, CloseIcon, RefreshCycleIcon } from './Icons';

interface ModeBannerProps {
  onNavigateToHardware: () => void;
}

export const ModeBanner: React.FC<ModeBannerProps> = ({ onNavigateToHardware }) => {
  const { diagnostics, activeScenario, simulateScenario, security, triggerBlynkSync, setConnectionMode } = useTelemetry();
  const [showDrawer, setShowDrawer] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const isBlynk = diagnostics.connectionMode === 'BLYNK_LIVE';
  const isDemo = diagnostics.connectionMode === 'DEMO_SIMULATION';

  const handleManualSync = async () => {
    setIsSyncing(true);
    await triggerBlynkSync();
    setTimeout(() => setIsSyncing(false), 500);
  };

  const scenarios: Array<{ id: SimulationScenario; label: string; desc: string; danger?: boolean }> = [
    { id: 'NORMAL_PARKED', label: '1. Parked & Secure', desc: 'Ignition OFF, 58.4L, stable level, tamper secure' },
    { id: 'DRIVING', label: '2. Driving / Commute', desc: 'Ignition ON, engine running, fuel consuming, GPS moving' },
    { id: 'THEFT_SIPHON', label: '3. Rapid Siphon Theft', desc: 'Sudden -14.8L drain with ignition OFF, tamper loop cut, siren on', danger: true },
    { id: 'REFILL_STATION', label: '4. Fuel Refill (+48L)', desc: 'Fuel volume increases rapidly, logged as refill event' },
    { id: 'HARDWARE_OFFLINE', label: '5. Hardware Offline', desc: 'Simulate lost Wi-Fi/GSM connection (> 5m stale ping)' },
    { id: 'GPS_NO_FIX', label: '6. GPS Fix Lost', desc: '0 satellites in view (underground basement / jamming test)' }
  ];

  return (
    <>
      <div
        style={{
          backgroundColor: isBlynk
            ? 'var(--accent-cyan-bg)'
            : isDemo
            ? 'var(--accent-warning-bg)'
            : 'var(--accent-secure-bg)',
          color: isBlynk
            ? 'var(--accent-cyan-ink)'
            : isDemo
            ? 'var(--accent-warning-ink)'
            : 'var(--accent-secure-ink)',
          borderBottom: 'var(--border-width) solid var(--border-color)',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '11.5px',
          fontFamily: 'var(--font-mono)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <span
            style={{
              padding: '2px 6px',
              backgroundColor: isBlynk
                ? 'var(--accent-cyan)'
                : isDemo
                ? 'var(--accent-warning)'
                : 'var(--accent-secure)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '10.5px',
              letterSpacing: '0.04em'
            }}
          >
            {isBlynk ? 'LIVE HARDWARE' : isDemo ? 'SIMULATION MODE' : 'FIREBASE LIVE'}
          </span>
          <span>
            {isBlynk
              ? `LIVE IOT GATEWAY (${diagnostics.hardwareId}) &middot; ${diagnostics.onlineState}`
              : isDemo
              ? 'READINGS ARE SYNTHESIZED FOR TESTING. NOT REAL HARDWARE.'
              : `CONNECTED TO FIREBASE: ${diagnostics.hardwareId}`}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isBlynk && (
            <button
              onClick={handleManualSync}
              className="btn-brutal btn-brutal-sm btn-brutal-subtle"
              style={{ padding: '3px 8px', fontSize: '11px' }}
              title="Poll latest telemetry pins V0-V9 from gateway"
            >
              <RefreshCycleIcon size={13} />
              {isSyncing ? 'SYNCING...' : 'SYNC PINS'}
            </button>
          )}

          {isDemo ? (
            <button
              onClick={() => setShowDrawer(true)}
              className="btn-brutal btn-brutal-sm"
              style={{
                backgroundColor: security.theftAlarmActive ? 'var(--accent-critical)' : 'var(--bg-surface)',
                color: security.theftAlarmActive ? '#FFFFFF' : 'var(--ink-primary)',
                padding: '3px 8px',
                fontSize: '11px'
              }}
            >
              <ShieldAlertIcon size={13} />
              SCENARIOS ({activeScenario.replace('_', ' ')})
            </button>
          ) : (
            <button
              onClick={() => setConnectionMode('DEMO_SIMULATION')}
              className="btn-brutal btn-brutal-sm btn-brutal-subtle"
              style={{ padding: '3px 8px', fontSize: '11px' }}
            >
              TEST OFFLINE
            </button>
          )}

          <button
            onClick={onNavigateToHardware}
            className="btn-brutal btn-brutal-sm btn-brutal-primary"
            style={{ padding: '3px 8px', fontSize: '11px' }}
          >
            <DiagnosticsChipIcon size={13} />
            {isBlynk ? 'DEVICE PINS' : 'CONNECT HARDWARE'}
          </button>
        </div>
      </div>

      {/* Test Scenarios Modal Drawer */}
      {showDrawer && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            className="brutal-panel"
            style={{
              maxWidth: '560px',
              width: '100%',
              backgroundColor: 'var(--bg-surface)',
              boxShadow: '6px 6px 0px var(--border-color)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div className="brutal-panel-header">
              <span className="brutal-panel-title">
                <ShieldAlertIcon size={18} />
                AUTOMOTIVE SIMULATION SCENARIO SELECTOR
              </span>
              <button
                onClick={() => setShowDrawer(false)}
                className="btn-brutal btn-brutal-sm btn-brutal-subtle"
                style={{ padding: '4px' }}
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', marginBottom: '14px' }}>
              Select an automotive state to test the PWA response, fuel gauge, derivative drop-rate detection, tamper circuits, and siren alerts:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {scenarios.map((sc) => {
                const isActive = activeScenario === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => {
                      simulateScenario(sc.id);
                      setShowDrawer(false);
                    }}
                    className={`btn-brutal ${
                      isActive
                        ? 'btn-brutal-primary'
                        : sc.danger
                        ? 'btn-brutal-warning'
                        : 'btn-brutal-subtle'
                    }`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      textAlign: 'left',
                      padding: '10px 14px',
                      borderWidth: isActive ? '3px' : '2px',
                      borderColor: sc.danger ? 'var(--accent-critical)' : 'var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px' }}>{sc.label}</span>
                      {isActive && <span className="badge-brutal badge-brutal-secure">ACTIVE NOW</span>}
                      {sc.danger && !isActive && <span className="badge-brutal badge-brutal-critical">SECURITY TRIGGER</span>}
                    </div>
                    <span style={{ fontSize: '12px', opacity: 0.85, marginTop: '2px', textTransform: 'none', fontFamily: 'var(--font-body)' }}>
                      {sc.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => {
                  setConnectionMode('BLYNK_LIVE');
                  setShowDrawer(false);
                }}
                className="btn-brutal btn-brutal-subtle"
              >
                SWITCH TO LIVE HARDWARE
              </button>
              <button onClick={() => setShowDrawer(false)} className="btn-brutal btn-brutal-primary">
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
