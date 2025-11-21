import React from 'react';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon } from '@ionic/react';
import { helpCircleOutline } from 'ionicons/icons';
import { useApp } from '../context/AppContext';
import './Header.css';

const Header: React.FC = () => {
  const { setShowWelcomeModal } = useApp();

  return (
    <IonHeader className="ion-no-border">
      {/* La magia sucede aquí: se añade un padding-top dinámico */}
      <IonToolbar style={{ paddingTop: 'var(--ion-safe-area-top)' }}>
        <div className="header-container">
          <div className="header-logo">
            <svg
              width="26"
              height="26"
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="16" cy="16" r="10" fill="none" stroke="white" strokeWidth="3" />
              <line x1="23" y1="9" x2="9" y2="23" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <circle cx="16" cy="16" r="3.5" fill="white" />
            </svg>
          </div>
          <div className="header-title-wrapper">
            <h1 className="header-main-title">PoliFocusTask</h1>
          </div>
        </div>
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
