/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../App.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
};

function StudentForm() {
  const [formData, setFormData] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const saveTimer = useRef(null);
  const lastSavedRef = useRef(null);

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
            lastSavedRef.current = JSON.stringify(parsed);
            return;
          } catch {}
        }
      }

      if (loggedInEmail) {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/api/students/${encodeURIComponent(loggedInEmail)}`,
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
            };
            setFormData((prev) => ({ ...prev, ...prefill }));
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
                lastSavedRef.current = e.newValue;
                return;
              } catch {}
            }
          }
          setFormData({ ...INITIAL, email: newEmail });
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
    setErrors((prev) => ({ ...prev, [name]: "" })); // clear error
    persistDraftAndMaybeSave({ ...formData, [name]: value });
  };

  const clearForm = () => {
    const email = getLoggedInEmail();
    const dk = getDraftKey(email);
    if (dk) localStorage.removeItem(dk);

    setFormData(INITIAL);
    setErrors({});
    setMessage("");
  };

  const saveToServer = async (payload) => {
    try {
      const logged = getLoggedInEmail();
      if (!logged) return;
      await axios.post(`${API_BASE_URL}/api/students`, payload, {
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
      newErrors.uce = "❌ USN must be in format: UCE followed by 7 digits (e.g., UCE1234567).";
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
      await axios.post(`${API_BASE_URL}/api/students`, formData, {
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
      <h2>Student Registration Form</h2>
      {message && (
        <p className={message.startsWith("✅") ? "success" : "error"}>{message}</p>
      )}

      <form onSubmit={handleSubmit}>
        <label htmlFor="uce">USN<span style={{ color: "red" }}>*</span></label>
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

        <label htmlFor="name">Name<span style={{ color: "red" }}>*</span></label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        {errors.name && <p className="error">{errors.name}</p>}

        <label htmlFor="dob">Date of Birth<span style={{ color: "red" }}>*</span></label>
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

        <label htmlFor="gender">Gender<span style={{ color: "red" }}>*</span></label>
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

        <label htmlFor="bloodGroup">Blood Group<span style={{ color: "red" }}>*</span></label>
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

        <label htmlFor="address">Address<span style={{ color: "red" }}>*</span></label>
        <textarea
          name="address"
          id="address"
          value={formData.address}
          onChange={handleChange}
          required
        ></textarea>

        <label htmlFor="phone">Phone Number<span style={{ color: "red" }}>*</span></label>
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

        <label htmlFor="email">Email<span style={{ color: "red" }}>*</span></label>
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