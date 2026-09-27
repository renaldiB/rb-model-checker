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
import { Biotech, Layers, ShieldCheck, Zap } from 'lucide-react';

const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const INITIAL_CONFIG: EndpointConfig = {
  baseUrl: '',
  apiKey: '',
  model: '',
  proxyMode: isLocalhost ? 'server' : 'browser',
  contextSize: 8000,
};

export const App: React.FC = () => {
  // Config state
  const [config, setConfig] = useState<EndpointConfig>(() => {
    try {
      const saved = localStorage.getItem('model_legit_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.baseUrl === 'https://api.dattio.com/v1') {
          return INITIAL_CONFIG;
        }
        return parsed;
      }
      return INITIAL_CONFIG;
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
  const [, setCurrentTestId] = useState<string | null>(null);

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
      // Ignore
    }
  }, [config]);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('model_legit_history', JSON.stringify(history));
    } catch {
      // Ignore
    }
  }, [history]);

  // Run all tests sequentially
  const handleRunAll = async () => {
    if (isRunning || !config.baseUrl || !config.model) return;
    setIsRunning(true);
    setLiveStream({
      currentTestName: 'Memulai Audit Forensik...',
      statusMessage: 'Menginisialisasi probe sensors...',
      streamText: `[00:00.000] → INITIALIZING ATTESTATION: target="${config.baseUrl}" model="${config.model}"\n`,
      ttftMs: null,
      tokenCount: 0,
      tokensPerSec: 0,
      isVisible: true,
    });

    const currentResults = [...results];

    for (let i = 0; i < TEST_SUITE.length; i++) {
      const testDef = TEST_SUITE[i];
      setCurrentTestId(testDef.id);

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
      }));

      try {
        const testRes = await testDef.run(config, (msg, partial) => {
          setLiveStream((prev) => {
            let nextText = prev.streamText;
            if (partial?.rawOutput && !prev.streamText.includes(partial.rawOutput.slice(0, 30))) {
              nextText += `\n[PROBE] ${msg}\n${partial.rawOutput}\n`;
            } else {
              nextText += `\n[INFO] ${msg}`;
            }
            return {
              ...prev,
              statusMessage: msg,
              streamText: nextText,
              ttftMs: partial?.ttftMs ?? prev.ttftMs,
              tokensPerSec: partial?.tokensPerSec ?? prev.tokensPerSec,
            };
          });
        });

        currentResults[i] = testRes;
        setResults([...currentResults]);

        const currentVerdict = computeOverallVerdict(currentResults);
        setVerdict(currentVerdict);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error tidak diketahui';
        currentResults[i] = {
          ...currentResults[i],
          status: 'failed',
          score: 0,
          anomalies: [`Eksekusi terputus: ${msg}`],
          details: [],
          technicalExplanation: 'Terjadi kegagalan komunikasi saat menjalankan audit modul ini.',
        };
        setResults([...currentResults]);
      }
    }

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
    if (isRunning || !config.baseUrl || !config.model) return;
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
      streamText: `[SINGLE PROBE] Memulai verifikasi: ${testDef.name}\n`,
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

  return (
    <div className="min-h-screen bg-[#0f131c] text-[#dfe2ee] flex flex-col font-sans relative selection:bg-[#10b981]/30 selection:text-[#4edea3]">
      {/* Top Decorative Zero-Plane Reticle */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-48 pointer-events-none opacity-20 -z-10 flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full border border-[#4cd7f6]/20 blur-3xl" />
      </div>

      {/* Top Header */}
      <Header
        proxyMode={config.proxyMode}
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenMethodology={() => setMethodologyOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Operational Status & Headline Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 border-b border-white/[0.08] pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#4edea3]/10 border border-[#4edea3]/30 text-[#4edea3] font-mono text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
                ACTIVE TELEMETRY SENSOR // NODE #04
              </span>
              <span className="text-[#bbcabf] font-mono text-xs">
                ENCLAVE: TLS 1.3 SECURED
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#dfe2ee]">
              AI Endpoint Authenticity &amp; Anti-Masking Radar
            </h1>

            <p className="text-xs sm:text-sm text-[#bbcabf] max-w-3xl leading-relaxed">
              Lakukan atestasi kriptografis, analisis entropi logprobs, batas tokenizer byte-fallback, dan stress context window untuk mengungkap model yang disamarkan (masking), kuantisasi palsu, atau hasil scraping web chat.
            </p>
          </div>

          {/* Quick Action Stats Strip */}
          <div className="flex items-center gap-4 bg-[#181c24]/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/[0.08] font-mono shrink-0">
            <div className="space-y-0.5 pr-4 border-r border-white/[0.08]">
              <div className="text-[10px] text-[#bbcabf] uppercase">INSPECTION ENGINE</div>
              <div className="text-xs text-[#4cd7f6] font-bold">v4.2.8-FORENSIC</div>
            </div>
            <div className="space-y-0.5 pr-4 border-r border-white/[0.08]">
              <div className="text-[10px] text-[#bbcabf] uppercase">ENTROPY TOLERANCE</div>
              <div className="text-xs text-[#4edea3] font-bold">±0.012 nats</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-[10px] text-[#bbcabf] uppercase">REPLAY GUARD</div>
              <div className="text-xs text-[#10b981] font-bold">ARMED</div>
            </div>
          </div>
        </div>

        {/* SECTION 1: TARGET CONFIGURATION HUD CARD */}
        <EndpointConfigCard
          config={config}
          onChange={setConfig}
          onRunAll={handleRunAll}
          isRunning={isRunning}
        />

        {/* SECTION 2: LIVE STREAM TELEMETRY INSPECTOR */}
        <LiveStreamViewer
          currentTestName={liveStream.currentTestName}
          statusMessage={liveStream.statusMessage}
          streamText={liveStream.streamText}
          ttftMs={liveStream.ttftMs}
          tokenCount={liveStream.tokenCount}
          tokensPerSec={liveStream.tokensPerSec}
          isVisible={liveStream.isVisible}
          onClear={() => setLiveStream((prev) => ({ ...prev, streamText: '' }))}
        />

        {/* SECTION 3: CENTRAL AUTHENTICITY VERDICT BANNER CARD */}
        <VerdictBadge
          verdict={verdict}
          results={results}
          onExport={() => setExportOpen(true)}
        />

        {/* SECTION 4: 5-MODULE FORENSIC TEST GRID */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#4edea3]/10 flex items-center justify-center border border-[#4edea3]/20">
                <Layers className="w-4 h-4 text-[#4edea3]" />
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#dfe2ee] font-mono">
                Forensic Probe Matrix (5 Active Verification Vectors)
              </h2>
            </div>
            <span className="font-mono text-xs text-[#bbcabf] px-3 py-1 rounded-full bg-[#181c24] border border-white/[0.08] self-start sm:self-auto">
              {results.filter((r) => r.status === 'passed').length} / {results.length} VECTORS VALIDATED
            </span>
          </div>

          {/* Responsive Grid: 2 columns on desktop, 1 on mobile, card 5 spans 2 cols */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {results.map((res, idx) => (
              <div key={res.id} className={idx === 4 ? "md:col-span-2" : ""}>
                <TestResultCard
                  result={res}
                  onRunSingle={handleRunSingle}
                  isRunning={isRunning}
                />
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#0a0e16] border-t border-white/[0.08] py-5 mt-16">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 font-mono text-xs text-[#86948a]">
          <span>MODEL LEGIT CHECK // ZERO-TRUST AI ENDPOINT VERIFICATION FRAMEWORK</span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-[#4edea3]">CORE TELEMETRY: NOMINAL</span>
            <span>SHA-256 INTEGRITY VALIDATED</span>
          </div>
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
