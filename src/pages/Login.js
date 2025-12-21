import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

// ✅ Add API base URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Allow only Cummins College emails
    const emailPattern = /^[a-zA-Z0-9._%+-]+@cumminscollege\.in$/;
    if (!emailPattern.test(form.email)) {
      alert("❌ Invalid email ID");
      return;
    }
    
    setLoading(true);
    try {
      // ✅ Use environment variable for API endpoint
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, form, {
        headers: { "Content-Type": "application/json" },
      });
      
      if (res.data.success) {
        // Save token + student email consistently
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("uce_no", res.data.uce);
        localStorage.setItem("studentEmail", form.email);
        
        alert("✅ Login successful!");
        navigate("/dashboard");
      } else {
        alert(res.data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert(err.response?.data?.error || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">Student Login</h2>
        
        <div className="form-group">
          <label>Email</label>
          <input
            name="email"
            type="email"
            placeholder="Enter Email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <p className="forgot-password-link">
          <a href="/forgot-password">Forgot Password</a>
        </p>
        
        <button type="submit" disabled={loading} className="login-btn">
          {loading ? "Logging in..." : "⮞ Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;