import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AcademicData.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function AcademicForm() {
  const [uce, setUce] = useState(""); 
  const [educationType, setEducationType] = useState("");
  const [formData, setFormData] = useState({
    schoolCollege: "",
    boardUniversity: "",
    percentage: "",
    yearOfPassing: "",
    examRollNumber: "",
    examYear: "",
    startYear: "",
    endYear: "",
    cgpa: "",
    pdf: null,
  });
  const [records, setRecords] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);

  useEffect(() => {
    const fetchUceAndRecords = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const studentRes = await axios.get(
          `${API_BASE_URL}/api/students/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUce(studentRes.data.uce);

        const recordsRes = await axios.get(
          `${API_BASE_URL}/api/academic`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const studentRecords = recordsRes.data.filter(
          (rec) => rec.uce_no === studentRes.data.uce
        );

        setRecords(studentRecords);
      } catch (err) {
        console.error("Error fetching student or records:", err);
      }
    };

    fetchUceAndRecords();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setEducationType(record.examType);
    
    // Populate form data based on exam type
    if (record.examType === "10th" || record.examType === "12th" || record.examType === "Diploma") {
      setFormData({
        schoolCollege: record.schoolCollege || "",
        boardUniversity: record.boardUniversity || "",
        percentage: record.percentage || "",
        yearOfPassing: record.yearOfPassing || "",
        examRollNumber: "",
        examYear: "",
        startYear: "",
        endYear: "",
        cgpa: "",
        pdf: null,
      });
    } else if (record.examType === "JEE" || record.examType === "MHT CET") {
      setFormData({
        schoolCollege: "",
        boardUniversity: "",
        percentage: record.percentage || "",
        yearOfPassing: "",
        examRollNumber: record.examRollNumber || "",
        examYear: record.examYear || "",
        startYear: "",
        endYear: "",
        cgpa: "",
        pdf: null,
      });
    } else if (record.examType === "BE") {
      setFormData({
        schoolCollege: "",
        boardUniversity: "",
        percentage: "",
        yearOfPassing: "",
        examRollNumber: "",
        examYear: "",
        startYear: record.startYear || "",
        endYear: record.endYear || "",
        cgpa: record.cgpa || "",
        pdf: null,
      });
    }
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (examType) => {
    if (!window.confirm(`Are you sure you want to delete ${examType} record?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/academic/${examType}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Record deleted successfully!");
      fetchRecords();
    } catch (err) {
      console.error("Delete Error:", err);
      alert("❌ Failed to delete record: " + (err.response?.data?.error || "Unknown error"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!educationType) {
      alert("❌ Please select Education Type.");
      return;
    }

    try {
      const data = new FormData();
      data.append("educationType", educationType);
      
      // Append fields based on education type
      if (educationType === "10th" || educationType === "12th" || educationType === "Diploma") {
        data.append("schoolCollege", formData.schoolCollege);
        data.append("boardUniversity", formData.boardUniversity);
        data.append("percentage", Number(formData.percentage));
        data.append("yearOfPassing", Number(formData.yearOfPassing));
      } else if (educationType === "JEE" || educationType === "MHT CET") {
        data.append("examRollNumber", formData.examRollNumber);
        data.append("examYear", Number(formData.examYear));
        data.append("percentage", Number(formData.percentage));
      } else if (educationType === "BE") {
        data.append("startYear", Number(formData.startYear));
        data.append("endYear", Number(formData.endYear));
        data.append("cgpa", Number(formData.cgpa));
      }
      
      if (formData.pdf) {
        data.append("pdf", formData.pdf);
      }

      const token = localStorage.getItem("token");

      await axios.post(`${API_BASE_URL}/api/academic`, data, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      alert(editingRecord ? "✅ Record updated successfully!" : "✅ Record saved successfully!");
      fetchRecords();
      
      // Reset form
      setFormData({
        schoolCollege: "",
        boardUniversity: "",
        percentage: "",
        yearOfPassing: "",
        examRollNumber: "",
        examYear: "",
        startYear: "",
        endYear: "",
        cgpa: "",
        pdf: null,
      });
      setEducationType("");
      setEditingRecord(null);
    }
    catch (err) {
      console.error(err.response?.data || err);
      alert("❌ Failed to save record: " + (err.response?.data?.error || "Unknown error"));
    }
  };
    
  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/academic`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching records:", err);
    }
  };

  const renderFormFields = () => {
    if (!educationType) return null;

    if (educationType === "10th" || educationType === "12th" || educationType === "Diploma") {
      return (
        <>
          <div className="form-field-inner">
            <label>
              {educationType === "10th" ? "School Name:" : "College Name:"}
              <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="schoolCollege"
              value={formData.schoolCollege}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field-inner">
            <label>
              {educationType === "Diploma" ? "University:" : "Board:"}
              <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="boardUniversity"
              value={formData.boardUniversity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field-inner">
            <label>Percentage:<span style={{ color: "red" }}>*</span></label>
            <input
              type="text"
              name="percentage"
              value={formData.percentage}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field-inner">
            <label>Year of Passing:<span style={{ color: "red" }}>*</span></label>
            <input
              type="number"
              name="yearOfPassing"
              value={formData.yearOfPassing}
              onChange={handleChange}
              placeholder="e.g., 2020"
              required
            />
          </div>
        </>
      );
    } else if (educationType === "JEE" || educationType === "MHT CET") {
      return (
        <>
          <div className="form-field-inner">
            <label>Exam Roll Number:<span style={{ color: "red" }}>*</span></label>
            <input
              type="text"
              name="examRollNumber"
              value={formData.examRollNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field-inner">
            <label>Exam Year:<span style={{ color: "red" }}>*</span></label>
            <input
              type="number"
              name="examYear"
              value={formData.examYear}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field-inner">
            <label>Percentage:<span style={{ color: "red" }}>*</span></label>
            <input
              type="text"
              name="percentage"
              value={formData.percentage}
              onChange={handleChange}
              required
            />
          </div>
        </>
      );
    } else if (educationType === "BE") {
      return (
        <>
          <div className="form-field-inner">
            <label>Start Year:<span style={{ color: "red" }}>*</span></label>
            <input
              type="number"
              name="startYear"
              value={formData.startYear}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field-inner">
            <label>End Year:<span style={{ color: "red" }}>*</span></label>
            <input
              type="number"
              name="endYear"
              value={formData.endYear}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field-inner">
            <label>CGPA:<span style={{ color: "red" }}>*</span></label>
            <input
              type="text"
              name="cgpa"
              value={formData.cgpa}
              onChange={handleChange}
              required
            />
          </div>
        </>
      );
    }
  };

  const renderTableRows = () => {
    return records.map((rec) =>
      rec.records.map((r, i) => (
        <tr key={rec._id + i}>
          <td>{r.examType}</td>
          <td>{rec.uce_no}</td>
          <td>
            {r.examType === "10th" || r.examType === "12th" || r.examType === "Diploma" 
              ? r.schoolCollege 
              : r.examType === "JEE" || r.examType === "MHT CET"
              ? `Roll No: ${r.examRollNumber}`
              : r.examType === "BE"
              ? `${r.startYear} - ${r.endYear}`
              : "-"}
          </td>
          <td>
            {r.examType === "10th" || r.examType === "12th" || r.examType === "Diploma" 
              ? r.boardUniversity 
              : "-"}
          </td>
          <td>
            {r.examType === "BE" 
              ? `${r.cgpa} CGPA` 
              : `${r.percentage}%`}
          </td>
          <td>
            {(r.examType === "10th" || r.examType === "12th" || r.examType === "Diploma") && r.yearOfPassing
              ? r.yearOfPassing
              : (r.examType === "JEE" || r.examType === "MHT CET") && r.examYear
              ? r.examYear
              : "-"}
          </td>
          <td>
            <div className="marksheet-actions">
              {r.marksheetUrl ? (
                <a
                  href={`${API_BASE_URL}${r.marksheetUrl}`}
                  target="_blank"
                  rel="noreferrer"
                > 
                  View PDF
                </a>
              ) : (
                "No File"
              )}
              <div className="action-buttons">
                <button 
                  className="edit-btn-link" 
                  onClick={() => handleEdit(r)}
                >
                  Edit
                </button>
                <span className="separator">/</span>
                <button 
                  className="delete-btn-link" 
                  onClick={() => handleDelete(r.examType)}
                >
                  Delete
                </button>
              </div>
            </div>
          </td>
        </tr>
      ))
    );
  };

  return (
    <div className="academic-container">
      <h2>Academic Details</h2>

      <div className="form-field">
        <label>UCE Number:<span style={{ color: "red" }}>*</span></label>
        <input type="text" value={uce} readOnly disabled />
      </div>

      <div className="form-field">
        <label>Select Education Type:<span style={{ color: "red" }}>*</span></label>
        <select
          value={educationType}
          onChange={(e) => setEducationType(e.target.value)}
        >
          <option value="">-- Select --</option>
          <option value="10th">10th</option>
          <option value="12th">12th</option>
          <option value="Diploma">Diploma</option>
          <option value="JEE">JEE</option>
          <option value="MHT CET">MHT CET</option>
          <option value="BE">BE</option>
        </select>
      </div>

      {educationType && (
        <form onSubmit={handleSubmit} className="academic-form-full">
          {editingRecord && (
            <div className="edit-notice">
              Editing {editingRecord.examType} record
            </div>
          )}
          
          {renderFormFields()}

          <div className="form-field-inner">
            <label>Upload PDF:{editingRecord ? "" : <span style={{ color: "red" }}>*</span>}</label>
            <input
              type="file"
              name="pdf"
              accept="application/pdf"
              onChange={handleChange}
              required={!editingRecord}
            />
            {editingRecord && (
              <small style={{ color: "#6c757d" }}>Leave empty to keep existing PDF</small>
            )}
          </div>

          <button type="submit" className="submit-btn-inner">
            {editingRecord ? "Update Record" : "Submit"}
          </button>
          
          {editingRecord && (
            <button 
              type="button" 
              className="cancel-btn-inner"
              onClick={() => {
                setEditingRecord(null);
                setEducationType("");
                setFormData({
                  schoolCollege: "",
                  boardUniversity: "",
                  percentage: "",
                  yearOfPassing: "",
                  examRollNumber: "",
                  examYear: "",
                  startYear: "",
                  endYear: "",
                  cgpa: "",
                  pdf: null,
                });
              }}
            >
              Cancel
            </button>
          )}
        </form>
      )}

      <h3>Saved Records</h3>
      {records.length > 0 ? (
        <table className="records-table">
          <thead>
            <tr>
              <th>Exam Type</th>
              <th>UCE Number</th>
              <th>Details</th>
              <th>Board</th>
              <th>Score</th>
              <th>Year of Passing</th>
              <th>Marksheet</th>
            </tr>
          </thead>
          <tbody>
            {renderTableRows()}
          </tbody>
        </table>
      ) : (
        <p>No records found.</p>
      )}
    </div>
  );
}

export default AcademicForm;