import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Terminal,
  Activity,
} from 'lucide-react';
import { TestResult } from '../types';

interface TestResultCardProps {
  result: TestResult;
  onRunSingle: (id: string) => void;
  isRunning: boolean;
}

export const TestResultCard: React.FC<TestResultCardProps> = ({
  result,
  onRunSingle,
  isRunning,
}) => {
  const [showRaw, setShowRaw] = useState(false);

  const getStatusBadge = () => {
    switch (result.status) {
      case 'passed':
        return (
          <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold font-mono">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            LULUS (NATIVE)
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold font-mono">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            PERINGATAN
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold font-mono">
            <XCircle className="w-3 h-3 text-rose-400" />
            GAGAL (MASKING)
          </span>
        );
      case 'running':
        return (
          <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold font-mono animate-pulse">
            <div className="w-2.5 h-2.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            SEDANG DIUJI...
          </span>
        );
      case 'idle':
      default:
        return (
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 font-medium font-mono">
            BELUM DIUJI
          </span>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="bg-[#111726] border border-slate-800/80 hover:border-slate-700/80 transition-all rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              {result.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {getStatusBadge()}
            {result.status !== 'idle' && result.status !== 'running' && (
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 ${getScoreColor(result.score)}`}>
                {result.score}/100
              </span>
            )}
          </div>
        </div>

        {/* Short description */}
        <p className="text-xs text-slate-400 mb-3.5 leading-relaxed">
          {result.shortDesc}
        </p>

        {/* Live Metrics Chips if available */}
        {(result.ttftMs !== undefined || result.tokensPerSec !== undefined || result.durationMs !== undefined) && (
          <div className="flex flex-wrap items-center gap-2 mb-3.5 pt-2 border-t border-slate-800/60 font-mono text-[11px]">
            {result.ttftMs !== undefined && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>TTFT:</span>
                <span className={`font-bold ${result.ttftMs <= 850 ? 'text-emerald-400' : result.ttftMs <= 2000 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {result.ttftMs} ms
                </span>
              </div>
            )}

            {result.tokensPerSec !== undefined && result.tokensPerSec > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span>Speed:</span>
                <span className="font-bold text-cyan-300">{result.tokensPerSec} tok/s</span>
              </div>
            )}

            {result.jitterMs !== undefined && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <span>Jitter:</span>
                <span className={`font-bold ${result.jitterMs < 200 ? 'text-slate-200' : 'text-amber-400'}`}>
                  ±{result.jitterMs} ms
                </span>
              </div>
            )}

            {result.durationMs !== undefined && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 ml-auto">
                <Clock className="w-3 h-3" />
                <span>{(result.durationMs / 1000).toFixed(2)}s</span>
              </div>
            )}
          </div>
        )}

        {/* Anomalies Alert Box */}
        {result.anomalies && result.anomalies.length > 0 && (
          <div className="mb-3 p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-200 text-xs space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-rose-400 uppercase text-[10px] tracking-wider">
              <AlertTriangle className="w-3 h-3" />
              Temuan Anomali:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-200">
              {result.anomalies.map((anom, i) => (
                <li key={i}>{anom}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Detailed Points */}
        {result.details && result.details.length > 0 && (
          <div className="mb-3 space-y-1 text-xs text-slate-300">
            {result.details.map((det, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                <span>{det}</span>
              </div>
            ))}
          </div>
        )}

        {/* Technical explanation */}
        {result.technicalExplanation && (
          <div className="text-[11px] text-slate-400 bg-slate-900/60 border border-slate-800/70 p-2.5 rounded-xl mb-3 leading-relaxed">
            <span className="font-semibold text-slate-300 block mb-0.5">Analisis Teknis:</span>
            {result.technicalExplanation}
          </div>
        )}

        {/* Raw output accordion */}
        {result.rawOutput && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setShowRaw(!showRaw)}
              className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <Terminal className="w-3 h-3" />
              <span>{showRaw ? 'Sembunyikan Raw Output' : 'Lihat Raw Output Respon'}</span>
              {showRaw ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showRaw && (
              <pre className="mt-2 p-3 bg-black/60 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 whitespace-pre-wrap">
                {result.rawOutput}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-800/60 mt-3 flex items-center justify-end">
        <button
          type="button"
          onClick={() => onRunSingle(result.id)}
          disabled={isRunning}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Uji Tes Ini Saja</span>
        </button>
      </div>
    </div>
  );
};
