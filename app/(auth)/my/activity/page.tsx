import { redirect } from 'next/navigation';

/** 임시 비활성화 — 내 활동 페이지 (URL 직접 접근 차단) */
export default function MyActivityPage() {
  redirect('/my/submissions');
}
