const crypto = require("crypto");
const fs = require("fs");
const prisma = require("../config/prisma");

const VELOCITY_WINDOW_HOURS = 24;
const VELOCITY_THRESHOLD = 5; // more than N cheques from same account in the window
const HIGH_VALUE_THRESHOLD = 200000; // INR

function hashFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Runs all fraud checks for a newly-presented cheque and persists any
 * FraudFlag records found. Returns the list of flags created (empty if clean).
 *
 * This is intentionally simple / rule-based, in keeping with an academic
 * simulation rather than a production ML-based fraud engine.
 */
async function runFraudChecks({ chequeId, chequeNumber, accountNumber, amount, imageHash }) {
  const flags = [];

  // 1. Duplicate image: same image hash used on a different cheque before
  if (imageHash) {
    const duplicateImage = await prisma.cheque.findFirst({
      where: { imageHash, id: { not: chequeId } },
    });
    if (duplicateImage) {
      flags.push({
        chequeId,
        type: "DUPLICATE_IMAGE",
        severity: "HIGH",
        details: `Identical cheque image already presented as cheque #${duplicateImage.chequeNumber} (id: ${duplicateImage.id})`,
      });
    }
  }

  // 2. Duplicate cheque number + account number combo, not yet returned
  const duplicateChequeNumber = await prisma.cheque.findFirst({
    where: {
      chequeNumber,
      accountNumber,
      id: { not: chequeId },
      status: { not: "RETURNED" },
    },
  });
  if (duplicateChequeNumber) {
    flags.push({
      chequeId,
      type: "DUPLICATE_CHEQUE_NUMBER",
      severity: "HIGH",
      details: `Cheque number ${chequeNumber} for this account was already presented (id: ${duplicateChequeNumber.id}, status: ${duplicateChequeNumber.status})`,
    });
  }

  // 3. Velocity: too many cheques from the same account in a short window
  const windowStart = new Date(Date.now() - VELOCITY_WINDOW_HOURS * 60 * 60 * 1000);
  const recentCount = await prisma.cheque.count({
    where: { accountNumber, createdAt: { gte: windowStart } },
  });
  if (recentCount > VELOCITY_THRESHOLD) {
    flags.push({
      chequeId,
      type: "VELOCITY",
      severity: "MEDIUM",
      details: `${recentCount} cheques presented from account ${accountNumber} in the last ${VELOCITY_WINDOW_HOURS}h (threshold: ${VELOCITY_THRESHOLD})`,
    });
  }

  // 4. High value cheque
  if (Number(amount) >= HIGH_VALUE_THRESHOLD) {
    flags.push({
      chequeId,
      type: "HIGH_VALUE",
      severity: "LOW",
      details: `Amount ₹${Number(amount).toLocaleString("en-IN")} is at or above the high-value review threshold (₹${HIGH_VALUE_THRESHOLD.toLocaleString("en-IN")})`,
    });
  }

  if (flags.length > 0) {
    await prisma.fraudFlag.createMany({ data: flags });
  }

  return flags;
}

module.exports = { runFraudChecks, hashFile, VELOCITY_THRESHOLD, HIGH_VALUE_THRESHOLD, VELOCITY_WINDOW_HOURS };
