// src/pages/ReportsPage.tsx
import React, { useMemo, useEffect, useRef } from 'react';
import { IonContent, IonPage, IonGrid, IonRow, IonCol, IonIcon } from '@ionic/react';
import { listOutline, playCircleOutline, checkmarkDoneCircleOutline, closeCircleOutline, stopwatchOutline, flashOutline } from 'ionicons/icons';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
import { useApp } from '../context/AppContext';
import { taskService } from '../services/task.service';
import Header from '../components/Header';
import './ReportsPage.css';

Chart.register(...registerables);

const ReportsPage: React.FC = () => {
  const { tasks } = useApp();
  const statusChartRef = useRef<HTMLCanvasElement>(null);
  const priorityChartRef = useRef<HTMLCanvasElement>(null);
  const durationChartRef = useRef<HTMLCanvasElement>(null);
  const statusChartInstance = useRef<Chart | null>(null);
  const priorityChartInstance = useRef<Chart | null>(null);
  const durationChartInstance = useRef<Chart | null>(null);

  const completedTasks = useMemo(() => 
    taskService.sortTasks(taskService.filterTasksByStatus(tasks, 'completed'), 'completedAt', 'desc'),
    [tasks]
  );

  const reportMetrics = useMemo(() => {
    const totalCompleted = completedTasks.length;
    const totalPlannedDuration = completedTasks.reduce((sum, task) => sum + task.duration, 0);
    const totalActualDuration = completedTasks.reduce((sum, task) => sum + (task.actualDuration || 0), 0);
    const efficiency = taskService.calculateEfficiency(totalPlannedDuration, totalActualDuration);

    return {
      totalTasks: tasks.length,
      totalCompleted,
      totalFocusHours: (totalActualDuration / 60).toFixed(1),
      overallEfficiency: Number(efficiency.percentage).toFixed(0),
      statusCounts: {
        completed: totalCompleted,
        active: taskService.filterTasksByStatus(tasks, 'active').length,
        expired: taskService.filterTasksByStatus(tasks, 'expired').length
      },
      priorityCounts: {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length,
      }
    };
  }, [completedTasks, tasks]);

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const primaryColor = style.getPropertyValue('--ion-color-primary').trim(); // This is Green in your app
    const successColor = style.getPropertyValue('--ion-color-success').trim(); // This is Blue in your app
    const dangerColor = style.getPropertyValue('--ion-color-danger').trim();
    const secondaryColor = style.getPropertyValue('--ion-color-secondary').trim();
    const textColor = style.getPropertyValue('--app-text-secondary').trim();
    const borderColor = style.getPropertyValue('--app-border').trim();
    const cardBgColor = style.getPropertyValue('--app-bg-card').trim();

    if (statusChartInstance.current) statusChartInstance.current.destroy();
    if (priorityChartInstance.current) priorityChartInstance.current.destroy();
    if (durationChartInstance.current) durationChartInstance.current.destroy();

    const legendLabelOptions = { 
      color: textColor, 
      boxWidth: 12, 
      padding: 20,
      font: { size: 12 }
    };

    const commonDoughnutOptions = {
      responsive: true, 
      maintainAspectRatio: false, 
      cutout: '65%',
      plugins: { 
        legend: { 
          position: 'bottom' as const, 
          labels: legendLabelOptions
        }
      }
    };

    // Chart 1: Task Status Distribution - Using the correct color variables
    if (statusChartRef.current) {
      const ctx = statusChartRef.current.getContext('2d');
      if (ctx) {
        statusChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: { labels: ['Completadas', 'Activas', 'Vencidas'], datasets: [{ data: [reportMetrics.statusCounts.completed, reportMetrics.statusCounts.active, reportMetrics.statusCounts.expired], backgroundColor: [successColor, primaryColor, dangerColor], borderColor: cardBgColor, borderWidth: 8, borderRadius: 8 }] },
          options: commonDoughnutOptions
        } as ChartConfiguration);
      }
    }

    // Chart 2: Task Priority Distribution
    if (priorityChartRef.current) {
      const ctx = priorityChartRef.current.getContext('2d');
      if (ctx) {
        priorityChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: { labels: ['Alta', 'Media', 'Baja'], datasets: [{ data: [reportMetrics.priorityCounts.high, reportMetrics.priorityCounts.medium, reportMetrics.priorityCounts.low], backgroundColor: [dangerColor, secondaryColor, primaryColor], borderColor: cardBgColor, borderWidth: 8, borderRadius: 8 }] },
          options: commonDoughnutOptions
        } as ChartConfiguration);
      }
    }

    // Chart 3: Planned vs. Real Duration
    if (durationChartRef.current && completedTasks.length > 0) {
        const lastTasks = completedTasks.slice(0, 7).reverse();
        const ctx = durationChartRef.current.getContext('2d');
        if (ctx) {
            durationChartInstance.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: lastTasks.map(t => new Date(t.completedAt || 0).toLocaleDateString('es-ES', {day: '2-digit', month: 'short'})),
                    datasets: [
                        { label: 'Tiempo Planificado', data: lastTasks.map(t => t.duration), backgroundColor: secondaryColor + 'B3', borderRadius: 4 },
                        { label: 'Tiempo Real', data: lastTasks.map(t => t.actualDuration || 0), backgroundColor: dangerColor + 'B3', borderRadius: 4 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: legendLabelOptions } },
                    scales: {
                        y: { beginAtZero: true, ticks: { color: textColor, padding: 10, font: { size: 12 } }, grid: { color: borderColor }, title: { display: true, text: 'Minutos', color: textColor, font: { size: 14, weight: 'bold'} } },
                        x: { ticks: { color: textColor, font: { size: 12 } }, grid: { display: false } }
                    }
                }
            } as ChartConfiguration);
        }
    }

  }, [reportMetrics, completedTasks]);
  
  return (
    <IonPage>
      <Header />
      <IonContent fullscreen>
        <IonGrid fixed={true}>
          <IonRow>
            <IonCol>

              <div className="stats-grid">
                <div className="stat-card"><div className="stat-card-title">Total de Tareas</div><div className="stat-card-value"><IonIcon icon={listOutline} className="icon-total" /><span className="stat-card-number">{reportMetrics.totalTasks}</span></div></div>
                <div className="stat-card"><div className="stat-card-title">Tareas Activas</div><div className="stat-card-value"><IonIcon icon={playCircleOutline} className="icon-active" /><span className="stat-card-number">{reportMetrics.statusCounts.active}</span></div></div>
                <div className="stat-card"><div className="stat-card-title">Tareas Completadas</div><div className="stat-card-value"><IonIcon icon={checkmarkDoneCircleOutline} className="icon-completed" /><span className="stat-card-number">{reportMetrics.totalCompleted}</span></div></div>
                <div className="stat-card"><div className="stat-card-title">Tareas Vencidas</div><div className="stat-card-value"><IonIcon icon={closeCircleOutline} className="icon-expired" /><span className="stat-card-number">{reportMetrics.statusCounts.expired}</span></div></div>
                <div className="stat-card"><div className="stat-card-title">Horas de Foco</div><div className="stat-card-value"><IonIcon icon={stopwatchOutline} className="icon-focus" /><span className="stat-card-number">{reportMetrics.totalFocusHours}</span></div></div>
                <div className="stat-card"><div className="stat-card-title">Eficiencia</div><div className="stat-card-value"><IonIcon icon={flashOutline} className="icon-efficiency" /><span className="stat-card-number">{reportMetrics.overallEfficiency}%</span></div></div>
              </div>
              
              {tasks.length > 0 ? (
                <>
                  <div className="doughnut-charts-grid">
                    <div className="chart-wrapper">
                      <h3 className="chart-title">Distribución de Tareas</h3>
                      <div className="doughnut-chart-container"><canvas ref={statusChartRef}></canvas></div>
                    </div>
                    <div className="chart-wrapper">
                      <h3 className="chart-title">Prioridades de Tareas</h3>
                      <div className="doughnut-chart-container"><canvas ref={priorityChartRef}></canvas></div>
                    </div>
                  </div>

                  {completedTasks.length > 0 && (
                    <>
                      <div className="chart-wrapper full-width-chart">
                        <h3 className="chart-title">Planificado vs. Real (Últimas 7 Tareas)</h3>
                        <div className="bar-chart-container">
                          <canvas ref={durationChartRef}></canvas>
                        </div>
                      </div>

                      <div className="chart-wrapper full-width-chart">
                        <h3 className="chart-title">Detalle de Tareas Completadas</h3>
                        <div className="task-table-container">
                          <table className="task-table">
                            <thead><tr><th>Tarea</th><th>Planificado</th><th>Real</th><th>Eficiencia</th></tr></thead>
                            <tbody>
                              {completedTasks.slice(0, 10).map(task => {
                                const efficiency = taskService.calculateEfficiency(task.duration, task.actualDuration || 0);
                                return (
                                  <tr key={task.id}>
                                    <td>{task.title}</td>
                                    <td>{task.duration} min</td>
                                    <td>{task.actualDuration || 0} min</td>
                                    <td className="efficiency-cell">{efficiency.icon} {Number(efficiency.percentage).toFixed(0)}%</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="no-data-message">
                  <p>Aún no hay datos para mostrar. ¡Completa algunas tareas para ver tus estadísticas!</p>
                </div>
              )}

            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default ReportsPage;
