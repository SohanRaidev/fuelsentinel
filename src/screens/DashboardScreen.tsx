// Primary Vehicle Cockpit Dashboard
// Pixel-Perfect Implementation Matching Mobile Mockup Design:
// 1. Vehicle Selector Dropdown Card
// 2. Fuel Level Hero Card with Circular Ring Arc Gauge & Litres
// 3. Ignition / Security / Last Update 3-Card Triad
// 4. Location Card with Map Preview, Geofence Halo & Google Maps Link
// 5. Fuel Trend (Last 24 Hours) Area Chart
// 6. Recent Alert & Current Location Duo Cards
// 7. Open Live Location Action Card

import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { InteractiveRouteMap } from '../components/InteractiveRouteMap';
import {
  FuelPumpIcon,
  CarChassisIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowDownTrendIcon,
  PowerCircleIcon,
  SecurityShieldIcon,
  BarChartSignalIcon,
  ExternalLinkIcon,
  FoldedMapIcon,
  WarningAlertBoxIcon,
  LocationPinBoxIcon,
  CloseIcon,
  SettingsIcon,
  CheckmarkIcon
} from '../components/Icons';
import type { ScreenId } from '../components/Navigation';

interface DashboardScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const {
    vehicles,
    activeVehicleId,
    vehicle,
    switchVehicle,
    updateActiveVehicle,
    fuel,
    security,
    gps,
    hardwarePins,
    trips
  } = useTelemetry();

  const totalTripsDistance = trips.reduce((acc, t) => acc + t.distanceKm, 0);
  const totalTripsBurn = trips.reduce((acc, t) => acc + t.fuelConsumedLitres, 0);
  const totalTripsLost = trips.reduce((acc, t) => acc + t.fuelLostLitres, 0);

  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [editName, setEditName] = useState(vehicle.name);
  const [editPlate, setEditPlate] = useState(vehicle.plate);
  const [editCapacity, setEditCapacity] = useState(String(vehicle.tankCapacityLitres));
  const [editSaved, setEditSaved] = useState(false);

  const openVehicleModal = () => {
    setEditName(vehicle.name);
    setEditPlate(vehicle.plate);
    setEditCapacity(String(vehicle.tankCapacityLitres));
    setEditSaved(false);
    setVehicleModalOpen(true);
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const cap = parseFloat(editCapacity) || 80;
    updateActiveVehicle({
      name: editName.trim() || 'Vehicle 1',
      plate: editPlate.trim().toUpperCase() || 'MH 12 AB 1234',
      tankCapacityLitres: cap
    });
    setEditSaved(true);
    setTimeout(() => {
      setVehicleModalOpen(false);
      setEditSaved(false);
    }, 500);
  };

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

  return (
    <div className="dashboard-page-container">
      <div className="dashboard-desktop-grid">
        {/* LEFT COLUMN: VEHICLE SELECTOR, HERO FUEL & TRIAD */}
        <div className="dashboard-col-left">
          {/* 1. VEHICLE SELECTOR CARD */}
          <div className="ios-card vehicle-selector-card" onClick={openVehicleModal}>
            <div className="vehicle-info-left">
              <div className="vehicle-car-icon-box">
                <CarChassisIcon size={22} color="#111827" />
              </div>
              <div className="vehicle-text-group">
                <div className="vehicle-name">{vehicle.name}</div>
                <div className="vehicle-plate">{vehicle.plate}</div>
              </div>
            </div>
            <ChevronDownIcon size={20} color="#6B7280" />
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
              <div className="trend-badge-top">
                <ArrowDownTrendIcon size={12} color="#15803D" />
                <span>-2%</span>
              </div>
              <div className="trend-badge-sub">in last 1 hr</div>
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
              <div className="metric-value">2 min ago</div>
              <div className="metric-sub">Live Telemetry</div>
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
                <WarningAlertBoxIcon size={36} />
                <div className="action-split-text">
                  <div className="action-card-label">Recent Alert</div>
                  <div className="action-card-val">Fuel drop detected</div>
                  <div className="action-card-sub">
                    Level decreased by 10%<br />9:12 PM
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
                    Mumbai, Maharashtra<br />Live Fix
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

      {/* VEHICLE PROFILE & FLEET SWITCHER MODAL */}
      {vehicleModalOpen && (
        <div className="brutal-modal-backdrop" onClick={() => setVehicleModalOpen(false)}>
          <div
            className="ios-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '420px',
              width: '92%',
              margin: 'auto',
              borderRadius: '20px',
              padding: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SettingsIcon size={18} color="#15803D" />
                <span style={{ fontSize: '17px', fontWeight: 700, color: '#111827' }}>
                  Vehicles &amp; Fleet
                </span>
              </div>
              <button
                onClick={() => setVehicleModalOpen(false)}
                className="header-icon-btn"
                style={{ padding: '4px' }}
              >
                <CloseIcon size={16} color="#6B7280" />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Select Active Vehicle
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {vehicles.map((v) => {
                  const isCur = v.id === activeVehicleId;
                  return (
                    <button
                      key={v.id}
                      onClick={() => switchVehicle(v.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: isCur ? '2px solid #16A34A' : '1px solid #E5E7EB',
                        backgroundColor: isCur ? '#F0FDF4' : '#FFFFFF',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>{v.name}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>{v.plate}</div>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: isCur ? '#15803D' : '#6B7280' }}>
                        {v.tankCapacityLitres}L Tank
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSaveVehicle}>
              <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px' }}>
                Edit Vehicle Details
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#374151', display: 'block', marginBottom: '3px' }}>Vehicle Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                    placeholder="e.g. Vehicle 1"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#374151', display: 'block', marginBottom: '3px' }}>License Plate Number</label>
                  <input
                    type="text"
                    value={editPlate}
                    onChange={(e) => setEditPlate(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                    placeholder="e.g. MH 12 AB 1234"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#374151', display: 'block', marginBottom: '3px' }}>Fuel Tank Capacity (Litres)</label>
                  <input
                    type="number"
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                    placeholder="e.g. 50"
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#15803D',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {editSaved ? <CheckmarkIcon size={16} color="#FFFFFF" /> : null}
                {editSaved ? 'SAVED!' : 'SAVE VEHICLE PROFILE'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
