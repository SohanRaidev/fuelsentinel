// Hardware Gateway Configuration, Device Bridge & Account Settings
// Sleek Modern iOS Design with ESP32 Hardware Link & Firebase Cloud Sync

import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { RefreshCycleIcon } from '../components/Icons';
import type { ConnectionMode, BlynkConfig, FirebaseConfig } from '../types/telemetry';

export const AuthSettingsScreen: React.FC = () => {
  const {
    diagnostics,
    setConnectionMode,
    blynkConfig,
    updateBlynkConfig,
    firebaseConfig,
    updateFirebaseConfig,
    triggerHardwareSync
  } = useTelemetry();

  const [blynkForm, setBlynkForm] = useState<BlynkConfig>(blynkConfig);
  const [fbForm, setFbForm] = useState<FirebaseConfig>(firebaseConfig);
  const [testingPing, setTestingPing] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  const handleModeChange = (mode: ConnectionMode) => {
    setConnectionMode(mode);
  };

  const handleSaveHardwareLink = (e: React.FormEvent) => {
    e.preventDefault();
    updateBlynkConfig(blynkForm);
    triggerHardwareSync();
    setTestResult({ success: true, msg: 'Hardware gateway credentials saved & synchronized.' });
  };

  const handleSaveFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    updateFirebaseConfig(fbForm);
    setTestResult({ success: true, msg: 'Firebase credentials saved to local storage.' });
  };

  const handleTestConnection = async () => {
    setTestingPing(true);
    setTestResult(null);

    try {
      const resp = await fetch(
        `https://blynk.cloud/external/api/isHardwareConnected?token=${blynkForm.authToken}`,
        { mode: 'cors' }
      );
      if (resp.ok) {
        const text = await resp.text();
        const isOnline = text.trim() === 'true';
        setTestResult({
          success: true,
          msg: `Hardware Gateway connection verified! Device state: ${isOnline ? 'ONLINE' : 'STANDBY'}.`
        });
      } else {
        setTestResult({
          success: false,
          msg: `Gateway server returned status ${resp.status}. Please check your Auth Token.`
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error';
      setTestResult({
        success: false,
        msg: `Connection test error: ${message}`
      });
    } finally {
      setTestingPing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 14px' }}>
      {/* 1. TELEMETRY SOURCE MODE SELECTOR */}
      <div className="ios-card" style={{ padding: '16px' }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '2px' }}>
          Hardware Telemetry Source
        </div>
        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>
          Choose between live ESP32 hardware streaming or local bench simulation
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div
            onClick={() => handleModeChange('BLYNK_LIVE')}
            style={{
              padding: '12px',
              borderRadius: '12px',
              border: diagnostics.connectionMode === 'BLYNK_LIVE' ? '2px solid #16A34A' : '1px solid #E5E7EB',
              backgroundColor: diagnostics.connectionMode === 'BLYNK_LIVE' ? '#F0FDF4' : '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
              Live ESP32 Device
            </div>
            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
              Polls pins V0-V9 every 2.5s
            </div>
            {diagnostics.connectionMode === 'BLYNK_LIVE' && (
              <span style={{ display: 'inline-block', marginTop: '6px', backgroundColor: '#15803D', color: '#FFFFFF', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                ACTIVE
              </span>
            )}
          </div>

          <div
            onClick={() => handleModeChange('DEMO_SIMULATION')}
            style={{
              padding: '12px',
              borderRadius: '12px',
              border: diagnostics.connectionMode === 'DEMO_SIMULATION' ? '2px solid #D97706' : '1px solid #E5E7EB',
              backgroundColor: diagnostics.connectionMode === 'DEMO_SIMULATION' ? '#FEF3C7' : '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
              Bench Simulation
            </div>
            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
              Simulates theft, refills, driving
            </div>
            {diagnostics.connectionMode === 'DEMO_SIMULATION' && (
              <span style={{ display: 'inline-block', marginTop: '6px', backgroundColor: '#D97706', color: '#FFFFFF', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                ACTIVE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. HARDWARE CREDENTIALS */}
      <div className="ios-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>
              IoT Hardware Gateway
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              Connect directly to your ESP32 cloud link
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={testingPing}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              backgroundColor: '#FFFFFF',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RefreshCycleIcon size={12} className={testingPing ? 'spin-icon' : ''} />
            <span>{testingPing ? 'Testing...' : 'Test Link'}</span>
          </button>
        </div>

        {testResult && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              backgroundColor: testResult.success ? '#F0FDF4' : '#FEF2F2',
              border: testResult.success ? '1px solid #BBF7D0' : '1px solid #FCA5A5',
              color: testResult.success ? '#15803D' : '#DC2626',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '12px'
            }}
          >
            {testResult.msg}
          </div>
        )}

        <form onSubmit={handleSaveHardwareLink} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '3px' }}>
              Device Auth Token
            </label>
            <input
              type="text"
              value={blynkForm.authToken}
              onChange={(e) => setBlynkForm({ ...blynkForm, authToken: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '12.5px', fontFamily: 'monospace' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '3px' }}>
              Template ID
            </label>
            <input
              type="text"
              value={blynkForm.templateId}
              onChange={(e) => setBlynkForm({ ...blynkForm, templateId: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '12.5px', fontFamily: 'monospace' }}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#15803D',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '13px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              marginTop: '4px'
            }}
          >
            SAVE GATEWAY CREDENTIALS
          </button>
        </form>
      </div>

      {/* 3. FIREBASE RTDB BRIDGE */}
      <div className="ios-card" style={{ padding: '16px' }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '2px' }}>
          Firebase Realtime Database Bridge
        </div>
        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>
          Configure future direct Firebase RTDB cloud synchronization
        </div>

        <form onSubmit={handleSaveFirebase} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '3px' }}>
              Database URL
            </label>
            <input
              type="text"
              value={fbForm.databaseURL}
              onChange={(e) => setFbForm({ ...fbForm, databaseURL: e.target.value })}
              placeholder="https://your-app-default-rtdb.firebaseio.com"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '12.5px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '3px' }}>
              Project ID
            </label>
            <input
              type="text"
              value={fbForm.projectId}
              onChange={(e) => setFbForm({ ...fbForm, projectId: e.target.value })}
              placeholder="divine-fuel-hw"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '12.5px' }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#374151',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '13px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              marginTop: '4px'
            }}
          >
            SAVE FIREBASE CREDENTIALS
          </button>
        </form>
      </div>
    </div>
  );
};
