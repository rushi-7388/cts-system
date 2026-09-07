import client from "../api/client";

export function reportError(error, context = {}) {
  try {
    const payload = {
      source: "frontend",
      level: "error",
      message: error?.message || String(error),
      stack: error?.stack || null,
      url: window.location.href,
      userAgent: navigator.userAgent,
      context,
    };

    // Use sendBeacon if available for reliable unload transmission, otherwise axios
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/telemetry/report", blob);
    } else {
      client.post("/telemetry/report", payload).catch(() => {});
    }
  } catch (err) {
    console.error("Failed to dispatch telemetry:", err);
  }
}

export function initGlobalTelemetry() {
  window.addEventListener("error", (event) => {
    reportError(event.error || event.message, { type: "uncaught_window_error", filename: event.filename, lineno: event.lineno });
  });

  window.addEventListener("unhandledrejection", (event) => {
    reportError(event.reason, { type: "unhandled_promise_rejection" });
  });
}
