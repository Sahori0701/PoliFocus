
import React from 'react';
import {
  IonModal, IonContent, IonButton, IonIcon, IonHeader, IonToolbar, IonTitle, IonButtons,
  IonGrid, IonRow, IonCol, IonBadge, IonItem, IonLabel
} from '@ionic/react';
import { close } from 'ionicons/icons';
import { Task, TaskStatus } from '../models/Task';
import { useApp } from '../context/AppContext';
import { getPriorityText, getStatusText, getRecurrenceSummary } from '../utils/taskUtils';
import './TaskModal.css';

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const isTaskOverdue = (task: Task): boolean => {
  const now = new Date();
  const endDate = new Date(new Date(task.scheduledStart).getTime() + task.duration * 60000);
  return task.status !== 'completed' && now > endDate;
};

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose }) => {
  const { tasks } = useApp();

  if (!task) return null;

  const parentId = task.parentId ?? task.id;
  const recurrenceSummary = (task.isRecurring || task.parentId)
    ? getRecurrenceSummary(tasks, parentId)
    : null;

  const displayStatus = isTaskOverdue(task) ? 'overdue' : task.status;

  const getStatusColor = (status: TaskStatus | 'overdue') => {
    switch (status) {
      case 'pending': return 'light';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'medium';
      case 'overdue': return 'danger';
      default: return 'medium';
    }
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      default: return 'medium';
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="task-modal">
      <IonHeader>
        <IonToolbar>
          <IonTitle className="ion-text-header">📖 Detalle de la tarea</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}><IonIcon icon={close} /></IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid className="modal-grid">
          <IonRow>
            <IonCol>
              <h1 className="task-main-title">📌 {task.title}</h1>
              {task.description && <div className="task-description">{task.description}</div>}
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="4">
              <IonItem lines="none">
                <IonLabel className="ion-text-center">
                  <h2>Prioridad</h2>
                  <p><IonBadge color={getPriorityColor(task.priority)}>{getPriorityText(task.priority)}</IonBadge></p>
                </IonLabel>
              </IonItem>
            </IonCol>
            <IonCol size="4">
              <IonItem lines="none">
                <IonLabel className="ion-text-center">
                  <h2>✨ Estado</h2>
                  <p><IonBadge color={getStatusColor(displayStatus)}>{getStatusText(displayStatus)}</IonBadge></p>
                </IonLabel>
              </IonItem>
            </IonCol>
            <IonCol size="4">
              <IonItem lines="none">
                <IonLabel className="ion-text-center">
                  <h2>Duración</h2>
                  <p>{task.duration ? `${task.duration} min` : 'N/A'}</p>
                </IonLabel>
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="6">
              <IonItem lines="none">
                <IonLabel className="ion-text-center">
                  <h2>📅 Fecha de inicio</h2>
                  <p>{new Date(task.scheduledStart).toLocaleDateString()}</p>
                </IonLabel>
              </IonItem>
            </IonCol>
            <IonCol size="6">
              <IonItem lines="none">
                <IonLabel className="ion-text-center">
                  <h2>⏰ Hora de inicio</h2>
                  <p>{new Date(task.scheduledStart).toLocaleTimeString()}</p>
                </IonLabel>
              </IonItem>
            </IonCol>
          </IonRow>

          {recurrenceSummary && (
            <div className="recurrence-section">
              <IonItem lines="none">
                <IonLabel className="ion-text-center"><h2>🔁 Resumen de Recurrencia</h2></IonLabel>
              </IonItem>
              <IonRow>
                <IonCol size="4" className="ion-text-center">
                  <IonLabel><h3>Activas</h3></IonLabel>
                  <p><IonBadge color="primary">{`${recurrenceSummary.active} de ${recurrenceSummary.total}`}</IonBadge></p>
                </IonCol>
                <IonCol size="4" className="ion-text-center">
                  <IonLabel><h3>Vencidas</h3></IonLabel>
                  <p><IonBadge color="danger">{`${recurrenceSummary.overdue} de ${recurrenceSummary.total}`}</IonBadge></p>
                </IonCol>
                <IonCol size="4" className="ion-text-center">
                  <IonLabel><h3>Finalizadas</h3></IonLabel>
                  <p><IonBadge color="success">{`${recurrenceSummary.completed} de ${recurrenceSummary.total}`}</IonBadge></p>
                </IonCol>
              </IonRow>
            </div>
          )}
        </IonGrid>
      </IonContent>
    </IonModal>
  );
};

export default TaskModal;
