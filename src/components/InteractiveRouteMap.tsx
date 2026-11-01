// Interactive Leaflet Map Component for Divine Fuel
// Real Map Tiles (CartoDB Positron / OpenStreetMap) with Dynamic Geographic Waypoint Polyline
// Automatically updates when the map is dragged, zoomed, or vehicle moves!

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { TripWaypoint } from '../types/telemetry';
import { MapPinCrosshairIcon } from './Icons';

interface InteractiveRouteMapProps {
  center: [number, number]; // [lat, lng]
  zoom?: number;
  waypoints?: TripWaypoint[];
  routeColor?: string;
  vehicleLat?: number;
  vehicleLng?: number;
  vehicleName?: string;
  height?: string | number;
  showRecenterBtn?: boolean;
  onRecenter?: () => void;
  gmapsUrl?: string;
}

export const InteractiveRouteMap: React.FC<InteractiveRouteMapProps> = ({
  center,
  zoom = 13,
  waypoints = [],
  routeColor = '#16A34A',
  vehicleLat,
  vehicleLng,
  vehicleName = 'Vehicle',
  height = '260px',
  showRecenterBtn = true,
  onRecenter,
  gmapsUrl
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const geofenceCircleRef = useRef<L.Circle | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: false,
        attributionControl: false
      });

      // CartoDB Voyager High-Def Map Tiles with Authenticated API Key
      L.tileLayer(
        'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_4zhl_1_4dc444b9cc411fa9257c38d5',
        {
          maxZoom: 19,
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
        }
      ).addTo(map);

      // Add Zoom Control at top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Layer groups for markers & routes
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Run once on mount

  // Update Route Polyline & Markers whenever waypoints, center or vehicle coords change
  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    // Clear previous markers
    markersLayer.clearLayers();

    // 1. Render Highlighted Route Polyline if 2 or more waypoints exist
    if (waypoints && waypoints.length >= 2) {
      const latLngs: [number, number][] = waypoints.map((w) => [w.lat, w.lng]);

      if (polylineRef.current) {
        polylineRef.current.setLatLngs(latLngs);
        polylineRef.current.setStyle({ color: routeColor, weight: 5, opacity: 0.9 });
      } else {
        const poly = L.polyline(latLngs, {
          color: routeColor,
          weight: 5,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);
        polylineRef.current = poly;
      }

      // Add Point A (Start) Marker
      const startPt = waypoints[0];
      const startIcon = L.divIcon({
        className: 'custom-start-marker',
        html: `
          <div style="
            width: 26px;
            height: 26px;
            background-color: #15803D;
            color: #FFFFFF;
            border-radius: 50%;
            border: 2px solid #FFFFFF;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 800;
          ">A</div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      L.marker([startPt.lat, startPt.lng], { icon: startIcon })
        .bindPopup(`<b>Start Location</b><br/>${startPt.lat.toFixed(5)}, ${startPt.lng.toFixed(5)}`)
        .addTo(markersLayer);

      // Add Point B (Destination / End) Marker
      const endPt = waypoints[waypoints.length - 1];
      const endIcon = L.divIcon({
        className: 'custom-end-marker',
        html: `
          <div style="
            width: 26px;
            height: 26px;
            background-color: #DC2626;
            color: #FFFFFF;
            border-radius: 50%;
            border: 2px solid #FFFFFF;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 800;
          ">B</div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      L.marker([endPt.lat, endPt.lng], { icon: endIcon })
        .bindPopup(`<b>Destination</b><br/>${endPt.lat.toFixed(5)}, ${endPt.lng.toFixed(5)}`)
        .addTo(markersLayer);

      // Auto-fit map bounds to the route
      try {
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [35, 35], maxZoom: 15 });
      } catch {
        // Fallback
      }
    } else {
      // Remove polyline if no waypoints
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }
    }

    // 2. Render Live Vehicle Marker if coordinates exist
    const vLat = vehicleLat ?? center[0];
    const vLng = vehicleLng ?? center[1];

    if (vLat && vLng && vLat !== 0 && vLng !== 0) {
      // Geofence Safe Radius Halo Circle
      if (geofenceCircleRef.current) {
        geofenceCircleRef.current.setLatLng([vLat, vLng]);
      } else {
        geofenceCircleRef.current = L.circle([vLat, vLng], {
          radius: 120, // 120 meters radius
          color: '#3B82F6',
          fillColor: '#3B82F6',
          fillOpacity: 0.16,
          weight: 1.5,
          dashArray: '4, 4'
        }).addTo(map);
      }

      // Pulsing Vehicle Pin Icon
      const vehiclePinIcon = L.divIcon({
        className: 'custom-vehicle-pin',
        html: `
          <div style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: translate(-50%, -100%);
          ">
            <div style="
              width: 32px;
              height: 32px;
              background-color: #DC2626;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 2px solid #FFFFFF;
              box-shadow: 0 3px 8px rgba(0,0,0,0.35);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg style="transform: rotate(45deg); width: 16px; height: 16px; fill: white;" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
            <div style="
              margin-top: 4px;
              background-color: #111827;
              color: #FFFFFF;
              font-size: 10px;
              font-weight: 700;
              padding: 2px 6px;
              border-radius: 6px;
              white-space: nowrap;
              box-shadow: 0 1px 3px rgba(0,0,0,0.25);
            ">${vehicleName}</div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      L.marker([vLat, vLng], { icon: vehiclePinIcon })
        .bindPopup(`<b>${vehicleName}</b><br/>Lat: ${vLat.toFixed(5)}<br/>Lng: ${vLng.toFixed(5)}`)
        .addTo(markersLayer);

      // If no waypoints were supplied, center on vehicle
      if (!waypoints || waypoints.length < 2) {
        map.setView([vLat, vLng], zoom);
      }
    }
  }, [waypoints, center, zoom, routeColor, vehicleLat, vehicleLng, vehicleName]);

  const handleRecenterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const map = mapRef.current;
    if (!map) return;

    if (waypoints && waypoints.length >= 2 && polylineRef.current) {
      map.fitBounds(polylineRef.current.getBounds(), { padding: [40, 40], maxZoom: 16 });
    } else {
      const vLat = vehicleLat ?? center[0];
      const vLng = vehicleLng ?? center[1];
      map.flyTo([vLat, vLng], 14, { animate: true, duration: 0.8 });
    }

    if (onRecenter) onRecenter();
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: '#E5E7EB',
        border: '1px solid #D1D5DB'
      }}
    >
      {/* Map DOM Container */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Recenter Action Button */}
      {showRecenterBtn && (
        <button
          onClick={handleRecenterClick}
          className="map-recenter-btn"
          title="Recenter Map"
          type="button"
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            zIndex: 1000,
            cursor: 'pointer'
          }}
        >
          <MapPinCrosshairIcon size={16} color="#374151" />
        </button>
      )}

      {/* Direct Google Maps Link Button on Top Left */}
      {gmapsUrl && (
        <a
          href={gmapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open Live Navigation in Google Maps"
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 1000,
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(4px)',
            border: '1px solid #D1D5DB',
            borderRadius: '10px',
            padding: '5px 9px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            color: '#15803D',
            fontSize: '11px',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#15803D">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span>Google Maps</span>
        </a>
      )}
    </div>
  );
};
