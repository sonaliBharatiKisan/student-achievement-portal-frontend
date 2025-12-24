// frontend/src/pages/Achievements.js
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AchievementForm from "../components/AchievementForm";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Achievements() {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState([]);
  const [visibleCounts, setVisibleCounts] = useState({});
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Get email once and store it
  const email = 
    localStorage.getItem("studentEmail") ||
    localStorage.getItem("email") ||
    JSON.parse(localStorage.getItem("user") || "{}")?.email ||
    "guest@example.com";

  // ✅ Check authentication on mount
  useEffect(() => {
    console.log("🔍 Achievements page mounted");
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.log("❌ No token found, redirecting to login");
      navigate("/login", { replace: true });
      return;
    }
    
    console.log("✅ Token found:", token.substring(0, 20) + "...");
    console.log("📧 Email:", email);
  }, [navigate, email]);

  // ✅ Fetch achievements with useCallback to prevent re-creation
  const fetchAchievements = useCallback(async () => {
    if (email === "guest@example.com") {
      console.warn("⚠️ Guest email detected, skipping fetch");
      setLoading(false);
      return;
    }

    try {
      console.log(`📡 Fetching achievements for: ${email}`);
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE_URL}/api/achievements/${email}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log(`✅ Fetched ${res.data?.length || 0} achievements`);
      setAchievements(res.data || []);
    } catch (err) {
      console.error("❌ Fetch Error:", err);
      
      if (err.response?.status === 401) {
        console.log("🔒 Unauthorized - redirecting to login");
        localStorage.clear();
        navigate("/login", { replace: true });
      } else {
        setError(err.response?.data?.message || "Failed to load achievements");
        setAchievements([]);
      }
    } finally {
      setLoading(false);
    }
  }, [email, navigate]);

  // ✅ Fetch on mount
  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  // ✅ Delete Achievement
  const handleDelete = async (achievementId) => {
    if (!window.confirm("Are you sure you want to delete this achievement?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(
        `${API_BASE_URL}/api/achievements/${achievementId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 200) {
        alert("Achievement deleted successfully!");
        fetchAchievements();
      }
    } catch (err) {
      console.error("Delete Error:", err);
      alert(err.response?.data?.message || "Failed to delete achievement");
    }
  };

  // ✅ Edit Achievement
  const handleEdit = (achievement) => {
    console.log("✏️ Editing achievement:", achievement._id);
    setEditingAchievement(achievement);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    console.log("❌ Cancelled editing");
    setEditingAchievement(null);
  };

  // ---------- Helper Functions ----------
  const renderEventName = (ach) => {
    if (ach.eventName) return ach.eventName;
    if (ach.workshopName) return ach.workshopName;
    if (ach.seminarName) return ach.seminarName;
    if (ach.courseName) return ach.courseName;
    if (ach.projectTopic) return ach.projectTopic;
    if (ach.hackathonName) return ach.hackathonName;
    if (ach.title) return ach.title;
    return "-";
  };

  const renderDate = (ach) => {
    // Date range
    if (ach.dateSelection === "range") {
      if (ach.eventFrom && ach.eventTo) {
        const fromDate = new Date(ach.eventFrom).toLocaleDateString();
        const toDate = new Date(ach.eventTo).toLocaleDateString();
        return `${fromDate} - ${toDate}`;
      }
    }

    // Single date
    if (ach.dateSelection === "single" && ach.eventDate) {
      return new Date(ach.eventDate).toLocaleDateString();
    }

    // Fallback for legacy records
    if (ach.eventDate) {
      return new Date(ach.eventDate).toLocaleDateString();
    }

    if (ach.publicationDate) {
      return new Date(ach.publicationDate).toLocaleDateString();
    }

    if (ach.startMonth && ach.startYear && ach.endMonth && ach.endYear) {
      return `${ach.startMonth} ${ach.startYear} - ${ach.endMonth} ${ach.endYear}`;
    }
    
    if (ach.startMonth && ach.startYear) {
      return `${ach.startMonth} ${ach.startYear} - Present`;
    }

    if (ach.awardMonth && ach.awardYear) {
      return `${ach.awardMonth} ${ach.awardYear}`;
    }
    
    if (ach.awardStartYear) {
      return `${ach.awardStartYear} - ${ach.awardEndYear || "Present"}`;
    }

    return "-";
  };

  const renderOrganizer = (ach) => {
    if (ach.organizerName) return ach.organizerName;
    if (ach.awardingOrganization) return ach.awardingOrganization;
    if (ach.publisherName) return ach.publisherName;
    return "-";
  };

  const renderLocation = (ach) => {
    if (ach.organizerLocation) return ach.organizerLocation;
    if (ach.workshopLocation) return ach.workshopLocation;
    if (ach.seminarLocation) return ach.seminarLocation;
    if (ach.competitionLocation) return ach.competitionLocation;
    if (ach.eventLocation) return ach.eventLocation;
    return "-";
  };

  const renderAdditionalInfo = (ach) => {
    let info = [];
    if (ach.prize && ach.prize !== "0") info.push(`Prize: ${ach.prize}`);
    if (ach.amount) info.push(`Amount: ${ach.amount}`);
    if (ach.indexing) info.push(`Indexing: ${ach.indexing}`);
    if (ach.publicationType) info.push(`Type: ${ach.publicationType}`);
    if (ach.authors && ach.authors.length > 0) {
      info.push(`Authors: ${ach.authors.join(", ")}`);
    }
    return info.length > 0 ? info.join(" | ") : "-";
  };

  const renderCertificateCell = (ach) => {
    if (ach.certificatePath) {
      return (
        <a
          href={ach.certificatePath}
          target="_blank"
          rel="noreferrer"
          className="view-certificate"
        >
          View Certificate
        </a>
      );
    }
    return <span className="no-certificate">No Certificate</span>;
  };

  const groupedAchievements = achievements.reduce((groups, ach) => {
    const type = ach.type || "Others";
    if (!groups[type]) groups[type] = [];
    groups[type].push(ach);
    return groups;
  }, {});

  const getTableHeaders = (type) => {
    const baseHeaders = ["Category", "Event/Course Name", "Date"];
    switch (type) {
      case "Special Achievement":
        return [...baseHeaders, "Amount", "Organization", "Certificate", "Actions"];
      case "Courses":
        return [...baseHeaders, "Duration", "Certificate", "Actions"];
      case "Paper Publication":
        return [
          ...baseHeaders,
          "Level",
          "Publisher",
          "Indexing",
          "Additional Info",
          "Certificate",
          "Actions"
        ];
      default:
        return [
          ...baseHeaders,
          "Level",
          "Position",
          "Location",
          "Organizer",
          "Additional Info",
          "Certificate",
          "Actions"
        ];
    }
  };

  const renderTableRow = (ach, type) => {
    const baseColumns = [
      <td key="category">{ach.category}</td>,
      <td key="name">{renderEventName(ach)}</td>,
      <td key="date">{renderDate(ach)}</td>,
    ];

    const actionColumn = (
      <td key="actions">
        <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
          <button
            onClick={() => handleEdit(ach)}
            style={{
              background: "#007bff",
              color: "white",
              border: "none",
              padding: "5px 10px",
              cursor: "pointer",
              borderRadius: "4px",
              fontSize: "12px"
            }}
            title="Edit Achievement"
          >
            ✏ Edit
          </button>
          <button
            onClick={() => handleDelete(ach._id)}
            style={{
              background: "#dc3545",
              color: "white",
              border: "none",
              padding: "5px 10px",
              cursor: "pointer",
              borderRadius: "4px",
              fontSize: "12px"
            }}
            title="Delete Achievement"
          >
            🗑 Delete
          </button>
        </div>
      </td>
    );

    switch (type) {
      case "Special Achievement":
        return [
          ...baseColumns,
          <td key="amount">{ach.amount || "-"}</td>,
          <td key="org">{renderOrganizer(ach)}</td>,
          <td key="cert">{renderCertificateCell(ach)}</td>,
          actionColumn
        ];
      case "Courses":
        return [
          ...baseColumns,
          <td key="duration">
            {ach.startMonth && ach.endMonth
              ? `${ach.startMonth} ${ach.startYear} - ${ach.endMonth} ${ach.endYear}`
              : ach.startMonth && ach.startYear
              ? `${ach.startMonth} ${ach.startYear} - Present`
              : "-"}
          </td>,
          <td key="cert">{renderCertificateCell(ach)}</td>,
          actionColumn
        ];
      case "Paper Publication":
        return [
          ...baseColumns,
          <td key="level">{ach.level || "-"}</td>,
          <td key="publisher">{renderOrganizer(ach)}</td>,
          <td key="indexing">{ach.indexing || "-"}</td>,
          <td key="info">{renderAdditionalInfo(ach)}</td>,
          <td key="cert">{renderCertificateCell(ach)}</td>,
          actionColumn
        ];
      default:
        return [
          ...baseColumns,
          <td key="level">{ach.level || "-"}</td>,
          <td key="position">{ach.position || "-"}</td>,
          <td key="location">{renderLocation(ach)}</td>,
          <td key="organizer">{renderOrganizer(ach)}</td>,
          <td key="info">{renderAdditionalInfo(ach)}</td>,
          <td key="cert">{renderCertificateCell(ach)}</td>,
          actionColumn
        ];
    }
  };

  const handleSeeMore = (type, total) => {
    setVisibleCounts((prev) => ({
      ...prev,
      [type]: Math.min((prev[type] || 5) + 5, total),
    }));
  };

  const handleSeeLess = (type) => {
    setVisibleCounts((prev) => ({
      ...prev,
      [type]: Math.max((prev[type] || 5) - 5, 5),
    }));
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h2>Loading achievements...</h2>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "50px", color: "red" }}>
        <h2>Error: {error}</h2>
        <button onClick={fetchAchievements}>Retry</button>
      </div>
    );
  }

  return (
    <div className="achievements-page">
      <h2 style={{ textAlign: "center", marginTop: 20, marginBottom: 20 }}>
        Student Achievements
      </h2>

      {/* Achievement Form */}
      <AchievementForm
        onSuccess={() => {
          fetchAchievements();
          setEditingAchievement(null);
        }}
        editingAchievement={editingAchievement}
        onCancelEdit={handleCancelEdit}
      />

      {/* Achievements List */}
      {Object.keys(groupedAchievements).length > 0 ? (
        <div>
          {Object.entries(groupedAchievements).map(([type, typeAchievements]) => {
            const visibleCount = visibleCounts[type] || 5;
            const showAchievements = typeAchievements.slice(0, visibleCount);

            return (
              <div key={type} className="table-container">
                <h3>
                  {type} Achievements ({typeAchievements.length})
                </h3>
                <div className="table-wrapper">
                  <table className="achievements-table">
                    <thead>
                      <tr>
                        {getTableHeaders(type).map((header, index) => (
                          <th key={index}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {showAchievements.map((ach, index) => (
                        <tr
                          key={ach._id}
                          style={{
                            backgroundColor: index % 2 === 0 ? "#fafbfc" : "white",
                          }}
                        >
                          {renderTableRow(ach, type)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {typeAchievements.length > 5 && (
                  <div style={{ textAlign: "center", marginTop: "10px" }}>
                    {visibleCount < typeAchievements.length && (
                      <button
                        className="see-more-btn"
                        onClick={() => handleSeeMore(type, typeAchievements.length)}
                        style={{
                          border: "none",
                          background: "none",
                          color: "#007bff",
                          cursor: "pointer",
                          fontSize: "14px",
                          marginRight: "10px",
                        }}
                      >
                        See More
                      </button>
                    )}
                    {visibleCount > 5 && (
                      <button
                        className="see-less-btn"
                        onClick={() => handleSeeLess(type)}
                        style={{
                          border: "none",
                          background: "none",
                          color: "#007bff",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        See Less
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <p>No achievements found for email: {email}</p>
          <p>Add your first achievement using the form above!</p>
        </div>
      )}
    </div>
  );
}

export default Achievements;