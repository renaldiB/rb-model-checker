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
          <span className="px-3 py-1 rounded-full bg-[#4edea3]/10 border border-[#4edea3]/30 text-[#4edea3] font-mono text-xs font-semibold">
            PASSED ({result.score}%)
          </span>
        );
      case 'warning':
        return (
          <span className="px-3 py-1 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] font-mono text-xs font-semibold">
            WARNING ({result.score}%)
          </span>
        );
      case 'failed':
        return (
          <span className="px-3 py-1 rounded-full bg-[#f43f5e]/10 border border-[#f43f5e]/30 text-[#f43f5e] font-mono text-xs font-semibold">
            FAILED ({result.score}%)
          </span>
        );
      case 'running':
        return (
          <span className="px-3 py-1 rounded-full bg-[#4cd7f6]/10 border border-[#4cd7f6]/30 text-[#4cd7f6] font-mono text-xs font-semibold animate-pulse flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-ping" />
            TESTING...
          </span>
        );
      case 'idle':
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-[#181c24] border border-white/[0.08] text-[#86948a] font-mono text-xs">
            STANDBY
          </span>
        );
    }
  };

  const getIndicatorDot = () => {
    if (result.status === 'passed') return 'bg-[#4edea3]';
    if (result.status === 'warning') return 'bg-[#f59e0b]';
    if (result.status === 'failed') return 'bg-[#f43f5e]';
    if (result.status === 'running') return 'bg-[#4cd7f6] animate-ping';
    return 'bg-[#86948a]';
  };

  return (
    <div className="bg-[#1c2028]/60 backdrop-blur-md rounded-xl border border-white/[0.08] p-5 sm:p-6 flex flex-col justify-between hover:border-[#4cd7f6]/30 transition-all shadow-md space-y-4">
      <div className="space-y-3.5">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${getIndicatorDot()} shrink-0`} />
            <h3 className="text-sm sm:text-base font-semibold text-[#dfe2ee] font-mono tracking-tight">
              {result.name}
            </h3>
          </div>
          <div className="shrink-0">{getStatusBadge()}</div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-[#bbcabf] leading-relaxed">
          {result.shortDesc}
        </p>

        {/* Monospace Metric Chips */}
        {(result.ttftMs !== undefined || result.tokensPerSec !== undefined || result.jitterMs !== undefined || result.durationMs !== undefined) && (
          <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
            {result.ttftMs !== undefined && (
              <span className="px-2.5 py-1 rounded-full bg-[#0a0e16] text-[#bbcabf] border border-white/[0.05] flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#4cd7f6]" />
                TTFT: <strong className={result.ttftMs <= 850 ? 'text-[#4edea3]' : result.ttftMs <= 2000 ? 'text-[#f59e0b]' : 'text-[#f43f5e]'}>{result.ttftMs}ms</strong>
              </span>
            )}

            {result.tokensPerSec !== undefined && result.tokensPerSec > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-[#0a0e16] text-[#bbcabf] border border-white/[0.05] flex items-center gap-1">
                <Activity className="w-3 h-3 text-[#4edea3]" />
                Speed: <strong className="text-[#4edea3]">{result.tokensPerSec} tok/s</strong>
              </span>
            )}

            {result.jitterMs !== undefined && (
              <span className="px-2.5 py-1 rounded-full bg-[#0a0e16] text-[#bbcabf] border border-white/[0.05]">
                Jitter: <strong className={result.jitterMs <= 200 ? 'text-[#dfe2ee]' : 'text-[#f59e0b]'}>±{result.jitterMs}ms</strong>
              </span>
            )}

            {result.durationMs !== undefined && (
              <span className="px-2.5 py-1 rounded-full bg-[#0a0e16] text-[#86948a] border border-white/[0.05] ml-auto">
                {(result.durationMs / 1000).toFixed(2)}s
              </span>
            )}
          </div>
        )}

        {/* Visual Latency Bar for TTFT Test */}
        {result.id === 'latency-ttft' && result.ttftMs !== undefined && (
          <div className="bg-[#0a0e16]/60 rounded-xl p-3 space-y-2 border border-white/[0.04] font-mono text-[10px]">
            <div className="flex justify-between text-[#bbcabf]">
              <span>Direct Upstream: {result.ttftMs}ms</span>
              <span className="text-[#f43f5e]">Scraper Threshold: 1500ms</span>
            </div>
            <div className="w-full h-2 bg-[#262a33] rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-700 ${result.ttftMs <= 850 ? 'bg-[#4edea3]' : result.ttftMs <= 2000 ? 'bg-[#f59e0b]' : 'bg-[#f43f5e]'}`}
                style={{ width: `${Math.min(100, (result.ttftMs / 2000) * 100)}%` }}
              />
              <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-[#f43f5e]/80" title="1500ms threshold" />
            </div>
          </div>
        )}

        {/* Detected Real Model Callout */}
        {result.detectedRealModel && (
          <div className="p-3 rounded-xl bg-[#f43f5e]/15 border border-[#f43f5e]/40 font-mono text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#f43f5e] shrink-0" />
            <div className="text-[11px] leading-relaxed">
              <span className="text-[#ffb4ab] font-bold block text-[10px] uppercase tracking-wide">
                MODEL ASLI TERDETEKSI (MASKING TERBONGKAR):
              </span>
              <span className="text-[#dfe2ee]">
                Sebenarnya berjalan di atas: <strong className="text-[#f43f5e] font-bold underline">{result.detectedRealModel}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Anomalies Alert Box */}
        {result.anomalies && result.anomalies.length > 0 && (
          <div className="p-3 rounded-xl bg-[#f43f5e]/10 border border-[#f43f5e]/30 text-[#ffb4ab] text-xs space-y-1 font-mono">
            <span className="font-bold flex items-center gap-1.5 text-[#f43f5e] uppercase text-[10px] tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5" />
              Temuan Anomali Spoofing:
            </span>
            <ul className="list-disc list-inside space-y-1 text-[#dfe2ee] text-[11px]">
              {result.anomalies.map((anom, i) => (
                <li key={i}>{anom}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Verification Checkpoints */}
        {result.details && result.details.length > 0 && (
          <div className="bg-[#0a0e16]/50 rounded-xl p-3 space-y-2 border border-white/[0.04]">
            {result.details.map((det, i) => (
              <div key={i} className="flex items-start gap-2 text-[#dfe2ee] font-mono text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{det}</span>
              </div>
            ))}
          </div>
        )}

        {/* Technical Explanation */}
        {result.technicalExplanation && (
          <div className="text-[11px] text-[#bbcabf] bg-[#0a0e16]/40 border border-white/[0.05] p-3 rounded-xl leading-relaxed font-mono">
            <span className="font-semibold text-[#dfe2ee] block mb-0.5">Analisis Forensik:</span>
            {result.technicalExplanation}
          </div>
        )}

        {/* Raw Output Accordion */}
        {result.rawOutput && (
          <div className="pt-2 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => setShowRaw(!showRaw)}
              className="w-full text-left font-mono text-[11px] text-[#4cd7f6] hover:text-[#dfe2ee] flex items-center justify-between transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3 h-3" />
                <span>{showRaw ? 'Sembunyikan Raw Payload' : 'Lihat Raw Payload [JSON/Trace]'}</span>
              </span>
              {showRaw ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showRaw && (
              <pre className="mt-2 p-3 bg-[#0a0e16] border border-white/[0.08] rounded-xl font-mono text-[11px] text-[#bbcabf] overflow-x-auto max-h-48 whitespace-pre-wrap select-all">
                {result.rawOutput}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-end">
        <button
          type="button"
          onClick={() => onRunSingle(result.id)}
          disabled={isRunning}
          className="flex items-center justify-center gap-1.5 font-mono text-xs font-semibold text-[#4cd7f6] hover:text-[#e0f7fe] px-3.5 py-1.5 rounded-lg bg-[#4cd7f6]/10 hover:bg-[#4cd7f6]/20 border border-[#4cd7f6]/40 hover:border-[#4cd7f6]/70 shadow-[0_0_12px_rgba(6,182,212,0.15)] hover:shadow-[0_0_16px_rgba(6,182,212,0.3)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          <RefreshCw className="w-3 h-3 text-[#4cd7f6]" />
          <span>Uji Modul Ini Saja</span>
        </button>
      </div>
    </div>
  );
};
