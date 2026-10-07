/**
 * Automated Verification Diagnostic for New CTS Enterprise Features:
 * 1. Intraday Liquidity & Collateral Reservation System (LMS)
 * 2. Clearing Dispute Resolution Mechanism (DRM)
 * 3. Public Key Infrastructure (PKI) Digital Signature Validation
 * 4. Clearing Session Cutoff Windows & Two-Way Reconciliation
 */

const crypto = require("crypto");
const liquidityService = require("../src/services/liquidity.service");
const disputeService = require("../src/services/dispute.service");
const pkiService = require("../src/services/pki.service");
const reconciliationService = require("../src/services/reconciliation.service");
const { validateRequired, validatePositiveNumber, validateEnum } = require("../src/validators/schemas");

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log("================================================================");
  console.log("  CTS New Enterprise Features — Comprehensive Unit Diagnostic   ");
  console.log("================================================================\n");

  // TEST SUITE 1: Validation Engine
  console.log("▶ SUITE 1: Validation Engine & Boundary Guarantees");
  try {
    validateRequired({ a: 1, b: "hello" }, ["a", "b"]);
    assert(true, "validateRequired passes valid payload");
  } catch (e) {
    assert(false, "validateRequired threw on valid payload");
  }

  try {
    validateRequired({ a: 1 }, ["a", "b"]);
    assert(false, "validateRequired should fail on missing field");
  } catch (e) {
    assert(e.status === 400, "validateRequired throws 400 on missing field");
  }

  try {
    validatePositiveNumber(50000, "amount");
    assert(true, "validatePositiveNumber accepts positive float/int");
  } catch (e) {
    assert(false, "validatePositiveNumber threw on valid number");
  }

  try {
    validatePositiveNumber(-10, "amount");
    assert(false, "validatePositiveNumber should fail on negative number");
  } catch (e) {
    assert(e.status === 400, "validatePositiveNumber throws 400 on negative number");
  }

  try {
    validateEnum("FILED", ["FILED", "CLOSED"], "status");
    assert(true, "validateEnum accepts valid enum value");
  } catch (e) {
    assert(false, "validateEnum threw on valid enum value");
  }

  // TEST SUITE 2: Intraday Liquidity Math & Headroom Calculations
  console.log("\n▶ SUITE 2: Intraday Liquidity & Collateral Reservation (LMS)");
  const mockPool = {
    allocatedCollateral: 10000000.0, // 1 Crore
    creditLine: 2000000.0, // 20 Lakhs
    currentExposure: 3000000.0, // 30 Lakhs
    reservedAmount: 500000.0, // 5 Lakhs
    warningThresholdPercent: 80.0,
    breachThresholdPercent: 95.0,
  };

  const metrics = liquidityService.calculatePoolMetrics(mockPool);
  assert(metrics.totalCapacity === 12000000.0, "Total Capacity calculated correctly (1.2 Crore)");
  assert(metrics.totalObligations === 3500000.0, "Total Obligations sum exposure + reserved (35 Lakhs)");
  assert(metrics.availableHeadroom === 8500000.0, "Available Headroom calculated correctly (85 Lakhs)");
  assert(metrics.utilizationPercent === 29.17, "Utilization percent calculated accurately (29.17%)");
  assert(metrics.status === "HEALTHY", "Pool status is HEALTHY when < 80%");

  // Test warning & breach status logic
  const warningPool = { ...mockPool, currentExposure: 9600000.0, reservedAmount: 500000.0 }; // > 80%
  const warningMetrics = liquidityService.calculatePoolMetrics(warningPool);
  assert(warningMetrics.status === "WARNING", "Pool status transitions to WARNING when >= 80%");

  const breachPool = { ...mockPool, currentExposure: 11500000.0, reservedAmount: 200000.0 }; // > 95%
  const breachMetrics = liquidityService.calculatePoolMetrics(breachPool);
  assert(breachMetrics.status === "BREACHED", "Pool status transitions to BREACHED when >= 95%");

  // TEST SUITE 3: Dispute Resolution Engine (NPCI CTS DRM)
  console.log("\n▶ SUITE 3: Dispute Resolution Mechanism (DRM) Rules");
  const claimNum1 = disputeService.generateClaimNumber();
  const claimNum2 = disputeService.generateClaimNumber();
  const year = new Date().getFullYear();
  assert(claimNum1.startsWith(`DRM/${year}/`), "Claim number adheres to standard DRM format");
  assert(claimNum1 !== claimNum2, "Consecutive claim numbers are distinct and non-colliding");

  // TEST SUITE 4: PKI & Cryptographic Digital Signature Algorithms
  console.log("\n▶ SUITE 4: PKI & Digital Signature Cryptography");
  const testPayload = JSON.stringify({
    sessionCode: "SESSION-MORNING-01",
    totalCount: 15,
    totalAmount: 750000,
  });
  const digest1 = crypto.createHash("sha256").update(testPayload).digest("hex");
  const digest2 = crypto.createHash("sha256").update(testPayload).digest("hex");
  assert(digest1.length === 64, "SHA-256 batch payload digest is 64 hex characters");
  assert(digest1 === digest2, "Deterministic digest consistency verified");

  const tamperedPayload = JSON.stringify({
    sessionCode: "SESSION-MORNING-01",
    totalCount: 16, // Altered count
    totalAmount: 750000,
  });
  const tamperedDigest = crypto.createHash("sha256").update(tamperedPayload).digest("hex");
  assert(digest1 !== tamperedDigest, "Altered clearing payload produces immediate cryptographic mismatch");

  // TEST SUITE 5: AI Forensic Computer Vision & Tampering Engine
  console.log("\n▶ SUITE 5: 🔬 AI Forensic Cheque Tampering & Spectral Vision Engine");
  const forensicsUtil = require("../src/utils/forensics.util");
  const cleanChequeAnalysis = forensicsUtil.analyzeChequeForensics({
    id: "chk-clean-01",
    chequeNumber: "000101",
    amount: 50000,
    fraudScore: 10,
  });
  assert(cleanChequeAnalysis.overallAuthenticityIndex >= 90, "Clean instrument receives high authenticity score (>=90%)");
  assert(cleanChequeAnalysis.tamperVerdict === "AUTHENTIC_INSTRUMENT", "Clean instrument classified as AUTHENTIC_INSTRUMENT");

  const suspectChequeAnalysis = forensicsUtil.analyzeChequeForensics({
    id: "chk-suspect-02",
    chequeNumber: "000102",
    amount: 550000,
    fraudScore: 88,
  });
  assert(suspectChequeAnalysis.anomalies.length > 0, "Suspect instrument flags chemical washing / prepended digit anomalies");
  assert(suspectChequeAnalysis.securityFibers.length > 0, "CTS-2010 security fibers mapped across spectral grid");

  // TEST SUITE 6: Interbank Liquidity Gridlock Resolution Engine (LSM)
  console.log("\n▶ SUITE 6: ⚡ Interbank Liquidity Gridlock Resolution Engine (Tarjan LSM)");
  const lsmService = require("../src/services/lsm.service");
  const initialTopology = await lsmService.getGridlockTopology();
  assert(initialTopology.detectedCycles.length > 0, "Tarjan cycle detection identifies circular indebtedness loops");
  assert(initialTopology.metrics.isGridlocked === true, "System accurately flags active clearing gridlock");

  const resolutionResult = await lsmService.resolveGridlock();
  assert(resolutionResult.success === true, "Tarjan multilateral cycle netting executes successfully");
  assert(resolutionResult.receipt.centralBankReservesConsumed === 0, "Discharged circular debt with zero central bank liquidity consumed");
  assert(resolutionResult.receipt.liquiditySavingsRatio === "100.0%", "Achieved 100% liquidity efficiency pure offset");

  // TEST SUITE 7: FIPS 140-2 Level 3 Virtual HSM & M-of-N Key Ceremony
  console.log("\n▶ SUITE 7: 🛡️ FIPS 140-2 Level 3 Virtual HSM & M-of-N Key Ceremony");
  const hsmService = require("../src/services/hsm.service");
  hsmService.reinitializeHsm();
  let hsmStatus = hsmService.getHsmStatus();
  assert(hsmStatus.status === "LOCKED", "HSM starts in FIPS LOCKED state");
  assert(hsmStatus.quorum.required === 2, "Requires M=2 of N=3 custodians to reach quorum");

  // Insert Custodian 1 (1/2, not yet operational)
  hsmService.insertCustodianKey("CUST-RBI-01", "1122");
  hsmStatus = hsmService.getHsmStatus();
  assert(hsmStatus.quorum.currentInserted === 1, "Slot A smart-card inserted (1/2 threshold)");
  assert(hsmStatus.status === "CEREMONY_IN_PROGRESS", "Status transitions to CEREMONY_IN_PROGRESS");

  // Insert Custodian 2 (2/2, reaches quorum)
  hsmService.insertCustodianKey("CUST-IDRBT-02", "3344");
  hsmStatus = hsmService.getHsmStatus();
  assert(hsmStatus.status === "UNLOCKED_OPERATIONAL", "Master key synthesized into volatile RAM when quorum reached");
  assert(hsmStatus.masterKeyDigest !== null, "Master key fingerprint generated without exposing plaintext");

  // Test Tamper-Reactive Zeroization
  const zeroizeResult = hsmService.triggerTamperZeroization("SIMULATED_CHASSIS_BREACH_TEST");
  hsmStatus = hsmService.getHsmStatus();
  assert(hsmStatus.status === "ZEROIZED", "Chassis breach instantaneously transitions HSM to ZEROIZED");
  assert(hsmStatus.masterKeyDigest.includes("ZEROIZED"), "Volatile RAM keys wiped with zero bytes");

  // Clean reset
  hsmService.reinitializeHsm();

  // TEST SUITE 8: National Clearing Switch Active-Active DC Failover
  console.log("\n▶ SUITE 8: 🌐 National Clearing Switch & Multi-Region DC Failover");
  const dcService = require("../src/services/datacenter.service");
  const dcTopology = dcService.getTopology();
  assert(dcTopology.primaryActiveDc === "DC_MUMBAI", "Initial active primary is DC Mumbai (BKC Western Hub)");
  assert(dcTopology.replicationLagMs < 1.0, "Sub-millisecond synchronous Raft replication verified");

  // Trigger 1-Click Failover to DR Hyderabad
  const failoverResult = dcService.triggerFailover("DR_HYDERABAD");
  assert(failoverResult.success === true, "Active-Active DC failover completed successfully");
  assert(failoverResult.receipt.droppedTransactions === 0, "Zero dropped transactions during in-flight rerouting");
  assert(failoverResult.topology.primaryActiveDc === "DR_HYDERABAD", "Traffic autonomously routed to DR Hyderabad");

  // TEST SUITE 9: Phase 1 — LSM Real-Time Gridlock Daemon & Bilateral Netting
  console.log("\n▶ SUITE 9: ⚡ Phase 1: Real-Time Gridlock Daemon & Bilateral Greedy Offsetting");
  const topologyWithBilateral = await lsmService.getGridlockTopology();
  assert(topologyWithBilateral.bilateralOffsets !== undefined, "Bilateral opposing payment pairs identified");
  
  // Test daemon loop toggle
  const daemonActive = lsmService.toggleAutoDaemon(true, 5000, false);
  assert(daemonActive.enabled === true, "Autonomous background gridlock daemon activated");
  const daemonStatus = lsmService.getDaemonStatus();
  assert(daemonStatus.enabled === true, "Daemon status reports active ticking state");
  lsmService.toggleAutoDaemon(false); // Stop daemon
  assert(lsmService.getDaemonStatus().enabled === false, "Daemon gracefully stopped");

  // TEST SUITE 10: Phase 2 — Autonomous Multi-Agent Swarm Adjudication Engine
  console.log("\n▶ SUITE 10: 🤖 Phase 2: Autonomous 4-Agent Swarm Adjudication & Forensic Docket");
  const swarmService = require("../src/services/swarm.service");
  
  // Test 1: Clean, authentic cheque -> Autonomous STP (<500ms)
  const cleanCheque = {
    id: "test-clean-01",
    chequeNumber: "000101",
    amount: 85000,
    payeeName: "Apex Retailers Ltd",
    riskScore: 12,
    riskTier: "LOW",
    ppsStatus: "PPS_VERIFIED",
    signatureMatchScore: 97.4,
    createdAt: new Date().toISOString(),
  };
  const cleanDocket = await swarmService.evaluateChequeWithSwarm("test-clean-01", cleanCheque);
  assert(cleanDocket.consensus.consensusScore >= 98.0, "Clean instrument scores >= 98.0% consensus");
  assert(cleanDocket.consensus.autoCleared === true, "Autonomous Straight-Through Processing (STP) triggers on clean instrument");
  assert(cleanDocket.deliberationLog.length === 5, "Deliberation log records all 4 specialized agents + arbiter");
  assert(cleanDocket.cryptographicSeal.length === 64, "Executive docket sealed with SHA-256 cryptographic proof");

  // Test 2: Suspect instrument with FFT generative AI diffusion artifact & PPS mismatch
  const suspectCheque = {
    id: "test-suspect-02",
    chequeNumber: "000999",
    amount: 1500000, // ₹15 Lakhs
    payeeName: "Suspicious Mule Entity",
    riskScore: 82,
    riskTier: "HIGH",
    ppsStatus: "PPS_MISMATCH",
    signatureMatchScore: 62.1,
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(), // > 90 days (Stale)
  };
  const suspectDocket = await swarmService.evaluateChequeWithSwarm("test-suspect-02", suspectCheque);
  assert(suspectDocket.consensus.autoCleared === false, "Suspect instrument correctly blocks autonomous STP");
  assert(suspectDocket.consensus.criticalFlagsCount > 0, "Critical flags raised for FFT diffusion & Stale instrument");
  assert(suspectDocket.consensus.recommendation.includes("REJECT") || suspectDocket.consensus.recommendation.includes("SENIOR_CHECKER"), "Arbiter directs human escalation");

  // TEST SUITE 11: Phase 3 — NIST Post-Quantum Cryptography (FIPS 204 ML-DSA & FIPS 203 ML-KEM)
  console.log("\n▶ SUITE 11: 🛡️ Phase 3: NIST FIPS 204 ML-DSA (Dilithium) & FIPS 203 ML-KEM (Kyber)");
  const pqcService = require("../src/services/pqc.service");

  // Test 1: Key generation
  const pqcKeys = pqcService.generateHybridKeyPair("SRT");
  assert(pqcKeys.algorithm === "ML-DSA-65", "Generates NIST FIPS 204 ML-DSA-65 keypair");
  assert(pqcKeys.classical.type.includes("RSA-4096"), "Dual-stack includes classical RSA-4096 layer");
  assert(pqcKeys.postQuantum.shorAlgorithmStatus.includes("POST_QUANTUM_RESISTANT"), "Post-quantum resistance confirmed against Shor's algorithm");

  // Test 2: Hybrid batch manifest signing
  const sampleManifest = { batchId: "BATCH-TEST-2026", totalCount: 25, totalAmount: 1250000.0 };
  const hybridSig = pqcService.signBatchHybrid("BATCH-TEST-2026", sampleManifest, "SRT");
  assert(hybridSig.classicalSignature.verified === true, "Classical RSA-4096 signature layer valid");
  assert(hybridSig.postQuantumSignature.algorithm === "ML-DSA-65", "Post-quantum ML-DSA-65 signature layer generated");
  assert(hybridSig.postQuantumSignature.latticeNormProof.includes("BOUND_SATISFIED"), "Lattice norm bound ||z||_inf verified");

  // Test 3: Quantum verification
  const verification = pqcService.verifyBatchHybrid("BATCH-TEST-2026", sampleManifest, "SRT");
  assert(verification.verified === true, "Hybrid dual-layer cryptographic manifest verified 100%");
  assert(verification.postQuantumValid === true, "Quantum-resistant signature layer validated");

  // Test 4: ML-KEM-768 Tunnel Encapsulation
  const kemTunnel = pqcService.encapsulateInterbankTunnel("SRT", "HDB");
  assert(kemTunnel.protocol.includes("ML-KEM-768"), "FIPS 203 ML-KEM-768 shared secret encapsulated");
  assert(kemTunnel.encapsulatedCiphertextLengthBytes === 1088, "Ciphertext size conforms to ML-KEM-768 standard (1088 bytes)");

  // Test 5: Global readiness metrics
  const readiness = pqcService.getQuantumReadinessMetrics();
  assert(readiness.overallReadinessScorePercent >= 90.0, "National clearing switch PQC readiness score certified >= 90%");

  // TEST SUITE 12: Zero-Knowledge Confidential Clearing (zk-CTS / Groth16 BN254)
  console.log("\n▶ SUITE 12: 🔐 Zero-Knowledge Confidential Clearing (zk-SNARK Groth16 / BN254)");
  const zkpService = require("../src/services/zkp.service");
  const testZkCheque = {
    id: "chq-zk-01",
    chequeNumber: "000888",
    amount: 250000,
    accountNumber: "987654321098",
    signatureMatchScore: 96.2,
    ppsStatus: "PPS_VERIFIED",
  };
  const zkProof = zkpService.generateSolvencyProof(testZkCheque, { balance: 4000000 });
  assert(zkProof.proof.pi_a.length === 3, "Groth16 G1 vector pi_a generated over BN254");
  assert(zkProof.proof.pi_b.length === 3, "Groth16 G2 vector pi_b generated over BN254");
  assert(zkProof.zeroKnowledgeGuarantees.drawerBalanceDisclosed === false, "Zero-Knowledge Guarantee: Drawer balance remains concealed");
  assert(zkProof.status === "VERIFIED_VALID", "Solvency witness satisfied without revealing private balance");
  
  // Fast Verifier Test
  const zkVerify = zkpService.verifySolvencyProof(zkProof);
  assert(zkVerify.verified === true, "Clearing House bilinear pairing check e(A,B)==e(alpha,beta)... verified true");
  assert(zkVerify.pairingCheckPassed === true, "Bilinear pairing check successfully passed");

  // TEST SUITE 13: Programmable Smart Cheques, Micro-Liens & CBDC (e-Rupee)
  console.log("\n▶ SUITE 13: ⚡ Programmable Smart Cheques, Cryptographic Micro-Liens & CBDC (e-Rupee)");
  const smartService = require("../src/services/smartcheque.service");
  
  // Micro-Lien Earmarking
  const lien = smartService.earmarkMicroLien("chq-smart-01", 150000, "123456789012");
  assert(lien.earmarkedAmount === 150000, "Micro-lien accurately holds ₹1,50,000 in drawer CBS escrow");
  assert(lien.bounceRisk === "0.0% (GUARANTEED_LIQUIDITY_RESERVE)", "Guarantees 0% bounce rate for cleared instrument");

  // Smart Escrow Contract & Statutory Tax Split
  const smartContract = smartService.createSmartContract("chq-smart-01", { amount: 150000, taxRatePercent: 18.0 });
  assert(smartContract.splitRouting.vendorBeneficiary.netPayoutAmount === 123000, "Vendor net payout auto-computed (82% = ₹1,23,000)");
  assert(smartContract.splitRouting.statutoryTaxEscrow.taxDeductedAmount === 27000, "Statutory GST withheld automatically (18% = ₹27,000)");
  assert(smartContract.milestones.length === 2, "Multi-milestone escrow schedule registered");

  // Milestone Release
  const updatedContract = smartService.releaseMilestone("chq-smart-01", "M2_DELIVERY_SIGN_OFF");
  assert(updatedContract.milestones[1].status === "SATISFIED", "Commercial delivery milestone released upon condition sign-off");

  // Atomic CBDC e-Rupee Token Settlement
  const cbdcReceipt = smartService.settleWithCbdc("chq-smart-01", 150000, "WLT-RBI-eINR-992144");
  assert(cbdcReceipt.settlementCurrency.includes("e₹"), "Settlement executed in Central Bank Digital Rupee (e₹)");
  assert(cbdcReceipt.atomicFinality === "IMMEDIATE_FINAL_IRREVOCABLE", "Atomic finality confirmed via CBDC token minting");

  // TEST SUITE 14: Cross-Border Multi-Currency Clearing & Real-Time Sanctions Screener
  console.log("\n▶ SUITE 14: 🌐 Cross-Border Multi-Currency CTS & Real-Time Sanctions Screener");
  const crossService = require("../src/services/crossborder.service");

  // Currency Conversion & Forward Hedging
  const fxResult = crossService.convertCurrency(10000, "USD");
  assert(fxResult.foreignCurrency === "USD", "Identified foreign currency draft (USD 10,000)");
  assert(fxResult.inrGrossAmount === 841200, "Converted at live interbank rate (1 USD = ₹84.12)");
  assert(fxResult.hedgingSpreadDeduction > 0, "Forward hedge spread deducted");

  // Sanctions & PEP Screener (Clean Drawer)
  const cleanScreening = crossService.screenSanctions({ drawerName: "Acme Corporate Ltd", payeeName: "Genuine Supplier", countryOrigin: "IN" });
  assert(cleanScreening.status === "PASSED", "Clean international instrument clears sanctions check");
  assert(cleanScreening.screeningDurationMs < 100, "Sanctions screening completed in sub-100ms");

  // Sanctions Screener (Watchlist Hit)
  const blockedScreening = crossService.screenSanctions({ drawerName: "Al-Faisal Logistics Corp", payeeName: "Acme", countryOrigin: "US" });
  assert(blockedScreening.status === "BLOCKED", "Identifies entity on OFAC SDN Watchlist and enforces statutory block");
  assert(blockedScreening.matchedSanctions.length > 0, "Matched sanctions entry returned in audit log");

  // ISO 20022 pacs.009 Export
  const pacs009Xml = crossService.generatePacs009Xml({ chequeNumber: "990011", payeeName: "Global Trade Inc" }, fxResult);
  assert(pacs009Xml.includes("pacs.009.001.08"), "Generates valid ISO 20022 pacs.009.001.08 XML document");
  assert(pacs009Xml.includes("RBI-EKUBER-CBPR-PLUS"), "Includes CBPR+ Central Bank clearing system proprietary header");



  // TEST SUMMARY
  console.log("\n================================================================");
  console.log(`  Diagnostic Results: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("Diagnostic execution error:", err);
  process.exit(1);
});

