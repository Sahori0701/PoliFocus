
import { Task, TaskStatus } from '../models/Task';

/**
 * Obtiene el texto descriptivo para una prioridad de tarea.
 */
export const getPriorityText = (priority: 'low' | 'medium' | 'high'): string => {
  const labels = { low: 'Baja', medium: 'Media', high: 'Alta' };
  return labels[priority];
};

/**
 * Obtiene el texto descriptivo para un estado de tarea.
 */
export const getStatusText = (status: TaskStatus | 'overdue'): string => {
  const labels = {
    pending: 'Pendiente',
    in_progress: 'En Progreso',
    completed: 'Completada',
    cancelled: 'Cancelada',
    overdue: 'Vencida',
  };
  return labels[status];
};

/**
 * Determina si una tarea está vencida.
 */
const isTaskOverdue = (task: Task): boolean => {
  const now = new Date();
  const endDate = new Date(new Date(task.scheduledStart).getTime() + task.duration * 60000);
  return task.status !== 'completed' && now > endDate;
};

/**
 * Calcula el número total de ocurrencias para una tarea recurrente.
 */
const calculateTotalOccurrences = (task: Task): number => {
  if (!task.isRecurring || !task.recurrence) return 1;

  const { type, startDate, endDate } = task.recurrence;
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (start > end) return 0;

  let total = 0;
  let currentDate = new Date(start);

  switch (type) {
    case 'daily':
      const diffTime = Math.abs(end.getTime() - start.getTime());
      total = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      break;
    case 'weekly':
      while (currentDate <= end) {
        total++;
        currentDate.setDate(currentDate.getDate() + 7);
      }
      break;
    case 'monthly':
      while (currentDate <= end) {
        total++;
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      break;
    case 'weekdays':
      while (currentDate <= end) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek >= 1 && dayOfWeek <= 5) total++; // Lunes a Viernes
        currentDate.setDate(currentDate.getDate() + 1);
      }
      break;
    default:
      total = 1;
      break;
  }
  return total > 0 ? total : 1;
};

/**
 * Calcula el resumen de estado de las tareas recurrentes.
 */
export const getRecurrenceSummary = (tasks: Task[], parentId: number): { active: number; overdue: number; completed: number; total: number } => {
  const parentTask = tasks.find(t => t.id === parentId);
  const relatedTasks = tasks.filter(t => t.id === parentId || t.parentId === parentId);

  const total = parentTask ? calculateTotalOccurrences(parentTask) : relatedTasks.length;

  const summary = relatedTasks.reduce(
    (acc, task) => {
      if (task.status === 'completed') acc.completed++;
      else if (isTaskOverdue(task)) acc.overdue++;
      else if (task.status === 'pending' || task.status === 'in_progress') acc.active++;
      return acc;
    },
    { active: 0, overdue: 0, completed: 0 }
  );

  return { ...summary, total };
};

/**
 * Genera un ID único para una nueva tarea.
 */
export const generateTaskId = (): number => {
  return Date.now();
};
