import React from 'react';
import { X, BookOpen, Cpu, Zap, Maximize2, Database } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-[#1c2028] border border-white/[0.1] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#4cd7f6]" />
            <h3 className="text-base font-bold text-[#dfe2ee] font-mono">
              Metodologi Pengujian Teknis Keaslian Model AI
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#bbcabf] hover:text-[#dfe2ee] transition p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-[#dfe2ee] text-xs sm:text-sm">
          {/* Method 1 */}
          <div className="p-4 rounded-xl bg-[#0a0e16]/80 border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2 text-[#4edea3] font-bold text-sm sm:text-base font-mono">
              <Cpu className="w-4 h-4" />
              <h4>1. Uji Tokenizer &amp; Knowledge Boundary (Prompt Jebakan)</h4>
            </div>
            <p className="text-[#bbcabf] leading-relaxed">
              <strong>Prinsip:</strong> Setiap keluarga model LLM (OpenAI GPT, DeepSeek, Meta Llama, Alibaba Qwen) dilatih menggunakan tokenizer dan vocabulary spesifik yang tertanam dalam arsitektur bobotnya (embedding layer).
            </p>
            <div className="bg-[#0f131c] p-3 rounded-lg font-mono text-xs text-[#4cd7f6] border border-white/[0.08]">
              "Tuliskan tokenizer yang kamu gunakan secara native dan jelaskan perbedaan struktur byte-fallback antara cl100k_base dengan tokenizer milikmu."
            </div>
            <p className="text-[#86948a] leading-relaxed">
              <strong>Indikator Masking:</strong> Jika endpoint diklaim sebagai <code className="text-[#4edea3]">gpt-4o</code> (yang native menggunakan <code>o200k_base</code>) atau <code className="text-[#4edea3]">deepseek-chat</code>, namun dalam jawabannya membocorkan identitas sebagai <em>Llama-3</em> atau <em>Qwen</em>, atau gagal mengidentifikasi byte-fallback native miliknya, maka endpoint tersebut dipastikan di-masking.
            </p>
          </div>

          {/* Method 2 */}
          <div className="p-4 rounded-xl bg-[#0a0e16]/80 border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2 text-[#4cd7f6] font-bold text-sm sm:text-base font-mono">
              <Zap className="w-4 h-4" />
              <h4>2. Cek Latency &amp; TTFT (Time to First Token)</h4>
            </div>
            <p className="text-[#bbcabf] leading-relaxed">
              <strong>Prinsip:</strong> API resmi upstream (OpenAI, DeepSeek, Anthropic) menyajikan output melalui streaming Server-Sent Events (SSE) langsung dari GPU inference engine (vLLM / TensorRT-LLM) dengan TTFT ultra-cepat.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 font-mono">
              <div className="p-3 rounded-lg bg-[#4edea3]/10 border border-[#4edea3]/30 text-xs text-[#dfe2ee]">
                <span className="font-bold text-[#4edea3] block mb-0.5">API Resmi Upstream:</span>
                TTFT &lt; 800 ms. Aliran token mulus dengan jitter rendah (&lt; 150ms). Tidak ada jeda antrean browser.
              </div>
              <div className="p-3 rounded-lg bg-[#f43f5e]/10 border border-[#f43f5e]/30 text-xs text-[#dfe2ee]">
                <span className="font-bold text-[#f43f5e] block mb-0.5">Layanan Masking (Web Scraper):</span>
                TTFT lambat (2.000 - 5.000 ms+). Terhambat inisialisasi browser headless, Cloudflare Turnstile, dan sering memicu HTTP 429 acak.
              </div>
            </div>
          </div>

          {/* Method 3 */}
          <div className="p-4 rounded-xl bg-[#0a0e16]/80 border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2 text-[#4edea3] font-bold text-sm sm:text-base font-mono">
              <Maximize2 className="w-4 h-4" />
              <h4>3. Stress Test Context Window (Needle in a Haystack)</h4>
            </div>
            <p className="text-[#bbcabf] leading-relaxed">
              <strong>Prinsip:</strong> Model native API mampu membaca 8.000 hingga 32.000+ token tanpa crash. Sebaliknya, layanan reverse-proxy dari chat web gratisan memiliki batas payload ketat (biasanya &lt; 4.000 - 8.000 token).
            </p>
            <p className="text-[#86948a] leading-relaxed">
              Aplikasi ini menginjeksi kode rahasia unik (jarum) pada kedalaman ~82% dokumen. Jika reverse-proxy memotong (*silent truncate*) context atau server melempar HTTP 502/504 Bad Gateway, model akan gagal menjawab nilai kode rahasia tersebut.
            </p>
          </div>

          {/* Method 4 */}
          <div className="p-4 rounded-xl bg-[#0a0e16]/80 border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2 text-[#4cd7f6] font-bold text-sm sm:text-base font-mono">
              <Database className="w-4 h-4" />
              <h4>4. Uji Logprobs Fidelity (Smoking Gun)</h4>
            </div>
            <p className="text-[#bbcabf] leading-relaxed">
              <strong>Prinsip:</strong> Fitur <code>logprobs: true</code> mengembalikan nilai probabilitas logaritmik langsung dari lapisan softmax GPU. Layanan web chat scraping tidak pernah bisa menyediakan data logprobs ini, sehingga request akan ditolak (HTTP 400/500) atau field <code>logprobs</code> diabaikan secara diam-diam.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#181c24] border-t border-white/[0.08] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#262a33] hover:bg-[#31353e] text-[#dfe2ee] font-mono text-xs font-semibold transition cursor-pointer border border-white/[0.08]"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
