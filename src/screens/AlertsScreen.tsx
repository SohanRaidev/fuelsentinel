// Security Alerts & Emergency Hardware Relays Center
// Sleek Modern iOS Design with Remote Actuator Controls (110dB Siren & Fuel Cutoff Valve)

import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import {
  ShieldSecureIcon,
  SirenIcon,
  CutoffValveIcon,
  TamperLoopIcon,
  WarningAlertBoxIcon
} from '../components/Icons';
import type { SecurityAlert } from '../types/telemetry';

export const AlertsScreen: React.FC = () => {
  const {
    alerts,
    vehicle,
    security,
    toggleSiren,
    toggleFuelCutoff,
    dispatchEmergency,
    resolveAlert
  } = useTelemetry();

  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'RESOLVED'>('ALL');
  const [activeModalAlert, setActiveModalAlert] = useState<SecurityAlert | null>(null);
  const [modalAction, setModalAction] = useState<'DISPATCH' | 'RESOLVE' | null>(null);
  const [actionNotes, setActionNotes] = useState('');

  const [confirmSirenModal, setConfirmSirenModal] = useState(false);
  const [confirmCutoffModal, setConfirmCutoffModal] = useState(false);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 14px' }}>
      {/* 1. RELAYS & ACTUATORS CARD */}
      <div className="ios-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>
              Vehicle Security Relays
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              Physical actuator controls on ESP32 GPIO 22 &amp; 23
            </div>
          </div>
          <span
            style={{
              backgroundColor: '#DCFCE7',
              color: '#15803D',
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: '8px'
            }}
          >
            ACTIVE GUARD
          </span>
        </div>

        {/* 2 Relays Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
          {/* Siren Relay */}
          <div
            style={{
              borderRadius: '14px',
              padding: '12px',
              backgroundColor: security.sirenRelayActive ? '#FEF2F2' : '#F9FAFB',
              border: security.sirenRelayActive ? '1.5px solid #FCA5A5' : '1px solid #E5E7EB'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: security.sirenRelayActive ? '#DC2626' : '#E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <SirenIcon size={18} color={security.sirenRelayActive ? '#FFFFFF' : '#374151'} />
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: security.sirenRelayActive ? '#DC2626' : '#6B7280',
                  backgroundColor: security.sirenRelayActive ? '#FEE2E2' : '#E5E7EB',
                  padding: '2px 6px',
                  borderRadius: '6px'
                }}
              >
                {security.sirenRelayActive ? 'SOUNDING' : 'ARMED'}
              </span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>110dB Siren</div>
            <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '10px' }}>Pin GPIO 22</div>
            <button
              onClick={() => setConfirmSirenModal(true)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: security.sirenRelayActive ? '#111827' : '#DC2626',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {security.sirenRelayActive ? 'SILENCE' : 'TEST SIREN'}
            </button>
          </div>

          {/* Solenoid Valve Relay */}
          <div
            style={{
              borderRadius: '14px',
              padding: '12px',
              backgroundColor: security.fuelCutoffRelayActive ? '#FEF2F2' : '#F0FDF4',
              border: security.fuelCutoffRelayActive ? '1.5px solid #FCA5A5' : '1px solid #BBF7D0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: security.fuelCutoffRelayActive ? '#DC2626' : '#15803D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CutoffValveIcon size={18} color="#FFFFFF" />
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: security.fuelCutoffRelayActive ? '#DC2626' : '#15803D',
                  backgroundColor: security.fuelCutoffRelayActive ? '#FEE2E2' : '#DCFCE7',
                  padding: '2px 6px',
                  borderRadius: '6px'
                }}
              >
                {security.fuelCutoffRelayActive ? 'CUT OFF' : 'FLOWING'}
              </span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>Fuel Cutoff</div>
            <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '10px' }}>Pin GPIO 23</div>
            <button
              onClick={() => setConfirmCutoffModal(true)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: security.fuelCutoffRelayActive ? '#15803D' : '#374151',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {security.fuelCutoffRelayActive ? 'RESTORE LINE' : 'SHUT VALVE'}
            </button>
          </div>
        </div>

        {/* Security Wire Tamper Loop Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', padding: '10px 12px', borderRadius: '12px', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TamperLoopIcon size={18} color={security.tamper === 'SECURE' ? '#15803D' : '#DC2626'} />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>
                Tamper Wire Circuit (GPIO 26)
              </div>
              <div style={{ fontSize: '10.5px', color: '#6B7280' }}>
                Continuous tank-strap monitoring loop
              </div>
            </div>
          </div>
          <span style={{ fontSize: '11.5px', fontWeight: 800, color: security.tamper === 'SECURE' ? '#15803D' : '#DC2626' }}>
            {security.tamper === 'SECURE' ? 'INTACT (SECURE)' : 'SEVERED!'}
          </span>
        </div>
      </div>

      {/* 2. SECURITY ALERTS LOG */}
      <div className="ios-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>
              Security Incidents &amp; Alerts
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              {criticalCount > 0 ? `${criticalCount} Active Critical Alerts` : 'All systems operating normally'}
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['ALL', 'CRITICAL', 'RESOLVED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
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

        {/* Alerts List */}
        {filteredAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 10px', color: '#6B7280' }}>
            <ShieldSecureIcon size={32} color="#15803D" />
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginTop: '6px' }}>
              No Active Security Alerts
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
              Fuel levels, tamper loops and ignition lines are nominal.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredAlerts.map((a) => (
              <div
                key={a.id}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: a.severity === 'CRITICAL' ? '1px solid #FCA5A5' : '1px solid #E5E7EB',
                  backgroundColor: a.severity === 'CRITICAL' ? '#FEF2F2' : '#FFFFFF'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <WarningAlertBoxIcon size={32} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#111827' }}>
                        {a.title}
                      </span>
                      <span style={{ fontSize: '10.5px', color: '#6B7280' }}>
                        {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#4B5563', marginTop: '2px' }}>
                      {a.description}
                    </div>
                    {a.litresLost !== undefined && (
                      <div style={{ fontSize: '11.5px', color: '#DC2626', fontWeight: 700, marginTop: '2px' }}>
                        Est. Fuel Siphoned: -{a.litresLost} Litres
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                      <button
                        onClick={() => handleOpenActionModal(a, 'DISPATCH')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: '#DC2626',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Dispatch Response
                      </button>
                      <button
                        onClick={() => handleOpenActionModal(a, 'RESOLVE')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid #D1D5DB',
                          backgroundColor: '#FFFFFF',
                          color: '#374151',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Mark Resolved
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CONFIRM SIREN MODAL */}
      {confirmSirenModal && (
        <div className="brutal-modal-backdrop" onClick={() => setConfirmSirenModal(false)}>
          <div
            className="ios-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '380px', width: '90%', margin: 'auto', borderRadius: '20px', padding: '20px' }}
          >
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
              {security.sirenRelayActive ? 'Silence Alarm Siren?' : 'Activate 110dB Alarm Siren?'}
            </div>
            <div style={{ fontSize: '12.5px', color: '#4B5563', marginBottom: '16px', lineHeight: 1.4 }}>
              {security.sirenRelayActive
                ? 'This will immediately disengage GPIO 22 and turn off the vehicle horn.'
                : 'This will energize GPIO 22 relay and trigger the vehicle alarm horn to deter fuel siphoning.'}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setConfirmSirenModal(false)}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toggleSiren();
                  setConfirmSirenModal(false);
                }}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#DC2626', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM CUTOFF MODAL */}
      {confirmCutoffModal && (
        <div className="brutal-modal-backdrop" onClick={() => setConfirmCutoffModal(false)}>
          <div
            className="ios-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '380px', width: '90%', margin: 'auto', borderRadius: '20px', padding: '20px' }}
          >
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
              {security.fuelCutoffRelayActive ? 'Restore Fuel Line Flow?' : 'Activate Fuel Line Cutoff?'}
            </div>
            <div style={{ fontSize: '12.5px', color: '#4B5563', marginBottom: '16px', lineHeight: 1.4 }}>
              {security.fuelCutoffRelayActive
                ? 'This will open the solenoid valve on GPIO 23, restoring diesel flow to the engine.'
                : 'This will trigger the inline solenoid valve on GPIO 23 to cut fuel delivery and disable engine restart.'}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setConfirmCutoffModal(false)}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toggleFuelCutoff();
                  setConfirmCutoffModal(false);
                }}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#15803D', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

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
