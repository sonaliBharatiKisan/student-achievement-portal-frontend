/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../App.css";
import "./StudentForm.css";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? window.location.origin
    : "http://localhost:5000");

const INITIAL = {
  uce: "",
  name: "",
  dob: "",
  gender: "",
  bloodGroup: "",
  address: "",
  phone: "",
  altPhone: "",
  email: "",
  altEmail: "",
  year: "",
  branch: "",
  division: "",
  profilePhoto: ""
};

function StudentForm() {
  const [formData, setFormData] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const getLoggedInEmail = () =>
    localStorage.getItem("studentEmail") ||
    localStorage.getItem("verifiedEmail") ||
    "";

  const getDraftKey = (email) =>
    email ? `studentForm:${email.toLowerCase()}` : null;

  const isValidEmail = (e) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  // 🔹 INITIAL LOAD
  useEffect(() => {
    const loadData = async () => {
      const email = getLoggedInEmail();
      const uce = localStorage.getItem("studentUCE") || "";

      if (!email) return;

      // Load draft (DO NOT RETURN)
      const dk = getDraftKey(email);
      if (dk) {
        const raw = localStorage.getItem(dk);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            setFormData(prev => ({ ...prev, ...parsed, email, uce }));
            if (parsed.profilePhoto) setPhotoPreview(parsed.profilePhoto);
          } catch {}
        }
      }

      // Always fetch server data
      try {
        const res = await axios.get(
          `${API_BASE}/api/students/${encodeURIComponent(email)}`,
          { headers: { "x-user-email": email } }
        );

        if (res.data?.success && res.data.student) {
          const s = res.data.student;
          const merged = {
            uce: s.uce || uce,
            name: s.name || "",
            dob: s.dob || "",
            gender: s.gender || "",
            bloodGroup: s.bloodGroup || "",
            address: s.address || "",
            phone: s.phone || "",
            altPhone: s.altPhone || "",
            email,
            altEmail: s.altEmail || "",
            year: s.year || "",
            branch: s.branch || "",
            division: s.division || "",
            profilePhoto: s.profilePhoto || ""
          };

          setFormData(merged);
          if (merged.profilePhoto) setPhotoPreview(merged.profilePhoto);
          localStorage.setItem(dk, JSON.stringify(merged));
        }
      } catch (err) {
        console.error("Prefill error:", err?.response?.data || err.message);
      }
    };

    loadData();
  }, []);

  const persistDraft = (data) => {
    const email = getLoggedInEmail();
    const dk = getDraftKey(email);
    if (dk) localStorage.setItem(dk, JSON.stringify(data));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    setErrors(prev => ({ ...prev, [name]: "" }));
    persistDraft(updated);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrors({ profilePhoto: "Photo must be under 2MB" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setPhotoPreview(base64);
      const updated = { ...formData, profilePhoto: base64 };
      setFormData(updated);
      persistDraft(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    let errs = {};
    if (!/^UCE\d{7}$/.test(formData.uce)) errs.uce = "Invalid UCE";
    if (!/^[A-Za-z\s]+$/.test(formData.name)) errs.name = "Invalid name";
    if (!/^\d{10}$/.test(formData.phone)) errs.phone = "Invalid phone";
    if (formData.altEmail && !isValidEmail(formData.altEmail))
      errs.altEmail = "Invalid alternate email";

    if (Object.keys(errs).length) {
      setErrors(errs);
      setIsLoading(false);
      return;
    }

    try {
      const email = getLoggedInEmail();
      const res = await axios.post(
        `${API_BASE}/api/students`,
        formData,
        { headers: { "x-user-email": email } }
      );

      if (res.data.success) {
        setMessage("✅ Student details saved successfully!");
        persistDraft(formData);
      } else {
        setMessage("❌ Save failed");
      }
    } catch (err) {
      setMessage("❌ Server error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Student Registration Form</h2>

      {message && (
        <p className={message.startsWith("✅") ? "success" : "error"}>
          {message}
        </p>
      )}

      <div className="profile-photo-section">
        {photoPreview ? (
          <img src={photoPreview} alt="Profile" />
        ) : (
          <button type="button" onClick={() => fileInputRef.current.click()}>
            Upload Photo
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handlePhotoChange}
        />
      </div>

      <form onSubmit={handleSubmit}>
        {Object.keys(INITIAL).map(key => (
          key !== "profilePhoto" && (
            <input
              key={key}
              name={key}
              value={formData[key]}
              onChange={handleChange}
              placeholder={key}
              disabled={key === "email" || key === "uce"}
            />
          )
        ))}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save / Update"}
        </button>
      </form>
    </div>
  );
}

export default StudentForm;