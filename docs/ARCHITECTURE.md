# 🏗️ Arquitectura Técnica - PoliFocusTask

Este documento detalla la arquitectura del sistema, patrones de diseño y decisiones técnicas.

---

## 📐 Diagrama de Arquitectura General
```
┌─────────────────────────────────────────────────────┐
│                   PRESENTATION                      │
│              (Ionic React Components)               │
├─────────────────────────────────────────────────────┤
│  TasksPage  │  TimerPage  │  Calendar  │  Reports  │
└──────┬──────┴──────┬──────┴──────┬─────┴──────┬────┘
       │             │              │            │
       └─────────────┼──────────────┴────────────┘
                     │
              ┌──────▼──────┐
              │  useApp()   │  ← Custom Hook
              │   Context   │
              └──────┬──────┘
                     │
       ┌─────────────┼─────────────┐
       │             │             │
┌──────▼──────┐ ┌───▼────┐ ┌─────▼──────┐
│   Services  │ │ Models │ │   Utils    │
│  - Storage  │ │ - Task │ │ - dateUtils│
│  - Pomodoro │ │ - Timer│ │            │
└──────┬──────┘ └────────┘ └────────────┘
       │
┌──────▼──────────┐
│   Capacitor     │
│  - Preferences  │
│  - Notifications│
│  - Background   │
└─────────────────┘
```

---

## 📁 Estructura de Carpetas Explicada

### **models/** - Capa de Datos
Contiene interfaces TypeScript que definen la estructura de los datos.

**Responsabilidad**: Definir QUÉ datos maneja la aplicación
```typescript
// Task.ts - Define estructura de tareas
export interface Task {
  id: number;
  title: string;
  scheduledStart: string;
  duration: number;
  priority: Priority;
  status: TaskStatus;
  // ...
}
```

**Ventajas**:
- Type safety en toda la aplicación
- Autocomplete en IDE
- Validación en tiempo de compilación
- Documentación implícita

---

### **services/** - Capa de Lógica de Negocio
Contiene clases que manejan operaciones y lógica compleja.

**Responsabilidad**: Definir CÓMO se procesan los datos
```typescript
// storage.service.ts
class StorageService {
  async getTasks(): Promise<Task[]> { /* ... */ }
  async addTask(task: Task): Promise<Task> { /* ... */ }
  // Abstrae Capacitor Preferences
}
```

**Patrón Singleton**:
```typescript
export const storageService = new StorageService();
// Una única instancia compartida
```

**Ventajas**:
- Abstracción de la fuente de datos
- Fácil testing con mocks
- Cambiar implementación sin afectar componentes
- Centralizar lógica de validación

---

### **contexts/** - Capa de Estado Global
Usa React Context API para compartir estado entre componentes.

**Responsabilidad**: Definir DÓNDE viven los datos en memoria
```typescript
// AppContext.tsx
export const AppProvider: React.FC = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  
  // Funciones que modifican el estado
  const addTask = async (task: Task) => {
    await storageService.addTask(task);
    setTasks([...tasks, task]);
  };
  
  return (
    <AppContext.Provider value={{ tasks, addTask, ... }}>
      {children}
    </AppContext.Provider>
  );
};
```

**Ventajas**:
- Evita prop drilling
- Estado sincronizado en toda la app
- Un solo source of truth
- Fácil debugging

---

### **hooks/** - Custom Hooks Reutilizables
Encapsulan lógica compleja en funciones reutilizables.

**Responsabilidad**: Encapsular lógica stateful reutilizable
```typescript
// useStorage.ts
export function useStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  
  useEffect(() => {
    // Cargar de Preferences al montar
    loadValue();
  }, [key]);
  
  return { value, setValue, isLoading };
}
```

**Ventajas**:
- DRY (Don't Repeat Yourself)
- Testing independiente
- Composición de hooks
- Separación de concerns

---

### **utils/** - Funciones Auxiliares Puras
Funciones sin estado que realizan transformaciones.

**Responsabilidad**: Funciones auxiliares puras (sin side effects)
```typescript
// dateUtils.ts
export const dateUtils = {
  formatTimeUntil(date: Date): string { /* ... */ },
  isExpired(start: string, duration: number): boolean { /* ... */ },
  // Funciones puras, sin estado
};
```

**Ventajas**:
- Testeable (entrada → salida predecible)
- Reutilizable en cualquier parte
- Sin dependencias
- Performance (pueden memoizarse)

---

## 🔄 Flujo de Datos Detallado

### Crear una Tarea - Paso a Paso
```
1. Usuario completa formulario en TasksPage
   └─ onClick → handleSubmit()

2. handleSubmit() en TasksPage:
   const { addTask } = useApp();  // Hook del Context
   await addTask(newTask);

3. addTask() en AppContext:
   a) Valida datos
   b) await storageService.addTask(task);  // Persiste
   c) setTasks([...tasks, task]);          // Actualiza estado

4. storageService.addTask():
   a) const tasks = await getTasks();      // Lee actual
   b) tasks.push(newTask);                 // Agrega
   c) await Preferences.set({              // Guarda
        key: 'tasks',
        value: JSON.stringify(tasks)
      });

5. React detecta cambio en Context:
   └─ Re-renderiza componentes suscritos:
      - TasksPage → muestra nueva tarea
      - CalendarPage → muestra nuevo evento
      - ReportsPage → actualiza contador

6. Persistencia verificada:
   - Usuario cierra app
   - Reabre app
   - useEffect en AppContext carga datos
   - Estado restaurado automáticamente
```

---

## 🎯 Patrones de Diseño Implementados

### 1. Repository Pattern
```typescript
// StorageService actúa como repositorio
// Abstrae el acceso a datos (Preferences)
storageService.getTasks()  // No importa de dónde vienen
```

### 2. Singleton Pattern
```typescript
export const storageService = new StorageService();
// Solo una instancia global
```

### 3. Context Provider Pattern
```typescript
<AppProvider>
  {/* Todos los children tienen acceso al estado */}
</AppProvider>
```

### 4. Custom Hooks Pattern
```typescript
function useApp() {
  return useContext(AppContext);
}
// Encapsula lógica de acceso al contexto
```

### 5. Separation of Concerns
```
Models    → Estructura de datos
Services  → Lógica de negocio
Contexts  → Estado global
Components → UI y presentación
```

---

## 📊 Gestión de Estado

### Estado Local (useState)
```typescript
// Para datos que solo importan a UN componente
const [isOpen, setIsOpen] = useState(false);
```

### Estado Global (Context)
```typescript
// Para datos compartidos entre MÚLTIPLES componentes
const { tasks, config, activeTask } = useApp();
```

### Estado Persistente (Preferences)
```typescript
// Para datos que deben sobrevivir al cierre de la app
await Preferences.set({ key: 'tasks', value: JSON.stringify(tasks) });
```

---

## 🔐 TypeScript - Type Safety

### Interfaces Estrictas
```typescript
interface Task {
  id: number;          // Solo números
  priority: Priority;  // Solo: 'low' | 'medium' | 'high'
  status: TaskStatus;  // Solo: 'pending' | 'completed' | ...
}
```

### Validación en Tiempo de Compilación
```typescript
const task: Task = {
  id: 1,
  priority: "super-high"  // ❌ Error: no es un Priority válido
};
```

### Autocomplete Inteligente
```typescript
const { tasks, addTask, updateTask } = useApp();
// IDE sugiere: tasks, addTask, updateTask, deleteTask, ...
```

---

## 📱 Capacitor - Bridge Nativo

### Arquitectura de Capacitor
```
┌─────────────────┐
│   React App     │  (JavaScript)
│   (WebView)     │
└────────┬────────┘
         │ Capacitor Bridge
┌────────▼────────┐
│  Native APIs    │  (Kotlin/Swift)
│  - Preferences  │
│  - Notifications│
│  - FileSystem   │
└─────────────────┘
```

### Plugins Utilizados
```typescript
// @capacitor/preferences
import { Preferences } from '@capacitor/preferences';
await Preferences.set({ key: 'data', value: 'value' });

// @capacitor/local-notifications (Fase 5)
import { LocalNotifications } from '@capacitor/local-notifications';
await LocalNotifications.schedule({ ... });
```

---

## ⚡ Optimizaciones de Performance

### 1. Lazy Loading (Futuro)
```typescript
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
// Carga solo cuando se navega a la página
```

### 2. Memoization
```typescript
const filteredTasks = useMemo(
  () => tasks.filter(t => t.status === 'pending'),
  [tasks]
);
// Recalcula solo si tasks cambia
```

### 3. Batch Updates
```typescript
// Múltiples setStates se agrupan en un solo re-render
setTasks(newTasks);
setConfig(newConfig);
// React renderiza UNA vez
```

---

## 🧪 Testing Strategy (Futuro)

### Unit Tests
```typescript
// services/storage.service.test.ts
test('addTask persiste correctamente', async () => {
  const task = createMockTask();
  await storageService.addTask(task);
  const tasks = await storageService.getTasks();
  expect(tasks).toContainEqual(task);
});
```

### Integration Tests
```typescript
// contexts/AppContext.test.tsx
test('addTask actualiza estado y storage', async () => {
  const { result } = renderHook(() => useApp());
  await act(() => result.current.addTask(mockTask));
  expect(result.current.tasks).toHaveLength(1);
});
```

---

## 🔮 Escalabilidad Futura

### Posibles Mejoras
1. **SQLite**: Para datos más complejos
2. **Redux**: Si el estado se vuelve muy complejo
3. **React Query**: Para sincronización con backend
4. **WebSockets**: Para colaboración en tiempo real
5. **IndexedDB**: Para almacenamiento de archivos grandes

---

## 📚 Referencias

- [Ionic React Docs](https://ionicframework.com/docs/react)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [React Context API](https://react.dev/reference/react/useContext)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

[⬆ Volver al README](../README.md)