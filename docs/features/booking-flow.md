# Booking Flow

> 예약 프로세스 상세 흐름

[← Hair Salon](./hair-salon.md) | [← Back to Index](../README.md)

## Table of Contents

- [Overview](#overview)
- [Step 1: Service Selection](#step-1-service-selection)
- [Step 2: Stylist Selection](#step-2-stylist-selection)
- [Step 3: DateTime Selection](#step-3-datetime-selection)
- [Step 4: Confirmation](#step-4-confirmation)
- [Step 5: Complete](#step-5-complete)
- [State Management](#state-management)
- [Error Handling](#error-handling)

---

## Overview

### 예약 단계

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Service  │───▶│ Stylist  │───▶│ DateTime │───▶│ Confirm  │───▶│ Complete │
│  Select  │    │  Select  │    │  Select  │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │
     ▼               ▼               ▼               ▼
  서비스 선택    스타일리스트     날짜/시간        예약 정보
  (필수)        선택 (선택)      선택 (필수)      확인 및 제출
```

### 단계별 필수 조건

| Step | Required | Optional |
|------|----------|----------|
| Service | 서비스 선택 | - |
| Stylist | - | 스타일리스트 (지정 안함 가능) |
| DateTime | 날짜, 시간 | - |
| Confirm | - | 메모 |

---

## Step 1: Service Selection

### UI 컴포넌트

`ServiceSelector`

### 표시 정보

- 서비스 목록 (카테고리별 그룹화)
- 각 서비스:
  - 이름
  - 카테고리 (커트, 펌, 염색 등)
  - 소요 시간 (분)
  - 가격 (원)

### 선택 시 동작

```typescript
selectService(service: HairService) {
  setState({
    selectedService: service,
    // 하위 선택 리셋
    selectedDate: null,
    selectedTime: null,
  });
}
```

### 다음 단계 조건

- `selectedService !== null`

---

## Step 2: Stylist Selection

### UI 컴포넌트

`StylistSelector`

### 표시 정보

- "지정 안함" 옵션 (상단)
- 스타일리스트 목록:
  - 프로필 이미지 (또는 이름 첫 글자)
  - 이름
  - 직책 (원장, 실장, 디자이너)
  - 소개
  - **정기 휴무일** (예: "휴무: 일, 월")

### 휴무일 표시

```typescript
// StylistSelector에서 휴무일 포맷
const formatRegularDaysOff = (daysOff?: number[]): string | null => {
  if (!daysOff || daysOff.length === 0) return null;
  const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
  return `휴무: ${daysOff.map(d => DAY_NAMES[d]).join(', ')}`;
};
```

### 선택 시 동작

```typescript
selectStylist(stylist: Stylist | null) {
  setState({
    selectedStylist: stylist,
    // 하위 선택 리셋 (스타일리스트별 예약 현황이 다름)
    selectedDate: null,
    selectedTime: null,
  });
}
```

### 다음 단계 조건

- 항상 진행 가능 (스타일리스트 선택은 선택사항)

---

## Step 3: DateTime Selection

### UI 컴포넌트

`BookingTimelineSelector`

### 타임라인 구조

```
        │ 10:00  10:10  10:20 ... 19:00  19:10 ...
────────┼──────────────────────────────────────────
1/30(목)│ ██████ ██████ ▒▒▒▒▒▒ ... ██████ ██████
1/31(금)│ ▒▒▒▒▒▒ ██████ ██████ ... ▒▒▒▒▒▒ ██████
2/1(토) │ ██████ ██████ ██████ ... ██████ ██████
2/2(일) │      휴 무
2/3(월) │      김원장 휴무
```

### 슬롯 상태

| 상태 | 시각적 표현 | 클릭 가능 |
|------|-------------|-----------|
| 예약 가능 | 녹색 | O |
| 예약됨 | 빨간색 + colSpan | X |
| 선택됨 | 파란색 + colSpan | - |
| 영업 외 | 회색 | X |
| 과거 | 어두운 회색 + colSpan | X |
| 휴무일 | "휴무" 텍스트 | X |
| 스타일리스트 휴무 | "{이름} 휴무" 텍스트 | X |

### 예약 가능 여부 판단

```typescript
const isSlotAvailable = (date: Date, time: string) => {
  // 1. 영업일인지 확인
  if (!isOperatingDay(date)) return false;

  // 2. 스타일리스트 휴무일인지 확인
  if (isStylistDayOff(date)) return false;

  // 3. 영업시간 내인지 확인
  if (!isOperatingTime(date, time)) return false;

  // 4. 과거 시간인지 확인
  if (isPastTime(date, time)) return false;

  // 5. 슬롯 데이터에서 가용성 확인
  const slot = slotsMap[dateStr]?.find(s => s.time === time);
  return slot?.isAvailable ?? false;
};
```

### 스타일리스트 휴무일 체크

```typescript
const isStylistDayOff = (date: Date): boolean => {
  if (!stylist) return false;

  const dayOfWeek = date.getDay();
  const dateStr = toLocalDateString(date);

  // 정기 휴무일 체크 (regularDaysOff: number[])
  if (stylist.regularDaysOff?.includes(dayOfWeek)) {
    return true;
  }

  // 특정 날짜 휴무 체크 (daysOff: string[])
  if (stylist.daysOff?.includes(dateStr)) {
    return true;
  }

  return false;
};
```

### 선택 시 동작

```typescript
const handleDateTimeSelect = (date: Date, time: string) => {
  selectDate(date);
  selectTime(time);
};
```

### 다음 단계 조건

- `selectedDate !== null`
- `selectedTime !== null`

---

## Step 4: Confirmation

### UI 컴포넌트

`BookingConfirm`

### 표시 정보

| 항목 | 값 |
|------|-----|
| 샵 이름 | `shop.name` |
| 서비스 | `service.name` |
| 소요 시간 | `service.durationMinutes` 분 |
| 가격 | `service.price` 원 |
| 스타일리스트 | `stylist?.name` 또는 "지정 안함" |
| 날짜 | `selectedDate` |
| 시간 | `selectedTime` |
| 메모 | 입력 필드 (선택) |

### 예약 제출

```typescript
const submitBooking = async (): Promise<HairBooking | null> => {
  // 1. 필수 데이터 검증
  if (!user || !shopId || !selectedService || !selectedDate || !selectedTime) {
    setError('필수 정보를 모두 입력해주세요.');
    return null;
  }

  // 2. 예약 데이터 구성
  const bookingData: CreateHairBookingData = {
    shopId,
    serviceId: selectedService.id,
    stylistId: selectedStylist?.id || null,
    bookingDate: selectedDate.toISOString().split('T')[0],
    startTime: selectedTime,
    notes: notes || undefined,
  };

  // 3. API 호출
  const booking = await hairBookingService.createBooking(
    user.id,
    user.name,
    user.phone || '',
    bookingData
  );

  // 4. 완료 단계로 이동
  setState({ currentStep: 'complete', createdBooking: booking });
  return booking;
};
```

---

## Step 5: Complete

### 표시 정보

- 성공 아이콘
- "예약이 완료되었습니다!" 메시지
- 예약 번호
- "내 예약 보기" 버튼 → `/hair/my-bookings`
- "샵 목록으로" 버튼 → `/hair`

---

## State Management

### 전체 상태 구조

```typescript
interface BookingState {
  shopId: string | null;
  currentStep: BookingStep;
  selectedService: HairService | null;
  selectedStylist: Stylist | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  notes: string;
}
```

### 단계 순서 정의

```typescript
const STEPS: BookingStep[] = [
  'service',
  'stylist',
  'datetime',
  'confirm',
  'complete'
];
```

### 단계 이동

```typescript
// 다음 단계
const nextStep = () => {
  const currentIndex = STEPS.indexOf(currentStep);
  if (currentIndex < STEPS.length - 1) {
    setCurrentStep(STEPS[currentIndex + 1]);
  }
};

// 이전 단계
const prevStep = () => {
  const currentIndex = STEPS.indexOf(currentStep);
  if (currentIndex > 0) {
    setCurrentStep(STEPS[currentIndex - 1]);
  }
};
```

### Progress Indicator

```
┌───────────────────────────────────────────────────────────┐
│  ① 서비스  ─▶  ② 스타일리스트  ─▶  ③ 날짜/시간  ─▶  ④ 확인  │
│     ●              ●                  ○              ○     │
│   active        active             pending        pending  │
└───────────────────────────────────────────────────────────┘
```

---

## Error Handling

### 에러 유형

| Error | Cause | Handling |
|-------|-------|----------|
| 인증 필요 | 비로그인 상태 | `/login` 리다이렉트 |
| 프로필 미완성 | 프로필 정보 부족 | `/profile/complete` 리다이렉트 |
| 예약 충돌 | 선택 시간에 기존 예약 존재 | alert 표시 |
| 서버 에러 | API 호출 실패 | error 상태 표시 |

### 에러 표시

```typescript
{error && <p className="error-message">{error}</p>}
```

---

## Related Documents

- [Hair Salon](./hair-salon.md) - 헤어살롱 기능 전체
- [Data Flow](../data-flow.md) - 전체 데이터 흐름
- [Hair Salon Types](../types/hair-salon-types.md) - 타입 정의

---

[← Hair Salon](./hair-salon.md) | [← Back to Index](../README.md)
