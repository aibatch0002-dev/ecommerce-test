import React from 'react';
import { Film, Download, Play, Pause } from 'lucide-react';

interface TopNavProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onOpenExport: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  isPlaying,
  onTogglePlay,
  onOpenExport,
}) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark */}
      <a href="#player" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-neutral-100 hover:text-amber-400 transition-colors">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-neutral-950 shadow-md shadow-amber-500/20">
          <Film className="w-4 h-4 stroke-[2.5]" />
        </div>
        <span className="font-cinzel tracking-wider font-extrabold text-amber-400">UNITY SUPER SHOP</span>
      </a>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
        <a href="#player" className="hover:text-amber-400 transition-colors">
          Commercial Player
        </a>
        <a href="#storyboard" className="hover:text-amber-400 transition-colors">
          Storyboard
        </a>
        <a href="#director" className="hover:text-amber-400 transition-colors">
          Director Suite
        </a>
        <a href="#store-guide" className="hover:text-amber-400 transition-colors">
          Rajshahi Branch
        </a>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onTogglePlay}
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-200 bg-neutral-900 border border-neutral-700 rounded-lg hover:bg-neutral-800 hover:border-neutral-600 transition-colors whitespace-nowrap cursor-pointer"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          {isPlaying ? 'Pause Ad' : 'Play Commercial'}
        </button>

        <button
          onClick={onOpenExport}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg hover:from-amber-300 hover:to-amber-400 transition-all shadow-md shadow-amber-500/20 active:scale-95 whitespace-nowrap cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Export Video</span>
        </button>
      </div>
    </header>
  );
};
