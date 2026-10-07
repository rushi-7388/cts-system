const express = require("express");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const {
  registerCertificate,
  listCertificates,
  signBatch,
  verifySignature,
  generatePqcKeys,
  signBatchPqc,
  verifySignaturePqc,
  getPqcReadiness,
  encapsulatePqcTunnel,
} = require("../controllers/pki.controller");

const router = express.Router();

router.use(authenticate);

// Certificate Registry
router.get("/certificates", listCertificates);
router.post("/certificates", authorize("ADMIN", "IT_STAFF"), registerCertificate);

// Batch Manifest Signing & Digital Signature Verification (Classical)
router.post("/batches/:batchId/sign", signBatch);
router.get("/batches/:batchId/verify", verifySignature);

// NIST Post-Quantum Cryptography (FIPS 204 ML-DSA & FIPS 203 ML-KEM) Endpoints
router.get("/pqc/readiness", getPqcReadiness);
router.post("/pqc/generate-keys", authorize("ADMIN", "IT_STAFF", "BRANCH_MANAGER"), generatePqcKeys);
router.post("/pqc/tunnel/encapsulate", authorize("ADMIN", "IT_STAFF"), encapsulatePqcTunnel);
router.post("/batches/:batchId/pqc-sign", signBatchPqc);
router.get("/batches/:batchId/pqc-verify", verifySignaturePqc);

module.exports = router;

