
import { LocalNotifications, ScheduleOptions, CancelOptions, PermissionStatus } from '@capacitor/local-notifications';
import { Task } from '../models/Task';

// IDs para las notificaciones (15 y 5 minutos antes)
const NOTIFICATION_ID_15_MIN = 15;
const NOTIFICATION_ID_5_MIN = 5;

class NotificationService {

  async hasPermission(): Promise<boolean> {
    const status: PermissionStatus = await LocalNotifications.checkPermissions();
    return status.display === 'granted';
  }

  async requestPermission(): Promise<boolean> {
    const status: PermissionStatus = await LocalNotifications.requestPermissions();
    return status.display === 'granted';
  }

  async scheduleTaskNotifications(task: Task): Promise<void> {
    if (!task.scheduledStart || task.status !== 'pending') {
      return;
    }

    if (!(await this.hasPermission())) {
      if (!(await this.requestPermission())) {
        console.log("Permission for notifications was not granted.");
        return;
      }
    }
    
    const now = new Date().getTime();
    const startTime = new Date(task.scheduledStart).getTime();

    // Notificación 15 minutos antes
    const fifteenMinutesBefore = startTime - 15 * 60 * 1000;
    if (fifteenMinutesBefore > now) {
      const options: ScheduleOptions = {
        notifications: [
          {
            id: this.getNotificationId(task.id, NOTIFICATION_ID_15_MIN),
            title: "Tarea Próxima",
            body: `¡Tu tarea "${task.title}" comienza en 15 minutos!`,
            schedule: { at: new Date(fifteenMinutesBefore) },
            sound: 'beep.wav',
            smallIcon: 'ic_stat_icon_config_material',
          },
        ],
      };
      await LocalNotifications.schedule(options);
    }

    // Notificación 5 minutos antes
    const fiveMinutesBefore = startTime - 5 * 60 * 1000;
    if (fiveMinutesBefore > now) {
        const options: ScheduleOptions = {
            notifications: [
              {
                id: this.getNotificationId(task.id, NOTIFICATION_ID_5_MIN),
                title: "Tarea Próxima",
                body: `¡Tu tarea "${task.title}" comienza en 5 minutos!`,
                schedule: { at: new Date(fiveMinutesBefore) },
                sound: 'beep.wav',
                smallIcon: 'ic_stat_icon_config_material',
              },
            ],
          };
          await LocalNotifications.schedule(options);
    }
  }

  async cancelTaskNotifications(task: Task): Promise<void> {
    const options: CancelOptions = {
      notifications: [
        { id: this.getNotificationId(task.id, NOTIFICATION_ID_15_MIN) },
        { id: this.getNotificationId(task.id, NOTIFICATION_ID_5_MIN) },
      ],
    };
    await LocalNotifications.cancel(options);
  }

  // Genera un ID numérico único para la notificación
  private getNotificationId(taskId: number, type: number): number {
    // Combina el ID de la tarea con el tipo de notificación
    return taskId * 10 + type;
  }
}

export const notificationService = new NotificationService();
