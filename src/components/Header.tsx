import React from 'react';
import { ShieldAlert, ShieldCheck, History, BookOpen, Server, Globe } from 'lucide-react';
import { ProxyMode } from '../types';

interface HeaderProps {
  proxyMode: ProxyMode;
  onOpenHistory: () => void;
  onOpenMethodology: () => void;
}

export const Header: React.FC<HeaderProps> = ({ proxyMode, onOpenHistory, onOpenMethodology }) => {
  return (
    <header className="border-b border-slate-800 bg-[#0f1523]/80 backdrop-blur-md sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-[1px] shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-[#0b0f17] rounded-[11px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  MODEL LEGIT CHECK
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium font-mono">
                    v1.0
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Pemeriksa Keaslian Endpoint AI & Detektor Masking / Reverse-Proxy
              </p>
            </div>
          </div>

          {/* Quick Actions & Status */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Mode Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              {proxyMode === 'server' ? (
                <>
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden md:inline">Mode:</span>
                  <span className="font-semibold text-cyan-300">Server Proxy (No CORS)</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Mode:</span>
                  <span className="font-semibold text-amber-300">Direct Browser</span>
                </>
              )}
            </div>

            {/* Methodology guide */}
            <button
              onClick={onOpenMethodology}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-medium text-slate-200 hover:text-white transition cursor-pointer"
              title="Lihat metodologi pengujian teknis"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-400" />
              <span>Metodologi</span>
            </button>

            {/* History */}
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-medium text-slate-200 hover:text-white transition cursor-pointer"
              title="Riwayat audit pengujian"
            >
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>Riwayat</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
