// Trips, Route Highlighting, Distance & Fuel Consumption / Loss Screen
// Pixel-Perfect Modern iOS UI Theme with Smooth Animations and Interactive Route Visualizer

import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { InteractiveRouteMap } from '../components/InteractiveRouteMap';
import {
  FoldedMapIcon,
  ExternalLinkIcon,
  CheckmarkIcon,
  CloseIcon,
  GpsSatelliteIcon
} from '../components/Icons';

export const LocationScreen: React.FC = () => {
  const {
    gps,
    vehicle,
    hardwarePins,
    trips,
    selectedTripId,
    selectTrip,
    startTrip
  } = useTelemetry();

  const [activeTab, setActiveTab] = useState<'ROUTE_MAP' | 'TRIP_LOG'>('ROUTE_MAP');
  const [newTripModalOpen, setNewTripModalOpen] = useState(false);
  const [tripTitleInput, setTripTitleInput] = useState('');
  const [startLocInput, setStartLocInput] = useState('');
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Selected trip
  const activeTrip = trips.find((t) => t.id === selectedTripId) || trips[0];

  // Aggregate trip analytics
  const totalDistance = trips.reduce((acc, t) => acc + t.distanceKm, 0);
  const totalFuelConsumed = trips.reduce((acc, t) => acc + t.fuelConsumedLitres, 0);
  const totalFuelLost = trips.reduce((acc, t) => acc + t.fuelLostLitres, 0);
  const totalFuelDelta = totalFuelConsumed + totalFuelLost;
  const avgEfficiency = totalFuelConsumed > 0 ? (totalDistance / totalFuelConsumed).toFixed(1) : '8.9';

  // Percentage breakdown of fuel consumed vs fuel lost
  const consumedPercent = totalFuelDelta > 0 ? Math.round((totalFuelConsumed / totalFuelDelta) * 100) : 100;
  const lostPercent = totalFuelDelta > 0 ? Math.round((totalFuelLost / totalFuelDelta) * 100) : 0;

  // Direct Google Maps links
  const gmapsSearchUrl = (hardwarePins.v5 && hardwarePins.v5.startsWith('http'))
    ? hardwarePins.v5
    : `https://www.google.com/maps/search/?api=1&query=${gps.latitude},${gps.longitude}`;
  
  const gmapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${gps.latitude},${gps.longitude}`;

  const selectedRouteGmapsUrl = activeTrip?.waypoints?.length >= 2
    ? `https://www.google.com/maps/dir/?api=1&origin=${activeTrip.waypoints[0].lat},${activeTrip.waypoints[0].lng}&destination=${activeTrip.waypoints[activeTrip.waypoints.length - 1].lat},${activeTrip.waypoints[activeTrip.waypoints.length - 1].lng}`
    : gmapsDirectionsUrl;

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${gps.latitude.toFixed(6)}, ${gps.longitude.toFixed(6)}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleStartTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTrip(tripTitleInput.trim() || 'Live Vehicle Trip', startLocInput.trim() || 'Current Location');
    setTripTitleInput('');
    setStartLocInput('');
    setNewTripModalOpen(false);
  };

  return (
    <div className="location-page-container">
      {/* 2. MOBILE TAB CONTROLS (ROUTE MAP VIEW vs TRIP HISTORY) */}
      <div className="location-mobile-tabs" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#E5E7EB', padding: '4px', borderRadius: '14px' }}>
          <button
            onClick={() => setActiveTab('ROUTE_MAP')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: activeTab === 'ROUTE_MAP' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'ROUTE_MAP' ? '#111827' : '#6B7280',
              fontWeight: 700,
              fontSize: '12.5px',
              cursor: 'pointer',
              boxShadow: activeTab === 'ROUTE_MAP' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Highlighted Route Map
          </button>
          <button
            onClick={() => setActiveTab('TRIP_LOG')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: activeTab === 'TRIP_LOG' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'TRIP_LOG' ? '#111827' : '#6B7280',
              fontWeight: 700,
              fontSize: '12.5px',
              cursor: 'pointer',
              boxShadow: activeTab === 'TRIP_LOG' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Recorded Trips ({trips.length})
          </button>
        </div>
      </div>

      <div className="location-desktop-grid">
        {/* LEFT COLUMN: HIGHLIGHTED ROUTE ON INTERACTIVE MAP */}
        <div className={`location-map-col ${activeTab === 'TRIP_LOG' ? 'mobile-hide' : ''}`}>
          <div className="ios-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>
                  {activeTrip.title}
                </div>
                <div style={{ fontSize: '11.5px', color: '#6B7280' }}>
                  {activeTrip.startLocation} &rarr; {activeTrip.endLocation}
                </div>
              </div>

              <a
                href={selectedRouteGmapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="view-gmaps-link"
                style={{ fontSize: '11.5px' }}
              >
                <span>Launch Route</span>
                <ExternalLinkIcon size={12} color="#16A34A" />
              </a>
            </div>

            {/* Real High-Def Leaflet Interactive Map with Moving Dynamic Route Polyline */}
            <InteractiveRouteMap
              center={[gps.latitude || 19.0760, gps.longitude || 72.8777]}
              waypoints={activeTrip.waypoints}
              routeColor={activeTrip.routeHighlightColor || '#16A34A'}
              vehicleLat={gps.latitude}
              vehicleLng={gps.longitude}
              vehicleName={vehicle.name}
              height={320}
              gmapsUrl={selectedRouteGmapsUrl || gmapsSearchUrl}
            />

            {/* Active Trip Telemetry Chips */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
              <div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '10px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>Trip Date &amp; Duration</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginTop: '1px' }}>
                  {activeTrip.dateStr}
                </div>
              </div>

              <div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '10px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>Fuel Lost During Stop</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: activeTrip.fuelLostLitres > 0 ? '#DC2626' : '#15803D', marginTop: '1px' }}>
                  {activeTrip.fuelLostLitres > 0 ? `-${activeTrip.fuelLostLitres} L (Theft)` : '0.0 L (Secure)'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TRAVEL EFFICIENCY STATS & RECORDED TRIPS LOG */}
        <div className={`location-stats-col ${activeTab === 'ROUTE_MAP' ? 'mobile-hide' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 1. TOP STATS: FUEL CONSUMED VS LOST IN TRAVEL SUMMARY */}
          <div className="ios-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                  Travel &amp; Fuel Efficiency
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '1px' }}>
                  Real-time odometer, driving burn &amp; parked siphon audit
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
                ACTIVE SENSORS
              </span>
            </div>

            {/* 3 Metric Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
              {/* Distance */}
              <div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '10px 8px', textAlign: 'center', border: '1px solid #F3F4F6' }}>
                <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>DISTANCE</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827', marginTop: '2px' }}>
                  {totalDistance.toFixed(1)}
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', marginLeft: '2px' }}>KM</span>
                </div>
                <div style={{ fontSize: '10px', color: '#16A34A', fontWeight: 600, marginTop: '1px' }}>
                  {trips.length} Recorded Trips
                </div>
              </div>

              {/* Fuel Consumed */}
              <div style={{ backgroundColor: '#F0FDF4', borderRadius: '12px', padding: '10px 8px', textAlign: 'center', border: '1px solid #DCFCE7' }}>
                <div style={{ fontSize: '11px', color: '#15803D', fontWeight: 600 }}>CONSUMED</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#15803D', marginTop: '2px' }}>
                  {totalFuelConsumed.toFixed(1)}
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#15803D', marginLeft: '2px' }}>L</span>
                </div>
                <div style={{ fontSize: '10px', color: '#15803D', fontWeight: 600, marginTop: '1px' }}>
                  ~{avgEfficiency} km/L avg
                </div>
              </div>

              {/* Fuel Lost / Siphoned */}
              <div style={{ backgroundColor: totalFuelLost > 0 ? '#FEF2F2' : '#F9FAFB', borderRadius: '12px', padding: '10px 8px', textAlign: 'center', border: totalFuelLost > 0 ? '1px solid #FEE2E2' : '1px solid #F3F4F6' }}>
                <div style={{ fontSize: '11px', color: totalFuelLost > 0 ? '#DC2626' : '#6B7280', fontWeight: 600 }}>LOST / DRAIN</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: totalFuelLost > 0 ? '#DC2626' : '#111827', marginTop: '2px' }}>
                  {totalFuelLost.toFixed(1)}
                  <span style={{ fontSize: '11px', fontWeight: 600, color: totalFuelLost > 0 ? '#DC2626' : '#6B7280', marginLeft: '2px' }}>L</span>
                </div>
                <div style={{ fontSize: '10px', color: totalFuelLost > 0 ? '#DC2626' : '#6B7280', fontWeight: 600, marginTop: '1px' }}>
                  {totalFuelLost > 0 ? 'Siphon Flagged!' : 'No Leaks'}
                </div>
              </div>
            </div>

            {/* Visual Fuel Allocation Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '5px' }}>
                <span style={{ color: '#15803D', fontWeight: 700 }}>
                  • Driving Burn ({consumedPercent}%)
                </span>
                <span style={{ color: totalFuelLost > 0 ? '#DC2626' : '#6B7280', fontWeight: 700 }}>
                  • Parked Loss ({lostPercent}%)
                </span>
              </div>
              <div style={{ height: '8px', borderRadius: '999px', backgroundColor: '#E5E7EB', display: 'flex', overflow: 'hidden' }}>
                <div style={{ width: `${consumedPercent}%`, backgroundColor: '#16A34A', transition: 'width 0.4s ease' }} />
                <div style={{ width: `${lostPercent}%`, backgroundColor: '#DC2626', transition: 'width 0.4s ease' }} />
              </div>
            </div>
          </div>

          {/* 4. RECORDED TRIPS & ROUTES LIST */}
          <div className="ios-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>
              Recorded Trips Log
            </div>
            <div style={{ fontSize: '11.5px', color: '#6B7280' }}>
              Select any trip to view its highlighted route trajectory
            </div>
          </div>

          <button
            onClick={() => setNewTripModalOpen(true)}
            style={{
              backgroundColor: '#15803D',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            + Record Trip
          </button>
        </div>

        {/* Trips List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {trips.map((t) => {
            const isSelected = t.id === selectedTripId;
            return (
              <div
                key={t.id}
                onClick={() => {
                  selectTrip(t.id);
                  setActiveTab('ROUTE_MAP');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  border: isSelected ? '2px solid #16A34A' : '1px solid #E5E7EB',
                  backgroundColor: isSelected ? '#F0FDF4' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: t.fuelLostLitres > 0 ? '#FEE2E2' : '#DCFCE7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <FoldedMapIcon size={18} color={t.fuelLostLitres > 0 ? '#DC2626' : '#15803D'} />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '1px' }}>
                      {t.dateStr} &middot; {t.distanceKm} km
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#111827' }}>
                    {t.fuelConsumedLitres > 0 ? `${t.fuelConsumedLitres} L` : '0 L'}
                  </div>
                  <div style={{ fontSize: '10.5px', fontWeight: 600, color: t.fuelLostLitres > 0 ? '#DC2626' : '#16A34A' }}>
                    {t.fuelLostLitres > 0 ? `-${t.fuelLostLitres}L Lost` : `${t.averageEfficiencyKmL} km/L`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. LIVE GPS RECEIVER STATUS CARD */}
      <div className="ios-card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GpsSatelliteIcon size={18} color="#15803D" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
              NEO-6M GPS Hardware Telemetry
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>
            {gps.satellitesInView} SATELLITES
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', padding: '10px 12px', borderRadius: '12px' }}>
          <div>
            <div style={{ fontSize: '10.5px', color: '#6B7280' }}>COORDINATES &middot; {vehicle.plate}</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginTop: '2px' }}>
              {gps.latitude.toFixed(6)}&deg; N, {gps.longitude.toFixed(6)}&deg; E
            </div>
          </div>

          <button
            onClick={handleCopyCoords}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              backgroundColor: '#FFFFFF',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {copiedCoords ? <CheckmarkIcon size={13} color="#16A34A" /> : 'COPY'}
          </button>
        </div>
      </div>
    </div>
  </div>

      {/* MODAL: RECORD NEW TRIP */}
      {newTripModalOpen && (
        <div className="brutal-modal-backdrop" onClick={() => setNewTripModalOpen(false)}>
          <div
            className="ios-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '400px',
              width: '92%',
              margin: 'auto',
              borderRadius: '20px',
              padding: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '17px', fontWeight: 800, color: '#111827' }}>
                Record New Journey
              </span>
              <button
                onClick={() => setNewTripModalOpen(false)}
                className="header-icon-btn"
                style={{ padding: '4px' }}
              >
                <CloseIcon size={16} color="#6B7280" />
              </button>
            </div>

            <form onSubmit={handleStartTripSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
                    Trip Purpose / Route Name
                  </label>
                  <input
                    type="text"
                    value={tripTitleInput}
                    onChange={(e) => setTripTitleInput(e.target.value)}
                    placeholder="e.g. Afternoon Depot Delivery"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
                    Starting Location
                  </label>
                  <input
                    type="text"
                    value={startLocInput}
                    onChange={(e) => setStartLocInput(e.target.value)}
                    placeholder="e.g. Central Warehouse, Kurla"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '13px' }}
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
                  cursor: 'pointer'
                }}
              >
                START RECORDING TRIP &rarr;
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
