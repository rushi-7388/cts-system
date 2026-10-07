const crypto = require("crypto");
const { broadcastEvent } = require("../utils/sse.util");

/**
 * FIPS 140-2 Level 3 Virtual Hardware Security Module (HSM) & M-of-N Key Ceremony Engine
 * 
 * Simulates physical central banking cryptographic enclave (IDRBT / NPCI / SWIFT standard).
 * Guarantees Master Clearing Keys cannot be exported in plaintext.
 * Requires M-of-N split-secrets custodian quorum to unlock national morning clearing switch.
 * Features automated tamper zeroization upon chassis intrusion.
 */

const FIPS_LEVEL = "FIPS 140-2 Level 3 (Physical Security, Cryptographic Boundary, Multi-Party Quorum)";
const FIRMWARE_REV = "v4.2.8-PROD-ENCLAVE";

// $N = 3$ authorized central custodians ($M = 2$ required)
const DEFAULT_CUSTODIANS = [
  {
    id: "CUST-RBI-01",
    slot: "SLOT_A",
    name: "Dr. Rajesh Mehta",
    title: "Senior Treasury Controller (Reserve Bank)",
    pin: "1122",
    smartCardSerial: "SC-9901-RBI-GOLD",
    isInserted: false,
    authenticatedAt: null,
    secretShare: "a8f3b20c91de456f780123456789abcdef0123456789abcdef0123456789abcd",
  },
  {
    id: "CUST-IDRBT-02",
    slot: "SLOT_B",
    name: "Priya Venkat",
    title: "Chief Risk Officer (IDRBT Clearing House)",
    pin: "3344",
    smartCardSerial: "SC-8842-IDRBT-SEC",
    isInserted: false,
    authenticatedAt: null,
    secretShare: "c4b12390efa567890123456789abcdef0123456789abcdef0123456789abcdef",
  },
  {
    id: "CUST-NPCI-03",
    slot: "SLOT_C",
    name: "Amit Joshi",
    title: "Director of Switch Infrastructure (NPCI)",
    pin: "5566",
    smartCardSerial: "SC-7729-NPCI-SWT",
    isInserted: false,
    authenticatedAt: null,
    secretShare: "f01e8a93bc4567890123456789abcdef0123456789abcdef0123456789abcdef",
  },
];

let hsmEnclaveState = {
  status: "LOCKED", // "LOCKED" | "CEREMONY_IN_PROGRESS" | "UNLOCKED_OPERATIONAL" | "ZEROIZED"
  thresholdM: 2,
  totalCustodiansN: 3,
  custodians: JSON.parse(JSON.stringify(DEFAULT_CUSTODIANS)),
  masterKeyDigest: null, // SHA-256 fingerprint only. Plaintext key NEVER exposed.
  unlockedAt: null,
  tamperSensors: {
    physicalMeshContinuity: "INTACT",
    voltageDifferential: "NOMINAL (3.30V)",
    internalTemperatureCelsius: 34.2,
    chassisInterlockSwitch: "CLOSED",
    passiveLightSensor: "DARK (0.00 Lux)",
  },
  auditTrail: [
    {
      timestamp: new Date().toISOString(),
      action: "POWER_ON_SELF_TEST",
      details: "POST passed. Cryptographic random number generator (NIST SP 800-90A DRBG) initialized.",
      level: "INFO",
    },
  ],
};

function logHsmAudit(action, details, level = "INFO") {
  hsmEnclaveState.auditTrail.unshift({
    timestamp: new Date().toISOString(),
    action,
    details,
    level,
  });
  if (hsmEnclaveState.auditTrail.length > 50) {
    hsmEnclaveState.auditTrail.pop();
  }
}

/**
 * Derives operational session signing key when M-of-N threshold is satisfied
 */
function reconstructMasterKey() {
  const insertedCustodians = hsmEnclaveState.custodians.filter((c) => c.isInserted);
  if (insertedCustodians.length >= hsmEnclaveState.thresholdM) {
    // Cryptographically combine active split shares
    const combinedHash = crypto
      .createHash("sha256")
      .update(insertedCustodians.map((c) => c.secretShare).join(":"))
      .digest("hex");

    hsmEnclaveState.masterKeyDigest = `SHA256:${combinedHash.slice(0, 16)}...${combinedHash.slice(-8)} (FIPS Verified)`;
    hsmEnclaveState.status = "UNLOCKED_OPERATIONAL";
    hsmEnclaveState.unlockedAt = new Date().toISOString();

    logHsmAudit(
      "KEY_CEREMONY_COMPLETED",
      `Quorum threshold satisfied (${insertedCustodians.length} of ${hsmEnclaveState.totalCustodiansN}). National Clearing Master Key reconstructed in secure enclave RAM.`,
      "SUCCESS"
    );

    broadcastEvent("HSM_CEREMONY_COMPLETED", {
      status: hsmEnclaveState.status,
      digest: hsmEnclaveState.masterKeyDigest,
      unlockedAt: hsmEnclaveState.unlockedAt,
    });
    return true;
  }
  return false;
}

/**
 * Returns current status of the Virtual HSM Enclave
 */
function getHsmStatus() {
  const insertedCount = hsmEnclaveState.custodians.filter((c) => c.isInserted).length;
  return {
    fipsCompliance: FIPS_LEVEL,
    firmwareRevision: FIRMWARE_REV,
    status: hsmEnclaveState.status,
    quorum: {
      required: hsmEnclaveState.thresholdM,
      total: hsmEnclaveState.totalCustodiansN,
      currentInserted: insertedCount,
      hasQuorum: insertedCount >= hsmEnclaveState.thresholdM,
    },
    masterKeyDigest: hsmEnclaveState.masterKeyDigest,
    unlockedAt: hsmEnclaveState.unlockedAt,
    tamperSensors: hsmEnclaveState.tamperSensors,
    custodians: hsmEnclaveState.custodians.map((c) => ({
      id: c.id,
      slot: c.slot,
      name: c.name,
      title: c.title,
      smartCardSerial: c.smartCardSerial,
      isInserted: c.isInserted,
      authenticatedAt: c.authenticatedAt,
    })),
    recentAuditTrail: hsmEnclaveState.auditTrail.slice(0, 10),
  };
}

/**
 * Simulates smart card insertion and PIN validation by a custodian
 */
function insertCustodianKey(custodianId, pin) {
  if (hsmEnclaveState.status === "ZEROIZED") {
    throw new Error("HSM has been ZEROIZED due to tamper breach. Cold-standby reboot and central factory re-key required.");
  }

  const custodian = hsmEnclaveState.custodians.find((c) => c.id === custodianId);
  if (!custodian) {
    throw new Error(`Custodian ${custodianId} not recognized in cryptographic registry`);
  }

  if (custodian.pin !== pin) {
    logHsmAudit("PIN_AUTH_FAILED", `Failed PIN entry for custodian ${custodian.name} on ${custodian.slot}`, "WARN");
    throw new Error("Invalid custodian smart-card cryptographic PIN");
  }

  custodian.isInserted = true;
  custodian.authenticatedAt = new Date().toISOString();
  logHsmAudit("SMART_CARD_INSERTED", `Custodian ${custodian.name} authenticated and split key inserted in ${custodian.slot}`, "INFO");

  if (hsmEnclaveState.status !== "UNLOCKED_OPERATIONAL") {
    hsmEnclaveState.status = "CEREMONY_IN_PROGRESS";
  }

  reconstructMasterKey();

  broadcastEvent("HSM_CUSTODIAN_AUTHENTICATED", {
    custodianId: custodian.id,
    slot: custodian.slot,
    status: hsmEnclaveState.status,
  });

  return getHsmStatus();
}

/**
 * Locks the HSM and purges volatile master key from RAM
 */
function lockHsm() {
  hsmEnclaveState.custodians.forEach((c) => {
    c.isInserted = false;
    c.authenticatedAt = null;
  });
  hsmEnclaveState.masterKeyDigest = null;
  hsmEnclaveState.unlockedAt = null;
  hsmEnclaveState.status = "LOCKED";

  logHsmAudit("HSM_LOCKED", "Session closed. Volatile master key purged from cryptographic enclave RAM.", "INFO");

  broadcastEvent("HSM_STATE_CHANGED", { status: "LOCKED" });
  return getHsmStatus();
}

/**
 * FIPS 140-2 Level 3 Emergency Tamper-Reactive Zeroization
 * Simulates chassis breach, laser intrusion or physical assault:
 * Immediately overwrites volatile RAM with 0x00 and isolates clearing switch.
 */
function triggerTamperZeroization(reason = "CHASSIS_INTRUSION_DETECTED") {
  // Purge master key and custodian shares
  hsmEnclaveState.masterKeyDigest = "0x0000000000000000 (ZEROIZED)";
  hsmEnclaveState.status = "ZEROIZED";
  hsmEnclaveState.custodians.forEach((c) => {
    c.isInserted = false;
    c.authenticatedAt = null;
  });

  // Tamper sensor alert states
  hsmEnclaveState.tamperSensors = {
    physicalMeshContinuity: "BREACHED / CIRCUIT SEVERED",
    voltageDifferential: "CRITICAL VOLTAGE DROP",
    internalTemperatureCelsius: 78.4,
    chassisInterlockSwitch: "OPEN / TRIP WIRE ACTIVATED",
    passiveLightSensor: "PHOTON INTRUSION (940 Lux)",
  };

  const zeroizationIncident = {
    action: "TAMPER_ZEROIZATION_TRIGGERED",
    reason,
    timestamp: new Date().toISOString(),
    status: "ZEROIZED",
    destructionSummary: "Volatile RAM overwritten with 0x00 in <4 microseconds. Master Signing Key destroyed. Disaster Recovery Cold Standby invoked.",
  };

  logHsmAudit("TAMPER_ZEROIZATION", `Emergency zeroization executed: ${reason}. Key material purged.`, "CRITICAL");

  broadcastEvent("HSM_ZEROIZED", zeroizationIncident);

  return {
    success: true,
    message: "FIPS 140-2 Level 3 Tamper Zeroization executed. All cryptographic keys wiped.",
    incident: zeroizationIncident,
    hsmStatus: getHsmStatus(),
  };
}

/**
 * Authorized Root Reinitialization after tamper drill or maintenance
 */
function reinitializeHsm() {
  hsmEnclaveState = {
    status: "LOCKED",
    thresholdM: 2,
    totalCustodiansN: 3,
    custodians: JSON.parse(JSON.stringify(DEFAULT_CUSTODIANS)),
    masterKeyDigest: null,
    unlockedAt: null,
    tamperSensors: {
      physicalMeshContinuity: "INTACT",
      voltageDifferential: "NOMINAL (3.30V)",
      internalTemperatureCelsius: 34.2,
      chassisInterlockSwitch: "CLOSED",
      passiveLightSensor: "DARK (0.00 Lux)",
    },
    auditTrail: [
      {
        timestamp: new Date().toISOString(),
        action: "FACTORY_COLD_REBOOT",
        details: "Cryptographic enclave factory reset complete. Clean FIPS 140-2 Level 3 state initialized.",
        level: "INFO",
      },
    ],
  };

  broadcastEvent("HSM_STATE_CHANGED", { status: "LOCKED" });
  return getHsmStatus();
}

module.exports = {
  getHsmStatus,
  insertCustodianKey,
  lockHsm,
  triggerTamperZeroization,
  reinitializeHsm,
};
