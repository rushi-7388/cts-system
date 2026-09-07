const express = require("express");
const {
  livenessProbe,
  readinessProbe,
  prometheusFeed,
  sreStats,
  dbPing,
  systemInfo,
  getChaos,
  updateChaos,
  clearChaos,
  reportTelemetry,
  recentTelemetry,
} = require("../controllers/devops.controller");

const router = express.Router();

// Public Health & Prometheus Probes
router.get("/health/live", livenessProbe);
router.get("/health/ready", readinessProbe);
router.get("/metrics", prometheusFeed);

// SRE & Observability endpoints
router.get("/sre-stats", sreStats);
router.get("/db-ping", dbPing);
router.get("/system-info", systemInfo);

// Chaos Engineering Simulator
router.get("/chaos", getChaos);
router.post("/chaos", updateChaos);
router.post("/chaos/reset", clearChaos);

// Telemetry
router.post("/telemetry/report", reportTelemetry);
router.get("/telemetry/recent", recentTelemetry);

module.exports = router;
