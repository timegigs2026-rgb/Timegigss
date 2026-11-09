import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SeekersModal: React.FC<ModalProps> = ({ isOpen }) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-30 bg-white animate-in fade-in duration-150 p-4">
      {/* Floating Search Bar at the Top */}
      <div className="max-w-xl mx-auto w-full pt-2">
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-xl transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search seekers..."
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400 font-medium"
          />
        </div>
      </div>
    </div>
  );
};
