// components/TaskItem.tsx
import React from 'react';
import { IonCard, IonButton, IonIcon } from '@ionic/react';
import { playOutline, trashOutline, checkmarkOutline } from 'ionicons/icons';
import { Task } from '../models/Task';
import { taskService } from '../services/task.service';
import './TaskItem.css';

interface TaskItemProps {
  task: Task;
  onSelect?: (task: Task) => void;
  onDelete?: (taskId: number) => void;
  onComplete?: (taskId: number) => void;
  hasConflict?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onSelect,
  onDelete,
  onComplete,
  hasConflict = false,
}) => {
  const isCompleted = task.status === 'completed';
  const date = new Date(task.scheduledStart);
  const priorityColor = taskService.getPriorityColor(task.priority);

  const urgencyBadge = !isCompleted ? taskService.getUrgencyBadge(task) : null;
  const efficiency = isCompleted ? taskService.calculateEfficiency(task.duration, task.actualDuration || task.duration) : null;

  // NUEVA FUNCIÓN: Para formatear minutos a mm:ss
  const formatMinutesToMMSS = (minutes: number): string => {
    if (minutes === null || minutes === undefined) return '00:00';
    const totalSeconds = Math.floor(minutes * 60);
    const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const ss = String(totalSeconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const getBadgeClass = (urgencyClass: string) => {
    const classes: Record<string, string> = {
      urgent: 'time-badge-urgent',
      soon: 'time-badge-soon',
      normal: 'time-badge-normal',
      expired: 'time-badge-expired',
      completed: 'time-badge-completed',
    };
    return classes[urgencyClass] || 'time-badge-normal';
  };

  return (
    <IonCard
      className={`task-item-card ${hasConflict ? 'task-conflict' : ''}`}
      style={{ borderLeft: `4px solid ${isCompleted ? 'var(--ion-color-success)' : priorityColor}` }}
    >
      <div className="task-item-wrapper">
        <div className="task-header">
          <div className="task-info">
            {/* --- SECCIÓN DE TÍTULO MODIFICADA --- */}
            <div className={`task-title-row ${isCompleted ? 'completed-task' : ''}`}>
              <h4 className="task-title">{task.title}</h4>
              
              {/* MODIFICADO: Muestra la eficiencia aquí para tareas completadas */}
              {isCompleted && (
                <span className="efficiency-details-inline">
                  ({formatMinutesToMMSS(task.duration)} → {formatMinutesToMMSS(task.actualDuration || 0)})
                </span>
              )}

              {task.isRecurring && !isCompleted && <span className="task-icon">🔄</span>}
              {hasConflict && !isCompleted && <span className="task-icon">⚠️</span>}
            </div>
            
            <div className="task-meta">
              <span className="meta-item task-main-date">
                <span className="meta-icon">📅</span>
                {date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
              </span>
              <span className="meta-item">
                <span className="meta-icon">🕒</span>
                {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>
              <span className="meta-item">
                <span className="meta-icon">⏱️</span>
                {task.duration} min
              </span>
            </div>
          </div>
        </div>

        {/* --- SECCIÓN DE FOOTER MODIFICADA --- */}
        {isCompleted && efficiency ? (
          // MODIFICADO: Ya no se muestra el efficiency-details aquí
          <div className="task-footer-completed">
            <div className={`efficiency-badge efficiency-badge-${efficiency.badge}`}>
              <span className="badge-icon">{efficiency.icon}</span>
              <span>{efficiency.difference > 0 ? `+${efficiency.difference}` : efficiency.difference} min</span>
            </div>
          </div>
        ) : (
          <div className="task-footer">
            {urgencyBadge && (
              <div className={`time-badge ${getBadgeClass(urgencyBadge.class)}`}>
                 <span className="badge-text">{urgencyBadge.text}</span>
              </div>
            )}
            <div className="task-actions">
              {onSelect && (
                <IonButton size="small" color="primary" onClick={() => onSelect(task)} fill="solid">
                  <IonIcon icon={playOutline} slot="icon-only" />
                </IonButton>
              )}
              {onComplete && (
                <IonButton size="small" color="success" onClick={() => onComplete(task.id)} fill="solid">
                  <IonIcon icon={checkmarkOutline} slot="icon-only" />
                </IonButton>
              )}
              {onDelete && (
                <IonButton size="small" color="danger" onClick={() => onDelete(task.id)} fill="solid">
                  <IonIcon icon={trashOutline} slot="icon-only" />
                </IonButton>
              )}
            </div>
          </div>
        )}
      </div>
    </IonCard>
  );
};

export default TaskItem;
