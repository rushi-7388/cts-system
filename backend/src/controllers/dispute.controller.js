const disputeService = require("../services/dispute.service");
const { validateRequired, validateEnum, validatePositiveNumber } = require("../validators/schemas");

const ALLOWED_DISPUTE_TYPES = [
  "UNAUTHORIZED_DEBIT",
  "AMOUNT_MISMATCH",
  "DUPLICATE_PRESENTATION",
  "LATE_RETURN",
  "FORGED_SIGNATURE",
  "PPS_BREACH",
];

const ALLOWED_STATUSES = [
  "FILED",
  "UNDER_REVIEW",
  "EVIDENCE_REQUESTED",
  "RESOLVED_CLAIMANT",
  "RESOLVED_RESPONDENT",
  "ESCALATED_RBI_OMBUDSMAN",
  "CLOSED",
];

async function createDispute(req, res, next) {
  try {
    const { chequeId, disputeType, claimAmount, evidenceNotes } = req.body;
    validateRequired(req.body, ["chequeId", "disputeType", "evidenceNotes"]);
    validateEnum(disputeType, ALLOWED_DISPUTE_TYPES, "disputeType");

    if (claimAmount !== undefined) {
      validatePositiveNumber(claimAmount, "claimAmount");
    }

    const dispute = await disputeService.fileDispute({
      chequeId,
      initiatingBankId: req.user.bankId,
      disputeType,
      claimAmount,
      filedById: req.user.id,
      evidenceNotes,
    });

    return res.status(201).json({
      message: `Dispute claim ${dispute.claimNumber} filed successfully`,
      dispute,
    });
  } catch (err) {
    next(err);
  }
}

async function listDisputes(req, res, next) {
  try {
    const { status } = req.query;
    const disputes = await disputeService.listDisputes({
      bankId: req.user.bankId,
      role: req.user.role,
      status,
    });
    return res.json(disputes);
  } catch (err) {
    next(err);
  }
}

async function getDispute(req, res, next) {
  try {
    const dispute = await disputeService.getDisputeById(req.params.id);
    return res.json(dispute);
  } catch (err) {
    next(err);
  }
}

async function updateDisputeStatus(req, res, next) {
  try {
    const { toStatus, actionNotes, resolutionSummary } = req.body;
    validateRequired(req.body, ["toStatus"]);
    validateEnum(toStatus, ALLOWED_STATUSES, "toStatus");

    const updated = await disputeService.updateDisputeStatus({
      disputeId: req.params.id,
      actorId: req.user.id,
      toStatus,
      actionNotes,
      resolutionSummary,
    });

    return res.json({
      message: `Dispute ${updated.claimNumber} transitioned to ${toStatus}`,
      dispute: updated,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createDispute,
  listDisputes,
  getDispute,
  updateDisputeStatus,
};
