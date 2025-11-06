// components/TaskModal.tsx
import React from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
} from '@ionic/react';
import { closeOutline, playOutline } from 'ionicons/icons';
import { Task } from '../models/Task';
import { dateUtils } from '../utils/dateUtils';
import { taskUtils } from '../utils/taskUtils';
import { taskService } from '../services/task.service';
import './TaskModal.css';

interface TaskModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onLoadTask?: (task: Task) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  task,
  onClose,
  onLoadTask,
}) => {
  if (!task) return null;

  const date = new Date(task.scheduledStart);
  const canLoadTask = task.status === 'pending' && !taskService.isTaskExpired(task);

  const handleLoadTask = () => {
    if (onLoadTask && canLoadTask) {
      onLoadTask(task);
      onClose();
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="task-modal">
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <div className="modal-title">Detalles de Tarea</div>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="task-details-content">
          <h2 className="task-details-title">{task.title}</h2>

          <div className="task-details-list">
            <div className="detail-item">
              <span className="detail-icon">📅</span>
              <div className="detail-content">
                <p className="detail-label">Fecha</p>
                <p className="detail-value">{dateUtils.formatDateES(date)}</p>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-icon">🕐</span>
              <div className="detail-content">
                <p className="detail-label">Hora</p>
                <p className="detail-value">{dateUtils.formatTimeES(date)}</p>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-icon">⏱</span>
              <div className="detail-content">
                <p className="detail-label">Duración</p>
                <p className="detail-value">{dateUtils.formatDuration(task.duration)}</p>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-icon">{taskUtils.getPriorityEmoji(task.priority)}</span>
              <div className="detail-content">
                <p className="detail-label">Prioridad</p>
                <p className="detail-value">{taskUtils.getPriorityLabel(task.priority)}</p>
              </div>
            </div>

            {task.isRecurring && (
              <div className="detail-item">
                <span className="detail-icon">🔄</span>
                <div className="detail-content">
                  <p className="detail-label">Recurrencia</p>
                  <p className="detail-value">{taskUtils.getRecurrenceDescription(task)}</p>
                </div>
              </div>
            )}

            {task.status === 'pending' && (
              <div className="detail-item">
                <span className="detail-icon">⏰</span>
                <div className="detail-content">
                  <p className="detail-label">Tiempo Restante</p>
                  <p className="detail-value">{taskService.getUrgencyBadge(task).text}</p>
                </div>
              </div>
            )}

            {task.status === 'completed' && task.actualDuration && (
              <div className="detail-item">
                <span className="detail-icon">✅</span>
                <div className="detail-content">
                  <p className="detail-label">Completada</p>
                  <p className="detail-value">Duración real: {task.actualDuration} minutos</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <IonButton
            expand="block"
            fill="outline"
            color="medium"
            onClick={onClose}
            className="modal-button"
          >
            Cerrar
          </IonButton>
          
          {canLoadTask && onLoadTask && (
            <IonButton
              expand="block"
              color="primary"
              onClick={handleLoadTask}
              className="modal-button"
            >
              <IonIcon icon={playOutline} slot="start" />
              Cargar Tarea
            </IonButton>
          )}
        </div>
      </IonContent>
    </IonModal>
  );
};

export default TaskModal;