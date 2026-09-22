const { getChaosState } = require("../utils/chaos.util");

async function chaosMiddleware(req, res, next) {
  // Never disrupt health, metrics, or devops management endpoints so operators can always manage the system
  if (
    req.path.startsWith("/health") ||
    req.path.startsWith("/metrics") ||
    req.path.startsWith("/devops") ||
    req.path.startsWith("/api/devops") ||
    req.path.startsWith("/telemetry") ||
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
    if (state.circuitState === "HALF_OPEN") {
      // In HALF_OPEN state, allow 50% probe traffic to verify downstream recovery
      if (Math.random() < 0.5) {
        return next();
      }
    }
    return res.status(503).json({
      error: "Circuit Breaker OPEN: Downstream Core Banking Interconnect unavailable (Simulated Fault)",
      circuitState: state.circuitState,
      remainingCooldownSeconds: state.remainingCooldownSeconds,
      suggestedAction: `Circuit state is ${state.circuitState}. Auto-recovering in ${state.remainingCooldownSeconds}s, or click 'Restore Normal Operations' in DevOps Console`,
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
