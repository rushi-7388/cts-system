const express = require("express");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const {
  getStatus,
  insertKey,
  lock,
  zeroize,
  reinitialize,
} = require("../controllers/hsm.controller");

const router = express.Router();

router.use(authenticate);

// View HSM security status & key ceremony telemetry
router.get("/status", authorize("ADMIN", "IT_STAFF", "SETTLEMENT_OFFICER", "COMPLIANCE_AUDITOR"), getStatus);

// M-of-N Cryptographic Key Ceremony smart card insertion
router.post("/ceremony/insert-key", authorize("ADMIN", "IT_STAFF", "SETTLEMENT_OFFICER"), insertKey);

// Lock HSM enclave
router.post("/lock", authorize("ADMIN", "IT_STAFF"), lock);

// FIPS 140-2 Level 3 Emergency Tamper Zeroization button
router.post("/zeroize", authorize("ADMIN", "IT_STAFF"), zeroize);

// Factory cold re-initialization
router.post("/reinitialize", authorize("ADMIN", "IT_STAFF"), reinitialize);

module.exports = router;
