/* eslint-disable react-hooks/exhaustive-deps */
//frontend/src/components/StudentForm.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../App.css";
import "./StudentForm.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

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
  const saveTimer = useRef(null);
  const lastSavedRef = useRef(null);
  const fileInputRef = useRef(null);

  const getLoggedInEmail = () =>
    localStorage.getItem("studentEmail") ||
    localStorage.getItem("verifiedEmail") ||
    "";

  const getDraftKey = (email) =>
    email ? `studentForm:${email.toLowerCase()}` : null;

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  useEffect(() => {
    const boot = async () => {
      const loggedInEmail = getLoggedInEmail();

      if (loggedInEmail && formData.email !== loggedInEmail) {
        setFormData((prev) => ({ ...prev, email: loggedInEmail }));
      }

      const draftKey = getDraftKey(loggedInEmail);
      if (draftKey) {
        const raw = localStorage.getItem(draftKey);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            setFormData((prev) => ({ ...prev, ...parsed }));
            if (parsed.profilePhoto) {
              setPhotoPreview(parsed.profilePhoto);
            }
            lastSavedRef.current = JSON.stringify(parsed);
            return;
          } catch (err) {
            console.error("Draft parse error:", err);
          }
        }
      }

      if (loggedInEmail) {
        try {
          const res = await axios.get(
            `${API_BASE}/api/students/${encodeURIComponent(loggedInEmail)}`,
            { headers: { "x-user-email": loggedInEmail } }
          );
          if (res.data?.success && res.data?.student) {
            const s = res.data.student;
            const prefill = {
              uce: s.uce || "",
              name: s.name || "",
              dob: s.dob || "",
              gender: s.gender || "",
              bloodGroup: s.bloodGroup || "",
              address: s.address || "",
              phone: s.phone || "",
              altPhone: s.altPhone || "",
              email: s.email || loggedInEmail,
              altEmail: s.altEmail || "",
              year: s.year || "",
              branch: s.branch || "",
              division: s.division || "",
              profilePhoto: s.profilePhoto || ""
            };
            setFormData((prev) => ({ ...prev, ...prefill }));
            if (prefill.profilePhoto) {
              setPhotoPreview(prefill.profilePhoto);
            }
            const dk = getDraftKey(prefill.email);
            if (dk) {
              localStorage.setItem(dk, JSON.stringify(prefill));
              lastSavedRef.current = JSON.stringify(prefill);
            }
          }
        } catch (err) {
          console.error("Prefill fetch error:", err?.response?.data || err.message);
        }
      }
    };
    boot();
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "studentEmail" || e.key === "verifiedEmail") {
        const newEmail = getLoggedInEmail();
        if (!newEmail) {
          clearForm();
        } else {
          const dk = getDraftKey(newEmail);
          if (dk) {
            const raw = localStorage.getItem(dk);
            if (raw) {
              try {
                const parsed = JSON.parse(raw);
                setFormData((prev) => ({
                  ...INITIAL,
                  ...parsed,
                  email: newEmail,
                }));
                if (parsed.profilePhoto) {
                  setPhotoPreview(parsed.profilePhoto);
                }
                lastSavedRef.current = e.newValue;
                return;
              } catch (err) {
                console.error("Storage parse error:", err);
              }
            }
          }
          setFormData({ ...INITIAL, email: newEmail });
          setPhotoPreview("");
          lastSavedRef.current = null;
        }
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persistDraftAndMaybeSave = (data) => {
    const logged = getLoggedInEmail();
    const activeEmail = logged || data.email;
    const draftKey = getDraftKey(activeEmail);
    if (draftKey) {
      const toSave = JSON.stringify({ ...data, email: activeEmail });
      localStorage.setItem(draftKey, toSave);

      if (logged && isValidEmail(logged)) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(
          () => saveToServer({ ...data, email: logged }),
          800
        );
      }
    }
  };

  const handleChange = (e) => {
    setMessage("");
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    persistDraftAndMaybeSave({ ...formData, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, profilePhoto: "❌ Photo size must be less than 2MB" }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setPhotoPreview(base64);
        setFormData((prev) => ({ ...prev, profilePhoto: base64 }));
        setErrors((prev) => ({ ...prev, profilePhoto: "" }));
        persistDraftAndMaybeSave({ ...formData, profilePhoto: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview("");
    setFormData((prev) => ({ ...prev, profilePhoto: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    persistDraftAndMaybeSave({ ...formData, profilePhoto: "" });
  };

  const clearForm = () => {
    const email = getLoggedInEmail();
    const dk = getDraftKey(email);
    if (dk) localStorage.removeItem(dk);

    setFormData(INITIAL);
    setErrors({});
    setMessage("");
    setPhotoPreview("");
  };

  const saveToServer = async (payload) => {
    try {
      const logged = getLoggedInEmail();
      if (!logged) return;
      await axios.post(`${API_BASE}/api/students`, payload, {
        headers: { "x-user-email": logged },
      });
      lastSavedRef.current = JSON.stringify(payload);
    } catch (err) {
      console.error("Auto-save error:", err?.response?.data || err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!/^UCE\d{7}$/.test(formData.uce)) {
      newErrors.uce = "❌ UCE must be in format: UCE followed by 7 digits (e.g., UCE1234567).";
    }

    if (!/^[A-Za-z\s]+$/.test(formData.name)) {
      newErrors.name = "❌ Name must contain only letters and spaces.";
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "❌ Phone number must be 10 digits.";
    }

    if (formData.altPhone && !/^\d{10}$/.test(formData.altPhone)) {
      newErrors.altPhone = "❌ Alternate phone number must be 10 digits.";
    }

    if (formData.altEmail && !isValidEmail(formData.altEmail)) {
      newErrors.altEmail = "❌ Alternate email is not valid.";
    }

    const dobDate = new Date(formData.dob);
    const minDate = new Date("2000-01-01");
    const today = new Date();
    if (!formData.dob || dobDate < minDate || dobDate > today) {
      newErrors.dob = "❌ Date of Birth must be between Jan 1, 2000 and today!";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const logged = getLoggedInEmail();
      if (!logged) {
        setMessage("❌ Please login first.");
        return;
      }
      await axios.post(`${API_BASE}/api/students`, formData, {
        headers: { "x-user-email": logged },
      });
      setMessage("✅ Student details saved successfully!");
      const dk = getDraftKey(logged);
      if (dk)
        localStorage.setItem(
          dk,
          JSON.stringify({ ...formData, email: logged })
        );
      lastSavedRef.current = JSON.stringify({ ...formData, email: logged });
    } catch (err) {
      console.error(err);
      setMessage("❌ Error saving student details.");
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <div className="form-title-section">
          <h2>Student Registration Form</h2>
          <p className="form-subtitle">Please fill in your details accurately</p>
        </div>
        
        <div className="profile-photo-section">
          <div 
            className="photo-preview" 
            onClick={() => !photoPreview && fileInputRef.current?.click()}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="profile-image" />
            ) : (
              <div className="photo-placeholder-wrapper">
                <span className="photo-placeholder">👤</span>
                <span className="upload-text">Upload Photo</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="file-input"
            id="photo-upload"
          />
          {photoPreview && (
            <button type="button" onClick={handleRemovePhoto} className="remove-btn">
              Remove Photo
            </button>
          )}
          {errors.profilePhoto && <p className="error photo-error">{errors.profilePhoto}</p>}
        </div>
      </div>

      {message && (
        <p className={message.startsWith("✅") ? "success" : "error"}>{message}</p>
      )}

      <form onSubmit={handleSubmit}>
        <label htmlFor="uce">UCE<span className="required">*</span></label>
        <input
          type="text"
          name="uce"
          id="uce"
          value={formData.uce}
          onChange={handleChange}
          required
          disabled
        />
        {errors.uce && <p className="error">{errors.uce}</p>}

        <label htmlFor="name">Name<span className="required">*</span></label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        {errors.name && <p className="error">{errors.name}</p>}

        <label htmlFor="dob">Date of Birth<span className="required">*</span></label>
        <input
          type="date"
          name="dob"
          id="dob"
          value={formData.dob}
          onChange={handleChange}
          min="2000-01-01"
          max={new Date().toISOString().split("T")[0]}
          required
        />
        {errors.dob && <p className="error">{errors.dob}</p>}

        <label htmlFor="gender">Gender<span className="required">*</span></label>
        <select
          name="gender"
          id="gender"
          value={formData.gender}
          onChange={handleChange}
          required
        >
          <option value="">--Select--</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <label htmlFor="bloodGroup">Blood Group<span className="required">*</span></label>
        <select
          name="bloodGroup"
          id="bloodGroup"
          value={formData.bloodGroup}
          onChange={handleChange}
          required
        >
          <option value="">--Select--</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>

        <label htmlFor="year">Year of Study<span className="required">*</span></label>
        <select
          name="year"
          id="year"
          value={formData.year}
          onChange={handleChange}
          required
        >
          <option value="">--Select--</option>
          <option value="1st">1st</option>
          <option value="2nd">2nd</option>
          <option value="3rd">3rd</option>
          <option value="4th">4th</option>
        </select>

        <label htmlFor="branch">Branch<span className="required">*</span></label>
        <select
          name="branch"
          id="branch"
          value={formData.branch}
          onChange={handleChange}
          required
        >
          <option value="">--Select--</option>
          <option value="Computer">Comp</option>
          <option value="IT">IT</option>
          <option value="ENTC">ENTC</option>
          <option value="Instru">Instru</option>
          <option value="Mech">Mech</option>
        </select>

        <label htmlFor="division">Division<span className="required">*</span></label>
        <select
          name="division"
          id="division"
          value={formData.division}
          onChange={handleChange}
          required
        >
          <option value="">--Select--</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>

        <label htmlFor="address">Address<span className="required">*</span></label>
        <textarea
          name="address"
          id="address"
          value={formData.address}
          onChange={handleChange}
          required
        ></textarea>

        <label htmlFor="phone">Phone Number<span className="required">*</span></label>
        <input
          type="text"
          name="phone"
          id="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        {errors.phone && <p className="error">{errors.phone}</p>}

        <label htmlFor="altPhone">Alternate Phone Number</label>
        <input
          type="text"
          name="altPhone"
          id="altPhone"
          value={formData.altPhone}
          onChange={handleChange}
        />
        {errors.altPhone && <p className="error">{errors.altPhone}</p>}

        <label htmlFor="email">Email<span className="required">*</span></label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled
        />

        <label htmlFor="altEmail">Alternate Email</label>
        <input
          type="email"
          name="altEmail"
          id="altEmail"
          value={formData.altEmail}
          onChange={handleChange}
        />
        {errors.altEmail && <p className="error">{errors.altEmail}</p>}

        <button type="submit">Save / Update</button>
      </form>
    </div>
  );
}
export default StudentForm;