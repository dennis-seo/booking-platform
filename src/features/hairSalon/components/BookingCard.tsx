import type { HairBooking } from '../types';
import { formatDate, formatTime } from '@core/utils/dateUtils';
import { formatDuration } from '@core/utils/timeSlotUtils';
import { Button } from '@core/components/Button';

interface BookingCardProps {
  booking: HairBooking;
  onCancel?: (bookingId: string) => void;
  showActions?: boolean;
}

const STATUS_LABELS: Record<string, { text: string; className: string }> = {
  pending: { text: '대기중', className: 'status-pending' },
  confirmed: { text: '확정', className: 'status-confirmed' },
  completed: { text: '완료', className: 'status-completed' },
  cancelled: { text: '취소됨', className: 'status-cancelled' },
};

export function BookingCard({ booking, onCancel, showActions = true }: BookingCardProps) {
  const status = STATUS_LABELS[booking.status] || { text: booking.status, className: '' };
  const bookingDateTime = new Date(`${booking.bookingDate}T${booking.startTime}`);
  const isPast = bookingDateTime < new Date();
  const canCancel = !isPast && booking.status !== 'cancelled' && booking.status !== 'completed';

  return (
    <div className={`booking-card ${status.className}`}>
      <div className="booking-card-header">
        <h4>{booking.shop?.name || '샵 정보 없음'}</h4>
        <span className={`booking-status ${status.className}`}>{status.text}</span>
      </div>

      <div className="booking-card-body">
        <div className="booking-info-row">
          <span className="label">서비스</span>
          <span className="value">
            {booking.service?.name || '서비스 정보 없음'}
            {booking.service && ` (${formatDuration(booking.service.durationMinutes)})`}
          </span>
        </div>

        <div className="booking-info-row">
          <span className="label">날짜</span>
          <span className="value">{formatDate(booking.bookingDate)}</span>
        </div>

        <div className="booking-info-row">
          <span className="label">시간</span>
          <span className="value">
            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
          </span>
        </div>

        <div className="booking-info-row">
          <span className="label">스타일리스트</span>
          <span className="value">
            {booking.stylist
              ? `${booking.stylist.name} ${booking.stylist.title}`
              : '지정 안함'}
          </span>
        </div>

        {booking.service && (
          <div className="booking-info-row">
            <span className="label">금액</span>
            <span className="value price">{booking.service.price.toLocaleString()}원</span>
          </div>
        )}

        {booking.notes && (
          <div className="booking-info-row notes">
            <span className="label">요청사항</span>
            <span className="value">{booking.notes}</span>
          </div>
        )}
      </div>

      {showActions && canCancel && onCancel && (
        <div className="booking-card-actions">
          <Button
            variant="danger"
            size="sm"
            onClick={() => onCancel(booking.id)}
          >
            예약 취소
          </Button>
        </div>
      )}
    </div>
  );
}
