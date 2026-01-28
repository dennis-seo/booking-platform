import type { TimeSlot } from '../types';
import { formatTime } from '../utils/dateUtils';

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
}

export function TimeSlotPicker({
  slots,
  selectedTime,
  onSelectTime,
}: TimeSlotPickerProps) {
  if (slots.length === 0) {
    return (
      <div className="time-slot-picker empty">
        <p>선택 가능한 시간이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="time-slot-picker">
      <div className="time-slots">
        {slots.map(slot => (
          <button
            key={slot.time}
            className={`time-slot ${selectedTime === slot.time ? 'selected' : ''} ${
              !slot.isAvailable ? 'unavailable' : ''
            }`}
            onClick={() => slot.isAvailable && onSelectTime(slot.time)}
            disabled={!slot.isAvailable}
          >
            {formatTime(slot.time)}
          </button>
        ))}
      </div>
    </div>
  );
}
