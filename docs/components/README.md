# Components Overview

> 컴포넌트 개요 및 구조

[← Back to Index](../README.md)

## Table of Contents

- [Component Organization](#component-organization)
- [Core Components](#core-components)
- [Feature Components](#feature-components)
- [Component Conventions](#component-conventions)

---

## Component Organization

### 컴포넌트 위치

```
src/
├── core/components/         # 공통 UI 컴포넌트
│   ├── Button.tsx
│   ├── Modal.tsx
│   ├── Calendar.tsx
│   └── ...
│
└── features/
    └── hairSalon/
        └── components/      # 도메인 전용 컴포넌트
            ├── ShopCard.tsx
            ├── ServiceSelector.tsx
            └── ...
```

### 컴포넌트 유형

| Type | Location | Description |
|------|----------|-------------|
| **Core** | `core/components/` | 범용 UI 컴포넌트 |
| **Layout** | `core/layouts/` | 페이지 레이아웃 |
| **Feature** | `features/*/components/` | 도메인 전용 컴포넌트 |
| **Auth Guards** | `core/components/Require*.tsx` | 인증/권한 래퍼 |

---

## Core Components

범용 UI 컴포넌트

| Component | Description | Props |
|-----------|-------------|-------|
| `Button` | 버튼 | `variant`, `size`, `disabled` |
| `Modal` | 모달 다이얼로그 | `isOpen`, `onClose`, `title` |
| `Calendar` | 캘린더 | `selectedDate`, `onSelect` |
| `LoadingSpinner` | 로딩 스피너 | `text` |
| `TimeSlotPicker` | 시간대 선택기 | `slots`, `selected`, `onSelect` |
| `StatusBadge` | 상태 배지 | `status`, `type` |

[Core Components 상세 →](./core-components.md)

---

## Feature Components

### Hair Salon Components

| Component | Description |
|-----------|-------------|
| `ShopCard` | 살롱 카드 |
| `ShopList` | 살롱 목록 |
| `ServiceSelector` | 서비스 선택기 |
| `StylistSelector` | 스타일리스트 선택기 |
| `BookingTimelineSelector` | 타임라인 예약 선택기 |
| `BookingConfirm` | 예약 확인 |
| `BookingCard` | 예약 카드 |

[Hair Salon Components 상세 →](./hair-salon-components.md)

---

## Component Conventions

### 파일 구조

```typescript
// Component.tsx
import { type ReactNode } from 'react';

interface ComponentProps {
  // Props 정의
}

export function Component({ prop1, prop2 }: ComponentProps): ReactNode {
  // 컴포넌트 로직
  return (
    <div className="component">
      {/* JSX */}
    </div>
  );
}
```

### 명명 규칙

| Convention | Example |
|------------|---------|
| 컴포넌트 | `PascalCase` → `BookingCard` |
| Props 인터페이스 | `{Component}Props` → `BookingCardProps` |
| CSS 클래스 | `kebab-case` → `.booking-card` |
| 이벤트 핸들러 | `on{Event}` → `onClick`, `onSelect` |

### Props 패턴

```typescript
// 기본 Props
interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

// 옵션 Props
interface BookingCardProps {
  booking: HairBooking;
  onCancel?: (id: string) => void;
  showActions?: boolean;  // default 값 제공
}

// 복합 Props
interface SelectorProps<T> {
  items: T[];
  selected: T | null;
  onSelect: (item: T) => void;
  renderItem?: (item: T) => ReactNode;
}
```

### CSS 클래스 구조

```css
/* 컴포넌트 루트 */
.component-name {
  /* 기본 스타일 */
}

/* 상태 변형 */
.component-name.selected {
  /* 선택 상태 */
}

.component-name.disabled {
  /* 비활성 상태 */
}

/* 하위 요소 */
.component-name .sub-element {
  /* 하위 요소 스타일 */
}
```

---

## Component Documents

| Document | Description |
|----------|-------------|
| [Core Components](./core-components.md) | 공통 UI 컴포넌트 |
| [Hair Salon Components](./hair-salon-components.md) | 헤어살롱 전용 컴포넌트 |

---

[← Back to Index](../README.md)
