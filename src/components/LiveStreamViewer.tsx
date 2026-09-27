import React from 'react';
import { Terminal, Zap, Activity, Radio } from 'lucide-react';

interface LiveStreamViewerProps {
  currentTestName: string;
  statusMessage: string;
  streamText: string;
  ttftMs: number | null;
  tokenCount: number;
  tokensPerSec: number;
  isVisible: boolean;
}

export const LiveStreamViewer: React.FC<LiveStreamViewerProps> = ({
  currentTestName,
  statusMessage,
  streamText,
  ttftMs,
  tokenCount,
  tokensPerSec,
  isVisible,
}) => {
  if (!isVisible && !streamText) return null;

  return (
    <div className="bg-[#0b0f17] border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden mb-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800/80 gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-white font-mono flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            LIVE STREAM INSPECTOR: <span className="text-cyan-300 font-normal">{currentTestName || 'Idle'}</span>
          </h4>
        </div>

        {/* Live Gauges */}
        <div className="flex items-center gap-3 font-mono text-[11px]">
          {ttftMs !== null && (
            <div className="flex items-center gap-1 text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-500">TTFT:</span>
              <span className={`font-bold ${ttftMs < 850 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {ttftMs} ms
              </span>
            </div>
          )}

          {tokensPerSec > 0 && (
            <div className="flex items-center gap-1 text-slate-300">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-500">Speed:</span>
              <span className="font-bold text-cyan-300">{tokensPerSec} tok/s</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-slate-400">
            <span>Tokens:</span>
            <span className="font-bold text-slate-200">{tokenCount}</span>
          </div>
        </div>
      </div>

      {/* Status banner */}
      <div className="mb-2 text-xs font-mono text-cyan-400 flex items-center gap-2">
        <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
        <span>{statusMessage || 'Menunggu transmisi SSE upstream...'}</span>
      </div>

      {/* Terminal View */}
      <div className="bg-black/80 rounded-xl p-3.5 border border-slate-800/80 font-mono text-xs text-slate-200 min-h-[100px] max-h-[220px] overflow-y-auto leading-relaxed whitespace-pre-wrap select-text">
        {streamText || <span className="text-slate-600 italic">Chunk stream akan tampil di sini secara real-time...</span>}
      </div>
    </div>
  );
};
