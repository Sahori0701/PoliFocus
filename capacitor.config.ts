// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.polifocustask.app',
  appName: 'PoliFocusTask',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    // ---👇 Configuración de la Barra de Estado --- 
    StatusBar: {
      style: 'dark',       // Iconos claros para fondo oscuro
      overlay: false,    // ¡Esta es la clave! Evita la superposición
      backgroundColor: '#111827' // Mismo color que la cabecera
    },
    // ------------------------------------------
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#10b981',
      sound: 'beep.wav',
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#111827',
      showSpinner: false,
    },
  },
};

export default config;
