import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
} from '@ionic/react';

const TasksPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              fontFamily: 'Dosis, sans-serif',
              fontWeight: 800,
            }}>
              <span style={{
                background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                PoliFocusTask
              </span>
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
            Gestión de Tareas 📋
          </h2>
          
          <IonCard>
            <IonCardContent>
              <p style={{ textAlign: 'center', color: 'var(--app-text-secondary)' }}>
                Módulo de tareas en desarrollo...
              </p>
              <p style={{ 
                textAlign: 'center', 
                color: 'var(--app-primary)',
                marginTop: '1rem',
                fontSize: '3rem',
              }}>
                ✅
              </p>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TasksPage;