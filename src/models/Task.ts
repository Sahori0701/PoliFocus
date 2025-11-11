// models/Task.ts

// Estado de la tarea: pendiente, en progreso, completada o cancelada
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Prioridad de la tarea
export type Priority = 'low' | 'medium' | 'high';

// Tipo de recurrencia
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'weekdays' | 'custom';

// Unidad de tiempo para la recurrencia personalizada
export type TimeUnit = 'days' | 'weeks' | 'months';

// Interfaz para la configuración de recurrencia
export interface Recurrence {
  type: RecurrenceType;
  startDate: string;      // Fecha de inicio de la recurrencia
  endDate: string;        // Fecha de fin de la recurrencia
  interval?: number;
  unit?: TimeUnit;
  weekdays?: number[];   // 0 (Dom) a 6 (Sáb)
}

// Interfaz para medir la eficiencia de una tarea completada
export type Efficiency = {
  level: 'excellent' | 'good' | 'average' | 'poor';
  percentage: number;
};

// Interfaz principal para la Tarea
export interface Task {
  id: number;
  title: string;
  description?: string;     // Descripción es opcional
  status: TaskStatus;
  priority: Priority;
  scheduledStart: string;   // Fecha y hora en formato ISO
  duration: number;         // Duración planificada en minutos
  actualDuration?: number;  // Duración real en minutos, opcional
  isRecurring: boolean;
  recurrence?: Recurrence;  // Recurrencia es opcional
  tags?: string[];
  subtasks?: Partial<Task>[];
  dependencies?: number[];
  assignedTo?: string;
  createdAt: string;
  updatedAt?: string;       // Fecha de actualización es opcional
  completedAt?: string;     // Fecha de finalización es opcional
}
