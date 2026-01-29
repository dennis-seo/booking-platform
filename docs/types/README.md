# Types Overview

> 타입 시스템 개요

[← Back to Index](../README.md)

## Table of Contents

- [Type Organization](#type-organization)
- [Core Types](#core-types)
- [Feature Types](#feature-types)
- [Type Conventions](#type-conventions)

---

## Type Organization

### 타입 위치

```
src/
├── core/types/              # 공통 타입
│   ├── auth.ts              # 인증 관련
│   ├── booking.ts           # 예약 기본 타입
│   ├── common.ts            # 공용 유틸리티 타입
│   └── index.ts             # re-export
│
└── features/
    └── hairSalon/types/     # 헤어살롱 도메인 타입
        ├── shop.ts          # 샵, 스타일리스트
        ├── service.ts       # 서비스
        ├── booking.ts       # 예약
        └── index.ts         # re-export
```

### Import 패턴

```typescript
// Core 타입 import
import type { User, BookingStatus } from '@core/types';

// Feature 타입 import
import type { HairShop, Stylist, HairService } from '../types';
```

---

## Core Types

공통으로 사용되는 기본 타입

| File | Types | Description |
|------|-------|-------------|
| [auth.ts](./core-types.md#auth-types) | `User`, `UserRole`, `AuthState` | 인증 관련 |
| [booking.ts](./core-types.md#booking-types) | `BaseBooking`, `BookingStatus`, `OperatingHours` | 예약 기본 |
| [common.ts](./core-types.md#common-types) | `ApiResponse`, `Pagination`, `SelectOption` | 유틸리티 |

[Core Types 상세 →](./core-types.md)

---

## Feature Types

### Hair Salon Types

| File | Types | Description |
|------|-------|-------------|
| [shop.ts](./hair-salon-types.md#shop-types) | `HairShop`, `Stylist` | 샵, 스타일리스트 |
| [service.ts](./hair-salon-types.md#service-types) | `HairService`, `HairServiceCategory` | 서비스 |
| [booking.ts](./hair-salon-types.md#booking-types) | `HairBooking`, `HairBookingSlot` | 예약 |

[Hair Salon Types 상세 →](./hair-salon-types.md)

---

## Type Conventions

### 명명 규칙

| Convention | Example | Usage |
|------------|---------|-------|
| Entity | `HairShop`, `Stylist` | 도메인 엔티티 |
| Create Data | `CreateHairShopData` | 생성 시 입력 데이터 |
| Update Data | `UpdateHairShopData` | 수정 시 입력 데이터 |
| Filter | `HairBookingFilter` | 필터링 조건 |
| Status | `BookingStatus`, `ShopApprovalStatus` | 상태 enum |

### 타입 확장

```typescript
// 기본 타입 확장
interface HairBooking extends BaseBooking {
  shopId: string;
  serviceId: string;
  // ...
}

// Partial 사용
interface UpdateHairShopData extends Partial<CreateHairShopData> {
  isActive?: boolean;
}
```

### Optional vs Required

```typescript
interface HairShop {
  id: string;           // Required: 항상 존재
  name: string;         // Required: 필수 필드
  description?: string; // Optional: 선택 필드
}
```

### Relations (Populated Fields)

```typescript
interface HairBooking extends BaseBooking {
  shopId: string;           // FK (항상 존재)
  shop?: HairShop;          // Populated (조회 시 옵션)

  stylistId: string | null; // FK (nullable)
  stylist?: Stylist | null; // Populated (조회 시 옵션)
}
```

---

## Type Documents

| Document | Description |
|----------|-------------|
| [Core Types](./core-types.md) | 핵심 공통 타입 |
| [Hair Salon Types](./hair-salon-types.md) | 헤어살롱 도메인 타입 |

---

[← Back to Index](../README.md)
