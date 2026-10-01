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
    let animId: number;
    if (terminalRef.current) {
      animId = requestAnimationFrame(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      });
    }
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [streamText, statusMessage]);

  if (!isVisible && !streamText) return null;

  return (
    <section className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-4 sm:p-6 flex flex-col gap-4 relative overflow-hidden font-mono">
      {/* Header telemetry and stat blocks */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        {/* Status Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
            <span className="text-xs text-emerald-400 font-medium tracking-wide font-mono">
              STREAM TELEMETRY // {isVisible ? 'SSE ACTIVE 200 OK' : 'BUFFER READY'}
            </span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="text-xs text-slate-400 font-mono font-normal truncate max-w-xs">
            {currentTestName || 'Idle Inspector'}
          </span>
        </div>

        {/* 4 Live Metric Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
          {/* TTFT */}
          <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-normal">Time To First Token</span>
            <span className={`font-semibold text-xs sm:text-sm font-mono ${ttftMs !== null && ttftMs <= 850 ? 'text-emerald-400' : ttftMs !== null && ttftMs <= 2000 ? 'text-amber-400' : 'text-slate-200'}`}>
              {ttftMs !== null ? `${ttftMs} ms` : '--'}
            </span>
          </div>

          {/* Throughput */}
          <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-normal">Throughput Rate</span>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-semibold text-xs sm:text-sm font-mono">
                {tokensPerSec > 0 ? `${tokensPerSec} tok/s` : '--'}
              </span>
              {tokensPerSec > 0 && (
                <div className="w-6 h-1.5 bg-emerald-950 rounded-full overflow-hidden border border-emerald-500/20">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (tokensPerSec / 80) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Total Rendered */}
          <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-normal">Tokens Rendered</span>
            <span className="text-slate-200 font-semibold text-xs sm:text-sm font-mono">
              {tokenCount > 0 ? `${tokenCount} chunks` : '--'}
            </span>
          </div>

          {/* Active Status */}
          <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-normal">Sensor State</span>
            <span className={`font-semibold text-xs sm:text-sm font-mono ${isVisible ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`}>
              {isVisible ? 'RECORDING' : 'READY'}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time status sub-bar */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-300 px-1">
        <div className="flex items-center gap-2 truncate">
          <Radio className="w-3.5 h-3.5 animate-pulse shrink-0 text-emerald-400 stroke-[1.75]" />
          <span className="truncate font-normal">{statusMessage || 'Menunggu transmisi streaming...'}</span>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 active:scale-[0.98] transition cursor-pointer font-normal"
          >
            <Trash2 className="w-3 h-3 stroke-[1.75]" />
            <span>Bersihkan</span>
          </button>
        )}
      </div>

      {/* Terminal View */}
      <div
        ref={terminalRef}
        className="h-60 overflow-y-auto bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5 font-mono text-xs text-slate-300 select-text leading-relaxed shadow-inner"
      >
        {streamText ? (
          <pre className="whitespace-pre-wrap font-mono text-xs text-slate-200">{streamText}</pre>
        ) : (
          <div className="text-slate-500 italic text-xs">
            [TELEMETRY CONSOLE ACTIVE] Paket chunk streaming SSE akan tampil di sini secara real-time...
          </div>
        )}
      </div>
    </section>
  );
};
