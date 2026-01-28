import type { HairShop, HairService, Stylist } from '../types';
import { formatDate, formatTime } from '@core/utils/dateUtils';
import { formatDuration } from '@core/utils/timeSlotUtils';
import { Button } from '@core/components/Button';

interface BookingConfirmProps {
  shop: HairShop;
  service: HairService;
  date: Date;
  time: string;
  stylist: Stylist | null;
  notes: string;
  onNotesChange: (notes: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export function BookingConfirm({
  shop,
  service,
  date,
  time,
  stylist,
  notes,
  onNotesChange,
  onConfirm,
  onBack,
  isLoading,
}: BookingConfirmProps) {
  return (
    <div className="booking-confirm">
      <h3>예약 확인</h3>

      <div className="confirm-details">
        <div className="confirm-item">
          <span className="confirm-label">샵</span>
          <span className="confirm-value">{shop.name}</span>
        </div>

        <div className="confirm-item">
          <span className="confirm-label">서비스</span>
          <span className="confirm-value">
            {service.name} ({formatDuration(service.durationMinutes)})
          </span>
        </div>

        <div className="confirm-item">
          <span className="confirm-label">날짜</span>
          <span className="confirm-value">{formatDate(date)}</span>
        </div>

        <div className="confirm-item">
          <span className="confirm-label">시간</span>
          <span className="confirm-value">{formatTime(time)}</span>
        </div>

        <div className="confirm-item">
          <span className="confirm-label">스타일리스트</span>
          <span className="confirm-value">
            {stylist ? `${stylist.name} ${stylist.title}` : '지정 안함'}
          </span>
        </div>

        <div className="confirm-item">
          <span className="confirm-label">금액</span>
          <span className="confirm-value price">{service.price.toLocaleString()}원</span>
        </div>
      </div>

      <div className="confirm-notes">
        <label htmlFor="notes">요청사항 (선택)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={e => onNotesChange(e.target.value)}
          placeholder="원하시는 스타일이나 요청사항을 적어주세요"
          rows={3}
        />
      </div>

      <div className="confirm-actions">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          이전
        </Button>
        <Button variant="primary" onClick={onConfirm} isLoading={isLoading}>
          예약하기
        </Button>
      </div>
    </div>
  );
}
