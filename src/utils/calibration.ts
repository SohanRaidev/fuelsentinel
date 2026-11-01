// Automotive Fuel Sender Calibration & Interpolation Utilities

import type { CalibrationPoint, FuelSenderStandard } from '../types/telemetry';

export const STANDARD_CALIBRATIONS: Record<FuelSenderStandard, CalibrationPoint[]> = {
  // American standard: 240 ohms (empty) to 33 ohms (full) for an 80L tank
  '240-33': [
    { ohms: 240, litres: 0 },
    { ohms: 175, litres: 20 },
    { ohms: 120, litres: 40 },
    { ohms: 70, litres: 60 },
    { ohms: 33, litres: 80 }
  ],
  // European standard: 0 ohms (empty) to 190 ohms (full) for an 80L tank
  '0-190': [
    { ohms: 0, litres: 0 },
    { ohms: 48, litres: 20 },
    { ohms: 95, litres: 40 },
    { ohms: 142, litres: 60 },
    { ohms: 190, litres: 80 }
  ],
  // GM standard: 0 ohms (empty) to 90 ohms (full) for an 80L tank
  '0-90': [
    { ohms: 0, litres: 0 },
    { ohms: 22, litres: 20 },
    { ohms: 45, litres: 40 },
    { ohms: 68, litres: 60 },
    { ohms: 90, litres: 80 }
  ],
  'CUSTOM': [
    { ohms: 240, litres: 0 },
    { ohms: 180, litres: 18 },
    { ohms: 115, litres: 42 },
    { ohms: 65, litres: 65 },
    { ohms: 33, litres: 80 }
  ]
};

/**
 * Scale default standard points to a specific tank capacity
 */
export function getScaledCalibration(standard: FuelSenderStandard, capacityLitres: number): CalibrationPoint[] {
  const base = STANDARD_CALIBRATIONS[standard] || STANDARD_CALIBRATIONS['240-33'];
  const baseMax = base[base.length - 1].litres || 80;
  const factor = capacityLitres / baseMax;

  return base.map((pt) => ({
    ohms: pt.ohms,
    litres: Math.round(pt.litres * factor * 10) / 10
  }));
}

/**
 * Piecewise linear interpolation to convert measured sender resistance to Litres
 */
export function ohmsToLitres(ohms: number, points: CalibrationPoint[], capacityLitres: number): number {
  if (!points || points.length === 0) return 0;

  // Check if curve is inverted (e.g. 240 ohms is empty, 33 ohms is full)
  const isDescending = points[0].ohms > points[points.length - 1].ohms;

  // Sort points by ohms ascending
  const sorted = [...points].sort((a, b) => a.ohms - b.ohms);

  if (ohms <= sorted[0].ohms) {
    return isDescending ? capacityLitres : sorted[0].litres;
  }
  if (ohms >= sorted[sorted.length - 1].ohms) {
    return isDescending ? 0 : capacityLitres;
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const p1 = sorted[i];
    const p2 = sorted[i + 1];
    if (ohms >= p1.ohms && ohms <= p2.ohms) {
      const fraction = (ohms - p1.ohms) / (p2.ohms - p1.ohms);
      const litres = p1.litres + fraction * (p2.litres - p1.litres);
      return Math.max(0, Math.min(capacityLitres, Math.round(litres * 10) / 10));
    }
  }

  return Math.min(capacityLitres, Math.max(0, points[0].litres));
}

/**
 * ESP32 Voltage Divider Calculation:
 * Circuit: 3.3V VCC -> Reference Resistor R_ref (e.g. 150 ohms) -> ADC Pin -> Fuel Sender (R_sender) -> Ground
 * V_adc = 3.3 * (R_sender / (R_ref + R_sender))
 * R_sender = (V_adc * R_ref) / (3.3 - V_adc)
 */
export function calculateSenderResistance(
  rawAdc: number,
  rRefOhms = 150,
  vcc = 3.3,
  adcMaxCount = 4095
): { ohms: number; voltage: number } {
  const voltage = (rawAdc / adcMaxCount) * vcc;
  if (voltage >= vcc - 0.02) {
    return { ohms: 9999, voltage: Math.round(voltage * 100) / 100 }; // open loop / disconnected
  }
  if (voltage <= 0.02) {
    return { ohms: 0, voltage: 0 }; // short circuit to ground
  }
  const ohms = (voltage * rRefOhms) / (vcc - voltage);
  return {
    ohms: Math.round(ohms * 10) / 10,
    voltage: Math.round(voltage * 100) / 100
  };
}
