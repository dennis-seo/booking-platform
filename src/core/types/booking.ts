export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface BaseBooking {
  id: string;
  customerId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

export interface OperatingHours {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ...
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}
