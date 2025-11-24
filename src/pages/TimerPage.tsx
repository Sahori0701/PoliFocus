// pages/TimerPage.tsx
import React, { useMemo } from 'react';
import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  IonSpinner,
  useIonToast,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
  IonItem,
  IonLabel,
} from '@ionic/react';
import { play, pause, checkmark, playSkipForwardOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import './TimerPage.css';
import { taskService } from '../services/task.service';
import { getPriorityText } from '../utils/taskUtils'; // Asegúrate de que la ruta sea correcta

const RADIUS = 130;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
  switch (priority) {
    case 'low': return 'success';
    case 'medium': return 'warning';
    case 'high': return 'danger';
    default: return 'medium';
  }
};

const TimerPage: React.FC = () => {
  const {
    timerState,
    activeTask,
    updateTask,
    setInitialTab,
    isLoading,
    resumePomodoro,
    pausePomodoro,
    skipBreak,
    confirmationPending,
    confirmTaskCompletion,
    proceedToBreak,
  } = useApp();

  const history = useHistory();
  const [present] = useIonToast();

  const handleToggleTimer = () => {
    if (timerState.isRunning) {
      pausePomodoro();
    } else {
      if (!activeTask) {
        present({ message: 'Selecciona una tarea para comenzar', duration: 2000, color: 'warning' });
        history.push('/tasks');
        return;
      }
      resumePomodoro();
    }
  };

  const handleCompleteTask = async () => {
    if (!activeTask) return;
    pausePomodoro();

    const actualDuration = Math.ceil((timerState.totalElapsed || 0) / 60);
    await updateTask(activeTask.id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      actualDuration: actualDuration,
    });
    const efficiency = taskService.calculateEfficiency(activeTask.duration, actualDuration);
    present({ message: `✅ ${activeTask.title} ${efficiency.icon}`, duration: 3000, color: 'success' });
    setInitialTab('completed');
    history.push('/tasks');
  };

  const handleSkip = () => {
    if (timerState.mode !== 'focus') {
      skipBreak();
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) seconds = 0;
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const totalDurationInSeconds = timerState.mode === 'focus' && activeTask
    ? activeTask.duration * 60
    : (timerState.mode === 'shortBreak' ? timerState.timeLeft : timerState.timeLeft);

  const percentageElapsed = totalDurationInSeconds > 0
    ? ((totalDurationInSeconds - timerState.timeLeft) / totalDurationInSeconds) * 100
    : 0;
    
  const strokeDashoffset = CIRCUMFERENCE - (Math.max(0, Math.min(100, percentageElapsed)) / 100) * CIRCUMFERENCE;

  const statusText = useMemo(() => {
    if (confirmationPending) return '¡Buen trabajo!';
    if (timerState.mode === 'shortBreak') return 'Descanso corto';
    if (timerState.mode === 'longBreak') return 'Descanso largo';
    if (!activeTask) return 'Selecciona una tarea';
    if (timerState.isRunning) return '¡A trabajar!';
    return 'En pausa';
  }, [timerState.isRunning, timerState.mode, activeTask, confirmationPending]);

  if (isLoading) {
    return (
      <IonPage>
        <Header />
        <IonContent fullscreen><div className="timer-container"><IonSpinner name="lines-sharp" color="success" /></div></IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <Header />
      <IonContent fullscreen>
        <div className="timer-container">
          <div className="active-task-display">
            <p className="task-name">{activeTask ? `📌 ${activeTask.title}` : 'Ninguna tarea seleccionada'}</p>
          </div>

          {activeTask && (
            <IonGrid className="task-details-grid">
              <IonRow className="ion-justify-content-center">
                <IonCol size="6" size-md="3">
                  <IonItem lines="none" className="task-detail-item">
                    <IonLabel className="ion-text-center">
                      <h2>📌 Prioridad</h2>
                      <p><IonBadge color={getPriorityColor(activeTask.priority)}>{getPriorityText(activeTask.priority)}</IonBadge></p>
                    </IonLabel>
                  </IonItem>
                </IonCol>
                <IonCol size="6" size-md="3">
                  <IonItem lines="none" className="task-detail-item">
                    <IonLabel className="ion-text-center">
                      <h2>⏱️ Duración</h2>
                      <p>{activeTask.duration ? `${activeTask.duration} min` : 'N/A'}</p>
                    </IonLabel>
                  </IonItem>
                </IonCol>
                <IonCol size="6" size-md="3">
                  <IonItem lines="none" className="task-detail-item">
                    <IonLabel className="ion-text-center">
                      <h2>🗓️ Fecha</h2>
                      <p>{new Date(activeTask.scheduledStart).toLocaleDateString()}</p>
                    </IonLabel>
                  </IonItem>
                </IonCol>
                <IonCol size="6" size-md="3">
                  <IonItem lines="none" className="task-detail-item">
                    <IonLabel className="ion-text-center">
                      <h2>⏰ Hora</h2>
                      <p>{new Date(activeTask.scheduledStart).toLocaleTimeString()}</p>
                    </IonLabel>
                  </IonItem>
                </IonCol>
              </IonRow>
            </IonGrid>
          )}

          <div className="timer-display-wrapper">
            <svg className="progress-ring" width="280" height="280">
              <circle className="progress-ring__background" cx="140" cy="140" r={RADIUS} fill="transparent" strokeWidth="16" />
              <circle
                className="progress-ring__progress"
                cx="140" cy="140" r={RADIUS}
                fill="transparent"
                strokeWidth="16"
                style={{ strokeDasharray: CIRCUMFERENCE, strokeDashoffset }}
              />
            </svg>
            <div className="timer-display">
              <h1 className="time-text">{formatTime(timerState.timeLeft)}</h1>
              <p className="time-status">{statusText}</p>
              {activeTask && timerState.mode === 'focus' && (
                <p className="time-percentage">{`${Math.floor(percentageElapsed)}%`}</p>
              )}
            </div>
          </div>
          <div className="timer-controls">
            <IonButton onClick={handleToggleTimer} className="control-button-pause" color={timerState.isRunning ? 'danger' : 'success'} disabled={!activeTask || confirmationPending}>
              <IonIcon slot="start" icon={timerState.isRunning ? pause : play} />
              {timerState.isRunning ? 'Pausar' : 'Iniciar'}
            </IonButton>
            {activeTask && (
              <IonButton onClick={handleCompleteTask} className="control-button-complete" color="success" fill="outline" disabled={!activeTask || confirmationPending}>
                <IonIcon slot="icon-only" icon={checkmark} />
              </IonButton>
            )}
            {activeTask && (
              <IonButton
                onClick={handleSkip}
                disabled={timerState.mode === 'focus' || !timerState.isRunning || confirmationPending}
                className="control-button-skip"
                color="primary"
              >
                <IonIcon slot="icon-only" icon={playSkipForwardOutline} />
              </IonButton>
            )}
          </div>

          {/* Este es el empujador invisible */}
          <div className="spacer"></div>

        </div>
      </IonContent>

      {confirmationPending && (
        <div className="focus-complete-toast">
          <div className="toast-content">
            <span className="toast-icon">🏁</span>
            <p className="toast-message">¡Ciclo de enfoque terminado! ¿Tarea completa?</p>
          </div>
          <div className="toast-actions">
            <IonButton
              fill="outline"
              color="medium"
              className="toast-button"
              onClick={() => proceedToBreak()}
            >
              No, a descansar
            </IonButton>
            <IonButton
              fill="solid"
              color="success"
              className="toast-button"
              onClick={async () => {
                await confirmTaskCompletion();
                setInitialTab('completed');
                history.push('/tasks');
              }}
            >
              Sí, terminada
            </IonButton>
          </div>
        </div>
      )}
    </IonPage>
  );
};

export default TimerPage;
