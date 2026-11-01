// Divine Fuel - High-Priority Emergency Theft Alarm In-App Pop-up
// Provides instant high-visibility alert, sound silencer, and emergency response actions

import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import {
  SirenIcon,
  VolumeMuteIcon,
  CheckmarkIcon,
  ExternalLinkIcon,
  FoldedMapIcon
} from './Icons';

export const TheftAlarmModal: React.FC = () => {
  const {
    security,
    vehicle,
    gps,
    isAudioMuted,
    toggleAudioMute,
    resetTamper,
    dismissAlert
  } = useTelemetry();

  if (!security.theftAlarmActive) {
    return null;
  }

  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${gps.latitude},${gps.longitude}`;

  const handleSilence = () => {
    if (!isAudioMuted) {
      toggleAudioMute();
    }
  };

  const handleDismiss = () => {
    resetTamper();
    dismissAlert();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(17, 24, 39, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'emergencyFadeIn 0.25s ease-out'
      }}
    >
      <div
        className="ios-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '3px solid #DC2626',
          boxShadow: '0 20px 40px -10px rgba(220, 38, 38, 0.45), 0 0 0 8px rgba(220, 38, 38, 0.15)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {/* Animated Emergency Flashing Siren Badge */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#FEE2E2',
            border: '2px solid #EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#DC2626',
            marginBottom: '14px',
            animation: 'sirenPulseGlow 1s infinite alternate'
          }}
        >
          <SirenIcon size={34} />
        </div>

        <div style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
          SECURITY WARNING • THEFT IN PROGRESS
        </div>

        <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
          Fuel Security Breach Detected!
        </div>

        {/* Vehicle Identifier */}
        <div style={{ backgroundColor: '#F3F4F6', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '16px' }}>
          {vehicle.name} &bull; <span style={{ color: '#111827' }}>{vehicle.plate}</span>
        </div>

        {/* Incident Detail Box */}
        <div style={{ width: '100%', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '14px', padding: '14px', textAlign: 'left', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#991B1B', marginBottom: '4px' }}>
            {security.theftAlarmReason || 'Sudden Fuel Drop Detected with Engine OFF'}
          </div>
          {security.theftDropVolumeLitres > 0 && (
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
              Fuel Lost: -{security.theftDropVolumeLitres.toFixed(1)} Litres
            </div>
          )}
          <div style={{ fontSize: '11.5px', color: '#6B7280', marginTop: '6px' }}>
            GPS Coordinates: {gps.latitude.toFixed(5)}&deg; N, {gps.longitude.toFixed(5)}&deg; E
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          {/* SILENCE ALARM BUTTON */}
          <button
            onClick={handleSilence}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '12px',
              border: isAudioMuted ? '1px solid #D1D5DB' : 'none',
              backgroundColor: isAudioMuted ? '#F3F4F6' : '#DC2626',
              color: isAudioMuted ? '#6B7280' : '#FFFFFF',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: isAudioMuted ? 'none' : '0 4px 12px rgba(220, 38, 38, 0.35)',
              transition: 'all 0.15s ease'
            }}
          >
            <VolumeMuteIcon size={18} />
            <span>{isAudioMuted ? 'SIREN ALARM SILENCED' : 'SILENCE LOUD SIREN'}</span>
          </button>

          {/* OPEN LOCATION & DISMISS BUTTONS ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <a
              href={gmapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '11px',
                borderRadius: '12px',
                border: '1px solid #16A34A',
                backgroundColor: '#F0FDF4',
                color: '#15803D',
                fontSize: '12.5px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <FoldedMapIcon size={16} color="#15803D" />
              <span>Track GPS</span>
              <ExternalLinkIcon size={11} color="#15803D" />
            </a>

            <button
              onClick={handleDismiss}
              style={{
                padding: '11px',
                borderRadius: '12px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <CheckmarkIcon size={16} />
              <span>Dismiss &amp; Reset</span>
            </button>
          </div>

          {/* CALL FLEET SECURITY EMERGENCY PHONE */}
          {vehicle.emergencyContactPhone && (
            <a
              href={`tel:${vehicle.emergencyContactPhone}`}
              style={{
                padding: '9px',
                fontSize: '11.5px',
                fontWeight: 600,
                color: '#6B7280',
                textDecoration: 'underline',
                cursor: 'pointer',
                marginTop: '4px'
              }}
            >
              Call Fleet Emergency Responder ({vehicle.emergencyContactPhone})
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
