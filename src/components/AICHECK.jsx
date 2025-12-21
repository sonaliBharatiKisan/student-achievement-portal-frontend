// frontend/src/components/AICHECK.jsx - Atlas & Render Ready
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AICHECK.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AICHECK = () => {
  console.log('🚀 AICHECK Component Rendering - Production Version');
  
  // ===== STATE MANAGEMENT =====
  const [pendingAchievements, setPendingAchievements] = useState([]);
  const [verifiedAchievements, setVerifiedAchievements] = useState([]);
  const [rejectedAchievements, setRejectedAchievements] = useState([]);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [statusFilter, setStatusFilter] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // ===== INITIAL DATA FETCH =====
  useEffect(() => {
    console.log('📥 Fetching all data on component mount...');
    fetchPendingVerifications();
    fetchVerifiedAchievements();
    fetchRejectedAchievements();
  }, []);

  // ===== API FETCH FUNCTIONS =====

  const fetchPendingVerifications = async () => {
    try {
      console.log('📡 Fetching pending verifications...');
      const res = await axios.get(`${API_BASE_URL}/api/verification/pending`);
      console.log('✅ Pending data received:', res.data.count, 'items');
      setPendingAchievements(res.data.achievements || []);
    } catch (error) {
      console.error('❌ Error fetching pending verifications:', error);
      alert('Failed to load pending verifications');
    }
  };

  const fetchVerifiedAchievements = async () => {
    try {
      console.log('📡 Fetching verified achievements...');
      const url = statusFilter 
        ? `${API_BASE_URL}/api/verification/verified?status=${statusFilter}`
        : `${API_BASE_URL}/api/verification/verified`;
      
      const res = await axios.get(url);
      console.log('✅ Verified data received:', res.data.count, 'items');
      setVerifiedAchievements(res.data.achievements || []);
    } catch (error) {
      console.error('❌ Error fetching verified achievements:', error);
    }
  };

  const fetchRejectedAchievements = async () => {
    try {
      console.log('📡 Fetching rejected achievements...');
      const res = await axios.get(`${API_BASE_URL}/api/verification/rejected`);
      console.log('✅ Rejected data received:', res.data.count, 'items');
      console.log('✅ Rejected achievements:', res.data.achievements);
      setRejectedAchievements(res.data.achievements || []);
    } catch (error) {
      console.error('❌ Error fetching rejected achievements:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
    }
  };

  // ===== VERIFICATION HANDLERS =====

  const handleVerifySingle = async (achievementId) => {
    setLoading(true);
    try {
      console.log('🔍 Verifying achievement:', achievementId);
      const res = await axios.post(`${API_BASE_URL}/api/verification/verify/${achievementId}`);
      
      setVerificationResult(res.data.verificationResults);
      
      const foundAchievement = pendingAchievements.find(a => a._id === achievementId) ||
                               verifiedAchievements.find(a => a._id === achievementId) ||
                               rejectedAchievements.find(a => a._id === achievementId);
      
      setSelectedAchievement(foundAchievement);
      
      fetchPendingVerifications();
      fetchVerifiedAchievements();
      fetchRejectedAchievements();
      
      alert(res.data.message || `Verification completed! Score: ${res.data.verificationResults.overallScore}%`);
    } catch (error) {
      console.error('❌ Verification error:', error);
      alert(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerification = async (achievementId, status) => {
    const achievement = pendingAchievements.find(a => a._id === achievementId) || 
                       verifiedAchievements.find(a => a._id === achievementId);
    
    if (status === 'APPROVED') {
      if (!achievement.verificationScore || achievement.verificationScore < 50) {
        alert(`❌ Cannot approve! Verification score (${achievement.verificationScore || 0}%) is below 50%.
        
Required: Score must be ≥ 50% to award points.`);
        return;
      }
      
      if (!window.confirm(`✅ Approve this achievement?

Verification Score: ${achievement.verificationScore}%
Estimated Points: ${achievement.basePoints || 'Not calculated'}

This will add points to the student's leaderboard!`)) {
        return;
      }
    } else {
      if (!window.confirm(`❌ Reject this achievement? No points will be awarded.`)) {
        return;
      }
    }
    
    setEmailSending(true);
    
    try {
      console.log(`🔄 Manual ${status}:`, achievementId);
      
      const res = await axios.post(`${API_BASE_URL}/api/verification/manual/${achievementId}`, {
        status,
        adminNotes
      });
      
      console.log('✅ Manual verification response:', res.data);
      
      const pointsMsg = res.data.pointsAwarded 
        ? `\n\n🎉 ${res.data.pointsAwarded} points awarded to student!`
        : '';
      
      const emailMsg = res.data.emailSent 
        ? '\n📧 Email notification sent successfully!'
        : '\n⚠ Email notification failed to send.';
      
      alert(res.data.message + pointsMsg + emailMsg);
      
      setAdminNotes('');
      setSelectedAchievement(null);
      setVerificationResult(null);
      
      console.log('🔄 Refreshing all lists after', status);
      
      await fetchPendingVerifications();
      await fetchVerifiedAchievements();
      await fetchRejectedAchievements();
      
      console.log('✅ All lists refreshed after', status);
      
      if (status === 'REJECTED') {
        console.log('🔴 Switching to Rejected tab');
        setActiveTab('rejected');
      }
      
    } catch (error) {
      console.error('❌ Manual verification error:', error);
      console.error('❌ Error response:', error.response?.data);
      alert(error.response?.data?.error || error.response?.data?.message || 'Manual verification failed');
    } finally {
      setEmailSending(false);
    }
  };

  // ===== HELPER FUNCTIONS =====

  const renderEventName = (ach) => {
    return ach.eventName || ach.workshopName || ach.seminarName || 
           ach.courseName || ach.projectTopic || ach.hackathonName || 
           ach.title || '-';
  };

  const renderOrganizer = (ach) => {
    return ach.organizerName || ach.awardingOrganization || 
           ach.publisherName || '-';
  };

  const getStatusBadge = (status, score) => {
    const colors = {
      VERIFIED: 'badge-success',
      PARTIAL: 'badge-warning',
      FAILED: 'badge-danger',
      APPROVED: 'badge-approved',
      REJECTED: 'badge-rejected',
      PENDING: 'badge-pending'
    };
    
    return (
      <span className={`badge ${colors[status] || 'badge-pending'}`}>
        {status} {score ? `(${score}%)` : ''}
      </span>
    );
  };

  // Helper function to get certificate URL
  const getCertificateUrl = (certificatePath) => {
    if (!certificatePath) return null;
    
    // If it's already a full URL, return as is
    if (certificatePath.startsWith('http://') || certificatePath.startsWith('https://')) {
      return certificatePath;
    }
    
    // Otherwise, prepend the API base URL
    return `${API_BASE_URL}/${certificatePath}`;
  };

  // ===== VERIFICATION DETAILS MODAL =====

  const renderVerificationDetails = () => {
    if (!verificationResult || !selectedAchievement) return null;

    const canApprove = verificationResult.overallScore >= 50;
    const certificateUrl = getCertificateUrl(selectedAchievement.certificate);

    return (
      <div className="verification-details">
        <div className="details-header">
          <h3>Verification Results</h3>
          <button 
            className="close-btn" 
            onClick={() => {
              setVerificationResult(null);
              setSelectedAchievement(null);
              setAdminNotes('');
            }}
          >
            ✕
          </button>
        </div>

        <div className="achievement-info">
          <h4>{renderEventName(selectedAchievement)}</h4>
          <p><strong>Type:</strong> {selectedAchievement.type} - {selectedAchievement.category}</p>
          <p><strong>Student UCE:</strong> {selectedAchievement.uce_no}</p>
          <p><strong>Name:</strong> {selectedAchievement.studentName || '⚠ Not provided'}</p>
          <p><strong>Organizer:</strong> {renderOrganizer(selectedAchievement)}</p>
          {selectedAchievement.emailSent && (
            <p className="email-status">
              ✅ Email notification sent on {new Date(selectedAchievement.emailSentDate).toLocaleString()}
            </p>
          )}
        </div>

        <div className="score-card">
          <div className={`score ${verificationResult.statusColor}`}>
            {verificationResult.overallScore}%
          </div>
          <div className="status">
            {getStatusBadge(verificationResult.verificationStatus, verificationResult.overallScore)}
          </div>
        </div>

        {!canApprove && (
          <div className="warning-banner">
            <strong>⚠ Score Below Threshold</strong>
            <p>Verification score is {verificationResult.overallScore}%. 
            Must be ≥ 50% to approve and award points.</p>
          </div>
        )}

        {verificationResult.matches && verificationResult.matches.length > 0 && (
          <div className="matches-section">
            <h4>✅ Verified Fields ({verificationResult.matches.length})</h4>
            <ul className="results-list">
              {verificationResult.matches.map((match, idx) => (
                <li key={idx} className="match-item">
                  <strong>{match.field}:</strong> {match.formValue}
                  <span className="confidence">Confidence: {match.confidence}%</span>
                  {match.weightage && <span className="weightage"> | Weight: {match.weightage}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {verificationResult.mismatches && verificationResult.mismatches.length > 0 && (
          <div className="mismatches-section">
            <h4>❌ Mismatches ({verificationResult.mismatches.length})</h4>
            <ul className="results-list">
              {verificationResult.mismatches.map((mismatch, idx) => (
                <li key={idx} className="mismatch-item">
                  <strong>{mismatch.field}:</strong> {mismatch.formValue}
                  <p className="suggestion">{mismatch.suggestion}</p>
                  {mismatch.weightage && <span className="weightage">Weight: {mismatch.weightage}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="admin-actions">
          <h4>Admin Decision</h4>
          
          {!selectedAchievement.studentEmail && (
            <div className="warning-box">
              ⚠ Warning: No student email found. Email notification will not be sent.
            </div>
          )}

          {selectedAchievement.basePoints > 0 && (
            <div className="points-info">
              <strong>📊 Potential Points:</strong> {selectedAchievement.basePoints}
            </div>
          )}

          <textarea
            placeholder="Add notes (optional)"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows="3"
            className="admin-notes-textarea"
          />

          <div className="action-buttons">
            <button 
              className="approve-btn"
              onClick={() => handleManualVerification(selectedAchievement._id, 'APPROVED')}
              disabled={!canApprove || emailSending}
              title={!canApprove ? 'Score must be ≥ 50% to approve' : 'Approve and award points'}
            >
              {emailSending ? '📧 Sending...' : `✓ Approve ${canApprove ? `(+${selectedAchievement.basePoints || 0} pts)` : ''}`}
            </button>
            <button 
              className="reject-btn"
              onClick={() => handleManualVerification(selectedAchievement._id, 'REJECTED')}
              disabled={emailSending}
            >
              {emailSending ? '📧 Sending...' : '✗ Reject & Notify'}
            </button>
          </div>

          <p className="email-note">
            📧 Student will receive an email notification at: {selectedAchievement.studentEmail || 'N/A'}
          </p>
        </div>

        {certificateUrl && (
          <div className="certificate-view">
            <a 
              href={certificateUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="view-cert-btn"
            >
              📄 View Certificate
            </a>
          </div>
        )}
      </div>
    );
  };

  // ===== RENDER COMPONENT =====

  console.log('📊 Current State:', {
    pending: pendingAchievements.length,
    verified: verifiedAchievements.length,
    rejected: rejectedAchievements.length,
    activeTab
  });

  return (
    <div className="aicheck-container">
      <div className="aicheck-header">
        <h2>🧠 AI Certificate Verification System</h2>
        <p>Automatically verify achievement certificates using OCR technology</p>
        <div className="important-notice">
          <strong>⚠ Important:</strong> Certificates are auto-verified. Score ≥ 50% = Auto-approved with email notification.
        </div>
      </div>

      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => {
            console.log('🔵 Switching to Pending tab');
            setActiveTab('pending');
          }}
        >
          ⏳ Pending ({pendingAchievements.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'verified' ? 'active' : ''}`}
          onClick={() => {
            console.log('🟢 Switching to Verified tab');
            setActiveTab('verified');
          }}
        >
          ✅ Verified ({verifiedAchievements.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => {
            console.log('🔴 Switching to Rejected tab');
            setActiveTab('rejected');
          }}
        >
          ❌ Rejected ({rejectedAchievements.length})
        </button>
      </div>

      {/* ===== PENDING TAB ===== */}
      {activeTab === 'pending' && (
        <div className="pending-section">
          <div className="section-header">
            <h3>Pending Verifications</h3>
          </div>

          {pendingAchievements.length === 0 ? (
            <div className="empty-state">
              <p>🎉 No pending verifications!</p>
            </div>
          ) : (
            <div className="achievements-grid">
              {pendingAchievements.map((achievement) => {
                const certificateUrl = getCertificateUrl(achievement.certificate);
                return (
                  <div key={achievement._id} className="achievement-card">
                    <div className="card-header">
                      <h4>{renderEventName(achievement)}</h4>
                      {getStatusBadge(achievement.verificationStatus || 'PENDING', achievement.verificationScore)}
                    </div>
                    <div className="card-body">
                      <p><strong>Type:</strong> {achievement.type}</p>
                      <p><strong>Category:</strong> {achievement.category}</p>
                      <p><strong>UCE:</strong> {achievement.uce_no}</p>
                      <p><strong>Name:</strong> {achievement.studentName || '⚠ Not provided'}</p>
                      <p><strong>Organizer:</strong> {renderOrganizer(achievement)}</p>
                      {achievement.level && <p><strong>Level:</strong> {achievement.level}</p>}
                      {achievement.position && <p><strong>Position:</strong> {achievement.position}</p>}
                      {achievement.basePoints > 0 && (
                        <p><strong>Potential Points:</strong> {achievement.basePoints}</p>
                      )}
                    </div>
                    <div className="card-actions">
                      <button 
                        className="verify-btn"
                        onClick={() => handleVerifySingle(achievement._id)}
                        disabled={loading}
                      >
                        {loading ? '⏳ Verifying...' : '🔍 Verify Now'}
                      </button>
                      {certificateUrl && (
                        <a 
                          href={certificateUrl}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="view-cert-link"
                        >
                          📄 View
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===== VERIFIED TAB ===== */}
      {activeTab === 'verified' && (
        <div className="verified-section">
          <div className="section-header">
            <h3>Verified Achievements</h3>
            <select 
              value={statusFilter} 
              onChange={(e) => {
                setStatusFilter(e.target.value);
                fetchVerifiedAchievements();
              }}
              className="status-filter"
            >
              <option value="">All Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="PARTIAL">Partial</option>
              <option value="FAILED">Failed</option>
              <option value="APPROVED">Approved</option>
            </select>
          </div>

          {verifiedAchievements.length === 0 ? (
            <div className="empty-state">
              <p>No verified achievements yet</p>
            </div>
          ) : (
            <div className="verified-table-container">
              <table className="verified-table">
                <thead>
                  <tr>
                    <th>Event/Course Name</th>
                    <th>Type</th>
                    <th>UCE No</th>
                    <th>Name</th>
                    <th>Organizer</th>
                    <th>Status</th>
                    <th>Verification Score</th>
                    <th>Points</th>
                    <th>Date</th>
                    <th>Email Sent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {verifiedAchievements.map((achievement) => (
                    <tr key={achievement._id}>
                      <td>{renderEventName(achievement)}</td>
                      <td>{achievement.type}</td>
                      <td>{achievement.uce_no}</td>
                      <td>{achievement.studentName || '-'}</td>
                      <td>{renderOrganizer(achievement)}</td>
                      <td>{getStatusBadge(achievement.verificationStatus, achievement.verificationScore)}</td>
                      <td>
                        <div className="score-bar">
                          <div 
                            className="score-fill"
                            style={{ 
                              width: `${achievement.verificationScore || 0}%`,
                              backgroundColor: achievement.verificationScore >= 80 ? '#10b981' : 
                                             achievement.verificationScore >= 50 ? '#f59e0b' : '#ef4444'
                            }}
                          />
                          <span>{achievement.verificationScore || 0}%</span>
                        </div>
                      </td>
                      <td>
                        <strong className="points-display">
                          {achievement.awardedPoints || 0}
                        </strong>
                      </td>
                      <td>
                        {achievement.verificationDate 
                          ? new Date(achievement.verificationDate).toLocaleDateString()
                          : '-'}
                      </td>
                      <td>
                        {achievement.emailSent ? '✅' : '-'}
                      </td>
                      <td>
                        <button 
                          className="details-btn"
                          onClick={() => {
                            setSelectedAchievement(achievement);
                            
                            if (achievement.verificationScore) {
                              setVerificationResult({
                                overallScore: achievement.verificationScore,
                                verificationStatus: achievement.verificationStatus,
                                statusColor: achievement.verificationScore >= 70 ? 'green' : 
                                            achievement.verificationScore >= 40 ? 'orange' : 'red',
                                statusMessage: 'Previous verification results',
                                matches: [],
                                mismatches: []
                              });
                            }
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== REJECTED TAB ===== */}
      {activeTab === 'rejected' && (
        <div className="rejected-section">
          <div className="section-header">
            <h3>Rejected Achievements</h3>
            <p className="rejected-count">
              Total rejected: {rejectedAchievements.length}
            </p>
          </div>

          {rejectedAchievements.length === 0 ? (
            <div className="empty-state">
              <p>✅ No rejected achievements</p>
            </div>
          ) : (
            <div className="verified-table-container">
              <table className="verified-table">
                <thead>
                  <tr>
                    <th>Event/Course Name</th>
                    <th>Type</th>
                    <th>UCE No</th>
                    <th>Name</th>
                    <th>Organizer</th>
                    <th>Status</th>
                    <th>Admin Notes</th>
                    <th>Rejected Date</th>
                    <th>Email Sent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rejectedAchievements.map((achievement) => {
                    const certificateUrl = getCertificateUrl(achievement.certificate);
                    return (
                      <tr key={achievement._id}>
                        <td>{renderEventName(achievement)}</td>
                        <td>{achievement.type}</td>
                        <td>{achievement.uce_no}</td>
                        <td>{achievement.studentName || '-'}</td>
                        <td>{renderOrganizer(achievement)}</td>
                        <td>{getStatusBadge('REJECTED')}</td>
                        <td>
                          <div className="admin-notes-cell">
                            {achievement.adminNotes || 'No notes provided'}
                          </div>
                        </td>
                        <td>
                          {achievement.verificationDate 
                            ? new Date(achievement.verificationDate).toLocaleDateString()
                            : '-'}
                        </td>
                        <td>
                          {achievement.emailSent ? '✅' : '-'}
                        </td>
                        <td>
                          <div className="action-cell">
                            {certificateUrl && (
                              <a 
                                href={certificateUrl}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="view-cert-link"
                              >
                                📄 View
                              </a>
                            )}
                            <button 
                              className="details-btn"
                              onClick={() => {
                                setSelectedAchievement(achievement);
                                setVerificationResult({
                                  overallScore: achievement.verificationScore || 0,
                                  verificationStatus: 'REJECTED',
                                  statusColor: 'red',
                                  statusMessage: achievement.adminNotes || 'Rejected by admin',
                                  matches: [],
                                  mismatches: []
                                });
                              }}
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {renderVerificationDetails()}
    </div>
  );
};

export default AICHECK;