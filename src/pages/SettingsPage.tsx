// pages/SettingsPage.tsx
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonToast,
  IonLoading,
} from '@ionic/react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { storageService } from '../services/storage.service';
import { notificationService } from '../services/notification.service';
import { Task } from '../models/Task';
import Header from '../components/Header';

const SettingsPage: React.FC = () => {
  const { tasks, config, addTask, loadTasks, isLoading } = useApp();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [testTitle, setTestTitle] = useState('');

  const handleTestStorage = async () => {
    try {
      const testTask: Task = {
        id: Date.now(),
        title: testTitle || 'Tarea de Prueba',
        scheduledStart: new Date().toISOString(),
        duration: 25,
        priority: 'medium',
        status: 'pending',
        createdAt: new Date().toISOString(),
        isRecurring: false,
      };
      await addTask(testTask);
      setToastMessage('✅ Tarea guardada correctamente');
      setShowToast(true);
      setTestTitle('');
    } catch (error) {
      setToastMessage('❌ Error al guardar tarea');
      setShowToast(true);
    }
  };

  const handleTestNotification = async () => {
    setToastMessage('🔔 Programando notificación de prueba...');
    setShowToast(true);
    await notificationService.scheduleTestNotification();
  };

  const handleClearData = async () => {
    if (window.confirm('¿Estás seguro de borrar todos los datos?')) {
      try {
        await storageService.clearAll();
        await loadTasks();
        setToastMessage('🗑️ Todos los datos borrados');
        setShowToast(true);
      } catch (error) {
        setToastMessage('❌ Error al borrar datos');
        setShowToast(true);
      }
    }
  };

  const handleExportData = async () => {
    try {
      const data = await storageService.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `polifocus-backup-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setToastMessage('📦 Datos exportados correctamente');
      setShowToast(true);
    } catch (error) {
      setToastMessage('❌ Error al exportar datos');
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <Header />
      
      <IonContent fullscreen>
        <IonLoading isOpen={isLoading} message="Cargando..." />
        
        <div style={{ padding: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Ajustes ⚙️
          </h2>

          {/* Prueba de Notificaciones */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle style={{ color: 'var(--app-primary)' }}>
                🧪 Prueba de Notificaciones
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p style={{ fontSize: '0.875rem', color: 'var(--app-text-secondary)', marginBottom: '1rem' }}>
                Presiona el botón para programar una notificación de prueba. Debería aparecer en 5 segundos, incluso si la app está en segundo plano.
              </p>
              <IonButton 
                expand="block" 
                onClick={handleTestNotification}
              >
                Probar Notificación
              </IonButton>
            </IonCardContent>
          </IonCard>

          {/* Prueba de Storage */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle style={{ color: 'var(--app-primary)' }}>
                🧪 Prueba de Storage
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonLabel position="stacked">Título de tarea de prueba</IonLabel>
                <IonInput
                  value={testTitle}
                  placeholder="Ej: Estudiar React"
                  onIonChange={e => setTestTitle(e.detail.value!)}
                />
              </IonItem>
              
              <IonButton 
                expand="block" 
                onClick={handleTestStorage}
                style={{ marginTop: '1rem' }}
              >
                Guardar Tarea de Prueba
              </IonButton>

              <div style={{ 
                marginTop: '1rem', 
                padding: '0.75rem',
                background: 'var(--app-bg-elevated)',
                borderRadius: '0.5rem',
              }}>
                <strong>Tareas almacenadas:</strong> {tasks.length}
                <br />
                <small style={{ color: 'var(--app-text-secondary)' }}>
                  {tasks.length === 0 
                    ? 'No hay tareas guardadas'
                    : `Última: ${tasks[tasks.length - 1]?.title || 'N/A'}`
                  }
                </small>
              </div>
            </IonCardContent>
          </IonCard>
          
          {/* Información */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle style={{ color: 'var(--app-primary)' }}>
                Acerca de
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p style={{ color: 'var(--app-text-secondary)', marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--app-primary)' }}>
                  PoliFocusTask v11 - Ionic
                </strong>
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--app-text-secondary)' }}>
                Sistema de gestión de tareas con técnica Pomodoro.
                Arquitectura standalone optimizada para móviles.
              </p>
              <div style={{ 
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'var(--app-bg-elevated)',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
              }}>
                <strong>Configuración actual:</strong><br />
                Foco: {config.focusTime} min<br />
                Descanso corto: {config.shortBreak} min<br />
                Descanso largo: {config.longBreak} min
              </div>
            </IonCardContent>
          </IonCard>

          {/* Stack Tecnológico */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle style={{ color: 'var(--app-primary)' }}>
                Stack Tecnológico
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p style={{ fontSize: '0.875rem', color: 'var(--app-text-secondary)' }}>
                Ionic 8 • React 18 • TypeScript • Capacitor 6 • Chart.js
              </p>
            </IonCardContent>
          </IonCard>

          {/* Acciones de Datos */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle style={{ color: 'var(--app-primary)' }}>
                Gestión de Datos
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonButton 
                expand="block" 
                color="primary"
                onClick={handleExportData}
              >
                📦 Exportar Datos
              </IonButton>
              
              <IonButton 
                expand="block" 
                color="danger"
                onClick={handleClearData}
                style={{ marginTop: '0.5rem' }}
              >
                🗑️ Borrar Todos los Datos
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
