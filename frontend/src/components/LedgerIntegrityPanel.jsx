import React, { useState, useEffect } from "react";
import client from "../api/client";

export default function LedgerIntegrityPanel() {
  const [auditResult, setAuditResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentEvents, setRecentEvents] = useState([]);

  async function runAudit() {
    setLoading(true);
    try {
      const [auditRes, eventsRes] = await Promise.all([
        client.get("/admin/ledger/verify"),
        client.get("/admin/audit-trail"),
      ]);
      setAuditResult(auditRes.data);
      setRecentEvents(eventsRes.data.slice(0, 8));
    } catch (err) {
      setAuditResult({ isValid: false, reason: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runAudit();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b">
        <div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <h2 className="text-lg font-bold text-gray-900">Cryptographic Blockchain Audit Ledger</h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Tamper-proof SHA-256 hash chaining: every clearing event is cryptographically sealed to preceding blocks.
          </p>
        </div>

        <button
          type="button"
          onClick={runAudit}
          disabled={loading}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
        >
          {loading ? (
            <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          )}
          <span>{loading ? "Auditing Hashes..." : "Verify Ledger Integrity"}</span>
        </button>
      </div>

      {/* Audit Status Banner */}
      {auditResult && (
        <div
          className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${
            auditResult.isValid
              ? "bg-emerald-50 border-emerald-200 text-emerald-950"
              : "bg-rose-50 border-rose-200 text-rose-950"
          }`}
        >
          <div className="flex items-center gap-3">
            {auditResult.isValid ? (
              <svg className="w-6 h-6 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <div>
              <div className="font-bold text-sm">
                {auditResult.isValid
                  ? "Ledger Integrity Verified: 100% Tamper-Proof"
                  : "SECURITY ALERT: Hash-Chain Integrity Compromised!"}
              </div>
              <div className="text-xs opacity-80 mt-0.5">{auditResult.message || auditResult.reason}</div>
            </div>
          </div>

          <div className="text-xs font-mono bg-white/70 px-3 py-1.5 rounded-lg border">
            Verified: <span className="font-bold">{auditResult.totalEvents} blocks</span>
          </div>
        </div>
      )}

      {/* Ledger Hashes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
          <div className="text-gray-500 font-sans font-semibold text-[11px] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Genesis Hash (Block #0)</span>
            <span className="text-emerald-600 font-bold font-mono">ANCHOR</span>
          </div>
          <div className="text-gray-800 break-all bg-white p-2.5 rounded border text-[11px] select-all">
            {auditResult?.genesisHash || "0000000000000000000000000000000000000000000000000000000000000000"}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
          <div className="text-gray-500 font-sans font-semibold text-[11px] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Tip Block Hash (Latest State)</span>
            <span className="text-brand-600 font-bold font-mono">CHAIN TIP</span>
          </div>
          <div className="text-gray-800 break-all bg-white p-2.5 rounded border text-[11px] select-all">
            {auditResult?.tipHash || "0000000000000000000000000000000000000000000000000000000000000000"}
          </div>
        </div>
      </div>

      {/* Visual Hash Chain Block Explorer */}
      <div>
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
          Recent Chained Blocks (Sequential SHA-256 Ledger Stream)
        </h3>

        <div className="space-y-3">
          {recentEvents.map((ev, idx) => (
            <div
              key={ev.id}
              className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 hover:border-brand-300 transition-colors text-xs space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold bg-brand-100 text-brand-800 px-2 py-0.5 rounded text-[10px]">
                    BLOCK #{recentEvents.length - idx}
                  </span>
                  <span className="font-semibold text-gray-900">
                    Cheque #{ev.cheque?.chequeNumber}
                  </span>
                  <span className="text-gray-500 font-mono text-[11px]">
                    ({ev.fromStatus ? `${ev.fromStatus} → ${ev.toStatus}` : `INIT ${ev.toStatus}`})
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 font-mono">
                  {new Date(ev.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="truncate bg-white p-1.5 rounded border text-gray-500">
                  <span className="font-bold text-gray-400">prev: </span>
                  {ev.prevHash ? ev.prevHash : "0000000000000000000000000000000000000000..."}
                </div>
                <div className="truncate bg-white p-1.5 rounded border text-brand-700 font-semibold">
                  <span className="font-bold text-gray-400">hash: </span>
                  {ev.hash ? ev.hash : "Calculating..."}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
