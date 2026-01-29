import { useState, useMemo } from 'react';
import { Button } from '@core/components/Button';
import type { HairBooking } from '../types';

interface DateTimelineViewProps {
  bookings: HairBooking[];
  operatingHours: { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }[];
  startDate?: Date;
  daysToShow?: number;
  onCellClick?: (date: string, hour: number) => void;
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0-23

export function DateTimelineView({
  bookings,
  operatingHours,
  startDate = new Date(),
  daysToShow = 14,
  onCellClick,
}: DateTimelineViewProps) {
  const [currentStartDate, setCurrentStartDate] = useState(startDate);

  // 표시할 날짜 배열 생성
  const dates = useMemo(() => {
    const result: Date[] = [];
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(currentStartDate);
      date.setDate(date.getDate() + i);
      result.push(date);
    }
    return result;
  }, [currentStartDate, daysToShow]);

  // 특정 날짜의 예약된 시간대 계산
  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(b => b.bookingDate === dateStr && b.status !== 'cancelled');
  };

  // 특정 날짜의 총 예약 시간 계산
  const getTotalBookedHours = (date: Date) => {
    const dateBookings = getBookingsForDate(date);
    let totalMinutes = 0;
    dateBookings.forEach(b => {
      const [startH, startM] = b.startTime.split(':').map(Number);
      const [endH, endM] = b.endTime.split(':').map(Number);
      totalMinutes += (endH * 60 + endM) - (startH * 60 + startM);
    });
    const hours = totalMinutes / 60;
    return hours > 0 ? `${hours}h` : '-';
  };

  // 특정 시간이 예약되어 있는지 확인
  const isHourBooked = (date: Date, hour: number) => {
    const dateBookings = getBookingsForDate(date);
    return dateBookings.some(b => {
      const [startH] = b.startTime.split(':').map(Number);
      const [endH] = b.endTime.split(':').map(Number);
      return hour >= startH && hour < endH;
    });
  };

  // 특정 날짜가 영업일인지 확인
  const isOperatingDay = (date: Date) => {
    const dayOfWeek = date.getDay();
    const hours = operatingHours.find(h => h.dayOfWeek === dayOfWeek);
    return hours ? !hours.isClosed : false;
  };

  // 특정 시간이 영업시간인지 확인
  const isOperatingHour = (date: Date, hour: number) => {
    const dayOfWeek = date.getDay();
    const hours = operatingHours.find(h => h.dayOfWeek === dayOfWeek);
    if (!hours || hours.isClosed) return false;

    const [openH] = hours.openTime.split(':').map(Number);
    const [closeH] = hours.closeTime.split(':').map(Number);
    return hour >= openH && hour < closeH;
  };

  // 현재 시간 위치 계산
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  // 이전/다음 기간으로 이동
  const goToPrevious = () => {
    const newDate = new Date(currentStartDate);
    newDate.setDate(newDate.getDate() - daysToShow);
    setCurrentStartDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentStartDate);
    newDate.setDate(newDate.getDate() + daysToShow);
    setCurrentStartDate(newDate);
  };

  const goToToday = () => {
    setCurrentStartDate(new Date());
  };

  // 날짜 포맷
  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="date-timeline-view">
      {/* 컨트롤 */}
      <div className="timeline-controls">
        <div className="nav-buttons">
          <Button variant="outline" size="sm" onClick={goToPrevious}>이전</Button>
          <Button variant="outline" size="sm" onClick={goToToday}>오늘</Button>
          <Button variant="outline" size="sm" onClick={goToNext}>다음</Button>
        </div>
        <div className="date-range">
          {formatDate(dates[0])} ~ {formatDate(dates[dates.length - 1])}
        </div>
      </div>

      {/* 범례 */}
      <div className="timeline-legend">
        <div className="legend-item">
          <span className="legend-color booked"></span>
          <span>예약됨</span>
        </div>
        <div className="legend-item">
          <span className="legend-color available"></span>
          <span>예약 가능</span>
        </div>
        <div className="legend-item">
          <span className="legend-color closed"></span>
          <span>영업 외</span>
        </div>
      </div>

      {/* 타임라인 그리드 */}
      <div className="timeline-container">
        <table className="timeline-table">
          <thead>
            <tr>
              <th className="date-col">날짜</th>
              <th className="hours-col">시간</th>
              {HOURS.map(hour => (
                <th key={hour} className="hour-header">
                  {hour}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dates.map((date, idx) => {
              const isOp = isOperatingDay(date);
              const isTodayRow = isToday(date);

              return (
                <tr
                  key={idx}
                  className={`timeline-row ${!isOp ? 'closed-day' : ''} ${isTodayRow ? 'today-row' : ''}`}
                >
                  <td className="date-cell">
                    <div className="date-info">
                      <span className="date-number">{date.getDate()}</span>
                      <span className={`day-name ${date.getDay() === 0 ? 'sunday' : date.getDay() === 6 ? 'saturday' : ''}`}>
                        ({DAY_NAMES[date.getDay()]})
                      </span>
                    </div>
                    {!isOp && <span className="closed-label">휴무</span>}
                  </td>
                  <td className="total-hours">
                    {isOp ? getTotalBookedHours(date) : '-'}
                  </td>
                  {HOURS.map(hour => {
                    const isOpHour = isOperatingHour(date, hour);
                    const isBooked = isHourBooked(date, hour);
                    const isPast = date < now && !(isTodayRow && hour >= currentHour);

                    let cellClass = 'hour-cell';
                    if (!isOp || !isOpHour) {
                      cellClass += ' non-operating';
                    } else if (isBooked) {
                      cellClass += ' booked';
                    } else if (isPast) {
                      cellClass += ' past';
                    } else {
                      cellClass += ' available';
                    }

                    return (
                      <td
                        key={hour}
                        className={cellClass}
                        onClick={() => isOpHour && !isBooked && !isPast && onCellClick?.(
                          date.toISOString().split('T')[0],
                          hour
                        )}
                      >
                        {/* 현재 시간 인디케이터 */}
                        {isTodayRow && hour === currentHour && (
                          <div
                            className="current-time-indicator"
                            style={{ left: `${(currentMinutes / 60) * 100}%` }}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
