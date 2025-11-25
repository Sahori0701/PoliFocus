// src/context/AppContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { useIonToast, isPlatform } from '@ionic/react';
import { App as CapApp } from '@capacitor/app';
import { PluginListenerHandle } from '@capacitor/core';
import { BackgroundTask } from '@capawesome/capacitor-background-task';
import { Task } from '../models/Task';
import { Project } from '../models/Project';
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
  selectTask: (task: Task) => void;
  projects: Project[];
  loadProjects: () => Promise<Project[]>;
  addProject: (projectData: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (projectId: number, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: number) => Promise<void>;
  sessions: PomodoroSession[];
  loadSessions: () => Promise<void>;
  addSession: (session: PomodoroSession) => Promise<void>;
  config: AppConfig;
  updateConfig: (updates: Partial<AppConfig>) => Promise<void>;
  clearAllData: () => Promise<void>;
  timerState: TimerState;
  activeTask: Task | null;
  setActiveTask: React.Dispatch<React.SetStateAction<Task | null>>;
  startPomodoroForTask: (task: Task) => void;
  pausePomodoro: () => void;
  resumePomodoro: () => void;
  skipBreak: () => void;
  initialTab: string | null;
  setInitialTab: React.Dispatch<React.SetStateAction<string | null>>;
  showWelcomeModal: boolean;
  setShowWelcomeModal: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  confirmationPending: boolean;
  confirmTaskCompletion: () => Promise<void>;
  proceedToBreak: () => void;
  taskTimeRemaining: number;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_TIMER_STATE: TimerState = {
  isRunning: false,
  timeLeft: DEFAULT_CONFIG.focusTime * 60,
  mode: 'focus',
  totalElapsed: 0,
  startTime: null,
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [timerState, setTimerState] = useState<TimerState>(DEFAULT_TIMER_STATE);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialTab, setInitialTab] = useState<string | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [confirmationPending, setConfirmationPending] = useState<boolean>(false);
  const [nextModeInfo, setNextModeInfo] = useState<any>(null);
  const [taskTimeRemaining, setTaskTimeRemaining] = useState<number>(0);

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
    }
  }, []);
  
  useEffect(() => {
    if (!isPlatform('hybrid')) return;
    let listener: PluginListenerHandle | null = null;
    const addListener = async () => {
      listener = await CapApp.addListener('appStateChange', async ({ isActive }) => {
        if (isActive) {
          finishBackgroundTask();
          const currentTasks = await storageService.getTasks();
          await notificationService.rescheduleAll(currentTasks);
        } else {
          if (isRunningRef.current) {
            try { backgroundTaskId.current = await BackgroundTask.beforeExit(async () => {}); }
            catch (e) { console.error('Failed to start background task', e); }
          }
        }
      });
    };
    addListener();
    return () => { listener?.remove(); };
  }, [finishBackgroundTask]);

  const loadTasks = useCallback(async (): Promise<Task[]> => {
    const loadedTasks = await storageService.getTasks();
    const migratedTasks = loadedTasks.map((task: any) => task.startDate ? { ...task, scheduledStart: task.startDate } : task);
    setTasks(migratedTasks);
    return migratedTasks;
  }, []);
  
  const loadProjects = useCallback(async (): Promise<Project[]> => {
    const loadedProjects = await storageService.getProjects();
    setProjects(loadedProjects);
    return loadedProjects;
  }, []);

  const loadSessions = useCallback(async () => {
    setSessions(await storageService.getSessions());
  }, []);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      await notificationService.init();
      const loadedConfig = await storageService.getConfig();
      setConfig(loadedConfig);
      const [loadedTasks] = await Promise.all([loadTasks(), loadSessions(), loadProjects()]);
      if (isPlatform('hybrid') && loadedTasks) { await notificationService.rescheduleAll(loadedTasks); }
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
  }, [loadTasks, loadSessions, loadProjects]);
  
  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  const stopAndResetTimer = useCallback(() => {
    if (timerWorker.current) {
      timerWorker.current.postMessage({ type: 'RESET' });
      const newDurations = { focus: config.focusTime * 60, shortBreak: config.shortBreak * 60, longBreak: config.longBreak * 60 };
      timerWorker.current.postMessage({ type: 'SET_STATE', payload: { durations: newDurations } });
    }
    setTimerState({ ...DEFAULT_TIMER_STATE, timeLeft: config.focusTime * 60 });
    setActiveTask(null);
    setTaskTimeRemaining(0);
    finishBackgroundTask();
  }, [config, finishBackgroundTask]);

  const addTask = async (taskData: Omit<Task, 'id'>) => {
    const newTask = await storageService.addTask(taskData);
    await notificationService.scheduleTaskNotifications(newTask);
    await loadTasks();
  };

  const updateTask = useCallback(async (taskId: number, updates: Partial<Task>) => {
    const updatedTask = await storageService.updateTask(taskId, updates);
    if (updatedTask) { await notificationService.scheduleTaskNotifications(updatedTask); }
    if ((updates.status === 'completed' || updates.status === 'cancelled') && activeTask && activeTask.id === taskId) {
      stopAndResetTimer();
    }
    await loadTasks();
  }, [activeTask, loadTasks, stopAndResetTimer]);

  const deleteTask = useCallback(async (taskId: number) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (taskToDelete) await notificationService.cancelTaskNotifications(taskToDelete);
    await storageService.deleteTask(taskId);
    if (activeTask && activeTask.id === taskId) { stopAndResetTimer(); }
    await loadTasks();
  }, [tasks, activeTask, loadTasks, stopAndResetTimer]);

  const addProject = async (projectData: Omit<Project, 'id'>) => {
    await storageService.addProject(projectData);
    await loadProjects();
  };
  const updateProject = async (projectId: number, updates: Partial<Project>) => {
    await storageService.updateProject(projectId, updates);
    await loadProjects();
  };
  const deleteProject = async (projectId: number) => {
    await storageService.deleteProject(projectId);
    await Promise.all([ loadProjects(), loadTasks() ]);
  };

  const addSession = async (session: PomodoroSession) => {
    await storageService.addSession(session);
    await loadSessions();
  };

  const updateConfig = useCallback(async (updates: Partial<AppConfig>) => {
    const newConfig = { ...config, ...updates };
    await storageService.saveConfig(newConfig);
    setConfig(newConfig);
    if (!activeTask) {
      setTimerState(prev => ({ ...prev, timeLeft: newConfig.focusTime * 60 }));
    }
  }, [config, activeTask]);

  const clearAllData = useCallback(async () => {
    try {
      await storageService.clearAllData();
      await loadInitialData();
      present({ message: 'Todos los datos han sido borrados.', duration: 2000, color: 'success', position: 'top' });
    } catch (error) {
      present({ message: 'Error al borrar los datos.', duration: 2000, color: 'danger', position: 'top' });
    }
  }, [loadInitialData, present]);

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
    // Cancelar notificación persistente al completar
    if (isPlatform('hybrid')) {
      notificationService.cancelTimerNotification();
    }
    stopAndResetTimer();
    present({ message: `✅ ¡Buen trabajo! Tarea completada.`, duration: 3000, color: 'success' });
  }, [timerState.totalElapsed, updateTask, present, stopAndResetTimer]);

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
      timerWorker.current.postMessage({ 
        type: 'SET_STATE', 
        payload: { 
          mode: nextModeInfo.mode, 
          timeLeft: nextModeInfo.timeLeft, 
          isRunning: true 
        } 
      });
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
            setTimerState(prev => ({ 
              ...prev, 
              timeLeft: payload.timeLeft, 
              totalElapsed: payload.totalElapsed 
            }));
            if (payload.taskTimeRemaining !== undefined) {
              setTaskTimeRemaining(payload.taskTimeRemaining);
            }
          } 
          break;
        case 'UPDATE_TIMER_NOTIFICATION':
          // Actualizar notificación persistente del temporizador
          if (isPlatform('hybrid') && isRunningRef.current && activeTaskRef.current) {
            const mins = Math.floor(payload.timeLeft / 60);
            const secs = payload.timeLeft % 60;
            const timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            notificationService.updateTimerNotification(
              activeTaskRef.current.title,
              timeString,
              payload.mode
            );
          }
          break;
        case 'MODE_CHANGE':
          notificationService.showProgressNotification(payload.message, activeTaskRef.current?.title || 'Pomodoro');
          if (modeRef.current === 'focus' && payload.timeLeft === 0) {
            // Ciclo de concentración completado
            setTimerState(prev => ({ ...prev, isRunning: false }));
            setConfirmationPending(true);
            setNextModeInfo(payload);
            // Cancelar notificación persistente
            notificationService.cancelTimerNotification();
          } else {
            // Cambio automático de modo (fin de descanso o siguiente fase)
            present({ message: payload.message, duration: 2000, color: 'primary' });
            setTimerState(prev => ({ 
              ...prev, 
              mode: payload.mode, 
              timeLeft: payload.timeLeft, 
              isRunning: true 
            }));
            if (timerWorker.current) {
              timerWorker.current.postMessage({ 
                type: 'SET_STATE', 
                payload: { 
                  mode: payload.mode, 
                  timeLeft: payload.timeLeft, 
                  isRunning: true 
                } 
              });
              timerWorker.current.postMessage({ type: 'START' });
            }
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
    
    const initialDurations = { 
      focus: config.focusTime * 60, 
      shortBreak: config.shortBreak * 60, 
      longBreak: config.longBreak * 60 
    };
    worker.postMessage({ type: 'SET_STATE', payload: { durations: initialDurations } });
    
    return () => worker.terminate();
  }, [present, config]);
  
  const selectTask = useCallback((task: Task) => {
    stopAndResetTimer();
    setActiveTask(task);
    const taskDurationSeconds = task.duration * 60;
    const initialFocusTime = Math.min(taskDurationSeconds, config.focusTime * 60);
    
    setTaskTimeRemaining(taskDurationSeconds);
    
    const newState: TimerState = { 
      isRunning: false, 
      mode: 'focus', 
      timeLeft: initialFocusTime, 
      totalElapsed: 0, 
      startTime: null 
    };
    setTimerState(newState);
    
    if (timerWorker.current) {
      const newDurations = { 
        focus: config.focusTime * 60, 
        shortBreak: config.shortBreak * 60, 
        longBreak: config.longBreak * 60 
      };
      timerWorker.current.postMessage({ 
        type: 'SET_STATE', 
        payload: { 
          ...newState, 
          durations: newDurations,
          taskDuration: taskDurationSeconds,
          taskTimeRemaining: taskDurationSeconds
        }
      });
    }
  }, [config.focusTime, config.shortBreak, config.longBreak, stopAndResetTimer]);

  const resumePomodoro = useCallback(() => {
    if (!timerState.isRunning && activeTask) {
      setTimerState(prev => ({ ...prev, isRunning: true, startTime: Date.now() }));
      if (timerWorker.current) { 
        timerWorker.current.postMessage({ type: 'START' }); 
      }
      // Mostrar notificación persistente del temporizador
      if (isPlatform('hybrid')) {
        const mins = Math.floor(timerState.timeLeft / 60);
        const secs = timerState.timeLeft % 60;
        const timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        notificationService.showTimerNotification(
          activeTask.title,
          timeString,
          timerState.mode
        );
      }
    }
  }, [timerState.isRunning, timerState.timeLeft, timerState.mode, activeTask]);

  const startPomodoroForTask = (task: Task) => {
    selectTask(task);
    setTimeout(() => {
      setTimerState(prev => ({ ...prev, isRunning: true, startTime: Date.now() }));
      if (timerWorker.current) { timerWorker.current.postMessage({ type: 'START' }); }
    }, 50);
  };

  const pausePomodoro = () => {
    if (timerState.isRunning) {
      setTimerState(prev => ({ ...prev, isRunning: false }));
      if (timerWorker.current) { timerWorker.current.postMessage({ type: 'PAUSE' }); }
      // Cancelar notificación persistente al pausar
      if (isPlatform('hybrid')) {
        notificationService.cancelTimerNotification();
      }
      finishBackgroundTask();
    }
  };

  const skipBreak = useCallback(() => {
    if (timerState.mode !== 'focus' && activeTask) {
      const remainingTaskTime = taskTimeRemaining;
      const nextFocusDuration = Math.min(remainingTaskTime, config.focusTime * 60);
      
      present({ message: 'Saltando al siguiente bloque de concentración...', duration: 2000, color: 'secondary' });
      
      setTimerState(prev => ({ 
        ...prev, 
        mode: 'focus', 
        timeLeft: nextFocusDuration, 
        isRunning: true,
        startTime: Date.now()
      }));
      
      if (timerWorker.current) {
        timerWorker.current.postMessage({ 
          type: 'SET_STATE', 
          payload: { 
            mode: 'focus', 
            timeLeft: nextFocusDuration, 
            isRunning: true,
            taskTimeRemaining: remainingTaskTime
          } 
        });
        timerWorker.current.postMessage({ type: 'START' });
      }
    }
  }, [activeTask, present, timerState.mode, taskTimeRemaining, config.focusTime]);

  const value: AppContextType = {
    tasks, loadTasks, addTask, updateTask, deleteTask, selectTask,
    projects, loadProjects, addProject, updateProject, deleteProject,
    sessions, loadSessions, addSession,
    config, updateConfig, clearAllData,
    timerState, activeTask, setActiveTask, startPomodoroForTask, pausePomodoro, resumePomodoro, skipBreak,
    initialTab, setInitialTab, showWelcomeModal, setShowWelcomeModal, isLoading,
    confirmationPending, confirmTaskCompletion, proceedToBreak,
    taskTimeRemaining
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};