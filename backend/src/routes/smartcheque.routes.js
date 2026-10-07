const express = require("express");
const { authenticate } = require("../middleware/auth.middleware");
const {
  earmarkLien,
  getContract,
  releaseMilestone,
  settleCbdc,
} = require("../controllers/smartcheque.controller");

const router = express.Router();

router.use(authenticate);

// Programmable Smart Cheques & Micro-Lien Endpoints
router.post("/lien/earmark", earmarkLien);
router.get("/contracts/:chequeId", getContract);
router.post("/contracts/:chequeId/release-milestone", releaseMilestone);
router.post("/cbdc/settle", settleCbdc);

module.exports = router;
