import { redirect } from 'next/navigation';

/** 임시 비활성화 — 내 분석 페이지 (URL 직접 접근 차단) */
export default function ParticipantAnalyticsPage() {
  redirect('/my/submissions');
}
