import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${API_BASE_URL}/admin/login`, form, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data.success) {
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem("adminEmail", form.email);
        
        // Store super admin status if provided
        if (res.data.isSuperAdmin !== undefined) {
          localStorage.setItem("isSuperAdmin", res.data.isSuperAdmin);
        }
        
        alert("Admin login successful!");
        navigate("/admin/dashboard");
      } else {
        setMessage(res.data.error || "Login failed");
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <form onSubmit={handleSubmit} className="admin-login-form">
        <h2 className="admin-login-title">Admin Login</h2>
        {message && (
          <p className="admin-login-message">{message}</p>
        )}
        <div className="admin-form-group">
          <label>Email</label>
          <input
            name="email"
            type="email"
            placeholder="Enter your Email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="admin-form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your Password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <p className="admin-forgot-link">
          <a href="/admin/forgot-password">Forgot Password?</a>
        </p>
        <button
          type="submit"
          disabled={loading}
          className={`admin-login-btn ${loading ? "loading" : ""}`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;