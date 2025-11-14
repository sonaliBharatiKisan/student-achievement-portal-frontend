// src/components/Sidebar.js
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Student Portal</h2>
      <ul className="sidebar-links">
        <li>
          <Link
            to="/dashboard"
            className={location.pathname === "/dashboard" ? "active" : ""}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/profile"
            className={location.pathname === "/profile" ? "active" : ""}
          >
            Profile
          </Link>
        </li>
        <li>
          <Link
            to="/achievements"
            className={location.pathname === "/achievements" ? "active" : ""}
          >
            Achievements
          </Link>
        </li>
        

        <li>
          <Link
            to="/academic"
            className={location.pathname === "/academic" ? "active" : ""}
          >
            Academic Data
          </Link>
        </li>
        
        <li>
          <Link to="/leaderboard" className={location.pathname === "/leaderboard" ? "active" : ""}>
            Leaderboard
          </Link>
        </li>
      </ul>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Sidebar;