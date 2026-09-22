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

const { authenticate, authorize } = require("../middleware/auth.middleware");

// Chaos Engineering Simulator
router.get("/chaos", getChaos);
router.post("/chaos", authenticate, authorize("IT_STAFF", "ADMIN"), updateChaos);
router.post("/chaos/reset", authenticate, authorize("IT_STAFF", "ADMIN"), clearChaos);

// Telemetry
router.post(["/telemetry/report", "/report"], reportTelemetry);
router.get(["/telemetry/recent", "/recent"], recentTelemetry);

module.exports = router;
