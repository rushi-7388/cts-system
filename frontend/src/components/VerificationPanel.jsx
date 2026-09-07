import React, { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const COMMON_REASONS = [
  { code: "01", label: "01: Insufficient funds" },
  { code: "02", label: "02: Signature mismatch" },
  { code: "03", label: "03: Account closed" },
  { code: "04", label: "04: Stale / Post-dated" },
  { code: "05", label: "05: Words & figures differ" },
  { code: "06", label: "06: Maker-Checker rejected" },
  { code: "30", label: "30: Positive Pay Mismatch" },
];

export default function VerificationPanel({ cheque, onUpdated, layout = "compact" }) {
  const { user } = useAuth();
  const [reasonCodes, setReasonCodes] = useState({});
  const [selectedReason, setSelectedReason] = useState("01");
  const [remarks, setRemarks] = useState("");
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    client
      .get("/clearing/return-reason-codes")
      .then(({ data }) => setReasonCodes(data))
      .catch(() => {});
  }, []);

  async function transition(toStatus, returnReason = selectedReason) {
    setError("");
    if (toStatus === "RETURNED" && !returnReason) {
      setError("Please select a statutory return reason code");
      return;
    }
    setBusy(true);
    try {
      const { data } = await client.patch(`/clearing/${cheque.id}/transition`, {
        toStatus,
        returnReasonCode: toStatus === "RETURNED" ? returnReason : undefined,
        remarks: remarks || undefined,
      });
      setShowReturnModal(false);
      onUpdated?.(data);
    } catch (err) {
      setError(err.response?.data?.error || "Clearing transition failed");
    } finally {
      setBusy(false);
    }
  }

  const isHighRiskOrValue = Number(cheque.amount) >= 100000 || cheque.riskTier === "HIGH";

  const nextActions = {
    PRESENTED: ["VERIFIED", "CLEARED", "RETURNED"],
    VERIFIED: ["CLEARED", "RETURNED"],
    AWAITING_CHECKER: ["CLEARED", "RETURNED"],
  }[cheque.status] || [];

  if (nextActions.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>Workflow Complete</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${layout === "compact" ? "min-w-[200px]" : "w-full"}`}>
      {error && (
        <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 rounded flex items-center gap-1">
          <svg className="w-3 h-3 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="leading-tight">{error}</span>
        </div>
      )}

      {cheque.status === "AWAITING_CHECKER" && (
        <div className="text-[10px] text-purple-800 bg-purple-50 border border-purple-200 px-2 py-1 rounded flex items-center gap-1.5 font-medium">
          <svg className="w-3.5 h-3.5 text-purple-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>4-Eyes Checker Sign-off Required</span>
        </div>
      )}

      {/* 3 Action Buttons Deck */}
      <div className={`flex ${layout === "compact" ? "flex-row flex-nowrap" : "flex-wrap"} gap-1.5`}>
        {/* Option 1: Verify */}
        {nextActions.includes("VERIFIED") && (
          <button
            type="button"
            disabled={busy}
            onClick={() => transition("VERIFIED")}
            className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
            title="Perform Maker verification (routes to Checker if high-value/risk)"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span>{isHighRiskOrValue ? "Verify (Send to Checker)" : "Verify"}</span>
          </button>
        )}

        {/* Option 2: Clear & Settle (e-Kuber) */}
        {nextActions.includes("CLEARED") && (
          <button
            type="button"
            disabled={busy}
            onClick={() => transition("CLEARED")}
            className={`flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap ${
              cheque.status === "AWAITING_CHECKER"
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
            title="Approve instrument and trigger instant RBI e-Kuber real-time realization"
          >
            <span>⚡</span>
            <span>{cheque.status === "AWAITING_CHECKER" ? "Authorize & Clear" : "Clear & Settle"}</span>
          </button>
        )}

        {/* Option 3: Return / Dishonour Cheque */}
        {nextActions.includes("RETURNED") && (
          <button
            type="button"
            disabled={busy}
            onClick={() => setShowReturnModal(true)}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
            title="Dishonour instrument and issue statutory return memo"
          >
            <svg className="w-3 h-3 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Return</span>
          </button>
        )}
      </div>

      {/* Clean Statutory Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">
                  ✕
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Statutory Cheque Dishonour</h3>
                  <p className="text-[11px] text-gray-500">Section 138 Negotiable Instruments Act, 1881</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                <div>
                  <div className="text-gray-400 text-[10px]">INSTRUMENT</div>
                  <div className="font-mono font-bold text-gray-900">Cheque #{cheque.chequeNumber}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-[10px]">PAYEE</div>
                  <div className="font-semibold text-gray-800">{cheque.payeeName}</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-400 text-[10px]">AMOUNT</div>
                  <div className="font-mono font-bold text-gray-900">₹{Number(cheque.amount).toLocaleString("en-IN")}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Select RBI Clearing Return Reason Code:
                </label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {COMMON_REASONS.map((r) => (
                    <button
                      key={r.code}
                      type="button"
                      onClick={() => setSelectedReason(r.code)}
                      className={`text-[10px] px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                        selectedReason === r.code
                          ? "bg-rose-600 text-white font-bold"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {r.code}
                    </button>
                  ))}
                </div>

                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  {Object.entries(reasonCodes).map(([code, label]) => (
                    <option key={code} value={code}>
                      Code {code}: {label}
                    </option>
                  ))}
                  <option value="30">Code 30: Positive Pay System Mismatch / Alteration Suspected</option>
                  <option value="88">Code 88: Clearing Window Cut-off Breached</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Bank Return Remarks / Auditor Note:
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Insufficient cleared balance in account"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 leading-snug">
                ⚠️ Confirming this dishonour generates an immutable Section 138 court-admissible Return Memo with digital bank seal.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => transition("RETURNED")}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {busy ? "Dishonouring..." : "Confirm Statutory Return"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
