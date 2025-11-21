import React from 'react';
import './SplashScreen.css';

const SplashScreen: React.FC = () => {
  // ID único para el degradado para evitar conflictos
  const gradientId = `splashLogoGradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="splash-screen">
      <div className="splash-content">
        {/* Reemplazamos la imagen con el SVG inline */}
        <div className="app-logo">
          <svg
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: '100%' }} // El CSS controla el tamaño
          >
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <path d="M16 31C24.2843 31 31 24.2843 31 16C31 7.71573 24.2843 1 16 1C7.71573 1 1 7.71573 1 16C1 24.2843 7.71573 31 16 31Z" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M22.2427 9.75738C20.9383 8.45295 19.2089 7.58691 17.3536 7.27548L14.7247 14.7248L7.27535 17.3537C7.58678 19.209 8.45282 20.9384 9.75725 22.2428C12.3093 24.7949 16.1998 25.1673 19.1437 23.4211L23.421 19.1438C25.1672 16.1999 24.7948 12.3094 22.2427 9.75738Z" fill={`url(#${gradientId})`}/>
          </svg>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar"></div>
        </div>
        <p className="loading-text">Cargando...</p>
      </div>
    </div>
  );
};

export default SplashScreen;
