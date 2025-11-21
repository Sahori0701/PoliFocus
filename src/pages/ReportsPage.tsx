// src/pages/ReportsPage.tsx
import React, { useMemo, useEffect, useRef } from 'react';
import { IonContent, IonPage, IonGrid, IonRow, IonCol } from '@ionic/react';
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
    taskService.sortTasks(taskService.filterTasksByStatus(tasks, 'completed'), 'date', 'desc'),
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
    const primaryColor = style.getPropertyValue('--ion-color-primary').trim();
    const successColor = style.getPropertyValue('--ion-color-success').trim();
    const dangerColor = style.getPropertyValue('--ion-color-danger').trim();
    const secondaryColor = style.getPropertyValue('--ion-color-secondary').trim();
    const textColor = style.getPropertyValue('--app-text-secondary').trim();
    const cardBgColor = style.getPropertyValue('--app-bg-card').trim();

    const commonFont = { size: 13, weight: '500' };

    if (statusChartInstance.current) statusChartInstance.current.destroy();
    if (priorityChartInstance.current) priorityChartInstance.current.destroy();
    if (durationChartInstance.current) durationChartInstance.current.destroy();

    const legendLabelOptions = { 
      color: textColor, 
      boxWidth: 10,
      padding: 15,
      font: commonFont
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

    if (durationChartRef.current && completedTasks.length > 0) {
        const lastTasks = completedTasks.slice(0, 7).reverse();
        const ctx = durationChartRef.current.getContext('2d');
        if (ctx) {
            durationChartInstance.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: lastTasks.map(t => new Date(t.completedAt || 0).toLocaleDateString('es-ES', {day: '2-digit', month: 'short'})),
                    datasets: [
                        {
                            label: 'Tiempo Planificado',
                            data: lastTasks.map(t => t.duration),
                            backgroundColor: successColor,
                            borderRadius: 4,
                        },
                        {
                            label: 'Tiempo Real',
                            data: lastTasks.map(t => t.actualDuration || 0),
                            backgroundColor: dangerColor,
                            borderRadius: 4,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: legendLabelOptions
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { color: textColor, padding: 10, font: commonFont },
                            grid: { display: false },
                            title: { display: true, text: 'Minutos', color: textColor, font: { ...commonFont, size: 12 } }
                        },
                        x: {
                            ticks: { color: textColor, font: commonFont },
                            grid: { display: false }
                        }
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
                 <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">📌 Total</span>
                  </div>
                  <div className="stat-card-value">{reportMetrics.totalTasks}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">⚡ Activas</span>
                  </div>
                  <div className="stat-card-value">{reportMetrics.statusCounts.active}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">✅ Completadas</span>
                  </div>
                  <div className="stat-card-value">{reportMetrics.totalCompleted}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">⏰ Vencidas</span>
                  </div>
                  <div className="stat-card-value">{reportMetrics.statusCounts.expired}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">⏳ Horas</span>
                  </div>
                  <div className="stat-card-value">{reportMetrics.totalFocusHours}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">🏆 Eficiencia</span>
                  </div>
                  <div className="stat-card-value">{reportMetrics.overallEfficiency}%</div>
                </div>
              </div>
              
              {tasks.length > 0 ? (
                <>
                  <div className="doughnut-charts-grid">
                    <div className="chart-wrapper">
                      <h3 className="chart-title">🗓️ Distribución de tareas</h3>
                      <div className="doughnut-chart-container"><canvas ref={statusChartRef}></canvas></div>
                    </div>
                    <div className="chart-wrapper">
                      <h3 className="chart-title">🚩 Prioridades de tareas</h3>
                      <div className="doughnut-chart-container"><canvas ref={priorityChartRef}></canvas></div>
                    </div>
                  </div>

                  {completedTasks.length > 0 && (
                    <>
                      <div className="chart-wrapper full-width-chart">
                        <h3 className="chart-title">📈 Planificado vs. Real</h3>
                        <div className="bar-chart-container">
                          <canvas ref={durationChartRef}></canvas>
                        </div>
                      </div>

                      <div className="chart-wrapper full-width-chart">
                        <h3 className="chart-title">📋 Detalle de Tareas</h3>
                        <div className="task-table-container">
                          <table className="task-table">
                            <thead>
                              <tr>
                                <th>Tarea</th>
                                <th>Prioridad</th>
                                <th>Fecha</th>
                                <th>Planificado</th>
                                <th>Real</th>
                                <th>Eficiencia</th>
                              </tr>
                            </thead>
                            <tbody>
                              {completedTasks.slice(0, 10).map(task => {
                                const efficiency = taskService.calculateEfficiency(task.duration, task.actualDuration || 0);
                                return (
                                  <tr key={task.id}>
                                    <td data-label="Tarea">{task.title}</td>
                                    <td data-label="Prioridad" className={`priority-${task.priority}`}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</td>
                                    <td data-label="Fecha">{new Date(task.completedAt || 0).toLocaleDateString('es-ES', { day: '2-digit', month: 'short'})}</td>
                                    <td data-label="Planificado">{task.duration} min</td>
                                    <td data-label="Real">{task.actualDuration || 0} min</td>
                                    <td data-label="Eficiencia" className="efficiency-cell">{efficiency.icon} {Number(efficiency.percentage).toFixed(0)}%</td>
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
