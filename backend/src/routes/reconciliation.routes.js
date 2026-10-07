const express = require("express");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const {
  configureCutoff,
  getCutoffStatus,
  runReconciliation,
} = require("../controllers/reconciliation.controller");

const router = express.Router();

router.use(authenticate);

// Session cutoff window inspection & timer management
router.get("/batches/:batchId/cutoff", getCutoffStatus);
router.post(
  "/batches/:batchId/cutoff",
  authorize("ADMIN", "SETTLEMENT_OFFICER", "BRANCH_MANAGER"),
  configureCutoff
);

// Two-way session reconciliation execution
router.post(
  "/batches/:batchId/reconcile",
  authorize("ADMIN", "SETTLEMENT_OFFICER", "COMPLIANCE_AUDITOR"),
  runReconciliation
);

module.exports = router;
