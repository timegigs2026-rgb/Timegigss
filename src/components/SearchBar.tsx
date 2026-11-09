import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2, Navigation } from 'lucide-react';
import { searchLocations } from '../services/geocoding';
import { SearchResult } from '../types/map';

interface SearchBarProps {
  onSelectResult: (result: SearchResult) => void;
  onLocateUser: () => void;
  isLocating: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelectResult,
  onLocateUser,
  isLocating,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        const res = await searchLocations(query);
        setResults(res);
        setIsLoading(false);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    onSelectResult(result);
    setQuery(result.display_name);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative w-full max-w-xl mx-auto z-30">
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-xl transition-all focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20">
        <div className="text-slate-400">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
          ) : (
            <Search className="w-5 h-5 text-slate-400" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          placeholder="Search home number, street address, city, or province..."
          className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none font-medium"
        />

        {query && (
          <button
            onClick={handleClear}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="h-6 w-px bg-slate-200 my-auto" />

        <button
          onClick={onLocateUser}
          disabled={isLocating}
          className="p-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
          title="Locate my position on map"
        >
          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-pulse text-sky-600' : ''}`} />
          <span className="hidden sm:inline">My Location</span>
        </button>
      </div>

      {/* Suggestion Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-80 overflow-y-auto z-40 divide-y divide-slate-100 py-1">
          {results.map((res) => (
            <button
              key={res.place_id}
              onClick={() => handleSelect(res)}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3 group"
            >
              <MapPin className="w-4 h-4 text-sky-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate group-hover:text-sky-600">
                  {res.display_name}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && !isLoading && results.length === 0 && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 text-center z-40 text-xs text-slate-500">
          No matching addresses or locations found for "{query}"
        </div>
      )}
    </div>
  );
};
