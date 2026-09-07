import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import logo from "../assets/logo.jpg";
import PositivePayRegistryModal from "./PositivePayRegistryModal";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [systemHealthy, setSystemHealthy] = useState(true);
  const [chaosActive, setChaosActive] = useState(false);
  const [showPpsModal, setShowPpsModal] = useState(false);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await client.get("/devops/chaos");
        setChaosActive(res.data?.enabled);
        setSystemHealthy(true);
      } catch (err) {
        setSystemHealthy(false);
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <>
      <nav className="bg-brand-700 text-white px-6 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 rounded-full blur-[2px] opacity-70 group-hover:opacity-100 transition duration-300"></div>
              <img
                src={logo}
                alt="CTS Logo"
                className="relative w-9 h-9 rounded-full object-cover border border-white/40 shadow-sm"
              />
            </div>
            <div className="flex flex-col">
              <div className="font-bold tracking-tight text-base leading-none flex items-center gap-2">
                <span>CTS</span>
                <span className="text-xs font-light text-brand-300 hidden md:inline">|</span>
                <span className="text-xs font-medium text-brand-100 hidden md:inline tracking-normal">
                  Cheque Truncation System
                </span>
              </div>
              <span className="text-[10px] text-brand-200/90 font-mono tracking-wider uppercase mt-0.5 hidden sm:block">
                Interbank Clearing & SRE
              </span>
            </div>
          </div>

          {/* Live System SRE Status Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-brand-800/80 border border-brand-600">
            <span
              className={`w-2 h-2 rounded-full ${
                !systemHealthy ? "bg-rose-400" : chaosActive ? "bg-amber-400 animate-ping" : "bg-emerald-400"
              }`}
            ></span>
            <span className="text-brand-100">
              {!systemHealthy ? "Service Degraded" : chaosActive ? "Chaos Active" : "99.9% SLO Active"}
            </span>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-3 text-sm">
            {/* Positive Pay System Action */}
            <button
              type="button"
              onClick={() => setShowPpsModal(true)}
              className="bg-brand-800 hover:bg-brand-900 border border-brand-600 text-amber-300 hover:text-amber-200 px-2.5 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Open Positive Pay System Central Registry"
            >
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="hidden sm:inline">Positive Pay (PPS)</span>
            </button>

            <span className="text-xs sm:text-sm">
              {user.name} · {user.bank?.name} ·{" "}
              <span className="uppercase text-brand-200 font-semibold text-xs bg-brand-800 px-2 py-0.5 rounded">
                {user.role}
              </span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="bg-brand-600 hover:bg-brand-500 px-3 py-1 rounded text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      {showPpsModal && (
        <PositivePayRegistryModal onClose={() => setShowPpsModal(false)} />
      )}
    </>
  );
}
