import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Play, Server, Globe, Key, Copy, Check, Radar, Layers, HelpCircle, X, BookOpen } from 'lucide-react';
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

export const EndpointConfigCard: React.FC<EndpointConfigProps> = ({
  config,
  onChange,
  onRunAll,
  isRunning,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<'context' | 'protocol' | null>(null);

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
    <section className="bg-[#1c2028]/60 backdrop-blur-xl rounded-xl border border-white/[0.08] p-5 sm:p-7 shadow-xl relative overflow-hidden space-y-6">
      {/* Decorative ambient aura */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#4cd7f6]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Target Route Presets Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#4cd7f6]/10 flex items-center justify-center border border-[#4cd7f6]/20">
            <Layers className="w-4 h-4 text-[#4cd7f6]" />
          </div>
          <span className="font-mono text-xs sm:text-sm uppercase tracking-wider font-semibold text-[#dfe2ee]">
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
                className={`px-3.5 py-1.5 rounded-full font-mono text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#4cd7f6]/15 border border-[#4cd7f6]/40 text-[#4cd7f6] shadow-[0_0_12px_rgba(6,182,212,0.25)] font-semibold'
                    : 'border border-white/[0.08] text-[#bbcabf] hover:text-[#dfe2ee] hover:bg-[#262a33]'
                }`}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-Column Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Base URL */}
        <div className="md:col-span-5 flex flex-col gap-1.5">
          <label className="flex items-center justify-between font-mono text-xs text-[#bbcabf]">
            <span className="font-semibold uppercase tracking-wider">ENDPOINT BASE URL</span>
            <span className="text-[#4cd7f6] text-[10px] px-2 py-0.5 rounded-full bg-[#4cd7f6]/10 border border-[#4cd7f6]/20 font-mono">
              OPENAI COMPATIBLE
            </span>
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={config.baseUrl}
              onChange={(e) => onChange({ ...config, baseUrl: e.target.value })}
              placeholder="https://api.xyz.com/v1"
              className="w-full bg-[#0a0e16]/90 border border-white/[0.1] rounded-xl px-4 py-2.5 text-[#dfe2ee] font-mono text-xs focus:border-[#4cd7f6] focus:ring-1 focus:ring-[#4cd7f6]/50 outline-none transition-all pr-12"
            />
            <button
              type="button"
              onClick={handleCopyUrl}
              className="absolute right-2.5 p-1.5 rounded-lg hover:bg-[#262a33] text-[#bbcabf] hover:text-[#4cd7f6] transition cursor-pointer"
              title="Salin URL"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-[#4edea3]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* API Key */}
        <div className="md:col-span-4 flex flex-col gap-1.5">
          <label className="flex items-center justify-between font-mono text-xs text-[#bbcabf]">
            <span className="flex items-center gap-1 font-semibold uppercase tracking-wider">
              <Key className="w-3 h-3 text-[#86948a]" />
              BEARER TOKEN / API KEY
            </span>
            <span className="text-[#4edea3] text-[10px] px-2 py-0.5 rounded-full bg-[#4edea3]/10 border border-[#4edea3]/20 font-mono">
              DISIMPAN LOKAL
            </span>
          </label>
          <div className="relative flex items-center">
            <input
              type={showKey ? 'text' : 'password'}
              value={config.apiKey}
              onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full bg-[#0a0e16]/90 border border-white/[0.1] rounded-xl px-4 py-2.5 text-[#dfe2ee] font-mono text-xs focus:border-[#4cd7f6] focus:ring-1 focus:ring-[#4cd7f6]/50 outline-none transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 text-[#bbcabf] hover:text-[#dfe2ee] transition p-1.5 rounded-lg hover:bg-[#262a33] cursor-pointer"
              title={showKey ? 'Sembunyikan' : 'Tampilkan'}
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Model Identifier */}
        <div className="md:col-span-3 flex flex-col gap-1.5">
          <label className="flex items-center justify-between font-mono text-xs text-[#bbcabf]">
            <span className="font-semibold uppercase tracking-wider">MODEL IDENTIFIER</span>
            <span className="text-[10px] text-[#bbcabf]">PARAM TAG</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={config.model}
              onChange={(e) => onChange({ ...config, model: e.target.value })}
              placeholder="misal: gpt-4o, deepseek-chat"
              className="w-full bg-[#0a0e16]/90 border border-white/[0.1] rounded-xl px-4 py-2.5 text-[#dfe2ee] font-mono text-xs focus:border-[#4cd7f6] focus:ring-1 focus:ring-[#4cd7f6]/50 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Secondary Controls & Run Trigger Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pt-2 border-t border-white/[0.06]">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Context Stress Segmented Toggle */}
          <div className="relative flex items-center gap-2 font-mono text-xs tooltip-container">
            <div className="flex items-center gap-1">
              <span className="text-[#bbcabf] uppercase tracking-wider font-semibold text-[11px]">
                Context Stress:
              </span>
              <button
                type="button"
                onClick={() => setActiveTooltip(activeTooltip === 'context' ? null : 'context')}
                className={`p-1 rounded-md transition cursor-pointer ${
                  activeTooltip === 'context' ? 'text-[#4cd7f6] bg-[#4cd7f6]/10' : 'text-[#86948a] hover:text-[#4cd7f6]'
                }`}
                title="Penjelasan & Analogi Context Stress"
                aria-label="Info Context Stress"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Context Stress Popover */}
            {activeTooltip === 'context' && (
              <div className="absolute bottom-full mb-2.5 left-0 sm:left-auto w-72 sm:w-84 p-4 rounded-xl bg-[#0a0e16]/95 border border-[#4cd7f6]/30 shadow-2xl backdrop-blur-xl z-40 font-sans text-xs space-y-2.5 animate-fade-in text-[#dfe2ee]">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5">
                  <span className="font-bold font-mono text-[#4cd7f6] text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" />
                    Apa Itu Context Stress?
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTooltip(null)}
                    className="text-[#86948a] hover:text-[#dfe2ee] p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[#bbcabf] text-[11px] leading-relaxed">
                  <strong>Fungsi:</strong> Menguji daya tahan memori AI saat disodori puluhan ribu kata sekaligus (4k hingga 32k token).
                </p>
                <div className="bg-[#1c2028] p-2.5 rounded-lg border border-white/[0.06] text-[11px] text-[#dfe2ee] space-y-1">
                  <span className="text-[#4edea3] font-semibold font-mono block">💡 Analogi Sederhana:</span>
                  <p className="text-[#bbcabf] leading-relaxed">
                    Seperti menyuruh murid membaca buku tebal 100 halaman, lalu diselipkan 1 kalimat sandi rahasia di halaman 82. AI resmi berotak GPU sanggup mengingat dan menjawabnya. Akun tiruan (bot scraper chat gratisan) otaknya akan "kram", memotong teks secara diam-diam (*silent truncate*), atau langsung error 502.
                  </p>
                </div>
                <div className="text-[10px] text-[#86948a] font-mono">
                  💡 <em>Rekomendasi:</em> Pilih <strong>8k</strong> untuk tes cepat, atau <strong>16k-32k</strong> untuk uji ketahanan batas GPU.
                </div>
              </div>
            )}

            <div className="flex items-center rounded-xl bg-[#0a0e16]/90 p-1 border border-white/[0.08] gap-1">
              {[4000, 8000, 16000, 32000].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onChange({ ...config, contextSize: size })}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                    config.contextSize === size
                      ? 'bg-[#4cd7f6]/20 text-[#4cd7f6] border border-[#4cd7f6]/40 font-semibold shadow-sm'
                      : 'text-[#bbcabf] hover:text-[#dfe2ee]'
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
              <span className="text-[#bbcabf] uppercase tracking-wider font-semibold text-[11px]">
                Protocol:
              </span>
              <button
                type="button"
                onClick={() => setActiveTooltip(activeTooltip === 'protocol' ? null : 'protocol')}
                className={`p-1 rounded-md transition cursor-pointer ${
                  activeTooltip === 'protocol' ? 'text-[#4cd7f6] bg-[#4cd7f6]/10' : 'text-[#86948a] hover:text-[#4cd7f6]'
                }`}
                title="Penjelasan & Analogi Protocol"
                aria-label="Info Protocol"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Protocol Popover */}
            {activeTooltip === 'protocol' && (
              <div className="absolute bottom-full mb-2.5 right-0 sm:left-0 sm:right-auto w-72 sm:w-84 p-4 rounded-xl bg-[#0a0e16]/95 border border-[#4cd7f6]/30 shadow-2xl backdrop-blur-xl z-40 font-sans text-xs space-y-2.5 animate-fade-in text-[#dfe2ee]">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5">
                  <span className="font-bold font-mono text-[#4cd7f6] text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" />
                    Apa Itu Protocol?
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTooltip(null)}
                    className="text-[#86948a] hover:text-[#dfe2ee] p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1.5 text-[11px] text-[#bbcabf]">
                  <p>
                    <strong className="text-[#4edea3]">Direct Client:</strong> Browser Anda memanggil API secara langsung tanpa server perantara. Mode ini wajib jika dideploy di web hosting statis seperti Netlify.
                  </p>
                  <p>
                    <strong className="text-[#4cd7f6]">Server Proxy:</strong> Request dikirim lewat server backend lokal. Berfungsi menembus batasan CORS browser dan mengukur latensi jaringan murni.
                  </p>
                </div>
                <div className="bg-[#1c2028] p-2.5 rounded-lg border border-white/[0.06] text-[11px] text-[#dfe2ee] space-y-1">
                  <span className="text-[#4edea3] font-semibold font-mono block">💡 Analogi Sederhana:</span>
                  <p className="text-[#bbcabf] leading-relaxed">
                    <strong>Direct Client</strong> = Seperti Anda mengantar surat sendiri langsung ke rumah kantor AI (bisa dicegat satpam/CORS jika mereka menolak pengunjung luar).<br />
                    <strong>Server Proxy</strong> = Menitipkan surat ke kurir berlisensi khusus yang punya akses resmi tanpa dicegat satpam.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center rounded-xl bg-[#0a0e16]/90 p-1 border border-white/[0.08] gap-1">
              <button
                type="button"
                onClick={() => onChange({ ...config, proxyMode: 'server' })}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                  config.proxyMode === 'server'
                    ? 'bg-[#262a33] text-[#4cd7f6] border border-[#4cd7f6]/40 font-semibold shadow-sm'
                    : 'text-[#bbcabf] hover:text-[#dfe2ee]'
                }`}
                title="Bypass CORS dan catat TTFT mikrodetik"
              >
                <Server className="w-3 h-3 text-[#4cd7f6]" />
                <span>Server Proxy</span>
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...config, proxyMode: 'browser' })}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                  config.proxyMode === 'browser'
                    ? 'bg-[#262a33] text-[#4edea3] border border-[#4edea3]/40 font-semibold shadow-sm'
                    : 'text-[#bbcabf] hover:text-[#dfe2ee]'
                }`}
                title="Langsung memanggil dari browser pengunjung (cocok untuk Netlify)"
              >
                <Globe className="w-3 h-3 text-[#4edea3]" />
                <span>Direct Client</span>
              </button>
            </div>
          </div>
        </div>

        {/* High-impact Glowing Trigger Button */}
        <div>
          <button
            type="button"
            onClick={onRunAll}
            disabled={isRunning || !config.baseUrl || !config.model}
            className={`w-full sm:w-auto relative group overflow-hidden px-8 py-3 rounded-xl font-bold font-mono text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer ${
              isRunning
                ? 'bg-[#262a33] text-[#bbcabf] cursor-not-allowed border border-white/10'
                : 'bg-gradient-to-r from-[#4edea3] to-[#4cd7f6] text-[#003824] shadow-[0_0_24px_rgba(78,222,163,0.35)] hover:shadow-[0_0_36px_rgba(78,222,163,0.55)] active:scale-[0.99]'
            }`}
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-[#4cd7f6] border-t-transparent rounded-full animate-spin" />
                <span>VERIFYING SENSORS...</span>
              </>
            ) : (
              <>
                <Radar className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500 text-[#003824]" />
                <span className="tracking-wide">RUN FORENSIC AUDIT</span>
                <kbd className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-black/25 text-[10px] text-[#003824] font-mono border border-black/20 font-medium">
                  ⌘ Enter
                </kbd>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
