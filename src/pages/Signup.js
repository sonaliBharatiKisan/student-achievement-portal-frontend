import { useState } from "react";

function Signup() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: "", uce: "", otp: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  // Step 1: Send OTP
  const sendOtp = async () => {
    setError("");
    setSuccess("");
    
    // Email domain validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@cumminscollege\.in$/;
    if (!emailPattern.test(form.email)) {
      setError("❌ Invalid email ID. Must be a cumminscollege.in email");
      return;
    }

    // UCE number validation
    const ucePattern = /^UCE\d{7,8}$/i;
    if (!ucePattern.test(form.uce)) {
      setError("❌ Invalid UCE number. Format: UCE followed by 7 or 8 digits");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://your-api-url.com/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          uce: form.uce,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setStep(2);
      setSuccess("✅ OTP sent to your email!");
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Create Password
  const verifyOtp = async () => {
    setError("");
    setSuccess("");
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,32}$/;
    if (!passwordRegex.test(form.password)) {
      setError("❌ Password must be 8-32 chars with uppercase, lowercase, digit & special character");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://your-api-url.com/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "OTP verification failed");
      }

      if (data.success) {
        setSuccess("✅ Signup successful! You can now login.");
        setTimeout(() => setStep(3), 2000);
      } else {
        setError(data.error || "OTP verification failed");
      }
    } catch (err) {
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Student Signup</h2>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                placeholder="student@cumminscollege.in"
                onChange={handleChange}
                value={form.email}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UCE Number
              </label>
              <input
                name="uce"
                placeholder="UCE1234567"
                onChange={handleChange}
                value={form.uce}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: UCE followed by 7-8 digits
              </p>
            </div>
            
            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OTP Code
              </label>
              <input
                name="otp"
                placeholder="Enter 6-digit OTP"
                onChange={handleChange}
                value={form.otp}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                maxLength="6"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Create Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                onChange={handleChange}
                value={form.password}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                8-32 characters with uppercase, lowercase, digit & special character
              </p>
            </div>

            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify & Signup"}
            </button>
            
            <button
              onClick={() => setStep(1)}
              className="w-full text-indigo-600 hover:text-indigo-700 font-medium py-2 text-sm"
            >
              ← Back to Email Entry
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Success!</h3>
            <p className="text-gray-600 mb-6">Your account has been created successfully.</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition"
            >
              Go to Login
            </button>
          </div>
        )}

        {step !== 3 && (
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Login here
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

export default Signup;