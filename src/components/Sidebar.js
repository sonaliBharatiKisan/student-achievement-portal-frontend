// src/components/Sidebar.js
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Sidebar.css";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Toggle Button */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <h2 className="sidebar-title">🎓STUDENT PORTAL</h2>
        <ul className="sidebar-links">
          <li>
            <Link
              to="/dashboard"
              className={location.pathname === "/dashboard" ? "active" : ""}
            >
              DASHBOARD
            </Link>
          </li>
          <li>
            <Link
              to="/profile"
              className={location.pathname === "/profile" ? "active" : ""}
            >
              PROFILE
            </Link>
          </li>
          <li>
            <Link
              to="/achievements"
              className={location.pathname === "/achievements" ? "active" : ""}
            >
              ACHIEVEMENTS
            </Link>
          </li>
          
          <li>
            <Link
              to="/academic"
              className={location.pathname === "/academic" ? "active" : ""}
            >
              ACADEMIC DATA
            </Link>
          </li>
          
          <li>
            <Link to="/leaderboard" className={location.pathname === "/leaderboard" ? "active" : ""}>
              LEADERBOARD
            </Link>
          </li>

          {/*  NEW - Student Stats Link */}
          <li>
            <Link
              to="/student-stats"
              className={location.pathname === "/student-stats" ? "active" : ""}
            >
              STUDENT STATS
            </Link>
          </li>

          {/*  REMOVED - Achievement Stats Link (moved to admin dashboard) */}
        </ul>
        <button className="logout-btn" onClick={handleLogout}>
           LOGOUT
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
}

export default Sidebar;