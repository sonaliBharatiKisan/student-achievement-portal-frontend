// ./pages/AdminDashboard.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminReportGenerator from "./AdminReportGenerator";
import AICheck from "../components/AICHECK"; // ✅ Import AI Analyzer
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("report"); // ✅ for switching views

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    navigate("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        backgroundImage: "url('/cummins.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "50px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          background: "rgba(255,255,255,0.95)",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
          padding: "30px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ color: "#003366" }}>Admin Dashboard</h2>
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              background: "linear-gradient(to right, #ff7e5f, #feb47b)",
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            Logout
          </button>
        </div>

        {/* Navigation Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            marginTop: "25px",
          }}
        >
          <button
            onClick={() => setActiveTab("report")}
            style={{
              padding: "10px 20px",
              background:
                activeTab === "report"
                  ? "linear-gradient(to right, #0072ff, #00c6ff)"
                  : "#e5e7eb",
              border: "none",
              borderRadius: "8px",
              color: activeTab === "report" ? "#fff" : "#333",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            📄 Report Generator
          </button>
              
          <button
            onClick={() => setActiveTab("ai")}
            style={{
              padding: "10px 20px",
              background:
                activeTab === "ai"
                  ? "linear-gradient(to right, #16a34a, #4ade80)"
                  : "#e5e7eb",
              border: "none",
              borderRadius: "8px",
              color: activeTab === "ai" ? "#fff" : "#333",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            🧠 AI Achievement Analyzer
          </button>
        </div>

        {/* Section Render */}
        <div style={{ marginTop: "30px" }}>
          {activeTab === "report" && <AdminReportGenerator />}
          {activeTab === "ai" && <AICheck />}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
