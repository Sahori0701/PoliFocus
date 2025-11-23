// utils/taskUtils.ts
import { Task, Priority, TaskStatus } from '../models/Task';

export const taskUtils = {
  /**
   * Obtener nombre legible de prioridad
   */
  getPriorityLabel(priority: Priority): string {
    const labels = { low: 'Baja', medium: 'Media', high: 'Alta' };
    return labels[priority];
  },

  /**
   * Obtener nombre legible de estado
   */
  getStatusLabel(status: TaskStatus): string {
    const labels = {
      pending: 'Pendiente',
      in_progress: 'En Progreso',
      completed: 'Completada',
      cancelled: 'Cancelada',
    };
    return labels[status];
  },

  /**
   * Obtener emoji de prioridad
   */
  getPriorityEmoji(priority: Priority): string {
    const emojis = { low: '🔵', medium: '🟡', high: '🔴' };
    return emojis[priority];
  },

  /**
   * Obtener emoji de estado
   */
  getStatusEmoji(status: TaskStatus): string {
    const emojis = {
      pending: '⏳',
      in_progress: '▶️',
      completed: '✅',
      cancelled: '❌',
    };
    return emojis[status];
  },

  /**
   * Crear ID único para tarea
   */
  generateTaskId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  },

  /**
   * Formatear resumen de tarea
   */
  getTaskSummary(task: Task): string {
    const date = new Date(task.scheduledStart);
    const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `${task.title} - ${dateStr} ${timeStr} (${task.duration} min)`;
  },

  /**
   * Obtener días de la semana en español
   */
  getWeekdayName(dayIndex: number): string {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[dayIndex];
  },

  /**
   * Obtener descripción de recurrencia
   */
  getRecurrenceDescription(task: Task): string {
    if (!task.recurrence || task.recurrence.type === 'none') {
      return 'Sin repetición';
    }

    const rec = task.recurrence;
    
    switch (rec.type) {
      case 'daily':
        return 'Diaria';
      case 'weekly':
        return 'Semanal';
      case 'monthly':
        return 'Mensual';
      case 'weekdays':
        if (rec.weekdays && rec.weekdays.length > 0) {
          const days = rec.weekdays.map(d => this.getWeekdayName(d)).join(', ');
          return `Días: ${days}`;
        }
        return 'Días específicos';
      case 'custom':
        if (rec.interval && rec.unit) {
          const unitNames: Record<string, string> = { 
            minutes: 'minutos',
            days: 'días',
            weeks: 'semanas',
            months: 'meses'
          };
          return `Cada ${rec.interval} ${unitNames[rec.unit]}`;
        }
        return 'Personalizada';
      default:
        return 'Sin repetición';
    }
  },

  /**
   * Agrupar tareas por fecha
   */
  groupTasksByDate(tasks: Task[]): Record<string, Task[]> {
    const grouped: Record<string, Task[]> = {};

    tasks.forEach(task => {
      const date = new Date(task.scheduledStart);
      const dateKey = date.toISOString().split('T')[0];

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(task);
    });

    return grouped;
  },

  /**
   * Obtener estadísticas de tareas
   */
  getTaskStatistics(tasks: Task[]): {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
    expired: number;
  } {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length,
      expired: tasks.filter(t => {
        if (t.status !== 'pending') return false;
        const end = new Date(new Date(t.scheduledStart).getTime() + t.duration * 60000);
        return new Date() > end;
      }).length,
    };
  },
};