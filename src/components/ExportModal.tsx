import React, { useState } from 'react';
import { X, Copy, Download, Check, FileText, Code } from 'lucide-react';
import { EndpointConfig, OverallVerdict, TestResult } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: EndpointConfig;
  verdict: OverallVerdict;
  results: TestResult[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  config,
  verdict,
  results,
}) => {
  const [tab, setTab] = useState<'markdown' | 'json'>('markdown');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateMarkdown = () => {
    const timestamp = new Date().toLocaleString('id-ID');
    let md = `# LAPORAN AUDIT KEASLIAN MODEL AI (MODEL LEGIT CHECK)\n\n`;
    md += `**Waktu Audit:** ${timestamp}\n`;
    md += `**Target Base URL:** \`${config.baseUrl}\`\n`;
    md += `**Model Terklaim:** \`${config.model}\`\n`;
    md += `**Skor Otentisitas:** **${verdict.score} / 100**\n`;
    md += `**Status Hasil:** ${verdict.title}\n\n`;

    md += `### Ringkasan Eksekutif\n`;
    md += `${verdict.summary}\n\n`;

    if (verdict.recommendations.length > 0) {
      md += `### Rekomendasi Tindakan\n`;
      verdict.recommendations.forEach((r) => {
        md += `- ${r}\n`;
      });
      md += `\n`;
    }

    md += `### Rincian Hasil Pengujian\n\n`;
    results.forEach((r, idx) => {
      md += `#### ${idx + 1}. ${r.name} (${r.score}/100 - Status: ${r.status.toUpperCase()})\n`;
      md += `- **Deskripsi:** ${r.shortDesc}\n`;
      if (r.ttftMs) md += `- **TTFT:** ${r.ttftMs} ms\n`;
      if (r.tokensPerSec) md += `- **Kecepatan:** ${r.tokensPerSec} tokens/detik\n`;
      if (r.jitterMs) md += `- **Jitter Streaming:** ±${r.jitterMs} ms\n`;

      if (r.anomalies && r.anomalies.length > 0) {
        md += `- **Temuan Anomali:**\n`;
        r.anomalies.forEach((a) => (md += `  - ⚠️ ${a}\n`));
      }

      if (r.details && r.details.length > 0) {
        md += `- **Poin Verifikasi:**\n`;
        r.details.forEach((d) => (md += `  - ✓ ${d}\n`));
      }

      md += `- **Analisis Teknis:** ${r.technicalExplanation}\n\n`;
    });

    md += `---\n*Diaudit menggunakan Model Legit Check Web Application.*`;
    return md;
  };

  const generateJson = () => {
    return JSON.stringify(
      {
        auditDate: new Date().toISOString(),
        config: {
          baseUrl: config.baseUrl,
          model: config.model,
          proxyMode: config.proxyMode,
          contextSize: config.contextSize,
        },
        verdict,
        results,
      },
      null,
      2
    );
  };

  const exportText = tab === 'markdown' ? generateMarkdown() : generateJson();

  const handleCopy = () => {
    navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `audit-${config.model}-${Date.now()}.${tab === 'markdown' ? 'md' : 'json'}`;
    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400 stroke-[1.75]" />
            <h3 className="text-base font-semibold text-slate-100 font-mono">Ekspor Laporan Audit Keaslian Model</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition p-1 cursor-pointer rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-5 pt-4 bg-slate-950 border-b border-slate-800">
          <button
            type="button"
            onClick={() => setTab('markdown')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold font-mono border-b-2 transition cursor-pointer active:scale-[0.98] ${
              tab === 'markdown'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 stroke-[1.75]" />
            <span>Format Markdown (.md)</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('json')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold font-mono border-b-2 transition cursor-pointer active:scale-[0.98] ${
              tab === 'json'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4 stroke-[1.75]" />
            <span>Format JSON Raw (.json)</span>
          </button>
        </div>

        {/* Content Viewer */}
        <div className="p-4 overflow-y-auto flex-1 bg-slate-950 font-mono text-xs text-slate-300">
          <pre className="whitespace-pre-wrap select-all">{exportText}</pre>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-950 border-t border-slate-800">
          <span className="text-xs text-slate-400 font-mono">
            Dapat langsung dilampirkan ke tiket komplain support atau GitHub.
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold font-mono transition cursor-pointer border border-slate-700 active:scale-[0.98]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[1.75]" /> : <Copy className="w-3.5 h-3.5 stroke-[1.75]" />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold font-mono transition active:scale-[0.98] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Unduh File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
