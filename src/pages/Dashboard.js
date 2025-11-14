import React, { useEffect, useState } from "react";
import "./Dashboard.css";

const images = [
   "/images/achieve.png",
  "/images/campus4.jpg",
  "/images/chess.png",
  "/images/cricket1.jpg",
  "/images/cricket2.jpg",
  "/images/chess2.png",
  "/images/dahi_handi.jpg",
  "/images/kalawant_club.jpeg",
  "/images/kalawant_club2.png",
  "/images/library.jpg",
  "/images/mech.jpg",
  "/images/presentation.png",
  "/images/robotics.png",
  "/images/sport1.jpeg",
  "/images/sport2.jpeg",
  "/images/uniform.png",
 
];

const animations = ["fade", "zoom-in", "zoom-out", "slide-left", "slide-right"];

const Dashboard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnim, setCurrentAnim] = useState("fade");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );

      // pick random animation
      const randomAnim = animations[Math.floor(Math.random() * animations.length)];
      setCurrentAnim(randomAnim);
    }, 3000); // 3 seconds per image

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`dashboard-container ${currentAnim}`}
      style={{ backgroundImage: `url(${images[currentIndex]})` }}
    >
      {/* Dark Overlay */}
      <div className="image-overlay"></div>

      {/* Dashboard content */}
      <div className="dashboard-content">
        <h1>Welcome to Student Achievement Portal</h1>
        <p>Track your achievements and academic progress here.</p>
      </div>
    </div>
  );
};

export default Dashboard;