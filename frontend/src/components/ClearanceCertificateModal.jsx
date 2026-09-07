import React from "react";

export default function ClearanceCertificateModal({ cheque, onClose }) {
  if (!cheque) return null;

  function handlePrint() {
    window.print();
  }

  const certificateRef = `CTS-CERT-${cheque.chequeNumber}-${cheque.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Modal Controls (Hidden in Print) */}
        <div className="px-6 py-3 border-b flex items-center justify-between bg-gray-50 print:hidden">
          <span className="font-bold text-xs text-gray-700 uppercase tracking-wider">
            Official CTS Cheque Clearance Certificate
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg ml-2 flex items-center justify-center"
              title="Close Certificate"
              aria-label="Close Certificate"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Printable Certificate Document */}
        <div className="flex-1 p-8 overflow-auto bg-white text-gray-900 print:p-0">
          <div className="border-4 border-double border-brand-900 p-8 rounded-xl relative">
            {/* Background Bank Seal Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <span className="text-9xl font-serif font-black uppercase">CTS</span>
            </div>

            {/* Certificate Header */}
            <div className="text-center pb-6 border-b-2 border-brand-900">
              <div className="text-xs font-bold uppercase tracking-widest text-brand-700">
                National Payments Corporation & Interbank Clearing House
              </div>
              <h1 className="text-2xl font-serif font-black text-gray-900 uppercase tracking-wide mt-1">
                Certificate of Cheque Clearance & Settlement
              </h1>
              <div className="text-xs font-mono text-gray-500 mt-1">
                Certificate Ref: <span className="font-bold text-gray-800">{certificateRef}</span>
              </div>
            </div>

            {/* Verification Status Banner */}
            <div className="my-6 bg-emerald-50 border border-emerald-300 rounded-lg p-3 text-center">
              <span className="text-xs font-bold text-emerald-900 tracking-wider uppercase flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>STATUS: CLEARED & RECONCILED UNDER CTS-2010 CLEARING STANDARD</span>
              </span>
            </div>

            {/* Instrument Data Table */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-6">
              <div className="p-3 bg-gray-50 rounded border">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Cheque Number</span>
                <span className="font-mono font-bold text-sm text-gray-900">{cheque.chequeNumber}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded border">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Settled Amount</span>
                <span className="font-mono font-bold text-sm text-brand-900">
                  ₹{Number(cheque.amount).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded border">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Presenting Bank</span>
                <span className="font-semibold text-gray-900">{cheque.presentingBank?.name}</span>
                <span className="text-[10px] text-gray-500 block font-mono">IFSC: {cheque.presentingBank?.ifsc}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded border">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Drawee Bank</span>
                <span className="font-semibold text-gray-900">{cheque.draweeBank?.name}</span>
                <span className="text-[10px] text-gray-500 block font-mono">IFSC: {cheque.draweeBank?.ifsc}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded border">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Payee Beneficiary</span>
                <span className="font-semibold text-gray-900">{cheque.payeeName}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded border">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Clearing Date</span>
                <span className="font-mono text-gray-900 font-semibold">{new Date().toLocaleString()}</span>
              </div>
            </div>

            {/* Cryptographic & QR Verification Block */}
            <div className="pt-4 border-t border-gray-300 flex items-center justify-between gap-4">
              <div className="space-y-1 text-[11px]">
                <div className="font-bold text-gray-800 uppercase tracking-wider">Cryptographic Audit Seal</div>
                <div className="font-mono text-[10px] text-gray-500 break-all max-w-sm">
                  SHA-256 Digest: {cheque.imageHash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
                </div>
                <div className="text-[10px] text-gray-400">
                  Compliant with Section 131 of the Negotiable Instruments Act.
                </div>
              </div>

              {/* Vector Simulated QR Code */}
              <div className="w-16 h-16 border-2 border-gray-900 p-1 bg-white shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-full h-full fill-gray-900">
                  <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5zm13-2h3v3h-3v-3zm-5 0h3v3h-3v-3zm0 5h3v3h-3v-3zm5 0h3v3h-3v-3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
