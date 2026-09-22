const chaosState = {
  enabled: false,
  latencyMs: 0,
  errorRate: 0, // 0 to 1
  circuitBreakerTripped: false,
  circuitState: "CLOSED", // "CLOSED" | "OPEN" | "HALF_OPEN"
  trippedAt: null,
  cooldownMs: 15000, // 15s auto-recovery window
  simulatedFault: null,
};

function getChaosState() {
  if (chaosState.circuitBreakerTripped && chaosState.trippedAt) {
    const elapsed = Date.now() - chaosState.trippedAt;
    if (elapsed >= chaosState.cooldownMs) {
      // Auto-recover back to CLOSED
      chaosState.circuitBreakerTripped = false;
      chaosState.circuitState = "CLOSED";
      chaosState.trippedAt = null;
      chaosState.simulatedFault = null;
      chaosState.enabled = chaosState.latencyMs > 0 || chaosState.errorRate > 0;
    } else if (elapsed >= 10000) {
      chaosState.circuitState = "HALF_OPEN";
    } else {
      chaosState.circuitState = "OPEN";
    }
  } else {
    chaosState.circuitState = "CLOSED";
  }

  const remainingCooldownSeconds = (chaosState.circuitBreakerTripped && chaosState.trippedAt)
    ? Math.max(0, Math.ceil((chaosState.cooldownMs - (Date.now() - chaosState.trippedAt)) / 1000))
    : 0;

  return {
    ...chaosState,
    remainingCooldownSeconds,
  };
}

function setChaosConfig(config) {
  if (config.latencyMs !== undefined) chaosState.latencyMs = Math.max(0, Number(config.latencyMs) || 0);
  if (config.errorRate !== undefined) chaosState.errorRate = Math.min(1, Math.max(0, Number(config.errorRate) || 0));
  if (config.circuitBreakerTripped !== undefined) {
    chaosState.circuitBreakerTripped = Boolean(config.circuitBreakerTripped);
    if (chaosState.circuitBreakerTripped) {
      chaosState.trippedAt = Date.now();
      chaosState.circuitState = "OPEN";
      chaosState.simulatedFault = config.simulatedFault || "CORE_BANKING_CIRCUIT_BREAKER_TRIPPED";
    } else {
      chaosState.trippedAt = null;
      chaosState.circuitState = "CLOSED";
      chaosState.simulatedFault = null;
    }
  }
  if (config.simulatedFault !== undefined && !chaosState.circuitBreakerTripped) {
    chaosState.simulatedFault = config.simulatedFault;
  }

  chaosState.enabled = chaosState.latencyMs > 0 || chaosState.errorRate > 0 || chaosState.circuitBreakerTripped;
  return getChaosState();
}

function resetChaos() {
  chaosState.enabled = false;
  chaosState.latencyMs = 0;
  chaosState.errorRate = 0;
  chaosState.circuitBreakerTripped = false;
  chaosState.circuitState = "CLOSED";
  chaosState.trippedAt = null;
  chaosState.simulatedFault = null;
  return getChaosState();
}

module.exports = {
  getChaosState,
  setChaosConfig,
  resetChaos,
};

