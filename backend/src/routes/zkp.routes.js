const express = require("express");
const { authenticate } = require("../middleware/auth.middleware");
const {
  generateProof,
  verifyProof,
  getProof,
} = require("../controllers/zkp.controller");

const router = express.Router();

router.use(authenticate);

// Zero-Knowledge Proof Solvency Endpoints
router.post("/generate/:chequeId", generateProof);
router.post("/verify", verifyProof);
router.get("/proofs/:chequeId", getProof);

module.exports = router;
