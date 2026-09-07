import { getHealthUrl } from './client';

export interface HealthCheckResult {
  healthy: boolean;
  message: string;
  latencyMs: number;
}

export async function checkBackendHealth(): Promise<HealthCheckResult> {
  const start = performance.now();
  const healthUrl = getHealthUrl();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(healthUrl, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);

    const latencyMs = Math.round(performance.now() - start);

    if (response.ok) {
      const text = await response.text();
      return {
        healthy: true,
        message: text.trim() || 'IIMS Backend is operational',
        latencyMs,
      };
    } else {
      return {
        healthy: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
        latencyMs,
      };
    }
  } catch (error: any) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      healthy: false,
      message: error?.message || 'Server connection unreachable',
      latencyMs,
    };
  }
}
