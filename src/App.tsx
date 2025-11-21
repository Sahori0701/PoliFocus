// App.tsx
import React, { useState, useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  isPlatform,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { 
  listOutline, 
  timerOutline, 
  calendarOutline, 
  statsChartOutline, 
  settingsOutline 
} from 'ionicons/icons';

/* Services */
import { notificationService } from './services/notification.service';

/* Core CSS */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

/* Pages */
import TasksPage from './pages/TasksPage';
import TimerPage from './pages/TimerPage';
import CalendarPage from './pages/CalendarPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

/* Components */
import SplashScreen from './components/SplashScreen';
import WelcomeModal from './components/WelcomeModal';

/* Context Provider */
import { AppProvider, useApp } from './context/AppContext';

setupIonicReact({
  mode: 'md',
});

const AppContent: React.FC = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const { showWelcomeModal, setShowWelcomeModal } = useApp();

  useEffect(() => {
    // Inicializa los servicios de la app
    const initializeAppServices = async () => {
      await notificationService.requestPermissions();
      if (isPlatform('android')) {
        await notificationService.createNotificationChannel();
      }
    };
    
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcomeModal');
    const loadingTimeout = setTimeout(() => {
      setIsAppReady(true);
      if (!hasSeenWelcome) {
        setShowWelcomeModal(true);
      }
    }, 2500);

    initializeAppServices();
    return () => clearTimeout(loadingTimeout);
  }, [setShowWelcomeModal]);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('hasSeenWelcomeModal', 'true');
  };

  return (
    <>
      {!isAppReady ? (
        <SplashScreen />
      ) : (
        <>
          <WelcomeModal isOpen={showWelcomeModal} onClose={handleCloseWelcomeModal} />
          <IonReactRouter>
            <IonTabs>
              <IonRouterOutlet>
                <Route exact path="/tasks" component={TasksPage} />
                <Route exact path="/timer" component={TimerPage} />
                <Route path="/calendar" component={CalendarPage} />
                <Route path="/reports" component={ReportsPage} />
                <Route path="/settings" component={SettingsPage} />
                <Route exact path="/">
                  <Redirect to="/tasks" />
                </Route>
              </IonRouterOutlet>

              <IonTabBar slot="bottom">
                <IonTabButton tab="tasks" href="/tasks">
                  <IonIcon aria-hidden="true" icon={listOutline} />
                  <IonLabel>Tareas</IonLabel>
                </IonTabButton>
                <IonTabButton tab="timer" href="/timer">
                  <IonIcon aria-hidden="true" icon={timerOutline} />
                  <IonLabel>Foco</IonLabel>
                </IonTabButton>
                <IonTabButton tab="calendar" href="/calendar">
                  <IonIcon aria-hidden="true" icon={calendarOutline} />
                  <IonLabel>Calendario</IonLabel>
                </IonTabButton>
                <IonTabButton tab="reports" href="/reports">
                  <IonIcon aria-hidden="true" icon={statsChartOutline} />
                  <IonLabel>Stats</IonLabel>
                </IonTabButton>
                <IonTabButton tab="settings" href="/settings">
                  <IonIcon aria-hidden="true" icon={settingsOutline} />
                  <IonLabel>Ajustes</IonLabel>
                </IonTabButton>
              </IonTabBar>
            </IonTabs>
          </IonReactRouter>
        </>
      )}
    </>
  );
};

const App: React.FC = () => (
  <IonApp>
    <AppProvider>
      <AppContent />
    </AppProvider>
  </IonApp>
);

export default App;
