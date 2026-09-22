const express = require("express");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const {
  getBranchSummary,
  getBranchCheques,
  approveBranchCheque,
  dispatchBranchBatch,
} = require("../controllers/branch.controller");

const router = express.Router();

// All branch routes require authentication and BRANCH_MANAGER (or ADMIN)
router.use(authenticate);

router.get("/summary", authorize("BRANCH_MANAGER", "ADMIN"), getBranchSummary);
router.get("/cheques", authorize("BRANCH_MANAGER", "ADMIN"), getBranchCheques);
router.post("/cheques/:id/approve", authorize("BRANCH_MANAGER", "ADMIN"), approveBranchCheque);
router.post("/batch/dispatch", authorize("BRANCH_MANAGER", "ADMIN"), dispatchBranchBatch);

module.exports = router;
