
// pages/TasksPage.tsx
import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSearchbar,
  IonToast,
  useIonAlert,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Task } from '../models/Task';
import { taskService } from '../services/task.service';
import { dateUtils } from '../utils/dateUtils'; 
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import TaskModal from '../components/TaskModal';
import Header from '../components/Header';
import './TasksPage.css';


// =================================================================================
// COMPONENTE PRINCIPAL DE LA PÁGINA DE TAREAS
// =================================================================================
const TasksPage: React.FC = () => {
  const { tasks, addTask, deleteTask, updateTask, selectTask, initialTab, setInitialTab } = useApp();
  const history = useHistory();
  const [presentAlert] = useIonAlert();
  
  const [activeTab, setActiveTab] = useState<'planning' | 'active' | 'expired' | 'completed'>('planning');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<Task | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'warning' | 'danger'>('success');

  useEffect(() => {
    if (initialTab) {
      const validTabs: ('planning' | 'active' | 'expired' | 'completed')[] = ['planning', 'active', 'expired', 'completed'];
      if (validTabs.includes(initialTab as any)) {
         setActiveTab(initialTab as any);
      }
      setInitialTab(null);
    }
  }, [initialTab, setInitialTab]);

  const getFilteredTasks = () => {
    let filtered: Task[] = [];
    switch (activeTab) {
      case 'active': filtered = taskService.filterTasksByStatus(tasks, 'active'); break;
      case 'expired': filtered = taskService.filterTasksByStatus(tasks, 'expired'); break;
      case 'completed': filtered = taskService.filterTasksByStatus(tasks, 'completed'); break;
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

  const handleCreateTask = async (taskData: Omit<Task, 'id'>): Promise<boolean> => {
    try {
      const baseTaskWithTempId: Task = { ...taskData, id: Date.now() };
      const tasksToAdd = taskService.generateRecurringTasks(baseTaskWithTempId);
      const allConflicts = tasksToAdd.flatMap(t => taskService.checkConflicts(t, tasks));

      if (allConflicts.length > 0) {
        const uniqueConflicts = [...new Map(allConflicts.map(item => [item.id, item])).values()];
        
        const conflictMessages = uniqueConflicts.map(t => {
          const date = new Date(t.scheduledStart);
          return `📌   ${t.title}  ${dateUtils.formatTimeES(date)}   ${t.duration} min`;
        }).join('\n');
        
        presentAlert({
          cssClass: 'conflict-alert', 
          header: '⚠️ Conflicto de Horario',
          subHeader: 'La nueva tarea se solapa con:',
          message: conflictMessages,
          buttons: [
            { text: 'Cancelar', role: 'cancel', cssClass: 'alert-button-cancel' },
            {
              text: 'Crear',
              cssClass: 'alert-button-confirm',
              handler: () => handleConfirmWithConflicts(taskData),
            },
          ],
        });
        return false;
      }

      for (const task of tasksToAdd) {
        const { id, ...taskDataForStorage } = task;
        await addTask(taskDataForStorage);
      }
      
      showSuccessToast(tasksToAdd.length === 1 ? '🎖️ Tarea creada exitosamente' : `${tasksToAdd.length} tareas creadas`);
      setActiveTab('active');
      return true;
    } catch (error) {
      showErrorToast('Error al crear tarea');
      return false;
    }
  };

  const handleConfirmWithConflicts = async (taskData: Omit<Task, 'id'>) => {
    try {
      const baseTaskWithTempId: Task = { ...taskData, id: Date.now() };
      const tasksToAdd = taskService.generateRecurringTasks(baseTaskWithTempId);
      
      for (const task of tasksToAdd) {
        const { id, ...taskDataForStorage } = task;
        await addTask(taskDataForStorage);
      }
      
      showWarningToast(`${tasksToAdd.length === 1 ? 'Tarea creada' : `${tasksToAdd.length} tareas creadas`} con conflictos`);
      setActiveTab('active');
    } catch (error) {
      showErrorToast('Error al crear tarea con conflictos');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    presentAlert({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar la tarea "${taskToDelete.title}"? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel', cssClass: 'alert-button-cancel' },
        {
          text: 'Eliminar',
          cssClass: 'alert-button-danger',
          handler: async () => {
            try { await deleteTask(taskId); showSuccessToast('Tarea eliminada'); } 
            catch (error) { showErrorToast('Error al eliminar tarea'); }
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
    }
  };
  
  const handleSelectTask = (task: Task) => {
    selectTask(task);
    showSuccessToast(`Cargada: ${task.title}`);
    history.push('/timer');
  };

  const handleViewTask = (task: Task) => { setSelectedTaskForModal(task); setShowTaskModal(true); };
  const showSuccessToast = (message: string) => { setToastMessage(message); setToastColor('success'); setShowToast(true); };
  const showWarningToast = (message: string) => { setToastMessage(message); setToastColor('warning'); setShowToast(true); };
  const showErrorToast = (message: string) => { setToastMessage(message); setToastColor('danger'); setShowToast(true); };

  const filteredTasks = getFilteredTasks();

  return (
    <IonPage>
      
      <Header />
      <IonContent fullscreen>
        <div className="tasks-container">
           <div className="tabs-wrapper">
            <IonSegment value={activeTab} onIonChange={e => setActiveTab(e.detail.value as any)} scrollable className="custom-segment">
              <IonSegmentButton value="planning"><IonLabel>📌 Planificar</IonLabel></IonSegmentButton>
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

          {activeTab !== 'planning' && (
             <div className="tab-content">
              {activeTab === 'active' && <IonSearchbar value={searchTerm} onIonChange={e => setSearchTerm(e.detail.value!)} placeholder="Buscar tarea..." className="custom-searchbar" />}
              <TaskList
                tasks={filteredTasks}
                emptyMessage={
                  activeTab === 'active' ? (searchTerm.trim() ? 'No se encontraron tareas' : 'Sin tareas pendientes') :
                  activeTab === 'expired' ? 'Sin tareas vencidas' :
                  'Sin tareas completadas aún'
                }
                emptyIcon={
                  activeTab === 'active' ? '✅' :
                  activeTab === 'expired' ? '🎉' :
                  '🏆'
                }
                onSelectTask={activeTab === 'active' ? handleSelectTask : undefined}
                onDeleteTask={handleDeleteTask}
                onCompleteTask={activeTab === 'active' ? handleCompleteTask : undefined}
                 onViewTask={handleViewTask}
                showConflicts={activeTab === 'active'}
                allTasks={tasks}
              />
            </div>
          )}
        </div>

        <TaskModal isOpen={showTaskModal} task={selectedTaskForModal} onClose={() => { setShowTaskModal(false); setSelectedTaskForModal(null); }} onLoadTask={handleSelectTask} />
        <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMessage} duration={2000} position="bottom" color={toastColor} />
      </IonContent>
    </IonPage>
  );
};

export default TasksPage;
