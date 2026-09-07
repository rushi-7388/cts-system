const express = require("express");
const {
  scanOcrCheque,
  createCheque,
  listCheques,
  getCheque,
  getChequeIso20022,
  registerPositivePay,
  listPositivePay,
  getSignatureComparison,
  bulkIngestCheques,
} = require("../controllers/cheque.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.use(authenticate);

router.post("/scan-ocr", upload.single("chequeImage"), scanOcrCheque);
router.post("/positive-pay", registerPositivePay);
router.get("/positive-pay", listPositivePay);
router.post("/bulk-ingest", authorize("PRESENTING_BANK", "ADMIN"), bulkIngestCheques);
router.post("/", authorize("PRESENTING_BANK", "ADMIN"), upload.single("chequeImage"), createCheque);
router.get("/", listCheques);
router.get("/:id", getCheque);
router.get("/:id/signature-comparison", getSignatureComparison);
router.get("/:id/iso20022", getChequeIso20022);

module.exports = router;
