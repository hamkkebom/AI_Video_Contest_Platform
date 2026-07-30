# archive — 역사적 스냅샷

이 폴더의 파일들은 **특정 시점의 기록**이며 더 이상 갱신하지 않는다. 현재 상태는 [docs/](../) 의 VISION / ROADMAP / FEATURES / DECISIONS 를 볼 것.

| 파일 | 시점 | 내용 |
|------|------|------|
| `MOCKUP_COMPLETION_SUMMARY.md` | 2026-02-17 | 목업 v3 완성 보고서 (42페이지, 11개 Task). 여기 적힌 "다음 단계" 로드맵은 [ROADMAP.md](../ROADMAP.md)로 승계·재정리됨 |
| `HISTORY.md` | 2026-02-17 | 목업 개발 당시 작업 일지. 이후 이력은 git 히스토리가 담당 |
| `sisyphus-evidence-f1-compliance-audit.md` | 2025-02-18 | 목업 리디자인 작업의 계획 준수 감사 기록 |
| `design-concepts.html` | 2026-02 | 색상 시안 3종 비교 페이지 (Color C 선택됨 — [DECISIONS.md](../DECISIONS.md) D-001) |
| `qa-visual-regression.js` | 2026-02 | 목업 시절 Playwright 시각 회귀 스크립트 (현행 빌드와 무관) |

## 삭제된 정식 기획 문서 25종 (2026-02-19 작성 → 2026-03-05 삭제)

사업/기획/디자인/기술/관리/테스트/운영 전 영역의 HTML 문서 체계가 존재했다. 삭제 경위는 [DECISIONS.md](../DECISIONS.md) D-004 참조. 원문이 필요하면 git 히스토리에서 복원할 수 있다:

```bash
# 목록 보기
git show dcfecf7 --stat

# 특정 문서 복원 (예: PRD)
git show "dcfecf7^:docs/02-planning/prd.html" > prd.html
```

주요 내용은 현행 문서로 승계됨: 생태계 구상·수익 모델 → [VISION.md](../VISION.md), 기능 정의 → [FEATURES.md](../FEATURES.md).
