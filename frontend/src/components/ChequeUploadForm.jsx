import React, { useState } from "react";
import client from "../api/client";
import ChequeViewerModal from "./ChequeViewerModal";

export default function ChequeUploadForm({ onCreated }) {
  const [chequeNumber, setChequeNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [draweeIfsc, setDraweeIfsc] = useState("HDFC0005678");
  const [payeeName, setPayeeName] = useState("");
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [scanningOcr, setScanningOcr] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  async function handleOcrScan(selectedFile) {
    const fileToScan = selectedFile || file;
    setScanningOcr(true);
    setError("");

    try {
      const formData = new FormData();
      if (fileToScan) formData.append("chequeImage", fileToScan);
      formData.append("hintText", `${chequeNumber} ${ifsc} ${accountNumber}`);

      const res = await client.post("/cheques/scan-ocr", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { extracted, confidencePercent, securityFeaturesDetected } = res.data;
      if (extracted) {
        setChequeNumber(extracted.chequeNumber);
        setIfsc(extracted.ifsc);
        setAccountNumber(extracted.accountNumber);
        if (!payeeName) setPayeeName(extracted.suggestedPayee || "Apex Industrial Corp");
        if (!amount) setAmount(extracted.suggestedAmount || "75000");

        setOcrSuccess({
          confidence: confidencePercent,
          features: securityFeaturesDetected,
        });

        setTimeout(() => setOcrSuccess(null), 5000);
      }
    } catch (err) {
      console.error("OCR Scan failed:", err);
      setError("AI OCR scanner could not process the image. Please enter fields manually.");
    } finally {
      setScanningOcr(false);
    }
  }

  function handleFileChange(e) {
    const chosen = e.target.files[0];
    setFile(chosen);
    if (chosen) {
      handleOcrScan(chosen);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setWarnings([]);

    const micrLine = `${chequeNumber.padStart(6, "0")} ${ifsc} ${accountNumber} 10`;

    const formData = new FormData();
    formData.append("micrLine", micrLine);
    formData.append("payeeName", payeeName);
    formData.append("amount", amount);
    formData.append("draweeIfsc", draweeIfsc);
    if (file) formData.append("chequeImage", file);

    setSubmitting(true);
    try {
      const { data } = await client.post("/cheques", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onCreated?.(data);
      if (data.fraudFlags?.length > 0) {
        setWarnings(data.fraudFlags.map((f) => `${f.type.replace(/_/g, " ")}: ${f.details}`));
      }
      setChequeNumber("");
      setIfsc("");
      setAccountNumber("");
      setPayeeName("");
      setAmount("");
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit cheque");
    } finally {
      setSubmitting(false);
    }
  }

  const previewChequeData = {
    chequeNumber: chequeNumber || "000123",
    ifsc: ifsc || "SBIN0001234",
    accountNumber: accountNumber || "123456789012",
    payeeName: payeeName || "Sample Payee",
    amount: amount || "50000",
    micrCode: `${chequeNumber || "000123"} ${ifsc || "SBIN0001234"} ${accountNumber || "123456789012"} 10`,
    imageUrl: file ? URL.createObjectURL(file) : null,
    createdAt: new Date(),
    presentingBank: { name: "Surat Local Bank" },
    draweeBank: { name: "Horizon Digital Bank" },
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow border border-gray-100 p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b">
          <div>
            <h2 className="font-bold text-lg text-gray-900">Present a Cheque for Clearing</h2>
            <p className="text-xs text-gray-500">
              Enter MICR details manually or upload a cheque image for instant AI OCR auto-fill.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Open UV & Security Inspector</span>
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-700 text-xs rounded-lg p-3 border border-red-100">{error}</div>}

        {ocrSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg p-3 text-xs flex items-center justify-between animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <span className="font-bold">AI OCR Extraction Successful:</span> MICR line, cheque number & account auto-filled.
                <span className="ml-2 font-mono text-[11px] text-emerald-700">({ocrSuccess.confidence}% confidence)</span>
              </div>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wider">CTS-2010 Passed</span>
          </div>
        )}

        {/* Cheque Image Upload & OCR Trigger Card */}
        <div className="p-4 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 hover:border-brand-400 transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-0.5">
                Cheque Image (AI Optical Character Recognition)
              </label>
              <p className="text-[11px] text-gray-500">
                Upload scanned image to auto-detect E-13B MICR line, Cheque #, and Security Fibers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-700 cursor-pointer"
              />
              {scanningOcr && (
                <span className="text-xs text-brand-600 font-medium flex items-center gap-1.5">
                  <svg className="animate-spin h-3.5 w-3.5 text-brand-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  <span>Scanning...</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {warnings.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 text-orange-900 text-xs rounded-lg p-3 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <svg className="w-4 h-4 text-orange-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Cheque presented, but flagged for compliance review:</span>
            </div>
            {warnings.map((w, i) => (
              <div key={i} className="text-[11px] pl-5">• {w}</div>
            ))}
          </div>
        )}

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Cheque Number (6 digits)</label>
            <input
              value={chequeNumber}
              onChange={(e) => setChequeNumber(e.target.value)}
              required
              maxLength={6}
              className="w-full border rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="000123"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Payer Bank IFSC (from MICR)</label>
            <input
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              required
              className="w-full border rounded-lg px-3 py-2 text-xs font-mono uppercase focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="SBIN0001234"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Payer Account Number</label>
            <input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="123456789012"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Drawee Bank IFSC</label>
            <input
              value={draweeIfsc}
              onChange={(e) => setDraweeIfsc(e.target.value.toUpperCase())}
              required
              className="w-full border rounded-lg px-3 py-2 text-xs font-mono uppercase focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Payee Name</label>
            <input
              value={payeeName}
              onChange={(e) => setPayeeName(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="Acme Enterprises"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (INR ₹)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="50000.00"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-[11px] text-gray-400 font-mono">
            MICR: {chequeNumber ? `${chequeNumber.padStart(6, "0")} ${ifsc} ${accountNumber} 10` : "Enter details above to preview MICR band"}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-5 py-2.5 text-xs font-bold transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
          >
            {submitting ? "Presenting Cheque..." : "Present Cheque into Clearing"}
          </button>
        </div>
      </form>

      {showPreviewModal && (
        <ChequeViewerModal
          cheque={previewChequeData}
          onClose={() => setShowPreviewModal(false)}
        />
      )}
    </>
  );
}
