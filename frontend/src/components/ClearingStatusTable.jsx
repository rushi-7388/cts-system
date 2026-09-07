import React, { useState } from "react";
import RiskBadge from "./RiskBadge";
import ChequeViewerModal from "./ChequeViewerModal";
import ClearanceCertificateModal from "./ClearanceCertificateModal";
import StatutoryReturnMemoModal from "./StatutoryReturnMemoModal";
import EKuberAdviceModal from "./EKuberAdviceModal";
import ISO20022Modal from "./ISO20022Modal";

const STATUS_STYLES = {
  PRESENTED: "bg-yellow-50 text-yellow-800 border border-yellow-200",
  VERIFIED: "bg-blue-50 text-blue-800 border border-blue-200",
  AWAITING_CHECKER: "bg-purple-50 text-purple-800 border border-purple-200",
  CLEARED: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  RETURNED: "bg-rose-50 text-rose-800 border border-rose-200",
};

export default function ClearingStatusTable({ cheques, renderActions, onUpdated }) {
  const [viewerCheque, setViewerCheque] = useState(null);
  const [certificateCheque, setCertificateCheque] = useState(null);
  const [returnMemoChequeId, setReturnMemoChequeId] = useState(null);
  const [ekuberChequeId, setEkuberChequeId] = useState(null);
  const [isoChequeId, setIsoChequeId] = useState(null);

  if (!cheques?.length) {
    return <div className="text-sm text-gray-500 p-4 bg-white rounded-lg shadow">No cheques to display.</div>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100 relative">
      <table className="min-w-full text-xs">
        <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px]">
          <tr>
            <th className="text-left px-4 py-3">Cheque #</th>
            <th className="text-left px-4 py-3">Presenting / Drawee</th>
            <th className="text-left px-4 py-3">Payee</th>
            <th className="text-right px-4 py-3">Amount</th>
            <th className="text-center px-4 py-3">Positive Pay (PPS)</th>
            <th className="text-center px-4 py-3">Risk Assessment</th>
            <th className="text-left px-4 py-3">Status / Clearing</th>
            <th className="text-left px-4 py-3">Statutory Audit Tools</th>
            {renderActions && (
              <th className="sticky right-0 bg-gray-100/95 backdrop-blur-xs px-4 py-3 text-center font-bold text-gray-800 border-l border-gray-200 shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.08)] z-20 min-w-[240px]">
                Verification Action
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {cheques.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50/50">
              <td className="px-4 py-3 font-mono font-semibold text-gray-900">
                <div className="flex items-center gap-1.5">
                  <span>{c.chequeNumber}</span>
                  <button
                    type="button"
                    onClick={() => setViewerCheque(c)}
                    title="Open Cheque Inspector (Zoom, Pan, UV Blacklight, and AI Signature Verification)"
                    className="px-1.5 py-0.5 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 font-sans text-[10px] font-bold border border-purple-200 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Inspector</span>
                  </button>
                </div>
                <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                  {c.batch?.sessionCode || "Session Unassigned"}
                </div>
              </td>

              <td className="px-4 py-3">
                <div className="font-semibold text-gray-800">{c.presentingBank?.name}</div>
                <div className="text-[11px] text-gray-400">→ {c.draweeBank?.name}</div>
              </td>

              <td className="px-4 py-3 font-medium text-gray-700">{c.payeeName}</td>

              <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">
                ₹{Number(c.amount).toLocaleString("en-IN")}
              </td>

              {/* Positive Pay System (PPS) Status Column */}
              <td className="px-4 py-3 text-center">
                {c.ppsStatus === "PPS_VERIFIED" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span>🛡️</span> VERIFIED
                  </span>
                ) : c.ppsStatus === "PPS_MISMATCH" ? (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 cursor-help"
                    title={JSON.stringify(c.ppsDiscrepancy || "Discrepancy Detected")}
                  >
                    <span>⚠️</span> MISMATCH
                  </span>
                ) : Number(c.amount) >= 50000 ? (
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200"
                    title="Drawer confirmation not logged on Positive Pay System"
                  >
                    UNREGISTERED
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400 font-mono">N/A (&lt;50K)</span>
                )}
              </td>

              {/* Dynamic Risk Tier Assessment Badge */}
              <td className="px-4 py-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  <RiskBadge
                    tier={c.riskTier || "LOW"}
                    score={c.riskScore || 0}
                    factors={c.riskFactors}
                  />
                  {c.signatureMatchScore && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        c.signatureStatus === "SUSPECT_MISMATCH"
                          ? "bg-red-50 text-red-700 font-bold border border-red-200"
                          : "bg-blue-50 text-blue-700"
                      }`}
                      title={`Specimen Signature Contour Match Score: ${c.signatureMatchScore}%`}
                    >
                      Sig: {c.signatureMatchScore}%
                    </span>
                  )}
                </div>
              </td>

              <td className="px-4 py-3">
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    STATUS_STYLES[c.status] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {c.status}
                </span>

                {c.ekuberUtr && (
                  <span
                    className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-mono font-bold block mt-1 border border-blue-200 cursor-pointer hover:bg-blue-100"
                    onClick={() => setEkuberChequeId(c.id)}
                    title={`RBI e-Kuber Settled UTR: ${c.ekuberUtr}`}
                  >
                    ⚡ {c.ekuberUtr.slice(0, 14)}...
                  </span>
                )}

                {c.fraudFlags && c.fraudFlags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {c.fraudFlags.map((f) => (
                      <span
                        key={f.id}
                        title={f.details}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-800 border border-orange-200 cursor-help"
                      >
                        <svg className="w-2.5 h-2.5 text-orange-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{f.type.replace(/_/g, " ")}</span>
                      </span>
                    ))}
                  </div>
                )}
              </td>

              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {c.status === "CLEARED" && (
                    <>
                      <button
                        type="button"
                        onClick={() => setCertificateCheque(c)}
                        className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <svg className="w-3 h-3 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Certificate</span>
                      </button>

                      {c.ekuberUtr && (
                        <button
                          type="button"
                          onClick={() => setEkuberChequeId(c.id)}
                          className="px-2 py-1 rounded bg-brand-50 hover:bg-brand-100 text-brand-800 font-bold border border-brand-300 text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                          title="View official RBI e-Kuber Settlement Advice & pacs.009 XML"
                        >
                          <span>⚡</span>
                          <span>e-Kuber</span>
                        </button>
                      )}
                    </>
                  )}

                  {c.status === "RETURNED" && (
                    <>
                      <button
                        type="button"
                        onClick={() => setReturnMemoChequeId(c.id)}
                        className="px-2 py-1 rounded bg-rose-700 hover:bg-rose-800 text-white font-bold border border-rose-800 text-[10px] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                        title="Statutory Return Memo under Section 138 Negotiable Instruments Act"
                      >
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Return Memo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsoChequeId(c.id)}
                        className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold border text-[10px] transition-colors cursor-pointer"
                        title="ISO 20022 pacs.002 XML export"
                      >
                        pacs.002
                      </button>
                    </>
                  )}

                  {c.status !== "CLEARED" && c.status !== "RETURNED" && (
                    <span className="text-gray-400 text-[11px] font-mono">In Clearing</span>
                  )}
                </div>
              </td>
              {renderActions && (
                <td className="sticky right-0 bg-white/95 backdrop-blur-xs px-4 py-3 border-l border-gray-100 shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.08)] z-10">
                  {renderActions(c)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Interactive Modals */}
      {viewerCheque && (
        <ChequeViewerModal
          cheque={viewerCheque}
          onClose={() => setViewerCheque(null)}
          onUpdated={(updated) => {
            onUpdated?.(updated);
            setViewerCheque(null);
          }}
        />
      )}

      {certificateCheque && (
        <ClearanceCertificateModal
          cheque={certificateCheque}
          onClose={() => setCertificateCheque(null)}
        />
      )}

      {returnMemoChequeId && (
        <StatutoryReturnMemoModal
          chequeId={returnMemoChequeId}
          onClose={() => setReturnMemoChequeId(null)}
        />
      )}

      {ekuberChequeId && (
        <EKuberAdviceModal
          chequeId={ekuberChequeId}
          onClose={() => setEkuberChequeId(null)}
        />
      )}

      {isoChequeId && (
        <ISO20022Modal chequeId={isoChequeId} onClose={() => setIsoChequeId(null)} />
      )}
    </div>
  );
}
