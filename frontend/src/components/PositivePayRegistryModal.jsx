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

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-brand-900 to-brand-800 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20">
              <svg className="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">Positive Pay System (PPS) Central Registry</h2>
                <span className="text-[10px] bg-amber-400 text-brand-950 font-bold px-2 py-0.5 rounded-full uppercase">
                  NPCI / RBI Mandate
                </span>
              </div>
              <p className="text-xs text-brand-200 mt-0.5">
                Pre-registered drawer confirmations for 5-point automated clearance verification (≥ ₹50,000 threshold).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Close Modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Alerts */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
              <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Pre-Registration Form */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Pre-Register New Cheque Confirmation (Drawer Bank Portal)</span>
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
                className="text-[11px] text-brand-600 hover:text-brand-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh Registry</span>
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
