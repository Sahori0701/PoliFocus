// components/TaskList.tsx
import React from 'react';
import { IonCard, IonCardContent } from '@ionic/react';
import { Task } from '../models/Task';
import { taskService } from '../services/task.service';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  emptyMessage?: string;
  emptyIcon?: string;
  onSelectTask?: (task: Task) => void;
  onDeleteTask?: (taskId: number) => void;
  onCompleteTask?: (taskId: number) => void;
  onViewTask?: (task: Task) => void;
  onRescheduleTask?: (task: Task) => void; // Add reschedule handler
  showConflicts?: boolean;
  allTasks?: Task[];
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  emptyMessage = 'No hay tareas',
  emptyIcon = '✅',
  onSelectTask,
  onDeleteTask,
  onCompleteTask,
  onViewTask,
  onRescheduleTask, // Add reschedule handler
  showConflicts = false,
  allTasks = [],
}) => {
  if (tasks.length === 0) {
    return (
      <IonCard className="empty-state-card">
        <IonCardContent className="empty-state-content">
          <div className="empty-icon">{emptyIcon}</div>
          <p className="empty-message">{emptyMessage}</p>
        </IonCardContent>
      </IonCard>
    );
  }

  return (
    <div className="task-list-container">
      {tasks.map(task => {
        const hasConflict = showConflicts
          ? taskService.checkConflicts(task, allTasks).length > 0
          : false;

        return (
          <TaskItem
            key={task.id}
            task={task}
            onSelect={onSelectTask}
            onDelete={onDeleteTask}
            onComplete={onCompleteTask}
            onViewTask={onViewTask}
            onReschedule={onRescheduleTask} // Pass handler to TaskItem
            hasConflict={hasConflict}
          />
        );
      })}
    </div>
  );
};

export default TaskList;
