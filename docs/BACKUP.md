# BACKUP — 백업과 복구

> **마지막 갱신**: 2026-07-31
> 백업은 복원해본 적이 있어야 백업이다. 절차를 모르면 사고 당일에 배우게 된다.

## 무엇이 어디서 보호되는가

| 대상 | Supabase 자동 백업 | 이 저장소의 스크립트 |
|------|:---:|:---:|
| DB 데이터 (회원·출품작·좋아요 등) | ✅ 플랜에 따라 | ✅ `backup-db.mjs` |
| **Storage 파일** (썸네일·증빙 이미지·포스터) | ❌ **포함되지 않음** | ✅ `backup-storage.mjs` |
| Cloudflare Stream 영상 | ❌ (Supabase 밖) | ❌ Cloudflare에 원본 보관 |
| Auth 계정 (`auth.users`) | ✅ | ❌ 스크립트 범위 밖 |

**가장 중요한 사실**: [Supabase 문서](https://supabase.com/docs/guides/platform/backups)상 자동 백업은 **데이터베이스만** 대상이다. Storage 객체는 포함되지 않아, 백업을 복원해도 버킷 메타데이터만 살아나고 **파일은 사라진다**. 출품작 썸네일과 가산점 증빙 이미지가 여기 해당하므로 반드시 따로 받아둬야 한다.

## 잃으면 복구 불가능한 것 (2026-07-31 기준)

| 데이터 | 규모 | 재생성 가능성 |
|--------|------|---------------|
| 회원 계정 | 2,384건 | ❌ 재가입을 요구할 수 없다 |
| 출품작 | 528건 | ❌ 공모전 종료 후에는 재제출 불가 |
| 좋아요(온라인 투표) | 2,022건 | ❌ 수상 결정 근거라 분쟁 소지 |
| 가산점 증빙 이미지 | 574건 · 726MB | ❌ 참가자 재제출 필요 |
| 출품작 썸네일 | 605개 · 1.4GB | ⚠️ 영상에서 재추출은 가능하나 수작업 |

## 백업 실행

프로젝트 루트에서 실행한다. `.env.local` 의 `SUPABASE_SERVICE_ROLE_KEY` 를 사용한다.

```bash
# DB — 전 테이블을 JSON 으로 (약 100MB, 수 분)
node scripts/backup-db.mjs D:/backups/aikkum-2026-08-01

# Storage — 전 버킷 파일 (약 2.5GB, 오래 걸림)
node scripts/backup-storage.mjs D:/backups/aikkum-2026-08-01/storage

# 증빙 이미지만 급히 받고 싶을 때
node scripts/backup-storage.mjs D:/backups/proof proof-images
```

Storage 스크립트는 **이미 받은 파일을 건너뛰므로** 중단 후 재실행하면 이어받는다.

## ⚠️ 백업물 취급

받은 파일에는 **회원 이메일·전화번호가 평문으로** 들어 있고, `proof-images` 에는 참가자가 올린 SNS 인증 스크린샷이 들어 있다.

- 저장소 안에 두지 말 것 (실수로 커밋될 수 있다)
- 클라우드 동기화 폴더(OneDrive·Dropbox 등)에 두지 말 것
- 장기 보관은 암호화된 위치에

## 복구 절차

### DB 일부만 되돌릴 때 (실수로 지운 행 등)
JSON 은 그대로 Supabase REST API 로 다시 넣을 수 있다. 단 **id 충돌**과 **외래키 순서**에 주의한다 — `profiles` → `contests` → `submissions` → `bonus_entries` 순으로 넣어야 참조가 깨지지 않는다.

### DB 전체를 되돌릴 때
Supabase 대시보드의 백업 복원(Database → Backups → Restore)을 쓴다. 스크립트 JSON 보다 이쪽이 정확하다 — 시퀀스·제약·트리거까지 함께 복원된다.

### Storage 파일 복원
백업 폴더 구조가 버킷 내부 경로와 그대로 일치하므로, Supabase 대시보드에서 업로드하거나 API 로 같은 경로에 올리면 된다. **DB 의 `thumbnail_url`·`proof_image_url` 이 경로를 참조하므로 경로가 바뀌면 링크가 깨진다.**

## 확인해야 할 것

- [ ] Supabase 대시보드에서 자동 백업이 실제로 돌고 있는지 (Database → Backups)
- [ ] PITR(Point-in-Time Recovery) 활성화 여부 — Pro 이상에서 별도 설정
- [ ] 백업 스크립트를 주기적으로 돌릴 방법 (수동 / 작업 스케줄러 / CI)
- [ ] 복원을 한 번이라도 실제로 해봤는지
