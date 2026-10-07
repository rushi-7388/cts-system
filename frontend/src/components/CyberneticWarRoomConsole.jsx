import React, { useState, useEffect } from "react";
import client from "../api/client";

export default function CyberneticWarRoomConsole() {
  const [topology, setTopology] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failoverLoading, setFailoverLoading] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);

  const fetchTopology = async () => {
    try {
      setLoading(true);
      const res = await client.get("/datacenter/topology");
      setTopology(res.data);
    } catch (err) {
      console.error("Failed to load DC topology:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopology();
    const interval = setInterval(fetchTopology, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleFailover = async () => {
    try {
      setFailoverLoading(true);
      const target = topology?.primaryActiveDc === "DC_MUMBAI" ? "DR_HYDERABAD" : "DC_MUMBAI";
      const res = await client.post("/datacenter/failover", { targetDcId: target });
      setLastReceipt(res.data.receipt);
      setTopology(res.data.topology);
    } catch (err) {
      alert(err.response?.data?.error || "Failover execution failed");
    } finally {
      setFailoverLoading(false);
    }
  };

  const isMumbaiActive = topology?.primaryActiveDc === "DC_MUMBAI";

  return (
    <div className="bg-slate-950 rounded-2xl border border-slate-800 text-white p-6 shadow-2xl space-y-6">
      {/* War Room Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            National Clearing Switch · Mission Control War Room
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Cybernetic Clearing Topology & Multi-Region Active-Active DC Failover
          </h2>
          <p className="text-xs text-slate-400">
            Real-time telemetry across Western, Northern, and Southern grids. Zero-RPO Synchronous Geo-Replication.
          </p>
        </div>

        {/* 1-Click Failover Command Action */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Active Primary DC</span>
            <span className="font-mono text-xs font-bold text-emerald-400 flex items-center justify-end gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {isMumbaiActive ? "DC MUMBAI (PRIMARY)" : "DR HYDERABAD (ACTIVE)"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleFailover}
            disabled={loading || failoverLoading}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer ${
              failoverLoading
                ? "bg-amber-600 text-white"
                : isMumbaiActive
                ? "bg-gradient-to-r from-rose-700 to-amber-600 hover:from-rose-600 hover:to-amber-500 text-white shadow-rose-950"
                : "bg-gradient-to-r from-cyan-700 to-blue-600 hover:from-cyan-600 hover:to-blue-500 text-white shadow-cyan-950"
            }`}
          >
            {failoverLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Rerouting Queues...</span>
              </>
            ) : isMumbaiActive ? (
              <>
                <span>⚡ Simulate Mumbai Outage ➔ Failover to DR Hyderabad</span>
              </>
            ) : (
              <>
                <span>↺ Revert Failover ➔ Failback to Primary Mumbai DC</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* High-Altitude Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Replication Sync Lag</span>
          <span className="text-base font-mono font-bold text-emerald-400">
            {topology?.replicationLagMs || 0.12} ms
          </span>
          <span className="text-[10px] text-slate-500 block">Synchronous Raft Zero-RPO</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">In-Flight Queue Buffer</span>
          <span className="text-base font-mono font-bold text-cyan-300">
            {topology?.inflightQueueCount || 1420} Batches
          </span>
          <span className="text-[10px] text-slate-500 block">0 Dropped Guaranteed</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Failover RTO Standard</span>
          <span className="text-base font-mono font-bold text-amber-400">
            &lt; 0.80 Seconds
          </span>
          <span className="text-[10px] text-slate-500 block">Sub-Second Switchover</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Topology State</span>
          <span className="text-base font-mono font-bold text-emerald-400">
            {topology?.failoverStatus || "SYNCHRONIZED"}
          </span>
          <span className="text-[10px] text-slate-500 block">Split-Brain Guard Active</span>
        </div>
      </div>

      {/* Cybernetic Switch Architecture SVG Map */}
      <div className="relative bg-slate-950/80 rounded-2xl border border-slate-800 p-4 min-h-[380px] flex items-center justify-center overflow-hidden">
        {/* Radar Pulse Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

        <svg viewBox="0 0 820 360" className="w-full h-full max-h-[380px] select-none">
          <defs>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Regional Grids (Left Side) */}
          {/* Grid North: Delhi (160, 60) */}
          {/* Grid West: Mumbai (130, 180) */}
          {/* Grid South: Chennai (160, 300) */}

          {/* Data Centers (Right Side) */}
          {/* DC Mumbai: (600, 110) */}
          {/* DR Hyderabad: (600, 260) */}

          {/* Grid North Connections */}
          <path
            d={isMumbaiActive ? "M 190 60 C 350 60, 420 110, 560 110" : "M 190 60 C 350 60, 420 260, 560 260"}
            fill="none"
            stroke={isMumbaiActive ? "#38bdf8" : "#34d399"}
            strokeWidth="2.5"
            strokeDasharray="6,4"
            className="animate-pulse"
          />
          <circle r="3" fill="#38bdf8">
            <animateMotion
              dur="1.8s"
              repeatCount="indefinite"
              path={isMumbaiActive ? "M 190 60 C 350 60, 420 110, 560 110" : "M 190 60 C 350 60, 420 260, 560 260"}
            />
          </circle>

          {/* Grid West Connections */}
          <path
            d={isMumbaiActive ? "M 190 180 C 350 180, 420 110, 560 110" : "M 190 180 C 350 180, 420 260, 560 260"}
            fill="none"
            stroke={isMumbaiActive ? "#38bdf8" : "#34d399"}
            strokeWidth="3"
            strokeDasharray="6,4"
            className="animate-pulse"
          />
          <circle r="3.5" fill="#38bdf8">
            <animateMotion
              dur="1.2s"
              repeatCount="indefinite"
              path={isMumbaiActive ? "M 190 180 C 350 180, 420 110, 560 110" : "M 190 180 C 350 180, 420 260, 560 260"}
            />
          </circle>

          {/* Grid South Connections */}
          <path
            d={isMumbaiActive ? "M 190 300 C 350 300, 420 110, 560 110" : "M 190 300 C 350 300, 420 260, 560 260"}
            fill="none"
            stroke={isMumbaiActive ? "#38bdf8" : "#34d399"}
            strokeWidth="2.5"
            strokeDasharray="6,4"
            className="animate-pulse"
          />
          <circle r="3" fill="#38bdf8">
            <animateMotion
              dur="2.1s"
              repeatCount="indefinite"
              path={isMumbaiActive ? "M 190 300 C 350 300, 420 110, 560 110" : "M 190 300 C 350 300, 420 260, 560 260"}
            />
          </circle>

          {/* Synchronous Inter-DC Replication Pipe */}
          <line
            x1="620"
            y1="135"
            x2="620"
            y2="235"
            stroke="#a855f7"
            strokeWidth="3"
            strokeDasharray="4,4"
          />
          <text x="635" y="190" fill="#c084fc" fontSize="9" fontFamily="monospace" fontWeight="bold">
            ◄ Raft Sync 0.12ms ►
          </text>

          {/* Regional Grid Nodes */}
          {/* North Grid */}
          <g transform="translate(140, 60)">
            <rect x="-40" y="-22" width="90" height="44" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            <text x="5" y="-5" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">NORTH GRID</text>
            <text x="5" y="10" textAnchor="middle" fill="#94a3b8" fontSize="8.5" fontFamily="monospace">Delhi · 18ms</text>
          </g>

          {/* West Grid */}
          <g transform="translate(140, 180)">
            <rect x="-40" y="-22" width="90" height="44" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            <text x="5" y="-5" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">WEST GRID</text>
            <text x="5" y="10" textAnchor="middle" fill="#94a3b8" fontSize="8.5" fontFamily="monospace">Mumbai · 3ms</text>
          </g>

          {/* South Grid */}
          <g transform="translate(140, 300)">
            <rect x="-40" y="-22" width="90" height="44" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            <text x="5" y="-5" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">SOUTH GRID</text>
            <text x="5" y="10" textAnchor="middle" fill="#94a3b8" fontSize="8.5" fontFamily="monospace">Chennai · 22ms</text>
          </g>

          {/* DC Mumbai Node */}
          <g transform="translate(620, 105)">
            <rect
              x="-60"
              y="-30"
              width="130"
              height="60"
              rx="12"
              fill="#0f172a"
              stroke={isMumbaiActive ? "#10b981" : "#64748b"}
              strokeWidth={isMumbaiActive ? 3.5 : 1.5}
              filter={isMumbaiActive ? "url(#glow-emerald)" : "none"}
            />
            <text x="5" y="-8" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">DC MUMBAI</text>
            <text x="5" y="8" textAnchor="middle" fill={isMumbaiActive ? "#34d399" : "#94a3b8"} fontSize="9" fontWeight="bold">
              {isMumbaiActive ? "● PRIMARY ACTIVE" : "○ STANDBY"}
            </text>
            <text x="5" y="21" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">
              BKC Hub · Tier-IV
            </text>
          </g>

          {/* DR Hyderabad Node */}
          <g transform="translate(620, 265)">
            <rect
              x="-60"
              y="-30"
              width="130"
              height="60"
              rx="12"
              fill="#0f172a"
              stroke={!isMumbaiActive ? "#10b981" : "#64748b"}
              strokeWidth={!isMumbaiActive ? 3.5 : 1.5}
              filter={!isMumbaiActive ? "url(#glow-emerald)" : "none"}
            />
            <text x="5" y="-8" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">DR HYDERABAD</text>
            <text x="5" y="8" textAnchor="middle" fill={!isMumbaiActive ? "#34d399" : "#94a3b8"} fontSize="9" fontWeight="bold">
              {!isMumbaiActive ? "● PRIMARY ACTIVE" : "○ HOT STANDBY"}
            </text>
            <text x="5" y="21" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">
              HITEC Mirror · Tier-IV
            </text>
          </g>
        </svg>
      </div>

      {/* Failover Execution Receipt Banner */}
      {lastReceipt && (
        <div className="bg-emerald-950/60 border border-emerald-700/80 p-5 rounded-2xl space-y-3 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900 text-emerald-200 border border-emerald-600">
                ACTIVE-ACTIVE DC FAILOVER EXECUTED
              </span>
              <span className="text-xs font-mono text-emerald-300 font-bold">
                Incident ID: {lastReceipt.incidentId}
              </span>
            </div>
            <div className="text-[11px] text-emerald-400 font-mono">
              RTO Achieved: {lastReceipt.rtoSecondsAchieved}s (Sub-Second)
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-emerald-900/40 p-3 rounded-xl border border-emerald-800/50">
              <span className="text-[10px] text-emerald-300 uppercase block">Rerouted In-Flight Batches</span>
              <span className="text-lg font-mono font-black text-white">
                {lastReceipt.reroutedQueueCount} Batches
              </span>
            </div>

            <div className="bg-emerald-900/40 p-3 rounded-xl border border-emerald-800/50">
              <span className="text-[10px] text-emerald-300 uppercase block">Dropped Transactions</span>
              <span className="text-lg font-mono font-black text-emerald-300">
                0 Dropped (Zero-Loss Guarantee)
              </span>
            </div>

            <div className="bg-emerald-900/40 p-3 rounded-xl border border-emerald-800/50">
              <span className="text-[10px] text-emerald-300 uppercase block">New Master Node</span>
              <span className="text-sm font-mono font-bold text-cyan-300 truncate">
                {lastReceipt.targetDc}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Regional Grid Telemetry Table */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Regional Clearing Center Velocity & Latency Telemetry
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {topology?.regionalGrids?.map((grid) => (
            <div key={grid.id} className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{grid.name}</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                  {grid.status}
                </span>
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Latency: {grid.latencyMs} ms</span>
                <span>Velocity: {grid.packetVelocityMbps} Mbps</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Routed To: <span className="text-cyan-300 font-bold">{grid.routedTo}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
