import { useState, useMemo, useEffect } from 'react';
import { Button } from '@core/components/Button';
import type { OperatingHours } from '@core/types';
import type { HairBookingSlot, HairBooking } from '../types';
import { hairBookingService } from '../services';

// 로컬 시간대 기준 날짜 문자열 생성 (YYYY-MM-DD)
const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface BookingTimelineSelectorProps {
  shopId: string;
  operatingHours: OperatingHours[];
  serviceDurationMinutes: number;
  stylistId?: string | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelect: (date: Date, time: string) => void;
  daysToShow?: number;
  showCustomerInfo?: boolean; // 고객명 표시 여부 (업체 관리자/admin만 true)
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export function BookingTimelineSelector({
  shopId,
  operatingHours,
  serviceDurationMinutes,
  stylistId,
  selectedDate,
  selectedTime,
  onSelect,
  daysToShow = 14,
  showCustomerInfo = false,
}: BookingTimelineSelectorProps) {
  const [currentStartDate, setCurrentStartDate] = useState(() => new Date());
  const [slotsMap, setSlotsMap] = useState<Record<string, HairBookingSlot[]>>({});
  const [bookingsMap, setBookingsMap] = useState<Record<string, HairBooking[]>>({});
  const [loadingDates, setLoadingDates] = useState<Set<string>>(new Set());

  // 표시할 날짜 배열 생성
  const dates = useMemo(() => {
    const result: Date[] = [];
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(currentStartDate);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + i);
      result.push(date);
    }
    return result;
  }, [currentStartDate, daysToShow]);

  // 영업 시간 범위 계산 (가장 빠른 오픈 ~ 가장 늦은 마감)
  const timeRange = useMemo(() => {
    const activeHours = operatingHours.filter(oh => !oh.isClosed);
    if (activeHours.length === 0) return { start: 9, end: 18 };

    let minOpen = 24;
    let maxClose = 0;

    activeHours.forEach(oh => {
      const [openH] = oh.openTime.split(':').map(Number);
      const [closeH] = oh.closeTime.split(':').map(Number);
      if (openH < minOpen) minOpen = openH;
      if (closeH > maxClose) maxClose = closeH;
    });

    return { start: minOpen, end: maxClose };
  }, [operatingHours]);

  // 표시할 시간 슬롯 (10분 단위)
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let h = timeRange.start; h < timeRange.end; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
      slots.push(`${h.toString().padStart(2, '0')}:10`);
      slots.push(`${h.toString().padStart(2, '0')}:20`);
      slots.push(`${h.toString().padStart(2, '0')}:30`);
      slots.push(`${h.toString().padStart(2, '0')}:40`);
      slots.push(`${h.toString().padStart(2, '0')}:50`);
    }
    return slots;
  }, [timeRange]);

  // shopId, stylistId, serviceDurationMinutes 변경 시 캐시 초기화
  const [fetchKey, setFetchKey] = useState(0);
  useEffect(() => {
    setSlotsMap({});
    setBookingsMap({});
    setLoadingDates(new Set());
    setFetchKey(k => k + 1);
  }, [shopId, stylistId, serviceDurationMinutes]);

  // 각 날짜별 슬롯 및 예약 데이터 로드
  useEffect(() => {
    let cancelled = false;
    const fetchedDates = new Set<string>();

    const fetchSlotsForDates = async () => {
      for (const date of dates) {
        if (cancelled) break;

        const dateStr = toLocalDateString(date);

        // 휴무일이면 스킵
        const dayOfWeek = date.getDay();
        const dayHours = operatingHours.find(oh => oh.dayOfWeek === dayOfWeek);
        if (!dayHours || dayHours.isClosed) continue;

        // 과거 날짜면 스킵
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) continue;

        // 이미 fetch 중이면 스킵
        if (fetchedDates.has(dateStr)) continue;
        fetchedDates.add(dateStr);

        setLoadingDates(prev => new Set(prev).add(dateStr));

        try {
          const [slots, bookings] = await Promise.all([
            hairBookingService.getAvailableSlots(
              shopId,
              dateStr,
              serviceDurationMinutes,
              stylistId || undefined
            ),
            hairBookingService.getBookingsByShop(shopId, dateStr, true),
          ]);

          if (!cancelled) {
            setSlotsMap(prev => ({ ...prev, [dateStr]: slots }));
            setBookingsMap(prev => ({ ...prev, [dateStr]: bookings }));
          }
        } catch (err) {
          console.error('Failed to fetch slots for', dateStr, err);
        } finally {
          if (!cancelled) {
            setLoadingDates(prev => {
              const next = new Set(prev);
              next.delete(dateStr);
              return next;
            });
          }
        }
      }
    };

    fetchSlotsForDates();

    return () => {
      cancelled = true;
    };
  }, [dates, shopId, serviceDurationMinutes, stylistId, operatingHours, fetchKey]);

  // 특정 날짜가 영업일인지 확인
  const isOperatingDay = (date: Date) => {
    const dayOfWeek = date.getDay();
    const hours = operatingHours.find(h => h.dayOfWeek === dayOfWeek);
    return hours ? !hours.isClosed : false;
  };

  // 특정 시간이 영업시간인지 확인
  const isOperatingTime = (date: Date, time: string) => {
    const dayOfWeek = date.getDay();
    const hours = operatingHours.find(h => h.dayOfWeek === dayOfWeek);
    if (!hours || hours.isClosed) return false;

    return time >= hours.openTime && time < hours.closeTime;
  };

  // 특정 슬롯이 예약 가능한지 확인
  const isSlotAvailable = (date: Date, time: string) => {
    const dateStr = toLocalDateString(date);
    const slots = slotsMap[dateStr];
    if (!slots) return false;

    const slot = slots.find(s => s.time === time);
    return slot?.isAvailable ?? false;
  };

  // 과거 시간인지 확인
  const isPastTime = (date: Date, time: string) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(hours, minutes, 0, 0);
    return slotDate < now;
  };

  // 선택된 슬롯인지 확인
  const isSelected = (date: Date, time: string) => {
    if (!selectedDate || !selectedTime) return false;
    const dateStr = toLocalDateString(date);
    const selectedDateStr = toLocalDateString(selectedDate);
    return dateStr === selectedDateStr && time === selectedTime;
  };

  // 특정 시간의 예약 정보 가져오기
  const getBookingForTime = (date: Date, time: string): HairBooking | null => {
    const dateStr = toLocalDateString(date);
    const bookings = bookingsMap[dateStr];
    if (!bookings) return null;

    // 해당 시간이 예약 시간 범위에 포함되는지 확인
    return bookings.find(b => {
      if (b.status === 'cancelled') return false;
      return time >= b.startTime && time < b.endTime;
    }) || null;
  };

  // 예약 정보 툴팁 텍스트 생성
  const getBookingTooltip = (booking: HairBooking): string => {
    const parts = [`${booking.startTime} - ${booking.endTime}`];

    // 고객명은 권한이 있을 때만 표시
    if (showCustomerInfo && booking.customerName) {
      parts.push(booking.customerName);
    }

    if (booking.service?.name) {
      parts.push(booking.service.name);
    }

    // 권한 없으면 "예약됨" 추가
    if (!showCustomerInfo) {
      parts.push('예약됨');
    }

    return parts.join(' | ');
  };

  // 이전/다음 기간으로 이동
  const goToPrevious = () => {
    const newDate = new Date(currentStartDate);
    newDate.setDate(newDate.getDate() - daysToShow);
    // 오늘보다 이전으로는 못 감
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newDate < today) {
      setCurrentStartDate(today);
    } else {
      setCurrentStartDate(newDate);
    }
  };

  const goToNext = () => {
    const newDate = new Date(currentStartDate);
    newDate.setDate(newDate.getDate() + daysToShow);
    setCurrentStartDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setCurrentStartDate(today);
  };

  // 날짜 포맷
  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // 첫 날이 오늘인지 확인 (이전 버튼 비활성화용)
  const isAtStart = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(currentStartDate);
    start.setHours(0, 0, 0, 0);
    return start <= today;
  }, [currentStartDate]);

  const handleSlotClick = (date: Date, time: string) => {
    if (!isOperatingDay(date) || !isOperatingTime(date, time)) return;
    if (isPastTime(date, time)) return;
    if (!isSlotAvailable(date, time)) return;

    onSelect(date, time);
  };

  return (
    <div className="booking-timeline-selector">
      {/* 컨트롤 */}
      <div className="timeline-controls">
        <div className="nav-buttons">
          <Button variant="outline" size="sm" onClick={goToPrevious} disabled={isAtStart}>
            ◀ 이전
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            오늘
          </Button>
          <Button variant="outline" size="sm" onClick={goToNext}>
            다음 ▶
          </Button>
        </div>
        <div className="date-range">
          {formatDate(dates[0])} ~ {formatDate(dates[dates.length - 1])}
        </div>
      </div>

      {/* 범례 */}
      <div className="timeline-legend">
        <div className="legend-item">
          <span className="legend-color available"></span>
          <span>예약 가능</span>
        </div>
        <div className="legend-item">
          <span className="legend-color booked"></span>
          <span>예약 불가</span>
        </div>
        <div className="legend-item">
          <span className="legend-color selected"></span>
          <span>선택됨</span>
        </div>
        <div className="legend-item">
          <span className="legend-color closed"></span>
          <span>영업 외</span>
        </div>
      </div>

      {/* 타임라인 그리드 */}
      <div className="timeline-container booking-timeline">
        <table className="timeline-table">
          <thead>
            <tr>
              <th className="date-col">날짜</th>
              {timeSlots.map(time => (
                <th key={time} className="time-header">
                  {time.endsWith(':00') ? time.split(':')[0] : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dates.map((date, idx) => {
              const isOp = isOperatingDay(date);
              const isTodayRow = isToday(date);
              const dateStr = toLocalDateString(date);
              const isLoadingRow = loadingDates.has(dateStr);

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
                  </td>
                  {!isOp ? (
                    <td colSpan={timeSlots.length} className="closed-day-cell">
                      휴 무
                    </td>
                  ) : (
                    timeSlots.map((time, timeIdx) => {
                      const isOpTime = isOperatingTime(date, time);
                      const isPast = isPastTime(date, time);
                      const isAvailable = isSlotAvailable(date, time);
                      const isSelectedSlot = isSelected(date, time);
                      const isHourStart = time.endsWith(':00');
                      const booking = getBookingForTime(date, time);
                      const isBooked = !!booking;
                      const hasSlotData = slotsMap[dateStr] !== undefined;

                      // 이전 셀과 같은 예약인지 확인 (연속된 예약 블록)
                      const prevTime = timeIdx > 0 ? timeSlots[timeIdx - 1] : null;
                      const prevBooking = prevTime ? getBookingForTime(date, prevTime) : null;
                      const isContinuousBooking = isBooked && prevBooking && booking?.id === prevBooking?.id;

                      let cellClass = 'time-cell';
                      // hour-start는 항상 :00 시간에 추가
                      if (isHourStart) {
                        cellClass += ' hour-start';
                      }
                      if (isContinuousBooking) {
                        cellClass += ' continuous-booking';
                      }
                      if (!isOpTime) {
                        cellClass += ' non-operating';
                      } else if (isSelectedSlot) {
                        cellClass += ' selected';
                      } else if (isPast) {
                        cellClass += ' past';
                      } else if (isLoadingRow || !hasSlotData) {
                        cellClass += ' loading';
                      } else if (isAvailable) {
                        cellClass += ' available';
                      } else {
                        cellClass += ' booked';
                      }

                      const isClickable = isOpTime && !isPast && isAvailable && !isLoadingRow;

                      // 툴팁 설정
                      let tooltip: string | undefined;
                      if (isClickable) {
                        tooltip = `${formatDate(date)} ${time} 선택`;
                      } else if (isBooked && booking) {
                        tooltip = getBookingTooltip(booking);
                      }

                      return (
                        <td
                          key={time}
                          className={cellClass}
                          onClick={() => isClickable && handleSlotClick(date, time)}
                          title={tooltip}
                        >
                          {isLoadingRow && isOpTime && !isPast && (
                            <span className="loading-dot">·</span>
                          )}
                        </td>
                      );
                    })
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 선택된 시간 표시 */}
      {selectedDate && selectedTime && (
        <div className="selected-datetime">
          <strong>선택된 시간:</strong>{' '}
          {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 ({DAY_NAMES[selectedDate.getDay()]}) {selectedTime}
        </div>
      )}
    </div>
  );
}
