const chaosState = {
  enabled: false,
  latencyMs: 0,
  errorRate: 0, // 0 to 1
  circuitBreakerTripped: false,
  simulatedFault: null,
};

function getChaosState() {
  return { ...chaosState };
}

function setChaosConfig(config) {
  if (config.latencyMs !== undefined) chaosState.latencyMs = Math.max(0, Number(config.latencyMs) || 0);
  if (config.errorRate !== undefined) chaosState.errorRate = Math.min(1, Math.max(0, Number(config.errorRate) || 0));
  if (config.circuitBreakerTripped !== undefined) chaosState.circuitBreakerTripped = Boolean(config.circuitBreakerTripped);
  if (config.simulatedFault !== undefined) chaosState.simulatedFault = config.simulatedFault;

  chaosState.enabled = chaosState.latencyMs > 0 || chaosState.errorRate > 0 || chaosState.circuitBreakerTripped;
  return getChaosState();
}

function resetChaos() {
  chaosState.enabled = false;
  chaosState.latencyMs = 0;
  chaosState.errorRate = 0;
  chaosState.circuitBreakerTripped = false;
  chaosState.simulatedFault = null;
  return getChaosState();
}

module.exports = {
  getChaosState,
  setChaosConfig,
  resetChaos,
};
