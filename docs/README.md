# Booking Platform Documentation

> 헤어살롱 예약 플랫폼 기술 문서

## Overview

이 프로젝트는 React + TypeScript 기반의 헤어살롱 예약 플랫폼입니다. Feature-based 아키텍처를 채택하여 확장성과 유지보수성을 고려한 구조로 설계되었습니다.

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Frontend | React | 18.3.1 |
| Language | TypeScript | 5.6.2 |
| Routing | React Router DOM | 7.1.0 |
| Backend | Supabase | 2.93.2 |
| Build Tool | Vite | 6.0.5 |

## Documentation Structure

### Core Documentation

| Document | Description |
|----------|-------------|
| [Architecture](./architecture.md) | 프로젝트 아키텍처 및 폴더 구조 |
| [Data Flow](./data-flow.md) | 데이터 흐름 및 상태 관리 |
| [Getting Started](./getting-started.md) | 개발 환경 설정 및 시작 가이드 |

### Features

| Document | Description |
|----------|-------------|
| [Features Overview](./features/README.md) | Feature 모듈 개요 |
| [Hair Salon](./features/hair-salon.md) | 헤어살롱 기능 상세 |
| [Booking Flow](./features/booking-flow.md) | 예약 프로세스 흐름 |

### Types

| Document | Description |
|----------|-------------|
| [Types Overview](./types/README.md) | 타입 시스템 개요 |
| [Core Types](./types/core-types.md) | 핵심 공통 타입 |
| [Hair Salon Types](./types/hair-salon-types.md) | 헤어살롱 도메인 타입 |

### Components

| Document | Description |
|----------|-------------|
| [Components Overview](./components/README.md) | 컴포넌트 개요 |
| [Core Components](./components/core-components.md) | 공통 UI 컴포넌트 |
| [Hair Salon Components](./components/hair-salon-components.md) | 헤어살롱 전용 컴포넌트 |

### API

| Document | Description |
|----------|-------------|
| [API Overview](./api/README.md) | 서비스 API 개요 |
| [Hair Salon API](./api/hair-salon-api.md) | 헤어살롱 서비스 API |

## Quick Links

- [프로젝트 루트 구조](#project-structure)
- [주요 기능 목록](#main-features)
- [라우팅 구조](./architecture.md#routing)

## Project Structure

```
booking-platform/
├── docs/                    # 문서
├── src/
│   ├── core/               # 공통 모듈
│   │   ├── components/     # UI 컴포넌트
│   │   ├── contexts/       # 전역 상태
│   │   ├── hooks/          # 커스텀 훅
│   │   ├── layouts/        # 레이아웃
│   │   ├── lib/            # 외부 라이브러리
│   │   ├── types/          # 타입 정의
│   │   └── utils/          # 유틸리티
│   ├── features/           # 도메인별 기능
│   │   └── hairSalon/      # 헤어살롱 모듈
│   └── pages/              # 공용 페이지
└── public/                 # 정적 파일
```

## Main Features

### 1. 헤어살롱 예약 시스템
- 살롱 목록 조회 및 상세 정보
- 서비스 선택 → 스타일리스트 선택 → 날짜/시간 선택 → 예약 확인
- 스타일리스트별 휴무일 관리
- 타임라인 기반 예약 현황 표시

### 2. 사용자 인증
- 이메일/비밀번호 로그인
- 역할 기반 권한 관리 (customer, business_owner, admin)
- 프로필 완성 요구 기능

### 3. 관리자 기능
- 살롱 등록 및 관리
- 서비스/스타일리스트 관리
- 예약 스케줄 관리
- 승인 상태 관리

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-01 | 초기 버전 - 헤어살롱 예약 기능 |

---

*Last Updated: 2026-01-29*
