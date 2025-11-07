// models/Task.ts

// Estado de la tarea: pendiente, en progreso, completada o cancelada
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Prioridad de la tarea
export type Priority = 'low' | 'medium' | 'high';

// Tipo de recurrencia
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'weekdays' | 'custom';

// Unidad de recurrencia para el tipo 'custom'
export type RecurrenceUnit = 'days' | 'weeks' | 'months';

// Interfaz para la configuración de recurrencia
export interface Recurrence {
  type: RecurrenceType;
  interval?: number;
  unit?: RecurrenceUnit;
  weekdays?: number[]; // 0 (Dom) a 6 (Sáb)
}

// Interfaz principal para la Tarea
export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  scheduledStart: string; // Fecha y hora en formato ISO
  duration: number; // Duración en minutos
  recurrence: Recurrence;
  tags?: string[];
  subtasks?: Partial<Task>[];
  dependencies?: number[];
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}
