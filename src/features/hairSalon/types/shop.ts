import type { OperatingHours } from '@core/types';

export interface HairShop {
  id: string;
  name: string;
  ownerId: string;
  address: string;
  phone: string;
  description?: string;
  slotIntervalMinutes: number;
  operatingHours: OperatingHours[];
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Stylist {
  id: string;
  shopId: string;
  name: string;
  title: string; // "원장", "실장", "디자이너"
  profileImage: string | null;
  introduction?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateHairShopData {
  name: string;
  address: string;
  phone: string;
  description?: string;
  slotIntervalMinutes?: number;
  operatingHours: OperatingHours[];
  imageUrl?: string;
}

export interface UpdateHairShopData extends Partial<CreateHairShopData> {
  isActive?: boolean;
}

export interface CreateStylistData {
  shopId: string;
  name: string;
  title: string;
  profileImage?: string;
  introduction?: string;
}

export interface UpdateStylistData extends Partial<Omit<CreateStylistData, 'shopId'>> {
  isActive?: boolean;
}
