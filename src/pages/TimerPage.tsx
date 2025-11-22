// pages/TimerPage.tsx
import React, { useMemo, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  IonSpinner,
  useIonToast,
} from '@ionic/react';
import { play, pause, checkmark, playSkipForwardOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import './TimerPage.css';
import { taskService } from '../services/task.service';

const RADIUS = 130;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const TimerPage: React.FC = () => {
  const {
    timerState,
    activeTask,
    updateTask,
    setInitialTab,
    isLoading,
    startPomodoroForTask,
    pausePomodoro,
    skipBreak,
    confirmationPending,
    confirmTaskCompletion,
    proceedToBreak,
  } = useApp();

  const history = useHistory();
  const [present, dismiss] = useIonToast();

  useEffect(() => {
    if (confirmationPending) {
      present({
        message: '🏁 ¡Ciclo de enfoque terminado! ¿Tarea completa?',
        duration: 0, // Persiste hasta que el usuario interactúa
        position: 'bottom',
        color: 'light',
        buttons: [
          {
            text: '😴 no, a descansar',
            role: 'cancel',
            handler: () => {
              proceedToBreak();
            },
          },
          {
            text: '✅ sí, terminada',
            role: 'confirm',
            handler: async () => {
              await confirmTaskCompletion();
              setInitialTab('completed');
              history.push('/tasks');
            },
          },
        ],
        onDidDismiss: (e) => {
          if (e.detail.role !== 'confirm' && e.detail.role !== 'cancel') {
            proceedToBreak();
          }
        },
      });
    } else {
      // Si ya no hay confirmación pendiente, asegurarse de que el toast se oculte.
      dismiss();
    }

    // Función de limpieza: se ejecuta si el componente se desmonta
    // o si el efecto se vuelve a ejecutar. Garantiza que no queden toasts perdidos.
    return () => {
      dismiss();
    };
  }, [confirmationPending, present, dismiss, history, setInitialTab, proceedToBreak, confirmTaskCompletion]);

  const handleToggleTimer = () => {
    if (timerState.isRunning) {
      pausePomodoro();
    } else {
      if (!activeTask) {
        present({ message: 'Selecciona una tarea para comenzar', duration: 2000, color: 'warning' });
        history.push('/tasks');
        return;
      }
      startPomodoroForTask(activeTask);
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

  const totalTaskDurationInSeconds = activeTask ? activeTask.duration * 60 : 0;
  const percentageElapsed = totalTaskDurationInSeconds > 0
    ? ((timerState.totalElapsed || 0) / totalTaskDurationInSeconds) * 100
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
        <IonContent fullscreen className="ion-padding"><div className="timer-container"><IonSpinner name="lines-sharp" color="success" /></div></IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <Header />
      <IonContent fullscreen className="ion-padding">
        <div className="timer-container">
          <div className="active-task-display"><p className="task-name">{activeTask?.title || 'Ninguna tarea seleccionada'}</p></div>
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
              {activeTask && (
                <p className="time-percentage">{`${Math.floor(percentageElapsed)}%`}</p>
              )}
            </div>
          </div>
          <div className="timer-controls">
            <IonButton onClick={handleToggleTimer} className="control-button-pause" color={timerState.isRunning ? 'danger' : 'success'} disabled={!activeTask && timerState.timeLeft === 0 || confirmationPending}>
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
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TimerPage;
