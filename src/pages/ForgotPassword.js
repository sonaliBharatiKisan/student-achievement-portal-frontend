import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./ForgotPassword.css";

// ✅ Add API base URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ Detect if admin forgot password page
  const isAdmin = location.pathname.includes("/admin");
  
  const handleReset = async () => {
    // ✅ Allow only @cumminscollege.in emails for students
    if (!isAdmin) {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@cumminscollege\.in$/;
      if (!emailPattern.test(email)) {
        alert("❌ Invalid email ID");
        return;
      }
    }
    
    setLoading(true);
    try {
      // ✅ Use environment variable for API endpoint
      const url = isAdmin
        ? `${API_BASE_URL}/admin/forgot-password`
        : `${API_BASE_URL}/api/auth/forgot-password`;
      
      await axios.post(url, { email });
      
      localStorage.setItem("resetEmail", email);
      localStorage.setItem("resetRole", isAdmin ? "admin" : "student"); // ✅ Store role
      
      setSuccess(true);
      setTimeout(() => navigate("/otp-reset"), 1500);
    } catch (err) {
      alert(err.response?.data?.error || "❌ Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="forgot-password-page">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleReset();
        }}
        className="forgot-password-container"
      >
        <h2 className="forgot-password-title">
          Forgot Password ({isAdmin ? "Admin" : "Student"})
        </h2>
        <p className="forgot-password-subtitle">
          Enter your registered email to receive an OTP
        </p>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="forgot-password-input"
        />
        <button
          type="submit"
          disabled={loading}
          className={`forgot-password-btn ${loading ? "loading" : ""}`}
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
        {success && (
          <p className="success-message">
            ✅ OTP sent to your email
          </p>
        )}
      </form>
    </div>
  );
}

export default ForgotPassword;