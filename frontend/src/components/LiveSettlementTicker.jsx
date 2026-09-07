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
      const stats = res.data;
      setTickerData({
        clearedCount: stats.byStatus.CLEARED,
        clearedVolume: Number(stats.totalClearedAmount || 0),
        netPosition: Number(stats.totalClearedAmount || 0),
        direction: "Surat Local Bank ↔ Horizon Digital Bank",
      });
      setPulse(true);
      setTimeout(() => setPulse(false), 2000);
    } catch (err) { }
  }

  useEffect(() => {
    refreshTicker();
  }, []);

  useClearingEvents(() => {
    refreshTicker();
  });

  return (
    <div className="bg-gray-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 shadow-inner">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold tracking-wider text-[11px] text-gray-300 uppercase">
            LIVE INTERBANK CTS CLEARING STREAM
          </span>
        </div>

        <span className="text-gray-600">|</span>

        <div className={`transition-all duration-300 font-mono ${pulse ? "text-emerald-400 scale-105" : "text-gray-300"}`}>
          Cleared Volume: <span className="font-bold text-white">₹{tickerData.clearedVolume.toLocaleString("en-IN")}</span> ({tickerData.clearedCount} cheques)
        </div>
      </div>

      <div className="flex items-center gap-4 font-mono text-[11px]">
        <span className="text-gray-400">
          Pair: <span className="text-brand-300">{tickerData.direction}</span>
        </span>
        <span className="bg-brand-950/80 border border-brand-800 text-brand-300 px-2.5 py-0.5 rounded-full font-semibold">
          Real-Time SSE Sync Active
        </span>
      </div>
    </div>
  );
}
