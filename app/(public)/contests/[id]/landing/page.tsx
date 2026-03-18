import type { Metadata } from 'next';
import { getContestById } from '@/lib/data';
import { safeJsonLd } from '@/lib/utils';
import ArirangLandingClient from './arirang-landing-client';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aikkumhub.com';

type ContestLandingPageProps = {
  params: Promise<{ id: string }>;
};

/** 랜딩 페이지 동적 메타데이터 — 아리랑/헐버트 키워드 강화 */
export async function generateMetadata({ params }: ContestLandingPageProps): Promise<Metadata> {
  const { id } = await params;
  const contest = await getContestById(id);

  /* 꿈꾸는 아리랑 공모전(id=3) 전용 메타데이터 */
  const isArirang = id === '3' || contest?.title?.includes('아리랑');

  const title = isArirang
    ? '꿈꾸는 아리랑 AI 영상 공모전 — 호머 헐버트 아리랑 채보 130주년 기념'
    : contest
      ? `${contest.title} — AI 영상 공모전`
      : 'AI 영상 공모전';

  const description = isArirang
    ? '헐버트 박사의 아리랑 채보 130주년을 기념하는 제1회 꿈꾸는 아리랑 AI 영상 공모전. 아리랑과 AI 기술이 만나 새로운 영상을 창작합니다. 총 상금 1,300만원, 지금 접수하세요.'
    : contest?.description?.slice(0, 155)
      ?? 'AI꿈에서 개최하는 AI 영상 공모전에 참가하세요.';

  const keywords = isArirang
    ? ['꿈꾸는 아리랑', '호머 헐버트', '헐버트', '아리랑 전시', '헐버트 전시', '아리랑 공모전', 'AI 영상 공모전', '아리랑 AI', '아리랑 영상', 'AI꿈', '아리랑 채보 130주년', 'Dreaming Arirang', 'Homer Hulbert']
    : [contest?.title ?? 'AI 영상 공모전', 'AI꿈', ...(contest?.tags ?? [])];

  const url = `${SITE_URL}/contests/${id}/landing`;
  const images = contest?.posterUrl
    ? [{ url: contest.posterUrl, width: 1200, height: 630, alt: contest.title }]
    : undefined;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      locale: 'ko_KR',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: contest?.posterUrl ? [contest.posterUrl] : undefined,
    },
  };
}

/**
 * 공모전 랜딩 페이지
 * - URL의 [id]를 기반으로 접수하기 등 CTA가 해당 공모전으로 연결됨
 */
export default async function ContestLandingPage({ params }: ContestLandingPageProps) {
  const { id } = await params;
  const contest = await getContestById(id);
  const isArirang = id === '3' || contest?.title?.includes('아리랑');

  /* JSON-LD 구조화 데이터 */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: isArirang ? '제1회 꿈꾸는 아리랑 AI 영상 공모전' : (contest?.title ?? 'AI 영상 공모전'),
    description: isArirang
      ? '헐버트 박사의 아리랑 채보 130주년 기념, 아리랑과 AI 기술로 새로운 영상을 창작하는 공모전'
      : contest?.description,
    startDate: contest?.submissionStartAt,
    endDate: contest?.submissionEndAt,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: {
      '@type': 'VirtualLocation',
      url: `${SITE_URL}/contests/${id}/landing`,
    },
    image: contest?.posterUrl || undefined,
    organizer: {
      '@type': 'Organization',
      name: 'AI꿈',
      url: SITE_URL,
    },
    url: `${SITE_URL}/contests/${id}/landing`,
    inLanguage: 'ko',
    ...(isArirang ? {
      about: [
        { '@type': 'Thing', name: '아리랑', description: '한국의 대표 민요' },
        { '@type': 'Person', name: '호머 헐버트', alternateName: 'Homer Hulbert', description: '아리랑을 최초로 서양 악보로 채보한 미국인 선교사' },
      ],
    } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <ArirangLandingClient />
    </>
  );
}