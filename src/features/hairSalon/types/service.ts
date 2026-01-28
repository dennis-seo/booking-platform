export type HairServiceCategory = 'cut' | 'perm' | 'color' | 'treatment' | 'styling' | 'other';

export interface HairService {
  id: string;
  shopId: string;
  name: string;
  description?: string;
  durationMinutes: number; // 30, 60, 90, 120, etc.
  price: number;
  category: HairServiceCategory;
  isActive: boolean;
  createdAt: string;
}

export interface CreateHairServiceData {
  shopId: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  category: HairServiceCategory;
}

export interface UpdateHairServiceData extends Partial<Omit<CreateHairServiceData, 'shopId'>> {
  isActive?: boolean;
}

export const HAIR_SERVICE_CATEGORIES: Record<HairServiceCategory, string> = {
  cut: '커트',
  perm: '펌',
  color: '염색',
  treatment: '트리트먼트',
  styling: '스타일링',
  other: '기타',
};
