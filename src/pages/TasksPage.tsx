// pages/TasksPage.tsx
import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSearchbar,
  IonToast,
  useIonAlert,
} from '@ionic/react';
import { useApp } from '../context/AppContext';
import { Task } from '../models/Task';
import { taskService } from '../services/task.service';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import ConflictModal from '../components/ConflictModal';
import TaskModal from '../components/TaskModal';
import './TasksPage.css';

const TasksPage: React.FC = () => {
  const { tasks, addTask, deleteTask, updateTask, setActiveTask } = useApp();
  const [presentAlert] = useIonAlert();
  
  const [activeTab, setActiveTab] = useState<'planning' | 'active' | 'expired' | 'completed'>('planning');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictingTasks, setConflictingTasks] = useState<Task[]>([]);
  const [pendingTask, setPendingTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'warning' | 'danger'>('success');

  const getFilteredTasks = () => {
    let filtered: Task[] = [];
    switch (activeTab) {
      case 'active':
        filtered = taskService.filterTasksByStatus(tasks, 'active');
        break;
      case 'expired':
        filtered = taskService.filterTasksByStatus(tasks, 'expired');
        break;
      case 'completed':
        filtered = taskService.filterTasksByStatus(tasks, 'completed');
        break;
      default: filtered = [];
    }

    if (searchTerm.trim() && activeTab === 'active') {
      filtered = taskService.searchTasks(filtered, searchTerm);
    }

    if (activeTab !== 'completed') {
      filtered = taskService.sortTasks(filtered, 'date', 'asc');
    } else {
      filtered = taskService.sortTasks(filtered, 'date', 'desc');
    }
    return filtered;
  };

  const handleCreateTask = async (task: Task): Promise<boolean> => {
    try {
      const tasksToAdd = taskService.generateRecurringTasks(task);
      const allConflicts: Task[] = [];
      tasksToAdd.forEach(t => {
        const conflicts = taskService.checkConflicts(t, tasks);
        allConflicts.push(...conflicts);
      });

      if (allConflicts.length > 0) {
        const uniqueConflicts = allConflicts.filter(
          (task, index, self) => index === self.findIndex(t => t.id === task.id)
        );
        setConflictingTasks(uniqueConflicts);
        setPendingTask(task);
        setShowConflictModal(true);
        return false;
      }

      for (const taskToAdd of tasksToAdd) {
        await addTask(taskToAdd);
      }
      showSuccessToast(tasksToAdd.length === 1 ? 'Tarea creada exitosamente' : `${tasksToAdd.length} tareas creadas`);
      setActiveTab('active');
      return true;
    } catch (error) {
      showErrorToast('Error al crear tarea');
      console.error('Error creating task:', error);
      return false;
    }
  };

  const handleConfirmWithConflicts = async () => {
    if (!pendingTask) return;
    try {
      const tasksToAdd = taskService.generateRecurringTasks(pendingTask);
      for (const taskToAdd of tasksToAdd) { await addTask(taskToAdd); }
      showWarningToast(`${tasksToAdd.length === 1 ? 'Tarea creada' : `${tasksToAdd.length} tareas creadas`} con conflictos`);
      setShowConflictModal(false);
      setPendingTask(null);
      setConflictingTasks([]);
      setActiveTab('active');
    } catch (error) {
      showErrorToast('Error al crear tarea');
      console.error('Error creating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    presentAlert({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar la tarea "${taskToDelete.title}"? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
        },
        {
          text: 'Eliminar',
          cssClass: 'alert-button-danger',
          handler: async () => {
            try {
              await deleteTask(taskId);
              showSuccessToast('Tarea eliminada');
            } catch (error) {
              showErrorToast('Error al eliminar tarea');
              console.error('Error deleting task:', error);
            }
          },
        },
      ],
    });
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      await updateTask(taskId, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        actualDuration: tasks.find(t => t.id === taskId)?.duration,
      });
      showSuccessToast('Tarea completada');
    } catch (error) {
      showErrorToast('Error al completar tarea');
      console.error('Error completing task:', error);
    }
  };

  const handleSelectTask = (task: Task) => {
    setActiveTask(task);
    showSuccessToast(`Cargada: ${task.title}`);
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const showSuccessToast = (message: string) => { setToastMessage(message); setToastColor('success'); setShowToast(true); };
  const showWarningToast = (message: string) => { setToastMessage(message); setToastColor('warning'); setShowToast(true); };
  const showErrorToast = (message: string) => { setToastMessage(message); setToastColor('danger'); setShowToast(true); };

  const filteredTasks = getFilteredTasks();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <div className="page-title"><span className="title-gradient">PoliFocusTask</span></div>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="tasks-container">
          <h2 className="section-title">Gestión de Tareas 📋</h2>
          <div className="tabs-wrapper">
            <IonSegment value={activeTab} onIonChange={e => setActiveTab(e.detail.value as any)} scrollable className="custom-segment">
              <IonSegmentButton value="planning"><IonLabel>📝 Planificar</IonLabel></IonSegmentButton>
              <IonSegmentButton value="active"><IonLabel>⚡ Activas</IonLabel></IonSegmentButton>
              <IonSegmentButton value="expired"><IonLabel>⏰ Vencidas</IonLabel></IonSegmentButton>
              <IonSegmentButton value="completed"><IonLabel>✅ Completadas</IonLabel></IonSegmentButton>
            </IonSegment>
          </div>

          {activeTab === 'planning' && (
            <div className="tab-content">
              <TaskForm onSubmit={handleCreateTask} />
            </div>
          )}

          {activeTab === 'active' && (
            <div className="tab-content">
              <IonSearchbar value={searchTerm} onIonChange={e => setSearchTerm(e.detail.value!)} placeholder="Buscar tarea..." className="custom-searchbar" />
              <TaskList
                tasks={filteredTasks}
                emptyMessage={searchTerm.trim() ? 'No se encontraron tareas' : 'Sin tareas pendientes'}
                emptyIcon="✅"
                onSelectTask={handleSelectTask}
                onDeleteTask={handleDeleteTask}
                onCompleteTask={handleCompleteTask}
                showConflicts
                allTasks={tasks}
              />
            </div>
          )}

          {activeTab === 'expired' && (
            <div className="tab-content">
              <TaskList
                tasks={filteredTasks}
                emptyMessage="Sin tareas vencidas"
                emptyIcon="🎉"
                onDeleteTask={handleDeleteTask}
              />
            </div>
          )}

          {activeTab === 'completed' && (
            <div className="tab-content">
              <TaskList
                tasks={filteredTasks}
                emptyMessage="Sin tareas completadas aún"
                emptyIcon="🏆"
              />
            </div>
          )}
        </div>

        <ConflictModal isOpen={showConflictModal} conflicts={conflictingTasks} onClose={() => { setShowConflictModal(false); setPendingTask(null); setConflictingTasks([]); }} onConfirm={handleConfirmWithConflicts} />
        <TaskModal isOpen={showTaskModal} task={selectedTask} onClose={() => { setShowTaskModal(false); setSelectedTask(null); }} onLoadTask={handleSelectTask} />
        <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMessage} duration={2000} position="bottom" color={toastColor} />
      </IonContent>
    </IonPage>
  );
};

export default TasksPage;
