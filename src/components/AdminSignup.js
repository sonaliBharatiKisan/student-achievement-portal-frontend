import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./AdminSignup.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
      setMessage("Please enter your email address");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${API_BASE_URL}/api/admin/send-otp`, {
        email: form.email.toLowerCase(), // ✅ Ensure lowercase
      });
      
      if (res.data.success) {
        setMessage(res.data.message || "OTP sent successfully! Use: 123456");
        setStep(2);
      } else {
        setMessage(res.data.error || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      setMessage(err.response?.data?.error || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!form.otp || !form.password) {
      setMessage("Please enter both OTP and password");
      return;
    }

    if (form.password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${API_BASE_URL}/admin/verify-otp`, {
        email: form.email.toLowerCase(), // ✅ Ensure lowercase
        otp: form.otp,
        password: form.password
      });
      
      if (res.data.success) {
        setMessage("✅ Signup successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/admin/login");
        }, 1500);
      } else {
        setMessage(res.data.error || "OTP verification failed");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      setMessage(err.response?.data?.error || "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
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
        <h2 className="admin-signup-title">Main Admin Signup</h2>
        <p className="admin-signup-subtitle">
          Only sonalibharti430@gmail.com can signup
        </p>

        {message && (
          <p className={`admin-signup-message ${message.includes("success") || message.includes("✅") ? "success" : "error"}`}>
            {message}
          </p>
        )}

        {step === 1 && (
          <div className="admin-signup-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your Email"
                value={form.email}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                disabled={loading}
                required
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
            <p className="otp-hint">💡 Hardcoded OTP: <strong>123456</strong></p>
            <div className="form-group">
              <label>OTP</label>
              <input
                type="text"
                name="otp"
                placeholder="Enter 6-digit OTP (123456)"
                value={form.otp}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                disabled={loading}
                maxLength="6"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create Password (min 6 characters)"
                value={form.password}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                disabled={loading}
                required
              />
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
              Back to Email
            </button>
          </div>
        )}

        <p className="login-link">
          Already have an account?{" "}
          <Link to="/admin/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default AdminSignup;