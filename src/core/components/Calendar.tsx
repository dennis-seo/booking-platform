import { useState, useMemo } from 'react';
import { Button } from './Button';
import {
  getMonthDates,
  toDateString,
  isSameDay,
  isToday,
  isPast,
  DAY_NAMES,
  MONTH_NAMES,
} from '../utils/dateUtils';

interface CalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
}

export function Calendar({
  selectedDate,
  onSelectDate,
  minDate = new Date(),
  maxDate,
  disabledDays = [],
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const dates = useMemo(
    () => getMonthDates(currentMonth.year, currentMonth.month),
    [currentMonth.year, currentMonth.month]
  );

  const goToPrevMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  };

  const isDateDisabled = (date: Date): boolean => {
    if (isPast(date) && !isToday(date)) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    if (disabledDays.includes(date.getDay())) return true;
    return false;
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentMonth.month;
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <Button variant="ghost" size="sm" onClick={goToPrevMonth}>
          ◀
        </Button>
        <span className="calendar-title">
          {currentMonth.year}년 {MONTH_NAMES[currentMonth.month]}
        </span>
        <Button variant="ghost" size="sm" onClick={goToNextMonth}>
          ▶
        </Button>
      </div>

      <div className="calendar-weekdays">
        {DAY_NAMES.map(day => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-days">
        {dates.map((date, index) => {
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const disabled = isDateDisabled(date);
          const isOtherMonth = !isCurrentMonth(date);

          return (
            <button
              key={`${toDateString(date)}-${index}`}
              className={`calendar-day ${isSelected ? 'selected' : ''} ${
                isToday(date) ? 'today' : ''
              } ${isOtherMonth ? 'other-month' : ''}`}
              onClick={() => !disabled && onSelectDate(date)}
              disabled={disabled}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
