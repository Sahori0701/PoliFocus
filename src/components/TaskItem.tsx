// components/TaskItem.tsx
import React from 'react';
import { IonCard, IonButton, IonIcon } from '@ionic/react';
import { playOutline, trashOutline, checkmarkOutline } from 'ionicons/icons';
import { Task } from '../models/Task';
import { taskService } from '../services/task.service';
import './TaskItem.css';

// CORREGIDO: Se añade `onViewTask` a las propiedades
interface TaskItemProps {
  task: Task;
  onSelect?: (task: Task) => void;
  onDelete?: (taskId: number) => void;
  onComplete?: (taskId: number) => void;
  onViewTask?: (task: Task) => void; // <-- AÑADIDO
  hasConflict?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onSelect,
  onDelete,
  onComplete,
  onViewTask, // <-- AÑADIDO
  hasConflict = false,
}) => {
  const isCompleted = task.status === 'completed';
  const date = new Date(task.scheduledStart);
  const priorityColor = taskService.getPriorityColor(task.priority);

  const urgencyBadge = !isCompleted ? taskService.getUrgencyBadge(task) : null;
  const efficiency = isCompleted ? taskService.calculateEfficiency(task.duration, task.actualDuration || task.duration) : null;

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

  // CORREGIDO: Manejador de clic para la tarjeta
  const handleCardClick = (e: React.MouseEvent) => {
    // Si existe `onViewTask` y el clic no se hizo en un botón, se ejecuta
    const target = e.target as HTMLElement;
    if (onViewTask && !target.closest('ion-button')) {
      onViewTask(task);
    }
  };

  return (
    <IonCard
      // CORREGIDO: Se añade la clase `task-is-clickable` si hay acción de vista
      className={`task-item-card ${hasConflict ? 'task-conflict' : ''} ${onViewTask ? 'task-is-clickable' : ''}`}
      style={{ borderLeft: `4px solid ${isCompleted ? 'var(--ion-color-success)' : priorityColor}` }}
      onClick={handleCardClick} // <-- AÑADIDO
    >
      <div className="task-item-wrapper">
        <div className="task-header">
          <div className="task-info">
            <div className={`task-title-row ${isCompleted ? 'completed-task' : ''}`}>
              <h4 className="task-title">{task.title}</h4>
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
                {formatMinutesToMMSS(task.duration)}
              </span>
              {isCompleted && (
                <span className="meta-item">
                  <span className="meta-icon">🏁</span>
                  {formatMinutesToMMSS(task.actualDuration || 0)}
                </span>
              )}
            </div>
          </div>
        </div>

        {isCompleted && efficiency ? (
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
                <IonButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); onSelect(task); }} fill="solid">
                  <IonIcon icon={playOutline} slot="icon-only" />
                </IonButton>
              )}
              {onComplete && (
                <IonButton size="small" color="success" onClick={(e) => { e.stopPropagation(); onComplete(task.id); }} fill="solid">
                  <IonIcon icon={checkmarkOutline} slot="icon-only" />
                </IonButton>
              )}
              {onDelete && (
                <IonButton size="small" color="danger" onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} fill="solid">
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
