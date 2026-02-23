'use client';

import { useState } from 'react';
import { Trophy, Award, Medal, Star, Check, Gift, ChevronDown, ExternalLink } from 'lucide-react';

/** 시상 내역 섹션 */
export function PrizesSection() {
  const [hulbertOpen, setHulbertOpen] = useState(false);

  const prizes = [
    {
      icon: Trophy,
      name: '아리랑상',
      rank: '대상',
      count: '1명',
      amount: '300만 원',
      iconColor: '#FBBF24', // amber-400
      featured: true,
    },
    {
      icon: Award,
      name: '메아리상',
      rank: '최우수상',
      count: '2명',
      amount: '각 150만 원',
      iconColor: '#D1D5DB', // gray-300
    },
    {
      icon: Medal,
      name: '울림상',
      rank: '우수상',
      count: '10명',
      amount: '각 40만 원',
      iconColor: '#D97706', // amber-600
    },
    {
      icon: Star,
      name: '꿈꿈상',
      rank: '장려상',
      count: '30명',
      amount: '각 10만 원',
      iconColor: '#60A5FA', // blue-400
    },
  ];

  const bonuses = [
    { key: 'bonus1', text: '공모전 공식포스터 SNS 업로드 후 인증 (1점)' },
    { key: 'bonus2', text: '헐버트박사 기념사업회 링크 SNS 업로드 후 인증 (1점)' },
    { key: 'bonus3', text: '헐버트 아리랑 전시회 참여 인증샷 SNS 업로드 후 인증 (1점)' },
  ];

  const hashtagList = ['#아리랑', '#광화문', '#꿈꾸는아리랑', '#헐버트', '#아리랑챌린지', '#함께봄', '#AI공모전'];

  return (
    <section id="prizes" className="relative py-24 md:py-32" style={{ backgroundColor: 'var(--ar-primary-dark)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="arirang-animate text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight mb-4"
          style={{ color: 'var(--ar-cream)' }}
        >
          시상 내역
        </h2>

        {/* 총 상금 배너 */}
        <div className="arirang-animate text-center mb-14">
          <p className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: 'var(--ar-accent)' }}>
            총 상금 1,300만 원
          </p>
        </div>

        {/* 상 카드 — 1등 대형 + 나머지 3개 */}
        <div className="space-y-6 mb-16">
          {/* 대상 (1등) */}
          <div className="arirang-animate">
            <div
              className="p-8 md:p-10 rounded-3xl text-center"
              style={{
                background: 'linear-gradient(to bottom right, rgba(245,158,11,0.2), rgba(180,83,9,0.1))',
                border: '1px solid rgba(245,158,11,0.3)',
              }}
            >
              <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: '#FBBF24' }} />
              <p className="text-sm mb-1" style={{ color: 'rgba(245,240,232,0.6)' }}>
                {prizes[0].rank}
              </p>
              <h3 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--ar-cream)' }}>
                {prizes[0].name}
              </h3>
              <p className="mb-3" style={{ color: 'rgba(245,240,232,0.6)' }}>
                {prizes[0].count}
              </p>
              <p className="text-4xl font-bold" style={{ color: 'var(--ar-accent)' }}>
                {prizes[0].amount}
              </p>
            </div>
          </div>

          {/* 2~4등 */}
          <div className="grid sm:grid-cols-3 gap-4">
            {prizes.slice(1).map((prize) => (
              <div
                key={prize.name}
                className="arirang-animate p-6 rounded-2xl text-center"
                style={{
                  background:
                    prize.name === '메아리상'
                      ? 'linear-gradient(to bottom right, rgba(209,213,219,0.15), rgba(107,114,128,0.1))'
                      : prize.name === '울림상'
                        ? 'linear-gradient(to bottom right, rgba(180,83,9,0.15), rgba(120,53,15,0.1))'
                        : 'linear-gradient(to bottom right, rgba(59,130,246,0.1), rgba(29,78,216,0.1))',
                  border:
                    prize.name === '메아리상'
                      ? '1px solid rgba(156,163,175,0.25)'
                      : prize.name === '울림상'
                        ? '1px solid rgba(180,83,9,0.25)'
                        : '1px solid rgba(59,130,246,0.2)',
                }}
              >
                <prize.icon className="w-10 h-10 mx-auto mb-3" style={{ color: prize.iconColor }} />
                <p className="text-xs mb-1" style={{ color: 'rgba(245,240,232,0.5)' }}>
                  {prize.rank}
                </p>
                <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--ar-cream)' }}>
                  {prize.name}
                </h3>
                <p className="text-sm mb-2" style={{ color: 'rgba(245,240,232,0.5)' }}>
                  {prize.count}
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--ar-accent)' }}>
                  {prize.amount}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 수상자 혜택 섹션 */}
        <div className="arirang-animate max-w-6xl mx-auto mb-20">
          <h3
            className="font-bold text-2xl md:text-3xl text-center mb-8"
            style={{ color: 'var(--ar-cream)' }}
          >
            수상자 혜택
          </h3>
          <div className="grid sm:grid-cols-2 gap-5">
            {['함께봄 전속 프리랜서 계약 가능', 'AI 콘텐츠 활용 및 마케팅 관련 창업 네트워크'].map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-4 p-7 md:p-8 rounded-2xl transition-colors"
                style={{
                  background: 'linear-gradient(to bottom right, rgba(212,168,67,0.1), rgba(27,20,100,0.3))',
                  border: '1px solid rgba(212,168,67,0.2)',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,67,0.4)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,67,0.2)'; }}
              >
                <div
                  className="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(212,168,67,0.15)' }}
                >
                  <Gift className="w-6 h-6" style={{ color: 'var(--ar-accent)' }} />
                </div>
                <p className="text-lg md:text-xl font-semibold leading-relaxed" style={{ color: 'var(--ar-cream)' }}>
                  {benefit}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 심사 기준 */}
        <div className="arirang-animate max-w-6xl mx-auto mb-20">
          <h3
            className="font-bold text-2xl md:text-3xl text-center mb-8"
            style={{ color: 'var(--ar-cream)' }}
          >
            심사 기준
          </h3>
          <div className="flex items-center gap-1 h-11 rounded-full overflow-hidden">
            <div
              className="h-full flex items-center justify-center text-sm font-bold"
              style={{ width: '80%', backgroundColor: 'var(--ar-accent)', color: 'var(--ar-primary-dark)' }}
            >
              80%
            </div>
            <div
              className="h-full flex items-center justify-center text-sm font-bold"
              style={{ width: '17%', backgroundColor: 'var(--ar-pine-light)', color: 'var(--ar-primary-dark)' }}
            >
              17%
            </div>
            <div
              className="h-full flex items-center justify-center text-xs font-bold"
              style={{ width: '3%', backgroundColor: 'var(--ar-point)', color: 'var(--ar-primary-dark)' }}
            >
              3%
            </div>
          </div>
          {/* 바 하단 라벨 */}
          <div className="flex mt-2 text-sm" style={{ color: 'rgba(245,240,232,0.5)' }}>
            <span className="text-center" style={{ width: '80%' }}>심사위원 평가</span>
            <span className="text-center" style={{ width: '17%' }}>온라인 투표</span>
            <span className="text-center whitespace-nowrap" style={{ width: '3%' }}>가산점</span>
          </div>
        </div>

        {/* 가산점 */}
        <div className="arirang-animate max-w-6xl mx-auto">
          <h3
            className="font-bold text-2xl md:text-3xl text-center mb-3"
            style={{ color: 'var(--ar-cream)' }}
          >
            가산점 항목
          </h3>
          <p className="text-center text-base mb-8" style={{ color: 'rgba(245,240,232,0.6)' }}>
            항목당 1회만 인정 (최대 3점)
          </p>

          {/* 가산점 항목 */}
          <div className="space-y-3 mb-8">
            {bonuses.map((bonus) => (
              <div
                key={bonus.key}
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: 'rgba(27,20,100,0.3)', border: '1px solid rgba(245,240,232,0.05)' }}
              >
                {/* bonus2: 헐버트 박사 드롭다운 */}
                {bonus.key === 'bonus2' ? (
                  <>
                    <div
                      className="flex items-center gap-3 p-5 transition-colors"
                      style={{ cursor: 'default' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(27,20,100,0.2)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                    >
                      <Check className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--ar-pine-light)' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-base md:text-lg" style={{ color: 'rgba(245,240,232,0.7)' }}>
                          {bonus.text}
                        </p>
                        <a
                          href="http://hulbert.or.kr/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm mt-1 transition-colors"
                          style={{ color: 'var(--ar-accent)' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--ar-accent-light)'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--ar-accent)'; }}
                        >
                          hulbert.or.kr
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHulbertOpen((prev) => !prev)}
                        className="p-1.5 cursor-pointer"
                        aria-label="헐버트 박사 소개 펼치기"
                      >
                        <ChevronDown
                          className={`w-5 h-5 transition-transform duration-300 ${hulbertOpen ? 'rotate-180' : ''}`}
                          style={{ color: 'rgba(245,240,232,0.4)' }}
                        />
                      </button>
                    </div>
                    <div
                      className={`transition-all duration-300 overflow-hidden ${hulbertOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <div className="px-5 pb-5">
                        <div
                          className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-xl"
                          style={{
                            backgroundColor: 'rgba(13,11,26,0.6)',
                            border: '1px solid rgba(212,168,67,0.15)',
                          }}
                        >
                          <img
                            src="/contests/arirang/hulbert.jpg"
                            alt="호머 헐버트"
                            className="w-24 h-24 rounded-full object-cover object-[center_15%] flex-shrink-0"
                            style={{ border: '2px solid rgba(212,168,67,0.3)' }}
                          />
                          <div className="text-center sm:text-left">
                            <p className="text-sm mb-0.5" style={{ color: 'rgba(245,240,232,0.5)' }}>
                              한국을 사랑한 푸른눈의 조선인
                            </p>
                            <h4 className="text-xl font-bold mb-2" style={{ color: 'var(--ar-accent)' }}>
                              호머 헐버트
                            </h4>
                            <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(245,240,232,0.6)' }}>
                              1886년, 23살 미국 청년이 조선을 만났습니다. 최초의 한글 교과서 &lsquo;사민필지&rsquo;를 저술하고, 고종 황제의 밀사로 헤이그 만국평화회의에 파견되는 등 평생을 한국의 독립과 발전에 헌신했습니다.
                            </p>
                            <a
                              href="http://hulbert.or.kr/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 transition-colors text-sm font-semibold"
                              style={{ color: 'var(--ar-accent)' }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--ar-accent-light)'; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--ar-accent)'; }}
                            >
                              헐버트 박사 더 알아보기
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-start gap-3 p-5">
                    <Check className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: 'var(--ar-pine-light)' }} />
                    <div className="flex-1">
                      <p className="text-base md:text-lg" style={{ color: 'rgba(245,240,232,0.7)' }}>
                        {bonus.text}
                      </p>
                      {/* bonus3에 전시 정보 추가 */}
                      {bonus.key === 'bonus3' && (
                        <div className="mt-2 text-sm space-y-1" style={{ color: 'rgba(245,240,232,0.5)' }}>
                          <p>전시일정: 3월 12일(목) ~ 3월 24일(화)</p>
                          <p>전시장소: 함께봄 본사 (서울 종로구 효자로 7길 10, 광화문광장 도보 10분거리)</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 필수 해시태그 */}
          <div
            className="mb-6 p-5 rounded-xl"
            style={{ backgroundColor: 'rgba(27,20,100,0.3)', border: '1px solid rgba(245,240,232,0.05)' }}
          >
            <p className="text-base font-semibold mb-3" style={{ color: 'rgba(245,240,232,0.7)' }}>
              필수 해시태그
            </p>
            <div className="flex flex-wrap gap-2">
              {hashtagList.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-5 py-2 rounded-full text-base font-semibold"
                  style={{
                    backgroundColor: 'rgba(194,59,34,0.15)',
                    color: 'var(--ar-cream)',
                    border: '1px solid rgba(194,59,34,0.4)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 인증방법 */}
          <div
            className="mb-6 p-5 rounded-xl"
            style={{ backgroundColor: 'rgba(27,20,100,0.3)', border: '1px solid rgba(245,240,232,0.05)' }}
          >
            <p className="text-base" style={{ color: 'rgba(245,240,232,0.7)' }}>
              인증방법: 공모전 마이페이지 → 가산점 등록 → SNS 게시글 캡처본 업로드
            </p>
          </div>

          {/* 주의사항 */}
          <div
            className="p-5 rounded-xl"
            style={{ backgroundColor: 'rgba(194,59,34,0.1)', border: '1px solid rgba(194,59,34,0.3)' }}
          >
            <p className="text-base" style={{ color: 'rgba(245,240,232,0.7)' }}>
              본 공모전은 SNS 소통을 기반으로 합니다. 활발한 홍보와 정확한 심사를 위해 발표일까지 게시물을 &apos;공개&apos; 상태로 유지해 주세요.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
