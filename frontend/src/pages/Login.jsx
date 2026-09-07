import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.jpg";

const ROLE_HOME = {
  PRESENTING_BANK: "/presenting",
  DRAWEE_BANK: "/drawee",
  ADMIN: "/admin",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(ROLE_HOME[user.role] || "/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-sm border border-gray-100">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 rounded-2xl blur-[3px] opacity-70"></div>
            <img
              src={logo}
              alt="CTS Cheque Truncation System"
              className="relative w-16 h-16 rounded-2xl object-cover shadow-md border border-white/60"
            />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">CTS Portal</h1>
          <p className="text-xs text-gray-500 mt-0.5">Interbank Cheque Truncation & SRE Clearing</p>
        </div>

        {error && <div className="bg-red-50 text-red-700 text-sm rounded p-2 mb-4">{error}</div>}

        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4 text-sm"
          placeholder="presenting@snb.com"
          required
        />

        <label className="block text-sm mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-6 text-sm"
          placeholder="password123"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div className="text-xs text-gray-400 mt-4 leading-relaxed">
          Demo accounts (password123):<br />
          presenting@snb.com · drawee@hdb.com · admin@cts.com
        </div>
      </form>
    </div>
  );
}
