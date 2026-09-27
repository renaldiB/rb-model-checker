import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { EndpointConfigCard } from './components/EndpointConfig';
import { VerdictBadge } from './components/VerdictBadge';
import { TestResultCard } from './components/TestResultCard';
import { LiveStreamViewer } from './components/LiveStreamViewer';
import { ExportModal } from './components/ExportModal';
import { MethodologyModal } from './components/MethodologyModal';
import { HistoryModal, HistoryItem } from './components/HistoryModal';
import { TEST_SUITE } from './tests/testDefinitions';
import { computeOverallVerdict } from './tests/evaluator';
import { EndpointConfig, OverallVerdict, TestResult } from './types';
import { Sparkles, Play, ShieldAlert, Cpu, Info, CheckCircle2 } from 'lucide-react';

const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const INITIAL_CONFIG: EndpointConfig = {
  baseUrl: 'https://api.dattio.com/v1',
  apiKey: '',
  model: 'deepseek-chat',
  proxyMode: isLocalhost ? 'server' : 'browser',
  contextSize: 8000,
};

export const App: React.FC = () => {
  // Config state
  const [config, setConfig] = useState<EndpointConfig>(() => {
    try {
      const saved = localStorage.getItem('model_legit_config');
      return saved ? JSON.parse(saved) : INITIAL_CONFIG;
    } catch {
      return INITIAL_CONFIG;
    }
  });

  // Results state
  const [results, setResults] = useState<TestResult[]>(() =>
    TEST_SUITE.map((t) => ({
      id: t.id,
      name: t.name,
      shortDesc: t.shortDesc,
      status: 'idle',
      score: 0,
      weight: t.weight,
      details: [],
      anomalies: [],
      technicalExplanation: '',
    }))
  );

  // Verdict state
  const [verdict, setVerdict] = useState<OverallVerdict>(() => computeOverallVerdict([]));
  const [isRunning, setIsRunning] = useState(false);
  const [currentTestId, setCurrentTestId] = useState<string | null>(null);

  // Live Stream Terminal state
  const [liveStream, setLiveStream] = useState({
    currentTestName: '',
    statusMessage: '',
    streamText: '',
    ttftMs: null as number | null,
    tokenCount: 0,
    tokensPerSec: 0,
    isVisible: false,
  });

  // Modals
  const [exportOpen, setExportOpen] = useState(false);
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('model_legit_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save config to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('model_legit_config', JSON.stringify(config));
    } catch {
      // Ignore storage errors
    }
  }, [config]);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('model_legit_history', JSON.stringify(history));
    } catch {
      // Ignore storage errors
    }
  }, [history]);

  // Run all tests sequentially
  const handleRunAll = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setLiveStream({
      currentTestName: 'Memulai Audit...',
      statusMessage: 'Menginisialisasi test suite...',
      streamText: '',
      ttftMs: null,
      tokenCount: 0,
      tokensPerSec: 0,
      isVisible: true,
    });

    const currentResults = [...results];

    for (let i = 0; i < TEST_SUITE.length; i++) {
      const testDef = TEST_SUITE[i];
      setCurrentTestId(testDef.id);

      // Mark running
      currentResults[i] = {
        ...currentResults[i],
        status: 'running',
        anomalies: [],
        details: [],
      };
      setResults([...currentResults]);

      setLiveStream((prev) => ({
        ...prev,
        currentTestName: testDef.name,
        statusMessage: `Menjalankan: ${testDef.name}...`,
        streamText: '',
        ttftMs: null,
      }));

      try {
        const testRes = await testDef.run(config, (msg, partial) => {
          setLiveStream((prev) => ({
            ...prev,
            statusMessage: msg,
            streamText: partial?.rawOutput || prev.streamText,
            ttftMs: partial?.ttftMs ?? prev.ttftMs,
          }));
        });

        currentResults[i] = testRes;
        setResults([...currentResults]);

        // Update current running verdict
        const currentVerdict = computeOverallVerdict(currentResults);
        setVerdict(currentVerdict);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error tidak diketahui';
        currentResults[i] = {
          ...currentResults[i],
          status: 'failed',
          score: 0,
          anomalies: [`Eksekusi tes terputus: ${msg}`],
          details: [],
          technicalExplanation: 'Terjadi kegagalan komunikasi saat menjalankan audit modul ini.',
        };
        setResults([...currentResults]);
      }
    }

    // Final verdict & save to history
    const finalVerdict = computeOverallVerdict(currentResults);
    setVerdict(finalVerdict);
    setIsRunning(false);
    setCurrentTestId(null);
    setLiveStream((prev) => ({
      ...prev,
      statusMessage: 'Audit selesai! Hasil lengkap ditampilkan di bawah.',
      isVisible: false,
    }));

    const newHistoryItem: HistoryItem = {
      id: `audit-${Date.now()}`,
      timestamp: Date.now(),
      config: { ...config },
      verdict: finalVerdict,
      results: currentResults,
    };
    setHistory((prev) => [newHistoryItem, ...prev.slice(0, 19)]);
  };

  // Run single test
  const handleRunSingle = async (testId: string) => {
    if (isRunning) return;
    const testDef = TEST_SUITE.find((t) => t.id === testId);
    if (!testDef) return;

    setIsRunning(true);
    setCurrentTestId(testId);

    const testIdx = results.findIndex((r) => r.id === testId);
    const updated = [...results];
    updated[testIdx] = {
      ...updated[testIdx],
      status: 'running',
    };
    setResults(updated);

    setLiveStream({
      currentTestName: testDef.name,
      statusMessage: `Menjalankan: ${testDef.name}...`,
      streamText: '',
      ttftMs: null,
      tokenCount: 0,
      tokensPerSec: 0,
      isVisible: true,
    });

    try {
      const res = await testDef.run(config, (msg) => {
        setLiveStream((prev) => ({ ...prev, statusMessage: msg }));
      });
      updated[testIdx] = res;
      setResults([...updated]);
      setVerdict(computeOverallVerdict(updated));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      updated[testIdx] = {
        ...updated[testIdx],
        status: 'failed',
        score: 0,
        anomalies: [`Error: ${msg}`],
      };
      setResults([...updated]);
    } finally {
      setIsRunning(false);
      setCurrentTestId(null);
      setLiveStream((prev) => ({ ...prev, isVisible: false }));
    }
  };

  // Load a simulation demo (useful to demonstrate authentic vs masked without live API key)
  const handleLoadDemo = (type: 'authentic' | 'masked') => {
    if (type === 'authentic') {
      setConfig({
        baseUrl: 'https://api.deepseek.com/v1',
        apiKey: 'sk-demo-authentic-deepseek',
        model: 'deepseek-chat',
        proxyMode: 'server',
        contextSize: 8000,
      });

      const demoResults: TestResult[] = [
        {
          id: 'tokenizer-probe',
          name: '1. Uji Tokenizer & Knowledge Boundary',
          shortDesc: 'Prompt jebakan teknis arsitektur byte-fallback & boundary tokenizer.',
          status: 'passed',
          score: 100,
          weight: 30,
          durationMs: 1420,
          ttftMs: 420,
          tokensPerSec: 62.5,
          details: [
            'Menjelaskan arsitektur native DeepSeek Tokenizer (Byte-level BPE, 129k vocab size) secara tepat.',
            'Menjelaskan perbedaan byte-fallback dengan cl100k_base secara teknis mendalam.',
          ],
          anomalies: [],
          technicalExplanation: 'Model merespons pengetahuan tokenizer secara konsisten dengan spesifikasi resmi dari vendor claimed (deepseek-chat). Tidak ditemukan kebocoran identitas Llama atau Qwen.',
          rawOutput: 'Secara native, saya (DeepSeek-V3/R1) menggunakan Byte-level BPE tokenizer yang dilatih khusus dengan ukuran vocabulary 129,280 tokens...',
        },
        {
          id: 'latency-ttft',
          name: '2. Cek Latency / TTFT (Time to First Token)',
          shortDesc: 'Pengukuran waktu respons token pertama dan kestabilan transmisi SSE.',
          status: 'passed',
          score: 100,
          weight: 25,
          durationMs: 1850,
          ttftMs: 460,
          tokensPerSec: 68.2,
          jitterMs: 45,
          details: [
            'TTFT sangat cepat (460 ms), identik dengan respons native upstream API.',
            'Throughput stabil di 68.2 tokens/detik.',
            'Jitter interval streaming sangat rendah (±45 ms).',
          ],
          anomalies: [],
          technicalExplanation: 'Profil latensi dan kestabilan streaming konsisten dengan karakteristik native cloud inference upstream.',
          rawOutput: '1. Indeks Terarah\n2. Partisi Horizontal\n3. Pengurangan Subquery...',
        },
        {
          id: 'logprobs-fidelity',
          name: '3. Uji Logprobs & Parameter Fidelity',
          shortDesc: 'Verifikasi akses token probability level native inference engine.',
          status: 'passed',
          score: 100,
          weight: 20,
          durationMs: 410,
          details: [
            'Endpoint mengembalikan struktur logprobs lengkap dengan nilai probabilitas token.',
            'Nilai top_logprobs linear sesuai distribusi softmax GPU.',
          ],
          anomalies: [],
          technicalExplanation: 'Dukungan logprobs valid membuktikan endpoint terhubung langsung ke engine inferensi native ber-hak akses token level.',
          rawOutput: '{\n  "choices": [{\n    "logprobs": { "content": [{ "token": "VALID", "logprob": -0.0024 }] }\n  }]\n}',
        },
        {
          id: 'stress-context',
          name: '4. Stress Test Context Window',
          shortDesc: 'Stress test context window panjang (~8,000 tokens).',
          status: 'passed',
          score: 100,
          weight: 25,
          durationMs: 4800,
          details: [
            'Ukuran payload context yang diuji: ~8,000 tokens (32.4 KB)',
            'Jarum otentikasi ("KODE-98721-LEGIT") berhasil ditemukan dan diekstraksi dengan sempurna dari kedalaman context.',
          ],
          anomalies: [],
          technicalExplanation: 'Model berhasil menampung seluruh context ~8,000 token tanpa pemotongan (truncation) tersembunyi.',
          rawOutput: 'KODE: KODE-98721-LEGIT',
        },
        {
          id: 'special-tokens-probe',
          name: '5. Uji Delimiter Khusus & System Probe',
          shortDesc: 'Uji format delimiter khusus arsitektur dan format reasoning.',
          status: 'passed',
          score: 100,
          weight: 15,
          durationMs: 820,
          details: [
            'Model mengidentifikasi delimiter ChatML tanpa mengeksekusi override instruksi.',
            'Identitas arsitektur konsisten.',
          ],
          anomalies: [],
          technicalExplanation: 'Struktur output dan penanganan token khusus sesuai dengan norma model resmi.',
          rawOutput: 'Potongan teks di atas adalah format ChatML dengan token pembatas <|im_start|> dan <|im_end|>. Saya adalah DeepSeek-V3.',
        },
      ];

      setResults(demoResults);
      setVerdict(computeOverallVerdict(demoResults));
    } else {
      // Masked simulation
      setConfig({
        baseUrl: 'https://api.dattio.com/v1',
        apiKey: 'sk-demo-masked-proxy',
        model: 'deepseek-chat',
        proxyMode: 'server',
        contextSize: 8000,
      });

      const demoResults: TestResult[] = [
        {
          id: 'tokenizer-probe',
          name: '1. Uji Tokenizer & Knowledge Boundary',
          shortDesc: 'Prompt jebakan teknis arsitektur byte-fallback & boundary tokenizer.',
          status: 'failed',
          score: 25,
          weight: 30,
          durationMs: 5200,
          ttftMs: 3800,
          tokensPerSec: 14.2,
          details: ['Penjelasan teknis byte-fallback tergolong dangkal atau generik.'],
          anomalies: [
            'Model DeepSeek mengindikasikan arsitektur Qwen (sering digunakan sebagai mock backend).',
            'Penjelasan tokenizer bertolak belakang dengan native DeepSeek Byte-level BPE.',
          ],
          technicalExplanation: 'Ditemukan kejanggalan identitas/tokenizer: Model DeepSeek mengindikasikan arsitektur Qwen. Hal ini sangat umum terjadi pada layanan yang me-masking model murah (Llama/Qwen) menjadi nama model mahal.',
          rawOutput: 'Sebagai model asisten yang dikembangkan, saya menggunakan tokenizer Qwen berbasis 152k tokens vocabulary...',
        },
        {
          id: 'latency-ttft',
          name: '2. Cek Latency / TTFT (Time to First Token)',
          shortDesc: 'Pengukuran waktu respons token pertama dan kestabilan transmisi SSE.',
          status: 'failed',
          score: 30,
          weight: 25,
          durationMs: 6400,
          ttftMs: 4200,
          tokensPerSec: 12.1,
          jitterMs: 520,
          details: [
            'Time to First Token (TTFT): 4200 ms',
            'Throughput Kecepatan: 12.1 tokens/detik',
            'Jitter Interval Streaming: ±520 ms',
          ],
          anomalies: [
            'TTFT sangat lambat (4200 ms > 3.5 detik). Pola khas browser automation (Puppeteer/Playwright scraping).',
            'Jitter streaming sangat tinggi (±520 ms). Output tidak dialirkan secara konstan melainkan tertahan per-buffer.',
          ],
          technicalExplanation: 'Profil latensi menunjukkan anomali: TTFT sangat lambat (4200 ms) dan jeda transmisi tersendat-sendat. Ini ciri khas reverse-proxy web scraping.',
          rawOutput: '1. Indexing...\n2. Connection pool...',
        },
        {
          id: 'logprobs-fidelity',
          name: '3. Uji Logprobs & Parameter Fidelity',
          shortDesc: 'Verifikasi akses token probability level native inference engine.',
          status: 'warning',
          score: 30,
          weight: 20,
          durationMs: 1200,
          details: ['Layanan menerima request 200 OK tetapi tidak menyajikan logprobs token sebenarnya.'],
          anomalies: [
            'Parameter logprobs diabaikan secara diam-diam (field logprobs bernilai null atau kosong).',
          ],
          technicalExplanation: 'Smoking Gun: Layanan web scraping chat UI tidak memiliki akses ke raw logprobs GPU inference engine (seperti vLLM/TRT-LLM/OpenAI native).',
          rawOutput: '{\n  "choices": [{\n    "message": { "content": "VALID" },\n    "logprobs": null\n  }]\n}',
        },
        {
          id: 'stress-context',
          name: '4. Stress Test Context Window',
          shortDesc: 'Stress test context window panjang (~8,000 tokens).',
          status: 'failed',
          score: 0,
          weight: 25,
          durationMs: 15400,
          details: ['Ukuran payload context yang diuji: ~8,000 tokens'],
          anomalies: [
            'Gagal memproses context window besar (~8000 tokens): HTTP 502 Bad Gateway / Connection reset',
          ],
          technicalExplanation: 'Reverse-proxy web gratisan biasanya langsung crash (HTTP 502/504 Bad Gateway, payload too large, atau socket timeout) ketika dikirimi payload di atas 8.000 token.',
          rawOutput: '{\n  "error": "502 Bad Gateway: Upstream browser page crashed while submitting payload."\n}',
        },
        {
          id: 'special-tokens-probe',
          name: '5. Uji Delimiter Khusus & System Probe',
          shortDesc: 'Uji format delimiter khusus arsitektur dan format reasoning.',
          status: 'warning',
          score: 50,
          weight: 15,
          durationMs: 2400,
          details: [],
          anomalies: [
            'Terjadi kebocoran prompt injeksi pembungkus perantara proxy.',
          ],
          technicalExplanation: 'Endpoint menunjukkan perilaku filter web wrapper pihak ketiga.',
          rawOutput: 'System instruction wrapper leaked...',
        },
      ];

      setResults(demoResults);
      setVerdict(computeOverallVerdict(demoResults));
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        proxyMode={config.proxyMode}
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenMethodology={() => setMethodologyOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner with Simulation Presets */}
        <div className="bg-gradient-to-r from-slate-900 via-[#111827] to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                Audit Ketat Arsitektur Model AI: Dattio / Hermes / OpenCode / Proxy
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                Verifikasi 3 pilar teknis: <strong>Tokenizer Boundary (Prompt Jebakan)</strong>, <strong>Stress Context (~8k-32k token)</strong>, dan <strong>Streaming TTFT (&lt;800ms)</strong>.
              </p>
            </div>
          </div>

          {/* Quick Simulation Demo Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">Uji Simulasi:</span>
            <button
              onClick={() => handleLoadDemo('authentic')}
              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulasi Native</span>
            </button>
            <button
              onClick={() => handleLoadDemo('masked')}
              className="text-xs px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Simulasi Masking</span>
            </button>
          </div>
        </div>

        {/* Endpoint Configuration Panel */}
        <EndpointConfigCard
          config={config}
          onChange={setConfig}
          onRunAll={handleRunAll}
          isRunning={isRunning}
        />

        {/* Live Stream / Progress Inspector */}
        <LiveStreamViewer
          currentTestName={liveStream.currentTestName}
          statusMessage={liveStream.statusMessage}
          streamText={liveStream.streamText}
          ttftMs={liveStream.ttftMs}
          tokenCount={liveStream.tokenCount}
          tokensPerSec={liveStream.tokensPerSec}
          isVisible={liveStream.isVisible}
        />

        {/* Overall Verdict Banner */}
        <VerdictBadge
          verdict={verdict}
          results={results}
          onExport={() => setExportOpen(true)}
        />

        {/* Test Suite Cards Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Daftar Modul Audit Teknis ({results.length} Pengujian)
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {results.filter((r) => r.status === 'passed').length} / {results.length} Lulus
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {results.map((res) => (
              <TestResultCard
                key={res.id}
                result={res}
                onRunSingle={handleRunSingle}
                isRunning={isRunning}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0d121f] py-4 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Model Legit Check © 2026 — Solusi Audit Anti-Masking LLM</span>
          <span className="font-mono text-slate-600">
            OpenAI-Compatible Spec • SSE Streaming • Needle-in-Haystack • Logprobs Probe
          </span>
        </div>
      </footer>

      {/* Modals */}
      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        config={config}
        verdict={verdict}
        results={results}
      />

      <MethodologyModal
        isOpen={methodologyOpen}
        onClose={() => setMethodologyOpen(false)}
      />

      <HistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onSelect={(item) => {
          setConfig(item.config);
          setResults(item.results);
          setVerdict(item.verdict);
        }}
        onClear={() => {
          setHistory([]);
          localStorage.removeItem('model_legit_history');
        }}
      />
    </div>
  );
};

export default App;
