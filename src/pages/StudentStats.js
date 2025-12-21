import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const MAIN_COLORS = {
  "Co-Curricular": "#FF6B6B",
  "Extra-Curricular": "#4ECDC4",
  "Courses": "#FFD93D",
  "Special Achievement": "#95E1D3"
};

const SUB_COLORS = [
  "#FF6B6B", "#4ECDC4", "#FFD93D", "#95E1D3", 
  "#F38181", "#AA96DA", "#FCBAD3", "#A8D8EA",
  "#FFAAA5", "#FFDAC1", "#B4F8C8", "#FBE7C6"
];

function StudentStats() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [mainChartData, setMainChartData] = useState([]);
  const [subChartData, setSubChartData] = useState([]);
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const email = localStorage.getItem("studentEmail") || localStorage.getItem("email");
      const token = localStorage.getItem("token");

      if (!email) {
        alert("Please login first");
        setLoading(false);
        return;
      }

      const response = await fetch(`https://your-api-url.com/api/achievements/${email}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch achievements");
      }

      const data = await response.json();
      setAchievements(data);
      
      if (data.length > 0 && data[0].studentName) {
        setStudentName(data[0].studentName);
      }

      processMainChartData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      setLoading(false);
    }
  };

  const processMainChartData = (data) => {
    const typeCounts = {
      "Co-Curricular": 0,
      "Extra-Curricular": 0,
      "Courses": 0,
      "Special Achievement": 0
    };

    data.forEach(achievement => {
      if (typeCounts.hasOwnProperty(achievement.type)) {
        typeCounts[achievement.type]++;
      }
    });

    const chartData = Object.entries(typeCounts)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({
        name: type,
        value: count,
        percentage: ((count / data.length) * 100).toFixed(1)
      }));

    setMainChartData(chartData);
  };

  const handleTypeClick = (type) => {
    if (selectedType === type) {
      setSelectedType(null);
      setSubChartData([]);
    } else {
      setSelectedType(type);
      processSubChartData(type);
    }
  };

  const processSubChartData = (type) => {
    const filteredAchievements = achievements.filter(a => a.type === type);
    const categoryCounts = {};

    filteredAchievements.forEach(achievement => {
      const category = achievement.category;
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });

    const chartData = Object.entries(categoryCounts)
      .map(([category, count]) => ({
        name: category,
        value: count,
        percentage: ((count / filteredAchievements.length) * 100).toFixed(1)
      }));

    setSubChartData(chartData);
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your stats...</p>
        </div>
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-md">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Student Statistics</h2>
          <p className="text-gray-600">No achievements found. Start adding your achievements to see statistics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">📊 My Achievement Statistics</h2>
          {studentName && <p className="text-lg text-purple-600 mb-2">Welcome, {studentName}!</p>}
          <p className="text-gray-600">
            Total Achievements: <strong className="text-2xl text-purple-600">{achievements.length}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Main Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Achievement Distribution by Type</h2>
            <p className="text-sm text-gray-600 mb-4">Click on any section to see detailed breakdown</p>
            
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={mainChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={(data) => handleTypeClick(data.name)}
                  style={{ cursor: 'pointer' }}
                >
                  {mainChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={MAIN_COLORS[entry.name]}
                      stroke={selectedType === entry.name ? "#000" : "#fff"}
                      strokeWidth={selectedType === entry.name ? 3 : 2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, name]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => `${value}: ${entry.payload.value} (${entry.payload.percentage}%)`}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {mainChartData.map((item, index) => (
                <div 
                  key={index} 
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition ${
                    selectedType === item.name ? 'bg-gray-100 ring-2 ring-gray-400' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleTypeClick(item.name)}
                >
                  <div 
                    className="w-4 h-4 rounded mr-3"
                    style={{ backgroundColor: MAIN_COLORS[item.name] }}
                  ></div>
                  <span className="text-sm">
                    <strong>{item.name}</strong>: {item.value} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sub Chart */}
          {selectedType && subChartData.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedType} - Category Breakdown</h2>
              <p className="text-sm text-gray-600 mb-4">Detailed view of {selectedType} achievements</p>
              
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={subChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={CustomLabel}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {subChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={SUB_COLORS[index % SUB_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, name]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value, entry) => `${value}: ${entry.payload.value} (${entry.payload.percentage}%)`}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-4 space-y-2">
                {subChartData.map((item, index) => (
                  <div key={index} className="flex items-center p-3 rounded-lg bg-gray-50">
                    <div 
                      className="w-4 h-4 rounded mr-3"
                      style={{ backgroundColor: SUB_COLORS[index % SUB_COLORS.length] }}
                    ></div>
                    <span className="text-sm">
                      <strong>{item.name}</strong>: {item.value} ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>

              <button 
                className="mt-4 w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                onClick={() => {
                  setSelectedType(null);
                  setSubChartData([]);
                }}
              >
                ← Back to Main View
              </button>
            </div>
          )}
        </div>

        {/* Statistics Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">📈 Quick Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mainChartData.map((item, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-5 shadow border-l-4 hover:shadow-md transition"
                style={{ borderLeftColor: MAIN_COLORS[item.name] }}
              >
                <h4 className="text-lg font-semibold text-gray-700 mb-2">{item.name}</h4>
                <p className="text-4xl font-bold text-gray-800 mb-1">{item.value}</p>
                <p className="text-sm text-gray-600">{item.percentage}% of total</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentStats;