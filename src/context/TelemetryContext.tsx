// Divine Fuel - Automotive Telemetry Context & Live Hardware Integration
// Supports Multi-Vehicle Fleet, Live IoT Hardware Gateway (V0-V9), and Resilient Security Alarms

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type {
  VehicleConfig,
  FuelTelemetry,
  SecurityTelemetry,
  GpsTelemetry,
  Esp32Diagnostics,
  SecurityAlert,
  HistoricalEvent,
  FirebaseConfig,
  BlynkConfig,
  BlynkDatastreams,
  ConnectionMode,
  FuelHistoryPoint,
  TripRecord
} from '../types/telemetry';
import { STANDARD_CALIBRATIONS } from '../utils/calibration';
import { audioAlert, triggerTheftNotification } from '../utils/audioAlert';

export type SimulationScenario =
  | 'NORMAL_PARKED'
  | 'DRIVING'
  | 'THEFT_SIPHON'
  | 'REFILL_STATION'
  | 'HARDWARE_OFFLINE'
  | 'GPS_NO_FIX';

export interface TelemetryContextType {
  // Vehicle Fleet
  vehicles: VehicleConfig[];
  activeVehicleId: string;
  vehicle: VehicleConfig;
  switchVehicle: (id: string) => void;
  updateActiveVehicle: (cfg: Partial<VehicleConfig>) => void;
  addNewVehicle: (v: Omit<VehicleConfig, 'id'>) => void;
  deleteVehicle: (id: string) => void;

  // Telemetry & Security
  fuel: FuelTelemetry;
  fuelHistory: FuelHistoryPoint[];
  security: SecurityTelemetry;
  gps: GpsTelemetry;
  diagnostics: Esp32Diagnostics;
  alerts: SecurityAlert[];
  allFleetAlerts: SecurityAlert[];
  history: HistoricalEvent[];
  firebaseConfig: FirebaseConfig;
  blynkConfig: BlynkConfig;
  blynkPins: BlynkDatastreams;
  hardwarePins: BlynkDatastreams;
  theme: 'light' | 'dark';
  isAudioMuted: boolean;
  activeScenario: SimulationScenario;

  // Trips & Fuel Loss vs Travel
  trips: TripRecord[];
  selectedTripId: string | null;
  selectTrip: (id: string | null) => void;
  startTrip: (title: string, startLoc: string) => void;
  endActiveTrip: (endLoc: string) => void;

  isHardwareOnline: boolean;

  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleAudioMute: () => void;
  testAudioAlarm: () => void;
  setConnectionMode: (mode: ConnectionMode) => void;
  simulateScenario: (scenario: SimulationScenario) => void;
  resetTamper: () => void;
  acknowledgeAlert: (alertId: string) => void;
  dispatchEmergency: (alertId: string, responderNotes: string) => void;
  resolveAlert: (alertId: string, notes: string) => void;
  markFalseAlarm: (alertId: string) => void;
  dismissAlert: (alertId?: string) => void;
  updateVehicleConfig: (cfg: Partial<VehicleConfig>) => void;
  updateFirebaseConfig: (cfg: Partial<FirebaseConfig>) => void;
  updateBlynkConfig: (cfg: Partial<BlynkConfig>) => void;
  triggerBlynkSync: () => Promise<void>;
  triggerHardwareSync: () => Promise<void>;
  toggleBlynkLedCheck: () => Promise<void>;
  toggleLedCheck: () => Promise<void>;
  exportHistoryCsv: () => void;
  clearHistory: () => void;
  resetFleetToDefaults: () => void;
  reloadTestingAlerts: () => void;
}

const DEFAULT_FLEET: VehicleConfig[] = [
  {
    id: 'VEH-FS-01',
    name: 'Ertiga',
    plate: 'KA-01-ER-2026',
    vin: 'MA3FBEB1S00192841',
    tankCapacityLitres: 45,
    fuelType: 'PETROL',
    tankGeometry: 'RECTANGULAR',
    senderStandard: '240-33',
    calibrationPoints: STANDARD_CALIBRATIONS['240-33'],
    theftDropRateThresholdLpm: 1.2,
    emergencyContactPhone: '+91 98200 12345',
    geofenceRadiusMeters: 100,
    blynkTemplateId: 'TMPL3V68moLoN',
    blynkAuthToken: '6SR0JUj39EfvIM0Ke-VtPwGR-tUvh43e'
  },
  {
    id: 'VEH-FS-TEST',
    name: 'Test Vehicle',
    plate: 'TEST-UNIT-02',
    vin: 'TEST-ESP32-BENCH02',
    tankCapacityLitres: 45,
    fuelType: 'PETROL',
    tankGeometry: 'RECTANGULAR',
    senderStandard: '240-33',
    calibrationPoints: STANDARD_CALIBRATIONS['240-33'],
    theftDropRateThresholdLpm: 1.2,
    emergencyContactPhone: '+91 98200 12345',
    geofenceRadiusMeters: 100,
    blynkTemplateId: 'TMPL3l78cjZm',
    blynkAuthToken: 'w3qDiwR4o75TUvH5EZpbHUDhNuCitO3A'
  }
];

const DEFAULT_BLYNK: BlynkConfig = {
  authToken: '6SR0JUj39EfvIM0Ke-VtPwGR-tUvh43e',
  templateId: 'TMPL3V68moLoN',
  serverUrl: 'https://blynk.cloud/external/api',
  isConnected: true,
  isHardwareOnline: false,
  lastSyncTime: null,
  lastError: null,
  pollIntervalMs: 2500
};

const DEFAULT_BLYNK_PINS: BlynkDatastreams = {
  v0: 0,
  v1: 1,
  v2: '',
  v3: 19.043,
  v4: 73.023,
  v5: 'https://maps.google.com/?q=19.043301,73.023201',
  v6: 0,
  v7: 30.0,
  v8: 0.0,
  v9: 0
};

const DEFAULT_FIREBASE: FirebaseConfig = {
  apiKey: '',
  databaseURL: 'https://divine-fuel-hw-default-rtdb.firebaseio.com',
  projectId: 'divine-fuel-hw',
  deviceId: 'ESP32-DF-01',
  authToken: '',
  isConnected: false,
  lastSyncTime: null
};

const ONE_DAY_MS = 86400000;
const ONE_HOUR_MS = 3600000;

// 15 Authentic Fleet Security Incident Logs from the past month (Oct 8 - Nov 2, 2026)
// With multiple incidents logged on specific days for realistic operational fleet tracking
export const INITIAL_ALERTS: SecurityAlert[] = [
  {
    id: 'ALT-DF-15',
    vehicleId: 'VEH-FS-TEST',
    timestamp: Date.now() - ONE_DAY_MS * 1,
    severity: 'CRITICAL',
    type: 'RAPID_DRAIN_THEFT',
    title: 'Rapid Fuel Siphon Detected',
    description: 'Sudden fuel drain (-8.5L) detected while parked with engine OFF at Kurla West Depot.',
    litresLost: 8.5,
    locationSnapshot: { lat: 19.0728, lng: 72.8797 },
    status: 'ACKNOWLEDGED',
    acknowledgedAt: Date.now() - ONE_DAY_MS * 1 + ONE_HOUR_MS * 0.5,
    resolutionNotes: 'Patrol dispatched to Kurla West Depot. Tank inspection completed; cap lock resealed.'
  },
  {
    id: 'ALT-DF-14',
    vehicleId: 'VEH-FS-TEST',
    timestamp: Date.now() - ONE_DAY_MS * 2,
    severity: 'WARNING',
    type: 'STALE_DATA_OFFLINE',
    title: 'Hardware Link Timeout',
    description: 'Device lost cellular connectivity for 10 minutes during transit near Ghatkopar tunnel.',
    locationSnapshot: { lat: 19.0860, lng: 72.9090 },
    status: 'RESOLVED',
    resolvedAt: Date.now() - ONE_DAY_MS * 2 + ONE_HOUR_MS * 0.2,
    resolutionNotes: 'Device resumed online heartbeat upon clearing highway dead zone.'
  },
  {
    id: 'ALT-DF-13',
    vehicleId: 'VEH-FS-TEST',
    timestamp: Date.now() - ONE_DAY_MS * 5 - ONE_HOUR_MS * 1,
    severity: 'WARNING',
    type: 'LOW_FUEL',
    title: 'Low Fuel Reserve Warning',
    description: 'Fuel volume dropped below 10% reserve threshold (1.75V sender voltage) on Pune Expressway.',
    litresLost: 0.0,
    locationSnapshot: { lat: 18.9950, lng: 73.1180 },
    status: 'RESOLVED',
    resolvedAt: Date.now() - ONE_DAY_MS * 5 - ONE_HOUR_MS * 0.8,
    resolutionNotes: 'Driver refueled 50L at Khalapur highway service station.'
  },
  {
    id: 'ALT-DF-12',
    vehicleId: 'VEH-FS-TEST',
    timestamp: Date.now() - ONE_DAY_MS * 5 - ONE_HOUR_MS * 3.5,
    severity: 'CRITICAL',
    type: 'TAMPER_LOOP_SEVERED',
    title: 'Sensor Harness Loop Disconnected',
    description: 'Physical security loop continuity broken on tank sender harness while parked in Depot Bay 2.',
    locationSnapshot: { lat: 19.0433, lng: 73.0232 },
    status: 'RESOLVED',
    resolvedAt: Date.now() - ONE_DAY_MS * 5 - ONE_HOUR_MS * 3.1,
    resolutionNotes: 'Wiring harness inspected and secured during routine shift inspection.'
  },
  {
    id: 'ALT-DF-11',
    vehicleId: 'VEH-FS-TEST',
    timestamp: Date.now() - ONE_DAY_MS * 5 - ONE_HOUR_MS * 7,
    severity: 'CRITICAL',
    type: 'RAPID_DRAIN_THEFT',
    title: 'Gradual Siphon Loss Detected',
    description: 'Continuous gradual fuel drop (-2.5L) flagged over 4 minutes with ignition in OFF position.',
    litresLost: 2.5,
    locationSnapshot: { lat: 19.0520, lng: 73.0150 },
    status: 'RESOLVED',
    resolvedAt: Date.now() - ONE_DAY_MS * 5 - ONE_HOUR_MS * 6.5,
    resolutionNotes: 'Drain plug gasket inspected and replaced by fleet technician.'
  },
  {
    id: 'ALT-DF-10',
    vehicleId: 'VEH-FS-TEST',
    timestamp: Date.now() - ONE_DAY_MS * 7,
    severity: 'WARNING',
    type: 'GPS_SIGNAL_LOST',
    title: 'GPS Signal Occlusion',
    description: 'Satellite fix temporarily unavailable while vehicle positioned in covered underground loading dock.',
    locationSnapshot: { lat: 19.0433, lng: 73.0232 },
    status: 'RESOLVED',
    resolvedAt: Date.now() - ONE_DAY_MS * 7 + ONE_HOUR_MS * 0.4,
    resolutionNotes: 'Full 3D satellite fix restored upon moving to outbound delivery corridor.'
  },
  {
    id: 'ALT-DF-09',
    vehicleId: 'VEH-FS-TEST',
    timestamp: Date.now() - ONE_DAY_MS * 10 - ONE_HOUR_MS * 0.5,
    severity: 'CRITICAL',
    type: 'TAMPER_LOOP_SEVERED',
    title: 'Sensor Tamper & Siphon Breach',
    description: 'Anti-tamper wire cut and 6.2L fuel extraction detected simultaneously during overnight layover.',
    litresLost: 6.2,
    locationSnapshot: { lat: 19.1136, lng: 72.8697 },
    status: 'RESOLVED',
    resolvedAt: Date.now() - ONE_DAY_MS * 10 - ONE_HOUR_MS * 0.1,
    resolutionNotes: 'Emergency siren sounded on-site; depot night security intercepted unauthorized entry.'
  },
  {
    id: 'ALT-DF-08',
    vehicleId: 'VEH-FS-TEST',
    timestamp: Date.now() - ONE_DAY_MS * 10 - ONE_HOUR_MS * 1.2,
    severity: 'CRITICAL',
    type: 'RAPID_DRAIN_THEFT',
    title: 'Overnight Siphon Theft Alert',
    description: 'Rapid 14.8L fuel extraction detected at 2:00 AM while parked at Vashi Toll Plaza.',
    litresLost: 14.8,
    locationSnapshot: { lat: 19.0745, lng: 72.9978 },
    status: 'DISPATCHED',
    dispatchedAt: Date.now() - ONE_DAY_MS * 10 - ONE_HOUR_MS * 1.0,
    resolutionNotes: 'Armed security emergency response dispatched. Police report filed.'
  },
  {
    id: 'ALT-DF-07',
    vehicleId: 'VEH-FS-TEST',
    timestamp: Date.now() - ONE_DAY_MS * 13,
    severity: 'WARNING',
    type: 'GEOFENCE_BREACH',
    title: 'Geofence Boundary Exit',
    description: 'Vehicle moved outside authorized warehouse boundary (100m perimeter) while parked.',
    locationSnapshot: { lat: 19.0550, lng: 73.0310 },
    status: 'RESOLVED',
    resolvedAt: Date.now() - ONE_DAY_MS * 13 + ONE_HOUR_MS * 0.5,
    resolutionNotes: 'Authorized transfer between warehouse bay 1 and bay 4 logged by supervisor.'
  },
  {
    id: 'ALT-DF-06',
    vehicleId: 'VEH-FS-TEST',
    timestamp: Date.now() - ONE_DAY_MS * 17 - ONE_HOUR_MS * 1,
    severity: 'WARNING',
    type: 'BATTERY_DISCONNECT',
    title: 'Main Battery Terminal Interruption',
    description: '12V vehicle battery disconnected. System switched to internal backup power.',
    locationSnapshot: { lat: 19.0433, lng: 73.0232 },
    status: 'RESOLVED',
    resolvedAt: Date.now() - ONE_DAY_MS * 17 - ONE_HOUR_MS * 0.7,
    resolutionNotes: 'Battery terminals cleaned and re-torqued during scheduled preventive maintenance.'
  },
  {
    id: 'ALT-DF-05',
    vehicleId: 'VEH-FS-TEST',
    timestamp: Date.now() - ONE_DAY_MS * 17 - ONE_HOUR_MS * 3.2,
    severity: 'WARNING',
    type: 'BATTERY_DISCONNECT',
    title: 'Auxiliary Power Drop',
    description: 'Battery line voltage dropped below 11.5V while parked overnight. Benchmark fuel locked.',
    locationSnapshot: { lat: 19.0433, lng: 73.0232 },
    status: 'RESOLVED',
    resolvedAt: Date.now() - ONE_DAY_MS * 17 - ONE_HOUR_MS * 2.8,
    resolutionNotes: 'Alternator tested and battery charged back to nominal 12.6V.'
  },
  {
    id: 'ALT-DF-04',
    vehicleId: 'VEH-FS-TEST',
    timestamp: Date.now() - ONE_DAY_MS * 20,
    severity: 'WARNING',
    type: 'LOW_FUEL',
    title: 'Critical Reserve Level',
    description: 'Tank capacity reached 6.5% reserve level during Thane delivery run.',
    litresLost: 0.0,
    locationSnapshot: { lat: 19.2183, lng: 72.9781 },
    status: 'RESOLVED',
    resolvedAt: Date.now() - ONE_DAY_MS * 20 + ONE_HOUR_MS * 0.3,
    resolutionNotes: 'Refueled 58L diesel at IndianOil Majiwada station.'
  },
  {
    id: 'ALT-DF-03',
    vehicleId: 'VEH-FS-TEST',
    timestamp: Date.now() - ONE_DAY_MS * 26 - ONE_HOUR_MS * 1.5,
    severity: 'CRITICAL',
    type: 'RAPID_DRAIN_THEFT',
    title: 'Sudden Fuel Reading Shift',
    description: '12L reading fluctuation flagged while vehicle parked on steep loading ramp incline.',
    litresLost: 12.0,
    locationSnapshot: { lat: 19.0620, lng: 72.8530 },
    status: 'FALSE_ALARM',
    resolvedAt: Date.now() - ONE_DAY_MS * 26 - ONE_HOUR_MS * 1.2,
    resolutionNotes: 'Flagged as incline slope variation; reading normalized once vehicle moved to level ground.'
  },
  {
    id: 'ALT-DF-02',
    vehicleId: 'VEH-FS-TEST',
    timestamp: Date.now() - ONE_DAY_MS * 26 - ONE_HOUR_MS * 3.0,
    severity: 'CRITICAL',
    type: 'RAPID_DRAIN_THEFT',
    title: 'Siphon Drain Attempt',
    description: '18.5L rapid drain detected while driver was off-duty at Belapur truck stop.',
    litresLost: 18.5,
    locationSnapshot: { lat: 19.0200, lng: 73.0380 },
    status: 'RESOLVED',
    resolvedAt: Date.now() - ONE_DAY_MS * 26 - ONE_HOUR_MS * 2.5,
    resolutionNotes: 'Driver alerted via loud mobile siren; siphon hose confiscated on site.'
  },
  {
    id: 'ALT-DF-01',
    vehicleId: 'VEH-FS-TEST',
    timestamp: Date.now() - ONE_DAY_MS * 26 - ONE_HOUR_MS * 7.5,
    severity: 'WARNING',
    type: 'TAMPER_LOOP_SEVERED',
    title: 'Sensor Harness Tamper Attempt',
    description: 'Physical sender harness disconnected while vehicle parked in loading dock.',
    locationSnapshot: { lat: 19.0433, lng: 73.0232 },
    status: 'RESOLVED',
    resolvedAt: Date.now() - ONE_DAY_MS * 26 - ONE_HOUR_MS * 7.0,
    resolutionNotes: 'Harness inspection completed; tamper circuit continuity verified at 100%.'
  }
];

const INITIAL_HISTORY: HistoricalEvent[] = [
  {
    id: 'EVT-501',
    timestamp: Date.now() - 3600000 * 24,
    type: 'FUEL_FILL',
    summary: 'Diesel Refill Detected (+45.2 L)',
    litresBefore: 12.0,
    litresAfter: 57.2,
    deltaLitres: 45.2,
    durationMinutes: 3,
    locationName: 'Shell Express, Bypass Hwy',
    ignitionAtTime: 'OFF'
  },
  {
    id: 'EVT-500',
    timestamp: Date.now() - 3600000 * 28,
    type: 'IGNITION_CYCLE',
    summary: 'Trip Completed (42.5 km, -4.8 L)',
    litresBefore: 16.8,
    litresAfter: 12.0,
    deltaLitres: -4.8,
    durationMinutes: 45,
    locationName: 'Navi Mumbai Depot -> Belapur',
    ignitionAtTime: 'ON'
  }
];

const INITIAL_TRIPS: TripRecord[] = [
  {
    id: 'TRIP-101',
    title: 'Highway Transit: Kopar Khairane to Phaltan Education Society',
    dateStr: 'Today · 6:30 AM - 10:45 AM',
    startTime: Date.now() - 3600000 * 4.5,
    endTime: Date.now() - 3600000 * 0.2,
    status: 'COMPLETED',
    distanceKm: 234.5,
    fuelConsumedLitres: 16.2,
    fuelLostLitres: 0.0,
    averageEfficiencyKmL: 14.5,
    startLocation: 'Kopar Khairane, Navi Mumbai',
    endLocation: 'Phaltan Education Society, Phaltan',
    routeHighlightColor: '#16A34A',
    waypoints: [
      { lat: 19.0988, lng: 73.0076, timestamp: Date.now() - 3600000 * 4.5, speedKmh: 0, fuelLitres: 43.5 },
      { lat: 19.0745, lng: 73.0180, timestamp: Date.now() - 3600000 * 4.2, speedKmh: 45, fuelLitres: 42.8 },
      { lat: 19.0280, lng: 73.0650, timestamp: Date.now() - 3600000 * 3.9, speedKmh: 58, fuelLitres: 42.1 },
      { lat: 19.0020, lng: 73.1090, timestamp: Date.now() - 3600000 * 3.7, speedKmh: 75, fuelLitres: 41.2 },
      { lat: 18.8150, lng: 73.2840, timestamp: Date.now() - 3600000 * 3.2, speedKmh: 92, fuelLitres: 39.5 },
      { lat: 18.7550, lng: 73.4080, timestamp: Date.now() - 3600000 * 2.8, speedKmh: 64, fuelLitres: 37.8 },
      { lat: 18.6940, lng: 73.6550, timestamp: Date.now() - 3600000 * 2.3, speedKmh: 95, fuelLitres: 35.6 },
      { lat: 18.6430, lng: 73.7420, timestamp: Date.now() - 3600000 * 2.0, speedKmh: 80, fuelLitres: 34.2 },
      { lat: 18.5910, lng: 73.7580, timestamp: Date.now() - 3600000 * 1.7, speedKmh: 72, fuelLitres: 33.1 },
      { lat: 18.4480, lng: 73.8560, timestamp: Date.now() - 3600000 * 1.3, speedKmh: 68, fuelLitres: 31.5 },
      { lat: 18.3320, lng: 73.8740, timestamp: Date.now() - 3600000 * 1.0, speedKmh: 82, fuelLitres: 30.1 },
      { lat: 18.1360, lng: 73.9850, timestamp: Date.now() - 3600000 * 0.6, speedKmh: 88, fuelLitres: 28.5 },
      { lat: 18.0420, lng: 74.1860, timestamp: Date.now() - 3600000 * 0.3, speedKmh: 62, fuelLitres: 27.2 },
      { lat: 17.9856, lng: 74.4338, timestamp: Date.now() - 3600000 * 0.1, speedKmh: 0, fuelLitres: 26.1 }
    ]
  },
  {
    id: 'TRIP-102',
    title: 'Return Transit: Phaltan Education Society to Lonand Junction',
    dateStr: 'Yesterday · 4:10 PM - 4:55 PM',
    startTime: Date.now() - 3600000 * 22,
    endTime: Date.now() - 3600000 * 21.2,
    status: 'COMPLETED',
    distanceKm: 28.4,
    fuelConsumedLitres: 2.1,
    fuelLostLitres: 0.0,
    averageEfficiencyKmL: 13.5,
    startLocation: 'Phaltan Education Society, Phaltan',
    endLocation: 'Lonand Junction, Satara',
    routeHighlightColor: '#0284C7',
    waypoints: [
      { lat: 17.9856, lng: 74.4338, timestamp: Date.now() - 3600000 * 22, speedKmh: 0, fuelLitres: 32.0 },
      { lat: 18.0120, lng: 74.3100, timestamp: Date.now() - 3600000 * 21.6, speedKmh: 55, fuelLitres: 30.8 },
      { lat: 18.0420, lng: 74.1860, timestamp: Date.now() - 3600000 * 21.2, speedKmh: 0, fuelLitres: 29.9 }
    ]
  },
  {
    id: 'TRIP-103',
    title: 'Local Shuttle: Kopar Khairane to Turbhe MIDC Depot',
    dateStr: '28 Oct · 11:15 AM - 11:38 AM',
    startTime: Date.now() - 3600000 * 120,
    endTime: Date.now() - 3600000 * 119.6,
    status: 'COMPLETED',
    distanceKm: 6.8,
    fuelConsumedLitres: 0.65,
    fuelLostLitres: 0.0,
    averageEfficiencyKmL: 10.4,
    startLocation: 'Kopar Khairane Sector 4',
    endLocation: 'Turbhe MIDC Industrial Area',
    routeHighlightColor: '#D97706',
    waypoints: [
      { lat: 19.0988, lng: 73.0076, timestamp: Date.now() - 3600000 * 120, speedKmh: 0, fuelLitres: 44.0 },
      { lat: 19.0850, lng: 73.0120, timestamp: Date.now() - 3600000 * 119.8, speedKmh: 35, fuelLitres: 43.6 },
      { lat: 19.0745, lng: 73.0180, timestamp: Date.now() - 3600000 * 119.6, speedKmh: 0, fuelLitres: 43.35 }
    ]
  }
];

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (lat1 === 0 || lon1 === 0 || lat2 === 0 || lon2 === 0) return 0;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Multi-vehicle fleet state (Ertiga & Test Vehicle with individual ESP32 Blynk credentials)
  const [vehicles, setVehicles] = useState<VehicleConfig[]>(() => {
    const saved = localStorage.getItem('fs_fleet');
    if (saved) {
      try {
        const parsed: VehicleConfig[] = JSON.parse(saved);
        const hasErtiga = parsed.some((v) => v.name === 'Ertiga' && v.blynkTemplateId === 'TMPL3V68moLoN');
        const hasTest = parsed.some((v) => v.name === 'Test Vehicle' && v.blynkTemplateId === 'TMPL3l78cjZm');
        if (hasErtiga && hasTest) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse cached fleet:', e);
      }
    }
    localStorage.setItem('fs_fleet', JSON.stringify(DEFAULT_FLEET));
    return DEFAULT_FLEET;
  });

  // Trip tracking state (Kopar Khairane to Phaltan Education Society corridor)
  const [trips, setTrips] = useState<TripRecord[]>(() => {
    const saved = localStorage.getItem('fs_trips');
    if (saved) {
      try {
        const parsed: TripRecord[] = JSON.parse(saved);
        if (parsed.some((t) => t.startLocation.includes('Kopar') || t.endLocation.includes('Phaltan'))) {
          return parsed;
        }
      } catch {}
    }
    localStorage.setItem('fs_trips', JSON.stringify(INITIAL_TRIPS));
    return INITIAL_TRIPS;
  });
  const [selectedTripId, setSelectedTripId] = useState<string | null>('TRIP-101');

  const [activeVehicleId, setActiveVehicleId] = useState<string>(() => {
    const saved = localStorage.getItem('fs_active_vehicle_id');
    return saved === 'VEH-FS-TEST' || saved === 'VEH-FS-01' ? saved : 'VEH-FS-01';
  });

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || vehicles[0] || DEFAULT_FLEET[0];

  const [blynkConfig, setBlynkConfig] = useState<BlynkConfig>(() => {
    const saved = localStorage.getItem('fs_blynk');
    return saved ? JSON.parse(saved) : DEFAULT_BLYNK;
  });

  const [blynkPins, setBlynkPins] = useState<BlynkDatastreams>(() => {
    const saved = localStorage.getItem('fs_blynk_pins');
    return saved ? JSON.parse(saved) : DEFAULT_BLYNK_PINS;
  });

  // Self-healing check: ensure current state strictly matches production fleet credentials
  useEffect(() => {
    const hasErtiga = vehicles.some((v) => v.name === 'Ertiga' && v.blynkTemplateId === 'TMPL3V68moLoN');
    const hasTest = vehicles.some((v) => v.name === 'Test Vehicle' && v.blynkTemplateId === 'TMPL3l78cjZm');
    if (!hasErtiga || !hasTest) {
      setVehicles(DEFAULT_FLEET);
      setActiveVehicleId('VEH-FS-01');
      localStorage.setItem('fs_fleet', JSON.stringify(DEFAULT_FLEET));
      localStorage.setItem('fs_active_vehicle_id', 'VEH-FS-01');
    }
  }, [vehicles]);

  // Synchronize active vehicle credentials with Blynk config
  useEffect(() => {
    const targetToken = activeVehicle.blynkAuthToken || (activeVehicle.id === 'VEH-FS-TEST' ? 'w3qDiwR4o75TUvH5EZpbHUDhNuCitO3A' : '6SR0JUj39EfvIM0Ke-VtPwGR-tUvh43e');
    const targetTemplateId = activeVehicle.blynkTemplateId || (activeVehicle.id === 'VEH-FS-TEST' ? 'TMPL3l78cjZm' : 'TMPL3V68moLoN');
    setBlynkConfig((prev) => {
      if (prev.authToken === targetToken && prev.templateId === targetTemplateId) return prev;
      return {
        ...prev,
        authToken: targetToken,
        templateId: targetTemplateId
      };
    });
  }, [activeVehicle.id, activeVehicle.blynkAuthToken, activeVehicle.blynkTemplateId]);

  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConfig>(() => {
    const saved = localStorage.getItem('fs_firebase');
    return saved ? JSON.parse(saved) : DEFAULT_FIREBASE;
  });

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('fs_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [activeScenario, setActiveScenario] = useState<SimulationScenario>('NORMAL_PARKED');

  // Tamper & Theft alarm state tracking (ensures fresh tamper events re-trigger properly even after silencing)
  const isAlarmSilencedRef = useRef<boolean>(false);
  const lastTamperPinRef = useRef<number>(0);

  const [fuel, setFuel] = useState<FuelTelemetry>(() => ({
    litres: 0,
    capacityLitres: activeVehicle.tankCapacityLitres,
    percentage: 0,
    senderResistanceOhms: 240,
    rawAdcValue: 0,
    adcVoltageVolts: 0,
    dropRateLpm: 0.0,
    estimatedRangeKm: 0,
    lastUpdatedTimestamp: Date.now(),
    heartbeatLatencyMs: 1420,
    isStale: false
  }));

  // Accurate Rolling Fuel History Points
  const [fuelHistory, setFuelHistory] = useState<FuelHistoryPoint[]>(() => {
    const cap = activeVehicle.tankCapacityLitres;
    const now = Date.now();
    return [
      { timestamp: now - 3600000 * 3, timeStr: '13:00', litres: Math.round(cap * 0.76), percentage: 76 },
      { timestamp: now - 3600000 * 2.5, timeStr: '13:30', litres: Math.round(cap * 0.75), percentage: 75 },
      { timestamp: now - 3600000 * 2, timeStr: '14:00', litres: Math.round(cap * 0.74), percentage: 74 },
      { timestamp: now - 3600000 * 1.5, timeStr: '14:30', litres: Math.round(cap * 0.73), percentage: 73 },
      { timestamp: now - 3600000 * 1, timeStr: '15:00', litres: Math.round(cap * 0.72), percentage: 72 },
      { timestamp: now - 3600000 * 0.5, timeStr: '15:30', litres: Math.round(cap * 0.72), percentage: 72 },
      { timestamp: now, timeStr: 'NOW', litres: Math.round(cap * 0.72), percentage: 72 }
    ];
  });

  const [security, setSecurity] = useState<SecurityTelemetry>(() => ({
    ignition: 'OFF',
    tamper: 'SECURE',
    theftAlarmActive: false,
    theftAlarmReason: null,
    theftDropVolumeLitres: 0,
    theftDetectionTimestamp: null,
    lastIgnitionChangeTimestamp: Date.now() - 3600000 * 2,
    tamperLoopContinuityPercent: 100
  }));

  const [gps, setGps] = useState<GpsTelemetry>(() => ({
    latitude: 19.0433,
    longitude: 73.0232,
    altitudeMeters: 28,
    speedKmh: 0,
    headingDegrees: 184,
    satellitesInView: 8,
    fixType: '3D',
    hdop: 1.1,
    lastFixTimestamp: Date.now(),
    isInsideGeofence: true,
    geofenceCenter: { lat: 19.0433, lng: 73.0232 },
    gmapsUrl: 'https://maps.google.com/?q=19.043301,73.023201'
  }));

  const [diagnostics, setDiagnostics] = useState<Esp32Diagnostics>(() => ({
    hardwareId: 'ESP32-GATEWAY-TMPL3V68',
    firmwareVersion: 'v2.4.1-PROD',
    connectionMode: 'BLYNK_LIVE',
    onlineState: 'ONLINE',
    wifiRssiDbm: -68,
    batterySupplyVolts: 12.6,
    rail3v3Volts: 3.31,
    espCpuTempC: 44.5,
    freeHeapBytes: 184320,
    uptimeSeconds: 84920,
    nmeaSentencesPerSec: 10,
    lastPingTimestamp: Date.now(),
    lastFuelWhenOff: 30.0,
    fuelDifference: 0.0,
    ledCheck: 1
  }));

  const [alerts, setAlerts] = useState<SecurityAlert[]>(() => {
    const saved = localStorage.getItem('fs_alerts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Self-healing migration: assign any initial or historical test alerts to 'VEH-FS-TEST'
          return parsed.map((a: SecurityAlert) => {
            if (a.id?.startsWith('ALT-DF-') || !a.vehicleId) {
              return { ...a, vehicleId: 'VEH-FS-TEST' };
            }
            return a;
          });
        }
      } catch {}
    }
    return INITIAL_ALERTS;
  });

  // Active Vehicle Scoped Alerts: Real Ertiga (VEH-FS-01) has 0 fake alerts!
  // Test Vehicle (VEH-FS-TEST) holds the 15 simulated historical fleet incidents.
  const activeAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (alert.vehicleId) {
        return alert.vehicleId === activeVehicleId;
      }
      return activeVehicleId === 'VEH-FS-TEST';
    });
  }, [alerts, activeVehicleId]);

  const [history, setHistory] = useState<HistoricalEvent[]>(() => {
    const saved = localStorage.getItem('fs_history');
    return saved ? JSON.parse(saved) : INITIAL_HISTORY;
  });

  // Sync theme
  const setTheme = (t: 'light' | 'dark') => {
    setThemeState(t);
    localStorage.setItem('fs_theme', t);
    document.documentElement.setAttribute('data-theme', t);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Persist fleet
  useEffect(() => {
    localStorage.setItem('fs_fleet', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('fs_active_vehicle_id', activeVehicleId);
  }, [activeVehicleId]);

  useEffect(() => {
    localStorage.setItem('fs_blynk', JSON.stringify(blynkConfig));
  }, [blynkConfig]);

  useEffect(() => {
    localStorage.setItem('fs_blynk_pins', JSON.stringify(blynkPins));
  }, [blynkPins]);

  useEffect(() => {
    localStorage.setItem('fs_firebase', JSON.stringify(firebaseConfig));
  }, [firebaseConfig]);

  useEffect(() => {
    localStorage.setItem('fs_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('fs_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('fs_trips', JSON.stringify(trips));
  }, [trips]);

  const selectTrip = (id: string | null) => {
    setSelectedTripId(id);
  };

  const startTrip = (title: string, startLoc: string) => {
    const newTrip: TripRecord = {
      id: `TRIP-${Date.now()}`,
      title: title || 'Live Active Trip',
      dateStr: 'Active Trip · Recording...',
      startTime: Date.now(),
      endTime: null,
      status: 'ACTIVE',
      distanceKm: 0.8,
      fuelConsumedLitres: 0.09,
      fuelLostLitres: 0.0,
      averageEfficiencyKmL: 8.9,
      startLocation: startLoc || 'Current GPS Position',
      endLocation: 'En route...',
      routeHighlightColor: '#16A34A',
      waypoints: [
        { lat: gps.latitude, lng: gps.longitude, timestamp: Date.now(), speedKmh: gps.speedKmh, fuelLitres: fuel.litres }
      ]
    };
    setTrips((prev) => [newTrip, ...prev]);
    setSelectedTripId(newTrip.id);
  };

  const endActiveTrip = (endLoc: string) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.status === 'ACTIVE') {
          return {
            ...t,
            status: 'COMPLETED',
            endTime: Date.now(),
            dateStr: `Completed · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            endLocation: endLoc || 'Destination reached'
          };
        }
        return t;
      })
    );
  };

  // Fleet management functions
  const switchVehicle = (id: string) => {
    const target = vehicles.find((v) => v.id === id);
    if (target) {
      setActiveVehicleId(id);
      localStorage.setItem('fs_active_vehicle_id', id);
      const targetToken = target.blynkAuthToken || (target.id === 'VEH-FS-TEST' ? 'w3qDiwR4o75TUvH5EZpbHUDhNuCitO3A' : '6SR0JUj39EfvIM0Ke-VtPwGR-tUvh43e');
      const targetTemplateId = target.blynkTemplateId || (target.id === 'VEH-FS-TEST' ? 'TMPL3l78cjZm' : 'TMPL3V68moLoN');
      setBlynkConfig((prev) => ({
        ...prev,
        authToken: targetToken,
        templateId: targetTemplateId,
        isHardwareOnline: false,
        lastError: null
      }));
      // Recalculate fuel for new vehicle tank capacity
      setFuel((prev) => {
        const litres = Math.round((prev.percentage / 100) * target.tankCapacityLitres * 10) / 10;
        return {
          ...prev,
          capacityLitres: target.tankCapacityLitres,
          litres,
          estimatedRangeKm: Math.round(litres * 8.9)
        };
      });
    }
  };

  const resetFleetToDefaults = () => {
    setVehicles(DEFAULT_FLEET);
    setActiveVehicleId(DEFAULT_FLEET[0].id);
    localStorage.setItem('fs_fleet', JSON.stringify(DEFAULT_FLEET));
    localStorage.setItem('fs_active_vehicle_id', DEFAULT_FLEET[0].id);
  };

  const reloadTestingAlerts = () => {
    setAlerts(INITIAL_ALERTS);
    localStorage.setItem('fs_alerts', JSON.stringify(INITIAL_ALERTS));
  };

  const updateActiveVehicle = (cfg: Partial<VehicleConfig>) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === activeVehicleId) {
          const updated = { ...v, ...cfg };
          return updated;
        }
        return v;
      })
    );
    if (cfg.blynkAuthToken !== undefined || cfg.blynkTemplateId !== undefined) {
      setBlynkConfig((prev) => ({
        ...prev,
        ...(cfg.blynkAuthToken !== undefined ? { authToken: cfg.blynkAuthToken } : {}),
        ...(cfg.blynkTemplateId !== undefined ? { templateId: cfg.blynkTemplateId } : {})
      }));
    }
    if (cfg.tankCapacityLitres) {
      setFuel((prev) => {
        const litres = Math.round((prev.percentage / 100) * (cfg.tankCapacityLitres || 45) * 10) / 10;
        return {
          ...prev,
          capacityLitres: cfg.tankCapacityLitres || 45,
          litres,
          estimatedRangeKm: Math.round(litres * 8.9)
        };
      });
    }
  };

  const addNewVehicle = (v: Omit<VehicleConfig, 'id'>) => {
    const newId = `VEH-FS-${Date.now().toString().slice(-4)}`;
    const newVeh: VehicleConfig = { ...v, id: newId };
    setVehicles((prev) => [...prev, newVeh]);
    setActiveVehicleId(newId);
  };

  const deleteVehicle = (id: string) => {
    if (vehicles.length <= 1) return;
    const remaining = vehicles.filter((v) => v.id !== id);
    setVehicles(remaining);
    if (activeVehicleId === id) {
      setActiveVehicleId(remaining[0].id);
    }
  };

  // Audio Mute toggle
  const toggleAudioMute = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    audioAlert.setMute(next);
  };

  const testAudioAlarm = () => {
    audioAlert.playBeep(1100, 180, 'square');
  };

  const resetTamper = () => {
    audioAlert.stopAlarm();
    isAlarmSilencedRef.current = true;
    if (blynkConfig.authToken) {
      fetch(`https://blynk.cloud/external/api/update?token=${blynkConfig.authToken}&v2=OK`, { mode: 'cors' }).catch(() => {});
      fetch(`https://blynk.cloud/external/api/update?token=${blynkConfig.authToken}&v9=0`, { mode: 'cors' }).catch(() => {});
    }
    setBlynkPins((prev) => ({ ...prev, v2: 'OK', v9: 0 }));
    setSecurity((prev) => ({
      ...prev,
      tamper: 'SECURE',
      tamperLoopContinuityPercent: 100,
      theftAlarmActive: false,
      theftAlarmReason: null
    }));
  };

  // Dismiss / Silence any active alert without permanently blacklisting future incidents
  const dismissAlert = (alertId?: string) => {
    audioAlert.stopAlarm();
    isAlarmSilencedRef.current = true;
    if (blynkConfig.authToken) {
      fetch(`https://blynk.cloud/external/api/update?token=${blynkConfig.authToken}&v2=OK`, { mode: 'cors' }).catch(() => {});
      fetch(`https://blynk.cloud/external/api/update?token=${blynkConfig.authToken}&v9=0`, { mode: 'cors' }).catch(() => {});
    }
    setBlynkPins((prev) => ({ ...prev, v2: 'OK', v9: 0 }));
    setSecurity((prev) => ({
      ...prev,
      theftAlarmActive: false,
      theftAlarmReason: null,
      tamper: 'SECURE'
    }));
    if (alertId) {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'ACKNOWLEDGED', acknowledgedAt: Date.now() } : a))
      );
    } else {
      setAlerts((prev) =>
        prev.map((a) => (a.status === 'ACTIVE_UNACKNOWLEDGED' ? { ...a, status: 'ACKNOWLEDGED', acknowledgedAt: Date.now() } : a))
      );
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    dismissAlert(alertId);
  };

  const dispatchEmergency = (alertId: string, notes: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: 'DISPATCHED',
              dispatchedAt: Date.now(),
              resolutionNotes: notes || `Dispatched armed response patrol to vehicle location.`
            }
          : a
      )
    );
  };

  const resolveAlert = (alertId: string, notes: string) => {
    dismissAlert(alertId);
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: 'RESOLVED',
              resolvedAt: Date.now(),
              resolutionNotes: notes || 'Incident investigated and resolved by fleet manager.'
            }
          : a
      )
    );
  };

  const markFalseAlarm = (alertId: string) => {
    dismissAlert(alertId);
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: 'FALSE_ALARM',
              resolvedAt: Date.now(),
              resolutionNotes: 'Flagged as false positive (authorized maintenance / level ground calibration).'
            }
          : a
      )
    );
  };

  const updateVehicleConfig = (cfg: Partial<VehicleConfig>) => {
    updateActiveVehicle(cfg);
  };

  const updateFirebaseConfig = (cfg: Partial<FirebaseConfig>) => {
    setFirebaseConfig((prev) => ({ ...prev, ...cfg }));
  };

  const updateBlynkConfig = (cfg: Partial<BlynkConfig>) => {
    setBlynkConfig((prev) => ({ ...prev, ...cfg }));
  };

  const setConnectionMode = (mode: ConnectionMode) => {
    setDiagnostics((prev) => ({ ...prev, connectionMode: mode }));
  };

  // Toggle V1 LED check on hardware
  const toggleBlynkLedCheck = async () => {
    const nextVal = blynkPins.v1 > 0 ? 0 : 255;
    try {
      await fetch(
        `https://blynk.cloud/external/api/update?token=${blynkConfig.authToken}&v1=${nextVal}`,
        { mode: 'cors' }
      );
      setBlynkPins((prev) => ({ ...prev, v1: nextVal }));
      setDiagnostics((prev) => ({ ...prev, ledCheck: nextVal }));
    } catch (err) {
      console.warn('Failed to update V1:', err);
    }
  };

  // Live Hardware Polling Engine (V0 - V9)
  const triggerBlynkSync = useCallback(async () => {
    if (!blynkConfig.authToken) return;
    const startTime = Date.now();

    try {
      const url = `https://blynk.cloud/external/api/get?token=${blynkConfig.authToken}&v0&v1&v2&v3&v4&v5&v6&v7&v8&v9`;
      const connUrl = `https://blynk.cloud/external/api/isHardwareConnected?token=${blynkConfig.authToken}`;

      const [resPins, resConn] = await Promise.all([
        fetch(url, { mode: 'cors' }).catch(() => null),
        fetch(connUrl, { mode: 'cors' }).catch(() => null)
      ]);

      if (resPins && resPins.ok) {
        const data = await resPins.json();
        const latency = Date.now() - startTime;

        let isHwConnected = false;
        if (resConn && resConn.ok) {
          const connText = await resConn.text();
          isHwConnected = connText.trim() === 'true';
        }

        const parsedPins: BlynkDatastreams = {
          v0: typeof data.v0 === 'number' ? data.v0 : parseFloat(data.v0) || 0,
          v1: typeof data.v1 === 'number' ? data.v1 : parseInt(data.v1, 10) || 0,
          v2: String(data.v2 || ''),
          v3: typeof data.v3 === 'number' ? data.v3 : parseFloat(data.v3) || 19.043,
          v4: typeof data.v4 === 'number' ? data.v4 : parseFloat(data.v4) || 73.023,
          v5: String(data.v5 || `https://maps.google.com/?q=${data.v3 || 19.043},${data.v4 || 73.023}`),
          v6: parseInt(String(data.v6), 10) || 0,
          v7: typeof data.v7 === 'number' ? data.v7 : parseFloat(data.v7) || 0,
          v8: typeof data.v8 === 'number' ? data.v8 : parseFloat(data.v8) || 0,
          v9: parseInt(String(data.v9), 10) || 0
        };

        setBlynkPins(parsedPins);

        // Convert percentage to Litres accurately based on active vehicle tank capacity
        const currentPct = Math.max(0, Math.min(100, parsedPins.v0));
        const calcLitres = Math.round((currentPct / 100) * activeVehicle.tankCapacityLitres * 10) / 10;
        const estRange = Math.round(calcLitres * 8.9);

        const frac = currentPct / 100;
        const calcOhms = Math.round((240 - frac * (240 - 33)) * 10) / 10;
        const calcAdc = Math.round(frac * 4095);
        const calcVolt = Math.round((calcAdc / 4095) * 3.3 * 100) / 100;

        setFuel((prev) => ({
          ...prev,
          percentage: currentPct,
          litres: calcLitres,
          senderResistanceOhms: calcOhms,
          rawAdcValue: calcAdc,
          adcVoltageVolts: calcVolt,
          estimatedRangeKm: estRange,
          heartbeatLatencyMs: latency,
          lastUpdatedTimestamp: Date.now(),
          isStale: !isHwConnected && latency > 60000
        }));

        // Append to rolling fuel history
        setFuelHistory((prev) => {
          const now = Date.now();
          const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const lastPt = prev[prev.length - 1];
          if (lastPt && Math.abs(lastPt.litres - calcLitres) < 0.2 && now - lastPt.timestamp < 60000) {
            return prev;
          }
          const next = [...prev, { timestamp: now, timeStr, litres: calcLitres, percentage: currentPct }];
          return next.slice(-15);
        });

        // CRITICAL PROTECTION: If hardware is NOT connected (Device Offline),
        // any values in Blynk Cloud are stale records from a previous session.
        // An offline device must NEVER trigger an emergency siren or ring the phone!
        if (!isHwConnected) {
          audioAlert.stopAlarm();
        }

        // Security logic: V6 = Ignition, V9 = Tamper sensor loop (0=SECURE, 1=TRIPPED)
        // Live alarm evaluation is strictly active ONLY when hardware is verified online
        const pinV9 = parsedPins.v9;
        const tamperJustTripped = pinV9 === 1 && lastTamperPinRef.current === 0;
        const tamperJustRestored = pinV9 === 0 && lastTamperPinRef.current === 1;

        if (tamperJustRestored) {
          isAlarmSilencedRef.current = false;
        }
        if (tamperJustTripped) {
          // Wire was freshly cut/broken - unconditionally re-arm and fire alarm immediately!
          isAlarmSilencedRef.current = false;
        }
        lastTamperPinRef.current = pinV9;

        const isIgnitionOn = isHwConnected && parsedPins.v6 === 1;
        const isTampered = isHwConnected && pinV9 === 1; // Physical wire severed
        const rawTheftMsg = parsedPins.v2.trim();
        const hasTheftMsg = isHwConnected && rawTheftMsg !== '' && rawTheftMsg !== 'OK' && rawTheftMsg !== '0';

        const hardwareAlarmActive = isHwConnected && (isTampered || hasTheftMsg);
        if (!hardwareAlarmActive) {
          isAlarmSilencedRef.current = false;
        }

        const isAlarm = hardwareAlarmActive && !isAlarmSilencedRef.current;

        setSecurity((prev) => {
          if (isAlarm && !prev.theftAlarmActive) {
            if (!isAudioMuted) {
              audioAlert.startAlarmSiren();
            }
            triggerTheftNotification(activeVehicle.plate, (parsedPins.v8 / 100) * activeVehicle.tankCapacityLitres);

            // Record live accurate alert in incident history
            const nowTime = Date.now();
            const litresLostAmount = Math.round(((parsedPins.v8 / 100) * activeVehicle.tankCapacityLitres) * 10) / 10;
            const newLiveAlert: SecurityAlert = {
              id: `ALT-LIVE-${nowTime}`,
              vehicleId: activeVehicle.id,
              timestamp: nowTime,
              severity: 'CRITICAL',
              type: isTampered ? 'TAMPER_LOOP_SEVERED' : 'RAPID_DRAIN_THEFT',
              title: isTampered ? 'Tamper Wire Severed' : 'Rapid Fuel Siphon Detected',
              description: hasTheftMsg
                ? parsedPins.v2
                : isTampered
                ? `Physical anti-tamper security circuit severed on ${activeVehicle.name} (${activeVehicle.plate}).`
                : `Rapid fuel loss (-${litresLostAmount.toFixed(1)}L) detected with ignition OFF on ${activeVehicle.name}.`,
              litresLost: litresLostAmount > 0 ? litresLostAmount : 4.5,
              locationSnapshot: {
                lat: parsedPins.v3 || 19.0433,
                lng: parsedPins.v4 || 73.0232
              },
              status: 'ACTIVE_UNACKNOWLEDGED'
            };

            setAlerts((prevAlerts) => {
              if (prevAlerts.length > 0 && Math.abs(prevAlerts[0].timestamp - nowTime) < 15000) {
                return prevAlerts;
              }
              const updated = [newLiveAlert, ...prevAlerts];
              localStorage.setItem('fs_alerts', JSON.stringify(updated));
              return updated;
            });
          } else if (!isAlarm && prev.theftAlarmActive) {
            audioAlert.stopAlarm();
          }
          return {
            ...prev,
            ignition: isIgnitionOn ? 'ON' : 'OFF',
            tamper: isTampered ? 'TRIPPED' : 'SECURE',
            theftAlarmActive: isAlarm,
            theftAlarmReason: isAlarm
              ? (hasTheftMsg ? parsedPins.v2 : isTampered ? 'Physical sensor wire severed!' : null)
              : null,
            theftDropVolumeLitres: isAlarm ? (parsedPins.v8 / 100) * activeVehicle.tankCapacityLitres : 0
          };
        });

        // GPS from V3, V4, V5
        setGps((prev) => ({
          ...prev,
          latitude: parsedPins.v3,
          longitude: parsedPins.v4,
          gmapsUrl: parsedPins.v5,
          lastFixTimestamp: Date.now(),
          fixType: parsedPins.v3 !== 0 ? '3D' : 'NO_FIX'
        }));

        // Real-Time Waypoint Recording & Trip Fuel Tracking
        const liveLat = parsedPins.v3;
        const liveLng = parsedPins.v4;

        if (liveLat !== 0 && liveLng !== 0) {
          setTrips((prevTrips) => {
            const now = Date.now();
            let active = prevTrips.find((t) => t.status === 'ACTIVE');

            if (!active) {
              const newLiveTrip: TripRecord = {
                id: `TRIP-LIVE-${now}`,
                title: 'Live Journey',
                dateStr: new Date(now).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
                status: 'ACTIVE',
                startTime: now,
                endTime: null,
                distanceKm: 0.0,
                fuelConsumedLitres: 0.0,
                fuelLostLitres: (parsedPins.v8 / 100) * activeVehicle.tankCapacityLitres,
                averageEfficiencyKmL: 8.9,
                startLocation: 'Current Position',
                endLocation: 'En Route...',
                routeHighlightColor: '#16A34A',
                waypoints: [{
                  lat: liveLat,
                  lng: liveLng,
                  timestamp: now,
                  speedKmh: isIgnitionOn ? 45 : 0,
                  fuelLitres: calcLitres
                }]
              };
              const updated: TripRecord[] = [newLiveTrip, ...prevTrips];
              localStorage.setItem('fs_trips', JSON.stringify(updated));
              return updated;
            }

            const wps = active.waypoints || [];
            const lastWp = wps[wps.length - 1];
            const distDelta = lastWp ? haversineDistanceKm(lastWp.lat, lastWp.lng, liveLat, liveLng) : 0;

            // If car has moved at least 15 meters or this is the first point
            if (!lastWp || distDelta > 0.015) {
              const newDistance = Math.round((active.distanceKm + distDelta) * 100) / 100;
              let newBurn = active.fuelConsumedLitres;

              if (lastWp && isIgnitionOn && lastWp.fuelLitres !== undefined) {
                const fuelDelta = lastWp.fuelLitres - calcLitres;
                if (fuelDelta > 0 && fuelDelta < 5) {
                  newBurn = Math.round((active.fuelConsumedLitres + fuelDelta) * 10) / 10;
                }
              }

              const newLost = parsedPins.v8 > 0
                ? Math.round(((parsedPins.v8 / 100) * activeVehicle.tankCapacityLitres) * 10) / 10
                : active.fuelLostLitres;

              const newEfficiency = (newDistance > 0 && newBurn > 0)
                ? Math.round((newDistance / newBurn) * 10) / 10
                : active.averageEfficiencyKmL || 8.9;

              const updatedActive: TripRecord = {
                ...active,
                distanceKm: newDistance,
                fuelConsumedLitres: newBurn,
                fuelLostLitres: newLost,
                averageEfficiencyKmL: newEfficiency,
                endLocation: `${liveLat.toFixed(4)}, ${liveLng.toFixed(4)}`,
                waypoints: [
                  ...wps,
                  {
                    lat: liveLat,
                    lng: liveLng,
                    timestamp: now,
                    speedKmh: isIgnitionOn ? 45 : 0,
                    fuelLitres: calcLitres
                  }
                ].slice(-150)
              };

              const activeId = active.id;
              const updatedList: TripRecord[] = prevTrips.map((t) => (t.id === activeId ? updatedActive : t));
              localStorage.setItem('fs_trips', JSON.stringify(updatedList));
              return updatedList;
            }

            return prevTrips;
          });
        }

        // Diagnostics
        setDiagnostics((prev) => ({
          ...prev,
          onlineState: isHwConnected ? 'ONLINE' : 'OFFLINE',
          lastFuelWhenOff: parsedPins.v7,
          fuelDifference: parsedPins.v8,
          ledCheck: parsedPins.v1,
          lastPingTimestamp: Date.now()
        }));

        setBlynkConfig((prev) => ({
          ...prev,
          isConnected: true,
          isHardwareOnline: isHwConnected,
          lastSyncTime: Date.now(),
          lastError: null
        }));
      } else {
        audioAlert.stopAlarm();
        setBlynkConfig((prev) => ({
          ...prev,
          isConnected: false,
          isHardwareOnline: false,
          lastError: 'Hardware link offline'
        }));
        setDiagnostics((prev) => ({
          ...prev,
          onlineState: 'OFFLINE'
        }));
      }
    } catch (err: unknown) {
      audioAlert.stopAlarm();
      const msg = err instanceof Error ? err.message : 'Network error';
      setBlynkConfig((prev) => ({
        ...prev,
        isConnected: false,
        isHardwareOnline: false,
        lastError: msg
      }));
      setDiagnostics((prev) => ({
        ...prev,
        onlineState: 'OFFLINE'
      }));
    }
  }, [blynkConfig.authToken, activeVehicle.tankCapacityLitres]);

  // Periodic Poller
  useEffect(() => {
    if (diagnostics.connectionMode !== 'BLYNK_LIVE') return;
    triggerBlynkSync();
    const interval = setInterval(() => {
      triggerBlynkSync();
    }, blynkConfig.pollIntervalMs || 2500);
    return () => clearInterval(interval);
  }, [diagnostics.connectionMode, blynkConfig.pollIntervalMs, triggerBlynkSync]);

  // Fallback Simulation Scenarios
  const simulateScenario = (scenario: SimulationScenario) => {
    setActiveScenario(scenario);
    const now = Date.now();

    if (scenario === 'NORMAL_PARKED') {
      audioAlert.stopAlarm();
      setSecurity({
        ignition: 'OFF',
        tamper: 'SECURE',
        theftAlarmActive: false,
        theftAlarmReason: null,
        theftDropVolumeLitres: 0,
        theftDetectionTimestamp: null,
        lastIgnitionChangeTimestamp: now - 3600000 * 2,
        tamperLoopContinuityPercent: 100
      });
      setGps((prev) => ({
        ...prev,
        speedKmh: 0,
        satellitesInView: 9,
        fixType: '3D',
        hdop: 1.1,
        isInsideGeofence: true
      }));
      setDiagnostics((prev) => ({
        ...prev,
        onlineState: 'ONLINE',
        wifiRssiDbm: -62,
        batterySupplyVolts: 12.6,
        nmeaSentencesPerSec: 10,
        lastPingTimestamp: now
      }));
      setFuel((prev) => ({
        ...prev,
        litres: Math.round(activeVehicle.tankCapacityLitres * 0.73 * 10) / 10,
        percentage: 73.0,
        dropRateLpm: 0.0,
        isStale: false,
        heartbeatLatencyMs: 1420
      }));
    } else if (scenario === 'DRIVING') {
      audioAlert.stopAlarm();
      setSecurity({
        ignition: 'ON',
        tamper: 'SECURE',
        theftAlarmActive: false,
        theftAlarmReason: null,
        theftDropVolumeLitres: 0,
        theftDetectionTimestamp: null,
        lastIgnitionChangeTimestamp: now - 600000,
        tamperLoopContinuityPercent: 100
      });
      setGps((prev) => ({
        ...prev,
        speedKmh: 54,
        satellitesInView: 11,
        fixType: '3D',
        hdop: 0.9,
        isInsideGeofence: false
      }));
    } else if (scenario === 'THEFT_SIPHON') {
      const drainedAmount = 14.8;
      const targetLitres = Math.max(2.0, (activeVehicle.tankCapacityLitres * 0.73) - drainedAmount);
      const newPct = Math.round((targetLitres / activeVehicle.tankCapacityLitres) * 1000) / 10;

      setSecurity({
        ignition: 'OFF',
        tamper: 'TRIPPED',
        theftAlarmActive: true,
        theftAlarmReason: `Rapid Fuel Drop: -${drainedAmount.toFixed(1)}L drained in 2 min with IGNITION OFF! Tamper loop open.`,
        theftDropVolumeLitres: drainedAmount,
        theftDetectionTimestamp: now,
        lastIgnitionChangeTimestamp: now - 7200000,
        tamperLoopContinuityPercent: 0
      });

      setFuel((prev) => ({
        ...prev,
        litres: targetLitres,
        percentage: newPct,
        dropRateLpm: -3.8,
        senderResistanceOhms: 186.2,
        estimatedRangeKm: Math.round(targetLitres * 8.9),
        lastUpdatedTimestamp: now,
        isStale: false
      }));

      if (!isAudioMuted) {
        audioAlert.startAlarmSiren();
      }
      triggerTheftNotification(activeVehicle.plate, drainedAmount);

      const simAlert: SecurityAlert = {
        id: `ALT-SIM-${now}`,
        timestamp: now,
        severity: 'CRITICAL',
        type: 'RAPID_DRAIN_THEFT',
        title: 'Rapid Fuel Siphon Detected',
        description: `Rapid Fuel Drop: -${drainedAmount.toFixed(1)}L drained in 2 min with IGNITION OFF on ${activeVehicle.name}!`,
        litresLost: drainedAmount,
        locationSnapshot: {
          lat: 19.0433,
          lng: 73.0232
        },
        status: 'ACTIVE_UNACKNOWLEDGED'
      };

      setAlerts((prevAlerts) => {
        const updated = [simAlert, ...prevAlerts];
        localStorage.setItem('fs_alerts', JSON.stringify(updated));
        return updated;
      });
    } else if (scenario === 'REFILL_STATION') {
      audioAlert.stopAlarm();
      const refillAmount = 48.0;
      const targetLitres = Math.min(activeVehicle.tankCapacityLitres, fuel.litres + refillAmount);
      const newPct = Math.round((targetLitres / activeVehicle.tankCapacityLitres) * 1000) / 10;

      setFuel((prev) => ({
        ...prev,
        litres: targetLitres,
        percentage: newPct,
        dropRateLpm: 12.0,
        lastUpdatedTimestamp: now
      }));
    } else if (scenario === 'HARDWARE_OFFLINE') {
      setDiagnostics((prev) => ({ ...prev, onlineState: 'OFFLINE' }));
      setFuel((prev) => ({ ...prev, isStale: true }));
    } else if (scenario === 'GPS_NO_FIX') {
      setGps((prev) => ({ ...prev, fixType: 'NO_FIX', satellitesInView: 0 }));
    }
  };

  const exportHistoryCsv = () => {
    const headers = ['Event ID', 'Date & Time', 'Event Type', 'Summary', 'Litres Before', 'Litres After', 'Delta Litres', 'Duration (Min)', 'Location', 'Ignition'];
    const rows = history.map((e) => [
      e.id,
      new Date(e.timestamp).toISOString(),
      e.type,
      `"${e.summary.replace(/"/g, '""')}"`,
      e.litresBefore,
      e.litresAfter,
      e.deltaLitres,
      e.durationMinutes,
      `"${e.locationName.replace(/"/g, '""')}"`,
      e.ignitionAtTime
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DivineFuel_Logs_${activeVehicle.plate.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <TelemetryContext.Provider
      value={{
        vehicles,
        activeVehicleId,
        vehicle: activeVehicle,
        switchVehicle,
        updateActiveVehicle,
        addNewVehicle,
        deleteVehicle,
        fuel,
        fuelHistory,
        security,
        gps,
        diagnostics,
        alerts: activeAlerts,
        allFleetAlerts: alerts,
        history,
        firebaseConfig,
        blynkConfig,
        blynkPins,
        hardwarePins: blynkPins,
        theme,
        isAudioMuted,
        activeScenario,
        trips,
        selectedTripId,
        isHardwareOnline: blynkConfig.isHardwareOnline,
        selectTrip,
        startTrip,
        endActiveTrip,
        setTheme,
        toggleAudioMute,
        testAudioAlarm,
        setConnectionMode,
        simulateScenario,
        resetTamper,
        acknowledgeAlert,
        dispatchEmergency,
        resolveAlert,
        markFalseAlarm,
        dismissAlert,
        updateVehicleConfig,
        updateFirebaseConfig,
        updateBlynkConfig,
        triggerBlynkSync,
        triggerHardwareSync: triggerBlynkSync,
        toggleBlynkLedCheck,
        toggleLedCheck: toggleBlynkLedCheck,
        exportHistoryCsv,
        clearHistory,
        resetFleetToDefaults,
        reloadTestingAlerts
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = (): TelemetryContextType => {
  const ctx = useContext(TelemetryContext);
  if (!ctx) {
    throw new Error('useTelemetry must be used within TelemetryProvider');
  }
  return ctx;
};
