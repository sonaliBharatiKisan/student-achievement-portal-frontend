import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Signup.css";

// ✅ API base URL from environment variable (production-ready for Render)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function Signup() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: "", uce: "", otp: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Step 1: Send OTP
  const sendOtp = async () => {
    // Email domain validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@cumminscollege\.in$/;
    if (!emailPattern.test(form.email)) {
      alert("❌ Invalid email ID");
      return;
    }

    // UCE number validation - must start with UCE followed by 7 or 8 digits
    const ucePattern = /^UCE\d{7,8}$/i;
    if (!ucePattern.test(form.uce)) {
      alert("❌ Invalid UCE number. Format: UCE followed by 7 or 8 digits (e.g., UCE1234567)");
      return;
    }

    try {
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
    <div className="signup-page">
      <div className="signup-container">
        <h2 className="signup-title">Student Signup</h2>

        {step === 1 && (
          <div className="signup-form">
            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                placeholder="Enter your Email"
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>UCE Number</label>
              <input
                name="uce"
                placeholder="Enter UCE Number (e.g., UCE1234567)"
                onChange={handleChange}
                pattern="^UCE\d{7,8}$"
                title="UCE number must start with UCE followed by 7 or 8 digits"
                required
              />
            </div>
            <button onClick={sendOtp} className="signup-btn">
              Send OTP
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="signup-form">
            <div className="form-group">
              <label>OTP</label>
              <input
                name="otp"
                placeholder="Enter OTP"
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create Password"
                onChange={handleChange}
                required
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,32}$"
                title="Password must be 8-32 characters long and include 1 lowercase, 1 uppercase, 1 digit, and 1 special character."
              />
            </div>

            <button onClick={verifyOtp} className="signup-btn">
              Verify & Signup
            </button>
          </div>
        )}

        <p className="login-link">
          Already have an account?{" "}
          <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;