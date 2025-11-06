// services/task.service.ts
import { Task, Efficiency } from '../models/Task';
import { dateUtils } from '../utils/dateUtils';

class TaskService {
  /**
   * Verificar si una tarea está vencida
   */
  isTaskExpired(task: Task): boolean {
    if (task.status !== 'pending') return false;
    return dateUtils.isExpired(task.scheduledStart, task.duration);
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
   * Generar tareas recurrentes
   */
  generateRecurringTasks(baseTask: Task): Task[] {
    if (!baseTask.recurrence || baseTask.recurrence.type === 'none') {
      return [baseTask];
    }

    const tasks: Task[] = [];
    const recurrence = baseTask.recurrence;
    const startDate = new Date(recurrence.startDate);
    const endDate = new Date(recurrence.endDate);
    const taskTime = new Date(baseTask.scheduledStart);
    const hours = taskTime.getHours();
    const minutes = taskTime.getMinutes();

    let currentDate = new Date(startDate);
    currentDate.setHours(hours, minutes, 0, 0);

    while (currentDate <= endDate) {
      let shouldAdd = false;

      switch (recurrence.type) {
        case 'daily':
          shouldAdd = true;
          break;

        case 'weekly':
          shouldAdd = currentDate.getDay() === startDate.getDay();
          break;

        case 'monthly':
          shouldAdd = currentDate.getDate() === startDate.getDate();
          break;

        case 'weekdays':
          if (recurrence.weekdays) {
            shouldAdd = recurrence.weekdays.includes(currentDate.getDay());
          }
          break;

        case 'custom':
          if (recurrence.interval && recurrence.unit) {
            const daysDiff = Math.floor(
              (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            
            if (recurrence.unit === 'days') {
              shouldAdd = daysDiff % recurrence.interval === 0;
            } else if (recurrence.unit === 'weeks') {
              shouldAdd = daysDiff % (recurrence.interval * 7) === 0;
            } else if (recurrence.unit === 'months') {
              const monthsDiff = 
                (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
                (currentDate.getMonth() - startDate.getMonth());
              shouldAdd = 
                monthsDiff % recurrence.interval === 0 &&
                currentDate.getDate() === startDate.getDate();
            }
          }
          break;
      }

      if (shouldAdd) {
        tasks.push({
          ...baseTask,
          id: Date.now() + tasks.length + Math.floor(Math.random() * 1000),
          scheduledStart: currentDate.toISOString(),
          isRecurring: true,
          parentId: baseTask.id,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
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
   * Obtener clase de urgencia para badge
   */
  getUrgencyBadge(task: Task): { class: 'urgent' | 'soon' | 'normal' | 'expired'; text: string } {
    if (this.isTaskExpired(task)) {
      return { class: 'expired', text: 'Vencida' };
    }

    const timeUntil = dateUtils.getTimeUntil(new Date(task.scheduledStart));
    if (!timeUntil) {
      return { class: 'expired', text: 'Vencida' };
    }

    const totalMinutes = Math.floor(timeUntil.total / (1000 * 60));
    
    if (totalMinutes < 30) {
      return { class: 'urgent', text: dateUtils.formatTimeUntil(timeUntil) };
    } else if (totalMinutes < 120) {
      return { class: 'soon', text: dateUtils.formatTimeUntil(timeUntil) };
    } else {
      return { class: 'normal', text: dateUtils.formatTimeUntil(timeUntil) };
    }
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