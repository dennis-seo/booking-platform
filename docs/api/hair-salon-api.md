# Hair Salon API

> 헤어살롱 서비스 API 상세

[← API Overview](./README.md) | [← Back to Index](../README.md)

## Table of Contents

- [hairShopService](#hairshopservice)
- [hairBookingService](#hairbookingservice)

---

## hairShopService

> `src/features/hairSalon/services/hairShopService.ts`

샵, 스타일리스트, 서비스 관련 API

### Shop Operations

#### getShops

활성화된 승인된 살롱 목록 조회

```typescript
async getShops(): Promise<HairShop[]>
```

**Returns:** 활성(`isActive=true`) + 승인됨(`approvalStatus='approved'`) 살롱 목록

---

#### getAllShops

전체 살롱 목록 조회 (관리자용)

```typescript
async getAllShops(): Promise<HairShop[]>
```

**Returns:** 모든 살롱 목록 (상태 무관)

---

#### getShopById

살롱 상세 조회

```typescript
async getShopById(id: string): Promise<HairShop | null>
```

| Param | Type | Description |
|-------|------|-------------|
| `id` | `string` | 살롱 ID |

**Returns:** 살롱 정보 또는 `null`

---

#### getShopsByOwner

소유자별 살롱 목록 조회

```typescript
async getShopsByOwner(ownerId: string): Promise<HairShop[]>
```

| Param | Type | Description |
|-------|------|-------------|
| `ownerId` | `string` | 소유자 (사업주) ID |

**Returns:** 해당 소유자의 살롱 목록

---

#### createShop

살롱 생성

```typescript
async createShop(ownerId: string, data: CreateHairShopData): Promise<HairShop>
```

| Param | Type | Description |
|-------|------|-------------|
| `ownerId` | `string` | 소유자 ID |
| `data` | `CreateHairShopData` | 생성 데이터 |

**Returns:** 생성된 살롱 (상태: `pending`, `isActive: false`)

---

#### updateShop

살롱 수정

```typescript
async updateShop(id: string, data: UpdateHairShopData): Promise<HairShop | null>
```

---

#### deleteShop

살롱 삭제 (soft delete)

```typescript
async deleteShop(id: string): Promise<boolean>
```

---

### Stylist Operations

#### getStylistsByShop

살롱별 스타일리스트 목록 조회

```typescript
async getStylistsByShop(shopId: string): Promise<Stylist[]>
```

| Param | Type | Description |
|-------|------|-------------|
| `shopId` | `string` | 살롱 ID |

**Returns:** 활성 스타일리스트 목록

---

#### getStylistById

스타일리스트 상세 조회

```typescript
async getStylistById(id: string): Promise<Stylist | null>
```

---

#### createStylist

스타일리스트 생성

```typescript
async createStylist(data: CreateStylistData): Promise<Stylist>
```

---

#### updateStylist

스타일리스트 수정

```typescript
async updateStylist(id: string, data: UpdateStylistData): Promise<Stylist | null>
```

---

#### deleteStylist

스타일리스트 삭제 (soft delete)

```typescript
async deleteStylist(id: string): Promise<boolean>
```

---

### Service Operations

#### getServicesByShop

살롱별 서비스 목록 조회

```typescript
async getServicesByShop(shopId: string): Promise<HairService[]>
```

| Param | Type | Description |
|-------|------|-------------|
| `shopId` | `string` | 살롱 ID |

**Returns:** 활성 서비스 목록

---

#### getServiceById

서비스 상세 조회

```typescript
async getServiceById(id: string): Promise<HairService | null>
```

---

#### createService

서비스 생성

```typescript
async createService(data: CreateHairServiceData): Promise<HairService>
```

---

#### updateService

서비스 수정

```typescript
async updateService(id: string, data: UpdateHairServiceData): Promise<HairService | null>
```

---

#### deleteService

서비스 삭제 (soft delete)

```typescript
async deleteService(id: string): Promise<boolean>
```

---

## hairBookingService

> `src/features/hairSalon/services/hairBookingService.ts`

예약 관련 API

### Query Operations

#### getBookingsByCustomer

고객별 예약 목록 조회

```typescript
async getBookingsByCustomer(customerId: string): Promise<HairBooking[]>
```

| Param | Type | Description |
|-------|------|-------------|
| `customerId` | `string` | 고객 ID |

**Returns:** 예약 목록 (shop, service, stylist populated)

---

#### getBookingsByShop

살롱별 예약 목록 조회

```typescript
async getBookingsByShop(
  shopId: string,
  date?: string,
  populate?: boolean
): Promise<HairBooking[]>
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `shopId` | `string` | - | 살롱 ID |
| `date` | `string` | - | 날짜 필터 (YYYY-MM-DD) |
| `populate` | `boolean` | `false` | 관계 데이터 포함 여부 |

**Returns:** 예약 목록

---

#### getBookingById

예약 상세 조회

```typescript
async getBookingById(id: string): Promise<HairBooking | null>
```

**Returns:** 예약 정보 (shop, service, stylist populated)

---

#### getAvailableSlots

예약 가능 슬롯 조회

```typescript
async getAvailableSlots(
  shopId: string,
  date: string,
  serviceDurationMinutes: number,
  stylistId?: string
): Promise<HairBookingSlot[]>
```

| Param | Type | Description |
|-------|------|-------------|
| `shopId` | `string` | 살롱 ID |
| `date` | `string` | 날짜 (YYYY-MM-DD) |
| `serviceDurationMinutes` | `number` | 서비스 소요 시간 |
| `stylistId` | `string` | (선택) 스타일리스트 ID |

**로직:**

1. 살롱 영업 시간 조회
2. 해당 날짜의 기존 예약 조회
3. 스타일리스트 지정 시 해당 스타일리스트 예약만 필터링
4. 가용 슬롯 계산

**Returns:** 시간대별 가용 여부 목록

---

### Mutation Operations

#### createBooking

예약 생성

```typescript
async createBooking(
  customerId: string,
  customerName: string,
  customerPhone: string,
  data: CreateHairBookingData
): Promise<HairBooking>
```

| Param | Type | Description |
|-------|------|-------------|
| `customerId` | `string` | 고객 ID |
| `customerName` | `string` | 고객명 |
| `customerPhone` | `string` | 고객 연락처 |
| `data` | `CreateHairBookingData` | 예약 데이터 |

**로직:**

1. 서비스 정보 조회
2. `endTime` 계산 (startTime + durationMinutes)
3. 예약 데이터 생성 (상태: `pending`)

**Returns:** 생성된 예약

**Throws:** `Error('서비스를 찾을 수 없습니다.')`

---

#### confirmBooking

예약 확정

```typescript
async confirmBooking(id: string): Promise<HairBooking | null>
```

**상태 변경:** `pending` → `confirmed`

---

#### cancelBooking

예약 취소

```typescript
async cancelBooking(id: string): Promise<HairBooking | null>
```

**상태 변경:** `*` → `cancelled`

---

#### completeBooking

예약 완료

```typescript
async completeBooking(id: string): Promise<HairBooking | null>
```

**상태 변경:** `confirmed` → `completed`

---

## API Usage Examples

### 예약 생성 플로우

```typescript
// 1. 서비스 목록 조회
const services = await hairShopService.getServicesByShop(shopId);

// 2. 스타일리스트 목록 조회
const stylists = await hairShopService.getStylistsByShop(shopId);

// 3. 가용 슬롯 조회
const slots = await hairBookingService.getAvailableSlots(
  shopId,
  '2026-02-01',
  60,  // 60분 서비스
  'stylist-1'
);

// 4. 예약 생성
const booking = await hairBookingService.createBooking(
  userId,
  userName,
  userPhone,
  {
    shopId,
    serviceId: 'svc-1',
    stylistId: 'stylist-1',
    bookingDate: '2026-02-01',
    startTime: '10:00',
    notes: '레이어드 커트 원합니다',
  }
);
```

### 타임라인에서 예약 데이터 조회

```typescript
// 슬롯과 예약 동시 조회
const [slots, allBookings] = await Promise.all([
  hairBookingService.getAvailableSlots(shopId, date, duration, stylistId),
  hairBookingService.getBookingsByShop(shopId, date, true),
]);

// 스타일리스트 필터링
const filteredBookings = stylistId
  ? allBookings.filter(b => b.stylistId === stylistId)
  : allBookings;
```

---

## Related Documents

- [API Overview](./README.md) - API 개요
- [Hair Salon Feature](../features/hair-salon.md) - 기능 상세
- [Hair Salon Types](../types/hair-salon-types.md) - 타입 정의
- [Data Flow](../data-flow.md) - 데이터 흐름

---

[← API Overview](./README.md) | [← Back to Index](../README.md)
