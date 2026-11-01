// ESP32 Hardware Diagnostics & Live Sensor Telemetry Suite
// Sleek Modern iOS Design with Sensor Pin Readings, Microcontroller Health & Firmware Code

import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import {
  DiagnosticsChipIcon,
  CheckmarkIcon,
  RefreshCycleIcon,
  SignalWifiIcon,
  BatteryIcon
} from '../components/Icons';

export const DiagnosticsScreen: React.FC = () => {
  const {
    diagnostics,
    blynkConfig,
    hardwarePins,
    triggerHardwareSync,
    toggleLedCheck,
    vehicle
  } = useTelemetry();

  const [copiedCode, setCopiedCode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'SENSOR_PINS' | 'PINOUT' | 'FIRMWARE'>('SENSOR_PINS');

  const handleSync = async () => {
    setIsSyncing(true);
    await triggerHardwareSync();
    setTimeout(() => setIsSyncing(false), 500);
  };

  const esp32Code = `/*
  DIVINE FUEL - PROFESSIONAL AUTOMOTIVE TELEMETRY & ANTI-THEFT FIRMWARE
  Blynk Template ID   : ${blynkConfig.templateId}
  Blynk Template Name : Divine Fuel
  Blynk Auth Token    : ${blynkConfig.authToken}
*/

#define BLYNK_TEMPLATE_ID   "${blynkConfig.templateId}"
#define BLYNK_TEMPLATE_NAME "Divine Fuel"
#define BLYNK_AUTH_TOKEN    "${blynkConfig.authToken}"

#include <WiFi.h>
#include <WiFiClient.h>
#include <BlynkSimpleEsp32.h>
#include <HardwareSerial.h>
#include <TinyGPSPlus.h>
#include <Preferences.h>

// GPIO PIN CONFIGURATION
#define PIN_FUEL_ADC        34   // ADC1_CH6 - Tank resistance sensor
#define PIN_IGNITION_SENSE  27   // 12V Key Switch Ignition Sense
#define PIN_TAMPER_LOOP     26   // Anti-tamper loop to GND (INPUT_PULLUP)
#define PIN_SIREN_RELAY     22   // 110dB Siren Horn Relay (Active HIGH)
#define PIN_CUTOFF_VALVE    23   // Engine Fuel Line Solenoid Valve
#define PIN_STATUS_LED       2   // Diagnostic Heartbeat LED
#define GPS_RX_PIN          16   // NEO-6M TX -> ESP32 RX2
#define GPS_TX_PIN          17   // NEO-6M RX -> ESP32 TX2

const float TANK_CAPACITY_LITRES  = 150.0;
const float THEFT_DROP_THRESH_PCT = 1.5; // Siphon alarm threshold

const float DEFAULT_V_FULL  = 0.30;
const float DEFAULT_V_EMPTY = 1.75;

TinyGPSPlus gps;
HardwareSerial GPS_Serial(2);
BlynkTimer timer;
Preferences prefs;

float calVFull = DEFAULT_V_FULL;
float calVEmpty = DEFAULT_V_EMPTY;
float filteredVoltageMv = 0.0;
bool isFilterInitialized = false;

float fuelLevelPercent = 0.0;
int ignitionStatus = 0;
int lastIgnitionState = -1;
float lastFuelWhenOff = 0.0;
float fuelDifference = 0.0;
int tamperStatus = 0;
bool isTheftAlarm = false;
String theftAlertMsg = "SYSTEM NORMAL";

char ssid[] = "YOUR_WIFI_NAME";
char pass[] = "YOUR_WIFI_PASSWORD";

void readFilteredFuel() {
  uint32_t rawMvTotal = 0;
  for (int i = 0; i < 25; i++) {
    rawMvTotal += analogReadMilliVolts(PIN_FUEL_ADC);
    delayMicroseconds(800);
  }
  float instantMv = (float)rawMvTotal / 25.0;
  if (!isFilterInitialized) {
    filteredVoltageMv = instantMv;
    isFilterInitialized = true;
  } else {
    filteredVoltageMv = (0.08 * instantMv) + (0.92 * filteredVoltageMv);
  }
  float v = filteredVoltageMv / 1000.0;
  float pct = ((calVEmpty - v) / (calVEmpty - calVFull)) * 100.0;
  fuelLevelPercent = constrain(pct, 0.0, 100.0);
}

void readIgnitionAndTamper() {
  ignitionStatus = (digitalRead(PIN_IGNITION_SENSE) == HIGH) ? 1 : 0;
  tamperStatus = (digitalRead(PIN_TAMPER_LOOP) == LOW) ? 1 : 0;

  if (lastIgnitionState == 1 && ignitionStatus == 0) {
    lastFuelWhenOff = fuelLevelPercent;
    fuelDifference = 0.0;
  }
  lastIgnitionState = ignitionStatus;
}

void evaluateTheftSecurity() {
  isTheftAlarm = false;
  if (tamperStatus == 1) {
    isTheftAlarm = true;
    theftAlertMsg = "CRITICAL: TAMPER WIRE SEVERED!";
  } else if (ignitionStatus == 0 && lastFuelWhenOff > 0.0) {
    fuelDifference = lastFuelWhenOff - fuelLevelPercent;
    if (fuelDifference >= THEFT_DROP_THRESH_PCT) {
      isTheftAlarm = true;
      theftAlertMsg = "THEFT: RAPID SIPHON DETECTED!";
    } else {
      theftAlertMsg = "SYSTEM NORMAL";
    }
  } else {
    theftAlertMsg = "SYSTEM NORMAL";
    fuelDifference = 0.0;
  }
  digitalWrite(PIN_SIREN_RELAY, isTheftAlarm ? HIGH : LOW);
}

void readGPS() {
  while (GPS_Serial.available() > 0) gps.encode(GPS_Serial.read());
}

void sendTelemetryToBlynk() {
  readFilteredFuel();
  readIgnitionAndTamper();
  evaluateTheftSecurity();

  if (Blynk.connected()) {
    Blynk.virtualWrite(V0, round(fuelLevelPercent));
    Blynk.virtualWrite(V2, theftAlertMsg);
    Blynk.virtualWrite(V6, ignitionStatus);
    Blynk.virtualWrite(V7, lastFuelWhenOff);
    Blynk.virtualWrite(V8, fuelDifference);
    Blynk.virtualWrite(V9, tamperStatus);

    if (gps.location.isValid() && gps.location.age() < 5000) {
      Blynk.virtualWrite(V3, gps.location.lat());
      Blynk.virtualWrite(V4, gps.location.lng());
      String gmaps = "https://www.google.com/maps?q=" + String(gps.location.lat(), 6) + "," + String(gps.location.lng(), 6);
      Blynk.virtualWrite(V5, gmaps);
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_IGNITION_SENSE, INPUT);
  pinMode(PIN_TAMPER_LOOP, INPUT_PULLUP);
  pinMode(PIN_SIREN_RELAY, OUTPUT);
  pinMode(PIN_CUTOFF_VALVE, OUTPUT);
  pinMode(PIN_STATUS_LED, OUTPUT);
  analogReadResolution(12);
  analogSetPinAttenuation(PIN_FUEL_ADC, ADC_11db);
  GPS_Serial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);

  Blynk.begin(BLYNK_AUTH_TOKEN, ssid, pass);
  timer.setInterval(2000L, sendTelemetryToBlynk);
}

void loop() {
  Blynk.run();
  timer.run();
  readGPS();
}
`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(esp32Code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2400);
  };

  const pinDefinitions = [
    { pin: 'V0', name: 'Fuel Level', value: `${hardwarePins.v0}%`, desc: 'Analog resistance mapped 0-100%' },
    { pin: 'V1', name: 'Onboard LED Check', value: hardwarePins.v1 > 0 ? 'HIGH (ON)' : 'LOW (OFF)', desc: 'GPIO 2 hardware check' },
    { pin: 'V2', name: 'Security Alert Text', value: hardwarePins.v2 || 'NOMINAL (OK)', desc: 'Tamper & rapid drain message' },
    { pin: 'V3', name: 'GPS Latitude', value: hardwarePins.v3.toFixed(4), desc: 'NEO-6M NMEA latitude coordinate' },
    { pin: 'V4', name: 'GPS Longitude', value: hardwarePins.v4.toFixed(4), desc: 'NEO-6M NMEA longitude coordinate' },
    { pin: 'V5', name: 'Google Maps Link', value: 'Active Live URL', desc: 'Direct map search endpoint' },
    { pin: 'V6', name: 'Ignition State', value: hardwarePins.v6 === 1 ? '1 (ENGINE ON)' : '0 (KEY OFF)', desc: '12V optocoupler sense GPIO 25' },
    { pin: 'V7', name: 'Parked Baseline Fuel', value: `${hardwarePins.v7.toFixed(1)}%`, desc: 'Fuel percentage locked when key turned off' },
    { pin: 'V8', name: 'Parked Fuel Diff', value: `${hardwarePins.v8.toFixed(1)} L`, desc: 'Theft siphon volume difference' },
    { pin: 'V9', name: 'Tamper Circuit', value: hardwarePins.v9 === 1 ? '1 (TRIPPED)' : '0 (INTACT)', desc: 'Ground continuity loop GPIO 26' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 14px' }}>
      {/* 1. HARDWARE STATUS CARD */}
      <div className="ios-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>
              ESP32 Hardware Diagnostics
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              Microcontroller link for {vehicle.plate}
            </div>
          </div>

          <button
            onClick={handleSync}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#15803D',
              color: '#FFFFFF',
              borderRadius: '10px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <RefreshCycleIcon size={14} className={isSyncing ? 'spin-icon' : ''} />
            <span>{isSyncing ? 'Syncing...' : 'Poll Hardware'}</span>
          </button>
        </div>

        {/* Microcontroller Health Triad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '10px 8px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#6B7280', fontSize: '11px', fontWeight: 600 }}>
              <SignalWifiIcon size={14} color="#15803D" />
              <span>WI-FI RSSI</span>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginTop: '2px' }}>
              {diagnostics.wifiRssiDbm} dBm
            </div>
            <div style={{ fontSize: '10px', color: '#16A34A', fontWeight: 600 }}>Good Signal</div>
          </div>

          <div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '10px 8px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#6B7280', fontSize: '11px', fontWeight: 600 }}>
              <BatteryIcon size={14} color="#15803D" />
              <span>BATTERY</span>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginTop: '2px' }}>
              {diagnostics.batterySupplyVolts.toFixed(1)} V
            </div>
            <div style={{ fontSize: '10px', color: '#16A34A', fontWeight: 600 }}>12V Rail Nominal</div>
          </div>

          <div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '10px 8px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#6B7280', fontSize: '11px', fontWeight: 600 }}>
              <DiagnosticsChipIcon size={14} color="#15803D" />
              <span>CPU TEMP</span>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginTop: '2px' }}>
              {diagnostics.espCpuTempC.toFixed(0)}&deg;C
            </div>
            <div style={{ fontSize: '10px', color: '#6B7280' }}>Free: 184 KB</div>
          </div>
        </div>
      </div>

      {/* 2. TAB SELECTOR */}
      <div style={{ display: 'flex', gap: '8px', backgroundColor: '#E5E7EB', padding: '4px', borderRadius: '14px' }}>
        <button
          onClick={() => setActiveTab('SENSOR_PINS')}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: activeTab === 'SENSOR_PINS' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'SENSOR_PINS' ? '#111827' : '#6B7280',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
            boxShadow: activeTab === 'SENSOR_PINS' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          Datastreams (V0-V9)
        </button>

        <button
          onClick={() => setActiveTab('PINOUT')}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: activeTab === 'PINOUT' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'PINOUT' ? '#111827' : '#6B7280',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
            boxShadow: activeTab === 'PINOUT' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          GPIO Pin Map
        </button>

        <button
          onClick={() => setActiveTab('FIRMWARE')}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: activeTab === 'FIRMWARE' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'FIRMWARE' ? '#111827' : '#6B7280',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
            boxShadow: activeTab === 'FIRMWARE' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          C++ Code
        </button>
      </div>

      {/* 3. TAB 1: SENSOR DATASTREAMS (V0-V9) */}
      {activeTab === 'SENSOR_PINS' && (
        <div className="ios-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>
              Virtual Datastreams
            </span>
            <button
              onClick={toggleLedCheck}
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 600,
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              Toggle LED (V1)
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {pinDefinitions.map((item) => (
              <div
                key={item.pin}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #F3F4F6'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ backgroundColor: '#E5E7EB', color: '#111827', fontSize: '11px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                      {item.pin}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                      {item.name}
                    </span>
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#6B7280', marginTop: '1px' }}>
                    {item.desc}
                  </div>
                </div>

                <div style={{ fontSize: '13px', fontWeight: 800, color: '#15803D' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TAB 2: GPIO PIN MAP */}
      {activeTab === 'PINOUT' && (
        <div className="ios-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
            ESP32 Microcontroller Physical Pinout
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>
            Wiring harness schematic for fuel sender, ignition, GPS and relays
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>GPIO 34 (ADC1_CH6) &middot; Fuel Sender Resistance</div>
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>Connected to vehicle fuel float sensor with a 150&Omega; pull-up to 3.3V.</div>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>GPIO 25 &middot; Ignition 12V Sense (Optocoupler)</div>
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>PC817 optocoupler isolates vehicle 12V ACC line to 3.3V logic.</div>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>GPIO 26 &middot; Tank Security Tamper Loop</div>
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>Continuous grounded wire loop around fuel tank strap with interrupt trigger on cut.</div>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>GPIO 22 &middot; 110dB Alarm Siren Relay</div>
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>12V relay module driving high-decibel vehicle horn under chassis.</div>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>GPIO 23 &middot; Fuel Line Solenoid Cutoff Valve</div>
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>Inline solenoid valve to shut diesel supply to prevent unauthorized drive-away.</div>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>GPIO 16 (RX2) &amp; GPIO 17 (TX2) &middot; NEO-6M GPS</div>
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>HardwareSerial UART2 at 9600 baud streaming NMEA satellite coordinates.</div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: ESP32 C++ EMBEDDED CODE */}
      {activeTab === 'FIRMWARE' && (
        <div className="ios-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>
              Production ESP32 Firmware
            </span>
            <button
              onClick={handleCopyCode}
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#15803D',
                color: '#FFFFFF',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {copiedCode ? <CheckmarkIcon size={13} color="#FFFFFF" /> : 'Copy Code'}
            </button>
          </div>

          <pre
            style={{
              backgroundColor: '#1E293B',
              color: '#E2E8F0',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '11px',
              fontFamily: 'monospace',
              overflowX: 'auto',
              maxHeight: '320px'
            }}
          >
            {esp32Code}
          </pre>
        </div>
      )}
    </div>
  );
};
