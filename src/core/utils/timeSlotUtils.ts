import type { TimeSlot, OperatingHours } from '../types';

export function generateTimeSlots(
  openTime: string,
  closeTime: string,
  intervalMinutes: number
): string[] {
  const slots: string[] = [];
  const [openHour, openMin] = openTime.split(':').map(Number);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);

  let currentMinutes = openHour * 60 + openMin;
  const endMinutes = closeHour * 60 + closeMin;

  while (currentMinutes < endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
    currentMinutes += intervalMinutes;
  }

  return slots;
}

export function getOperatingHoursForDay(
  operatingHours: OperatingHours[],
  dayOfWeek: number
): OperatingHours | undefined {
  return operatingHours.find(oh => oh.dayOfWeek === dayOfWeek);
}

export function isShopOpenOnDay(
  operatingHours: OperatingHours[],
  dayOfWeek: number
): boolean {
  const hours = getOperatingHoursForDay(operatingHours, dayOfWeek);
  return hours ? !hours.isClosed : false;
}

export function getAvailableTimeSlots(
  operatingHours: OperatingHours[],
  dayOfWeek: number,
  intervalMinutes: number,
  bookedSlots: string[] = []
): TimeSlot[] {
  const hours = getOperatingHoursForDay(operatingHours, dayOfWeek);

  if (!hours || hours.isClosed) {
    return [];
  }

  const allSlots = generateTimeSlots(hours.openTime, hours.closeTime, intervalMinutes);

  return allSlots.map(time => ({
    time,
    isAvailable: !bookedSlots.includes(time),
  }));
}

export function addMinutesToTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
}

export function isTimeInRange(time: string, startTime: string, endTime: string): boolean {
  return time >= startTime && time < endTime;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}분`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
}
