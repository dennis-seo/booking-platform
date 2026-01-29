# Data Flow

> 데이터 흐름 및 상태 관리 패턴

[← Back to Index](./README.md) | [Architecture](./architecture.md)

## Table of Contents

- [Overview](#overview)
- [Authentication Flow](#authentication-flow)
- [Booking Flow](#booking-flow)
- [Data Fetching Pattern](#data-fetching-pattern)
- [State Update Patterns](#state-update-patterns)

---

## Overview

### 데이터 계층 구조

```
┌─────────────────────────────────────────────────────────────┐
│                      Supabase (Backend)                      │
│         Database / Auth / Real-time / Storage                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Services Layer                            │
│    hairShopService / hairBookingService / authService        │
│           (API 호출, 데이터 변환, 에러 핸들링)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Hooks Layer                              │
│     useHairShops / useHairBookings / useStylists            │
│        (데이터 페칭, 캐싱, 로딩/에러 상태 관리)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Context Layer                             │
│         AuthContext / HairBookingContext                     │
│            (전역 상태, 액션 디스패치)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Component Layer                            │
│          UI 렌더링 / 이벤트 핸들링 / 로컬 상태                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

### 로그인 프로세스

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  LoginPage  │────▶│ AuthContext │────▶│  Supabase   │
│             │     │   login()   │     │    Auth     │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Success   │
                    │      ?      │
                    └─────────────┘
                      │         │
                 Yes  │         │  No
                      ▼         ▼
              ┌───────────┐  ┌───────────┐
              │  Profile  │  │   Error   │
              │ Complete? │  │  Display  │
              └───────────┘  └───────────┘
                │       │
           Yes  │       │  No
                ▼       ▼
           ┌───────┐  ┌─────────────┐
           │ Home  │  │  Profile    │
           │ Page  │  │  Complete   │
           └───────┘  └─────────────┘
```

### 인증 상태 관리

```typescript
// AuthContext 상태
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isProfileComplete: boolean;
}

// 상태 변화 흐름
Initial -> Loading -> Authenticated / Unauthenticated
                           │
                           ▼
                   ProfileComplete / ProfileIncomplete
```

### 세션 유지

```
┌─────────────┐
│   App.tsx   │
│  useEffect  │
└─────────────┘
       │
       ▼ 앱 마운트 시
┌─────────────────────────────────────┐
│         AuthContext                  │
│  1. Supabase 세션 체크               │
│  2. 세션 있으면 user 정보 로드        │
│  3. onAuthStateChange 리스너 등록    │
└─────────────────────────────────────┘
       │
       ▼ 세션 변경 시
┌─────────────────────────────────────┐
│     State Update                     │
│  - user 정보 업데이트                 │
│  - isAuthenticated 변경              │
│  - 하위 컴포넌트 리렌더링             │
└─────────────────────────────────────┘
```

---

## Booking Flow

### 예약 프로세스 단계

```
┌──────────────────────────────────────────────────────────────┐
│                    HairBookingContext                         │
│                                                               │
│  Step 1        Step 2          Step 3        Step 4          │
│ ┌────────┐   ┌──────────┐   ┌──────────┐   ┌─────────┐       │
│ │Service │──▶│ Stylist  │──▶│ DateTime │──▶│ Confirm │       │
│ │ Select │   │  Select  │   │  Select  │   │         │       │
│ └────────┘   └──────────┘   └──────────┘   └─────────┘       │
│     │              │              │              │            │
│     ▼              ▼              ▼              ▼            │
│ selectedService  selectedStylist  selectedDate  submitBooking│
│                                   selectedTime               │
└──────────────────────────────────────────────────────────────┘
```

### 각 단계별 데이터 흐름

#### Step 1: 서비스 선택

```
┌────────────────┐     ┌──────────────────┐     ┌──────────────┐
│ServiceSelector │────▶│ selectService()  │────▶│    State     │
│   Component    │     │   (Context)      │     │   Update     │
└────────────────┘     └──────────────────┘     └──────────────┘
                                                       │
                                                       ▼
                                              selectedService
                                              selectedDate: null (리셋)
                                              selectedTime: null (리셋)
```

#### Step 2: 스타일리스트 선택

```
┌────────────────┐     ┌──────────────────┐     ┌──────────────┐
│StylistSelector │────▶│ selectStylist()  │────▶│    State     │
│   Component    │     │   (Context)      │     │   Update     │
└────────────────┘     └──────────────────┘     └──────────────┘
                                                       │
                                                       ▼
                                              selectedStylist
                                              selectedDate: null (리셋)
                                              selectedTime: null (리셋)
```

#### Step 3: 날짜/시간 선택

```
┌─────────────────────────────────────────────────────────────┐
│              BookingTimelineSelector                         │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Fetching                              │
│  1. getAvailableSlots(shopId, date, duration, stylistId)    │
│  2. getBookingsByShop(shopId, date) → 스타일리스트 필터링     │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Availability Check                         │
│  - 영업일/영업시간 확인                                       │
│  - 스타일리스트 휴무일 확인 (regularDaysOff, daysOff)         │
│  - 기존 예약 충돌 확인                                        │
│  - 서비스 duration 고려                                       │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Timeline Render                            │
│  - 예약 가능: 녹색 셀                                         │
│  - 예약됨: 빨간색 셀                                          │
│  - 휴무: "휴무" 또는 "스타일리스트명 휴무" 표시                 │
│  - 선택됨: 파란색 셀 (duration 범위)                          │
└─────────────────────────────────────────────────────────────┘
```

#### Step 4: 예약 확정

```
┌─────────────────┐
│  BookingConfirm │
│    Component    │
└─────────────────┘
         │ onConfirm
         ▼
┌─────────────────────────────────────────────────────────────┐
│                 submitBooking() (Context)                    │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              hairBookingService.createBooking()              │
│                                                              │
│  CreateHairBookingData {                                     │
│    shopId, serviceId, stylistId,                            │
│    bookingDate, startTime, notes                            │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Mock/Supabase)                    │
│  1. 서비스 정보로 endTime 계산                                │
│  2. 예약 데이터 저장                                          │
│  3. HairBooking 반환                                         │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Success / Error                            │
│  - Success: currentStep → 'complete'                        │
│  - Error: error 상태 업데이트                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Fetching Pattern

### Hooks 기반 데이터 페칭

```typescript
// 기본 패턴
function useHairShops() {
  const [shops, setShops] = useState<HairShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setIsLoading(true);
        const data = await hairShopService.getShops();
        setShops(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShops();
  }, []);

  return { shops, isLoading, error };
}
```

### 사용 예시

```typescript
// Component에서 사용
function HairShopListPage() {
  const { shops, isLoading, error } = useHairShops();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return <ShopList shops={shops} />;
}
```

---

## State Update Patterns

### Context 상태 업데이트

```typescript
// 단순 업데이트
const selectService = useCallback((service: HairService) => {
  setState(prev => ({
    ...prev,
    selectedService: service,
    // 연관 상태 리셋
    selectedDate: null,
    selectedTime: null,
  }));
}, []);

// 단계 이동
const nextStep = useCallback(() => {
  setState(prev => {
    const currentIndex = STEPS.indexOf(prev.currentStep);
    if (currentIndex < STEPS.length - 1) {
      return { ...prev, currentStep: STEPS[currentIndex + 1] };
    }
    return prev;
  });
}, []);
```

### 연쇄 상태 리셋 패턴

서비스나 스타일리스트 변경 시 하위 선택 리셋:

```
Service 변경
    │
    └──▶ Date/Time 리셋 (서비스 duration이 달라지므로)

Stylist 변경
    │
    └──▶ Date/Time 리셋 (스타일리스트별 예약 현황이 다르므로)
```

---

## Related Documents

- [Architecture](./architecture.md) - 전체 아키텍처
- [Booking Flow](./features/booking-flow.md) - 예약 프로세스 상세
- [Hair Salon Types](./types/hair-salon-types.md) - 타입 정의

---

[← Back to Index](./README.md)
