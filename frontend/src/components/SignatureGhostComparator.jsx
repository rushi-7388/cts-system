import React, { useState } from "react";

export default function SignatureGhostComparator({ signatureData, cheque }) {
  const [ghostOpacity, setGhostOpacity] = useState(65);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [showVectors, setShowVectors] = useState(true);

  const matchScore = signatureData?.metrics?.matchScore ?? cheque?.signatureMatchScore ?? 94.8;
  const isMatch = matchScore >= 80;

  // CBS Specimen Signature Vector Path
  const specimenPath =
    "M 15 50 C 35 10, 45 5, 55 75 S 75 15, 105 70 S 140 30, 170 55 S 200 20, 230 65";

  // Presented Signature Vector Path (includes realistic variance)
  const varianceDelta = isMatch ? 4 : 16;
  const presentedPath = `M 15 50 C 35 ${10 + varianceDelta}, 45 5, 55 ${
    75 - varianceDelta
  } S 75 15, 105 ${70 + varianceDelta} S 140 30, 170 55 S 200 20, 230 ${65 + varianceDelta}`;

  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Biometric Dynamic Time Warping (DTW) Signature Comparator
          </div>
          <h3 className="text-sm font-bold text-white">
            CBS Specimen Signature vs Presented Instrument Overlay
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Match Confidence</div>
            <div
              className={`text-lg font-mono font-extrabold ${
                isMatch ? "text-emerald-400" : "text-rose-400 animate-pulse"
              }`}
            >
              {matchScore.toFixed(1)}% {isMatch ? "VERIFIED" : "MISMATCH"}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Ghost Projection Canvas Stage */}
      <div className="relative bg-slate-950 rounded-xl border border-slate-800 p-6 flex flex-col items-center justify-center overflow-hidden min-h-[220px]">
        {/* Subtle grid guidelines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        {/* SVG Drawing Layer */}
        <svg
          viewBox="0 0 260 90"
          className="w-full max-w-md h-36 filter drop-shadow-lg overflow-visible"
        >
          {/* Base Layer: Presented Signature (White/Slate stroke) */}
          <path
            d={presentedPath}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Ghost Layer: CBS Registered Specimen Signature (Fluorescent Cyan) */}
          <path
            d={specimenPath}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              opacity: ghostOpacity / 100,
              transform: `translate(${offsetX}px, ${offsetY}px)`,
              transition: "transform 0.1s ease",
              filter: "drop-shadow(0 0 8px rgba(6, 182, 212, 0.8))",
            }}
          />

          {/* Vector Variance Markers (Highlighted in Red if mismatched) */}
          {showVectors && !isMatch && (
            <>
              <circle cx="55" cy="65" r="7" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2,2" />
              <text x="65" y="65" fill="#ef4444" fontSize="7" fontFamily="monospace">
                Δ Curvature
              </text>

              <circle cx="170" cy="55" r="8" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2,2" />
              <text x="180" y="55" fill="#ef4444" fontSize="7" fontFamily="monospace">
                Δ Pen Pressure
              </text>
            </>
          )}
        </svg>

        {/* Dynamic Legend */}
        <div className="flex flex-wrap items-center justify-between w-full max-w-md mt-4 text-[11px] font-mono border-t border-slate-800 pt-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-slate-200 rounded-full" />
            <span className="text-slate-400">Presented Signature</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <span className="text-cyan-300">CBS Registered Ghost Specimen</span>
          </div>
        </div>
      </div>

      {/* Control Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
        <div>
          <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
            <span>Specimen Ghost Opacity:</span>
            <span className="font-mono text-cyan-400">{ghostOpacity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={ghostOpacity}
            onChange={(e) => setGhostOpacity(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
            <span>Ghost Micro-Alignment X:</span>
            <span className="font-mono text-slate-300">{offsetX}px</span>
          </div>
          <input
            type="range"
            min="-20"
            max="20"
            value={offsetX}
            onChange={(e) => setOffsetX(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
            <span>Ghost Micro-Alignment Y:</span>
            <span className="font-mono text-slate-300">{offsetY}px</span>
          </div>
          <input
            type="range"
            min="-20"
            max="20"
            value={offsetY}
            onChange={(e) => setOffsetY(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
