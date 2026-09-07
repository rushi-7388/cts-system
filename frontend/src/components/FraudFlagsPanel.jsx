import React, { useEffect, useState } from "react";
import client from "../api/client";

const SEVERITY_STYLES = {
  HIGH: "bg-red-100 text-red-800",
  MEDIUM: "bg-orange-100 text-orange-800",
  LOW: "bg-yellow-100 text-yellow-800",
};

export default function FraudFlagsPanel() {
  const [flags, setFlags] = useState([]);
  const [showResolved, setShowResolved] = useState(false);

  async function load() {
    const { data } = await client.get("/admin/fraud-flags", {
      params: showResolved ? {} : { resolved: "false" },
    });
    setFlags(data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResolved]);

  async function resolve(id) {
    await client.patch(`/admin/fraud-flags/${id}/resolve`);
    load();
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Fraud flags</h2>
        <label className="text-xs flex items-center gap-2 text-gray-500">
          <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} />
          Show resolved
        </label>
      </div>

      {flags.length === 0 ? (
        <div className="text-sm text-gray-500">No {showResolved ? "" : "unresolved "}fraud flags.</div>
      ) : (
        <div className="space-y-3">
          {flags.map((f) => (
            <div key={f.id} className="border rounded-lg p-3 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${SEVERITY_STYLES[f.severity]}`}>
                    {f.severity}
                  </span>
                  <span className="text-sm font-medium">{f.type.replace(/_/g, " ")}</span>
                  <span className="text-xs text-gray-400 font-mono">
                    cheque #{f.cheque.chequeNumber} · {f.cheque.presentingBank.name} → {f.cheque.draweeBank.name}
                  </span>
                </div>
                <div className="text-sm text-gray-600">{f.details}</div>
              </div>
              {!f.resolved && (
                <button
                  onClick={() => resolve(f.id)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded font-medium whitespace-nowrap"
                >
                  Mark resolved
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
