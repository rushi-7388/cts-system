import React, { useState, useEffect } from "react";
import client from "../api/client";

export default function ISO20022Modal({ settlementId, chequeId, onClose }) {
  const [xml, setXml] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchXml() {
      try {
        const url = settlementId
          ? `/settlements/${settlementId}/iso20022`
          : `/cheques/${chequeId}/iso20022`;
        const res = await client.get(url);
        setXml(res.data);
      } catch (err) {
        setXml(`<Error>Failed to load ISO 20022 message: ${err.message}</Error>`);
      } finally {
        setLoading(false);
      }
    }
    fetchXml();
  }, [settlementId, chequeId]);

  function handleCopy() {
    navigator.clipboard.writeText(xml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handleDownload() {
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = settlementId ? `pacs.008.001.10-settlement-${settlementId.slice(0, 8)}.xml` : `pacs.002-cheque-${chequeId.slice(0, 8)}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-sm">
                ISO 20022 Standard Financial Message
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {settlementId ? "pacs.008.001.10" : "pacs.002.001.12"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Financial Institutional Customer Credit Transfer & Clearing Specifications
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <span>Copy XML</span>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Download .xml
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg ml-2 flex items-center justify-center"
              title="Close XML Viewer"
              aria-label="Close XML Viewer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 bg-gray-950 overflow-auto text-emerald-400 font-mono text-xs leading-relaxed">
          {loading ? (
            <div className="text-gray-500 py-12 text-center">Generating ISO 20022 XML document...</div>
          ) : (
            <pre className="whitespace-pre-wrap select-all">{xml}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
