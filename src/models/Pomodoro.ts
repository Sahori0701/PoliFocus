import { Task } from './Task';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface TimerState {
  isRunning: boolean;
  timeLeft: number;
  mode: TimerMode;
  totalElapsed: number;
  startTime: number | null;
}

export interface PomodoroSession {
  id: number;
  startTime: string;
  endTime: string;
  duration: number; // en minutos
  task: Task | null;
  wasCompleted: boolean;
}
