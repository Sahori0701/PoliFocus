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
  IonButton
} from '@ionic/react';
import { leafOutline, codeSlashOutline, personCircleOutline, logoIonic, logoReact, logoCapacitor } from 'ionicons/icons';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import './SettingsPage.css';

const SettingsPage: React.FC = () => {
  const { config, updateConfig } = useApp();
  const [present] = useIonToast();

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
      present({
        message: 'Configuración guardada correctamente.',
        duration: 2000,
        color: 'success',
        position: 'top',
      });
    } catch (error) {
      present({
        message: 'Error al guardar la configuración.',
        duration: 2000,
        color: 'danger',
        position: 'top',
      });
    }
  };
  
  return (
    <IonPage>
      <Header />
      <IonContent fullscreen={true}>
        <div className="settings-container">
          
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={leafOutline} />
                Configurar Foco
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                <IonItem lines="none">
                  <IonLabel position="stacked">Tiempo de Concentración</IonLabel>
                  <div className="range-container">
                    <IonRange
                      min={15}
                      max={60}
                      step={5}
                      value={focusTime}
                      onIonChange={e => setFocusTime(e.detail.value as number)}
                      onIonKnobMoveEnd={e => handleConfigChange('focusTime', e.detail.value as number)}
                    />
                    <IonText className="range-value">{focusTime} min</IonText>
                  </div>
                </IonItem>
                <IonItem lines="none">
                  <IonLabel position="stacked">Descanso Corto</IonLabel>
                  <div className="range-container">
                    <IonRange
                      min={3}
                      max={15}
                      step={1}
                      value={shortBreak}
                      onIonChange={e => setShortBreak(e.detail.value as number)}
                      onIonKnobMoveEnd={e => handleConfigChange('shortBreak', e.detail.value as number)}
                    />
                    <IonText className="range-value">{shortBreak} min</IonText>
                  </div>
                </IonItem>
                <IonItem lines="none">
                  <IonLabel position="stacked">Descanso Largo</IonLabel>
                  <div className="range-container">
                    <IonRange
                      min={15}
                      max={45}
                      step={5}
                      value={longBreak}
                      onIonChange={e => setLongBreak(e.detail.value as number)}
                      onIonKnobMoveEnd={e => handleConfigChange('longBreak', e.detail.value as number)}
                    />
                    <IonText className="range-value">{longBreak} min</IonText>
                  </div>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={codeSlashOutline} />
                Stack Tecnológico
              </IonCardTitle>
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
              <IonCardTitle>
                <IonIcon icon={personCircleOutline} />
                Desarrollador
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText>
                <p>Hecho con ❤️ por Gemini</p>
              </IonText>
              <a href="https://deepmind.google/technologies/gemini/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <IonButton 
                  expand="block" 
                  fill="clear" 
                >
                  Conoce más sobre mí
                </IonButton>
              </a>
            </IonCardContent>
          </IonCard>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
