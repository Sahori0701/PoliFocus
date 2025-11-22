let state = {
  timeLeft: 0,
  mode: 'focus', // 'focus', 'shortBreak', 'longBreak'
  durations: {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  },
  intervalId: null,
  pomodorosInCycle: 0,
  pomodorosUntilLongBreak: 4,
  totalElapsed: 0,
  activeTaskDuration: 0, // in seconds
  notificationTimestamps: {
    '15': false,
    '5': false,
    '2': false,
  },
};

function tick() {
  state.timeLeft--;
  state.totalElapsed++;

  // Send progress notifications during focus mode
  if (state.mode === 'focus') {
    const remainingMinutes = Math.floor(state.timeLeft / 60);
    const remainingSecondsInMinute = state.timeLeft % 60;

    if (remainingMinutes === 15 && remainingSecondsInMinute === 0 && !state.notificationTimestamps['15']) {
      self.postMessage({ type: 'PROGRESS_NOTIFICATION', payload: { message: '⏳ ¡Solo quedan 15 minutos!' } });
      state.notificationTimestamps['15'] = true;
    }
    if (remainingMinutes === 5 && remainingSecondsInMinute === 0 && !state.notificationTimestamps['5']) {
      self.postMessage({ type: 'PROGRESS_NOTIFICATION', payload: { message: '⏳ ¡Últimos 5 minutos, vamos!' } });
      state.notificationTimestamps['5'] = true;
    }
    if (remainingMinutes === 2 && remainingSecondsInMinute === 0 && !state.notificationTimestamps['2']) {
      self.postMessage({ type: 'PROGRESS_NOTIFICATION', payload: { message: '⏳ ¡Recta final! Quedan 2 minutos.' } });
      state.notificationTimestamps['2'] = true;
    }
  }
  
  const taskTimeIsUp = state.activeTaskDuration > 0 && state.totalElapsed >= state.activeTaskDuration;

  if (taskTimeIsUp) {
    self.postMessage({ type: 'TASK_FINISHED', payload: { message: '¡Tiempo de la tarea agotado!', timeLeft: 0 } });
    if (state.intervalId) clearInterval(state.intervalId);
    state.intervalId = null;
    return;
  }

  if (state.timeLeft <= 0) {
    if (state.intervalId) clearInterval(state.intervalId);
    state.intervalId = null;

    let message = '';
    let nextMode = '';

    if (state.mode === 'focus') {
      state.pomodorosInCycle++;
      if (state.pomodorosInCycle % state.pomodorosUntilLongBreak === 0) {
        nextMode = 'longBreak';
        message = '☕️ ¡Hora de un descanso largo!';
      } else {
        nextMode = 'shortBreak';
        message = '🧘 ¡Hora de un descanso corto!';
      }
    } else {
      nextMode = 'focus';
      message = '🔔 ¡A trabajar!';
    }
    
    state.mode = nextMode;
    state.timeLeft = state.durations[nextMode];
    self.postMessage({ type: 'MODE_CHANGE', payload: { mode: nextMode, timeLeft: state.timeLeft, message } });
    start(); // Automatically start the next phase
  } else {
    self.postMessage({ type: 'TICK', payload: { timeLeft: state.timeLeft, totalElapsed: state.totalElapsed } });
  }
}

function start() {
  if (!state.intervalId) {
    state.intervalId = setInterval(tick, 1000);
  }
}

function reset() {
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  state.timeLeft = state.durations.focus;
  state.mode = 'focus';
  state.totalElapsed = 0;
  state.activeTaskDuration = 0;
  state.notificationTimestamps = { '15': false, '5': false, '2': false }; // Reset flags
  self.postMessage({
    type: 'STATE_UPDATE',
    payload: {
      timeLeft: state.timeLeft,
      mode: state.mode,
      totalElapsed: state.totalElapsed,
      isRunning: false,
    },
  });
}

self.onmessage = (e) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'START':
      start();
      break;
    case 'PAUSE':
      if (state.intervalId) {
        clearInterval(state.intervalId);
        state.intervalId = null;
      }
      break;
    case 'SET_STATE':
      // When a new focus session starts, reset notification flags
      if (payload.totalElapsed === 0 && payload.mode === 'focus') {
        state.notificationTimestamps = { '15': false, '5': false, '2': false };
      }
      state = { ...state, ...payload };
      if (payload.durations && !state.intervalId) {
        reset();
      }
      break;
    case 'RESET':
      reset();
      break;
  }
};