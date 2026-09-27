const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Helper to normalize base URL
function normalizeChatUrl(baseUrl) {
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
});

// Non-streaming test endpoint (useful for logprobs, parameter fidelity, etc.)
app.post('/api/check-direct', async (req, res) => {
  const { baseUrl, apiKey, model, messages, temperature, max_tokens, logprobs, top_logprobs, timeoutMs = 60000, seed } = req.body;

  if (!baseUrl || !model) {
    return res.status(400).json({ error: 'baseUrl and model are required' });
  }

  const targetUrl = normalizeChatUrl(baseUrl);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const startTime = performance.now();

  try {
    const payload = {
      model,
      messages: messages || [{ role: 'user', content: 'Ping' }],
      stream: false,
    };
    if (temperature !== undefined) payload.temperature = temperature;
    if (max_tokens !== undefined) payload.max_tokens = max_tokens;
    if (logprobs !== undefined) payload.logprobs = logprobs;
    if (top_logprobs !== undefined) payload.top_logprobs = top_logprobs;
    if (seed !== undefined) payload.seed = seed;

    const headers = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey.trim()}`;
    }

    const upstreamRes = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const durationMs = Math.round(performance.now() - startTime);

    const status = upstreamRes.status;
    const responseHeaders = {};
    for (const [key, value] of upstreamRes.headers.entries()) {
      if (key.startsWith('x-') || key === 'server' || key === 'content-type' || key.includes('ratelimit') || key.includes('cf-')) {
        responseHeaders[key] = value;
      }
    }

    const rawText = await upstreamRes.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { raw: rawText };
    }

    return res.status(status).json({
      status,
      ok: upstreamRes.ok,
      durationMs,
      headers: responseHeaders,
      data,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const durationMs = Math.round(performance.now() - startTime);
    const isTimeout = err.name === 'AbortError';

    return res.status(isTimeout ? 504 : 500).json({
      error: isTimeout ? `Request timed out after ${timeoutMs}ms` : (err.message || 'Fetch error'),
      durationMs,
      isTimeout,
    });
  }
});

// High-precision streaming endpoint for TTFT and jitter benchmark
app.post('/api/check-stream', async (req, res) => {
  const { baseUrl, apiKey, model, messages, temperature = 0.7, max_tokens = 512, timeoutMs = 45000 } = req.body;

  if (!baseUrl || !model) {
    return res.status(400).json({ error: 'baseUrl and model are required' });
  }

  const targetUrl = normalizeChatUrl(baseUrl);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Set SSE headers to client
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const startTime = performance.now();
  sendEvent('start', { timestamp: Date.now(), targetUrl });

  let ttftMs = null;
  let firstChunkTime = null;
  let chunkCount = 0;
  let totalText = '';
  let reasoningText = '';
  const chunkArrivalIntervals = [];
  let lastChunkTime = null;

  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey.trim()}`;
    }

    const payload = {
      model,
      messages: messages || [{ role: 'user', content: 'Ping' }],
      stream: true,
      temperature,
      max_tokens,
    };

    const upstreamRes = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const headersObj = {};
    for (const [k, v] of upstreamRes.headers.entries()) {
      if (k.startsWith('x-') || k === 'server' || k.includes('ratelimit') || k.includes('cf-')) {
        headersObj[k] = v;
      }
    }

    if (!upstreamRes.ok) {
      clearTimeout(timeoutId);
      const errText = await upstreamRes.text();
      sendEvent('error', {
        status: upstreamRes.status,
        statusText: upstreamRes.statusText,
        durationMs: Math.round(performance.now() - startTime),
        rawError: errText,
        headers: headersObj,
      });
      return res.end();
    }

    const reader = upstreamRes.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      const now = performance.now();

      if (done) break;

      const chunkStr = decoder.decode(value, { stream: true });
      buffer += chunkStr;

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;

        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6);
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta || {};
            const textContent = delta.content || '';
            const reasoningContent = delta.reasoning_content || '';

            if (textContent || reasoningContent) {
              chunkCount++;
              if (ttftMs === null) {
                ttftMs = Math.round(now - startTime);
                firstChunkTime = now;
                lastChunkTime = now;
                sendEvent('ttft', {
                  ttftMs,
                  headers: headersObj,
                  modelClaimed: parsed.model || model,
                });
              } else {
                const interval = Math.round(now - lastChunkTime);
                chunkArrivalIntervals.push(interval);
                lastChunkTime = now;
              }

              if (textContent) totalText += textContent;
              if (reasoningContent) reasoningText += reasoningContent;

              sendEvent('token', {
                chunkIndex: chunkCount,
                content: textContent,
                reasoning: reasoningContent,
                elapsedMs: Math.round(now - startTime),
              });
            }
          } catch {
            // Ignore non-json lines
          }
        }
      }
    }

    clearTimeout(timeoutId);
    const totalDurationMs = Math.round(performance.now() - startTime);

    // Compute jitter and tokens per second
    const streamingDurationSec = firstChunkTime ? (performance.now() - firstChunkTime) / 1000 : 0.001;
    const tokensPerSec = chunkCount > 0 && streamingDurationSec > 0 
      ? Number((chunkCount / streamingDurationSec).toFixed(1)) 
      : 0;

    let avgInterval = 0;
    let maxInterval = 0;
    let jitter = 0;

    if (chunkArrivalIntervals.length > 0) {
      const sum = chunkArrivalIntervals.reduce((a, b) => a + b, 0);
      avgInterval = Math.round(sum / chunkArrivalIntervals.length);
      maxInterval = Math.max(...chunkArrivalIntervals);
      
      const variance = chunkArrivalIntervals.reduce((acc, val) => acc + Math.pow(val - avgInterval, 2), 0) / chunkArrivalIntervals.length;
      jitter = Math.round(Math.sqrt(variance));
    }

    sendEvent('complete', {
      totalDurationMs,
      ttftMs: ttftMs || totalDurationMs,
      chunkCount,
      tokensPerSec,
      avgIntervalMs: avgInterval,
      maxIntervalMs: maxInterval,
      jitterMs: jitter,
      totalText,
      reasoningText,
      headers: headersObj,
    });

    res.end();
  } catch (err) {
    clearTimeout(timeoutId);
    const isTimeout = err.name === 'AbortError';
    sendEvent('error', {
      isTimeout,
      error: isTimeout ? `Streaming request timed out (${timeoutMs}ms)` : (err.message || 'Stream connection error'),
      durationMs: Math.round(performance.now() - startTime),
    });
    res.end();
  }
});

// Serve frontend build if dist folder exists (for production)
app.use(express.static(path.join(__dirname, '../dist')));
app.use((req, res) => {
  const indexPath = path.join(__dirname, '../dist/index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ message: 'Model Legit Check API Server running. Start Vite dev server for frontend.' });
  }
});

app.listen(PORT, () => {
  console.log(`[LegitCheck Server] Running on http://localhost:${PORT}`);
});
