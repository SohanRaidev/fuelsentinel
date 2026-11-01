// Compact, Professional Security Alert Strip
// Clean, non-intrusive notification with 1-click dismiss and direct link to Security Relays

import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { ShieldAlertIcon, CloseIcon } from './Icons';

interface AlertBannerProps {
  onNavigateToSecurity?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ onNavigateToSecurity }) => {
  const { alerts, security, dismissAlert } = useTelemetry();

  // Find any active unacknowledged critical alert
  const criticalAlert = alerts.find(
    (a) => a.status === 'ACTIVE_UNACKNOWLEDGED' && a.severity === 'CRITICAL'
  );

  // If no critical alert and alarm is not actively sounding, do not display
  if (!criticalAlert && !security.theftAlarmActive) {
    return null;
  }

  const alertTitle = criticalAlert ? criticalAlert.title : security.theftAlarmReason || 'Fuel / Tamper Sensor Triggered';

  return (
    <div
      className="brutal-panel"
      style={{
        backgroundColor: 'var(--accent-critical-bg)',
        borderColor: 'var(--accent-critical)',
        borderWidth: 'var(--border-width)',
        color: 'var(--accent-critical-ink)',
        padding: '10px 14px',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            backgroundColor: 'var(--accent-critical)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <ShieldAlertIcon size={18} color="#FFFFFF" />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-header)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.02em' }}>
            {alertTitle}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--accent-critical-ink)', opacity: 0.85 }}>
            Security sensor event recorded while parked. Tap to view security alerts.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {onNavigateToSecurity && (
          <button
            onClick={onNavigateToSecurity}
            className="btn-brutal btn-brutal-sm btn-brutal-subtle"
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            VIEW ALERTS
          </button>
        )}
        <button
          onClick={() => dismissAlert(criticalAlert?.id)}
          className="btn-brutal btn-brutal-sm btn-brutal-primary"
          style={{
            fontSize: '11px',
            padding: '5px 12px',
            backgroundColor: 'var(--ink-primary)',
            color: '#FFFFFF'
          }}
        >
          <CloseIcon size={12} />
          DISMISS & SILENCE
        </button>
      </div>
    </div>
  );
};
