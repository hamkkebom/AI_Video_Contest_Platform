import type { Metadata } from 'next';
import { getArticles } from '@/lib/data';
import { StoryContent } from './story-content';

export const metadata: Metadata = {
  title: '스토리 — AI꿈 소식과 인사이트',
  description: 'AI꿈의 최신 소식, 공모전 프로그램 안내, AI 영상 제작 인사이트를 확인하세요.',
  keywords: ['AI꿈 스토리', 'AI 영상 소식', '공모전 소식', 'AI 인사이트'],
  alternates: { canonical: '/story' },
  openGraph: {
    title: '스토리 — AI꿈 소식과 인사이트',
    description: 'AI꿈의 최신 소식, 공모전 프로그램 안내, AI 영상 제작 인사이트를 확인하세요.',
    url: '/story',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '스토리 — AI꿈 소식과 인사이트',
    description: 'AI꿈의 최신 소식, 공모전 프로그램 안내, AI 영상 제작 인사이트를 확인하세요.',
  },
};

/**
 * 스토리 페이지 — 서버 컴포넌트
 * getArticles()로 서버에서 데이터를 가져와 클라이언트 컴포넌트에 전달
 */
export default async function NewsPage() {
  const articles = await getArticles();

  return <StoryContent articles={articles} />;
}
