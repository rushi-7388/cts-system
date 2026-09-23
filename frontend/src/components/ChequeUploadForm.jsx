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
    imageUrl: file
      ? URL.createObjectURL(file)
      : chequeNumber === "000102"
        ? "/cheque-000102.jpg"
        : chequeNumber === "000123"
          ? "/cheque-000123.jpg"
          : "/sample-cheque.jpg",
    createdAt: new Date(),
    presentingBank: { name: "Surat Bank" },
    draweeBank: { name: "Horizon Digital Bank" },
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-6 sm:p-8 space-y-7">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-xl text-slate-900 tracking-tight">Present Cheque for Clearing</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
            >
              Security Inspector
            </button>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-700 text-xs font-semibold rounded-xl p-4 border border-red-200">{error}</div>}

        {ocrSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-4 text-xs flex flex-wrap items-center justify-between gap-2 animate-in fade-in duration-150">
            <div>
              <span className="font-bold">OCR Extraction Completed:</span> MICR line, cheque number and account auto-filled.
              <span className="ml-2 font-mono text-xs text-emerald-700 font-semibold">({ocrSuccess.confidence}% confidence)</span>
            </div>
            <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider bg-white/80 border border-emerald-300 px-2.5 py-1 rounded-md">Verified</span>
          </div>
        )}

        {/* Cheque Image Upload & OCR Trigger Card */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border-2 border-dashed border-slate-300 hover:border-brand-400 transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Cheque Image (Optical Character Recognition)
              </label>
              <p className="text-xs text-slate-500">
                Upload instrument image to scan E-13B MICR line and instrument details.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-600 file:text-white hover:file:bg-brand-700 cursor-pointer transition-all"
              />
              {scanningOcr && (
                <span className="text-xs text-brand-600 font-bold whitespace-nowrap">
                  Scanning Instrument...
                </span>
              )}
            </div>
          </div>
        </div>

        {warnings.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 text-orange-900 text-xs rounded-xl p-4 space-y-1.5">
            <div className="font-bold">
              Cheque presented, flagged for review:
            </div>
            {warnings.map((w, i) => (
              <div key={i} className="text-xs pl-3 font-medium">• {w}</div>
            ))}
          </div>
        )}

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Cheque Number (6 digits)</label>
            <input
              value={chequeNumber}
              onChange={(e) => setChequeNumber(e.target.value)}
              required
              maxLength={6}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
              placeholder="000123"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Payer Bank IFSC (from MICR)</label>
            <input
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono uppercase text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
              placeholder="SBIN0001234"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Payer Account Number</label>
            <input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
              placeholder="123456789012"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Drawee Bank IFSC</label>
            <input
              value={draweeIfsc}
              onChange={(e) => setDraweeIfsc(e.target.value.toUpperCase())}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono uppercase text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Payee Name</label>
            <input
              value={payeeName}
              onChange={(e) => setPayeeName(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
              placeholder="Acme Enterprises"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Amount (INR ₹)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
              placeholder="50000.00"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-500 font-mono">
            MICR: {chequeNumber ? `${chequeNumber.padStart(6, "0")} ${ifsc} ${accountNumber} 10` : "Enter details above to preview MICR band"}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-6 py-3 text-sm font-bold transition-all disabled:opacity-50 shadow-xs cursor-pointer tracking-wide whitespace-nowrap"
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
