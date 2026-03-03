import { redirect } from 'next/navigation';

/** 임시 비활성화 — 기기 관리 페이지 (URL 직접 접근 차단) */
export default function MyDevicesPage() {
  redirect('/my/submissions');
}
