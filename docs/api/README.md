# API Overview

> 서비스 API 개요

[← Back to Index](../README.md)

## Table of Contents

- [Service Architecture](#service-architecture)
- [Available Services](#available-services)
- [API Patterns](#api-patterns)
- [Error Handling](#error-handling)

---

## Service Architecture

### 서비스 계층

```
┌─────────────────────────────────────────────────────────────┐
│                        Hooks                                 │
│    useHairShops, useHairBookings, useStylists               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Services                               │
│       hairShopService, hairBookingService                   │
│                                                              │
│  - 비즈니스 로직                                              │
│  - 데이터 변환                                                │
│  - 에러 핸들링                                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Source                               │
│                                                              │
│   현재: Mock Data (in-memory)                                │
│   향후: Supabase (PostgreSQL)                                │
└─────────────────────────────────────────────────────────────┘
```

### 서비스 위치

```
src/features/hairSalon/services/
├── hairShopService.ts      # 샵/스타일리스트/서비스 API
├── hairBookingService.ts   # 예약 API
└── index.ts                # re-export
```

---

## Available Services

| Service | File | Description |
|---------|------|-------------|
| `hairShopService` | `hairShopService.ts` | 샵, 스타일리스트, 서비스 관리 |
| `hairBookingService` | `hairBookingService.ts` | 예약 관리 |

[Hair Salon API 상세 →](./hair-salon-api.md)

---

## API Patterns

### 서비스 구조

```typescript
// 서비스 객체 패턴
export const serviceName = {
  async methodName(params): Promise<ReturnType> {
    await delay(ms);  // Mock 지연
    // 비즈니스 로직
    return result;
  },
};
```

### CRUD 패턴

```typescript
const entityService = {
  // Create
  async create(data: CreateData): Promise<Entity> {},

  // Read
  async getAll(): Promise<Entity[]> {},
  async getById(id: string): Promise<Entity | null> {},
  async getByFilter(filter: Filter): Promise<Entity[]> {},

  // Update
  async update(id: string, data: UpdateData): Promise<Entity | null> {},

  // Delete
  async delete(id: string): Promise<boolean> {},
};
```

### 훅에서 사용

```typescript
function useEntities() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        const data = await entityService.getAll();
        setEntities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return { entities, isLoading, error };
}
```

---

## Error Handling

### 에러 타입

```typescript
// 커스텀 에러
throw new Error('서비스를 찾을 수 없습니다.');
throw new Error('예약에 실패했습니다.');
```

### 에러 처리 패턴

```typescript
// 서비스 레벨
async function createBooking(data) {
  const service = await getServiceById(data.serviceId);
  if (!service) {
    throw new Error('서비스를 찾을 수 없습니다.');
  }
  // ...
}

// 훅 레벨
try {
  const result = await service.create(data);
  return result;
} catch (err) {
  setError(err instanceof Error ? err.message : '알 수 없는 에러');
  return null;
}

// 컴포넌트 레벨
{error && <p className="error-message">{error}</p>}
```

---

## API Documents

| Document | Description |
|----------|-------------|
| [Hair Salon API](./hair-salon-api.md) | 헤어살롱 서비스 API |

---

[← Back to Index](../README.md)
