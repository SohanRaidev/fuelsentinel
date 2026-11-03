// Vehicle & Fleet Management Screen
// Sleek Modern iOS Design with Fleet Vehicle Profiles & Tank Specifications

import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { CheckmarkIcon, CarChassisIcon, CloseIcon } from '../components/Icons';
import type { VehicleConfig } from '../types/telemetry';

export const VehicleSetupScreen: React.FC = () => {
  const {
    vehicles,
    activeVehicleId,
    switchVehicle,
    vehicle,
    updateVehicleConfig,
    addNewVehicle,
    resetFleetToDefaults
  } = useTelemetry();

  const [formData, setFormData] = useState<VehicleConfig>(vehicle);
  const [isSaved, setIsSaved] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Sync formData whenever active vehicle changes
  React.useEffect(() => {
    setFormData(vehicle);
  }, [vehicle]);

  // New vehicle form state
  const [newName, setNewName] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newCapacity, setNewCapacity] = useState('45');
  const [newFuelType, setNewFuelType] = useState<'DIESEL' | 'PETROL' | 'ETHANOL'>('PETROL');
  const [newTemplateId, setNewTemplateId] = useState('');
  const [newAuthToken, setNewAuthToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateVehicleConfig(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2400);
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    addNewVehicle({
      name: newName.trim() || 'New Vehicle',
      plate: newPlate.trim().toUpperCase() || 'MH 01 XY 9999',
      vin: `VIN-${Date.now().toString().slice(-8)}`,
      tankCapacityLitres: parseFloat(newCapacity) || 45,
      fuelType: newFuelType,
      tankGeometry: 'RECTANGULAR',
      senderStandard: '240-33',
      calibrationPoints: vehicle.calibrationPoints,
      theftDropRateThresholdLpm: 1.2,
      emergencyContactPhone: '+91 98200 12345',
      geofenceRadiusMeters: 100,
      blynkTemplateId: newTemplateId.trim() || undefined,
      blynkAuthToken: newAuthToken.trim() || undefined
    });
    setNewName('');
    setNewPlate('');
    setNewTemplateId('');
    setNewAuthToken('');
    setAddModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 14px' }}>
      {/* 1. ACTIVE FLEET VEHICLES CARD */}
      <div className="ios-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>
              Fleet Vehicles ({vehicles.length})
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              Select a vehicle to activate live monitoring
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                if (window.confirm('Reset all vehicle names and profiles to the standard Divine Fuel production fleet?')) {
                  resetFleetToDefaults();
                }
              }}
              style={{
                padding: '6px 10px',
                backgroundColor: '#FFFFFF',
                color: '#6B7280',
                borderRadius: '10px',
                border: '1px solid #D1D5DB',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reset Names
            </button>

            <button
              onClick={() => setAddModalOpen(true)}
              style={{
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
              + Add Vehicle
            </button>
          </div>
        </div>

        {/* Vehicles List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {vehicles.map((v) => {
            const isCur = v.id === activeVehicleId;
            return (
              <div
                key={v.id}
                onClick={() => {
                  switchVehicle(v.id);
                  setFormData(v);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  border: isCur ? '2px solid #16A34A' : '1px solid #E5E7EB',
                  backgroundColor: isCur ? '#F0FDF4' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: isCur ? '#DCFCE7' : '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CarChassisIcon size={20} color={isCur ? '#15803D' : '#374151'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                      {v.name}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#6B7280' }}>
                      {v.plate} &middot; {v.tankCapacityLitres}L {v.fuelType}
                    </div>
                  </div>
                </div>

                {isCur ? (
                  <span
                    style={{
                      backgroundColor: '#16A34A',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}
                  >
                    ACTIVE
                  </span>
                ) : (
                  <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600 }}>
                    Switch &rarr;
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. EDIT ACTIVE VEHICLE PARAMETERS CARD */}
      <div className="ios-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>
              Vehicle &amp; Tank Specifications
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              Active: {formData.name} ({formData.plate})
            </div>
          </div>
          {isSaved && (
            <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 700, backgroundColor: '#DCFCE7', padding: '3px 8px', borderRadius: '6px' }}>
              SAVED
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
              Vehicle Make &amp; Model
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '13px' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
                License Plate
              </label>
              <input
                type="text"
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
                Tank Capacity (L)
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.tankCapacityLitres}
                onChange={(e) =>
                  setFormData({ ...formData, tankCapacityLitres: parseFloat(e.target.value) || 10 })
                }
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
                Fuel Type
              </label>
              <select
                value={formData.fuelType}
                onChange={(e) =>
                  setFormData({ ...formData, fuelType: e.target.value as 'DIESEL' | 'PETROL' | 'ETHANOL' })
                }
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '13px', backgroundColor: '#FFFFFF' }}
              >
                <option value="DIESEL">Diesel</option>
                <option value="PETROL">Petrol / Gasoline</option>
                <option value="ETHANOL">Ethanol Blend</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
                Emergency Contact
              </label>
              <input
                type="text"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* ESP32 HARDWARE BLYNK CREDENTIALS (FOR DUAL ESP SETUP) */}
          <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E293B' }}>
                ESP32 Hardware Credentials
              </label>
              <span style={{ fontSize: '10.5px', color: '#15803D', fontWeight: 700, backgroundColor: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>
                Dual-ESP Unit Support
              </span>
            </div>

            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>
                Blynk Template ID
              </label>
              <input
                type="text"
                value={formData.blynkTemplateId || ''}
                placeholder="e.g. TMPL3V68moLoN or TMPL3l78cjZm"
                onChange={(e) => setFormData({ ...formData, blynkTemplateId: e.target.value.trim() })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>
                Device Auth Token
              </label>
              <input
                type="text"
                value={formData.blynkAuthToken || ''}
                placeholder="e.g. 6SR0JUj39EfvIM0Ke-VtPwGR-tUvh43e"
                onChange={(e) => setFormData({ ...formData, blynkAuthToken: e.target.value.trim() })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A'
                }}
              />
            </div>

            <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.4 }}>
              Assign each ESP32 its own Blynk Template ID &amp; Auth Token (e.g. Ertiga on <code>TMPL3V68moLoN</code>, Test Vehicle on <code>TMPL3l78cjZm</code>). Switching vehicles dynamically re-binds credentials.
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
              fontSize: '13px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {isSaved ? <CheckmarkIcon size={16} color="#FFFFFF" /> : null}
            {isSaved ? 'CONFIGURATION SAVED' : 'SAVE VEHICLE SPECIFICATIONS'}
          </button>
        </form>
      </div>

      {/* MODAL: ADD VEHICLE */}
      {addModalOpen && (
        <div className="brutal-modal-backdrop" onClick={() => setAddModalOpen(false)}>
          <div
            className="ios-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '400px', width: '92%', margin: 'auto', borderRadius: '20px', padding: '20px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '17px', fontWeight: 800, color: '#111827' }}>
                Add Fleet Vehicle
              </span>
              <button
                onClick={() => setAddModalOpen(false)}
                className="header-icon-btn"
                style={{ padding: '4px' }}
              >
                <CloseIcon size={16} color="#6B7280" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#374151', display: 'block', marginBottom: '3px' }}>Vehicle Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Isuzu D-Max Service Truck"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#374151', display: 'block', marginBottom: '3px' }}>License Plate</label>
                  <input
                    type="text"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    placeholder="e.g. MH 04 DE 5678"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#374151', display: 'block', marginBottom: '3px' }}>Tank Size (L)</label>
                    <input
                      type="number"
                      value={newCapacity}
                      onChange={(e) => setNewCapacity(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#374151', display: 'block', marginBottom: '3px' }}>Fuel Type</label>
                    <select
                      value={newFuelType}
                      onChange={(e) => setNewFuelType(e.target.value as 'DIESEL' | 'PETROL' | 'ETHANOL')}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '13px', backgroundColor: '#FFFFFF' }}
                    >
                      <option value="DIESEL">Diesel</option>
                      <option value="PETROL">Petrol</option>
                      <option value="ETHANOL">Ethanol</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#374151', display: 'block', marginBottom: '3px' }}>
                    Blynk Template ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={newTemplateId}
                    onChange={(e) => setNewTemplateId(e.target.value)}
                    placeholder="e.g. TMPL3l78cjZm"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '12px', fontFamily: 'monospace' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#374151', display: 'block', marginBottom: '3px' }}>
                    ESP32 Blynk Device Auth Token (Optional)
                  </label>
                  <input
                    type="text"
                    value={newAuthToken}
                    onChange={(e) => setNewAuthToken(e.target.value)}
                    placeholder="e.g. 6SR0JUj39EfvIM0Ke-VtPwGR-tUvh43e"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '12px', fontFamily: 'monospace' }}
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
                CREATE VEHICLE PROFILE
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
