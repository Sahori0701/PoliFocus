import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { search, pause, checkmark, playSkipForwardOutline } from 'ionicons/icons';
import Header from '../components/Header';
import './TimerPage.css';

const TimerPage: React.FC = () => {
  const activeTask = {
    title: 'Reunion',
  };

  return (
    <IonPage>
      <Header />
      <IonContent fullscreen className="ion-padding">
        {/* Contenedor principal para centrar el contenido */}
        <div className="timer-container">

          {/* Título de la página */}
          <div className="page-title">
            Modo Concentración <span role="img" aria-label="target" className="target-icon">🎯</span>
          </div>

          {/* Tarea activa y botón de búsqueda */}
          <div className="active-task-display">
            <p className="task-name">{activeTask?.title || 'Ninguna'}</p>
            <IonButton size="small">
              <IonIcon slot="start" icon={search}></IonIcon>
              Buscar Tarea
            </IonButton>
          </div>

          {/* Temporizador Principal */}
          <div className="timer-display-wrapper">
            <div className="timer-display">
              <h1 className="time-text">25:00</h1>
              <p className="time-status">En pausa</p>
              <div className="time-percentage">100%</div>
              <div className="time-percentage-label">restante</div>
            </div>
          </div>

          {/* Botones de Control */}
          <div className="timer-controls">
            <IonButton className="control-button-pause">
              <IonIcon slot="start" icon={pause} />
              Pausar
            </IonButton>
            <IonButton className="control-button-complete">
              <IonIcon slot="icon-only" icon={checkmark} />
            </IonButton>
            <IonButton className="control-button-skip">
              <IonIcon slot="icon-only" icon={playSkipForwardOutline} />
            </IonButton>
          </div>

          {/* Información Adicional */}
          <div className="footer-info">
            ⓘ El botón check marca la tarea como completada
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default TimerPage;
