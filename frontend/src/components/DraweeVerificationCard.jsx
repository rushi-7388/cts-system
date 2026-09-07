import React from "react";
import VerificationPanel from "./VerificationPanel";
import RiskBadge from "./RiskBadge";

export default function DraweeVerificationCard({
  cheque,
  onInspect,
  onViewEKuber,
  onViewReturnMemo,
  onUpdated,
}) {
  const isHighRiskOrValue = Number(cheque.amount) >= 100000 || cheque.riskTier === "HIGH";

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      {/* Card Header */}
      <div className="p-4 bg-gray-50/70 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-gray-900 text-sm bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs">
            #{cheque.chequeNumber}
          </span>
          <span className="text-[11px] font-mono text-gray-500 bg-gray-200/60 px-2 py-0.5 rounded">
            {cheque.batch?.sessionCode || "BATCH-OPEN"}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              cheque.status === "PRESENTED"
                ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                : cheque.status === "VERIFIED"
                ? "bg-blue-50 text-blue-800 border border-blue-200"
                : cheque.status === "AWAITING_CHECKER"
                ? "bg-purple-50 text-purple-800 border border-purple-200 animate-pulse"
                : cheque.status === "CLEARED"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {cheque.status}
          </span>
        </div>

        <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
          <span className="font-semibold text-gray-700">{cheque.presentingBank?.name || "Surat Local Bank"}</span>
          <span>→</span>
          <span className="text-gray-400 font-mono text-[10px]">{cheque.draweeBank?.ifsc || "HDFC0005678"}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-4 flex-1">
        {/* Payee & Amount */}
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Payee Name</div>
            <div className="text-sm font-bold text-gray-900 truncate max-w-[240px]" title={cheque.payeeName}>
              {cheque.payeeName}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Instrument Amount</div>
            <div className="text-xl font-extrabold text-gray-900 font-mono tracking-tight">
              ₹{Number(cheque.amount).toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* 3 Core Assessment Badges (Positive Pay, AI Biometrics, Risk) */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center">
          {/* 1. Positive Pay Status */}
          <div className="bg-gray-50/80 p-2 rounded-xl border border-gray-100 flex flex-col items-center justify-center">
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Positive Pay (PPS)</div>
            {cheque.ppsStatus === "PPS_VERIFIED" ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span>🛡️</span> Confirmed
              </span>
            ) : cheque.ppsStatus === "PPS_MISMATCH" ? (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 animate-pulse cursor-help"
                title={JSON.stringify(cheque.ppsDiscrepancy || "Discrepancy detected")}
              >
                <span>⚠️</span> Mismatch!
              </span>
            ) : Number(cheque.amount) >= 50000 ? (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Unregistered
              </span>
            ) : (
              <span className="text-[10px] text-gray-400 font-mono">N/A (&lt;50K)</span>
            )}
          </div>

          {/* 2. AI Specimen Signature Biometrics */}
          <div className="bg-gray-50/80 p-2 rounded-xl border border-gray-100 flex flex-col items-center justify-center">
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">AI Signature Card</div>
            {cheque.signatureMatchScore ? (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  cheque.signatureStatus === "SUSPECT_MISMATCH" || cheque.signatureMatchScore < 80
                    ? "text-rose-700 bg-rose-50 border-rose-200"
                    : "text-blue-700 bg-blue-50 border-blue-200"
                }`}
              >
                {cheque.signatureMatchScore}% Match
              </span>
            ) : (
              <span className="text-[10px] text-gray-400 font-mono">300 DPI Matched</span>
            )}
          </div>

          {/* 3. Risk Evaluation */}
          <div className="bg-gray-50/80 p-2 rounded-xl border border-gray-100 flex flex-col items-center justify-center">
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Risk Score</div>
            <RiskBadge
              tier={cheque.riskTier || "LOW"}
              score={cheque.riskScore || 0}
              factors={cheque.riskFactors}
            />
          </div>
        </div>

        {/* e-Kuber UTR notification banner if settled */}
        {cheque.ekuberUtr && (
          <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-blue-900 font-mono text-[11px] font-bold">
              <span>⚡ e-Kuber UTR:</span>
              <span>{cheque.ekuberUtr}</span>
            </div>
            <button
              type="button"
              onClick={() => onViewEKuber(cheque.id)}
              className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
            >
              View Advice
            </button>
          </div>
        )}
      </div>

      {/* Card Action Deck (Prominently Placed at the Bottom with ZERO horizontal scrolling!) */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          {/* Inspector Trigger */}
          <button
            type="button"
            onClick={() => onInspect(cheque)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold border border-gray-200 shadow-2xs transition-colors cursor-pointer"
            title="Inspect high-resolution scan, UV blacklight watermark, and AI specimen signature comparison"
          >
            <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Inspect Instrument & UV</span>
          </button>

          {/* Statutory tools if already final */}
          {cheque.status === "RETURNED" && (
            <button
              type="button"
              onClick={() => onViewReturnMemo(cheque.id)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Return Memo (Sec 138)</span>
            </button>
          )}
        </div>

        {/* The 3 Direct Verification Options (Verify, Clear, Return) */}
        {["PRESENTED", "VERIFIED", "AWAITING_CHECKER"].includes(cheque.status) && (
          <div className="pt-2 border-t border-gray-200/60">
            <VerificationPanel cheque={cheque} onUpdated={onUpdated} layout="full" />
          </div>
        )}
      </div>
    </div>
  );
}
