// Security Alerts & Incident Response Center
// Clean Modern iOS Design Focused on Incident Logs, Siphon Tracking, and Emergency Dispatch

import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import {
  ShieldSecureIcon,
  WarningAlertBoxIcon
} from '../components/Icons';
import type { SecurityAlert } from '../types/telemetry';

export const AlertsScreen: React.FC = () => {
  const {
    alerts,
    vehicle,
    dispatchEmergency,
    resolveAlert
  } = useTelemetry();

  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'RESOLVED'>('ALL');
  const [activeModalAlert, setActiveModalAlert] = useState<SecurityAlert | null>(null);
  const [modalAction, setModalAction] = useState<'DISPATCH' | 'RESOLVE' | null>(null);
  const [actionNotes, setActionNotes] = useState('');

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'ALL') return true;
    if (filter === 'CRITICAL') return a.severity === 'CRITICAL';
    if (filter === 'WARNING') return a.severity === 'WARNING';
    if (filter === 'RESOLVED') return a.status === 'RESOLVED' || a.status === 'FALSE_ALARM';
    return true;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'ACTIVE_UNACKNOWLEDGED').length;

  const handleOpenActionModal = (alert: SecurityAlert, action: 'DISPATCH' | 'RESOLVE') => {
    setActiveModalAlert(alert);
    setModalAction(action);
    setActionNotes(
      action === 'DISPATCH'
        ? `Security response team dispatched to vehicle coordinates. Emergency contact: ${vehicle.emergencyContactPhone}`
        : 'Fuel loss investigated on-site. Tank secured and sender connections checked.'
    );
  };

  const handleConfirmModalAction = () => {
    if (!activeModalAlert || !modalAction) return;
    if (modalAction === 'DISPATCH') {
      dispatchEmergency(activeModalAlert.id, actionNotes);
    } else {
      resolveAlert(activeModalAlert.id, actionNotes);
    }
    setActiveModalAlert(null);
    setModalAction(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 14px' }}>
      {/* SECURITY INCIDENTS & ALERTS CARD */}
      <div className="ios-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#111827' }}>
              Security Incidents &amp; Alerts
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
              {criticalCount > 0 ? `${criticalCount} Active Critical Alerts` : 'All perimeter loops operating normally'}
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['ALL', 'CRITICAL', 'RESOLVED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '8px',
                  border: filter === f ? '1.5px solid #16A34A' : '1px solid #E5E7EB',
                  backgroundColor: filter === f ? '#F0FDF4' : '#FFFFFF',
                  color: filter === f ? '#15803D' : '#6B7280',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredAlerts.length === 0 ? (
          <div style={{ padding: '36px 16px', textAlign: 'center', color: '#6B7280' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <ShieldSecureIcon size={32} color="#16A34A" />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Zero Security Incidents</div>
            <div style={{ fontSize: '12px', marginTop: '3px' }}>
              No fuel theft, sudden drops, or tamper trigger alerts in this view filter.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                style={{
                  borderRadius: '14px',
                  padding: '12px',
                  backgroundColor:
                    alert.severity === 'CRITICAL' && alert.status === 'ACTIVE_UNACKNOWLEDGED'
                      ? '#FEF2F2'
                      : alert.status === 'RESOLVED'
                      ? '#F9FAFB'
                      : '#FFFBEB',
                  border:
                    alert.severity === 'CRITICAL' && alert.status === 'ACTIVE_UNACKNOWLEDGED'
                      ? '1.5px solid #FCA5A5'
                      : alert.status === 'RESOLVED'
                      ? '1px solid #E5E7EB'
                      : '1px solid #FCD34D'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <WarningAlertBoxIcon
                      size={20}
                      color={
                        alert.severity === 'CRITICAL'
                          ? '#DC2626'
                          : alert.status === 'RESOLVED'
                          ? '#15803D'
                          : '#D97706'
                      }
                    />
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#111827' }}>
                      {alert.type.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '3px 7px',
                      borderRadius: '6px',
                      backgroundColor:
                        alert.status === 'ACTIVE_UNACKNOWLEDGED'
                          ? '#FEE2E2'
                          : alert.status === 'DISPATCHED'
                          ? '#DBEAFE'
                          : '#DCFCE7',
                      color:
                        alert.status === 'ACTIVE_UNACKNOWLEDGED'
                          ? '#DC2626'
                          : alert.status === 'DISPATCHED'
                          ? '#1D4ED8'
                          : '#15803D'
                    }}
                  >
                    {alert.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: '#374151', marginBottom: '8px', lineHeight: 1.4 }}>
                  {alert.description}
                </div>

                {alert.litresLost && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#FFFFFF', padding: '3px 8px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '11px', fontWeight: 700, color: '#DC2626', marginBottom: '8px' }}>
                    <span>Estimated Fuel Drained:</span>
                    <span>-{alert.litresLost.toFixed(1)} L</span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '10.5px', color: '#6B7280' }}>
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    {alert.locationSnapshot && ` • GPS: ${alert.locationSnapshot.lat.toFixed(4)}, ${alert.locationSnapshot.lng.toFixed(4)}`}
                  </div>

                  {alert.status !== 'RESOLVED' && alert.status !== 'FALSE_ALARM' && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleOpenActionModal(alert, 'DISPATCH')}
                        style={{
                          padding: '5px 9px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: '#DC2626',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        DISPATCH
                      </button>
                      <button
                        onClick={() => handleOpenActionModal(alert, 'RESOLVE')}
                        style={{
                          padding: '5px 9px',
                          borderRadius: '6px',
                          border: '1px solid #D1D5DB',
                          backgroundColor: '#FFFFFF',
                          color: '#374151',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        RESOLVE
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DISPATCH / RESOLVE MODAL */}
      {activeModalAlert && modalAction && (
        <div className="brutal-modal-backdrop" onClick={() => setActiveModalAlert(null)}>
          <div
            className="ios-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '400px', width: '90%', margin: 'auto', borderRadius: '20px', padding: '20px' }}
          >
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
              {modalAction === 'DISPATCH' ? 'Dispatch Security Team' : 'Resolve Security Incident'}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                Incident Notes
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '12.5px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setActiveModalAlert(null)}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmModalAction}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#15803D', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
              >
                Save Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
