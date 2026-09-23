import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import PresentingBankDashboard from "./pages/PresentingBankDashboard";
import DraweeBankDashboard from "./pages/DraweeBankDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import BranchManagerDashboard from "./pages/BranchManagerDashboard";
import ITStaffDashboard from "./pages/ITStaffDashboard";
import ComplianceAuditorDashboard from "./pages/ComplianceAuditorDashboard";
import SettlementOfficerDashboard from "./pages/SettlementOfficerDashboard";
import RBACManagement from "./pages/RBACManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import LiveSettlementTicker from "./components/LiveSettlementTicker";
import LiveNotificationToast from "./components/LiveNotificationToast";

function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const roleHome = {
    PRESENTING_BANK: "/presenting",
    DRAWEE_BANK: "/drawee",
    ADMIN: "/admin",
    BRANCH_MANAGER: "/branch-manager",
    IT_STAFF: "/it-monitoring",
    COMPLIANCE_AUDITOR: "/auditor",
    SETTLEMENT_OFFICER: "/settlement",
  };
  return <Navigate to={roleHome[user.role] || "/login"} replace />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {user && <LiveSettlementTicker />}
      <div className="flex-1 flex flex-col">
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
          <Route
            path="/branch-manager"
            element={
              <ProtectedRoute roles={["BRANCH_MANAGER", "ADMIN"]}>
                <BranchManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/it-monitoring"
            element={
              <ProtectedRoute roles={["IT_STAFF", "ADMIN"]}>
                <ITStaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/auditor"
            element={
              <ProtectedRoute roles={["COMPLIANCE_AUDITOR", "ADMIN"]}>
                <ComplianceAuditorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settlement"
            element={
              <ProtectedRoute roles={["SETTLEMENT_OFFICER", "ADMIN"]}>
                <SettlementOfficerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rbac"
            element={
              <ProtectedRoute roles={["BRANCH_MANAGER", "ADMIN"]}>
                <RBACManagement />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      {user && <LiveNotificationToast />}
    </div>
  );
}
