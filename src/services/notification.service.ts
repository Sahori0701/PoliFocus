// src/services/notification.service.ts
import { LocalNotifications, Channel, PermissionStatus, CancelOptions } from '@capacitor/local-notifications';
import { isPlatform } from '@ionic/react';
import { Task } from '../models/Task';

class NotificationService {
  private isNative = isPlatform('hybrid');
  private TIMER_NOTIFICATION_ID = 999999;

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
          importance: 5,
          visibility: 1,
          sound: 'default',
          vibration: true,
        },
        {
          id: 'pomodoro_timer',
          name: 'Temporizador Pomodoro',
          description: 'Notificaciones persistentes del temporizador.',
          importance: 4,
          visibility: 1,
          sound: 'default',
          vibration: false,
        },
        {
          id: 'pomodoro_progress',
          name: 'Progreso del Pomodoro',
          description: 'Notificaciones durante los ciclos de Pomodoro.',
          importance: 3,
          visibility: 1,
          sound: 'default',
          vibration: false,
        },
      ];
      
      for (const channel of channels) {
        await LocalNotifications.createChannel(channel);
      }
    } catch (error) {
      console.error('Error creating notification channels:', error);
    }
  }

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

    // Notificación 15 minutos antes
    const fifteenMinBefore = startTime - 15 * 60 * 1000;
    if (fifteenMinBefore > now) {
      notifications.push({
        id: task.id * 10 + 1,
        title: `📌 Tarea próxima: ${task.title}`,
        body: `Faltan 15 minutos para que comience tu tarea. ¡Prepárate!`,
        schedule: { at: new Date(fifteenMinBefore), allowWhileIdle: true },
        channelId: 'task_alerts',
        sound: 'default',
        smallIcon: 'ic_stat_name',
        ongoing: false,
      });
    }

    // Notificación 5 minutos antes
    const fiveMinBefore = startTime - 5 * 60 * 1000;
    if (fiveMinBefore > now) {
      notifications.push({
        id: task.id * 10 + 2,
        title: `⏰ ¡Tu tarea casi empieza!`,
        body: `${task.title} - Solo 5 minutos para comenzar`,
        schedule: { at: new Date(fiveMinBefore), allowWhileIdle: true },
        channelId: 'task_alerts',
        sound: 'default',
        smallIcon: 'ic_stat_name',
        ongoing: false,
      });
    }

    // Notificación al inicio
    if (startTime > now) {
      notifications.push({
        id: task.id * 10 + 3,
        title: `🚀 ¡Es hora de comenzar!`,
        body: `${task.title} - Comienza ahora`,
        schedule: { at: new Date(startTime), allowWhileIdle: true },
        channelId: 'task_alerts',
        sound: 'default',
        smallIcon: 'ic_stat_name',
        ongoing: false,
      });
    }

    if (notifications.length > 0) {
      try {
        await LocalNotifications.schedule({ notifications });
        console.log(`Scheduled ${notifications.length} notifications for task: ${task.title}`);
      } catch (error) {
        console.error(`Error scheduling notifications for task ${task.id}:`, error);
      }
    }
  }

  async scheduleTaskNotifications(task: Task) {
    if (!this.isNative || task.status !== 'pending' || !task.scheduledStart) return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return;
    }

    await this.cancelTaskNotifications(task, true);
    await this.scheduleNotificationsForTask_INTERNAL(task);
  }

  async rescheduleAll(tasks: Task[]) {
    if (!this.isNative) return;
    console.log('AUDIT: Starting notification reschedule process...');
    
    await this.cancelAll();

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
        task.id * 10 + 3,
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
  
  /**
   * Muestra una notificación persistente del temporizador (ongoing notification)
   * Esta notificación permanece mientras el temporizador está activo
   */
  async showTimerNotification(taskTitle: string, timeLeft: string, mode: 'focus' | 'shortBreak' | 'longBreak') {
    if (!this.isNative || !isPlatform('android')) return;

    try {
      const modeText = mode === 'focus' ? '🎯 Concentración' : '☕ Descanso';
      const modeEmoji = mode === 'focus' ? '⏱️' : '☕';
      
      await LocalNotifications.schedule({
        notifications: [
          {
            id: this.TIMER_NOTIFICATION_ID,
            title: `${modeEmoji} ${taskTitle}`,
            body: `${modeText} - ${timeLeft} restante`,
            channelId: 'pomodoro_timer',
            ongoing: true, // Notificación persistente que no se puede deslizar
            autoCancel: false,
            smallIcon: 'ic_stat_name',
            sound: undefined, // Sin sonido para actualizaciones
          }
        ]
      });
    } catch (error) {
      console.error('Error showing timer notification:', error);
    }
  }

  /**
   * Actualiza la notificación del temporizador con el nuevo tiempo
   */
  async updateTimerNotification(taskTitle: string, timeLeft: string, mode: 'focus' | 'shortBreak' | 'longBreak') {
    await this.showTimerNotification(taskTitle, timeLeft, mode);
  }

  /**
   * Cancela la notificación persistente del temporizador
   */
  async cancelTimerNotification() {
    if (!this.isNative) return;
    try {
      await LocalNotifications.cancel({
        notifications: [{ id: this.TIMER_NOTIFICATION_ID }]
      });
    } catch (error) {
      console.error('Error cancelling timer notification:', error);
    }
  }

  /**
   * Muestra una notificación de progreso (temporal)
   */
  async showProgressNotification(message: string, taskTitle: string) {
    if (!this.isNative) return;
    
    try {
      const notificationId = Date.now();
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId,
            title: taskTitle,
            body: message,
            schedule: { at: new Date(Date.now() + 100) },
            channelId: 'pomodoro_progress',
            sound: 'default',
            smallIcon: 'ic_stat_name',
            ongoing: false,
            autoCancel: true,
          }
        ]
      });
    } catch (error) {
      console.error('Error showing progress notification:', error);
    }
  }

  async scheduleTestNotification() {
    if (!this.isNative) return;
    
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn('Cannot schedule test notification: permissions not granted');
      return;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 99999,
            title: '🧪 Notificación de Prueba',
            body: 'Si ves esto, las notificaciones funcionan correctamente',
            schedule: { at: new Date(Date.now() + 5000) },
            channelId: 'task_alerts',
            sound: 'default',
            smallIcon: 'ic_stat_name',
          }
        ]
      });
      console.log('Test notification scheduled for 5 seconds from now');
    } catch (error) {
      console.error('Error scheduling test notification:', error);
    }
  }
}

export const notificationService = new NotificationService();