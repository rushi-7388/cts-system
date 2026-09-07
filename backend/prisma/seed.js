const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const hash = await bcrypt.hash("password123", 10);

  const bankA = await prisma.bank.upsert({
    where: { ifsc: "SBIN0001234" },
    update: { name: "Surat Local Bank" },
    create: { name: "Surat Local Bank", ifsc: "SBIN0001234", code: "SNB" },
  });

  const bankB = await prisma.bank.upsert({
    where: { ifsc: "HDFC0005678" },
    update: {},
    create: { name: "Horizon Digital Bank", ifsc: "HDFC0005678", code: "HDB" },
  });

  await prisma.user.upsert({
    where: { email: "presenting@snb.com" },
    update: {},
    create: {
      name: "Presenting Bank Clerk",
      email: "presenting@snb.com",
      password: hash,
      role: "PRESENTING_BANK",
      bankId: bankA.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "drawee@hdb.com" },
    update: {},
    create: {
      name: "Drawee Bank Verifier",
      email: "drawee@hdb.com",
      password: hash,
      role: "DRAWEE_BANK",
      bankId: bankB.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "checker@hdb.com" },
    update: {},
    create: {
      name: "Drawee Bank Senior Approver (Checker)",
      email: "checker@hdb.com",
      password: hash,
      role: "DRAWEE_BANK",
      bankId: bankB.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@cts.com" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@cts.com",
      password: hash,
      role: "ADMIN",
      bankId: bankA.id,
    },
  });

  await prisma.batch.upsert({
    where: { sessionCode: "SESSION-MORNING-01" },
    update: {},
    create: {
      sessionName: "Standard Morning Clearing Cycle",
      sessionCode: "SESSION-MORNING-01",
      status: "OPEN",
    },
  });

  // Seed Positive Pay Records (Pre-registered by drawer account holders)
  await prisma.positivePayRecord.upsert({
    where: {
      accountNumber_chequeNumber: {
        accountNumber: "123456789012",
        chequeNumber: "000123",
      },
    },
    update: {
      payeeName: "Sample Payee",
      amount: 50000,
      chequeDate: new Date(),
      status: "REGISTERED",
    },
    create: {
      accountNumber: "123456789012",
      chequeNumber: "000123",
      payeeName: "Sample Payee",
      amount: 50000,
      chequeDate: new Date(),
      status: "REGISTERED",
      bankId: bankB.id,
    },
  });

  // Pre-registered high value record matching ₹1,50,000 cheque
  await prisma.positivePayRecord.upsert({
    where: {
      accountNumber_chequeNumber: {
        accountNumber: "987654321098",
        chequeNumber: "450122",
      },
    },
    update: {
      payeeName: "Acme Corp",
      amount: 150000,
      chequeDate: new Date(),
      status: "REGISTERED",
    },
    create: {
      accountNumber: "987654321098",
      chequeNumber: "450122",
      payeeName: "Acme Corp",
      amount: 150000,
      chequeDate: new Date(),
      status: "REGISTERED",
      bankId: bankB.id,
    },
  });

  // Discrepancy test record: registered for ₹75,000 with payee "Delta Logistics"
  await prisma.positivePayRecord.upsert({
    where: {
      accountNumber_chequeNumber: {
        accountNumber: "555666777888",
        chequeNumber: "998877",
      },
    },
    update: {
      payeeName: "Delta Logistics",
      amount: 75000,
      chequeDate: new Date(),
      status: "REGISTERED",
    },
    create: {
      accountNumber: "555666777888",
      chequeNumber: "998877",
      payeeName: "Delta Logistics",
      amount: 75000,
      chequeDate: new Date(),
      status: "REGISTERED",
      bankId: bankB.id,
    },
  });

  console.log("Seed complete.");
  console.log("Login with password123 for:");
  console.log("- presenting@snb.com (Clerk - Presenting)");
  console.log("- drawee@hdb.com (Verifier - Drawee Maker)");
  console.log("- checker@hdb.com (Senior Approver - Drawee Checker)");
  console.log("- admin@cts.com (System Administrator)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
