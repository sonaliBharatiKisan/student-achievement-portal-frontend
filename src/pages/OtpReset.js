//frontend/src/pages/OtpReset.js

import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function OtpReset() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const email = localStorage.getItem("resetEmail");
  const role = localStorage.getItem("resetRole") || "student"; // ✅ read role

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,32}$/;

  const handleReset = async () => {
    if (!passwordRegex.test(newPassword)) {
      setMessage(
        "❌ Password must be 8-32 characters long and include 1 uppercase, 1 lowercase, 1 digit, and 1 special character."
      );
      return;
    }

    try {
      const url =
        role === "admin"
          ? "http://localhost:5000/admin/reset-password"
          : "http://localhost:5000/api/auth/reset-password";

      const response = await axios.post(url, {
        email,
        otp,
        newPassword,
      });

      if (response.data.success) {
        setMessage("✅ Password reset successful! Redirecting...");
        setTimeout(() => {
          navigate(role === "admin" ? "/admin/login" : "/login");
        }, 2000);
      } else {
        setMessage(response.data.error || "❌ Reset failed");
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "❌ Reset failed");
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
           Reset Password ({role === "admin" ? "Admin" : "Student"})
        </h2>

        <p style={{ textAlign: "center", fontSize: "14px", color: "#555" }}>
          Email: <b>{email}</b>
        </p>

        <label style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>
          Enter OTP
        </label>
        <input
          type="text"
          placeholder="6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          style={{
            padding: "10px",
            fontSize: "14px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <label style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>
          New Password
        </label>
        <input
          type="password"
          placeholder="Enter new password"
          pattern={
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,32}$"
          }
          title="Password must be 8-32 characters long and include 1 lowercase, 1 uppercase, 1 digit, and 1 special character."
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={{
            padding: "10px",
            fontSize: "14px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "10px",
            background: "linear-gradient(to right, #28a745, #218838)",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "background 0.3s ease",
          }}
        >
          Reset Password
        </button>

        {message && (
          <p
            style={{
              marginTop: "10px",
              textAlign: "center",
              fontSize: "14px",
              color: message.includes("✅") ? "#28a745" : "#dc3545",
            }}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default OtpReset;