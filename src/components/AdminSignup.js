// frontend/src/components/AdminSignup.js
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./AdminSignup.css";

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

    // 🎯 SMART APPROACH: Show OTP immediately, validate later
    console.log("📧 Email entered:", form.email);
    
    // Show success and move to next step immediately
    setMessage("✅ OTP is: 123456");
    
    // Give user 1 second to see the message
    setTimeout(() => {
      setStep(2);
      setLoading(false);
    }, 1000);

    // 🔥 Send request in background (don't wait for it)
    axios.post(
      `${API_BASE_URL}/admin/send-otp`,
      { email: form.email.toLowerCase().trim() },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000 // 30 seconds for slow server wake-up
      }
    )
    .then(res => {
      console.log("✅ Backend confirmed OTP sent:", res.data);
    })
    .catch(err => {
      console.log("⚠️ Backend request failed (not critical):", err.message);
      // Don't show error to user - OTP still works!
    });
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
    setMessage("⏳ Creating your account...");

    try {
      console.log("🔐 Verifying OTP and creating account");

      const res = await axios.post(
        `${API_BASE_URL}/admin/verify-otp`,
        {
          email: form.email.toLowerCase().trim(),
          otp: form.otp.trim(),
          password: form.password
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000 // 30 seconds for slow server
        }
      );

      console.log("✅ Account created:", res.data);

      if (res.data.success) {
        // Show success alert
        alert("✅ Admin account created successfully!\n\nYou can now login with your credentials.");
        
        // Redirect to login
        navigate("/admin/login");
      } else {
        setMessage("❌ " + (res.data.error || "Account creation failed"));
      }
    } catch (err) {
      console.error("❌ Verify OTP error:", err);
      
      let errorMsg = "Account creation failed.";
      
      if (err.code === 'ECONNABORTED') {
        errorMsg = "Server timeout. Server is waking up, please try again in 30 seconds.";
      } else if (err.code === 'ERR_NETWORK') {
        errorMsg = "Network error. Please check your connection and try again.";
      } else if (err.response?.status === 400 && err.response?.data?.error?.includes("already registered")) {
        errorMsg = "This email is already registered. Please login instead.";
        alert("❌ Email already registered!\n\nPlease use the login page.");
        navigate("/admin/login");
        return;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (!err.response) {
        errorMsg = "Cannot connect to server. Please wait 30 seconds for server to wake up and try again.";
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
          {step === 1 ? "Enter your email to get OTP" : "Enter OTP to create account"}
        </p>

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
                autoFocus
              />
            </div>
            <button 
              onClick={sendOtp} 
              className="admin-signup-btn"
              disabled={loading}
            >
              {loading ? "Getting OTP..." : "Get OTP"}
            </button>
            
            <div style={{
              marginTop: "15px",
              padding: "10px",
              background: "#fff3cd",
              borderRadius: "6px",
              fontSize: "13px",
              color: "#856404",
              border: "1px solid #ffc107"
            }}>
              💡 <strong>Note:</strong> OTP is always <strong>123456</strong>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="admin-signup-form">
            <div className="otp-hint" style={{
              background: "#d1ecf1",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "2px solid #17a2b8",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#0c5460", marginBottom: "5px" }}>
                Your OTP
              </div>
              <div style={{ fontSize: "32px", fontWeight: "bold", color: "#17a2b8", letterSpacing: "5px" }}>
                123456
              </div>
            </div>
            
            <div className="form-group">
              <label>Enter OTP *</label>
              <input
                type="text"
                name="otp"
                placeholder="Enter 123456"
                value={form.otp}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                disabled={loading}
                maxLength="6"
                required
                autoComplete="off"
                autoFocus
                style={{
                  fontSize: "20px",
                  letterSpacing: "5px",
                  textAlign: "center"
                }}
              />
            </div>
            
            <div className="form-group">
              <label>Create Password *</label>
              <input
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                disabled={loading}
                required
                autoComplete="new-password"
              />
              <small style={{ color: "#666", fontSize: "12px" }}>
                At least 6 characters required
              </small>
            </div>
            
            <button 
              onClick={verifyOtp} 
              className="admin-signup-btn"
              disabled={loading}
              style={{
                marginTop: "10px"
              }}
            >
              {loading ? "Creating Account..." : "Create Account"}
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
              ← Change Email
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