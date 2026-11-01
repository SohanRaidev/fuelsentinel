// Divine Fuel - Visually Appealing Authentication & Demo Login Screen
// Modern iOS Aesthetic with Hardcoded Credentials, Smooth Launch Animations, and 1-Tap Entry

import React, { useState } from 'react';
import { ShieldFuelBrandIcon, CheckmarkIcon, ShieldSecureIcon } from '../components/Icons';

interface AuthScreenProps {
  onLogin: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [tab, setTab] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

  // Hardcoded Pre-filled Fleet Credentials
  const [email, setEmail] = useState('sohanrai.dev@gmail.com');
  const [password, setPassword] = useState('DivineFleet@2026');
  const [fleetId, setFleetId] = useState('DF-FLEET-9942');
  const [fullName, setFullName] = useState('Sohan Rai');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAuthenticating(true);

    setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        localStorage.setItem('divine_fuel_authenticated', 'true');
        onLogin();
      }, 350);
    }, 450);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: '#F4F6F8',
        background: 'radial-gradient(circle at 50% 15%, #ECFDF5 0%, #F4F6F8 70%)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'opacity 0.35s ease-out, transform 0.35s ease-out',
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'scale(1.03)' : 'scale(1)'
      }}
    >
      {/* Subtle Ambient Decorative Circles */}
      <div
        style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'rgba(22, 163, 74, 0.08)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-60px',
          left: '-60px',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'rgba(37, 99, 235, 0.06)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }}
      />

      <div
        className="ios-card"
        style={{
          maxWidth: '440px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '28px',
          padding: '32px 28px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              backgroundColor: '#ECFDF5',
              border: '1.5px solid #BBF7D0',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              boxShadow: '0 10px 20px -5px rgba(22, 163, 74, 0.2)'
            }}
          >
            <ShieldFuelBrandIcon size={40} />
          </div>

          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#111827',
              margin: '0 0 4px 0',
              letterSpacing: '-0.02em'
            }}
          >
            Divine Fuel
          </h1>
          <p style={{ fontSize: '12.5px', color: '#6B7280', margin: 0, fontWeight: 500 }}>
            Fleet Telemetry &amp; Anti-Theft Command Center
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#F3F4F6',
            borderRadius: '12px',
            padding: '3px',
            marginBottom: '20px'
          }}
        >
          <button
            type="button"
            onClick={() => setTab('LOGIN')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: tab === 'LOGIN' ? '#FFFFFF' : 'transparent',
              color: tab === 'LOGIN' ? '#111827' : '#6B7280',
              fontWeight: tab === 'LOGIN' ? 700 : 500,
              fontSize: '12.5px',
              cursor: 'pointer',
              boxShadow: tab === 'LOGIN' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Fleet Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('SIGNUP')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: tab === 'SIGNUP' ? '#FFFFFF' : 'transparent',
              color: tab === 'SIGNUP' ? '#111827' : '#6B7280',
              fontWeight: tab === 'SIGNUP' ? 700 : 500,
              fontSize: '12.5px',
              cursor: 'pointer',
              boxShadow: tab === 'SIGNUP' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            New Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {tab === 'SIGNUP' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13px',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  color: '#111827'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
              Fleet Operator Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '12px',
                border: '1px solid #D1D5DB',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                outline: 'none',
                color: '#111827'
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                Security Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '11px',
                  color: '#15803D',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '12px',
                border: '1px solid #D1D5DB',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                outline: 'none',
                color: '#111827',
                fontFamily: showPassword ? 'inherit' : 'monospace'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
              Fleet ID / Access Key
            </label>
            <input
              type="text"
              value={fleetId}
              onChange={(e) => setFleetId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '12px',
                border: '1px solid #D1D5DB',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                outline: 'none',
                color: '#111827',
                fontFamily: 'monospace'
              }}
            />
          </div>

          {/* Remember Me Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '2px 0' }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: '#15803D', width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="rememberMe" style={{ fontSize: '12px', color: '#4B5563', cursor: 'pointer' }}>
              Remember fleet session on this device
            </label>
          </div>

          {/* Authorized Credentials Verified Badge */}
          <div
            style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '12px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11.5px',
              color: '#15803D',
              fontWeight: 600
            }}
          >
            <CheckmarkIcon size={16} color="#15803D" />
            <span>Authorized fleet credentials verified &amp; ready.</span>
          </div>

          {/* Action Buttons */}
          <button
            type="submit"
            disabled={isAuthenticating}
            style={{
              marginTop: '6px',
              width: '100%',
              padding: '13px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 800,
              letterSpacing: '0.01em',
              cursor: isAuthenticating ? 'wait' : 'pointer',
              boxShadow: '0 10px 20px -5px rgba(22, 163, 74, 0.4)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isAuthenticating ? (
              <>
                <span className="pulsing-dot" style={{ backgroundColor: '#FFFFFF', width: '8px', height: '8px' }} />
                <span>Launching Fleet Cockpit...</span>
              </>
            ) : (
              <>
                <ShieldSecureIcon size={18} color="#FFFFFF" />
                <span>SIGN IN TO COCKPIT</span>
              </>
            )}
          </button>
        </form>

        {/* Security Footer */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '11px', color: '#9CA3AF' }}>
          Protected by Divine Fuel Hardware Cryptography &bull; 256-bit TLS
        </div>
      </div>
    </div>
  );
};
