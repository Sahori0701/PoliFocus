// models/Config.ts

export interface AppConfig {
  focusTime: number; // minutos (default: 25)
  shortBreak: number; // minutos (default: 5)
  longBreak: number; // minutos (default: 15)
  alertTimes: number[]; // minutos antes de alertar (default: [15, 5])
  longBreakInterval: number; // ciclos antes de descanso largo (default: 4)
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export const DEFAULT_CONFIG: AppConfig = {
  focusTime: 15,
  shortBreak: 5,
  longBreak: 15,
  alertTimes: [15, 5],
  longBreakInterval: 4,
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
};

export interface DailyStatistics {
  id: number;
  date: string; // ISO string (solo fecha)
  completedTasks: number;
  totalFocusTime: number; // minutos
  averageEfficiency: number; // porcentaje
}