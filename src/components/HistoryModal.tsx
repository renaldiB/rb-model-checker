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
      <div className="bg-[#1c2028] border border-white/[0.1] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-[#4cd7f6]" />
            <h3 className="text-base font-bold text-[#dfe2ee] font-mono">Riwayat Audit Endpoint</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#bbcabf] hover:text-[#dfe2ee] transition p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 font-mono">
          {history.length === 0 ? (
            <div className="text-center py-12 text-[#86948a] text-xs sm:text-sm">
              Belum ada riwayat pengujian tersimpan. Jalankan audit pertama Anda!
            </div>
          ) : (
            history.map((item) => {
              const isAuthentic = item.verdict.verdict === 'authentic';
              const isSuspicious = item.verdict.verdict === 'suspicious';

              return (
                <div
                  key={item.id}
                  className="bg-[#0a0e16] border border-white/[0.06] hover:border-[#4cd7f6]/40 rounded-xl p-3.5 sm:p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#dfe2ee] text-xs sm:text-sm">
                        {item.config.model || 'Unknown Model'}
                      </span>
                      <span className="text-[11px] text-[#86948a] font-mono">
                        ({new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    </div>
                    <p className="text-xs text-[#bbcabf] font-mono truncate max-w-md">
                      {item.config.baseUrl || 'No URL'}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      {isAuthentic ? (
                        <span className="flex items-center gap-1 text-[10px] text-[#4edea3] font-semibold font-mono">
                          <CheckCircle2 className="w-3 h-3" /> VERIFIED NATIVE
                        </span>
                      ) : isSuspicious ? (
                        <span className="flex items-center gap-1 text-[10px] text-[#f59e0b] font-semibold font-mono">
                          <AlertTriangle className="w-3 h-3" /> ANOMALY DETECTED
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-[#f43f5e] font-semibold font-mono">
                          <XCircle className="w-3 h-3" /> MASKED / SCRAPER
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-xs text-[#86948a] block">Score:</span>
                      <span
                        className={`text-lg font-mono font-bold ${
                          isAuthentic ? 'text-[#4edea3]' : isSuspicious ? 'text-[#f59e0b]' : 'text-[#f43f5e]'
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
                      className="px-3 py-1.5 rounded-lg bg-[#262a33] hover:bg-[#31353e] text-xs font-medium text-[#dfe2ee] transition flex items-center gap-1 cursor-pointer border border-white/[0.08]"
                    >
                      <span>Muat</span>
                      <ArrowUpRight className="w-3 h-3 text-[#4cd7f6]" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#181c24] border-t border-white/[0.08] flex items-center justify-between">
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 text-xs text-[#f43f5e] hover:text-[#ffb4ab] transition cursor-pointer font-mono"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Riwayat</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 rounded-xl bg-[#262a33] hover:bg-[#31353e] text-[#dfe2ee] text-xs font-semibold font-mono transition cursor-pointer border border-white/[0.08]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
