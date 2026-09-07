const prisma = require("../config/prisma");

async function evaluateChequeRisk({ chequeNumber, accountNumber, amount, imageHash, draweeIfsc, payeeName }) {
  const numericAmount = Number(amount);
  let totalScore = 0;
  const factors = [];

  // 1. Amount Anomaly Check
  if (numericAmount >= 1000000) {
    totalScore += 65;
    factors.push({ code: "CRITICAL_HIGH_VALUE", points: 65, description: "Amount exceeds ₹10,00,000 threshold" });
  } else if (numericAmount >= 500000) {
    totalScore += 45;
    factors.push({ code: "HIGH_VALUE", points: 45, description: "Amount exceeds ₹5,00,000 threshold" });
  } else if (numericAmount >= 100000) {
    totalScore += 20;
    factors.push({ code: "ELEVATED_VALUE", points: 20, description: "Amount exceeds ₹1,00,000 threshold" });
  }

  // 2. Velocity Check (presentations from same account in last 24 hours)
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const velocityCount = await prisma.cheque.count({
    where: {
      accountNumber,
      createdAt: { gte: since24h },
    },
  });

  if (velocityCount >= 4) {
    totalScore += 50;
    factors.push({ code: "HIGH_VELOCITY", points: 50, description: `${velocityCount} cheques presented from account within 24h` });
  } else if (velocityCount >= 2) {
    totalScore += 25;
    factors.push({ code: "MODERATE_VELOCITY", points: 25, description: `${velocityCount} cheques presented from account within 24h` });
  }

  // 3. Duplicate Cheque Number on Same Account
  const duplicateCheque = await prisma.cheque.findFirst({
    where: { chequeNumber, accountNumber },
  });
  if (duplicateCheque) {
    totalScore += 80;
    factors.push({ code: "DUPLICATE_NUMBER", points: 80, description: "Cheque number already issued from this account" });
  }

  // 4. Duplicate Cheque Image Fingerprint (Hash Collision)
  if (imageHash) {
    const duplicateImage = await prisma.cheque.findFirst({
      where: {
        imageHash,
        NOT: { chequeNumber },
      },
    });
    if (duplicateImage) {
      totalScore += 60;
      factors.push({ code: "IMAGE_HASH_COLLISION", points: 60, description: "Image file SHA-256 fingerprint matches another cheque" });
    }
  }

  // 5. Historical Account Return Rate
  const returnedCount = await prisma.cheque.count({
    where: {
      accountNumber,
      status: "RETURNED",
    },
  });
  if (returnedCount > 0) {
    const returnPoints = Math.min(35, returnedCount * 15);
    totalScore += returnPoints;
    factors.push({ code: "ACCOUNT_RETURN_HISTORY", points: returnPoints, description: `Account has ${returnedCount} previously returned cheque(s)` });
  }

  // 6. Positive Pay System (PPS) 5-Point Automated Cross-Match
  let ppsStatus = numericAmount >= 50000 ? "PPS_NOT_REGISTERED" : "PPS_NOT_APPLICABLE";
  let ppsDiscrepancy = null;

  if (numericAmount >= 50000) {
    const ppsRecord = await prisma.positivePayRecord.findUnique({
      where: {
        accountNumber_chequeNumber: {
          accountNumber,
          chequeNumber,
        },
      },
    });

    if (ppsRecord) {
      const ppsAmt = Number(ppsRecord.amount);
      const isAmountMatch = Math.abs(ppsAmt - numericAmount) < 0.01;
      const cleanPayeeA = (payeeName || "").trim().toLowerCase();
      const cleanPayeeB = (ppsRecord.payeeName || "").trim().toLowerCase();
      const isPayeeMatch = cleanPayeeA === cleanPayeeB || cleanPayeeA.includes(cleanPayeeB) || cleanPayeeB.includes(cleanPayeeA);

      if (isAmountMatch && isPayeeMatch) {
        ppsStatus = "PPS_VERIFIED";
        totalScore = Math.max(0, totalScore - 15);
        factors.push({
          code: "PPS_VERIFIED",
          points: -15,
          description: "Positive Pay System pre-confirmation matched drawer record with Core Banking System",
        });
      } else {
        ppsStatus = "PPS_MISMATCH";
        totalScore += 55;
        ppsDiscrepancy = {
          expectedAmount: ppsAmt,
          presentedAmount: numericAmount,
          expectedPayee: ppsRecord.payeeName,
          presentedPayee: payeeName,
          reason: !isAmountMatch ? `Amount mismatch (Registered: ₹${ppsAmt.toLocaleString("en-IN")}, Presented: ₹${numericAmount.toLocaleString("en-IN")})` : "Payee mismatch with drawer registration",
        };
        factors.push({
          code: "PPS_DISCREPANCY",
          points: 55,
          description: `Positive Pay Discrepancy: ${ppsDiscrepancy.reason}`,
        });
      }
    } else if (numericAmount >= 500000) {
      totalScore += 30;
      factors.push({
        code: "PPS_MANDATORY_MISSING",
        points: 30,
        description: "High-value cheque (>₹5,00,000) lacks mandatory Positive Pay registration",
      });
    }
  }

  // Final capped score [0 - 100]
  const finalScore = Math.min(100, Math.max(0, totalScore));

  let riskTier = "LOW";
  if (finalScore >= 70 || ppsStatus === "PPS_MISMATCH") {
    riskTier = "HIGH";
  } else if (finalScore >= 30) {
    riskTier = "MEDIUM";
  }

  return {
    score: finalScore,
    tier: riskTier,
    factors,
    ppsStatus,
    ppsDiscrepancy,
    requiresMakerChecker: numericAmount >= 100000 || riskTier === "HIGH" || ppsStatus === "PPS_MISMATCH",
  };
}

module.exports = { evaluateChequeRisk };
