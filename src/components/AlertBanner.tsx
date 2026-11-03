// Compact, Professional Security Alert Strip
// Clean, non-intrusive notification with 1-click dismiss and direct link to Security Relays

import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { ShieldAlertIcon, CloseIcon } from './Icons';

interface AlertBannerProps {
  onNavigateToSecurity?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ onNavigateToSecurity }) => {
  const { alerts, security, hardwarePins, dismissAlert, resetTamper, vehicle } = useTelemetry();

  // Find any active unacknowledged critical alert
  const criticalAlert = alerts.find(
    (a) => a.status === 'ACTIVE_UNACKNOWLEDGED' && a.severity === 'CRITICAL'
  );

  const isTamperTripped = security.tamper === 'TRIPPED' || hardwarePins?.v9 === 1;

  // If no critical alert, alarm is not actively sounding, and tamper loop is secure, do not display
  if (!criticalAlert && !security.theftAlarmActive && !isTamperTripped) {
    return null;
  }

  const alertTitle = isTamperTripped
    ? `⚠️ Tamper Detected on ${vehicle?.name || 'Vehicle'}`
    : criticalAlert
    ? criticalAlert.title
    : security.theftAlarmReason || 'Fuel Siphon / Tamper Event Triggered';

  const alertSubtitle = isTamperTripped
    ? 'Anti-tamper loop wire severed (Pin V9 = 1). Security perimeter compromised!'
    : criticalAlert
    ? criticalAlert.description
    : 'Live hardware sensor triggered. Tap to inspect security incident.';

  const handleDismiss = () => {
    resetTamper();
    dismissAlert(criticalAlert?.id);
  };

  return (
    <div
      style={{
        backgroundColor: '#FEF2F2',
        border: '1.5px solid #EF4444',
        borderRadius: '14px',
        color: '#991B1B',
        padding: '10px 14px',
        margin: '0 14px 12px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.12)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#DC2626',
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
          <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.01em', color: '#7F1D1D' }}>
            {alertTitle}
          </div>
          <div style={{ fontSize: '11px', color: '#B91C1C', marginTop: '1px' }}>
            {alertSubtitle}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {onNavigateToSecurity && (
          <button
            onClick={onNavigateToSecurity}
            style={{
              padding: '6px 11px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            VIEW INCIDENT
          </button>
        )}
        <button
          onClick={handleDismiss}
          style={{
            padding: '6px 11px',
            borderRadius: '8px',
            border: '1px solid #FCA5A5',
            backgroundColor: '#FFFFFF',
            color: '#991B1B',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <CloseIcon size={12} />
          SILENCE
        </button>
      </div>
    </div>
  );
};
