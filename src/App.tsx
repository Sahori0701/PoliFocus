// App.tsx
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
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

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
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

/* Context Provider */
import { AppProvider } from './context/AppContext';

setupIonicReact({
  mode: 'md', // Material Design para consistencia
});

const App: React.FC = () => (
  <IonApp>
    <AppProvider>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/tasks">
              <TasksPage />
            </Route>
            <Route exact path="/timer">
              <TimerPage />
            </Route>
            <Route exact path="/calendar">
              <CalendarPage />
            </Route>
            <Route exact path="/reports">
              <ReportsPage />
            </Route>
            <Route exact path="/settings">
              <SettingsPage />
            </Route>
            <Route exact path="/">
              <Redirect to="/tasks" />
            </Route>
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            {/* Ruta corregida para TAREAS */}
            <IonTabButton tab="tasks" href="/tasks">
              <IonIcon aria-hidden="true" icon={listOutline} />
              <IonLabel>Tareas</IonLabel>
            </IonTabButton>

            {/* Ruta corregida para FOCO (TIMER) */}
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
    </AppProvider>
  </IonApp>
);

export default App;
