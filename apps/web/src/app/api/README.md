# API 라우터 문서

## 📁 API 구조

```
/api/
├── auth/callback/route.ts     # OAuth 인증 콜백
├── blocks/route.ts            # 블록 생성
├── blocks/[id]/route.ts       # 블록 수정/삭제
├── blocks/[id]/move/route.ts  # 블록 이동
└── trips/[id]/route.ts        # 여행 상세 조회
```

## 🔐 인증 API

### OAuth 콜백
- **경로**: `/auth/callback`
- **기능**: OAuth 로그인 후 세션 처리
- **리다이렉트**: 프로필 존재 → `/`, 없음 → `/sign-up`, 실패 → `/log-in`

## 🧳 여행 API

### 여행 상세 조회
- **경로**: `/api/trips/[id]`
- **기능**: 여행 계획, 참여자, 블록, 활동 로그 통합 조회
- **권한**: 참여자 또는 소유자만 접근

## 📦 블록 API

### 블록 생성
- **경로**: `/api/blocks`
- **기능**: 새 블록 생성
- **필수**: `plan_id`, `title`, `day_number`, `order_index`

### 블록 수정/삭제
- **경로**: `/api/blocks/[id]`
- **기능**: 블록 수정(PUT) 또는 삭제(DELETE)
- **권한**: owner/editor만 가능

### 블록 이동
- **경로**: `/api/blocks/[id]/move`
- **기능**: 블록 일차/순서 변경
- **특이사항**: Supabase RPC 함수 사용

## 🔒 권한 체계

- **owner**: 모든 권한
- **editor**: 수정/삭제/이동 권한
- **viewer**: 조회만 가능

## 🚨 에러 코드

- `400`: 잘못된 요청
- `401`: 인증 실패
- `403`: 권한 부족
- `404`: 리소스 없음
- `500`: 서버 오류

## 🔄 실시간 기능

- Supabase Realtime으로 블록/활동 로그 실시간 동기화
- React Query 캐싱 및 낙관적 업데이트 