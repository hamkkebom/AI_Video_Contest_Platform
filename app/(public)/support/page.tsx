import { redirect } from 'next/navigation';

/**
 * 고객센터 기본 경로
 * FAQ 페이지로 리다이렉트 (고객센터가 FAQ/문의 개별 페이지로 분리됨)
 */
export default function SupportPage() {
  redirect('/support/faq');
}
