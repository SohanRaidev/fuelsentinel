// Fuel Telemetry, Consumption vs Loss Analytics & Resistance Calibration
// Sleek Modern iOS Architecture with Smooth Visual Gauges and Calibration Controls

import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import {
  FuelPumpIcon,
  DropAlertIcon,
  CheckmarkIcon
} from '../components/Icons';
import { getScaledCalibration } from '../utils/calibration';
import type { FuelSenderStandard, CalibrationPoint } from '../types/telemetry';

export const FuelScreen: React.FC = () => {
  const { vehicle, fuel, fuelHistory, updateVehicleConfig, hardwarePins, trips } = useTelemetry();

  const [selectedStandard, setSelectedStandard] = useState<FuelSenderStandard>(vehicle.senderStandard);
  const [points, setPoints] = useState<CalibrationPoint[]>(vehicle.calibrationPoints);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Switch calibration preset
  const handlePresetChange = (std: FuelSenderStandard) => {
    setSelectedStandard(std);
    const newPoints = getScaledCalibration(std, vehicle.tankCapacityLitres);
    setPoints(newPoints);
  };

  // Update a single calibration point
  const handlePointChange = (index: number, field: 'ohms' | 'litres', val: number) => {
    const updated = [...points];
    updated[index] = { ...updated[index], [field]: val };
    setPoints(updated);
    setSelectedStandard('CUSTOM');
  };

  const handleSaveCalibration = () => {
    updateVehicleConfig({
      senderStandard: selectedStandard,
      calibrationPoints: points
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2400);
  };

  // Calculate total fuel burned vs lost
  const totalTripsDistance = trips.reduce((acc, t) => acc + t.distanceKm, 0);
  const totalTripsBurn = trips.reduce((acc, t) => acc + t.fuelConsumedLitres, 0);
  const totalTripsLost = trips.reduce((acc, t) => acc + t.fuelLostLitres, 0);

  // Circular gauge calculations
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

  const ringTrackPath = describeArc(50, 50, 38, 135, 405);
  const ringActivePath = describeArc(50, 50, 38, 135, 135 + Math.max(2, (clampedPct / 100) * 270));

  // Chart points
  const effectivePoints = fuelHistory && fuelHistory.length >= 2
    ? fuelHistory
    : [
        { timestamp: 1, timeStr: '14:00', litres: fuel.litres + 1.2, percentage: fuel.percentage + 2 },
        { timestamp: 2, timeStr: '15:00', litres: fuel.litres + 0.4, percentage: fuel.percentage + 0.5 },
        { timestamp: 3, timeStr: 'NOW', litres: fuel.litres, percentage: fuel.percentage }
      ];

  const minL = 0;
  const maxL = vehicle.tankCapacityLitres;
  const svgWidth = 320;
  const svgHeight = 110;
  const padX = 25;
  const padY = 15;

  const pointsString = effectivePoints
    .map((pt, i) => {
      const x = padX + (i / (effectivePoints.length - 1)) * (svgWidth - padX * 2);
      const y = svgHeight - padY - ((pt.litres - minL) / (maxL - minL)) * (svgHeight - padY * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 14px' }}>
      {/* 1. HERO FUEL SENSOR OVERVIEW CARD */}
      <div className="ios-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>
              Fuel Telemetry &amp; Tank Fill
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              {vehicle.plate} &middot; {vehicle.tankCapacityLitres}L {vehicle.fuelType} TANK
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
            GPIO 34 ADC
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Circular Ring Gauge */}
          <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <path d={ringTrackPath} fill="none" stroke="#E5E7EB" strokeWidth="8" strokeLinecap="round" />
              <path d={ringActivePath} fill="none" stroke="#16A34A" strokeWidth="8" strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FuelPumpIcon size={22} color="#15803D" />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#111827', marginTop: '2px' }}>
                {clampedPct.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Readout Numbers */}
          <div style={{ flex: 1, marginLeft: '16px' }}>
            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Remaining Volume</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>
              {fuel.litres.toFixed(1)} <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: 600 }}>L</span>
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
              Resistance: <strong style={{ color: '#111827' }}>{fuel.senderResistanceOhms.toFixed(1)} &Omega;</strong>
            </div>
            <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600, marginTop: '2px' }}>
              Estimated Range: ~{fuel.estimatedRangeKm} km
            </div>
          </div>
        </div>
      </div>

      {/* 2. FUEL LOSS VS TRAVEL CONSUMPTION METRICS */}
      <div className="ios-card" style={{ padding: '16px' }}>
        <div style={{ fontSize: '15px', fontWeight: 800, color: '#111827', marginBottom: '2px' }}>
          Fuel Consumption vs Parked Loss
        </div>
        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>
          Tracking consumption across {totalTripsDistance.toFixed(1)} km of travel
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '10px 8px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '10.5px', color: '#6B7280', fontWeight: 600 }}>DRIVING BURN</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#15803D', marginTop: '2px' }}>
              {totalTripsBurn.toFixed(1)} L
            </div>
            <div style={{ fontSize: '10px', color: '#6B7280' }}>8.9 km/L avg</div>
          </div>

          <div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '10px 8px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '10.5px', color: '#6B7280', fontWeight: 600 }}>PARKED BASE</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginTop: '2px' }}>
              {hardwarePins.v7.toFixed(1)}%
            </div>
            <div style={{ fontSize: '10px', color: '#6B7280' }}>Key-off reading</div>
          </div>

          <div style={{ backgroundColor: totalTripsLost > 0 ? '#FEF2F2' : '#F9FAFB', borderRadius: '12px', padding: '10px 8px', textAlign: 'center', border: totalTripsLost > 0 ? '1px solid #FEE2E2' : '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '10.5px', color: totalTripsLost > 0 ? '#DC2626' : '#6B7280', fontWeight: 600 }}>SIPHON DRAIN</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: totalTripsLost > 0 ? '#DC2626' : '#15803D', marginTop: '2px' }}>
              {totalTripsLost > 0 ? `-${totalTripsLost} L` : '0.0 L'}
            </div>
            <div style={{ fontSize: '10px', color: totalTripsLost > 0 ? '#DC2626' : '#16A34A', fontWeight: 600 }}>
              {totalTripsLost > 0 ? 'Theft Drain' : 'Protected'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. FUEL VOLUME STABILITY GRAPH (dL/dt) */}
      <div className="ios-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <DropAlertIcon size={18} color="#15803D" />
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>
              Fuel Stability Curve (dL/dt)
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>
            ROLLING BUFFER
          </span>
        </div>

        <div style={{ width: '100%', overflow: 'hidden' }}>
          <svg viewBox="0 0 320 110" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <linearGradient id="fuelFillGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16A34A" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#16A34A" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <line x1="25" y1="15" x2="305" y2="15" stroke="#F3F4F6" strokeWidth="1" />
            <line x1="25" y1="55" x2="305" y2="55" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="25" y1="95" x2="305" y2="95" stroke="#F3F4F6" strokeWidth="1" />

            <polyline points={pointsString} fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="305" cy={svgHeight - padY - ((fuel.litres - minL) / (maxL - minL)) * (svgHeight - padY * 2)} r="4" fill="#16A34A" stroke="#FFFFFF" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* 4. PIECEWISE RESISTANCE CALIBRATION */}
      <div className="ios-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>
              5-Point Calibration
            </div>
            <div style={{ fontSize: '11.5px', color: '#6B7280' }}>
              Convert float resistance to exact litres
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {(['240-33', '0-190', '0-90'] as FuelSenderStandard[]).map((std) => (
              <button
                key={std}
                onClick={() => handlePresetChange(std)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: selectedStandard === std ? '1.5px solid #16A34A' : '1px solid #E5E7EB',
                  backgroundColor: selectedStandard === std ? '#F0FDF4' : '#FFFFFF',
                  color: selectedStandard === std ? '#15803D' : '#6B7280',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {std}&Omega;
              </button>
            ))}
          </div>
        </div>

        {/* 5-Point Calibration Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
          {points.map((pt, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '10px',
                backgroundColor: '#F9FAFB',
                border: '1px solid #F3F4F6'
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>
                Point #{i + 1} ({i === 0 ? 'Empty' : i === points.length - 1 ? 'Full' : `${(i * 25)}%`})
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  value={pt.ohms}
                  onChange={(e) => handlePointChange(i, 'ohms', parseFloat(e.target.value) || 0)}
                  style={{ width: '60px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12px', textAlign: 'center' }}
                />
                <span style={{ fontSize: '11px', color: '#6B7280' }}>&Omega; &rarr;</span>
                <input
                  type="number"
                  value={pt.litres}
                  onChange={(e) => handlePointChange(i, 'litres', parseFloat(e.target.value) || 0)}
                  style={{ width: '55px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12px', textAlign: 'center' }}
                />
                <span style={{ fontSize: '11px', color: '#6B7280' }}>L</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSaveCalibration}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#15803D',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '13px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          {saveSuccess ? <CheckmarkIcon size={16} color="#FFFFFF" /> : null}
          {saveSuccess ? 'CALIBRATION SAVED' : 'SAVE CALIBRATION SETTINGS'}
        </button>
      </div>
    </div>
  );
};
