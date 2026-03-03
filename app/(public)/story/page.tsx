import { getArticles } from '@/lib/data';
import { StoryContent } from './story-content';

/**
 * 스토리 페이지 — 서버 컴포넌트
 * getArticles()로 서버에서 데이터를 가져와 클라이언트 컴포넌트에 전달
 */
export default async function NewsPage() {
  const articles = await getArticles();

  return <StoryContent articles={articles} />;
}
