# Features Overview

> Feature 모듈 개요 및 구조

[← Back to Index](../README.md)

## Table of Contents

- [Feature-based Architecture](#feature-based-architecture)
- [Available Features](#available-features)
- [Feature Structure](#feature-structure)
- [Adding New Features](#adding-new-features)

---

## Feature-based Architecture

각 Feature는 독립적인 도메인 모듈로, 해당 도메인에 필요한 모든 구성요소를 포함합니다.

### 장점

- **독립성**: 각 Feature는 독립적으로 개발/테스트 가능
- **확장성**: 새로운 도메인 추가 시 기존 코드 영향 최소화
- **응집도**: 관련 코드가 한 곳에 모여있어 이해하기 쉬움
- **재사용성**: Feature 간 공통 로직은 Core로 추출

---

## Available Features

| Feature | Status | Description | Documentation |
|---------|--------|-------------|---------------|
| **hairSalon** | Active | 헤어살롱 예약 시스템 | [상세 문서](./hair-salon.md) |
| **restaurant** | Planned | 레스토랑 예약 시스템 | - |

---

## Feature Structure

### 표준 Feature 폴더 구조

```
features/
└── {featureName}/
    ├── index.ts              # Feature export
    │
    ├── pages/                # 페이지 컴포넌트
    │   ├── {Feature}ListPage.tsx
    │   ├── {Feature}DetailPage.tsx
    │   └── index.ts
    │
    ├── components/           # UI 컴포넌트
    │   ├── {Component}.tsx
    │   └── index.ts
    │
    ├── contexts/             # 상태 관리
    │   ├── {Feature}Context.tsx
    │   └── index.ts
    │
    ├── hooks/                # 커스텀 훅
    │   ├── use{Feature}.ts
    │   └── index.ts
    │
    ├── services/             # API 서비스
    │   ├── {feature}Service.ts
    │   └── index.ts
    │
    ├── types/                # 타입 정의
    │   ├── {entity}.ts
    │   └── index.ts
    │
    ├── mocks/                # Mock 데이터
    │   ├── {entities}.ts
    │   └── index.ts
    │
    └── admin/                # 관리자 기능 (선택적)
        ├── AdminDashboardPage.tsx
        └── index.ts
```

### hairSalon Feature 구조

```
features/hairSalon/
├── index.ts
│
├── pages/
│   ├── HairShopListPage.tsx      # 살롱 목록
│   ├── HairShopDetailPage.tsx    # 살롱 상세
│   ├── HairBookingPage.tsx       # 예약 페이지
│   ├── HairMyBookingsPage.tsx    # 내 예약
│   └── index.ts
│
├── components/
│   ├── ShopCard.tsx              # 살롱 카드
│   ├── ShopList.tsx              # 살롱 리스트
│   ├── ServiceSelector.tsx       # 서비스 선택
│   ├── StylistSelector.tsx       # 스타일리스트 선택
│   ├── BookingTimelineSelector.tsx # 타임라인 선택
│   ├── BookingConfirm.tsx        # 예약 확인
│   ├── BookingCard.tsx           # 예약 카드
│   └── index.ts
│
├── contexts/
│   ├── HairShopContext.tsx       # 살롱 상태
│   ├── HairBookingContext.tsx    # 예약 상태
│   └── index.ts
│
├── hooks/
│   ├── useHairShops.ts           # 살롱 데이터
│   ├── useHairServices.ts        # 서비스 데이터
│   ├── useHairBookings.ts        # 예약 데이터
│   ├── useStylists.ts            # 스타일리스트 데이터
│   └── index.ts
│
├── services/
│   ├── hairShopService.ts        # 살롱 API
│   ├── hairBookingService.ts     # 예약 API
│   └── index.ts
│
├── types/
│   ├── shop.ts                   # Shop, Stylist 타입
│   ├── service.ts                # Service 타입
│   ├── booking.ts                # Booking 타입
│   └── index.ts
│
├── mocks/
│   ├── shops.ts
│   ├── services.ts
│   ├── stylists.ts
│   ├── bookings.ts
│   └── index.ts
│
└── admin/
    ├── AdminDashboardPage.tsx
    ├── ShopRegisterPage.tsx
    ├── ShopManagePage.tsx
    ├── ServiceManagePage.tsx
    ├── StylistManagePage.tsx
    ├── ScheduleManagePage.tsx
    └── index.ts
```

---

## Adding New Features

### 1. 폴더 구조 생성

```bash
mkdir -p src/features/{newFeature}/{pages,components,contexts,hooks,services,types,mocks}
```

### 2. 타입 정의

```typescript
// src/features/newFeature/types/entity.ts
export interface NewEntity {
  id: string;
  name: string;
  // ...
}
```

### 3. 서비스 구현

```typescript
// src/features/newFeature/services/newFeatureService.ts
export const newFeatureService = {
  async getAll(): Promise<NewEntity[]> {
    // API 호출
  },
  // ...
};
```

### 4. 훅 구현

```typescript
// src/features/newFeature/hooks/useNewFeature.ts
export function useNewFeature() {
  const [data, setData] = useState<NewEntity[]>([]);
  // ...
  return { data, isLoading, error };
}
```

### 5. 라우트 추가

```typescript
// App.tsx
<Route path="/new-feature" element={<NewFeaturePage />} />
```

---

## Feature Documents

| Feature | Description |
|---------|-------------|
| [Hair Salon](./hair-salon.md) | 헤어살롱 예약 시스템 상세 |
| [Booking Flow](./booking-flow.md) | 예약 프로세스 흐름 |

---

[← Back to Index](../README.md)
