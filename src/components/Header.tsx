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
    <header className="sticky top-2 sm:top-4 z-50 px-2.5 sm:px-4 lg:px-8 max-w-[1520px] mx-auto w-full transition-all duration-300">
      <div className="bg-[#0a0e16]/85 backdrop-blur-xl border border-white/[0.12] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.45)] h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 transition-all">
        {/* Brand & Mode Indicator */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1c2028] border border-[#4edea3]/30 shadow-[0_0_12px_rgba(78,222,163,0.15)] shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#4edea3]" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="font-bold text-xs sm:text-base uppercase tracking-wider text-[#dfe2ee] truncate">
                MODEL LEGIT CHECK
              </span>
              <span className="font-mono text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-[#262a33] text-[#4edea3] border border-[#4edea3]/20 font-medium shrink-0">
                v1.0
              </span>
            </div>
          </div>

          {/* Mode Pill Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#181c24] border border-white/[0.08] text-xs font-mono shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4edea3] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4edea3]"></span>
            </span>
            <span className="text-[#bbcabf] text-[11px]">
              {proxyMode === 'server' ? (
                <>
                  <span className="text-[#4cd7f6] font-semibold">Mode: Server Proxy</span> (Bypass CORS)
                </>
              ) : (
                <>
                  <span className="text-[#4edea3] font-semibold">Mode: Direct Client</span> (Browser Fetch)
                </>
              )}
            </span>
          </div>
        </div>

        {/* Navigation & Action Badges */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-3 py-1.5 rounded-lg bg-[#262a33] hover:bg-[#31353e] text-[#dfe2ee] border border-[#4cd7f6]/30 font-semibold transition cursor-pointer"
            >
              Authenticity Radar
            </button>
            <button
              onClick={onOpenMethodology}
              className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-[#bbcabf] hover:bg-[#262a33] hover:text-[#dfe2ee] transition cursor-pointer flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#4cd7f6]" />
              <span>Metodologi</span>
            </button>
            <button
              onClick={onOpenHistory}
              className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-[#bbcabf] hover:bg-[#262a33] hover:text-[#dfe2ee] transition cursor-pointer flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5 text-[#86948a]" />
              <span>Riwayat</span>
            </button>
          </div>

          {/* Sentinel Status Badge */}
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-[#181c24] border border-white/[0.08] font-mono text-[10px] sm:text-[11px] shrink-0">
            <Radio className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#4cd7f6] animate-pulse shrink-0" />
            <span className="text-[#bbcabf] hidden sm:inline">SENTINEL:</span>
            <span className="text-[#4cd7f6] font-bold">ARMED // 24ms</span>
          </div>

          {/* Mobile Quick Action Buttons */}
          <div className="flex md:hidden items-center gap-1 shrink-0">
            <button
              onClick={onOpenMethodology}
              className="p-2 rounded-xl bg-[#181c24] border border-white/[0.08] text-[#bbcabf] hover:text-[#dfe2ee] hover:bg-[#262a33] transition"
              title="Metodologi"
              aria-label="Metodologi"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#4cd7f6]" />
            </button>
            <button
              onClick={onOpenHistory}
              className="p-2 rounded-xl bg-[#181c24] border border-white/[0.08] text-[#bbcabf] hover:text-[#dfe2ee] hover:bg-[#262a33] transition"
              title="Riwayat"
              aria-label="Riwayat"
            >
              <History className="w-3.5 h-3.5 text-[#86948a]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
