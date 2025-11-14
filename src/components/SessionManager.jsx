// frontend/src/components/SessionManager.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SessionManager.css';

const SessionManager = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [isWarning, setIsWarning] = useState(false);

  // ⏱ Session configuration
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes = 1800000 ms
  const WARNING_TIME = 2 * 60 * 1000; // 2 minutes = 120000 ms

  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const countdownRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const publicPaths = [
    '/', '/login', '/signup',
    '/admin/login', '/admin/signup',
    '/forgot-password', '/admin/forgot-password', '/otp-reset'
  ];

  const isPublicPage = publicPaths.includes(location.pathname);

  const isLoggedIn = useCallback(() => {
    const studentToken = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    return !!(studentToken || adminToken);
  }, []);

  const getUserType = useCallback(() => {
    const adminToken = localStorage.getItem('adminToken');
    return adminToken ? 'admin' : 'student';
  }, []);

  const saveSessionInfo = useCallback(() => {
    sessionStorage.setItem('lastActivePath', location.pathname);
    sessionStorage.setItem('lastActivityTime', Date.now().toString());
  }, [location.pathname]);

  //  LOGOUT HANDLER (manual only now)
  const handleLogout = useCallback(() => {
    console.log(" Logging out user — session expired or manual logout");
    saveSessionInfo();
    const userType = getUserType();

    localStorage.removeItem('token');
    localStorage.removeItem('studentEmail');
    localStorage.removeItem('uce_no');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');

    setShowModal(false);
    setIsWarning(false);

    if (userType === 'admin') navigate('/admin/login', { replace: true });
    else navigate('/login', { replace: true });
  }, [navigate, saveSessionInfo, getUserType]);

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  //  RESET TIMER
  const resetTimer = useCallback(() => {
    if (isPublicPage || !isLoggedIn()) return;

    clearAllTimers();
    lastActivityRef.current = Date.now();
    saveSessionInfo();

    setIsWarning(false);
    setCountdown(30);

    console.log(" Session timer reset at:", new Date().toLocaleTimeString());

    // ⚠️ Show warning before session expires
    warningRef.current = setTimeout(() => {
      setIsWarning(true);
      setCountdown(30);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }, SESSION_TIMEOUT - WARNING_TIME);

    // ❌ Session expired (no auto logout — just show modal)
    timeoutRef.current = setTimeout(() => {
      console.log(" Session expired! Showing modal, waiting for manual click...");
      clearAllTimers();
      setShowModal(true); // Stay until user clicks
    }, SESSION_TIMEOUT);
  }, [isPublicPage, isLoggedIn, clearAllTimers, saveSessionInfo, SESSION_TIMEOUT, WARNING_TIME]);

  // 🧩 Initial load session check
  useEffect(() => {
    if (isPublicPage || !isLoggedIn()) return;

    const lastActivity = sessionStorage.getItem('lastActivityTime');
    if (lastActivity) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        console.log(" Expired on reload — show modal");
        setShowModal(true);
        return;
      }
    }
    resetTimer();
  }, [isPublicPage, isLoggedIn, resetTimer, SESSION_TIMEOUT]);

  // 🖱️ Activity Tracker
  useEffect(() => {
    if (isPublicPage || !isLoggedIn()) return;

    const events = ['mousedown', 'keypress', 'scroll', 'touchstart', 'click', 'mousemove'];
    let activityTimeout;

    const handleActivity = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => resetTimer(), 1000);
    };

    events.forEach(event => document.addEventListener(event, handleActivity, { passive: true }));

    return () => {
      events.forEach(event => document.removeEventListener(event, handleActivity));
      clearTimeout(activityTimeout);
      clearAllTimers();
    };
  }, [isPublicPage, isLoggedIn, resetTimer, clearAllTimers]);

  // 👀 Visibility handler
  useEffect(() => {
    if (isPublicPage || !isLoggedIn()) return;

    const handleVisibilityChange = () => {
      if (document.hidden) saveSessionInfo();
      else {
        const lastActivity = sessionStorage.getItem('lastActivityTime');
        if (lastActivity) {
          const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
          if (timeSinceLastActivity > SESSION_TIMEOUT) setShowModal(true);
          else resetTimer();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPublicPage, isLoggedIn, resetTimer, saveSessionInfo, SESSION_TIMEOUT]);

  const handleContinue = () => {
    setIsWarning(false);
    setCountdown(30);
    resetTimer();
  };

  const handleLoginAgain = () => {
    handleLogout();
  };

  if (isPublicPage) return <>{children}</>;

  return (
    <>
      {children}

      {/* Warning Modal */}
      {isWarning && !showModal && (
        <div className="session-warning-overlay">
          <div className="session-warning-modal">
            <div className="warning-icon"></div>
            <h2>Session Expiring Soon!</h2>
            <p>Your session will expire in <strong>{countdown} seconds</strong></p>
            <p className="warning-subtext">Click "Continue" to stay logged in</p>
            <div className="warning-actions">
              <button className="continue-btn" onClick={handleContinue}>
                ✓ Continue Session
              </button>
              <button className="logout-btn-warning" onClick={handleLoginAgain}>
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expired Modal (stays until click) */}
      {showModal && (
        <div className="session-modal-overlay">
          <div className="session-modal">
            <div className="modal-icon"></div>
            <h2>Session Expired</h2>
            <p>Your session has expired due to inactivity.</p>
            <p className="sub-text">Please login again to continue.</p>
            <button className="login-btn" onClick={handleLoginAgain}>
               Login Again
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionManager;