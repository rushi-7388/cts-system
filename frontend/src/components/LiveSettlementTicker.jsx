import React, { useEffect, useState } from "react";
import client from "../api/client";
import { useClearingEvents } from "../hooks/useClearingEvents";

export default function LiveSettlementTicker() {
  const [tickerData, setTickerData] = useState({
    clearedCount: 0,
    clearedVolume: 0,
    netPosition: 0,
    direction: "SLB → HDB",
  });
  const [pulse, setPulse] = useState(false);

  async function refreshTicker() {
    try {
      const res = await client.get("/admin/stats");
      const stats = res.data || {};
      const clearedCount = stats.byStatus?.CLEARED || 0;
      const clearedVolume = Number(stats.totalClearedAmount || 0);

      setTickerData({
        clearedCount,
        clearedVolume,
        netPosition: clearedVolume,
        direction: "Surat Bank ↔ Horizon Digital Bank",
      });
      setPulse(true);
      setTimeout(() => setPulse(false), 2000);
    } catch (err) {
      // Non-blocking ticker fetch
    }
  }

  useEffect(() => {
    refreshTicker();
  }, []);

  useClearingEvents(() => {
    refreshTicker();
  });

  return (
    <div className="bg-slate-950 text-white px-4 sm:px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 shadow-inner">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>

        <div className={`transition-all duration-300 font-mono ${pulse ? "text-emerald-400 scale-102" : "text-slate-300"}`}>
          Cleared Volume: <span className="font-bold text-white">₹{tickerData.clearedVolume.toLocaleString("en-IN")}</span>{" "}
          <span className="text-slate-400 text-[11px]">({tickerData.clearedCount} instruments)</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
        <span className="text-slate-400 hidden lg:inline">
          Bilateral Corridor: <span className="text-brand-300 font-semibold">{tickerData.direction}</span>
        </span>
      </div>
    </div>
  );
}

