import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
} from '@ionic/react';

const TimerPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <div style={{ 
              fontFamily: 'Dosis, sans-serif',
              fontWeight: 800,
            }}>
              Modo Concentración
            </div>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <div style={{ padding: '1rem' }}>
          <h2 style={{ 
            fontFamily: 'Dosis, sans-serif',
            fontSize: '1.5rem',
            marginBottom: '1rem',
          }}>
            Modo Concentración 🎯
          </h2>
          
          <IonCard>
            <IonCardContent>
              <p style={{ textAlign: 'center', color: 'var(--app-text-secondary)' }}>
                Temporizador Pomodoro en desarrollo...
              </p>
              <p style={{ 
                textAlign: 'center', 
                color: 'var(--app-primary)',
                marginTop: '1rem',
                fontSize: '3rem',
              }}>
                ⏱️
              </p>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TimerPage;