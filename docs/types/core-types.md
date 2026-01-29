# Core Types

> 핵심 공통 타입 정의

[← Types Overview](./README.md) | [← Back to Index](../README.md)

## Table of Contents

- [Auth Types](#auth-types)
- [Booking Types](#booking-types)
- [Common Types](#common-types)

---

## Auth Types

> `src/core/types/auth.ts`

### UserRole

사용자 역할 타입

```typescript
type UserRole = 'customer' | 'business_owner' | 'admin';
```

| Value | Description | Permissions |
|-------|-------------|-------------|
| `customer` | 일반 고객 | 예약 생성/조회/취소 |
| `business_owner` | 사업주 | 자신의 샵 관리 |
| `admin` | 관리자 | 전체 시스템 관리 |

### User

사용자 정보

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | 사용자 고유 ID |
| `name` | `string` | Yes | 사용자 이름 |
| `email` | `string` | Yes | 이메일 주소 |
| `phone` | `string` | No | 전화번호 |
| `role` | `UserRole` | Yes | 사용자 역할 |
| `createdAt` | `string` | Yes | 생성 일시 (ISO 8601) |

### AuthState

인증 상태

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

| Property | Type | Description |
|----------|------|-------------|
| `user` | `User \| null` | 현재 로그인 사용자 |
| `isAuthenticated` | `boolean` | 인증 여부 |
| `isLoading` | `boolean` | 인증 확인 중 여부 |

### LoginCredentials

로그인 입력 데이터

```typescript
interface LoginCredentials {
  email: string;
  password: string;
}
```

### RegisterData

회원가입 입력 데이터

```typescript
interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
}
```

---

## Booking Types

> `src/core/types/booking.ts`

### BookingStatus

예약 상태 타입

```typescript
type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
```

| Value | Description | 다음 상태 |
|-------|-------------|-----------|
| `pending` | 대기 중 | `confirmed`, `cancelled` |
| `confirmed` | 확정됨 | `completed`, `cancelled` |
| `completed` | 완료됨 | - |
| `cancelled` | 취소됨 | - |

### BaseBooking

예약 기본 인터페이스

```typescript
interface BaseBooking {
  id: string;
  customerId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt?: string;
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | 예약 고유 ID |
| `customerId` | `string` | Yes | 고객 ID |
| `bookingDate` | `string` | Yes | 예약 날짜 (YYYY-MM-DD) |
| `startTime` | `string` | Yes | 시작 시간 (HH:mm) |
| `endTime` | `string` | Yes | 종료 시간 (HH:mm) |
| `status` | `BookingStatus` | Yes | 예약 상태 |
| `createdAt` | `string` | Yes | 생성 일시 (ISO 8601) |
| `updatedAt` | `string` | No | 수정 일시 (ISO 8601) |

### TimeSlot

시간 슬롯

```typescript
interface TimeSlot {
  time: string;
  isAvailable: boolean;
}
```

| Property | Type | Description |
|----------|------|-------------|
| `time` | `string` | 시간 (HH:mm) |
| `isAvailable` | `boolean` | 예약 가능 여부 |

### OperatingHours

영업 시간

```typescript
interface OperatingHours {
  dayOfWeek: number;   // 0 = Sunday, 1 = Monday, ...
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}
```

| Property | Type | Description |
|----------|------|-------------|
| `dayOfWeek` | `number` | 요일 (0=일, 1=월, ..., 6=토) |
| `openTime` | `string` | 오픈 시간 (HH:mm) |
| `closeTime` | `string` | 마감 시간 (HH:mm) |
| `isClosed` | `boolean` | 휴무 여부 |

**예시:**

```typescript
const operatingHours: OperatingHours[] = [
  { dayOfWeek: 0, openTime: '', closeTime: '', isClosed: true },      // 일요일 휴무
  { dayOfWeek: 1, openTime: '10:00', closeTime: '20:00', isClosed: false },
  { dayOfWeek: 2, openTime: '10:00', closeTime: '20:00', isClosed: false },
  // ...
];
```

---

## Common Types

> `src/core/types/common.ts`

### Pagination

페이지네이션 정보

```typescript
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

| Property | Type | Description |
|----------|------|-------------|
| `page` | `number` | 현재 페이지 (1-based) |
| `limit` | `number` | 페이지당 항목 수 |
| `total` | `number` | 전체 항목 수 |
| `totalPages` | `number` | 전체 페이지 수 |

### ApiResponse<T>

API 응답 래퍼

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `success` | `boolean` | Yes | 성공 여부 |
| `data` | `T` | Yes | 응답 데이터 |
| `message` | `string` | No | 메시지 |
| `pagination` | `Pagination` | No | 페이지네이션 정보 |

### ApiError

API 에러 응답

```typescript
interface ApiError {
  success: false;
  message: string;
  code?: string;
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `success` | `false` | Yes | 항상 false |
| `message` | `string` | Yes | 에러 메시지 |
| `code` | `string` | No | 에러 코드 |

### SelectOption

선택 옵션

```typescript
interface SelectOption {
  value: string;
  label: string;
}
```

---

## Related Documents

- [Types Overview](./README.md) - 타입 시스템 개요
- [Hair Salon Types](./hair-salon-types.md) - 헤어살롱 도메인 타입

---

[← Types Overview](./README.md) | [← Back to Index](../README.md)
