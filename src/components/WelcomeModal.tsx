
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import './WelcomeModal.css';
// import required modules
import { Pagination } from 'swiper/modules';

import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/react';
import {
  listOutline, 
  timerOutline, 
  calendarOutline, 
  statsChartOutline, 
  settingsOutline,
  newspaperOutline, // <-- New Icon
  flashOutline,      // <-- New Icon
  warningOutline,    // <-- New Icon
  checkmarkDoneCircleOutline // <-- New Icon
} from 'ionicons/icons';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="welcome-modal">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Bienvenido a PoliFocusTask</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <Swiper
          pagination={true} 
          modules={[Pagination]} 
          className="mySwiper"
        >
          {/* Slide 1: Tareas */}
          <SwiperSlide>
            <div className="slide-content">
              <IonIcon icon={listOutline} className="slide-icon" />
              <h2>Tareas</h2>
              <p>Organiza tus actividades y proyectos. Crea, edita y elimina tareas con facilidad.</p>
            </div>
          </SwiperSlide>

          {/* Slide 2: Planifica */}
          <SwiperSlide>
            <div className="slide-content">
              <IonIcon icon={newspaperOutline} className="slide-icon" />
              <h2>Planifica tu Día</h2>
              <p>Asigna fechas a tus tareas y usa los filtros para ver tus tareas activas, vencidas o completadas.</p>
            </div>
          </SwiperSlide>

          {/* Slide 3: Estados de Tareas */}
          <SwiperSlide>
            <div className="slide-content">
              <div className="sub-slide-container">
                <div>
                  <IonIcon icon={flashOutline} className="sub-slide-icon" />
                  <h3>Activas</h3>
                </div>
                <div>
                  <IonIcon icon={warningOutline} className="sub-slide-icon overdue" />
                  <h3>Vencidas</h3>
                </div>
                <div>
                  <IonIcon icon={checkmarkDoneCircleOutline} className="sub-slide-icon completed" />
                  <h3>Completadas</h3>
                </div>
              </div>
              <h2>Gestiona tus Tareas</h2>
              <p>Filtra tus tareas por su estado para saber siempre en qué enfocarte.</p>
            </div>
          </SwiperSlide>

          {/* Slide 4: Foco */}
          <SwiperSlide>
            <div className="slide-content">
              <IonIcon icon={timerOutline} className="slide-icon" />
              <h2>Foco (Temporizador)</h2>
              <p>Utiliza la técnica Pomodoro para mantenerte concentrado y productivo.</p>
            </div>
          </SwiperSlide>

          {/* Slide 5: Calendario */}
          <SwiperSlide>
            <div className="slide-content">
              <IonIcon icon={calendarOutline} className="slide-icon" />
              <h2>Calendario</h2>
              <p>Visualiza tus tareas en un calendario y planifica tu semana.</p>
            </div>
          </SwiperSlide>

          {/* Slide 6: Estadísticas */}
          <SwiperSlide>
            <div className="slide-content">
              <IonIcon icon={statsChartOutline} className="slide-icon" />
              <h2>Estadísticas</h2>
              <p>Analiza tu progreso y revisa cómo distribuyes tu tiempo.</p>
            </div>
          </SwiperSlide>

          {/* Slide 7: ¡Todo listo! */}
          <SwiperSlide>
             <div className="slide-content">
              <IonIcon icon={settingsOutline} className="slide-icon" />
              <h2>¡Todo listo!</h2>
              <p>Ya estás preparado para empezar a mejorar tu productividad. ¡A por ello!</p>
              <IonButton onClick={onClose} className="start-button-slide">
                Comenzar
              </IonButton>
            </div>
          </SwiperSlide>
        </Swiper>
      </IonContent>
    </IonModal>
  );
};

export default WelcomeModal;
