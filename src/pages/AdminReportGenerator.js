// ./pages/AdminReportGenerator.js
import React, { useState } from "react";
import axios from "axios";
import "./AdminReportGenerator.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } from "docx";
import { saveAs } from "file-saver";

// ✅ Add API base URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const FIELD_LABELS = {
  uce: "UCE/USN",
  Name: "Name",
  DOB: "Date of Birth",
  Gender: "Gender",
  bloodGroup: "Blood Group",
  Address: "Address",
  Phone: "Phone Number",
  Email: "Email",
  type: "Achievement Type",
  category: "Category",
  organizerLocation: "Organizer Location",
  workshopLocation: "Workshop Location",
  seminarLocation: "Seminar Location",
  otherLocation: "Other Location",
  competitionLocation: "Competition Location",
  level: "Level",
  workshopName: "Workshop Name",
  seminarName: "Seminar Name",
  eventName: "Event Name",
  organizerName: "Organizer Name",
  eventDate: "Date",
  projectTopic: "Project/Paper Topic",
  position: "Position",
  prize: "Prize",
  title: "Title of Paper",
  author1: "Author 1",
  author2: "Author 2",
  author3: "Author 3",
  journalConferenceName: "Journal/Conference Name",
  publisherName: "Publisher Name",
  publicationDate: "Publication Date",
  indexing: "Indexing",
  publicationType: "Publication Type",
  courseName: "Course Name",
  startMonth: "Start Month",
  startYear: "Start Year",
  endMonth: "End Month",
  endYear: "End Year",
  awardType: "Award Type",
  amount: "Amount",
  awardingOrganization: "Awarding Organization",
  month: "Month",
  year: "Year",
  certificatePath: "Certificate"
};

const achievementSubTypes = {
  "Co-Curricular": [
    "Workshop",
    "Seminar/Webinar",
    "Project Competition",
    "Paper Presentation",
    "Paper Publication",
    "Hackathon",
    "Code Competition",
    "Other"
  ],
  "Extra-Curricular": ["Sports", "Cultural"],
  "Courses": ["Coursera", "NPTEL", "Udemy", "Others"],
  "Special Achievement": ["Scholarship", "Cash Prize"]
};

const getAchievementFields = (category, subType) => {
  if (!subType) return [];
  
  if (["Workshop", "Seminar/Webinar", "Other"].includes(subType)) {
    const locationField =
      subType === "Workshop"
        ? "workshopLocation"
        : subType === "Seminar/Webinar"
        ? "seminarLocation"
        : "otherLocation";
    const nameField =
      subType === "Workshop"
        ? "workshopName"
        : subType === "Seminar/Webinar"
        ? "seminarName"
        : "eventName";
    return [
      nameField,
      "organizerName",
      "eventDate",
      "certificatePath"
    ];
  }
  
  if (["Project Competition", "Paper Presentation"].includes(subType)) {
    return [
      "projectTopic",
      "eventDate",
      "position",
      "prize",
      "certificatePath"
    ];
  }
  
  if (subType === "Paper Publication") {
    return [
      "title",
      "author1",
      "author2",
      "author3",
      "journalConferenceName",
      "publisherName",
      "publicationDate",
      "indexing",
      "publicationType",
      "certificatePath"
    ];
  }
  
  if (["Hackathon", "Code Competition"].includes(subType)) {
    return [
      "eventName",
      "organizerName",
      "eventDate",
      "position",
      "prize",
      "certificatePath"
    ];
  }
  
  if (["Sports", "Cultural"].includes(subType)) {
    return [
      "eventName",
      "organizerName",
      "eventDate",
      "position",
      "prize",
      "certificatePath"
    ];
  }
  
  if (["Coursera", "NPTEL", "Udemy", "Others"].includes(subType)) {
    return [
      "courseName",
      "startMonth",
      "startYear",
      "endMonth",
      "endYear",
      "certificatePath"
    ];
  }
  
  if (["Scholarship", "Cash Prize"].includes(subType)) {
    return [
      "awardType",
      "amount",
      "awardingOrganization",
      "year",
      "certificatePath"
    ];
  }
  
  return [];
};

const AdminReportGenerator = () => {
  // ==============================
  // STATE DECLARATIONS
  // ==============================
  const [expandedSections, setExpandedSections] = useState({
    studentProfile: false,
    achievement: false
  });
  
  const [selectedAchievementCategory, setSelectedAchievementCategory] = useState("");
  const [selectedAchievementSubType, setSelectedAchievementSubType] = useState("");
  const [positionFilter, setPositionFilter] = useState("All");
  const [competitionLocationFilter, setCompetitionLocationFilter] = useState("ALL");
  const [levelFilter, setLevelFilter] = useState("ALL");
  
  const [selectedStudentFields, setSelectedStudentFields] = useState([]);
  const [selectedAchievementFields, setSelectedAchievementFields] = useState([]);
  
  const [filters, setFilters] = useState({});
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(false);

  // ==============================
  // HELPER FUNCTIONS
  // ==============================
  const formatDateToMMDDYYYY = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleAchievementCategory = (category) => {
    setSelectedAchievementCategory(category);
    setSelectedAchievementSubType("");
    setSelectedAchievementFields([]);
    setPositionFilter("All");
    setCompetitionLocationFilter("ALL");
    setLevelFilter("ALL");
    setReportData({});
  };

  const toggleField = (field, selectedFields, setSelectedFields) => {
    if (selectedFields.includes(field)) {
      setSelectedFields((prev) => prev.filter((f) => f !== field));
    } else {
      setSelectedFields((prev) => [...prev, field]);
    }
  };

  const selectAllStudentFields = () => {
    const allStudentFields = ["uce","Name","DOB","Gender","bloodGroup","Address","Phone","Email"];
    setSelectedStudentFields(allStudentFields);
  };

  const clearAllStudentFields = () => {
    setSelectedStudentFields([]);
  };

  const selectAllAchievementFields = () => {
    if (selectedAchievementCategory && selectedAchievementSubType && selectedAchievementSubType !== "ALL") {
      const allFields = getAchievementFields(selectedAchievementCategory, selectedAchievementSubType);
      setSelectedAchievementFields(allFields);
    }
  };

  const clearAllAchievementFields = () => {
    setSelectedAchievementFields([]);
  };

  // ==============================
  // API FUNCTIONS
  // ==============================
  const fetchReportForSubType = async (subType) => {
    // Build achievementFilters payload
    const achievementFiltersPayload = {};
    if (selectedAchievementCategory && positionFilter) {
      achievementFiltersPayload[selectedAchievementCategory] = { position: positionFilter };
    }

    // Always include uce and Name, plus any additional student fields selected
    const studentFieldsToFetch = ["uce", "Name", ...selectedStudentFields.filter(f => f !== "uce" && f !== "Name")];

    // Get base achievement fields
    const baseAchievementFields = getAchievementFields(selectedAchievementCategory, subType).filter((f) => f !== "uce" && f !== "Name");
    
    // Add location and level fields to fetch from backend
    const locationField = ["Workshop", "Seminar/Webinar", "Other"].includes(subType) 
      ? (subType === "Workshop" ? "workshopLocation" 
          : subType === "Seminar/Webinar" ? "seminarLocation" 
          : "otherLocation")
      : ["Hackathon", "Code Competition"].includes(subType)
      ? "organizerLocation"
      : "competitionLocation";
    
    const achievementFieldsToFetch = [...baseAchievementFields, locationField, "level"];

    const requestData = {
      studentFields: studentFieldsToFetch,
      achievementFields: achievementFieldsToFetch,
      achievementCategory: selectedAchievementCategory,
      achievementSubType: subType,
      achievementFilters: achievementFiltersPayload,
      competitionLocationFilter: competitionLocationFilter,
      levelFilter: levelFilter,
      filters: {
        ...filters,
        ...(dateRange.start && dateRange.end
          ? { 
              duration: { 
                start: formatDateToMMDDYYYY(dateRange.start), 
                end: formatDateToMMDDYYYY(dateRange.end) 
              } 
            }
          : {})
      }
    };

    // Frontend validation: ensure start <= end
    if (requestData.filters.duration) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      
      if (startDate > endDate) {
        alert("Start Date must be less than or equal to End Date");
        throw new Error("Invalid date range");
      }
    }

    // ✅ Use environment variable for API endpoint
    const res = await axios.post(`${API_BASE_URL}/admin/report`, requestData);
    return res.data;
  };

  const generateReport = async () => {
    setLoading(true);
    setReportData({});
    
    try {
      if (!selectedAchievementCategory || !selectedAchievementSubType) {
        alert("Please select Achievement Category and Activity Type.");
        return;
      }
      
      if (selectedAchievementSubType === "ALL") {
        const subTypesToGenerate = achievementSubTypes[selectedAchievementCategory];
        let results = {};
        for (let sub of subTypesToGenerate) {
          const data = await fetchReportForSubType(sub);
          results[sub] = data || [];
        }
        setReportData(results);
      } else {
        let data = await fetchReportForSubType(selectedAchievementSubType);
        setReportData({ [selectedAchievementSubType]: data || [] });
      }
    } catch (err) {
      console.error("Error generating report:", err);
      if (err.message !== "Invalid date range") {
        alert("Error generating report: " + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // EXPORT FUNCTIONS
  // ==============================
  const exportToCSV = (subType, data, fields) => {
    if (!data || data.length === 0) {
      alert("No data to export!");
      return;
    }
    const headers = fields.map((field) => FIELD_LABELS[field] || field);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        fields.map((field) => {
          const value = row[field];
          if (Array.isArray(value)) return `"${value.join("; ")}"`;
          return `"${value || "-"}"`;
        }).join(",")
      )
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `admin_report_${subType}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = (subType, data, fields) => {
    if (!data || data.length === 0) {
      alert("No data to export!");
      return;
    }
    const doc = new jsPDF();
    const headers = fields.map((f) => FIELD_LABELS[f] || f);
    const rows = data.map((row) => fields.map((f) => Array.isArray(row[f]) ? row[f].join("; ") : (row[f] || "-")));
    doc.text(`${selectedAchievementCategory} - ${subType} Report`, 14, 10);
    autoTable(doc, { 
      head: [headers], 
      body: rows, 
      startY: 20, 
      styles: { fontSize: 8 }, 
      headStyles: { fillColor: [138,43,226] } 
    });
    doc.save(`admin_report_${subType}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportToWord = async (subType, data, fields) => {
    if (!data || data.length === 0) {
      alert("No data to export!");
      return;
    }
    const headerRow = new TableRow({ 
      children: fields.map(f => new TableCell({ children: [new Paragraph(FIELD_LABELS[f] || f)] })) 
    });
    const dataRows = data.map(row => new TableRow({ 
      children: fields.map(f => new TableCell({ 
        children: [new Paragraph(Array.isArray(row[f]) ? row[f].join("; ") : (row[f] || "-"))] 
      })) 
    }));
    const table = new Table({ 
      rows: [headerRow, ...dataRows], 
      width: { size: 100, type: WidthType.PERCENTAGE } 
    });
    const doc = new Document({ sections: [{ children: [table] }] });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `admin_report_${subType}_${new Date().toISOString().split("T")[0]}.docx`);
  };

  // ==============================
  // RENDER FUNCTIONS
  // ==============================
  const renderReportTables = () => {
    if (!reportData || Object.keys(reportData).length === 0) return null;
    
    return Object.entries(reportData).map(([subType, data]) => {
      // Combine student fields and achievement fields
      const studentFieldsToShow = ["uce", "Name", ...selectedStudentFields.filter(f => f !== "uce" && f !== "Name")];
      const achievementFields = getAchievementFields(selectedAchievementCategory, subType).filter(f => f !== "uce" && f !== "Name");
      
      // Always add competitionLocation and level to displayed fields
      const dynamicFields = [];
      // Determine which location field to show based on subType
      if (["Workshop", "Seminar/Webinar", "Other"].includes(subType)) {
        const locationField = subType === "Workshop" ? "workshopLocation" 
          : subType === "Seminar/Webinar" ? "seminarLocation" 
          : "otherLocation";
        dynamicFields.push(locationField);
      } else if (["Hackathon", "Code Competition"].includes(subType)) {
        dynamicFields.push("organizerLocation");
      } else {
        dynamicFields.push("competitionLocation");
      }
      
      // Always add level field
      dynamicFields.push("level");
      
      const fields = [...studentFieldsToShow, ...dynamicFields, ...achievementFields];
      
      return (
        <div className="report-section" key={subType}>
          <div className="report-header">
            <h3>{subType} Report ({data.length} records)</h3>
            <select
              onChange={(e) => {
                const val = e.target.value;
                if (val === "csv") exportToCSV(subType, data, fields);
                if (val === "pdf") exportToPDF(subType, data, fields);
                if (val === "word") exportToWord(subType, data, fields);
                e.target.value = "";
              }}
              className="export-dropdown"
            >
              <option value="">Export As...</option>
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
              <option value="word">Word</option>
            </select>
          </div>
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>{fields.map(f => <th key={f}>{FIELD_LABELS[f] || f}</th>)}</tr>
              </thead>
              <tbody>
                {data.length ? data.map((row, i) => (
                  <tr key={i}>
                    {fields.map(f => (
                      <td key={f}>
                        {Array.isArray(row[f]) ? row[f].join(", ") : (row[f] || "-")}
                      </td>
                    ))}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={fields.length} style={{textAlign:"center"}}>
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    });
  };

  // ==============================
  // JSX RETURN
  // ==============================
  return (
    <div className="admin-report-generator">
      <div className="header">
        <h1>Admin Report Generator</h1>
        <p>Select fields from different categories to generate comprehensive reports</p>
      </div>

       {/* Date Range Filter */}
      <div className="date-filter-section">
        <h3>Date Range Filter</h3>
        <div className="date-inputs">
          <label>
            Start Date:
            <input 
              type="date" 
              value={dateRange.start} 
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </label>
          <label>
            End Date:
            <input 
              type="date" 
              value={dateRange.end} 
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </label>
        </div>
      </div>

      {/* Student Profile Section */}
      <div className="section-card">
        <div className="section-header" onClick={() => toggleSection("studentProfile")}>
          <h3>Student Profile ({selectedStudentFields.length} selected)</h3>
          <span className="toggle-icon">{expandedSections.studentProfile ? "▼" : "▶"}</span>
        </div>
        {expandedSections.studentProfile && (
          <>
            <div className="select-all-section">
              <button 
                className="select-all-btn"
                onClick={selectAllStudentFields}
              >
                Select All Fields
              </button>
              <button 
                className="clear-all-btn"
                onClick={clearAllStudentFields}
              >
                Clear All
              </button>
            </div>
            <div className="fields-grid">
              {["uce","Name","DOB","Gender","bloodGroup","Address","Phone","Email"].map(field => (
                <label key={field} className="field-checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedStudentFields.includes(field)} 
                    onChange={() => toggleField(field, selectedStudentFields, setSelectedStudentFields)}
                  />
                  <span>{FIELD_LABELS[field] || field}</span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Achievement Section */}
      <div className="section-card">
        <div className="section-header" onClick={() => toggleSection("achievement")}>
          <h3>Achievement ({selectedAchievementFields.length} selected)</h3>
          <span className="toggle-icon">{expandedSections.achievement ? "▼" : "▶"}</span>
        </div>
        {expandedSections.achievement && (
          <>
            {/* Achievement Categories */}
            <div className="category-buttons">
              {Object.keys(achievementSubTypes).map(category => (
                <button 
                  key={category} 
                  className={selectedAchievementCategory === category ? "active" : ""} 
                  onClick={() => handleAchievementCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Sub-types dropdown */}
            {selectedAchievementCategory && (
              <div className="subtype-selector">
                <label>Select Activity Type:</label>
                <select 
                  value={selectedAchievementSubType} 
                  onChange={(e) => {
                    setSelectedAchievementSubType(e.target.value); 
                    setSelectedAchievementFields([]); 
                    setPositionFilter("All");
                    setCompetitionLocationFilter("ALL");
                    setLevelFilter("ALL");
                    setReportData({});
                  }}
                >
                  <option value="">-- Select --</option>
                  <option value="ALL">ALL</option>
                  {achievementSubTypes[selectedAchievementCategory].map(subType => (
                    <option key={subType} value={subType}>{subType}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Competition Location Filter dropdown */}
            {selectedAchievementSubType && (
              <div className="competition-location-filter-section" style={{ margin: "12px 0" }}>
                <label style={{ marginRight: 8 }}>Competition Location:</label>
                <select
                  value={competitionLocationFilter}
                  onChange={(e) => {
                    setCompetitionLocationFilter(e.target.value);
                    setLevelFilter("ALL"); // Reset level when location changes
                  }}
                >
                  <option value="ALL">ALL</option>
                  <option value="Within">Within State</option>
                  <option value="Outside">Outside State</option>
                </select>
              </div>
            )}

            {/* Level Filter dropdown - only show when competition location is Within or Outside */}
            {selectedAchievementSubType && (competitionLocationFilter === "Within" || competitionLocationFilter === "Outside") && (
              <div className="level-filter-section" style={{ margin: "12px 0" }}>
                <label style={{ marginRight: 8 }}>Level:</label>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                >
                  <option value="ALL">ALL</option>
                  <option value="International">International</option>
                  <option value="National">National</option>
                  <option value="State">State</option>
                  <option value="Inter College">Inter College</option>
                  <option value="Intra College">Intra College</option>
                </select>
              </div>
            )}

            {/* Position Filter dropdown */}
            {selectedAchievementSubType && (
              <div className="position-filter-section" style={{ margin: "12px 0" }}>
                <label style={{ marginRight: 8 }}>Position Filter:</label>
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Winner">Winner</option>
                  <option value="Participant">Participant</option>
                </select>
              </div>
            )}

            {/* Fields for selected subtype with Select All/Clear All buttons */}
            {selectedAchievementSubType && selectedAchievementSubType !== "ALL" && (
              <>
                <div className="select-all-section">
                  <button 
                    className="select-all-btn"
                    onClick={selectAllAchievementFields}
                  >
                    Select All Fields
                  </button>
                  <button 
                    className="clear-all-btn"
                    onClick={clearAllAchievementFields}
                  >
                    Clear All
                  </button>
                </div>
                <div className="fields-grid">
                  {getAchievementFields(selectedAchievementCategory, selectedAchievementSubType).map(field => (
                    <label key={field} className="field-checkbox">
                      <input 
                        type="checkbox" 
                        checked={selectedAchievementFields.includes(field)} 
                        onChange={() => toggleField(field, selectedAchievementFields, setSelectedAchievementFields)}
                      />
                      <span>{FIELD_LABELS[field] || field}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Generate Report Button */}
      <div className="action-section">
        <button 
          onClick={generateReport} 
          disabled={loading} 
          className="generate-btn"
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {/* Report Tables */}
      {renderReportTables()}
    </div>
  );
};

export default AdminReportGenerator;