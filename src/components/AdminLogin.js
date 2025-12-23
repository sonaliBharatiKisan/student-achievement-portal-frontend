// frontend/src/components/AdminLogin.js
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ✅ Use the correct backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 
                     process.env.REACT_APP_API_BASE_URL || 
                     "https://student-achievement-portal-backend-2.onrender.com";

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
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem("adminEmail", form.email);
        localStorage.setItem("isSuperAdmin", res.data.isSuperAdmin);
        
        setMessage("✅ Login successful! Redirecting...");
        
        setTimeout(() => {
          navigate("/admin/dashboard");
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
    <div
      style={{
        backgroundImage: "url('/cummins.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: 400,
          width: "100%",
          padding: "30px",
          background: "rgba(255,255,255,0.95)",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          border: "1px solid #1976d2",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#003366" }}>
          Admin Login
        </h2>

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
          <p style={{ 
            color: message.includes("✅") ? "green" : message.includes("⏳") ? "blue" : "red", 
            fontWeight: "bold", 
            textAlign: "center",
            padding: "10px",
            background: message.includes("✅") ? "#e8f5e9" : message.includes("⏳") ? "#e3f2fd" : "#ffebee",
            borderRadius: "6px"
          }}>
            {message}
          </p>
        )}

        <div style={{ textAlign: "left" }}>
          <label>Email</label>
          <input
            name="email"
            type="email"
            placeholder="Enter your Email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ textAlign: "left" }}>
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your Password"
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              marginTop: "5px",
            }}
          />
        </div>

        <p style={{ textAlign: "right", fontSize: "14px", marginTop: "-5px", marginBottom: "10px" }}>
          <a href="/admin/forgot-password" style={{ color: "#ff7e5f", textDecoration: "none" }}>
            Forgot Password?
          </a>
        </p>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            background: loading
              ? "#ccc"
              : "linear-gradient(to right, #28a745, #218838)",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ textAlign: "center", marginTop: "10px" }}>
          Don't have an account?{" "}
          <a href="/admin/signup" style={{ color: "#1976d2", textDecoration: "none", fontWeight: "bold" }}>
            Sign up here
          </a>
        </p>
      </form>
    </div>
  );
}

export default AdminLogin;