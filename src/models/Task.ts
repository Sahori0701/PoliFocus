// models/Task.ts

export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'weekdays' | 'custom';
export type TimeUnit = 'days' | 'weeks' | 'months';

export interface Recurrence {
  type: RecurrenceType;
  interval?: number;
  unit?: TimeUnit;
  weekdays?: number[]; // 0-6 (Domingo-Sábado)
  startDate: string; // ISO string
  endDate: string; // ISO string
}

export interface Task {
  id: number;
  title: string;
  scheduledStart: string; // ISO string
  duration: number; // minutos
  priority: Priority;
  status: TaskStatus;
  createdAt: string; // ISO string
  completedAt?: string; // ISO string
  actualDuration?: number; // minutos reales
  recurrence?: Recurrence;
  isRecurring: boolean;
  parentId?: number; // Para tareas recurrentes
  alert15?: boolean; // Alerta de 15 min enviada
  alert5?: boolean; // Alerta de 5 min enviada
}

export interface TaskFormData {
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number;
  priority: Priority;
  recurrence: RecurrenceType;
  recurrenceInterval?: number;
  recurrenceUnit?: TimeUnit;
  recurrenceWeekdays?: number[];
  recurrenceStart?: string;
  recurrenceEnd?: string;
}

export interface Efficiency {
  badge: 'excellent' | 'good' | 'warning' | 'poor';
  icon: string;
  difference: number; // minutos
  percentage: string;
}