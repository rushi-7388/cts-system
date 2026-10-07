/**
 * AI Forensic Cheque Vision & Spectral Anomaly Engine
 * Simulates advanced hyperspectral computer vision, chemical washing detection,
 * DPI stroke inconsistency analysis, and biometric signature vectorization.
 */

function generateForensicAnalysis(cheque) {
  const numericAmount = Number(cheque.amount || 0);
  const isHighValue = numericAmount >= 100000;
  const score = cheque.riskScore ?? cheque.fraudScore ?? 0;
  const isSuspicious = score > 40 || cheque.riskTier === "HIGH";

  // 1. Pixel Tampering & Chemical Wash Detection
  const chemicalWashingDetected = isSuspicious;
  const dpiDiscrepancy = isHighValue && score > 50;

  // Anomalous regions on the cheque canvas (normalized x, y, width, height in %)
  const anomalyZones = [];

  if (chemicalWashingDetected) {
    anomalyZones.push({
      id: "anom_payee_bleach",
      name: "Chemical Bleaching / Ink Dissolution Trace",
      type: "CHEMICAL_WASHING",
      severity: "CRITICAL",
      confidence: 94.2,
      coordinates: { x: 12, y: 22, width: 45, height: 10 },
      description: "Hyperspectral UV reflection indicates solvent extraction under payee line font",
    });
  }

  if (dpiDiscrepancy) {
    anomalyZones.push({
      id: "anom_courtesy_stroke",
      name: "Courtesy Box Font DPI / Stroke Mismatch",
      type: "STROKE_ALTERATION",
      severity: "HIGH",
      confidence: 91.8,
      coordinates: { x: 70, y: 32, width: 22, height: 12 },
      description: "First digit demonstrates 450 DPI stroke width vs 300 DPI baseline cheque raster",
    });
  }

  // Baseline security fibers (green / authentic)
  const authenticSecurityFibers = [
    { x: 25, y: 15, length: 18, angle: 42, fluorescentUv: true },
    { x: 48, y: 55, length: 22, angle: 125, fluorescentUv: true },
    { x: 78, y: 72, length: 15, angle: 88, fluorescentUv: true },
    { x: 18, y: 84, length: 20, angle: 310, fluorescentUv: true },
    { x: 62, y: 28, length: 19, angle: 65, fluorescentUv: true },
  ];

  // 2. Biometric Signature Specimen Vectors (CBS Golden Record vs Presented)
  // Generates smooth stroke paths and pressure profiles
  const specimenSignature = {
    accountNumber: cheque.accountNumber,
    holderName: cheque.payeeName || "Account Signatory",
    cbsRegisteredDate: "2023-01-15T10:00:00.000Z",
    strokeVectors: [
      { x: 10, y: 45, pressure: 0.8 },
      { x: 25, y: 15, pressure: 0.95 },
      { x: 40, y: 70, pressure: 0.85 },
      { x: 55, y: 20, pressure: 0.9 },
      { x: 75, y: 65, pressure: 0.7 },
      { x: 95, y: 40, pressure: 0.8 },
      { x: 120, y: 50, pressure: 0.6 },
    ],
    pathData: "M 10 45 C 25 15, 30 10, 40 70 S 55 20, 75 65 S 100 35, 120 50 S 140 25, 160 55",
  };

  // Presented signature path with realistic slight variance
  const varianceFactor = cheque.riskScore > 50 ? 14 : 3;
  const presentedSignature = {
    matchScorePercent: Number((cheque.signatureMatchScore || (98.5 - varianceFactor)).toFixed(1)),
    penPressureDeviationPercent: Number((varianceFactor * 1.5).toFixed(1)),
    strokeVelocityMms: 182.4,
    deviationZones:
      cheque.riskScore > 50
        ? [
            { x: 45, y: 35, radius: 12, label: "Terminal Loop Curvature Deviation" },
            { x: 80, y: 58, radius: 15, label: "Hesitation Pause / Pen-Lift Artifact" },
          ]
        : [],
    pathData: `M 10 45 C 25 ${15 + varianceFactor}, 30 10, 40 ${70 - varianceFactor} S 55 20, 75 ${65 + varianceFactor} S 100 35, 120 50 S 140 25, 160 ${55 + varianceFactor}`,
  };

  return {
    chequeId: cheque.id,
    chequeNumber: cheque.chequeNumber,
    timestamp: new Date().toISOString(),
    overallAuthenticityIndex: Number((100 - score).toFixed(1)),
    tamperVerdict: anomalyZones.length > 0 ? "SUSPECT_MANIPULATION_DETECTED" : "AUTHENTIC_INSTRUMENT",
    anomalies: anomalyZones,
    securityFibers: authenticSecurityFibers,
    biometrics: {
      specimenSignature,
      presentedSignature,
    },
  };
}

module.exports = {
  generateForensicAnalysis,
  analyzeChequeForensics: generateForensicAnalysis,
};
