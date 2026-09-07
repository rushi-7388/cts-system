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

function StatCard({ label, value, subtext, color, icon, pulse }) {
  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 p-4 relative overflow-hidden transition-all hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</div>
          <div className={`text-2xl font-black mt-1 tracking-tight ${color || "text-gray-900"}`}>{value}</div>
          {subtext && <div className="text-[11px] text-gray-400 mt-0.5">{subtext}</div>}
        </div>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${pulse ? "animate-pulse" : ""} ${color ? "bg-opacity-10" : "bg-gray-100"}`}>
          {icon}
        </div>
      </div>
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
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Inward Clearing & Verification Workbench
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                <span>🏛️</span>
                <span>Horizon Digital Bank (HDFC0005678)</span>
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Drawee Cheque Scrutiny Desk · CTS-2010 Compliance · AI Biometric Specimen Signatures · Real-Time e-Kuber Settlement
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-gray-500">Logged Officer:</span>
              <span className="font-bold text-gray-900">{user?.name || "Drawee Verifier"}</span>
              <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                {user?.role === "DRAWEE_BANK" ? "DRA плевое / VERIFIER" : user?.role}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs font-bold text-blue-800 flex items-center gap-1.5">
              <span>⚡</span>
              <span>e-Kuber Continuous T+0 Active</span>
            </div>
          </div>
        </div>

        {/* 5 Executive KPI Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <StatCard
            label="Action Required"
            value={metrics.actionNeededCount}
            subtext="Needs Verification"
            color="text-amber-600"
            icon="⚡"
            pulse={metrics.actionNeededCount > 0}
          />
          <StatCard
            label="Awaiting Checker"
            value={metrics.awaitingCheckerCount}
            subtext="4-Eyes Dual Sign-Off"
            color="text-purple-600"
            icon="🛡️"
            pulse={metrics.awaitingCheckerCount > 0}
          />
          <StatCard
            label="Real-Time Settled"
            value={metrics.clearedCount}
            subtext="e-Kuber UTR Assigned"
            color="text-emerald-600"
            icon="🏛️"
          />
          <StatCard
            label="Returned / Dishonoured"
            value={metrics.returnedCount}
            subtext="Section 138 Memos"
            color="text-rose-600"
            icon="❌"
          />
          <StatCard
            label="Inward Exposure"
            value={`₹${(metrics.pendingExposure / 100000).toFixed(2)}L`}
            subtext="Pending Clearing INR"
            color="text-gray-900"
            icon="💰"
          />
        </div>

        {/* Smart Workflow Toolbar & Filter Deck */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("action_needed")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "action_needed"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>⚡ Action Needed</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "action_needed" ? "bg-amber-800 text-white" : "bg-gray-200 text-gray-700"
              }`}>
                {metrics.actionNeededCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("awaiting_checker")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "awaiting_checker"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>🛡️ Awaiting Checker</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "awaiting_checker" ? "bg-purple-800 text-white" : "bg-gray-200 text-gray-700"
              }`}>
                {metrics.awaitingCheckerCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "all"
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>📋 All Inward</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "all" ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-700"
              }`}>
                {metrics.total}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("cleared")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "cleared"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>✅ Cleared / Settled</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "cleared" ? "bg-emerald-800 text-white" : "bg-gray-200 text-gray-700"
              }`}>
                {metrics.clearedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("returned")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "returned"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>❌ Returned</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "returned" ? "bg-rose-800 text-white" : "bg-gray-200 text-gray-700"
              }`}>
                {metrics.returnedCount}
              </span>
            </button>
          </div>

          {/* Search Input & View Switcher */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[220px]">
              <input
                type="text"
                placeholder="Search Cheque #, Payee, Amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 pl-8"
              />
              <span className="absolute left-2.5 top-2 text-gray-400 text-xs">🔍</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1.5 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* View Mode Switcher */}
            <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 border border-gray-200 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === "cards"
                    ? "bg-white text-purple-800 shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                title="Cards Workbench: zero horizontal scrolling, direct 3-button action deck"
              >
                <span>🗂️</span>
                <span>Cards View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-purple-800 shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                title="Table Queue: traditional grid with sticky action column"
              >
                <span>📊</span>
                <span>Table View</span>
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
            <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-2xl mx-auto">
              ✓
            </div>
            <h3 className="text-base font-bold text-gray-900">No Instruments in this Queue</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              {activeTab === "action_needed"
                ? "All presented inward instruments have been verified and processed. Great job!"
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
            <div className="text-xs text-gray-500 flex items-center gap-1.5 px-1">
              <span>💡</span>
              <span>
                <strong>Table View Notice:</strong> The Verification Action column is pinned (sticky) to the right edge with a solid backdrop so the 3 options are always visible on screen without scrolling.
              </span>
            </div>
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
