
// src/services/storage.service.ts
import { Preferences } from '@capacitor/preferences';
import { Task } from '../models/Task';
import { PomodoroSession } from '../models/Pomodoro';
import { AppConfig, DEFAULT_CONFIG } from '../models/Config';

const STORAGE_KEYS = {
  TASKS: 'polifocus_tasks',
  SESSIONS: 'polifocus_sessions',
  CONFIG: 'polifocus_config',
  STATISTICS: 'polifocus_statistics',
  LAST_ID: 'polifocus_last_id', // <-- NUEVA CLAVE PARA EL CONTADOR
};

class StorageService {
  // ============================================
  // HELPERS
  // ============================================

  /**
   * Obtiene el siguiente ID disponible para un nuevo elemento.
   * Es atómico para prevenir condiciones de carrera.
   */
  private async getNextId(): Promise<number> {
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEYS.LAST_ID });
      const lastId = value ? parseInt(value, 10) : 0;
      const nextId = lastId + 1;
      await Preferences.set({
        key: STORAGE_KEYS.LAST_ID,
        value: nextId.toString(),
      });
      return nextId;
    } catch (error) {
      console.error('Error getting next ID:', error);
      // Fallback a un ID basado en tiempo si todo lo demás falla, aunque es improbable.
      return Date.now();
    }
  }

  // ============================================
  // TASKS
  // ============================================
  async getTasks(): Promise<Task[]> {
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEYS.TASKS });
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await Preferences.set({
        key: STORAGE_KEYS.TASKS,
        value: JSON.stringify(tasks),
      });
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  }

  /**
   * Añade una nueva tarea, asignándole un ID secuencial único.
   * La `taskData` de entrada no debe contener un `id`.
   */
  async addTask(taskData: Omit<Task, 'id'>): Promise<Task> {
    try {
      const tasks = await this.getTasks();
      const newId = await this.getNextId();
      
      const newTask: Task = {
        ...taskData,
        id: newId, // Asignamos el nuevo ID secuencial
      };

      tasks.push(newTask);
      await this.saveTasks(tasks);
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }

  async updateTask(taskId: number, updates: Partial<Task>): Promise<Task | null> {
    try {
      const tasks = await this.getTasks();
      const index = tasks.findIndex(t => t.id === taskId);
      
      if (index === -1) return null;
      
      tasks[index] = { ...tasks[index], ...updates };
      await this.saveTasks(tasks);
      return tasks[index];
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(taskId: number): Promise<boolean> {
    try {
      const tasks = await this.getTasks();
      const filtered = tasks.filter(t => t.id !== taskId);
      await this.saveTasks(filtered);
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  async getTaskById(taskId: number): Promise<Task | null> {
    try {
      const tasks = await this.getTasks();
      return tasks.find(t => t.id === taskId) || null;
    } catch (error) {
      console.error('Error getting task by id:', error);
      return null;
    }
  }

  // ============================================
  // POMODORO SESSIONS (sin cambios)
  // ============================================
  async getSessions(): Promise<PomodoroSession[]> {
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEYS.SESSIONS });
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting sessions:', error);
      return [];
    }
  }

  async saveSessions(sessions: PomodoroSession[]): Promise<void> {
    try {
      await Preferences.set({
        key: STORAGE_KEYS.SESSIONS,
        value: JSON.stringify(sessions),
      });
    } catch (error) {
      console.error('Error saving sessions:', error);
      throw error;
    }
  }

  async addSession(session: PomodoroSession): Promise<PomodoroSession> {
    try {
      const sessions = await this.getSessions();
      // Asumiendo que las sesiones también podrían beneficiarse de IDs únicos en el futuro
      // pero por ahora mantenemos la estructura que traen.
      sessions.push(session);
      await this.saveSessions(sessions);
      return session;
    } catch (error) {
      console.error('Error adding session:', error);
      throw error;
    }
  }

  // ============================================
  // CONFIGURATION (sin cambios)
  // ============================================
  async getConfig(): Promise<AppConfig> {
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEYS.CONFIG });
      return value ? JSON.parse(value) : DEFAULT_CONFIG;
    } catch (error) {
      console.error('Error getting config:', error);
      return DEFAULT_CONFIG;
    }
  }

  async saveConfig(config: AppConfig): Promise<void> {
    try {
      await Preferences.set({
        key: STORAGE_KEYS.CONFIG,
        value: JSON.stringify(config),
      });
    } catch (error) {
      console.error('Error saving config:', error);
      throw error;
    }
  }

  async updateConfig(updates: Partial<AppConfig>): Promise<AppConfig> {
    try {
      const config = await this.getConfig();
      const updated = { ...config, ...updates };
      await this.saveConfig(updated);
      return updated;
    } catch (error) {
      console.error('Error updating config:', error);
      throw error;
    }
  }

  // ============================================
  // UTILITIES
  // ============================================
  async clearAll(): Promise<void> {
    try {
      // No borramos LAST_ID para que la secuencia continúe
      await Preferences.remove({ key: STORAGE_KEYS.TASKS });
      await Preferences.remove({ key: STORAGE_KEYS.SESSIONS });
      await Preferences.remove({ key: STORAGE_KEYS.STATISTICS });
      console.log('App data cleared (ID counter preserved)');
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  async exportData(): Promise<string> {
    try {
      const tasks = await this.getTasks();
      const sessions = await this.getSessions();
      const config = await this.getConfig();
      
      const data = {
        tasks,
        sessions,
        config,
        exportDate: new Date().toISOString(),
        version: '1.1.0', // Versión con IDs secuenciales
      };
      
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  async importData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      
      // Al importar, podríamos necesitar re-evaluar los IDs para evitar colisiones.
      // Por ahora, confiamos en los datos importados.
      if (data.tasks) {
        await this.saveTasks(data.tasks);
        // Opcional: Actualizar el contador LAST_ID al ID más alto de las tareas importadas
        const maxId = data.tasks.reduce((max: number, t: Task) => t.id > max ? t.id : max, 0);
        await Preferences.set({ key: STORAGE_KEYS.LAST_ID, value: maxId.toString() });
      }
      if (data.sessions) await this.saveSessions(data.sessions);
      if (data.config) await this.saveConfig(data.config);
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

// Exportar instancia singleton
export const storageService = new StorageService();
