// Primary Vehicle Cockpit Dashboard
// Pixel-Perfect Implementation Matching Mobile Mockup Design:
// 1. Vehicle Selector Dropdown Card
// 2. Fuel Level Hero Card with Circular Ring Arc Gauge & Litres
// 3. Ignition / Security / Last Update 3-Card Triad
// 4. Location Card with Map Preview, Geofence Halo & Google Maps Link
// 5. Fuel Trend (Last 24 Hours) Area Chart
// 6. Recent Alert & Current Location Duo Cards
// 7. Open Live Location Action Card

import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { InteractiveRouteMap } from '../components/InteractiveRouteMap';
import {
  FuelPumpIcon,
  CarChassisIcon,
  ChevronRightIcon,
  ArrowDownTrendIcon,
  PowerCircleIcon,
  SecurityShieldIcon,
  BarChartSignalIcon,
  ExternalLinkIcon,
  FoldedMapIcon,
  WarningAlertBoxIcon,
  LocationPinBoxIcon
} from '../components/Icons';
import type { ScreenId } from '../components/Navigation';

interface DashboardScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const {
    vehicles,
    activeVehicleId: _activeVehicleId,
    vehicle,
    switchVehicle,
    updateActiveVehicle: _updateActiveVehicle,
    fuel,
    fuelHistory,
    security,
    gps,
    hardwarePins,
    trips,
    alerts,
    blynkConfig,
    isHardwareOnline,
    triggerHardwareSync
  } = useTelemetry();

  const totalTripsDistance = trips.reduce((acc, t) => acc + t.distanceKm, 0);
  const totalTripsBurn = trips.reduce((acc, t) => acc + t.fuelConsumedLitres, 0);
  const totalTripsLost = trips.reduce((acc, t) => acc + t.fuelLostLitres, 0);

  // Google Maps link pointing directly to vehicle coordinates
  const gmapsUrl = (hardwarePins.v5 && hardwarePins.v5.startsWith('http'))
    ? hardwarePins.v5
    : `https://www.google.com/maps/search/?api=1&query=${gps.latitude},${gps.longitude}`;

  // Helper to calculate circular ring arc path (270 deg sweep, 135 deg to 405 deg)
  const clampedPct = Math.max(0, Math.min(100, fuel.percentage));
  const polarToCartesian = (cx: number, cy: number, r: number, deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  };

  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  const ringTrackPath = describeArc(41, 41, 31, 135, 405);
  const ringActivePath = describeArc(41, 41, 31, 135, 135 + Math.max(2, (clampedPct / 100) * 270));

  // Real Hourly Fuel Consumption / Refill Delta
  const oneHourAgo = Date.now() - 3600000;
  const historyPoint1Hr = fuelHistory.find((p) => p.timestamp <= oneHourAgo) || fuelHistory[0];
  const hourlyDelta = historyPoint1Hr ? Math.round((clampedPct - historyPoint1Hr.percentage) * 10) / 10 : 0;

  // Dynamic Real Device Connectivity Elapsed Time
  const getLastSyncText = () => {
    if (!blynkConfig.lastSyncTime) {
      return isHardwareOnline ? 'Just now' : 'Awaiting Link';
    }
    const elapsedSec = Math.floor((Date.now() - blynkConfig.lastSyncTime) / 1000);
    if (elapsedSec < 10) return 'Just now';
    if (elapsedSec < 60) return `${elapsedSec}s ago`;
    const elapsedMin = Math.floor(elapsedSec / 60);
    if (elapsedMin < 60) return `${elapsedMin}m ago`;
    return new Date(blynkConfig.lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="dashboard-page-container">
      <div className="dashboard-desktop-grid">
        {/* LEFT COLUMN: VEHICLE HEADER, HERO FUEL & TRIAD */}
        <div className="dashboard-col-left">
          {/* 1. VEHICLE HEADER CARD (CLEAN & STATIONARY) */}
          <div className="ios-card vehicle-selector-card" style={{ cursor: 'default' }}>
            <div className="vehicle-info-left">
              <div className="vehicle-car-icon-box">
                <CarChassisIcon size={22} color="#15803D" />
              </div>
              <div className="vehicle-text-group">
                <div className="vehicle-name">{vehicle.name}</div>
                <div className="vehicle-plate">
                  <span>{vehicle.plate}</span> &bull; <span>{vehicle.tankCapacityLitres}L Tank</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigate('setup')}
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#15803D',
                backgroundColor: '#ECFDF5',
                border: '1px solid #BBF7D0',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Manage Units
            </button>
          </div>

          {/* DUAL ESP32 QUICK UNIT SELECTOR */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              backgroundColor: '#F1F5F9',
              padding: '4px',
              borderRadius: '12px',
              marginTop: '-4px',
              marginBottom: '6px'
            }}
          >
            {vehicles.slice(0, 3).map((v) => {
              const isSelected = v.id === vehicle.id;
              return (
                <button
                  key={v.id}
                  onClick={() => switchVehicle(v.id)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 6px',
                    borderRadius: '9px',
                    border: isSelected ? '1.5px solid #16A34A' : '1px solid transparent',
                    backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                    boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    color: isSelected ? '#15803D' : '#64748B',
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{v.name.toLowerCase().includes('ertiga') ? '🚗' : v.name.toLowerCase().includes('test') ? '🧪' : '🚙'}</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {v.name}
                  </span>
                  {isSelected && (
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: isHardwareOnline ? '#16A34A' : '#94A3B8'
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* HARDWARE CONNECTION STATUS PILL */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '12px',
              backgroundColor: isHardwareOnline ? '#F0FDF4' : '#FEF2F2',
              border: `1px solid ${isHardwareOnline ? '#BBF7D0' : '#FECACA'}`,
              marginBottom: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isHardwareOnline ? '#16A34A' : '#DC2626'
                }}
              />
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: isHardwareOnline ? '#15803D' : '#DC2626' }}>
                {isHardwareOnline ? 'Device Online • Live Telemetry' : 'Device Offline (Awaiting Connection)'}
              </span>
            </div>
            <button
              onClick={triggerHardwareSync}
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                color: isHardwareOnline ? '#15803D' : '#6B7280',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Ping
            </button>
          </div>

          {/* 2. FUEL LEVEL HERO CARD (WITH CIRCULAR RING GAUGE) */}
          <div className="ios-card fuel-level-hero-card">
            {/* Left: Circular Ring Arc Gauge */}
            <div className="ring-gauge-container">
              <svg width="82" height="82" viewBox="0 0 82 82">
                <path
                  d={ringTrackPath}
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <path
                  d={ringActivePath}
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              </svg>
              <div className="ring-gauge-icon">
                <FuelPumpIcon size={22} color="#15803D" />
              </div>
            </div>

            {/* Center: Text Readout */}
            <div className="fuel-text-col">
              <div className="fuel-label">Fuel Level</div>
              <div className="fuel-percentage">{clampedPct.toFixed(0)}%</div>
              <div className="fuel-litres">≈ {fuel.litres.toFixed(0)} litres</div>
            </div>

            {/* Right: Trend Pill Badge */}
            <div className="trend-badge-pill">
              <div className="trend-badge-top" style={{ color: hourlyDelta < 0 ? '#DC2626' : '#15803D' }}>
                {hourlyDelta < 0 ? (
                  <ArrowDownTrendIcon size={12} color="#DC2626" />
                ) : (
                  <span style={{ fontSize: '12px', fontWeight: 800 }}>&bull;</span>
                )}
                <span>{hourlyDelta === 0 ? '0.0%' : hourlyDelta > 0 ? `+${hourlyDelta}%` : `${hourlyDelta}%`}</span>
              </div>
              <div className="trend-badge-sub">
                {hourlyDelta === 0 ? 'Stable in 1 hr' : hourlyDelta < 0 ? 'in last 1 hr' : 'Refueled'}
              </div>
            </div>
          </div>

          {/* 3. TRIAD STATUS CARDS (IGNITION, SECURITY, LAST UPDATE) */}
          <div className="metrics-triad-grid">
            {/* Ignition Card */}
            <div className="ios-card metric-mini-card">
              <PowerCircleIcon size={34} isOn={security.ignition === 'ON'} />
              <div className="metric-label">Ignition</div>
              <div className="metric-value">{security.ignition === 'ON' ? 'ON' : 'OFF'}</div>
              <div className="metric-sub">{security.ignition === 'ON' ? 'Engine is on' : 'Engine is off'}</div>
            </div>

            {/* Security Card */}
            <div className="ios-card metric-mini-card">
              <SecurityShieldIcon size={34} isSecure={security.tamper === 'SECURE'} />
              <div className="metric-label">Security</div>
              <div
                className="metric-value"
                style={{ color: security.tamper === 'SECURE' ? '#16A34A' : '#DC2626' }}
              >
                {security.tamper === 'SECURE' ? 'Normal' : 'Tamper'}
              </div>
              <div className="metric-sub">
                {security.tamper === 'SECURE' ? 'No tamper detected' : 'Tamper loop cut!'}
              </div>
            </div>

            {/* Last Update Card */}
            <div className="ios-card metric-mini-card">
              <BarChartSignalIcon size={34} />
              <div className="metric-label">Last Update</div>
              <div className="metric-value">{getLastSyncText()}</div>
              <div className="metric-sub">{isHardwareOnline ? 'Device Live' : 'Device Offline'}</div>
            </div>
          </div>

          {/* 6. DUO ACTION / INFO CARDS (RECENT ALERT & CURRENT LOCATION) */}
          <div className="action-cards-duo-grid">
            {/* Card Left: Recent Alert */}
            <div
              className="ios-card action-split-card"
              onClick={() => onNavigate('alerts')}
              title="Open Security Alerts"
            >
              <div className="action-split-content">
                {alerts.length > 0 ? (
                  <WarningAlertBoxIcon size={36} />
                ) : (
                  <SecurityShieldIcon size={36} isSecure={true} />
                )}
                <div className="action-split-text">
                  <div className="action-card-label">
                    {alerts.length > 0 ? `Active Alert (${alerts.length})` : 'Security Status'}
                  </div>
                  <div
                    className="action-card-val"
                    style={{ color: alerts.length > 0 ? '#DC2626' : '#15803D' }}
                  >
                    {alerts.length > 0 ? alerts[0].title : 'Perimeter Secure'}
                  </div>
                  <div className="action-card-sub">
                    {alerts.length > 0 ? (
                      <>
                        {alerts[0].description}<br />
                        {new Date(alerts[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </>
                    ) : (
                      'No active alerts • Zero fuel loss'
                    )}
                  </div>
                </div>
              </div>
              <ChevronRightIcon size={16} color="#9CA3AF" />
            </div>

            {/* Card Right: Current Location */}
            <div
              className="ios-card action-split-card"
              onClick={() => onNavigate('location')}
              title="Open GPS Location Map"
            >
              <div className="action-split-content">
                <LocationPinBoxIcon size={36} />
                <div className="action-split-text">
                  <div className="action-card-label">Current Location</div>
                  <div className="action-card-val">
                    {gps.latitude.toFixed(4)}, {gps.longitude.toFixed(4)}
                  </div>
                  <div className="action-card-sub">
                    Live GPS Telemetry<br />{gps.satellitesInView} Satellites
                  </div>
                </div>
              </div>
              <ChevronRightIcon size={16} color="#9CA3AF" />
            </div>
          </div>

          {/* 7. OPEN LIVE LOCATION ACTION CARD */}
          <a
            href={gmapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ios-card open-live-location-btn"
          >
            <div className="live-loc-left">
              <FoldedMapIcon size={22} color="#15803D" />
              <span className="live-loc-text">Open Live Location</span>
            </div>
            <ChevronRightIcon size={18} color="#15803D" />
          </a>
        </div>

        {/* RIGHT COLUMN: REAL LEAFLET MAP, TRAVEL AUDIT & FUEL TREND */}
        <div className="dashboard-col-right">
          {/* 4. LOCATION CARD WITH INTERACTIVE LEAFLET MAP */}
          <div className="ios-card location-card">
            <div className="location-card-header">
              <span className="section-title">Live GPS Location</span>
              <a
                href={gmapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="view-gmaps-link"
              >
                <span>View in Google Maps</span>
                <ExternalLinkIcon size={13} color="#16A34A" />
              </a>
            </div>

            <InteractiveRouteMap
              center={[gps.latitude || 19.0760, gps.longitude || 72.8777]}
              vehicleLat={gps.latitude}
              vehicleLng={gps.longitude}
              vehicleName={vehicle.name}
              height={230}
              gmapsUrl={gmapsUrl}
            />
          </div>

      {/* 5. FUEL TREND (LAST 24 HOURS) AREA CHART CARD */}
      <div className="ios-card fuel-trend-card">
        <div className="fuel-trend-header">
          <div className="trend-title-group">
            <span className="section-title">Fuel Trend</span>
            <span className="section-subtitle">(Last 24 Hours)</span>
          </div>
          <button
            className="view-details-btn"
            onClick={() => onNavigate('fuel')}
            title="Open Fuel Telemetry Analytics"
          >
            <span>View Details</span>
            <ChevronRightIcon size={14} color="#16A34A" />
          </button>
        </div>

        {/* Smooth Area Chart */}
        <div className="fuel-trend-chart">
          <svg viewBox="0 0 340 120" className="trend-svg">
            <defs>
              <linearGradient id="fuelTrendAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16A34A" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#16A34A" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines */}
            <line x1="32" y1="20" x2="330" y2="20" stroke="#F3F4F6" strokeWidth="1" />
            <line x1="32" y1="58" x2="330" y2="58" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="32" y1="96" x2="330" y2="96" stroke="#F3F4F6" strokeWidth="1" />

            {/* Y-axis Labels */}
            <text x="24" y="24" fill="#9CA3AF" fontSize="9" textAnchor="end" fontFamily="inherit">100%</text>
            <text x="24" y="62" fill="#9CA3AF" fontSize="9" textAnchor="end" fontFamily="inherit">50%</text>
            <text x="24" y="100" fill="#9CA3AF" fontSize="9" textAnchor="end" fontFamily="inherit">0%</text>

            {/* Area Fill */}
            <path
              d="M 32 30 L 175 38 L 195 56 L 315 62 L 315 96 L 32 96 Z"
              fill="url(#fuelTrendAreaGrad)"
            />

            {/* Green Line Curve */}
            <path
              d="M 32 30 L 175 38 L 195 56 L 315 62"
              fill="none"
              stroke="#16A34A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Current End Dot & Percentage Tag */}
            <circle cx="315" cy="62" r="4.5" fill="#16A34A" stroke="#FFFFFF" strokeWidth="2" />
            <text
              x="315"
              y="52"
              fill="#15803D"
              fontSize="10.5"
              fontWeight="800"
              textAnchor="middle"
              fontFamily="inherit"
            >
              {clampedPct.toFixed(0)}%
            </text>

            {/* X-axis Timeline Labels */}
            <text x="35" y="114" fill="#9CA3AF" fontSize="8.5" fontFamily="inherit">12 AM</text>
            <text x="88" y="114" fill="#9CA3AF" fontSize="8.5" fontFamily="inherit">4 AM</text>
            <text x="145" y="114" fill="#9CA3AF" fontSize="8.5" fontFamily="inherit">8 AM</text>
            <text x="200" y="114" fill="#9CA3AF" fontSize="8.5" fontFamily="inherit">12 PM</text>
            <text x="255" y="114" fill="#9CA3AF" fontSize="8.5" fontFamily="inherit">4 PM</text>
            <text x="305" y="114" fill="#9CA3AF" fontSize="8.5" fontFamily="inherit">8 PM</text>
          </svg>
        </div>
      </div>

      {/* 5b. TRAVELLED DISTANCE & FUEL AUDIT CARD */}
      <div
        className="ios-card"
        onClick={() => onNavigate('location')}
        style={{ cursor: 'pointer', marginBottom: '12px', padding: '14px 16px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FoldedMapIcon size={20} color="#15803D" />
            <span className="section-title">Travel &amp; Fuel Audit</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16A34A', fontSize: '12px', fontWeight: 600 }}>
            <span>View Routes</span>
            <ChevronRightIcon size={14} color="#16A34A" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', backgroundColor: '#F9FAFB', padding: '10px 8px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10.5px', color: '#6B7280', fontWeight: 600 }}>TRAVELLED</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#111827', marginTop: '1px' }}>
              {totalTripsDistance.toFixed(1)} <span style={{ fontSize: '10px', color: '#6B7280' }}>KM</span>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10.5px', color: '#15803D', fontWeight: 600 }}>CONSUMED</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#15803D', marginTop: '1px' }}>
              {totalTripsBurn.toFixed(1)} <span style={{ fontSize: '10px' }}>L</span>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10.5px', color: totalTripsLost > 0 ? '#DC2626' : '#6B7280', fontWeight: 600 }}>LOST DRAIN</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: totalTripsLost > 0 ? '#DC2626' : '#111827', marginTop: '1px' }}>
              {totalTripsLost > 0 ? `-${totalTripsLost}L` : '0.0 L'}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  );
};
