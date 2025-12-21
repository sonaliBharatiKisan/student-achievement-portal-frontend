// ./pages/AdminReport.js
import React, { useState, useEffect } from "react";
import "./AdminReport.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdminReport = () => {
  const [fieldOptions, setFieldOptions] = useState({
    student: [],
    achievement: [],
    academic: []
  });

  const [selectedStudentFields, setSelectedStudentFields] = useState([]);
  const [selectedAchievementFields, setSelectedAchievementFields] = useState([]);
  const [selectedAcademicFields, setSelectedAcademicFields] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubType, setSelectedSubType] = useState("");

  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(false);

  // Mapping for categories and sub-types
  const achievementSubTypes = {
    "Co-Curricular": [
      "Workshop",
      "Project Competition",
      "Paper Presentation",
      "Paper Publication",
      "Hackathon",
      "Code Competition",
      "Other"
    ],
    "Extra-Curricular": ["Sports", "Cultural"],
    "Courses": ["COURSE_DYNAMIC"], // Handle dynamically
    "Special Achievement": ["SPECIAL_DYNAMIC"] // Handle dynamically
  };

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/get-fields`);
        const data = await response.json();
        setFieldOptions(data);
      } catch (error) {
        console.error("Error fetching fields:", error);
      }
    };
    fetchFields();
  }, []);

  const handleCheckboxChange = (field, category) => {
    if (category === "student") {
      setSelectedStudentFields((prev) =>
        prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
      );
    } else if (category === "achievement") {
      setSelectedAchievementFields((prev) =>
        prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
      );
    } else if (category === "academic") {
      setSelectedAcademicFields((prev) =>
        prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
      );
    }
  };

  const fetchReport = async (subType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/generate-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentFields: selectedStudentFields,
          achievementFields: selectedAchievementFields,
          academicFields: selectedAcademicFields,
          filters: {
            category: selectedCategory,
            subType: subType
          }
        })
      });
      const data = await response.json();

      // Filter only selected fields
      const allSelectedFields = [
        ...selectedStudentFields,
        ...selectedAchievementFields,
        ...selectedAcademicFields
      ];
      const filteredData = data.map((entry) => {
        let filtered = {};
        allSelectedFields.forEach((field) => {
          filtered[field] = entry[field] ?? "Not Provided";
        });
        return filtered;
      });

      return filteredData;
    } catch (error) {
      console.error("Error generating report:", error);
      return [];
    }
  };

  const generateReport = async () => {
    setLoading(true);
    let results = {};

    try {
      if (selectedSubType === "ALL") {
        let subTypesToProcess = [];

        if (selectedCategory === "Co-Curricular") {
          subTypesToProcess = achievementSubTypes["Co-Curricular"];
        } else if (selectedCategory === "Extra-Curricular") {
          subTypesToProcess = achievementSubTypes["Extra-Curricular"];
        } else if (selectedCategory === "Courses") {
          // Fetch distinct course names dynamically
          const distinctRes = await fetch(`${API_BASE_URL}/api/admin/get-distinct-courses`);
          const courses = await distinctRes.json();
          subTypesToProcess = courses || [];
        } else if (selectedCategory === "Special Achievement") {
          // Fetch distinct achievements dynamically
          const distinctRes = await fetch(`${API_BASE_URL}/api/admin/get-distinct-achievements`);
          const specialTypes = await distinctRes.json();
          subTypesToProcess = specialTypes || [];
        }

        for (const subType of subTypesToProcess) {
          results[subType] = await fetchReport(subType);
        }
      } else {
        const singleReport = await fetchReport(selectedSubType);
        results[selectedSubType] = singleReport;
      }

      setReportData(results);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-report-container">
      <h2 className="admin-report-title">Admin Report Generator</h2>

      {/* Category Selector */}
      <div className="report-field-section">
        <h3 className="field-section-title">Achievement Category</h3>
        <select
          className="report-select"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedSubType("");
          }}
        >
          <option value="">-- Select Category --</option>
          {Object.keys(achievementSubTypes).map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Sub-type Selector */}
      {selectedCategory && (
        <div className="report-field-section">
          <h3 className="field-section-title">Activity Type</h3>
          <select
            className="report-select"
            value={selectedSubType}
            onChange={(e) => setSelectedSubType(e.target.value)}
          >
            <option value="">-- Select Activity --</option>
            <option value="ALL">ALL</option>
            {achievementSubTypes[selectedCategory]
              .filter((t) => !t.includes("_DYNAMIC"))
              .map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
          </select>
        </div>
      )}

      {/* Student Fields */}
      <div className="report-field-section">
        <h3 className="field-section-title">Student Fields</h3>
        <div className="report-checkbox-group">
          {fieldOptions.student.map((field) => (
            <label key={field} className="report-checkbox-label">
              <input
                type="checkbox"
                value={field}
                checked={selectedStudentFields.includes(field)}
                onChange={() => handleCheckboxChange(field, "student")}
              />
              <span>{field}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Achievement Fields */}
      <div className="report-field-section">
        <h3 className="field-section-title">Achievement Fields</h3>
        <div className="report-checkbox-group">
          {fieldOptions.achievement.map((field) => (
            <label key={field} className="report-checkbox-label">
              <input
                type="checkbox"
                value={field}
                checked={selectedAchievementFields.includes(field)}
                onChange={() => handleCheckboxChange(field, "achievement")}
              />
              <span>{field}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Academic Fields */}
      <div className="report-field-section">
        <h3 className="field-section-title">Academic Fields</h3>
        <div className="report-checkbox-group">
          {fieldOptions.academic.map((field) => (
            <label key={field} className="report-checkbox-label">
              <input
                type="checkbox"
                value={field}
                checked={selectedAcademicFields.includes(field)}
                onChange={() => handleCheckboxChange(field, "academic")}
              />
              <span>{field}</span>
            </label>
          ))}
        </div>
      </div>

      <button 
        className="report-generate-button" 
        onClick={generateReport} 
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Report"}
      </button>

      {/* Report Output */}
      <div className="report-output-section">
        {Object.keys(reportData).length > 0 ? (
          Object.entries(reportData).map(([subType, data]) => (
            <div key={subType} className="report-result-block">
              <h3 className="report-result-title">
                {subType} Report ({data.length} records)
              </h3>
              <div className="report-table-wrapper">
                <table className="report-data-table">
                  <thead>
                    <tr>
                      {[...selectedStudentFields, ...selectedAchievementFields, ...selectedAcademicFields].map(
                        (field) => (
                          <th key={field}>{field}</th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => (
                      <tr key={idx}>
                        {[...selectedStudentFields, ...selectedAchievementFields, ...selectedAcademicFields].map(
                          (field) => (
                            <td key={field}>{row[field]}</td>
                          )
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <p className="report-empty-message">No report generated yet.</p>
        )}
      </div>
    </div>
  );
};

export default AdminReport;