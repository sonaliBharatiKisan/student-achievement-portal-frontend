import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
    setLoading(true);

    try {
      // ✅ Use environment variable for API endpoint
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, form, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data.success) {
        // ✅ Save token + student email consistently
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("uce_no", res.data.uce);
        localStorage.setItem("studentEmail", form.email); // ✅ FIX (this is what StudentForm will use)

        alert("✅ Login successful!");
        navigate("/student-form"); // ✅ Go directly to student form
      } else {
        alert(res.data.error || "Login failed");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Server error. Please try again.");
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
        overflow: "hidden",
      }}
    >
      <form
        onSubmit={handleSubmit}
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
            marginBottom: "20px",
            color: "#003366",
          }}
        >
          Login
        </h2>

        <div style={{ textAlign: "left" }}>
          <label>Email</label>
          <input
            name="email"
            type="email"
            placeholder="Enter Email"
            value={form.email}
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

        <div style={{ textAlign: "left" }}>
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={form.password}
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

        <p
          style={{
            textAlign: "right",
            fontSize: "14px",
            marginTop: "-5px",
            marginBottom: "10px",
          }}
        >
          <a
            href="/forgot-password"
            style={{ color: "#007bff", textDecoration: "none" }}
          >
            Forgot Password
          </a>
        </p>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            background: loading
              ? "#ccc"
              : "linear-gradient(to right, #28a745, #218838)",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;