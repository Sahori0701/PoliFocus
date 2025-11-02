# 📝 Changelog - PoliFocusTask

Registro de cambios por fase de desarrollo.

---

## [Fase 2] - 2025-01-XX - Storage y Persistencia

### ✅ Agregado
- **Storage Service** (`services/storage.service.ts`)
  - CRUD completo para tareas
  - CRUD completo para sesiones Pomodoro
  - Gestión de configuración
  - Exportar/importar datos en JSON
  - Patrón Singleton

- **Context API** (`contexts/AppContext.tsx`)
  - Estado global de la aplicación
  - Hook `useApp()` para acceso fácil
  - Sincronización automática con storage
  - Carga de datos inicial

- **Custom Hooks** (`hooks/useStorage.ts`)
  - `useStorage<T>()` - Hook genérico para persistencia
  - `useSimpleStorage()` - Hook simplificado para strings
  - Manejo de loading y errores

- **Utilidades** (`utils/dateUtils.ts`)
  - Funciones de formato de fechas
  - Cálculos de tiempo (tiempo hasta, vencimiento)
  - Formateo para inputs HTML
  - Funciones de comparación de rangos

- **Página de Settings Mejorada**
  - Prueba de storage con formulario
  - Contador de tareas almacenadas
  - Botones de exportar/borrar datos
  - Visualización de configuración actual

### 🧪 Pruebas
- ✅ Persistencia en navegador (localStorage simulado)
- ✅ Persistencia en Android (Preferences nativo)
- ✅ Recarga de página mantiene datos
- ✅ Cierre/reapertura de app mantiene datos
- ✅ Exportación de datos a JSON

### 📊 Métricas
- **Archivos creados**: 5
- **Líneas de código**: ~800
- **Cobertura de tests**: Pendiente

---

## [Fase 1] - 2025-01-XX - Setup Inicial

### ✅ Agregado
- **Proyecto Base**
  - Ionic 8 + React 18 + TypeScript 5
  - Capacitor 6 para Android/iOS
  - Estructura de carpetas modular

- **Modelos TypeScript** (`models/`)
  - `Task.ts` - Estructura de tareas
  - `Pomodoro.ts` - Sesiones y timer
  - `Config.ts` - Configuración de la app

- **Navegación**
  - Sistema de tabs (5 pantallas)
  - React Router configurado
  - Tab bar personalizado

- **Theme Personalizado** (`theme/variables.css`)
  - Colores oscuros por defecto
  - Variables CSS responsivas
  - Fuentes Dosis + Inter
  - Componentes Ionic personalizados

- **Páginas Base** (`pages/`)
  - TasksPage.tsx - Gestión de tareas
  - TimerPage.tsx - Temporizador Pomodoro
  - CalendarPage.tsx - Vista de calendario
  - ReportsPage.tsx - Estadísticas
  - SettingsPage.tsx - Configuración

### 🎨 Diseño
- Tema oscuro (#111827, #1f2937)
- Color primario verde (#10b981)
- Tipografía: Dosis (títulos) + Inter (cuerpo)
- Responsive desde 320px

### 🧪 Pruebas
- ✅ Compilación exitosa
- ✅ Ejecución en navegador (ionic serve)
- ✅ Build para Android
- ✅ Instalación en dispositivo físico
- ✅ Navegación entre tabs fluida

### 📊 Métricas
- **Archivos creados**: 12
- **Líneas de código**: ~600
- **Tiempo de compilación**: <5s

---

## [Próximas Versiones]

### Fase 3 - Gestión de Tareas (Planificada)
- [ ] Formulario completo de creación
- [ ] Lista de tareas con filtros
- [ ] Detección de conflictos
- [ ] Tareas recurrentes
- [ ] Búsqueda y ordenamiento

### Fase 4 - Temporizador Pomodoro (Planificada)
- [ ] UI del círculo de progreso
- [ ] Controles play/pause/skip
- [ ] División automática de tareas largas
- [ ] Modos focus/break

### Fase 5 - Background y Notificaciones (Planificada)
- [ ] Ejecución en segundo plano
- [ ] Notificaciones locales
- [ ] Alertas de tareas (15min, 5min)
- [ ] Alertas de timer (5min antes)

---

## 📋 Convenciones de Commits

- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `style:` - Formato de código
- `refactor:` - Refactorización de código
- `test:` - Agregar/modificar tests
- `chore:` - Tareas de mantenimiento

---

[⬆ Volver al README](../README.md)