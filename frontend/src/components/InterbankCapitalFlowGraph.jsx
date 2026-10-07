import React, { useState, useEffect } from "react";
import client from "../api/client";

export default function InterbankCapitalFlowGraph() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [solving, setSolving] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeTab, setActiveTab] = useState("topology"); // "topology" | "bilateral" | "daemon"
  const [daemonState, setDaemonState] = useState({ enabled: false, autoSolve: false, intervalMs: 15000 });
  const [daemonTicking, setDaemonTicking] = useState(false);

  const fetchTopology = async () => {
    try {
      setLoading(true);
      const res = await client.get("/liquidity/lsm/gridlock-topology");
      setData(res.data);
      if (res.data.daemonConfig) {
        setDaemonState(res.data.daemonConfig);
      }
    } catch (err) {
      console.error("Failed to load LSM topology:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopology();
  }, []);

  const handleSolveGridlock = async (includeBilateral = true) => {
    try {
      setSolving(true);
      const res = await client.post("/liquidity/lsm/resolve-gridlock", { includeBilateral });
      if (res.data.receipt) {
        setLastReceipt(res.data.receipt);
      }
      setData(res.data.topology);
    } catch (err) {
      console.error("LSM Gridlock resolution failed:", err);
      alert(err.response?.data?.message || "Failed to execute Tarjan Netting algorithm");
    } finally {
      setSolving(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      setLastReceipt(null);
      const res = await client.post("/liquidity/lsm/reset");
      setData(res.data);
    } catch (err) {
      console.error("Reset topology failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDaemon = async (enabled, autoSolve) => {
    try {
      setDaemonTicking(true);
      const res = await client.post("/liquidity/lsm/daemon/toggle", {
        enabled,
        autoSolve,
        intervalMs: 15000,
      });
      setDaemonState(res.data.status);
      await fetchTopology();
    } catch (err) {
      console.error("Failed to toggle LSM daemon:", err);
    } finally {
      setDaemonTicking(false);
    }
  };

  // Fixed visual coordinate map for the 5 participating clearing banks
  const nodePositions = {
    "bank-srt": { x: 160, y: 140, label: "SRT", color: "#f59e0b" },
    "bank-sbi": { x: 400, y: 80, label: "SBI", color: "#3b82f6" },
    "bank-hdfc": { x: 620, y: 150, label: "HDFC", color: "#6366f1" },
    "bank-icici": { x: 520, y: 350, label: "ICICI", color: "#ec4899" },
    "bank-pnb": { x: 260, y: 340, label: "PNB", color: "#10b981" },
  };

  const isGridlocked = data?.metrics?.isGridlocked;
  const detectedCycles = data?.detectedCycles || [];
  const bilateralOffsets = data?.bilateralOffsets || [];

  return (
    <div className="bg-slate-950 rounded-2xl border border-slate-800 text-white p-6 shadow-2xl space-y-6">
      {/* Top Banner & Control Deck */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800/60 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Phase 1 · Tarjan Directed Cycle Elimination + Bilateral Greedy Netting
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Interbank Liquidity Gridlock Resolution Engine (LSM)
          </h2>
          <p className="text-xs text-slate-400">
            Real-time directed debt cycles identified across intraday payment queues (CHIPS & TARGET2 standard).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={loading || solving}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            ↺ Reset Graph
          </button>

          <button
            type="button"
            onClick={() => handleSolveGridlock(true)}
            disabled={loading || solving || !isGridlocked}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer ${
              isGridlocked
                ? "bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white shadow-emerald-950/60 animate-pulse"
                : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
            }`}
          >
            {solving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Running Tarjan Cycle Netting...</span>
              </>
            ) : isGridlocked ? (
              <>
                <span>⚡ Resolve Interbank Gridlock (LSM)</span>
              </>
            ) : (
              <>
                <span>✓ All Cycles Clear (₹0 Gridlock)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("topology")}
          className={`px-3 py-2 font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "topology"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Directed Graph Topology ({detectedCycles.length} Cycles)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("bilateral")}
          className={`px-3 py-2 font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "bilateral"
              ? "border-teal-500 text-teal-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Bilateral Opposing Offsets ({bilateralOffsets.length} Pairs)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("daemon")}
          className={`px-3 py-2 font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "daemon"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Continuous Daemon Loop {daemonState.enabled && <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono ml-1">LIVE</span>}
        </button>
      </div>

      {/* Gridlock Telemetry Badges */}
      {data?.metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Gross Debt Queued</span>
            <span className="text-base font-mono font-bold text-white">
              ₹{(data.metrics.totalGrossDebt / 100000).toFixed(1)} Lakhs
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Gridlock Trapped Volume</span>
            <span
              className={`text-base font-mono font-bold ${
                isGridlocked ? "text-rose-400 animate-pulse" : "text-emerald-400"
              }`}
            >
              ₹{(data.metrics.gridlockGrossVolume / 100000).toFixed(1)} Lakhs
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Central Bank Cash Needed</span>
            <span className="text-base font-mono font-bold text-emerald-400">
              ₹0.00 (Pure Offset)
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Capital Efficiency Gain</span>
            <span className="text-base font-mono font-bold text-cyan-400">
              {data.metrics.liquidityEfficiencyGain}% Savings
            </span>
          </div>
        </div>
      )}

      {/* TAB 1: GRAPH TOPOLOGY CANVAS */}
      {activeTab === "topology" && (
        <div className="relative bg-slate-950/80 rounded-2xl border border-slate-800 p-4 overflow-hidden min-h-[440px] flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

          {isGridlocked && (
            <div className="absolute top-4 left-4 bg-rose-950/80 border border-rose-800 text-rose-300 text-[11px] px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-2 shadow-lg z-10">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>
                <strong>Circular Debt Cycle:</strong> [SRT ➔ SBI ➔ HDFC ➔ SRT] holding ₹1.50 Cr queued.
              </span>
            </div>
          )}

          <svg viewBox="0 0 780 430" className="w-full h-full max-h-[440px] select-none">
            <defs>
              <marker id="arrow-default" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
              </marker>
              <marker id="arrow-gridlock" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
              </marker>
              <marker id="arrow-cleared" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
              </marker>
              <filter id="glow-gridlock" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Render Edges */}
            {data?.edges?.map((edge) => {
              const p1 = nodePositions[edge.source];
              const p2 = nodePositions[edge.target];
              if (!p1 || !p2) return null;

              const isDeadlock = edge.isInGridlock && isGridlocked;
              const isSettled = edge.amount === 0;

              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;
              const mx = (p1.x + p2.x) / 2 - dy * 0.15;
              const my = (p1.y + p2.y) / 2 + dx * 0.15;
              const pathD = `M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}`;

              return (
                <g key={edge.id}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isDeadlock ? "#f43f5e" : isSettled ? "#10b981" : "#475569"}
                    strokeWidth={isDeadlock ? 3.5 : 2}
                    strokeDasharray={isDeadlock ? "8,4" : "none"}
                    filter={isDeadlock ? "url(#glow-gridlock)" : "none"}
                    markerEnd={isDeadlock ? "url(#arrow-gridlock)" : isSettled ? "url(#arrow-cleared)" : "url(#arrow-default)"}
                    className={isDeadlock ? "animate-pulse" : ""}
                  />

                  {!isSettled && (
                    <circle r={isDeadlock ? 3.5 : 2.5} fill={isDeadlock ? "#fb7185" : "#38bdf8"}>
                      <animateMotion dur={isDeadlock ? "1.4s" : "2.6s"} repeatCount="indefinite" path={pathD} />
                    </circle>
                  )}

                  <g transform={`translate(${mx}, ${my})`}>
                    <rect
                      x="-32"
                      y="-10"
                      width="64"
                      height="20"
                      rx="6"
                      fill={isDeadlock ? "#881337" : "#0f172a"}
                      stroke={isDeadlock ? "#f43f5e" : "#334155"}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fill={isDeadlock ? "#ffe4e6" : "#cbd5e1"}
                      fontSize="9.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      ₹{(edge.amount / 100000).toFixed(0)}L
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Render Nodes */}
            {data?.nodes?.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;

              const baseRadius = 32 + (node.collateral / 50000000) * 12;
              const isSelected = selectedNode?.id === node.id;
              const isRestricted = node.status === "GRIDLOCK_RESTRICTED" && isGridlocked;

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onClick={() => setSelectedNode(node)}
                >
                  {isRestricted && (
                    <circle
                      r={baseRadius + 8}
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="1.5"
                      opacity="0.6"
                      className="animate-ping origin-center"
                    />
                  )}

                  <circle
                    r={baseRadius}
                    fill="#0f172a"
                    stroke={isRestricted ? "#f43f5e" : isSelected ? "#38bdf8" : pos.color}
                    strokeWidth={isSelected ? 4 : 2.5}
                    className="transition-all duration-200 group-hover:scale-105"
                  />

                  <text
                    x="0"
                    y="-4"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="13"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                  >
                    {node.code}
                  </text>

                  <text
                    x="0"
                    y="12"
                    textAnchor="middle"
                    fill={isRestricted ? "#fca5a5" : "#94a3b8"}
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    ₹{(node.availableHeadroom / 100000).toFixed(1)}L
                  </text>

                  <text
                    x="0"
                    y={baseRadius + 15}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9.5"
                    fontWeight="500"
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Selected Bank Details Float */}
          {selectedNode && (
            <div className="absolute bottom-3 right-3 bg-slate-900/95 border border-slate-700 p-4 rounded-xl shadow-2xl backdrop-blur-md max-w-xs text-xs space-y-2 z-20">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white text-sm">{selectedNode.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-white font-mono cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pledged Collateral:</span>
                  <span className="font-bold">₹{Number(selectedNode.collateral).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Intraday Credit Line:</span>
                  <span>₹{Number(selectedNode.creditLine).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Available Headroom:</span>
                  <span className={selectedNode.availableHeadroom < 2000000 ? "text-amber-400 font-bold" : "text-emerald-400"}>
                    ₹{Number(selectedNode.availableHeadroom).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Queue Disposition:</span>
                  <span className="text-cyan-400 font-semibold">{selectedNode.status}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BILATERAL OPPOSING OFFSETS */}
      {activeTab === "bilateral" && (
        <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Bilateral Opposing Payment Pairs (A ↔ B)</h3>
            <span className="text-xs text-slate-400">Greedy maximum flow partial netting</span>
          </div>
          {bilateralOffsets.length === 0 ? (
            <p className="text-xs text-slate-400">No bilateral opposing debt flows currently identified.</p>
          ) : (
            <div className="space-y-2">
              {bilateralOffsets.map((bOff, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono">
                  <div>
                    <span className="text-teal-400 font-bold">{bOff.pairKey}</span>
                    <span className="text-slate-500 ml-2">Gross Volume: ₹{(bOff.grossVolume / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="text-emerald-400 font-bold">
                    Zero-Cash Netting Capacity: ₹{(bOff.offsetCapacity / 100000).toFixed(1)}L
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONTINUOUS DAEMON LOOP */}
      {activeTab === "daemon" && (
        <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Autonomous Background Gridlock Loop</h3>
              <p className="text-slate-400">Continuously monitors intraday queues and auto-cancels detected cycles every 15s.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleDaemon(!daemonState.enabled, daemonState.autoSolve)}
                disabled={daemonTicking}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                  daemonState.enabled
                    ? "bg-rose-900/60 text-rose-300 border border-rose-700"
                    : "bg-emerald-700 text-white hover:bg-emerald-600"
                }`}
              >
                {daemonState.enabled ? "Stop Daemon" : "Start Daemon"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">DAEMON STATUS</span>
              <span className={`font-bold ${daemonState.enabled ? "text-emerald-400" : "text-slate-400"}`}>
                {daemonState.enabled ? "ACTIVE (Ticking)" : "OFFLINE"}
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">POLLING FREQUENCY</span>
              <span className="text-white font-bold">{daemonState.intervalMs / 1000}s Interval</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">TOTAL CYCLES RESOLVED</span>
              <span className="text-cyan-400 font-bold">{daemonState.cyclesResolvedTotal || 0}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">CAPITAL CONSERVED</span>
              <span className="text-emerald-400 font-bold">₹{((daemonState.capitalConservedTotal || 0) / 100000).toFixed(1)}L</span>
            </div>
          </div>
        </div>
      )}

      {/* Multilateral Netting Settlement Certificate Receipt */}
      {lastReceipt && (
        <div className="bg-emerald-950/60 border border-emerald-700/80 p-5 rounded-2xl space-y-3 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900 text-emerald-200 border border-emerald-600">
                LSM CLEARING EXECUTION SUCCESS
              </span>
              <span className="text-xs font-mono text-emerald-300 font-bold">
                Batch ID: {lastReceipt.resolutionId}
              </span>
            </div>
            <div className="text-[11px] text-emerald-400 font-mono">
              Solver Latency: {lastReceipt.executionMicroseconds} µs
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-emerald-900/40 p-3 rounded-xl border border-emerald-800/50">
              <span className="text-[10px] text-emerald-300 uppercase block">Gross Debt Discharged</span>
              <span className="text-lg font-mono font-black text-white">
                ₹{Number(lastReceipt.grossDebtCleared).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="bg-emerald-900/40 p-3 rounded-xl border border-emerald-800/50">
              <span className="text-[10px] text-emerald-300 uppercase block">Central Bank Liquidity Used</span>
              <span className="text-lg font-mono font-black text-emerald-300">
                ₹0.00 (Zero Reserve Consumed)
              </span>
            </div>

            <div className="bg-emerald-900/40 p-3 rounded-xl border border-emerald-800/50">
              <span className="text-[10px] text-emerald-300 uppercase block">Settlement Efficiency</span>
              <span className="text-lg font-mono font-black text-cyan-300">
                {lastReceipt.liquiditySavingsRatio} (Pure Offset)
              </span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-emerald-400/80 truncate">
            SHA-256 Netting Audit Certificate: {lastReceipt.sha256CertificateHash}
          </div>
        </div>
      )}
    </div>
  );
}
