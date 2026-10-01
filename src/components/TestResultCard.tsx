import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  Activity,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Terminal,
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
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-medium">
            PASSED ({result.score}%)
          </span>
        );
      case 'warning':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-medium">
            WARNING ({result.score}%)
          </span>
        );
      case 'failed':
        return (
          <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs font-medium">
            FAILED ({result.score}%)
          </span>
        );
      case 'running':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-medium animate-pulse flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            TESTING...
          </span>
        );
      case 'idle':
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700/80 text-slate-400 font-mono text-xs font-normal">
            STANDBY
          </span>
        );
    }
  };

  const getIndicatorDot = () => {
    if (result.status === 'passed') return 'bg-emerald-400';
    if (result.status === 'warning') return 'bg-amber-400';
    if (result.status === 'failed') return 'bg-rose-400';
    if (result.status === 'running') return 'bg-emerald-400 animate-ping';
    return 'bg-slate-500';
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md space-y-4">
      <div className="space-y-3.5">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${getIndicatorDot()} shrink-0`} />
            <h3 className="text-sm sm:text-base font-semibold text-slate-100 font-mono tracking-tight">
              {result.name}
            </h3>
          </div>
          <div className="shrink-0">{getStatusBadge()}</div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-400 leading-relaxed font-normal">
          {result.shortDesc}
        </p>

        {/* Structured Skeleton Loader when running */}
        {result.status === 'running' && (
          <div className="space-y-2 py-2 border-y border-slate-800/80 my-1">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Mengirim live probe &amp; menganalisis metrik...</span>
            </div>
            <div className="space-y-1.5">
              <div className="h-2.5 w-4/5 rounded bg-slate-800 animate-pulse" />
              <div className="h-2.5 w-3/5 rounded bg-slate-800 animate-pulse" />
            </div>
          </div>
        )}

        {/* Monospace Metric Chips */}
        {(result.ttftMs !== undefined || result.tokensPerSec !== undefined || result.jitterMs !== undefined || result.durationMs !== undefined) && (
          <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
            {result.ttftMs !== undefined && (
              <span className="px-2.5 py-1 rounded-full bg-slate-950 text-slate-400 border border-slate-800 flex items-center gap-1 font-normal">
                <Zap className="w-3 h-3 text-emerald-400 stroke-[1.75]" />
                TTFT: <strong className={result.ttftMs <= 850 ? 'text-emerald-400 font-semibold' : result.ttftMs <= 2000 ? 'text-amber-400 font-semibold' : 'text-rose-400 font-semibold'}>{result.ttftMs}ms</strong>
              </span>
            )}

            {result.tokensPerSec !== undefined && result.tokensPerSec > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-slate-950 text-slate-400 border border-slate-800 flex items-center gap-1 font-normal">
                <Activity className="w-3 h-3 text-emerald-400 stroke-[1.75]" />
                Speed: <strong className="text-emerald-400 font-semibold">{result.tokensPerSec} tok/s</strong>
              </span>
            )}

            {result.jitterMs !== undefined && (
              <span className="px-2.5 py-1 rounded-full bg-slate-950 text-slate-400 border border-slate-800 font-normal">
                Jitter: <strong className={result.jitterMs <= 200 ? 'text-slate-200 font-semibold' : 'text-amber-400 font-semibold'}>±{result.jitterMs}ms</strong>
              </span>
            )}

            {result.durationMs !== undefined && (
              <span className="px-2.5 py-1 rounded-full bg-slate-950 text-slate-400 border border-slate-800 ml-auto font-normal">
                {(result.durationMs / 1000).toFixed(2)}s
              </span>
            )}
          </div>
        )}

        {/* Visual Latency Bar for TTFT Test */}
        {result.id === 'latency-ttft' && result.ttftMs !== undefined && (
          <div className="bg-slate-950 rounded-xl p-3 space-y-2 border border-slate-800 font-mono text-[10px]">
            <div className="flex justify-between text-slate-400 font-normal">
              <span>Direct Upstream: {result.ttftMs}ms</span>
              <span className="text-rose-400 font-medium">Scraper Threshold: 1500ms</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-700 ${result.ttftMs <= 850 ? 'bg-emerald-400' : result.ttftMs <= 2000 ? 'bg-amber-400' : 'bg-rose-400'}`}
                style={{ width: `${Math.min(100, (result.ttftMs / 2000) * 100)}%` }}
              />
              <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-rose-500" title="1500ms threshold" />
            </div>
          </div>
        )}

        {/* Detected Real Model Callout */}
        {result.detectedRealModel && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 font-mono text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 stroke-[1.75]" />
            <div className="text-[11px] leading-relaxed">
              <span className="text-rose-400 font-semibold block text-[10px] uppercase tracking-wide">
                MODEL ASLI TERDETEKSI (MASKING TERBONGKAR):
              </span>
              <span className="text-slate-300 font-normal">
                Sebenarnya berjalan di atas: <strong className="text-rose-400 font-semibold underline">{result.detectedRealModel}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Anomalies Alert Box */}
        {result.anomalies && result.anomalies.length > 0 && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs space-y-1 font-mono">
            <span className="font-semibold flex items-center gap-1.5 text-rose-400 uppercase text-[10px] tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 stroke-[1.75]" />
              Temuan Anomali Spoofing:
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] font-normal">
              {result.anomalies.map((anom, i) => (
                <li key={i}>{anom}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Verification Checkpoints */}
        {result.details && result.details.length > 0 && (
          <div className="bg-slate-950 rounded-xl p-3 space-y-2 border border-slate-800">
            {result.details.map((det, i) => (
              <div key={i} className="flex items-start gap-2 text-slate-300 font-mono text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5 stroke-[1.75]" />
                <span className="leading-relaxed font-normal">{det}</span>
              </div>
            ))}
          </div>
        )}

        {/* Technical Explanation */}
        {result.technicalExplanation && (
          <div className="text-[11px] text-slate-400 bg-slate-950/60 border border-slate-800 p-3 rounded-xl leading-relaxed font-mono">
            <span className="font-medium text-slate-200 block mb-0.5">Analisis Forensik:</span>
            <span className="font-normal">{result.technicalExplanation}</span>
          </div>
        )}

        {/* Raw Output Accordion */}
        {result.rawOutput && (
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowRaw(!showRaw)}
              className="w-full text-left font-mono text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center justify-between transition active:scale-[0.98] cursor-pointer"
            >
              <span className="flex items-center gap-1.5 font-normal">
                <Terminal className="w-3 h-3 stroke-[1.75]" />
                <span>{showRaw ? 'Sembunyikan Raw Payload' : 'Lihat Raw Payload [JSON/Trace]'}</span>
              </span>
              {showRaw ? <ChevronUp className="w-3.5 h-3.5 stroke-[1.75]" /> : <ChevronDown className="w-3.5 h-3.5 stroke-[1.75]" />}
            </button>
            {showRaw && (
              <pre className="mt-2 p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto max-h-48 whitespace-pre-wrap select-all">
                {result.rawOutput}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
        <button
          type="button"
          onClick={() => onRunSingle(result.id)}
          disabled={isRunning}
          className="flex items-center justify-center gap-1.5 font-mono text-xs font-medium text-emerald-400 hover:text-emerald-300 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          <RefreshCw className="w-3 h-3 text-emerald-400 stroke-[1.75]" />
          <span>Uji Modul Ini Saja</span>
        </button>
      </div>
    </div>
  );
};
