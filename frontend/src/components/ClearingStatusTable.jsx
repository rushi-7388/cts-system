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
    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center shadow-xs space-y-2">
        <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-800">No Instruments in Clearing</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          No cheques match the current filter or session. Present a new cheque or switch sessions to view active records.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-xs border border-gray-200/90 relative">
      <table className="min-w-full text-xs divide-y divide-gray-200">
        <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] font-bold">
          <tr>
            <th className="text-left px-4 py-3.5 min-w-[200px] whitespace-nowrap">Cheque Instrument</th>
            <th className="text-left px-4 py-3.5 min-w-[180px] whitespace-nowrap">Presenting / Drawee</th>
            <th className="text-left px-4 py-3.5 min-w-[160px] whitespace-nowrap">Payee</th>
            <th className="text-right px-4 py-3.5 min-w-[120px] whitespace-nowrap">Amount</th>
            <th className="text-center px-4 py-3.5 min-w-[140px] whitespace-nowrap">Positive Pay (PPS)</th>
            <th className="text-center px-4 py-3.5 min-w-[140px] whitespace-nowrap">Risk Assessment</th>
            <th className="text-left px-4 py-3.5 min-w-[150px] whitespace-nowrap">Status / Clearing</th>
            <th className="text-left px-4 py-3.5 min-w-[180px] whitespace-nowrap">Statutory Audit Tools</th>
            {renderActions && (
              <th className="sticky right-0 bg-slate-100/95 backdrop-blur-xs px-4 py-3.5 text-center font-bold text-slate-800 border-l border-slate-200 shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.08)] z-20 min-w-[240px] whitespace-nowrap">
                Verification Action
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {cheques.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50/80 group transition-colors">
              <td className="px-4 py-3.5 font-mono text-gray-900 min-w-[200px]">
                <div className="flex items-center gap-3">
                  {/* Scanned Cheque Instrument Thumbnail */}
                  <div
                    onClick={() => setViewerCheque(c)}
                    className="relative w-16 h-10 rounded-md border border-slate-300 overflow-hidden bg-slate-100 shrink-0 cursor-pointer group shadow-2xs hover:border-brand-500 hover:ring-2 hover:ring-brand-500/30 transition-all"
                    title="Click to inspect full CTS-2010 cheque image"
                  >
                    <img
                      src={c.imageUrl || (c.chequeNumber === "000102" ? "/cheque-000102.jpg" : c.chequeNumber === "000123" ? "/cheque-000123.jpg" : "/sample-cheque.jpg")}
                      alt={`Cheque #${c.chequeNumber}`}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-200"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/sample-cheque.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 drop-shadow transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Cheque Details & Inspector Trigger */}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-900">{c.chequeNumber}</span>
                      <button
                        type="button"
                        onClick={() => setViewerCheque(c)}
                        title="Open Cheque Inspector"
                        className="px-1.5 py-0.5 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 font-sans text-[10px] font-bold border border-purple-200 transition-all cursor-pointer flex items-center gap-0.5 shadow-2xs whitespace-nowrap"
                      >
                        <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View</span>
                      </button>
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                      {c.batch?.sessionCode || "Session Unassigned"}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-4 py-3.5 min-w-[180px]">
                <div className="font-bold text-gray-900 text-xs">{c.presentingBank?.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">→ {c.draweeBank?.name}</div>
              </td>

              <td className="px-4 py-3.5 font-semibold text-gray-800 text-xs min-w-[160px]">
                {c.payeeName}
              </td>

              <td className="px-4 py-3.5 text-right font-mono font-bold text-gray-900 text-sm whitespace-nowrap min-w-[120px]">
                ₹{Number(c.amount).toLocaleString("en-IN")}
              </td>

              {/* Positive Pay System (PPS) Status Column */}
              <td className="px-4 py-3.5 text-center whitespace-nowrap min-w-[140px]">
                {c.ppsStatus === "PPS_VERIFIED" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>VERIFIED</span>
                  </span>
                ) : c.ppsStatus === "PPS_MISMATCH" ? (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300 cursor-help"
                    title={JSON.stringify(c.ppsDiscrepancy || "Discrepancy Detected")}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span>MISMATCH</span>
                  </span>
                ) : Number(c.amount) >= 50000 ? (
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200"
                    title="Drawer confirmation not logged on Positive Pay System"
                  >
                    UNREGISTERED
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 font-mono">N/A (&lt;50K)</span>
                )}
              </td>

              {/* Dynamic Risk Tier Assessment Badge */}
              <td className="px-4 py-3.5 text-center min-w-[140px]">
                <div className="flex flex-col items-center gap-1">
                  <RiskBadge
                    tier={c.riskTier || "LOW"}
                    score={c.riskScore || 0}
                    factors={c.riskFactors}
                  />
                  {c.signatureMatchScore && (
                    <span
                      className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded ${
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

              <td className="px-4 py-3.5 min-w-[150px]">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${
                    STATUS_STYLES[c.status] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {c.status}
                </span>

                {c.ekuberUtr && (
                  <span
                    className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-mono font-bold block mt-1 border border-blue-200 cursor-pointer hover:bg-blue-100 whitespace-nowrap"
                    onClick={() => setEkuberChequeId(c.id)}
                    title={`RBI e-Kuber Settled UTR: ${c.ekuberUtr}`}
                  >
                    UTR: {c.ekuberUtr.slice(0, 14)}...
                  </span>
                )}

                {c.fraudFlags && c.fraudFlags.length > 0 && (
                  <div className="flex flex-col gap-1 mt-1 max-w-fit">
                    {c.fraudFlags.map((f) => (
                      <span
                        key={f.id}
                        title={f.details}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-800 border border-orange-200 cursor-help whitespace-nowrap"
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

              <td className="px-4 py-3.5 min-w-[180px]">
                <div className="flex flex-wrap items-center gap-1.5">
                  {c.status === "CLEARED" && (
                    <>
                      <button
                        type="button"
                        onClick={() => setCertificateCheque(c)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
                      >
                        <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Certificate</span>
                      </button>

                      {c.ekuberUtr && (
                        <button
                          type="button"
                          onClick={() => setEkuberChequeId(c.id)}
                          className="px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-800 font-bold border border-brand-300 text-xs transition-all cursor-pointer flex items-center gap-1 shadow-2xs whitespace-nowrap"
                          title="View official RBI e-Kuber Settlement Advice & pacs.009 XML"
                        >
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
                        className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold border border-rose-800 text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
                        title="Statutory Return Memo under Section 138 Negotiable Instruments Act"
                      >
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Return Memo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsoChequeId(c.id)}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold border text-xs transition-all cursor-pointer whitespace-nowrap shadow-2xs"
                        title="ISO 20022 pacs.002 XML export"
                      >
                        pacs.002
                      </button>
                    </>
                  )}

                  {c.status !== "CLEARED" && c.status !== "RETURNED" && (
                    <span className="text-gray-500 text-xs font-mono font-medium">In Clearing</span>
                  )}
                </div>
              </td>
              {renderActions && (
                <td className="sticky right-0 bg-white/95 group-hover:bg-slate-50/95 backdrop-blur-xs px-5 py-4 border-l border-gray-200/60 shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.06)] z-10 transition-colors min-w-[260px]">
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
