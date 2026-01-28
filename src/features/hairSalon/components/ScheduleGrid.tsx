import { useState, useEffect, useMemo, useRef } from 'react';
import type { HairShop, Stylist, HairBooking } from '../types';
import { DAY_NAMES, toDateString } from '@core/utils/dateUtils';
import { generateTimeSlots } from '@core/utils/timeSlotUtils';

interface ScheduleGridProps {
  shop: HairShop;
  stylists: Stylist[];
  bookings: HairBooking[];
  year: number;
  month: number; // 0-indexed
  onSlotClick?: (date: string, time: string, stylistId: string) => void;
  onBookingClick?: (booking: HairBooking) => void;
}

export function ScheduleGrid({
  shop,
  stylists,
  bookings,
  year,
  month,
  onSlotClick,
  onBookingClick,
}: ScheduleGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Generate all days in the month
  const daysInMonth = useMemo(() => {
    const days: Date[] = [];
    const lastDay = new Date(year, month + 1, 0);

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [year, month]);

  // Generate time slots for the grid (6:00 - 22:00 in 30min intervals)
  const timeSlots = useMemo(() => {
    return generateTimeSlots('06:00', '22:00', 30);
  }, []);

  // Create booking lookup map for quick access
  const bookingMap = useMemo(() => {
    const map = new Map<string, HairBooking>();
    bookings.forEach(booking => {
      // Key format: date-time-stylistId
      const key = `${booking.bookingDate}-${booking.startTime}-${booking.stylistId || 'any'}`;
      map.set(key, booking);

      // Also map slots that the booking spans (for multi-slot bookings)
      if (booking.service) {
        const [startHour, startMin] = booking.startTime.split(':').map(Number);
        const totalSlots = Math.ceil(booking.service.durationMinutes / 30);

        for (let i = 1; i < totalSlots; i++) {
          const slotMinutes = (startHour * 60 + startMin) + (i * 30);
          const slotHour = Math.floor(slotMinutes / 60);
          const slotMin = slotMinutes % 60;
          const slotTime = `${slotHour.toString().padStart(2, '0')}:${slotMin.toString().padStart(2, '0')}`;
          const spanKey = `${booking.bookingDate}-${slotTime}-${booking.stylistId || 'any'}`;
          map.set(spanKey, { ...booking, _isSpan: true } as HairBooking & { _isSpan?: boolean });
        }
      }
    });
    return map;
  }, [bookings]);

  // Check if a time is within working hours for a given day
  const isWorkingHour = (date: Date, time: string): boolean => {
    const dayOfWeek = date.getDay();
    const hours = shop.operatingHours.find(oh => oh.dayOfWeek === dayOfWeek);

    if (!hours || hours.isClosed) return false;

    return time >= hours.openTime && time < hours.closeTime;
  };

  // Calculate current time position
  const currentTimePosition = useMemo(() => {
    const now = currentTime;
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Calculate position as percentage of the visible time range (6:00 - 22:00)
    const totalMinutes = (hours - 6) * 60 + minutes;
    const totalRange = 16 * 60; // 6:00 to 22:00 = 16 hours

    if (totalMinutes < 0 || totalMinutes > totalRange) return null;

    return (totalMinutes / totalRange) * 100;
  }, [currentTime]);

  // Check if current date is in the displayed month
  const isCurrentMonth = currentTime.getFullYear() === year && currentTime.getMonth() === month;
  const currentDateStr = toDateString(currentTime);

  // Scroll to current time on mount
  useEffect(() => {
    if (gridRef.current && currentTimePosition !== null && isCurrentMonth) {
      const scrollLeft = (currentTimePosition / 100) * gridRef.current.scrollWidth - gridRef.current.clientWidth / 2;
      gridRef.current.scrollLeft = Math.max(0, scrollLeft);
    }
  }, [currentTimePosition, isCurrentMonth]);

  const getCellClass = (date: Date, time: string, booking: HairBooking | null): string => {
    const classes = ['schedule-cell'];
    const dateStr = toDateString(date);
    const isPast = dateStr < currentDateStr || (dateStr === currentDateStr && time < `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`);

    if (!isWorkingHour(date, time)) {
      classes.push('non-working');
    } else if (booking) {
      if ((booking as HairBooking & { _isSpan?: boolean })._isSpan) {
        classes.push('booked', 'booking-span');
      } else {
        classes.push('booked', 'booking-start');
      }
      if (booking.status === 'confirmed') classes.push('confirmed');
      if (booking.status === 'pending') classes.push('pending');
      if (booking.status === 'completed') classes.push('completed');
      if (booking.status === 'cancelled') classes.push('cancelled');
    } else if (isPast) {
      classes.push('past');
    } else {
      classes.push('available');
    }

    return classes.join(' ');
  };

  const handleCellClick = (date: Date, time: string, stylistId: string, booking: HairBooking | null) => {
    if (booking && !(booking as HairBooking & { _isSpan?: boolean })._isSpan) {
      onBookingClick?.(booking);
    } else if (!booking && isWorkingHour(date, time)) {
      onSlotClick?.(toDateString(date), time, stylistId);
    }
  };

  return (
    <div className="schedule-grid-container">
      <div className="schedule-grid" ref={gridRef}>
        {/* Header Row - Time slots */}
        <div className="schedule-header">
          <div className="schedule-header-fixed">
            <div className="date-cell header">날짜</div>
            <div className="stylist-cell header">스타일리스트</div>
            <div className="hours-cell header">시간</div>
          </div>
          <div className="schedule-header-scroll">
            <div className="time-slots-header">
              {timeSlots.map(time => (
                <div key={time} className="time-header-cell">
                  {time.endsWith(':00') ? time.split(':')[0] : ''}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Body - Days and Stylists */}
        <div className="schedule-body">
          {daysInMonth.map(date => {
            const dateStr = toDateString(date);
            const dayOfWeek = date.getDay();
            const dayHours = shop.operatingHours.find(oh => oh.dayOfWeek === dayOfWeek);
            const isClosed = !dayHours || dayHours.isClosed;
            const isToday = dateStr === currentDateStr;
            const workingHoursText = isClosed ? '-' : `${dayHours!.openTime.split(':')[0]}h`;

            return (
              <div key={dateStr} className={`schedule-day ${isClosed ? 'closed' : ''} ${isToday ? 'today' : ''}`}>
                {stylists.map((stylist, stylistIndex) => (
                  <div key={`${dateStr}-${stylist.id}`} className="schedule-row">
                    {/* Fixed columns */}
                    <div className="schedule-row-fixed">
                      {stylistIndex === 0 && (
                        <>
                          <div className="date-cell" style={{ gridRow: `span ${stylists.length}` }}>
                            <span className="date-number">{date.getDate()}</span>
                            <span className="day-name">({DAY_NAMES[dayOfWeek]})</span>
                            {isToday && <span className="today-badge">오늘</span>}
                          </div>
                        </>
                      )}
                      <div className="stylist-cell">
                        <span className="stylist-name">{stylist.name}</span>
                        <span className="stylist-title">{stylist.title}</span>
                      </div>
                      {stylistIndex === 0 && (
                        <div className="hours-cell" style={{ gridRow: `span ${stylists.length}` }}>
                          {workingHoursText}
                        </div>
                      )}
                    </div>

                    {/* Scrollable time slots */}
                    <div className="schedule-row-scroll">
                      <div className="time-slots-row">
                        {timeSlots.map(time => {
                          const key = `${dateStr}-${time}-${stylist.id}`;
                          const anyKey = `${dateStr}-${time}-any`;
                          const booking = bookingMap.get(key) || bookingMap.get(anyKey) || null;

                          return (
                            <div
                              key={time}
                              className={getCellClass(date, time, booking)}
                              onClick={() => handleCellClick(date, time, stylist.id, booking)}
                              title={booking ? `${booking.customerName || '예약'} - ${booking.service?.name || ''}` : ''}
                            >
                              {booking && !(booking as HairBooking & { _isSpan?: boolean })._isSpan && (
                                <span className="booking-label">
                                  {booking.customerName?.charAt(0) || '예'}
                                </span>
                              )}
                            </div>
                          );
                        })}

                        {/* Current time indicator */}
                        {isToday && currentTimePosition !== null && stylistIndex === 0 && (
                          <div
                            className="current-time-line"
                            style={{
                              left: `${currentTimePosition}%`,
                              height: `${stylists.length * 100}%`
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
