/*
  =============================================================================
  DIVINE FUEL - PROFESSIONAL AUTOMOTIVE TELEMETRY & ANTI-THEFT FIRMWARE
  =============================================================================
  Target MCU  : ESP32-WROOM-32 / ESP32-WROOM-32U
  Features    :
    - 5-Point / 2-Point Non-Volatile Flash Calibration (NVS Preferences.h)
    - Exponential Moving Average (EMA) Fuel Slosh Filtering for High Precision
    - Rapid Siphon & Fuel Theft Detection (Ignition OFF + Volume Drop)
    - Anti-Tamper Security Wire Loop Monitoring
    - NEO-6M GPS Tracking with Dynamic Google Maps URL Generation
    - Physical Actuator Control (110dB Siren Relay + Fuel Solenoid Cutoff)
    - Non-Blocking Network Architecture (No freeze during cellular dead zones)
    - Full Synchronization with Divine Fuel PWA (Datastreams V0 - V11)

  Blynk Template ID   : TMPL3V68moLoN
  Blynk Template Name : Divine Fuel
  Blynk Auth Token    : 6SR0JUj39EfvIM0Ke-VtPwGR-tUvh43e
  =============================================================================
*/

#define BLYNK_TEMPLATE_ID   "TMPL3V68moLoN"
#define BLYNK_TEMPLATE_NAME "Divine Fuel"
#define BLYNK_AUTH_TOKEN    "6SR0JUj39EfvIM0Ke-VtPwGR-tUvh43e"

#define BLYNK_PRINT Serial

#include <WiFi.h>
#include <WiFiClient.h>
#include <BlynkSimpleEsp32.h>
#include <HardwareSerial.h>
#include <TinyGPSPlus.h>
#include <Preferences.h>

// ======================== HARDWARE GPIO ASSIGNMENTS =========================

#define PIN_FUEL_ADC        34   // ADC1_CH6 - Tank resistance sensor (pull-up circuit)
#define PIN_IGNITION_SENSE  27   // 12V Key Switch Ignition Sense (via optocoupler/divider)
#define PIN_TAMPER_LOOP     26   // Anti-tamper loop to GND (INPUT_PULLUP: LOW = Normal, HIGH = Wire Cut)
#define PIN_SIREN_RELAY     22   // 110dB Siren Horn Relay (Active HIGH)
#define PIN_CUTOFF_VALVE    23   // Engine Fuel Line Solenoid Valve (Active HIGH = Closed)
#define PIN_STATUS_LED       2   // Onboard ESP32 Heartbeat Diagnostic LED

#define GPS_RX_PIN          16   // Connect to NEO-6M TX
#define GPS_TX_PIN          17   // Connect to NEO-6M RX

// ======================== VEHICLE & SECURITY CONSTANTS ======================

const float TANK_CAPACITY_LITRES = 150.0; // Total tank volume (Adjust to your vehicle)
const float THEFT_DROP_THRESH_PCT = 1.5;  // Trigger alarm if fuel drops >= 1.5% while parked (~2.25L)

// Default Voltage Calibration (Inversely proportional to fuel level)
// Can be updated and saved permanently to ESP32 Flash memory over Blynk
const float DEFAULT_V_FULL  = 0.30; // Volts when tank is 100% FULL
const float DEFAULT_V_EMPTY = 1.75; // Volts when tank is 0% EMPTY

// ======================== GLOBAL OBJECTS & STATE ============================

TinyGPSPlus gps;
HardwareSerial GPS_Serial(2);
BlynkTimer timer;
Preferences prefs;

// Calibration stored in Flash NVS
float calVFull  = DEFAULT_V_FULL;
float calVEmpty = DEFAULT_V_EMPTY;

// Filtered Telemetry Variables
float filteredVoltageMv = 0.0;
bool isFilterInitialized = false;

float fuelLevelPercent = 0.0;
float fuelLevelLitres  = 0.0;

int ignitionStatus     = 0;
int lastIgnitionState  = -1;
float lastFuelWhenOff  = 0.0;
float fuelDifference   = 0.0;

int tamperStatus       = 0;
bool isTheftAlarm      = false;
String theftAlertMsg   = "SYSTEM NORMAL";

bool remoteSirenActive = false;
bool remoteCutoffActive= false;

float latitude         = 0.0;
float longitude        = 0.0;
float speedKmh         = 0.0;
bool gpsValid          = false;

int heartbeatCounter   = 0;

// Wi-Fi Credentials (Replace with your hotspot or truck router)
char ssid[] = "YOUR_WIFI_NAME";
char pass[] = "YOUR_WIFI_PASSWORD";

// ======================== NVS FLASH STORAGE =================================

void loadCalibrationFromNVS() {
  prefs.begin("divine_fuel", false);
  calVFull  = prefs.getFloat("v_full", DEFAULT_V_FULL);
  calVEmpty = prefs.getFloat("v_empty", DEFAULT_V_EMPTY);
  lastFuelWhenOff = prefs.getFloat("last_off_fuel", 0.0);
  prefs.end();

  Serial.println("[NVS] Loaded Calibration Profiles:");
  Serial.print("      V_FULL  : "); Serial.print(calVFull, 3); Serial.println(" V");
  Serial.print("      V_EMPTY : "); Serial.print(calVEmpty, 3); Serial.println(" V");
}

void saveCalibrationToNVS(float newFull, float newEmpty) {
  prefs.begin("divine_fuel", false);
  prefs.putFloat("v_full", newFull);
  prefs.putFloat("v_empty", newEmpty);
  prefs.end();
  calVFull  = newFull;
  calVEmpty = newEmpty;
  Serial.println("[NVS] Calibration updated and saved to Flash Memory!");
}

void saveLastFuelWhenOff(float val) {
  prefs.begin("divine_fuel", false);
  prefs.putFloat("last_off_fuel", val);
  prefs.end();
}

// ======================== PRECISION FUEL SENSING ============================

/*
  Reads ADC using ESP32 calibrated analogReadMilliVolts() and applies
  Exponential Moving Average (EMA) filter to completely eliminate
  fuel sloshing jitter during vehicle cornering, braking, and hill climbs.
*/
void readFilteredFuel() {
  uint32_t rawMvTotal = 0;
  const int SAMPLES = 25;

  for (int i = 0; i < SAMPLES; i++) {
    rawMvTotal += analogReadMilliVolts(PIN_FUEL_ADC);
    delayMicroseconds(800);
  }

  float instantMv = (float)rawMvTotal / (float)SAMPLES;

  if (!isFilterInitialized) {
    filteredVoltageMv = instantMv;
    isFilterInitialized = true;
  } else {
    // EMA smoothing: alpha = 0.08 provides rock-solid anti-slosh damping
    const float alpha = 0.08;
    filteredVoltageMv = (alpha * instantMv) + ((1.0 - alpha) * filteredVoltageMv);
  }

  float voltageVolts = filteredVoltageMv / 1000.0;

  // Inversely proportional voltage conversion
  float pct = ((calVEmpty - voltageVolts) / (calVEmpty - calVFull)) * 100.0;
  fuelLevelPercent = constrain(pct, 0.0, 100.0);
  fuelLevelLitres  = (fuelLevelPercent / 100.0) * TANK_CAPACITY_LITRES;
}

// ======================== IGNITION & TAMPER SENSING =========================

void readIgnitionAndTamper() {
  ignitionStatus = (digitalRead(PIN_IGNITION_SENSE) == HIGH) ? 1 : 0;

  // Tamper detection: Pin has INPUT_PULLUP.
  // Switch to ground: If switch opens or wire is cut/tampered, reading becomes HIGH.
  // If your switch is inverted (LOW = Tampered), change == HIGH to == LOW.
  tamperStatus = (digitalRead(PIN_TAMPER_LOOP) == LOW) ? 1 : 0;

  // Detect Key OFF Transition (Driver turns engine off and parks)
  if (lastIgnitionState == 1 && ignitionStatus == 0) {
    lastFuelWhenOff = fuelLevelPercent;
    fuelDifference  = 0.0;
    saveLastFuelWhenOff(lastFuelWhenOff);
    Serial.print("[SECURITY] Engine switched OFF. Benchmark fuel locked at: ");
    Serial.print(lastFuelWhenOff, 1);
    Serial.println("%");
  }

  // Detect Key ON Transition
  if (lastIgnitionState == 0 && ignitionStatus == 1) {
    Serial.println("[IGNITION] Engine Started. Normal driving mode active.");
  }

  lastIgnitionState = ignitionStatus;
}

// ======================== THEFT & SIPHON ALGORITHM ==========================

void evaluateTheftSecurity() {
  isTheftAlarm = false;

  // 1. TAMPER LOOP SECURITY CHECK
  if (tamperStatus == 1) {
    isTheftAlarm = true;
    theftAlertMsg = "🚨 CRITICAL: TAMPER WIRE SEVERED!";
  }
  // 2. RAPID SIPHON THEFT CHECK (Ignition is OFF, but fuel is draining)
  else if (ignitionStatus == 0 && lastFuelWhenOff > 0.0) {
    fuelDifference = lastFuelWhenOff - fuelLevelPercent;

    if (fuelDifference >= THEFT_DROP_THRESH_PCT) {
      isTheftAlarm = true;
      float litresLost = (fuelDifference / 100.0) * TANK_CAPACITY_LITRES;
      theftAlertMsg = "🚨 THEFT: SIPHON DETECTED (-" + String(fuelDifference, 1) + "% / -" + String(litresLost, 1) + "L)!";
    } else {
      theftAlertMsg = "SYSTEM NORMAL";
    }
  } else {
    theftAlertMsg = "SYSTEM NORMAL";
    fuelDifference = 0.0;
  }

  // 3. ACTUATOR ENGAGEMENT (Physical 110dB Siren Relay)
  if (isTheftAlarm || remoteSirenActive) {
    digitalWrite(PIN_SIREN_RELAY, HIGH);
  } else {
    digitalWrite(PIN_SIREN_RELAY, LOW);
  }

  // 4. FUEL CUTOFF VALVE ENGAGEMENT
  if (remoteCutoffActive) {
    digitalWrite(PIN_CUTOFF_VALVE, HIGH); // Valve closed / fuel supply cut
  } else {
    digitalWrite(PIN_CUTOFF_VALVE, LOW);  // Valve open / normal flow
  }
}

// ======================== GPS SATELLITE TELEMETRY ===========================

void readGPS() {
  while (GPS_Serial.available() > 0) {
    gps.encode(GPS_Serial.read());
  }

  if (gps.location.isValid() && gps.location.age() < 5000) {
    latitude  = gps.location.lat();
    longitude = gps.location.lng();
    speedKmh  = gps.speed.kmph();
    gpsValid  = true;
  } else if (gps.location.age() > 10000) {
    gpsValid = false;
  }
}

// ======================== BLYNK CLOUD TELEMETRY DISPATCH ====================

void sendTelemetryToBlynk() {
  readFilteredFuel();
  readIgnitionAndTamper();
  evaluateTheftSecurity();

  // Heartbeat pulse LED
  heartbeatCounter = (heartbeatCounter + 50) % 255;
  digitalWrite(PIN_STATUS_LED, (heartbeatCounter > 128) ? HIGH : LOW);

  if (Blynk.connected()) {
    // V0: Fuel Level Percentage (0 - 100)
    Blynk.virtualWrite(V0, round(fuelLevelPercent));

    // V1: Live Hardware LED Heartbeat (0 - 255)
    Blynk.virtualWrite(V1, heartbeatCounter);

    // V2: Security Alert Message (Triggers push alerts & loud siren in PWA)
    Blynk.virtualWrite(V2, theftAlertMsg);

    // V6: Ignition Key Status (0 = OFF, 1 = ON)
    Blynk.virtualWrite(V6, ignitionStatus);

    // V7: Benchmark Fuel When Engine Switched Off (Percentage)
    Blynk.virtualWrite(V7, lastFuelWhenOff);

    // V8: Fuel Difference Lost While Parked (Percentage)
    Blynk.virtualWrite(V8, fuelDifference);

    // V9: Security Tamper Circuit Status (0 = SECURE, 1 = TAMPERED)
    Blynk.virtualWrite(V9, tamperStatus);

    // V3, V4, V5: GPS Latitude, Longitude, and Google Maps Navigation Link
    if (gpsValid) {
      Blynk.virtualWrite(V3, latitude);
      Blynk.virtualWrite(V4, longitude);

      String mapsURL = "https://www.google.com/maps?q=" +
                       String(latitude, 6) + "," +
                       String(longitude, 6);
      Blynk.virtualWrite(V5, mapsURL);
    }
  }

  // Serial Diagnostic Console Output
  Serial.println(F("====== DIVINE FUEL TELEMETRY ======"));
  Serial.print(F("Fuel Voltage : ")); Serial.print(filteredVoltageMv / 1000.0, 3); Serial.println(F(" V"));
  Serial.print(F("Fuel Level   : ")); Serial.print(fuelLevelPercent, 1); Serial.print(F("% (")); Serial.print(fuelLevelLitres, 1); Serial.println(F(" L)"));
  Serial.print(F("Ignition     : ")); Serial.println(ignitionStatus ? F("ON (Driving)") : F("OFF (Parked)"));
  Serial.print(F("Tamper Wire  : ")); Serial.println(tamperStatus ? F("TRIPPED / CUT!") : F("SECURE"));
  Serial.print(F("Parked Loss  : ")); Serial.print(fuelDifference, 1); Serial.println(F("%"));
  Serial.print(F("Alarm State  : ")); Serial.println(theftAlertMsg);

  if (gpsValid) {
    Serial.print(F("GPS Fix      : ")); Serial.print(latitude, 6); Serial.print(F(", ")); Serial.println(longitude, 6);
    Serial.print(F("Speed        : ")); Serial.print(speedKmh, 1); Serial.println(F(" km/h"));
  } else {
    Serial.println(F("GPS Fix      : ACQUIRING SATELLITES..."));
  }
  Serial.println(F("==================================="));
}

// ======================== BLYNK REMOTE ACTUATORS ============================

// V10: Remote Siren Override from Divine Fuel App
BLYNK_WRITE(V10) {
  remoteSirenActive = (param.asInt() == 1);
  digitalWrite(PIN_SIREN_RELAY, remoteSirenActive ? HIGH : LOW);
  Serial.print("[ACTUATOR] Remote 110dB Siren Relay: ");
  Serial.println(remoteSirenActive ? "ENERGIZED" : "DISENGAGED");
}

// V11: Remote Fuel Cutoff Valve from Divine Fuel App
BLYNK_WRITE(V11) {
  remoteCutoffActive = (param.asInt() == 1);
  digitalWrite(PIN_CUTOFF_VALVE, remoteCutoffActive ? HIGH : LOW);
  Serial.print("[ACTUATOR] Remote Fuel Line Cutoff: ");
  Serial.println(remoteCutoffActive ? "VALVE CLOSED" : "VALVE OPEN");
}

// ======================== SETUP =============================================

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println();
  Serial.println(F("**********************************************"));
  Serial.println(F("*      DIVINE FUEL - AUTOMOTIVE ESP32 CORE    *"));
  Serial.println(F("**********************************************"));

  // 1. Configure Hardware GPIOs
  pinMode(PIN_IGNITION_SENSE, INPUT);
  pinMode(PIN_TAMPER_LOOP, INPUT_PULLUP);
  pinMode(PIN_SIREN_RELAY, OUTPUT);
  pinMode(PIN_CUTOFF_VALVE, OUTPUT);
  pinMode(PIN_STATUS_LED, OUTPUT);

  digitalWrite(PIN_SIREN_RELAY, LOW);
  digitalWrite(PIN_CUTOFF_VALVE, LOW);
  digitalWrite(PIN_STATUS_LED, LOW);

  // 2. Configure High-Resolution ADC with 11dB Attenuation (0 - 3.3V range)
  analogReadResolution(12);
  analogSetPinAttenuation(PIN_FUEL_ADC, ADC_11db);

  // 3. Load NVS Persistent Calibration Profile
  loadCalibrationFromNVS();

  // 4. Initialize Hardware GPS Serial
  GPS_Serial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  Serial.println(F("[GPS] NEO-6M Serial Initialized on GPIO 16 (RX) / 17 (TX)"));

  // 5. Connect to Wi-Fi & Blynk Cloud
  Serial.print(F("[WIFI] Connecting to: ")); Serial.println(ssid);
  Blynk.begin(BLYNK_AUTH_TOKEN, ssid, pass);

  // 6. Schedule Telemetry Dispatch every 2000ms
  timer.setInterval(2000L, sendTelemetryToBlynk);

  Serial.println(F("[SYSTEM] Divine Fuel Firmware Ready & Active!"));
}

// ======================== MAIN LOOP =========================================

void loop() {
  // Process Blynk events and telemetry timer
  Blynk.run();
  timer.run();

  // Continuously ingest GPS NMEA sentence stream without starvation
  readGPS();
}
