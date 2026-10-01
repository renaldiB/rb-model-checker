import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Cpu,
  Zap,
  Maximize2,
  Database,
  Sparkles,
  Server,
  Globe,
  Activity,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'analogies' | 'technical'>('analogies');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#1c2028] border border-white/[0.1] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-[#161a22]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#4cd7f6]/10 flex items-center justify-center border border-[#4cd7f6]/20">
              <BookOpen className="w-4 h-4 text-[#4cd7f6]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#dfe2ee] font-mono">
                Panduan &amp; Metodologi Keaslian Model AI
              </h3>
              <p className="text-[11px] text-[#86948a] font-mono hidden sm:block">
                Penjelasan fitur, terminologi, dan analogi praktis untuk pengguna awam &amp; engineer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#bbcabf] hover:text-[#dfe2ee] transition p-1.5 rounded-lg hover:bg-[#262a33] cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 border-b border-white/[0.08] px-4 sm:px-6 pt-2 bg-[#12161f]">
          <button
            type="button"
            onClick={() => setActiveTab('analogies')}
            className={`pb-2.5 px-3 sm:px-4 text-xs sm:text-sm font-mono font-semibold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'analogies'
                ? 'border-[#4edea3] text-[#4edea3]'
                : 'border-transparent text-[#bbcabf] hover:text-[#dfe2ee]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#4edea3]" />
            <span>Kamus &amp; Analogi Sederhana</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#4edea3]/15 text-[#4edea3] border border-[#4edea3]/30 hidden sm:inline">
              Ramah Pemula
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('technical')}
            className={`pb-2.5 px-3 sm:px-4 text-xs sm:text-sm font-mono font-semibold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'technical'
                ? 'border-[#4cd7f6] text-[#4cd7f6]'
                : 'border-transparent text-[#bbcabf] hover:text-[#dfe2ee]'
            }`}
          >
            <Cpu className="w-4 h-4 text-[#4cd7f6]" />
            <span>Metodologi Forensik Teknis</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#4cd7f6]/15 text-[#4cd7f6] border border-[#4cd7f6]/30 hidden sm:inline">
              Detail Arsitektur
            </span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-[#dfe2ee] text-xs sm:text-sm custom-scrollbar">
          {activeTab === 'analogies' ? (
            /* TAB 1: KAMUS & ANALOGI SEDERHANA */
            <div className="space-y-4">
              {/* Concept 1: Protocol */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#0a0e16]/80 border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#4edea3] font-bold text-sm sm:text-base font-mono">
                    <Layers className="w-4 h-4" />
                    <h4>1. Protocol (Server Proxy vs Direct Client)</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/20 font-mono">
                    JALUR PENGIRIMAN
                  </span>
                </div>
                <p className="text-[#bbcabf] leading-relaxed">
                  <strong>Apa fungsinya?</strong> Memilih bagaimana data permintaan dikirim dari layar Anda menuju ke server penyedia AI.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-lg bg-[#1c2028] border border-white/[0.06] space-y-1.5">
                    <span className="text-[#4edea3] font-semibold font-mono flex items-center gap-1.5 text-xs">
                      <Globe className="w-3.5 h-3.5" />
                      Direct Client (Default Netlify)
                    </span>
                    <p className="text-[#bbcabf] text-xs leading-relaxed">
                      Panggilan dikirim langsung dari browser ke AI tanpa perantara server. Sangat ringan dan hemat biaya, namun memerlukan server AI yang mengizinkan panggilan luar (CORS).
                    </p>
                    <p className="text-[11px] text-[#dfe2ee] pt-1">
                      <em>Analogi:</em> Mengantarkan surat sendiri langsung ke rumah kantor AI. Cepat, tapi bisa dicegat satpam jika kantor punya aturan ketat.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#1c2028] border border-white/[0.06] space-y-1.5">
                    <span className="text-[#4cd7f6] font-semibold font-mono flex items-center gap-1.5 text-xs">
                      <Server className="w-3.5 h-3.5" />
                      Server Proxy (Backend Lokal)
                    </span>
                    <p className="text-[#bbcabf] text-xs leading-relaxed">
                      Panggilan dikirim lewat server backend lokal sebelum ke AI. Mampu menembus batasan browser (CORS) dan mengukur latensi jaringan secara mikrodetik murni.
                    </p>
                    <p className="text-[11px] text-[#dfe2ee] pt-1">
                      <em>Analogi:</em> Menitipkan surat ke kurir berlisensi resmi kantor pos yang memiliki akses bebas hambatan melewati satpam gerbang.
                    </p>
                  </div>
                </div>
              </div>

              {/* Concept 2: Context Stress */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#0a0e16]/80 border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#4cd7f6] font-bold text-sm sm:text-base font-mono">
                    <Maximize2 className="w-4 h-4" />
                    <h4>2. Context Stress (Daya Ingat Dokumen Panjang)</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4cd7f6]/10 text-[#4cd7f6] border border-[#4cd7f6]/20 font-mono">
                    KAPASITAS MEMORI
                  </span>
                </div>
                <p className="text-[#bbcabf] leading-relaxed">
                  <strong>Apa fungsinya?</strong> Menguji seberapa kuat ingatan model AI saat disuruh membaca puluhan ribu kata (4.000 hingga 32.000 token) dalam sekali prompt.
                </p>
                <div className="bg-[#1c2028] p-3.5 rounded-lg border border-white/[0.06] space-y-2">
                  <span className="text-emerald-400 font-medium font-mono text-xs flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400 stroke-[1.75]" />
                    Analogi Sederhana: Buku 100 Halaman &amp; Jarum Tersembunyi
                  </span>
                  <p className="text-[#bbcabf] text-xs leading-relaxed font-normal">
                    Bayangkan Anda menyuruh seorang murid membaca buku tebal 100 halaman dalam waktu 5 detik. Di halaman 82, Anda menyisipkan catatan sandi rahasia: <em>"Kunci brankas ada di dalam cangkir biru"</em>.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-[#dfe2ee] pt-1 font-normal">
                    <li>
                      <strong className="text-emerald-400 font-medium">Model AI Asli (GPU Enterprise):</strong> Otak memorinya besar, membaca seluruh 100 halaman, dan dengan cepat menjawab letak kunci brankas tersebut.
                    </li>
                    <li>
                      <strong className="text-rose-400 font-medium">Model Tiruan / Web Scraper Gratisan:</strong> Karena server web chat gratisan membatasi ukuran teks, mereka akan memotong 90 halaman secara diam-diam (<em>silent truncate</em>) atau servernya langsung mogok (<em>502 Bad Gateway</em>). Hasilnya: model gagal menjawab sandi rahasia.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Concept 3: TTFT & Jitter */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#0a0e16]/80 border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm sm:text-base font-mono">
                    <Zap className="w-4 h-4 stroke-[1.75]" />
                    <h4>3. TTFT (Time to First Token) &amp; Jitter</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    KECEPATAN RESPON
                  </span>
                </div>
                <p className="text-[#bbcabf] leading-relaxed font-normal">
                  <strong>Apa fungsinya?</strong> Mengukur waktu jeda sebelum AI mulai mengeluarkan kata pertama, dan seberapa stabil aliran ketikan yang keluar.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="bg-[#1c2028] p-3.5 rounded-lg border border-white/[0.06] space-y-1.5">
                    <span className="text-emerald-400 font-medium font-mono text-xs flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-400 stroke-[1.75]" />
                      TTFT: Pelayan Restoran
                    </span>
                    <p className="text-[#bbcabf] text-xs leading-relaxed font-normal">
                      Seberapa cepat pelayan meletakkan cangkir minuman pertama di meja Anda setelah Anda memesan. AI resmi upstream menyajikannya kilat dalam <strong>&lt; 800 ms</strong>. Jika butuh 3.000 - 5.000 ms, berarti pesanan Anda dilarikan dulu ke browser bot web chat gratisan!
                    </p>
                  </div>
                  <div className="bg-[#1c2028] p-3.5 rounded-lg border border-white/[0.06] space-y-1.5">
                    <span className="text-emerald-400 font-medium font-mono text-xs flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400 stroke-[1.75]" />
                      Jitter: Aliran Keran Air
                    </span>
                    <p className="text-[#bbcabf] text-xs leading-relaxed font-normal">
                      AI asli memuntahkan kata seperti keran air yang mengucur deras dan stabil (jitter rendah &lt; 150ms). Jika alirannya batuk-batuk atau tersendat tiap beberapa detik (jitter tinggi), berarti ada bot perantara yang menahan aliran teks.
                    </p>
                  </div>
                </div>
              </div>

              {/* Concept 4: Logprobs Fidelity */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#0a0e16]/80 border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm sm:text-base font-mono">
                    <Database className="w-4 h-4 stroke-[1.75]" />
                    <h4>4. Logprobs Fidelity (Sidik Jari Softmax GPU)</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    BUKTI MATEMATIS
                  </span>
                </div>
                <p className="text-[#bbcabf] leading-relaxed font-normal">
                  <strong>Apa fungsinya?</strong> Memeriksa apakah server AI bersedia memberikan lembar kalkulasi probabilitas angka di balik setiap kata yang ia pilih.
                </p>
                <div className="bg-[#1c2028] p-3.5 rounded-lg border border-white/[0.06] space-y-2">
                  <span className="text-emerald-400 font-medium font-mono text-xs flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400 stroke-[1.75]" />
                    Analogi Sederhana: Kertas Coretan Ujian / Rekam Medis Dokter
                  </span>
                  <p className="text-[#bbcabf] text-xs leading-relaxed font-normal">
                    Dokter spesialis asli dapat menunjukkan lembar tes laboratorium dan hitungan persentase dosis obat. Sebaliknya, dukun palsu hanya bisa memberikan kata-kata kesimpulan akhir tanpa pernah bisa memperlihatkan coretan hitungan aslinya.
                  </p>
                  <p className="text-[#86948a] text-xs leading-relaxed font-normal">
                    Server AI asli (GPU vLLM/OpenAI) mampu mengembalikan data logprobs ini secara instan. Layanan scraping web chat tidak punya akses ke chip GPU, sehingga mereka akan menolak permintaan ini (HTTP 400/500) atau mengabaikannya.
                  </p>
                </div>
              </div>

              {/* Concept 5: Tokenizer Trap */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#0a0e16]/80 border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm sm:text-base font-mono">
                    <Cpu className="w-4 h-4 stroke-[1.75]" />
                    <h4>5. Tokenizer Boundary Trap (Tes Logat / Bahasa Ibu)</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    IDENTITAS ARSITEKTUR
                  </span>
                </div>
                <p className="text-[#bbcabf] leading-relaxed font-normal">
                  <strong>Apa fungsinya?</strong> Menjebak model AI untuk membongkar identitas aslinya melalui cara ia memotong suku kata (tokenizer).
                </p>
                <div className="bg-[#1c2028] p-3.5 rounded-lg border border-white/[0.06] space-y-2">
                  <span className="text-emerald-400 font-medium font-mono text-xs flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400 stroke-[1.75]" />
                    Analogi Sederhana: Tes Bahasa Ibu Seseorang
                  </span>
                  <p className="text-[#bbcabf] text-xs leading-relaxed font-normal">
                    Seseorang mengaku lahir dan besar di pedalaman London. Namun saat diajak bicara cepat atau disodori peribahasa lokal kuno, dialek dan kosakata aslinya malah terdengar seperti orang dari negara lain.
                  </p>
                  <p className="text-[#86948a] text-xs leading-relaxed font-normal">
                    Jika sebuah provider mengklaim menjual model <code>gpt-4o</code> (yang native memakai tokenizer <code>o200k_base</code>), tetapi saat diberi prompt jebakan ia mengaku sebagai <em>Llama-3</em> atau memotong kata dengan aturan <em>Qwen</em>, maka endpoint tersebut terbukti melakukan penipuan (spoofing/masking).
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: METODOLOGI FORENSIK TEKNIS */
            <div className="space-y-4">
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
                  Aplikasi ini menginjeksi kode rahasia unik (jarum) pada kedalaman ~82% dokumen. Jika reverse-proxy memotong (<em>silent truncate</em>) context atau server melempar HTTP 502/504 Bad Gateway, model akan gagal menjawab nilai kode rahasia tersebut.
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
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#161a22] border-t border-white/[0.08] flex items-center justify-between">
          <span className="text-[11px] text-[#86948a] font-mono hidden sm:inline">
            Tips: Gunakan tombol <HelpCircle className="w-3 h-3 inline text-[#4cd7f6] mb-0.5" /> di form konfigurasi untuk bantuan kilat
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#262a33] hover:bg-[#31353e] text-[#dfe2ee] font-mono text-xs font-semibold transition cursor-pointer border border-white/[0.08] ml-auto"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
