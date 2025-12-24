//frontend/src/App.js
import AICheck from "./components/AICHECK";
import { Routes, Route, useLocation } from "react-router-dom";
import Signup from "./pages/Signup";
import OtpReset from "./pages/OtpReset";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Achievements from "./pages/Achievements";
import AcademicData from "./pages/AcademicData";
import Sidebar from "./components/Sidebar";
import AdminSignup from "./components/AdminSignup";
import AdminLogin from "./components/AdminLogin";
import Home from "./components/Home";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDetails from "./components/StudentDetails";
import AdminReportGenerator from "./components/AdminReportGenerator";
import FullReport from "./components/FullReport";
import Leaderboard from "./pages/Leaderboard";
import StudentStats from "./pages/StudentStats";

// ✅ TEMPORARILY COMMENTED OUT FOR DEBUGGING
// import SessionManager from "./components/SessionManager";

import "./App.css";

function AppWrapper() {
  const location = useLocation();

  // Hide Sidebar on auth pages, Home, and all admin pages
  const hideSidebar =
    location.pathname === "/" ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/signup") ||
    location.pathname.startsWith("/forgot-password") ||
    location.pathname.startsWith("/otp-reset") ||
    location.pathname.startsWith("/admin");

  return (
    // ✅ TEMPORARILY REMOVED SessionManager WRAPPER FOR DEBUGGING
    // <SessionManager>
    <div style={{ display: "flex" }}>
      {/* Sidebar (hidden on auth pages & Home & admin pages) */}
      {!hideSidebar && <Sidebar />}

      {/* Main content area */}
      <div
        style={{
          marginLeft: !hideSidebar ? "250px" : "0",
          flex: 1,
          padding: !hideSidebar ? "20px" : "0",
          minHeight: "100vh",
          background: !hideSidebar ? "#f9fafb" : "#ffffff",
        }}
      >
        <Routes>
          {/* Home page */}
          <Route path="/" element={<Home />} />

          {/* Student Auth Pages */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/otp-reset" element={<OtpReset />} />

          {/* Student Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/academic" element={<AcademicData />} />
          <Route path="/leaderboard" element={<Leaderboard/>}/>
          <Route path="/student-stats" element={<StudentStats />} />

          {/* Admin Pages */}
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/otp-reset" element={<OtpReset />} />
          <Route path="/admin/student-details" element={<StudentDetails />} />
          <Route path="/admin/report" element={<AdminReportGenerator />} />
          <Route path="/admin/full-report" element={<FullReport />} />
          <Route path="/admin/ai-check" element={<AICheck />} />
        </Routes>
      </div>
    </div>
    // </SessionManager>
  );
}

function App() {
  return <AppWrapper />;
}

export default App;