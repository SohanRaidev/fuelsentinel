// Automotive Mechanical Fuel Dial Gauge Component
// Engineered Circular Instrument Cluster with Needle, Zone Sectors (E, 1/4, 1/2, 3/4, F), and Digital Volume Readout

import React from 'react';
import { FuelPumpIcon } from './Icons';

interface FuelDialGaugeProps {
  litres: number;
  capacityLitres: number;
  percentage: number;
  resistanceOhms?: number;
}

export const FuelDialGauge: React.FC<FuelDialGaugeProps> = ({
  litres,
  capacityLitres,
  percentage,
  resistanceOhms
}) => {
  // Clamp percentage between 0 and 100
  const clampedPct = Math.max(0, Math.min(100, percentage));

  // Needle angle: -120deg (Empty) to +120deg (Full), 240deg sweep
  const needleAngle = -120 + clampedPct * 2.4;

  // Status classification
  const isReserve = clampedPct <= 15;
  const isLow = clampedPct > 15 && clampedPct <= 30;
  const needleColor = isReserve
    ? 'var(--accent-critical)'
    : isLow
    ? 'var(--accent-warning)'
    : 'var(--accent-secure)';

  const statusText = isReserve
    ? 'RESERVE WARNING'
    : isLow
    ? 'LOW FUEL'
    : 'OPTIMAL LEVEL';

  // Center (cx, cy) = (150, 140), Radius = 100
  const cx = 150;
  const cy = 140;
  const r = 96;

  // Helper to convert polar angle (degrees, 0 = 12 o'clock) to SVG (x, y)
  const polarToCartesian = (deg: number, radius = r) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x: cx + radius * Math.sin(rad),
      y: cy - radius * Math.cos(rad)
    };
  };

  // SVG arc path generator from startAngle to endAngle
  const describeArc = (startAngle: number, endAngle: number, radius = r) => {
    const start = polarToCartesian(startAngle, radius);
    const end = polarToCartesian(endAngle, radius);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  // Arc sectors:
  // Reserve: -120 to -84 (0% to 15%)
  // Low: -84 to -48 (15% to 30%)
  // Optimal: -48 to +120 (30% to 100%)
  const reserveArc = describeArc(-120, -84);
  const lowArc = describeArc(-84, -48);
  const optimalArc = describeArc(-48, 120);

  // Active filled progress arc
  const activeArc = describeArc(-120, needleAngle);

  // Ticks at key markings: Empty (-120), Reserve (-84), 1/4 (-60), 1/2 (0), 3/4 (+60), Full (+120)
  const ticks = [
    { angle: -120, label: 'E', major: true, color: 'var(--accent-critical)' },
    { angle: -84, label: '', major: false, color: 'var(--accent-critical)' },
    { angle: -60, label: '1/4', major: true, color: 'var(--ink-secondary)' },
    { angle: -30, label: '', major: false, color: 'var(--ink-muted)' },
    { angle: 0, label: '1/2', major: true, color: 'var(--ink-primary)' },
    { angle: 30, label: '', major: false, color: 'var(--ink-muted)' },
    { angle: 60, label: '3/4', major: true, color: 'var(--ink-secondary)' },
    { angle: 90, label: '', major: false, color: 'var(--ink-muted)' },
    { angle: 120, label: 'F', major: true, color: 'var(--accent-secure)' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{ width: '100%', maxWidth: '320px', position: 'relative' }}>
        <svg
          viewBox="0 0 300 242"
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        >
          {/* Outer Gauge Bezel Ring */}
          <path
            d={describeArc(-124, 124, 108)}
            fill="none"
            stroke="var(--border-color)"
            strokeWidth="2.5"
            strokeLinecap="square"
          />

          {/* Background Track Sectors */}
          {/* Reserve Zone (0-15%) */}
          <path
            d={reserveArc}
            fill="none"
            stroke="var(--accent-critical)"
            strokeWidth="10"
            strokeLinecap="butt"
            opacity="0.35"
          />
          {/* Low Zone (15-30%) */}
          <path
            d={lowArc}
            fill="none"
            stroke="var(--accent-warning)"
            strokeWidth="10"
            strokeLinecap="butt"
            opacity="0.35"
          />
          {/* Optimal Zone (30-100%) */}
          <path
            d={optimalArc}
            fill="none"
            stroke="var(--accent-secure)"
            strokeWidth="10"
            strokeLinecap="butt"
            opacity="0.35"
          />

          {/* Active Filled Gauge Arc */}
          <path
            d={activeArc}
            fill="none"
            stroke={needleColor}
            strokeWidth="10"
            strokeLinecap="butt"
          />

          {/* Radial Tick Marks & Labels */}
          {ticks.map((t, i) => {
            const p1 = polarToCartesian(t.angle, t.major ? 108 : 105);
            const p2 = polarToCartesian(t.angle, t.major ? 88 : 92);
            const textPos = polarToCartesian(t.angle, 122);

            return (
              <g key={i}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={t.color}
                  strokeWidth={t.major ? 2.5 : 1.5}
                />
                {t.label && (
                  <text
                    x={textPos.x}
                    y={textPos.y + 4}
                    fill={t.color}
                    fontSize={t.label === 'E' || t.label === 'F' ? '14' : '11'}
                    fontFamily="var(--font-mono)"
                    fontWeight="800"
                    textAnchor="middle"
                  >
                    {t.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Stamped Fuel Pump Icon */}
          <g transform="translate(142, 86)">
            <FuelPumpIcon size={16} color="var(--ink-secondary)" />
          </g>

          {/* Mechanical Needle */}
          <g
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              transform: `rotate(${needleAngle}deg)`,
              transition: 'transform 0.6s cubic-bezier(0.2, 0.9, 0.3, 1.15)'
            }}
          >
            {/* Needle Body */}
            <polygon
              points={`${cx - 4.5},${cy} ${cx},${cy - 82} ${cx + 4.5},${cy} ${cx},${cy + 16}`}
              fill="var(--ink-primary)"
              stroke="var(--bg-canvas)"
              strokeWidth="1"
            />
            {/* Needle Colored Tip */}
            <polygon
              points={`${cx - 2.5},${cy - 52} ${cx},${cy - 82} ${cx + 2.5},${cy - 52}`}
              fill={needleColor}
            />
            {/* Center Hub Nut */}
            <circle
              cx={cx}
              cy={cy}
              r="11"
              fill="var(--ink-primary)"
              stroke="var(--bg-canvas)"
              strokeWidth="2.5"
            />
            <circle cx={cx} cy={cy} r="4" fill="var(--bg-canvas)" />
          </g>

          {/* Center Digital Display */}
          <text
            x={cx}
            y={cy + 42}
            fill="var(--ink-primary)"
            fontSize="26"
            fontFamily="var(--font-header)"
            fontWeight="800"
            textAnchor="middle"
          >
            {litres.toFixed(1)} <tspan fontSize="13" fill="var(--ink-secondary)" fontFamily="var(--font-mono)">L</tspan>
          </text>

          <text
            x={cx}
            y={cy + 62}
            fill="var(--ink-secondary)"
            fontSize="12"
            fontFamily="var(--font-mono)"
            fontWeight="700"
            textAnchor="middle"
          >
            {clampedPct.toFixed(0)}% &middot; {capacityLitres}L TANK
          </text>

          {/* Status Badge Tag */}
          <rect
            x={cx - 52}
            y={cy + 70}
            width="104"
            height="18"
            fill={isReserve ? 'var(--accent-critical-bg)' : isLow ? 'var(--accent-warning-bg)' : 'var(--accent-secure-bg)'}
            stroke={needleColor}
            strokeWidth="1.2"
          />
          <text
            x={cx}
            y={cy + 83}
            fill={isReserve ? 'var(--accent-critical)' : isLow ? 'var(--accent-warning-ink)' : 'var(--accent-secure)'}
            fontSize="9"
            fontFamily="var(--font-mono)"
            fontWeight="800"
            textAnchor="middle"
          >
            {statusText}
          </text>
        </svg>
      </div>

      {resistanceOhms !== undefined && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
          FLOAT SENSOR: <strong>{resistanceOhms.toFixed(1)} &Omega;</strong>
        </div>
      )}
    </div>
  );
};
