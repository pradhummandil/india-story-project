type MetricSummary = {
  calls: number;
  totalDuration: number;
  slowestDuration: number;
  largestPayload?: number;
};

// Global in-memory metrics cache
const apiMetrics = new Map<string, MetricSummary>();
const dbMetrics = new Map<string, MetricSummary>();
let ssrTotalDuration = 0;
let ssrCount = 0;
let ssrMaxDuration = 0;

export function recordApiMetric(route: string, duration: number, payloadSize?: number) {
  const current = apiMetrics.get(route) || {
    calls: 0,
    totalDuration: 0,
    slowestDuration: 0,
    largestPayload: 0,
  };
  current.calls += 1;
  current.totalDuration += duration;
  if (duration > current.slowestDuration) {
    current.slowestDuration = duration;
  }
  if (payloadSize && payloadSize > (current.largestPayload || 0)) {
    current.largestPayload = payloadSize;
  }
  apiMetrics.set(route, current);
}

export function recordDbMetric(query: string, duration: number) {
  const current = dbMetrics.get(query) || {
    calls: 0,
    totalDuration: 0,
    slowestDuration: 0,
  };
  current.calls += 1;
  current.totalDuration += duration;
  if (duration > current.slowestDuration) {
    current.slowestDuration = duration;
  }
  dbMetrics.set(query, current);
}

export function recordSsrMetric(duration: number) {
  ssrCount += 1;
  ssrTotalDuration += duration;
  if (duration > ssrMaxDuration) {
    ssrMaxDuration = duration;
  }
}

export function getMetricsReport() {
  const apiReport = Array.from(apiMetrics.entries()).map(([route, m]) => ({
    route,
    calls: m.calls,
    avgDuration: `${Math.round(m.totalDuration / m.calls)}ms`,
    slowestDuration: `${m.slowestDuration}ms`,
    largestPayload: m.largestPayload ? `${Math.round(m.largestPayload / 1024)} KB` : undefined,
  }));

  const dbReport = Array.from(dbMetrics.entries()).map(([query, m]) => ({
    query: query.substring(0, 120) + (query.length > 120 ? "..." : ""),
    calls: m.calls,
    avgDuration: `${Math.round(m.totalDuration / m.calls)}ms`,
    slowestDuration: `${m.slowestDuration}ms`,
  }));

  return {
    ssr: {
      totalRequests: ssrCount,
      avgRenderDuration: ssrCount ? `${Math.round(ssrTotalDuration / ssrCount)}ms` : "0ms",
      slowestRenderDuration: `${ssrMaxDuration}ms`,
    },
    apis: apiReport.sort((a, b) => b.calls - a.calls),
    database: dbReport.sort((a, b) => b.calls - a.calls),
  };
}
