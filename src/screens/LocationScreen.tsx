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
    fuel,
    vehicle,
    hardwarePins,
    trips,
    selectedTripId,
    selectTrip,
    startTrip
  } = useTelemetry();

  const [activeTab, setActiveTab] = useState<'ROUTE_MAP' | 'TRIP_LOG' | 'PLANNER'>('ROUTE_MAP');
  const [newTripModalOpen, setNewTripModalOpen] = useState(false);
  const [tripTitleInput, setTripTitleInput] = useState('');
  const [startLocInput, setStartLocInput] = useState('');
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Route Planner State
  const [plannerDestination, setPlannerDestination] = useState('Central Cargo Hub');
  const [plannerDistanceKm, setPlannerDistanceKm] = useState(24.5);
  const [fuelCostPerLitre] = useState(96.5);

  const vehicleEfficiencyKmL = 8.9;
  const estimatedFuelLitres = Math.round((plannerDistanceKm / vehicleEfficiencyKmL) * 10) / 10;
  const estimatedCost = Math.round(estimatedFuelLitres * fuelCostPerLitre);
  const isFuelSufficient = fuel.litres >= estimatedFuelLitres;

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
      {/* 2. TAB CONTROLS (ROUTE MAP VIEW vs TRIP HISTORY vs ROUTE PLANNER) */}
      <div className="location-mobile-tabs" style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#E5E7EB', padding: '4px', borderRadius: '14px' }}>
          <button
            onClick={() => setActiveTab('ROUTE_MAP')}
            style={{
              flex: 1,
              padding: '8px 8px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: activeTab === 'ROUTE_MAP' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'ROUTE_MAP' ? '#111827' : '#6B7280',
              fontWeight: 700,
              fontSize: '11.5px',
              cursor: 'pointer',
              boxShadow: activeTab === 'ROUTE_MAP' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Route Map
          </button>

          <button
            onClick={() => setActiveTab('TRIP_LOG')}
            style={{
              flex: 1,
              padding: '8px 8px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: activeTab === 'TRIP_LOG' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'TRIP_LOG' ? '#111827' : '#6B7280',
              fontWeight: 700,
              fontSize: '11.5px',
              cursor: 'pointer',
              boxShadow: activeTab === 'TRIP_LOG' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Trips ({trips.length})
          </button>

          <button
            onClick={() => setActiveTab('PLANNER')}
            style={{
              flex: 1,
              padding: '8px 8px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: activeTab === 'PLANNER' ? '#15803D' : 'transparent',
              color: activeTab === 'PLANNER' ? '#FFFFFF' : '#6B7280',
              fontWeight: 700,
              fontSize: '11.5px',
              cursor: 'pointer',
              boxShadow: activeTab === 'PLANNER' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Fuel Planner
          </button>
        </div>
      </div>

      {activeTab === 'PLANNER' ? (
        <div className="ios-card" style={{ padding: '20px', maxWidth: '750px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>
                Route Fuel &amp; Trip Cost Planner
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                Predict exact diesel consumption and travel expense before dispatching vehicle
              </div>
            </div>
            <span
              style={{
                backgroundColor: isFuelSufficient ? '#DCFCE7' : '#FEE2E2',
                color: isFuelSufficient ? '#15803D' : '#DC2626',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '8px'
              }}
            >
              {isFuelSufficient ? 'FUEL SUFFICIENT' : 'REFILL NEEDED'}
            </span>
          </div>

          {/* Quick Presets */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: '6px' }}>
              POPULAR FLEET DESTINATIONS (1-TAP)
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { name: 'Central Air Cargo Hub', dist: 24.5 },
                { name: 'Seaport Container Pier', dist: 18.2 },
                { name: 'North Industrial Park', dist: 36.0 },
                { name: 'City Delivery Loop', dist: 12.4 }
              ].map((dest) => (
                <button
                  key={dest.name}
                  onClick={() => {
                    setPlannerDestination(dest.name);
                    setPlannerDistanceKm(dest.dist);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: plannerDestination === dest.name ? '1.5px solid #16A34A' : '1px solid #E5E7EB',
                    backgroundColor: plannerDestination === dest.name ? '#F0FDF4' : '#FFFFFF',
                    color: plannerDestination === dest.name ? '#15803D' : '#374151',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {dest.name} ({dest.dist} km)
                </button>
              ))}
            </div>
          </div>

          {/* Route Source & Destination Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>SOURCE (VEHICLE GPS)</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginTop: '3px' }}>
                {vehicle.name} ({vehicle.plate})
              </div>
              <div style={{ fontSize: '11px', color: '#16A34A', marginTop: '2px' }}>
                {gps.latitude.toFixed(4)}&deg; N, {gps.longitude.toFixed(4)}&deg; E
              </div>
            </div>

            <div style={{ backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>DESTINATION</div>
              <input
                type="text"
                value={plannerDestination}
                onChange={(e) => setPlannerDestination(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  padding: '6px 8px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  fontSize: '12.5px',
                  fontWeight: 600
                }}
              />
            </div>
          </div>

          {/* Distance Slider */}
          <div style={{ backgroundColor: '#F9FAFB', padding: '14px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#374151' }}>
                Trip Distance: <strong style={{ color: '#15803D' }}>{plannerDistanceKm} KM</strong>
              </span>
              <span style={{ fontSize: '11.5px', color: '#6B7280' }}>
                Est. Driving Time: ~{Math.round((plannerDistanceKm / 42) * 60)} min
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="150"
              step="0.5"
              value={plannerDistanceKm}
              onChange={(e) => setPlannerDistanceKm(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#16A34A', cursor: 'pointer' }}
            />
          </div>

          {/* Trip Analytics Results Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: '14px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#15803D', fontWeight: 700 }}>ESTIMATED FUEL</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803D', marginTop: '2px' }}>
                {estimatedFuelLitres} <span style={{ fontSize: '12px' }}>L</span>
              </div>
              <div style={{ fontSize: '10.5px', color: '#16A34A', marginTop: '2px' }}>
                @ {vehicleEfficiencyKmL} km/L economy
              </div>
            </div>

            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700 }}>ESTIMATED EXPENSE</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginTop: '2px' }}>
                ₹{estimatedCost}
              </div>
              <div style={{ fontSize: '10.5px', color: '#6B7280', marginTop: '2px' }}>
                @ ₹{fuelCostPerLitre}/L Diesel
              </div>
            </div>

            <div style={{ backgroundColor: isFuelSufficient ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${isFuelSufficient ? '#DCFCE7' : '#FEE2E2'}`, borderRadius: '14px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: isFuelSufficient ? '#15803D' : '#DC2626', fontWeight: 700 }}>TANK STATUS</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: isFuelSufficient ? '#15803D' : '#DC2626', marginTop: '2px' }}>
                {fuel.litres.toFixed(1)} <span style={{ fontSize: '12px' }}>L</span>
              </div>
              <div style={{ fontSize: '10.5px', color: isFuelSufficient ? '#16A34A' : '#DC2626', marginTop: '2px' }}>
                {isFuelSufficient ? `+${(fuel.litres - estimatedFuelLitres).toFixed(1)}L reserve` : 'Refill required'}
              </div>
            </div>
          </div>

          {/* Feasibility Alert Box */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: isFuelSufficient ? '#F0FDF4' : '#FEF2F2',
              border: `1px solid ${isFuelSufficient ? '#BBF7D0' : '#FECACA'}`,
              color: isFuelSufficient ? '#15803D' : '#DC2626',
              fontSize: '12.5px',
              fontWeight: 600,
              marginBottom: '16px'
            }}
          >
            {isFuelSufficient ? (
              <>
                <strong>✅ Fuel Verification Passed:</strong> Vehicle has enough fuel for this route. Estimated remaining level: {(fuel.litres - estimatedFuelLitres).toFixed(1)}L ({Math.round(((fuel.litres - estimatedFuelLitres) / vehicle.tankCapacityLitres) * 100)}%).
              </>
            ) : (
              <>
                <strong>⚠️ Insufficient Fuel:</strong> Vehicle needs {estimatedFuelLitres}L, but current tank level is only {fuel.litres.toFixed(1)}L. Add at least {(estimatedFuelLitres - fuel.litres + 4).toFixed(1)}L before departing.
              </>
            )}
          </div>

          {/* Direct Navigation Button */}
          <a
            href={`https://www.google.com/maps/dir/?api=1&origin=${gps.latitude},${gps.longitude}&destination=${encodeURIComponent(plannerDestination)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '12px',
              backgroundColor: '#15803D',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '13.5px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(21, 128, 61, 0.3)'
            }}
          >
            <FoldedMapIcon size={18} color="#FFFFFF" />
            <span>LAUNCH ROUTE IN GOOGLE MAPS NAVIGATION</span>
            <ExternalLinkIcon size={14} color="#FFFFFF" />
          </a>
        </div>
      ) : (
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
)}

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
