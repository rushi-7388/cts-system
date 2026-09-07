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

router.get("/stats", authorize("ADMIN"), getStats);
router.get("/audit-trail", authorize("ADMIN"), getAuditTrail);
router.get("/banks", listBanks);
router.get("/fraud-flags", authorize("ADMIN"), listFraudFlags);
router.patch("/fraud-flags/:id/resolve", authorize("ADMIN"), resolveFraudFlag);

// Advanced Enterprise Endpoints
router.get("/ledger/verify", authorize("ADMIN"), verifyLedger);
router.get("/analytics", authorize("ADMIN"), getAnalytics);

module.exports = router;
