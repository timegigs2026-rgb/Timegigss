import React from 'react';
import { MapPin, ZoomIn, Layers } from 'lucide-react';
import { PinnedPoint } from '../types/map';

interface MapTelemetryProps {
  centerLat: number;
  centerLng: number;
  zoom: number;
  tileName: string;
  pinnedPoints: PinnedPoint[];
  onSelectPin: (pin: PinnedPoint) => void;
  onClearPins: () => void;
}

export const MapTelemetry: React.FC<MapTelemetryProps> = ({
  centerLat,
  centerLng,
  zoom,
  tileName,
  pinnedPoints,
  onSelectPin,
  onClearPins,
}) => {
  return (
    <div className="flex flex-col gap-2 items-start z-30 pointer-events-none">
      {/* Pinned Places Pill List if user dropped pins on map */}
      {pinnedPoints.length > 0 && (
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-2xl p-2 max-w-xs w-full shadow-2xl">
          <div className="flex items-center justify-between px-2 pb-1 border-b border-slate-800 text-[11px] font-bold text-slate-300">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-400" /> Pinned Locations ({pinnedPoints.length})
            </span>
            <button
              onClick={onClearPins}
              className="text-[10px] text-slate-400 hover:text-rose-400 font-medium transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="mt-1 space-y-1 max-h-28 overflow-y-auto">
            {pinnedPoints.map((pin) => (
              <button
                key={pin.id}
                onClick={() => onSelectPin(pin)}
                className="w-full text-left px-2 py-1.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 text-[11px] text-slate-200 hover:text-sky-300 transition-colors flex items-center justify-between group"
              >
                <span className="truncate pr-2 font-medium">
                  {pin.address ? pin.address.split(',')[0] : `${pin.latitude.toFixed(3)}°, ${pin.longitude.toFixed(3)}°`}
                </span>
                <span className="text-[10px] text-slate-500 font-mono group-hover:text-sky-400 shrink-0">
                  {pin.latitude.toFixed(2)}°, {pin.longitude.toFixed(2)}°
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Telemetry Bar */}
      <div className="pointer-events-auto flex flex-wrap items-center gap-3 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl px-3 py-1.5 text-[11px] font-mono text-slate-300 shadow-xl">
        <div className="flex items-center gap-1.5 text-slate-200">
          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>
            {Math.abs(centerLat).toFixed(4)}°{centerLat >= 0 ? 'N' : 'S'}, {Math.abs(centerLng).toFixed(4)}°{centerLng >= 0 ? 'E' : 'W'}
          </span>
        </div>

        <span className="text-slate-700">|</span>

        <div className="flex items-center gap-1 text-slate-400">
          <ZoomIn className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Zoom: {zoom}</span>
        </div>

        <span className="text-slate-700 hidden sm:inline">|</span>

        <div className="hidden sm:flex items-center gap-1 text-slate-400">
          <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{tileName}</span>
        </div>

        <span className="hidden md:inline-block px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-400 font-sans font-semibold text-[10px] border border-sky-800/60">
          OpenStreetMap (No API Cost)
        </span>
      </div>
    </div>
  );
};
