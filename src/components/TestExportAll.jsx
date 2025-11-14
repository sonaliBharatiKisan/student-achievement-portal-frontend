// Test Component - Add this temporarily to verify the Export All section works
import React, { useState } from "react";

const TestExportAll = () => {
  const [selectedAchievementCategory, setSelectedAchievementCategory] = useState("");
  const [exportingAll, setExportingAll] = useState(false);

  const handleExportClick = (format) => {
    alert(`Export All as ${format.toUpperCase()} clicked for category: ${selectedAchievementCategory}`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Test Export All Feature</h1>
      
      {/* Category Selection */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Select Achievement Category:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {["Co-Curricular", "Extra-Curricular", "Courses", "Special Achievement"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedAchievementCategory(type)}
              style={{
                padding: '10px 20px',
                backgroundColor: selectedAchievementCategory === type ? '#8B2BE2' : '#e0e0e0',
                color: selectedAchievementCategory === type ? 'white' : 'black',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {type}
            </button>
          ))}
          <button
            onClick={() => setSelectedAchievementCategory("")}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedAchievementCategory === "" ? '#ff4444' : '#e0e0e0',
              color: selectedAchievementCategory === "" ? 'white' : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Export All Section - This should appear when category is selected */}
      {selectedAchievementCategory && (
        <div style={{
          padding: '20px',
          backgroundColor: '#f0f8ff',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '2px solid #4CAF50',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, color: '#2196F3' }}>
             Export All Reports for {selectedAchievementCategory}
          </h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Generate and download all sub-category reports in one click!
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => handleExportClick("csv")} 
              disabled={exportingAll}
              style={{
                padding: '12px 24px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: exportingAll ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                opacity: exportingAll ? 0.6 : 1
              }}
            >
              {exportingAll ? " Exporting..." : " Export All as CSV (ZIP)"}
            </button>
            <button 
              onClick={() => handleExportClick("pdf")} 
              disabled={exportingAll}
              style={{
                padding: '12px 24px',
                backgroundColor: '#FF5722',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: exportingAll ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                opacity: exportingAll ? 0.6 : 1
              }}
            >
              {exportingAll ? " Exporting..." : " Export All as Combined PDF"}
            </button>
            <button 
              onClick={() => handleExportClick("word")} 
              disabled={exportingAll}
              style={{
                padding: '12px 24px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: exportingAll ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                opacity: exportingAll ? 0.6 : 1
              }}
            >
              {exportingAll ? " Exporting..." : " Export All as Combined Word"}
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
            * This will generate reports for all sub-categories under {selectedAchievementCategory}
          </p>
        </div>
      )}

      {/* Status Message */}
      {!selectedAchievementCategory && (
        <div style={{
          padding: '20px',
          backgroundColor: '#fff3cd',
          borderRadius: '8px',
          border: '1px solid #ffc107',
          color: '#856404'
        }}>
           Please select an Achievement Category above to see the Export All options
        </div>
      )}

      {/* Instructions */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#e8f5e9',
        borderRadius: '8px',
        border: '1px solid #4CAF50'
      }}>
        <h3> If you can see this test component working:</h3>
        <ol>
          <li>Select any Achievement Category button above</li>
          <li>The "Export All Reports" section should appear with 3 colored buttons</li>
          <li>If this works, the same code should work in your AdminReportGenerator</li>
        </ol>
        <h3 style={{ marginTop: '20px' }}> If Export All section doesn't appear in AdminReportGenerator:</h3>
        <ul>
          <li>Make sure you've replaced the entire file content</li>
          <li>Check browser console (F12) for any JavaScript errors</li>
          <li>Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)</li>
          <li>Restart your development server</li>
        </ul>
      </div>
    </div>
  );
};

export default TestExportAll;