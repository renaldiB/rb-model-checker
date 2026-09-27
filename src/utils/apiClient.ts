import { EndpointConfig } from '../types';

export interface StreamCallbacks {
  onStart?: () => void;
  onTtft?: (ttftMs: number, headers?: Record<string, string>) => void;
  onToken?: (token: string, reasoning?: string, elapsedMs?: number) => void;
  onComplete?: (result: {
    totalDurationMs: number;
    ttftMs: number;
    tokenCount: number;
    tokensPerSec: number;
    jitterMs: number;
    totalText: string;
    reasoningText: string;
    headers?: Record<string, string>;
  }) => void;
  onError?: (err: { message: string; durationMs: number; status?: number; raw?: string }) => void;
}

function normalizeChatUrl(baseUrl: string): string {
  let url = baseUrl.trim().replace(/\/+$/, '');
  if (!url.endsWith('/chat/completions')) {
    if (url.endsWith('/v1')) {
      url = `${url}/chat/completions`;
    } else {
      url = `${url}/v1/chat/completions`;
    }
  }
  return url;
}

export async function executeDirectRequest(
  config: EndpointConfig,
  payload: {
    messages: Array<{ role: string; content: string }>;
    temperature?: number;
    max_tokens?: number;
    logprobs?: boolean;
    top_logprobs?: number;
    seed?: number;
    timeoutMs?: number;
  }
) {
  const timeoutMs = payload.timeoutMs || 45000;

  if (config.proxyMode === 'server') {
    try {
      const res = await fetch('/api/check-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: config.baseUrl,
          apiKey: config.apiKey,
          model: config.model,
          messages: payload.messages,
          temperature: payload.temperature,
          max_tokens: payload.max_tokens,
          logprobs: payload.logprobs,
          top_logprobs: payload.top_logprobs,
          seed: payload.seed,
          timeoutMs,
        }),
      });

      if (res.status === 404) {
        return {
          status: 404,
          ok: false,
          durationMs: 0,
          headers: {},
          data: { error: 'Server proxy tidak aktif di hosting statis (Netlify). Silakan ubah "Mode Request" menjadi "Direct Client" di pengaturan.' },
        };
      }

      const data = await res.json();
      return {
        status: res.status,
        ok: res.ok,
        durationMs: data.durationMs || 0,
        headers: data.headers || {},
        data: data.data || data,
      };
    } catch {
      return {
        status: 0,
        ok: false,
        durationMs: 0,
        headers: {},
        data: { error: 'Server proxy lokal tidak dapat dijangkau. Jika Anda menggunakan Netlify, silakan ubah "Mode Request" ke "Direct Client".' },
      };
    }
  }

  // Browser direct fetch
  const targetUrl = normalizeChatUrl(config.baseUrl);
  const startTime = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;
    }

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.model,
        messages: payload.messages,
        temperature: payload.temperature,
        max_tokens: payload.max_tokens,
        logprobs: payload.logprobs,
        top_logprobs: payload.top_logprobs,
        seed: payload.seed,
        stream: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    const durationMs = Math.round(performance.now() - startTime);
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((val, key) => {
      responseHeaders[key] = val;
    });

    return {
      status: res.status,
      ok: res.ok,
      durationMs,
      headers: responseHeaders,
      data,
    };
  } catch (err: unknown) {
    clearTimeout(timer);
    const durationMs = Math.round(performance.now() - startTime);
    const errorMsg = err instanceof Error ? err.message : 'Network error';
    return {
      status: 0,
      ok: false,
      durationMs,
      headers: {},
      data: { error: errorMsg },
    };
  }
}

export async function executeStreamRequest(
  config: EndpointConfig,
  payload: {
    messages: Array<{ role: string; content: string }>;
    temperature?: number;
    max_tokens?: number;
    timeoutMs?: number;
  },
  callbacks: StreamCallbacks
) {
  const timeoutMs = payload.timeoutMs || 60000;

  if (config.proxyMode === 'server') {
    // Call server SSE proxy
    callbacks.onStart?.();
    let res;
    try {
      res = await fetch('/api/check-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: config.baseUrl,
          apiKey: config.apiKey,
          model: config.model,
          messages: payload.messages,
          temperature: payload.temperature ?? 0.7,
          max_tokens: payload.max_tokens ?? 512,
          timeoutMs,
        }),
      });
    } catch {
      callbacks.onError?.({
        message: 'Server proxy lokal tidak dapat dijangkau. Jika Anda menggunakan Netlify, silakan ubah "Mode Request" ke "Direct Client".',
        durationMs: 0,
      });
      return;
    }

    if (!res.ok) {
      const errText = await res.text();
      const is404 = res.status === 404;
      callbacks.onError?.({
        message: is404
          ? 'Server proxy tidak aktif di hosting statis (Netlify). Silakan ganti "Mode Request" ke "Direct Client".'
          : `Server error: ${res.statusText}`,
        durationMs: 0,
        raw: errText,
      });
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      callbacks.onError?.({ message: 'No readable stream available', durationMs: 0 });
      return;
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        if (!part.trim()) continue;
        const lines = part.split('\n');
        let event = 'message';
        let dataStr = '';

        for (const line of lines) {
          if (line.startsWith('event: ')) event = line.slice(7).trim();
          if (line.startsWith('data: ')) dataStr = line.slice(6).trim();
        }

        if (dataStr) {
          try {
            const data = JSON.parse(dataStr);
            if (event === 'ttft') {
              callbacks.onTtft?.(data.ttftMs, data.headers);
            } else if (event === 'token') {
              callbacks.onToken?.(data.content, data.reasoning, data.elapsedMs);
            } else if (event === 'complete') {
              callbacks.onComplete?.({
                totalDurationMs: data.totalDurationMs,
                ttftMs: data.ttftMs,
                tokenCount: data.chunkCount,
                tokensPerSec: data.tokensPerSec,
                jitterMs: data.jitterMs,
                totalText: data.totalText,
                reasoningText: data.reasoningText,
                headers: data.headers,
              });
            } else if (event === 'error') {
              callbacks.onError?.({
                message: data.error || data.statusText || 'Stream failed',
                durationMs: data.durationMs || 0,
                status: data.status,
                raw: data.rawError,
              });
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
    return;
  }

  // Direct browser stream
  const targetUrl = normalizeChatUrl(config.baseUrl);
  callbacks.onStart?.();
  const startTime = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;
    }

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.model,
        messages: payload.messages,
        stream: true,
        temperature: payload.temperature ?? 0.7,
        max_tokens: payload.max_tokens ?? 512,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      clearTimeout(timer);
      const rawText = await res.text();
      callbacks.onError?.({
        message: `HTTP ${res.status}: ${res.statusText}`,
        durationMs: Math.round(performance.now() - startTime),
        status: res.status,
        raw: rawText,
      });
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      clearTimeout(timer);
      callbacks.onError?.({ message: 'Stream not readable by browser', durationMs: 0 });
      return;
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let ttftMs: number | null = null;
    let firstChunkTime: number | null = null;
    let lastChunkTime: number | null = null;
    let chunkCount = 0;
    let totalText = '';
    let reasoningText = '';
    const chunkArrivalIntervals: number[] = [];

    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((val, key) => {
      responseHeaders[key] = val;
    });

    while (true) {
      const { done, value } = await reader.read();
      const now = performance.now();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (trimmed.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            const delta = parsed.choices?.[0]?.delta || {};
            const textContent = delta.content || '';
            const reasoningContent = delta.reasoning_content || '';

            if (textContent || reasoningContent) {
              chunkCount++;
              if (ttftMs === null) {
                ttftMs = Math.round(now - startTime);
                firstChunkTime = now;
                lastChunkTime = now;
                callbacks.onTtft?.(ttftMs, responseHeaders);
              } else if (lastChunkTime !== null) {
                chunkArrivalIntervals.push(Math.round(now - lastChunkTime));
                lastChunkTime = now;
              }

              if (textContent) totalText += textContent;
              if (reasoningContent) reasoningText += reasoningContent;
              callbacks.onToken?.(textContent, reasoningContent, Math.round(now - startTime));
            }
          } catch {
            // Ignore non-json
          }
        }
      }
    }

    clearTimeout(timer);
    const totalDurationMs = Math.round(performance.now() - startTime);
    const streamingDurationSec = firstChunkTime ? (performance.now() - firstChunkTime) / 1000 : 0.001;
    const tokensPerSec = chunkCount > 0 && streamingDurationSec > 0
      ? Number((chunkCount / streamingDurationSec).toFixed(1))
      : 0;

    let jitter = 0;
    if (chunkArrivalIntervals.length > 0) {
      const avg = chunkArrivalIntervals.reduce((a, b) => a + b, 0) / chunkArrivalIntervals.length;
      const variance = chunkArrivalIntervals.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / chunkArrivalIntervals.length;
      jitter = Math.round(Math.sqrt(variance));
    }

    callbacks.onComplete?.({
      totalDurationMs,
      ttftMs: ttftMs || totalDurationMs,
      tokenCount: chunkCount,
      tokensPerSec,
      jitterMs: jitter,
      totalText,
      reasoningText,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    clearTimeout(timer);
    const durationMs = Math.round(performance.now() - startTime);
    const msg = err instanceof Error ? err.message : 'Streaming aborted or network error';
    callbacks.onError?.({
      message: msg,
      durationMs,
    });
  }
}
