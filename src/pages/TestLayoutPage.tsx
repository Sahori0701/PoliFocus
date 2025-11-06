// src/pages/TestLayoutPage.tsx
import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonInput
} from '@ionic/react';
import './TestLayoutPage.css'; // Importaremos un CSS específico para esta página

const TestLayoutPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Prueba de Layout</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div className="test-container">
          
          <h2>Prueba de Inputs en Fila</h2>
          <p>Esta es una prueba aislada. Si los campos de abajo se ven bien, el problema está en otro lugar de la app principal. Si se ven mal, es un problema de renderizado del componente.</p>

          {/* Estructura que replica el problema */}
          <div className="test-form-row">
            <div className="test-form-item-container">
              <IonItem className="test-form-item-wrapper">
                <IonInput placeholder="Campo Izquierdo"></IonInput>
              </IonItem>
            </div>
            <div className="test-form-item-container">
              <IonItem className="test-form-item-wrapper">
                <IonInput placeholder="Campo Derecho"></IonInput>
              </IonItem>
            </div>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default TestLayoutPage;
