import React, { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { add, format, startOfWeek, startOfMonth, eachDayOfInterval, parseISO, isToday, getHours, getMinutes, isBefore, set } from 'date-fns';
import { es } from 'date-fns/locale';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { useApp } from '../context/AppContext';
import { Task } from '../models/Task';
import Header from '../components/Header';
import TaskActivationModal from '../components/TaskActivationModal';
import './CalendarPage.css';

type View = 'month' | 'week' | 'day';
const PIXELS_PER_HOUR = 64; // Corresponds to 60px height + 4px gap

//=========== Current Time Indicator ===========
const CurrentTimeIndicator: React.FC<{ now: Date }> = ({ now }) => {
    const top = (now.getHours() + now.getMinutes() / 60) * PIXELS_PER_HOUR;
    return <div className="current-time-indicator" style={{ top: `${top}px` }} />;
};

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
  onClick: (date: Date) => void;
}> = ({ day, currentMonth, tasks, onClick }) => {
  const isCurrentMonth = day.getMonth() === currentMonth;
  const dayClass = `calendar-day ${isCurrentMonth ? '' : 'other-month'} ${isToday(day) ? 'today' : ''}`;

  return (
    <div className={dayClass} onClick={() => onClick(day)}>
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
    now: Date;
    onTimeSlotClick?: (date: Date) => void;
    onTaskClick: (task: Task) => void; 
}> = ({ type, tasks, currentDate, hours, now, onTimeSlotClick, onTaskClick }) => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: add(weekStart, { days: 6 }) });
    const daysToRender = type === 'week' ? weekDays : [currentDate];

    const handleTimeSlotClick = (day: Date, e: React.MouseEvent<HTMLDivElement>) => {
        if (!onTimeSlotClick || e.target !== e.currentTarget) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const hour = Math.floor(y / PIXELS_PER_HOUR);
        const minutes = Math.floor(((y / PIXELS_PER_HOUR) - hour) * 60);
        const newDate = set(day, { hours: hour, minutes: minutes });
        onTimeSlotClick(newDate);
    };

    const getTaskStatusClass = (task: Task): string => {
        if (task.status === 'completed') {
            return 'completed';
        }
        if (!task.scheduledStart) {
            return 'pending';
        }
        const dueDate = add(parseISO(task.scheduledStart), { minutes: task.duration });
        if (isBefore(dueDate, now)) {
            return 'overdue';
        }
        return 'pending';
    };

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
        const top = (getHours(start) + getMinutes(start) / 60) * PIXELS_PER_HOUR;
        const height = (task.duration / 60) * PIXELS_PER_HOUR;
        const statusClass = getTaskStatusClass(task);

        return (
            <div 
                key={task.id} 
                className={`task-block ${statusClass}`}
                style={{ top: `${top}px`, height: `${height}px` }} 
                onClick={() => onTaskClick(task)}
            >
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
            <div className="grid-body">
                {daysToRender.map(day => (
                    <div key={day.toISOString()} className={`day-column ${isToday(day) ? 'today' : ''}`} onClick={(e) => handleTimeSlotClick(day, e)}>
                        <div className="grid-lines">
                            {hours.map(hour => <div key={hour} className="grid-line"></div>)}
                        </div>
                        <div className="task-container">
                            {getTasksForDay(day).map(renderTaskBlock)}
                            {isToday(day) && <CurrentTimeIndicator now={now} />}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};


//=========== Main CalendarPage component ===========

const CalendarPage: React.FC = () => {
  const { tasks, setActiveTask } = useApp();
  const history = useHistory();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [now, setNow] = useState(new Date());
  const [view, setView] = useState<View>('month');
  const [calendarTasks, setCalendarTasks] = useState<Task[]>([]);
  const contentRef = useRef<HTMLIonContentElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);


  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  useLayoutEffect(() => {
    if (view === 'day' && contentRef.current) {
      const hour = currentDate.getHours();
      const y = hour * PIXELS_PER_HOUR;
      contentRef.current.scrollToPoint(0, y, 300);
    }
  }, [view, currentDate]);

  useEffect(() => {
    const filteredTasks = tasks.filter(task => task.scheduledStart);
    setCalendarTasks(filteredTasks);
  }, [tasks]);

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
  };
  
  const handleDayClick = (date: Date) => {
    setView('day');
    setCurrentDate(date);
  };

  const handleTimeSlotClick = (date: Date) => {
    setView('day');
    setCurrentDate(date);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleActivateTask = (task: Task) => {
    setActiveTask(task);
    history.push('/timer');
  };

  const renderMonthView = useCallback(() => {
    const monthStart = startOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: add(startDate, { days: 34 }) }); // Always 5 weeks
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
            onClick={handleDayClick}
          />
        ))}
      </div>
    );
  }, [currentDate, calendarTasks]);

  const renderWeekView = useCallback(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: add(weekStart, { days: 6 }) });
    const hours = Array.from({ length: 24 }, (_, i) => i); // 0-23 hours

    return (
      <div className="week-view">
        <div className="week-header">
          <div className="time-label-spacer" />
          {weekDays.map(day => (
             <div key={day.toISOString()} className={`week-day-header ${isToday(day) ? 'today' : ''}`}>
              <span>{format(day, 'E', { locale: es })}</span>
              <span>{format(day, 'd')}</span>
            </div>
          ))}
        </div>
        <div className="week-body time-grid-view">
           <TimeGrid type="week" tasks={calendarTasks} currentDate={currentDate} hours={hours} now={now} onTimeSlotClick={handleTimeSlotClick} onTaskClick={handleTaskClick} />
        </div>
      </div>
    );
  }, [currentDate, calendarTasks, now]);


  const renderDayView = useCallback(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return (
       <div className="day-view time-grid-view">
         <TimeGrid type="day" tasks={calendarTasks} currentDate={currentDate} hours={hours} now={now} onTaskClick={handleTaskClick} />
       </div>
    );
  }, [currentDate, calendarTasks, now]);

  return (
    <IonPage>
      <Header />
      <IonContent fullscreen ref={contentRef}>
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
        <TaskActivationModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onActivate={handleActivateTask}
        />
      </IonContent>
    </IonPage>
  );
};

export default CalendarPage;
