// Account Profile & Fleet Security Settings Screen
// Clean Modern iOS Design with Account Details, Theft Alarm Audio Controls, and Push Notifications

import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { audioAlert, requestNotificationPermission } from '../utils/audioAlert';
import {
  UserAvatarIcon,
  ShieldSecureIcon,
  SirenIcon,
  VolumeHighIcon,
  VolumeMuteIcon,
  CheckmarkIcon,
  CarChassisIcon
} from '../components/Icons';

interface ProfileScreenProps {
  onOpenInstallPrompt?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onOpenInstallPrompt }) => {
  const {
    vehicle,
    vehicles,
    isAudioMuted,
    toggleAudioMute,
    exportHistoryCsv
  } = useTelemetry();

  // User Account Details (Editable & Stored locally)
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('divine_fuel_account_name') || 'Sohan Rai';
  });
  const [accountEmail, setAccountEmail] = useState(() => {
    return localStorage.getItem('divine_fuel_account_email') || 'sohanrai.dev@gmail.com';
  });
  const [emergencyPhone, setEmergencyPhone] = useState(() => {
    return localStorage.getItem('divine_fuel_emergency_phone') || '+91 98765 43210';
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>('default');
  const [isTestingSiren, setIsTestingSiren] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationStatus(Notification.permission);
    }
  }, []);

  const handleSaveProfile = () => {
    localStorage.setItem('divine_fuel_account_name', userName);
    localStorage.setItem('divine_fuel_account_email', accountEmail);
    localStorage.setItem('divine_fuel_emergency_phone', emergencyPhone);
    setIsEditing(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleRequestPush = async () => {
    const perm = await requestNotificationPermission();
    setNotificationStatus(perm);
  };

  const handleTestLoudAlarm = () => {
    setIsTestingSiren(true);
    audioAlert.testAlarm(2500);
    setTimeout(() => {
      setIsTestingSiren(false);
    }, 2500);
  };

  const isStandalone = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 14px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 1. TOP ACCOUNT HERO CARD */}
      <div className="ios-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#ECFDF5',
                  border: '2px solid #15803D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#15803D'
                }}
              >
                <UserAvatarIcon size={34} />
              </div>
              <span
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#16A34A',
                  border: '2px solid #FFFFFF'
                }}
              />
            </div>

            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>
                {userName}
              </div>
              <div style={{ fontSize: '12px', color: '#15803D', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldSecureIcon size={14} color="#15803D" />
                <span>Primary Fleet Security Admin</span>
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                Account ID: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>DF-9942-SEC</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (isEditing) {
                handleSaveProfile();
              } else {
                setIsEditing(true);
              }
            }}
            style={{
              padding: '6px 14px',
              borderRadius: '10px',
              border: isEditing ? 'none' : '1px solid #D1D5DB',
              backgroundColor: isEditing ? '#15803D' : '#FFFFFF',
              color: isEditing ? '#FFFFFF' : '#374151',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        {saveToast && (
          <div style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckmarkIcon size={16} /> Account details saved successfully.
          </div>
        )}

        {/* Account Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div style={{ backgroundColor: '#F9FAFB', padding: '10px 12px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, marginBottom: '2px' }}>Owner Name</div>
            {isEditing ? (
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
              />
            ) : (
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{userName}</div>
            )}
          </div>

          <div style={{ backgroundColor: '#F9FAFB', padding: '10px 12px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, marginBottom: '2px' }}>Notification Email</div>
            {isEditing ? (
              <input
                type="email"
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
              />
            ) : (
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{accountEmail}</div>
            )}
          </div>

          <div style={{ backgroundColor: '#F9FAFB', padding: '10px 12px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, marginBottom: '2px' }}>Emergency Dispatch Line</div>
            {isEditing ? (
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
              />
            ) : (
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{emergencyPhone}</div>
            )}
          </div>
        </div>
      </div>

      {/* 2. THEFT SIREN AUDIO & PUSH NOTIFICATIONS SETTINGS */}
      <div className="ios-card" style={{ padding: '20px' }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
          Theft Siren &amp; Alert Settings
        </div>
        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px' }}>
          Configure loud audio phone ringing, haptic vibration, and system lock-screen push alerts
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Loud Siren Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: isAudioMuted ? '#FEE2E2' : '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isAudioMuted ? <VolumeMuteIcon size={20} color="#DC2626" /> : <VolumeHighIcon size={20} color="#15803D" />}
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827' }}>
                  Loud Theft Phone Siren
                </div>
                <div style={{ fontSize: '11.5px', color: '#6B7280' }}>
                  {isAudioMuted ? 'Muted — alarm will not ring device speaker' : 'Active — rings phone loudly when siphon is detected'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleTestLoudAlarm}
                disabled={isTestingSiren}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #DC2626',
                  backgroundColor: isTestingSiren ? '#DC2626' : '#FEF2F2',
                  color: isTestingSiren ? '#FFFFFF' : '#DC2626',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {isTestingSiren ? 'TESTING...' : 'TEST LOUD ALARM'}
              </button>

              <button
                onClick={toggleAudioMute}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isAudioMuted ? '#111827' : '#15803D',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {isAudioMuted ? 'UNMUTE' : 'MUTE'}
              </button>
            </div>
          </div>

          {/* Web Push Notifications */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SirenIcon size={20} color="#2563EB" />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827' }}>
                  Lock-Screen Push Notifications
                </div>
                <div style={{ fontSize: '11.5px', color: '#6B7280' }}>
                  Status:{' '}
                  <span style={{ fontWeight: 700, color: notificationStatus === 'granted' ? '#15803D' : '#D97706' }}>
                    {notificationStatus === 'granted' ? 'Enabled (Permission Granted)' : 'Disabled / Needs Permission'}
                  </span>
                </div>
              </div>
            </div>

            {notificationStatus !== 'granted' && (
              <button
                onClick={handleRequestPush}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                ENABLE PUSH
              </button>
            )}
          </div>

          {/* Emergency Dispatch SOS */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '18px' }}>📞</span>
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827' }}>
                  Emergency SOS Callout
                </div>
                <div style={{ fontSize: '11.5px', color: '#6B7280' }}>
                  Auto-call number configured for rapid security dispatch: {emergencyPhone}
                </div>
              </div>
            </div>

            <a
              href={`tel:${emergencyPhone}`}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                color: '#111827',
                fontSize: '11px',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              CALL NOW
            </a>
          </div>
        </div>
      </div>

      {/* 3. ACTIVE VEHICLE & HARDWARE STATUS */}
      <div className="ios-card" style={{ padding: '20px' }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
          Assigned Vehicle &amp; Telemetry Gateway
        </div>
        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '14px' }}>
          Active vehicle profile monitored by Divine Fuel system
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '14px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CarChassisIcon size={22} color="#15803D" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>
                {vehicle.name} ({vehicle.plate})
              </div>
              <div style={{ fontSize: '11.5px', color: '#15803D', fontWeight: 600 }}>
                {vehicle.tankCapacityLitres}L Tank &bull; {vehicle.fuelType} &bull; {vehicles.length} Vehicles in Fleet
              </div>
            </div>
          </div>

          <span style={{ fontSize: '11px', fontWeight: 800, backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 8px', borderRadius: '6px' }}>
            ONLINE
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '12px' }}>
          <div style={{ backgroundColor: '#F9FAFB', padding: '10px 12px', borderRadius: '10px' }}>
            <span style={{ color: '#6B7280', display: 'block', fontSize: '10.5px' }}>Hardware Controller</span>
            <span style={{ fontWeight: 700, color: '#111827' }}>ESP32-WROOM-32U (NVS Active)</span>
          </div>
          <div style={{ backgroundColor: '#F9FAFB', padding: '10px 12px', borderRadius: '10px' }}>
            <span style={{ color: '#6B7280', display: 'block', fontSize: '10.5px' }}>Firmware Core</span>
            <span style={{ fontWeight: 700, color: '#111827' }}>Divine Fuel v2.4.2</span>
          </div>
          <div style={{ backgroundColor: '#F9FAFB', padding: '10px 12px', borderRadius: '10px' }}>
            <span style={{ color: '#6B7280', display: 'block', fontSize: '10.5px' }}>Sensor Calibration</span>
            <span style={{ fontWeight: 700, color: '#111827' }}>5-Point Piecewise Curve</span>
          </div>
        </div>
      </div>

      {/* 4. APP INSTALLATION & DATA AUDIT */}
      <div className="ios-card" style={{ padding: '20px' }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
          Application Status &amp; Data Audit
        </div>
        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '14px' }}>
          PWA container, offline storage, and fleet CSV telemetry logs
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                App Display Mode
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>
                {isStandalone ? 'Installed as Native Standalone App' : 'Running in Web Browser Tab'}
              </div>
            </div>

            {!isStandalone && onOpenInstallPrompt && (
              <button
                onClick={onOpenInstallPrompt}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#15803D',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                INSTALL APP
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                Export Fleet Telemetry Logs
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>
                Download CSV audit trail of fuel readings, GPS points, and theft incidents
              </div>
            </div>

            <button
              onClick={exportHistoryCsv}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              DOWNLOAD CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
