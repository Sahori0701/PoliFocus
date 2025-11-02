// services/storage.service.ts
import { Preferences } from '@capacitor/preferences';
import { Task } from '../models/Task';
import { PomodoroSession } from '../models/Pomodoro';
import { AppConfig, DEFAULT_CONFIG } from '../models/Config';

const STORAGE_KEYS = {
  TASKS: 'polifocus_tasks',
  SESSIONS: 'polifocus_sessions',
  CONFIG: 'polifocus_config',
  STATISTICS: 'polifocus_statistics',
};

class StorageService {
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

  async addTask(task: Task): Promise<Task> {
    try {
      const tasks = await this.getTasks();
      tasks.push(task);
      await this.saveTasks(tasks);
      return task;
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
  // POMODORO SESSIONS
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
      sessions.push(session);
      await this.saveSessions(sessions);
      return session;
    } catch (error) {
      console.error('Error adding session:', error);
      throw error;
    }
  }

  async updateSession(sessionId: number, updates: Partial<PomodoroSession>): Promise<PomodoroSession | null> {
    try {
      const sessions = await this.getSessions();
      const index = sessions.findIndex(s => s.id === sessionId);
      
      if (index === -1) return null;
      
      sessions[index] = { ...sessions[index], ...updates };
      await this.saveSessions(sessions);
      return sessions[index];
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  }

  // ============================================
  // CONFIGURATION
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
      await Preferences.clear();
      console.log('All data cleared');
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
        version: '1.0.0',
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
      
      if (data.tasks) await this.saveTasks(data.tasks);
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