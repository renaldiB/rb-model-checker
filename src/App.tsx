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
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-[#111827] to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-md">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                Pemeriksa Keaslian Endpoint AI & Deteksi Anti-Masking
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 max-w-3xl">
                Verifikasi 3 pilar teknis: <strong>Tokenizer Boundary (Prompt Jebakan)</strong>, <strong>Stress Context (~8k-32k token)</strong>, dan <strong>Streaming TTFT (&lt;800ms)</strong>.
              </p>
            </div>
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
