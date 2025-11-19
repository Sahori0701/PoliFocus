
// pages/TimerPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
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

const RADIUS = 130; // Radio del círculo
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
    startPomodoroForTask
  } = useApp();

  const history = useHistory();
  const [present] = useIonToast();
  
  const durations = useMemo(() => ({
    focus: config.focusTime || 25,
    shortBreak: config.shortBreak || 5,
    longBreak: config.longBreak || 15,
  }), [config]);

  useEffect(() => {
    if (isLoading) return;
    if (!activeTask && timerState.mode === 'focus') {
      if (timerState.isRunning) {
        setTimerState(prev => ({ ...prev, isRunning: false }));
      }
      return;
    }
    if (timerState.isRunning && timerState.timeLeft > 0) {
      const interval = setInterval(() => {
        setTimerState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1, totalElapsed: prev.totalElapsed + 1 }));
      }, 1000);
      return () => clearInterval(interval);
    } else if (timerState.timeLeft <= 0 && timerState.isRunning) {
      handleSessionEnd();
    }
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
    const actualDuration = Math.ceil(timerState.totalElapsed / 60);
    await updateTask(activeTask.id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      actualDuration: actualDuration,
    });
    const efficiency = taskService.calculateEfficiency(activeTask.duration, actualDuration);
    present({ message: `✅ ${activeTask.title} ${efficiency.icon}`, duration: 3000, color: 'success' });
    setActiveTask(null);
    setTimerState({ isRunning: false, timeLeft: durations.focus * 60, mode: 'focus', totalElapsed: 0, startTime: null, remainingTime: 0 });
    setInitialTab('completed');
    history.push('/tasks');
  };

  const handleSessionEnd = () => {
    if (timerState.mode === 'focus') {
        if (timerState.remainingTime > 0) {
            // More focus time needed for this task
            present({ message: '🔔 ¡Tiempo de descanso!', duration: 2000, color: 'primary' });
            setTimerState(prev => ({
                ...prev,
                mode: 'shortBreak',
                timeLeft: durations.shortBreak * 60,
                isRunning: true, // Auto-start break
            }));
        } else {
            // Task finished
            handleCompleteTask();
        }
    } else { // Break finished
        present({ message: '🔔 ¡A trabajar de nuevo!', duration: 2000, color: 'primary' });
        const focusTime = config.focusTime * 60;
        const timeLeft = Math.min(timerState.remainingTime, focusTime);
        setTimerState(prev => ({
            ...prev,
            mode: 'focus',
            timeLeft: timeLeft,
            remainingTime: prev.remainingTime - timeLeft,
            isRunning: true, // Auto-start next focus session
        }));
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) seconds = 0;
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  const totalDuration = durations[timerState.mode] * 60;
  const percentageRemaining = totalDuration > 0 ? (timerState.timeLeft / totalDuration) * 100 : 100;
  const percentageElapsed = 100 - percentageRemaining;
  const strokeDashoffset = CIRCUMFERENCE - (percentageElapsed / 100) * CIRCUMFERENCE;

  const statusText = useMemo(() => {
    if (timerState.mode === 'shortBreak') return 'Descanso corto';
    if (timerState.mode === 'longBreak') return 'Descanso largo';
    if (timerState.isRunning) return '¡A trabajar!';
    return 'En pausa';
  }, [timerState.isRunning, timerState.mode]);

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
              <div className="time-percentage">{`${Math.ceil(percentageRemaining)}%`}</div>
              <div className="time-percentage-label">restante</div>
            </div>
          </div>

          <div className="timer-controls">
            <IonButton onClick={handleToggleTimer} className="control-button-pause" color={timerState.isRunning ? 'danger' : 'success'}>
              <IonIcon slot="start" icon={timerState.isRunning ? pause : play} />
              {timerState.isRunning ? 'Pausar' : 'Iniciar'}
            </IonButton>
            
            {activeTask && timerState.mode === 'focus' && (
              <IonButton onClick={handleCompleteTask} className="control-button-complete" color="success">
                <IonIcon slot="icon-only" icon={checkmark} />
              </IonButton>
            )}

            <IonButton onClick={handleSessionEnd} className="control-button-skip" color="primary">
              <IonIcon slot="icon-only" icon={playSkipForwardOutline} />
            </IonButton>
          </div>

          <div className="footer-info">ⓘ El botón de check marca la tarea como completada.</div>
          
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
