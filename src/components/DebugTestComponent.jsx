// frontend/src/components/DebugTestComponent.jsx
// Use this to test if React is rendering properly

import React, { useState } from "react";

const DebugTestComponent = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showButtons, setShowButtons] = useState(false);

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>
        🧪 Debug Test Component
      </h1>

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>Step 1: Check if this renders</h2>
        <p style={{ color: '#666' }}>
          ✅ If you can see this text, React is working!
        </p>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>Step 2: Test Category Selection</h2>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          {["Co-Curricular", "Extra-Curricular", "Courses", "Special Achievement"].map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setShowButtons(true);
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: selectedCategory === cat ? '#8B2BE2' : '#e0e0e0',
                color: selectedCategory === cat ? 'white' : 'black',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        {selectedCategory && (
          <p style={{ marginTop: '15px', color: '#4CAF50', fontWeight: 'bold' }}>
            ✅ Selected: {selectedCategory}
          </p>
        )}
      </div>

      {showButtons && (
        <div style={{
          backgroundColor: '#e8f5e9',
          padding: '20px',
          borderRadius: '8px',
          border: '2px solid #4CAF50',
          marginBottom: '20px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <h2 style={{ color: '#2e7d32', marginTop: 0 }}>
            🚀 Full Report Buttons (Test)
          </h2>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            These buttons should appear when a category is selected
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button style={{
              padding: '12px 24px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              📦 Full Report (CSV)
            </button>
            <button style={{
              padding: '12px 24px',
              backgroundColor: '#FF5722',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              📄 Full Report (PDF)
            </button>
            <button style={{
              padding: '12px 24px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              📝 Full Report (Word)
            </button>
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>Troubleshooting Steps:</h2>
        <ol style={{ color: '#666', lineHeight: '1.8' }}>
          <li><strong>Clear Browser Cache:</strong> Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)</li>
          <li><strong>Check Console:</strong> Press F12 and look for errors in the Console tab</li>
          <li><strong>Verify File Save:</strong> Make sure you saved the AdminReportGenerator.jsx file</li>
          <li><strong>Restart Dev Server:</strong> Stop (Ctrl+C) and restart your npm/yarn server</li>
          <li><strong>Check Import:</strong> Make sure the component is properly imported in your app</li>
        </ol>
      </div>
    </div>
  );
};

export default DebugTestComponent;