
import React, { useState, useEffect, useCallback } from 'react';
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/react';
import { add, format, startOfWeek, startOfMonth, eachDayOfInterval, parseISO, isToday, getHours, getMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { useApp } from '../context/AppContext';
import { Task } from '../models/Task';
import Header from '../components/Header';
import './CalendarPage.css';

type View = 'month' | 'week' | 'day';

//=========== Re-defining missing components ===========

const CalendarHeader: React.FC<{
  currentDate: Date;
  onDateChange: (newDate: Date) => void;
  view: View;
}> = ({ currentDate, onDateChange, view }) => {
  const changeDate = (amount: number) => {
    let duration: { [key: string]: number } = {};
    if (view === 'day') {
        duration = { days: amount };
    } else {
        duration = { [view + 's']: amount };
    }
    const newDate = add(currentDate, duration);
    onDateChange(newDate);
  };

  const title = format(currentDate, view === 'month' ? 'MMMM yyyy' : "eeee, d 'de' MMMM", { locale: es });

  return (
    <div className="calendar-header">
      <button onClick={() => changeDate(-1)} className="nav-button">
        <IonIcon icon={chevronBackOutline} />
      </button>
      <h2 className="calendar-title">{title}</h2>
      <button onClick={() => changeDate(1)} className="nav-button">
        <IonIcon icon={chevronForwardOutline} />
      </button>
    </div>
  );
};

const ViewSelector: React.FC<{
  selectedView: View;
  onSelectView: (view: View) => void;
}> = ({ selectedView, onSelectView }) => (
  <div className="view-selector">
    <IonButton className={selectedView === 'month' ? 'active' : ''} onClick={() => onSelectView('month')}>Mes</IonButton>
    <IonButton className={selectedView === 'week' ? 'active' : ''} onClick={() => onSelectView('week')}>Semana</IonButton>
    <IonButton className={selectedView === 'day' ? 'active' : ''} onClick={() => onSelectView('day')}>Día</IonButton>
  </div>
);

const CalendarDay: React.FC<{
  day: Date;
  currentMonth: number;
  tasks: Task[];
}> = ({ day, currentMonth, tasks }) => {
  const isCurrentMonth = day.getMonth() === currentMonth;
  const dayClass = `calendar-day ${isCurrentMonth ? '' : 'other-month'} ${isToday(day) ? 'today' : ''}`;

  return (
    <div className={dayClass}>
      <span>{format(day, 'd')}</span>
      <div className="task-dots">
        {tasks.slice(0, 4).map(task => (
          <div key={task.id} className={`task-dot ${task.status}`}></div>
        ))}
      </div>
    </div>
  );
};

const TimeGrid: React.FC<{
    type: 'week' | 'day';
    tasks: Task[];
    currentDate: Date;
    hours: number[];
}> = ({ type, tasks, currentDate, hours }) => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: add(weekStart, { days: 6 }) });

    const getTasksForDay = (date: Date) => {
        return tasks.filter(task => {
            if (!task.scheduledStart) return false;
            const taskDate = parseISO(task.scheduledStart as string);
            return format(taskDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        });
    };

    const renderTaskBlock = (task: Task) => {
        if (!task.scheduledStart) return null;
        const start = parseISO(task.scheduledStart as string);
        const gridStartHour = type === 'week' ? 6 : 0;
        const top = (getHours(start) - gridStartHour + getMinutes(start) / 60) * 60.25;
        const height = (task.duration / 60) * 60.25;

        return (
            <div key={task.id} className="task-block" style={{ top: `${top}px`, height: `${height}px` }}>
                <div className="task-block-title">{task.title}</div>
            </div>
        );
    };

    return (
        <>
            <div className="time-labels">
                {hours.map(hour => (
                    <div key={hour} className="time-label">{`${hour.toString().padStart(2, '0')}:00`}</div>
                ))}
            </div>
            {type === 'day' ? (
                <div className="grid-body">
                    <div className="grid-lines">
                        {hours.map(hour => <div key={hour} className="grid-line"></div>)}
                    </div>
                    <div className="task-container">
                        {getTasksForDay(currentDate).map(renderTaskBlock)}
                    </div>
                </div>
            ) : (
                <div className="grid-body">
                    {weekDays.map(day => (
                        <div key={day.toISOString()} className="day-column">
                            <div className="grid-lines">
                                {hours.map(hour => <div key={hour} className="grid-line"></div>)}
                            </div>
                            <div className="task-container">
                                {getTasksForDay(day).map(renderTaskBlock)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};


//=========== Main CalendarPage component ===========

const CalendarPage: React.FC = () => {
  const { tasks } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');
  const [calendarTasks, setCalendarTasks] = useState<Task[]>([]);

  useEffect(() => {
    const filteredTasks = tasks.filter(task => task.scheduledStart);
    setCalendarTasks(filteredTasks);
  }, [tasks]);

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const renderMonthView = useCallback(() => {
    const monthStart = startOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: add(startDate, { days: 41 }) }); // Always 6 weeks
    const dayNames = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];

    return (
      <div className="calendar-grid">
        {dayNames.map(name => (
          <div key={name} className="calendar-day-name">{name}</div>
        ))}
        {days.map(day => (
          <CalendarDay
            key={day.toString()}
            day={day}
            currentMonth={currentDate.getMonth()}
            tasks={calendarTasks.filter(task => task.scheduledStart && format(parseISO(task.scheduledStart as string), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))}
          />
        ))}
      </div>
    );
  }, [currentDate, calendarTasks]);

  const renderWeekView = useCallback(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: add(weekStart, { days: 6 }) });
    const hours = Array.from({ length: 17 }, (_, i) => 6 + i);

    return (
      <div className="week-view">
        <div className="week-header">
          <div className="time-label-spacer" />
          {weekDays.map(day => (
            <div key={day.toISOString()} className="week-day-header">
              <span>{format(day, 'E', { locale: es })}</span>
              <span>{format(day, 'd')}</span>
            </div>
          ))}
        </div>
        <div className="week-body">
           <TimeGrid type="week" tasks={calendarTasks} currentDate={currentDate} hours={hours} />
        </div>
      </div>
    );
  }, [currentDate, calendarTasks]);


  const renderDayView = useCallback(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return (
       <TimeGrid type="day" tasks={calendarTasks} currentDate={currentDate} hours={hours} />
    );
  }, [currentDate, calendarTasks]);

  return (
    <IonPage>
      <Header />
      <IonContent fullscreen>
        <div className="calendar-container">
          <ViewSelector selectedView={view} onSelectView={setView} />
          <div className="card">
            <CalendarHeader
              currentDate={currentDate}
              onDateChange={handleDateChange}
              view={view}
            />
            <div id="calendar-content">
              {view === 'month' && renderMonthView()}
              {view === 'week' && renderWeekView()}
              {view === 'day' && renderDayView()}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CalendarPage;
