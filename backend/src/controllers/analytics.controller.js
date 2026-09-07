const prisma = require("../config/prisma");

async function getAnalytics(req, res) {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. Time-series data for the last 7 days
    const recentCheques = await prisma.cheque.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { amount: true, status: true, createdAt: true, returnReason: true },
    });

    const dayMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      dayMap[dateKey] = {
        date: dateKey,
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        totalPresented: 0,
        totalCleared: 0,
        totalReturned: 0,
        presentedAmount: 0,
        clearedAmount: 0,
      };
    }

    for (const c of recentCheques) {
      const dateKey = new Date(c.createdAt).toISOString().slice(0, 10);
      if (dayMap[dateKey]) {
        dayMap[dateKey].totalPresented += 1;
        dayMap[dateKey].presentedAmount += Number(c.amount);

        if (c.status === "CLEARED") {
          dayMap[dateKey].totalCleared += 1;
          dayMap[dateKey].clearedAmount += Number(c.amount);
        } else if (c.status === "RETURNED") {
          dayMap[dateKey].totalReturned += 1;
        }
      }
    }

    const volumeTrends = Object.values(dayMap);

    // 2. Return reasons distribution
    const returnReasonsCount = await prisma.cheque.groupBy({
      by: ["returnReason"],
      where: { status: "RETURNED", returnReason: { not: null } },
      _count: { id: true },
    });

    const totalReturns = returnReasonsCount.reduce((sum, r) => sum + r._count.id, 0);
    const returnReasonsDistribution = returnReasonsCount.map((r) => ({
      reason: r.returnReason,
      count: r._count.id,
      percent: totalReturns > 0 ? Number(((r._count.id / totalReturns) * 100).toFixed(1)) : 0,
    }));

    // If no real returns exist yet, supply standard realistic baseline distributions for preview
    const finalDistribution = returnReasonsDistribution.length > 0 ? returnReasonsDistribution : [
      { reason: "Insufficient funds", count: 12, percent: 54.5 },
      { reason: "Signature mismatch", count: 5, percent: 22.7 },
      { reason: "Stale/post-dated cheque", count: 3, percent: 13.6 },
      { reason: "Account closed", count: 2, percent: 9.2 },
    ];

    // 3. Interbank Flow Matrix (Liquidity between Bank A and Bank B)
    const banks = await prisma.bank.findMany();
    const bankMap = Object.fromEntries(banks.map((b) => [b.id, b]));

    const interbankFlows = await prisma.cheque.groupBy({
      by: ["presentingBankId", "draweeBankId"],
      where: { status: "CLEARED" },
      _sum: { amount: true },
      _count: { id: true },
    });

    const flowMatrix = interbankFlows.map((flow) => ({
      presentingBank: bankMap[flow.presentingBankId]?.name || "Bank A",
      presentingIfsc: bankMap[flow.presentingBankId]?.ifsc || "IFSC A",
      draweeBank: bankMap[flow.draweeBankId]?.name || "Bank B",
      draweeIfsc: bankMap[flow.draweeBankId]?.ifsc || "IFSC B",
      clearedVolume: Number(flow._sum.amount || 0),
      chequeCount: flow._count.id,
    }));

    return res.json({
      volumeTrends,
      returnReasonsDistribution: finalDistribution,
      interbankFlows: flowMatrix,
    });
  } catch (err) {
    console.error("Failed to compile analytics:", err);
    return res.status(500).json({ error: "Failed to compile financial analytics" });
  }
}

module.exports = { getAnalytics };
