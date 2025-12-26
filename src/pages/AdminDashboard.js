import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminReportGenerator from "./AdminReportGenerator";
import AICheck from "../components/AICHECK";
import AchievementStats from "./AchievementStats";
import axios from "axios";
import "./AdminDashboard.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("report");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ TOKEN VERIFICATION - MOVED INSIDE COMPONENT
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/");
      return;
    }
    
    // Verify token
    axios.get(`${API_BASE_URL}/admin/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    }).catch(err => {
      console.error("Token invalid:", err);
      localStorage.clear();
      navigate("/");
    });
  }, [navigate]);

  useEffect(() => {
    const superAdminStatus = localStorage.getItem("isSuperAdmin") === "true";
    setIsSuperAdmin(superAdminStatus);

    if (superAdminStatus) {
      fetchAdmins();
    }
  }, []);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API_BASE_URL}/admin/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(res.data.admins);
    } catch (err) {
      console.error("Failed to fetch admins");
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.post(
        `${API_BASE_URL}/admin/add-admin`,
        newAdmin,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setMessage("Admin added successfully!");
        setNewAdmin({ email: "", password: "" });
        fetchAdmins();
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to add admin");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to remove this admin?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.delete(
        `${API_BASE_URL}/admin/remove-admin/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert("Admin removed successfully!");
        fetchAdmins();
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to remove admin");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("isSuperAdmin");
    navigate("/");
  };

  return (
    <div className="admin-dashboard-wrapper">
      {/* SIDEBAR */}
      <div className="admin-sidebar">
        {/* Sidebar Header */}
        <div className="admin-sidebar-header">
          <h2 className="admin-sidebar-title">Admin Panel</h2>
          {isSuperAdmin && (
            <span className="super-admin-badge">Main Admin</span>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="admin-sidebar-nav">
          <button
            onClick={() => setActiveTab("report")}
            className={`admin-nav-button ${activeTab === "report" ? "active" : ""}`}
          >
            <span className="nav-icon">📊</span>
            <span>REPORT GENERATOR</span>
          </button>

          <button
            onClick={() => setActiveTab("stats")}
            className={`admin-nav-button ${activeTab === "stats" ? "active" : ""}`}
          >
            <span className="nav-icon">📈</span>
            <span>ACHIEVEMENT STATS</span>
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            className={`admin-nav-button ${activeTab === "ai" ? "active" : ""}`}
          >
            <span className="nav-icon">🤖</span>
            <span>AI ANALYZER</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab("manage")}
              className={`admin-nav-button ${activeTab === "manage" ? "active" : ""}`}
            >
              <span className="nav-icon">👥</span>
              <span>Manage Admins</span>
            </button>
          )}
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} className="admin-logout-button">
          <span className="nav-icon">🚪</span>
          <span>LOGOUT</span>
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="admin-main-content">
        <div className="admin-content-container">
          {/* Section Render */}
          <div>
            {activeTab === "report" && <AdminReportGenerator />}
            {activeTab === "stats" && <AchievementStats />}
            {activeTab === "ai" && <AICheck />}

            {/* Admin Management Section */}
            {activeTab === "manage" && isSuperAdmin && (
              <div className="admin-management-section">
                <h3 className="admin-section-title">Admin Management</h3>

                {/* Add New Admin Form */}
                <div className="add-admin-form-container">
                  <h4 className="add-admin-title">Add New Admin</h4>
                  {message && (
                    <p className={`form-message ${message.includes("successfully") ? "success" : "error"}`}>
                      {message}
                    </p>
                  )}
                  <form onSubmit={handleAddAdmin} className="add-admin-form">
                    <div className="form-inputs-wrapper">
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          value={newAdmin.email}
                          onChange={(e) =>
                            setNewAdmin({ ...newAdmin, email: e.target.value })
                          }
                          required
                          placeholder="Enter admin email"
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                          type="password"
                          value={newAdmin.password}
                          onChange={(e) =>
                            setNewAdmin({ ...newAdmin, password: e.target.value })
                          }
                          required
                          placeholder="Create password"
                          className="form-input"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className={`submit-button ${loading ? "disabled" : ""}`}
                      >
                        {loading ? "Adding..." : "Add Admin"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Admin List */}
                <div className="admin-list-section">
                  <h4 className="admin-list-title">Current Admins ({admins.length})</h4>
                  <div className="table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Created By</th>
                          <th>Joined</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {admins.map((admin) => (
                          <tr key={admin._id}>
                            <td>{admin.email}</td>
                            <td>
                              {admin.isSuperAdmin ? (
                                <span className="role-badge super-admin-role">
                                  Super Admin
                                </span>
                              ) : (
                                <span className="role-badge admin-role">
                                  Admin
                                </span>
                              )}
                            </td>
                            <td>{admin.createdBy || "Self"}</td>
                            <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                            <td className="action-cell">
                              {!admin.isSuperAdmin ? (
                                <button
                                  onClick={() => handleRemoveAdmin(admin._id)}
                                  className="remove-button"
                                >
                                  Remove
                                </button>
                              ) : (
                                <span className="protected-text">Protected</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;