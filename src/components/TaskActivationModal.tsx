import React from 'react';
import { IonModal, IonContent, IonButton, IonIcon } from '@ionic/react';
import { calendarOutline, timeOutline, hourglassOutline, playOutline } from 'ionicons/icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Task } from '../models/Task';
import './TaskActivationModal.css';

interface TaskActivationModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onActivate: (task: Task) => void;
}

const TaskActivationModal: React.FC<TaskActivationModalProps> = ({ task, isOpen, onClose, onActivate }) => {
  if (!task) return null;

  const handleActivate = () => {
    onActivate(task);
    onClose();
  };

  const scheduledStart = task.scheduledStart ? new Date(task.scheduledStart) : null;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} cssClass="task-activation-modal">
      <IonContent>
        <div className="modal-content">
          <h2>{task.title}</h2>
          <div className="task-details">
            {scheduledStart && (
              <div className="detail-item">
                <IonIcon icon={calendarOutline} />
                <span>{format(scheduledStart, "eeee, d 'de' MMMM 'de' yyyy", { locale: es })}</span>
              </div>
            )}
            {scheduledStart && (
              <div className="detail-item">
                <IonIcon icon={timeOutline} />
                <span>{format(scheduledStart, 'HH:mm')}</span>
              </div>
            )}
            <div className="detail-item">
              <IonIcon icon={hourglassOutline} />
              <span>{task.duration} minutos</span>
            </div>
          </div>
          <div className="modal-actions">
            <IonButton fill="clear" onClick={onClose} className="close-button">Cerrar</IonButton>
            <IonButton onClick={handleActivate} className="activate-button">
              <IonIcon slot="start" icon={playOutline} />
              Cargar Tarea
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default TaskActivationModal;
