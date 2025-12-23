/* eslint-disable react-hooks/exhaustive-deps */
//frontend/src/components/StudentForm.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../App.css";
import "./StudentForm.css";

const API_BASE = process.env.REACT_APP_API_URL || 
                 (process.env.NODE_ENV === 'production' 
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
  const saveTimer = useRef(null);
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const getLoggedInEmail = () =>
    localStorage.getItem("studentEmail") ||
    localStorage.getItem("verifiedEmail") ||
    "";

  const getLoggedInUCE = () =>
    localStorage.getItem("studentUCE") || "";

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  // ✅ Load data on mount
  useEffect(() => {
    const loadStudentData = async () => {
      const loggedInEmail = getLoggedInEmail();
      const loggedInUCE = getLoggedInUCE();

      console.log("🔄 Initializing form for:", loggedInEmail, "UCE:", loggedInUCE);

      if (!loggedInEmail) {
        console.log("⚠️ No logged in email found");
        return;
      }

      try {
        setIsLoading(true);
        console.log("🌐 Fetching student data from server...");
        
        const res = await axios.get(
          `${API_BASE}/api/students/${encodeURIComponent(loggedInEmail)}`,
          { 
            headers: { "x-user-email": loggedInEmail },
            timeout: 15000
          }
        );
        
        console.log("✅ Server response:", res.data);
        
        if (res.data?.success && res.data?.student) {
          const s = res.data.student;
          
          // ✅ Map all fields from server response
          const prefill = {
            uce: s.uce || loggedInUCE || "",
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
          
          console.log("📝 Prefilling form with:", prefill);
          setFormData(prefill);
          
          if (prefill.profilePhoto) {
            setPhotoPreview(prefill.profilePhoto);
          }
          
          setDataLoaded(true);
        } else {
          // ✅ No existing data - set email and UCE from login
          console.log("📝 No existing data - creating new form");
          setFormData(prev => ({
            ...prev,
            email: loggedInEmail,
            uce: loggedInUCE
          }));
          setDataLoaded(true);
        }
      } catch (err) {
        console.error("❌ Prefill fetch error:", err?.response?.data || err.message);
        
        // ✅ On error, still set email and UCE from login
        setFormData(prev => ({
          ...prev,
          email: loggedInEmail,
          uce: loggedInUCE
        }));
        setDataLoaded(true);
        
        if (err.code === 'ECONNABORTED') {
          setMessage("⚠️ Server timeout - please try again");
        } else if (err.response?.status === 404) {
          console.log("📝 Student record not found - will create on save");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadStudentData();
  }, []);

  // ✅ Handle logout/login events
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "studentEmail" || e.key === "verifiedEmail") {
        const newEmail = getLoggedInEmail();
        const newUCE = getLoggedInUCE();
        
        if (!newEmail) {
          console.log("🔓 User logged out - clearing form");
          setFormData(INITIAL);
          setPhotoPreview("");
          setDataLoaded(false);
        } else {
          console.log("🔐 User logged in - reloading data");
          window.location.reload(); // Reload to fetch new user's data
        }
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleChange = (e) => {
    setMessage("");
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    setErrors((prev) => ({ ...prev, [name]: "" }));
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
        const newFormData = { ...formData, profilePhoto: base64 };
        setFormData(newFormData);
        setErrors((prev) => ({ ...prev, profilePhoto: "" }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview("");
    const newFormData = { ...formData, profilePhoto: "" };
    setFormData(newFormData);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    
    let newErrors = {};

    console.log("📝 Form data being submitted:", formData);

    // ✅ Validation
    if (!/^UCE\d{7}$/.test(formData.uce)) {
      newErrors.uce = "❌ UCE must be in format: UCE followed by 7 digits (e.g., UCE1234567).";
    }

    if (!formData.name || !/^[A-Za-z\s]+$/.test(formData.name)) {
      newErrors.name = "❌ Name must contain only letters and spaces.";
    }

    if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
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

    if (!formData.gender) {
      newErrors.gender = "❌ Please select gender.";
    }

    if (!formData.bloodGroup) {
      newErrors.bloodGroup = "❌ Please select blood group.";
    }

    if (!formData.year) {
      newErrors.year = "❌ Please select year of study.";
    }

    if (!formData.branch) {
      newErrors.branch = "❌ Please select branch.";
    }

    if (!formData.division) {
      newErrors.division = "❌ Please select division.";
    }

    if (!formData.address || formData.address.trim().length < 10) {
      newErrors.address = "❌ Address must be at least 10 characters.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const logged = getLoggedInEmail();
      if (!logged) {
        setMessage("❌ Please login first.");
        setIsLoading(false);
        return;
      }
      
      console.log("🚀 Submitting form data to server...");
      console.log("Email:", logged);
      console.log("Form data:", formData);
      
      // ✅ Send complete form data
      const response = await axios.post(`${API_BASE}/api/students`, formData, {
        headers: { 
          "x-user-email": logged,
          "Content-Type": "application/json"
        },
        timeout: 15000
      });
      
      console.log("✅ Server response:", response.data);
      
      if (response.data.success) {
        setMessage("✅ Student details saved successfully!");
        
        // ✅ Update localStorage with saved name
        if (formData.name) {
          localStorage.setItem("studentName", formData.name);
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setMessage("❌ " + (response.data.message || "Error saving student details."));
      }
    } catch (err) {
      console.error("❌ Submit error:", err);
      console.error("Response data:", err?.response?.data);
      
      if (err.code === 'ECONNABORTED') {
        setMessage("❌ Request timeout. Please try again.");
      } else if (err.response?.status === 500) {
        setMessage("❌ Server error. Please try again later.");
      } else if (err.response?.data?.message) {
        setMessage("❌ " + err.response.data.message);
      } else {
        setMessage("❌ Error saving student details. Please try again.");
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Show loading state while fetching data
  if (!dataLoaded && isLoading) {
    return (
      <div className="form-container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Loading your data...</h2>
          <p>Please wait while we fetch your profile information.</p>
        </div>
      </div>
    );
  }

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
          title="UCE is set during registration and cannot be changed"
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
          placeholder="Enter your full name"
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
        {errors.gender && <p className="error">{errors.gender}</p>}

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
        {errors.bloodGroup && <p className="error">{errors.bloodGroup}</p>}

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
        {errors.year && <p className="error">{errors.year}</p>}

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
        {errors.branch && <p className="error">{errors.branch}</p>}

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
        {errors.division && <p className="error">{errors.division}</p>}

        <label htmlFor="address">Address<span className="required">*</span></label>
        <textarea
          name="address"
          id="address"
          value={formData.address}
          onChange={handleChange}
          required
          placeholder="Enter your complete address"
          rows="3"
        ></textarea>
        {errors.address && <p className="error">{errors.address}</p>}

        <label htmlFor="phone">Phone Number<span className="required">*</span></label>
        <input
          type="text"
          name="phone"
          id="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          placeholder="10 digit phone number"
          maxLength="10"
        />
        {errors.phone && <p className="error">{errors.phone}</p>}

        <label htmlFor="altPhone">Alternate Phone Number</label>
        <input
          type="text"
          name="altPhone"
          id="altPhone"
          value={formData.altPhone}
          onChange={handleChange}
          placeholder="10 digit alternate number (optional)"
          maxLength="10"
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
          title="Email is set during registration and cannot be changed"
        />

        <label htmlFor="altEmail">Alternate Email</label>
        <input
          type="email"
          name="altEmail"
          id="altEmail"
          value={formData.altEmail}
          onChange={handleChange}
          placeholder="Alternate email (optional)"
        />
        {errors.altEmail && <p className="error">{errors.altEmail}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save / Update"}
        </button>
      </form>
    </div>
  );
}

export default StudentForm;