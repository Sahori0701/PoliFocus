// src/services/notification.service.ts
import { LocalNotifications, Channel, PermissionStatus, CancelOptions } from '@capacitor/local-notifications';
import { isPlatform } from '@ionic/react';
import { Task } from '../models/Task';

class NotificationService {
  private isNative = isPlatform('hybrid');

  async init() {
    if (!this.isNative) return;
    await this.requestPermissions();
    if (isPlatform('android')) {
      await this.createNotificationChannels();
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (!this.isNative) return false;
    try {
      const result: PermissionStatus = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async createNotificationChannels() {
    if (!isPlatform('android')) return;
    try {
      const channels: Channel[] = [
        {
          id: 'task_alerts',
          name: 'Alertas de Tareas',
          description: 'Notificaciones para tareas programadas.',
          importance: 5, // Máxima importancia
          visibility: 1, // Público
          sound: 'default',
          vibration: true,
        },
        {
          id: 'pomodoro_progress',
          name: 'Progreso del Pomodoro',
          description: 'Notificaciones durante los ciclos de Pomodoro.',
          importance: 3, // Alta
          visibility: 1, // Público
          sound: 'default',
          vibration: false,
        },
      ];
      await LocalNotifications.createChannel(channels[0]);
      await LocalNotifications.createChannel(channels[1]);
    } catch (error) {
      console.error('Error creating notification channels:', error);
    }
  }

  // NUEVO: Método para cancelar TODAS las notificaciones pendientes
  async cancelAll() {
    if (!this.isNative) return;
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        console.log(`Cancelling ${pending.notifications.length} pending notifications.`);
        await LocalNotifications.cancel(pending as CancelOptions);
      }
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  private async scheduleNotificationsForTask_INTERNAL(task: Task) {
    const now = Date.now();
    const startTime = new Date(task.scheduledStart).getTime();
    const notifications = [];

    const fifteenMinBefore = startTime - 15 * 60 * 1000;
    if (fifteenMinBefore > now) {
      notifications.push({
        id: task.id * 10 + 1,
        title: `¡Tu tarea va a empezar! (${task.title})`,
        body: `Faltan 15 minutos para que comience tu tarea. ¡Prepárate!`,
        schedule: { at: new Date(fifteenMinBefore), allowWhileIdle: true },
        channelId: 'task_alerts',
        sound: 'default',
      });
    }

    const fiveMinBefore = startTime - 5 * 60 * 1000;
    if (fiveMinBefore > now) {
      notifications.push({
        id: task.id * 10 + 2,
        title: `¡Tu tarea casi empieza! (${task.title})`,
        body: `¡Solo 5 minutos para que comience tu tarea!`,
        schedule: { at: new Date(fiveMinBefore), allowWhileIdle: true },
        channelId: 'task_alerts',
        sound: 'default',
      });
    }

    if (notifications.length > 0) {
      try {
        await LocalNotifications.schedule({ notifications });
      } catch (error) {
        console.error(`Error scheduling internal notifications for task ${task.id}:`, error);
      }
    }
  }

  async scheduleTaskNotifications(task: Task) {
    if (!this.isNative || task.status !== 'pending' || !task.scheduledStart) return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    // Primero, cancelamos cualquier notificación antigua para esta tarea específica
    await this.cancelTaskNotifications(task, true);
    // Luego, agendamos las nuevas
    await this.scheduleNotificationsForTask_INTERNAL(task);
  }

  // MODIFICADO: Lógica de "Tierra Arrasada"
  async rescheduleAll(tasks: Task[]) {
    if (!this.isNative) return;
    console.log('AUDIT: Starting notification reschedule process...');
    
    // 1. Limpieza Total
    await this.cancelAll();

    // 2. Reconstrucción
    console.log(`AUDIT: Re-scheduling notifications for ${tasks.length} tasks.`);
    for (const task of tasks) {
      if (task.status === 'pending') {
        await this.scheduleNotificationsForTask_INTERNAL(task);
      }
    }
    console.log('AUDIT: Notification reschedule complete.');
  }

  async cancelTaskNotifications(task: Task, silent = false) {
    if (!this.isNative) return;
    try {
      const notificationIdsToCancel = [
        task.id * 10 + 1, 
        task.id * 10 + 2, 
      ];
      const pending = await LocalNotifications.getPending();
      const notificationsToCancel = pending.notifications.filter(notif => 
        notificationIdsToCancel.includes(notif.id)
      );
      if (notificationsToCancel.length > 0) {
        await LocalNotifications.cancel({ notifications: notificationsToCancel });
      }
    } catch (error) {
      if (!silent) {
        console.error(`Error cancelling notifications for task ${task.id}:`, error);
      }
    }
  }
  
  async showProgressNotification(message: string, taskTitle: string) { 
    // ... (código sin cambios)
  }
  async scheduleTestNotification() { 
    // ... (código sin cambios)
  }
}

export const notificationService = new NotificationService();
