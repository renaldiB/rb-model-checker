import React from 'react';
import { X, BookOpen, Cpu, Zap, Maximize2, ShieldCheck, Database, Layers } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111726] border border-slate-700/80 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold text-white">
              Metodologi Pengujian Teknis Keaslian Model AI
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm">
          {/* Method 1 */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm sm:text-base">
              <Cpu className="w-4 h-4" />
              <h4>1. Uji Tokenizer & Knowledge Boundary (Prompt Jebakan)</h4>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>Prinsip:</strong> Setiap keluarga model LLM (OpenAI GPT, DeepSeek, Meta Llama, Alibaba Qwen) dilatih menggunakan tokenizer dan vocabulary spesifik yang tertanam dalam arsitektur bobotnya (embedding layer).
            </p>
            <div className="bg-black/60 p-3 rounded-lg font-mono text-xs text-amber-300 border border-slate-800">
              "Tuliskan tokenizer yang kamu gunakan secara native dan jelaskan perbedaan struktur byte-fallback antara cl100k_base dengan tokenizer milikmu."
            </div>
            <p className="text-slate-400 leading-relaxed">
              <strong>Indikator Masking:</strong> Jika endpoint mengklaim sebagai <code className="text-emerald-400">gpt-4o</code> (yang native menggunakan <code>o200k_base</code>) atau <code className="text-emerald-400">deepseek-chat</code>, namun dalam jawabannya membocorkan identitas sebagai <em>Llama-3</em> atau <em>Qwen</em>, atau gagal mengidentifikasi byte-fallback native miliknya, maka endpoint tersebut dipastikan di-masking (menggunakan model murah yang dibungkus).
            </p>
          </div>

          {/* Method 2 */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm sm:text-base">
              <Zap className="w-4 h-4" />
              <h4>2. Cek Latency & TTFT (Time to First Token)</h4>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>Prinsip:</strong> API resmi upstream (OpenAI, DeepSeek, Anthropic) menyajikan output melalui streaming Server-Sent Events (SSE) langsung dari GPU inference engine (vLLM / TensorRT-LLM) dengan TTFT ultra-cepat.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs">
                <span className="font-bold text-emerald-400 block mb-0.5">API Resmi Upstream:</span>
                TTFT &lt; 800 ms. Aliran token mulus dengan jitter rendah (&lt; 150ms). Tidak ada jeda antrean web.
              </div>
              <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs">
                <span className="font-bold text-rose-400 block mb-0.5">Layanan Masking (Web Scraper):</span>
                TTFT lambat (2.000 - 5.000 ms+). Terhambat inisialisasi browser headless (Puppeteer/Playwright), Cloudflare Turnstile, dan sering memicu HTTP 429 acak.
              </div>
            </div>
          </div>

          {/* Method 3 */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm sm:text-base">
              <Maximize2 className="w-4 h-4" />
              <h4>3. Stress Test Context Window (Needle in a Haystack)</h4>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>Prinsip:</strong> Model native API mampu membaca 8.000 hingga 32.000+ token tanpa crash. Sebaliknya, layanan reverse-proxy dari chat web gratisan memiliki batas payload ketat (biasanya &lt; 4.000 - 8.000 token).
            </p>
            <p className="text-slate-400 leading-relaxed">
              Aplikasi ini menginjeksi kode rahasia unik (jarum) pada kedalaman ~82% dokumen. Jika reverse-proxy memotong (silent truncate) context atau server melempar HTTP 502/504 Bad Gateway, model akan gagal menjawab nilai kode rahasia tersebut.
            </p>
          </div>

          {/* Bonus Method 4 */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-violet-400 font-bold text-sm sm:text-base">
              <Database className="w-4 h-4" />
              <h4>4. Uji Logprobs Fidelity (Smoking Gun)</h4>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>Prinsip:</strong> Fitur <code>logprobs: true</code> mengembalikan nilai probabilitas logaritmik langsung dari lapisan softmax GPU. Layanan web chat scraping tidak pernah bisa menyediakan data logprobs ini, sehingga request akan ditolak (HTTP 400/500) atau field <code>logprobs</code> diabaikan secara diam-diam.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0d121f] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
