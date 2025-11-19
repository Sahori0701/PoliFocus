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
    setActiveTask,
    updateTask,
    setInitialTab,
    isLoading,
  } = useApp();

  const history = useHistory();
  const [present] = useIonToast();

  const durations = useMemo(() => ({
    focus: config.focusTime * 60,
    shortBreak: config.shortBreak * 60,
    longBreak: config.longBreak * 60,
  }), [config]);

  // Main timer effect
  useEffect(() => {
    if (isLoading || !timerState.isRunning || !activeTask) {
      return;
    }

    if (timerState.timeLeft <= 0) {
      handleSessionEnd();
      return;
    }

    const interval = setInterval(() => {
      setTimerState(prev => {
        const newTimeLeft = prev.timeLeft - 1;
        // Only increment totalElapsed during focus mode
        const newTotalElapsed = prev.mode === 'focus' ? (prev.totalElapsed || 0) + 1 : prev.totalElapsed;
        
        if (newTimeLeft < 0) {
          return { ...prev, timeLeft: 0, totalElapsed: newTotalElapsed };
        }

        return { ...prev, timeLeft: newTimeLeft, totalElapsed: newTotalElapsed };
      });
    }, 1000);

    return () => clearInterval(interval);

  }, [timerState.isRunning, timerState.timeLeft, activeTask, isLoading]);


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

  const handleSessionEnd = () => {
    if (timerState.mode === 'focus') {
      present({ message: '🔔 ¡Tiempo de descanso!', duration: 2000, color: 'primary' });
      setTimerState(prev => ({
        ...prev,
        mode: 'shortBreak',
        timeLeft: durations.shortBreak,
        isRunning: true, 
      }));
    } else { // Break finished
      if (!activeTask) return;
      const timeRemainingInTask = (activeTask.duration * 60) - (timerState.totalElapsed || 0);

      if (timeRemainingInTask > 0) {
        present({ message: '🔔 ¡A trabajar de nuevo!', duration: 2000, color: 'primary' });
        const nextFocusDuration = Math.min(timeRemainingInTask, durations.focus);
        setTimerState(prev => ({
          ...prev,
          mode: 'focus',
          timeLeft: nextFocusDuration,
          isRunning: true, 
        }));
      } else {
        present({ message: 'Tarea terminada. ¡Márcala como completada!', duration: 3000, color: 'tertiary' });
        setTimerState(prev => ({ ...prev, isRunning: false, timeLeft: 0, mode: 'focus' }));
      }
    }
  };
  
  const handleSkip = () => {
    if(!activeTask) return;

    const isFocus = timerState.mode === 'focus';
    const nextMode = isFocus ? 'shortBreak' : 'focus';
    present({ message: isFocus ? 'Saltando al descanso' : 'Volviendo a la tarea', duration: 1500, color: 'medium' });

    let nextTimeLeft;

    if (nextMode === 'focus') {
      const totalElapsedOnTask = timerState.totalElapsed || 0;
      const totalTaskDuration = activeTask.duration * 60;
      const timeRemainingInTask = totalTaskDuration - totalElapsedOnTask;

      const timeIntoCurrentPomodoro = totalElapsedOnTask % durations.focus;
      const timeLeftInCurrentPomodoro = durations.focus - timeIntoCurrentPomodoro;
      
      nextTimeLeft = Math.min(timeRemainingInTask, timeLeftInCurrentPomodoro);

      if (nextTimeLeft <= 0) {
        present({ message: 'La tarea ya no tiene tiempo restante.', duration: 2000, color: 'warning' });
        nextTimeLeft = 0;
      }

    } else { // Skipping to break
      nextTimeLeft = durations.shortBreak;
    }

    setTimerState(prev => ({
      ...prev,
      mode: nextMode,
      timeLeft: Math.max(0, nextTimeLeft), 
      isRunning: false, // ALWAYS stop on manual skip
    }));
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) seconds = 0;
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const getSessionTotalDuration = () => {
    if (timerState.mode === 'focus') {
      return durations.focus;
    }
    return durations[timerState.mode];
  }
  const sessionTotalDuration = getSessionTotalDuration();
  const percentageElapsed = sessionTotalDuration > 0
    ? ((sessionTotalDuration - timerState.timeLeft) / sessionTotalDuration) * 100
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
              <circle
                className="progress-ring__background"
                cx="140" cy="140" r={RADIUS}
                fill="transparent"
                strokeWidth="16"
              />
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

            <IonButton onClick={handleSkip} disabled={!activeTask} className="control-button-skip" color="primary">
              <IonIcon slot="icon-only" icon={playSkipForwardOutline} />
            </IonButton>
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
