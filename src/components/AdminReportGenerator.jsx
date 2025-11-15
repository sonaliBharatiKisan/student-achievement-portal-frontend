// frontend/src/components/AdminReportGenerator.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, ExternalHyperlink, WidthType } from "docx";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import "./AdminReportGenerator.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const FIELD_LABELS = {
  USN: "USN",
  uce: "UCE/USN",
  Name: "Name",
  DOB: "Date of Birth",
  Gender: "Gender",
  Email: "Email",
  Phone: "Phone",
  Address: "Address",
  Department: "Department",
  Year: "Year",
  Semester: "Semester",
  Section: "Section",
  Batch: "Batch",
  cgpa: "CGPA",
  bloodGroup: "Blood Group",
  type: "Achievement Type",
  category: "Category",
  level: "Level",
  organizerLocation: "Organizer Location",
  workshopLocation: "Workshop Location",
  seminarLocation: "Seminar Location",
  competitionLocation: "Competition Location",
  otherLocation: "Other Location",
  eventName: "Event Name",
  organizerName: "Organizer Name",
  eventDate: "Event Date",
  position: "Position",
  prize: "Prize",
  awardType: "Award Type",
  amount: "Amount",
  awardingOrganization: "Awarding Organization",
  awardYear: "Award Year",
  courseName: "Course Name",
  startMonth: "Start Month",
  startYear: "Start Year",
  endMonth: "End Month",
  endYear: "End Year",
  workshopName: "Workshop Name",
  seminarName: "Seminar Name",
  projectTopic: "Project/Paper Topic",
  title: "Title of Paper",
  author1: "Author 1",
  author2: "Author 2",
  author3: "Author 3",
  journalConferenceName: "Journal/Conference Name",
  publisherName: "Publisher Name",
  publicationDate: "Publication Date",
  indexing: "Indexing",
  publicationType: "Publication Type",
  month: "Month",
  year: "Year",
  certificatePath: "Certificate",
};

const ACHIEVEMENT_TYPES = [
  "Co-Curricular",
  "Extra-Curricular",
  "Courses",
  "Special Achievement",
  "All"
];

const FILTER_SPECIFIC_FIELDS = ["level", "position", "organizerLocation", "workshopLocation", "seminarLocation", "competitionLocation", "otherLocation"];

const AdminReportGenerator = () => {
  const [studentFields, setStudentFields] = useState([]);
  const [achievementFields, setAchievementFields] = useState([]);
  const [academicFields, setAcademicFields] = useState([]);

  const [selectedStudentFields, setSelectedStudentFields] = useState(["USN", "Name"]);
  const [selectedAchievementFields, setSelectedAchievementFields] = useState([]);
  const [selectedAcademicFields, setSelectedAcademicFields] = useState([]);

  const [selectedAchievementCategory, setSelectedAchievementCategory] = useState("");
  const [selectedAchievementSubType, setSelectedAchievementSubType] = useState("");
  const [competitionLocationFilter, setCompetitionLocationFilter] = useState("ALL");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [positionFilter, setPositionFilter] = useState("All");

  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const areFiltersEnabled = () => {
    if (!selectedAchievementCategory || selectedAchievementCategory === "") {
      return false;
    }
    if (selectedAchievementCategory === "Courses" || selectedAchievementCategory === "Special Achievement" || selectedAchievementCategory === "All") {
      return false;
    }
    return true;
  };

  const getLocationFieldLabel = () => {
    if (!selectedAchievementSubType) return "Competition Location";
    
    const subType = selectedAchievementSubType.toLowerCase();
    if (subType.includes("workshop")) return "Workshop Location";
    if (subType.includes("seminar") || subType.includes("webinar")) return "Seminar Location";
    if (subType.includes("hackathon") || subType.includes("code")) return "Organizer Location";
    if (subType === "other") return "Other Location";
    
    return "Competition Location";
  };

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/admin/field-options`);
        
        const filteredStudentFields = res.data.student.filter(
          field => field !== "alternatePhone" && field !== "alternateEmail"
        );
        
        setStudentFields(filteredStudentFields);
        setAchievementFields(res.data.achievement);
        setAcademicFields(res.data.academic);
      } catch (err) {
        console.error("Error fetching fields:", err);
      }
    };
    fetchFields();
  }, []);

  useEffect(() => {
    if (!areFiltersEnabled()) {
      setCompetitionLocationFilter("ALL");
      setLevelFilter("ALL");
      setPositionFilter("All");
      
      setSelectedAchievementFields(prev => 
        prev.filter(field => !FILTER_SPECIFIC_FIELDS.includes(field))
      );
    }
  }, [selectedAchievementCategory]);

  const toggleField = (field, selected, setSelected) => {
    setSelected(
      selected.includes(field)
        ? selected.filter((f) => f !== field)
        : [...selected, field]
    );
  };

  const handleGenerateReport = async () => {
    if (
      !selectedStudentFields.length &&
      !selectedAchievementFields.length &&
      !selectedAcademicFields.length
    ) {
      alert("Select at least one field!");
      return;
    }

    if (dateRange.start && dateRange.end) {
      const start = parseInt(dateRange.start, 10);
      const end = parseInt(dateRange.end, 10);
      if (start > end) {
        alert("Start Year must be less than or equal to End Year");
        return;
      }
    }

    setLoading(true);
    try {
      const filtersEnabled = areFiltersEnabled();
      
      const achievementFiltersPayload = {};
      
      if (filtersEnabled && selectedAchievementCategory && positionFilter && positionFilter !== "All") {
        achievementFiltersPayload[selectedAchievementCategory] = {
          position: positionFilter
        };
      }

      const requestData = {
        studentFields: selectedStudentFields,
        achievementFields: selectedAchievementFields,
        academicFields: selectedAcademicFields,
        achievementFilters: achievementFiltersPayload,
        achievementCategory: selectedAchievementCategory || null,
        achievementSubType: selectedAchievementSubType || null,
        competitionLocationFilter: filtersEnabled ? competitionLocationFilter : "ALL",
        levelFilter: filtersEnabled ? levelFilter : "ALL",
        filtersEnabled: filtersEnabled,
        filters: dateRange.start && dateRange.end ? {
          duration: {
            start: parseInt(dateRange.start, 10),
            end: parseInt(dateRange.end, 10)
          }
        } : {}
      };

      console.log("Sending request:", requestData);

      const res = await axios.post(`${API_BASE_URL}/admin/report`, requestData);
      console.log(" Received response:", res.data);
      
      if (!res.data || res.data.length === 0) {
        alert("No data found matching the selected filters. Try adjusting your filters.");
      }
      
      setReportData(res.data);
    } catch (err) {
      console.error("Error generating report:", err);
      alert("Failed to generate report: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData.length) return alert("No data to export!");
    
    const filtersEnabled = areFiltersEnabled();
    let allFields = [
      ...selectedStudentFields,
      ...selectedAcademicFields,
      ...selectedAchievementFields,
    ];
    
    if (!filtersEnabled) {
      allFields = allFields.filter(f => !FILTER_SPECIFIC_FIELDS.includes(f));
    }
    
    const headers = allFields.map((f) => FIELD_LABELS[f] || f);
    const csvContent = [
      headers.join(","),
      ...reportData.map((row) =>
        allFields
          .map((field) => {
            const val = row[field] ?? "-";
            if (field === "certificatePath" && val !== "-") {
              return `"${val}"`;
            }
            return Array.isArray(val) ? `"${val.join("; ")}"` : `"${val}"`;
          })
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `admin_report_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    if (!reportData.length) return alert("No data to export!");
    
    const filtersEnabled = areFiltersEnabled();
    let allFields = [
      ...selectedStudentFields,
      ...selectedAcademicFields,
      ...selectedAchievementFields,
    ];
    
    if (!filtersEnabled) {
      allFields = allFields.filter(f => !FILTER_SPECIFIC_FIELDS.includes(f));
    }

    const doc = new jsPDF({ orientation: "landscape" });
    const headers = allFields.map((f) => FIELD_LABELS[f] || f);
    const rows = reportData.map((row) =>
      allFields.map((f) => {
        const val = row[f] ?? "-";
        if (f === "certificatePath" && val !== "-") {
          return "View Certificate";
        }
        return Array.isArray(val) ? val.join(", ") : val;
      })
    );

    doc.text("Admin Report", 14, 10);
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 20,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [138, 43, 226] },
    });

    doc.save(`admin_report_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportToWord = async () => {
    if (!reportData.length) return alert("No data to export!");
    
    const filtersEnabled = areFiltersEnabled();
    let allFields = [
      ...selectedStudentFields,
      ...selectedAcademicFields,
      ...selectedAchievementFields,
    ];
    
    if (!filtersEnabled) {
      allFields = allFields.filter(f => !FILTER_SPECIFIC_FIELDS.includes(f));
    }

    const tableRows = [
      new TableRow({
        children: allFields.map(
          (f) =>
            new TableCell({
              width: { size: 100 / allFields.length, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ text: FIELD_LABELS[f] || f })],
            })
        ),
      }),
      ...reportData.map(
        (row) =>
          new TableRow({
            children: allFields.map((f) => {
              const val = row[f];
              if (f === "certificatePath" && val && val !== "-") {
                return new TableCell({
                  children: [
                    new Paragraph({
                      children: [new ExternalHyperlink({ children: [new TextRun("View Certificate")], link: val })],
                    }),
                  ],
                });
              }
              return new TableCell({
                children: [new Paragraph(Array.isArray(val) ? val.join(", ") : (val ?? "-"))],
              });
            }),
          })
      ),
    ];

    const doc = new Document({
      sections: [{ children: [new Table({ rows: tableRows })] }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `admin_report_${new Date().toISOString().split("T")[0]}.docx`);
  };

  // NEW: Export All as Combined PDF
  const exportAllAsPDF = () => {
    if (!reportData.length) return alert("No data to export!");
    
    const filtersEnabled = areFiltersEnabled();
    let allFields = [
      ...selectedStudentFields,
      ...selectedAcademicFields,
      ...selectedAchievementFields,
    ];
    
    if (!filtersEnabled) {
      allFields = allFields.filter(f => !FILTER_SPECIFIC_FIELDS.includes(f));
    }

    const doc = new jsPDF({ orientation: "landscape" });
    
    // Title Page
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text("Complete Report", 14, 20);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    if (selectedAchievementCategory && selectedAchievementCategory !== "") {
      doc.text(`Category: ${selectedAchievementCategory}`, 14, 30);
    }
    if (selectedAchievementSubType) {
      doc.text(`Sub-Type: ${selectedAchievementSubType}`, 14, 38);
    }
    doc.text(`Total Records: ${reportData.length}`, 14, 46);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 54);
    
    // Add data table
    doc.addPage();
    
    const headers = allFields.map((f) => FIELD_LABELS[f] || f);
    const rows = reportData.map((row) =>
      allFields.map((f) => {
        const val = row[f] ?? "-";
        if (f === "certificatePath" && val !== "-") {
          return "View Certificate";
        }
        return Array.isArray(val) ? val.join(", ") : val;
      })
    );

    doc.setFontSize(14);
    doc.text("Report Data", 14, 15);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 22,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [138, 43, 226] },
      margin: { top: 22 }
    });

    const fileName = selectedAchievementCategory 
      ? `Complete_Report_${selectedAchievementCategory}_${new Date().toISOString().split("T")[0]}.pdf`
      : `Complete_Report_${new Date().toISOString().split("T")[0]}.pdf`;
    
    doc.save(fileName);
  };

  const renderCheckboxes = (fields, selected, setSelected) => {
    const filtersEnabled = areFiltersEnabled();
    
    const displayFields = filtersEnabled 
      ? fields 
      : fields.filter(f => !FILTER_SPECIFIC_FIELDS.includes(f));
    
    return (
      <div className="field-checkboxes scrollable">
        {displayFields.map((field) => (
          <label key={field} className="checkbox-field">
            <input
              type="checkbox"
              checked={selected.includes(field)}
              onChange={() => toggleField(field, selected, setSelected)}
            />
            {FIELD_LABELS[field] || field}
          </label>
        ))}
      </div>
    );
  };

  const renderTable = () => {
    if (!reportData.length) {
      return (
        <div className="no-data-message">
          <p>No data to display. Please generate a report first.</p>
        </div>
      );
    }
    
    const filtersEnabled = areFiltersEnabled();
    let allFields = [
      ...selectedStudentFields,
      ...selectedAcademicFields,
      ...selectedAchievementFields,
    ];
    
    if (!filtersEnabled) {
      allFields = allFields.filter(f => !FILTER_SPECIFIC_FIELDS.includes(f));
    }
    
    const showExportAllButton = selectedAchievementCategory && 
                                 selectedAchievementCategory !== "" && 
                                 selectedAchievementCategory !== "All";
    
    return (
      <>
        {showExportAllButton && (
          <div style={{
            backgroundColor: '#e8f5e9',
            padding: '15px 20px',
            borderRadius: '8px',
            marginBottom: '15px',
            border: '2px solid #4CAF50',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px'
          }}>
            <div>
              <h4 style={{ margin: 0, color: '#2e7d32', fontSize: '16px' }}>
                 Export Complete Report
              </h4>
              <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#666' }}>
                Export all {reportData.length} records as a single comprehensive PDF
              </p>
            </div>
            <button 
              onClick={exportAllAsPDF} 
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '5px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
            >
               Export All as PDF
            </button>
          </div>
        )}
        
        <div className="report-section">
          <div className="report-header">
            <h3>Generated Report ({reportData.length} records)</h3>
            <div className="export-buttons">
              <button onClick={exportToCSV} className="export-btn">Export CSV</button>
              <button onClick={exportToPDF} className="export-btn">Export PDF</button>
              <button onClick={exportToWord} className="export-btn">Export Word</button>
            </div>
          </div>
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  {allFields.map((f) => (
                    <th key={f}>{FIELD_LABELS[f] || f}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, i) => (
                  <tr key={i}>
                    {allFields.map((f) => (
                      <td key={f}>
                        {f === "certificatePath" && row[f] && row[f] !== "-" ? (
                          <a href={row[f]} target="_blank" rel="noopener noreferrer">
                            View Certificate
                          </a>
                        ) : Array.isArray(row[f]) ? (
                          row[f].join(", ")
                        ) : (
                          row[f] ?? "-"
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  const filtersEnabled = areFiltersEnabled();
  const locationLabel = getLocationFieldLabel();

  return (
    <div className="report-generator">
      <h1> Admin Report Generator</h1>

      <fieldset className="date-filter">
        <legend> Date Range Filter (Optional)</legend>
        <div className="date-inputs">
          <label>
            Start Year:
            <input
              type="number"
              min="2020"
              max={new Date().getFullYear()}
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              placeholder="e.g., 2020"
            />
          </label>
          <label>
            End Year:
            <input
              type="number"
              min="2020"
              max={new Date().getFullYear()}
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              placeholder="e.g., 2024"
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="achievement-filter">
        <legend> Achievement Filters</legend>
        
        <div className="achievement-type-selector">
          <label>Select Achievement Category:</label>
          <div className="achievement-buttons">
            {ACHIEVEMENT_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={`achievement-type-btn ${selectedAchievementCategory === type ? "selected" : ""}`}
                onClick={() => {
                  setSelectedAchievementCategory(type);
                  setSelectedAchievementSubType("");
                  if (type === "Courses" || type === "Special Achievement" || type === "All") {
                    setCompetitionLocationFilter("ALL");
                    setLevelFilter("ALL");
                    setPositionFilter("All");
                  }
                }}
              >
                {type}
              </button>
            ))}
            <button
              type="button"
              className={`achievement-type-btn clear-btn ${selectedAchievementCategory === "" ? "selected" : ""}`}
              onClick={() => {
                setSelectedAchievementCategory("");
                setSelectedAchievementSubType("");
                setCompetitionLocationFilter("ALL");
                setLevelFilter("ALL");
                setPositionFilter("All");
              }}
            >
              Clear Filter
            </button>
          </div>
        </div>

        {selectedAchievementCategory && selectedAchievementCategory !== "" && (
          <>
            <div className="subtype-selector">
              <label>Select Sub-Category (Optional):</label>
              <input
                type="text"
                placeholder="e.g., Workshop, Hackathon, Sports, etc."
                value={selectedAchievementSubType}
                onChange={(e) => setSelectedAchievementSubType(e.target.value)}
              />
              <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                Leave empty to get all sub-categories under {selectedAchievementCategory}
              </small>
            </div>

            {filtersEnabled ? (
              <>
                <div className="location-filter">
                  <label>{locationLabel}:</label>
                  <select
                    value={competitionLocationFilter}
                    onChange={(e) => {
                      setCompetitionLocationFilter(e.target.value);
                      if (e.target.value === "ALL") setLevelFilter("ALL");
                    }}
                  >
                    <option value="ALL">ALL</option>
                    <option value="Within">Within State</option>
                    <option value="Outside">Outside State</option>
                  </select>
                </div>

                {(competitionLocationFilter === "Within" || competitionLocationFilter === "Outside") && (
                  <div className="level-filter">
                    <label>Level:</label>
                    <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
                      <option value="ALL">ALL</option>
                      <option value="International">International</option>
                      <option value="National">National</option>
                      <option value="State">State</option>
                      <option value="Inter College">Inter College</option>
                      <option value="Intra College">Intra College</option>
                    </select>
                  </div>
                )}

                <div className="position-filter">
                  <label>Position Filter:</label>
                  <select
                    value={positionFilter}
                    onChange={(e) => setPositionFilter(e.target.value)}
                  >
                    <option value="All">All</option>
                    <option value="Winner">Winner</option>
                    <option value="Participant">Participant</option>
                  </select>
                </div>
              </>
            ) : (
              selectedAchievementCategory && selectedAchievementCategory !== "" && (
                <div style={{ 
                  padding: '10px', 
                  backgroundColor: '#e3f2fd', 
                  borderRadius: '5px', 
                  marginTop: '10px',
                  color: '#1976d2'
                }}>
                  ℹ️ Location, Level, and Position filters are not applicable for {selectedAchievementCategory}
                </div>
              )
            )}
          </>
        )}
      </fieldset>

      <fieldset>
        <legend> Student Fields ({selectedStudentFields.length})</legend>
        <div className="field-actions">
          <button onClick={() => setSelectedStudentFields([...studentFields])}>Select All</button>
          <button onClick={() => setSelectedStudentFields([])}>Clear All</button>
        </div>
        {renderCheckboxes(studentFields, selectedStudentFields, setSelectedStudentFields)}
      </fieldset>

      <fieldset>
        <legend>Academic Fields ({selectedAcademicFields.length})</legend>
        <div className="field-actions">
          <button onClick={() => setSelectedAcademicFields([...academicFields])}>Select All</button>
          <button onClick={() => setSelectedAcademicFields([])}>Clear All</button>
        </div>
        {renderCheckboxes(academicFields, selectedAcademicFields, setSelectedAcademicFields)}
      </fieldset>

      <fieldset>
        <legend> Achievement Fields ({selectedAchievementFields.length})</legend>
        <div className="field-actions">
          <button onClick={() => {
            const filtersEnabled = areFiltersEnabled();
            const fieldsToSelect = filtersEnabled 
              ? achievementFields 
              : achievementFields.filter(f => !FILTER_SPECIFIC_FIELDS.includes(f));
            setSelectedAchievementFields([...fieldsToSelect]);
          }}>
            Select All
          </button>
          <button onClick={() => setSelectedAchievementFields([])}>Clear All</button>
        </div>
        {renderCheckboxes(achievementFields, selectedAchievementFields, setSelectedAchievementFields)}
      </fieldset>

      <button className="generate-btn" onClick={handleGenerateReport} disabled={loading}>
        {loading ? "Generating..." : "Generate Report"}
      </button>

      {renderTable()}
    </div>
  );
};

export default AdminReportGenerator;