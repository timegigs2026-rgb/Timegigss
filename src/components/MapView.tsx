import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LocationData, MapTileStyle, SearchResult, PinnedPoint } from '../types/map';
import { reverseGeocode } from '../services/geocoding';

interface MapViewProps {
  tileStyle: MapTileStyle;
  userLocation: LocationData | null;
  searchPoint: SearchResult | null;
  pinnedPoints: PinnedPoint[];
  onAddPin: (pin: PinnedPoint) => void;
  isFollowing: boolean;
  onMapCenterChange: (lat: number, lng: number, zoom: number) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  tileStyle,
  userLocation,
  searchPoint,
  pinnedPoints,
  onAddPin,
  isFollowing,
  onMapCenterChange,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const userMarkerRef = useRef<L.Marker | null>(null);
  const userAccuracyCircleRef = useRef<L.Circle | null>(null);
  const searchMarkerRef = useRef<L.Marker | null>(null);
  const pinnedMarkersRef = useRef<{ [id: string]: L.Marker }>({});

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Create Leaflet map instance
    const initialLat = userLocation?.latitude || 20;
    const initialLng = userLocation?.longitude || 0;
    const initialZoom = userLocation ? 13 : 3;

    const map = L.map(containerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: false, // We place custom zoom controls or let Leaflet zoom control stay clean
      attributionControl: false,
    });

    // Add zoom control at top-right or bottom-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial tile layer
    const tileLayer = L.tileLayer(tileStyle.url, {
      maxZoom: tileStyle.maxZoom,
      subdomains: tileStyle.subdomains || ['a', 'b', 'c'],
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Center & Zoom listener
    map.on('move', () => {
      const center = map.getCenter();
      onMapCenterChange(center.lat, center.lng, map.getZoom());
    });

    map.on('zoomend', () => {
      const center = map.getCenter();
      onMapCenterChange(center.lat, center.lng, map.getZoom());
    });

    // Map click handler to drop pin
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const geoResult = await reverseGeocode(lat, lng);

      const newPin: PinnedPoint = {
        id: `pin_${Date.now()}`,
        latitude: lat,
        longitude: lng,
        address: geoResult.address,
        timestamp: Date.now(),
      };

      onAddPin(newPin);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle Tile Style changes
  useEffect(() => {
    if (!mapRef.current) return;
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    const newTileLayer = L.tileLayer(tileStyle.url, {
      maxZoom: tileStyle.maxZoom,
      subdomains: tileStyle.subdomains || ['a', 'b', 'c'],
    }).addTo(mapRef.current);

    tileLayerRef.current = newTileLayer;
  }, [tileStyle]);

  // Handle User Location updates & Accuracy Circle
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    const map = mapRef.current;
    const { latitude, longitude, accuracy } = userLocation;

    // Custom HTML DivIcon for user pulsing marker
    const userDivIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div class="user-location-pulse"></div>
        <div class="user-location-dot"></div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([latitude, longitude]);
    } else {
      const marker = L.marker([latitude, longitude], { icon: userDivIcon }).addTo(map);
      
      // Popup for user location
      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif;">
          <div style="display:flex; align-items:center; gap:6px; color:#38bdf8; font-weight:700; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">
            <span>📍 Your Location</span>
          </div>
          <div style="margin-top:4px; font-size:13px; color:#f8fafc; font-weight:600;">
            ${userLocation.address || 'Acquired via GPS'}
          </div>
          <div style="margin-top:6px; font-size:11px; font-family:monospace; color:#94a3b8; background:rgba(255,255,255,0.06); padding:4px 8px; border-radius:6px;">
            ${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°
          </div>
        </div>
      `);

      userMarkerRef.current = marker;
    }

    // Update Accuracy Circle
    if (accuracy && accuracy > 0) {
      if (userAccuracyCircleRef.current) {
        userAccuracyCircleRef.current.setLatLng([latitude, longitude]);
        userAccuracyCircleRef.current.setRadius(accuracy);
      } else {
        const circle = L.circle([latitude, longitude], {
          radius: accuracy,
          color: '#3b82f6',
          weight: 1.5,
          fillColor: '#3b82f6',
          fillOpacity: 0.12,
        }).addTo(map);
        userAccuracyCircleRef.current = circle;
      }
    }

    // If follow mode is enabled, pan smoothly
    if (isFollowing) {
      map.panTo([latitude, longitude], { animate: true, duration: 1.0 });
    }
  }, [userLocation, isFollowing]);

  // Handle Search Result Marker
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (searchMarkerRef.current) {
      map.removeLayer(searchMarkerRef.current);
      searchMarkerRef.current = null;
    }

    if (searchPoint) {
      const lat = parseFloat(searchPoint.lat);
      const lon = parseFloat(searchPoint.lon);

      const searchDivIcon = L.divIcon({
        className: 'custom-search-marker',
        html: `
          <div style="background:#0284c7; border:2px solid #ffffff; width:32px; height:32px; border-radius:50% 50% 50% 0; transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; box-shadow: 0 8px 20px rgba(2,132,199,0.6);">
            <div style="width:10px; height:10px; background:#ffffff; border-radius:50%; transform:rotate(45deg);"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([lat, lon], { icon: searchDivIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif;">
          <div style="color:#0ea5e9; font-weight:700; font-size:11px; text-transform:uppercase; letter-spacing:0.5px;">
            Search Result
          </div>
          <div style="margin-top:3px; font-size:13px; color:#f8fafc; font-weight:600;">
            ${searchPoint.display_name.split(',')[0]}
          </div>
          <div style="margin-top:2px; font-size:11px; color:#94a3b8;">
            ${searchPoint.display_name.split(',').slice(1).join(',')}
          </div>
          <div style="margin-top:6px; font-size:11px; font-family:monospace; color:#38bdf8;">
            ${lat.toFixed(5)}°, ${lon.toFixed(5)}°
          </div>
        </div>
      `).openPopup();

      searchMarkerRef.current = marker;

      // Fly to search point
      map.flyTo([lat, lon], 14, { animate: true, duration: 1.2 });
    }
  }, [searchPoint]);

  // Handle Pinned Points
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Remove markers that no longer exist
    Object.keys(pinnedMarkersRef.current).forEach((id) => {
      if (!pinnedPoints.find((p) => p.id === id)) {
        map.removeLayer(pinnedMarkersRef.current[id]);
        delete pinnedMarkersRef.current[id];
      }
    });

    // Add new pinned markers
    pinnedPoints.forEach((pin) => {
      if (!pinnedMarkersRef.current[pin.id]) {
        const pinDivIcon = L.divIcon({
          className: 'custom-pin-marker',
          html: `
            <div style="background:#f43f5e; border:2.5px solid #ffffff; width:28px; height:28px; border-radius:50% 50% 50% 0; transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; box-shadow: 0 6px 16px rgba(244,63,94,0.6);">
              <div style="width:8px; height:8px; background:#ffffff; border-radius:50%; transform:rotate(45deg);"></div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });

        const marker = L.marker([pin.latitude, pin.longitude], { icon: pinDivIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif;">
            <div style="color:#fb7185; font-weight:700; font-size:11px; text-transform:uppercase; letter-spacing:0.5px;">
              Pinned Location
            </div>
            <div style="margin-top:3px; font-size:12px; color:#f8fafc; font-weight:600;">
              ${pin.address || 'Custom Map Pin'}
            </div>
            <div style="margin-top:6px; font-size:11px; font-family:monospace; color:#fda4af;">
              ${pin.latitude.toFixed(5)}°, ${pin.longitude.toFixed(5)}°
            </div>
          </div>
        `);

        pinnedMarkersRef.current[pin.id] = marker;
      }
    });
  }, [pinnedPoints]);

  return <div ref={containerRef} className="w-full h-full" />;
};
