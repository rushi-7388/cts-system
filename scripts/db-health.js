#!/usr/bin/env node
// ==============================================================================
// CTS Database Health & Diagnostic Tool
// ==============================================================================
const { PrismaClient } = require("../backend/node_modules/@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://cts:cts_password@localhost:5432/cts_system?schema=public",
    },
  },
});

async function main() {
  console.log("==================================================");
  console.log("   CTS PostgreSQL Health & Reliability Monitor    ");
  console.log("==================================================");

  const start = Date.now();
  try {
    const rawResult = await prisma.$queryRaw`
      SELECT 
        version() as pg_version,
        current_database() as database_name,
        pg_database_size(current_database()) as db_bytes
    `;

    const latencyMs = Date.now() - start;
    const dbInfo = rawResult[0];

    console.log(`[STATUS]   Connection: OK`);
    console.log(`[LATENCY]  Round-trip Ping: ${latencyMs}ms`);
    console.log(`[DATABASE] Database: ${dbInfo.database_name}`);
    console.log(`[STORAGE]  Database Size: ${(Number(dbInfo.db_bytes) / 1024 / 1024).toFixed(2)} MB`);
    console.log(`[ENGINE]   PostgreSQL: ${dbInfo.pg_version.split(",")[0]}`);

    const [cheques, banks, batches, telemetry] = await Promise.all([
      prisma.cheque.count(),
      prisma.bank.count(),
      prisma.batch.count(),
      prisma.telemetryEvent.count(),
    ]);

    console.log("\n[TABLE RECORD COUNTS]");
    console.log(`- Banks:             ${banks}`);
    console.log(`- Cheques:           ${cheques}`);
    console.log(`- Clearing Batches:  ${batches}`);
    console.log(`- Telemetry Events:  ${telemetry}`);

    console.log("\n>>> Health check PASSED with 0 errors.");
    process.exit(0);
  } catch (err) {
    console.error("\n>>> Health check FAILED:", err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
