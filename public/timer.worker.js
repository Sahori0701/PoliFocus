// public/timer.worker.js
let timerInterval = null;
let state = {
  isRunning: false,
  timeLeft: 0,
  totalElapsed: 0,
  mode: 'focus',
  startTime: null,
  durations: {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  },
  cycleCount: 0,
  taskDuration: 0, // Duración total de la tarea en segundos
  taskTimeRemaining: 0 // Tiempo restante de la tarea
};

function tick() {
  if (!state.isRunning) return;

  const now = Date.now();
  const elapsed = Math.floor((now - state.startTime) / 1000);
  
  state.timeLeft = Math.max(0, state.timeLeft - 1);
  
  if (state.mode === 'focus') {
    state.totalElapsed += 1;
    state.taskTimeRemaining = Math.max(0, state.taskTimeRemaining - 1);
  }

  self.postMessage({
    type: 'TICK',
    payload: {
      timeLeft: state.timeLeft,
      totalElapsed: state.totalElapsed,
      taskTimeRemaining: state.taskTimeRemaining
    }
  });

  // Notificación de progreso cada 5 minutos en modo focus
  if (state.mode === 'focus' && state.totalElapsed % 300 === 0 && state.totalElapsed > 0) {
    self.postMessage({
      type: 'PROGRESS_NOTIFICATION',
      payload: { message: `Llevas ${Math.floor(state.totalElapsed / 60)} minutos concentrado` }
    });
  }

  // Cuando el temporizador llega a cero
  if (state.timeLeft <= 0) {
    handleModeCompletion();
  }
}

function handleModeCompletion() {
  if (state.mode === 'focus') {
    state.cycleCount++;
    
    // Verificar si la tarea está completa
    if (state.taskTimeRemaining <= 0) {
      // Tarea completada
      self.postMessage({
        type: 'MODE_CHANGE',
        payload: {
          mode: 'focus',
          timeLeft: 0,
          message: '🎉 ¡Ciclo de concentración completado!'
        }
      });
      state.isRunning = false;
    } else {
      // Determinar tipo de descanso
      const isLongBreak = state.cycleCount % 4 === 0;
      const breakDuration = isLongBreak ? state.durations.longBreak : state.durations.shortBreak;
      const breakMode = isLongBreak ? 'longBreak' : 'shortBreak';
      const breakMessage = isLongBreak 
        ? '☕ Descanso largo - ¡Te lo mereces!' 
        : '⏸️ Descanso corto - Relájate un momento';

      self.postMessage({
        type: 'MODE_CHANGE',
        payload: {
          mode: breakMode,
          timeLeft: breakDuration,
          message: breakMessage
        }
      });
    }
  } else {
    // Fin del descanso - volver al modo focus con el tiempo restante de la tarea
    const nextFocusDuration = Math.min(state.taskTimeRemaining, state.durations.focus);
    
    self.postMessage({
      type: 'MODE_CHANGE',
      payload: {
        mode: 'focus',
        timeLeft: nextFocusDuration,
        message: '🎯 ¡De vuelta al trabajo!'
      }
    });
  }
}

function startTimer() {
  if (timerInterval) return;
  
  state.isRunning = true;
  state.startTime = Date.now();
  
  timerInterval = setInterval(tick, 1000);
}

function pauseTimer() {
  state.isRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function resetTimer() {
  pauseTimer();
  state = {
    isRunning: false,
    timeLeft: state.durations.focus,
    totalElapsed: 0,
    mode: 'focus',
    startTime: null,
    durations: state.durations,
    cycleCount: 0,
    taskDuration: 0,
    taskTimeRemaining: 0
  };
  
  self.postMessage({
    type: 'STATE_UPDATE',
    payload: state
  });
}

self.onmessage = (e) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'START':
      startTimer();
      break;
      
    case 'PAUSE':
      pauseTimer();
      break;
      
    case 'RESET':
      resetTimer();
      break;
      
    case 'SET_STATE':
      if (payload.durations) {
        state.durations = payload.durations;
      }
      if (payload.timeLeft !== undefined) {
        state.timeLeft = payload.timeLeft;
      }
      if (payload.mode !== undefined) {
        state.mode = payload.mode;
      }
      if (payload.totalElapsed !== undefined) {
        state.totalElapsed = payload.totalElapsed;
      }
      if (payload.isRunning !== undefined) {
        state.isRunning = payload.isRunning;
      }
      if (payload.taskDuration !== undefined) {
        state.taskDuration = payload.taskDuration;
        state.taskTimeRemaining = payload.taskDuration;
      }
      if (payload.taskTimeRemaining !== undefined) {
        state.taskTimeRemaining = payload.taskTimeRemaining;
      }
      if (payload.cycleCount !== undefined) {
        state.cycleCount = payload.cycleCount;
      }
      break;
      
    default:
      console.warn('Unknown worker message type:', type);
  }
};