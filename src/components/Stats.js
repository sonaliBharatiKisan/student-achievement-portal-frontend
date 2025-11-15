import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Stats({ email }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!email) return;
    axios
      .get(`${API_BASE_URL}/api/achievements/stats/${email}`)
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err));
  }, [email]);

  if (!stats) return null;

  return (
    <div style={{ margin: "20px 0", textAlign: "center" }}>
      <p>Total Points: {stats.totalPoints}</p>
      <p>Badge: {stats.badge}</p>
      <p>Rank: {stats.rank} / {stats.totalStudents}</p>
      <p>Total Achievements: {stats.totalAchievements}</p>
    </div>
  );
}

export default Stats;