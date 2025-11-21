
// src/services/notification.service.ts
import { LocalNotifications, Channel } from '@capacitor/local-notifications';
import { isPlatform } from '@ionic/react';
import { Task } from '../models/Task';

class NotificationService {

  // Propiedad privada para verificar si estamos en un dispositivo móvil (iOS/Android)
  private isNative = isPlatform('hybrid');

  /**
   * Verifica si la aplicación tiene permisos para enviar notificaciones.
   * Devuelve `false` si no está en un dispositivo nativo.
   */
  async hasPermission(): Promise<boolean> {
    if (!this.isNative) return false;
    try {
      const permissions = await LocalNotifications.checkPermissions();
      return permissions.display === 'granted';
    } catch (error) {
      console.error('Error al verificar permisos de notificación:', error);
      return false;
    }
  }

  /**
   * Solicita al usuario permiso para enviar notificaciones.
   * Solo se ejecuta en plataformas nativas.
   */
  async requestPermissions(): Promise<boolean> {
    if (!this.isNative) return false;
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Error al solicitar permisos de notificación:', error);
      return false;
    }
  }

  /**
   * Crea un canal de notificación para Android (obligatorio para Android 8.0+).
   * Solo se ejecuta en dispositivos Android.
   */
  async createNotificationChannel() {
    if (!this.isNative || !isPlatform('android')) return;
    try {
      const channel: Channel = {
        id: 'task_alerts',
        name: 'Alertas de Tareas',
        description: 'Notificaciones para tareas próximas a vencer.',
        importance: 4, // Urgente
        visibility: 1, // Público
        sound: 'default',
        vibration: true,
      };
      await LocalNotifications.createChannel(channel);
    } catch (error) {
      console.error('Error al crear el canal de notificación:', error);
    }
  }

  /**
   * Programa notificaciones para una tarea específica (15 y 5 minutos antes).
   * Solo se ejecuta en plataformas nativas y si la tarea está pendiente.
   */
  async scheduleTaskNotifications(task: Task) {
    if (!this.isNative || task.status !== 'pending' || !task.scheduledStart) return;

    if (!(await this.hasPermission())) {
      console.warn("No se pueden programar notificaciones, el permiso no fue concedido.");
      return;
    }
    
    const now = Date.now();
    const startTime = new Date(task.scheduledStart).getTime();
    const notifications = [];

    // Alerta 1: 15 minutos antes
    const fifteenMinBefore = startTime - 15 * 60 * 1000;
    if (fifteenMinBefore > now) {
      notifications.push({
        id: task.id * 10 + 1, // ID único para la alerta de 15 min
        title: `¡Tu tarea va a empezar! (${task.title})`,
        body: `Faltan 15 minutos para que comience tu tarea. ¡Prepárate!`,
        schedule: { at: new Date(fifteenMinBefore) },
        channelId: 'task_alerts',
        sound: 'default',
      });
    }

    // Alerta 2: 5 minutos antes
    const fiveMinBefore = startTime - 5 * 60 * 1000;
    if (fiveMinBefore > now) {
      notifications.push({
        id: task.id * 10 + 2, // ID único para la alerta de 5 min
        title: `¡Tu tarea casi empieza! (${task.title})`,
        body: `¡Solo 5 minutos para que comience tu tarea!`,
        schedule: { at: new Date(fiveMinBefore) },
        channelId: 'task_alerts',
        sound: 'default',
      });
    }

    if (notifications.length > 0) {
      try {
        await LocalNotifications.schedule({ notifications });
      } catch (error) {
        console.error(`Error al programar notificaciones para la tarea ${task.id}:`, error);
      }
    }
  }

  /**
   * Cancela todas las notificaciones pendientes para una tarea específica.
   * Útil si la tarea se completa, edita o elimina.
   * Solo se ejecuta en plataformas nativas.
   */
  async cancelTaskNotifications(task: Task) {
    if (!this.isNative) return;
    try {
      const pending = await LocalNotifications.getPending();
      const notificationIdsToCancel = [
        task.id * 10 + 1, // ID de alerta de 15 min
        task.id * 10 + 2, // ID de alerta de 5 min
      ];
      
      const notificationsToCancel = pending.notifications.filter(notif => 
        notificationIdsToCancel.includes(notif.id)
      );

      if (notificationsToCancel.length > 0) {
        await LocalNotifications.cancel({ notifications: notificationsToCancel });
      }
    } catch (error) {
      console.error(`Error al cancelar notificaciones para la tarea ${task.id}:`, error);
    }
  }

  /**
   * Programa una notificación de prueba para dispararse en 5 segundos.
   * Solo se ejecuta en plataformas nativas.
   */
  async scheduleTestNotification() {
    if (!this.isNative) {
      alert("Las notificaciones solo se pueden probar en un dispositivo móvil.");
      console.warn("Prueba de notificación omitida: no es una plataforma nativa.");
      return;
    }

    if (!(await this.hasPermission())) {
      alert("Permiso de notificación no concedido. Ve a los ajustes de la app para habilitarlo.");
      return;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "¡PoliFocusTask dice hola! 🧪",
            body: "Si ves esto, las notificaciones funcionan perfectamente.",
            id: 1, // ID estático para la prueba
            schedule: { at: new Date(Date.now() + 1000 * 5) }, // 5 segundos desde ahora
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

// Exportamos una única instancia del servicio (Patrón Singleton)
export const notificationService = new NotificationService();
