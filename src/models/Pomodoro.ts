// models/Pomodoro.ts

export type SessionType = 'focus' | 'shortBreak' | 'longBreak';

export interface PomodoroSession {
  id: number;
  taskId: number;
  startTime: string; // ISO string
  endTime?: string; // ISO string
  type: SessionType;
  completed: boolean;
  interrupted: boolean;
  cycleNumber: number;
}

export interface TimerState {
  isRunning: boolean;
  timeLeft: number; // segundos
  mode: SessionType;
  totalElapsed: number; // segundos
  startTime: string | null; // ISO string
}

export interface PomodoroConfig {
  focusTime: number; // minutos
  shortBreak: number; // minutos
  longBreak: number; // minutos
  alertTimes: number[]; // minutos antes de alertar [15, 5]
  longBreakInterval: number; // cada cuántos ciclos
}