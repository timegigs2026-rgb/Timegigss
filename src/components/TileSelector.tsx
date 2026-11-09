import React, { useState } from 'react';
import { Layers, Check, Compass } from 'lucide-react';
import { TILE_STYLES } from '../constants/tileLayers';
import { MapTileStyle } from '../types/map';

interface TileSelectorProps {
  activeTileId: string;
  onSelectTile: (tile: MapTileStyle) => void;
}

export const TileSelector: React.FC<TileSelectorProps> = ({
  activeTileId,
  onSelectTile,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeTile = TILE_STYLES.find((t) => t.id === activeTileId) || TILE_STYLES[0];

  return (
    <div className="relative z-30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-2xl px-3.5 py-2.5 text-slate-200 hover:text-white shadow-2xl transition-all hover:bg-slate-800/90 hover:border-slate-600 focus:outline-none"
        title="Map Tile Styles (Zero API Cost)"
      >
        <Layers className="w-4 h-4 text-sky-400" />
        <span className="text-xs font-semibold">{activeTile.name}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-1.5 mb-1 border-b border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
                <Compass className="w-3 h-3 text-sky-400" /> Map Styles
              </span>
              <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                100% Free OSM
              </span>
            </div>

            <div className="space-y-1 max-h-64 overflow-y-auto">
              {TILE_STYLES.map((tile) => {
                const isActive = tile.id === activeTileId;
                return (
                  <button
                    key={tile.id}
                    onClick={() => {
                      onSelectTile(tile);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0"
                        style={{ backgroundColor: tile.previewColor }}
                      />
                      <span>{tile.name}</span>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 text-sky-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
