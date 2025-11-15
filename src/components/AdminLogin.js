//frontend/src/components/AdminLogin.js

import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error message when user starts typing
    if (message) setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validate inputs
    if (!form.email || !form.password) {
      setMessage("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      console.log("🔄 Attempting admin login to:", `${API_BASE_URL}/admin/login`);
      
      const res = await axios.post(
        `${API_BASE_URL}/admin/login`,
        {
          email: form.email.toLowerCase().trim(),
          password: form.password,
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000, // 10 second timeout
        }
      );

      console.log("✅ Admin login response:", res.data);

      if (res.data.success) {
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem("adminEmail", form.email.toLowerCase().trim());
        alert("✅ Admin login successful!");
        navigate("/admin/dashboard");
      } else {
        setMessage(res.data.error || "Login failed");
      }
    } catch (err) {
      console.error("❌ Admin login error:", err);
      
      if (err.code === "ECONNABORTED") {
        setMessage("Request timeout. Please check your connection.");
      } else if (err.response) {
        // Server responded with error
        setMessage(err.response.data.error || "Invalid credentials");
      } else if (err.request) {
        // No response from server
        setMessage("Cannot connect to server. Please try again later.");
      } else {
        setMessage("An unexpected error occurred");
      }
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

        {message && (
          <p
            style={{
              color: message.includes("✅") ? "green" : "red",
              fontWeight: "bold",
              textAlign: "center",
              padding: "10px",
              backgroundColor: message.includes("✅") ? "#d4edda" : "#f8d7da",
              borderRadius: "6px",
              border: `1px solid ${message.includes("✅") ? "#c3e6cb" : "#f5c6cb"}`,
            }}
          >
            {message}
          </p>
        )}

        <div style={{ textAlign: "left" }}>
          <label style={{ fontWeight: "500", color: "#333" }}>Email</label>
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
              fontSize: "14px",
              opacity: loading ? 0.6 : 1,
            }}
          />
        </div>

        <div style={{ textAlign: "left" }}>
          <label style={{ fontWeight: "500", color: "#333" }}>Password</label>
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
              fontSize: "14px",
              opacity: loading ? 0.6 : 1,
            }}
          />
        </div>

        <p
          style={{
            textAlign: "right",
            fontSize: "14px",
            marginTop: "-5px",
            marginBottom: "10px",
          }}
        >
          <a
            href="/admin/forgot-password"
            style={{
              color: "#ff7e5f",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Forgot Password?
          </a>
        </p>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: loading
              ? "#ccc"
              : "linear-gradient(to right, #28a745, #218838)",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            transition: "all 0.3s ease",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ textAlign: "center", fontSize: "14px", marginTop: "10px", color: "#666" }}>
          Don't have an account?{" "}
          <a
            href="/admin/signup"
            style={{
              color: "#1976d2",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Sign Up
          </a>
        </p>
      </form>
    </div>
  );
}

export default AdminLogin;