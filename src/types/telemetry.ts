// Divine Fuel Telemetry & Security Domain Types

export type IgnitionState = 'OFF' | 'ACC' | 'ON' | 'CRANK';
export type TamperState = 'SECURE' | 'TRIPPED' | 'TAMPER_DETECTED' | 'LOOP_OPEN';
export type GpsFixType = 'NO_FIX' | '2D' | '3D';
export type ConnectionMode = 'BLYNK_LIVE' | 'DEMO_SIMULATION' | 'FIREBASE_LIVE';
export type DeviceOnlineState = 'ONLINE' | 'OFFLINE' | 'STALE';
export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type AlertStatus = 'ACTIVE_UNACKNOWLEDGED' | 'ACKNOWLEDGED' | 'DISPATCHED' | 'RESOLVED' | 'FALSE_ALARM';
export type FuelSenderStandard = '240-33' | '0-190' | '0-90' | 'CUSTOM';

export interface CalibrationPoint {
  ohms: number;
  litres: number;
}

export interface VehicleConfig {
  id: string;
  name: string;
  plate: string;
  vin: string;
  tankCapacityLitres: number;
  fuelType: 'DIESEL' | 'PETROL' | 'ETHANOL';
  tankGeometry: 'RECTANGULAR' | 'CYLINDRICAL' | 'STEPPED_SADDLE';
  senderStandard: FuelSenderStandard;
  calibrationPoints: CalibrationPoint[];
  theftDropRateThresholdLpm: number;
  emergencyContactPhone: string;
  geofenceRadiusMeters: number;
  blynkAuthToken?: string;
}

export interface FuelTelemetry {
  litres: number;
  capacityLitres: number;
  percentage: number;
  senderResistanceOhms: number;
  rawAdcValue: number;
  adcVoltageVolts: number;
  dropRateLpm: number;
  estimatedRangeKm: number;
  lastUpdatedTimestamp: number;
  heartbeatLatencyMs: number;
  isStale: boolean;
}

export interface SecurityTelemetry {
  ignition: IgnitionState;
  tamper: TamperState;
  theftAlarmActive: boolean;
  theftAlarmReason: string | null;
  theftDropVolumeLitres: number;
  theftDetectionTimestamp: number | null;
  lastIgnitionChangeTimestamp: number;
  tamperLoopContinuityPercent: number;
}

export interface GpsTelemetry {
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  speedKmh: number;
  headingDegrees: number;
  satellitesInView: number;
  fixType: GpsFixType;
  hdop: number;
  lastFixTimestamp: number;
  isInsideGeofence: boolean;
  geofenceCenter: {
    lat: number;
    lng: number;
  };
  gmapsUrl?: string;
}

export interface BlynkDatastreams {
  v0: number; // Fuel level (0 - 100)
  v1: number; // led check (0 - 255)
  v2: string; // Theft Alert message (e.g. "TAMPERING DETECTED!")
  v3: number; // Latitude
  v4: number; // Longitude
  v5: string; // Google maps link
  v6: number; // ignition (0 = OFF, 1 = ON)
  v7: number; // Last fuel when off
  v8: number; // Fuel difference
  v9: number; // Tampering (0 = OK, 1 = TAMPERED)
}

export interface BlynkConfig {
  authToken: string;
  templateId: string;
  serverUrl: string;
  isConnected: boolean;
  isHardwareOnline: boolean;
  lastSyncTime: number | null;
  lastError: string | null;
  pollIntervalMs: number;
}

export interface Esp32Diagnostics {
  hardwareId: string;
  firmwareVersion: string;
  connectionMode: ConnectionMode;
  onlineState: DeviceOnlineState;
  wifiRssiDbm: number;
  batterySupplyVolts: number;
  rail3v3Volts: number;
  espCpuTempC: number;
  freeHeapBytes: number;
  uptimeSeconds: number;
  nmeaSentencesPerSec: number;
  lastPingTimestamp: number;
  lastFuelWhenOff: number;
  fuelDifference: number;
  ledCheck: number;
}

export interface SecurityAlert {
  id: string;
  timestamp: number;
  severity: AlertSeverity;
  type:
    | 'RAPID_DRAIN_THEFT'
    | 'TAMPER_LOOP_SEVERED'
    | 'GEOFENCE_BREACH'
    | 'BATTERY_DISCONNECT'
    | 'LOW_FUEL'
    | 'STALE_DATA_OFFLINE'
    | 'GPS_SIGNAL_LOST';
  title: string;
  description: string;
  litresLost?: number;
  locationSnapshot?: {
    lat: number;
    lng: number;
  };
  status: AlertStatus;
  acknowledgedAt?: number;
  dispatchedAt?: number;
  resolvedAt?: number;
  resolutionNotes?: string;
}

export interface HistoricalEvent {
  id: string;
  timestamp: number;
  type: 'FUEL_DRAIN' | 'FUEL_FILL' | 'IGNITION_CYCLE' | 'SECURITY_ALARM' | 'TAMPER_TRIP';
  summary: string;
  litresBefore: number;
  litresAfter: number;
  deltaLitres: number;
  durationMinutes: number;
  locationName: string;
  ignitionAtTime: IgnitionState;
}

export interface FuelHistoryPoint {
  timestamp: number;
  timeStr: string;
  litres: number;
  percentage: number;
}

export type HardwarePins = BlynkDatastreams;
export type HardwareGatewayConfig = BlynkConfig;

export interface FirebaseConfig {
  apiKey: string;
  databaseURL: string;
  projectId: string;
  deviceId: string;
  authToken: string;
  isConnected: boolean;
  lastSyncTime: number | null;
}

export interface TripWaypoint {
  lat: number;
  lng: number;
  timestamp: number;
  speedKmh: number;
  fuelLitres: number;
}

export interface TripRecord {
  id: string;
  title: string;
  dateStr: string;
  startTime: number;
  endTime: number | null;
  status: 'ACTIVE' | 'COMPLETED';
  distanceKm: number;
  fuelConsumedLitres: number;
  fuelLostLitres: number; // siphoned / parked fuel drain
  averageEfficiencyKmL: number; // km / L
  startLocation: string;
  endLocation: string;
  routeHighlightColor?: string;
  waypoints: TripWaypoint[];
}

