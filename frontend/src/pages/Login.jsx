import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.jpg";

const ROLE_HOME = {
  PRESENTING_BANK: "/presenting",
  DRAWEE_BANK: "/drawee",
  ADMIN: "/admin",
  BRANCH_MANAGER: "/branch-manager",
  IT_STAFF: "/it-monitoring",
  COMPLIANCE_AUDITOR: "/auditor",
  SETTLEMENT_OFFICER: "/settlement",
};

const DEMO_PERSONAS = [
  {
    roleKey: "PRESENTING_BANK",
    title: "Presenting Bank Clerk",
    bank: "Surat Bank (SNB)",
    code: "SNB-C",
    email: "presenting@snb.com",
    badge: "Branch Ops",
    accent: "brand",
    description: "Instrument capture, OCR extraction, and Positive Pay verification.",
    targetRoute: "/presenting",
  },
  {
    roleKey: "DRAWEE_MAKER",
    title: "Drawee Bank Verifier (Maker)",
    bank: "Horizon Digital Bank (HDB)",
    code: "HDB-M",
    email: "drawee@hdb.com",
    badge: "Inward Maker",
    accent: "sky",
    description: "Inward instrument verification, forensic scrutiny, and maker sign-off.",
    targetRoute: "/drawee",
  },
  {
    roleKey: "DRAWEE_CHECKER",
    title: "Senior Approver (Checker)",
    bank: "Horizon Digital Bank (HDB)",
    code: "HDB-C",
    email: "checker@hdb.com",
    badge: "Dual Auth",
    accent: "amber",
    description: "Four-Eyes Principle approval on instruments exceeding threshold or flagged risk.",
    targetRoute: "/drawee",
  },
  {
    roleKey: "ADMIN",
    title: "Clearing House Administrator",
    bank: "National Clearing House (CTS)",
    code: "CTS-A",
    email: "admin@cts.com",
    badge: "Central Switch",
    accent: "emerald",
    description: "Continuous clearing session management, e-Kuber settlement, and telemetry.",
    targetRoute: "/admin",
  },
  {
    roleKey: "BRANCH_MANAGER",
    title: "Branch Operations Manager",
    bank: "Surat Bank (Athwa Branch)",
    code: "SNB-MGR",
    email: "manager@snb.com",
    badge: "Branch Mgr",
    accent: "indigo",
    description: "Branch batch oversight, teller limits, and high-value counter-signature.",
    targetRoute: "/branch-manager",
  },
  {
    roleKey: "IT_STAFF",
    title: "Core SRE & IT Staff",
    bank: "CTS Core Switch Infrastructure",
    code: "CTS-SRE",
    email: "itops@cts.com",
    badge: "Core SRE",
    accent: "emerald",
    description: "Core switch telemetry, Prometheus metrics, chaos engineering & latency.",
    targetRoute: "/it-monitoring",
  },
  {
    roleKey: "COMPLIANCE_AUDITOR",
    title: "Compliance & Audit Officer",
    bank: "Regulatory Oversight Wing (RBI)",
    code: "RBI-AUD",
    email: "auditor@rbi.org.in",
    badge: "Auditor",
    accent: "amber",
    description: "Cryptographic SHA-256 ledger integrity, Positive Pay & fraud audit.",
    targetRoute: "/auditor",
  },
  {
    roleKey: "SETTLEMENT_OFFICER",
    title: "Settlement & Treasury Officer",
    bank: "National Treasury Settlement Desk",
    code: "CTS-TRS",
    email: "treasury@cts.com",
    badge: "Treasury",
    accent: "cyan",
    description: "Multilateral Net Settlement (MNS) & RBI e-Kuber continuous T+0 clearing.",
    targetRoute: "/settlement",
  },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login"); // "login" | "personas"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickLoadingEmail, setQuickLoadingEmail] = useState(null);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-IN", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setCurrentTime(timeStr);
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  async function performLogin(targetEmail, targetPassword, targetRoute) {
    setError("");
    try {
      const user = await login(targetEmail, targetPassword);
      const destination = targetRoute || ROLE_HOME[user.role] || "/";
      navigate(destination);
    } catch (err) {
      console.error("Login failed:", err);
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (err.code === "ERR_NETWORK"
          ? "Unable to connect to CTS backend server. Verify service status."
          : "Invalid email or password. Please verify credentials.");
      setError(message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await performLogin(email, password);
    setLoading(false);
  }

  async function handleQuickLogin(persona) {
    setEmail(persona.email);
    setPassword("password123");
    setQuickLoadingEmail(persona.email);
    await performLogin(persona.email, "password123", persona.targetRoute);
    setQuickLoadingEmail(null);
  }


  return (
    <div className="fixed inset-0 flex flex-col justify-between bg-[#080c14] text-slate-100 overflow-y-auto lg:overflow-hidden select-none">
      {/* Background Decorative Mesh & Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-brand-600/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-emerald-600/8 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 px-5 sm:px-8 py-3 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="CTS Emblem"
            className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700/80 shadow-md shadow-brand-950/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-base">CTS</span>
              <span className="text-slate-600 text-xs">|</span>
              <span className="text-xs font-semibold text-slate-200 tracking-wide">
                Cheque Truncation System
              </span>
              <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-brand-950/80 border border-brand-800/70 text-brand-300">
                CTS-2010
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
              National Interbank Clearing Gateway
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Real-time System Telemetry & Clock */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-950/50 border border-emerald-800/60 text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="font-mono">{currentTime || "ONLINE"} IST</span>
            <span className="text-emerald-700">·</span>
            <span className="text-[10px] uppercase tracking-wider text-emerald-400/90 font-mono">
              Switch 01
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400 border-l border-slate-800 pl-3">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
              ISO 20022
            </span>
            <span className="text-[11px] text-slate-500">256-bit TLS</span>
          </div>
        </div>
      </header>

      {/* Main Viewport Content: Unified Single Card */}
      <main className="relative z-10 flex-1 min-h-0 flex items-center justify-center p-4 sm:p-6 lg:px-8">
        <div className="w-full max-w-5xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl shadow-black/80 backdrop-blur-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 md:min-h-[540px]">
          {/* Left Side: Sign In Form */}
          <div className="md:col-span-7 flex flex-col justify-between">
              {/* Card Mode Tabs */}
              <div className="border-b border-slate-800 bg-slate-950/60">
                <div
                  className="py-3.5 px-6 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 border-brand-500 text-white bg-slate-900/90 shadow-sm"
                >
                  <svg className="w-3.5 h-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Sign In</span>
                </div>

                {/* Express Roles (Simulation) Tab Button - Commented out as requested
                <button
                  type="button"
                  onClick={() => setActiveTab("personas")}
                  className={`py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                    activeTab === "personas"
                      ? "border-brand-500 text-white bg-slate-900/90 shadow-sm"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Express Roles (Simulation)</span>
                </button>
                */}
              </div>

              {/* Tab 1: Operator Sign In Form */}
              {activeTab === "login" && (
                <div className="p-6 sm:p-8 lg:p-10 space-y-5 flex-1 flex flex-col justify-center">
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center justify-between">
                      <span>Authentication</span>
                    </h3>
                    
                  </div>


                  {error && (
                    <div className="bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs rounded-xl p-3.5 flex items-start gap-2.5">
                      <svg className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="leading-snug">{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Bank ID / Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none font-mono transition-colors"
                          placeholder="presenting@snb.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-slate-300">
                         Password
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none font-mono transition-colors"
                          placeholder="••••••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
                          tabIndex={-1}
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberTerminal}
                          onChange={(e) => setRememberTerminal(e.target.checked)}
                          className="rounded bg-slate-800 border-slate-700 text-brand-600 focus:ring-0 cursor-pointer"
                        />
                        <span>Remember Workstation Terminal</span>
                      </label>
                      
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-semibold rounded-xl py-2.5 text-xs transition-all shadow-lg shadow-brand-950/40 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          <span>Authenticating with Clearing Gateway...</span>
                        </>
                      ) : (
                        <>
                          <span>Authenticate & Access Platform</span>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 2: Express Role Launcher (Simulation / Audit) - Commented out as requested
              {activeTab === "personas" && (
                <div className="p-5 sm:p-6 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-white">Select Simulation Role</h3>
                      <p className="text-[11px] text-slate-400">
                        Launch directly into authorized banking portal roles:
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800 text-amber-300">
                      Audit Bench
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-1">
                    {DEMO_PERSONAS.map((persona) => {
                      const isCurrentQuick = quickLoadingEmail === persona.email;
                      return (
                        <button
                          key={persona.roleKey}
                          type="button"
                          onClick={() => handleQuickLogin(persona)}
                          disabled={loading || quickLoadingEmail !== null}
                          className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 text-left transition-all group flex flex-col justify-between cursor-pointer disabled:opacity-50"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-medium text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                                {persona.badge}
                              </span>
                              <span className="text-[10px] font-semibold text-brand-400 group-hover:text-brand-300 flex items-center gap-0.5">
                                {isCurrentQuick ? (
                                  "Launching..."
                                ) : (
                                  <>
                                    <span>Launch</span>
                                    <span>→</span>
                                  </>
                                )}
                              </span>
                            </div>
                            <div className="font-bold text-xs text-white group-hover:text-brand-200 transition-colors">
                              {persona.title}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                              {persona.bank}
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-2 leading-relaxed border-t border-slate-900 pt-1.5">
                            {persona.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              */}

          </div>

          {/* Right Side of the Same Card: CTS Emblem & Institutional Showcase */}
          <div className="md:col-span-5 bg-slate-950/70 border-t md:border-t-0 md:border-l border-slate-800/80 p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            {/* Ambient Backlight Glow */}
            <div className="absolute w-44 h-44 rounded-full bg-brand-500/15 blur-3xl pointer-events-none -top-10 -right-10" />
            <div className="absolute w-36 h-36 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none -bottom-10 -left-10" />

            {/* Emblem Image */}
            <div className="relative mb-3.5">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-brand-500/30 via-emerald-500/30 to-brand-500/30 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition duration-500" />
              <img
                src={logo}
                alt="CTS Cheque Truncation System Emblem"
                className="relative w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-xl ring-1 ring-white/20 shadow-xl shadow-black/80 transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Branding Text */}
            <h3 className="text-lg font-extrabold text-white tracking-tight">
              Cheque Truncation System
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              National Interbank Clearing Corporation of India
            </p>

            {/* Compliance Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3.5 text-[9px] font-mono">
              <span className="px-2 py-0.5 rounded bg-brand-950/80 border border-brand-800/70 text-brand-300">
                NPCI CTS-2010
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/70 text-emerald-300">
                ISO 20022 MX
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                e-Kuber T+0
              </span>
            </div>

            {/* Core Switch Active Status */}
            <div className="inline-flex items-center gap-1.5 mt-4 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              <span>Central Clearing Switch Active</span>
            </div>
          </div>
        </div>
      </main>

      {/* Institutional Legal & Regulatory Footer */}
      <footer className="relative z-10 px-5 sm:px-8 py-2 border-t border-slate-800/80 text-[11px] text-slate-500 bg-slate-900/60 backdrop-blur-sm flex-shrink-0 flex flex-wrap items-center justify-between gap-2">
        <span>Cheque Truncation System (CTS) · National Clearing Gateway</span>
        <div className="flex items-center gap-2 sm:gap-3 text-[10px] font-mono text-slate-400">
          <span>SHA-256 Ledger</span>
          <span>•</span>
          <span>ISO 20022 XML</span>
          <span>•</span>
          <span>RBI Continuous Clearing Directive</span>
        </div>
      </footer>
    </div>
  );
}
