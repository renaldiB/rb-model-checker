import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Play, Server, Globe, Key, Copy, Check, Radar, Layers, HelpCircle, X, BookOpen, AlertTriangle, Info } from 'lucide-react';
import { EndpointConfig, PresetProvider } from '../types';

interface EndpointConfigProps {
  config: EndpointConfig;
  onChange: (newConfig: EndpointConfig) => void;
  onRunAll: () => void;
  isRunning: boolean;
}

const PRESETS: PresetProvider[] = [
  {
    name: 'OpenAI Official',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    description: 'Native upstream OpenAI API',
  },
  {
    name: 'DeepSeek Official',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    description: 'Native upstream DeepSeek API',
  },
  {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'deepseek/deepseek-chat',
    description: 'Multi-provider aggregator',
  },
  {
    name: 'Groq Cloud LPU',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    description: 'Ultra-fast LPU inference',
  },
  {
    name: 'Ollama Local:11434',
    baseUrl: 'http://localhost:11434/v1',
    defaultModel: 'llama3',
    description: 'Inference lokal mesin Anda',
  },
];

const getMissingPrefixSuggestion = (baseUrl: string, model: string): string | null => {
  if (!baseUrl.includes('openrouter.ai') || !model.trim() || model.includes('/')) return null;
  const lower = model.toLowerCase().trim();
  if (lower.startsWith('deepseek')) return `deepseek/${model.trim()}`;
  if (lower.startsWith('llama') || lower.includes('llama')) return `meta-llama/${model.trim()}`;
  if (lower.startsWith('gpt') || lower.startsWith('o1') || lower.startsWith('o3')) return `openai/${model.trim()}`;
  if (lower.startsWith('claude')) return `anthropic/${model.trim()}`;
  if (lower.startsWith('qwen')) return `qwen/${model.trim()}`;
  if (lower.startsWith('gemini')) return `google/${model.trim()}`;
  if (lower.startsWith('mistral')) return `mistralai/${model.trim()}`;
  return `vendor/${model.trim()}`;
};

export const EndpointConfigCard: React.FC<EndpointConfigProps> = ({
  config,
  onChange,
  onRunAll,
  isRunning,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<'context' | 'protocol' | 'model' | null>(null);

  // Close tooltips on outside click or Esc
  useEffect(() => {
    if (!activeTooltip) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.tooltip-container')) {
        setActiveTooltip(null);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveTooltip(null);
    };
    document.addEventListener('pointerdown', handleClickOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [activeTooltip]);

  // Hotkey Cmd+Enter / Ctrl+Enter to run audit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (!isRunning && config.baseUrl && config.model) {
          e.preventDefault();
          onRunAll();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, config.baseUrl, config.model, onRunAll]);

  const handlePresetSelect = (preset: PresetProvider) => {
    setActivePreset(preset.name);
    onChange({
      ...config,
      baseUrl: preset.baseUrl,
      model: preset.defaultModel,
    });
  };

  const handleCopyUrl = () => {
    if (!config.baseUrl) return;
    navigator.clipboard.writeText(config.baseUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-lg space-y-6">
      {/* Target Route Presets Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 text-emerald-400 stroke-[1.75]" />
          </div>
          <span className="font-mono text-xs sm:text-sm uppercase tracking-wider font-semibold text-slate-200">
            Target Route Presets
          </span>
        </div>

        {/* Preset Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((preset) => {
            const isSelected = activePreset === preset.name || (config.baseUrl && config.baseUrl.includes(preset.baseUrl));
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`px-3.5 py-1.5 rounded-full font-mono text-xs transition-all active:scale-[0.98] cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-medium'
                    : 'border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-Column Input Grid: 1 col on mobile, 2 cols on tablet, 12 cols on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Base URL */}
        <div className="md:col-span-2 lg:col-span-5 flex flex-col gap-1.5">
          <label className="flex items-center justify-between font-mono text-xs text-slate-400">
            <span className="font-normal uppercase tracking-wider">ENDPOINT BASE URL</span>
            <span className="text-emerald-400 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-mono">
              OPENAI COMPATIBLE
            </span>
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={config.baseUrl}
              onChange={(e) => onChange({ ...config, baseUrl: e.target.value })}
              placeholder="https://api.openai.com/v1"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 outline-none transition-all pr-12"
            />
            <button
              type="button"
              onClick={handleCopyUrl}
              className="absolute right-2.5 p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-emerald-400 active:scale-[0.98] transition cursor-pointer"
              title="Salin URL"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[1.75]" /> : <Copy className="w-3.5 h-3.5 stroke-[1.75]" />}
            </button>
          </div>
        </div>

        {/* API Key */}
        <div className="md:col-span-1 lg:col-span-4 flex flex-col gap-1.5">
          <label className="flex items-center justify-between font-mono text-xs text-slate-400">
            <span className="flex items-center gap-1 font-normal uppercase tracking-wider">
              <Key className="w-3 h-3 text-slate-400 stroke-[1.75]" />
              BEARER TOKEN / API KEY
            </span>
            <span className="text-slate-400 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700/80 font-mono">
              DISIMPAN LOKAL
            </span>
          </label>
          <div className="relative flex items-center">
            <input
              type={showKey ? 'text' : 'password'}
              value={config.apiKey}
              onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
              placeholder="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 outline-none transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 text-slate-400 hover:text-slate-200 transition p-1.5 rounded-lg hover:bg-slate-800 active:scale-[0.98] cursor-pointer"
              title={showKey ? 'Sembunyikan' : 'Tampilkan'}
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5 stroke-[1.75]" /> : <Eye className="w-3.5 h-3.5 stroke-[1.75]" />}
            </button>
          </div>
        </div>

        {/* Model Identifier */}
        <div className="md:col-span-1 lg:col-span-3 flex flex-col gap-1.5 relative tooltip-container">
          <label className="flex items-center justify-between font-mono text-xs text-slate-400">
            <span className="flex items-center gap-1 font-normal uppercase tracking-wider">
              MODEL IDENTIFIER
              <button
                type="button"
                onClick={() => setActiveTooltip(activeTooltip === 'model' ? null : 'model')}
                className={`p-0.5 rounded transition cursor-pointer ${
                  activeTooltip === 'model' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-emerald-400'
                }`}
                title="Panduan Format Penulisan Nama Model"
                aria-label="Info Format Model"
              >
                <HelpCircle className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${config.baseUrl.includes('openrouter.ai') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 bg-slate-800'}`}>
              {config.baseUrl.includes('openrouter.ai') ? 'VENDOR/MODEL' : 'PARAM TAG'}
            </span>
          </label>

          {/* Model Format Help Popover */}
          {activeTooltip === 'model' && (
            <div className="absolute bottom-full mb-2 right-0 sm:left-0 sm:right-auto w-[calc(100vw-3rem)] sm:w-80 max-w-sm p-4 rounded-xl bg-slate-900 border border-slate-700 shadow-xl z-40 font-sans text-xs space-y-2 animate-fade-in text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="font-semibold font-mono text-emerald-400 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 stroke-[1.75]" />
                  Format Nama Model
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTooltip(null)}
                  className="text-slate-400 hover:text-slate-200 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 stroke-[1.75]" />
                </button>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-300">
                <p>
                  <strong className="text-emerald-400 font-medium">API Resmi (OpenAI / DeepSeek / Groq):</strong><br />
                  Tulis nama model <em>tanpa garis miring</em>. Contoh: <code className="text-slate-100 bg-slate-800 px-1 py-0.5 rounded">deepseek-chat</code>, <code className="text-slate-100 bg-slate-800 px-1 py-0.5 rounded">gpt-4o</code>.
                </p>
                <p>
                  <strong className="text-emerald-400 font-medium">Aggregator (OpenRouter):</strong><br />
                  Wajib menyertakan namespace vendor dengan garis miring. Contoh: <code className="text-slate-100 bg-slate-800 px-1 py-0.5 rounded">deepseek/deepseek-chat</code>, <code className="text-slate-100 bg-slate-800 px-1 py-0.5 rounded">openai/gpt-4o</code>.
                </p>
              </div>
            </div>
          )}

          <div className="relative flex items-center">
            <input
              type="text"
              value={config.model}
              onChange={(e) => onChange({ ...config, model: e.target.value })}
              placeholder={config.baseUrl.includes('openrouter.ai') ? 'deepseek/deepseek-chat' : 'gpt-4o, deepseek-chat'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 outline-none transition-all"
            />
          </div>

          {/* Skenario 1: Prefix tidak diperlukan pada endpoint resmi */}
          {config.model.includes('/') && !config.baseUrl.includes('openrouter.ai') && (
            <button
              type="button"
              onClick={() => onChange({ ...config, model: config.model.split('/').pop() || config.model })}
              className="text-[10px] text-amber-400 hover:text-amber-300 text-left font-mono flex items-center gap-1.5 transition active:scale-[0.98] cursor-pointer pt-0.5"
              title="Klik untuk menghapus prefix vendor otomatis"
            >
              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 stroke-[1.75]" />
              <span>Prefix tidak diperlukan. Ubah jadi: <u>{config.model.split('/').pop()}</u>?</span>
            </button>
          )}

          {/* Skenario 2: Kurang prefix pada OpenRouter */}
          {config.baseUrl.includes('openrouter.ai') && !config.model.includes('/') && config.model.trim().length > 0 && (
            <button
              type="button"
              onClick={() => {
                const suggestion = getMissingPrefixSuggestion(config.baseUrl, config.model) || `vendor/${config.model.trim()}`;
                onChange({ ...config, model: suggestion });
              }}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 text-left font-mono flex items-center gap-1.5 transition active:scale-[0.98] cursor-pointer pt-0.5"
              title="Klik untuk menambahkan prefix vendor OpenRouter"
            >
              <Info className="w-3 h-3 text-emerald-400 shrink-0 stroke-[1.75]" />
              <span>
                OpenRouter butuh prefix vendor. Ubah jadi:{' '}
                <u>{getMissingPrefixSuggestion(config.baseUrl, config.model) || `vendor/${config.model.trim()}`}</u>?
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Secondary Controls & Run Trigger Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pt-2 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Context Stress Segmented Toggle */}
          <div className="relative flex items-center gap-2 font-mono text-xs tooltip-container">
            <div className="flex items-center gap-1">
              <span className="text-slate-400 uppercase tracking-wider font-normal text-[11px]">
                Context Stress:
              </span>
              <button
                type="button"
                onClick={() => setActiveTooltip(activeTooltip === 'context' ? null : 'context')}
                className={`p-1 rounded-md transition cursor-pointer ${
                  activeTooltip === 'context' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-emerald-400'
                }`}
                title="Penjelasan & Analogi Context Stress"
                aria-label="Info Context Stress"
              >
                <HelpCircle className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>
            </div>

            {/* Context Stress Popover */}
            {activeTooltip === 'context' && (
              <div className="absolute bottom-full mb-2.5 left-0 sm:left-auto w-[calc(100vw-3rem)] sm:w-84 max-w-sm p-4 rounded-xl bg-slate-900 border border-slate-700 shadow-xl z-40 font-sans text-xs space-y-2.5 animate-fade-in text-slate-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="font-semibold font-mono text-emerald-400 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 stroke-[1.75]" />
                    Apa Itu Context Stress?
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTooltip(null)}
                    className="text-slate-400 hover:text-slate-200 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 stroke-[1.75]" />
                  </button>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  <strong className="text-slate-100">Fungsi:</strong> Menguji daya tahan memori AI saat disodori puluhan ribu kata sekaligus (4k hingga 32k token).
                </p>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-200 space-y-1">
                  <span className="text-emerald-400 font-medium font-mono flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-emerald-400 stroke-[1.75]" />
                    Analogi Sederhana:
                  </span>
                  <p className="text-slate-400 leading-relaxed">
                    Seperti menyuruh murid membaca buku tebal 100 halaman, lalu diselipkan 1 kalimat sandi rahasia di halaman 82. AI resmi berotak GPU sanggup mengingat dan menjawabnya. Akun tiruan (bot scraper chat gratisan) otaknya akan "kram", memotong teks secara diam-diam (*silent truncate*), atau langsung error 502.
                  </p>
                </div>
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Info className="w-3 h-3 text-emerald-400 stroke-[1.75]" />
                  <span><em>Rekomendasi:</em> Pilih <strong>8k</strong> untuk tes cepat, atau <strong>16k-32k</strong> untuk uji ketahanan batas GPU.</span>
                </div>
              </div>
            )}

            <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800 gap-1">
              {[4000, 8000, 16000, 32000].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onChange({ ...config, contextSize: size })}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition active:scale-[0.98] cursor-pointer ${
                    config.contextSize === size
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {size / 1000}k
                </button>
              ))}
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="relative flex items-center gap-2 font-mono text-xs tooltip-container">
            <div className="flex items-center gap-1">
              <span className="text-slate-400 uppercase tracking-wider font-normal text-[11px]">
                Protocol:
              </span>
              <button
                type="button"
                onClick={() => setActiveTooltip(activeTooltip === 'protocol' ? null : 'protocol')}
                className={`p-1 rounded-md transition cursor-pointer ${
                  activeTooltip === 'protocol' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-emerald-400'
                }`}
                title="Penjelasan & Analogi Protocol"
                aria-label="Info Protocol"
              >
                <HelpCircle className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>
            </div>

            {/* Protocol Popover */}
            {activeTooltip === 'protocol' && (
              <div className="absolute bottom-full mb-2.5 right-0 sm:left-0 sm:right-auto w-[calc(100vw-3rem)] sm:w-84 max-w-sm p-4 rounded-xl bg-slate-900 border border-slate-700 shadow-xl z-40 font-sans text-xs space-y-2.5 animate-fade-in text-slate-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="font-semibold font-mono text-emerald-400 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 stroke-[1.75]" />
                    Apa Itu Protocol?
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTooltip(null)}
                    className="text-slate-400 hover:text-slate-200 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 stroke-[1.75]" />
                  </button>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <p>
                    <strong className="text-emerald-400 font-medium">Direct Client:</strong> Browser Anda memanggil API secara langsung tanpa server perantara. Mode ini wajib jika dideploy di web hosting statis seperti Netlify.
                  </p>
                  <p>
                    <strong className="text-emerald-400 font-medium">Server Proxy:</strong> Request dikirim lewat server backend lokal. Berfungsi menembus batasan CORS browser dan mengukur latensi jaringan murni.
                  </p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-200 space-y-1">
                  <span className="text-emerald-400 font-medium font-mono flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-emerald-400 stroke-[1.75]" />
                    Analogi Sederhana:
                  </span>
                  <p className="text-slate-400 leading-relaxed">
                    <strong>Direct Client</strong> = Seperti Anda mengantar surat sendiri langsung ke rumah kantor AI (bisa dicegat satpam/CORS jika mereka menolak pengunjung luar).<br />
                    <strong>Server Proxy</strong> = Menitipkan surat ke kurir berlisensi khusus yang punya akses resmi tanpa dicegat satpam.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800 gap-1">
              <button
                type="button"
                onClick={() => onChange({ ...config, proxyMode: 'server' })}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition active:scale-[0.98] cursor-pointer ${
                  config.proxyMode === 'server'
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Bypass CORS dan catat TTFT mikrodetik"
              >
                <Server className="w-3 h-3 text-emerald-400 stroke-[1.75]" />
                <span>Server Proxy</span>
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...config, proxyMode: 'browser' })}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition active:scale-[0.98] cursor-pointer ${
                  config.proxyMode === 'browser'
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Langsung memanggil dari browser pengunjung (cocok untuk Netlify)"
              >
                <Globe className="w-3 h-3 text-emerald-400 stroke-[1.75]" />
                <span>Direct Client</span>
              </button>
            </div>
          </div>
        </div>

        {/* High-impact Solid Primary Accent Button */}
        <div>
          <button
            type="button"
            onClick={onRunAll}
            disabled={isRunning || !config.baseUrl || !config.model}
            className={`w-full sm:w-auto relative group overflow-hidden px-8 py-3 rounded-xl font-semibold font-mono text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all duration-150 cursor-pointer active:scale-[0.98] ${
              isRunning
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm'
            }`}
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span>VERIFYING SENSORS...</span>
              </>
            ) : (
              <>
                <Radar className="w-4 h-4 text-slate-950 stroke-[1.75]" />
                <span className="tracking-wide">RUN FORENSIC AUDIT</span>
                <kbd className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-slate-950/20 text-[10px] text-slate-950 font-mono border border-slate-950/20 font-medium">
                  ⌘ Enter
                </kbd>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Token Quota / Balance Warning Banner */}
      <div className="flex items-start sm:items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-mono">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0 text-amber-400 stroke-[1.75]" />
        <div className="flex-1 leading-relaxed text-[11px] text-slate-300">
          <strong className="text-amber-400 uppercase tracking-wide mr-1.5 font-semibold">
            Perhatian: Penggunaan Kuota &amp; Saldo Token:
          </strong>
          Tindakan ini mengirimkan request uji nyata ke server AI Anda (termasuk injeksi{' '}
          <strong className="text-emerald-400 font-medium">{config.contextSize / 1000}k token</strong> pada stress test context window).{' '}
          Tindakan ini <strong className="text-amber-400 font-semibold">akan memotong kuota token / saldo billing aktif</strong> pada API Key yang Anda pasang.
        </div>
      </div>
    </section>
  );
};
