// frontend/pages/Dashboard.js
import React, { useEffect, useState, useRef } from "react";
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
  const [isPaused, setIsPaused] = useState(false);

  const intervalRef = useRef(null);

  const startSlider = () => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      setCurrentAnim(
        animations[Math.floor(Math.random() * animations.length)]
      );
    }, 3000);
  };

  const stopSlider = () => clearInterval(intervalRef.current);

  useEffect(() => {
    if (!isPaused) startSlider();
    else stopSlider();
    return () => stopSlider();
  }, [isPaused]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setCurrentAnim(
      animations[Math.floor(Math.random() * animations.length)]
    );
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setCurrentAnim(
      animations[Math.floor(Math.random() * animations.length)]
    );
  };

  return (
    <div
      className={`dashboard-container ${currentAnim}`}
      style={{ backgroundImage: `url(${images[currentIndex]})` }}
    >
      <div className="image-overlay"></div>

      <div className="dashboard-content">
        <h1>Welcome to Student Achievement Portal</h1>
        <p>Track your achievements and academic progress here.</p>
      </div>

      {/* LEFT - PREVIOUS */}
      <button className="side-btn left-btn" onClick={prevImage}></button>

      {/* CENTER - PLAY / PAUSE */}
      <button
        className={`play-pause-btn ${isPaused ? "" : "playing"}`}
        onClick={() => setIsPaused(!isPaused)}
      ></button>

      {/* RIGHT - NEXT */}
      <button className="side-btn right-btn" onClick={nextImage}></button>
    </div>
  );
};

export default Dashboard;