// frontend/src/pages/AchievementStats.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import "./AchievementStats.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const COLORS = {
  "Co-Curricular": "#0088FE",
  "Extra-Curricular": "#00C49F",
  "Courses": "#FFBB28",
  "Special Achievement": "#FF8042",
  // Sub-category colors
  "Workshop": "#8884d8",
  "Seminar/Webinar": "#82ca9d",
  "Project Competition": "#ffc658",
  "Paper Presentation": "#ff7c7c",
  "Paper Publication": "#8dd1e1",
  "Hackathon": "#d084d0",
  "Code Competition": "#6cdedaff",
  "Other": "#ffb347",
  "Sports": "#4ecdc4",
  "Cultural": "#ff6b6b",
  "Coursera": "#ffd93d",
  "NPTEL": "#6bcf7f",
  "Udemy": "#c44569",
  "Others": "#95afc0",
  "Scholarship": "#f9ca24",
  "Cash Prize": "#eb4d4b"
};

function AchievementStats() {
  const [stats, setStats] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [drillDownStats, setDrillDownStats] = useState([]);
  const [drillDownTotal, setDrillDownTotal] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/stats/achievement-stats`);
      
      if (response.data.success) {
        setStats(response.data.stats);
        setTotal(response.data.total);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to load achievement statistics");
      setLoading(false);
    }
  };

  const fetchDrillDownStats = async (type) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/stats/achievement-stats/drilldown/${encodeURIComponent(type)}`);
      
      if (response.data.success) {
        setDrillDownStats(response.data.stats);
        setDrillDownTotal(response.data.total);
      }
    } catch (err) {
      console.error("Error fetching drill-down stats:", err);
    }
  };

  const handleTypeClick = (type) => {
    setSelectedType(type);
    fetchDrillDownStats(type);
  };

  const handleBackToMain = () => {
    setSelectedType(null);
    setDrillDownStats([]);
    setDrillDownTotal(0);
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="pie-chart-label"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="stats-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchStats} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  // Show drill-down view if a type is selected
  if (selectedType) {
    return (
      <div className="stats-container">
        <div className="stats-header">
          <button onClick={handleBackToMain} className="back-btn">
            &larr; Back to Overview
          </button>
          <h1>Achievement Statistics - {selectedType}</h1>
          <p className="stats-subtitle">Distribution of {selectedType} by category</p>
        </div>

        <div className="stats-content">
          {/* Drill-down Pie Chart */}
          <div className="chart-section">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={drillDownStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="category"
                >
                  {drillDownStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.category] || "#999"} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} achievements`, name]}
                  className="custom-tooltip"
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => `${value}: ${entry.payload.count}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Drill-down Stats Cards */}
          <div className="stats-cards">
            <div className="total-card">
              <h2>Total {selectedType}</h2>
              <div className="total-number">{drillDownTotal}</div>
            </div>

            {drillDownStats.map((stat) => (
              <div 
                key={stat.category} 
                className="stat-card"
                style={{ borderLeft: `4px solid ${COLORS[stat.category] || "#999"}` }}
              >
                <div className="stat-header">
                  <h3>{stat.category}</h3>
                  <span 
                    className="stat-badge"
                    style={{ backgroundColor: COLORS[stat.category] || "#999" }}
                  >
                    {stat.count}
                  </span>
                </div>
                <div className="stat-percentage">
                  {drillDownTotal > 0 ? ((stat.count / drillDownTotal) * 100).toFixed(1) : 0}% of {selectedType}
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${drillDownTotal > 0 ? (stat.count / drillDownTotal) * 100 : 0}%`,
                      backgroundColor: COLORS[stat.category] || "#999"
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main view
  return (
    <div className="stats-container">
      <div className="stats-header">
        <h1>Achievement Statistics</h1>
        <p className="stats-subtitle">Distribution of achievements by type</p>
      </div>

      <div className="stats-content">
        {/* Pie Chart Section */}
        <div className="chart-section">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={stats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={150}
                fill="#8884d8"
                dataKey="count"
                nameKey="type"
              >
                {stats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.type]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`${value} achievements`, name]}
                className="custom-tooltip"
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => `${value}: ${entry.payload.count}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Cards Section */}
        <div className="stats-cards">
          <div className="total-card">
            <h2>Total Achievements</h2>
            <div className="total-number">{total}</div>
          </div>

          {stats.map((stat) => (
            <div 
              key={stat.type} 
              className="stat-card clickable-card"
              style={{ borderLeft: `4px solid ${COLORS[stat.type]}` }}
              onClick={() => handleTypeClick(stat.type)}
            >
              <div className="stat-header">
                <h3>{stat.type}</h3>
                <span 
                  className="stat-badge"
                  style={{ backgroundColor: COLORS[stat.type] }}
                >
                  {stat.count}
                </span>
              </div>
              <div className="stat-percentage">
                {total > 0 ? ((stat.count / total) * 100).toFixed(1) : 0}% of total
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${total > 0 ? (stat.count / total) * 100 : 0}%`,
                    backgroundColor: COLORS[stat.type]
                  }}
                ></div>
              </div>
              <div className="click-hint">Click to view details &rarr;</div>
            </div>
          ))}
        </div>
      </div>

      <div className="refresh-section">
        <button onClick={fetchStats} className="refresh-btn">
          Refresh Data
        </button>
      </div>
    </div>
  );
}

export default AchievementStats;