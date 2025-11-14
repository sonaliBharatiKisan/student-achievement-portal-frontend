import React, { useEffect, useState } from "react";
import axios from "axios";

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [achievementOfTheDay, setAchievementOfTheDay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [leaderboardRes, achievementRes] = await Promise.all([
          axios.get("http://localhost:5000/api/leaderboard"),
          axios.get("http://localhost:5000/api/achievement-of-the-day")
        ]);
        
        setLeaderboard(leaderboardRes.data.data || []);
        setAchievementOfTheDay(achievementRes.data.data || []);
        setError(null);
      } catch (error) {
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

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '800',
      color: '#1e293b',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem'
    },
    trophy: {
      fontSize: '3rem'
    },
    achievementOfDaySection: {
      marginBottom: '2rem',
      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      borderRadius: '12px',
      padding: '1rem',
      border: '2px solid #fbbf24',
      boxShadow: '0 8px 20px rgba(251, 191, 36, 0.2)'
    },
    achievementTitle: {
      fontSize: '1.3rem',
      fontWeight: '700',
      color: '#92400e',
      marginBottom: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    aodTableWrapper: {
      overflowX: 'auto',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    aodTable: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '0.85rem'
    },
    aodThead: {
      background: '#f59e0b',
      color: 'white'
    },
    aodTh: {
      padding: '0.6rem',
      textAlign: 'center',
      fontWeight: '700',
      fontSize: '0.8rem',
      textTransform: 'uppercase'
    },
    aodTr: {
      borderBottom: '1px solid #fef3c7'
    },
    aodTd: {
      padding: '0.6rem',
      textAlign: 'center',
      fontSize: '0.85rem'
    },
    aodNameCell: {
      textAlign: 'left',
      fontWeight: '600',
      color: '#1e293b'
    },
    levelBadge: {
      display: 'inline-block',
      padding: '0.25rem 0.6rem',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '700'
    },
    positionBadge: {
      display: 'inline-block',
      padding: '0.25rem 0.6rem',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '700'
    },
    detailsBtn: {
      padding: '0.4rem 0.8rem',
      background: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto',
      position: 'relative',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
    },
    modalHeader: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '1.5rem',
      paddingBottom: '0.75rem',
      borderBottom: '2px solid #e5e7eb'
    },
    modalRow: {
      marginBottom: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem'
    },
    modalLabel: {
      fontSize: '0.85rem',
      fontWeight: '600',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    modalValue: {
      fontSize: '1rem',
      color: '#1e293b',
      fontWeight: '500'
    },
    closeBtn: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      fontSize: '1.2rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      transition: 'all 0.2s'
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      gap: '1rem'
    },
    spinner: {
      width: '60px',
      height: '60px',
      border: '5px solid #e5e7eb',
      borderTop: '5px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    errorContainer: {
      textAlign: 'center',
      padding: '3rem',
      background: '#fee2e2',
      borderRadius: '12px',
      border: '2px solid #ef4444'
    },
    errorText: {
      color: '#dc2626',
      fontSize: '1.125rem',
      fontWeight: '600',
      margin: 0
    },
    noData: {
      textAlign: 'center',
      padding: '4rem 2rem',
      background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
      borderRadius: '16px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    },
    tableWrapper: {
      overflowX: 'auto',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      background: 'white'
    },
    thead: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      color: 'white'
    },
    th: {
      padding: '1.25rem 1rem',
      textAlign: 'center',
      fontSize: '0.95rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: '3px solid #2563eb'
    },
    tr: {
      transition: 'all 0.3s ease',
      borderBottom: '1px solid #e5e7eb'
    },
    td: {
      padding: '1.25rem 1rem',
      textAlign: 'center',
      fontSize: '1rem'
    },
    rankCell: {
      fontWeight: '800',
      fontSize: '1.5rem'
    },
    nameCell: {
      textAlign: 'left',
      fontWeight: '600',
      color: '#1e293b',
      fontSize: '1.1rem'
    },
    uceCell: {
      color: '#64748b',
      fontSize: '0.9rem',
      fontFamily: "'Courier New', monospace"
    },
    pointsValue: {
      display: 'inline-block',
      padding: '0.5rem 1rem',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: 'white',
      borderRadius: '20px',
      fontSize: '1.25rem',
      fontWeight: '700',
      boxShadow: '0 4px 6px rgba(37, 99, 235, 0.3)'
    },
    achievementsCell: {
      color: '#64748b',
      fontWeight: '600',
      fontSize: '1.1rem'
    },
    badge: {
      display: 'inline-block',
      padding: '0.6rem 1.2rem',
      borderRadius: '25px',
      fontWeight: '700',
      fontSize: '0.95rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
      color: 'white'
    }
  };

  const getLevelBadgeStyle = (level) => {
    if (level?.includes('International')) {
      return { ...styles.levelBadge, background: '#dc2626', color: 'white' };
    } else if (level?.includes('National')) {
      return { ...styles.levelBadge, background: '#ea580c', color: 'white' };
    } else if (level?.includes('State')) {
      return { ...styles.levelBadge, background: '#2563eb', color: 'white' };
    } else if (level?.includes('Inter-College')) {
      return { ...styles.levelBadge, background: '#7c3aed', color: 'white' };
    } else if (level?.includes('Intra-College')) {
      return { ...styles.levelBadge, background: '#059669', color: 'white' };
    }
    return { ...styles.levelBadge, background: '#6b7280', color: 'white' };
  };

  const getPositionBadgeStyle = (position) => {
    if (position === 'Winner') {
      return { ...styles.positionBadge, background: '#fbbf24', color: '#78350f' };
    } else if (position === 'Runner-up') {
      return { ...styles.positionBadge, background: '#d1d5db', color: '#1f2937' };
    } else if (position === 'Participation') {
      return { ...styles.positionBadge, background: '#fb923c', color: 'white' };
    }
    return { ...styles.positionBadge, background: '#6b7280', color: 'white' };
  };

  const getBadgeStyle = (badge) => {
    if (badge?.includes('Platinum')) {
      return { ...styles.badge, background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)' };
    } else if (badge?.includes('Gold')) {
      return { ...styles.badge, background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', color: '#78350f' };
    } else if (badge?.includes('Silver')) {
      return { ...styles.badge, background: 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)', color: '#1f2937' };
    } else if (badge?.includes('Bronze')) {
      return { ...styles.badge, background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)' };
    }
    return styles.badge;
  };

  const getRowStyle = (rank) => {
    if (rank === 1) {
      return { ...styles.tr, background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' };
    } else if (rank === 2) {
      return { ...styles.tr, background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' };
    } else if (rank === 3) {
      return { ...styles.tr, background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)' };
    }
    return styles.tr;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#d97706';
    if (rank === 2) return '#6b7280';
    if (rank === 3) return '#c2410c';
    return '#1e293b';
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={{ fontSize: '1.125rem', color: '#64748b' }}>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Achievement of the Day Section */}
      {achievementOfTheDay.length > 0 && (
        <div style={styles.achievementOfDaySection}>
          <h3 style={styles.achievementTitle}>
             Achievement of the Day
          </h3>
          <div style={styles.aodTableWrapper}>
            <table style={styles.aodTable}>
              <thead style={styles.aodThead}>
                <tr>
                  <th style={{ ...styles.aodTh, textAlign: 'left' }}>Name</th>
                  <th style={styles.aodTh}>Level</th>
                  <th style={styles.aodTh}>Position</th>
                  <th style={styles.aodTh}>Details</th>
                </tr>
              </thead>
              <tbody>
                {achievementOfTheDay.map((achievement, index) => (
                  <tr key={index} style={styles.aodTr}>
                    <td style={{ ...styles.aodTd, ...styles.aodNameCell }}>
                      {achievement.studentName}
                    </td>
                    <td style={styles.aodTd}>
                      <span style={getLevelBadgeStyle(achievement.level)}>
                        {achievement.level}
                      </span>
                    </td>
                    <td style={styles.aodTd}>
                      {achievement.position && (
                        <span style={getPositionBadgeStyle(achievement.position)}>
                          {achievement.position}
                        </span>
                      )}
                    </td>
                    <td style={styles.aodTd}>
                      <button 
                        style={styles.detailsBtn}
                        onClick={() => handleDetailsClick(achievement)}
                        onMouseOver={(e) => e.target.style.background = '#2563eb'}
                        onMouseOut={(e) => e.target.style.background = '#3b82f6'}
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
        <div style={styles.modalOverlay} onClick={handleCloseModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              style={styles.closeBtn}
              onClick={handleCloseModal}
              onMouseOver={(e) => e.target.style.background = '#dc2626'}
              onMouseOut={(e) => e.target.style.background = '#ef4444'}
            >
              ×
            </button>
            <h3 style={styles.modalHeader}>Achievement Details</h3>
            
            <div style={styles.modalRow}>
              <span style={styles.modalLabel}>Student Name</span>
              <span style={styles.modalValue}>{selectedAchievement.studentName}</span>
            </div>

            <div style={styles.modalRow}>
              <span style={styles.modalLabel}>UCE Number</span>
              <span style={styles.modalValue}>{selectedAchievement.uce}</span>
            </div>

            <div style={styles.modalRow}>
              <span style={styles.modalLabel}>Type</span>
              <span style={styles.modalValue}>{selectedAchievement.type}</span>
            </div>

            <div style={styles.modalRow}>
              <span style={styles.modalLabel}>Category</span>
              <span style={styles.modalValue}>{selectedAchievement.category}</span>
            </div>

            <div style={styles.modalRow}>
              <span style={styles.modalLabel}>Level</span>
              <span style={getLevelBadgeStyle(selectedAchievement.level)}>
                {selectedAchievement.level}
              </span>
            </div>

            {selectedAchievement.position && (
              <div style={styles.modalRow}>
                <span style={styles.modalLabel}>Position</span>
                <span style={getPositionBadgeStyle(selectedAchievement.position)}>
                  {selectedAchievement.position}
                </span>
              </div>
            )}

            <div style={styles.modalRow}>
              <span style={styles.modalLabel}>Event Name</span>
              <span style={styles.modalValue}>{selectedAchievement.eventName}</span>
            </div>

            {selectedAchievement.organizerName && (
              <div style={styles.modalRow}>
                <span style={styles.modalLabel}>Organizer</span>
                <span style={styles.modalValue}>{selectedAchievement.organizerName}</span>
              </div>
            )}

            {selectedAchievement.eventDate && (
              <div style={styles.modalRow}>
                <span style={styles.modalLabel}>Event Date</span>
                <span style={styles.modalValue}>
                  {new Date(selectedAchievement.eventDate).toLocaleDateString()}
                </span>
              </div>
            )}

            {selectedAchievement.prize && selectedAchievement.prize !== "0" && (
              <div style={styles.modalRow}>
                <span style={styles.modalLabel}>Prize</span>
                <span style={styles.modalValue}>{selectedAchievement.prize}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Section */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <span style={styles.trophy}></span>
          Top 5 Leaderboard
        </h2>
      </div>
      
      {leaderboard.length === 0 ? (
        <div style={styles.noData}>
          <p style={{ color: '#6b7280', fontSize: '1.25rem', margin: 0 }}>
            No achievements recorded yet.
          </p>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Rank</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>UCE</th>
                <th style={styles.th}>Points</th>
                <th style={styles.th}>Achievements</th>
                <th style={styles.th}>Badge</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((student) => (
                <tr 
                  key={student.uce || student.email} 
                  style={getRowStyle(student.rank)}
                >
                  <td style={{ ...styles.td, ...styles.rankCell, color: getRankColor(student.rank) }}>
                    {student.rank}
                  </td>
                  <td style={{ ...styles.td, ...styles.nameCell }}>
                    {student.name}
                  </td>
                  <td style={{ ...styles.td, ...styles.uceCell }}>
                    {student.uce}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.pointsValue}>{student.totalPoints}</span>
                  </td>
                  <td style={{ ...styles.td, ...styles.achievementsCell }}>
                    {student.totalAchievements}
                  </td>
                  <td style={styles.td}>
                    {student.badge && (
                      <span style={getBadgeStyle(student.badge)}>
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
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Leaderboard;