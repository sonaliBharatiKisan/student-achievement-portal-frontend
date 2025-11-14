import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function AdminSignup() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: "", otp: "", password: "" });
  const [message, setMessage] = useState(""); // Show messages
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const sendOtp = async () => {
    try {
      const res = await axios.post("http://localhost:5000/admin/send-otp", {
        email: form.email,
      });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await axios.post("http://localhost:5000/admin/verify-otp", form);
      if (res.data.message === "Admin created successfully") {
        alert("Signup successful! Redirecting to login...");
        navigate("/admin/login");
      } else {
        setMessage(res.data.message || "OTP verification failed");
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "OTP verification failed");
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
        <h2 style={{ marginBottom: "20px", color: "#003366" }}>Admin Signup</h2>

        {message && (
          <p style={{ color: "red", fontWeight: "bold" }}>{message}</p>
        )}

        {step === 1 && (
          <div>
            <div style={{ marginBottom: "15px", textAlign: "left" }}>
              <label>Email</label>
              <input
                name="email"
                placeholder="Enter your Email"
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
                value={form.otp}
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
            <button
              onClick={verifyOtp}
              style={{
                width: "100%",
                padding: "10px",
                background: "linear-gradient(to right, #26b848, #218838)",
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

        <p style={{ marginTop: "15px" }}>
          Already have an account?{" "}
          <Link to="/admin/login" style={{ color: "#003366", fontWeight: "bold" }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AdminSignup;
