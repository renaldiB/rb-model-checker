import React, { useRef, useEffect } from 'react';
import { Terminal, Zap, Activity, Radio, Trash2 } from 'lucide-react';

interface LiveStreamViewerProps {
  currentTestName: string;
  statusMessage: string;
  streamText: string;
  ttftMs: number | null;
  tokenCount: number;
  tokensPerSec: number;
  isVisible: boolean;
  onClear?: () => void;
}

export const LiveStreamViewer: React.FC<LiveStreamViewerProps> = ({
  currentTestName,
  statusMessage,
  streamText,
  ttftMs,
  tokenCount,
  tokensPerSec,
  isVisible,
  onClear,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [streamText, statusMessage]);

  if (!isVisible && !streamText) return null;

  return (
    <section className="bg-[#0a0e16]/90 rounded-xl border border-[#4cd7f6]/25 shadow-2xl p-4 sm:p-6 flex flex-col gap-4 relative overflow-hidden font-mono">
      {/* Top glowing laser line */}
      <div className="absolute top-0 right-0 w-96 h-1 bg-gradient-to-r from-transparent via-[#4cd7f6] to-[#4edea3]" />

      {/* Header telemetry and stat blocks */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        {/* Status Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4cd7f6]/10 border border-[#4cd7f6]/25">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4cd7f6] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4cd7f6]"></span>
            </span>
            <span className="text-xs text-[#4cd7f6] font-bold tracking-wide font-mono">
              STREAM TELEMETRY // {isVisible ? 'SSE ACTIVE 200 OK' : 'BUFFER READY'}
            </span>
          </div>
          <span className="text-white/20 hidden sm:inline">|</span>
          <span className="text-xs text-[#bbcabf] font-mono truncate max-w-xs">
            {currentTestName || 'Idle Inspector'}
          </span>
        </div>

        {/* 4 Live Metric Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
          {/* TTFT */}
          <div className="bg-[#181c24] px-3.5 py-2 rounded-xl border border-white/[0.06] flex flex-col gap-0.5">
            <span className="text-[10px] text-[#bbcabf] uppercase tracking-wider font-mono">Time To First Token</span>
            <span className={`font-bold text-xs sm:text-sm font-mono ${ttftMs !== null && ttftMs <= 850 ? 'text-[#4edea3]' : ttftMs !== null && ttftMs <= 2000 ? 'text-[#f59e0b]' : 'text-[#4cd7f6]'}`}>
              {ttftMs !== null ? `${ttftMs} ms` : '--'}
            </span>
          </div>

          {/* Throughput */}
          <div className="bg-[#181c24] px-3.5 py-2 rounded-xl border border-white/[0.06] flex flex-col gap-0.5">
            <span className="text-[10px] text-[#bbcabf] uppercase tracking-wider font-mono">Throughput Rate</span>
            <div className="flex items-center gap-2">
              <span className="text-[#4edea3] font-bold text-xs sm:text-sm font-mono">
                {tokensPerSec > 0 ? `${tokensPerSec} tok/s` : '--'}
              </span>
              {tokensPerSec > 0 && (
                <div className="w-6 h-1.5 bg-[#4edea3]/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4edea3] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (tokensPerSec / 80) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Total Rendered */}
          <div className="bg-[#181c24] px-3.5 py-2 rounded-xl border border-white/[0.06] flex flex-col gap-0.5">
            <span className="text-[10px] text-[#bbcabf] uppercase tracking-wider font-mono">Tokens Rendered</span>
            <span className="text-[#dfe2ee] font-bold text-xs sm:text-sm font-mono">
              {tokenCount > 0 ? `${tokenCount} chunks` : '--'}
            </span>
          </div>

          {/* Active Status */}
          <div className="bg-[#181c24] px-3.5 py-2 rounded-xl border border-white/[0.06] flex flex-col gap-0.5">
            <span className="text-[10px] text-[#bbcabf] uppercase tracking-wider font-mono">Sensor State</span>
            <span className={`font-bold text-xs sm:text-sm font-mono ${isVisible ? 'text-[#4cd7f6] animate-pulse' : 'text-[#86948a]'}`}>
              {isVisible ? 'RECORDING' : 'READY'}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time status sub-bar */}
      <div className="flex items-center justify-between text-xs font-mono text-[#4cd7f6] px-1">
        <div className="flex items-center gap-2 truncate">
          <Radio className="w-3.5 h-3.5 animate-pulse shrink-0 text-[#4cd7f6]" />
          <span className="truncate">{statusMessage || 'Menunggu transmisi streaming...'}</span>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-[11px] text-[#bbcabf] hover:text-[#dfe2ee] transition cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Bersihkan</span>
          </button>
        )}
      </div>

      {/* Terminal View */}
      <div
        ref={terminalRef}
        className="h-60 overflow-y-auto bg-[#0f131c]/90 p-4 rounded-xl border border-white/[0.06] space-y-1.5 font-mono text-xs text-[#dfe2ee]/90 select-text leading-relaxed shadow-inner"
      >
        {streamText ? (
          <pre className="whitespace-pre-wrap font-mono text-xs">{streamText}</pre>
        ) : (
          <div className="text-[#bbcabf]/50 italic text-xs">
            [TELEMETRY CONSOLE ACTIVE] Paket chunk streaming SSE akan tampil di sini secara real-time...
          </div>
        )}
      </div>
    </section>
  );
};
