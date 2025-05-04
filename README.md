# Pack & Go

사용자가 여행 일정을 효율적으로 관리할 수 있도록 돕는 웹 애플리케이션입니다. 다양한 기능을 통해 여행 계획, 일정 관리, 체크리스트 등을 쉽게 관리할 수 있습니다.

## 주요 기능

- 여행 계획 생성 및 관리
- 여행 일정 관리
- 다국어 지원 (한국어, 영어)
- 모바일 친화적 UI
- 개인화된 여행 추천

## 기술 스택

### 프론트엔드
- **Next.js 15**: React 프레임워크
- **React 19**: UI 컴포넌트 라이브러리
- **TypeScript**: 정적 타입 지원
- **TailwindCSS**: 유틸리티 기반 CSS 프레임워크
- **Zustand**: 상태 관리
- **React Query**: 서버 상태 관리
- **next-intl**: 국제화/다국어 지원

### 개발 환경
- **Turborepo**: 모노레포 관리
- **pnpm**: 패키지 매니저
- **Storybook**: UI 컴포넌트 문서화
- **ESLint/Prettier**: 코드 스타일 및 품질 관리
- **Husky/Commitlint**: Git 훅 및 커밋 메시지 검증

## 프로젝트 구조

```
pack-and-go/
├── apps/                   # 애플리케이션
│   ├── web/                # 웹 애플리케이션
│   │   ├── src/            # 소스 코드
│   │   │   ├── app/        # Next.js 애플리케이션 라우트
│   │   │   ├── i18n/       # 국제화 설정
│   │   │   ├── store/      # 상태 관리 (Zustand)
│   │   │   ├── messages/   # 다국어 메시지 파일
│   │   │   ├── providers/  # 컨텍스트 제공자
│   │   │   └── styles/     # 스타일 관련 파일
│   └── storybook/          # UI 컴포넌트 문서화
├── packages/               # 공유 패키지
│   └── ui/                 # UI 컴포넌트 라이브러리
│       ├── src/            # 소스 코드
│       │   ├── components/ # 공유 UI 컴포넌트
│       │   ├── styles/     # 스타일 관련 파일
│       │   └── utils/      # 유틸리티 함수
├── commitlint.config.js    # Commitlint 설정
├── .husky/                 # Git 훅 설정
├── .gitmessage             # 커밋 메시지 템플릿
└── package.json            # 프로젝트 설정 및 의존성
```

## 개발 환경 설정

### 요구 사항

- Node.js 18.0.0 이상
- pnpm 10.0.0 이상

### 설치 및 실행

```bash
# 패키지 설치
pnpm install

# 모든 개발 서버 실행 (웹 + Storybook)
pnpm dev

# 웹 애플리케이션만 실행
pnpm dev:web

# Storybook 실행
pnpm dev:storybook

# 린트 검사
pnpm lint

# 코드 포맷팅
pnpm format
```

## 배포

```bash
# 빌드 실행
pnpm build

# 서버 실행
pnpm start
```

## 커밋 컨벤션

이 프로젝트는 [Conventional Commits](https://www.conventionalcommits.org/ko/v1.0.0/) 스펙을 따릅니다.

### 커밋 메시지 구조

```
<타입>[적용 범위(선택 사항)]: <설명>

[본문(선택 사항)]

[꼬리말(선택 사항)]
```

### 커밋 타입

- **feat**: 새로운 기능 추가
- **fix**: 버그 수정
- **docs**: 문서 수정
- **style**: 코드 포맷팅, 세미콜론 누락 등 (코드 변경 없음)
- **refactor**: 코드 리팩토링
- **test**: 테스트 코드 추가 또는 수정
- **chore**: 빌드 프로세스, 패키지 매니저 설정 등 (소스 변경 없음)
- **perf**: 성능 개선
- **ci**: CI 설정 변경
- **build**: 빌드 관련 변경
- **revert**: 이전 커밋으로 되돌리기

### 예시

```
feat: 사용자 회원가입 기능 추가

회원가입 폼과 이메일 검증 로직 구현

Resolves: #123
```

## 브랜치 전략

- **main**: 프로덕션 브랜치
- **develop**: 개발 브랜치
- **feature/기능명**: 새로운 기능 개발
- **fix/버그명**: 버그 수정
- **refactor/리팩토링명**: 코드 리팩토링
- **docs/문서명**: 문서 작업

## CI/CD

이 프로젝트는 GitHub Actions와 Vercel을 통한 CI/CD 파이프라인이 구축되어 있습니다.

### 자동화된 배포

- **메인 브랜치 푸시** - 자동으로 Production 환경에 배포됩니다.
- **PR 생성** - PR에 대한 프리뷰 배포가 자동으로 생성됩니다.

### 자동 버전 관리

메인 브랜치에 머지될 때 다음과 같은 규칙에 따라 자동으로 버전이 업데이트됩니다:

- **BREAKING CHANGE** 커밋 - Major 버전 증가 (1.0.0 → 2.0.0)
- **feat** 커밋 - Minor 버전 증가 (1.0.0 → 1.1.0)
- **fix, chore, refactor 등** 커밋 - Patch 버전 증가 (1.0.0 → 1.0.1)

### 배포 설정

CI/CD 파이프라인을 설정하려면 GitHub 저장소에 다음 시크릿을 추가해야 합니다:

- `VERCEL_TOKEN` - Vercel API 토큰
- `VERCEL_ORG_ID` - Vercel 조직 ID
- `VERCEL_PROJECT_ID` - Vercel 프로젝트 ID
