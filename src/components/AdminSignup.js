// frontend/src/components/AdminSignup.js
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./AdminSignup.css";

// ✅ Use the correct backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 
                     process.env.REACT_APP_API_BASE_URL || 
                     "https://student-achievement-portal-backend-2.onrender.com";

function AdminSignup() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: "", otp: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const sendOtp = async () => {
    if (!form.email) {
      setMessage("❌ Please enter your email address");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setMessage("❌ Please enter a valid email address");
      return;
    }

    setLoading(true);
    setMessage("⏳ Sending OTP...");

    try {
      console.log("📧 Sending OTP to:", form.email);
      console.log("🌐 API URL:", `${API_BASE_URL}/admin/send-otp`);

      const res = await axios.post(
        `${API_BASE_URL}/admin/send-otp`,
        { email: form.email.toLowerCase().trim() },
        {
          headers: { 
            "Content-Type": "application/json"
          },
          timeout: 15000 // 15 second timeout
        }
      );
      
      console.log("✅ Response:", res.data);

      if (res.data.success) {
        setMessage("✅ OTP sent! Use: 123456");
        setStep(2);
      } else {
        setMessage("❌ " + (res.data.error || "Failed to send OTP"));
      }
    } catch (err) {
      console.error("❌ Send OTP error:", err);
      
      let errorMsg = "Failed to send OTP. Please try again.";
      
      if (err.code === 'ECONNABORTED') {
        errorMsg = "Request timeout. Server might be sleeping. Please try again.";
      } else if (err.code === 'ERR_NETWORK') {
        errorMsg = "Network error. Please check your connection.";
      } else if (err.response?.status === 400) {
        errorMsg = err.response.data.error || "Email already registered";
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (!err.response) {
        errorMsg = "Cannot connect to server. Please try again in a moment.";
      }
      
      setMessage("❌ " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!form.otp || !form.password) {
      setMessage("❌ Please enter both OTP and password");
      return;
    }

    if (form.otp.trim() !== "123456") {
      setMessage("❌ Invalid OTP. Please use: 123456");
      return;
    }

    if (form.password.length < 6) {
      setMessage("❌ Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setMessage("⏳ Verifying OTP...");

    try {
      console.log("🔐 Verifying OTP for:", form.email);
      console.log("🌐 API URL:", `${API_BASE_URL}/admin/verify-otp`);

      const res = await axios.post(
        `${API_BASE_URL}/admin/verify-otp`,
        {
          email: form.email.toLowerCase().trim(),
          otp: form.otp.trim(),
          password: form.password
        },
        {
          headers: { 
            "Content-Type": "application/json"
          },
          timeout: 15000
        }
      );
      
      console.log("✅ Response:", res.data);

      if (res.data.success) {
        setMessage("✅ Signup successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/admin/login");
        }, 1500);
      } else {
        setMessage("❌ " + (res.data.error || "OTP verification failed"));
      }
    } catch (err) {
      console.error("❌ Verify OTP error:", err);
      
      let errorMsg = "OTP verification failed. Please try again.";
      
      if (err.code === 'ECONNABORTED') {
        errorMsg = "Request timeout. Please try again.";
      } else if (err.code === 'ERR_NETWORK') {
        errorMsg = "Network error. Please check your connection.";
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      if (step === 1) {
        sendOtp();
      } else if (step === 2) {
        verifyOtp();
      }
    }
  };

  return (
    <div className="admin-signup-page">
      <div className="admin-signup-container">
        <h2 className="admin-signup-title">Admin Signup</h2>
        <p className="admin-signup-subtitle">
          {step === 1 ? "Enter your email to receive OTP" : "Enter OTP and create password"}
        </p>

        {/* API URL Display for Debugging */}
        <div style={{ 
          fontSize: "10px", 
          color: "#666", 
          marginBottom: "10px",
          padding: "5px",
          background: "#f0f0f0",
          borderRadius: "4px",
          wordBreak: "break-all"
        }}>
          Backend: {API_BASE_URL}
        </div>

        {message && (
          <p className={`admin-signup-message ${
            message.includes("✅") || message.includes("success") 
              ? "success" 
              : message.includes("⏳")
              ? "loading"
              : "error"
          }`}>
            {message}
          </p>
        )}

        {step === 1 && (
          <div className="admin-signup-form">
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                disabled={loading}
                required
                autoComplete="email"
              />
            </div>
            <button 
              onClick={sendOtp} 
              className="admin-signup-btn"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="admin-signup-form">
            <div className="otp-hint" style={{
              background: "#e3f2fd",
              padding: "10px",
              borderRadius: "6px",
              marginBottom: "15px",
              border: "1px solid #2196f3"
            }}>
              💡 <strong>Use OTP: 123456</strong>
            </div>
            
            <div className="form-group">
              <label>OTP *</label>
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP (123456)"
                value={form.otp}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                disabled={loading}
                maxLength="6"
                required
                autoComplete="off"
              />
            </div>
            
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                placeholder="Create password (min 6 characters)"
                value={form.password}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                disabled={loading}
                required
                autoComplete="new-password"
              />
              <small style={{ color: "#666", fontSize: "12px" }}>
                Minimum 6 characters
              </small>
            </div>
            
            <button 
              onClick={verifyOtp} 
              className="admin-signup-btn"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Signup"}
            </button>
            
            <button 
              onClick={() => {
                setStep(1);
                setForm({ ...form, otp: "", password: "" });
                setMessage("");
              }} 
              className="admin-signup-back-btn"
              disabled={loading}
            >
              ← Back to Email
            </button>
          </div>
        )}

        <p className="login-link" style={{ marginTop: "20px", textAlign: "center" }}>
          Already have an account?{" "}
          <Link to="/admin/login" style={{ color: "#1976d2", textDecoration: "none", fontWeight: "bold" }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AdminSignup;