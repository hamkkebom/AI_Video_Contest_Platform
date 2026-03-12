# Lib — Agent Instructions

## Overview
데이터 레이어, Supabase 인증, 타입 정의, 유틸리티. 앱 전체의 백엔드 연동 코어.

## Structure
```
lib/
├── data/index.ts            # Supabase 데이터 레이어 (1900줄, 50+ 함수)
├── supabase/
│   ├── auth-context.tsx     # AuthProvider + useAuth() 훅 (443줄)
│   ├── client.ts            # 브라우저용 클라이언트 (sessionStorage, LockManager)
│   ├── server.ts            # 서버용 클라이언트 + createPublicClient()
│   └── middleware.ts        # 세션 갱신, 라우트 가드, 슬러그 리다이렉트 (118줄)
├── types/index.ts           # 전체 타입 정의 (413줄)
├── theme/tokens.ts          # 테마 토큰
├── env.ts                   # 환경변수 검증 (fail-fast)
├── utils.ts                 # cn(), formatDate(), formatDateTime()
└── cloudflare-stream.ts     # Cloudflare Stream 영상 API
```

## Where to Look

| 작업 | 파일 |
|------|------|
| DB 쿼리 추가 | `data/index.ts` — 기존 함수 패턴 복사 |
| 새 타입 추가 | `types/index.ts` — camelCase 인터페이스 |
| 인증 로직 수정 | `supabase/auth-context.tsx` |
| 세션/미들웨어 | `supabase/middleware.ts` |
| 날짜 포맷 | `utils.ts` — KST 고정 |
| 영상 업로드 | `cloudflare-stream.ts` |

## Conventions

### data/index.ts — 데이터 함수 패턴
```typescript
// 1. unstable_cache로 래핑 (공개 데이터)
export const getContests = unstable_cache(
  async (filters?: ContestFilters): Promise<Contest[]> => {
    const supabase = createPublicClient();  // 쿠키 없음, anon RLS
    const { data, error } = await supabase.from('contests').select('*');
    if (error) throw new Error(...);        // 실패 시 throw (캐시 방지)
    return data.map((row) => toContest(row)); // snake → camel 변환
  },
  ['contests'],                              // 캐시 키
  { tags: ['contests'], revalidate: 60 },    // 태그 + TTL
);

// 2. React.cache로 래핑 (인증 필수 — getAuthProfile만)
export const getAuthProfile = cache(async () => { ... });

// 3. 변환 함수: toContest(), toUser(), toSubmission() 등
// DB snake_case → TS camelCase 매핑
```

### 데이터 변경 시 캐시 무효화
```typescript
import { revalidateTag } from 'next/cache';
revalidateTag('contests');     // getContests 캐시 갱신
revalidateTag('submissions');  // getSubmissions 캐시 갱신
```

### Supabase 클라이언트 선택
| 컨텍스트 | 함수 | 비고 |
|----------|------|------|
| 브라우저 (use client) | `createClient()` from `client.ts` | null 반환 가능 |
| 서버 (page/route/action) | `createClient()` from `server.ts` | 쿠키 기반 |
| unstable_cache 내부 | `createPublicClient()` from `server.ts` | 쿠키 없음, anon RLS |
| 미들웨어 | `createServerClient()` 직접 | middleware.ts 참조 |

### 인증 (supabase/auth-context.tsx)
- `useAuth()` 훅 exports: `user`, `profile`, `session`, `loading`, `isConfigured`
- 메서드: `signInWithGoogle()`, `signOut()`, `signInWithPassword()`, `signUpWithEmail()`, `resetPasswordForEmail()`, `refreshProfile()`
- 서버 pre-fetch: layout.tsx에서 serverUser/serverProfile 전달 → 클라이언트 더블 페치 방지
- Supabase 미설정 시 graceful fallback (null 클라이언트)

### 세션 정책
- SESSION_MAX_AGE = 3600초 (1시간)
- sessionStorage 기반 → 브라우저/탭 닫으면 토큰 소멸
- 미들웨어가 매 요청마다 sb-* 쿠키 maxAge 재설정 (슬라이딩 만료)
- LockManager로 동시 토큰 갱신 경쟁 방지 (client.ts)

### 타입 (types/index.ts)
- 모든 인터페이스 camelCase (DB는 snake_case)
- UserRole: `"guest" | "participant" | "host" | "judge" | "admin"`
- 역할은 배열: `roles: UserRole[]` — 복수 역할 지원

## Anti-Patterns
- 컴포넌트에서 직접 `supabase.from(...)` 호출 — `lib/data/` 함수 사용
- `createPublicClient()`를 unstable_cache 밖에서 사용 — 인증 없음
- 캐시 무효화 없이 INSERT/UPDATE/DELETE
- `getSession()` 결과의 user 객체 신뢰 — `getUser()` 사용 (JWT 검증)
- 타입 정의를 컴포넌트 파일 내부에 작성 — `types/index.ts`에 추가
