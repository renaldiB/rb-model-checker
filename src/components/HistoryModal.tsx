import React from 'react';
import { X, History, Trash2, ArrowUpRight, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { OverallVerdict, EndpointConfig, TestResult } from '../types';

export interface HistoryItem {
  id: string;
  timestamp: number;
  config: EndpointConfig;
  verdict: OverallVerdict;
  results: TestResult[];
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onClear,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-emerald-400 stroke-[1.75]" />
            <h3 className="text-base font-semibold text-slate-100 font-mono">Riwayat Audit Endpoint</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition p-1 cursor-pointer rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 font-mono">
          {history.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center">
                <History className="w-6 h-6 text-slate-400 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-200">Belum Ada Riwayat Sesi</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Jalankan audit pertama Anda pada panel utama untuk menyimpan jejak telemetri dan skor otentisitas.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-semibold active:scale-[0.98] transition cursor-pointer"
              >
                Mulai Pengujian Sekarang
              </button>
            </div>
          ) : (
            history.map((item) => {
              const isAuthentic = item.verdict.verdict === 'authentic';
              const isSuspicious = item.verdict.verdict === 'suspicious';

              return (
                <div
                  key={item.id}
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 sm:p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-slate-100 text-xs sm:text-sm">
                        {item.config.model || 'Unknown Model'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        ({new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono truncate max-w-md">
                      {item.config.baseUrl || 'No URL'}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      {isAuthentic ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold font-mono">
                          <CheckCircle2 className="w-3 h-3 stroke-[1.75]" /> VERIFIED NATIVE
                        </span>
                      ) : item.verdict.verdict === 'invalid_config' ? (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold font-mono">
                          <AlertTriangle className="w-3 h-3 stroke-[1.75]" /> CONFIG ERROR
                        </span>
                      ) : isSuspicious ? (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold font-mono">
                          <AlertTriangle className="w-3 h-3 stroke-[1.75]" /> ANOMALY DETECTED
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-rose-400 font-semibold font-mono">
                          <XCircle className="w-3 h-3 stroke-[1.75]" /> MASKED / SCRAPER
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block font-normal">Score:</span>
                      <span
                        className={`text-lg font-mono font-bold ${
                          isAuthentic ? 'text-emerald-400' : isSuspicious ? 'text-amber-400' : 'text-rose-400'
                        }`}
                      >
                        {item.verdict.score}/100
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onSelect(item);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-medium text-slate-200 transition flex items-center gap-1 cursor-pointer border border-slate-700 active:scale-[0.98]"
                    >
                      <span>Muat</span>
                      <ArrowUpRight className="w-3 h-3 text-emerald-400 stroke-[1.75]" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          {history.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition cursor-pointer font-mono active:scale-[0.98]"
            >
              <Trash2 className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Bersihkan Riwayat</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold font-mono transition cursor-pointer border border-slate-700 active:scale-[0.98]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
