import React from 'react';
import { ShieldCheck, Server, Globe, BookOpen, History, Radio } from 'lucide-react';
import { ProxyMode } from '../types';

interface HeaderProps {
  proxyMode: ProxyMode;
  onOpenHistory: () => void;
  onOpenMethodology: () => void;
}

export const Header: React.FC<HeaderProps> = ({ proxyMode, onOpenHistory, onOpenMethodology }) => {
  return (
    <header className="sticky top-2 sm:top-4 z-50 px-2.5 sm:px-4 lg:px-8 max-w-[1520px] mx-auto w-full transition-all duration-200">
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl shadow-xl h-14 sm:h-16 px-3.5 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 transition-all">
        {/* Brand & Mode Indicator */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 border border-emerald-500/30 shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 stroke-[1.75]" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="font-semibold text-xs sm:text-sm uppercase tracking-wider text-slate-100 truncate">
                MODEL LEGIT CHECK
              </span>
              <span className="font-mono text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/20 font-medium shrink-0">
                v1.0
              </span>
            </div>
          </div>

          {/* Mode Pill Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-mono shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-slate-400 text-[11px]">
              {proxyMode === 'server' ? (
                <>
                  <span className="text-emerald-400 font-medium">Mode: Server Proxy</span> (Bypass CORS)
                </>
              ) : (
                <>
                  <span className="text-emerald-400 font-medium">Mode: Direct Client</span> (Browser Fetch)
                </>
              )}
            </span>
          </div>
        </div>

        {/* Navigation & Action Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium active:scale-[0.98] transition-all cursor-pointer"
            >
              Authenticity Radar
            </button>
            <button
              onClick={onOpenMethodology}
              className="px-3 py-1.5 rounded-lg border border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-slate-100 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400 stroke-[1.75]" />
              <span>Metodologi</span>
            </button>
            <button
              onClick={onOpenHistory}
              className="px-3 py-1.5 rounded-lg border border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-slate-100 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
              <span>Riwayat</span>
            </button>
          </div>

          {/* Sentinel Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/70 font-mono text-[10px] sm:text-[11px] shrink-0">
            <Radio className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 animate-pulse shrink-0 stroke-[1.75]" />
            <span className="text-slate-400 hidden sm:inline font-normal">SENTINEL:</span>
            <span className="text-emerald-400 font-medium">ARMED // 24ms</span>
          </div>

          {/* Mobile Quick Action Buttons */}
          <div className="flex md:hidden items-center gap-1 shrink-0">
            <button
              onClick={onOpenMethodology}
              className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/70 text-slate-300 hover:text-slate-100 hover:bg-slate-700 active:scale-[0.98] transition-all cursor-pointer"
              title="Metodologi"
              aria-label="Metodologi"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400 stroke-[1.75]" />
            </button>
            <button
              onClick={onOpenHistory}
              className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/70 text-slate-300 hover:text-slate-100 hover:bg-slate-700 active:scale-[0.98] transition-all cursor-pointer"
              title="Riwayat"
              aria-label="Riwayat"
            >
              <History className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
