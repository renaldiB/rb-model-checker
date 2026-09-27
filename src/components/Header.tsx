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
    <header className="sticky top-0 left-0 right-0 z-50 bg-[#0a0e16]/85 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-[1520px] mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand & Mode Indicator */}
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-[#1c2028] border border-[#4edea3]/30 shadow-[0_0_12px_rgba(78,222,163,0.15)]">
              <ShieldCheck className="w-5 h-5 text-[#4edea3]" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-bold text-sm sm:text-base uppercase tracking-wider text-[#dfe2ee]">
                MODEL LEGIT CHECK
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#262a33] text-[#4edea3] border border-[#4edea3]/20 self-start sm:self-auto font-medium">
                v1.0
              </span>
            </div>
          </div>

          {/* Mode Pill Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#181c24] border border-white/[0.08] text-xs font-mono">
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
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-3 py-1.5 rounded-lg bg-[#262a33] text-[#dfe2ee] border border-[#4cd7f6]/30 font-semibold transition cursor-pointer"
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
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#181c24] border border-white/[0.08] font-mono text-[11px]">
            <Radio className="w-3.5 h-3.5 text-[#4cd7f6] animate-pulse" />
            <span className="text-[#bbcabf] hidden sm:inline">SENTINEL:</span>
            <span className="text-[#4cd7f6] font-bold">ARMED // 24ms</span>
          </div>

          {/* Mobile Quick Action Buttons */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={onOpenMethodology}
              className="p-1.5 rounded bg-[#181c24] border border-white/[0.08] text-[#bbcabf] hover:text-[#dfe2ee]"
              title="Metodologi"
            >
              <BookOpen className="w-4 h-4 text-[#4cd7f6]" />
            </button>
            <button
              onClick={onOpenHistory}
              className="p-1.5 rounded bg-[#181c24] border border-white/[0.08] text-[#bbcabf] hover:text-[#dfe2ee]"
              title="Riwayat"
            >
              <History className="w-4 h-4 text-[#86948a]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
