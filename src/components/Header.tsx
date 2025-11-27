import React from 'react';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle } from '@ionic/react';
import { helpCircleOutline } from 'ionicons/icons';
import { useApp } from '../context/AppContext';
import './Header.css';

const Header: React.FC = () => {
  const { setShowWelcomeModal } = useApp();

  const gradientId = `logoGradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <IonHeader className="ion-no-border">
      {/* IonToolbar gestionará automáticamente el padding para la barra de estado */}
      <IonToolbar>
        {/* Usamos IonTitle para agrupar el logo y el texto, asegurando que se centren como un bloque */}
        <IonTitle>
          <div className="header-title-content">
            <div className="header-logo">
              <svg
                width="26"
                height="26"
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
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
            <span className="header-main-title">PoliFocusTask</span>
          </div>
        </IonTitle>

        {/* El botón de ayuda se coloca en el slot 'end' para alinearse a la derecha */}
        <IonButtons slot="end">
          <IonButton onClick={() => setShowWelcomeModal(true)}>
            <IonIcon slot="icon-only" icon={helpCircleOutline} />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
