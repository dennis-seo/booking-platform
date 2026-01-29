import type { HairBooking, CreateHairBookingData, HairBookingSlot } from '../types';
import { mockHairBookings, generateBookingId } from '../mocks/bookings';
import { hairShopService } from './hairShopService';
import { getAvailableTimeSlots, addMinutesToTime } from '@core/utils/timeSlotUtils';
import { logger } from '@core/utils/logger';

// In-memory storage
let bookings = [...mockHairBookings];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const hairBookingService = {
  async getBookingsByCustomer(customerId: string): Promise<HairBooking[]> {
    await delay(300);
    logger.debug('Fetching bookings by customer', { customerId });

    const customerBookings = bookings.filter(b => b.customerId === customerId);

    // Populate relations
    const populatedBookings = await Promise.all(
      customerBookings.map(async booking => {
        const [shop, service, stylist] = await Promise.all([
          hairShopService.getShopById(booking.shopId),
          hairShopService.getServiceById(booking.serviceId),
          booking.stylistId ? hairShopService.getStylistById(booking.stylistId) : null,
        ]);

        return {
          ...booking,
          shop: shop || undefined,
          service: service || undefined,
          stylist: stylist || undefined,
        };
      })
    );

    return populatedBookings;
  },

  async getBookingsByShop(shopId: string, date?: string, populate = false): Promise<HairBooking[]> {
    await delay(300);
    logger.debug('Fetching bookings by shop', { shopId, date });

    let shopBookings = bookings.filter(b => b.shopId === shopId);

    if (date) {
      shopBookings = shopBookings.filter(b => b.bookingDate === date);
    }

    if (populate) {
      const populatedBookings = await Promise.all(
        shopBookings.map(async booking => {
          const service = await hairShopService.getServiceById(booking.serviceId);
          return {
            ...booking,
            service: service || undefined,
          };
        })
      );
      return populatedBookings;
    }

    return shopBookings;
  },

  async getBookingById(id: string): Promise<HairBooking | null> {
    await delay(200);
    const booking = bookings.find(b => b.id === id);
    if (!booking) return null;

    const [shop, service, stylist] = await Promise.all([
      hairShopService.getShopById(booking.shopId),
      hairShopService.getServiceById(booking.serviceId),
      booking.stylistId ? hairShopService.getStylistById(booking.stylistId) : null,
    ]);

    return {
      ...booking,
      shop: shop || undefined,
      service: service || undefined,
      stylist: stylist || undefined,
    };
  },

  async getAvailableSlots(
    shopId: string,
    date: string,
    serviceDurationMinutes: number,
    stylistId?: string
  ): Promise<HairBookingSlot[]> {
    await delay(400);
    logger.debug('Fetching available slots', { shopId, date, serviceDurationMinutes, stylistId });

    const shop = await hairShopService.getShopById(shopId);
    if (!shop) return [];

    // 로컬 시간대로 파싱하여 요일 계산 (UTC 문제 방지)
    const [year, month, day] = date.split('-').map(Number);
    const dayOfWeek = new Date(year, month - 1, day).getDay();

    // Get all existing bookings for this date
    const existingBookings = await this.getBookingsByShop(shopId, date);

    // Filter by stylist if specified
    const relevantBookings = stylistId
      ? existingBookings.filter(b => b.stylistId === stylistId && b.status !== 'cancelled')
      : existingBookings.filter(b => b.status !== 'cancelled');

    // Get booked time slots (전체 예약 시간대를 포함)
    const bookedSlots: string[] = [];
    relevantBookings.forEach(b => {
      // 예약 시작부터 종료까지 모든 슬롯 추가
      let currentTime = b.startTime;
      while (currentTime < b.endTime) {
        bookedSlots.push(currentTime);
        currentTime = addMinutesToTime(currentTime, shop.slotIntervalMinutes);
      }
    });

    // Generate available time slots
    const slots = getAvailableTimeSlots(
      shop.operatingHours,
      dayOfWeek,
      shop.slotIntervalMinutes,
      bookedSlots
    );

    // Filter out slots that don't have enough time for the service
    const operatingHours = shop.operatingHours.find(oh => oh.dayOfWeek === dayOfWeek);
    if (!operatingHours || operatingHours.isClosed) return [];

    return slots.map(slot => ({
      time: slot.time,
      isAvailable: slot.isAvailable &&
        addMinutesToTime(slot.time, serviceDurationMinutes) <= operatingHours.closeTime,
    }));
  },

  async createBooking(
    customerId: string,
    customerName: string,
    customerPhone: string,
    data: CreateHairBookingData
  ): Promise<HairBooking> {
    await delay(500);

    // Get service to calculate end time
    const service = await hairShopService.getServiceById(data.serviceId);
    if (!service) {
      throw new Error('서비스를 찾을 수 없습니다.');
    }

    const endTime = addMinutesToTime(data.startTime, service.durationMinutes);

    const newBooking: HairBooking = {
      id: generateBookingId(),
      customerId,
      shopId: data.shopId,
      serviceId: data.serviceId,
      stylistId: data.stylistId || null,
      bookingDate: data.bookingDate,
      startTime: data.startTime,
      endTime,
      status: 'pending',
      notes: data.notes || null,
      createdAt: new Date().toISOString(),
      customerName,
      customerPhone,
    };

    bookings.push(newBooking);
    logger.info('Booking created', { bookingId: newBooking.id });

    return newBooking;
  },

  async confirmBooking(id: string): Promise<HairBooking | null> {
    await delay(300);
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) return null;

    bookings[index] = {
      ...bookings[index],
      status: 'confirmed',
      updatedAt: new Date().toISOString(),
    };

    logger.info('Booking confirmed', { bookingId: id });
    return bookings[index];
  },

  async cancelBooking(id: string): Promise<HairBooking | null> {
    await delay(300);
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) return null;

    bookings[index] = {
      ...bookings[index],
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    };

    logger.info('Booking cancelled', { bookingId: id });
    return bookings[index];
  },

  async completeBooking(id: string): Promise<HairBooking | null> {
    await delay(300);
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) return null;

    bookings[index] = {
      ...bookings[index],
      status: 'completed',
      updatedAt: new Date().toISOString(),
    };

    logger.info('Booking completed', { bookingId: id });
    return bookings[index];
  },
};
