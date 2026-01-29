# Hair Salon Components

> 헤어살롱 전용 컴포넌트

[← Components Overview](./README.md) | [← Back to Index](../README.md)

## Table of Contents

- [Shop Components](#shop-components)
- [Booking Components](#booking-components)
- [Selector Components](#selector-components)

---

## Shop Components

### ShopCard

살롱 카드 컴포넌트

```typescript
interface ShopCardProps {
  shop: HairShop;
  onClick?: () => void;
}
```

**표시 정보:**
- 대표 이미지
- 살롱명
- 주소
- 설명 (일부)

**Usage:**

```tsx
<ShopCard shop={shop} onClick={() => navigate(`/hair/${shop.id}`)} />
```

---

### ShopList

살롱 목록 컴포넌트

```typescript
interface ShopListProps {
  shops: HairShop[];
}
```

**Usage:**

```tsx
<ShopList shops={shops} />
```

---

## Booking Components

### BookingCard

예약 정보 카드 컴포넌트

```typescript
interface BookingCardProps {
  booking: HairBooking;
  onCancel?: (id: string) => void;
  showActions?: boolean;
}
```

**표시 정보:**
- 샵명
- 서비스명
- 예약 날짜/시간
- 스타일리스트명
- 상태 배지
- 취소 버튼 (조건부)

**Usage:**

```tsx
<BookingCard
  booking={booking}
  onCancel={handleCancel}
  showActions={booking.status === 'pending'}
/>
```

---

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

**표시 정보:**
- 예약 요약 (샵, 서비스, 날짜, 시간, 스타일리스트)
- 메모 입력 필드
- 확인/이전 버튼

**Usage:**

```tsx
<BookingConfirm
  shop={shop}
  service={selectedService}
  date={selectedDate}
  time={selectedTime}
  stylist={selectedStylist}
  notes={notes}
  onNotesChange={setNotes}
  onConfirm={submitBooking}
  onBack={prevStep}
  isLoading={isLoading}
/>
```

---

## Selector Components

### ServiceSelector

서비스 선택 컴포넌트

```typescript
interface ServiceSelectorProps {
  services: HairService[];
  selectedService: HairService | null;
  onSelect: (service: HairService) => void;
}
```

**표시 정보:**
- 서비스 목록 (카테고리별)
- 각 서비스:
  - 이름
  - 카테고리 라벨
  - 소요 시간 (분)
  - 가격 (원)
  - 선택 상태

**CSS 클래스:**

| Class | Description |
|-------|-------------|
| `.service-selector` | 컨테이너 |
| `.service-item` | 서비스 항목 |
| `.service-item.selected` | 선택된 항목 |

**Usage:**

```tsx
<ServiceSelector
  services={services}
  selectedService={selectedService}
  onSelect={selectService}
/>
```

---

### StylistSelector

스타일리스트 선택 컴포넌트

```typescript
interface StylistSelectorProps {
  stylists: Stylist[];
  selectedStylist: Stylist | null;
  onSelect: (stylist: Stylist | null) => void;
  allowNoPreference?: boolean;
}
```

**표시 정보:**
- "지정 안함" 옵션 (상단, `allowNoPreference=true` 시)
- 스타일리스트 목록:
  - 프로필 이미지 (또는 이름 첫 글자)
  - 이름
  - 직책
  - 소개
  - **정기 휴무일** (예: "휴무: 일, 월")

**CSS 클래스:**

| Class | Description |
|-------|-------------|
| `.stylist-selector` | 컨테이너 |
| `.stylist-item` | 스타일리스트 항목 |
| `.stylist-item.selected` | 선택된 항목 |
| `.stylist-item.no-preference` | 지정 안함 항목 |
| `.stylist-days-off` | 휴무일 표시 |

**Usage:**

```tsx
<StylistSelector
  stylists={stylists}
  selectedStylist={selectedStylist}
  onSelect={selectStylist}
  allowNoPreference={true}
/>
```

---

### BookingTimelineSelector

타임라인 기반 예약 시간 선택 컴포넌트

```typescript
interface BookingTimelineSelectorProps {
  shopId: string;
  operatingHours: OperatingHours[];
  serviceDurationMinutes: number;
  stylist?: Stylist | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelect: (date: Date, time: string) => void;
  daysToShow?: number;
  showCustomerInfo?: boolean;
}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `shopId` | `string` | - | 샵 ID |
| `operatingHours` | `OperatingHours[]` | - | 영업 시간 |
| `serviceDurationMinutes` | `number` | - | 서비스 소요 시간 |
| `stylist` | `Stylist \| null` | - | 선택된 스타일리스트 |
| `selectedDate` | `Date \| null` | - | 선택된 날짜 |
| `selectedTime` | `string \| null` | - | 선택된 시간 |
| `onSelect` | `function` | - | 선택 콜백 |
| `daysToShow` | `number` | `14` | 표시할 일수 |
| `showCustomerInfo` | `boolean` | `false` | 고객명 표시 (관리자용) |

**타임라인 구조:**

```
┌────────┬──────────────────────────────────────────────┐
│  날짜  │  10:00  10:10  10:20  ...  19:00  19:10  ... │
├────────┼──────────────────────────────────────────────┤
│ 30(목) │   ██    ██    ▒▒    ...   ██    ██    ...    │
│ 31(금) │   ▒▒    ██    ██    ...   ▒▒    ██    ...    │
│  1(토) │   ██    ██    ██    ...   ██    ██    ...    │
│  2(일) │              휴 무                            │
│  3(월) │           김원장 휴무                          │
└────────┴──────────────────────────────────────────────┘

██ = 예약 가능 (녹색)
▒▒ = 예약됨 (빨간색)
■■ = 선택됨 (파란색)
```

**슬롯 상태 클래스:**

| Class | Color | Description |
|-------|-------|-------------|
| `.available` | 녹색 | 예약 가능 |
| `.booked` | 빨간색 | 예약됨 |
| `.selected` | 파란색 | 선택됨 |
| `.non-operating` | 회색 | 영업시간 외 |
| `.past` | 어두운 회색 | 과거 시간 |
| `.closed-day` | - | 휴무일 행 |
| `.closed-day-cell` | - | 휴무 표시 셀 |

**기능:**

1. **날짜 네비게이션**: 이전/오늘/다음 버튼
2. **영업일 확인**: `operatingHours` 기반
3. **스타일리스트 휴무 확인**: `stylist.regularDaysOff`, `stylist.daysOff`
4. **예약 충돌 감지**: 선택 시 duration 범위 내 기존 예약 확인
5. **현재 시간 가이드라인**: 실시간 세로 선 표시
6. **예약 블록 colSpan**: 예약된 시간대를 하나의 셀로 병합

**Usage:**

```tsx
<BookingTimelineSelector
  shopId={shopId}
  operatingHours={shop.operatingHours}
  serviceDurationMinutes={selectedService.durationMinutes}
  stylist={selectedStylist}
  selectedDate={selectedDate}
  selectedTime={selectedTime}
  onSelect={handleDateTimeSelect}
  daysToShow={14}
/>
```

**데이터 페칭:**

```typescript
// 각 날짜별로 호출
const [slots, allBookings] = await Promise.all([
  hairBookingService.getAvailableSlots(shopId, dateStr, duration, stylistId),
  hairBookingService.getBookingsByShop(shopId, dateStr, true),
]);

// 스타일리스트 필터링
const filteredBookings = stylistId
  ? allBookings.filter(b => b.stylistId === stylistId)
  : allBookings;
```

---

## Related Documents

- [Components Overview](./README.md) - 컴포넌트 개요
- [Core Components](./core-components.md) - 공통 컴포넌트
- [Hair Salon Feature](../features/hair-salon.md) - 기능 상세
- [Booking Flow](../features/booking-flow.md) - 예약 프로세스

---

[← Components Overview](./README.md) | [← Back to Index](../README.md)
