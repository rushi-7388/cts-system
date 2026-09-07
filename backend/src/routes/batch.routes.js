const express = require("express");
const { authenticate } = require("../middleware/auth.middleware");
const {
  listBatches,
  getBatch,
  createBatch,
  lockBatch,
  processBatch,
} = require("../controllers/batch.controller");

const router = express.Router();

router.use(authenticate);

router.get("/", listBatches);
router.get("/:id", getBatch);
router.post("/", createBatch);
router.patch("/:id/lock", lockBatch);
router.post("/:id/process", processBatch);

module.exports = router;
