import React, { useState } from 'react';
import { LocationData } from '../types/map';
import {
  MapPin,
  Compass,
  Radio,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
  Sparkles,
  LocateFixed,
  Eye,
  EyeOff
} from 'lucide-react';

interface LocationDetailsPanelProps {
  location: LocationData | null;
  status: 'idle' | 'locating' | 'active' | 'denied' | 'error';
  errorMessage?: string;
  isFollowing: boolean;
  onToggleFollow: () => void;
  onRecenter: () => void;
  onRequestPermission: () => void;
  onSetDemoLocation: (lat: number, lon: number, name: string) => void;
}

export const LocationDetailsPanel: React.FC<LocationDetailsPanelProps> = ({
  location,
  status,
  errorMessage,
  isFollowing,
  onToggleFollow,
  onRecenter,
  onRequestPermission,
  onSetDemoLocation,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const handleCopyCoords = () => {
    if (!location) return;
    const text = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const demoCities = [
    { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
    { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
    { name: 'New York, USA', lat: 40.7128, lon: -74.006 },
    { name: 'Paris, France', lat: 48.8566, lon: 2.3522 },
    { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093 },
    { name: 'Rio de Janeiro, Brazil', lat: -22.9068, lon: -43.1729 },
  ];

  return (
    <div className="relative z-30 max-w-sm sm:max-w-md w-full">
      <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-2xl shadow-2xl p-3.5 transition-all">
        {/* Top Status Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex items-center justify-center">
              {status === 'active' ? (
                <>
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
                </>
              ) : status === 'locating' ? (
                <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100 tracking-tight">
                  {status === 'active'
                    ? 'Live Location Active'
                    : status === 'locating'
                    ? 'Acquiring GPS Position...'
                    : 'Location Service'}
                </span>
                {location?.accuracy && (
                  <span className="text-[10px] font-semibold text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-800/50">
                    ±{Math.round(location.accuracy)}m
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {location?.address || errorMessage || 'Click "My Location" to enable browser GPS'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            title={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Action Controls */}
        {location && (
          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-800/80">
            <button
              onClick={onRecenter}
              className="flex-1 py-1.5 px-2.5 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 rounded-xl text-sky-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <LocateFixed className="w-3.5 h-3.5" />
              Recenter
            </button>

            <button
              onClick={onToggleFollow}
              className={`flex-1 py-1.5 px-2.5 border rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                isFollowing
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Auto-pan map when location changes"
            >
              {isFollowing ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
              {isFollowing ? 'Following' : 'Auto-Follow'}
            </button>

            <button
              onClick={handleCopyCoords}
              className="py-1.5 px-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors"
              title="Copy latitude & longitude"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              {copied ? 'Copied' : 'Coords'}
            </button>
          </div>
        )}

        {/* Fallback / Demo location prompt if location is denied or idle */}
        {(!location || status === 'denied' || status === 'error') && (
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={onRequestPermission}
                className="flex-1 py-1.5 px-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <Compass className="w-3.5 h-3.5" />
                Enable Browser GPS
              </button>

              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Test City
              </button>
            </div>

            {showDemoMenu && (
              <div className="bg-slate-950/90 rounded-xl p-2 border border-slate-800 grid grid-cols-2 gap-1.5">
                {demoCities.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => {
                      onSetDemoLocation(city.lat, city.lon, city.name);
                      setShowDemoMenu(false);
                    }}
                    className="text-left px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-sky-300 font-medium truncate border border-slate-800/60 transition-colors flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                    <span className="truncate">{city.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Expanded Telemetry Details */}
        {isExpanded && location && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs space-y-2 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Latitude</span>
                <span className="font-mono text-sm text-slate-100 font-semibold">{location.latitude.toFixed(6)}°</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Longitude</span>
                <span className="font-mono text-sm text-slate-100 font-semibold">{location.longitude.toFixed(6)}°</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-slate-300 text-[11px]">
              <div className="bg-slate-950/40 p-1.5 rounded-lg border border-slate-800/60 text-center">
                <span className="text-[10px] text-slate-500 block">Accuracy</span>
                <span className="font-mono font-medium text-slate-200">
                  {location.accuracy ? `${Math.round(location.accuracy)} m` : 'N/A'}
                </span>
              </div>
              <div className="bg-slate-950/40 p-1.5 rounded-lg border border-slate-800/60 text-center">
                <span className="text-[10px] text-slate-500 block">Speed</span>
                <span className="font-mono font-medium text-slate-200">
                  {location.speed ? `${(location.speed * 3.6).toFixed(1)} km/h` : '0 km/h'}
                </span>
              </div>
              <div className="bg-slate-950/40 p-1.5 rounded-lg border border-slate-800/60 text-center">
                <span className="text-[10px] text-slate-500 block">Altitude</span>
                <span className="font-mono font-medium text-slate-200">
                  {location.altitude ? `${Math.round(location.altitude)} m` : 'N/A'}
                </span>
              </div>
            </div>

            {location.address && (
              <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Full Address</span>
                <p className="text-[11px] text-slate-200 mt-0.5 leading-relaxed">{location.address}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
