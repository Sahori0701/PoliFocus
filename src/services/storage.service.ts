
// src/services/storage.service.ts
import { Preferences } from '@capacitor/preferences';
import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { PomodoroSession } from '../models/Pomodoro';
import { AppConfig, DEFAULT_CONFIG } from '../models/Config';

const STORAGE_KEYS = {
  TASKS: 'polifocus_tasks',
  PROJECTS: 'polifocus_projects', // <-- AÑADIDO
  SESSIONS: 'polifocus_sessions',
  CONFIG: 'polifocus_config',
  STATISTICS: 'polifocus_statistics',
  LAST_ID: 'polifocus_last_id',
};

class StorageService {
  // ===========================================
  // HELPERS
  // ===========================================
  private async getNextId(): Promise<number> {
    const { value } = await Preferences.get({ key: STORAGE_KEYS.LAST_ID });
    const lastId = value ? parseInt(value, 10) : 0;
    const nextId = lastId + 1;
    await Preferences.set({ key: STORAGE_KEYS.LAST_ID, value: nextId.toString() });
    return nextId;
  }

  // ===========================================
  // UNIVERSAL GETTER/SETTER
  // ===========================================
  private async getItems<T>(key: string): Promise<T[]> {
    try {
      const { value } = await Preferences.get({ key });
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error(`Error getting items from ${key}:`, error);
      return [];
    }
  }

  private async saveItems<T>(key: string, items: T[]): Promise<void> {
    await Preferences.set({ key, value: JSON.stringify(items) });
  }
  
  // ===========================================
  // TASKS
  // ===========================================
  async getTasks(): Promise<Task[]> {
    return this.getItems<Task>(STORAGE_KEYS.TASKS);
  }

  async addTask(taskData: Omit<Task, 'id'>): Promise<Task> {
    const tasks = await this.getTasks();
    const newTask: Task = { ...taskData, id: await this.getNextId() };
    tasks.push(newTask);
    await this.saveItems(STORAGE_KEYS.TASKS, tasks);
    return newTask;
  }
  
  async updateTask(taskId: number, updates: Partial<Task>): Promise<Task | null> {
    const tasks = await this.getTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return null;
    tasks[index] = { ...tasks[index], ...updates };
    await this.saveItems(STORAGE_KEYS.TASKS, tasks);
    return tasks[index];
  }

  async deleteTask(taskId: number): Promise<void> {
    const tasks = await this.getTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    await this.saveItems(STORAGE_KEYS.TASKS, filtered);
  }

  // ===========================================
  // PROJECTS (¡NUEVO!)
  // ===========================================
  async getProjects(): Promise<Project[]> {
    return this.getItems<Project>(STORAGE_KEYS.PROJECTS);
  }
  
  async addProject(projectData: Omit<Project, 'id'>): Promise<Project> {
    const projects = await this.getProjects();
    const newProject: Project = { ...projectData, id: await this.getNextId() };
    projects.push(newProject);
    await this.saveItems(STORAGE_KEYS.PROJECTS, projects);
    return newProject;
  }
  
  async updateProject(projectId: number, updates: Partial<Project>): Promise<Project | null> {
    const projects = await this.getProjects();
    const index = projects.findIndex(p => p.id === projectId);
    if (index === -1) return null;
    projects[index] = { ...projects[index], ...updates };
    await this.saveItems(STORAGE_KEYS.PROJECTS, projects);
    return projects[index];
  }
  
  async deleteProject(projectId: number): Promise<void> {
    const projects = await this.getProjects();
    const filtered = projects.filter(p => p.id !== projectId);
    await this.saveItems(STORAGE_KEYS.PROJECTS, filtered);
  }

  // ===========================================
  // SESSIONS
  // ===========================================
  async getSessions(): Promise<PomodoroSession[]> {
    return this.getItems<PomodoroSession>(STORAGE_KEYS.SESSIONS);
  }

  async addSession(session: PomodoroSession): Promise<PomodoroSession> {
    const sessions = await this.getSessions();
    sessions.push(session);
    await this.saveItems(STORAGE_KEYS.SESSIONS, sessions);
    return session;
  }

  // ===========================================
  // CONFIG
  // ===========================================
  async getConfig(): Promise<AppConfig> {
    const { value } = await Preferences.get({ key: STORAGE_KEYS.CONFIG });
    return value ? { ...DEFAULT_CONFIG, ...JSON.parse(value) } : DEFAULT_CONFIG;
  }
  
  async saveConfig(config: AppConfig): Promise<void> {
    await Preferences.set({ key: STORAGE_KEYS.CONFIG, value: JSON.stringify(config) });
  }

  // ===========================================
  // DATA MANAGEMENT (¡CORREGIDO!)
  // ===========================================
  /**
   * Borra TODOS los datos de la aplicación, excepto el contador de IDs.
   */
  async clearAllData(): Promise<void> {
    try {
      await Preferences.remove({ key: STORAGE_KEYS.TASKS });
      await Preferences.remove({ key: STORAGE_KEYS.PROJECTS });
      await Preferences.remove({ key: STORAGE_KEYS.SESSIONS });
      await Preferences.remove({ key: STORAGE_KEYS.CONFIG });
      await Preferences.remove({ key: STORAGE_KEYS.STATISTICS });
      console.log('Todos los datos de la aplicación han sido borrados.');
    } catch (error) {
      console.error('Error al borrar todos los datos:', error);
      throw error;
    }
  }

  async exportData(): Promise<string> {
    const data = {
      tasks: await this.getTasks(),
      projects: await this.getProjects(),
      sessions: await this.getSessions(),
      config: await this.getConfig(),
      exportDate: new Date().toISOString(),
      version: '1.2.0',
    };
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    if (data.tasks) await this.saveItems(STORAGE_KEYS.TASKS, data.tasks);
    if (data.projects) await this.saveItems(STORAGE_KEYS.PROJECTS, data.projects);
    if (data.sessions) await this.saveItems(STORAGE_KEYS.SESSIONS, data.sessions);
    if (data.config) await this.saveConfig(data.config);

    // Actualizar el contador de ID para evitar colisiones
    const maxTaskId = data.tasks?.reduce((max: number, t: Task) => t.id > max ? t.id : max, 0) || 0;
    const maxProjectId = data.projects?.reduce((max: number, p: Project) => p.id > max ? p.id : max, 0) || 0;
    const maxId = Math.max(maxTaskId, maxProjectId);
    await Preferences.set({ key: STORAGE_KEYS.LAST_ID, value: maxId.toString() });
  }
}

export const storageService = new StorageService();
