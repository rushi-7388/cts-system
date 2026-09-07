import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import PresentingBankDashboard from "./pages/PresentingBankDashboard";
import DraweeBankDashboard from "./pages/DraweeBankDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import LiveSettlementTicker from "./components/LiveSettlementTicker";
import LiveNotificationToast from "./components/LiveNotificationToast";

function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const roleHome = { PRESENTING_BANK: "/presenting", DRAWEE_BANK: "/drawee", ADMIN: "/admin" };
  return <Navigate to={roleHome[user.role] || "/login"} replace />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {user && <LiveSettlementTicker />}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/presenting"
            element={
              <ProtectedRoute roles={["PRESENTING_BANK", "ADMIN"]}>
                <PresentingBankDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/drawee"
            element={
              <ProtectedRoute roles={["DRAWEE_BANK", "ADMIN"]}>
                <DraweeBankDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      {user && <LiveNotificationToast />}
    </div>
  );
}
