// frontend/src/components/AdminSidebar.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminSidebar.css";

function AdminSidebar({ activeTab, setActiveTab, isSuperAdmin }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("isSuperAdmin");
    navigate("/");
  };

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h2>Admin Panel</h2>
        {isSuperAdmin && (
          <span className="super-admin-badge">Main Admin</span>
        )}
      </div>

      <nav className="admin-sidebar-nav">
        <button
          className={`admin-nav-btn ${activeTab === "report" ? "active" : ""}`}
          onClick={() => setActiveTab("report")}
        >
          <span className="nav-icon"></span>
          <span className="nav-text">Report Generator</span>
        </button>

        <button
          className={`admin-nav-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <span className="nav-icon"></span>
          <span className="nav-text">Student Profile</span>
        </button>

        <button
          className={`admin-nav-btn ${activeTab === "stats" ? "active" : ""}`}
          onClick={() => setActiveTab("stats")}
        >
          <span className="nav-icon"></span>
          <span className="nav-text">Achievement Stats</span>
        </button>

        <button
          className={`admin-nav-btn ${activeTab === "ai" ? "active" : ""}`}
          onClick={() => setActiveTab("ai")}
        >
          <span className="nav-icon"></span>
          <span className="nav-text">AI Analyzer</span>
        </button>

        {isSuperAdmin && (
          <button
            className={`admin-nav-btn ${activeTab === "manage" ? "active" : ""}`}
            onClick={() => setActiveTab("manage")}
          >
            <span className="nav-icon"></span>
            <span className="nav-text">Manage Admins</span>
          </button>
        )}
      </nav>

      <button className="admin-logout-btn" onClick={handleLogout}>
        <span className="nav-icon"></span>
        <span className="nav-text">Logout</span>
      </button>
    </div>
  );
}

export default AdminSidebar;