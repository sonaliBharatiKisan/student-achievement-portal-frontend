import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

// ✅ Add API base URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function Signup() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: "", uce: "", otp: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Step 1: Send OTP
  const sendOtp = async () => {
    try {
      // ✅ Use environment variable for API endpoint
      await axios.post(`${API_BASE_URL}/api/auth/send-otp`, {
        email: form.email,
        uce: form.uce,
      });
      setStep(2);
      alert("OTP sent to your email!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send OTP");
    }
  };

  // Step 2: Verify OTP and Create Password
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,32}$/;
  const verifyOtp = async () => {
    if (!passwordRegex.test(form.password)) {
      alert("❌ Password must be 8-32 chars, include 1 uppercase, 1 lowercase, 1 digit, and 1 special character.");
      return;
    }

    try {
      // ✅ Use environment variable for API endpoint
      const res = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, form);
      if (res.data.success) {
        alert("Signup successful! Redirecting to login...");
        navigate("/login");
      } else {
        alert(res.data.error || "OTP verification failed");
      }
    } catch (err) {
      alert(err.response?.data?.error || "OTP verification failed");
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
      <div
        style={{
          maxWidth: 400,
          width: "100%",
          padding: "30px",
          background: "rgba(255,255,255,0.9)",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "#003366" }}>Signup</h2>

        {step === 1 && (
          <div>
            <div style={{ marginBottom: "15px", textAlign: "left" }}>
              <label>Email</label>
              <input
                name="email"
                placeholder="Enter your Email"
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
            <div style={{ marginBottom: "15px", textAlign: "left" }}>
              <label>UCE Number</label>
              <input
                name="uce"
                placeholder="Enter UCE Number"
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
            <button
              onClick={sendOtp}
              style={{
                width: "100%",
                padding: "10px",
                background: "linear-gradient(to right, #28a745, #218838)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Send OTP
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ marginBottom: "15px", textAlign: "left" }}>
              <label>OTP</label>
              <input
                name="otp"
                placeholder="Enter OTP"
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
            <div style={{ marginBottom: "15px", textAlign: "left" }}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create Password"
                onChange={handleChange}
                required
                pattern={"^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,32}$"}
                title="Password must be 8-32 characters long and include 1 lowercase, 1 uppercase, 1 digit, and 1 special character."
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  marginTop: "5px",
                }}
              />
            </div>

            <button
              onClick={verifyOtp}
              style={{
                width: "100%",
                padding: "10px",
                background: "linear-gradient(to right, #26b848ff, #26b848ff )",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Verify & Signup
            </button>
          </div>
        )}

        {/* ✅ Add Login Link */}
        <p style={{ marginTop: "15px" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#003366", fontWeight: "bold" }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;