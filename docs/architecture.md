# Architecture

> 프로젝트 아키텍처 및 설계 원칙

[← Back to Index](./README.md)

## Table of Contents

- [Design Principles](#design-principles)
- [Project Structure](#project-structure)
- [Layer Architecture](#layer-architecture)
- [Routing Structure](#routing)
- [State Management](#state-management)

---

## Design Principles

### 1. Feature-based Architecture

도메인별로 독립적인 모듈 구조를 채택하여 확장성과 유지보수성을 확보합니다.

```
features/
├── hairSalon/          # 헤어살롱 도메인
│   ├── pages/          # 페이지 컴포넌트
│   ├── components/     # UI 컴포넌트
│   ├── contexts/       # 상태 관리
│   ├── hooks/          # 커스텀 훅
│   ├── services/       # API 서비스
│   ├── types/          # 타입 정의
│   ├── mocks/          # Mock 데이터
│   └── admin/          # 관리자 페이지
└── restaurant/         # (향후 확장) 레스토랑 도메인
```

### 2. Separation of Concerns

각 레이어는 명확한 책임을 가집니다:

| Layer | Responsibility |
|-------|----------------|
| **Pages** | 라우트 진입점, 레이아웃 구성 |
| **Components** | UI 렌더링, 사용자 인터랙션 |
| **Contexts** | 전역/기능별 상태 관리 |
| **Hooks** | 비즈니스 로직, 데이터 페칭 |
| **Services** | API 통신, 데이터 변환 |
| **Types** | 타입 정의 |

### 3. Colocation Principle

관련 코드는 가능한 가까이 배치합니다:
- Feature 내 모든 관련 파일 (타입, 훅, 컴포넌트)을 함께 배치
- Core 모듈은 여러 Feature에서 공유하는 코드만 포함

---

## Project Structure

```
src/
├── index.tsx                    # 앱 진입점
├── App.tsx                      # 라우트 설정
├── App.css                      # 전역 스타일
│
├── pages/                       # 공용 페이지
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── ProfileCompletePage.tsx
│   └── NotFoundPage.tsx
│
├── core/                        # 공통 모듈
│   ├── components/              # 재사용 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Calendar.tsx
│   │   ├── Modal.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── TimeSlotPicker.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── RequireAuth.tsx
│   │   ├── RequireAdmin.tsx
│   │   └── RequireProfileComplete.tsx
│   │
│   ├── contexts/                # 전역 상태
│   │   └── AuthContext.tsx
│   │
│   ├── hooks/                   # 공용 훅
│   │   ├── useAuth.ts
│   │   ├── useFetch.ts
│   │   └── useModal.ts
│   │
│   ├── layouts/                 # 레이아웃
│   │   ├── MainLayout.tsx
│   │   └── Header.tsx
│   │
│   ├── lib/                     # 외부 라이브러리
│   │   └── supabase.ts
│   │
│   ├── types/                   # 공용 타입
│   │   ├── auth.ts
│   │   ├── booking.ts
│   │   ├── common.ts
│   │   └── index.ts
│   │
│   └── utils/                   # 유틸리티
│       ├── apiConfig.ts
│       ├── dateUtils.ts
│       ├── timeSlotUtils.ts
│       └── logger.ts
│
└── features/                    # 도메인 모듈
    └── hairSalon/
        ├── index.ts
        ├── pages/
        ├── components/
        ├── contexts/
        ├── hooks/
        ├── services/
        ├── types/
        ├── mocks/
        └── admin/
```

---

## Layer Architecture

### 의존성 흐름

```
┌─────────────────────────────────────────────────────────────┐
│                         Pages                                │
│    (라우트 진입점, 레이아웃 구성, Context Provider 설정)        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Components                             │
│         (UI 렌더링, 사용자 이벤트 핸들링)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Contexts / Hooks                           │
│       (상태 관리, 비즈니스 로직, 데이터 페칭 추상화)             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Services                              │
│              (API 통신, 데이터 변환, 캐싱)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Types / Utils                             │
│           (타입 정의, 유틸리티 함수, 상수)                      │
└─────────────────────────────────────────────────────────────┘
```

### Core vs Feature 분리

```
┌─────────────────────────────────────────────────────────────┐
│                         Core                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ AuthContext │  │  Components │  │    Utils    │          │
│  │             │  │  (Button,   │  │ (dateUtils, │          │
│  │ (전역 인증)  │  │   Modal)    │  │  logger)    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                       Features                               │
│  ┌──────────────────────┐  ┌──────────────────────┐         │
│  │      hairSalon       │  │     restaurant       │         │
│  │  ┌───────────────┐   │  │    (향후 확장)        │         │
│  │  │ HairBooking   │   │  │                      │         │
│  │  │ Context       │   │  │                      │         │
│  │  └───────────────┘   │  │                      │         │
│  │  ┌───────────────┐   │  │                      │         │
│  │  │ hairBooking   │   │  │                      │         │
│  │  │ Service       │   │  │                      │         │
│  │  └───────────────┘   │  │                      │         │
│  └──────────────────────┘  └──────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

---

## Routing

### 라우트 구조

```
/
├── /login                              # 로그인 (레이아웃 없음)
├── /profile/complete                   # 프로필 완성 (레이아웃 없음)
│
└── [MainLayout]                        # 공통 레이아웃 (Header 포함)
    │
    ├── /                               # 홈페이지
    │
    ├── /hair                           # 헤어살롱 섹션
    │   ├── /                           # 살롱 목록
    │   ├── /:shopId                    # 살롱 상세
    │   ├── /:shopId/booking            # 예약 (RequireProfileComplete)
    │   ├── /my-bookings                # 내 예약
    │   │
    │   └── /admin                      # 관리자 섹션 (RequireAdmin)
    │       ├── /                       # 대시보드
    │       ├── /register               # 살롱 등록
    │       ├── /:shopId                # 살롱 관리
    │       ├── /:shopId/services       # 서비스 관리
    │       ├── /:shopId/stylists       # 스타일리스트 관리
    │       └── /:shopId/schedule       # 스케줄 관리
    │
    └── *                               # 404 Not Found
```

### 라우트 보호

| Wrapper | Purpose | Redirect |
|---------|---------|----------|
| `RequireAuth` | 로그인 필수 | → `/login` |
| `RequireAdmin` | 관리자 권한 필수 | → `/` |
| `RequireProfileComplete` | 프로필 완성 필수 | → `/profile/complete` |

---

## State Management

### 전역 상태 (AuthContext)

```typescript
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isProfileComplete: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}
```

### Feature 상태 (HairBookingContext)

```typescript
interface HairBookingContextValue {
  // State
  currentStep: BookingStep;
  selectedService: HairService | null;
  selectedStylist: Stylist | null;
  selectedDate: Date | null;
  selectedTime: string | null;

  // Actions
  selectService: (service: HairService) => void;
  selectStylist: (stylist: Stylist | null) => void;
  selectDate: (date: Date) => void;
  selectTime: (time: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  submitBooking: () => Promise<HairBooking | null>;
}
```

### 상태 흐름

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  AuthContext │     │ HairBooking  │     │  Component   │
│   (Global)   │     │   Context    │     │   State      │
│              │     │  (Feature)   │     │   (Local)    │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │    user, auth      │   booking flow     │   UI state
       │    state           │   state            │   (form, modal)
       │                    │                    │
       └────────────────────┴────────────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │  Components  │
                    └──────────────┘
```

---

## Related Documents

- [Data Flow](./data-flow.md) - 데이터 흐름 상세
- [Types Overview](./types/README.md) - 타입 시스템
- [Features Overview](./features/README.md) - Feature 모듈 상세

---

[← Back to Index](./README.md)
