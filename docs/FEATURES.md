# FEATURES — 구현 기능 인벤토리

> **마지막 갱신**: 2026-07-30
> **스냅샷 수치**: 페이지 74개 · API 엔드포인트 47개 · DB 테이블 38개 · 마이그레이션 41개 (000~041, 023 결번)
> **갱신 규칙**: 기능을 추가/제거하는 PR에서 해당 행을 함께 갱신한다. 코드 위치는 대표 진입점만 적는다.

구 기획의 기능 ID(F-xxx)는 문서 간 불일치가 있어(PRD와 서비스기획서가 서로 다른 번호 사용) 폐기하고, 아래 도메인 분류로 대체한다.

## 1. 공모전 코어

| 기능 | 상태 | 대표 코드 위치 | 주요 DB |
|------|:---:|----------------|---------|
| 공모전 생성/수정 (관리자) | ✅ 운영 | `app/(admin)/admin/contests/_components/contest-form.tsx` | `contests`, `contest_award_tiers`, `judging_criteria` |
| 공모전 목록/상세 (공개) | ✅ 운영 | `app/(public)/contests/` | `contests` |
| 출품 접수 (영상 업로드 포함) | ✅ 운영 | `app/(public)/contests/[id]/submit/page.tsx` | `submissions` |
| 재출품/수정 흐름 | ✅ 운영 | 위와 동일 (edit 모드) + `resubmission_*` 컬럼 | `submissions` |
| 관리자 대리 출품 등록 | ✅ 운영 | `app/(admin)/admin/submissions/register/page.tsx` | `submissions` (`registered_by`) |
| 출품 승인/반려 (+반려 사유) | ✅ 운영 | `components/submissions/admin-submission-actions.tsx` | `submissions` (`rejection_reason`) |
| 결과 발표 | ✅ 운영 | `app/(public)/contests/` 결과 노출 | `contest_results` |
| 슬러그 리다이렉트 | ✅ 운영 | `middleware.ts` | `contests` |

## 2. 심사

| 기능 | 상태 | 대표 코드 위치 | 주요 DB |
|------|:---:|----------------|---------|
| 심사위원 배정/관리 | ✅ 운영 | `app/api/judges/`, `(judge)` 그룹 | `judges` |
| 채점 (기준별 점수) | ✅ 운영 | `app/(judge)/` | `scores`, `score_criteria` |
| 간이 심사 | ✅ 운영 | `app/api/judgments/` | `simple_judgments` |
| **다단계 심사** (계획외 추가) | ✅ 운영 | 마이그레이션 036 | `judging_stages`, `stage_judges`, `submission_stage_results` |
| 심사 템플릿 | ✅ 운영 | — | `judging_templates` |
| AI 심사 자동화 | ⏸️ 보류 | — | — |

## 3. 갤러리 / 탐색

| 기능 | 상태 | 대표 코드 위치 | 주요 DB |
|------|:---:|----------------|---------|
| 갤러리 (무한스크롤) | ✅ 운영 | `app/gallery/`, `app/api/gallery/` | `submissions` |
| 갤러리 공모전 필터 (2026-08-01) | ✅ 운영 | `?contest=[id]` — 공모전 2개 이상일 때 자동 노출. 기간 필터를 대체 | `submissions.contest_id` |
| 갤러리 상세 비로그인 공개 (2026-08-01) | ✅ 운영 | `lib/supabase/middleware.ts` — 감상은 공개, 좋아요만 로그인 ([IA.md](IA.md) §4) | `public_submissions` 뷰 |
| 공개/비공개 토글 (계획외) | ✅ 운영 | 마이그레이션 041 | `submissions.is_public` |
| 좋아요 (+어뷰징 방어) | ✅ 운영 | `app/api/` + RPC `rpc_toggle_like` | `likes`, `like_events` |
| 조회수 (+어뷰징 방어) | ✅ 운영 | RPC `rpc_record_view` | `submission_views` |
| 통합 검색 | ✅ 운영 | `app/api/search/` | 복합 |
| 검색 자동완성 | ⏸️ 보류 | — | — |

## 4. 인증 / 계정

| 기능 | 상태 | 대표 코드 위치 | 주요 DB |
|------|:---:|----------------|---------|
| 이메일 가입/로그인 | ✅ 운영 | `app/(auth)/`, `lib/supabase/` | `profiles` |
| Google OAuth | ✅ 운영 | `lib/supabase/auth-context.tsx` | `profiles` |
| 역할 시스템 (복수 역할) | ✅ 운영 | `profiles.roles` 배열, `middleware.ts` 가드 | `profiles` |
| 세션 슬라이딩 만료 (1시간) | ✅ 운영 | `lib/supabase/middleware.ts` | — |
| 프로필 편집 | ✅ 운영 | `components/profile/profile-edit-form.tsx` | `profiles` |
| 기기 관리 | ✅ 운영 | `app/api/devices/` | `devices` |
| 회원 탈퇴 | ✅ 운영 | — | `account_withdrawals` |
| 함께봄 통합 SSO | ⏸️ 보류 | — | — |

## 5. 영상 인프라

| 기능 | 상태 | 대표 코드 위치 | 주요 DB |
|------|:---:|----------------|---------|
| Cloudflare Stream 업로드 (진행률 표시) | ✅ 운영 | `lib/cloudflare-stream.ts`, `app/api/stream/`, `app/api/upload/` | — |
| 재생 (Stream 플레이어) | ✅ 운영 | 갤러리/상세 페이지 | — |
| 업로드 에러 로깅 | ✅ 운영 | `app/api/upload-error-log/` | — |
| 썸네일/증빙 이미지 (Supabase Storage) | ✅ 운영 | 버킷: `thumbnails`, `proof-images`, `posters`, `avatars`, `company-assets` | `storage.objects` |

## 6. 가산점 (계획외 추가)

| 기능 | 상태 | 대표 코드 위치 | 주요 DB |
|------|:---:|----------------|---------|
| 가산점 항목 설정 (공모전별) | ✅ 운영 | contest-form 내 | `contest_bonus_configs` |
| 가산점 인증 제출 | ✅ 운영 | 제출 폼 내 | `bonus_entries` |
| 인증 승인/반려 워크플로 | ✅ 운영 | 마이그레이션 037 | `bonus_entries` (`status`, `reviewed_by`) |
| 인증 수정 마감일 | ✅ 운영 | 마이그레이션 035 | `contests.bonus_deadline_at` |

## 7. 어뷰징 방지 (계획외 추가, 마이그레이션 026)

| 기능 | 상태 | 주요 DB |
|------|:---:|---------|
| API 레이트리밋 | ✅ 운영 | `api_rate_limits` + RPC `cleanup_rate_limits` |
| 부정 좋아요/조회 감지·플래깅 | ✅ 운영 | `abuse_flags`, `like_events`, `submission_views` |
| IP 로그 | ✅ 운영 | `ip_logs` |
| 관리자 플래그 검토 | ✅ 운영 | `app/(admin)/admin/abuse-flags/` |

## 8. 운영 도구 / 어드민

| 기능 | 상태 | 대표 코드 위치 | 주요 DB |
|------|:---:|----------------|---------|
| 관리자 대시보드 | ✅ 운영 | `app/(admin)/admin/` | 복합 |
| 회원 관리 (활동/IP 로그 포함) | ✅ 운영 | `app/(admin)/admin/` | `profiles`, `activity_logs`, `ip_logs` |
| 팝업 관리 (계획외) | ✅ 운영 | `app/(admin)/admin/popups/`, `app/api/popups/` | `popups` |
| 사이트 설정 (계획외) | ✅ 운영 | 마이그레이션 029 | `site_settings` |
| 활동 로그 | ✅ 운영 | `app/api/log/` | `activity_logs` |
| UTM 추적 | ✅ 운영 | `app/api/utm/`, `components/tracking/` | `utm_visits` |
| 회사(주최사) 관리 | ✅ 운영 | `app/(admin)/admin/companies/` | `companies`, `company_members` |
| 주최자 대시보드 | ✅ 운영 | `app/(host)/host/` | 복합 |

## 9. 콘텐츠 / 지원

| 기능 | 상태 | 대표 코드 위치 | 주요 DB |
|------|:---:|----------------|---------|
| 소식/아티클 | ✅ 운영 | `app/api/articles/` | `articles` |
| FAQ | ✅ 운영 | `app/api/faqs/` | `faqs` |
| 문의 접수 | ✅ 운영 | `app/(public)/support/` | `inquiries` |
| 대행 의뢰 접수 | 🔶 부분 | 접수 폼 + `app/(admin)/admin/agency-requests/` (이후 매칭 프로세스 없음) | `agency_requests` |
| 아리랑 마이크로사이트 (계획외) | ✅ 운영 | `components/contests/arirang/` (한/영 번역 포함) | — |

## 10. 수익화 (전체 보류 — [ROADMAP.md](ROADMAP.md) 참조)

| 기능 | 상태 | 비고 |
|------|:---:|------|
| 가격표 페이지 | 🔶 UI만 | "서비스 준비 중" 노출 (`app/(public)/pricing/`) |
| 요금제 데이터 | 🔶 골격만 | `pricing_plans` 테이블, `DEFAULT_FEATURE_ACCESS` (`config/constants.ts`) |
| 결제 연동 | ⏸️ 없음 | SDK 미설치 |
| PaywallOverlay | 🔶 컴포넌트만 | `components/common/paywall-overlay.tsx` — 사용처 0 |
| 인증 배지 | ⏸️ 없음 | — |

## 상태 범례

- ✅ 운영: 프로덕션에서 실사용 검증됨
- 🔶 부분: 일부만 구현 (비고 참조)
- ⏸️ 보류: 미구현, 재개 트리거는 [ROADMAP.md](ROADMAP.md)
