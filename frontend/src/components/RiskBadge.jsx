import React, { useState, useEffect } from "react";

export default function RiskBadge({ score = 0, tier = "LOW", factors = [] }) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") setShowModal(false);
    }
    if (showModal) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [showModal]);

  const colors = {
    LOW: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    HIGH: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
  };

  const pillColor = colors[tier] || colors.LOW;

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${pillColor}`}
        title="View risk breakdown"
      >
        <span>Risk: {Math.round(score)}/100</span>
        <span className="font-semibold ml-1">({tier})</span>
      </button>

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-100 animate-in fade-in zoom-in duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Risk Assessment</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="my-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div>
                <div className="text-xs text-gray-500 font-medium">Composite Score</div>
                <div className="text-2xl font-bold text-gray-900">{Math.round(score)} / 100</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${pillColor}`}>
                {tier} RISK
              </div>
            </div>

            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Contributing Risk Factors
              </div>
              {factors && factors.length > 0 ? (
                factors.map((f, i) => (
                  <div key={i} className="flex items-start justify-between p-2.5 rounded bg-gray-50 border border-gray-100 text-xs">
                    <div>
                      <div className="font-medium text-gray-800">{f.code}</div>
                      <div className="text-gray-500 text-[11px] mt-0.5">{f.description}</div>
                    </div>
                    <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 shrink-0 ml-2">
                      +{f.points} pts
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded text-center">
                  <span>No anomalous risk factors detected. Standard baseline parameters.</span>
                </div>
              )}
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
