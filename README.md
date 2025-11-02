# 🎯 PoliFocusTask - Sistema de Gestión de Tareas con Técnica Pomodoro

<div align="center">

![Ionic](https://img.shields.io/badge/Ionic-8.0-3880FF?style=for-the-badge&logo=ionic&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-6.0-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)

Sistema de gestión de tareas con técnica Pomodoro optimizado para dispositivos móviles.
Arquitectura standalone con persistencia offline completa.

[📱 Demo](#) • [📖 Documentación](./docs/ARCHITECTURE.md) • [🚀 Instalación](#instalación)

</div>

---

## ✨ Características Principales

- ✅ **Gestión de Tareas**: CRUD completo con prioridades, duración y recurrencia
- ⏱️ **Temporizador Pomodoro**: Ciclos configurables con ejecución en segundo plano
- 📅 **Calendario**: Vistas día/semana/mes con visualización de tareas
- 📊 **Estadísticas**: Reportes de cumplimiento y eficiencia temporal
- 🔔 **Notificaciones**: Alertas locales 15 y 5 minutos antes de tareas
- 💾 **Offline-First**: Funciona completamente sin conexión a internet
- 🎨 **Tema Oscuro**: Diseño moderno optimizado para móviles

---

## 🏗️ Arquitectura
```
PoliFocusTask/
├── 📁 src/
│   ├── 📁 models/          # Interfaces TypeScript
│   ├── 📁 services/        # Lógica de negocio
│   ├── 📁 contexts/        # Estado global (Context API)
│   ├── 📁 hooks/           # Custom hooks
│   ├── 📁 pages/           # Pantallas de la app
│   ├── 📁 utils/           # Funciones auxiliares
│   └── 📁 theme/           # Estilos globales
├── 📁 android/             # Proyecto Android nativo
└── 📁 docs/                # Documentación técnica
```

---

## 🚀 Instalación

### Requisitos Previos

- **Node.js** 18+ y npm
- **Ionic CLI**: `npm install -g @ionic/cli`
- **Android Studio** (para desarrollo Android)
- **JDK 17** (para compilación Android)

### Pasos de Instalación
```bash
# 1. Clonar el repositorio
git clone https://github.com/DylanMR9d/PoliFocusTask.git
cd PoliFocusTask

# 2. Instalar dependencias
npm install

# 3. Ejecutar en navegador
ionic serve

# 4. Compilar para Android
npm run build
npx cap sync
npx cap open android
```

---

## 📱 Pruebas en Dispositivos

### Navegador (Desarrollo)
```bash
ionic serve
# Abre http://localhost:8100
```

### Android
```bash
npm run build
npx cap sync
npx cap open android
# Presiona ▶️ Run en Android Studio
```

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **Ionic** | 8.x | Framework UI multiplataforma |
| **React** | 18.x | Librería de componentes |
| **TypeScript** | 5.x | Tipado estático |
| **Capacitor** | 6.x | Bridge nativo (Android/iOS) |
| **Capacitor Preferences** | 6.x | Almacenamiento local |
| **Chart.js** | 4.x | Gráficos estadísticos |
| **date-fns** | 2.x | Manejo de fechas |

---

## 📋 Fases de Desarrollo

### ✅ Fase 1: Setup Inicial (Completada)
- [x] Proyecto Ionic + React + TypeScript
- [x] Estructura de carpetas
- [x] Navegación por tabs
- [x] Theme oscuro personalizado
- [x] Modelos TypeScript

### ✅ Fase 2: Storage y Persistencia (Completada)
- [x] Servicio de almacenamiento (Capacitor Preferences)
- [x] Context API para estado global
- [x] Custom hooks (useStorage)
- [x] Utilidades de fechas
- [x] Pruebas de persistencia offline

### 🔄 Fase 3: Gestión de Tareas (En Desarrollo)
- [ ] Formulario de creación de tareas
- [ ] Lista de tareas (activas, vencidas, completadas)
- [ ] Detección de conflictos de horarios
- [ ] Tareas recurrentes
- [ ] Búsqueda y filtrado

### 🔜 Próximas Fases
- Fase 4: Temporizador Pomodoro (UI básica)
- Fase 5: Background y Notificaciones
- Fase 6: Calendario
- Fase 7: Reportes y Estadísticas
- Fase 8: Configuración avanzada

---

## 📖 Documentación Adicional

- [📐 Arquitectura Detallada](./docs/ARCHITECTURE.md)
- [🔧 Guía de Setup](./docs/SETUP.md)
- [📝 Changelog](./docs/CHANGELOG.md)
- [🧪 Testing](./docs/TESTING.md)

---

## 🤝 Contribución

Este proyecto está en desarrollo activo. Las contribuciones son bienvenidas siguiendo estos pasos:

1. Fork del repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Add: nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](./LICENSE) para más detalles.

---

## 👨‍💻 Autor

**Dylan MR**
- GitHub: [@DylanMR9d](https://github.com/DylanMR9d)
- Proyecto: [PoliFocusTask](https://github.com/DylanMR9d/PoliFocusTask)

---

## 🙏 Agradecimientos

- [Ionic Framework](https://ionicframework.com/)
- [React](https://react.dev/)
- [Capacitor](https://capacitorjs.com/)
- Comunidad de desarrolladores open source

---

<div align="center">

**⭐ Si este proyecto te fue útil, dale una estrella en GitHub ⭐**

[⬆ Volver arriba](#-polifocustask---sistema-de-gestión-de-tareas-con-técnica-pomodoro)

</div>