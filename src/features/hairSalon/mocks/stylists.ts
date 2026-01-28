import type { Stylist } from '../types';

export const mockStylists: Stylist[] = [
  // Shop 1 Stylists
  {
    id: 'stylist-1',
    shopId: 'shop-1',
    name: '김원장',
    title: '원장',
    profileImage: null,
    introduction: '15년 경력의 헤어 전문가',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'stylist-2',
    shopId: 'shop-1',
    name: '이실장',
    title: '실장',
    profileImage: null,
    introduction: '트렌디한 스타일 전문',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'stylist-3',
    shopId: 'shop-1',
    name: '박디자이너',
    title: '디자이너',
    profileImage: null,
    introduction: '젊고 감각적인 스타일링',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },

  // Shop 2 Stylists
  {
    id: 'stylist-4',
    shopId: 'shop-2',
    name: '최원장',
    title: '원장',
    profileImage: null,
    introduction: '자연스러운 스타일의 대가',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'stylist-5',
    shopId: 'shop-2',
    name: '정디자이너',
    title: '디자이너',
    profileImage: null,
    introduction: '염색 전문',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
  },

  // Shop 3 Stylists
  {
    id: 'stylist-6',
    shopId: 'shop-3',
    name: '한원장',
    title: '원장',
    profileImage: null,
    introduction: '모던 스타일 전문가',
    isActive: true,
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'stylist-7',
    shopId: 'shop-3',
    name: '윤실장',
    title: '실장',
    profileImage: null,
    introduction: '펌 스타일리스트',
    isActive: true,
    createdAt: '2024-02-01T00:00:00Z',
  },
];
