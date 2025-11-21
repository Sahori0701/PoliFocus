
// contexts/AppContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isPlatform } from '@ionic/react';
import { Task } from '../models/Task';
import { PomodoroSession, TimerState } from '../models/Pomodoro';
import { AppConfig, DEFAULT_CONFIG } from '../models/Config';
import { storageService } from '../services/storage.service';
import { notificationService } from '../services/notification.service';

// ... (interface and other setup remains the same)

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
      // On native platforms, handle notification permissions and channel creation
      if (isPlatform('hybrid')) {
        if (!(await notificationService.hasPermission())) {
          await notificationService.requestPermissions();
        }
        if (isPlatform('android')) {
          await notificationService.createNotificationChannel();
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startPomodoroForTask = (task: Task) => {
    if (activeTask && activeTask.id === task.id) {
      return;
    }

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

  const addTask = async (task: Task) => {
    try {
      const newTask = await storageService.addTask(task);
      // The notification service is now smart enough to only run on native
      await notificationService.scheduleTaskNotifications(newTask);
      await loadTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const updateTask = async (taskId: number, updates: Partial<Task>) => {
    try {
      const originalTask = tasks.find(t => t.id === taskId);
      if (originalTask) {
        // Cancel old notifications before updating
        await notificationService.cancelTaskNotifications(originalTask);
      }

      const updatedTask = await storageService.updateTask(taskId, updates);
      
      // Schedule new notifications for the updated task
      if (updatedTask) {
        await notificationService.scheduleTaskNotifications(updatedTask);
      }

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
      const taskToDelete = tasks.find(t => t.id === taskId);
      if (taskToDelete) {
        // Cancel notifications for the deleted task
        await notificationService.cancelTaskNotifications(taskToDelete);
      }

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

  const loadTasks = async () => {
    try {
      const loadedTasks = await storageService.getTasks();
      const migratedTasks = loadedTasks.map((task: any) => {
        if (task && task.startDate && !task.scheduledStart) {
          const { startDate, ...rest } = task;
          return { ...rest, scheduledStart: startDate };
        }
        return task;
      });
      setTasks(migratedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

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
