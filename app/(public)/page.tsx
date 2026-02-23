import { redirect } from 'next/navigation';

/**
 * 메인 페이지 — 현재 아리랑 랜딩페이지로 리다이렉트
 * 전체 완성 후 원래 랜딩 페이지로 복구 예정
 */
export default function HomePage() {
  redirect('/contests/contest-1/landing');
}
