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
    try {
      const { data } = await client.get("/cheques");
      setCheques(data);
    } catch (err) {
      console.error("Failed to load cheques:", err);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useClearingEvents(() => {
    load();
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Navbar />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("batch")}
            className={`py-3.5 px-6 font-semibold text-sm transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === "batch"
                ? "border-brand-600 text-brand-700 bg-brand-50/60 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`}
          >
            Batch Ingestion (CSV)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("single")}
            className={`py-3.5 px-6 font-semibold text-sm transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === "single"
                ? "border-brand-600 text-brand-700 bg-brand-50/60 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`}
          >
            Single Instrument Presentation
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "batch" ? (
          <BulkBatchUploadPanel onBatchIngested={() => load()} />
        ) : (
          <ChequeUploadForm onCreated={() => load()} />
        )}

        {/* Clearing Status Table */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold text-xl text-slate-900 tracking-tight">
              Cheques Presented in Clearing
            </h2>
            <span className="text-xs font-mono font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
              Total Presented: {cheques.length} instruments
            </span>
          </div>
          <ClearingStatusTable cheques={cheques} />
        </div>
      </div>
    </div>
  );
}
