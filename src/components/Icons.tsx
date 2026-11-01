// Divine Fuel Bespoke Technical SVG Icons
// Engineered automotive iconography with uniform 2px/2.5px stroke and zero external dependencies

import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

export const FuelPumpIcon: React.FC<IconProps> = ({ size = 20, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <path d="M3 22V4H15V22H3Z" />
    <path d="M6 8H12V12H6V8Z" />
    <path d="M15 8H18C19.1 8 20 8.9 20 10V16C20 17.1 19.1 18 18 18H17" />
    <path d="M19 5L21 7L18 10" />
    <path d="M1 22H17" />
  </svg>
);

export const CanisterIcon: React.FC<IconProps> = ({ size = 20, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <rect x="4" y="6" width="16" height="16" />
    <path d="M7 6V2H17V6" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="8" y1="11" x2="16" y2="19" />
    <line x1="16" y1="11" x2="8" y2="19" />
  </svg>
);

export const ShieldSecureIcon: React.FC<IconProps> = ({ size = 20, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <path d="M12 2L4 6V12C4 17.5 7.4 21.6 12 23C16.6 21.6 20 17.5 20 12V6L12 2Z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

export const ShieldAlertIcon: React.FC<IconProps> = ({ size = 20, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <path d="M12 2L4 6V12C4 17.5 7.4 21.6 12 23C16.6 21.6 20 17.5 20 12V6L12 2Z" />
    <line x1="12" y1="8" x2="12" y2="13" />
    <rect x="11.2" y="16" width="1.6" height="1.6" fill={color} />
  </svg>
);

export const TamperLoopIcon: React.FC<IconProps> = ({ size = 20, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <circle cx="5" cy="18" r="2" />
    <circle cx="19" cy="18" r="2" />
    <path d="M7 18H10V7C10 5.3 11.3 4 13 4H15C16.7 4 18 5.3 18 7V16" />
    <line x1="2" y1="12" x2="7" y2="12" />
    <line x1="17" y1="12" x2="22" y2="12" />
  </svg>
);

export const IgnitionKeyIcon: React.FC<IconProps> = ({ size = 20, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <circle cx="7" cy="12" r="4" />
    <path d="M11 12H21V16H18V12" />
    <line x1="15" y1="12" x2="15" y2="15" />
    <circle cx="7" cy="12" r="1.5" fill={color} />
  </svg>
);

export const GpsSatelliteIcon: React.FC<IconProps> = ({ size = 20, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <rect x="9" y="9" width="6" height="6" />
    <path d="M4 4L9 9" />
    <path d="M20 4L15 9" />
    <path d="M2 2L6 6" />
    <path d="M18 18L22 22" />
    <path d="M9 15L4 20" />
    <path d="M15 15L20 20" />
    <circle cx="12" cy="12" r="1.5" fill={color} />
  </svg>
);

export const DropAlertIcon: React.FC<IconProps> = ({ size = 20, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <path d="M12 2.5C12 2.5 5 11 5 16C5 19.9 8.1 23 12 23C15.9 23 19 19.9 19 16C19 11 12 2.5 12 2.5Z" />
    <polyline points="10 13 12 17 14 13" />
    <line x1="12" y1="10" x2="12" y2="16" />
  </svg>
);

export const SirenIcon: React.FC<IconProps> = ({ size = 20, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <path d="M5 19H19V21H5V19Z" />
    <path d="M6 19C6 14 8.7 10 12 10C15.3 10 18 14 18 19" />
    <path d="M12 2V6" />
    <path d="M4 5L7 7" />
    <path d="M20 5L17 7" />
    <circle cx="12" cy="14" r="2" fill={color} />
  </svg>
);

export const CutoffValveIcon: React.FC<IconProps> = ({ size = 20, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <path d="M2 7L10 12L2 17V7Z" />
    <path d="M22 7L14 12L22 17V7Z" />
    <line x1="12" y1="12" x2="12" y2="4" />
    <line x1="8" y1="4" x2="16" y2="4" />
  </svg>
);

export const BatteryIcon: React.FC<IconProps> = ({ size = 20, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <rect x="2" y="6" width="18" height="14" />
    <line x1="20" y1="10" x2="22" y2="10" />
    <line x1="20" y1="16" x2="22" y2="16" />
    <line x1="6" y1="13" x2="10" y2="13" />
    <line x1="13" y1="13" x2="17" y2="13" />
    <line x1="15" y1="11" x2="15" y2="15" />
  </svg>
);

export const SignalWifiIcon: React.FC<IconProps> = ({ size = 20, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <line x1="4" y1="19" x2="4" y2="16" />
    <line x1="9" y1="19" x2="9" y2="12" />
    <line x1="14" y1="19" x2="14" y2="8" />
    <line x1="19" y1="19" x2="19" y2="4" />
    <line x1="2" y1="21" x2="22" y2="21" />
  </svg>
);

export const DiagnosticsChipIcon: React.FC<IconProps> = ({ size = 20, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <rect x="5" y="5" width="14" height="14" />
    <circle cx="9" cy="9" r="1.5" fill={color} />
    <line x1="1" y1="9" x2="5" y2="9" />
    <line x1="1" y1="15" x2="5" y2="15" />
    <line x1="19" y1="9" x2="23" y2="9" />
    <line x1="19" y1="15" x2="23" y2="15" />
    <line x1="9" y1="1" x2="9" y2="5" />
    <line x1="15" y1="1" x2="15" y2="5" />
    <line x1="9" y1="19" x2="9" y2="23" />
    <line x1="15" y1="19" x2="15" y2="23" />
  </svg>
);

export const MapPinCrosshairIcon: React.FC<IconProps> = ({ size = 20, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <circle cx="12" cy="12" r="7" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <circle cx="12" cy="12" r="2" fill={color} />
  </svg>
);

export const RefreshCycleIcon: React.FC<IconProps> = ({ size = 20, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <path d="M20 11A8 8 0 0 0 6.3 6.3L2 10.5" />
    <polyline points="2 4 2 10.5 8.5 10.5" />
    <path d="M4 13A8 8 0 0 0 17.7 17.7L22 13.5" />
    <polyline points="22 20 22 13.5 15.5 13.5" />
  </svg>
);

export const ExportCsvIcon: React.FC<IconProps> = ({ size = 20, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <path d="M14 2H6V22H18V6L14 2Z" />
    <polyline points="14 2 14 6 18 6" />
    <line x1="12" y1="11" x2="12" y2="18" />
    <polyline points="9 15 12 18 15 15" />
  </svg>
);

export const PhoneDispatchIcon: React.FC<IconProps> = ({ size = 20, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <path d="M22 16.9V20C22 20.6 21.5 21 20.9 21C11.5 20.4 4 12.8 3.5 3.5C3.5 2.9 3.9 2.4 4.5 2.4H7.6C8.1 2.4 8.5 2.8 8.6 3.3C8.8 4.7 9.2 6.1 9.8 7.3C9.9 7.6 9.8 8 9.5 8.3L7.8 9.9C9.3 13 11.8 15.5 14.8 17L16.4 15.3C16.7 15 17.1 14.9 17.4 15C18.6 15.6 20 16 21.4 16.2C21.9 16.3 22.3 16.7 22.3 17.2" />
  </svg>
);

export const CheckmarkIcon: React.FC<IconProps> = ({ size = 20, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <polyline points="4 12 9 17 20 6" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ size = 20, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <line x1="5" y1="5" x2="19" y2="19" />
    <line x1="19" y1="5" x2="5" y2="19" />
  </svg>
);

export const VolumeHighIcon: React.FC<IconProps> = ({ size = 20, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.5 8.5C16.5 9.5 17 10.7 17 12C17 13.3 16.5 14.5 15.5 15.5" />
    <path d="M18.5 5.5C20.3 7.3 21.5 9.5 21.5 12C21.5 14.5 20.3 16.7 18.5 18.5" />
  </svg>
);

export const VolumeMuteIcon: React.FC<IconProps> = ({ size = 20, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="22" y1="9" x2="16" y2="15" />
    <line x1="16" y1="9" x2="22" y2="15" />
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ size = 20, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15A1.6 1.6 0 0 0 19.7 16.8L20.8 17.9A2 2 0 0 1 18 20.7L16.9 19.6A1.6 1.6 0 0 0 15.1 19.3A1.6 1.6 0 0 0 14 20.8V22A2 2 0 0 1 10 22V20.8A1.6 1.6 0 0 0 8.9 19.3A1.6 1.6 0 0 0 7.1 19.6L6 20.7A2 2 0 0 1 3.2 17.9L4.3 16.8A1.6 1.6 0 0 0 4.6 15A1.6 1.6 0 0 0 3.1 13.9H2A2 2 0 0 1 2 10.1H3.1A1.6 1.6 0 0 0 4.6 9A1.6 1.6 0 0 0 4.3 7.2L3.2 6.1A2 2 0 0 1 6 3.3L7.1 4.4A1.6 1.6 0 0 0 8.9 4.7A1.6 1.6 0 0 0 10 3.2V2A2 2 0 0 1 14 2V3.2A1.6 1.6 0 0 0 15.1 4.7A1.6 1.6 0 0 0 16.9 4.4L18 3.3A2 2 0 0 1 20.8 6.1L19.7 7.2A1.6 1.6 0 0 0 19.4 9A1.6 1.6 0 0 0 20.9 10.1H22A2 2 0 0 1 22 13.9H20.9A1.6 1.6 0 0 0 19.4 15Z" />
  </svg>
);

export const CarChassisIcon: React.FC<IconProps> = ({ size = 20, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <path d="M5 11L7 5H17L19 11M5 11H19M5 11V18H7M19 11V18H17" />
    <circle cx="8" cy="18" r="2" />
    <circle cx="16" cy="18" r="2" />
  </svg>
);

export const HistoryLogIcon: React.FC<IconProps> = ({ size = 20, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15 15" />
    <line x1="3" y1="3" x2="6" y2="3" />
    <line x1="3" y1="3" x2="3" y2="6" />
  </svg>
);

export const IgnitionOnIcon: React.FC<IconProps> = ({ size = 24, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 4V12" />
    <circle cx="12" cy="12" r="2.5" fill={color} />
    <line x1="4" y1="12" x2="1" y2="12" />
    <line x1="23" y1="12" x2="20" y2="12" />
  </svg>
);

export const IgnitionOffIcon: React.FC<IconProps> = ({ size = 24, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
    <rect x="9" y="10" width="6" height="5" />
    <path d="M10 10V8C10 6.9 10.9 6 12 6C13.1 6 14 6.9 14 8V10" />
  </svg>
);

export const CompassPointerIcon: React.FC<IconProps & { rotationDegrees?: number }> = ({
  size = 20,
  className = '',
  color = 'currentColor',
  rotationDegrees = 0
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.2"
    strokeLinecap="square"
    strokeLinejoin="miter"
    className={className}
    style={{
      transform: `rotate(${rotationDegrees}deg)`,
      transformOrigin: 'center center',
      transition: 'transform 0.5s cubic-bezier(0.2, 0.9, 0.3, 1)'
    }}
  >
    <polygon points="12 2 17 21 12 17 7 21" fill={color} stroke={color} strokeWidth="1.5" />
    <polygon points="12 2 12 17 7 21" fill="var(--bg-canvas)" opacity="0.4" />
  </svg>
);

// Modern Mobile UI Icons (Matching user mockup)

export const ShieldFuelBrandIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <path
      d="M16 2.5L5 6.5V14.5C5 21.5 9.7 27.5 16 29.5C22.3 27.5 27 21.5 27 14.5V6.5L16 2.5Z"
      fill="#15803D"
    />
    <path
      d="M11 22V10H19V22H11Z"
      fill="#FFFFFF"
    />
    <path
      d="M13 12H17V15H13V12Z"
      fill="#15803D"
    />
    <path
      d="M19 12.5H21C21.6 12.5 22 13 22 13.6V17.5C22 18 21.6 18.5 21 18.5H20"
      stroke="#FFFFFF"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <circle cx="21" cy="11.5" r="1" fill="#FFFFFF" />
  </svg>
);

export const NotificationBellIcon: React.FC<IconProps & { badge?: number | string }> = ({
  size = 22,
  className = '',
  color = '#111827',
  badge
}) => (
  <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
    {badge !== undefined && (
      <span
        style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          backgroundColor: '#DC2626',
          color: '#FFFFFF',
          fontSize: '10px',
          fontWeight: 700,
          borderRadius: '999px',
          minWidth: '16px',
          height: '16px',
          padding: '0 3px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          border: '1.5px solid #FFFFFF'
        }}
      >
        {badge}
      </span>
    )}
  </div>
);

export const UserAvatarIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <circle cx="16" cy="16" r="16" fill="#E5E7EB" />
    <circle cx="16" cy="12" r="5" fill="#6B7280" />
    <path
      d="M7 26C7 21.5 11 19 16 19C21 19 25 21.5 25 26"
      fill="#6B7280"
    />
  </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ size = 18, className = '', color = '#6B7280' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ size = 16, className = '', color = '#9CA3AF' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const ArrowDownTrendIcon: React.FC<IconProps> = ({ size = 14, className = '', color = '#15803D' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);

export const PowerCircleIcon: React.FC<IconProps & { isOn?: boolean }> = ({ size = 36, isOn = false }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: isOn ? '#DCFCE7' : '#FEE2E2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}
  >
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke={isOn ? '#15803D' : '#DC2626'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  </div>
);

export const SecurityShieldIcon: React.FC<IconProps & { isSecure?: boolean }> = ({ size = 36, isSecure = true }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: isSecure ? '#DCFCE7' : '#FEE2E2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}
  >
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke={isSecure ? '#15803D' : '#DC2626'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      {isSecure ? (
        <polyline points="9 12 11 14 15 10" />
      ) : (
        <line x1="12" y1="8" x2="12" y2="14" />
      )}
    </svg>
  </div>
);

export const BarChartSignalIcon: React.FC<IconProps> = ({ size = 36 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: '#EFF6FF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}
  >
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="12" y1="20" x2="12" y2="8" />
      <line x1="18" y1="20" x2="18" y2="4" />
    </svg>
  </div>
);

export const ExternalLinkIcon: React.FC<IconProps> = ({ size = 14, className = '', color = '#15803D' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export const FoldedMapIcon: React.FC<IconProps> = ({ size = 20, className = '', color = '#15803D' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

export const WarningAlertBoxIcon: React.FC<IconProps> = ({ size = 36 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '10px',
      backgroundColor: '#FEE2E2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}
  >
    <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  </div>
);

export const LocationPinBoxIcon: React.FC<IconProps> = ({ size = 36 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: '#F3F4F6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}
  >
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="#111827" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" fill="#FFFFFF" />
    </svg>
  </div>
);

export const HomeNavIcon: React.FC<IconProps> = ({ size = 22, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" fill="#FFFFFF" stroke="#FFFFFF" />
  </svg>
);

export const MenuHamburgerIcon: React.FC<IconProps> = ({ size = 22, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);


