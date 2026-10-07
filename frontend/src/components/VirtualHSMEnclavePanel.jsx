import React, { useState, useEffect } from "react";
import client from "../api/client";

export default function VirtualHSMEnclavePanel() {
  const [hsmData, setHsmData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pinInputs, setPinInputs] = useState({
    "CUST-RBI-01": "1122",
    "CUST-IDRBT-02": "3344",
    "CUST-NPCI-03": "5566",
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [zeroizeConfirm, setZeroizeConfirm] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await client.get("/hsm/status");
      setHsmData(res.data);
    } catch (err) {
      console.error("Failed to load HSM status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleInsertKey = async (custodianId) => {
    const pin = pinInputs[custodianId];
    if (!pin) {
      alert("Please enter custodian smart-card PIN");
      return;
    }
    try {
      setActionLoading(true);
      const res = await client.post("/hsm/ceremony/insert-key", { custodianId, pin });
      setHsmData(res.data.status);
    } catch (err) {
      alert(err.response?.data?.error || "Key authentication failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLockHsm = async () => {
    try {
      setActionLoading(true);
      const res = await client.post("/hsm/lock");
      setHsmData(res.data.status);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to lock HSM");
    } finally {
      setActionLoading(false);
    }
  };

  const handleZeroize = async () => {
    try {
      setActionLoading(true);
      const res = await client.post("/hsm/zeroize", {
        reason: "MANUAL_DISASTER_BREACH_TRIGGERED_FROM_WAR_ROOM",
      });
      setHsmData(res.data.hsmStatus);
      setZeroizeConfirm(false);
      alert("🚨 EMERGENCY TAMPER ZEROIZATION EXECUTED! Master keys overwritten with 0x00.");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to trigger zeroization");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReinitialize = async () => {
    try {
      setActionLoading(true);
      const res = await client.post("/hsm/reinitialize");
      setHsmData(res.data.status);
      alert("HSM Enclave factory rebooted and re-initialized.");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to reinitialize");
    } finally {
      setActionLoading(false);
    }
  };

  const isZeroized = hsmData?.status === "ZEROIZED";
  const isOperational = hsmData?.status === "UNLOCKED_OPERATIONAL";

  return (
    <div className="bg-slate-950 rounded-2xl border border-slate-800 text-white p-6 shadow-2xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-950 text-purple-300 border border-purple-800/60 mb-1">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            FIPS 140-2 Level 3 Hardware Security Module Enclave
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Virtual Cryptographic HSM & M-of-N Key Ceremony
          </h2>
          <p className="text-xs text-slate-400">
            Physical cryptographic isolation simulating IDRBT/NPCI clearing switches. Master keys cannot be exported in plaintext.
          </p>
        </div>

        {/* State Badge & Main Actions */}
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border flex items-center gap-2 ${
              isZeroized
                ? "bg-rose-950 text-rose-300 border-rose-800 animate-bounce"
                : isOperational
                ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                : "bg-amber-950 text-amber-300 border-amber-800"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isZeroized ? "bg-rose-400" : isOperational ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
            {hsmData?.status || "INITIALIZING"}
          </span>

          {isOperational && (
            <button
              type="button"
              onClick={handleLockHsm}
              disabled={actionLoading}
              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              🔒 Lock Switch Enclave
            </button>
          )}

          {isZeroized && (
            <button
              type="button"
              onClick={handleReinitialize}
              disabled={actionLoading}
              className="px-3 py-1.5 rounded-xl border border-cyan-800 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-xs font-bold cursor-pointer"
            >
              ↺ Factory Cold Reboot
            </button>
          )}
        </div>
      </div>

      {/* Quorum & Master Key Fingerprint Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">M-of-N Custodian Quorum</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-mono font-extrabold text-white">
              {hsmData?.quorum?.currentInserted || 0} / {hsmData?.quorum?.required || 2}
            </span>
            <span className="text-[11px] text-slate-400">
              (Requires {hsmData?.quorum?.required} of {hsmData?.quorum?.total} Custodians)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full transition-all duration-300 ${
                isOperational ? "bg-emerald-500" : "bg-amber-500"
              }`}
              style={{
                width: `${Math.min(
                  100,
                  ((hsmData?.quorum?.currentInserted || 0) / (hsmData?.quorum?.required || 2)) * 100
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Master Clearing Key (MCK) Digest</span>
          <div className="font-mono text-xs font-bold text-cyan-300 break-all">
            {hsmData?.masterKeyDigest || "ENCRYPTED_IN_SHAMIR_VAULT (LOCKED)"}
          </div>
          <p className="text-[10px] text-slate-500">
            FIPS Rule: Plaintext material isolated to tamper-responsive volatile RAM.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Firmware & Certification</span>
          <div className="font-mono text-xs font-bold text-emerald-400">
            {hsmData?.firmwareRevision || "v4.2.8-PROD"}
          </div>
          <p className="text-[10px] text-slate-400 truncate">
            {hsmData?.fipsCompliance || "FIPS 140-2 Level 3 Certified"}
          </p>
        </div>
      </div>

      {/* Custodian Smart Card Key Ceremony Deck */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Authorized Central Custodian Smart-Card Slots (Split Secrets)
          </h3>
          <span className="text-[11px] text-slate-400">
            Morning Switch Authorization Protocol (RBI/IDRBT)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hsmData?.custodians?.map((custodian) => (
            <div
              key={custodian.id}
              className={`p-4 rounded-xl border space-y-3 transition-all ${
                custodian.isInserted
                  ? "bg-slate-900/90 border-emerald-500/60 shadow-lg shadow-emerald-950/20"
                  : "bg-slate-900/50 border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      custodian.isInserted ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-slate-600"
                    }`}
                  />
                  <span className="font-mono font-bold text-xs text-white">{custodian.slot}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{custodian.smartCardSerial}</span>
              </div>

              <div>
                <h4 className="font-bold text-xs text-white">{custodian.name}</h4>
                <p className="text-[11px] text-slate-400">{custodian.title}</p>
              </div>

              {custodian.isInserted ? (
                <div className="bg-emerald-950/60 border border-emerald-800/80 p-2.5 rounded-lg text-[11px] font-mono text-emerald-300 flex items-center justify-between">
                  <span>✓ TOKEN INSERTED</span>
                  <span className="text-[10px] text-emerald-400">
                    {new Date(custodian.authenticatedAt).toLocaleTimeString()}
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      placeholder="Card PIN"
                      value={pinInputs[custodian.id] || ""}
                      onChange={(e) =>
                        setPinInputs({ ...pinInputs, [custodian.id]: e.target.value })
                      }
                      disabled={isZeroized || actionLoading}
                      className="w-full bg-slate-950 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-mono text-white focus:outline-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleInsertKey(custodian.id)}
                      disabled={isZeroized || actionLoading}
                      className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      Insert Token
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Physical Tamper Sensors & Chassis Breach Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-800/80 pt-4">
        {/* Tamper Sensor Telemetry */}
        <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Enclave Physical Chassis Tamper Sensor Mesh
            </span>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                isZeroized ? "bg-rose-950 text-rose-300 border border-rose-800" : "bg-emerald-950 text-emerald-300 border border-emerald-800"
              }`}
            >
              {isZeroized ? "CHASSIS BREACHED" : "SENSORS ARMED"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Mesh Continuity:</span>
              <span className={isZeroized ? "text-rose-400 font-bold" : "text-emerald-400"}>
                {hsmData?.tamperSensors?.physicalMeshContinuity || "INTACT"}
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Voltage Differential:</span>
              <span className={isZeroized ? "text-rose-400 font-bold" : "text-emerald-400"}>
                {hsmData?.tamperSensors?.voltageDifferential || "NOMINAL"}
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Internal Temp:</span>
              <span className={isZeroized ? "text-rose-400 font-bold" : "text-emerald-400"}>
                {hsmData?.tamperSensors?.internalTemperatureCelsius || 34.2}°C
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Chassis Interlock:</span>
              <span className={isZeroized ? "text-rose-400 font-bold" : "text-emerald-400"}>
                {hsmData?.tamperSensors?.chassisInterlockSwitch || "CLOSED"}
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-500 block">Photon Light Sensor:</span>
              <span className={isZeroized ? "text-rose-400 font-bold" : "text-emerald-400"}>
                {hsmData?.tamperSensors?.passiveLightSensor || "DARK"}
              </span>
            </div>
          </div>
        </div>

        {/* Emergency Disaster Zeroization Button */}
        <div className="bg-rose-950/30 border border-rose-900/60 p-4 rounded-xl flex flex-col justify-between space-y-3">
          <div>
            <div className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚠️ Tamper-Reactive Zeroization</span>
            </div>
            <p className="text-[11px] text-rose-300/80 mt-1 leading-relaxed">
              Disaster Protocol: Instantly flushes master cryptographic keys with 0x00 and isolates national clearing switches.
            </p>
          </div>

          {!zeroizeConfirm ? (
            <button
              type="button"
              onClick={() => setZeroizeConfirm(true)}
              disabled={isZeroized || actionLoading}
              className="w-full py-2.5 bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950 transition-all cursor-pointer disabled:opacity-40"
            >
              Trigger Chassis Breach (Zeroize)
            </button>
          ) : (
            <div className="space-y-2">
              <div className="text-[10px] text-rose-400 font-mono text-center font-bold">
                CONFIRM PHYSICAL ZEROIZATION?
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setZeroizeConfirm(false)}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleZeroize}
                  disabled={actionLoading}
                  className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg animate-pulse"
                >
                  CONFIRM DESTROY
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
