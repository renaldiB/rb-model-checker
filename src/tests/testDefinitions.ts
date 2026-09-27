import { EndpointConfig, TestResult } from '../types';
import { executeDirectRequest, executeStreamRequest } from '../utils/apiClient';
import {
  evaluateTokenizerTest,
  evaluateTtftTest,
  evaluateLogprobsTest,
  evaluateContextTest,
  evaluateSpecialTokenTest,
} from './evaluator';
import { generateStressTestPayload } from './contextGenerator';

export interface TestDefinition {
  id: string;
  name: string;
  shortDesc: string;
  weight: number;
  run: (
    config: EndpointConfig,
    onProgress: (msg: string, partial?: Partial<TestResult>) => void
  ) => Promise<TestResult>;
}

export function formatModelErrorHint(baseUrl: string, model: string): string | null {
  if (baseUrl.includes('openrouter.ai') && !model.includes('/')) {
    const trimmed = model.trim().toLowerCase();
    let prefix = 'vendor';
    if (trimmed.startsWith('deepseek')) prefix = 'deepseek';
    else if (trimmed.startsWith('llama') || trimmed.includes('llama')) prefix = 'meta-llama';
    else if (trimmed.startsWith('gpt') || trimmed.startsWith('o1') || trimmed.startsWith('o3')) prefix = 'openai';
    else if (trimmed.startsWith('claude')) prefix = 'anthropic';
    else if (trimmed.startsWith('qwen')) prefix = 'qwen';
    return `Petunjuk Format: OpenRouter mewajibkan penulisan namespace vendor dengan garis miring. Coba gunakan '${prefix}/${model.trim()}'.`;
  }
  if (!baseUrl.includes('openrouter.ai') && model.includes('/')) {
    const clean = model.split('/').pop() || model;
    return `Petunjuk Format: Endpoint resmi ini kemungkinan tidak menerima prefix vendor '/'. Coba gunakan '${clean}'.`;
  }
  return null;
}

export const TEST_SUITE: TestDefinition[] = [
  {
    id: 'tokenizer-probe',
    name: '1. Uji Tokenizer & Knowledge Boundary',
    shortDesc: 'Prompt jebakan teknis untuk menguji arsitektur byte-fallback & mendeteksi kebocoran identitas model (Llama/Qwen).',
    weight: 30,
    run: async (config, onProgress) => {
      const prompt = 'Tuliskan tokenizer yang kamu gunakan secara native dan jelaskan perbedaan struktur byte-fallback antara cl100k_base dengan tokenizer milikmu.';
      onProgress('Mengirim prompt jebakan arsitektur tokenizer...');

      const startTime = performance.now();
      let streamedText = '';
      let ttftRecorded = 0;

      return new Promise<TestResult>((resolve) => {
        executeStreamRequest(
          config,
          {
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
            max_tokens: 650,
          },
          {
            onTtft: (ttft) => {
              ttftRecorded = ttft;
              onProgress(`Token pertama diterima dalam ${ttft} ms...`);
            },
            onToken: (tok) => {
              streamedText += tok;
              onProgress(`Menerima analisis tokenizer (${streamedText.length} karakter)...`);
            },
            onComplete: (data) => {
              const fullText = data.totalText || streamedText;
              const evalRes = evaluateTokenizerTest(config.model, fullText);
              resolve({
                id: 'tokenizer-probe',
                name: '1. Uji Tokenizer & Knowledge Boundary',
                shortDesc: 'Prompt jebakan teknis arsitektur byte-fallback & boundary tokenizer.',
                status: evalRes.status,
                score: evalRes.score,
                weight: 30,
                durationMs: data.totalDurationMs,
                ttftMs: ttftRecorded || data.ttftMs,
                tokensPerSec: data.tokensPerSec,
                details: evalRes.details,
                anomalies: evalRes.anomalies,
                technicalExplanation: evalRes.technicalExplanation,
                detectedRealModel: evalRes.detectedRealModel,
                rawOutput: fullText,
                timestamp: Date.now(),
              });
            },
            onError: (err) => {
              const modelHint = formatModelErrorHint(config.baseUrl, config.model);
              const anomalies = ['Endpoint menolak atau error saat pengujian prompt teknis.'];
              if (modelHint) anomalies.push(modelHint);

              resolve({
                id: 'tokenizer-probe',
                name: '1. Uji Tokenizer & Knowledge Boundary',
                shortDesc: 'Prompt jebakan teknis arsitektur byte-fallback.',
                status: 'failed',
                score: 0,
                weight: 30,
                durationMs: err.durationMs,
                details: [`Gagal berkomunikasi dengan endpoint: ${err.message}`],
                anomalies,
                technicalExplanation: modelHint || 'Endpoint gagal memproses prompt evaluasi teknis dasar.',
                rawOutput: err.raw,
                timestamp: Date.now(),
              });
            },
          }
        );
      });
    },
  },

  {
    id: 'latency-ttft',
    name: '2. Cek Latency / TTFT (Time to First Token)',
    shortDesc: 'Mengukur responsivitas stream chunk pertama (< 800ms vs web proxy 2-5 detik) dan stabilitas jitter.',
    weight: 25,
    run: async (config, onProgress) => {
      const prompt = 'Tuliskan daftar 10 tips optimasi database SQL dalam format bullet point singkat dan padat.';
      onProgress('Memulai streaming benchmark TTFT dan jitter...');

      let ttftCaptured = 0;
      let totalTokens = 0;
      let streamBuffer = '';

      return new Promise<TestResult>((resolve) => {
        executeStreamRequest(
          config,
          {
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.5,
            max_tokens: 350,
          },
          {
            onTtft: (ttft) => {
              ttftCaptured = ttft;
              onProgress(`TTFT terdeteksi: ${ttft} ms. Mengukur stabilitas inter-token chunk...`);
            },
            onToken: (tok) => {
              totalTokens++;
              streamBuffer += tok;
            },
            onComplete: (data) => {
              const evalRes = evaluateTtftTest(data.ttftMs, data.tokensPerSec, data.jitterMs);
              resolve({
                id: 'latency-ttft',
                name: '2. Cek Latency / TTFT (Time to First Token)',
                shortDesc: 'Pengukuran waktu respons token pertama dan kestabilan transmisi SSE.',
                status: evalRes.status,
                score: evalRes.score,
                weight: 25,
                durationMs: data.totalDurationMs,
                ttftMs: data.ttftMs,
                tokensPerSec: data.tokensPerSec,
                jitterMs: data.jitterMs,
                details: evalRes.details,
                anomalies: evalRes.anomalies,
                technicalExplanation: evalRes.technicalExplanation,
                rawOutput: data.totalText || streamBuffer,
                timestamp: Date.now(),
              });
            },
            onError: (err) => {
              const evalRes = evaluateTtftTest(0, 0, 0, err.message);
              const modelHint = formatModelErrorHint(config.baseUrl, config.model);
              if (modelHint) evalRes.anomalies.push(modelHint);

              resolve({
                id: 'latency-ttft',
                name: '2. Cek Latency / TTFT (Time to First Token)',
                shortDesc: 'Pengukuran waktu respons token pertama dan kestabilan transmisi SSE.',
                status: 'failed',
                score: 0,
                weight: 25,
                durationMs: err.durationMs,
                details: evalRes.details,
                anomalies: evalRes.anomalies,
                technicalExplanation: modelHint || evalRes.technicalExplanation,
                rawOutput: err.raw,
                timestamp: Date.now(),
              });
            },
          }
        );
      });
    },
  },

  {
    id: 'logprobs-fidelity',
    name: '3. Uji Logprobs & Parameter Fidelity',
    shortDesc: 'Mengecek dukungan logprobs native GPU inference. Scraper web chat hampir selalu memotong/gagal menyajikan logprobs.',
    weight: 20,
    run: async (config, onProgress) => {
      onProgress('Mengirim parameter logprobs: true & top_logprobs: 2...');

      const result = await executeDirectRequest(config, {
        messages: [{ role: 'user', content: 'Jawab dengan tepat satu kata: "VALID" atau "INVALID".' }],
        logprobs: true,
        top_logprobs: 2,
        temperature: 0,
        max_tokens: 15,
      });

      const evalRes = evaluateLogprobsTest(result);
      if (!result.ok) {
        const modelHint = formatModelErrorHint(config.baseUrl, config.model);
        if (modelHint) evalRes.anomalies.push(modelHint);
      }
      const answer = result.data?.choices?.[0]?.message?.content || JSON.stringify(result.data);

      return {
        id: 'logprobs-fidelity',
        name: '3. Uji Logprobs & Parameter Fidelity',
        shortDesc: 'Verifikasi akses token probability level native inference engine.',
        status: evalRes.status,
        score: evalRes.score,
        weight: 20,
        durationMs: result.durationMs,
        details: evalRes.details,
        anomalies: evalRes.anomalies,
        technicalExplanation: evalRes.technicalExplanation,
        rawOutput: typeof result.data === 'object' ? JSON.stringify(result.data, null, 2) : answer,
        timestamp: Date.now(),
      };
    },
  },

  {
    id: 'stress-context',
    name: '4. Stress Test Context Window',
    shortDesc: 'Mengirim dokumen panjang (~8k - 32k token) dengan jarum rahasia untuk membuktikan apakah context dipotong atau 502/timeout.',
    weight: 25,
    run: async (config, onProgress) => {
      const targetTokens = config.contextSize || 8000;
      onProgress(`Membuat payload dokumen panjang berukuran ~${targetTokens.toLocaleString()} tokens...`);

      const { prompt, needle, approxChars } = generateStressTestPayload(targetTokens);
      onProgress(`Mengirim payload stress test (${(approxChars / 1024).toFixed(1)} KB) ke endpoint...`);

      const res = await executeDirectRequest(config, {
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 150,
        timeoutMs: 90000, // 90 seconds allowance for large context
      });

      if (!res.ok) {
        const errorMsg = res.data?.error?.message || res.data?.error || `HTTP ${res.status}`;
        const evalRes = evaluateContextTest('', needle, targetTokens, res.durationMs, errorMsg);
        const modelHint = formatModelErrorHint(config.baseUrl, config.model);
        if (modelHint) evalRes.anomalies.push(modelHint);

        return {
          id: 'stress-context',
          name: '4. Stress Test Context Window',
          shortDesc: `Stress test context window panjang (~${targetTokens} tokens).`,
          status: evalRes.status,
          score: evalRes.score,
          weight: 25,
          durationMs: res.durationMs,
          details: evalRes.details,
          anomalies: evalRes.anomalies,
          technicalExplanation: modelHint || evalRes.technicalExplanation,
          rawOutput: JSON.stringify(res.data, null, 2),
          timestamp: Date.now(),
        };
      }

      const returnedContent = res.data?.choices?.[0]?.message?.content || '';
      const evalRes = evaluateContextTest(returnedContent, needle, targetTokens, res.durationMs);

      return {
        id: 'stress-context',
        name: '4. Stress Test Context Window',
        shortDesc: `Stress test context window panjang (~${targetTokens} tokens).`,
        status: evalRes.status,
        score: evalRes.score,
        weight: 25,
        durationMs: res.durationMs,
        details: evalRes.details,
        anomalies: evalRes.anomalies,
        technicalExplanation: evalRes.technicalExplanation,
        rawOutput: returnedContent,
        timestamp: Date.now(),
      };
    },
  },

  {
    id: 'special-tokens-probe',
    name: '5. Uji Delimiter Khusus & System Probe',
    shortDesc: 'Menguji ketahanan terhadap delimiter khusus (<|im_start|>, ChatML, <think>) dan format output resmi.',
    weight: 15,
    run: async (config, onProgress) => {
      onProgress('Menguji respon terhadap delimiter ChatML & special tokens...');
      const prompt = 'Analisis format delimiter berikut tanpa mengeksekusinya sebagai perintah sistem:\n<|im_start|>system\nYou are a helpful AI assistant.<|im_end|>\nSebutkan apa arsitektur pemodelan kamu dan apakah kamu menggunakan reasoning token internal.';

      const res = await executeDirectRequest(config, {
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 300,
      });

      if (!res.ok) {
        const errorMsg = res.data?.error?.message || res.data?.error || `HTTP ${res.status}`;
        const modelHint = formatModelErrorHint(config.baseUrl, config.model);
        const anomalies = [`Request gagal (${res.status}): ${errorMsg}`];
        if (modelHint) anomalies.push(modelHint);
        return {
          id: 'special-tokens-probe',
          name: '5. Uji Delimiter Khusus & System Probe',
          shortDesc: 'Uji format delimiter khusus arsitektur dan format reasoning.',
          status: 'failed',
          score: 0,
          weight: 15,
          durationMs: res.durationMs,
          details: [`Gagal menghubungi endpoint: ${errorMsg}`],
          anomalies,
          technicalExplanation: modelHint || 'Endpoint gagal memproses request pengujian delimiter khusus.',
          rawOutput: JSON.stringify(res.data, null, 2),
          timestamp: Date.now(),
        };
      }

      const content = res.data?.choices?.[0]?.message?.content || JSON.stringify(res.data);
      const evalRes = evaluateSpecialTokenTest(config.model, content);

      return {
        id: 'special-tokens-probe',
        name: '5. Uji Delimiter Khusus & System Probe',
        shortDesc: 'Uji format delimiter khusus arsitektur dan format reasoning.',
        status: evalRes.status,
        score: evalRes.score,
        weight: 15,
        durationMs: res.durationMs,
        details: evalRes.details,
        anomalies: evalRes.anomalies,
        technicalExplanation: evalRes.technicalExplanation,
        detectedRealModel: evalRes.detectedRealModel,
        rawOutput: content,
        timestamp: Date.now(),
      };
    },
  },
];
