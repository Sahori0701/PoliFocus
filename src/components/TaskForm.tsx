// components/TaskForm.tsx
import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
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
  onSubmit: (task: Task) => Promise<boolean>;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit }) => {
  const today = new Date();
  
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(dateUtils.toDateInputValue(today));
  const [time, setTime] = useState(dateUtils.toTimeInputValue(today));
  const [duration, setDuration] = useState(60);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none');
  
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

  useEffect(() => {
    setShowRecurrence(recurrenceType !== 'none');
  }, [recurrenceType]);

  const handleWeekdayToggle = (day: number) => {
    setSelectedWeekdays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort());
  };

  const resetForm = () => {
    setTitle('');
    const now = new Date();
    setDate(dateUtils.toDateInputValue(now));
    setTime(dateUtils.toTimeInputValue(now));
    setDuration(60);
    setPriority('medium');
    setRecurrenceType('none');
    setSelectedWeekdays([]);
    setCustomInterval(1);
    setCustomUnit('days');
    setRecurrenceStart(dateUtils.toDateInputValue(now));
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setRecurrenceEnd(dateUtils.toDateInputValue(nextMonth));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('El título es obligatorio');
      return;
    }
    if (duration < 5) {
      alert('La duración debe ser de al menos 5 minutos.');
      return;
    }
    if (recurrenceType === 'weekdays' && selectedWeekdays.length === 0) {
      alert('Selecciona al menos un día de la semana');
      return;
    }

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
    if (recurrenceType !== 'none') {
      baseTask.recurrence = {
        type: recurrenceType,
        startDate: dateUtils.combineDateAndTime(recurrenceStart, time).toISOString(),
        endDate: dateUtils.combineDateAndTime(recurrenceEnd, time).toISOString(),
      };
      if (recurrenceType === 'weekdays') baseTask.recurrence.weekdays = selectedWeekdays;
      if (recurrenceType === 'custom') {
        baseTask.recurrence.interval = customInterval;
        baseTask.recurrence.unit = customUnit;
      }
    }

    const success = await onSubmit(baseTask);
    if (success) {
      resetForm();
    }
  };

  const weekdays = [
    { value: 1, label: 'Lun' }, { value: 2, label: 'Mar' }, { value: 3, label: 'Mié' }, 
    { value: 4, label: 'Jue' }, { value: 5, label: 'Vie' }, { value: 6, label: 'Sáb' }, { value: 0, label: 'Dom' }
  ];

  return (
    <IonCard className="task-form-card">
      <IonCardHeader>
        <IonCardTitle className="form-card-title">Nueva Tarea</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-item-wrapper-single">
             <IonInput value={title} placeholder="Descripción de la tarea" onIonInput={e => setTitle(e.detail.value!)} required />
          </div>

          <div className="form-row">
            <IonInput className="form-flex-item date-time-input" type="date" value={date} onIonInput={e => setDate(e.detail.value!)} required />
            <IonInput className="form-flex-item date-time-input" type="time" value={time} onIonInput={e => setTime(e.detail.value!)} required />
          </div>

          <div className="form-row">
            <IonInput className="form-flex-item" type="number" value={duration} placeholder="Minutos" onIonInput={e => setDuration(parseInt(e.detail.value || '0', 10))} />
            <IonSelect className="form-flex-item" value={priority} placeholder="Media" onIonChange={e => setPriority(e.detail.value)} interface="action-sheet" cancelText="Cancelar">
              <IonSelectOption value="low">Baja</IonSelectOption>
              <IonSelectOption value="medium">Media</IonSelectOption>
              <IonSelectOption value="high">Alta</IonSelectOption>
            </IonSelect>
          </div>
          
          <div className="form-item-wrapper-single">
            <IonSelect value={recurrenceType} placeholder="Sin repetición" onIonChange={e => setRecurrenceType(e.detail.value)} interface="action-sheet" cancelText="Cancelar">
                <IonSelectOption value="none">Sin repetición</IonSelectOption>
                <IonSelectOption value="daily">Diaria</IonSelectOption>
                <IonSelectOption value="weekly">Semanal</IonSelectOption>
                <IonSelectOption value="monthly">Mensual</IonSelectOption>
                <IonSelectOption value="weekdays">Días específicos</IonSelectOption>
                <IonSelectOption value="custom">Personalizada</IonSelectOption>
            </IonSelect>
          </div>

          {showRecurrence && (
            <div className="recurrence-section">
              {recurrenceType === 'weekdays' && (
                <div className="weekdays-section">
                  <IonLabel className="section-label">Selecciona los días</IonLabel>
                  <div className="weekdays-chips">
                    {weekdays.map(day => (
                      <div key={day.value} className={`weekday-chip ${selectedWeekdays.includes(day.value) ? 'selected' : ''}`} onClick={() => handleWeekdayToggle(day.value)}>
                        {day.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recurrenceType === 'custom' && (
                <div className="custom-interval-section">
                  <IonLabel className="section-label">Repetir cada</IonLabel>
                  <div className="form-row">
                    <IonInput className="form-flex-item" type="number" value={customInterval} min={1} onIonInput={e => setCustomInterval(parseInt(e.detail.value!, 10) || 1)} />
                    <IonSelect className="form-flex-item" value={customUnit} onIonChange={e => setCustomUnit(e.detail.value)} interface="action-sheet" cancelText="Cancelar" placeholder="Unidad">
                      <IonSelectOption value="days">Días</IonSelectOption>
                      <IonSelectOption value="weeks">Semanas</IonSelectOption>
                      <IonSelectOption value="months">Meses</IonSelectOption>
                    </IonSelect>
                  </div>
                </div>
              )}

              <div className="date-range-section">
                <IonLabel className="section-label">Período de recurrencia</IonLabel>
                <div className="form-row">
                  <IonInput className="form-flex-item date-time-input" type="date" value={recurrenceStart} onIonInput={e => setRecurrenceStart(e.detail.value!)} />
                  <IonInput className="form-flex-item date-time-input" type="date" value={recurrenceEnd} onIonInput={e => setRecurrenceEnd(e.detail.value!)} />
                </div>
              </div>
            </div>
          )}

          <IonButton expand="block" type="submit" color="primary" className="submit-button">
            <span style={{ marginRight: '0.5rem' }}>➕</span>
            Crear Tarea
          </IonButton>
        </form>
      </IonCardContent>
    </IonCard>
  );
};

export default TaskForm;
