const express = require("express");
const {
  runSettlement,
  listSettlements,
  getSettlementIso20022,
  getLiquidityMonitor,
  updateCollateralLimit,
  getContinuousSettlementStatus,
  toggleContinuousMode,
  settleChequeEkuber,
  getEkuberPacs009Xml,
} = require("../controllers/settlement.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.post("/run", authorize("ADMIN"), runSettlement);
router.get("/liquidity-monitor", getLiquidityMonitor);
router.patch("/collateral-limit", updateCollateralLimit);

// Continuous Clearing & RBI e-Kuber Routes
router.get("/continuous/status", getContinuousSettlementStatus);
router.post("/continuous/toggle", authorize("ADMIN"), toggleContinuousMode);
router.post("/continuous/settle-now/:chequeId", authorize("ADMIN"), settleChequeEkuber);
router.get("/ekuber/:id/pacs009", getEkuberPacs009Xml);

router.get("/", listSettlements);
router.get("/:id/iso20022", getSettlementIso20022);

module.exports = router;
