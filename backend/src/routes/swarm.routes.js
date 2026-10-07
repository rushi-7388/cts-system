const express = require("express");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const {
  evaluateCheque,
  getChequeDocket,
  autoAdjudicateSession,
} = require("../controllers/swarm.controller");

const router = express.Router();

router.use(authenticate);

// Evaluate specific instrument with 4-Agent Autonomous Swarm
router.post("/evaluate/:chequeId", authorize("DRAWEE_BANK", "ADMIN", "BRANCH_MANAGER"), evaluateCheque);

// Retrieve existing or generated Multi-Modal Forensic Docket
router.get("/docket/:chequeId", authorize("DRAWEE_BANK", "ADMIN", "BRANCH_MANAGER", "COMPLIANCE_AUDITOR"), getChequeDocket);

// Batch Autonomous Straight-Through Processing (STP) Adjudication
router.post("/auto-adjudicate", authorize("DRAWEE_BANK", "ADMIN"), autoAdjudicateSession);

module.exports = router;
