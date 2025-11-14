//Home.js

import { useNavigate } from "react-router-dom";
import "./Home.css"; // Import the CSS file

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to Student Achievement Portal</h1>
      <p className="home-subtitle">Your achievements. Your growth. Our recognition</p>

      <div className="home-buttons">
        {/* Student Image Button + Label */}
        <div className="button-wrapper" onClick={() => navigate("/signup")}>
          <img
            src="/images/student.png"
            alt="Student"
            className="image-button"
          />
          <p className="button-label">STUDENT</p>
        </div>

        {/* Admin Image Button + Label */}
        <div className="button-wrapper" onClick={() => navigate("/admin/signup")}>
          <img
            src="/images/admin.png"
            alt="Admin"
            className="image-button"
          />
          <p className="button-label">ADMIN</p>
        </div>
      </div>
    </div>
  );
}

export default Home;