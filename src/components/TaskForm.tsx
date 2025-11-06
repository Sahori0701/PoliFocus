// components/TaskForm.tsx
import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonLabel,
} from '@ionic/react';
import { Task, RecurrenceType, TimeUnit } from '../models/Task';
import { dateUtils } from '../utils/dateUtils';
import { taskUtils } from '../utils/taskUtils';
import './TaskForm.css';

interface TaskFormProps {
  onSubmit: (task: Task) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit }) => {
  const today = new Date();
  
  // Estados del formulario
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(dateUtils.toDateInputValue(today));
  const [time, setTime] = useState(dateUtils.toTimeInputValue(today));
  const [duration, setDuration] = useState(25);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none');
  
  // Estados de recurrencia
  const [showRecurrence, setShowRecurrence] = useState(false);
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [customInterval, setCustomInterval] = useState(1);
  const [customUnit, setCustomUnit] = useState<TimeUnit>('days');
  const [recurrenceStart, setRecurrenceStart] = useState(dateUtils.toDateInputValue(today));
  const [recurrenceEnd, setRecurrenceEnd] = useState(() => {
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + 1);
    return dateUtils.toDateInputValue(endDate);
  });

  // Mostrar/ocultar sección de recurrencia
  useEffect(() => {
    setShowRecurrence(recurrenceType !== 'none');
  }, [recurrenceType]);

  const handleWeekdayToggle = (day: number) => {
    setSelectedWeekdays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day].sort();
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar
    if (!title.trim()) {
      alert('El título es obligatorio');
      return;
    }

    if (recurrenceType === 'weekdays' && selectedWeekdays.length === 0) {
      alert('Selecciona al menos un día de la semana');
      return;
    }

    // Construir tarea base
    const scheduledStart = dateUtils.combineDateAndTime(date, time);
    
    const baseTask: Task = {
      id: taskUtils.generateTaskId(),
      title: title.trim(),
      scheduledStart: scheduledStart.toISOString(),
      duration,
      priority,
      status: 'pending',
      createdAt: new Date().toISOString(),
      isRecurring: recurrenceType !== 'none',
    };

    // Agregar recurrencia si aplica
    if (recurrenceType !== 'none') {
      baseTask.recurrence = {
        type: recurrenceType,
        startDate: dateUtils.combineDateAndTime(recurrenceStart, time).toISOString(),
        endDate: dateUtils.combineDateAndTime(recurrenceEnd, time).toISOString(),
      };

      if (recurrenceType === 'weekdays') {
        baseTask.recurrence.weekdays = selectedWeekdays;
      } else if (recurrenceType === 'custom') {
        baseTask.recurrence.interval = customInterval;
        baseTask.recurrence.unit = customUnit;
      }
    }

    // Enviar
    onSubmit(baseTask);

    // Resetear formulario
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    const now = new Date();
    setDate(dateUtils.toDateInputValue(now));
    setTime(dateUtils.toTimeInputValue(now));
    setDuration(25);
    setPriority('medium');
    setRecurrenceType('none');
    setSelectedWeekdays([]);
    setCustomInterval(1);
    setCustomUnit('days');
  };

  const weekdays = [
    { value: 1, label: 'Lun' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Mié' },
    { value: 4, label: 'Jue' },
    { value: 5, label: 'Vie' },
    { value: 6, label: 'Sáb' },
    { value: 0, label: 'Dom' },
  ];

  return (
    <IonCard className="task-form-card">
      <IonCardHeader>
        <IonCardTitle className="form-card-title">Nueva Tarea</IonCardTitle>
      </IonCardHeader>

      <IonCardContent>
        <form onSubmit={handleSubmit} className="task-form">
          {/* Título */}
          <div className="form-field">
            <IonInput
              value={title}
              placeholder="Descripción de la tarea"
              onIonInput={e => setTitle(e.detail.value!)}
              required
              fill="solid"
              label="Descripción de la tarea *"
              labelPlacement="stacked"
              className="form-input"
            />
          </div>

          {/* Fecha y Hora */}
          <div className="form-row">
            <div className="form-field">
              <IonInput
                type="date"
                value={date}
                onIonInput={e => setDate(e.detail.value!)}
                required
                fill="solid"
                label="Fecha *"
                labelPlacement="stacked"
                className="form-input"
              />
            </div>

            <div className="form-field">
              <IonInput
                type="time"
                value={time}
                onIonInput={e => setTime(e.detail.value!)}
                required
                fill="solid"
                label="Hora *"
                labelPlacement="stacked"
                className="form-input"
              />
            </div>
          </div>

          {/* Duración y Prioridad */}
          <div className="form-row">
            <div className="form-field">
              <IonInput
                type="number"
                value={duration}
                min={5}
                onIonInput={e => setDuration(parseInt(e.detail.value!, 10) || 25)}
                required
                fill="solid"
                label="Duración (min) *"
                labelPlacement="stacked"
                placeholder="25"
                className="form-input"
              />
            </div>

            <div className="form-field">
              <IonItem lines="none" className="select-item">
                <IonSelect
                  value={priority}
                  onIonChange={e => setPriority(e.detail.value)}
                  interface="action-sheet"
                  cancelText="Cancelar"
                  label="Prioridad"
                  labelPlacement="stacked"
                  className="form-select"
                >
                  <IonSelectOption value="low">Baja</IonSelectOption>
                  <IonSelectOption value="medium">Media</IonSelectOption>
                  <IonSelectOption value="high">Alta</IonSelectOption>
                </IonSelect>
              </IonItem>
            </div>
          </div>

          {/* Periodicidad */}
          <div className="form-field">
            <IonItem lines="none" className="select-item">
              <IonSelect
                value={recurrenceType}
                onIonChange={e => setRecurrenceType(e.detail.value)}
                interface="action-sheet"
                cancelText="Cancelar"
                label="Periodicidad"
                labelPlacement="stacked"
                className="form-select"
              >
                <IonSelectOption value="none">Sin repetición</IonSelectOption>
                <IonSelectOption value="daily">Diaria</IonSelectOption>
                <IonSelectOption value="weekly">Semanal</IonSelectOption>
                <IonSelectOption value="monthly">Mensual</IonSelectOption>
                <IonSelectOption value="weekdays">Días específicos</IonSelectOption>
                <IonSelectOption value="custom">Personalizada</IonSelectOption>
              </IonSelect>
            </IonItem>
          </div>

          {/* Opciones de Recurrencia */}
          {showRecurrence && (
            <div className="recurrence-section">
              {/* Días específicos */}
              {recurrenceType === 'weekdays' && (
                <div className="weekdays-section">
                  <IonLabel className="section-label">Selecciona los días</IonLabel>
                  <div className="weekdays-chips">
                    {weekdays.map(day => (
                      <div
                        key={day.value}
                        className={`weekday-chip ${selectedWeekdays.includes(day.value) ? 'selected' : ''}`}
                        onClick={() => handleWeekdayToggle(day.value)}
                      >
                        {day.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Intervalo personalizado */}
              {recurrenceType === 'custom' && (
                <div className="custom-interval-section">
                  <IonLabel className="section-label">Repetir cada</IonLabel>
                  <div className="form-row">
                    <div className="form-field">
                      <IonInput
                        type="number"
                        value={customInterval}
                        min={1}
                        onIonInput={e => setCustomInterval(parseInt(e.detail.value!, 10) || 1)}
                        fill="solid"
                        label="Cantidad"
                        labelPlacement="stacked"
                        placeholder="1"
                        className="form-input"
                      />
                    </div>

                    <div className="form-field">
                      <IonItem lines="none" className="select-item">
                        <IonSelect
                          value={customUnit}
                          onIonChange={e => setCustomUnit(e.detail.value)}
                          interface="action-sheet"
                          cancelText="Cancelar"
                          label="Unidad"
                          labelPlacement="stacked"
                          className="form-select"
                        >
                          <IonSelectOption value="days">Días</IonSelectOption>
                          <IonSelectOption value="weeks">Semanas</IonSelectOption>
                          <IonSelectOption value="months">Meses</IonSelectOption>
                        </IonSelect>
                      </IonItem>
                    </div>
                  </div>
                </div>
              )}

              {/* Rango de fechas */}
              <div className="date-range-section">
                <IonLabel className="section-label">Período de recurrencia</IonLabel>
                <div className="form-row">
                  <div className="form-field">
                    <IonInput
                      type="date"
                      value={recurrenceStart}
                      onIonInput={e => setRecurrenceStart(e.detail.value!)}
                      fill="solid"
                      label="Inicio"
                      labelPlacement="stacked"
                      className="form-input"
                    />
                  </div>

                  <div className="form-field">
                    <IonInput
                      type="date"
                      value={recurrenceEnd}
                      onIonInput={e => setRecurrenceEnd(e.detail.value!)}
                      fill="solid"
                      label="Fin"
                      labelPlacement="stacked"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botón Submit */}
          <IonButton
            expand="block"
            type="submit"
            color="primary"
            className="submit-button"
          >
            <span style={{ marginRight: '0.5rem' }}>➕</span>
            Crear Tarea
          </IonButton>
        </form>
      </IonCardContent>
    </IonCard>
  );
};

export default TaskForm;