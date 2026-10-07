const prisma = require("../config/prisma");
const { broadcastEvent } = require("../utils/sse.util");

/**
 * Intraday Liquidity Management & Collateral Reservation Service
 * Conforms to RBI / NPCI Clearing Collateral Framework.
 */

const DEFAULT_COLLATERAL = 10000000.0; // ₹1,00,00,000 (1 Crore INR)
const DEFAULT_CREDIT_LINE = 2000000.0; // ₹20,00,000 (20 Lakhs INR)

/**
 * Retrieves or lazily creates a bank's central bank liquidity pool.
 */
async function getOrCreateLiquidityPool(bankId, client = prisma) {
  let pool = await client.liquidityPool.findUnique({
    where: { bankId },
    include: {
      bank: { select: { id: true, name: true, code: true, ifsc: true } },
      events: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!pool) {
    pool = await client.liquidityPool.create({
      data: {
        bankId,
        allocatedCollateral: DEFAULT_COLLATERAL,
        creditLine: DEFAULT_CREDIT_LINE,
        currentExposure: 0.0,
        reservedAmount: 0.0,
        warningThresholdPercent: 80.0,
        breachThresholdPercent: 95.0,
        status: "HEALTHY",
      },
      include: {
        bank: { select: { id: true, name: true, code: true, ifsc: true } },
        events: true,
      },
    });
  }

  return pool;
}

/**
 * Calculates real-time collateral capacity and utilization percentage.
 */
function calculatePoolMetrics(pool) {
  const collateral = Number(pool.allocatedCollateral);
  const creditLine = Number(pool.creditLine);
  const totalCapacity = collateral + creditLine;
  const exposure = Number(pool.currentExposure);
  const reserved = Number(pool.reservedAmount);
  const totalObligations = exposure + reserved;

  const utilizationPercent = totalCapacity > 0 ? (totalObligations / totalCapacity) * 100 : 0;
  const availableHeadroom = Math.max(0, totalCapacity - totalObligations);

  let status = "HEALTHY";
  if (utilizationPercent >= Number(pool.breachThresholdPercent)) {
    status = "BREACHED";
  } else if (utilizationPercent >= Number(pool.warningThresholdPercent)) {
    status = "WARNING";
  }

  return {
    collateral,
    creditLine,
    totalCapacity,
    exposure,
    reserved,
    totalObligations,
    availableHeadroom,
    utilizationPercent: Number(utilizationPercent.toFixed(2)),
    status,
  };
}

/**
 * Adjusts collateral allocation or credit line for a bank.
 */
async function updateCollateralAllocation(bankId, { allocatedCollateral, creditLine, remarks }) {
  const pool = await getOrCreateLiquidityPool(bankId);

  const updatedCollateral = allocatedCollateral !== undefined ? Number(allocatedCollateral) : pool.allocatedCollateral;
  const updatedCreditLine = creditLine !== undefined ? Number(creditLine) : pool.creditLine;

  const updated = await prisma.$transaction(async (tx) => {
    const updatedPool = await tx.liquidityPool.update({
      where: { id: pool.id },
      data: {
        allocatedCollateral: updatedCollateral,
        creditLine: updatedCreditLine,
      },
      include: { bank: true },
    });

    const metrics = calculatePoolMetrics(updatedPool);
    const finalized = await tx.liquidityPool.update({
      where: { id: pool.id },
      data: { status: metrics.status },
      include: { bank: true },
    });

    await tx.liquidityEvent.create({
      data: {
        poolId: pool.id,
        eventType: "COLLATERAL_DEPOSIT",
        amount: Math.abs(Number(updatedCollateral) - Number(pool.allocatedCollateral)),
        utilizationPercentAfter: metrics.utilizationPercent,
        remarks: remarks || `Collateral allocation updated to ₹${Number(updatedCollateral).toLocaleString("en-IN")}`,
      },
    });

    return finalized;
  });

  broadcastEvent("LIQUIDITY_POOL_UPDATED", {
    bankId,
    bankCode: updated.bank.code,
    allocatedCollateral: updated.allocatedCollateral,
    status: updated.status,
    timestamp: new Date().toISOString(),
  });

  return { ...updated, metrics: calculatePoolMetrics(updated) };
}

/**
 * Checks and reserves liquidity before cheque clearance.
 * Fails if the transaction would breach the bank's hard limit (> 95% utilization).
 */
async function reserveLiquidity(bankId, chequeId, amount) {
  const pool = await getOrCreateLiquidityPool(bankId);
  const numericAmount = Number(amount);

  const metrics = calculatePoolMetrics(pool);
  const potentialObligation = metrics.totalObligations + numericAmount;
  const potentialUtilization = metrics.totalCapacity > 0 ? (potentialObligation / metrics.totalCapacity) * 100 : 100;

  if (potentialUtilization > Number(pool.breachThresholdPercent)) {
    // Record limit breach attempt
    await prisma.liquidityEvent.create({
      data: {
        poolId: pool.id,
        eventType: "LIMIT_BREACH",
        amount: numericAmount,
        utilizationPercentAfter: Number(potentialUtilization.toFixed(2)),
        referenceId: chequeId,
        remarks: `Liquidity reservation rejected: Requires ₹${numericAmount.toLocaleString("en-IN")} which breaches limit at ${potentialUtilization.toFixed(1)}% utilization.`,
      },
    });

    broadcastEvent("LIQUIDITY_LIMIT_BREACH", {
      bankId,
      bankCode: pool.bank.code,
      chequeId,
      amount: numericAmount,
      utilizationPercent: potentialUtilization,
      message: `Clearing blocked: Intraday collateral headroom exceeded for ${pool.bank.name}`,
    });

    const error = new Error(
      `Intraday Liquidity Cap Exceeded: Drawee bank collateral headroom is insufficient (${potentialUtilization.toFixed(1)}% vs max allowed ${pool.breachThresholdPercent}%). Margin call required.`
    );
    error.status = 409;
    error.code = "LIQUIDITY_BREACH";
    throw error;
  }

  // Reserve the liquidity
  const updated = await prisma.liquidityPool.update({
    where: { id: pool.id },
    data: {
      reservedAmount: { increment: numericAmount },
    },
    include: { bank: true },
  });

  const newMetrics = calculatePoolMetrics(updated);
  if (newMetrics.status !== updated.status) {
    await prisma.liquidityPool.update({
      where: { id: pool.id },
      data: { status: newMetrics.status },
    });
  }

  return {
    reserved: true,
    reservationRef: `RES-${Date.now()}-${chequeId.slice(0, 6)}`,
    metrics: newMetrics,
  };
}

/**
 * Commits a debit on the drawee bank's collateral and releases corresponding reservation.
 * Executes atomically within a Prisma transaction.
 */
async function commitSettlementDebit(draweeBankId, chequeId, amount, tx = prisma) {
  const pool = await getOrCreateLiquidityPool(draweeBankId, tx);
  const numericAmount = Number(amount);

  // Decrement reserved and increment actual exposure
  const updated = await tx.liquidityPool.update({
    where: { id: pool.id },
    data: {
      reservedAmount: { decrement: numericAmount },
      currentExposure: { increment: numericAmount },
    },
    include: { bank: true },
  });

  const metrics = calculatePoolMetrics(updated);

  await tx.liquidityPool.update({
    where: { id: pool.id },
    data: { status: metrics.status },
  });

  await tx.liquidityEvent.create({
    data: {
      poolId: pool.id,
      eventType: "EXPOSURE_INCREASE",
      amount: numericAmount,
      utilizationPercentAfter: metrics.utilizationPercent,
      referenceId: chequeId,
      remarks: `Instrument settlement debit executed for cheque ${chequeId.slice(0, 8)}`,
    },
  });

  if (metrics.status === "WARNING" || metrics.status === "BREACHED") {
    broadcastEvent("LIQUIDITY_STATUS_ALERT", {
      bankId: draweeBankId,
      bankCode: updated.bank.code,
      status: metrics.status,
      utilizationPercent: metrics.utilizationPercent,
      headroom: metrics.availableHeadroom,
    });
  }

  return { pool: updated, metrics };
}

/**
 * Returns overall system liquidity snapshot across all participating banks.
 */
async function getSystemLiquiditySummary() {
  const pools = await prisma.liquidityPool.findMany({
    include: {
      bank: { select: { id: true, name: true, code: true, ifsc: true } },
      events: { orderBy: { createdAt: "desc" }, take: 5 },
    },
    orderBy: { currentExposure: "desc" },
  });

  const enriched = pools.map((p) => ({
    ...p,
    metrics: calculatePoolMetrics(p),
  }));

  const totalCollateral = enriched.reduce((sum, p) => sum + p.metrics.collateral, 0);
  const totalExposure = enriched.reduce((sum, p) => sum + p.metrics.exposure, 0);
  const totalReserved = enriched.reduce((sum, p) => sum + p.metrics.reserved, 0);
  const healthyCount = enriched.filter((p) => p.metrics.status === "HEALTHY").length;
  const warningCount = enriched.filter((p) => p.metrics.status === "WARNING").length;
  const breachCount = enriched.filter((p) => p.metrics.status === "BREACHED").length;

  return {
    totalSystemCollateral: totalCollateral,
    totalSystemExposure: totalExposure,
    totalSystemReserved: totalReserved,
    systemUtilizationPercent: totalCollateral > 0 ? Number(((totalExposure / totalCollateral) * 100).toFixed(2)) : 0,
    healthDistribution: {
      healthy: healthyCount,
      warning: warningCount,
      breached: breachCount,
    },
    pools: enriched,
  };
}

module.exports = {
  getOrCreateLiquidityPool,
  calculatePoolMetrics,
  updateCollateralAllocation,
  reserveLiquidity,
  commitSettlementDebit,
  getSystemLiquiditySummary,
};
