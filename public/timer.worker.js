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
};

function tick() {
  state.timeLeft--;
  state.totalElapsed++;

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
      state = { ...state, ...payload };
      // If durations are updated, and we are in a resting state, reflect the new focus duration.
      if(payload.durations && !state.intervalId) {
        reset();
      }
      break;
    case 'RESET':
      reset();
      break;
  }
};