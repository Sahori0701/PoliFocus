// contexts/AppContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
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
  loadTasks: () => Promise<Task[]>;
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
  confirmationPending: boolean;
  confirmTaskCompletion: () => Promise<void>;
  proceedToBreak: () => void;
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
  
  const [confirmationPending, setConfirmationPending] = useState<boolean>(false);
  const [nextModeInfo, setNextModeInfo] = useState<any>(null);

  const timerWorker = useRef<Worker | null>(null);
  const backgroundTaskId = useRef<string | null>(null);
  const isRunningRef = useRef(timerState.isRunning);
  isRunningRef.current = timerState.isRunning;
  const modeRef = useRef(timerState.mode);
  modeRef.current = timerState.mode;
  const activeTaskRef = useRef(activeTask);
  activeTaskRef.current = activeTask;

  const [present] = useIonToast();

  const finishBackgroundTask = useCallback(() => {
    if (backgroundTaskId.current) {
      BackgroundTask.finish({ taskId: backgroundTaskId.current });
      backgroundTaskId.current = null;
      console.log('Background task finished.');
    }
  }, []);

  // MODIFICADO: Lógica de "Tierra Arrasada" al volver a la App
  useEffect(() => {
    if (!isPlatform('hybrid')) return;
    let listener: PluginListenerHandle | null = null;
    const addListener = async () => {
      listener = await CapApp.addListener('appStateChange', async ({ isActive }) => {
        if (isActive) {
          finishBackgroundTask();
          console.log('App is active, running notification audit...');
          const currentTasks = await storageService.getTasks();
          await notificationService.rescheduleAll(currentTasks);
        } else {
          if (isRunningRef.current) {
            try {
              backgroundTaskId.current = await BackgroundTask.beforeExit(async () => {
                console.log('Background task for timer started.');
              });
            } catch (e) {
              console.error('Failed to start background task', e);
            }
          }
        }
      });
    };
    addListener();
    return () => { listener?.remove(); };
  }, [finishBackgroundTask]);

  const loadTasks = useCallback(async (): Promise<Task[]> => {
    try {
      const loadedTasks = await storageService.getTasks();
      const migratedTasks = loadedTasks.map((task: any) => task.startDate ? { ...task, scheduledStart: task.startDate } : task);
      setTasks(migratedTasks);
      return migratedTasks;
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  }, []);

  const stopAndResetTimer = useCallback(() => {
    if (timerWorker.current) {
      timerWorker.current.postMessage({ type: 'RESET' });
      const newDurations = { focus: config.focusTime * 60, shortBreak: config.shortBreak * 60, longBreak: config.longBreak * 60 };
      timerWorker.current.postMessage({ type: 'SET_STATE', payload: { durations: newDurations } });
    }
    setTimerState({ ...DEFAULT_TIMER_STATE, timeLeft: config.focusTime * 60 });
    setActiveTask(null);
    finishBackgroundTask();
  }, [config, finishBackgroundTask]);

  const updateTask = useCallback(async (taskId: number, updates: Partial<Task>) => {
    try {
      const updatedTask = await storageService.updateTask(taskId, updates);
      if (updatedTask) {
        await notificationService.scheduleTaskNotifications(updatedTask);
      }
      if ((updates.status === 'completed' || updates.status === 'cancelled') && activeTask && activeTask.id === taskId) {
        stopAndResetTimer();
      }
      await loadTasks();
    } catch (error) {
      console.error('Error updating task:', error); throw error;
    }
  }, [activeTask, loadTasks, stopAndResetTimer]);
  
  // ... (resto de las funciones sin cambios significativos en su llamada)

  const loadSessions = useCallback(async () => {
    try {
      setSessions(await storageService.getSessions());
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  }, []);

  // MODIFICADO: Lógica de "Tierra Arrasada" en el arranque inicial
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      await notificationService.init();
      const loadedConfig = await storageService.getConfig();
      setConfig(loadedConfig);
      
      const [loadedTasks] = await Promise.all([loadTasks(), loadSessions()]);

      if (isPlatform('hybrid') && loadedTasks) {
        console.log('Initial app load, running notification audit...');
        await notificationService.rescheduleAll(loadedTasks);
      }

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
  }, [loadTasks, loadSessions, timerWorker]);

  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  const addTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      const newTask = await storageService.addTask(taskData);
      await notificationService.scheduleTaskNotifications(newTask);
      await loadTasks();
    } catch (error) {
      console.error('Error adding task:', error); throw error;
    }
  };

  const deleteTask = useCallback(async (taskId: number) => {
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
  }, [tasks, activeTask, loadTasks, stopAndResetTimer]);
  
  // ... (resto de funciones sin cambios como addSession, updateConfig, etc.)

  const confirmTaskCompletion = useCallback(async () => {
    if (!activeTaskRef.current) return;
    const actualDuration = timerState.totalElapsed > 0 ? Math.ceil(timerState.totalElapsed / 60) : 1;
    await updateTask(activeTaskRef.current.id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      actualDuration: actualDuration,
    });
    setConfirmationPending(false);
    setNextModeInfo(null);
    present({ message: `✅ ¡Buen trabajo! Tarea completada.`, duration: 3000, color: 'success' });
  }, [timerState.totalElapsed, updateTask, present]);

  const proceedToBreak = useCallback(() => {
    if (!nextModeInfo) return;
    present({ message: nextModeInfo.message, duration: 2000, color: 'primary' });
    setTimerState(prev => ({
      ...prev,
      mode: nextModeInfo.mode,
      timeLeft: nextModeInfo.timeLeft,
      isRunning: true,
      startTime: Date.now()
    }));
    if (timerWorker.current) {
      timerWorker.current.postMessage({ type: 'START' });
    }
    setConfirmationPending(false);
    setNextModeInfo(null);
  }, [nextModeInfo, present]);

  useEffect(() => {
    const worker = new Worker('/timer.worker.js');
    timerWorker.current = worker;

    worker.onmessage = (e) => {
      const { type, payload } = e.data;
      switch (type) {
        case 'TICK':
          if (isRunningRef.current) {
            setTimerState(prev => ({ ...prev, timeLeft: payload.timeLeft, totalElapsed: payload.totalElapsed }));
          }
          break;
        case 'MODE_CHANGE':
          notificationService.showProgressNotification(payload.message, activeTaskRef.current?.title || 'Pomodoro');
          if (modeRef.current === 'focus') {
            setTimerState(prev => ({ ...prev, isRunning: false }));
            setConfirmationPending(true);
            setNextModeInfo(payload);
          } else {
            present({ message: payload.message, duration: 2000, color: 'primary' });
            setTimerState(prev => ({ ...prev, mode: payload.mode, timeLeft: payload.timeLeft, isRunning: true }));
            if (timerWorker.current) timerWorker.current.postMessage({ type: 'START' });
          }
          break;
        case 'PROGRESS_NOTIFICATION':
          if (isPlatform('hybrid')) {
            notificationService.showProgressNotification(payload.message, activeTaskRef.current?.title || 'Pomodoro');
          }
          break;
        case 'STATE_UPDATE':
          setTimerState(prev => ({ ...prev, ...payload }));
          break;
      }
    };

    const initialDurations = { focus: config.focusTime * 60, shortBreak: config.shortBreak * 60, longBreak: config.longBreak * 60 };
    worker.postMessage({ type: 'SET_STATE', payload: { durations: initialDurations } });

    return () => worker.terminate();
  }, [present, config]);
  
  const startPomodoroForTask = (task: Task) => {
    // ... (sin cambios)
  };

  const pausePomodoro = () => {
    // ... (sin cambios)
  };

  const skipBreak = useCallback(() => {
    // ... (sin cambios)
  }, [activeTask, config.focusTime, present, timerState.totalElapsed]);

  const addSession = async (session: PomodoroSession) => {
    // ... (sin cambios)
  };

  const updateConfig = async (updates: Partial<AppConfig>) => {
    // ... (sin cambios)
  };

  const value: AppContextType = { 
    tasks, 
    loadTasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    sessions, 
    loadSessions, 
    addSession, 
    config, 
    updateConfig, 
    timerState, 
    activeTask, 
    startPomodoroForTask, 
    pausePomodoro, 
    skipBreak, 
    initialTab, 
    setInitialTab, 
    showWelcomeModal, 
    setShowWelcomeModal, 
    isLoading, 
    confirmationPending, 
    confirmTaskCompletion, 
    proceedToBreak 
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};
