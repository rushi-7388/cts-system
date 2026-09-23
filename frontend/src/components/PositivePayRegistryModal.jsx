import React, { useEffect, useState } from "react";
import client from "../api/client";

export default function PositivePayRegistryModal({ onClose }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form state
  const [accountNumber, setAccountNumber] = useState("123456789012");
  const [chequeNumber, setChequeNumber] = useState("000456");
  const [payeeName, setPayeeName] = useState("Apex Global Trading Ltd");
  const [amount, setAmount] = useState("125000");
  const [chequeDate, setChequeDate] = useState(new Date().toISOString().slice(0, 10));

  async function loadRecords() {
    try {
      const res = await client.get("/cheques/positive-pay");
      setRecords(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load Positive Pay records");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      await client.post("/cheques/positive-pay", {
        accountNumber,
        chequeNumber,
        payeeName,
        amount: Number(amount),
        chequeDate,
      });

      setSuccessMsg(`Positive Pay record for Cheque #${chequeNumber} (₹${Number(amount).toLocaleString("en-IN")}) registered successfully.`);
      // Reset some inputs
      setChequeNumber(String(Math.floor(100000 + Math.random() * 900000)));
      await loadRecords();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to register Positive Pay record");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-100"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-brand-900 text-white">
          <div>
            <h2 className="text-base font-bold">Positive Pay System (PPS) Registry</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-300 hover:text-white px-2 py-1 rounded border border-slate-600 hover:bg-white/10 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Alerts */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg">
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Pre-Registration Form */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
              Pre-Register Cheque Confirmation
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono focus:ring-1 focus:ring-brand-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Cheque Number</label>
                <input
                  type="text"
                  value={chequeNumber}
                  onChange={(e) => setChequeNumber(e.target.value)}
                  maxLength={6}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold focus:ring-1 focus:ring-brand-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Payee Name</label>
                <input
                  type="text"
                  value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-brand-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-brand-900 focus:ring-1 focus:ring-brand-500 outline-none"
                  required
                />
              </div>

              <div className="flex flex-col justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white text-xs font-bold py-2 px-3 rounded transition-colors shadow-xs cursor-pointer"
                >
                  {submitting ? "Registering..." : "+ Register PPS"}
                </button>
              </div>
            </form>
          </div>

          {/* Records Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Active Pre-Registered Cheques ({records.length})
              </h3>
              <button
                type="button"
                onClick={loadRecords}
                className="text-[11px] text-brand-600 hover:text-brand-800 font-semibold cursor-pointer"
              >
                Refresh Registry
              </button>
            </div>

            {loading ? (
              <div className="py-10 text-center text-xs text-gray-400">Loading Positive Pay registry...</div>
            ) : records.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border">
                No Positive Pay records registered yet. Use the form above to register cheque pre-confirmations.
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead className="bg-gray-50 font-bold text-gray-600 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5 text-left">Cheque #</th>
                      <th className="px-4 py-2.5 text-left">Account Number</th>
                      <th className="px-4 py-2.5 text-left">Payee Beneficiary</th>
                      <th className="px-4 py-2.5 text-right">Pre-Registered Amount</th>
                      <th className="px-4 py-2.5 text-center">Status</th>
                      <th className="px-4 py-2.5 text-right">Registered On</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 font-mono text-[11px]">
                    {records.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 font-bold text-brand-900">{r.chequeNumber}</td>
                        <td className="px-4 py-2.5 text-gray-700">{r.accountNumber}</td>
                        <td className="px-4 py-2.5 font-sans font-medium text-gray-900">{r.payeeName}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-gray-900">
                          ₹{Number(r.amount).toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-2.5 text-center font-sans">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-gray-400 text-[10px]">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
