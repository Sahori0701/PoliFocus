
import React from 'react';
import { IonModal } from '@ionic/react';
import { Task } from '../models/Task';
import { dateUtils } from '../utils/dateUtils';
import './ConflictModal.css'; // Importa los estilos locales

interface ConflictModalProps {
  isOpen: boolean;
  conflicts: Task[];
  onCancel: () => void;
  onConfirm: () => void;
}

const ConflictModal: React.FC<ConflictModalProps> = ({ isOpen, conflicts, onCancel, onConfirm }) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onCancel} className="conflict-modal">
      {/* Usamos un layout de flexbox para control total */}
      <div className="conflict-container">

        {/* HEADER */}
        <div className="conflict-header">
          <h2 className="conflict-title">⚠️ Conflicto de horario</h2>
          <p className="conflict-subtitle">La nueva tarea se solapa con:</p>
        </div>

        {/* CONTENT (Scrollable) */}
        <div className="conflict-content">
          {conflicts.map(task => {
            const date = new Date(task.scheduledStart);
            return (
              <div className="conflict-item" key={task.id}>
                <span className="conflict-item-time">{`🔖 ${dateUtils.formatTimeES(date)} ${task.duration} min`}</span>
                <span className="conflict-item-title">{`${task.title}`}</span>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="conflict-footer">
          <button onClick={onCancel} className="conflict-button-cancel">Cancelar</button>
          <button onClick={onConfirm} className="conflict-button-confirm">Crear tarea</button>
        </div>
        
      </div>
    </IonModal>
  );
};

export default ConflictModal;
