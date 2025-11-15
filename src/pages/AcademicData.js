//frontend/src/pages/AcademicData.js

import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function AcademicForm() {
  const [uce, setUce] = useState(""); 
  const [educationType, setEducationType] = useState("");
  const [formData, setFormData] = useState({
    schoolCollege: "",
    boardUniversity: "",
    percentage: "",
    pdf: null,
  });
  const [records, setRecords] = useState([]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!educationType) {
      alert("❌ Please select Education Type.");
      return;
    }

    try {
      const data = new FormData();
      data.append("educationType", educationType);
      data.append("schoolCollege", formData.schoolCollege);
      data.append("boardUniversity", formData.boardUniversity);
      data.append("percentage", Number(formData.percentage));
      data.append("pdf", formData.pdf);

      const token=localStorage.getItem("token");

      await axios.post(`${API_BASE_URL}/api/academic`, data, {
        headers: { "Content-Type": "multipart/form-data" ,
          Authorization: `Bearer ${token}`,
        },
      });

      alert("✅ Record saved successfully!");
      fetchRecords();
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

  return (
    <div>
      <h2>Academic Details</h2>

      <div>
        <label>UCE Number:<span style={{ color: "red" }}>*</span></label>
        <input type="text" value={uce} readOnly disabled />
      </div>

      <div>
        <label>Select Education Type:<span style={{ color: "red" }}>*</span></label>
        <select
          value={educationType}
          onChange={(e) => setEducationType(e.target.value)}
        >
          <option value="">-- Select --</option>
          <option value="10th">10th</option>
          <option value="12th">12th</option>
          <option value="Diploma">Diploma</option>
        </select>
      </div>

      {educationType && (
        <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
          <div>
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

          <div>
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

          <div>
            <label>Percentage:<span style={{ color: "red" }}>*</span></label>
            <input
              type="text"
              name="percentage"
              value={formData.percentage}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Upload PDF:<span style={{ color: "red" }}>*</span></label>
            <input
              type="file"
              name="pdf"
              accept="application/pdf"
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit">Submit</button>
        </form>
      )}

      <h3>Saved Records</h3>
      {records.length > 0 ? (
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th>Exam Type</th>
              <th>UCE Number</th>
              <th>School/College</th>
              <th>Board/University</th>
              <th>Percentage</th>
              <th>Marksheet</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) =>
              rec.records.map((r, i) => (
                <tr key={rec._id + i}>
                  <td>{r.examType}</td>
                  <td>{rec.uce_no}</td>
                  <td>{r.schoolCollege}</td>
                  <td>{r.boardUniversity}</td>
                  <td>{r.percentage}%</td>
                  <td>
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      ) : (
        <p>No records found.</p>
      )}
    </div>
  );
}

export default AcademicForm;