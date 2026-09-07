const express = require("express");
const { transitionCheque, getReturnReasonCodes, getReturnMemo } = require("../controllers/clearing.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.get("/return-reason-codes", getReturnReasonCodes);
router.get("/:id/return-memo", getReturnMemo);
router.patch("/:id/transition", authorize("DRAWEE_BANK", "ADMIN"), transitionCheque);

module.exports = router;
