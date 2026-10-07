const express = require("express");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const {
  createDispute,
  listDisputes,
  getDispute,
  updateDisputeStatus,
} = require("../controllers/dispute.controller");

const router = express.Router();

router.use(authenticate);

// Filing and listing disputes
router.post("/", createDispute);
router.get("/", listDisputes);
router.get("/:id", getDispute);

// Adjudication & status progression (Compliance Auditor, Branch Manager, Admin)
router.patch(
  "/:id/status",
  authorize("COMPLIANCE_AUDITOR", "BRANCH_MANAGER", "ADMIN", "SETTLEMENT_OFFICER"),
  updateDisputeStatus
);

module.exports = router;
