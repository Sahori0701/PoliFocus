import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  IonLabel
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
        
        <div className="active-task-display">
            <p className="task-name">{activeTask?.title || 'Ninguna'}</p>
            <IonButton fill="outline" color="light" size="small">
                <IonIcon slot="start" icon={search}></IonIcon>
                Buscar Tarea
            </IonButton>
        </div>

        {/* Temporizador Principal */}
        <div className="timer-display-wrapper">
          <div className="timer-display">
            <h1 className="time-text">15:20</h1>
            <p className="time-status">¡A trabajar!</p>
            <div className="time-percentage">62%</div>
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

      </IonContent>
    </IonPage>
  );
};

export default TimerPage;
