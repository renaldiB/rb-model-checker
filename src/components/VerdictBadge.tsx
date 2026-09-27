import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Download, Copy, Share2, CheckCircle2 } from 'lucide-react';
import { OverallVerdict, TestResult } from '../types';

interface VerdictBadgeProps {
  verdict: OverallVerdict;
  results: TestResult[];
  onExport: () => void;
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({ verdict, results, onExport }) => {
  const isFinished = results.some((r) => r.status !== 'idle' && r.status !== 'running');

  if (!isFinished) {
    return null;
  }

  const getTheme = () => {
    switch (verdict.verdict) {
      case 'authentic':
        return {
          bg: 'bg-emerald-950/40 border-emerald-500/40 shadow-emerald-500/10',
          badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
          accentText: 'text-emerald-400',
          scoreBar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
        };
      case 'suspicious':
        return {
          bg: 'bg-amber-950/40 border-amber-500/40 shadow-amber-500/10',
          badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
          accentText: 'text-amber-400',
          scoreBar: 'bg-gradient-to-r from-amber-500 to-yellow-400',
        };
      case 'fake':
      default:
        return {
          bg: 'bg-rose-950/40 border-rose-500/40 shadow-rose-500/10',
          badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
          icon: <ShieldAlert className="w-8 h-8 text-rose-400" />,
          accentText: 'text-rose-400',
          scoreBar: 'bg-gradient-to-r from-rose-500 to-red-600',
        };
    }
  };

  const theme = getTheme();

  return (
    <div className={`border rounded-2xl p-5 sm:p-7 backdrop-blur-md shadow-2xl relative overflow-hidden transition-all ${theme.bg}`}>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Icon, Title, and Summary */}
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 shrink-0">
            {theme.icon}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold font-mono uppercase tracking-wider ${theme.badgeBg}`}>
                {verdict.verdict === 'authentic' ? 'Verifikasi Valid' : verdict.verdict === 'suspicious' ? 'Peringatan Anomali' : 'Terbukti Masking'}
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {verdict.title}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {verdict.summary}
            </p>

            {/* Recommendations bullet points */}
            {verdict.recommendations.length > 0 && (
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Rekomendasi Tindakan:
                </p>
                <ul className="space-y-1">
                  {verdict.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-slate-500">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right: Score Metric & Export Action */}
        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800/80 gap-4">
          <div className="text-left lg:text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
              Skor Otentisitas
            </span>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${theme.accentText}`}>
                {verdict.score}
              </span>
              <span className="text-xs sm:text-sm text-slate-400 font-mono">/ 100</span>
            </div>

            {/* Mini Progress Bar */}
            <div className="w-36 h-2 bg-slate-900 rounded-full mt-1.5 overflow-hidden border border-slate-800">
              <div
                className={`h-full ${theme.scoreBar} transition-all duration-700 ease-out`}
                style={{ width: `${verdict.score}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-xs font-semibold text-white shadow-md transition cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ekspor Laporan Audit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
