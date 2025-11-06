// components/TaskItem.tsx
import React from 'react';
import { IonCard, IonButton, IonIcon } from '@ionic/react';
import { playOutline, trashOutline, checkmarkOutline } from 'ionicons/icons';
import { Task } from '../models/Task';
import { taskService } from '../services/task.service';
import { dateUtils } from '../utils/dateUtils';
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
  const date = new Date(task.scheduledStart);
  const urgencyBadge = taskService.getUrgencyBadge(task);
  const priorityColor = taskService.getPriorityColor(task.priority);

  const getBadgeClass = (urgency: string) => {
    const classes: Record<string, string> = {
      urgent: 'time-badge-urgent',
      soon: 'time-badge-soon',
      normal: 'time-badge-normal',
      expired: 'time-badge-expired',
    };
    return classes[urgency] || 'time-badge-normal';
  };

  const getBadgeIcon = (urgency: string) => {
    return urgency === 'urgent' ? '⚡' : '🕐';
  };

  return (
    <IonCard
      className={`task-item-card ${hasConflict ? 'task-conflict' : ''}`}
      style={{ borderLeft: `4px solid ${priorityColor}` }}
    >
      <div className="task-item-wrapper">
        {/* Header: Título y metadata */}
        <div className="task-header">
          <div className="task-info">
            <div className="task-title-row">
              <h4 className="task-title">{task.title}</h4>
              {task.isRecurring && (
                <span className="task-icon">🔄</span>
              )}
              {hasConflict && (
                <span className="task-icon">⚠️</span>
              )}
            </div>
            
            <div className="task-meta">
              <span className="meta-item">
                <span className="meta-icon">🕐</span>
                {date.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className="meta-item">
                <span className="meta-icon">📅</span>
                {date.toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                })}
              </span>
              <span className="meta-item">
                <span className="meta-icon">⏱</span>
                {task.duration} min
              </span>
            </div>
          </div>
        </div>

        {/* Footer: Badge y acciones */}
        <div className="task-footer">
          <div className={`time-badge ${getBadgeClass(urgencyBadge.class)}`}>
            <span className="badge-icon">
              {getBadgeIcon(urgencyBadge.class)}
            </span>
            <span className="badge-text">{urgencyBadge.text}</span>
          </div>

          <div className="task-actions">
            {onSelect && (
              <IonButton
                size="small"
                color="primary"
                onClick={() => onSelect(task)}
                className="action-button"
                fill="solid"
              >
                <IonIcon icon={playOutline} slot="icon-only" />
              </IonButton>
            )}
            
            {onComplete && (
              <IonButton
                size="small"
                color="success"
                onClick={() => onComplete(task.id)}
                className="action-button"
                fill="solid"
              >
                <IonIcon icon={checkmarkOutline} slot="icon-only" />
              </IonButton>
            )}
            
            {onDelete && (
              <IonButton
                size="small"
                color="danger"
                onClick={() => onDelete(task.id)}
                className="action-button"
                fill="solid"
              >
                <IonIcon icon={trashOutline} slot="icon-only" />
              </IonButton>
            )}
          </div>
        </div>
      </div>
    </IonCard>
  );
};

export default TaskItem;