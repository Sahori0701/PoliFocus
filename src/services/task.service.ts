// services/task.service.ts
import { Task, Efficiency } from '../models/Task';
import { dateUtils } from '../utils/dateUtils';

// Definimos el período de gracia en minutos.
const EXPIRATION_GRACE_PERIOD_MINUTES = 5;

class TaskService {
  /**
   * Verificar si una tarea está vencida.
   * Una tarea se considera vencida si han pasado N minutos (período de gracia)
   * desde su hora de inicio programada y no ha sido completada.
   */
  isTaskExpired(task: Task): boolean {
    // Las tareas completadas no pueden vencer.
    if (task.status === 'completed') {
      return false;
    }
    
    // Solo las tareas pendientes pueden vencer.
    if (task.status !== 'pending') {
      return false;
    }

    const now = new Date();
    const startTime = new Date(task.scheduledStart);
    
    // La tarea vence después de que el período de gracia haya pasado desde la hora de inicio.
    const expiryTime = dateUtils.addMinutes(startTime, EXPIRATION_GRACE_PERIOD_MINUTES);

    // La tarea está vencida si la hora actual ha superado la hora de expiración.
    return now > expiryTime;
  }

  /**
   * Obtener clase y texto de urgencia para el badge de la tarea.
   * Contempla el nuevo "período de gracia".
   */
  getUrgencyBadge(task: Task): { class: 'completed' | 'urgent' | 'soon' | 'normal' | 'expired'; text: string } {
    // 1. Prioridad máxima: Tarea completada.
    if (task.status === 'completed') {
      return { class: 'completed', text: 'Completada' };
    }

    // 2. Comprobar si está oficialmente vencida (después del período de gracia).
    if (this.isTaskExpired(task)) {
      return { class: 'expired', text: 'Vencida' };
    }

    const now = new Date();
    const startTime = new Date(task.scheduledStart);

    // 3. Comprobar si está en el período de gracia (hora de inicio pasada, pero aún no vencida).
    if (now > startTime) {
      return { class: 'urgent', text: '¡Inicia ya!' };
    }

    // 4. Si no, la tarea es futura. Calcular tiempo restante.
    const timeUntil = dateUtils.getTimeUntil(startTime);

    // Fallback por si el cálculo de tiempo falla.
    if (!timeUntil) {
      return { class: 'normal', text: 'Próximamente' };
    }

    const totalMinutes = Math.floor(timeUntil.total / (1000 * 60));
    
    // 5. Clasificar según el tiempo restante hasta el inicio.
    if (totalMinutes < 30) {
      return { class: 'urgent', text: dateUtils.formatTimeUntil(timeUntil) };
    } else if (totalMinutes < 120) {
      return { class: 'soon', text: dateUtils.formatTimeUntil(timeUntil) };
    } else {
      return { class: 'normal', text: dateUtils.formatTimeUntil(timeUntil) };
    }
  }
  
  /**
   * Verificar conflictos de horarios entre tareas
   */
  checkConflicts(newTask: Task, existingTasks: Task[]): Task[] {
    const newStart = new Date(newTask.scheduledStart);
    const newEnd = dateUtils.addMinutes(newStart, newTask.duration);

    return existingTasks.filter(task => {
      if (task.status !== 'pending') return false;
      if (task.id === newTask.id) return false;

      const taskStart = new Date(task.scheduledStart);
      const taskEnd = dateUtils.addMinutes(taskStart, task.duration);

      return dateUtils.doTimeRangesOverlap(newStart, newEnd, taskStart, taskEnd);
    });
  }

  /**
   * Generar tareas recurrentes con soporte para minutos, horas, días, etc.
   */
  generateRecurringTasks(baseTask: Task): Task[] {
    if (!baseTask.isRecurring || !baseTask.recurrence || baseTask.recurrence.type === 'none') {
      return [baseTask];
    }

    const tasks: Task[] = [];
    const { recurrence } = baseTask;
    const endDate = new Date(recurrence.endDate);
    let currentDate = new Date(baseTask.scheduledStart);

    const isCustom = recurrence.type === 'custom';
    const isDaily = recurrence.type === 'daily';
    const isWeekly = recurrence.type === 'weekly';
    const isMonthly = recurrence.type === 'monthly';

    let loopCount = 0; // Safety break para evitar bucles infinitos
    while (currentDate <= endDate && loopCount < 1000) {
      loopCount++;

      if (recurrence.type === 'weekdays') {
        if (recurrence.weekdays && recurrence.weekdays.includes(currentDate.getDay())) {
          tasks.push({
            ...baseTask,
            id: Date.now() + tasks.length + Math.floor(Math.random() * 1000),
            scheduledStart: currentDate.toISOString(),
            parentId: baseTask.id,
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }
      
      tasks.push({
        ...baseTask,
        id: Date.now() + tasks.length + Math.floor(Math.random() * 1000),
        scheduledStart: currentDate.toISOString(),
        parentId: baseTask.id,
      });

      if (isDaily) {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (isWeekly) {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (isMonthly) {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if (isCustom && recurrence.interval && recurrence.unit) {
        switch (recurrence.unit) {
          case 'minutes':
            currentDate.setMinutes(currentDate.getMinutes() + recurrence.interval);
            break;
          case 'hours':
            currentDate.setHours(currentDate.getHours() + recurrence.interval);
            break;
          case 'days':
            currentDate.setDate(currentDate.getDate() + recurrence.interval);
            break;
          case 'weeks':
            currentDate.setDate(currentDate.getDate() + (recurrence.interval * 7));
            break;
          case 'months':
            currentDate.setMonth(currentDate.getMonth() + recurrence.interval);
            break;
        }
      } else {
        break;
      }
    }

    if (tasks.length === 0) {
      return [baseTask];
    }
    
    return tasks;
  }

  /**
   * Calcular eficiencia temporal
   */
  calculateEfficiency(plannedMinutes: number, actualMinutes: number): Efficiency {
    const difference = actualMinutes - plannedMinutes;
    let badge: Efficiency['badge'];
    let icon: string;

    if (difference <= 0) {
      badge = 'excellent';
      icon = '⚡';
    } else if (difference <= plannedMinutes * 0.1) {
      badge = 'good';
      icon = '✓';
    } else if (difference <= plannedMinutes * 0.25) {
      badge = 'warning';
      icon = '⚠';
    } else {
      badge = 'poor';
      icon = '⏱';
    }

    return {
      badge,
      icon,
      difference,
      percentage: ((difference / plannedMinutes) * 100).toFixed(1),
    };
  }

  /**
   * Filtrar tareas por estado
   */
  filterTasksByStatus(tasks: Task[], status: 'active' | 'expired' | 'completed'): Task[] {
    switch (status) {
      case 'active':
        return tasks.filter(t => t.status === 'pending' && !this.isTaskExpired(t));
      case 'expired':
        return tasks.filter(t => t.status === 'pending' && this.isTaskExpired(t));
      case 'completed':
        return tasks.filter(t => t.status === 'completed');
      default:
        return tasks;
    }
  }

  /**
   * Buscar tareas por término
   */
  searchTasks(tasks: Task[], searchTerm: string): Task[] {
    if (!searchTerm.trim()) return tasks;
    const term = searchTerm.toLowerCase();
    return tasks.filter(task => task.title.toLowerCase().includes(term));
  }

  /**
   * Ordenar tareas
   */
  sortTasks(tasks: Task[], by: 'date' | 'priority' | 'duration', order: 'asc' | 'desc' = 'asc'): Task[] {
    const sorted = [...tasks].sort((a, b) => {
      let comparison = 0;

      switch (by) {
        case 'date':
          comparison = new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime();
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
      }

      return order === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  /**
   * Obtener color de prioridad
   */
  getPriorityColor(priority: Task['priority']): string {
    const colors = {
      low: '#3b82f6',
      medium: '#f59e0b',
      high: '#ef4444',
    };
    return colors[priority];
  }

  /**
   * Calcular ciclos Pomodoro necesarios
   */
  calculatePomodoroCycles(durationMinutes: number, pomodoroLength: number = 25): number {
    return Math.ceil(durationMinutes / pomodoroLength);
  }

  /**
   * Validar datos de tarea
   */
  validateTask(task: Partial<Task>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!task.title || task.title.trim().length === 0) {
      errors.push('El título es obligatorio');
    }

    if (!task.scheduledStart) {
      errors.push('La fecha y hora son obligatorias');
    }

    if (!task.duration || task.duration < 5) {
      errors.push('La duración debe ser al menos 5 minutos');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const taskService = new TaskService();
