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
  codeWorkingOutline,
  logoCss3,
  gitBranchOutline,
  logoHtml5,
  logoJavascript
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
                  <IonItem className="tech-item"><IonIcon icon={codeWorkingOutline} slot="start" /><IonLabel>TypeScript</IonLabel></IonItem>
                  <IonItem className="tech-item"><IonIcon icon={logoHtml5} slot="start" /><IonLabel>HTML5</IonLabel></IonItem>
                  <IonItem className="tech-item"><IonIcon icon={logoCss3} slot="start" /><IonLabel>CSS3</IonLabel></IonItem>
                  <IonItem className="tech-item"><IonIcon icon={logoJavascript} slot="start" /><IonLabel>JavaScript</IonLabel></IonItem>
                  <IonItem className="tech-item"><IonIcon icon={gitBranchOutline} slot="start" /><IonLabel>Git</IonLabel></IonItem>
                </IonList>
              </IonCardContent>
            </IonCard>
          </div>

          <IonCard className="developer-card">
            <IonCardHeader>
              <IonCardTitle>👨‍💻 Acerca del Desarrollador</IonCardTitle>
            </IonCardHeader>
            <IonCardContent className="developer-content">
              <p>
                <strong>PoliFocusTask</strong> nació de nuestra pasión por la tecnología y el deseo de crear una herramienta que realmente ayude a las personas a concentrarse 🎯. Como estudiantes del <strong>Politécnico Grancolombiano</strong>, este proyecto representa nuestro compromiso con la excelencia y el aprendizaje práctico, desarrollado en el curso de Énfasis en Programación Móvil.
              </p>
              <p>
                Construida con tecnologías modernas como <strong>Ionic, React y Firebase</strong>, esta app es el resultado de horas de colaboración, estudio y esfuerzo del <strong>Grupo B01, Subgrupo 10</strong>, durante el segundo semestre de 2025 🚀. Cada línea de código refleja nuestro crecimiento y la dedicación para ofrecer una experiencia de usuario fluida y efectiva.
              </p>
              <p>
                Esperamos que disfrutes usando esta herramienta tanto como nosotros disfrutamos creándola. ¡Que te ayude a alcanzar tus metas y a mantener el enfoque en lo que más importa! ✨
              </p>
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