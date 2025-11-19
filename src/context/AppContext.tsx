// contexts/AppContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task } from '../models/Task';
import { PomodoroSession, TimerState } from '../models/Pomodoro';
import { AppConfig, DEFAULT_CONFIG } from '../models/Config';
import { storageService } from '../services/storage.service';

export interface AppContextType {
  // Tasks
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  loadTasks: () => Promise<void>;
  addTask: (task: Task) => Promise<void>;
  updateTask: (taskId: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  
  // Sessions
  sessions: PomodoroSession[];
  setSessions: React.Dispatch<React.SetStateAction<PomodoroSession[]>>;
  loadSessions: () => Promise<void>;
  addSession: (session: PomodoroSession) => Promise<void>;
  
  // Config
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  loadConfig: () => Promise<void>;
  updateConfig: (updates: Partial<AppConfig>) => Promise<void>;
  
  // Timer State (no se persiste)
  timerState: TimerState;
  setTimerState: React.Dispatch<React.SetStateAction<TimerState>>;
  activeTask: Task | null;
  setActiveTask: React.Dispatch<React.SetStateAction<Task | null>>;
  startPomodoroForTask: (task: Task) => void;

  // Navigation state
  initialTab: string | null;
  setInitialTab: React.Dispatch<React.SetStateAction<string | null>>;

  // UI State
  showWelcomeModal: boolean;
  setShowWelcomeModal: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Loading
  isLoading: boolean;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_TIMER_STATE: TimerState = {
  isRunning: false,
  timeLeft: 25 * 60, // 25 minutos en segundos
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

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadTasks(),
        loadSessions(),
        loadConfig(),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startPomodoroForTask = (task: Task) => {
    const focusTime = config.focusTime * 60;
    const taskTime = task.duration * 60;
    const timeLeft = Math.min(taskTime, focusTime);

    const newTimerState: TimerState = {
      isRunning: true,
      timeLeft: timeLeft,
      mode: 'focus',
      totalElapsed: 0,
      startTime: Date.now(),
    };
    setTimerState(newTimerState);
    setActiveTask(task);
  };

  const updateTask = async (taskId: number, updates: Partial<Task>) => {
    try {
      await storageService.updateTask(taskId, updates);
       if (updates.status === 'completed' || updates.status === 'cancelled') {
        if (activeTask && activeTask.id === taskId) {
          setActiveTask(null);
          setTimerState(DEFAULT_TIMER_STATE);
        }
      }
      await loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      await storageService.deleteTask(taskId);
       if (activeTask && activeTask.id === taskId) {
          setActiveTask(null);
          setTimerState(DEFAULT_TIMER_STATE);
      }
      await loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  // ============================================
  // TASKS FUNCTIONS (sin cambios)
  // ============================================
  const loadTasks = async () => {
    try {
      const loadedTasks = await storageService.getTasks();
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const addTask = async (task: Task) => {
    try {
      await storageService.addTask(task);
      await loadTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  // ============================================
  // SESSIONS FUNCTIONS (sin cambios)
  // ============================================
  const loadSessions = async () => {
    try {
      const loadedSessions = await storageService.getSessions();
      setSessions(loadedSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const addSession = async (session: PomodoroSession) => {
    try {
      await storageService.addSession(session);
      setSessions(prev => [...prev, session]);
    } catch (error) {
      console.error('Error adding session:', error);
      throw error;
    }
  };

  // ============================================
  // CONFIG FUNCTIONS (sin cambios)
  // ============================================
  const loadConfig = async () => {
    try {
      const loadedConfig = await storageService.getConfig();
      setConfig(loadedConfig);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const updateConfig = async (updates: Partial<AppConfig>) => {
    try {
      const updated = await storageService.updateConfig(updates);
      setConfig(updated);
    } catch (error) {
      console.error('Error updating config:', error);
      throw error;
    }
  };

  const value: AppContextType = {
    tasks,
    setTasks,
    loadTasks,
    addTask,
    updateTask,
    deleteTask,
    sessions,
    setSessions,
    loadSessions,
    addSession,
    config,
    setConfig,
    loadConfig,
    updateConfig,
    timerState,
    setTimerState,
    activeTask,
    setActiveTask,
    startPomodoroForTask,
    initialTab,
    setInitialTab,
    showWelcomeModal,
    setShowWelcomeModal,
    isLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
