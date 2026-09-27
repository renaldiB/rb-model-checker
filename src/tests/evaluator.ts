import { TestResult, OverallVerdict } from '../types';

export function evaluateTokenizerTest(
  modelName: string,
  responseText: string
): {
  score: number;
  status: 'passed' | 'warning' | 'failed';
  details: string[];
  anomalies: string[];
  technicalExplanation: string;
} {
  const lowerText = responseText.toLowerCase();
  const lowerModel = modelName.toLowerCase();
  const anomalies: string[] = [];
  const details: string[] = [];
  let score = 100;

  // 1. Check for blatant model identity spoofing / masking leaks
  const identityKeywords = [
    { target: 'llama', patterns: ['meta llama', 'saya llama', 'model llama', 'dibuat oleh meta'] },
    { target: 'qwen', patterns: ['qwen', 'alibaba cloud', 'tongyi qianwen', 'dibuat oleh alibaba'] },
    { target: 'gpt', patterns: ['openai', 'chatgpt', 'gpt-4', 'gpt-3.5'] },
    { target: 'claude', patterns: ['anthropic', 'claude'] },
    { target: 'deepseek', patterns: ['deepseek', 'deepseek-ai', 'deepseek-v3', 'deepseek-r1'] },
  ];

  // If the model claimed is DeepSeek, but mentions it's Llama or Qwen or ChatGPT
  if (lowerModel.includes('deepseek')) {
    if (lowerText.includes('llama') && !lowerText.includes('perbedaan dengan llama')) {
      anomalies.push('Model DeepSeek menyebut dirinya atau terindikasi berbasis arsitektur Llama.');
      score -= 50;
    }
    if (lowerText.includes('qwen') && !lowerText.includes('perbedaan dengan qwen')) {
      anomalies.push('Model DeepSeek mengindikasikan arsitektur Qwen (sering digunakan sebagai mock backend).');
      score -= 50;
    }
    if (lowerText.includes('chatgpt') || lowerText.includes('openai')) {
      if (!lowerText.includes('cl100k_base') && !lowerText.includes('seperti openai')) {
        anomalies.push('Model DeepSeek mengaku produk OpenAI/ChatGPT.');
        score -= 60;
      }
    }
    if (lowerText.includes('byte-level bpe') || lowerText.includes('bpe') || lowerText.includes('byte-fallback') || lowerText.includes('129k') || lowerText.includes('128k') || lowerText.includes('102k')) {
      details.push('Menjelaskan mekanisme Byte-level BPE / Byte-fallback dengan akurat.');
    }
  } else if (lowerModel.includes('gpt-4o')) {
    // GPT-4o natively uses o200k_base
    if (lowerText.includes('o200k_base') || lowerText.includes('o200k')) {
      details.push('Berhasil mengidentifikasi native tokenizer GPT-4o: o200k_base.');
    } else if (lowerText.includes('cl100k_base') && !lowerText.includes('gpt-4')) {
      anomalies.push('Mengaku menggunakan cl100k_base padahal GPT-4o native menggunakan o200k_base (kemungkinan fallback ke GPT-4/GPT-3.5 turbo).');
      score -= 30;
    }

    if (lowerText.includes('llama') || lowerText.includes('qwen')) {
      anomalies.push('Endpoint GPT-4o terindikasi membocorkan identitas model open-weight (Llama/Qwen).');
      score -= 70;
    }
  } else if (lowerModel.includes('claude')) {
    if (lowerText.includes('openai') || lowerText.includes('chatgpt')) {
      anomalies.push('Endpoint Claude mengaku dikembangkan oleh OpenAI.');
      score -= 70;
    }
  }

  // 2. Check byte-fallback explanation depth
  const technicalTerms = ['byte-fallback', 'byte fallback', 'utf-8', 'out-of-vocabulary', 'oov', 'byte-level', 'subword', 'token'];
  const matchedTerms = technicalTerms.filter(t => lowerText.includes(t));

  if (matchedTerms.length >= 3) {
    details.push(`Penjelasan teknis mendalam mencakup istilah: ${matchedTerms.join(', ')}.`);
  } else {
    details.push('Penjelasan teknis byte-fallback tergolong dangkal atau generik.');
    score -= 15;
  }

  // Cap score
  score = Math.max(0, Math.min(100, score));
  const status = score >= 80 ? 'passed' : score >= 50 ? 'warning' : 'failed';

  const technicalExplanation = anomalies.length > 0
    ? `Ditemukan kejanggalan identitas/tokenizer: ${anomalies.join(' ')} Hal ini sangat umum terjadi pada layanan yang me-masking model murah (Llama/Qwen) menjadi nama model mahal.`
    : `Model merespons pengetahuan tokenizer secara konsisten dengan spesifikasi resmi dari vendor claimed (${modelName}).`;

  return { score, status, details, anomalies, technicalExplanation };
}

export function evaluateTtftTest(
  ttftMs: number,
  tokensPerSec: number,
  jitterMs: number,
  error?: string
): {
  score: number;
  status: 'passed' | 'warning' | 'failed';
  details: string[];
  anomalies: string[];
  technicalExplanation: string;
} {
  if (error) {
    return {
      score: 0,
      status: 'failed',
      details: [`Koneksi streaming gagal: ${error}`],
      anomalies: ['Endpoint menolak atau gagal melayani koneksi streaming.'],
      technicalExplanation: 'Layanan reverse-proxy web scraping sering memutus koneksi streaming atau mengalami rate-limit 429 saat memproses traffic.',
    };
  }

  const details: string[] = [];
  const anomalies: string[] = [];
  let score = 100;

  details.push(`Time to First Token (TTFT): ${ttftMs} ms`);
  details.push(`Throughput Kecepatan: ${tokensPerSec} tokens/detik`);
  details.push(`Jitter Interval Streaming: ±${jitterMs} ms`);

  // TTFT Evaluation
  if (ttftMs <= 850) {
    details.push('TTFT sangat cepat (< 850 ms), identik dengan respons native upstream API.');
  } else if (ttftMs <= 1800) {
    details.push('TTFT tergolong normal (850 - 1800 ms), tipikal untuk server dengan jarak geografis menengah.');
    score -= 15;
  } else if (ttftMs <= 3500) {
    anomalies.push(`TTFT lambat (${ttftMs} ms). Mengindikasikan antrean web automation atau cold-start proxy.`);
    score -= 40;
  } else {
    anomalies.push(`TTFT sangat lambat (${ttftMs} ms > 3.5 detik). Pola khas browser automation (Puppeteer/Playwright scraping).`);
    score -= 65;
  }

  // Jitter Evaluation
  if (jitterMs > 400) {
    anomalies.push(`Jitter streaming sangat tinggi (±${jitterMs} ms). Output tidak dialirkan secara konstan melainkan tertahan per-buffer.`);
    score -= 20;
  }

  // TPS Evaluation
  if (tokensPerSec > 0 && tokensPerSec < 6) {
    anomalies.push(`Kecepatan token sangat lambat (${tokensPerSec} tok/s), mencurigakan untuk API komersial modern.`);
    score -= 15;
  }

  score = Math.max(0, Math.min(100, score));
  const status = score >= 80 ? 'passed' : score >= 50 ? 'warning' : 'failed';

  const technicalExplanation = anomalies.length > 0
    ? `Profil latensi menunjukkan anomali: ${anomalies.join(' ')} API resmi langsung mengirim SSE chunk pertama < 800ms tanpa hambatan headless browser.`
    : 'Profil latensi dan kestabilan streaming konsisten dengan karakteristik native cloud inference upstream.';

  return { score, status, details, anomalies, technicalExplanation };
}

export function evaluateLogprobsTest(
  res: any
): {
  score: number;
  status: 'passed' | 'warning' | 'failed';
  details: string[];
  anomalies: string[];
  technicalExplanation: string;
} {
  const details: string[] = [];
  const anomalies: string[] = [];
  let score = 100;

  if (!res.ok) {
    anomalies.push(`Request logprobs ditolak dengan HTTP ${res.status}: ${JSON.stringify(res.data?.error || res.data)}`);
    score = 25;
    details.push('Endpoint menolak parameter logprobs / top_logprobs.');
    return {
      score,
      status: 'warning',
      details,
      anomalies,
      technicalExplanation: 'Banyak proxy scraping dan wrapper model murah tidak mendukung ekstraksi logprobs native dari weights backend.',
    };
  }

  const choices = res.data?.choices;
  const firstChoice = choices?.[0];
  const logprobsData = firstChoice?.logprobs;

  if (logprobsData && (logprobsData.content?.length > 0 || logprobsData.tokens?.length > 0)) {
    details.push('Endpoint mengembalikan struktur logprobs lengkap dengan nilai probabilitas token.');
    const sampleLogprob = logprobsData.content?.[0] || logprobsData.tokens?.[0];
    details.push(`Sampel data logprob: ${JSON.stringify(sampleLogprob).slice(0, 100)}...`);
    score = 100;
  } else {
    anomalies.push('Parameter logprobs diabaikan secara diam-diam (field logprobs bernilai null atau kosong).');
    score = 30;
    details.push('Layanan menerima request 200 OK tetapi tidak menyajikan logprobs token sebenarnya.');
  }

  score = Math.max(0, Math.min(100, score));
  const status = score >= 80 ? 'passed' : score >= 50 ? 'warning' : 'failed';

  const technicalExplanation = anomalies.length > 0
    ? 'Smoking Gun: Layanan web scraping chat UI tidak memiliki akses ke raw logprobs GPU inference engine (seperti vLLM/TRT-LLM/OpenAI native).'
    : 'Dukungan logprobs valid membuktikan endpoint terhubung langsung ke engine inferensi native ber-hak akses token level.';

  return { score, status, details, anomalies, technicalExplanation };
}

export function evaluateContextTest(
  returnedText: string,
  needle: string,
  targetTokens: number,
  durationMs: number,
  error?: string
): {
  score: number;
  status: 'passed' | 'warning' | 'failed';
  details: string[];
  anomalies: string[];
  technicalExplanation: string;
} {
  const details: string[] = [];
  const anomalies: string[] = [];

  details.push(`Ukuran payload context yang diuji: ~${targetTokens.toLocaleString()} tokens`);
  details.push(`Total waktu proses context: ${(durationMs / 1000).toFixed(2)} detik`);

  if (error) {
    anomalies.push(`Gagal memproses context window besar (~${targetTokens} tokens): ${error}`);
    return {
      score: 0,
      status: 'failed',
      details,
      anomalies,
      technicalExplanation: `Reverse-proxy web gratisan biasanya langsung crash (HTTP 502/504 Bad Gateway, payload too large, atau socket timeout) ketika dikirimi payload di atas 8.000 token.`,
    };
  }

  const cleanReturn = returnedText.toUpperCase().trim();
  const cleanNeedle = needle.toUpperCase().trim();

  if (cleanReturn.includes(cleanNeedle)) {
    details.push(`Jarum otentikasi ("${needle}") berhasil ditemukan dan diekstraksi dengan sempurna dari kedalaman context.`);
    return {
      score: 100,
      status: 'passed',
      details,
      anomalies,
      technicalExplanation: `Model berhasil menampung seluruh context ~${targetTokens} token tanpa pemotongan (truncation) tersembunyi.`,
    };
  } else {
    anomalies.push(`Model gagal menemukan kode jarum ("${needle}"). Respon: "${returnedText.slice(0, 120)}..."`);
    details.push('Kemungkinan besar teks dipotong (silently truncated) oleh proxy perantara sebelum mencapai model.');
    return {
      score: 25,
      status: 'failed',
      details,
      anomalies,
      technicalExplanation: 'Teks dipotong oleh lapisan proxy web scraping yang membatasi input payload untuk menghemat kuota browser headless.',
    };
  }
}

export function evaluateSpecialTokenTest(
  modelName: string,
  responseText: string
): {
  score: number;
  status: 'passed' | 'warning' | 'failed';
  details: string[];
  anomalies: string[];
  technicalExplanation: string;
} {
  const details: string[] = [];
  const anomalies: string[] = [];
  const lower = responseText.toLowerCase();
  let score = 100;

  // Check if system prompt leak happened or delimiters revealed
  if (lower.includes('system prompt:') || lower.includes('you are a helpful assistant') || lower.includes('current date is') || lower.includes('knowledge cutoff')) {
    details.push('Model merespons probe pembatas percakapan dan metadata sistem.');
  }

  // DeepSeek reasoning content check
  if (modelName.toLowerCase().includes('r1') || modelName.toLowerCase().includes('reasoner')) {
    if (responseText.includes('<think>') && responseText.includes('</think>')) {
      details.push('Ditemukan tag native thinking <think>...</think> khas DeepSeek R1.');
    } else {
      anomalies.push('Model berlabel DeepSeek R1 tetapi tidak menyajikan reasoning step atau tag <think>.');
      score -= 40;
    }
  }

  score = Math.max(0, Math.min(100, score));
  const status = score >= 80 ? 'passed' : score >= 50 ? 'warning' : 'failed';

  return {
    score,
    status,
    details,
    anomalies,
    technicalExplanation: anomalies.length > 0
      ? `Terdeteksi anomali pada format output atau delimiter: ${anomalies.join(' ')}`
      : 'Struktur output dan penanganan token khusus sesuai dengan norma model resmi.',
  };
}

export function computeOverallVerdict(results: TestResult[]): OverallVerdict {
  if (results.length === 0) {
    return {
      score: 0,
      verdict: 'suspicious',
      title: 'Belum Ada Pengujian',
      summary: 'Silakan jalankan pengujian untuk mengukur keaslian endpoint model.',
      recommendations: ['Pilih endpoint dan klik "Jalankan Semua Pengujian".'],
    };
  }

  let totalWeight = 0;
  let weightedScore = 0;

  for (const r of results) {
    if (r.status !== 'skipped' && r.status !== 'idle') {
      weightedScore += r.score * r.weight;
      totalWeight += r.weight;
    }
  }

  const finalScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;

  if (finalScore >= 80) {
    return {
      score: finalScore,
      verdict: 'authentic',
      title: '🟢 TERVERIFIKASI ASLI (NATIVE UPSTREAM API)',
      summary: 'Endpoint ini menunjukkan karakteristik otentik API resmi: latensi TTFT sangat rendah, pemahaman tokenizer native akurat, integritas context window penuh, dan mendukung parameter teknis tingkat rendah.',
      recommendations: [
        'Endpoint aman digunakan untuk implementasi produksi.',
        'Kapasitas context window dan streaming latency berada dalam standar SLA vendor resmi.',
      ],
    };
  } else if (finalScore >= 50) {
    return {
      score: finalScore,
      verdict: 'suspicious',
      title: '🟡 MENCURIGAKAN (INKONSISTEN / AGGREGATOR WRAPPER)',
      summary: 'Ditemukan beberapa anomali pada parameter teknis, latensi TTFT di atas ambang normal, atau pemotongan context window. Kemungkinan endpoint ini adalah aggregator tingkat kedua atau model terkompresi.',
      recommendations: [
        'Periksa apakah penyedia API menerapkan caching agresif atau rate-limiting internal.',
        'Waspadai potensi kegagalan saat menangani dokumen panjang di atas 8k token.',
        'Lakukan pengujian logprobs dan needle retrieval secara berkala.',
      ],
    };
  } else {
    return {
      score: finalScore,
      verdict: 'fake',
      title: '🔴 TERINDIKASI KUAT MASKING / REVERSE-PROXY PALSU',
      summary: 'Endpoint ini terindikasi bukan API resmi upstream melainkan hasil masking (misalnya membungkus model murah seperti Llama/Qwen menjadi model mahal, atau melakukan scraping headless browser dari web gratisan).',
      recommendations: [
        'Hentikan penggunaan endpoint ini untuk sistem penting karena berisiko error 502/429 tiba-tiba.',
        'Layanan masking sering kali menyensor, memotong, atau mengubah output tanpa izin.',
        'Segera minta klarifikasi ke penyedia API (misal Dattio/reseller) terkait lisensi upstream resminya.',
      ],
    };
  }
}
