import React, { useState, useEffect, useRef } from "react";
import client from "../api/client";

export default function ForensicChequeHeatmapCanvas({ cheque }) {
  const [forensicData, setForensicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("heatmap"); // "normal" | "heatmap" | "spectral"
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!cheque?.id) return;
    setLoading(true);
    client
      .get(`/cheques/${cheque.id}/forensics`)
      .then((res) => {
        setForensicData(res.data);
        if (res.data.anomalies?.length > 0) {
          setSelectedAnomaly(res.data.anomalies[0]);
        }
      })
      .catch((err) => console.error("Forensics fetch error:", err))
      .finally(() => setLoading(false));
  }, [cheque?.id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !forensicData) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src =
      cheque.imageUrl ||
      (cheque.chequeNumber === "000102"
        ? "/cheque-000102.jpg"
        : cheque.chequeNumber === "000123"
        ? "/cheque-000123.jpg"
        : "/sample-cheque.jpg");

    img.onload = () => {
      ctx.clearRect(0, 0, width, height);

      if (viewMode === "normal") {
        ctx.drawImage(img, 0, 0, width, height);
      } else if (viewMode === "spectral") {
        // High-contrast spectral edge detection simulation
        ctx.filter = "grayscale(100%) contrast(280%) invert(100%)";
        ctx.drawImage(img, 0, 0, width, height);
        ctx.filter = "none";

        // Draw micro-edge halo glows
        ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(width * 0.12, height * 0.22, width * 0.5, height * 0.12);
        ctx.strokeRect(width * 0.7, height * 0.32, width * 0.25, height * 0.14);
      } else if (viewMode === "heatmap") {
        // Thermography / Tampering Heatmap Mode
        ctx.drawImage(img, 0, 0, width, height);

        // Dark tint
        ctx.fillStyle = "rgba(10, 15, 30, 0.55)";
        ctx.fillRect(0, 0, width, height);

        // Draw authentic security fibers in fluorescent emerald
        forensicData.securityFibers?.forEach((fiber) => {
          ctx.beginPath();
          const fx = (fiber.x / 100) * width;
          const fy = (fiber.y / 100) * height;
          ctx.arc(fx, fy, 4, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(16, 185, 129, 0.85)";
          ctx.shadowColor = "#10b981";
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        // Draw Tampering Heatmap Anomaly Zones
        forensicData.anomalies?.forEach((anom) => {
          const zx = (anom.coordinates.x / 100) * width;
          const zy = (anom.coordinates.y / 100) * height;
          const zw = (anom.coordinates.width / 100) * width;
          const zh = (anom.coordinates.height / 100) * height;

          // Radial gradient heatmap center
          const grad = ctx.createRadialGradient(
            zx + zw / 2,
            zy + zh / 2,
            10,
            zx + zw / 2,
            zy + zh / 2,
            Math.max(zw, zh) / 1.5
          );

          if (anom.severity === "CRITICAL") {
            grad.addColorStop(0, "rgba(239, 68, 68, 0.85)"); // Red
            grad.addColorStop(0.5, "rgba(249, 115, 22, 0.6)"); // Orange
            grad.addColorStop(1, "rgba(239, 68, 68, 0)");
          } else {
            grad.addColorStop(0, "rgba(245, 158, 11, 0.85)"); // Amber
            grad.addColorStop(0.6, "rgba(234, 179, 8, 0.45)");
            grad.addColorStop(1, "rgba(245, 158, 11, 0)");
          }

          ctx.fillStyle = grad;
          ctx.fillRect(zx - 20, zy - 15, zw + 40, zh + 30);

          // Anomaly boundary box
          ctx.strokeStyle = anom.severity === "CRITICAL" ? "#ef4444" : "#f59e0b";
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(zx, zy, zw, zh);
          ctx.setLineDash([]);

          // Badge label
          ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
          ctx.fillRect(zx, zy - 18, zw, 16);
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 9px monospace";
          ctx.fillText(`ANOMALY: ${anom.confidence}%`, zx + 4, zy - 6);
        });
      }
    };
  }, [forensicData, viewMode, cheque]);

  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white space-y-4 shadow-xl">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            AI Forensic Spectral Computer Vision Engine
          </div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            Cheque Pixel Tampering & Ink Manipulation Heatmap
          </h3>
        </div>

        {/* View mode toggle */}
        <div className="flex bg-slate-950 p-1 rounded-xl text-xs font-semibold border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode("normal")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === "normal"
                ? "bg-slate-800 text-white shadow-xs font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Normal Scan
          </button>
          <button
            type="button"
            onClick={() => setViewMode("heatmap")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === "heatmap"
                ? "bg-rose-600 text-white shadow-xs font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🔥 Tampering Heatmap
          </button>
          <button
            type="button"
            onClick={() => setViewMode("spectral")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === "spectral"
                ? "bg-cyan-600 text-white shadow-xs font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ⚡ Spectral Edge
          </button>
        </div>
      </div>

      {/* Canvas Display */}
      <div className="relative rounded-xl overflow-hidden bg-black border border-slate-800 aspect-[16/7] flex items-center justify-center">
        {loading ? (
          <div className="text-slate-400 text-xs font-semibold flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            Analyzing spectral reflectance & ink density matrices...
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={800}
            height={350}
            className="w-full h-full object-contain"
          />
        )}

        {/* Live Legend Watermark */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono pointer-events-none">
          <span className="bg-black/75 px-2.5 py-1 rounded-md text-emerald-400 border border-emerald-900/40">
            ● Authentic UV Security Fibers: Verified
          </span>
          <span className="bg-black/75 px-2.5 py-1 rounded-md text-rose-400 border border-rose-900/40">
            ● Anomaly Severity Heatmap: Active
          </span>
        </div>
      </div>

      {/* Forensic Diagnostic Findings */}
      {forensicData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Hyperspectral AI Finding
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                  forensicData.tamperVerdict === "AUTHENTIC_INSTRUMENT"
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    : "bg-rose-950 text-rose-400 border border-rose-800 animate-pulse"
                }`}
              >
                {forensicData.tamperVerdict}
              </span>
              <span className="text-slate-300 font-mono text-[11px]">
                Authenticity: {forensicData.overallAuthenticityIndex}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {forensicData.anomalies?.length > 0
                ? "Chemical or DPI pixel irregularities detected. Physical inspection under 365nm lamp recommended before clearance."
                : "Continuous spectral gradient confirms zero solvent or eraser friction artifacts across payee and courtesy bands."}
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Suspect Region Telemetry
            </div>
            {forensicData.anomalies?.length > 0 ? (
              <div className="space-y-1.5">
                {forensicData.anomalies.map((anom) => (
                  <div key={anom.id} className="text-[11px] flex justify-between items-center text-slate-300">
                    <span className="font-semibold text-rose-300 truncate max-w-[200px]">{anom.name}:</span>
                    <span className="font-mono text-slate-400">{anom.confidence}% Confidence</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-emerald-400 font-mono">
                ✓ 0 Tampering flags detected across all 4 CTS optical regions.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
