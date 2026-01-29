# Getting Started

> 개발 환경 설정 및 시작 가이드

[← Back to Index](./README.md)

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Project Scripts](#project-scripts)
- [Environment Variables](#environment-variables)

---

## Prerequisites

### Required

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | >= 18.x | JavaScript 런타임 |
| npm | >= 9.x | 패키지 매니저 |

### Optional

| Tool | Purpose |
|------|---------|
| VS Code | 권장 IDE |
| Supabase CLI | 로컬 백엔드 개발 |

---

## Installation

### 1. 저장소 클론

```bash
git clone <repository-url>
cd booking-platform
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

```bash
# .env.local 파일 생성
cp .env.example .env.local
```

`.env.local` 파일 편집:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Development

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### Mock 데이터 사용

현재 프로젝트는 Supabase 연동 전 Mock 데이터를 사용합니다:

```
src/features/hairSalon/mocks/
├── shops.ts      # 헤어샵 목록
├── services.ts   # 서비스 목록
├── stylists.ts   # 스타일리스트 목록
└── bookings.ts   # 예약 데이터
```

### 테스트 계정

| Role | Email | Password |
|------|-------|----------|
| Customer | user@test.com | test1234 |
| Business Owner | owner@test.com | test1234 |
| Admin | admin@test.com | test1234 |

---

## Project Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과물 미리보기 |
| `npm run lint` | ESLint 검사 |

### Build

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview
```

빌드 결과물은 `dist/` 폴더에 생성됩니다.

---

## Environment Variables

### Required Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anonymous Key |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_LOG_LEVEL` | 로그 레벨 | `info` |
| `VITE_API_TIMEOUT` | API 타임아웃 (ms) | `5000` |

### 환경별 설정

```
.env                # 기본 설정 (git에 포함)
.env.local          # 로컬 개발 설정 (git 제외)
.env.production     # 프로덕션 설정
```

---

## IDE Setup

### VS Code Extensions

권장 확장 프로그램:

- **ESLint** - 코드 린팅
- **Prettier** - 코드 포맷팅
- **TypeScript Importer** - 자동 import
- **ES7+ React Snippets** - React 스니펫

### VS Code Settings

`.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

## Folder Structure Quick Reference

```
src/
├── core/           # 공통 모듈 (컴포넌트, 훅, 유틸)
├── features/       # 도메인별 기능 (hairSalon 등)
├── pages/          # 공용 페이지
├── App.tsx         # 라우팅 설정
└── index.tsx       # 앱 진입점
```

더 자세한 구조는 [Architecture](./architecture.md) 문서 참조.

---

## Next Steps

1. [Architecture](./architecture.md) - 프로젝트 구조 이해
2. [Features Overview](./features/README.md) - 기능 모듈 이해
3. [Data Flow](./data-flow.md) - 데이터 흐름 이해

---

[← Back to Index](./README.md)
