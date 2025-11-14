import React, { useState } from "react";
import "./AchievementForm.css";
import axios from "axios";

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
  publicationType: "", // Changed from "type" to avoid conflicts
  otherLocation: "",
  month: "",
  year: "",
};

function AchievementForm({ onSuccess }) {  // Added onSuccess prop
  const [showOptions, setShowOptions] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [selectedSubType, setSelectedSubType] = useState("");
  const [formData, setFormData] = useState(initialFormState);
  const [certificateFile, setCertificateFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [hasCertificate, setHasCertificate] = useState(true);

  const handleMainClick = () => {
    setShowOptions(true);
    setSelectedType("");
    setSelectedSubType("");
    setFormData(initialFormState);
    setCertificateFile(null);
    setSuccessMessage("");
    setHasCertificate(true);
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
    setCertificateFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedFormData = {
      ...formData,
      prize: formData.prize && formData.prize.trim() !== "" ? formData.prize : "0",
    };

    console.log("Submitting Data:", updatedFormData);

    const submissionData = new FormData();
    submissionData.append("type", selectedType);
    submissionData.append("category", selectedSubType);

    for (const key in updatedFormData) {
      submissionData.append(key, updatedFormData[key]);
    }

    if (hasCertificate && certificateFile) {
      submissionData.append("certificate", certificateFile);
    }

    // Standardized email retrieval
    const email =
      localStorage.getItem("studentEmail") ||
      localStorage.getItem("email") ||
      JSON.parse(localStorage.getItem("user") || "{}")?.email ||
      "guest@example.com";
    submissionData.append("email", email);

    try {
      const token = localStorage.getItem("token");

const res = await axios.post(
  "http://localhost:5000/api/achievements",
  submissionData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`, // ✅ backend uses this to get uce_no
    },
  }
);

      if (res.status === 201) { // Changed to 201 to match backend
        setSuccessMessage(res.data.message || "Achievement submitted successfully!");
        setCertificateFile(null);
        setFormData(initialFormState);
        
        // Call the onSuccess callback to refresh the achievements table
        if (onSuccess) {
          onSuccess();
        }
      } else {
        alert(res.data.message || "Upload failed");
      }
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Something went wrong!");
    }
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

    // Co-curricular activity: Workshop, Seminar/Webinar, Other
    if (
      selectedSubType === "Workshop" ||
      selectedSubType === "Seminar/Webinar" ||
      selectedSubType === "Other"
    ) {
      return (
        <form onSubmit={handleSubmit} className="form-container">
          <h3>{selectedSubType} Details</h3>
          
          <div className="form-group">
            <label>{selectedSubType} Location:<span style={{ color: "red" }}>*</span></label> 
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
            <label>Level:<span style={{ color: "red" }}>*</span></label>
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
            <label>{selectedSubType} Name:<span style={{ color: "red" }}>*</span></label>
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
            <label>Organizer Name:<span style={{ color: "red" }}>*</span></label>
            <input
              type="text"
              placeholder="e.g ccoew,pict" 
              name="organizerName"
              value={formData.organizerName || ""}

              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Date:<span style={{ color: "red" }}>*</span></label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Upload Certificate (PDF):<span style={{ color: "red" }}>*</span></label>
            <input type="file" accept="application/pdf" onChange={handleFileChange} required />
          </div>

          <button type="submit" className="submit-btn">Submit</button>
        </form>
      );
    }

    // Co-curricular: Project Competition & Paper Presentation
    if (selectedSubType === "Project Competition" || selectedSubType === "Paper Presentation") {
      return (
        <form onSubmit={handleSubmit} className="form-container">
          <h3>{selectedSubType} Details</h3>
          
          <div className="form-group">
            <label>Competition Location:<span style={{ color: "red" }}>*</span></label>
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
            <label>Level:<span style={{ color: "red" }}>*</span></label>
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
              {selectedSubType === "Project Competition" ? "Project Topic:" : "Paper Topic:"}
           <span style={{ color: "red" }}>*</span> </label>
            <input
              type="text"
              name="projectTopic"
              value={formData.projectTopic || ""}
              onChange={handleChange}
              placeholder={
                selectedSubType === "Project Competition"
                  ? "e.g. AI Based Chatbot"
                  : "e.g. Renewable Energy Solutions "
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Date:<span style={{ color: "red" }}>*</span></label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Position:<span style={{ color: "red" }}>*</span></label>
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

          {(formData.position === "Winner" || formData.position === "Runner-up") && (
            <div className="form-group">
              <label>Prize:</label>
              <input
                type="text"
                name="prize"
                value={formData.prize || ""}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-group">
            <label>Upload Certificate (PDF):<span style={{ color: "red" }}>*</span></label>
            <input type="file" accept="application/pdf" onChange={handleFileChange} required />
          </div>

          <button type="submit" className="submit-btn">Submit</button>
        </form>
      );
    }

    // Paper Publication
    if (selectedSubType === "Paper Publication") {
      return (
        <form onSubmit={handleSubmit} className="form-container">
          <h3>Paper Publication Details</h3>

          <div className="form-group">
            <label>Title of Paper:<span style={{ color: "red" }}>*</span></label>
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
            <label>Authors:<span style={{ color: "red" }}>*</span></label>
            <input
              type="text"
              name="author1"
              placeholder="Enter Author 1"
              value={formData.author1 || ""}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="author2"
              placeholder="Enter Author 2"
              value={formData.author2 || ""}
              onChange={handleChange}
            />
            <input
              type="text"
              name="author3"
              placeholder="Enter Author 3"
              value={formData.author3 || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Journal / Conference Name:<span style={{ color: "red" }}>*</span></label>
            <input
              type="text"
              name="journalConferenceName"
              placeholder="e.g. International Conference on Artificial Intelligence 2025"
              value={formData.journalConferenceName || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Publisher Name :<span style={{ color: "red" }}>*</span></label>
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
            <label>Publication Date:<span style={{ color: "red" }}>*</span></label>
            <input
              type="date"
              name="publicationDate"
              value={formData.publicationDate || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Indexing:<span style={{ color: "red" }}>*</span></label>
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
            <label>Type of Publication:<span style={{ color: "red" }}>*</span></label>
            <select
              name="publicationType" // Changed from "type"
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
            <label>Level of Conference / Journal:<span style={{ color: "red" }}>*</span></label>
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

          <div className="form-group">
            <label>Certificate Proof (Upload):<span style={{ color: "red" }}>*</span></label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn">Submit</button>
        </form>
      );
    }

    // Co-curricular: Hackathon & Code Competition
    if (
      selectedType === "Co-Curricular" &&
      (selectedSubType === "Hackathon" || selectedSubType === "Code Competition")
    ) {
      return (
        <form onSubmit={handleSubmit} className="form-container">
          <h3>{selectedSubType} Form</h3>

          <div className="form-group">
            <label>Location of Event:<span style={{ color: "red" }}>*</span></label>
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
            <label>Level:<span style={{ color: "red" }}>*</span></label>
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
                : selectedSubType === "Code Competition"
                ? "Competition Name"
                : "Event Name"}
            <span style={{ color: "red" }}>*</span></label>
            <input
              type="text"
              name="eventName"
              value={formData.eventName || ""}
              onChange={handleChange}
              placeholder={
                selectedSubType === "Hackathon"
                  ? "e.g  Womens In Tech"
                  : selectedSubType === "Code Competition"
                  ? "e.g Buffer 2.0"
                  : "Enter Event Name"
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Organizer Name:<span style={{ color: "red" }}>*</span></label>
            <input
              type="text"
              name="organizerName"
              value={formData.organizerName || ""}
              onChange={handleChange}
              placeholder="e.g CCOEW Code Club"
              required
            />
          </div>

          <div className="form-group">
            <label>Date of Event:<span style={{ color: "red" }}>*</span></label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Position:<span style={{ color: "red" }}>*</span></label>
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

          {(formData.position === "Winner" || formData.position === "Runner-up") && (
            <div className="form-group">
              <label>Prize:</label>
              <input
                type="text"
                name="prize"
                value={formData.prize || ""}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-group">
            <label>Upload Certificate (PDF):<span style={{ color: "red" }}>*</span></label>
            <input type="file" accept="application/pdf" onChange={handleFileChange} required/>
          </div>

          <button type="submit" className="submit-btn">Submit</button>
        </form>
      );
    }

    // Extra-Curricular: Sports or Cultural
    if (
      selectedType === "Extra-Curricular" &&
      (selectedSubType === "Sports" || selectedSubType === "Cultural")
    ) {
      return (
        <form onSubmit={handleSubmit} className="form-container">
          <h3>{selectedSubType} Form</h3>
            <div className="form-group">
            <label>Competition Location:<span style={{ color: "red" }}>*</span></label>
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
            <label>Level:<span style={{ color: "red" }}>*</span></label>
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
            <label>Event Name:<span style={{ color: "red" }}>*</span></label>
            <input
              name="eventName"
              type="text"
              value={formData.eventName || ""}
              onChange={handleChange}
              placeholder={
      selectedSubType === "Sports"
        ? "e.g. Pentacle"
        : selectedSubType === "Cultural"
        ? "e.g. Gandhaar"
        : "Enter Event Name"
    }
              required
            />
          </div>

          <div className="form-group">
            <label>Organizer Name:<span style={{ color: "red" }}>*</span></label>
            <input
              name="organizerName"
              type="text"
              value={formData.organizerName || ""}
              onChange={handleChange}
              placeholder="e.g CCOEW "
              required
            />
          </div>

          <div className="form-group">
            <label>Date:<span style={{ color: "red" }}>*</span></label>
            <input
              name="eventDate"
              type="date"
              value={formData.eventDate || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Position:<span style={{ color: "red" }}>*</span></label>
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

          {(formData.position === "Winner" || formData.position === "Runner-up") && (
            <div className="form-group">
              <label>Prize:</label>
              <input
                type="text"
                name="prize"
                value={formData.prize || ""}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-group">
            <label>Upload Certificate (PDF):<span style={{ color: "red" }}>*</span></label>
            <input type="file" accept="application/pdf" onChange={handleFileChange} required/>
          </div>

          <button type="submit" className="submit-btn">Submit</button>
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
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];
      const years = Array.from({ length: 31 }, (_, i) => 2000 + i);

      return (
        <form onSubmit={handleSubmit} className="form-container">
          <h3>{selectedSubType} Course Details</h3>

          <div className="form-group">
            <label>Course Name:<span style={{ color: "red" }}>*</span></label>
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
            <label>Start Date:<span style={{ color: "red" }}>*</span></label>
            <select
              name="startMonth"
              value={formData.startMonth || ""}
              onChange={handleChange}
              required
            >
              <option value="">Month</option>
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
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
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="form-group horizontal">
            <label>End Date:<span style={{ color: "red" }}>*</span></label>
            <select
              name="endMonth"
              value={formData.endMonth || ""}
              onChange={handleChange}
              required
            >
              <option value="">Month</option>
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
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
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Do you have a certificate?<span style={{ color: "red" }}>*</span></label>
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
              <label>Upload Certificate (PDF):</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </div>
          )}

          <button type="submit" className="submit-btn">Submit</button>
        </form>
      );
    }

    // Special Achievement
    if (selectedType === "Special Achievement") {
      const years = Array.from({ length: 31 }, (_, i) => 2000 + i);
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

      return (
        <form onSubmit={handleSubmit} className="form-container">
          <h3>{selectedSubType} Achievement</h3>

          <div className="form-group">
            <label>Type of Award:<span style={{ color: "red" }}>*</span></label>
            <input 
              name="awardType" 
              type="text" 
              value={selectedSubType} 
              readOnly 
            />
          </div>

          <div className="form-group">
            <label>Amount:<span style={{ color: "red" }}>*</span></label>
            <input
              name="amount"
              type="text"
              value={formData.amount || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Awarding Organization:<span style={{ color: "red" }}>*</span></label>
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
              <label>Start Year:<span style={{ color: "red" }}>*</span></label>
              <select
                name="startYear"
                value={formData.startYear || ""}
                onChange={handleChange}
                required
              >
                <option value="">Select Start Year</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              <label>End Year:<span style={{ color: "red" }}>*</span></label>
              <select
                name="endYear"
                value={formData.endYear || ""}
                onChange={handleChange}
                required
              >
                <option value="">Select End Year</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}

          {selectedSubType !== "Scholarship" && (
            <div className="form-group horizontal">
              <label>Month:<span style={{ color: "red" }}>*</span></label>
              <select
                name="month"
                value={formData.month || ""}
                onChange={handleChange}
                required
              >
                <option value="">Select Month</option>
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <label>Year:<span style={{ color: "red" }}>*</span></label>
              <select
                name="year"
                value={formData.year || ""}
                onChange={handleChange}
                required
              >
                <option value="">Select Year</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Do you have a certificate?<span style={{ color: "red" }}>*</span></label>
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
              <label>Upload Certificate (PDF):</label>
              <input type="file" accept="application/pdf" onChange={handleFileChange} />
            </div>
          )}

          <button type="submit" className="submit-btn">Submit</button>
        </form>
      );
    }

    return null;
  };

  return (
    <div className="card">
      <h2>🎓 Achievement Portal</h2>
      <button className="main-btn" onClick={handleMainClick}>
        + Add New Achievement
      </button>

      {showOptions && (
        <div className="button-group">
          <button className="type-btn" onClick={() => handleTypeSelect("Co-Curricular")}>
            Co-Curricular
          </button>
          <button className="type-btn" onClick={() => handleTypeSelect("Extra-Curricular")}>
            Extra-Curricular
          </button>
          <button className="type-btn" onClick={() => handleTypeSelect("Courses")}>
            Courses
          </button>
          <button className="type-btn" onClick={() => handleTypeSelect("Special Achievement")}>
            Special Achievement
          </button>
        </div>
      )}

      {selectedType && renderSubTypeOptions()}
      {renderForm()}
      {successMessage && <div className="success-msg">{successMessage}</div>}
    </div>
  );
}

export default AchievementForm;