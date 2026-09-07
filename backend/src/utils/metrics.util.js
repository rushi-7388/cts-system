const client = require("prom-client");
const os = require("os");

// Create custom Prometheus registry
const register = new client.Registry();

// Enable standard Node.js runtime and OS metrics
client.collectDefaultMetrics({
  register,
  prefix: "cts_node_",
});

// 1. HTTP Request Metrics
const httpRequestsTotal = new client.Counter({
  name: "cts_http_requests_total",
  help: "Total count of HTTP requests processed by CTS backend API",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: "cts_http_request_duration_seconds",
  help: "Histogram of HTTP request latencies in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

// 2. Cheque Processing & Clearing Velocity Metrics
const chequesPresentedTotal = new client.Counter({
  name: "cts_cheques_presented_total",
  help: "Total number of cheques presented into the clearing grid",
  labelNames: ["presenting_bank", "risk_tier"],
  registers: [register],
});

const chequesClearedTotal = new client.Counter({
  name: "cts_cheques_cleared_total",
  help: "Total number of cheques cleared by Drawee banks",
  labelNames: ["drawee_bank", "settlement_mode"],
  registers: [register],
});

// 3. RBI e-Kuber Continuous Realization & Settlement Volume Metrics
const ekuberRealizationsTotal = new client.Counter({
  name: "cts_ekuber_realizations_total",
  help: "Total number of real-time On-Realisation transactions dispatched to RBI e-Kuber",
  labelNames: ["status", "drawee_bank", "presenting_bank"],
  registers: [register],
});

const settlementVolumeInrTotal = new client.Counter({
  name: "cts_settlement_volume_inr_total",
  help: "Cumulative gross cleared settlement volume in INR",
  labelNames: ["direction", "creditor_bank", "debtor_bank"],
  registers: [register],
});

// 4. Positive Pay System (PPS) Fraud Defense Metrics
const ppsVerificationTotal = new client.Counter({
  name: "cts_pps_verification_total",
  help: "Total count of automated Positive Pay System 5-point reconciliations",
  labelNames: ["result"], // PPS_VERIFIED, PPS_MISMATCH, PPS_NOT_REGISTERED, PPS_NOT_APPLICABLE
  registers: [register],
});

// 5. Central Bank Intraday Collateral Utilization Ratio (0.0 to 1.0)
const liquidityUtilizationRatio = new client.Gauge({
  name: "cts_liquidity_utilization_ratio",
  help: "Current intraday debit exposure vs allocated collateral ratio (>=0.85 trips warning)",
  labelNames: ["bank_code"],
  registers: [register],
});

// Function to return Prometheus formatted metrics string
async function getPrometheusMetrics() {
  return await register.metrics();
}

// In-memory request counters for SRE dashboard
let totalRequests = 0;
let totalErrors = 0;
const latencySamples = [];
const startTime = Date.now();

function recordRequestMetrics(method, route, statusCode, durationMs) {
  totalRequests++;
  if (statusCode >= 400) totalErrors++;
  latencySamples.push(durationMs);
  if (latencySamples.length > 500) latencySamples.shift();

  try {
    httpRequestsTotal.inc({ method, route: route || "unknown", status_code: String(statusCode) });
    httpRequestDurationSeconds.observe(
      { method, route: route || "unknown", status_code: String(statusCode) },
      durationMs / 1000
    );
  } catch (err) {
    // Ignore metric recording errors in edge cases
  }
}

// Gather SRE & Observability JSON stats for Frontend Hub
async function getSreStats() {
  const sorted = [...latencySamples].sort((a, b) => a - b);
  const p50 = sorted.length ? sorted[Math.floor(sorted.length * 0.5)] : 0;
  const p95 = sorted.length ? sorted[Math.floor(sorted.length * 0.95)] : 0;
  const p99 = sorted.length ? sorted[Math.floor(sorted.length * 0.99)] : 0;
  const avg = sorted.length ? sorted.reduce((a, b) => a + b, 0) / sorted.length : 0;

  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const mem = process.memoryUsage();

  return {
    uptimeSeconds,
    requests: {
      total: totalRequests,
      errors: totalErrors,
      errorRate: totalRequests > 0 ? Number(((totalErrors / totalRequests) * 100).toFixed(2)) : 0,
    },
    latency: {
      avgMs: Number(avg.toFixed(2)),
      p50Ms: Number(p50.toFixed(2)),
      p95Ms: Number(p95.toFixed(2)),
      p99Ms: Number(p99.toFixed(2)),
    },
    system: {
      memoryUsedMb: Number((mem.heapUsed / 1024 / 1024).toFixed(2)),
      memoryTotalMb: Number((mem.heapTotal / 1024 / 1024).toFixed(2)),
      rssMb: Number((mem.rss / 1024 / 1024).toFixed(2)),
      cpuCount: os.cpus().length,
      loadAvg: os.loadavg(),
    },
  };
}

function recordRequest({ method, path, statusCode, durationMs }) {
  recordRequestMetrics(method, path, statusCode, durationMs);
}

module.exports = {
  register,
  getPrometheusMetrics,
  getSreStats,
  recordRequestMetrics,
  recordRequest,
  httpRequestsTotal,
  httpRequestDurationSeconds,
  chequesPresentedTotal,
  chequesClearedTotal,
  ekuberRealizationsTotal,
  settlementVolumeInrTotal,
  ppsVerificationTotal,
  liquidityUtilizationRatio,
};
