import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import type { Contest } from '@/lib/types';
import { getContestById } from '@/lib/data';
import { safeJsonLd } from '@/lib/utils';
import ArirangLandingClient from './arirang-landing-client';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aikkumhub.com';

/**
 * 아리랑 마이크로사이트는 이 공모전 **하나를 위해** 만든 것이다.
 * 헐버트·채보 130주년·전용 카피가 하드코딩돼 있어 다른 공모전에 렌더하면 남의 이야기가 나온다.
 * 제1회 아리랑은 id=3 이지만, 복제 등으로 id 가 달라질 수 있어 제목도 함께 본다.
 */
const ARIRANG_CONTEST_ID = '3';
function isArirangContest(id: string, contest: Contest | null): boolean {
  return id === ARIRANG_CONTEST_ID || Boolean(contest?.title?.includes('아리랑'));
}

type ContestLandingPageProps = {
  params: Promise<{ id: string }>;
};

/** 랜딩 페이지 동적 메타데이터 — 아리랑/헐버트 키워드 강화 */
export async function generateMetadata({ params }: ContestLandingPageProps): Promise<Metadata> {
  const { id } = await params;
  const contest = await getContestById(id);

  const isArirang = isArirangContest(id, contest);

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
    /* 랜딩은 상세와 같은 공모전을 다루는 보조 진입점이다.
       각자 자기 URL 을 canonical 로 주장하면 같은 내용이 두 페이지로 색인된다.
       정본은 상세(/contests/[id])이고 랜딩은 그쪽을 가리킨다 */
    alternates: { canonical: `${SITE_URL}/contests/${id}` },
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
 * 공모전 랜딩 페이지.
 *
 * 이 라우트는 **아리랑 전용 마이크로사이트 하나만** 서빙한다. 예전에는 id 와 무관하게
 * `<ArirangLandingClient />` 를 렌더해서, 제2회를 열면 그 공모전 URL 에서 헐버트와
 * 채보 130주년 이야기가 나오게 돼 있었다. 그래서 아리랑이 아닌 공모전은 상세로 보낸다 —
 * canonical 이 이미 상세를 가리키고 있으므로(D-013) 방향이 같다.
 */
export default async function ContestLandingPage({ params }: ContestLandingPageProps) {
  const { id } = await params;
  const contest = await getContestById(id);

  /* 없는 공모전은 404 — 랜딩만 200 을 주면 없는 공모전이 있는 척한다 */
  if (!contest) notFound();
  /* 준비 중(draft)은 상세와 같은 기준으로 감춘다 (D-013) */
  if (contest.status === 'draft') notFound();

  const isArirang = isArirangContest(id, contest);
  if (!isArirang) redirect(`/contests/${id}`);

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