# Core Components

> 공통 UI 컴포넌트

[← Components Overview](./README.md) | [← Back to Index](../README.md)

## Table of Contents

- [UI Components](#ui-components)
- [Auth Guard Components](#auth-guard-components)
- [Layout Components](#layout-components)

---

## UI Components

### Button

범용 버튼 컴포넌트

```typescript
interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}
```

**Usage:**

```tsx
<Button variant="primary" onClick={handleClick}>
  예약하기
</Button>

<Button variant="outline" size="sm" disabled>
  취소
</Button>
```

**Variants:**

| Variant | Description |
|---------|-------------|
| `primary` | 주요 액션 (파란색) |
| `secondary` | 보조 액션 (회색) |
| `outline` | 테두리만 있는 버튼 |
| `danger` | 위험 액션 (빨간색) |

---

### Modal

모달 다이얼로그 컴포넌트

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}
```

**Usage:**

```tsx
<Modal isOpen={isOpen} onClose={handleClose} title="예약 확인">
  <p>예약을 진행하시겠습니까?</p>
  <Button onClick={handleConfirm}>확인</Button>
</Modal>
```

---

### Calendar

캘린더 컴포넌트

```typescript
interface CalendarProps {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
}
```

**Usage:**

```tsx
<Calendar
  selectedDate={selectedDate}
  onSelect={setSelectedDate}
  minDate={new Date()}
/>
```

---

### LoadingSpinner

로딩 스피너 컴포넌트

```typescript
interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}
```

**Usage:**

```tsx
<LoadingSpinner text="로딩 중..." />
```

---

### TimeSlotPicker

시간대 선택 컴포넌트

```typescript
interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
}
```

**Usage:**

```tsx
<TimeSlotPicker
  slots={availableSlots}
  selectedTime={selectedTime}
  onSelect={setSelectedTime}
/>
```

---

### StatusBadge

상태 배지 컴포넌트

```typescript
interface StatusBadgeProps {
  status: string;
  type?: 'booking' | 'approval';
}
```

**Booking Status Colors:**

| Status | Color |
|--------|-------|
| `pending` | 노란색 |
| `confirmed` | 파란색 |
| `completed` | 녹색 |
| `cancelled` | 빨간색 |

**Usage:**

```tsx
<StatusBadge status="confirmed" type="booking" />
```

---

## Auth Guard Components

### RequireAuth

인증 필요 래퍼 컴포넌트

```typescript
interface RequireAuthProps {
  children: ReactNode;
}
```

**동작:**
- 인증되지 않은 사용자 → `/login` 리다이렉트
- 인증된 사용자 → children 렌더링

**Usage:**

```tsx
<Route
  path="/my-bookings"
  element={
    <RequireAuth>
      <MyBookingsPage />
    </RequireAuth>
  }
/>
```

---

### RequireAdmin

관리자 권한 필요 래퍼 컴포넌트

```typescript
interface RequireAdminProps {
  children: ReactNode;
}
```

**동작:**
- 미인증 사용자 → `/login` 리다이렉트
- `customer` 역할 → `/` 리다이렉트
- `business_owner` 또는 `admin` → children 렌더링

**Usage:**

```tsx
<Route
  path="/admin/*"
  element={
    <RequireAdmin>
      <AdminRoutes />
    </RequireAdmin>
  }
/>
```

---

### RequireProfileComplete

프로필 완성 필요 래퍼 컴포넌트

```typescript
interface RequireProfileCompleteProps {
  children: ReactNode;
}
```

**동작:**
- 프로필 미완성 → `/profile/complete` 리다이렉트
- 프로필 완성 → children 렌더링

**프로필 완성 조건:**
- `user.name` 존재
- `user.phone` 존재

**Usage:**

```tsx
<Route
  path="/:shopId/booking"
  element={
    <RequireProfileComplete>
      <HairBookingPage />
    </RequireProfileComplete>
  }
/>
```

---

## Layout Components

### MainLayout

메인 레이아웃 컴포넌트

```typescript
function MainLayout(): ReactNode
```

**구조:**

```
┌────────────────────────────────┐
│           Header               │
├────────────────────────────────┤
│                                │
│         <Outlet />             │
│      (라우트 컨텐츠)            │
│                                │
└────────────────────────────────┘
```

**Usage:**

```tsx
// App.tsx
<Route element={<MainLayout />}>
  <Route path="/" element={<HomePage />} />
  <Route path="/hair/*" element={<HairRoutes />} />
</Route>
```

---

### Header

헤더 컴포넌트

```typescript
function Header(): ReactNode
```

**표시 내용:**
- 로고 / 홈 링크
- 네비게이션 메뉴
- 사용자 정보 (로그인 시)
- 로그인/로그아웃 버튼

---

## Related Documents

- [Components Overview](./README.md) - 컴포넌트 개요
- [Hair Salon Components](./hair-salon-components.md) - 헤어살롱 컴포넌트

---

[← Components Overview](./README.md) | [← Back to Index](../README.md)
