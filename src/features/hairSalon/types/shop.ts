import type { OperatingHours } from '@core/types';

export type ShopApprovalStatus = 'pending' | 'approved' | 'rejected';

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
  approvalStatus: ShopApprovalStatus;
  rejectionReason?: string;
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
  regularDaysOff?: number[]; // 정기 휴무 요일 (0=일, 1=월, ..., 6=토)
  daysOff?: string[]; // 특정 날짜 휴무 (YYYY-MM-DD 형식)
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
