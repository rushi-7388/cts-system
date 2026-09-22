const express = require("express");
const {
  getStats,
  getAuditTrail,
  listBanks,
  listFraudFlags,
  resolveFraudFlag,
  verifyLedger,
} = require("../controllers/admin.controller");
const { getAnalytics } = require("../controllers/analytics.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.get("/stats", authorize("COMPLIANCE_AUDITOR", "ADMIN"), getStats);
router.get("/audit-trail", authorize("COMPLIANCE_AUDITOR", "ADMIN"), getAuditTrail);
router.get("/banks", listBanks);
router.get("/fraud-flags", authorize("COMPLIANCE_AUDITOR", "ADMIN"), listFraudFlags);
router.patch("/fraud-flags/:id/resolve", authorize("COMPLIANCE_AUDITOR", "ADMIN"), resolveFraudFlag);

// Advanced Enterprise Endpoints
router.get("/ledger/verify", authorize("COMPLIANCE_AUDITOR", "ADMIN"), verifyLedger);
router.get("/analytics", authorize("COMPLIANCE_AUDITOR", "ADMIN"), getAnalytics);

module.exports = router;
