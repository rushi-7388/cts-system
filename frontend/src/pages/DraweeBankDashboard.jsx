import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import ClearingStatusTable from "../components/ClearingStatusTable";
import VerificationPanel from "../components/VerificationPanel";
import DraweeVerificationCard from "../components/DraweeVerificationCard";
import ChequeViewerModal from "../components/ChequeViewerModal";
import EKuberAdviceModal from "../components/EKuberAdviceModal";
import StatutoryReturnMemoModal from "../components/StatutoryReturnMemoModal";
import { useClearingEvents } from "../hooks/useClearingEvents";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";

function StatCard({ label, value, subtext, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 relative overflow-hidden transition-all shadow-xs">
      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
      <div className={`text-2xl font-bold mt-1 tracking-tight ${color || "text-slate-900"}`}>{value}</div>
      {subtext && <div className="text-[11px] text-slate-400 mt-0.5">{subtext}</div>}
    </div>
  );
}

export default function DraweeBankDashboard() {
  const { user } = useAuth();
  const [cheques, setCheques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("action_needed"); // "action_needed", "awaiting_checker", "all", "cleared", "returned"
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("cards"); // "cards" (Zero-scroll workbench) or "table" (Sticky actions table)

  // Interactive Modals
  const [viewerCheque, setViewerCheque] = useState(null);
  const [ekuberChequeId, setEkuberChequeId] = useState(null);
  const [returnMemoChequeId, setReturnMemoChequeId] = useState(null);

  async function load() {
    try {
      const { data } = await client.get("/cheques");
      setCheques(data);
    } catch (err) {
      console.error("Failed to load cheques:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useClearingEvents(() => {
    load();
  });

  // Calculate Key Operational Metrics
  const metrics = useMemo(() => {
    const actionNeeded = cheques.filter((c) => ["PRESENTED", "AWAITING_CHECKER"].includes(c.status));
    const awaitingChecker = cheques.filter((c) => c.status === "AWAITING_CHECKER");
    const cleared = cheques.filter((c) => c.status === "CLEARED");
    const returned = cheques.filter((c) => c.status === "RETURNED");
    const pendingExposure = actionNeeded.reduce((acc, c) => acc + Number(c.amount || 0), 0);

    return {
      total: cheques.length,
      actionNeededCount: actionNeeded.length,
      awaitingCheckerCount: awaitingChecker.length,
      clearedCount: cleared.length,
      returnedCount: returned.length,
      pendingExposure,
    };
  }, [cheques]);

  // Filter cheques based on active tab and search query
  const filteredCheques = useMemo(() => {
    return cheques.filter((c) => {
      // 1. Tab Filter
      if (activeTab === "action_needed" && !["PRESENTED", "AWAITING_CHECKER"].includes(c.status)) {
        return false;
      }
      if (activeTab === "awaiting_checker" && c.status !== "AWAITING_CHECKER") {
        return false;
      }
      if (activeTab === "cleared" && c.status !== "CLEARED") {
        return false;
      }
      if (activeTab === "returned" && c.status !== "RETURNED") {
        return false;
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchNumber = c.chequeNumber?.toLowerCase().includes(query);
        const matchPayee = c.payeeName?.toLowerCase().includes(query);
        const matchAmount = c.amount?.toString().includes(query);
        const matchBank = c.presentingBank?.name?.toLowerCase().includes(query);
        return matchNumber || matchPayee || matchAmount || matchBank;
      }

      return true;
    });
  }, [cheques, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Executive Header Banner */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Inward Clearing & Verification Workbench
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                Horizon Digital Bank (HDFC0005678)
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Drawee Scrutiny Desk · CTS-2010 Standards · e-Kuber Settlement
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-500">Officer:</span>
              <span className="font-semibold text-slate-900">{user?.name || "Drawee Verifier"}</span>
              <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200 uppercase">
                {user?.email === "checker@hdb.com" ? "Senior Approver (Checker)" : "Verifier (Maker)"}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-medium text-blue-800">
              e-Kuber T+0 Active
            </div>
          </div>
        </div>

        {/* 4-Eyes Governance Operational Banner */}
        {user?.email === "drawee@hdb.com" ? (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-indigo-950">Maker Mode (Initial Scrutiny):</span>
              <span className="text-indigo-800 ml-1">
                Verify cheque security and drawer signatures. Instruments exceeding ₹1,00,000 or with fraud risk route to the Senior Checker under Four-Eyes governance.
              </span>
            </div>
            <button
              type="button"
              onClick={() => client.post("/auth/login", { email: "checker@hdb.com", password: "password123" }).then(res => { localStorage.setItem("cts_token", res.data.token); localStorage.setItem("cts_user", JSON.stringify(res.data.user)); window.location.reload(); })}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors cursor-pointer"
            >
              Switch to Checker Mode →
            </button>
          </div>
        ) : user?.email === "checker@hdb.com" ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-amber-950">Senior Approver Mode (Checker):</span>
              <span className="text-amber-800 ml-1">
                Dual authorization authority. Review instruments awaiting senior approval to grant clearance or generate return memos.
              </span>
            </div>
            <button
              type="button"
              onClick={() => client.post("/auth/login", { email: "drawee@hdb.com", password: "password123" }).then(res => { localStorage.setItem("cts_token", res.data.token); localStorage.setItem("cts_user", JSON.stringify(res.data.user)); window.location.reload(); })}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors cursor-pointer"
            >
              Switch to Maker Mode →
            </button>
          </div>
        ) : null}

        {/* 5 KPI Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <StatCard
            label="Action Required"
            value={metrics.actionNeededCount}
            subtext="Needs Verification"
            color="text-amber-600"
          />
          <StatCard
            label="Awaiting Checker"
            value={metrics.awaitingCheckerCount}
            subtext="Four-Eyes Dual Sign-Off"
            color="text-purple-600"
          />
          <StatCard
            label="Settled"
            value={metrics.clearedCount}
            subtext="e-Kuber UTR Assigned"
            color="text-emerald-600"
          />
          <StatCard
            label="Returned"
            value={metrics.returnedCount}
            subtext="Dishonour Memos"
            color="text-rose-600"
          />
          <StatCard
            label="Pending Exposure"
            value={`₹${(metrics.pendingExposure / 100000).toFixed(2)}L`}
            subtext="Pending Clearing INR"
            color="text-slate-900"
          />
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("action_needed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "action_needed"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>Action Needed</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "action_needed" ? "bg-amber-800 text-white" : "bg-slate-200 text-slate-700"
              }`}>
                {metrics.actionNeededCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("awaiting_checker")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "awaiting_checker"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>Awaiting Checker</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "awaiting_checker" ? "bg-purple-800 text-white" : "bg-slate-200 text-slate-700"
              }`}>
                {metrics.awaitingCheckerCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>All Inward</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "all" ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-700"
              }`}>
                {metrics.total}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("cleared")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "cleared"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>Cleared</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "cleared" ? "bg-emerald-800 text-white" : "bg-slate-200 text-slate-700"
              }`}>
                {metrics.clearedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("returned")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "returned"
                  ? "bg-rose-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>Returned</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "returned" ? "bg-rose-800 text-white" : "bg-slate-200 text-slate-700"
              }`}>
                {metrics.returnedCount}
              </span>
            </button>
          </div>

          {/* Search Input & View Mode */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[200px]">
              <input
                type="text"
                placeholder="Search Cheque #, Payee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 pl-8"
              />
              <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* View Mode Switcher */}
            <div className="bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  viewMode === "cards"
                    ? "bg-white text-purple-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-purple-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-gray-200/80 text-gray-500">
            <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-semibold">Loading Inward Clearing Queue...</p>
          </div>
        ) : filteredCheques.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-xs space-y-3">
            <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900">No Instruments in this Queue</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              {activeTab === "action_needed"
                ? "All presented inward instruments have been verified and processed. Queue is clear."
                : "No cheques found matching the selected filter or search criteria."}
            </p>
            {activeTab !== "all" && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("all");
                  setSearchQuery("");
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                View All Inward Instruments
              </button>
            )}
          </div>
        ) : viewMode === "cards" ? (
          /* Zero-Scroll Workbench Cards Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCheques.map((c) => (
              <DraweeVerificationCard
                key={c.id}
                cheque={c}
                onInspect={(cheque) => setViewerCheque(cheque)}
                onViewEKuber={(id) => setEkuberChequeId(id)}
                onViewReturnMemo={(id) => setReturnMemoChequeId(id)}
                onUpdated={() => load()}
              />
            ))}
          </div>
        ) : (
          /* Table Queue with Sticky Right Action Column */
          <div className="space-y-2">
            <ClearingStatusTable
              cheques={filteredCheques}
              onUpdated={() => load()}
              renderActions={(cheque) => (
                <VerificationPanel cheque={cheque} onUpdated={() => load()} layout="compact" />
              )}
            />
          </div>
        )}
      </div>

      {/* Global Interactive Modals for Drawee Dashboard */}
      {viewerCheque && (
        <ChequeViewerModal
          cheque={viewerCheque}
          onClose={() => setViewerCheque(null)}
          onUpdated={() => load()}
        />
      )}

      {ekuberChequeId && (
        <EKuberAdviceModal
          chequeId={ekuberChequeId}
          onClose={() => setEkuberChequeId(null)}
        />
      )}

      {returnMemoChequeId && (
        <StatutoryReturnMemoModal
          chequeId={returnMemoChequeId}
          onClose={() => setReturnMemoChequeId(null)}
        />
      )}
    </div>
  );
}
