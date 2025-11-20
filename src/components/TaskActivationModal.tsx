import React from 'react';
import { IonModal, IonContent, IonButton, IonIcon } from '@ionic/react';
import { calendarOutline, timeOutline, hourglassOutline } from 'ionicons/icons';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Task } from '../models/Task';
import './TaskActivationModal.css';

interface TaskActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onActivate: (task: Task) => void;
}

const TaskActivationModal: React.FC<TaskActivationModalProps> = ({ isOpen, onClose, task, onActivate }) => {
  if (!task) {
    return null;
  }

  const taskDate = task.scheduledStart
    ? format(parseISO(task.scheduledStart), "eeee, d 'de' MMMM 'de' yyyy", { locale: es })
    : 'Sin fecha';

  const taskTime = task.scheduledStart
    ? format(parseISO(task.scheduledStart), 'HH:mm', { locale: es })
    : 'Sin hora';

  const taskDuration = `${task.duration} minutos`;

  const handleActivate = () => {
    onActivate(task);
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonContent>
        {/* This wrapper is key for vertical centering */}
        <div className="modal-wrapper">
          <div className="modal-content">
            <h2>{task.title}</h2>
            <div className="task-details">
              <div className="detail-item">
                <IonIcon icon={calendarOutline} />
                <span>{taskDate}</span>
              </div>
              <div className="detail-item">
                <IonIcon icon={timeOutline} />
                <span>{taskTime}</span>
              </div>
              <div className="detail-item">
                <IonIcon icon={hourglassOutline} />
                <span>{taskDuration}</span>
              </div>
            </div>
            <div className="modal-actions">
              <IonButton className="close-button" onClick={onClose}>Cerrar</IonButton>
              <IonButton className="activate-button" onClick={handleActivate}>
                <IonIcon slot="start" icon={timeOutline} />
                Cargar Tarea
              </IonButton>
            </div>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default TaskActivationModal;
