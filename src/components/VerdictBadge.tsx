import React, { useState } from 'react';
import { Download, Share2, Check, ShieldCheck, AlertTriangle, AlertCircle, ShieldAlert, Cpu, Zap, Activity, RefreshCw, Play } from 'lucide-react';
import { OverallVerdict, TestResult } from '../types';

interface VerdictBadgeProps {
  verdict: OverallVerdict;
  results: TestResult[];
  onExport: () => void;
  onRetry?: () => void;
  hasValidConfig?: boolean;
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({
  verdict,
  results,
  onExport,
  onRetry,
  hasValidConfig = true,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const isFinished = results.some((r) => r.status !== 'idle' && r.status !== 'running');

  // Empty State: Before tests are run
  if (!isFinished) {
    return (
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-lg relative overflow-hidden transition-all duration-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 font-mono text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>RADAR ATTESTATION // SIAP AUDIT</span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-100 font-sans tracking-tight">
              Belum Ada Sesi Audit yang Berjalan
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
              Tentukan target Base URL dan nama model pada konfigurasi di atas, lalu jalankan pengujian untuk mengukur TTFT streaming, integritas logprobs softmax, identitas tokenizer, dan stress context window.
            </p>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={!hasValidConfig}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-mono text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 w-full sm:w-auto"
            >
              <Play className="w-3.5 h-3.5 fill-current stroke-[1.75]" />
              <span>Mulai Audit Forensik</span>
            </button>
          )}
        </div>
      </section>
    );
  }

  const isAuthentic = verdict.verdict === 'authentic';
  const isSuspicious = verdict.verdict === 'suspicious';
  const isInvalidConfig = verdict.verdict === 'invalid_config';

  // SVG circular circumference = 2 * PI * r = 2 * 3.14159 * 70 = ~440
  const circumference = 440;
  const strokeDashoffset = circumference - (circumference * verdict.score) / 100;

  const handleShareAttestation = () => {
    const text = `Model Legit Check Audit:\nSkor Otentisitas: ${verdict.score}/100\nStatus: ${verdict.title}\nDiaudit dengan model-legit-check.`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const getTheme = () => {
    if (isAuthentic) {
      return {
        border: 'border-emerald-500/30',
        circleColor: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        accentText: 'text-emerald-400',
        dotColor: 'bg-emerald-400',
      };
    }
    if (isInvalidConfig) {
      return {
        border: 'border-amber-500/30',
        circleColor: 'text-amber-400',
        badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        accentText: 'text-amber-400',
        dotColor: 'bg-amber-400',
      };
    }
    if (isSuspicious) {
      return {
        border: 'border-amber-500/30',
        circleColor: 'text-amber-400',
        badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        accentText: 'text-amber-400',
        dotColor: 'bg-amber-400',
      };
    }
    return {
      border: 'border-rose-500/30',
      circleColor: 'text-rose-400',
      badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      accentText: 'text-rose-400',
      dotColor: 'bg-rose-400',
    };
  };

  const theme = getTheme();

  return (
    <section className={`bg-slate-900 rounded-2xl border ${theme.border} p-5 sm:p-7 relative overflow-hidden transition-all duration-300 shadow-lg`}>
      <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8">
        {/* Radial HUD Gauge */}
        <div className="relative flex-shrink-0 flex items-center justify-center w-44 h-44 sm:w-48 sm:h-48">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Background track */}
            <circle
              className="text-slate-800"
              cx="80"
              cy="80"
              fill="transparent"
              r="70"
              stroke="currentColor"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              className={`${theme.circleColor} transition-all duration-700 ease-out`}
              cx="80"
              cy="80"
              fill="transparent"
              r="70"
              stroke="currentColor"
              strokeDasharray="440"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth="8"
            />
          </svg>

          {/* Centered Score Readout */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest font-normal">
              AUTHENTICITY
            </span>
            <span className="font-mono text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
              {verdict.score}%
            </span>
            <span className={`font-mono text-[10px] ${theme.accentText} uppercase tracking-wider font-medium`}>
              {isAuthentic ? 'VERIFIED' : isInvalidConfig ? 'CONFIG ERR' : isSuspicious ? 'ANOMALY' : 'MASKED'}
            </span>
          </div>
        </div>

        {/* Diagnostic Description & Tactical Chips */}
        <div className="flex-1 space-y-4 text-center lg:text-left">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 font-mono">
            <div className={`px-3 py-1.5 rounded-full border ${theme.badgeBg} text-xs font-semibold tracking-wide flex items-center gap-2`}>
              {isAuthentic ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400 stroke-[1.75]" />
              ) : isInvalidConfig ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 stroke-[1.75]" />
              ) : isSuspicious ? (
                <AlertCircle className="w-4 h-4 text-amber-400 stroke-[1.75]" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-400 stroke-[1.75]" />
              )}
              <span>{verdict.title}</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700/80 text-slate-400 text-[11px] font-normal">
              {isAuthentic
                ? 'ZERO MASKING DETECTED'
                : isInvalidConfig
                ? 'CONFIG / AUTH REJECTED'
                : isSuspicious
                ? 'PARAM INCONSISTENCY'
                : 'CRITICAL MASKING PROBABILITY'}
            </div>
          </div>

          {/* Diagnostic Text */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl font-normal">
            {verdict.summary}
          </p>

          {/* Real Detected Model Callout when Masking */}
          {verdict.detectedRealModel && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-left font-mono space-y-2">
              <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 stroke-[1.75]" />
                <span>IDENTITAS ASLI TERBONGKAR (SPOOFING DETECTED)</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-200">
                <Cpu className="w-4 h-4 text-emerald-400 stroke-[1.75]" />
                <span>Backend inference sebenarnya berjalan di atas:</span>
                <span className="font-semibold text-emerald-400 bg-slate-950 px-2.5 py-1 rounded border border-emerald-500/30">
                  {verdict.detectedRealModel}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">
                Model ini membocorkan identitas aslinya saat diuji token khusus atau prompt boundary, membuktikan adanya pengalihan (rerouting/masking).
              </p>
            </div>
          )}

          {/* Diagnostic Highlight Cards or Recommendations */}
          {isInvalidConfig && verdict.recommendations?.length > 0 ? (
            <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-4 text-left font-mono text-xs space-y-2">
              <span className="text-amber-400 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 stroke-[1.75]" />
                Langkah Perbaikan Konfigurasi:
              </span>
              <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed font-normal">
                {verdict.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5 text-left">
                <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700/80">
                  <Zap className="text-emerald-400 w-3.5 h-3.5 stroke-[1.75]" />
                </div>
                <span className="font-mono text-[11px] text-slate-400 leading-relaxed font-normal">
                  TTFT &amp; Streaming Jitter dianalisis terhadap SLA resmi inference.
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5 text-left">
                <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700/80">
                  <Activity className="text-emerald-400 w-3.5 h-3.5 stroke-[1.75]" />
                </div>
                <span className="font-mono text-[11px] text-slate-400 leading-relaxed font-normal">
                  Logprob entropy diverifikasi langsung dari lapisan softmax GPU.
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5 text-left">
                <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700/80">
                  <ShieldCheck className="text-emerald-400 w-3.5 h-3.5 stroke-[1.75]" />
                </div>
                <span className="font-mono text-[11px] text-slate-400 leading-relaxed font-normal">
                  Needle-in-haystack context window dievaluasi utuh tanpa truncate.
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center lg:justify-start gap-2.5 pt-2 w-full">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-150 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>Uji Ulang (Retry Audit)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onExport}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-mono text-xs font-medium border border-slate-700 flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-150 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400 stroke-[1.75]" />
              <span>Ekspor Laporan Audit</span>
            </button>

            <button
              type="button"
              onClick={handleShareAttestation}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-emerald-400 font-mono text-xs font-medium border border-emerald-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-150 cursor-pointer"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[1.75]" /> : <Share2 className="w-3.5 h-3.5 stroke-[1.75]" />}
              <span>{copiedShare ? 'Tersalin!' : 'Bagikan Hasil Audit'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
