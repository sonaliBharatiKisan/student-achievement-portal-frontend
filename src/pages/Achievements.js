// frontend/src/pages/Achievements.js
import { useEffect, useState } from "react";
import axios from "axios";
import AchievementForm from "../components/AchievementForm"; // ✅ fixed spelling

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [visibleCounts, setVisibleCounts] = useState({}); // Track visible rows per type

  const email =
    localStorage.getItem("studentEmail") ||
    localStorage.getItem("email") ||
    JSON.parse(localStorage.getItem("user") || "{}")?.email ||
    "guest@example.com";

  const fetchAchievements = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/achievements/${email}`
      );
      setAchievements(res.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setAchievements([]);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  // ---------- helpers ----------
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
    if (ach.eventDate) return new Date(ach.eventDate).toLocaleDateString();
    if (ach.publicationDate)
      return new Date(ach.publicationDate).toLocaleDateString();
    if (ach.startMonth && ach.startYear && ach.endMonth && ach.endYear) {
      return `${ach.startMonth} ${ach.startYear} - ${ach.endMonth} ${ach.endYear}`;
    }
    if (ach.startMonth && ach.startYear) {
      return `${ach.startMonth} ${ach.startYear} - Present`;
    }
    if (ach.awardMonth && ach.awardYear)
      return `${ach.awardMonth} ${ach.awardYear}`;
    if (ach.awardStartYear)
      return `${ach.awardStartYear} - ${ach.awardEndYear || "Present"}`;
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
    if (ach.authors && ach.authors.length > 0)
      info.push(`Authors: ${ach.authors.join(", ")}`);
    return info.length > 0 ? info.join(" | ") : "-";
  };

  // ✅ keep working certificate rendering
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
        return [...baseHeaders, "Amount", "Organization", "Certificate"];
      case "Courses":
        return [...baseHeaders, "Duration", "Certificate"];
      case "Paper Publication":
        return [
          ...baseHeaders,
          "Level",
          "Publisher",
          "Indexing",
          "Additional Info",
          "Certificate",
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
        ];
    }
  };

  const renderTableRow = (ach, type) => {
    const baseColumns = [
      <td key="category">{ach.category}</td>,
      <td key="name">{renderEventName(ach)}</td>,
      <td key="date">{renderDate(ach)}</td>,
    ];

    switch (type) {
      case "Special Achievement":
        return [
          ...baseColumns,
          <td key="amount">{ach.amount || "-"}</td>,
          <td key="org">{renderOrganizer(ach)}</td>,
          <td key="cert">{renderCertificateCell(ach)}</td>,
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
        ];
      case "Paper Publication":
        return [
          ...baseColumns,
          <td key="level">{ach.level || "-"}</td>,
          <td key="publisher">{renderOrganizer(ach)}</td>,
          <td key="indexing">{ach.indexing || "-"}</td>,
          <td key="info">{renderAdditionalInfo(ach)}</td>,
          <td key="cert">{renderCertificateCell(ach)}</td>,
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

  return (
    <div className="achievements-page">
      <h2 style={{ textAlign: "center", marginTop: 20, marginBottom: 20 }}>
        Student Achievements
      </h2>

      {/* ✅ keep refresh after upload */}
      <AchievementForm onSuccess={fetchAchievements} />

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

                {/* See More / See Less */}
                {typeAchievements.length > 5 && (
                  <div style={{ textAlign: "center", marginTop: "10px" }}>
                    {visibleCount < typeAchievements.length && (
                      <button
                        className="see-more-btn"
                        onClick={() =>
                          handleSeeMore(type, typeAchievements.length)
                        }
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