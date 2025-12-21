// frontend/src/components/StudentDetails.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StudentDetails.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const StudentDetails = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("USN");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/report`, {
        fields: ["USN", "Name", "DOB", "Gender", "Email", "Phone", "Department", "Year", "Semester"],
        filters: {},
      });
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching student details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    const direction = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);

    const sorted = [...students].sort((a, b) => {
      let aVal = a[field] || "";
      let bVal = b[field] || "";
      
      if (direction === "asc") {
        return aVal.toString().localeCompare(bVal.toString(), undefined, { numeric: true });
      } else {
        return bVal.toString().localeCompare(aVal.toString(), undefined, { numeric: true });
      }
    });
    
    setStudents(sorted);
  };

  const filteredStudents = students.filter(student =>
    Object.values(student).some(value =>
      value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading student details...</p>
      </div>
    );
  }

  return (
    <div className="student-details-container">
      <div className="header-section">
        <h2>Student Details Management</h2>
        <div className="controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button onClick={fetchStudents} className="refresh-btn">
            🔄 Refresh Data
          </button>
        </div>
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <h3>{filteredStudents.length}</h3>
          <p>Total Students</p>
        </div>
        <div className="stat-card">
          <h3>{new Set(filteredStudents.map(s => s.Department)).size}</h3>
          <p>Departments</p>
        </div>
        <div className="stat-card">
          <h3>{new Set(filteredStudents.map(s => s.Year)).size}</h3>
          <p>Academic Years</p>
        </div>
      </div>

      <div className="table-section">
        <div className="table-container">
          <table className="students-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("USN")} className="sortable">
                  USN {sortField === "USN" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("Name")} className="sortable">
                  Name {sortField === "Name" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("DOB")} className="sortable">
                  Date of Birth {sortField === "DOB" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("Gender")} className="sortable">
                  Gender {sortField === "Gender" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("Email")} className="sortable">
                  Email {sortField === "Email" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("Phone")} className="sortable">
                  Phone {sortField === "Phone" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("Department")} className="sortable">
                  Department {sortField === "Department" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("Year")} className="sortable">
                  Year {sortField === "Year" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("Semester")} className="sortable">
                  Semester {sortField === "Semester" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <tr key={student._id || student.USN || index}>
                    <td className="usn-cell">{student.USN || "-"}</td>
                    <td className="name-cell">{student.Name || "-"}</td>
                    <td className="dob-cell">{student.DOB || "-"}</td>
                    <td className="gender-cell">{student.Gender || "-"}</td>
                    <td className="email-cell">{student.Email || "-"}</td>
                    <td className="phone-cell">{student.Phone || "-"}</td>
                    <td className="dept-cell">{student.Department || "-"}</td>
                    <td className="year-cell">{student.Year || "-"}</td>
                    <td className="semester-cell">{student.Semester || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    {searchTerm ? "No students match your search" : "No students found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;