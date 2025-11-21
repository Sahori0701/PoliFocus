import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import './WelcomeModal.css';
import './Header.css'; // Importamos los estilos del Header
import { Pagination } from 'swiper/modules';
import React from 'react';
import { IonModal, IonContent, IonButton } from '@ionic/react';

// Custom SVG Icons (se mantienen los iconos de los slides)
const TaskIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 5h.01M12 12h.01M15 12h.01" />
  </svg>
);

const PlanIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ActiveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const OverdueIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const CompletedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const FocusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const StatsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
  </svg>
);

const ReadyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
    </svg>
  );
  

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="welcome-modal">
      <IonContent className="ion-padding">
        {/* === HEADER ACTUALIZADO === */}
        <div className="header-container" style={{ justifyContent: 'center', paddingTop: '2rem', paddingBottom: '1rem' }}>
            <div className="header-logo">
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                    </defs>
                    <path d="M16 31C24.2843 31 31 24.2843 31 16C31 7.71573 24.2843 1 16 1C7.71573 1 1 7.71573 1 16C1 24.2843 7.71573 31 16 31Z" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <path d="M22.2427 9.75738C20.9383 8.45295 19.2089 7.58691 17.3536 7.27548L14.7247 14.7248L7.27535 17.3537C7.58678 19.209 8.45282 20.9384 9.75725 22.2428C12.3093 24.7949 16.1998 25.1673 19.1437 23.4211L23.421 19.1438C25.1672 16.1999 24.7948 12.3094 22.2427 9.75738Z" fill="url(#logoGradient)"/>
                </svg>
            </div>
            <div className="header-title-wrapper">
                <h1 className="header-main-title" style={{ fontSize: '1.8rem' }}>PoliFocusTask</h1>
            </div>
        </div>

        <Swiper pagination={true} modules={[Pagination]} className="mySwiper">
           {/* Slides se mantienen igual... */}
           <SwiperSlide>
            <div className="slide-content">
              <div className="slide-icon"><TaskIcon /></div>
              <h2>Gestiona tus Tareas</h2>
              <p>Crea, prioriza y organiza tus actividades en un solo lugar para mantener el control de tus proyectos.</p>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="slide-content">
              <div className="slide-icon"><PlanIcon /></div>
              <h2>Planificación Inteligente</h2>
              <p>Asigna fechas y utiliza filtros para visualizar tus tareas activas, vencidas o completadas.</p>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="slide-content">
              <div className="sub-slide-container">
                <div className="sub-slide-item">
                  <div className="sub-slide-icon"><ActiveIcon /></div>
                  <h3>Activas</h3>
                </div>
                <div className="sub-slide-item">
                  <div className="sub-slide-icon overdue"><OverdueIcon /></div>
                  <h3>Vencidas</h3>
                </div>
                <div className="sub-slide-item">
                  <div className="sub-slide-icon completed"><CompletedIcon /></div>
                  <h3>Completadas</h3>
                </div>
              </div>
              <h2>Control Total sobre tus Tareas</h2>
              <p>Filtra tus tareas por estado para mantenerte enfocado en lo que realmente importa en cada momento.</p>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="slide-content">
              <div className="slide-icon"><FocusIcon /></div>
              <h2>Maximiza tu Productividad</h2>
              <p>Usa la técnica Pomodoro para mejorar tu concentración y evitar el agotamiento.</p>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="slide-content">
              <div className="slide-icon"><CalendarIcon /></div>
              <h2>Visualiza tu Éxito</h2>
              <p>Observa tus tareas en un calendario y planifica tu semana para alcanzar tus metas.</p>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="slide-content">
                <div className="slide-icon"><StatsIcon /></div>
                <h2>Mide tu Progreso</h2>
                <p>Analiza tu rendimiento y descubre cómo inviertes tu tiempo para optimizar tu flujo de trabajo.</p>
            </div>
            </SwiperSlide>

            <SwiperSlide>
                <div className="slide-content">
                    <div className="slide-icon"><ReadyIcon /></div>
                    <h2>¡Estás listo para triunfar!</h2>
                    <p>Con PoliFocusTask, tienes todo lo que necesitas para ser más productivo. ¡Es hora de empezar!</p>
                    <IonButton onClick={onClose} className="start-button-slide">Comenzar</IonButton>
                </div>
            </SwiperSlide>
        </Swiper>

        <IonButton fill="clear" onClick={onClose} className="skip-button">Saltar</IonButton>
      </IonContent>
    </IonModal>
  );
};

export default WelcomeModal;
