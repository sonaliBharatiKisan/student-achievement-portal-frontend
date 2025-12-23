// frontend/src/components/Login.js
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

// ✅ Use environment variable with fallback
const API_BASE = process.env.REACT_APP_API_URL || 
                 "https://student-achievement-portal-backend-2.onrender.com";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setError(""); // Clear error on input change
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // ✅ Validate Cummins College email
    const emailPattern = /^[a-zA-Z0-9._%+-]+@cumminscollege\.in$/;
    if (!emailPattern.test(form.email)) {
      setError("❌ Please use your Cummins College email (@cumminscollege.in)");
      return;
    }
    
    // Validate password
    if (!form.password || form.password.length < 6) {
      setError("❌ Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("🔐 Logging in to:", `${API_BASE}/api/auth/login`);
      
      const res = await axios.post(
        `${API_BASE}/api/auth/login`, 
        {
          email: form.email.toLowerCase().trim(),
          password: form.password
        },
        {
          headers: { 
            "Content-Type": "application/json"
          },
          timeout: 15000
        }
      );
      
      if (res.data.success) {
        // ✅ Save authentication data
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("studentEmail", res.data.student.email);
        
        if (res.data.student.uce) {
          localStorage.setItem("studentUCE", res.data.student.uce);
        }
        
        if (res.data.student.name) {
          localStorage.setItem("studentName", res.data.student.name);
        }
        
        console.log("✅ Login successful!");
        
        // Show success message briefly before navigation
        setError("");
        alert("✅ Login successful!");
        
        // Navigate to dashboard
        navigate("/dashboard");
      } else {
        setError(res.data.error || "❌ Login failed. Please try again.");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      
      let errorMsg = "❌ Server error. Please try again.";
      
      if (err.code === 'ECONNABORTED') {
        errorMsg = "❌ Request timeout. Please check your connection.";
      } else if (err.code === 'ERR_NETWORK') {
        errorMsg = "❌ Network error. Please check your internet connection.";
      } else if (err.response) {
        // Server responded with error
        if (err.response.status === 401) {
          errorMsg = "❌ Invalid email or password";
        } else if (err.response.status === 400) {
          errorMsg = err.response.data.error || "❌ Invalid request";
        } else if (err.response.status === 500) {
          errorMsg = "❌ Server error. Please try again later.";
        } else {
          errorMsg = err.response.data.error || "❌ Login failed";
        }
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">Student Login</h2>
        
        {error && (
          <div className="error-message" style={{
            padding: '12px',
            marginBottom: '15px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c33',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        
        <div className="form-group">
          <label>Email<span style={{ color: 'red' }}>*</span></label>
          <input
            name="email"
            type="email"
            placeholder="your.email@cumminscollege.in"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Password<span style={{ color: 'red' }}>*</span></label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading}
            minLength="6"
          />
        </div>
        
        <p className="forgot-password-link">
          <a href="/forgot-password">Forgot Password?</a>
        </p>
        
        <button 
          type="submit" 
          disabled={loading} 
          className="login-btn"
          style={{
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? "Logging in..." : "⮞ Login"}
        </button>
        
        <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </form>
    </div>
  );
}

export default Login;