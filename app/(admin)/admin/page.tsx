import { redirect } from 'next/navigation';

/** /admin 진입 시 대시보드로 — 관리자 홈은 한 곳이다 (docs/IA.md §3.3) */
export default function AdminRootPage() {
  redirect('/admin/dashboard');
}
