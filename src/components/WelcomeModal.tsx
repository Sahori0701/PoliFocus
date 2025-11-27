import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import './WelcomeModal.css';
import { Pagination } from 'swiper/modules';
import React from 'react';
import { IonModal, IonContent, IonButton, IonHeader, IonToolbar, IonButtons, IonTitle } from '@ionic/react';
import './Header.css'; // Reutilizamos el CSS del Header principal

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {

  const gradientId = `logoGradient-welcome-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="welcome-modal">
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ paddingTop: 'var(--ion-safe-area-top)' }}>
          <IonTitle>
            <div className="header-title-content">
              <div className="header-logo">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <path d="M16 31C24.2843 31 31 24.2843 31 16C31 7.71573 24.2843 1 16 1C7.71573 1 1 7.71573 1 16C1 24.2843 7.71573 31 16 31Z" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M22.2427 9.75738C20.9383 8.45295 19.2089 7.58691 17.3536 7.27548L14.7247 14.7248L7.27535 17.3537C7.58678 19.209 8.45282 20.9384 9.75725 22.2428C12.3093 24.7949 16.1998 25.1673 19.1437 23.4211L23.421 19.1438C25.1672 16.1999 24.7948 12.3094 22.2427 9.75738Z" fill={`url(#${gradientId})`}/>
                </svg>
              </div>
              <span className="header-main-title">PoliFocusTask</span>
            </div>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Saltar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <Swiper pagination={true} modules={[Pagination]} className="mySwiper">
          {/* Slide 1: Bienvenida */}
          <SwiperSlide>
            <div className="slide-content">
              <h2 className="slide-emoji">👋</h2>
              <h2>¡Bienvenido a PoliFocusTask!</h2>
              <p className="slide-description">
                Tu compañero definitivo para combatir la procrastinación y maximizar tu productividad.
              </p>
              <div className="feature-list">
                <div className="feature-item">
                  <span className="feature-emoji">📋</span>
                  <span>Organiza tus tareas de forma inteligente</span>
                </div>
                <div className="feature-item">
                  <span className="feature-emoji">⏱️</span>
                  <span>Técnica Pomodoro integrada</span>
                </div>
                <div className="feature-item">
                  <span className="feature-emoji">📊</span>
                  <span>Analiza tu productividad</span>
                </div>
                <div className="feature-item">
                  <span className="feature-emoji">🔔</span>
                  <span>Notificaciones inteligentes</span>
                </div>
              </div>
            </div>
          </SwiperSlide>

          {/* Slide 2: Cómo crear tareas */}
          <SwiperSlide>
            <div className="slide-content">
              <h2 className="slide-emoji">📌</h2>
              <h2>Paso 1: Crea tus Tareas</h2>
              <p className="slide-subtitle">Dirígete a la pestaña "Planificar" 📌</p>
              
              <div className="instruction-steps">
                <div className="step-item">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <h3>🗂️ Describe tu tarea</h3>
                    <p>Escribe qué necesitas hacer (ej: "Estudiar matemáticas")</p>
                  </div>
                </div>
                
                <div className="step-item">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <h3>📅 Programa fecha y hora</h3>
                    <p>Elige cuándo quieres realizarla</p>
                  </div>
                </div>
                
                <div className="step-item">
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <h3>⏱️ Define la duración</h3>
                    <p>Estima cuántos minutos te tomará (mínimo 5 min)</p>
                  </div>
                </div>
                
                <div className="step-item">
                  <span className="step-number">4</span>
                  <div className="step-content">
                    <h3>🔥 Asigna prioridad</h3>
                    <p>Baja ❄️, Media ⚡ o Alta 🔥</p>
                  </div>
                </div>
              </div>
              
              <div className="tip-box">
                <span className="tip-emoji">💡</span>
                <p><strong>Tip:</strong> Recibirás notificaciones 15 y 5 minutos antes de cada tarea</p>
              </div>
            </div>
          </SwiperSlide>

          {/* Slide 3: Tareas Recurrentes */}
          <SwiperSlide>
            <div className="slide-content">
              <h2 className="slide-emoji">🔄</h2>
              <h2>Tareas Recurrentes</h2>
              <p className="slide-subtitle">Para hábitos y rutinas diarias</p>
              
              <div className="recurring-options">
                <div className="option-card">
                  <span className="option-emoji">📅</span>
                  <h3>Diaria</h3>
                  <p>Todos los días</p>
                </div>
                
                <div className="option-card">
                  <span className="option-emoji">📅</span>
                  <h3>Semanal</h3>
                  <p>Cada semana</p>
                </div>
                
                <div className="option-card">
                  <span className="option-emoji">📋</span>
                  <h3>Días específicos</h3>
                  <p>Lun, Mié, Vie...</p>
                </div>
                
                <div className="option-card">
                  <span className="option-emoji">⚙️</span>
                  <h3>Personalizada</h3>
                  <p>Cada N minutos/horas/días</p>
                </div>
              </div>
              
              <div className="tip-box">
                <span className="tip-emoji">💡</span>
                <p><strong>Ejemplo:</strong> "Hacer ejercicio" cada Lunes, Miércoles y Viernes a las 7:00 AM</p>
              </div>
            </div>
          </SwiperSlide>

          {/* Slide 4: Gestión de Tareas */}
          <SwiperSlide>
            <div className="slide-content">
              <h2 className="slide-emoji">⚡</h2>
              <h2>Paso 2: Gestiona tus Tareas</h2>
              <p className="slide-subtitle">Pestaña "Activas" ⚡</p>
              
              <div className="task-states">
                <div className="state-card active-card">
                  <h3>⚡ Activas</h3>
                  <p>Tareas pendientes que aún no han vencido</p>
                  <div className="state-actions">
                    <span>▶️ Iniciar</span>
                    <span>✅ Completar</span>
                    <span>🔄 Reprogramar</span>
                  </div>
                </div>
                
                <div className="state-card expired-card">
                  <h3>⏰ Vencidas</h3>
                  <p>Tareas que ya pasaron su hora programada</p>
                  <div className="state-actions">
                    <span>🔄 Reprogramar</span>
                    <span>🗑️ Eliminar</span>
                  </div>
                </div>
                
                <div className="state-card completed-card">
                  <h3>✅ Completadas</h3>
                  <p>Tareas finalizadas con análisis de eficiencia</p>
                  <div className="efficiency-badge">
                    <span>⚡ +5 min</span>
                    <span>✓ -2 min</span>
                  </div>
                </div>
              </div>
              
              <div className="tip-box">
                <span className="tip-emoji">⚠️</span>
                <p><strong>Conflictos:</strong> La app detecta si dos tareas se solapan y te avisa</p>
              </div>
            </div>
          </SwiperSlide>

          {/* Slide 5: Temporizador Pomodoro */}
          <SwiperSlide>
            <div className="slide-content">
              <h2 className="slide-emoji">🎯</h2>
              <h2>Paso 3: Técnica Pomodoro</h2>
              <p className="slide-subtitle">Pestaña "Foco" 🎯 - El corazón de la app</p>
              
              <div className="pomodoro-flow">
                <div className="flow-step">
                  <span className="flow-emoji">1️⃣</span>
                  <h3>Selecciona una tarea</h3>
                  <p>Presiona ▶️ en cualquier tarea activa</p>
                </div>
                
                <div className="flow-arrow">↓</div>
                
                <div className="flow-step">
                  <span className="flow-emoji">2️⃣</span>
                  <h3>Inicia el temporizador</h3>
                  <p>Ciclo de concentración (default: 15 min)</p>
                </div>
                
                <div className="flow-arrow">↓</div>
                
                <div className="flow-step">
                  <span className="flow-emoji">3️⃣</span>
                  <h3>¡Trabaja enfocado!</h3>
                  <p>Sin distracciones hasta que suene la alarma</p>
                </div>
                
                <div className="flow-arrow">↓</div>
                
                <div className="flow-step">
                  <span className="flow-emoji">4️⃣</span>
                  <h3>Descanso automático</h3>
                  <p>Corto (5 min) o Largo (15 min cada 4 ciclos)</p>
                </div>
              </div>
              
              <div className="tip-box">
                <span className="tip-emoji">💡</span>
                <p><strong>Importante:</strong> El tiempo se divide automáticamente en ciclos hasta completar la duración total de tu tarea</p>
              </div>
            </div>
          </SwiperSlide>

          {/* Slide 6: Controles del Temporizador */}
          <SwiperSlide>
            <div className="slide-content">
              <h2 className="slide-emoji">⏯️</h2>
              <h2>Controles del Temporizador</h2>
              
              <div className="controls-grid">
                <div className="control-card">
                  <span className="control-emoji">▶️</span>
                  <h3>Iniciar / Pausar</h3>
                  <p>Controla tu sesión de trabajo</p>
                </div>
                
                <div className="control-card">
                  <span className="control-emoji">✅</span>
                  <h3>Completar Tarea</h3>
                  <p>Marca como finalizada antes de tiempo</p>
                </div>
                
                <div className="control-card">
                  <span className="control-emoji">⏭️</span>
                  <h3>Saltar Descanso</h3>
                  <p>Vuelve al trabajo inmediatamente</p>
                </div>
              </div>
              
              <div className="timer-features">
                <h3>Mientras trabajas verás:</h3>
                <div className="feature-grid">
                  <div className="mini-feature">
                    <span>⏱️</span>
                    <p>Tiempo restante del ciclo</p>
                  </div>
                  <div className="mini-feature">
                    <span>📊</span>
                    <p>Porcentaje completado</p>
                  </div>
                  <div className="mini-feature">
                    <span>🎯</span>
                    <p>Tiempo total de la tarea</p>
                  </div>
                  <div className="mini-feature">
                    <span>📌</span>
                    <p>Nombre de la tarea</p>
                  </div>
                </div>
              </div>
              
              <div className="tip-box">
                <span className="tip-emoji">🔔</span>
                <p><strong>Notificación persistente:</strong> Verás el temporizador en tu barra de notificaciones mientras trabajas</p>
              </div>
            </div>
          </SwiperSlide>

          {/* Slide 7: Calendario */}
          <SwiperSlide>
            <div className="slide-content">
              <h2 className="slide-emoji">📅</h2>
              <h2>Paso 4: Visualiza tu Agenda</h2>
              <p className="slide-subtitle">Pestaña "Calendario" 📅</p>
              
              <div className="calendar-views">
                <div className="view-card">
                  <span className="view-emoji">🗓️</span>
                  <h3>Vista Mes</h3>
                  <p>Panorama completo de tus tareas</p>
                  <div className="view-feature">Puntos de colores por estado</div>
                </div>
                
                <div className="view-card">
                  <span className="view-emoji">📅</span>
                  <h3>Vista Semana</h3>
                  <p>Planificación semanal detallada</p>
                  <div className="view-feature">Bloques horarios por tarea</div>
                </div>
                
                <div className="view-card">
                  <span className="view-emoji">☀️</span>
                  <h3>Vista Día</h3>
                  <p>Agenda completa del día</p>
                  <div className="view-feature">Línea de tiempo actual</div>
                </div>
              </div>
              
              <div className="calendar-actions">
                <h3>Puedes:</h3>
                <div className="action-list">
                  <div className="action-item">
                    <span>👆</span>
                    <p>Tocar cualquier tarea para ver detalles</p>
                  </div>
                  <div className="action-item">
                    <span>▶️</span>
                    <p>Activarla directamente desde el calendario</p>
                  </div>
                  <div className="action-item">
                    <span>🔍</span>
                    <p>Ver conflictos de horario visualmente</p>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>

          {/* Slide 8: Estadísticas */}
          <SwiperSlide>
            <div className="slide-content">
              <h2 className="slide-emoji">📊</h2>
              <h2>Paso 5: Analiza tu Progreso</h2>
              <p className="slide-subtitle">Pestaña "Stats" 📊</p>
              
              <div className="stats-preview">
                <div className="stat-group">
                  <h3>Métricas Clave</h3>
                  <div className="metrics-grid">
                    <div className="metric-box">
                      <span className="metric-icon">📌</span>
                      <p>Total de tareas</p>
                    </div>
                    <div className="metric-box">
                      <span className="metric-icon">✅</span>
                      <p>Completadas</p>
                    </div>
                    <div className="metric-box">
                      <span className="metric-icon">⏳</span>
                      <p>Horas trabajadas</p>
                    </div>
                    <div className="metric-box">
                      <span className="metric-icon">🏆</span>
                      <p>% Eficiencia</p>
                    </div>
                  </div>
                </div>
                
                <div className="charts-info">
                  <h3>Gráficos incluidos:</h3>
                  <div className="chart-list">
                    <div className="chart-item">
                      <span>📊</span>
                      <p>Distribución de tareas por estado</p>
                    </div>
                    <div className="chart-item">
                      <span>🚩</span>
                      <p>Tareas por nivel de prioridad</p>
                    </div>
                    <div className="chart-item">
                      <span>📈</span>
                      <p>Tiempo planificado vs. tiempo real</p>
                    </div>
                    <div className="chart-item">
                      <span>📋</span>
                      <p>Tabla detallada de eficiencia</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="tip-box">
                <span className="tip-emoji">⚡</span>
                <p><strong>Eficiencia:</strong> Si terminas en menos tiempo = ⚡ Excelente. Si tardas más = ⏱ Mejorable</p>
              </div>
            </div>
          </SwiperSlide>

          {/* Slide 9: Configuración */}
          <SwiperSlide>
            <div className="slide-content">
              <h2 className="slide-emoji">⚙️</h2>
              <h2>Personaliza tu Experiencia</h2>
              <p className="slide-subtitle">Pestaña "Ajustes" ⚙️</p>
              
              <div className="settings-options">
                <div className="setting-card">
                  <span className="setting-emoji">🧠</span>
                  <h3>Tiempo de Concentración</h3>
                  <p>5 - 90 minutos (default: 15 min)</p>
                </div>
                
                <div className="setting-card">
                  <span className="setting-emoji">☕</span>
                  <h3>Descanso Corto</h3>
                  <p>1 - 30 minutos (default: 5 min)</p>
                </div>
                
                <div className="setting-card">
                  <span className="setting-emoji">🛋️</span>
                  <h3>Descanso Largo</h3>
                  <p>5 - 45 minutos (default: 15 min)</p>
                </div>
              </div>
              
              <div className="warning-box">
                <span className="warning-emoji">☢️</span>
                <h3>Zona de Peligro</h3>
                <p>Borrar todos los datos de forma permanente</p>
              </div>
              
              <div className="tip-box">
                <span className="tip-emoji">💡</span>
                <p><strong>Tip:</strong> Todos los datos se guardan localmente en tu dispositivo. Funciona 100% offline</p>
              </div>
            </div>
          </SwiperSlide>

          {/* Slide 10: Consejos Finales */}
          <SwiperSlide>
            <div className="slide-content">
              <h2 className="slide-emoji">🚀</h2>
              <h2>¡Listo para ser Productivo!</h2>
              
              <div className="tips-final">
                <h3>Consejos para el éxito:</h3>
                
                <div className="final-tip">
                  <span className="final-emoji">1️⃣</span>
                  <p><strong>Planifica con anticipación:</strong> Crea tus tareas la noche anterior</p>
                </div>
                
                <div className="final-tip">
                  <span className="final-emoji">2️⃣</span>
                  <p><strong>Sé realista:</strong> Estima duraciones alcanzables</p>
                </div>
                
                <div className="final-tip">
                  <span className="final-emoji">3️⃣</span>
                  <p><strong>Respeta los descansos:</strong> Son cruciales para mantener la concentración</p>
                </div>
                
                <div className="final-tip">
                  <span className="final-emoji">4️⃣</span>
                  <p><strong>Revisa tus stats:</strong> Aprende de tus patrones de trabajo</p>
                </div>
                
                <div className="final-tip">
                  <span className="final-emoji">5️⃣</span>
                  <p><strong>Mantén el foco:</strong> Durante los ciclos Pomodoro, elimina distracciones</p>
                </div>
              </div>
              
              <div className="success-message">
                <span className="success-emoji">🎯</span>
                <h3>¡La productividad está a un toque de distancia!</h3>
                <p>Comienza creando tu primera tarea en la pestaña 📌 Planificar</p>
              </div>
              
              <IonButton onClick={onClose} className="start-button-slide" expand="block">
                ¡Comenzar Ahora! 🚀
              </IonButton>
            </div>
          </SwiperSlide>
        </Swiper>
      </IonContent>
    </IonModal>
  );
};

export default WelcomeModal;
