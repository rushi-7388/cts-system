import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ChequeUploadForm from "../components/ChequeUploadForm";
import BulkBatchUploadPanel from "../components/BulkBatchUploadPanel";
import ClearingStatusTable from "../components/ClearingStatusTable";
import { useClearingEvents } from "../hooks/useClearingEvents";
import client from "../api/client";

export default function PresentingBankDashboard() {
  const [cheques, setCheques] = useState([]);
  const [activeTab, setActiveTab] = useState("batch"); // "batch" or "single"

  async function load() {
    const { data } = await client.get("/cheques");
    setCheques(data);
  }

  useEffect(() => {
    load();
  }, []);

  useClearingEvents(() => {
    load();
  });

  return (
    <div>
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Tab Switcher: Single Cheque Capture vs High-Speed Branch Batch Scanner */}
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab("batch")}
            className={`pb-3 px-4 font-bold text-xs transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "batch"
                ? "border-brand-600 text-brand-700 bg-brand-50/40 rounded-t-lg"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <span>⚡</span>
            <span>High-Throughput Branch Batch Scanner (ZIP / CSV)</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-mono">
              300 DPM
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("single")}
            className={`pb-3 px-4 font-bold text-xs transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "single"
                ? "border-brand-600 text-brand-700 bg-brand-50/40 rounded-t-lg"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <span>📄</span>
            <span>Single Cheque Capture & AI OCR</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "batch" ? (
          <BulkBatchUploadPanel onBatchIngested={() => load()} />
        ) : (
          <ChequeUploadForm onCreated={() => load()} />
        )}

        {/* Clearing Status Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg text-gray-900">Cheques Presented in Clearing</h2>
            <span className="text-xs font-mono text-gray-500">
              Total Presented: {cheques.length} instruments
            </span>
          </div>
          <ClearingStatusTable cheques={cheques} />
        </div>
      </div>
    </div>
  );
}
