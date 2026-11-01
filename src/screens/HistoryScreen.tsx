// Vehicle Fuel & Security Event Audit History
// Sleek Modern iOS Design with Timeline Logs and CSV Export

import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { HistoryLogIcon, ExportCsvIcon, FuelPumpIcon, DropAlertIcon, WarningAlertBoxIcon } from '../components/Icons';

export const HistoryScreen: React.FC = () => {
  const { history, exportHistoryCsv, clearHistory, vehicle } = useTelemetry();
  const [filter, setFilter] = useState<'ALL' | 'FUEL_FILL' | 'FUEL_DRAIN' | 'SECURITY_ALARM'>('ALL');

  const filteredHistory = history.filter((e) => {
    if (filter === 'ALL') return true;
    return e.type === filter;
  });

  // Calculate totals
  const totalRefilled = history
    .filter((e) => e.type === 'FUEL_FILL')
    .reduce((acc, curr) => acc + curr.deltaLitres, 0);

  const totalDrained = history
    .filter((e) => e.deltaLitres < 0)
    .reduce((acc, curr) => acc + Math.abs(curr.deltaLitres), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 14px' }}>
      {/* 1. AGGREGATE SUMMARY CARD */}
      <div className="ios-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>
              Historical Telemetry Logs
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              Audit trail for {vehicle.name} ({vehicle.plate})
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={exportHistoryCsv}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                backgroundColor: '#15803D',
                color: '#FFFFFF',
                borderRadius: '8px',
                border: 'none',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <ExportCsvIcon size={13} color="#FFFFFF" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm('Clear all stored historical event records?')) {
                  clearHistory();
                }
              }}
              style={{
                padding: '6px 10px',
                backgroundColor: '#F3F4F6',
                color: '#6B7280',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* 3 Metrics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
          <div style={{ backgroundColor: '#F0FDF4', borderRadius: '12px', padding: '10px 8px', textAlign: 'center', border: '1px solid #DCFCE7' }}>
            <div style={{ fontSize: '10.5px', color: '#15803D', fontWeight: 600 }}>REFILLED</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#15803D', marginTop: '2px' }}>
              +{totalRefilled.toFixed(1)} L
            </div>
            <div style={{ fontSize: '10px', color: '#15803D' }}>Total added</div>
          </div>

          <div style={{ backgroundColor: '#FEF2F2', borderRadius: '12px', padding: '10px 8px', textAlign: 'center', border: '1px solid #FEE2E2' }}>
            <div style={{ fontSize: '10.5px', color: '#DC2626', fontWeight: 600 }}>CONSUMED/LOST</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#DC2626', marginTop: '2px' }}>
              -{totalDrained.toFixed(1)} L
            </div>
            <div style={{ fontSize: '10px', color: '#DC2626' }}>Trips &amp; Siphons</div>
          </div>

          <div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '10px 8px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '10.5px', color: '#6B7280', fontWeight: 600 }}>TOTAL EVENTS</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginTop: '2px' }}>
              {history.length}
            </div>
            <div style={{ fontSize: '10px', color: '#6B7280' }}>Audit events</div>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['ALL', 'FUEL_FILL', 'SECURITY_ALARM'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: filter === tab ? '1.5px solid #16A34A' : '1px solid #E5E7EB',
                backgroundColor: filter === tab ? '#F0FDF4' : '#FFFFFF',
                color: filter === tab ? '#15803D' : '#6B7280',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {tab.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 2. TIMELINE EVENTS LIST */}
      <div className="ios-card" style={{ padding: '16px' }}>
        <div style={{ fontSize: '15px', fontWeight: 800, color: '#111827', marginBottom: '10px' }}>
          Activity Timeline
        </div>

        {filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 10px', color: '#6B7280' }}>
            <HistoryLogIcon size={32} color="#9CA3AF" />
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginTop: '6px' }}>
              No Historical Logs Found
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredHistory.map((item) => {
              const isFill = item.deltaLitres > 0;
              const isAlarm = item.type === 'SECURITY_ALARM';

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #F3F4F6'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: isAlarm ? '#FEE2E2' : isFill ? '#DCFCE7' : '#EFF6FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {isAlarm ? (
                        <WarningAlertBoxIcon size={20} />
                      ) : isFill ? (
                        <FuelPumpIcon size={18} color="#15803D" />
                      ) : (
                        <DropAlertIcon size={18} color="#2563EB" />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827' }}>
                        {item.summary}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '1px' }}>
                        {new Date(item.timestamp).toLocaleString()} &middot; {item.locationName}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 800,
                        color: isFill ? '#15803D' : '#DC2626'
                      }}
                    >
                      {isFill ? `+${item.deltaLitres.toFixed(1)}L` : `${item.deltaLitres.toFixed(1)}L`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
