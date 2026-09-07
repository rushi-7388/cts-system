import React, { useEffect, useState } from "react";
import client from "../api/client";

export default function StatutoryReturnMemoModal({ chequeId, onClose }) {
  const [memo, setMemo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!chequeId) return;
    client
      .get(`/clearing/${chequeId}/return-memo`)
      .then(({ data }) => setMemo(data))
      .catch((err) => setError(err.response?.data?.error || "Failed to load Return Memo"))
      .finally(() => setLoading(false));
  }, [chequeId]);

  function handlePrint() {
    window.print();
  }

  if (!chequeId) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Modal Controls (Hidden during Print) */}
        <div className="px-6 py-3 border-b flex items-center justify-between bg-rose-50/50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
            <span className="font-bold text-xs text-rose-900 uppercase tracking-wider">
              Statutory Cheque Dishonour Memo (Section 138 NI Act)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              disabled={loading || !!error}
              className="bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print / Save as Legal Memo PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg ml-1 flex items-center justify-center cursor-pointer"
              title="Close Return Memo"
              aria-label="Close Return Memo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-auto bg-white text-gray-900 print:p-0">
          {loading && (
            <div className="py-20 text-center text-sm text-gray-500">
              <svg className="animate-spin h-6 w-6 text-rose-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              Retrieving Statutory Return Memo from Interbank Clearing Archive...
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm text-center">
              {error}
            </div>
          )}

          {memo && (
            <div className="border-4 border-double border-rose-950 p-8 rounded-xl relative space-y-6">
              {/* Background Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <span className="text-8xl font-serif font-black uppercase text-rose-950">RETURNED</span>
              </div>

              {/* Memo Header */}
              <div className="text-center pb-5 border-b-2 border-rose-950">
                <div className="text-[11px] font-bold uppercase tracking-widest text-rose-800">
                  {memo.clearingHouse}
                </div>
                <h1 className="text-2xl font-serif font-black text-rose-950 uppercase tracking-wide mt-1">
                  Cheque Return & Dishonour Memo
                </h1>
                <div className="text-xs font-semibold text-gray-700 mt-1">
                  Issued under: <span className="italic">{memo.statutoryAct}</span>
                </div>
                <div className="text-xs font-mono text-gray-500 mt-1">
                  Memo Reference: <span className="font-bold text-gray-900 select-all">{memo.memoRef}</span>
                </div>
              </div>

              {/* Statutory Alert Banner */}
              <div className="bg-rose-50 border-2 border-rose-300 rounded-lg p-3 text-center">
                <div className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-rose-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>OFFICIAL DISHONOUR NOTICE: INSTRUMENT RETURNED UNPAID BY DRAWEE BANK</span>
                </div>
              </div>

              {/* Instrument & Bank Particulars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <span className="text-gray-500 block text-[10px] font-bold uppercase">Cheque Serial Number</span>
                  <span className="font-mono font-bold text-base text-gray-900">{memo.chequeDetails.chequeNumber}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border">
                  <span className="text-gray-500 block text-[10px] font-bold uppercase">Dishonoured Amount</span>
                  <span className="font-mono font-bold text-base text-rose-900">
                    ₹{Number(memo.chequeDetails.amount).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border">
                  <span className="text-gray-500 block text-[10px] font-bold uppercase">Drawer Account Number</span>
                  <span className="font-mono font-semibold text-gray-900">{memo.chequeDetails.accountNumber}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border">
                  <span className="text-gray-500 block text-[10px] font-bold uppercase">Payee / Beneficiary Name</span>
                  <span className="font-semibold text-gray-900">{memo.chequeDetails.payeeName}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border">
                  <span className="text-gray-500 block text-[10px] font-bold uppercase">Drawee Bank (Paying Bank)</span>
                  <span className="font-semibold text-gray-900">{memo.banks.draweeBank}</span>
                  <span className="text-[10px] font-mono text-gray-500 block">IFSC: {memo.banks.draweeIfsc}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border">
                  <span className="text-gray-500 block text-[10px] font-bold uppercase">Presenting Bank (Collecting Bank)</span>
                  <span className="font-semibold text-gray-900">{memo.banks.presentingBank}</span>
                  <span className="text-[10px] font-mono text-gray-500 block">IFSC: {memo.banks.presentingIfsc}</span>
                </div>
              </div>

              {/* Statutory Reason for Return */}
              <div className="p-4 rounded-xl bg-rose-50/70 border-2 border-rose-200">
                <span className="text-[10px] uppercase font-bold text-rose-800 tracking-wider block mb-1">
                  RBI Clearing Return Reason Code & Description
                </span>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded bg-rose-700 text-white font-mono font-bold text-xs">
                    CODE {memo.dishonour.reasonCode}
                  </span>
                  <span className="font-bold text-rose-950 text-sm">
                    {memo.dishonour.reasonDescription}
                  </span>
                </div>
                {memo.dishonour.remarks && (
                  <div className="text-xs text-rose-900 mt-2 italic">
                    Officer Remarks: "{memo.dishonour.remarks}"
                  </div>
                )}
              </div>

              {/* Legal Notice Clause */}
              <div className="text-[11px] text-gray-600 bg-gray-50 p-4 rounded-lg border leading-relaxed">
                <span className="font-bold text-gray-800 block mb-1">Statutory Notice Under Section 138 Negotiable Instruments Act:</span>
                {memo.legalNoticeClause}
              </div>

              {/* Signatory & QR Verification */}
              <div className="pt-4 border-t-2 border-gray-300 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-gray-900">
                    Authorized Officer: {memo.dishonour.returnedByOfficer}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    Session: {memo.session} · Date: {new Date(memo.dateOfReturn).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono break-all max-w-sm">
                    CTS Digital Seal: {memo.digitalSeal.verificationDigest}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
                      OFFICIAL CTS
                    </div>
                    <div className="text-[9px] text-gray-500">DIGITAL BANK SEAL</div>
                  </div>
                  <div className="w-14 h-14 border-2 border-rose-900 p-1 bg-white flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-full h-full fill-rose-900">
                      <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5zm13-2h3v3h-3v-3zm-5 0h3v3h-3v-3zm0 5h3v3h-3v-3zm5 0h3v3h-3v-3z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
