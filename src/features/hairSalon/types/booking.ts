import type { BaseBooking } from '@core/types';
import type { HairShop, Stylist } from './shop';
import type { HairService } from './service';

export interface HairBooking extends BaseBooking {
  shopId: string;
  stylistId: string | null;
  serviceId: string;
  notes: string | null;
  // Relations (populated when fetching)
  shop?: HairShop;
  stylist?: Stylist | null;
  service?: HairService;
  customerName?: string;
  customerPhone?: string;
}

export interface CreateHairBookingData {
  shopId: string;
  serviceId: string;
  stylistId?: string | null;
  bookingDate: string;
  startTime: string;
  notes?: string;
}

export interface HairBookingSlot {
  time: string;
  isAvailable: boolean;
  stylistId?: string; // If slot is booked, which stylist
}

export interface HairBookingFilter {
  shopId?: string;
  customerId?: string;
  stylistId?: string;
  date?: string;
  status?: string;
}
