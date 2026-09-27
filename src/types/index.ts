export type ProxyMode = 'server' | 'browser';

export interface EndpointConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  proxyMode: ProxyMode;
  contextSize: number; // 4000, 8000, 16000, 32000
}

export type TestStatus = 'idle' | 'running' | 'passed' | 'warning' | 'failed' | 'skipped';

export interface TestResult {
  id: string;
  name: string;
  shortDesc: string;
  status: TestStatus;
  score: number; // 0 - 100
  weight: number; // For weighted average
  durationMs?: number;
  ttftMs?: number;
  tokensPerSec?: number;
  jitterMs?: number;
  details: string[];
  technicalExplanation: string;
  rawOutput?: string;
  anomalies: string[];
  timestamp?: number;
}

export interface StreamEventData {
  type: 'start' | 'ttft' | 'token' | 'complete' | 'error';
  delta?: string;
  reasoning?: string;
  elapsedMs?: number;
  chunkIndex?: number;
  ttftMs?: number;
  tokensPerSec?: number;
  jitterMs?: number;
  totalDurationMs?: number;
  totalText?: string;
  error?: string;
  rawError?: string;
  headers?: Record<string, string>;
}

export interface OverallVerdict {
  score: number;
  verdict: 'authentic' | 'suspicious' | 'fake' | 'invalid_config';
  title: string;
  summary: string;
  recommendations: string[];
}

export interface PresetProvider {
  name: string;
  baseUrl: string;
  defaultModel: string;
  description: string;
}
