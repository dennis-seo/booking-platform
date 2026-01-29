# Hair Salon Feature

> 헤어살롱 예약 시스템 상세 문서

[← Features Overview](./README.md) | [← Back to Index](../README.md)

## Table of Contents

- [Overview](#overview)
- [Pages](#pages)
- [Components](#components)
- [Contexts](#contexts)
- [Hooks](#hooks)
- [Services](#services)
- [Admin Features](#admin-features)

---

## Overview

헤어살롱 예약 시스템은 고객이 살롱을 검색하고 서비스를 예약할 수 있는 기능을 제공합니다.

### 주요 기능

| 기능 | 설명 |
|------|------|
| 살롱 탐색 | 살롱 목록 조회, 상세 정보 확인 |
| 예약 | 서비스 → 스타일리스트 → 날짜/시간 → 확인 |
| 예약 관리 | 내 예약 조회, 취소 |
| 관리자 | 살롱/서비스/스타일리스트/스케줄 관리 |

### 예약 플로우

```
서비스 선택 → 스타일리스트 선택 → 날짜/시간 선택 → 예약 확인 → 완료
```

> 자세한 예약 흐름은 [Booking Flow](./booking-flow.md) 참조

---

## Pages

### HairShopListPage

살롱 목록을 표시하는 페이지

| Property | Type | Description |
|----------|------|-------------|
| Route | `/hair` | 살롱 목록 |
| Data | `HairShop[]` | 활성화된 승인된 살롱 목록 |

**사용 훅**: `useHairShops()`

### HairShopDetailPage

살롱 상세 정보 페이지

| Property | Type | Description |
|----------|------|-------------|
| Route | `/hair/:shopId` | 살롱 상세 |
| Params | `shopId` | 살롱 ID |
| Data | `HairShop`, `HairService[]`, `Stylist[]` | 살롱, 서비스, 스타일리스트 |

**사용 훅**: `useHairShop(shopId)`, `useHairServices(shopId)`, `useStylists(shopId)`

### HairBookingPage

예약 진행 페이지

| Property | Type | Description |
|----------|------|-------------|
| Route | `/hair/:shopId/booking` | 예약 페이지 |
| Protection | `RequireProfileComplete` | 프로필 완성 필수 |

**Context**: `HairBookingProvider`

### HairMyBookingsPage

내 예약 목록 페이지

| Property | Type | Description |
|----------|------|-------------|
| Route | `/hair/my-bookings` | 내 예약 목록 |
| Data | `HairBooking[]` | 사용자 예약 목록 |

**사용 훅**: `useHairBookings(customerId)`

---

## Components

### ShopCard

살롱 카드 컴포넌트

```typescript
interface ShopCardProps {
  shop: HairShop;
  onClick?: () => void;
}
```

### ShopList

살롱 목록 컴포넌트

```typescript
interface ShopListProps {
  shops: HairShop[];
}
```

### ServiceSelector

서비스 선택 컴포넌트

```typescript
interface ServiceSelectorProps {
  services: HairService[];
  selectedService: HairService | null;
  onSelect: (service: HairService) => void;
}
```

**표시 정보**:
- 서비스명
- 카테고리 (커트, 펌, 염색 등)
- 소요 시간
- 가격

### StylistSelector

스타일리스트 선택 컴포넌트

```typescript
interface StylistSelectorProps {
  stylists: Stylist[];
  selectedStylist: Stylist | null;
  onSelect: (stylist: Stylist | null) => void;
  allowNoPreference?: boolean;  // "지정 안함" 옵션
}
```

**표시 정보**:
- 스타일리스트명
- 직책 (원장, 실장, 디자이너)
- 소개
- **정기 휴무일** (예: "휴무: 일, 월")

### BookingTimelineSelector

날짜/시간 선택 타임라인 컴포넌트

```typescript
interface BookingTimelineSelectorProps {
  shopId: string;
  operatingHours: OperatingHours[];
  serviceDurationMinutes: number;
  stylist?: Stylist | null;         // 스타일리스트 정보 (휴무일 포함)
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelect: (date: Date, time: string) => void;
  daysToShow?: number;              // 표시할 일수 (기본: 14)
  showCustomerInfo?: boolean;       // 고객명 표시 (관리자용)
}
```

**기능**:
- 14일간 타임라인 표시
- 영업일/휴무일 구분
- **스타일리스트 휴무일 표시**
- 예약된 시간대 표시
- 서비스 duration 기반 선택 범위
- 현재 시간 가이드라인

**슬롯 상태**:

| 상태 | 클래스 | 설명 |
|------|--------|------|
| 예약 가능 | `.available` | 녹색 |
| 예약됨 | `.booked` | 빨간색 |
| 선택됨 | `.selected` | 파란색 |
| 영업 외 | `.non-operating` | 회색 |
| 과거 | `.past` | 어두운 회색 |
| 휴무일 | `.closed-day-cell` | "휴무" 또는 "스타일리스트명 휴무" |

### BookingConfirm

예약 확인 컴포넌트

```typescript
interface BookingConfirmProps {
  shop: HairShop;
  service: HairService;
  date: Date;
  time: string;
  stylist: Stylist | null;
  notes: string;
  onNotesChange: (notes: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
}
```

### BookingCard

예약 정보 카드 컴포넌트

```typescript
interface BookingCardProps {
  booking: HairBooking;
  onCancel?: (id: string) => void;
  showActions?: boolean;
}
```

---

## Contexts

### HairBookingContext

예약 프로세스 상태 관리

```typescript
type BookingStep = 'service' | 'stylist' | 'datetime' | 'confirm' | 'complete';

interface HairBookingContextValue {
  // State
  shopId: string | null;
  currentStep: BookingStep;
  selectedService: HairService | null;
  selectedStylist: Stylist | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  notes: string;
  isLoading: boolean;
  error: string | null;
  createdBooking: HairBooking | null;

  // Actions
  setShopId: (shopId: string) => void;
  selectService: (service: HairService) => void;
  selectStylist: (stylist: Stylist | null) => void;
  selectDate: (date: Date) => void;
  selectTime: (time: string) => void;
  setNotes: (notes: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: BookingStep) => void;
  submitBooking: () => Promise<HairBooking | null>;
  resetBooking: () => void;
}
```

**단계 순서**: `service` → `stylist` → `datetime` → `confirm` → `complete`

**상태 리셋 규칙**:
- `selectService()`: `selectedDate`, `selectedTime` 리셋
- `selectStylist()`: `selectedDate`, `selectedTime` 리셋

---

## Hooks

### useHairShops

살롱 목록 조회

```typescript
function useHairShops(): {
  shops: HairShop[];
  isLoading: boolean;
  error: string | null;
}
```

### useHairShop

단일 살롱 조회

```typescript
function useHairShop(shopId: string | undefined): {
  shop: HairShop | null;
  isLoading: boolean;
  error: string | null;
}
```

### useHairServices

살롱 서비스 목록 조회

```typescript
function useHairServices(shopId: string | undefined): {
  services: HairService[];
  isLoading: boolean;
  error: string | null;
}
```

### useStylists

스타일리스트 목록 조회

```typescript
function useStylists(shopId: string | undefined): {
  stylists: Stylist[];
  isLoading: boolean;
  error: string | null;
}
```

### useHairBookings

예약 목록 조회

```typescript
function useHairBookings(customerId: string): {
  bookings: HairBooking[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
```

---

## Services

### hairShopService

살롱/스타일리스트/서비스 관련 API

| Method | Description | Returns |
|--------|-------------|---------|
| `getShops()` | 활성 살롱 목록 | `HairShop[]` |
| `getShopById(id)` | 살롱 상세 | `HairShop \| null` |
| `getStylistsByShop(shopId)` | 스타일리스트 목록 | `Stylist[]` |
| `getServicesByShop(shopId)` | 서비스 목록 | `HairService[]` |

### hairBookingService

예약 관련 API

| Method | Description | Returns |
|--------|-------------|---------|
| `getAvailableSlots(shopId, date, duration, stylistId?)` | 예약 가능 슬롯 | `HairBookingSlot[]` |
| `getBookingsByShop(shopId, date?, populate?)` | 살롱 예약 목록 | `HairBooking[]` |
| `getBookingsByCustomer(customerId)` | 고객 예약 목록 | `HairBooking[]` |
| `createBooking(customerId, customerName, customerPhone, data)` | 예약 생성 | `HairBooking` |
| `cancelBooking(id)` | 예약 취소 | `HairBooking` |

---

## Admin Features

### 페이지 목록

| Page | Route | Description |
|------|-------|-------------|
| AdminDashboardPage | `/hair/admin` | 관리자 대시보드 |
| ShopRegisterPage | `/hair/admin/register` | 살롱 등록 |
| ShopManagePage | `/hair/admin/:shopId` | 살롱 관리 |
| ServiceManagePage | `/hair/admin/:shopId/services` | 서비스 관리 |
| StylistManagePage | `/hair/admin/:shopId/stylists` | 스타일리스트 관리 |
| ScheduleManagePage | `/hair/admin/:shopId/schedule` | 스케줄 관리 |

### 접근 권한

- `RequireAdmin` 래퍼로 보호
- `business_owner` 또는 `admin` 역할 필요

---

## Related Documents

- [Booking Flow](./booking-flow.md) - 예약 프로세스 상세
- [Hair Salon Types](../types/hair-salon-types.md) - 타입 정의
- [Hair Salon API](../api/hair-salon-api.md) - API 상세
- [Hair Salon Components](../components/hair-salon-components.md) - 컴포넌트 상세

---

[← Features Overview](./README.md) | [← Back to Index](../README.md)
