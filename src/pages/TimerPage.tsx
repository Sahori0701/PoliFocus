// pages/TimerPage.tsx
import React, { useEffect, useMemo } from 'react';
import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonSpinner,
  useIonToast,
} from '@ionic/react';
import { play, pause, checkmark, playSkipForwardOutline, search } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import './TimerPage.css';
import { taskService } from '../services/task.service';

const RADIUS = 130;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const TimerPage: React.FC = () => {
  const {
    config,
    timerState,
    setTimerState,
    activeTask,
    updateTask,
    setInitialTab,
    isLoading,
  } = useApp();

  const history = useHistory();
  const [present, dismiss] = useIonToast();

  const durations = useMemo(() => ({
    focus: config.focusTime * 60,
    shortBreak: config.shortBreak * 60,
    longBreak: config.longBreak * 60,
  }), [config]);

  useEffect(() => {
    if (!timerState.isRunning) {
      return;
    }

    const interval = setInterval(() => {
      setTimerState(prev => {
        if (!prev.isRunning || !activeTask) {
          return prev;
        }

        if (prev.timeLeft <= 1) {
          dismiss();
          if (prev.mode === 'focus') {
            present({ message: '🔔 ¡Tiempo de descanso!', duration: 2000, color: 'primary' });
            return {
              ...prev,
              mode: 'shortBreak',
              timeLeft: durations.shortBreak,
              isRunning: true,
            };
          } else {
            present({ message: '🔔 ¡A trabajar de nuevo!', duration: 2000, color: 'primary' });
            const timeRemainingInTask = (activeTask.duration * 60) - (prev.totalElapsed || 0);
            if (timeRemainingInTask <= 0) {
              present({ message: 'Tarea terminada. ¡Márcala como completada!', duration: 3000, color: 'tertiary' });
              return { ...prev, isRunning: false, timeLeft: 0, mode: 'focus' };
            }
            const elapsedInCurrentCycle = (prev.totalElapsed || 0) % durations.focus;
            const timeRemainingInCycle = durations.focus - elapsedInCurrentCycle;
            const nextFocusDuration = Math.min(timeRemainingInTask, timeRemainingInCycle);
            return {
              ...prev,
              mode: 'focus',
              timeLeft: nextFocusDuration,
              isRunning: true,
            };
          }
        }

        const newTotalElapsed = prev.mode === 'focus' ? (prev.totalElapsed || 0) + 1 : (prev.totalElapsed || 0);
        return {
          ...prev,
          timeLeft: prev.timeLeft - 1,
          totalElapsed: newTotalElapsed,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState.isRunning, activeTask, setTimerState, present, dismiss, durations]);

  const handleToggleTimer = () => {
    if (!activeTask && timerState.mode === 'focus') {
      present({ message: 'Selecciona una tarea para comenzar', duration: 2000, color: 'warning' });
      history.push('/tasks');
      return;
    }
    setTimerState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const handleCompleteTask = async () => {
    if (!activeTask) return;
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
    setTimerState(prev => ({ ...prev, timeLeft: 1, isRunning: true }));
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
    if (timerState.mode === 'shortBreak') return 'Descanso corto';
    if (timerState.mode === 'longBreak') return 'Descanso largo';
    if (!activeTask) return 'Selecciona una tarea';
    if (timerState.isRunning) return '¡A trabajar!';
    if (timerState.timeLeft <= 0) return 'Tarea terminada';
    return 'En pausa';
  }, [timerState.isRunning, timerState.mode, timerState.timeLeft, activeTask]);

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
            <IonButton onClick={handleToggleTimer} className="control-button-pause" color={timerState.isRunning ? 'danger' : 'success'} disabled={timerState.timeLeft === 0 && activeTask !== null}>
              <IonIcon slot="start" icon={timerState.isRunning ? pause : play} />
              {timerState.isRunning ? 'Pausar' : 'Iniciar'}
            </IonButton>
            {activeTask && (
              <IonButton onClick={handleCompleteTask} className="control-button-complete" color="success" fill="outline">
                <IonIcon slot="icon-only" icon={checkmark} />
              </IonButton>
            )}
            {/* ** NEW LOGIC FOR SKIP BUTTON ** */}
            {activeTask && activeTask.duration >= config.focusTime && (
              <IonButton
                onClick={handleSkip}
                disabled={timerState.mode === 'focus'}
                className="control-button-skip"
                color="primary"
              >
                <IonIcon slot="icon-only" icon={playSkipForwardOutline} />
              </IonButton>
            )}
          </div>
          <div className="footer-info">ⓘ Marca la tarea como completada solo con el botón de check (✓)</div>
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={() => history.push('/tasks')}>
              <IonIcon icon={search} />
            </IonFabButton>
          </IonFab>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TimerPage;
