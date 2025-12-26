//frontend/src/components/AnalyticsReports.js

import { useEffect, useState } from "react";
import { fetchSummary } from "../services/api";

function AnalyticsReports() {
  const [summary, setSummary] = useState({
    studentCount: 0,
    verifiedCount: 0,
    unverifiedCount: 0,
    achievementCount: 0,
  });

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const res = await fetchSummary();
      setSummary(res.data);
    } catch (err) {
      console.error("Error fetching summary", err);
    }
  };

  return (
    <div>
      <h2>Analytics & Reports</h2>
      <div style={{ marginTop: "20px" }}>
        <p>Total Students: {summary.studentCount}</p>
        <p>Verified Students: {summary.verifiedCount}</p>
        <p>Unverified Students: {summary.unverifiedCount}</p>
        <p>Total Achievements: {summary.achievementCount}</p>
      </div>
    </div>
  );
}

export default AnalyticsReports;