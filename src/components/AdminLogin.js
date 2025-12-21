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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${API_BASE_URL}/admin/login`, form, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data.success) {
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem("adminEmail", form.email);
        localStorage.setItem("isSuperAdmin", res.data.isSuperAdmin);
        alert("✅ Admin login successful!");
        navigate("/admin/dashboard");
      } else {
        setMessage(res.data.error || "Login failed");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setMessage(err.response?.data?.error || "Server error. Please try again.");
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
          <p style={{ color: "red", fontWeight: "bold", textAlign: "center" }}>
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
              : "linear-gradient(to right,  #28a745, #218838)",
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
      </form>
    </div>
  );
}

export default AdminLogin;