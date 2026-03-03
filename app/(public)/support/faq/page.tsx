import { getFaqs } from '@/lib/data';
import { FaqContent } from './faq-content';

/**
 * FAQ 페이지 — 서버 컴포넌트
 * getFaqs()로 서버에서 데이터를 가져와 클라이언트 컴포넌트에 전달
 */
export default async function FaqPage() {
  const faqs = await getFaqs();

  return <FaqContent faqs={faqs} />;
}
