import React from 'react';
import './SplashScreen.css';

const SplashScreen: React.FC = () => {
  return (
    <div className="splash-screen">
      <div className="splash-content">
        <img src="/favicon.png" alt="App Logo" className="app-logo" />
        <div className="progress-bar-container">
          <div className="progress-bar"></div>
        </div>
        <p className="loading-text">Cargando...</p>
      </div>
    </div>
  );
};

export default SplashScreen;
