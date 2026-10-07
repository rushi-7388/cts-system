const express = require("express");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const {
  getTopology,
  triggerFailover,
} = require("../controllers/datacenter.controller");

const router = express.Router();

router.use(authenticate);

// Live Cybernetic Clearing Switch Topology (War Room telemetry)
router.get("/topology", authorize("ADMIN", "IT_STAFF", "SETTLEMENT_OFFICER", "COMPLIANCE_AUDITOR"), getTopology);

// 1-Click Active-Active DC Failover
router.post("/failover", authorize("ADMIN", "IT_STAFF"), triggerFailover);

module.exports = router;
