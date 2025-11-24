import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonRange,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonText,
  useIonToast,
  IonButton,
  useIonAlert,
} from '@ionic/react';
import { trashOutline, logoIonic, logoReact, logoCapacitor } from 'ionicons/icons';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import './SettingsPage.css';

const SettingsPage: React.FC = () => {
  // CORRECCIÓN FINAL: Usamos la nueva función centralizada `clearAllData`
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

  const handleConfigChange = async (type: 'focusTime' | 'shortBreak' | 'longBreak', value: number) => {
    try {
      await updateConfig({ [type]: value });
      presentToast({
        message: 'Configuración guardada.',
        duration: 2000,
        color: 'success',
        position: 'top',
      });
    } catch (error) {
      presentToast({
        message: 'Error al guardar.',
        duration: 2000,
        color: 'danger',
        position: 'top',
      });
    }
  };

  // --- LÓGICA DE BORRADO SIMPLIFICADA ---
  const handleClearAllData = () => {
    presentAlert({
      header: 'Confirmación Final',
      message: '¿Estás absolutamente seguro de que quieres borrar TODOS los datos de la aplicación? Esta acción es irreversible.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Borrar Todo',
          role: 'destructive',
          handler: () => {
            // ¡CORREGIDO! Llamamos a la única función que lo hace todo.
            clearAllData();
            // El feedback al usuario (toast) ya se gestiona desde el AppContext.
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
          
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>🧘 Configurar Foco</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                <IonItem lines="none">
                  <IonLabel position="stacked">Tiempo de Concentración</IonLabel>
                  <div className="range-container">
                    <IonRange min={15} max={60} step={5} value={focusTime} onIonChange={e => setFocusTime(e.detail.value as number)} onIonKnobMoveEnd={e => handleConfigChange('focusTime', e.detail.value as number)} />
                    <IonText className="range-value">{focusTime} min</IonText>
                  </div>
                </IonItem>
                <IonItem lines="none">
                  <IonLabel position="stacked">Descanso Corto</IonLabel>
                  <div className="range-container">
                    <IonRange min={3} max={15} step={1} value={shortBreak} onIonChange={e => setShortBreak(e.detail.value as number)} onIonKnobMoveEnd={e => handleConfigChange('shortBreak', e.detail.value as number)} />
                    <IonText className="range-value">{shortBreak} min</IonText>
                  </div>
                </IonItem>
                <IonItem lines="none">
                  <IonLabel position="stacked">Descanso Largo</IonLabel>
                  <div className="range-container">
                    <IonRange min={15} max={45} step={5} value={longBreak} onIonChange={e => setLongBreak(e.detail.value as number)} onIonKnobMoveEnd={e => handleConfigChange('longBreak', e.detail.value as number)} />
                    <IonText className="range-value">{longBreak} min</IonText>
                  </div>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>💻 Stack Tecnológico</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                <IonItem lines="inset">
                  <IonIcon icon={logoIonic} slot="start" color="primary" />
                  <IonLabel>Ionic Framework</IonLabel>
                </IonItem>
                <IonItem lines="inset">
                  <IonIcon icon={logoReact} slot="start" color="secondary" />
                  <IonLabel>React</IonLabel>
                </IonItem>
                <IonItem lines="none">
                  <IonIcon icon={logoCapacitor} slot="start" color="tertiary" />
                  <IonLabel>Capacitor</IonLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>👨‍💻 Desarrollador</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText><p>Hecho con ❤️ por Gemini</p></IonText>
              <a href="https://deepmind.google/technologies/gemini/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <IonButton expand="block" fill="clear">Conoce más sobre mí</IonButton>
              </a>
            </IonCardContent>
          </IonCard>

          <IonCard className="danger-zone">
            <IonCardHeader>
              <IonCardTitle>☢️ Zona de Peligro</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p className="danger-text">Esta acción es permanente y no se puede deshacer. Úsala con precaución.</p>
              <IonButton expand="block" color="danger" onClick={handleClearAllData}>
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
