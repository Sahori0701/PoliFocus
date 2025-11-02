// utils/dateUtils.ts

interface TimeUntil {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export const dateUtils = {
  // Formatear fecha a ISO string
  toISOString(date: Date): string {
    return date.toISOString();
  },

  // Crear fecha desde string
  fromISOString(iso: string): Date {
    return new Date(iso);
  },

  // Obtener fecha de hoy a las 00:00:00
  getTodayStart(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  },

  // Obtener fecha de hoy a las 23:59:59
  getTodayEnd(): Date {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return today;
  },

  // Formatear fecha para input type="date" (YYYY-MM-DD)
  toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // Formatear hora para input type="time" (HH:mm)
  toTimeInputValue(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // Combinar fecha y hora en un Date
  combineDateAndTime(dateStr: string, timeStr: string): Date {
    return new Date(`${dateStr}T${timeStr}`);
  },

  // Obtener tiempo hasta una fecha
  getTimeUntil(targetDate: Date): TimeUntil | null {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();
    
    if (diff < 0) return null;
    
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      total: diff,
    };
  },

  // Formatear tiempo restante
  formatTimeUntil(timeObj: TimeUntil | null): string {
    if (!timeObj) return 'Vencida';
    
    const parts: string[] = [];
    if (timeObj.days > 0) parts.push(`${timeObj.days}d`);
    if (timeObj.hours > 0) parts.push(`${timeObj.hours}h`);
    if (timeObj.minutes > 0 || parts.length === 0) parts.push(`${timeObj.minutes}m`);
    
    return parts.join(' ');
  },

  // Verificar si una tarea está vencida
  isExpired(scheduledStart: string, duration: number): boolean {
    const start = new Date(scheduledStart);
    const end = new Date(start.getTime() + duration * 60000);
    return new Date() > end;
  },

  // Obtener clase de urgencia
  getUrgencyClass(timeObj: TimeUntil | null): 'urgent' | 'soon' | 'normal' {
    if (!timeObj) return 'urgent';
    const totalMinutes = Math.floor(timeObj.total / (1000 * 60));
    if (totalMinutes < 30) return 'urgent';
    if (totalMinutes < 120) return 'soon';
    return 'normal';
  },

  // Formatear duración en minutos a string legible
  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  },

  // Agregar minutos a una fecha
  addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
  },

  // Verificar si dos rangos de tiempo se solapan
  doTimeRangesOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
  ): boolean {
    return start1 < end2 && end1 > start2;
  },

  // Formatear fecha en español
  formatDateES(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  // Formatear hora en español
  formatTimeES(date: Date): string {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  // Formatear fecha corta
  formatDateShort(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    });
  },
};
