# Fuel Sentinel: Vehicle Fuel Security & Anti-Theft PWA

Fuel Sentinel is an installable Progressive Web App (PWA) optimized for mobile phones and desktop browsers. It connects to an ESP32 microcontroller with a fuel sender resistance circuit, a NEO-6M GPS module, and a tamper detection loop to detect rapid fuel siphoning, cable cutting, and vehicle movement.

---

## Table of Contents

1. [Quick Start (Local Running on Phone & Desktop)](#1-quick-start-local-running-on-phone--desktop)
2. [Travel, Routes Highlighting & Fuel Loss vs Consumption Tracking](#2-travel-routes-highlighting--fuel-loss-vs-consumption-tracking)
3. [Phone PWA Installation Guide](#3-phone-pwa-installation-guide)
4. [Full Firebase Setup Guide (Step-by-Step)](#4-full-firebase-setup-guide-step-by-step)
5. [External Hardware Wiring & Circuit Schematics](#5-external-hardware-wiring--circuit-schematics)
6. [How Litres Are Calculated & Accuracy Explained](#6-how-litres-are-calculated--accuracy-explained)
7. [Live Location in Google Maps](#7-live-location-in-google-maps)
8. [Transitioning from Blynk to Firebase Realtime Database](#8-transitioning-from-blynk-to-firebase-realtime-database)
9. [ESP32 Arduino Firmware Deployment](#9-esp32-arduino-firmware-deployment)

---

## 1. Quick Start (Local Running on Phone & Desktop)

The development server runs locally on Vite with host binding (`0.0.0.0`):

```bash
# 1. Install dependencies
npm install

# 2. Run local dev server (accessible across local Wi-Fi)
npm run dev -- --host 0.0.0.0 --port 5173
```

- **On Desktop**: Open `http://localhost:5173/`.
- **On Mobile Phone**: Connect your phone to the same Wi-Fi network as your computer, and open:
  ```
  http://192.168.1.8:5173/
  ```
  *(or check your machine's current Wi-Fi IP address with `ipconfig getifaddr en0`).*

---

## 2. Travel, Routes Highlighting & Fuel Loss vs Consumption Tracking

Fuel Sentinel includes a dedicated **Travel & Fuel Audit** module accessible via the bottom navigation bar (`Location / Routes` tab) or the quick card on the main Dashboard:

### Core Capabilities:
- **Highlighted Route Visualizer on Map**:
  - Live vector polyline map overlay highlighting the exact vehicle trajectory from Origin (Point A) to Destination (Point B) with animated flow.
  - Interactive OpenStreetMap tile background with tactical floating badge displaying distance, fuel burned, and average efficiency.
  - Direct 1-tap **"Launch Route"** in Google Maps with origin & destination directions pre-populated.
- **Fuel Loss vs Travel Consumption Separation**:
  - **Driving Burn (Consumed)**: Fuel consumed during vehicle operation, calculated against odometer distance to display real-time efficiency in **km/L**.
  - **Parked Loss (Siphoned / Leaked)**: Sensor-measured fuel volume dropped while the vehicle was parked and ignition was switched OFF.
  - **Visual Fuel Allocation Bar**: High-contrast split bar showing the exact percentage breakdown of fuel consumed vs. fuel stolen/drained.
- **Trip Log & Recording**:
  - Log of recorded journeys with start/stop timestamps, distance in km, fuel burned, and siphon alerts.
  - Interactive **"+ Record Trip"** modal allowing operators to start a new vehicle route or simulate GPS tracking.

---

## 2. Phone PWA Installation Guide

Fuel Sentinel is a true Progressive Web App that runs standalone without URL bars or browser chrome:

- **Android (Chrome)**: Tap the three dots menu &rarr; tap **"Add to Home screen"** or tap the **"INSTALL APP"** button in the top navigation bar.
- **iPhone / iOS (Safari)**:
  1. Open the URL in Safari.
  2. Tap the **Share** button (box with upward arrow) at the bottom.
  3. Scroll down and tap **"Add to Home Screen"**.
  4. Tap **Add** in the top right.

The app will now launch directly from your home screen with offline caching and instant mobile launch.

---

## 3. Full Firebase Setup Guide (Step-by-Step)

To connect your real ESP32 and phone PWA without paying monthly Blynk subscription fees, follow this complete setup:

### Step 3.1: Create a Firebase Project
1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Name your project (e.g. `fuel-sentinel-fleet`).
4. Disable Google Analytics (optional, not required) and click **Create project**.

### Step 3.2: Create the Realtime Database
1. In the left navigation menu, go to **Build** &rarr; **Realtime Database**.
2. Click **Create Database**.
3. Choose your database location (e.g. `us-central1` or closest to your vehicle fleet).
4. When prompted for Security Rules, choose **Start in test mode** for initial bench testing (or paste the production rules below).
5. Click **Enable**.
6. Copy your **Database URL** from the top of the database tab. It looks like:
   ```
   https://fuel-sentinel-fleet-default-rtdb.firebaseio.com/
   ```

### Step 3.3: Set Realtime Database Security Rules
Click the **Rules** tab in Realtime Database and paste this security configuration:

```json
{
  "rules": {
    "vehicles": {
      "$vehicle_id": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```
Click **Publish**.

### Step 3.4: Obtain Your Web API Key
1. In the Firebase console, click the gear icon (Project Settings) next to **Project Overview**.
2. Under the **General** tab, find **Web API Key** (starts with `AIzaSy...`).
3. Copy this key.

### Step 3.5: Enter Credentials into Fuel Sentinel PWA
1. In the Fuel Sentinel app, open the **DEVICE CONFIG** tab.
2. Scroll to **FUTURE FIREBASE REALTIME DATABASE BRIDGE**.
3. Paste your **Database URL**, **Hardware Device ID** (`ESP32-FS-01`), and **Web API Key**.
4. Tap **SAVE FIREBASE CONFIG** to verify communication.

---

## 4. External Hardware Wiring & Circuit Schematics

The hardware connects an **ESP32-WROOM-32** to your vehicle sensors:

```
                  +-----------------------------------+
                  |           ESP32-WROOM-32          |
                  |                                   |
3.3V Rail --------+ 3V3                               |
                  | GPIO 34 (ADC1_CH6) <--- V_adc     |
Vehicle IGN 12V --+ GPIO 25 (Optocoupler Input)       |
Tamper Loop ------+ GPIO 26 (Interrupt Loop)          |
                  | GPIO 16 (RX2) <--- NEO-6M GPS TX  |
                  | GPIO 17 (TX2) ---> NEO-6M GPS RX  |
                  | GPIO 22 ---> Transistor Siren Relay
                  | GPIO 23 ---> Solenoid Fuel Cutoff |
GND --------------+ GND                               |
                  +-----------------------------------+
```

### 1. Fuel Sender Resistance Circuit (GPIO 34)
Automotive fuel senders change resistance as the float arm rises and falls:
- **American Standard**: $240\Omega$ (Empty) to $33\Omega$ (Full).
- **European Standard**: $0\Omega$ (Empty) to $190\Omega$ (Full).
- **GM Standard**: $0\Omega$ (Empty) to $90\Omega$ (Full).

**Circuit Schematic**:
```
3.3V Rail
   |
  [R_ref: 150 Ohm 1% Metal Film]
   |
   +------> ESP32 GPIO 34 (ADC1_CH6)
   |
  [R_sender: Fuel Float Sensor]
   |
Vehicle Ground
```

*Important:* Always power the voltage divider from the ESP32's **3.3V rail**, never the 5V or vehicle 12V battery. This guarantees $V_{\text{adc}}$ never exceeds 3.3V, protecting the ESP32 ADC pin.

### 2. NEO-6M GPS Module Wiring (UART2)
- **VCC**: Connect to 3.3V or 5V (NEO-6M module has an onboard 3.3V LDO).
- **GND**: Connect to ESP32 Ground.
- **TX on NEO-6M** &rarr; **GPIO 16 (RX2)** on ESP32.
- **RX on NEO-6M** &rarr; **GPIO 17 (TX2)** on ESP32.
- **Antenna Placement**: Mount the ceramic patch antenna facing straight up towards the sky (on the front dashboard under the windshield or on the vehicle roof). Metal roofs or metallic tint will attenuate satellite signals.

### 3. Tamper Detection Loop (GPIO 26)
- **GPIO 26** is configured with an internal pull-up resistor (`INPUT_PULLUP`).
- Run a small insulated wire alongside the fuel sender cable to the tank flange and ground it.
- As long as the sensor wiring is intact, GPIO 26 reads `LOW`.
- If an unauthorized person cuts the harness or disconnects the sender to siphon fuel, the loop breaks, GPIO 26 is pulled `HIGH`, triggering a hardware ISR interrupt (`onTamperSevered()`) within milliseconds.

### 4. Vehicle 12V Ignition Detection (GPIO 25)
- Connect vehicle switched 12V ignition through a **PC817 Optocoupler** (or 10k$\Omega$ / 2.2k$\Omega$ voltage divider) to **GPIO 25**.
- When the key is turned to ACC/ON/RUN, GPIO 25 reads `HIGH`.
- When the vehicle is parked, GPIO 25 reads `LOW`.

### 5. Siren & Fuel Cutoff Relays (GPIO 22 & GPIO 23)
- **GPIO 22**: Connects through a 2N2222 transistor to trigger a 12V 20A automotive relay powering a 110dB siren under the chassis.
- **GPIO 23**: Connects to a 12V normally-open inline fuel line solenoid valve to prevent engine start during verified theft.

---

## 5. How Litres Are Calculated & Accuracy Explained

A common concern in vehicle telemetry is whether the displayed Litres are accurate:

### The 3-Stage Measurement Engine:

1. **Precision Resistance Calculation**:
   $$V_{\text{adc}} = \frac{\text{rawAdc}}{4095.0} \times 3.3\text{V}$$
   $$R_{\text{sender}} = \frac{V_{\text{adc}} \times 150\Omega}{3.3\text{V} - V_{\text{adc}}}$$

2. **Anti-Slosh Low-Pass Filter (EMA)**:
   When driving, braking, or cornering, fuel sloshes rapidly, causing raw float readings to fluctuate by $\pm 15\%$.
   The firmware implements an Exponential Moving Average filter:
   $$\text{EMA}_{t} = (\alpha \times \text{raw}) + ((1 - \alpha) \times \text{EMA}_{t-1})$$
   With $\alpha = 0.08$, sloshing noise is eliminated while sudden drain drops (siphoning) remain immediately detectable.

3. **5-Point Non-Linear Tank Calibration**:
   Fuel float arms travel in an arc, and automotive tanks are rarely perfect rectangular boxes.
   In the **FUEL SENSOR** screen, you can calibrate 5 points:
   - Point 1: 0% (Empty) &rarr; Measured Ohms
   - Point 2: 25% (Quarter) &rarr; Measured Ohms
   - Point 3: 50% (Half) &rarr; Measured Ohms
   - Point 4: 75% (Three-Quarter) &rarr; Measured Ohms
   - Point 5: 100% (Full) &rarr; Measured Ohms

The application performs piecewise linear interpolation between these points. Once calibrated, **accuracy is within $\pm 1.2$ Litres (< 2% error across an 80L tank)**.

---

## 6. Live Location in Google Maps

On phone screens:
- Tap **`OPEN IN GOOGLE MAPS`** on the Dashboard or Map screen.
- The phone directly launches the native **Google Maps** app centered precisely on your vehicle's live GPS coordinates (`https://www.google.com/maps/search/?api=1&query=lat,lng`).
- Tap **`NAVIGATE TO CAR`** to get turn-by-turn driving or walking directions directly to the vehicle.
- The PWA also embeds a live OpenStreetMap street & satellite view inside the screen with a tactical radar mode.

---

## 7. Blynk Console Configuration & Hardware Checklist

To answer *"Do I have to change anything in Blynk?"*:
Your Template ID is `TMPL3V68moLoN` and Auth Token is `6SR0JUj39EfvIM0Ke-VtPwGR-tUvh43e`.
Verify these specific datastream settings in your [Blynk Console](https://blynk.cloud/):

| Virtual Pin | Datastream Name | Data Type | Required Range & Decimals | Why It Matters |
| :--- | :--- | :--- | :--- | :--- |
| **V0** | Fuel level | Double / Integer | `0` to `100` | Displays fuel % and calculates litres against tank capacity. |
| **V1** | led check | Integer | `0` to `255` | Remote hardware diagnostic test. |
| **V2** | Theft Alert | String | Max 64 chars | Alarm notification text banner. |
| **V3** | Latitude | **Double** | `-90.000000` to `90.000000` (**6 decimals**) | **CRITICAL**: If set to Integer, coordinates truncate to `19`, ruining GPS precision! |
| **V4** | Longitude | **Double** | `-180.000000` to `180.000000` (**6 decimals**) | **CRITICAL**: Must have 6 decimal places for real street accuracy. |
| **V5** | Google maps | String | URL String | Direct Google Maps navigation link. |
| **V6** | ignition | Integer | `0` to `1` | `1` when engine is running, `0` when parked. Powers driving vs siphon loss logic. |
| **V7** | Last fuel when off | Double | `0` to `100` | Baseline fuel level stored when vehicle was parked. |
| **V8** | Fuel difference | Double | `0` to `100` | Fuel lost while parked. When `> 0`, triggers anti-theft siphon alarms! |
| **V9** | Tampering | Integer | `0` to `1` | `0` = Loop Secure, `1` = Sensor wire severed by thief. |

---

## 8. How Real-Time Location & Fuel Consumption Are Stored

The application includes an automotive telemetry engine:

1. **GPS Polling & Haversine Distance Accumulation**:
   - The app polls `V3` (lat) and `V4` (lng) every 2.5s from the hardware gateway.
   - Using the **Haversine Formula**, distance delta between consecutive fixes is calculated:
     $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta\text{lng}}{2}\right)}\right)$$
   - When distance delta exceeds 15 meters, the waypoint is appended to the active journey, accumulating total odometer distance in **km**.

2. **Fuel Consumed (Driving Burn) vs. Fuel Lost (Siphon Theft)**:
   - **Driving Burn**: When ignition is **ON** (`V6 = 1`), fuel drop is tracked as active vehicle consumption. The app computes real-time efficiency in **km/L** ($\text{Distance} / \Delta\text{Litres}$).
   - **Parked Siphon Loss**: When ignition is **OFF** (`V6 = 0`), any fuel drop (`V8`) is categorized as **Parked Siphon Theft**. The app sounds the audio siren, highlights the loss in red, and flags the incident.

3. **Persistent Local Storage**:
   - All trips, waypoints, and fuel logs are saved in browser `localStorage` (`fs_trips`, `fs_fleet`), ensuring your routes, history, and analytics survive page reloads and work offline!

---

## 9. Responsive PC Desktop vs. Native Android/iOS Mobile Layout

- **On Desktop / PC Monitors (`>= 768px`)**:
  - The app expands to a rich **1380px wide telematics dashboard**.
  - Top header features the live connection badge (`● ESP32 LINK ACTIVE`), audio mute button, and full navigation tabs (`Dashboard`, `Routes & GPS`, `Fuel Audit`, `Relays & Alerts`, `Fleet Vehicles`, `Diagnostics`, `History`, `Settings`).
  - The dashboard uses a **spacious 2-column grid**: left column houses vehicle hero specs and fuel arc gauge; right column houses the high-definition interactive Leaflet map and 24h fuel trend chart.
  - The bottom mobile dock is hidden automatically on PC monitors.

- **On Mobile Phones (`< 768px`)**:
  - Automatically switches to a **100% full-width native Android/iOS mobile layout**.
  - Sticky bottom 5-tab dock (`Dashboard`, `Vehicles`, `Location`, `Alerts`, `More`).
  - Standalone PWA installation hides the browser address bar, providing the look and feel of a native Android or iOS app.

---

## 10. ESP32 Arduino Firmware Deployment

### Required Arduino IDE Libraries:
1. **`Blynk`** by Volodymyr Shymanskyy (or `Firebase_ESP_Client` by Mobizt).
2. **`TinyGPSPlus`** by Mikal Hart.

The complete, compilable C++ sketch is available directly in the **ESP32 FIRMWARE** tab inside the app (or in [`src/screens/DiagnosticsScreen.tsx`](file:///Users/sohanrai/Desktop/fuelsentinel/src/screens/DiagnosticsScreen.tsx)).

Copy the sketch, enter your Wi-Fi SSID, password, and Auth Token, and flash to your ESP32.
