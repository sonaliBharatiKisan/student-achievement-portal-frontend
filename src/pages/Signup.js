import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Signup.css";

// ✅ Production-ready API URL configuration (works with Render + Netlify)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
                     process.env.REACT_APP_API_URL || 
                     "http://localhost:5000";

function Signup() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: "", uce: "", otp: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Step 1: Send OTP
  const sendOtp = async () => {
    // Email domain validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@cumminscollege\.in$/;
    if (!emailPattern.test(form.email)) {
      alert("❌ Invalid email ID. Must be a @cumminscollege.in email.");
      return;
    }

    // UCE number validation - must start with UCE followed by 7 or 8 digits
    const ucePattern = /^UCE\d{7,8}$/i;
    if (!ucePattern.test(form.uce)) {
      alert("❌ Invalid UCE number. Format: UCE followed by 7 or 8 digits (e.g., UCE1234567)");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/send-otp`, {
        email: form.email.toLowerCase().trim(),
        uce: form.uce.toUpperCase().trim(),
      });

      console.log("✅ OTP Response:", response.data);

      // ✅ Handle testing mode with hardcoded OTP
      if (response.data.testing && response.data.hardcodedOTP) {
        alert(`📧 TESTING MODE: Use OTP: ${response.data.hardcodedOTP}`);
      } else {
        alert("✅ OTP sent to your email! Please check your inbox.");
      }
      
      setStep(2);
    } catch (err) {
      console.error("❌ Send OTP Error:", err);
      const errorMsg = err.response?.data?.error || err.message || "Failed to send OTP";
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and Create Password
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,32}$/;
  
  const verifyOtp = async () => {
    if (!form.otp || form.otp.trim().length !== 6) {
      alert("❌ Please enter a valid 6-digit OTP");
      return;
    }

    if (!passwordRegex.test(form.password)) {
      alert("❌ Password must be 8-32 characters with:\n• 1 uppercase letter\n• 1 lowercase letter\n• 1 digit\n• 1 special character");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
        email: form.email.toLowerCase().trim(),
        uce: form.uce.toUpperCase().trim(),
        otp: form.otp.trim(),
        password: form.password,
      });

      if (response.data.success) {
        // ✅ Store credentials in localStorage for auto-fill
        localStorage.setItem("studentEmail", form.email.toLowerCase().trim());
        localStorage.setItem("studentUCE", form.uce.toUpperCase().trim());
        
        alert("✅ Signup successful! Redirecting to login...");
        navigate("/login");
      } else {
        alert(response.data.error || "❌ OTP verification failed");
      }
    } catch (err) {
      console.error("❌ Verify OTP Error:", err);
      const errorMsg = err.response?.data?.error || err.message || "OTP verification failed";
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2 className="signup-title">Student Signup</h2>

        {step === 1 && (
          <div className="signup-form">
            <div className="form-group">
              <label>Email<span style={{color: 'red'}}>*</span></label>
              <input
                name="email"
                type="email"
                placeholder="yourname@cumminscollege.in"
                value={form.email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              <small style={{color: '#666', fontSize: '12px'}}>
                Must be a @cumminscollege.in email
              </small>
            </div>
            <div className="form-group">
              <label>UCE Number<span style={{color: 'red'}}>*</span></label>
              <input
                name="uce"
                type="text"
                placeholder="UCE1234567"
                value={form.uce}
                onChange={handleChange}
                disabled={isLoading}
                pattern="^UCE\d{7,8}$"
                title="UCE number must start with UCE followed by 7 or 8 digits"
                required
              />
              <small style={{color: '#666', fontSize: '12px'}}>
                Format: UCE followed by 7-8 digits
              </small>
            </div>
            <button 
              onClick={sendOtp} 
              className="signup-btn"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="signup-form">
            <div className="form-group">
              <label>OTP<span style={{color: 'red'}}>*</span></label>
              <input
                name="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={form.otp}
                onChange={handleChange}
                disabled={isLoading}
                maxLength="6"
                pattern="\d{6}"
                required
              />
              <small style={{color: '#666', fontSize: '12px'}}>
                Check your email for the OTP
              </small>
            </div>
            <div className="form-group">
              <label>Password<span style={{color: 'red'}}>*</span></label>
              <input
                type="password"
                name="password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                disabled={isLoading}
                required
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,32}$"
                title="Password must be 8-32 characters long and include 1 lowercase, 1 uppercase, 1 digit, and 1 special character."
              />
              <small style={{color: '#666', fontSize: '12px'}}>
                8-32 chars with uppercase, lowercase, digit & special char
              </small>
            </div>

            <div style={{display: 'flex', gap: '10px'}}>
              <button 
                onClick={() => setStep(1)} 
                className="signup-btn"
                style={{background: '#6c757d'}}
                disabled={isLoading}
              >
                Back
              </button>
              <button 
                onClick={verifyOtp} 
                className="signup-btn"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify & Signup"}
              </button>
            </div>
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