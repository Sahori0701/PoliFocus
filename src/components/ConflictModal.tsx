// components/ConflictModal.tsx
import React from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/react';
import { Task } from '../models/Task';
import { dateUtils } from '../utils/dateUtils';
import './ConflictModal.css';

interface ConflictModalProps {
  isOpen: boolean;
  conflicts: Task[];
  onClose: () => void;
  onConfirm: () => void;
}

const ConflictModal: React.FC<ConflictModalProps> = ({
  isOpen,
  conflicts,
  onClose,
  onConfirm,
}) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="conflict-modal">
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <div className="modal-title">
              ⚠️ Conflicto de Horario
            </div>
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="conflict-content">
          <p className="conflict-description">
            Esta tarea se solapa con las siguientes tareas existentes:
          </p>

          <IonList className="conflict-list">
            {conflicts.map(task => {
              const date = new Date(task.scheduledStart);
              return (
                <IonItem key={task.id} lines="full" className="conflict-item">
                  <IonLabel>
                    <h3 className="conflict-task-title">{task.title}</h3>
                    <p className="conflict-task-date">
                      {dateUtils.formatDateES(date)}
                    </p>
                    <p className="conflict-task-time">
                      {dateUtils.formatTimeES(date)} • {task.duration} min
                    </p>
                  </IonLabel>
                </IonItem>
              );
            })}
          </IonList>

          <div className="conflict-warning">
            <p className="warning-text">
              <strong>Nota:</strong> Puedes crear la tarea de todos modos, pero ten en cuenta 
              que tendrás compromisos simultáneos.
            </p>
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
            Cancelar
          </IonButton>
          <IonButton
            expand="block"
            color="warning"
            onClick={onConfirm}
            className="modal-button"
          >
            Crear de Todos Modos
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default ConflictModal;