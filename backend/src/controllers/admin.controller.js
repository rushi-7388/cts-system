const prisma = require("../config/prisma");

async function getStats(req, res) {
  const [total, presented, verified, cleared, returned] = await Promise.all([
    prisma.cheque.count(),
    prisma.cheque.count({ where: { status: "PRESENTED" } }),
    prisma.cheque.count({ where: { status: "VERIFIED" } }),
    prisma.cheque.count({ where: { status: "CLEARED" } }),
    prisma.cheque.count({ where: { status: "RETURNED" } }),
  ]);

  const clearedAgg = await prisma.cheque.aggregate({
    where: { status: "CLEARED" },
    _sum: { amount: true },
  });

  return res.json({
    total,
    byStatus: { PRESENTED: presented, VERIFIED: verified, CLEARED: cleared, RETURNED: returned },
    totalClearedAmount: clearedAgg._sum.amount || 0,
  });
}

async function getAuditTrail(req, res) {
  const events = await prisma.clearingEvent.findMany({
    include: { cheque: true, actor: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return res.json(events);
}

async function listBanks(req, res) {
  const banks = await prisma.bank.findMany({ orderBy: { name: "asc" } });
  return res.json(banks);
}

async function listFraudFlags(req, res) {
  const { resolved } = req.query;
  const where = resolved === undefined ? {} : { resolved: resolved === "true" };

  const flags = await prisma.fraudFlag.findMany({
    where,
    include: { cheque: { include: { presentingBank: true, draweeBank: true } } },
    orderBy: { createdAt: "desc" },
  });
  return res.json(flags);
}

async function resolveFraudFlag(req, res) {
  const { id } = req.params;
  const flag = await prisma.fraudFlag.update({
    where: { id },
    data: { resolved: true, resolvedBy: req.user.id },
  });
  return res.json(flag);
}

const { verifyLedgerIntegrity, backfillUnhashedEvents } = require("../utils/ledger.util");

async function verifyLedger(req, res) {
  try {
    await backfillUnhashedEvents();
    const auditResult = await verifyLedgerIntegrity();
    return res.json(auditResult);
  } catch (err) {
    console.error("Ledger verification error:", err);
    return res.status(500).json({ error: "Failed to verify cryptographic ledger integrity" });
  }
}

module.exports = { getStats, getAuditTrail, listBanks, listFraudFlags, resolveFraudFlag, verifyLedger };
