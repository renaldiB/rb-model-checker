import React, { useState } from 'react';
import { Eye, EyeOff, Play, ShieldAlert, Sparkles, Server, Globe, Cpu, Key, HelpCircle } from 'lucide-react';
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
    name: 'Groq Cloud',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    description: 'Ultra-fast LPU inference',
  },
  {
    name: 'Ollama Local (localhost:11434)',
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

  const handlePresetSelect = (preset: PresetProvider) => {
    setActivePreset(preset.name);
    onChange({
      ...config,
      baseUrl: preset.baseUrl,
      model: preset.defaultModel,
    });
  };

  return (
    <div className="bg-[#111726] border border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Decorative accent glow */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-emerald-500/5 rounded-full blur-3xl -z-0 pointer-events-none" />

      {/* Card Title & Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800/60">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            Konfigurasi Endpoint Target
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tentukan Base URL, API Key, dan nama model yang ingin diuji keasliannya.
          </p>
        </div>

        {/* Preset quick buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 mr-1 font-medium">Preset Cepat:</span>
          {PRESETS.map((p) => {
            const isSelected = activePreset === p.name || config.baseUrl.includes(p.baseUrl);
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => handlePresetSelect(p)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer font-medium ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-800/50 text-slate-300 border-slate-700/60 hover:bg-slate-700/60 hover:text-white'
                }`}
              >
                {p.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
        {/* Base URL */}
        <div className="lg:col-span-5">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Base URL Endpoint</span>
            <span className="text-[10px] text-slate-500 font-normal font-mono">OpenAI Compatible</span>
          </label>
          <input
            type="text"
            value={config.baseUrl}
            onChange={(e) => onChange({ ...config, baseUrl: e.target.value })}
            placeholder="https://api.xyz.com/v1"
            className="w-full bg-[#0b0f17] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition"
          />
        </div>

        {/* API Key */}
        <div className="lg:col-span-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Key className="w-3 h-3 text-slate-400" />
              API Key / Bearer Token
            </span>
            <span className="text-[10px] text-emerald-400 font-normal">Disimpan Lokal Saja</span>
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={config.apiKey}
              onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full bg-[#0b0f17] border border-slate-700/80 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1 cursor-pointer"
              title={showKey ? 'Sembunyikan API key' : 'Tampilkan API key'}
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Model Name */}
        <div className="lg:col-span-3">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Model Name Target
          </label>
          <input
            type="text"
            value={config.model}
            onChange={(e) => onChange({ ...config, model: e.target.value })}
            placeholder="misal: gpt-4o, deepseek-chat"
            className="w-full bg-[#0b0f17] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition"
          />
        </div>
      </div>

      {/* Advanced Settings Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 mt-4 pt-4 border-t border-slate-800/60 items-center">
        {/* Context Stress Test Size */}
        <div className="lg:col-span-5 flex items-center gap-3">
          <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
            Stress Context Size:
          </span>
          <div className="flex items-center gap-1.5">
            {[4000, 8000, 16000, 32000].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onChange({ ...config, contextSize: size })}
                className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition cursor-pointer ${
                  config.contextSize === size
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
                    : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800 hover:text-slate-300'
                }`}
              >
                {size / 1000}k
              </button>
            ))}
          </div>
        </div>

        {/* Proxy Mode Selector */}
        <div className="lg:col-span-4 flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
            Mode Request:
          </span>
          <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={() => onChange({ ...config, proxyMode: 'server' })}
              className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                config.proxyMode === 'server'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Bypass CORS dan rekam TTFT berakurasi mikrodetik via server lokal"
            >
              <Server className="w-3 h-3" />
              <span>Server Proxy</span>
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...config, proxyMode: 'browser' })}
              className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                config.proxyMode === 'browser'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Langsung panggil dari browser via fetch (butuh endpoint ber-CORS)"
            >
              <Globe className="w-3 h-3" />
              <span>Direct Client</span>
            </button>
          </div>
        </div>

        {/* Run CTA Button */}
        <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
          <button
            type="button"
            onClick={onRunAll}
            disabled={isRunning || !config.baseUrl || !config.model}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              isRunning
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/25 active:scale-95'
            }`}
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span>Menguji Endpoint...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Jalankan Semua Uji (Audit)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
