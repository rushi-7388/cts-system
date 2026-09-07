const prisma = require("../config/prisma");

async function listBatches(req, res) {
  try {
    const batches = await prisma.batch.findMany({
      include: {
        _count: { select: { cheques: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(batches);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function getBatch(req, res) {
  try {
    const batch = await prisma.batch.findUnique({
      where: { id: req.params.id },
      include: {
        cheques: {
          include: { presentingBank: true, draweeBank: true },
        },
      },
    });
    if (!batch) return res.status(404).json({ error: "Clearing batch session not found" });
    return res.json(batch);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function createBatch(req, res) {
  try {
    const { sessionName, sessionCode } = req.body;
    if (!sessionName) {
      return res.status(400).json({ error: "sessionName is required" });
    }

    const code = sessionCode || `SESSION-${new Date().toISOString().slice(0, 10)}-${Date.now().toString().slice(-4)}`;

    const batch = await prisma.batch.create({
      data: {
        sessionName,
        sessionCode: code,
        status: "OPEN",
      },
    });

    return res.status(201).json(batch);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function lockBatch(req, res) {
  try {
    const { id } = req.params;
    const batch = await prisma.batch.findUnique({
      where: { id },
      include: { cheques: true },
    });

    if (!batch) return res.status(404).json({ error: "Batch not found" });
    if (batch.status !== "OPEN") {
      return res.status(400).json({ error: `Cannot lock batch in status ${batch.status}` });
    }

    const totalCount = batch.cheques.length;
    const totalAmount = batch.cheques.reduce((sum, c) => sum + Number(c.amount), 0);

    const updated = await prisma.batch.update({
      where: { id },
      data: {
        status: "LOCKED",
        closedAt: new Date(),
        totalCount,
        totalAmount,
      },
    });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function processBatch(req, res) {
  try {
    const { id } = req.params;
    const batch = await prisma.batch.findUnique({
      where: { id },
      include: { cheques: true },
    });

    if (!batch) return res.status(404).json({ error: "Batch not found" });
    if (batch.status !== "LOCKED") {
      return res.status(400).json({ error: "Batch must be LOCKED before reconciliation and processing" });
    }

    // Auto-clear all VERIFIED cheques in the batch
    const verifiedCheques = batch.cheques.filter((c) => c.status === "VERIFIED");

    for (const cheque of verifiedCheques) {
      await prisma.cheque.update({
        where: { id: cheque.id },
        data: {
          status: "CLEARED",
          events: {
            create: {
              fromStatus: "VERIFIED",
              toStatus: "CLEARED",
              remarks: `Cleared during atomic batch processing [${batch.sessionCode}]`,
              actorId: req.user.id,
            },
          },
        },
      });
    }

    const processed = await prisma.batch.update({
      where: { id },
      data: { status: "RECONCILED" },
      include: { cheques: true },
    });

    return res.json({
      message: `Batch successfully reconciled. ${verifiedCheques.length} cheque(s) cleared.`,
      batch: processed,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  listBatches,
  getBatch,
  createBatch,
  lockBatch,
  processBatch,
};
