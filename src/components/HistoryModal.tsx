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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111726] border border-slate-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Riwayat Pengujian Audit Endpoint</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs sm:text-sm">
              Belum ada riwayat pengujian yang tersimpan. Jalankan audit pertama Anda!
            </div>
          ) : (
            history.map((item) => {
              const isAuthentic = item.verdict.verdict === 'authentic';
              const isSuspicious = item.verdict.verdict === 'suspicious';

              return (
                <div
                  key={item.id}
                  className="bg-[#0b0f17] border border-slate-800/80 hover:border-slate-700 rounded-xl p-3.5 sm:p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-xs sm:text-sm">
                        {item.config.model}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        ({new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono truncate max-w-md">
                      {item.config.baseUrl}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      {isAuthentic ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold font-mono">
                          <CheckCircle2 className="w-3 h-3" /> NATIVE ASLI
                        </span>
                      ) : isSuspicious ? (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold font-mono">
                          <AlertTriangle className="w-3 h-3" /> MENCURIGAKAN
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-rose-400 font-semibold font-mono">
                          <XCircle className="w-3 h-3" /> MASKING / PALSU
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Skor:</span>
                      <span
                        className={`text-lg font-mono font-bold ${
                          isAuthentic ? 'text-emerald-400' : isSuspicious ? 'text-amber-400' : 'text-rose-400'
                        }`}
                      >
                        {item.verdict.score}/100
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onSelect(item);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 hover:text-white transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Lihat</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0d121f] border-t border-slate-800 flex items-center justify-between">
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Riwayat</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
