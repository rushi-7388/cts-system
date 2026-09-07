import React, { useState } from "react";

export default function RiskBadge({ score = 0, tier = "LOW", factors = [] }) {
  const [showModal, setShowModal] = useState(false);

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
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${pillColor}`}
        title="Click to view algorithmic risk assessment breakdown"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        <span>Risk: {Math.round(score)}/100</span>
        <span className="font-semibold">({tier})</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Algorithmic Risk Assessment</h3>
                <p className="text-xs text-gray-500">CTS Dynamic Fraud Scoring Engine</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg flex items-center justify-center cursor-pointer"
                title="Close"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
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
                <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded text-center flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
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
