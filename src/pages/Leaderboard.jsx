import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Leaderboard.css";

// ✅ Add API base URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [achievementOfTheDay, setAchievementOfTheDay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [celebratingBadge, setCelebratingBadge] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // ✅ Use environment variable for API endpoints
        const [leaderboardRes, achievementRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/leaderboard`),
          axios.get(`${API_BASE_URL}/api/achievement-of-the-day`)
        ]);
        
        setLeaderboard(leaderboardRes.data.data || []);
        setAchievementOfTheDay(achievementRes.data.data || []);
        setError(null);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        setError("Failed to load data.");
        setLeaderboard([]);
        setAchievementOfTheDay([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDetailsClick = (achievement) => {
    setSelectedAchievement(achievement);
  };

  const handleCloseModal = () => {
    setSelectedAchievement(null);
  };

  const handleBadgeClick = (badge) => {
    setCelebratingBadge(badge);
    setTimeout(() => setCelebratingBadge(null), 2000);
  };

  const getLevelClass = (level) => {
    if (level?.includes('International')) return 'level-international';
    if (level?.includes('National')) return 'level-national';
    if (level?.includes('State')) return 'level-state';
    if (level?.includes('Inter-College')) return 'level-inter-college';
    if (level?.includes('Intra-College')) return 'level-intra-college';
    return 'level-default';
  };

  const getPositionClass = (position) => {
    if (position === 'Winner') return 'position-winner';
    if (position === 'Runner-up') return 'position-runner-up';
    if (position === 'Participation') return 'position-participation';
    return 'position-default';
  };

  const getBadgeClass = (badge) => {
    if (badge?.includes('Platinum')) return 'badge-platinum';
    if (badge?.includes('Gold')) return 'badge-gold';
    if (badge?.includes('Silver')) return 'badge-silver';
    if (badge?.includes('Bronze')) return 'badge-bronze';
    return 'badge-default';
  };

  const getRowClass = (rank) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return '';
  };

  if (loading) {
    return (
      <div className="leaderboard-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <div className="error-container">
          <p className="error-text">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      {/* Celebration Animation */}
      {celebratingBadge && (
        <div className="celebration-overlay">
          <div className="celebration-emojis">
            {[...Array(30)].map((_, i) => (
              <span key={i} className={`celebration-emoji celebration-emoji-${i % 5}`}>
                {celebratingBadge.includes('Platinum') ? '💎' :
                 celebratingBadge.includes('Gold') ? '🥇' :
                 celebratingBadge.includes('Silver') ? '🥈' :
                 celebratingBadge.includes('Bronze') ? '🥉' : '👏'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Achievement of the Day Section */}
      {achievementOfTheDay.length > 0 && (
        <div className="achievement-of-day-section">
          <h3 className="aod-title">
            <span className="aod-icon">⭐</span>
            Achievement of the Day
          </h3>
          <div className="aod-table-wrapper">
            <table className="aod-table">
              <thead>
                <tr>
                  <th className="aod-th aod-th-name">Name</th>
                  <th className="aod-th">Level</th>
                  <th className="aod-th">Position</th>
                  <th className="aod-th">Details</th>
                </tr>
              </thead>
              <tbody>
                {achievementOfTheDay.map((achievement, index) => (
                  <tr key={index} className="aod-tr">
                    <td className="aod-td aod-name-cell">
                      {achievement.studentName}
                    </td>
                    <td className="aod-td">
                      <span className={`level-badge ${getLevelClass(achievement.level)}`}>
                        {achievement.level}
                      </span>
                    </td>
                    <td className="aod-td">
                      {achievement.position && (
                        <span className={`position-badge ${getPositionClass(achievement.position)}`}>
                          {achievement.position}
                        </span>
                      )}
                    </td>
                    <td className="aod-td">
                      <button 
                        className="details-btn"
                        onClick={() => handleDetailsClick(achievement)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Achievement Details */}
      {selectedAchievement && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={handleCloseModal}>×</button>
            <h3 className="modal-header">Achievement Details</h3>
            
            <div className="modal-row">
              <span className="modal-label">Student Name</span>
              <span className="modal-value">{selectedAchievement.studentName}</span>
            </div>

            <div className="modal-row">
              <span className="modal-label">UCE Number</span>
              <span className="modal-value">{selectedAchievement.uce}</span>
            </div>

            <div className="modal-row">
              <span className="modal-label">Type</span>
              <span className="modal-value">{selectedAchievement.type}</span>
            </div>

            <div className="modal-row">
              <span className="modal-label">Category</span>
              <span className="modal-value">{selectedAchievement.category}</span>
            </div>

            <div className="modal-row">
              <span className="modal-label">Level</span>
              <span className={`level-badge ${getLevelClass(selectedAchievement.level)}`}>
                {selectedAchievement.level}
              </span>
            </div>

            {selectedAchievement.position && (
              <div className="modal-row">
                <span className="modal-label">Position</span>
                <span className={`position-badge ${getPositionClass(selectedAchievement.position)}`}>
                  {selectedAchievement.position}
                </span>
              </div>
            )}

            <div className="modal-row">
              <span className="modal-label">Event Name</span>
              <span className="modal-value">{selectedAchievement.eventName}</span>
            </div>

            {selectedAchievement.organizerName && (
              <div className="modal-row">
                <span className="modal-label">Organizer</span>
                <span className="modal-value">{selectedAchievement.organizerName}</span>
              </div>
            )}

            {selectedAchievement.eventDate && (
              <div className="modal-row">
                <span className="modal-label">Event Date</span>
                <span className="modal-value">
                  {new Date(selectedAchievement.eventDate).toLocaleDateString()}
                </span>
              </div>
            )}

            {selectedAchievement.prize && selectedAchievement.prize !== "0" && (
              <div className="modal-row">
                <span className="modal-label">Prize</span>
                <span className="modal-value">{selectedAchievement.prize}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Section */}
      <div className="leaderboard-header">
        <h2 className="leaderboard-title">
          <span className="trophy-icon">🏆</span>
          Top 5 Leaderboard
        </h2>
      </div>
      
      {leaderboard.length === 0 ? (
        <div className="no-data">
          <p className="no-data-text">No achievements recorded yet.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th className="lb-th">Rank</th>
                <th className="lb-th">Name</th>
                <th className="lb-th">UCE</th>
                <th className="lb-th">Points</th>
                <th className="lb-th">Achievements</th>
                <th className="lb-th">Badge</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((student) => (
                <tr 
                  key={student.uce || student.email} 
                  className={`lb-tr ${getRowClass(student.rank)}`}
                >
                  <td className={`lb-td rank-cell rank-${student.rank}`}>
                    {student.rank}
                  </td>
                  <td className="lb-td name-cell">
                    {student.name}
                  </td>
                  <td className="lb-td uce-cell">
                    {student.uce}
                  </td>
                  <td className="lb-td">
                    <span className="points-value">{student.totalPoints}</span>
                  </td>
                  <td className="lb-td achievements-cell">
                    {student.totalAchievements}
                  </td>
                  <td className="lb-td">
                    {student.badge && (
                      <span 
                        className={`badge ${getBadgeClass(student.badge)}`}
                        onClick={() => handleBadgeClick(student.badge)}
                      >
                        {student.badge}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Help Button */}
      <button
        className="help-button"
        onClick={() => setShowHelp(true)}
        title="How are points calculated?"
      >
        ?
      </button>

      {/* Help Modal */}
      {showHelp && (
        <div className="modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowHelp(false)}>×</button>
            
            <h3 className="modal-header">
              <span className="help-icon">📊</span>
              How Points are Calculated
            </h3>
            
            <div className="help-intro">
              <p>
                Points are awarded based on achievement type, category, and position. 
                Only <strong>admin-approved</strong> achievements with verification score ≥ 50% count toward the leaderboard.
              </p>
            </div>

            <table className="points-table">
              <thead>
                <tr>
                  <th>Achievement Type</th>
                  <th>Category/Details</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td rowSpan="3"><strong>Co-Curricular</strong></td>
                  <td>Hackathon/Code Competition (Winner)</td>
                  <td>15 pts</td>
                </tr>
                <tr>
                  <td>Hackathon/Code Competition (Runner-up)</td>
                  <td>10 pts</td>
                </tr>
                <tr>
                  <td>Hackathon/Code Competition (Participation)</td>
                  <td>5 pts</td>
                </tr>
                <tr>
                  <td rowSpan="3"></td>
                  <td>Project Competition/Paper Presentation (Winner)</td>
                  <td>10 pts</td>
                </tr>
                <tr>
                  <td>Project Competition/Paper Presentation (Runner-up)</td>
                  <td>7 pts</td>
                </tr>
                <tr>
                  <td>Project Competition/Paper Presentation (Participation)</td>
                  <td>5 pts</td>
                </tr>
                <tr>
                  <td rowSpan="2"></td>
                  <td>Paper Publication (Scopus/Web of Science)</td>
                  <td>25 pts</td>
                </tr>
                <tr>
                  <td>Paper Publication (Other)</td>
                  <td>10 pts</td>
                </tr>
                <tr>
                  <td rowSpan="3"><strong>Extra-Curricular</strong></td>
                  <td>Winner</td>
                  <td>5 pts</td>
                </tr>
                <tr>
                  <td>Runner-up</td>
                  <td>3 pts</td>
                </tr>
                <tr>
                  <td>Participation</td>
                  <td>1 pt</td>
                </tr>
                <tr>
                  <td><strong>Courses</strong></td>
                  <td>Completed Course</td>
                  <td>5 pts</td>
                </tr>
                <tr>
                  <td><strong>Special Achievement</strong></td>
                  <td>Any Special Achievement</td>
                  <td>20 pts</td>
                </tr>
              </tbody>
            </table>

            <div className="badge-requirements">
              <span className="badge-req-title">Badge Requirements</span>
              <ul className="badge-req-list">
                <li><span className="badge-emoji">💎</span> <strong>Platinum:</strong> &gt; 20 points</li>
                <li><span className="badge-emoji">🥇</span> <strong>Gold:</strong> &gt; 15 points</li>
                <li><span className="badge-emoji">🥈</span> <strong>Silver:</strong> &gt; 10 points</li>
                <li><span className="badge-emoji">🥉</span> <strong>Bronze:</strong> &gt; 5 points</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;