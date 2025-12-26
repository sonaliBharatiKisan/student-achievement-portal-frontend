import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.email || !form.password) {
      setMessage("❌ Please enter both email and password");
      return;
    }

    setLoading(true);
    setMessage("⏳ Logging in...");

    try {
      console.log("🔑 Admin login attempt:", form.email);
      console.log("🌐 API URL:", `${API_BASE_URL}/admin/login`);

      const res = await axios.post(
        `${API_BASE_URL}/admin/login`, 
        {
          email: form.email.toLowerCase().trim(),
          password: form.password
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 15000
        }
      );

      console.log("✅ Login response:", res.data);

      if (res.data.success) {
        // Store authentication data
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem("adminEmail", form.email);
        localStorage.setItem("isSuperAdmin", res.data.isSuperAdmin);
        
        setMessage("✅ Login successful! Redirecting...");
        
        // Use replace to prevent going back to login page
        setTimeout(() => {
          navigate("/admin/dashboard", { replace: true });
        }, 1000);
      } else {
        setMessage("❌ " + (res.data.error || "Login failed"));
      }
    } catch (err) {
      console.error("❌ Admin login error:", err);
      
      let errorMsg = "Login failed. Please try again.";
      
      if (err.code === 'ECONNABORTED') {
        errorMsg = "Request timeout. Server might be sleeping. Please try again.";
      } else if (err.code === 'ERR_NETWORK') {
        errorMsg = "Network error. Please check your connection.";
      } else if (err.response?.status === 400) {
        errorMsg = "Invalid email or password";
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (!err.response) {
        errorMsg = "Cannot connect to server. Please try again.";
      }
      
      setMessage("❌ " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <form onSubmit={handleSubmit} className="admin-login-form">
        <h2 className="admin-login-title">Admin Login</h2>
        
        {/* API URL Display for Debugging */}
        <div style={{ 
          fontSize: "10px", 
          color: "#666", 
          padding: "5px",
          background: "#f0f0f0",
          borderRadius: "4px",
          wordBreak: "break-all",
          marginBottom: "10px"
        }}>
          Backend: {API_BASE_URL}
        </div>

        {message && (
          <p className={`admin-login-message ${
            message.includes("✅") ? "success" : 
            message.includes("⏳") ? "info" : 
            "error"
          }`}>
            {message}
          </p>
        )}

        <div className="admin-form-group">
          <label>Email</label>
          <input
            name="email"
            type="email"
            placeholder="Enter your Email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="admin-form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your Password"
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <p className="admin-forgot-link">
          <a href="/admin/forgot-password">Forgot Password?</a>
        </p>

        <button
          type="submit"
          disabled={loading}
          className={`admin-login-btn ${loading ? "loading" : ""}`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ textAlign: "center", marginTop: "15px", fontSize: "14px" }}>
          Don't have an account?{" "}
          <a href="/admin/signup" style={{ color: "#8a2be2", textDecoration: "none", fontWeight: "bold" }}>
            Sign up here
          </a>
        </p>
      </form>
    </div>
  );
}

export default AdminLogin;