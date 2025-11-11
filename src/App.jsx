import React from 'react';

function App() {
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      background: '#141414',
      color: 'white',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬 MovieStream</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        Your movie streaming app is live on Render!
      </p>
      <div style={{ 
        background: '#2d2d2d', 
        padding: '2rem', 
        borderRadius: '12px',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <h2>🚀 Successfully Deployed!</h2>
        <p>React + Express app running on Render</p>
        <p style={{ marginTop: '1rem', color: '#00ff00' }}>
          ✅ Server is working
        </p>
      </div>
    </div>
  );
}

export default App;
