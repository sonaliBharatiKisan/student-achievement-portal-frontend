import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Floating Header Text */}
      <div className="floating-header">
        <span className="header-text">!! WHERE ACADEMIC LEARNING MEETS SKILL DEVELOPMENT FOR LASTING ACHIEVEMENT AND GROWTH !!</span>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h1 className="home-title">Welcome to Student Achievement Portal</h1>
        
        <div className="home-buttons">
          {/* Student Portal */}
          <div className="button-wrapper" onClick={() => navigate("/signup")}>
            <div className="icon-container">
              <img src="/images/student.png" alt="Student" className="image-button" />
            </div>
            <p className="button-label">STUDENT</p>
          </div>

          {/* Admin Portal */}
          <div className="button-wrapper" onClick={() => navigate("/admin/signup")}>
            <div className="icon-container">
              <img src="/images/admin.png" alt="Admin" className="image-button" />
            </div>
            <p className="button-label">ADMIN</p>
          </div>
        </div>
      </div>

      {/* Footer Text */}
      <div className="footer-section">
        <p className="footer-text">TRACK YOUR ACADEMIC JOURNEY • SHOWCASE YOUR ACHIEVEMENTS • EXCEL WITH CONFIDENCE</p>
      </div>
    </div>
  );
}

export default Home;