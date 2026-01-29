# Hair Salon Types

> 헤어살롱 도메인 타입 정의

[← Types Overview](./README.md) | [← Back to Index](../README.md)

## Table of Contents

- [Shop Types](#shop-types)
- [Service Types](#service-types)
- [Booking Types](#booking-types)

---

## Shop Types

> `src/features/hairSalon/types/shop.ts`

### ShopApprovalStatus

샵 승인 상태

```typescript
type ShopApprovalStatus = 'pending' | 'approved' | 'rejected';
```

| Value | Description |
|-------|-------------|
| `pending` | 승인 대기 |
| `approved` | 승인됨 |
| `rejected` | 거절됨 |

### HairShop

헤어샵 엔티티

```typescript
interface HairShop {
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
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | 샵 고유 ID |
| `name` | `string` | Yes | 샵 이름 |
| `ownerId` | `string` | Yes | 소유자 (사업주) ID |
| `address` | `string` | Yes | 주소 |
| `phone` | `string` | Yes | 전화번호 |
| `description` | `string` | No | 샵 설명 |
| `slotIntervalMinutes` | `number` | Yes | 예약 슬롯 간격 (분) |
| `operatingHours` | `OperatingHours[]` | Yes | 영업 시간 (7일) |
| `imageUrl` | `string \| null` | Yes | 대표 이미지 URL |
| `isActive` | `boolean` | Yes | 활성화 상태 |
| `approvalStatus` | `ShopApprovalStatus` | Yes | 승인 상태 |
| `rejectionReason` | `string` | No | 거절 사유 |
| `createdAt` | `string` | Yes | 생성 일시 |
| `updatedAt` | `string` | No | 수정 일시 |

### CreateHairShopData

샵 생성 데이터

```typescript
interface CreateHairShopData {
  name: string;
  address: string;
  phone: string;
  description?: string;
  slotIntervalMinutes?: number;
  operatingHours: OperatingHours[];
  imageUrl?: string;
}
```

### UpdateHairShopData

샵 수정 데이터

```typescript
interface UpdateHairShopData extends Partial<CreateHairShopData> {
  isActive?: boolean;
}
```

### Stylist

스타일리스트 엔티티

```typescript
interface Stylist {
  id: string;
  shopId: string;
  name: string;
  title: string;
  profileImage: string | null;
  introduction?: string;
  regularDaysOff?: number[];   // 정기 휴무 요일
  daysOff?: string[];          // 특정 날짜 휴무
  isActive: boolean;
  createdAt: string;
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | 스타일리스트 고유 ID |
| `shopId` | `string` | Yes | 소속 샵 ID |
| `name` | `string` | Yes | 이름 |
| `title` | `string` | Yes | 직책 ("원장", "실장", "디자이너") |
| `profileImage` | `string \| null` | Yes | 프로필 이미지 URL |
| `introduction` | `string` | No | 소개 |
| `regularDaysOff` | `number[]` | No | 정기 휴무 요일 (0=일, 1=월, ...) |
| `daysOff` | `string[]` | No | 특정 날짜 휴무 (YYYY-MM-DD) |
| `isActive` | `boolean` | Yes | 활성화 상태 |
| `createdAt` | `string` | Yes | 생성 일시 |

**휴무일 예시:**

```typescript
const stylist: Stylist = {
  id: 'stylist-1',
  name: '김원장',
  regularDaysOff: [0, 1],      // 일요일, 월요일 정기 휴무
  daysOff: ['2026-02-14'],     // 특정 날짜 휴무
  // ...
};
```

### CreateStylistData

스타일리스트 생성 데이터

```typescript
interface CreateStylistData {
  shopId: string;
  name: string;
  title: string;
  profileImage?: string;
  introduction?: string;
}
```

### UpdateStylistData

스타일리스트 수정 데이터

```typescript
interface UpdateStylistData extends Partial<Omit<CreateStylistData, 'shopId'>> {
  isActive?: boolean;
}
```

---

## Service Types

> `src/features/hairSalon/types/service.ts`

### HairServiceCategory

서비스 카테고리

```typescript
type HairServiceCategory = 'cut' | 'perm' | 'color' | 'treatment' | 'styling' | 'other';
```

| Value | Korean | Description |
|-------|--------|-------------|
| `cut` | 커트 | 헤어 커트 |
| `perm` | 펌 | 펌 서비스 |
| `color` | 염색 | 염색 서비스 |
| `treatment` | 트리트먼트 | 모발 케어 |
| `styling` | 스타일링 | 헤어 스타일링 |
| `other` | 기타 | 기타 서비스 |

**카테고리 라벨 맵:**

```typescript
const HAIR_SERVICE_CATEGORIES: Record<HairServiceCategory, string> = {
  cut: '커트',
  perm: '펌',
  color: '염색',
  treatment: '트리트먼트',
  styling: '스타일링',
  other: '기타',
};
```

### HairService

헤어 서비스 엔티티

```typescript
interface HairService {
  id: string;
  shopId: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  category: HairServiceCategory;
  isActive: boolean;
  createdAt: string;
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | 서비스 고유 ID |
| `shopId` | `string` | Yes | 소속 샵 ID |
| `name` | `string` | Yes | 서비스명 |
| `description` | `string` | No | 서비스 설명 |
| `durationMinutes` | `number` | Yes | 소요 시간 (분) |
| `price` | `number` | Yes | 가격 (원) |
| `category` | `HairServiceCategory` | Yes | 카테고리 |
| `isActive` | `boolean` | Yes | 활성화 상태 |
| `createdAt` | `string` | Yes | 생성 일시 |

### CreateHairServiceData

서비스 생성 데이터

```typescript
interface CreateHairServiceData {
  shopId: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  category: HairServiceCategory;
}
```

### UpdateHairServiceData

서비스 수정 데이터

```typescript
interface UpdateHairServiceData extends Partial<Omit<CreateHairServiceData, 'shopId'>> {
  isActive?: boolean;
}
```

---

## Booking Types

> `src/features/hairSalon/types/booking.ts`

### HairBooking

헤어 예약 엔티티 (extends [BaseBooking](./core-types.md#basebooking))

```typescript
interface HairBooking extends BaseBooking {
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
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| *BaseBooking* | - | - | [BaseBooking](./core-types.md#basebooking) 참조 |
| `shopId` | `string` | Yes | 샵 ID |
| `stylistId` | `string \| null` | Yes | 스타일리스트 ID (nullable) |
| `serviceId` | `string` | Yes | 서비스 ID |
| `notes` | `string \| null` | Yes | 메모 |
| `shop` | `HairShop` | No | 샵 정보 (populated) |
| `stylist` | `Stylist \| null` | No | 스타일리스트 정보 (populated) |
| `service` | `HairService` | No | 서비스 정보 (populated) |
| `customerName` | `string` | No | 고객명 |
| `customerPhone` | `string` | No | 고객 연락처 |

### CreateHairBookingData

예약 생성 데이터

```typescript
interface CreateHairBookingData {
  shopId: string;
  serviceId: string;
  stylistId?: string | null;
  bookingDate: string;
  startTime: string;
  notes?: string;
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `shopId` | `string` | Yes | 샵 ID |
| `serviceId` | `string` | Yes | 서비스 ID |
| `stylistId` | `string \| null` | No | 스타일리스트 ID |
| `bookingDate` | `string` | Yes | 예약 날짜 (YYYY-MM-DD) |
| `startTime` | `string` | Yes | 시작 시간 (HH:mm) |
| `notes` | `string` | No | 메모 |

### HairBookingSlot

예약 슬롯 정보

```typescript
interface HairBookingSlot {
  time: string;
  isAvailable: boolean;
  stylistId?: string;
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `time` | `string` | Yes | 시간 (HH:mm) |
| `isAvailable` | `boolean` | Yes | 예약 가능 여부 |
| `stylistId` | `string` | No | 예약된 스타일리스트 ID |

### HairBookingFilter

예약 필터 조건

```typescript
interface HairBookingFilter {
  shopId?: string;
  customerId?: string;
  stylistId?: string;
  date?: string;
  status?: string;
}
```

---

## Type Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                           HairShop                               │
│  - operatingHours: OperatingHours[]                             │
└─────────────────────────────────────────────────────────────────┘
           │                    │
           │ 1:N                │ 1:N
           ▼                    ▼
┌─────────────────┐    ┌─────────────────┐
│    Stylist      │    │   HairService   │
│                 │    │                 │
│ - regularDaysOff│    │ - category      │
│ - daysOff       │    │ - duration      │
└─────────────────┘    └─────────────────┘
           │                    │
           │                    │
           └────────┬───────────┘
                    │
                    ▼ N:1
         ┌─────────────────────┐
         │    HairBooking      │
         │                     │
         │ extends BaseBooking │
         │ - shopId            │
         │ - stylistId         │
         │ - serviceId         │
         └─────────────────────┘
```

---

## Related Documents

- [Types Overview](./README.md) - 타입 시스템 개요
- [Core Types](./core-types.md) - 핵심 공통 타입
- [Hair Salon Feature](../features/hair-salon.md) - 기능 상세

---

[← Types Overview](./README.md) | [← Back to Index](../README.md)
