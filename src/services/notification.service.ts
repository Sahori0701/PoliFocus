// src/services/notification.service.ts
import { LocalNotifications, Channel, PermissionStatus } from '@capacitor/local-notifications';
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
          importance: 4, // Urgente
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

  async showProgressNotification(message: string, taskTitle: string) {
    if (!this.isNative) return;

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: new Date().getTime(), // ID único para evitar sobreescritura
            title: taskTitle,
            body: message,
            schedule: { at: new Date(Date.now() + 100) }, // casi inmediato
            channelId: 'pomodoro_progress',
            sound: 'default',
          },
        ],
      });
    } catch (error) {
      console.error('Error showing progress notification:', error);
    }
  }

  async scheduleTaskNotifications(task: Task) {
    if (!this.isNative || task.status !== 'pending' || !task.scheduledStart) return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn("Cannot schedule notifications, permission not granted.");
      return;
    }

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
        console.error(`Error scheduling notifications for task ${task.id}:`, error);
      }
    }
  }

  async cancelTaskNotifications(task: Task) {
    if (!this.isNative) return;
    try {
      const pending = await LocalNotifications.getPending();
      const notificationIdsToCancel = [
        task.id * 10 + 1, 
        task.id * 10 + 2, 
      ];
      
      const notificationsToCancel = pending.notifications.filter(notif => 
        notificationIdsToCancel.includes(notif.id)
      );

      if (notificationsToCancel.length > 0) {
        await LocalNotifications.cancel({ notifications: notificationsToCancel });
      }
    } catch (error) {
      console.error(`Error cancelling notifications for task ${task.id}:`, error);
    }
  }

  async scheduleTestNotification() {
    if (!this.isNative) {
      alert("Las notificaciones solo se pueden probar en un dispositivo móvil.");
      return;
    }
    if (!(await this.requestPermissions())) {
      alert("Permiso de notificación no concedido. Ve a los ajustes de la app para habilitarlo.");
      return;
    }
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "¡PoliFocusTask dice hola! 🧪",
            body: "Si ves esto, las notificaciones funcionan perfectamente.",
            id: 1,
            schedule: { at: new Date(Date.now() + 1000 * 5), allowWhileIdle: true },
            sound: 'default',
            channelId: 'task_alerts',
          }
        ]
      });
      console.log("Notificación de prueba programada.");
    } catch (error) {
      console.error('Error al programar la notificación de prueba:', error);
    }
  }
}

export const notificationService = new NotificationService();
