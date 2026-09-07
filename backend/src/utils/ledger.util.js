const crypto = require("crypto");
const prisma = require("../config/prisma");

const GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

function computeHash(prevHash, payload) {
  const dataString = `${prevHash || GENESIS_HASH}::${payload.chequeId}::${payload.fromStatus || "START"}::${payload.toStatus}::${payload.actorId || "SYSTEM"}::${payload.createdAt}`;
  return crypto.createHash("sha256").update(dataString).digest("hex");
}

async function recordChainedEvent({ chequeId, fromStatus, toStatus, remarks, actorId, prismaClient = prisma }) {
  // Find the latest event in the entire ledger
  const latestEvent = await prismaClient.clearingEvent.findFirst({
    where: { hash: { not: null } },
    orderBy: { createdAt: "desc" },
  });

  const prevHash = latestEvent?.hash || GENESIS_HASH;
  const createdAt = new Date();

  const hash = computeHash(prevHash, {
    chequeId,
    fromStatus,
    toStatus,
    actorId,
    createdAt: createdAt.toISOString(),
  });

  return prismaClient.clearingEvent.create({
    data: {
      chequeId,
      fromStatus,
      toStatus,
      remarks,
      actorId,
      prevHash,
      hash,
      createdAt,
    },
    include: { cheque: true, actor: true },
  });
}

async function verifyLedgerIntegrity() {
  const events = await prisma.clearingEvent.findMany({
    orderBy: { createdAt: "asc" },
    include: { cheque: true, actor: true },
  });

  if (events.length === 0) {
    return {
      isValid: true,
      totalEvents: 0,
      genesisHash: GENESIS_HASH,
      tipHash: GENESIS_HASH,
      message: "Ledger is empty. Zero transactions recorded.",
    };
  }

  let expectedPrevHash = GENESIS_HASH;

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];

    // Check 1: prevHash must match the previous event's hash
    if (ev.prevHash !== expectedPrevHash) {
      return {
        isValid: false,
        compromisedIndex: i,
        compromisedEventId: ev.id,
        chequeNumber: ev.cheque?.chequeNumber,
        expectedPrevHash,
        actualPrevHash: ev.prevHash,
        reason: "CHAIN_BREAK: prevHash does not match preceding event hash",
      };
    }

    // Check 2: recalculate current hash and ensure zero tampering
    const calculatedHash = computeHash(expectedPrevHash, {
      chequeId: ev.chequeId,
      fromStatus: ev.fromStatus,
      toStatus: ev.toStatus,
      actorId: ev.actorId,
      createdAt: new Date(ev.createdAt).toISOString(),
    });

    if (ev.hash !== calculatedHash) {
      return {
        isValid: false,
        compromisedIndex: i,
        compromisedEventId: ev.id,
        chequeNumber: ev.cheque?.chequeNumber,
        expectedHash: calculatedHash,
        actualHash: ev.hash,
        reason: "TAMPER_DETECTED: Stored hash does not match computed data digest",
      };
    }

    expectedPrevHash = ev.hash;
  }

  return {
    isValid: true,
    totalEvents: events.length,
    genesisHash: events[0].hash,
    tipHash: events[events.length - 1].hash,
    verifiedAt: new Date().toISOString(),
    message: "Cryptographic ledger verification PASSED. All SHA-256 blocks valid.",
  };
}

// Automatically backfills any unhashed historical events from seed/init
async function backfillUnhashedEvents() {
  const unhashed = await prisma.clearingEvent.findMany({
    where: { hash: null },
    orderBy: { createdAt: "asc" },
  });

  if (unhashed.length === 0) return;

  console.log(`Chaining ${unhashed.length} historical unhashed events into the cryptographic ledger...`);

  let prevEvent = await prisma.clearingEvent.findFirst({
    where: { hash: { not: null } },
    orderBy: { createdAt: "desc" },
  });

  let currentPrevHash = prevEvent?.hash || GENESIS_HASH;

  for (const ev of unhashed) {
    const hash = computeHash(currentPrevHash, {
      chequeId: ev.chequeId,
      fromStatus: ev.fromStatus,
      toStatus: ev.toStatus,
      actorId: ev.actorId,
      createdAt: new Date(ev.createdAt).toISOString(),
    });

    await prisma.clearingEvent.update({
      where: { id: ev.id },
      data: { prevHash: currentPrevHash, hash },
    });

    currentPrevHash = hash;
  }

  console.log("Historical events chained into cryptographic ledger successfully.");
}

module.exports = {
  computeHash,
  recordChainedEvent,
  verifyLedgerIntegrity,
  backfillUnhashedEvents,
  GENESIS_HASH,
};
