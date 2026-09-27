import React, { useState } from 'react';
import { Download, Share2, Check, ShieldCheck, AlertTriangle, ShieldAlert, Cpu, Zap, Activity } from 'lucide-react';
import { OverallVerdict, TestResult } from '../types';

interface VerdictBadgeProps {
  verdict: OverallVerdict;
  results: TestResult[];
  onExport: () => void;
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({ verdict, results, onExport }) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const isFinished = results.some((r) => r.status !== 'idle' && r.status !== 'running');

  if (!isFinished) return null;

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
        border: 'border-[#4edea3]/40 shadow-[0_0_40px_rgba(16,185,129,0.15)]',
        circleColor: 'text-[#4edea3]',
        badgeBg: 'bg-[#4edea3]/15 border-[#4edea3]/40 text-[#4edea3]',
        accentText: 'text-[#4edea3]',
        dotColor: 'bg-[#4edea3]',
        gradientAura: 'bg-[#4edea3]/10',
      };
    }
    if (isInvalidConfig) {
      return {
        border: 'border-[#f59e0b]/40 shadow-[0_0_40px_rgba(245,158,11,0.15)]',
        circleColor: 'text-[#f59e0b]',
        badgeBg: 'bg-[#f59e0b]/15 border-[#f59e0b]/40 text-[#f59e0b]',
        accentText: 'text-[#f59e0b]',
        dotColor: 'bg-[#f59e0b]',
        gradientAura: 'bg-[#f59e0b]/10',
      };
    }
    if (isSuspicious) {
      return {
        border: 'border-[#f59e0b]/40 shadow-[0_0_40px_rgba(245,158,11,0.15)]',
        circleColor: 'text-[#f59e0b]',
        badgeBg: 'bg-[#f59e0b]/15 border-[#f59e0b]/40 text-[#f59e0b]',
        accentText: 'text-[#f59e0b]',
        dotColor: 'bg-[#f59e0b]',
        gradientAura: 'bg-[#f59e0b]/10',
      };
    }
    return {
      border: 'border-[#f43f5e]/40 shadow-[0_0_40px_rgba(244,63,94,0.15)]',
      circleColor: 'text-[#f43f5e]',
      badgeBg: 'bg-[#f43f5e]/15 border-[#f43f5e]/40 text-[#f43f5e]',
      accentText: 'text-[#f43f5e]',
      dotColor: 'bg-[#f43f5e]',
      gradientAura: 'bg-[#f43f5e]/10',
    };
  };

  const theme = getTheme();

  return (
    <section className={`bg-gradient-to-r from-[#181c24] via-[#1c2028] to-[#181c24] rounded-xl border ${theme.border} p-5 sm:p-8 relative overflow-hidden transition-all duration-500`}>
      {/* Decorative aura */}
      <div className={`absolute -left-16 -top-16 w-80 h-80 ${theme.gradientAura} rounded-full blur-3xl pointer-events-none`} />

      <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8">
        {/* Radial HUD Gauge */}
        <div className="relative flex-shrink-0 flex items-center justify-center w-48 h-48 sm:w-52 sm:h-52">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Background track */}
            <circle
              className="text-[#31353e]"
              cx="80"
              cy="80"
              fill="transparent"
              r="70"
              stroke="currentColor"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              className={`${theme.circleColor} transition-all duration-1000 ease-out`}
              cx="80"
              cy="80"
              fill="transparent"
              r="70"
              stroke="currentColor"
              strokeDasharray="440"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth="9"
            />
            {/* Decorative inner dotted circle */}
            <circle
              className="text-[#4cd7f6]/30"
              cx="80"
              cy="80"
              fill="transparent"
              r="60"
              stroke="currentColor"
              strokeDasharray="2 6"
              strokeWidth="1.5"
            />
          </svg>

          {/* Centered Score Readout */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="font-mono text-[10px] sm:text-[11px] text-[#bbcabf] uppercase tracking-widest">
              AUTHENTICITY
            </span>
            <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#dfe2ee] tracking-tight">
              {verdict.score}%
            </span>
            <span className={`font-mono text-[10px] ${theme.accentText} uppercase tracking-wider font-semibold`}>
              {isAuthentic ? 'VERIFIED' : isInvalidConfig ? 'CONFIG ERR' : isSuspicious ? 'ANOMALY' : 'MASKED'}
            </span>
          </div>
        </div>

        {/* Diagnostic Description & Tactical Chips */}
        <div className="flex-1 space-y-4 text-center lg:text-left">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 font-mono">
            <div className={`px-3 py-1.5 rounded-full border ${theme.badgeBg} text-xs font-bold tracking-wide flex items-center gap-2`}>
              <span className={`w-2 h-2 rounded-full ${theme.dotColor} animate-ping`} />
              <span>{verdict.title}</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-[#262a33] border border-white/[0.08] text-[#4cd7f6] text-[11px]">
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
          <p className="text-sm sm:text-base text-[#dfe2ee] leading-relaxed max-w-3xl">
            {verdict.summary}
          </p>

          {/* Real Detected Model Callout when Masking */}
          {verdict.detectedRealModel && (
            <div className="bg-[#f43f5e]/10 border border-[#f43f5e]/40 rounded-xl p-4 text-left font-mono space-y-2">
              <div className="text-xs font-bold text-[#f43f5e] uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#f43f5e]" />
                <span>IDENTITAS ASLI TERBONGKAR (SPOOFING DETECTED)</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-[#dfe2ee]">
                <Cpu className="w-4 h-4 text-[#4cd7f6]" />
                <span>Backend inference sebenarnya berjalan di atas:</span>
                <span className="font-bold text-[#4cd7f6] bg-[#4cd7f6]/10 px-2.5 py-1 rounded border border-[#4cd7f6]/30">
                  {verdict.detectedRealModel}
                </span>
              </div>
              <p className="text-[11px] text-[#bbcabf]">
                Model ini membocorkan identitas aslinya saat diuji token khusus atau prompt boundary, membuktikan adanya pengalihan (rerouting/masking).
              </p>
            </div>
          )}

          {/* Diagnostic Highlight Cards or Recommendations */}
          {isInvalidConfig && verdict.recommendations?.length > 0 ? (
            <div className="bg-[#0a0e16]/80 border border-[#f59e0b]/30 rounded-xl p-4 text-left font-mono text-xs space-y-2">
              <span className="text-[#f59e0b] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Langkah Perbaikan Konfigurasi:
              </span>
              <ul className="list-disc list-inside space-y-1.5 text-[#dfe2ee] text-[11px] leading-relaxed">
                {verdict.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-[#0a0e16]/60 border border-white/[0.06] rounded-xl p-3 flex items-start gap-2.5 text-left">
                <div className="w-7 h-7 rounded-full bg-[#4cd7f6]/10 flex items-center justify-center shrink-0 border border-[#4cd7f6]/20">
                  <Zap className="text-[#4cd7f6] w-3.5 h-3.5" />
                </div>
                <span className="font-mono text-[11px] text-[#dfe2ee] leading-relaxed">
                  TTFT &amp; Streaming Jitter dianalisis terhadap SLA resmi inference.
                </span>
              </div>

              <div className="bg-[#0a0e16]/60 border border-white/[0.06] rounded-xl p-3 flex items-start gap-2.5 text-left">
                <div className="w-7 h-7 rounded-full bg-[#4edea3]/10 flex items-center justify-center shrink-0 border border-[#4edea3]/20">
                  <Activity className="text-[#4edea3] w-3.5 h-3.5" />
                </div>
                <span className="font-mono text-[11px] text-[#dfe2ee] leading-relaxed">
                  Logprob entropy diverifikasi langsung dari lapisan softmax GPU.
                </span>
              </div>

              <div className="bg-[#0a0e16]/60 border border-white/[0.06] rounded-xl p-3 flex items-start gap-2.5 text-left">
                <div className="w-7 h-7 rounded-full bg-[#4edea3]/10 flex items-center justify-center shrink-0 border border-[#4edea3]/20">
                  <ShieldCheck className="text-[#4edea3] w-3.5 h-3.5" />
                </div>
                <span className="font-mono text-[11px] text-[#dfe2ee] leading-relaxed">
                  Needle-in-haystack context window dievaluasi utuh tanpa truncate.
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-2 w-full">
            <button
              type="button"
              onClick={onExport}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#262a33] hover:bg-[#31353e] text-[#dfe2ee] font-mono text-xs font-semibold border border-white/[0.1] flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#4cd7f6]" />
              <span>Ekspor Laporan Audit (JSON / MD)</span>
            </button>

            <button
              type="button"
              onClick={handleShareAttestation}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#1c2028] hover:bg-[#262a33] text-[#4cd7f6] font-mono text-xs font-semibold border border-[#4cd7f6]/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {copiedShare ? <Check className="w-4 h-4 text-[#4edea3]" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedShare ? 'Tersalin!' : 'Bagikan Hasil Audit'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
