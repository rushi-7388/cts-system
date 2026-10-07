import React, { useEffect, useState } from "react";
import client from "../api/client";
import { useClearingEvents } from "../hooks/useClearingEvents";
import InterbankCapitalFlowGraph from "./InterbankCapitalFlowGraph";

export default function LiquidityConsole() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [allocatedCollateral, setAllocatedCollateral] = useState("");
  const [creditLine, setCreditLine] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  async function loadData() {
    try {
      setLoading(true);
      const res = await client.get("/liquidity/summary");
      setSummary(res.data);
      if (res.data.pools?.length > 0 && !selectedBankId) {
        setSelectedBankId(res.data.pools[0].bankId);
      }
    } catch (err) {
      console.error("Failed to load liquidity data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useClearingEvents(() => {
    loadData();
  });

  async function handleAdjustCollateral(e) {
    e.preventDefault();
    if (!selectedBankId) return;
    try {
      setSubmitting(true);
      await client.post(`/liquidity/collateral/${selectedBankId}`, {
        allocatedCollateral: allocatedCollateral ? Number(allocatedCollateral) : undefined,
        creditLine: creditLine ? Number(creditLine) : undefined,
        remarks: remarks || "Central Bank Intraday Collateral Line Adjustment",
      });
      setMessage("Collateral allocation successfully updated.");
      setShowAdjustModal(false);
      setAllocatedCollateral("");
      setCreditLine("");
      setRemarks("");
      setTimeout(() => setMessage(null), 5000);
      await loadData();
    } catch (err) {
      alert("Failed to update collateral: " + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !summary) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500 shadow-xs">
        <div className="inline-block animate-spin w-6 h-6 border-2 border-cyan-600 border-t-transparent rounded-full mb-3" />
        <p className="text-sm font-semibold">Loading Intraday Collateral & Liquidity Framework...</p>
      </div>
    );
  }

  const {
    totalSystemCollateral = 0,
    totalSystemExposure = 0,
    totalSystemReserved = 0,
    systemUtilizationPercent = 0,
    healthDistribution = { healthy: 0, warning: 0, breached: 0 },
    pools = [],
  } = summary || {};

  return (
    <div className="space-y-6">
      {/* Top Banner Message */}
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between animate-in fade-in">
          <span>✓ {message}</span>
          <button onClick={() => setMessage(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">×</button>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Central Collateral</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono tracking-tight">
            ₹{(totalSystemCollateral / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-xs text-slate-500 mt-1">Deposited RBI Gov-Sec & Cash Reserves</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Clearing Exposure</div>
          <div className="text-2xl font-extrabold text-cyan-600 mt-1 font-mono tracking-tight">
            ₹{totalSystemExposure.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-slate-500 mt-1">Gross Inward Debit Obligations</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">In-Flight Reserved Hold</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1 font-mono tracking-tight">
            ₹{totalSystemReserved.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-slate-500 mt-1">Queued 4-Eyes Checker Sign-offs</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">System Utilization</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                systemUtilizationPercent < 80
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : systemUtilizationPercent < 95
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {systemUtilizationPercent}%
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono tracking-tight">
            {healthDistribution.healthy} Healthy · {healthDistribution.warning} Warn
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                systemUtilizationPercent < 80
                  ? "bg-emerald-500"
                  : systemUtilizationPercent < 95
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{ width: `${Math.min(systemUtilizationPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* LSM (Liquidity Saving Mechanism) Tarjan Cycle Gridlock Resolution Engine */}
      <InterbankCapitalFlowGraph />

      {/* Main Console Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Participating Bank Intraday Collateral Lines</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-100 text-cyan-800">
                RBI LMS 2024-25
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live monitoring of interbank collateral limits, credit lines, and headroom against debit clearings.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAdjustModal(true)}
            className="bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>+ Adjust Central Collateral</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Bank Entity</th>
                <th className="py-3 px-4">Allocated Collateral</th>
                <th className="py-3 px-4">Intraday Credit Line</th>
                <th className="py-3 px-4">Current Exposure</th>
                <th className="py-3 px-4">Available Headroom</th>
                <th className="py-3 px-4">Utilization</th>
                <th className="py-3 px-4">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pools.map((p) => {
                const m = p.metrics || {};
                const isHealthy = m.status === "HEALTHY";
                const isWarning = m.status === "WARNING";
                const isBreach = m.status === "BREACHED";

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{p.bank.name}</div>
                      <div className="font-mono text-[10px] text-slate-400">
                        {p.bank.code} · {p.bank.ifsc}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      ₹{m.collateral.toLocaleString("en-IN")}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      ₹{m.creditLine.toLocaleString("en-IN")}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-700">
                      ₹{m.exposure.toLocaleString("en-IN")}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-700">
                      ₹{m.availableHeadroom.toLocaleString("en-IN")}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[11px] text-slate-700 w-10">
                          {m.utilizationPercent}%
                        </span>
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              isHealthy ? "bg-emerald-500" : isWarning ? "bg-amber-500" : "bg-rose-500"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(3, m.utilizationPercent))}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isHealthy
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isWarning
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200 animate-pulse"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isHealthy ? "bg-emerald-500" : isWarning ? "bg-amber-500" : "bg-rose-500"
                          }`}
                        />
                        {m.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Collateral Modal */}
      {showAdjustModal && (
        <div
          onClick={() => setShowAdjustModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Adjust Central Bank Collateral Allocation</h3>
              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAdjustCollateral} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Participating Bank</label>
                <select
                  value={selectedBankId}
                  onChange={(e) => setSelectedBankId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-cyan-600 font-semibold"
                >
                  {pools.map((p) => (
                    <option key={p.bankId} value={p.bankId}>
                      {p.bank.name} ({p.bank.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Collateral Allocation (₹ INR)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 15000000"
                  value={allocatedCollateral}
                  onChange={(e) => setAllocatedCollateral(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-cyan-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Intraday Credit Line (₹ INR)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 3000000"
                  value={creditLine}
                  onChange={(e) => setCreditLine(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-cyan-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Regulatory Authorization Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Central Bank liquidity infusion per mandate"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-cyan-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl shadow-xs disabled:opacity-50"
                >
                  {submitting ? "Updating..." : "Commit Collateral"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
