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
  detectedRealModel?: string;
} {
  const lowerText = responseText.toLowerCase();
  const lowerModel = modelName.toLowerCase();
  const anomalies: string[] = [];
  const details: string[] = [];
  let score = 100;
  let detectedRealModel: string | undefined;

  // 1. Check for blatant model identity spoofing / masking leaks
  if (lowerModel.includes('deepseek')) {
    if (lowerText.includes('llama') && !lowerText.includes('perbedaan dengan llama') && !lowerText.includes('seperti llama')) {
      detectedRealModel = 'Meta Llama (Llama-3 / 3.1)';
      anomalies.push('Model DeepSeek membocorkan identitas aslinya: berbasis arsitektur Meta Llama.');
      score -= 50;
    }
    if (lowerText.includes('qwen') && !lowerText.includes('perbedaan dengan qwen') && !lowerText.includes('seperti qwen')) {
      detectedRealModel = 'Alibaba Qwen (Qwen-2.5)';
      anomalies.push('Model DeepSeek terindikasi arsitektur Alibaba Qwen (digunakan sebagai backend mock).');
      score -= 50;
    }
    if (lowerText.includes('chatgpt') || lowerText.includes('openai')) {
      if (!lowerText.includes('cl100k_base') && !lowerText.includes('seperti openai')) {
        detectedRealModel = 'OpenAI ChatGPT (Web Wrapper)';
        anomalies.push('Model DeepSeek mengaku produk OpenAI/ChatGPT.');
        score -= 60;
      }
    }
    if (lowerText.includes('byte-level bpe') || lowerText.includes('bpe') || lowerText.includes('byte-fallback') || lowerText.includes('129k') || lowerText.includes('128k') || lowerText.includes('102k')) {
      details.push('Menjelaskan mekanisme Byte-level BPE / Byte-fallback dengan akurat.');
    }
  } else if (lowerModel.includes('gpt-4o') || lowerModel.includes('gpt-4')) {
    if (lowerText.includes('o200k_base') || lowerText.includes('o200k')) {
      details.push('Berhasil mengidentifikasi native tokenizer GPT-4o: o200k_base.');
    } else if (lowerText.includes('cl100k_base') && !lowerText.includes('gpt-4')) {
      detectedRealModel = 'GPT-3.5-Turbo / Legacy GPT-4 (Fallback)';
      anomalies.push('Mengaku menggunakan cl100k_base padahal GPT-4o native menggunakan o200k_base (kemungkinan fallback ke GPT-4/GPT-3.5 turbo).');
      score -= 30;
    }

    if (lowerText.includes('llama')) {
      detectedRealModel = 'Meta Llama (Llama-3 / 3.1)';
      anomalies.push('Endpoint GPT-4o terindikasi membocorkan identitas model open-weight (Meta Llama).');
      score -= 70;
    } else if (lowerText.includes('qwen')) {
      detectedRealModel = 'Alibaba Qwen (Qwen-2.5)';
      anomalies.push('Endpoint GPT-4o terindikasi membocorkan identitas model open-weight (Alibaba Qwen).');
      score -= 70;
    }
  } else if (lowerModel.includes('claude')) {
    if (lowerText.includes('openai') || lowerText.includes('chatgpt')) {
      detectedRealModel = 'OpenAI GPT (Bukan Claude)';
      anomalies.push('Endpoint Claude mengaku dikembangkan oleh OpenAI.');
      score -= 70;
    } else if (lowerText.includes('llama')) {
      detectedRealModel = 'Meta Llama (Llama-3)';
      anomalies.push('Endpoint Claude terindikasi membocorkan arsitektur Meta Llama.');
      score -= 70;
    }
  }

  // Fallback detection if model admitted training origin
  if (!detectedRealModel) {
    if (lowerText.includes('dibuat oleh meta') || lowerText.includes('trained by meta') || lowerText.includes('saya llama')) {
      detectedRealModel = 'Meta Llama (Llama-3)';
    } else if (lowerText.includes('dibuat oleh alibaba') || lowerText.includes('trained by alibaba') || lowerText.includes('saya qwen')) {
      detectedRealModel = 'Alibaba Qwen (Qwen-2.5)';
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
    ? `Ditemukan kejanggalan identitas/tokenizer: ${anomalies.join(' ')} ${detectedRealModel ? `Model asli yang membocorkan diri: ${detectedRealModel}.` : ''}`
    : `Model merespons pengetahuan tokenizer secara konsisten dengan spesifikasi resmi dari vendor claimed (${modelName}).`;

  return { score, status, details, anomalies, technicalExplanation, detectedRealModel };
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
    const lower = error.toLowerCase();
    const isAuth = lower.includes('401') || lower.includes('unauthorized') || lower.includes('invalid api key') || lower.includes('api key');
    const isModel = lower.includes('model_not_found') || lower.includes('model not found') || lower.includes('does not exist') || lower.includes('no endpoints');
    const isNetwork = lower.includes('failed to fetch') || lower.includes('network error') || lower.includes('connection') || lower.includes('tidak dapat dijangkau');

    let anomalyText = 'Endpoint menolak koneksi streaming.';
    let explanationText = 'Layanan reverse-proxy web scraping sering memutus koneksi streaming atau mengalami rate-limit 429 saat memproses traffic.';

    if (isAuth) {
      anomalyText = 'Autentikasi ditolak: API Key tidak valid atau tidak memiliki izin akses (HTTP 401).';
      explanationText = 'Server upstream menolak request karena API Key salah atau kedaluwarsa. Periksa nilai API Key Anda.';
    } else if (isModel) {
      anomalyText = 'Nama model tidak ditemukan di endpoint ini (HTTP 404/400).';
      explanationText = 'Server tidak mengenali nama model yang diinput. Periksa ejaan atau format prefix vendor.';
    } else if (isNetwork) {
      anomalyText = 'Gagal menghubungi Base URL server.';
      explanationText = 'Koneksi ke Base URL gagal. Periksa format URL atau gunakan mode Direct Client/Server Proxy yang sesuai.';
    }

    return {
      score: 0,
      status: 'failed',
      details: [`Koneksi streaming gagal: ${error}`],
      anomalies: [anomalyText],
      technicalExplanation: explanationText,
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
    const errObj = res.data?.error || res.data;
    const errStr = typeof errObj === 'string' ? errObj : JSON.stringify(errObj);
    const lower = errStr.toLowerCase();

    const isAuth = res.status === 401 || lower.includes('401') || lower.includes('unauthorized') || lower.includes('api key');
    const isModel = res.status === 404 || lower.includes('model_not_found') || lower.includes('does not exist') || lower.includes('no endpoints');

    if (isAuth || isModel) {
      return {
        score: 0,
        status: 'failed',
        details: [`Request logprobs ditolak (${res.status}): ${errStr}`],
        anomalies: [isAuth ? 'API Key tidak valid (HTTP 401).' : 'Model tidak ditemukan di endpoint ini.'],
        technicalExplanation: isAuth
          ? 'Autentikasi ditolak: API Key salah atau tidak memiliki izin akses.'
          : 'Nama model tidak terdaftar pada endpoint provider ini.',
      };
    }

    anomalies.push(`Request logprobs ditolak dengan HTTP ${res.status}: ${errStr}`);
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
    const lower = error.toLowerCase();
    const isAuth = lower.includes('401') || lower.includes('unauthorized') || lower.includes('api key');
    const isModel = lower.includes('model_not_found') || lower.includes('model not found') || lower.includes('does not exist') || lower.includes('no endpoints');

    let anomalyText = `Gagal memproses context window besar (~${targetTokens} tokens): ${error}`;
    let explanationText = 'Reverse-proxy web gratisan biasanya langsung crash (HTTP 502/504 Bad Gateway, payload too large, atau socket timeout) ketika dikirimi payload di atas 8.000 token.';

    if (isAuth) {
      anomalyText = 'Request context stress ditolak: API Key tidak valid (HTTP 401).';
      explanationText = 'Otentikasi gagal saat mengirim payload stress test. Periksa API Key Anda.';
    } else if (isModel) {
      anomalyText = 'Request context stress ditolak: Nama model tidak ditemukan di endpoint.';
      explanationText = 'Nama model tidak terdaftar untuk memproses context window besar.';
    }

    return {
      score: 0,
      status: 'failed',
      details,
      anomalies: [anomalyText],
      technicalExplanation: explanationText,
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
  detectedRealModel?: string;
} {
  const details: string[] = [];
  const anomalies: string[] = [];
  const lower = responseText.toLowerCase();
  let score = 100;
  let detectedRealModel: string | undefined;

  // Check if system prompt leak happened or delimiters revealed
  if (lower.includes('system prompt:') || lower.includes('you are a helpful assistant') || lower.includes('current date is') || lower.includes('knowledge cutoff')) {
    details.push('Model merespons probe pembatas percakapan dan metadata sistem.');
  }

  if (lower.includes('large language model trained by meta') || lower.includes('i am llama') || lower.includes('saya llama')) {
    detectedRealModel = 'Meta Llama (Llama-3)';
    anomalies.push('System probe membocorkan instruksi sistem asli: Model dibuat oleh Meta (Llama).');
    score -= 60;
  } else if (lower.includes('trained by alibaba') || lower.includes('i am qwen') || lower.includes('saya qwen')) {
    detectedRealModel = 'Alibaba Qwen (Tongyi)';
    anomalies.push('System probe membocorkan instruksi sistem asli: Model dibuat oleh Alibaba (Qwen).');
    score -= 60;
  } else if (lower.includes('trained by openai') && !modelName.toLowerCase().includes('gpt')) {
    detectedRealModel = 'OpenAI ChatGPT';
    anomalies.push('System probe membocorkan instruksi sistem asli: Model dibuat oleh OpenAI.');
    score -= 60;
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
      ? `Terdeteksi anomali pada format output atau delimiter: ${anomalies.join(' ')} ${detectedRealModel ? `Model asli: ${detectedRealModel}.` : ''}`
      : 'Struktur output dan penanganan token khusus sesuai dengan norma model resmi.',
    detectedRealModel,
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

  const executedResults = results.filter((r) => r.status !== 'skipped' && r.status !== 'idle');
  if (executedResults.length === 0) {
    return {
      score: 0,
      verdict: 'suspicious',
      title: 'Pengujian Belum Selesai',
      summary: 'Silakan jalankan pengujian untuk mengukur keaslian endpoint model.',
      recommendations: ['Pilih endpoint dan klik "Jalankan Semua Pengujian".'],
    };
  }

  // Cek apakah kegagalan disebabkan oleh Base URL / API Key / Model / Jaringan
  const allTexts = executedResults
    .flatMap((r) => [...r.details, ...r.anomalies, r.technicalExplanation, r.rawOutput || ''])
    .join(' ')
    .toLowerCase();

  const isAuthError =
    allTexts.includes('401') ||
    allTexts.includes('unauthorized') ||
    allTexts.includes('invalid api key') ||
    allTexts.includes('incorrect api key') ||
    allTexts.includes('invalid_api_key') ||
    allTexts.includes('authentication') ||
    allTexts.includes('bearer');

  const isModelError =
    allTexts.includes('model_not_found') ||
    allTexts.includes('model not found') ||
    allTexts.includes('no endpoints found') ||
    allTexts.includes('does not exist') ||
    allTexts.includes('unknown model') ||
    allTexts.includes('invalid model') ||
    allTexts.includes('not found for') ||
    allTexts.includes('is not supported');

  const isNetworkOrUrlError =
    allTexts.includes('failed to fetch') ||
    allTexts.includes('network error') ||
    allTexts.includes('econnrefused') ||
    allTexts.includes('enotfound') ||
    allTexts.includes('tidak dapat dijangkau') ||
    allTexts.includes('cors') ||
    allTexts.includes('net::err');

  const isQuotaError =
    allTexts.includes('insufficient_quota') ||
    allTexts.includes('exceeded your current quota') ||
    allTexts.includes('credits') ||
    (allTexts.includes('quota') && allTexts.includes('429'));

  // Hitung jumlah tes yang gagal karena error config
  const modelNotFoundCount = executedResults.filter((r) => {
    const text = [...r.details, ...r.anomalies, r.technicalExplanation, r.rawOutput || ''].join(' ').toLowerCase();
    return (
      text.includes('model_not_found') ||
      text.includes('model not found') ||
      text.includes('no endpoints found') ||
      text.includes('does not exist') ||
      text.includes('unknown model') ||
      text.includes('invalid model') ||
      text.includes('not found for')
    );
  }).length;

  const authErrorCount = executedResults.filter((r) => {
    const text = [...r.details, ...r.anomalies, r.technicalExplanation, r.rawOutput || ''].join(' ').toLowerCase();
    return text.includes('401') || text.includes('unauthorized') || text.includes('invalid api key') || text.includes('incorrect api key');
  }).length;

  const allTestsFailed = executedResults.every((r) => r.status === 'failed' || r.score === 0);
  const isDominantConfigError = allTestsFailed || modelNotFoundCount >= 1 || authErrorCount >= 1;

  // Jika kegagalan adalah karena salah Model / Auth / URL / Quota
  if (isDominantConfigError && (isModelError || isAuthError || isNetworkOrUrlError || isQuotaError)) {
    if (isModelError || modelNotFoundCount >= 1) {
      return {
        score: 0,
        verdict: 'invalid_config',
        title: 'NAMA MODEL TIDAK DITEMUKAN / TIDAK VALID (404/400)',
        summary: 'Penyedia API menolak permintaan karena nama model yang diinput tidak terdaftar pada server mereka (HTTP 400/404 Model Not Found). Hasil ini murni karena kesalahan nama model, bukan karena model palsu (masking).',
        recommendations: [
          'Periksa ejaan nama model pada input MODEL IDENTIFIER.',
          'Jika menggunakan OpenRouter, wajib sertakan prefix vendor (contoh: deepseek/deepseek-chat atau openai/gpt-4o).',
          'Jika menggunakan API resmi (OpenAI/DeepSeek), pastikan tanpa prefix vendor (contoh: cukup deepseek-chat atau gpt-4o).',
          'Cek dokumentasi provider Anda untuk melihat daftar nama model aktif yang didukung.',
        ],
      };
    }

    if (isAuthError || authErrorCount >= 1) {
      return {
        score: 0,
        verdict: 'invalid_config',
        title: 'API KEY TIDAK VALID / DITOLAK (401)',
        summary: 'Endpoint menolak pengujian karena API Key / Bearer Token tidak valid, tidak memiliki izin, atau telah kedaluwarsa (HTTP 401 Unauthorized). Hasil ini murni karena otentikasi akun gagal, bukan karena model palsu (masking).',
        recommendations: [
          'Periksa kembali nilai API Key yang Anda masukkan pada form konfigurasi.',
          'Pastikan tidak ada karakter spasi ekstra di awal atau akhir token.',
          'Pastikan API Key memiliki status aktif dan kuota yang cukup pada dashboard vendor Anda.',
        ],
      };
    }

    if (isQuotaError) {
      return {
        score: 0,
        verdict: 'invalid_config',
        title: 'KUOTA / SALDO TOKEN API HABIS (429)',
        summary: 'Penyedia API menolak pengujian karena kuota atau saldo billing pada akun API Key Anda telah habis (HTTP 429 Insufficient Quota). Hasil ini murni karena saldo habis, bukan karena model palsu (masking).',
        recommendations: [
          'Isi ulang saldo (top up billing) pada dashboard penyedia AI Anda.',
          'Gunakan API Key lain yang masih memiliki sisa saldo aktif.',
        ],
      };
    }

    if (isNetworkOrUrlError) {
      return {
        score: 0,
        verdict: 'invalid_config',
        title: 'BASE URL TIDAK VALID / KONEKSI GAGAL',
        summary: 'Aplikasi tidak dapat menghubungi alamat Base URL yang Anda masukkan (Koneksi gagal / URL 404 / Terblokir CORS). Hasil ini murni karena endpoint tidak dapat dijangkau, bukan karena model palsu (masking).',
        recommendations: [
          'Periksa kembali format Base URL (contoh: https://api.openai.com/v1 atau https://api.deepseek.com/v1).',
          'Jika membuka web ini dari Netlify/hosting online, pastikan Protocol disetel ke "Direct Client".',
          'Pastikan server tujuan mengizinkan akses dari browser (CORS Policy) atau gunakan Server Proxy lokal.',
        ],
      };
    }

    return {
      score: 0,
      verdict: 'invalid_config',
      title: 'KONFIGURASI TIDAK VALID / ENDPOINT GAGAL DIHUBUNGI',
      summary: 'Semua pengujian gagal berkomunikasi dengan endpoint AI. Kegagalan ini disebabkan oleh Base URL, API Key, atau Model Identifier yang tidak valid, bukan karena indikasi manipulasi model.',
      recommendations: [
        'Periksa kembali ketiga parameter: Base URL, API Key, dan nama model.',
        'Pastikan endpoint AI Anda aktif dan dapat menerima permintaan.',
      ],
    };
  }

  // Evaluasi normal untuk model yang berhasil merespon
  let totalWeight = 0;
  let weightedScore = 0;

  for (const r of executedResults) {
    weightedScore += r.score * r.weight;
    totalWeight += r.weight;
  }

  const finalScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;

  if (finalScore >= 80) {
    return {
      score: finalScore,
      verdict: 'authentic',
      title: 'TERVERIFIKASI ASLI (NATIVE UPSTREAM API)',
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
      title: 'MENCURIGAKAN (INKONSISTEN / AGGREGATOR WRAPPER)',
      summary: 'Ditemukan beberapa anomali pada parameter teknis, latensi TTFT di atas ambang normal, atau pemotongan context window. Kemungkinan endpoint ini adalah aggregator tingkat kedua atau model terkompresi.',
      recommendations: [
        'Periksa apakah penyedia API menerapkan caching agresif atau rate-limiting internal.',
        'Waspadai potensi kegagalan saat menangani dokumen panjang di atas 8k token.',
        'Lakukan pengujian logprobs dan needle retrieval secara berkala.',
      ],
    };
  } else {
    // Cari apakah ada model asli yang terdeteksi membocorkan identitasnya
    const detectedRealModel = executedResults.find((r) => r.detectedRealModel)?.detectedRealModel;

    return {
      score: finalScore,
      verdict: 'fake',
      title: detectedRealModel
        ? `TERINDIKASI MASKING: TERDETEKSI SEBAGAI ${detectedRealModel.toUpperCase()}`
        : 'TERINDIKASI KUAT MASKING / REVERSE-PROXY PALSU',
      summary: detectedRealModel
        ? `Endpoint ini terbukti melakukan masking. Model yang Anda minta sebenarnya dialihkan dan diproses oleh ${detectedRealModel}. Reseller membungkus model ini untuk meniru model yang Anda klaim demi memangkas biaya server.`
        : 'Endpoint ini terindikasi bukan API resmi upstream melainkan hasil masking (misalnya membungkus model murah seperti Llama/Qwen menjadi model mahal, atau melakukan scraping headless browser dari web gratisan).',
      recommendations: [
        ...(detectedRealModel ? [`Model asli yang terdeteksi: ${detectedRealModel}.`] : []),
        'Hentikan penggunaan endpoint ini untuk sistem penting karena berisiko error 502/429 tiba-tiba.',
        'Layanan masking sering kali menyensor, memotong, atau mengubah output tanpa izin.',
        'Segera minta klarifikasi ke penyedia API / reseller terkait lisensi upstream resminya.',
      ],
      detectedRealModel,
    };
  }
}
