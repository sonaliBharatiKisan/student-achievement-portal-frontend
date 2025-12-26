import React, { useState, useEffect } from "react";
import "./AchievementForm.css";
import axios from "axios";

// ✅ Dynamic API Base URL - Works for both local and production
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://student-achievement-portal-backend-2.onrender.com";

const initialFormState = {
  organizerLocation: "",
  eventName: "",
  eventDate: "",
  levelCategory: "",
  level: "",
  position: "",
  organizerName: "",
  prize: "",
  awardType: "",
  amount: "",
  awardingOrganization: "",
  awardYear: "",
  courseName: "",
  startMonth: "",
  startYear: "",
  endMonth: "",
  endYear: "",
  workshopLocation: "",
  workshopName: "",
  seminarLocation: "",
  seminarName: "",
  paperTitle: "",
  journalPublisher: "",
  publicationDate: "",
  conferenceName: "",
  conferenceLocation: "",
  presentationDate: "",
  competitionLocation: "",
  projectTopic: "",
  author1: "",
  author2: "",
  author3: "",
  title: "",
  journalConferenceName: "",
  publisherName: "",
  indexing: "",
  publicationType: "",
  otherLocation: "",
  month: "",
  year: "",
  dateSelection: "",
  eventFrom: "",
  eventTo: "",
};

function AchievementForm({ onSuccess, editingAchievement, onCancelEdit }) {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [selectedSubType, setSelectedSubType] = useState("");
  const [formData, setFormData] = useState(initialFormState);
  const [certificateFile, setCertificateFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [hasCertificate, setHasCertificate] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingCertificate, setExistingCertificate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Load data when editing
  useEffect(() => {
    if (editingAchievement) {
      setIsEditMode(true);
      setShowOptions(true);
      setSelectedType(editingAchievement.type);
      setSelectedSubType(editingAchievement.category);
      setFormData({
        ...initialFormState,
        ...editingAchievement,
        eventDate: editingAchievement.eventDate
          ? new Date(editingAchievement.eventDate).toISOString().split("T")[0]
          : "",
        eventFrom: editingAchievement.eventFrom
          ? new Date(editingAchievement.eventFrom).toISOString().split("T")[0]
          : "",
        eventTo: editingAchievement.eventTo
          ? new Date(editingAchievement.eventTo).toISOString().split("T")[0]
          : "",
        publicationDate: editingAchievement.publicationDate
          ? new Date(editingAchievement.publicationDate).toISOString().split("T")[0]
          : "",
      });
      setExistingCertificate(editingAchievement.certificatePath);
      setHasCertificate(!!editingAchievement.certificatePath);
    }
  }, [editingAchievement]);

  const handleMainClick = () => {
    setShowOptions(true);
    setSelectedType("");
    setSelectedSubType("");
    setFormData(initialFormState);
    setCertificateFile(null);
    setSuccessMessage("");
    setHasCertificate(true);
    setIsEditMode(false);
    setExistingCertificate(null);
    if (onCancelEdit) onCancelEdit();
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setShowOptions(false);
    setSelectedType("");
    setSelectedSubType("");
    setFormData(initialFormState);
    setCertificateFile(null);
    setSuccessMessage("");
    setHasCertificate(true);
    setExistingCertificate(null);
    if (onCancelEdit) onCancelEdit();
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setSelectedSubType("");
    setFormData(initialFormState);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // ✅ Validate file type
      if (file.type !== "application/pdf") {
        alert("Please upload only PDF files");
        e.target.value = "";
        return;
      }
      // ✅ Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        e.target.value = "";
        return;
      }
      setCertificateFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent double submission
    
    const today = new Date().toISOString().split("T")[0];

    // ✅ Date validation
    if (formData.eventDate) {
      if (formData.eventDate > today) {
        alert("Event Date cannot be in the future.");
        return;
      }
    }

    if (formData.eventFrom || formData.eventTo) {
      if (!formData.eventFrom || !formData.eventTo) {
        alert("Please select BOTH From and To dates.");
        return;
      }
      if (formData.eventFrom > today) {
        alert("From Date cannot be in the future.");
        return;
      }
      if (formData.eventFrom > formData.eventTo) {
        alert("From Date cannot be after To Date.");
        return;
      }
    }

    // ✅ Validate publication date
    if (formData.publicationDate && formData.publicationDate > today) {
      alert("Publication Date cannot be in the future.");
      return;
    }

    const updatedFormData = {
      ...formData,
      prize: formData.prize && formData.prize.trim() !== "" ? formData.prize : "0",
    };

    const submissionData = new FormData();
    
    // ✅ Ensure type and category are strings
    submissionData.append("type", String(selectedType));
    submissionData.append("category", String(selectedSubType));

    // ✅ Append all form fields
    for (const key in updatedFormData) {
      if (updatedFormData[key] !== null && updatedFormData[key] !== undefined) {
        submissionData.append(key, updatedFormData[key]);
      }
    }

    // ✅ Append certificate if provided
    if (hasCertificate && certificateFile) {
      submissionData.append("certificate", certificateFile);
    }

    // ✅ Get user email from localStorage
    const email =
      localStorage.getItem("studentEmail") ||
      localStorage.getItem("email") ||
      JSON.parse(localStorage.getItem("user") || "{}")?.email ||
      "guest@example.com";
    submissionData.append("email", email);

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("Please login to continue");
        return;
      }

      let res;

      if (isEditMode && editingAchievement) {
        // ✅ UPDATE existing achievement
        res = await axios.put(
          `${API_BASE_URL}/api/achievements/${editingAchievement._id}`,
          submissionData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
            timeout: 30000, // 30 seconds timeout
          }
        );
        setSuccessMessage("Achievement updated successfully!");
      } else {
        // ✅ CREATE new achievement
        res = await axios.post(
          `${API_BASE_URL}/api/achievements`,
          submissionData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
            timeout: 30000, // 30 seconds timeout
          }
        );
        setSuccessMessage("Achievement submitted successfully!");
      }

      if (res.status === 200 || res.status === 201) {
        // ✅ Reset form after successful submission
        setCertificateFile(null);
        setFormData(initialFormState);
        setIsEditMode(false);
        setExistingCertificate(null);
        
        // ✅ Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);

        if (onSuccess) onSuccess();
        if (onCancelEdit) onCancelEdit();
      }
    } catch (err) {
      console.error("Submit Error:", err);
      
      // ✅ Better error handling
      if (err.response) {
        // Server responded with error
        alert(err.response.data?.message || "Server error occurred");
      } else if (err.request) {
        // Request made but no response
        alert("Network error. Please check your connection and try again.");
      } else {
        // Something else happened
        alert("An error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Delete Certificate
  const handleDeleteCertificate = async () => {
    if (!editingAchievement) return;

    if (!window.confirm("Are you sure you want to delete this certificate?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("Please login to continue");
        return;
      }

      const res = await axios.delete(
        `${API_BASE_URL}/api/achievements/${editingAchievement._id}/certificate`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000,
        }
      );

      if (res.status === 200) {
        setExistingCertificate(null);
        setCertificateFile(null);
        alert("Certificate deleted successfully!");
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error("Delete Certificate Error:", err);
      alert(err.response?.data?.message || "Failed to delete certificate");
    }
  };

  // ✅ Helper function: Render Date Selection
  const renderDateSelection = () => {
    return (
      <div className="form-group">
        <label>
          Select Date Type:<span style={{ color: "red" }}>*</span>
        </label>
        <select
          name="dateSelection"
          value={formData.dateSelection || ""}
          onChange={handleChange}
          required
        >
          <option value="">-- Select --</option>
          <option value="single">Single Date</option>
          <option value="range">Date Range</option>
        </select>

        {formData.dateSelection === "single" && (
          <div className="form-group">
            <label>
              Event Date:<span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate || ""}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
        )}

        {formData.dateSelection === "range" && (
          <>
            <div className="form-group">
              <label>
                From Date:<span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="date"
                name="eventFrom"
                value={formData.eventFrom || ""}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div className="form-group">
              <label>
                To Date:<span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="date"
                name="eventTo"
                value={formData.eventTo || ""}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </>
        )}
      </div>
    );
  };

  // ✅ Helper function: Render Certificate Section
  const renderCertificateSection = () => {
    return (
      <>
        <div className="form-group">
          <label>
            Do you have a certificate?<span style={{ color: "red" }}>*</span>
          </label>
          <select
            value={hasCertificate ? "yes" : "no"}
            onChange={(e) => setHasCertificate(e.target.value === "yes")}
            required
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        {hasCertificate && (
          <div className="form-group">
            <label>Upload Certificate (PDF, max 5MB):</label>
            {existingCertificate && (
              <div
                style={{
                  marginBottom: "10px",
                  padding: "10px",
                  background: "#f0f0f0",
                  borderRadius: "5px",
                }}
              >
                <p style={{ margin: "0 0 10px 0" }}>
                  <strong>Current Certificate:</strong>{" "}
                  {existingCertificate.split("/").pop()}
                </p>
                <button
                  type="button"
                  onClick={handleDeleteCertificate}
                  style={{
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "3px",
                    cursor: "pointer",
                  }}
                >
                  Delete Certificate
                </button>
              </div>
            )}
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />
            {existingCertificate && (
              <small
                style={{ color: "#666", display: "block", marginTop: "5px" }}
              >
                Upload a new file to replace the existing certificate
              </small>
            )}
          </div>
        )}
      </>
    );
  };

  // ✅ Helper function: Render Action Buttons
  const renderActionButtons = () => {
    return (
      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting}
          style={{
            opacity: isSubmitting ? 0.6 : 1,
            cursor: isSubmitting ? "not-allowed" : "pointer"
          }}
        >
          {isSubmitting 
            ? (isEditMode ? "Updating..." : "Submitting...") 
            : (isEditMode ? "Update Achievement" : "Submit Achievement")}
        </button>
        {isEditMode && (
          <button
            type="button"
            onClick={handleCancelEdit}
            disabled={isSubmitting}
            style={{
              padding: "10px 20px",
              background: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
        )}
      </div>
    );
  };

  const renderSubTypeOptions = () => {
    let options = [];
    if (selectedType === "Extra-Curricular") {
      options = ["Sports", "Cultural"];
    } else if (selectedType === "Co-Curricular") {
      options = [
        "Workshop",
        "Seminar/Webinar",
        "Project Competition",
        "Paper Presentation",
        "Paper Publication",
        "Hackathon",
        "Code Competition",
        "Other",
      ];
    } else if (selectedType === "Courses") {
      options = ["Coursera", "NPTEL", "Udemy", "Others"];
    } else if (selectedType === "Special Achievement") {
      options = ["Scholarship", "Cash Prize"];
    }

    return (
      <div className="form-group">
        <label>Select {selectedType} Activity:</label>
        <select
          className="form-control"
          value={selectedSubType}
          onChange={(e) => setSelectedSubType(e.target.value)}
          required
        >
          <option value="">--Select--</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderForm = () => {
    if (!selectedSubType) return null;

    // Workshop, Seminar/Webinar, Other
    if (["Workshop", "Seminar/Webinar", "Other"].includes(selectedSubType)) {
      return (
        <form onSubmit={handleSubmit} className="form-container">
          <h3>
            {isEditMode ? `Edit ${selectedSubType}` : `${selectedSubType} Details`}
          </h3>

          <div className="form-group">
            <label>
              {selectedSubType} Location:<span style={{ color: "red" }}>*</span>
            </label>
            <select
              name={
                selectedSubType === "Workshop"
                  ? "workshopLocation"
                  : selectedSubType === "Seminar/Webinar"
                  ? "seminarLocation"
                  : "otherLocation"
              }
              value={
                selectedSubType === "Workshop"
                  ? formData.workshopLocation || ""
                  : selectedSubType === "Seminar/Webinar"
                  ? formData.seminarLocation || ""
                  : formData.otherLocation || ""
              }
              onChange={handleChange}
              required
            >
              <option value="">-- Select Location --</option>
              <option value="Within">Within</option>
              <option value="Outside">Outside</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              Level:<span style={{ color: "red" }}>*</span>
            </label>
            <select
              name="level"
              value={formData.level || ""}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Level --</option>
              <option value="Intra-College">Intra-College</option>
              <option value="Inter-College">Inter-College</option>
              <option value="State Level">State Level</option>
              <option value="National Level">National Level</option>
              <option value="International Level">International Level</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              {selectedSubType} Name:<span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name={
                selectedSubType === "Workshop"
                  ? "workshopName"
                  : selectedSubType === "Seminar/Webinar"
                  ? "seminarName"
                  : "eventName"
              }
              value={
                selectedSubType === "Workshop"
                  ? formData.workshopName || ""
                  : selectedSubType === "Seminar/Webinar"
                  ? formData.seminarName || ""
                  : formData.eventName || ""
              }
              placeholder={
                selectedSubType === "Workshop"
                  ? "e.g. Full Stack Workshop"
                  : selectedSubType === "Seminar/Webinar"
                  ? "e.g. Study Abroad Seminar"
                  : "e.g. Event Name"
              }
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              Organizer Name:<span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g ccoew, pict"
              name="organizerName"
              value={formData.organizerName || ""}
              onChange={handleChange}
              required
            />
          </div>

          {renderDateSelection()}
          {renderCertificateSection()}
          {renderActionButtons()}
        </form>
      );
    }

    // Project Competition & Paper Presentation
    if (["Project Competition", "Paper Presentation"].includes(selectedSubType)) {
      return (
        <form onSubmit={handleSubmit} className="form-container">
          <h3>
            {isEditMode
              ? `Edit ${selectedSubType}`
              : `${selectedSubType} Details`}
          </h3>

          <div className="form-group">
            <label>
              Competition Location:<span style={{ color: "red" }}>*</span>
            </label>
            <select
              name="competitionLocation"
              value={formData.competitionLocation || ""}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Location --</option>
              <option value="Within">Within</option>
              <option value="Outside">Outside</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              Level:<span style={{ color: "red" }}>*</span>
            </label>
            <select
              name="level"
              value={formData.level || ""}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Level --</option>
              <option value="Intra-College">Intra-College</option>
              <option value="Inter-College">Inter-College</option>
              <option value="State Level">State Level</option>
              <option value="National Level">National Level</option>
              <option value="International Level">International Level</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              {selectedSubType === "Project Competition"
                ? "Project Topic:"
                : "Paper Topic:"}
              <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="projectTopic"
              value={formData.projectTopic || ""}
              onChange={handleChange}
              placeholder={
                selectedSubType === "Project Competition"
                  ? "e.g. AI Based Chatbot"
                  : "e.g. Renewable Energy Solutions"
              }
              required
            />
          </div>

          {renderDateSelection()}

          <div className="form-group">
            <label>
              Position:<span style={{ color: "red" }}>*</span>
            </label>
            <select
              name="position"
              value={formData.position || ""}
              onChange={handleChange}
              required
            >
              <option value="">-- Select --</option>
              <option value="Winner">Winner</option>
              <option value="Runner-up">Runner Up</option>
              <option value="Participation">Participation</option>
            </select>
          </div>

          {(formData.position === "Winner" ||
            formData.position === "Runner-up") && (
            <div className="form-group">
              <label>Prize:</label>
              <input
                type="text"
                name="prize"
                value={formData.prize || ""}
                onChange={handleChange}
                placeholder="e.g. 10000"
              />
            </div>
          )}

          {renderCertificateSection()}
          {renderActionButtons()}
        </form>
      );
    }

    // Paper Publication
    if (selectedSubType === "Paper Publication") {
      return (
        <form onSubmit={handleSubmit} className="form-container">
          <h3>
            {isEditMode ? "Edit Paper Publication" : "Paper Publication Details"}
          </h3>

          <div className="form-group">
            <label>
              Title of Paper:<span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Artificial Intelligence in Healthcare"
              value={formData.title || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              Authors:<span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="author1"
              placeholder="Enter Author 1"
              value={formData.author1 || ""}
              onChange={handleChange}
              required
              style={{ marginBottom: "10px" }}
            />
            <input
              type="text"
              name="author2"
              placeholder="Enter Author 2 (Optional)"
              value={formData.author2 || ""}
              onChange={handleChange}
              style={{ marginBottom: "10px" }}
            />
            <input
              type="text"
              name="author3"
              placeholder="Enter Author 3 (Optional)"
              value={formData.author3 || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Journal / Conference Name:<span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="journalConferenceName"
              placeholder="e.g. International Conference on AI 2025"
              value={formData.journalConferenceName || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              Publisher Name:<span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="publisherName"
              placeholder="e.g. IEEE"
              value={formData.publisherName || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              Publication Date:<span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="date"
              name="publicationDate"
              value={formData.publicationDate || ""}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>
              Indexing:<span style={{ color: "red" }}>*</span>
            </label>
            <select
              name="indexing"
              value={formData.indexing || ""}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Indexing --</option>
              <option value="Scopus">Scopus</option>
              <option value="Non-Scopus">Non-Scopus</option>
              <option value="Web of Science">Web of Science</option>
              <option value="UGC">UGC</option>
              <option value="Peer Reviewed">Peer Reviewed</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              Type of Publication:<span style={{ color: "red" }}>*</span>
            </label>
            <select
              name="publicationType"
              value={formData.publicationType || ""}
              onChange={handleChange}
              required
            >
              <option value="">-- Select --</option>
              <option value="Journal">Journal</option>
              <option value="Conference">Conference</option>
              <option value="Book Chapter">Book Chapter</option>
              <option value="Patent">Patent</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              Level of Conference / Journal:<span style={{ color: "red" }}>*</span>
            </label>
            <select
              name="level"
              value={formData.level || ""}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Level --</option>
              <option value="International">International</option>
              <option value="National">National</option>
              <option value="State">State</option>
              <option value="Local">Local</option>
            </select>
          </div>

          {renderCertificateSection()}
          {renderActionButtons()}
        </form>
      );
    }

    // Hackathon & Code Competition
    if (["Hackathon", "Code Competition"].includes(selectedSubType)) {
      return (
        <form onSubmit={handleSubmit} className="form-container">
          <h3>
            {isEditMode ? `Edit ${selectedSubType}` : `${selectedSubType} Form`}
          </h3>

          <div className="form-group">
            <label>
              Location of Event:<span style={{ color: "red" }}>*</span>
            </label>
            <select
              name="organizerLocation"
              value={formData.organizerLocation || ""}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Location --</option>
              <option value="Within">Within</option>
              <option value="Outside">Outside</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              Level:<span style={{ color: "red" }}>*</span>
            </label>
            <select
              name="level"
              value={formData.level || ""}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Level --</option>
              <option value="Intra-College">Intra-College</option>
              <option value="Inter-College">Inter-College</option>
              <option value="State Level">State Level</option>
              <option value="National Level">National Level</option>
              <option value="International Level">International Level</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              {selectedSubType === "Hackathon"
                ? "Hackathon Name"
                : "Competition Name"}
              <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="eventName"
              value={formData.eventName || ""}
              onChange={handleChange}
              placeholder={
                selectedSubType === "Hackathon"
                  ? "e.g Women In Tech"
                  : "e.g Buffer 2.0"
              }
              required
            />
          </div>

          <div className="form-group">
            <label>
              Organizer Name:<span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="organizerName"
              value={formData.organizerName || ""}
              onChange={handleChange}
              placeholder="e.g CCOEW Code Club"
              required
            />
          </div>

          {renderDateSelection()}

          <div className="form-group">
            <label>
              Position:<span style={{ color: "red" }}>*</span>
            </label>
            <select
              name="position"
              value={formData.position || ""}
              onChange={handleChange}
              required
            >
              <option value="">--Select--</option>
              <option value="Winner">Winner</option>
              <option value="Runner-up">Runner-up</option>
              <option value="Participation">Participation</option>
            </select>
          </div>

          {(formData.position === "Winner" ||
            formData.position === "Runner-up") && (
            <div className="form-group">
              <label>Prize:</label>
              <input
                type="text"
                name="prize"
                value={formData.prize || ""}
                onChange={handleChange}
                placeholder="e.g. 5000"
              />
            </div>
          )}

          {renderCertificateSection()}
          {renderActionButtons()}
        </form>
      );
    }

    // Sports & Cultural
    if (["Sports", "Cultural"].includes(selectedSubType)) {
      return (
        <form onSubmit={handleSubmit} className="form-container">
          <h3>
            {isEditMode ? `Edit ${selectedSubType}` : `${selectedSubType} Form`}
          </h3>

          <div className="form-group">
            <label>
              Competition Location:<span style={{ color: "red" }}>*</span>
            </label>
            <select
              name="competitionLocation"
              value={formData.competitionLocation || ""}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Location --</option>
              <option value="Within">Within</option>
              <option value="Outside">Outside</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              Level:<span style={{ color: "red" }}>*</span>
            </label>
            <select
              name="level"
              value={formData.level || ""}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Level --</option>
              <option value="Intra-College">Intra-College</option>
              <option value="Inter-College">Inter-College</option>
              <option value="State Level">State Level</option>
              <option value="National Level">National Level</option>
              <option value="International Level">International Level</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              Event Name:<span style={{ color: "red" }}>*</span>
            </label>
            <input
              name="eventName"
              type="text"
              value={formData.eventName || ""}
              onChange={handleChange}
              placeholder={
                selectedSubType === "Sports" ? "e.g. Pentacle" : "e.g. Gandhaar"
              }
              required
            />
          </div>

          <div className="form-group">
            <label>
              Organizer Name:<span style={{ color: "red" }}>*</span>
            </label>
            <input
              name="organizerName"
              type="text"
              value={formData.organizerName || ""}
              onChange={handleChange}
              placeholder="e.g CCOEW"
              required
            />
          </div>

          {renderDateSelection()}

          <div className="form-group">
            <label>
              Position:<span style={{ color: "red" }}>*</span>
            </label>
            <select
              name="position"
              value={formData.position || ""}
              onChange={handleChange}
              required
            >
              <option value="">--Select--</option>
              <option value="Winner">Winner</option>
              <option value="Runner-up">Runner-up</option>
              <option value="Participation">Participation</option>
            </select>
          </div>

          {(formData.position === "Winner" ||
            formData.position === "Runner-up") && (
            <div className="form-group">
              <label>Prize:</label>
              <input
                type="text"
                name="prize"
                value={formData.prize || ""}
                onChange={handleChange}
                placeholder="e.g. 3000"
              />
            </div>
          )}

          {renderCertificateSection()}
          {renderActionButtons()}
        </form>
      );
    }

    // Courses Form
    if (
      selectedType === "Courses" &&
      (selectedSubType === "Others" ||
        selectedSubType === "Coursera" ||
        selectedSubType === "NPTEL" ||
        selectedSubType === "Udemy")
    ) {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const currentYear = new Date().getFullYear();
      const years = Array.from({ length: 31 }, (_, i) => currentYear - 30 + i);

      return (
        <form onSubmit={handleSubmit} className="form-container">
          <h3>
            {isEditMode
              ? `Edit ${selectedSubType} Course`
              : `${selectedSubType} Course Details`}
          </h3>

          <div className="form-group">
            <label>
              Course Name:<span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="courseName"
              value={formData.courseName || ""}
              onChange={handleChange}
              placeholder={
                selectedSubType === "NPTEL"
                  ? "e.g. Programming in C"
                  : selectedSubType === "Coursera"
                  ? "e.g. Machine Learning by Andrew Ng"
                  : selectedSubType === "Udemy"
                  ? "e.g. Full Stack Web Development"
                  : "Enter course name"
              }
              required
            />
          </div>

          <div className="form-group horizontal">
            <label>
              Start Date:<span style={{ color: "red" }}>*</span>
            </label>
            <select
              name="startMonth"
              value={formData.startMonth || ""}
              onChange={handleChange}
              required
            >
              <option value="">Month</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              name="startYear"
              value={formData.startYear || ""}
              onChange={handleChange}
              required
            >
              <option value="">Year</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group horizontal">
            <label>
              End Date:<span style={{ color: "red" }}>*</span>
            </label>
            <select
              name="endMonth"
              value={formData.endMonth || ""}
              onChange={handleChange}
              required
            >
              <option value="">Month</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              name="endYear"
              value={formData.endYear || ""}
              onChange={handleChange}
              required
            >
              <option value="">Year</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {renderCertificateSection()}
          {renderActionButtons()}
        </form>
      );
    }

    // Special Achievement
    if (selectedType === "Special Achievement") {
      const currentYear = new Date().getFullYear();
      const years = Array.from({ length: 31 }, (_, i) => currentYear - 30 + i);
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      return (
        <form onSubmit={handleSubmit} className="form-container">
          <h3>
            {isEditMode
              ? `Edit ${selectedSubType} Achievement`
              : `${selectedSubType} Achievement`}
          </h3>

          <div className="form-group">
            <label>
              Type of Award:<span style={{ color: "red" }}>*</span>
            </label>
            <input
              name="awardType"
              type="text"
              value={selectedSubType}
              readOnly
              style={{ background: "#f0f0f0" }}
            />
          </div>

          <div className="form-group">
            <label>
              Amount:<span style={{ color: "red" }}>*</span>
            </label>
            <input
              name="amount"
              type="number"
              min="0"
              value={formData.amount || ""}
              onChange={handleChange}
              placeholder="e.g. 50000"
              required
            />
          </div>

          <div className="form-group">
            <label>
              Awarding Organization:<span style={{ color: "red" }}>*</span>
            </label>
            <input
              name="awardingOrganization"
              type="text"
              value={formData.awardingOrganization || ""}
              onChange={handleChange}
              placeholder={
                selectedSubType === "Scholarship"
                  ? "e.g. Lila Poonawalla Scholarship"
                  : "e.g. TCS"
              }
              required
            />
          </div>

          {selectedSubType === "Scholarship" && (
            <div className="form-group horizontal">
              <label>
                Start Year:<span style={{ color: "red" }}>*</span>
              </label>
              <select
                name="startYear"
                value={formData.startYear || ""}
                onChange={handleChange}
                required
              >
                <option value="">Select Start Year</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <label>
                End Year:<span style={{ color: "red" }}>*</span>
              </label>
              <select
                name="endYear"
                value={formData.endYear || ""}
                onChange={handleChange}
                required
              >
                <option value="">Select End Year</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedSubType !== "Scholarship" && (
            <div className="form-group horizontal">
              <label>
                Month:<span style={{ color: "red" }}>*</span>
              </label>
              <select
                name="month"
                value={formData.month || ""}
                onChange={handleChange}
                required
              >
                <option value="">Select Month</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <label>
                Year:<span style={{ color: "red" }}>*</span>
              </label>
              <select
                name="year"
                value={formData.year || ""}
                onChange={handleChange}
                required
              >
                <option value="">Select Year</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          {renderCertificateSection()}
          {renderActionButtons()}
        </form>
      );
    }

    return null;
  };

  return (
    <div className="card">
      <h2>🎓 Achievement Portal</h2>
      {!isEditMode && (
        <button className="main-btn" onClick={handleMainClick}>
          + Add New Achievement
        </button>
      )}
      {isEditMode && (
        <div
          style={{
            padding: "10px",
            background: "#fff3cd",
            borderRadius: "5px",
            marginBottom: "15px",
          }}
        >
          <strong>Editing Mode</strong> - Update the achievement below
        </div>
      )}

      {showOptions && !isEditMode && (
        <div className="button-group">
          <button
            className="type-btn"
            onClick={() => handleTypeSelect("Co-Curricular")}
          >
            Co-Curricular
          </button>
          <button
            className="type-btn"
            onClick={() => handleTypeSelect("Extra-Curricular")}
          >
            Extra-Curricular
          </button>
          <button
            className="type-btn"
            onClick={() => handleTypeSelect("Courses")}
          >
            Courses
          </button>
          <button
            className="type-btn"
            onClick={() => handleTypeSelect("Special Achievement")}
          >
            Special Achievement
          </button>
        </div>
      )}

      {selectedType && renderSubTypeOptions()}
      {renderForm()}
      {successMessage && (
        <div
          className="success-msg"
          style={{
            padding: "15px",
            background: "#d4edda",
            color: "#155724",
            border: "1px solid #c3e6cb",
            borderRadius: "5px",
            marginTop: "15px",
            textAlign: "center",
          }}
        >
          {successMessage}
        </div>
      )}
    </div>
  );
}

export default AchievementForm;