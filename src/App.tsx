/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { LocationData, SearchResult } from './types/map';
import { reverseGeocode } from './services/geocoding';
import { SearchBar } from './components/SearchBar';
import { Zap, Gift, Briefcase, Search, User, Globe, Plus, Minus } from 'lucide-react';
import { ActivationModal } from './components/modals/ActivationModal';
import { ReferralsModal } from './components/modals/ReferralsModal';
import { GigsModal } from './components/modals/GigsModal';
import { SeekersModal } from './components/modals/SeekersModal';
import { ProfileModal } from './components/modals/ProfileModal';

export default function App() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const searchMarkerRef = useRef<L.Marker | null>(null);

  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isSatellite, setIsSatellite] = useState<boolean>(false);

  // Active menu tab ('activation' | 'referrals' | 'gigs' | 'seekers' | 'profile' | null)
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Initialize Map immediately on mount
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 3,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true, // Use canvas for better performance
    });

    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '',
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    mapRef.current = map;
    
    // Quick focus on user
    fetchUserLocation(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const handleToggleSatellite = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);

    const nextSatellite = !isSatellite;
    setIsSatellite(nextSatellite);

    const newUrl = nextSatellite
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const newTileLayer = L.tileLayer(newUrl, {
      maxZoom: nextSatellite ? 18 : 19,
      attribution: '',
    }).addTo(map);
    tileLayerRef.current = newTileLayer;
  };

  const handleZoomIn = () => { if (mapRef.current) mapRef.current.zoomIn(); };
  const handleZoomOut = () => { if (mapRef.current) mapRef.current.zoomOut(); };

  const fetchUserLocation = (mapInstance: L.Map) => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const addressInfo = await reverseGeocode(latitude, longitude);
        setLocation({
          latitude, longitude, accuracy,
          altitude: pos.coords.altitude, altitudeAccuracy: null, heading: pos.coords.heading, speed: pos.coords.speed,
          address: addressInfo.address, timestamp: pos.timestamp
        });
        setIsLocating(false);
        mapInstance.setView([latitude, longitude], 15, { animate: true });
      },
      (err) => { console.warn(err.message); setIsLocating(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  };

  const handleLocateUser = () => {
    if (mapRef.current && location) {
      mapRef.current.setView([location.latitude, location.longitude], 15, { animate: true });
    } else if (mapRef.current) {
      fetchUserLocation(mapRef.current);
    }
  };

  useEffect(() => {
    if (!mapRef.current || !location) return;
    const map = mapRef.current;
    const { latitude, longitude, accuracy } = location;
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:44px; height:44px; background:rgba(59,130,246,0.35); border:1.5px solid rgba(59,130,246,0.8); border-radius:50%; animation: pulse-ring 2s infinite;"></div>
          <div style="width:18px; height:18px; background:#3b82f6; border:3px solid #ffffff; border-radius:50%; box-shadow:0 0 12px rgba(59,130,246,0.9); z-index:2;"></div>
        </div>
      `,
      iconSize: [44, 44], iconAnchor: [22, 22],
    });
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([latitude, longitude]);
    } else {
      userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
    }
    if (accuracy && accuracy > 0) {
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng([latitude, longitude]).setRadius(accuracy);
      } else {
        accuracyCircleRef.current = L.circle([latitude, longitude], {
          radius: accuracy, color: '#3b82f6', weight: 1.5, fillColor: '#3b82f6', fillOpacity: 0.15
        }).addTo(map);
      }
    }
  }, [location]);

  const handleSelectSearchResult = (result: SearchResult) => {
    if (!mapRef.current) return;
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    if (searchMarkerRef.current) mapRef.current.removeLayer(searchMarkerRef.current);
    const searchIcon = L.divIcon({
      className: 'search-result-marker',
      html: `<div style="background:#0284c7; border:2.5px solid #ffffff; width:34px; height:34px; border-radius:50% 50% 50% 0; transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; box-shadow: 0 8px 20px rgba(2,132,199,0.7);"><div style="width:10px; height:10px; background:#ffffff; border-radius:50%; transform:rotate(45deg);"></div></div>`,
      iconSize: [34, 34], iconAnchor: [17, 34],
    });
    searchMarkerRef.current = L.marker([lat, lon], { icon: searchIcon }).addTo(mapRef.current);
    mapRef.current.setView([lat, lon], 16, { animate: true, duration: 1.2 });
  };

  const handleTabClick = (tabName: string) => { setActiveTab(activeTab === tabName ? null : tabName); };

  // Controls should be visible on base map AND in GiGs feature
  const showControls = activeTab === null || activeTab === 'gigs';
  const isBlurred = activeTab !== null && activeTab !== 'gigs';

  return (
    <div className="relative w-screen h-screen overflow-hidden m-0 p-0 bg-slate-50 font-sans">
      <div className="absolute inset-x-0 top-0 bottom-16 bg-slate-100">
        <div ref={containerRef} className={`w-full h-full transition-all duration-200 ${isBlurred ? 'filter blur-md brightness-90' : ''}`} />

        {/* Controls (Search Bar & Zoom Bubbles) - Active for Map and GiGs */}
        {showControls && (
          <>
            <div className="absolute top-4 left-4 right-4 z-40 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200">
              <SearchBar onSelectResult={handleSelectSearchResult} onLocateUser={handleLocateUser} isLocating={isLocating} />
            </div>

            <div className="absolute bottom-6 right-4 z-40 flex flex-col gap-3 pointer-events-auto animate-in fade-in slide-in-from-right-2 duration-200">
              <button onClick={handleZoomIn} className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-xl text-slate-800 flex items-center justify-center transition-all hover:text-sky-600 active:scale-90" title="Zoom In">
                <Plus className="w-6 h-6" />
              </button>
              <button onClick={handleZoomOut} className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-xl text-slate-800 flex items-center justify-center transition-all hover:text-sky-600 active:scale-90" title="Zoom Out">
                <Minus className="w-5 h-5" />
              </button>
              <button onClick={handleToggleSatellite} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl border ${isSatellite ? 'bg-sky-600 text-white border-sky-700' : 'bg-white text-slate-700 border-slate-200'}`} title="Satellite">
                <Globe className="w-5 h-5" />
              </button>
            </div>
          </>
        )}

        {/* Feature Views */}
        <ActivationModal isOpen={activeTab === 'activation'} onClose={() => setActiveTab(null)} />
        <ReferralsModal isOpen={activeTab === 'referrals'} onClose={() => setActiveTab(null)} />
        <GigsModal isOpen={activeTab === 'gigs'} onClose={() => setActiveTab(null)} />
        <SeekersModal isOpen={activeTab === 'seekers'} onClose={() => setActiveTab(null)} />
        <ProfileModal isOpen={activeTab === 'profile'} onClose={() => setActiveTab(null)} />
      </div>

      {/* Docked Solid White Bottom Menu Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 shadow-2xl z-50 flex items-center justify-around px-2 sm:px-6">
        <button onClick={() => handleTabClick('activation')} className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 text-[11px] font-medium transition-all ${activeTab === 'activation' ? 'text-sky-600 font-semibold' : 'text-slate-600'}`}>
          <Zap className="w-5 h-5" /><span>Activation</span>
        </button>
        <button onClick={() => handleTabClick('referrals')} className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 text-[11px] font-medium transition-all ${activeTab === 'referrals' ? 'text-emerald-600 font-semibold' : 'text-slate-600'}`}>
          <Gift className="w-5 h-5" /><span>Referrals</span>
        </button>
        <button onClick={() => handleTabClick('gigs')} className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 text-[11px] font-medium transition-all ${activeTab === 'gigs' ? 'text-amber-600 font-semibold' : 'text-slate-600'}`}>
          <Briefcase className="w-5 h-5" /><span>GiGs</span>
        </button>
        <button onClick={() => handleTabClick('seekers')} className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 text-[11px] font-medium transition-all ${activeTab === 'seekers' ? 'text-indigo-600 font-semibold' : 'text-slate-600'}`}>
          <Search className="w-5 h-5" /><span>Seekers</span>
        </button>
        <button onClick={() => handleTabClick('profile')} className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 text-[11px] font-medium transition-all ${activeTab === 'profile' ? 'text-sky-600 font-semibold' : 'text-slate-600'}`}>
          <User className="w-5 h-5" /><span>Profile</span>
        </button>
      </div>
    </div>
  );
}
