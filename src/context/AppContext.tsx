// contexts/AppContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useIonToast, isPlatform } from '@ionic/react';
import { App as CapApp } from '@capacitor/app';
import { PluginListenerHandle } from '@capacitor/core';
import { BackgroundTask } from '@capawesome/capacitor-background-task';
import { Task } from '../models/Task';
import { PomodoroSession, TimerState } from '../models/Pomodoro';
import { AppConfig, DEFAULT_CONFIG } from '../models/Config';
import { storageService } from '../services/storage.service';
import { notificationService } from '../services/notification.service';

export interface AppContextType {
  tasks: Task[];
  loadTasks: () => Promise<void>;
  addTask: (taskData: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (taskId: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  sessions: PomodoroSession[];
  loadSessions: () => Promise<void>;
  addSession: (session: PomodoroSession) => Promise<void>;
  config: AppConfig;
  updateConfig: (updates: Partial<AppConfig>) => Promise<void>;
  timerState: TimerState;
  activeTask: Task | null;
  startPomodoroForTask: (task: Task) => void;
  pausePomodoro: () => void;
  skipBreak: () => void;
  initialTab: string | null;
  setInitialTab: React.Dispatch<React.SetStateAction<string | null>>;
  showWelcomeModal: boolean;
  setShowWelcomeModal: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_TIMER_STATE: TimerState = {
  isRunning: false,
  timeLeft: DEFAULT_CONFIG.focusTime * 60,
  mode: 'focus',
  totalElapsed: 0,
  startTime: null,
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [timerState, setTimerState] = useState<TimerState>(DEFAULT_TIMER_STATE);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialTab, setInitialTab] = useState<string | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const timerWorker = useRef<Worker | null>(null);
  const backgroundTaskId = useRef<string | null>(null);
  const isRunningRef = useRef(timerState.isRunning);
  isRunningRef.current = timerState.isRunning;

  const [present] = useIonToast();

  useEffect(() => {
    if (!isPlatform('hybrid')) return;
    let listener: PluginListenerHandle | null = null;
    const addListener = async () => {
      listener = await CapApp.addListener('appStateChange', async ({ isActive }) => {
        if (!isActive && isRunningRef.current) {
          try {
            backgroundTaskId.current = await BackgroundTask.beforeExit(async () => {
              console.log('Background task for timer started.');
              BackgroundTask.finish({ taskId: backgroundTaskId.current! });
            });
          } catch (e) {
            console.error('Failed to start background task', e);
          }
        }
      });
    };
    addListener();
    return () => { listener?.remove(); };
  }, []);

  useEffect(() => {
    const worker = new Worker('/timer.worker.js');
    timerWorker.current = worker;

    worker.onmessage = (e) => {
      const { type, payload } = e.data;
      switch (type) {
        case 'TICK':
          if (isRunningRef.current) { // The crucial guard
            setTimerState(prev => ({ ...prev, timeLeft: payload.timeLeft, totalElapsed: payload.totalElapsed }));
          }
          break;
        case 'MODE_CHANGE':
          present({ message: payload.message, duration: 2000, color: 'primary' });
          setTimerState(prev => ({ ...prev, mode: payload.mode, timeLeft: payload.timeLeft, isRunning: true }));
          break;
        case 'TASK_FINISHED':
          present({ message: payload.message, duration: 3000, color: 'tertiary' });
          setTimerState(prev => ({ ...prev, isRunning: false, timeLeft: payload.timeLeft }));
          setActiveTask(null);
          break;
        case 'STATE_UPDATE':
          setTimerState(prev => ({ ...prev, ...payload }));
          break;
      }
    };

    const initialDurations = { focus: config.focusTime * 60, shortBreak: config.shortBreak * 60, longBreak: config.longBreak * 60 };
    worker.postMessage({ type: 'SET_STATE', payload: { durations: initialDurations } });

    return () => worker.terminate();
  }, [present]); // Simplified dependencies, config changes are handled in updateConfig

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const loadedConfig = await storageService.getConfig();
      setConfig(loadedConfig);
      await Promise.all([loadTasks(), loadSessions()]);
      setTimerState(prev => ({ ...prev, timeLeft: loadedConfig.focusTime * 60 }));
      if (timerWorker.current) {
        const newDurations = { focus: loadedConfig.focusTime * 60, shortBreak: loadedConfig.shortBreak * 60, longBreak: loadedConfig.longBreak * 60 };
        timerWorker.current.postMessage({ type: 'SET_STATE', payload: { durations: newDurations } });
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadInitialData(); }, [timerWorker.current]); // Depend on worker to be ready

  const startPomodoroForTask = (task: Task) => {
    if (activeTask && activeTask.id === task.id && !timerState.isRunning) {
      if (timerWorker.current) {
        timerWorker.current.postMessage({ type: 'START' });
        setTimerState(prev => ({ ...prev, isRunning: true, startTime: Date.now() - (prev.totalElapsed * 1000) }));
      }
      return;
    }

    const focusTime = config.focusTime * 60;
    const taskTime = task.duration * 60;
    const timeLeft = Math.min(taskTime, focusTime);

    const workerPayload = { timeLeft, mode: 'focus', totalElapsed: 0, activeTaskDuration: taskTime };
    if (timerWorker.current) {
      timerWorker.current.postMessage({ type: 'SET_STATE', payload: workerPayload });
      timerWorker.current.postMessage({ type: 'START' });
    }

    const newTimerState: TimerState = { ...DEFAULT_TIMER_STATE, timeLeft, mode: 'focus', totalElapsed: 0, isRunning: true, startTime: Date.now() };
    setTimerState(newTimerState);
    setActiveTask(task);
  };

  const pausePomodoro = () => {
    setTimerState(prev => ({...prev, isRunning: false}));
    if (timerWorker.current) timerWorker.current.postMessage({ type: 'PAUSE' });
  };

  const skipBreak = () => {
    if (timerWorker.current && activeTask) {
      const taskTime = activeTask.duration * 60;
      const elapsed = timerState.totalElapsed;
      const timeRemainingInTask = taskTime - elapsed;

      if (timeRemainingInTask <= 0) {
        present({ message: 'Tarea ya completada.', duration: 2000, color: 'warning' });
        return;
      }

      const nextFocusDuration = Math.min(timeRemainingInTask, config.focusTime * 60);
      const workerPayload = { mode: 'focus', timeLeft: nextFocusDuration, activeTaskDuration: taskTime, totalElapsed: timerState.totalElapsed };

      timerWorker.current.postMessage({ type: 'SET_STATE', payload: workerPayload });
      timerWorker.current.postMessage({ type: 'START' });
      
      setTimerState(prev => ({ ...prev, mode: 'focus', timeLeft: nextFocusDuration, isRunning: true, startTime: Date.now() - (prev.totalElapsed * 1000) }));
      present({ message: '🔔 ¡A trabajar de nuevo!', duration: 2000, color: 'primary' });
    }
  };

  const addTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      const newTask = await storageService.addTask(taskData);
      await notificationService.scheduleTaskNotifications(newTask);
      await loadTasks();
    } catch (error) {
      console.error('Error adding task:', error); throw error;
    }
  };

  const stopAndResetTimer = () => {
    setTimerState(prev => ({ ...prev, isRunning: false }));
    if (timerWorker.current) {
      timerWorker.current.postMessage({ type: 'RESET' });
    }
    setActiveTask(null);
  };

  const updateTask = async (taskId: number, updates: Partial<Task>) => {
    try {
      const originalTask = tasks.find(t => t.id === taskId);
      if (originalTask) await notificationService.cancelTaskNotifications(originalTask);
      
      const updatedTask = await storageService.updateTask(taskId, updates);
      if (updatedTask) await notificationService.scheduleTaskNotifications(updatedTask);
      
      if ((updates.status === 'completed' || updates.status === 'cancelled') && activeTask && activeTask.id === taskId) {
        stopAndResetTimer();
      }
      
      await loadTasks();
    } catch (error) {
      console.error('Error updating task:', error); throw error;
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      const taskToDelete = tasks.find(t => t.id === taskId);
      if (taskToDelete) await notificationService.cancelTaskNotifications(taskToDelete);
      await storageService.deleteTask(taskId);
      if (activeTask && activeTask.id === taskId) {
        stopAndResetTimer();
      }
      await loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error); throw error;
    }
  };

  const loadTasks = async () => {
    try {
      const loadedTasks = await storageService.getTasks();
      const migratedTasks = loadedTasks.map((task: any) => task.startDate ? { ...task, scheduledStart: task.startDate } : task);
      setTasks(migratedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadSessions = async () => {
    try {
      setSessions(await storageService.getSessions());
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const addSession = async (session: PomodoroSession) => {
    try {
      await storageService.addSession(session);
      setSessions(prev => [...prev, session]);
    } catch (error) {
      console.error('Error adding session:', error); throw error;
    }
  };

  const updateConfig = async (updates: Partial<AppConfig>) => {
    try {
      const newConfig = await storageService.updateConfig(updates);
      setConfig(newConfig);
      if (timerWorker.current) {
        const newDurations = { focus: newConfig.focusTime * 60, shortBreak: newConfig.shortBreak * 60, longBreak: newConfig.longBreak * 60 };
        timerWorker.current.postMessage({ type: 'SET_STATE', payload: { durations: newDurations } });
      }
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  const value: AppContextType = { tasks, loadTasks, addTask, updateTask, deleteTask, sessions, loadSessions, addSession, config, updateConfig, timerState, activeTask, startPomodoroForTask, pausePomodoro, skipBreak, initialTab, setInitialTab, showWelcomeModal, setShowWelcomeModal, isLoading };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};
