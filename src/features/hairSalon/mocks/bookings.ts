import type { HairBooking } from '../types';

// Get tomorrow's date as YYYY-MM-DD
const getTomorrowDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const getNextWeekDate = (): string => {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  return nextWeek.toISOString().split('T')[0];
};

export const mockHairBookings: HairBooking[] = [
  {
    id: 'booking-1',
    customerId: 'user-1',
    shopId: 'shop-1',
    serviceId: 'svc-2',
    stylistId: 'stylist-1',
    bookingDate: getTomorrowDate(),
    startTime: '14:00',
    endTime: '15:00',
    status: 'confirmed',
    notes: '레이어드 커트 원합니다',
    createdAt: new Date().toISOString(),
    customerName: '김고객',
    customerPhone: '010-1234-5678',
  },
  {
    id: 'booking-2',
    customerId: 'user-1',
    shopId: 'shop-1',
    serviceId: 'svc-3',
    stylistId: 'stylist-2',
    bookingDate: getNextWeekDate(),
    startTime: '10:00',
    endTime: '12:00',
    status: 'pending',
    notes: null,
    createdAt: new Date().toISOString(),
    customerName: '김고객',
    customerPhone: '010-1234-5678',
  },
  {
    id: 'booking-3',
    customerId: 'user-2',
    shopId: 'shop-1',
    serviceId: 'svc-1',
    stylistId: 'stylist-3',
    bookingDate: getTomorrowDate(),
    startTime: '11:00',
    endTime: '11:30',
    status: 'confirmed',
    notes: null,
    createdAt: new Date().toISOString(),
    customerName: '이고객',
    customerPhone: '010-2222-3333',
  },
];

// Helper to generate ID
export function generateBookingId(): string {
  return `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
