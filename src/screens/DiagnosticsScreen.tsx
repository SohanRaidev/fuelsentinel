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
  FUEL SENTINEL - ESP32 EMBEDDED AUTOMOTIVE FIRMWARE
  Auth Token: ${blynkConfig.authToken}
  Template ID: ${blynkConfig.templateId}
*/

#define BLYNK_TEMPLATE_ID   "${blynkConfig.templateId}"
#define BLYNK_TEMPLATE_NAME "Fuel Sentinel"
#define BLYNK_AUTH_TOKEN    "${blynkConfig.authToken}"

#include <WiFi.h>
#include <BlynkSimpleEsp32.h>
#include <HardwareSerial.h>
#include <TinyGPSPlus.h>

#define PIN_FUEL_ADC       34   // Fuel sender (150 ohm pull-up to 3.3V)
#define PIN_IGNITION_SENSE 25   // Optocoupler 12V key sense
#define PIN_TAMPER_LOOP    26   // Grounded security loop
#define PIN_SIREN_RELAY    22   // 110dB siren relay
#define PIN_CUTOFF_VALVE   23   // Fuel line solenoid cutoff
#define PIN_ONBOARD_LED     2   // Status LED

HardwareSerial gpsSerial(2);
TinyGPSPlus gps;
BlynkTimer timer;

void sendTelemetry() {
  int rawAdc = analogRead(PIN_FUEL_ADC);
  int fuelPct = constrain(map(rawAdc, 500, 3200, 0, 100), 0, 100);
  Blynk.virtualWrite(V0, fuelPct);

  int ignState = digitalRead(PIN_IGNITION_SENSE);
  Blynk.virtualWrite(V6, ignState);

  int tamperState = digitalRead(PIN_TAMPER_LOOP);
  Blynk.virtualWrite(V9, tamperState);

  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  if (gps.location.isValid()) {
    Blynk.virtualWrite(V3, gps.location.lat());
    Blynk.virtualWrite(V4, gps.location.lng());
    String gmaps = "https://maps.google.com/?q=" + String(gps.location.lat(), 6) + "," + String(gps.location.lng(), 6);
    Blynk.virtualWrite(V5, gmaps);
  }
}

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600, SERIAL_8N1, 16, 17);
  pinMode(PIN_FUEL_ADC, INPUT);
  pinMode(PIN_IGNITION_SENSE, INPUT_PULLDOWN);
  pinMode(PIN_TAMPER_LOOP, INPUT_PULLUP);
  pinMode(PIN_SIREN_RELAY, OUTPUT);
  pinMode(PIN_CUTOFF_VALVE, OUTPUT);
  pinMode(PIN_ONBOARD_LED, OUTPUT);

  Blynk.begin(BLYNK_AUTH_TOKEN, "YOUR_WIFI_SSID", "YOUR_WIFI_PASS");
  timer.setInterval(2000L, sendTelemetry);
}

void loop() {
  Blynk.run();
  timer.run();
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
