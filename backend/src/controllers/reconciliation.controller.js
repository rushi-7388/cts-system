const reconciliationService = require("../services/reconciliation.service");
const { validatePositiveNumber } = require("../validators/schemas");

async function configureCutoff(req, res, next) {
  try {
    const { batchId } = req.params;
    const { windowType, minutesToCutoff } = req.body;

    if (minutesToCutoff !== undefined) {
      validatePositiveNumber(minutesToCutoff, "minutesToCutoff");
    }

    const updated = await reconciliationService.configureBatchCutoff(batchId, {
      windowType,
      minutesToCutoff,
    });

    return res.json({
      message: `Cutoff window configured for session ${updated.sessionCode}`,
      batch: updated,
    });
  } catch (err) {
    next(err);
  }
}

async function getCutoffStatus(req, res, next) {
  try {
    const { batchId } = req.params;
    const status = await reconciliationService.getSessionCutoffStatus(batchId);
    return res.json(status);
  } catch (err) {
    next(err);
  }
}

async function runReconciliation(req, res, next) {
  try {
    const { batchId } = req.params;
    const { force } = req.body;

    const result = await reconciliationService.runSessionReconciliation(batchId, {
      actorId: req.user.id,
      force: Boolean(force),
    });

    return res.json({
      message: `Two-Way Clearing Reconciliation completed for session ${result.batch.sessionCode}`,
      batch: result.batch,
      report: result.report,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  configureCutoff,
  getCutoffStatus,
  runReconciliation,
};
