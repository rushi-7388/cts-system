const hsmService = require("../services/hsm.service");

async function getStatus(req, res, next) {
  try {
    const status = hsmService.getHsmStatus();
    return res.json(status);
  } catch (err) {
    next(err);
  }
}

async function insertKey(req, res, next) {
  try {
    const { custodianId, pin } = req.body;
    if (!custodianId || !pin) {
      return res.status(400).json({ error: "custodianId and pin are required" });
    }
    const status = hsmService.insertCustodianKey(custodianId, pin);
    return res.json({ message: "Custodian key authenticated successfully", status });
  } catch (err) {
    next(err);
  }
}

async function lock(req, res, next) {
  try {
    const status = hsmService.lockHsm();
    return res.json({ message: "HSM Enclave locked successfully", status });
  } catch (err) {
    next(err);
  }
}

async function zeroize(req, res, next) {
  try {
    const { reason } = req.body;
    const result = hsmService.triggerTamperZeroization(reason);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

async function reinitialize(req, res, next) {
  try {
    const status = hsmService.reinitializeHsm();
    return res.json({ message: "HSM reinitialized to factory cold state", status });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStatus,
  insertKey,
  lock,
  zeroize,
  reinitialize,
};
