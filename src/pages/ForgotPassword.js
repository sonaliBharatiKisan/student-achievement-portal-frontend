import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

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
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleReset();
        }}
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
        <h2
          style={{
            textAlign: "center",
            marginBottom: "10px",
            color: "#003366",
          }}
        >
          🔒 Forgot Password ({isAdmin ? "Admin" : "Student"})
        </h2>

        <p style={{ textAlign: "center", fontSize: "14px", color: "#555" }}>
          Enter your registered email to receive an OTP
        </p>

        <input
          type="email"
          placeholder="📧 Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: "12px",
            fontSize: "15px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            marginTop: "5px",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px",
            background: loading
              ? "#ccc"
              : "linear-gradient(to right, #28a745, #218838)",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.3s ease",
          }}
        >
          {loading ? "Sending..." : "📨 Send OTP"}
        </button>

        {success && (
          <p style={{ color: "green", textAlign: "center", marginTop: "10px" }}>
            ✅ OTP sent to your email
          </p>
        )}
      </form>
    </div>
  );
}

export default ForgotPassword;