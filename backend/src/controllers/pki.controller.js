const pkiService = require("../services/pki.service");
const pqcService = require("../services/pqc.service");
const { validateRequired } = require("../validators/schemas");

async function registerCertificate(req, res, next) {
  try {
    const { subject, serialNumber, issuer, validityDays, keyAlgorithm } = req.body;
    const bankId = req.body.bankId || req.user.bankId;

    const cert = await pkiService.registerCertificate({
      bankId,
      subject,
      serialNumber,
      issuer,
      validityDays,
      keyAlgorithm,
    });

    return res.status(201).json({
      message: `Digital Certificate registered successfully for ${cert.bank.name}`,
      certificate: cert,
    });
  } catch (err) {
    next(err);
  }
}

async function listCertificates(req, res, next) {
  try {
    const bankId = req.query.bankId || (req.user.role === "ADMIN" ? null : req.user.bankId);
    const certs = await pkiService.listCertificates(bankId);
    return res.json(certs);
  } catch (err) {
    next(err);
  }
}

async function signBatch(req, res, next) {
  try {
    const { batchId } = req.params;
    const bankId = req.user.bankId;

    const audit = await pkiService.signBatchPayload(batchId, bankId);
    return res.status(201).json({
      message: `Clearing batch manifest digitally signed with Certificate #${audit.certificate.serialNumber}`,
      signature: audit,
    });
  } catch (err) {
    next(err);
  }
}

async function verifySignature(req, res, next) {
  try {
    const { batchId } = req.params;
    const result = await pkiService.verifyBatchSignature(batchId);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// Post-Quantum Cryptography (NIST FIPS 204 ML-DSA & FIPS 203 ML-KEM) Handlers
// ============================================================================

async function generatePqcKeys(req, res, next) {
  try {
    const bankCode = req.body.bankCode || req.user.bankCode || "SRT";
    const keys = pqcService.generateHybridKeyPair(bankCode);
    return res.json({
      message: `Hybrid Classical (RSA-4096) + NIST PQC (ML-DSA-65) keypair generated for ${bankCode}`,
      keys,
    });
  } catch (err) {
    next(err);
  }
}

async function signBatchPqc(req, res, next) {
  try {
    const { batchId } = req.params;
    const bankCode = req.user.bankCode || "SRT";
    const manifest = req.body.manifest || { batchId, signedBy: bankCode, timestamp: new Date() };

    const result = pqcService.signBatchHybrid(batchId, manifest, bankCode);
    return res.status(201).json({
      message: `Batch manifest signed with Hybrid Classical + NIST FIPS 204 ML-DSA-65`,
      result,
    });
  } catch (err) {
    next(err);
  }
}

async function verifySignaturePqc(req, res, next) {
  try {
    const { batchId } = req.params;
    const bankCode = req.query.bankCode || "SRT";
    const manifest = req.query.manifest ? JSON.parse(req.query.manifest) : null;

    const verification = pqcService.verifyBatchHybrid(batchId, manifest, bankCode);
    return res.json(verification);
  } catch (err) {
    next(err);
  }
}

async function getPqcReadiness(req, res, next) {
  try {
    const metrics = pqcService.getQuantumReadinessMetrics();
    return res.json(metrics);
  } catch (err) {
    next(err);
  }
}

async function encapsulatePqcTunnel(req, res, next) {
  try {
    const { sourceBankCode, recipientBankCode } = req.body;
    const session = pqcService.encapsulateInterbankTunnel(sourceBankCode || "SRT", recipientBankCode || "HDB");
    return res.json({
      message: "Quantum-safe session tunnel established using NIST FIPS 203 ML-KEM-768",
      session,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registerCertificate,
  listCertificates,
  signBatch,
  verifySignature,
  generatePqcKeys,
  signBatchPqc,
  verifySignaturePqc,
  getPqcReadiness,
  encapsulatePqcTunnel,
};

