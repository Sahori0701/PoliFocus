import {
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
} from '@ionic/react';
import Header from '../components/Header';

const CalendarPage: React.FC = () => {
  return (
    <IonPage>
      <Header />
      
      <IonContent fullscreen>
        <div style={{ padding: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Calendario 📅
          </h2>
          
          <IonCard>
            <IonCardContent>
              <p style={{ textAlign: 'center', color: 'var(--app-text-secondary)' }}>
                Vista de calendario en desarrollo...
              </p>
              <p style={{
                textAlign: 'center', 
                color: 'var(--app-primary)',
                marginTop: '1rem',
                fontSize: '3rem',
              }}>
                📆
              </p>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CalendarPage;