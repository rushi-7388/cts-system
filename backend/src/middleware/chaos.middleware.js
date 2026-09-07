const { getChaosState } = require("../utils/chaos.util");

async function chaosMiddleware(req, res, next) {
  // Never disrupt health, metrics, or devops management endpoints so operators can always manage the system
  if (
    req.path.startsWith("/health") ||
    req.path.startsWith("/metrics") ||
    req.path.startsWith("/api/devops") ||
    req.path.startsWith("/api/telemetry")
  ) {
    return next();
  }

  const state = getChaosState();
  if (!state.enabled) {
    return next();
  }

  // 1. Circuit Breaker Simulation
  if (state.circuitBreakerTripped) {
    return res.status(503).json({
      error: "Circuit Breaker OPEN: Downstream Core Banking Interconnect unavailable (Simulated Fault)",
      circuitState: "OPEN",
      suggestedAction: "Wait for circuit half-open state or reset chaos in DevOps Console",
    });
  }

  // 2. Latency Injection
  if (state.latencyMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, state.latencyMs));
  }

  // 3. Error Injection
  if (state.errorRate > 0 && Math.random() < state.errorRate) {
    return res.status(500).json({
      error: "Synthetic 500 Error: Injected by Chaos Engineering Simulator",
      simulatedFault: state.simulatedFault || "TRANSIENT_DB_TIMEOUT",
    });
  }

  next();
}

module.exports = chaosMiddleware;
