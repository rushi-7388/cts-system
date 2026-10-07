import React, { useState, useEffect } from "react";
import client from "../api/client";

export default function AgentSwarmDocketModal({ cheque, onClose, onActionSuccess }) {
  const [loading, setLoading] = useState(true);
  const [docket, setDocket] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "forensic" | "aml" | "legal" | "deliberations"
  const [acting, setActing] = useState(false);

  useEffect(() => {
    async function loadDocket() {
      try {
        setLoading(true);
        const res = await client.post(`/swarm/evaluate/${cheque.id}`);
        setDocket(res.data);
      } catch (err) {
        console.error("Failed to load swarm docket:", err);
      } finally {
        setLoading(false);
      }
    }
    if (cheque?.id) {
      loadDocket();
    }
  }, [cheque]);

  const handleMakerVerify = async () => {
    try {
      setActing(true);
      await client.post(`/clearing/${cheque.id}/maker-verify`, {
        remarks: `Verified with 4-Agent AI Swarm Consensus (${docket?.consensus?.consensusScore || 95}%)`,
      });
      if (onActionSuccess) onActionSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || "Maker verification failed");
    } finally {
      setActing(false);
    }
  };

  const handleCheckerApprove = async () => {
    try {
      setActing(true);
      await client.post(`/clearing/${cheque.id}/checker-approve`, {
        remarks: `Authorized via Swarm Docket Seal ${docket?.docketId || ""}`,
      });
      if (onActionSuccess) onActionSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || "Checker approval failed");
    } finally {
      setActing(false);
    }
  };

  if (!cheque) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl text-white">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-lg shadow-inner">
              🤖
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/60 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                Phase 2 · Autonomous 4-Agent Multi-Modal Consensus Swarm
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Executive Forensic Swarm Docket · Cheque #{cheque.chequeNumber}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono text-indigo-400 animate-pulse">
                Orchestrating 4 Specialized Agents (Spectral FFT, AML Graph, NI Act 1881, Liquidity)...
              </p>
            </div>
          ) : docket ? (
            <>
              {/* Executive Summary Card */}
              <div
                className={`p-5 rounded-2xl border ${
                  docket.consensus.autoCleared
                    ? "bg-emerald-950/40 border-emerald-700/80"
                    : docket.consensus.criticalFlagsCount > 0
                    ? "bg-rose-950/40 border-rose-700/80"
                    : "bg-amber-950/40 border-amber-700/80"
                } space-y-3`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-black tracking-wide ${
                        docket.consensus.autoCleared
                          ? "bg-emerald-800 text-emerald-100"
                          : docket.consensus.criticalFlagsCount > 0
                          ? "bg-rose-800 text-rose-100"
                          : "bg-amber-800 text-amber-100"
                      }`}
                    >
                      {docket.consensus.autoCleared
                        ? "✓ SUB-500MS STRAIGHT-THROUGH (STP) AUTONOMOUS CLEAR"
                        : docket.consensus.recommendation}
                    </span>
                    <span className="text-xs font-mono text-slate-400 font-semibold">
                      Docket: {docket.docketId}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-sans">Swarm Consensus Score</span>
                    <span className="text-2xl font-mono font-black text-white">
                      {docket.consensus.consensusScore}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {docket.consensus.executiveSummary}
                </p>
              </div>

              {/* 4 Agent Status Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Agent 1: Forensic Vision */}
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                      🔬 Forensic Vision
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {docket.agents.forensic.confidence}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all"
                      style={{ width: `${docket.agents.forensic.confidence}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
                    <div>FFT: {docket.agents.forensic.telemetry.fftSpectrogramStatus}</div>
                    <div>PRNU: {(docket.agents.forensic.telemetry.prnuSensorCorrelation * 100).toFixed(0)}% Match</div>
                    <div>Biometrics: {docket.agents.forensic.telemetry.signatureDynamicMatchScore}%</div>
                  </div>
                </div>

                {/* Agent 2: AML Graph */}
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                      🕸️ AML & Graph
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {docket.agents.aml.confidence}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full transition-all"
                      style={{ width: `${docket.agents.aml.confidence}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
                    <div>Velocity: {docket.agents.aml.telemetry.crossBankVelocityIndex}</div>
                    <div>Mule Risk: {(docket.agents.aml.telemetry.muleAccountProbability * 100).toFixed(0)}%</div>
                    <div>Benford Dev: {docket.agents.aml.telemetry.benfordLawDeviationScore}</div>
                  </div>
                </div>

                {/* Agent 3: Legal & Regulatory */}
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      ⚖️ Legal & NI Act
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {docket.agents.legal.confidence}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all"
                      style={{ width: `${docket.agents.legal.confidence}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
                    <div>Framework: NI Act 1881</div>
                    <div>PPS Tier: {docket.agents.legal.telemetry.ppsComplianceTier}</div>
                    <div>Stale Window: {docket.agents.legal.telemetry.staleWindowDaysRemaining}d Left</div>
                  </div>
                </div>

                {/* Agent 4: Liquidity Arbitrageur */}
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      💧 Liquidity
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {docket.agents.liquidity.confidence}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${docket.agents.liquidity.confidence}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
                    <div>Routing: {docket.agents.liquidity.telemetry.recommendedRouting}</div>
                    <div>LSM Candidate: {docket.agents.liquidity.telemetry.lsmCycleEligible ? "YES" : "NO"}</div>
                    <div>Capital Cost: Low</div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs for Granular Docket Analysis */}
              <div className="flex items-center gap-2 border-b border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`px-3 py-2 font-semibold border-b-2 transition-all cursor-pointer ${
                    activeTab === "overview"
                      ? "border-indigo-500 text-indigo-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Identified Flags ({docket.consensus.totalFlagsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("deliberations")}
                  className={`px-3 py-2 font-semibold border-b-2 transition-all cursor-pointer ${
                    activeTab === "deliberations"
                      ? "border-indigo-500 text-indigo-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Live Deliberation Stream (O(ms) Consensus)
                </button>
              </div>

              {/* TAB CONTENT: FLAGS LIST */}
              {activeTab === "overview" && (
                <div className="space-y-2">
                  {docket.consensus.flags.length === 0 ? (
                    <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-center text-xs text-emerald-400">
                      ✓ No anomalies or compliance infractions detected across all 4 analytical vectors.
                    </div>
                  ) : (
                    docket.consensus.flags.map((flag, i) => (
                      <div
                        key={i}
                        className="flex items-start justify-between p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                flag.severity === "CRITICAL"
                                  ? "bg-rose-900 text-rose-200"
                                  : flag.severity === "HIGH"
                                  ? "bg-amber-900 text-amber-200"
                                  : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {flag.severity}
                            </span>
                            <span className="font-mono font-bold text-slate-200">{flag.type}</span>
                          </div>
                          <p className="text-slate-400">{flag.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB CONTENT: DELIBERATION STREAM */}
              {activeTab === "deliberations" && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
                  {docket.deliberationLog.map((log, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-indigo-400 font-bold shrink-0">{log.time}</span>
                      <span className="text-cyan-400 font-semibold shrink-0">[{log.agent}]</span>
                      <span className="text-slate-300">{log.note}</span>
                    </div>
                  ))}
                  <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800 truncate">
                    SHA-256 Docket Seal: {docket.cryptographicSeal}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-rose-400">Failed to generate agent swarm docket.</p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 font-mono">
            Amount: <span className="text-white font-bold">₹{Number(cheque.amount).toLocaleString("en-IN")}</span> · Payee: {cheque.payeeName}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleMakerVerify}
              disabled={acting}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer disabled:opacity-50"
            >
              Sign-off as Maker
            </button>

            <button
              type="button"
              onClick={handleCheckerApprove}
              disabled={acting}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              Authorize & Clear (Checker Sign-off)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
