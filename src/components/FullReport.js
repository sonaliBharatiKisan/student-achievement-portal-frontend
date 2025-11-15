// frontend/src/components/FullReport.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FullReport.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Friendly labels for fields
const FIELD_LABELS = {
  // Student
  USN: "USN",
  Name: "Name",
  DOB: "Date of Birth",
  Gender: "Gender",
  Email: "Email",
  Phone: "Phone",
  Department: "Department",
  Year: "Year",
  Semester: "Semester",
  Section: "Section",
  Batch: "Batch",
  CGPA: "CGPA",

  // Academic fields
  subject: "Subject",
  marks: "Marks",
  grade: "Grade",
  credits: "Credits",
  examType: "Exam Type",
  maxMarks: "Max Marks",
  percentage: "Percentage",
  cgpa: "CGPA",
  sgpa: "SGPA",
  tenthBoard: "10th Board",
  tenthSchool: "10th School",
  tenthPercentage: "10th Percentage",
  tenthYear: "10th Year",
  tenthMarks: "10th Marks",
  twelfthBoard: "12th Board",
  twelfthCollege: "12th College",
  twelfthPercentage: "12th Percentage",
  twelfthYear: "12th Year",
  twelfthMarks: "12th Marks",
  diplomaBoard: "Diploma Board",
  diplomaCollege: "Diploma College",
  diplomaPercentage: "Diploma Percentage",
  diplomaYear: "Diploma Year",
  diplomaMarks: "Diploma Marks",
  entranceExam: "Entrance Exam",
  entranceRank: "Entrance Rank",
  entranceScore: "Entrance Score",
  entranceYear: "Entrance Year",
  backlogs: "Backlogs",
  currentBacklogs: "Current Backlogs",
  clearedBacklogs: "Cleared Backlogs",
  totalBacklogs: "Total Backlogs",

  // Achievement
  type: "Achievement Type",
  category: "Category",
  level: "Level",
  position: "Position",
  eventName: "Event Name",
  organizerName: "Organizer",
  eventDate: "Event Date",
  awardType: "Award Type",
  amount: "Amount",
  awardingOrganization: "Awarding Organization",
  awardYear: "Award Year",
  workshopName: "Workshop",
  seminarName: "Seminar",
  paperTitle: "Paper Title",
  journalConferenceName: "Journal/Conference Name",
  publisherName: "Publisher",
  publicationType: "Publication Type",
  indexing: "Indexing",
  conferenceName: "Conference",
  presentationDate: "Presentation Date",
  projectTopic: "Project Topic",
  certificate: "Certificate",
  courseName: "Course Name",
  startMonth: "Start Month",
  startYear: "Start Year",
  endMonth: "End Month",
  endYear: "End Year",
};

const FullReport = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define the fields you want to see in the full report
  const selectedStudentFields = [
    "USN", "Name", "DOB", "Gender", "Email", "Phone", "Department", "Year", "Semester"
  ];
  
  const selectedAcademicFields = [
    "tenthBoard", "tenthPercentage", "twelfthBoard", "twelfthPercentage",
    "backlogs", "cgpa", "sgpa"
  ];
  
  const selectedAchievementFields = [
    "type", "category", "level", "position", "eventName", "organizerName",
    "eventDate", "awardType", "amount", "courseName"
  ];

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Use the correct admin report endpoint
        const res = await axios.post(`${API_BASE_URL}/admin/report`, {
          studentFields: selectedStudentFields,
          academicFields: selectedAcademicFields,
          achievementFields: selectedAchievementFields,
          filters: {} // No filters for full report
        });
        
        console.log("Full report data received:", res.data);
        setReportData(res.data);
      } catch (err) {
        console.error("Error fetching full report:", err);
        setError(err.response?.data?.message || "Failed to fetch report data");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  // Export to CSV function
  const exportToCSV = () => {
    if (reportData.length === 0) {
      alert("No data to export!");
      return;
    }

    const allFields = [...selectedStudentFields, ...selectedAcademicFields, ...selectedAchievementFields];
    const headers = allFields.map(field => FIELD_LABELS[field] || field);
    
    const csvContent = [
      headers.join(","),
      ...reportData.map(row => 
        allFields.map(field => {
          const value = row[field];
          if (Array.isArray(value)) {
            return `"${value.join("; ")}"`;
          }
          return `"${value || "-"}"`;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `full_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="full-report-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading full report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="full-report-container">
        <div className="error-container">
          <h2>Error Loading Report</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!reportData.length) {
    return (
      <div className="full-report-container">
        <div className="no-data-container">
          <h2>No Data Available</h2>
          <p>No student, academic, or achievement data found for the report.</p>
        </div>
      </div>
    );
  }

  const allFields = [
    ...selectedStudentFields,
    ...selectedAcademicFields,
    ...selectedAchievementFields,
  ];

  return (
    <div className="full-report-container">
      <div className="report-header">
        <h1>Complete Student + Academic + Achievement Report</h1>
        <div className="report-stats">
          <div className="stat-item">
            <span className="stat-number">{reportData.length}</span>
            <span className="stat-label">Total Records</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{allFields.length}</span>
            <span className="stat-label">Fields Included</span>
          </div>
        </div>
        <button onClick={exportToCSV} className="export-csv-btn">
          Export to CSV
        </button>
      </div>

      <div className="table-wrapper">
        <table className="full-report-table">
          <thead>
            <tr>
              {allFields.map((field) => (
                <th key={field}>{FIELD_LABELS[field] || field}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, idx) => (
              <tr key={idx}>
                {allFields.map((field) => (
                  <td key={field}>
                    {Array.isArray(row[field]) 
                      ? row[field].join(", ") 
                      : (row[field] !== undefined && row[field] !== null && row[field] !== "" 
                          ? row[field] 
                          : "-"
                        )
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FullReport;