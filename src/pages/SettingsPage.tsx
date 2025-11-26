import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonText,
  useIonToast,
  IonButton,
  useIonAlert,
  IonRange,
} from '@ionic/react';
import { 
  trashOutline, 
  logoIonic, 
  logoReact, 
  logoCapacitor, 
  logoFirebase, 
  buildOutline, 
  codeWorkingOutline 
} from 'ionicons/icons';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import './SettingsPage.css';

const SettingsPage: React.FC = () => {
  const { config, updateConfig, clearAllData } = useApp();
  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();

  const [focusTime, setFocusTime] = useState(config.focusTime);
  const [shortBreak, setShortBreak] = useState(config.shortBreak);
  const [longBreak, setLongBreak] = useState(config.longBreak);

  useEffect(() => {
    setFocusTime(config.focusTime);
    setShortBreak(config.shortBreak);
    setLongBreak(config.longBreak);
  }, [config]);

  const handleRangeChange = async (
    type: 'focusTime' | 'shortBreak' | 'longBreak', 
    value: number
  ) => {
    if (isNaN(value) || value < 1) return;

    try {
      await updateConfig({ [type]: value });
      presentToast({
        message: '✓ Configuración guardada',
        duration: 1500,
        color: 'success',
        position: 'top',
      });
    } catch (error) {
      presentToast({
        message: '✗ Error al guardar',
        duration: 2000,
        color: 'danger',
        position: 'top',
      });
    }
  };

  const handleClearAllData = () => {
    presentAlert({
      header: '⚠️ Confirmación Final',
      message: '¿Estás absolutamente seguro de que quieres borrar TODOS los datos? Esta acción es irreversible y eliminará todo tu progreso.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Borrar Todo',
          role: 'destructive',
          handler: () => {
            clearAllData();
            presentToast({
              message: 'Todos los datos han sido eliminados',
              duration: 2000,
              color: 'medium',
              position: 'top',
            });
          },
        },
      ],
    });
  };

  return (
    <IonPage>
      <Header />
      <IonContent fullscreen={true}>
        <div className="settings-container">

          <div className="cards-row">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle className="custom-card-title">🎯 Configuración de Tiempos</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="time-ranges-container">
                  <div className="range-item">
                    <div className="range-header">
                      <IonLabel>🧠 Concentración</IonLabel>
                      <IonText className="range-value">{focusTime} min</IonText>
                    </div>
                    <IonRange min={5} max={90} value={focusTime} onIonChange={e => setFocusTime(e.detail.value as number)} onIonKnobMoveEnd={e => handleRangeChange('focusTime', e.detail.value as number)} />
                  </div>
                  <div className="range-item">
                    <div className="range-header">
                      <IonLabel>☕ Descanso Corto</IonLabel>
                      <IonText className="range-value">{shortBreak} min</IonText>
                    </div>
                    <IonRange min={1} max={30} value={shortBreak} onIonChange={e => setShortBreak(e.detail.value as number)} onIonKnobMoveEnd={e => handleRangeChange('shortBreak', e.detail.value as number)} />
                  </div>
                  <div className="range-item">
                    <div className="range-header">
                      <IonLabel>🛋️ Descanso Largo</IonLabel>
                      <IonText className="range-value">{longBreak} min</IonText>
                    </div>
                    <IonRange min={5} max={45} value={longBreak} onIonChange={e => setLongBreak(e.detail.value as number)} onIonKnobMoveEnd={e => handleRangeChange('longBreak', e.detail.value as number)} />
                  </div>
                </div>
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardTitle className="custom-card-title">💻 Stack Tecnológico</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList className="tech-stack-grid" lines="none">
                  <IonItem className="tech-item"><IonIcon icon={logoIonic} slot="start" /><IonLabel>Ionic</IonLabel></IonItem>
                  <IonItem className="tech-item"><IonIcon icon={logoReact} slot="start" /><IonLabel>React</IonLabel></IonItem>
                  <IonItem className="tech-item"><IonIcon icon={logoCapacitor} slot="start" /><IonLabel>Capacitor</IonLabel></IonItem>
                  <IonItem className="tech-item"><IonIcon icon={logoFirebase} slot="start" /><IonLabel>Firebase</IonLabel></IonItem>
                  <IonItem className="tech-item"><IonIcon icon={buildOutline} slot="start" /><IonLabel>Vite</IonLabel></IonItem>
                  <IonItem className="tech-item"><IonIcon icon={codeWorkingOutline} slot="start" /><IonLabel>TypeScript</IonLabel></IonItem>
                </IonList>
              </IonCardContent>
            </IonCard>
          </div>

          <IonCard className="developer-card">
            <IonCardHeader>
              <IonCardTitle>👨‍💻 Acerca del Desarrollador</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>Creado por grupo del Politecnico Grancolombiano</p>
              <a href="https://deepmind.google/technologies/gemini/" target="_blank" rel="noopener noreferrer">
                <IonButton expand="block">Conoce más sobre Gemini AI</IonButton>
              </a>
            </IonCardContent>
          </IonCard>

          <IonCard className="danger-zone">
            <IonCardHeader>
              <IonCardTitle>☢️ Zona de Peligro</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p className="danger-text">
                Esta acción eliminará permanentemente todos tus datos, configuraciones y progreso. 
                No hay forma de recuperar esta información una vez eliminada.
              </p>
              <IonButton expand="block" onClick={handleClearAllData}>
                <IonIcon slot="start" icon={trashOutline} />
                Borrar Todos los Datos
              </IonButton>
            </IonCardContent>
          </IonCard>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;