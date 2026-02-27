'use client';

import { useState } from 'react';
import { Trophy, Award, Medal, Star, Check, Gift, ChevronDown, ExternalLink } from 'lucide-react';
import { useLang } from '@/components/contests/arirang/lang-context';
import { t, translations } from '@/components/contests/arirang/translations';

/** 시상 내역 섹션 */
export function PrizesSection() {
  const [hulbertOpen, setHulbertOpen] = useState(false);
  const { lang } = useLang();
  const prizesTranslations = translations.prizes;

  const prizes = [
    {
      id: 'arirang',
      icon: Trophy,
      nameKey: 'arirangAwardName',
      rankKey: 'arirangAwardRank',
      countKey: 'arirangAwardCount',
      amountKey: 'arirangAwardAmount',
      iconColor: '#FBBF24',
      featured: true,
    },
    {
      id: 'echo',
      icon: Award,
      nameKey: 'echoAwardName',
      rankKey: 'echoAwardRank',
      countKey: 'echoAwardCount',
      amountKey: 'echoAwardAmount',
      iconColor: '#D1D5DB',
    },
    {
      id: 'resonance',
      icon: Medal,
      nameKey: 'resonanceAwardName',
      rankKey: 'resonanceAwardRank',
      countKey: 'resonanceAwardCount',
      amountKey: 'resonanceAwardAmount',
      iconColor: '#D97706',
    },
    {
      id: 'dream',
      icon: Star,
      nameKey: 'dreamAwardName',
      rankKey: 'dreamAwardRank',
      countKey: 'dreamAwardCount',
      amountKey: 'dreamAwardAmount',
      iconColor: '#60A5FA',
    },
  ];

  const bonuses = [
    { key: 'bonus1' },
    { key: 'bonus2' },
    { key: 'bonus3' },
  ];

  const hashtagList = [
    'hashtagArirang',
    'hashtagGwanghwamun',
    'hashtagDreamingArirang',
    'hashtagHulbert',
    'hashtagArirangChallenge',
    'hashtagHamkkebom',
    'hashtagAiContest',
  ];

  return (
    <section id="prizes" className="relative py-24 md:py-32" style={{ backgroundColor: 'var(--ar-primary-dark)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="arirang-animate text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight mb-4"
          style={{ color: 'var(--ar-cream)' }}
        >
          {t(prizesTranslations, 'title', lang)}
        </h2>

        {/* 총 상금 배너 */}
        <div className="arirang-animate text-center mb-14">
          <p className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" style={{ color: 'var(--ar-accent)' }}>
            {t(prizesTranslations, 'totalPrize', lang)}
          </p>
        </div>

        {/* 상 카드 — 1등 대형 + 나머지 3개 */}
        <div className="space-y-6">
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
                {t(prizesTranslations, prizes[0].rankKey, lang)}
              </p>
              <h3 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--ar-cream)' }}>
                {t(prizesTranslations, prizes[0].nameKey, lang)}
              </h3>
              <p className="mb-3" style={{ color: 'rgba(245,240,232,0.6)' }}>
                {t(prizesTranslations, prizes[0].countKey, lang)}
              </p>
              <p className="text-4xl font-bold" style={{ color: 'var(--ar-accent)' }}>
                {t(prizesTranslations, prizes[0].amountKey, lang)}
              </p>
            </div>
          </div>

          {/* 2~4등 */}
          <div className="grid sm:grid-cols-3 gap-4">
            {prizes.slice(1).map((prize) => (
              <div
                key={prize.id}
                className="arirang-animate p-6 rounded-2xl text-center"
                style={{
                  background:
                    prize.id === 'echo'
                      ? 'linear-gradient(to bottom right, rgba(209,213,219,0.15), rgba(107,114,128,0.1))'
                      : prize.id === 'resonance'
                        ? 'linear-gradient(to bottom right, rgba(180,83,9,0.15), rgba(120,53,15,0.1))'
                        : 'linear-gradient(to bottom right, rgba(59,130,246,0.1), rgba(29,78,216,0.1))',
                  border:
                    prize.id === 'echo'
                      ? '1px solid rgba(156,163,175,0.25)'
                      : prize.id === 'resonance'
                        ? '1px solid rgba(180,83,9,0.25)'
                        : '1px solid rgba(59,130,246,0.2)',
                }}
              >
                <prize.icon className="w-10 h-10 mx-auto mb-3" style={{ color: prize.iconColor }} />
                <p className="text-xs mb-1" style={{ color: 'rgba(245,240,232,0.5)' }}>
                  {t(prizesTranslations, prize.rankKey, lang)}
                </p>
                <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--ar-cream)' }}>
                  {t(prizesTranslations, prize.nameKey, lang)}
                </h3>
                <p className="text-sm mb-2" style={{ color: 'rgba(245,240,232,0.5)' }}>
                  {t(prizesTranslations, prize.countKey, lang)}
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--ar-accent)' }}>
                  {t(prizesTranslations, prize.amountKey, lang)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 심사 결과 안내 */}
        <p className="arirang-animate text-center text-sm mt-4 mb-16" style={{ color: 'rgba(245,240,232,0.5)' }}>
          {t(prizesTranslations, 'prizeDisclaimer', lang)}
        </p>

        {/* 수상자 혜택 섹션 */}
        <div className="arirang-animate max-w-6xl mx-auto mb-20">
          <h3
            className="font-bold text-2xl md:text-3xl text-center mb-8"
            style={{ color: 'var(--ar-cream)' }}
          >
            {t(prizesTranslations, 'benefitsTitle', lang)}
          </h3>
          <div className="grid sm:grid-cols-2 gap-5">
            {['benefit1', 'benefit2'].map((benefitKey) => (
              <div
                key={benefitKey}
                className="flex items-center gap-4 p-7 md:p-8 rounded-2xl transition-colors"
                style={{
                  background: 'linear-gradient(to bottom right, rgba(212,168,67,0.1), rgba(27,20,100,0.3))',
                  border: '1px solid rgba(212,168,67,0.2)',
                }}
              >
                <div
                  className="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(212,168,67,0.15)' }}
                >
                  <Gift className="w-6 h-6" style={{ color: 'var(--ar-accent)' }} />
                </div>
                <p className="text-lg md:text-xl font-semibold leading-relaxed" style={{ color: 'var(--ar-cream)' }}>
                  {t(prizesTranslations, benefitKey, lang)}
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
            {t(prizesTranslations, 'criteriaTitle', lang)}
          </h3>
          <div className="flex items-center gap-1 h-11 rounded-full overflow-hidden">
            {/* 80% 세그먼트 */}
            <div
              className="h-full flex items-center justify-center text-sm font-bold"
              style={{ flex: '80', minWidth: '3rem', backgroundColor: 'var(--ar-accent)', color: 'var(--ar-primary-dark)' }}
            >
              80%
            </div>
            {/* 17% 세그먼트 */}
            <div
              className="h-full flex items-center justify-center text-sm font-bold"
              style={{ flex: '17', minWidth: '3rem', backgroundColor: 'var(--ar-pine-light)', color: 'var(--ar-primary-dark)' }}
            >
              17%
            </div>
            {/* 3% 세그먼트 - 모바일에서 텍스트가 보이도록 minWidth 설정 */}
            <div
              className="h-full flex items-center justify-center text-xs font-bold"
              style={{ flex: '3', minWidth: '2.5rem', backgroundColor: 'var(--ar-point)', color: 'var(--ar-primary-dark)' }}
            >
              3%
            </div>
          </div>
          {/* 바 하단 라벨 */}
          <div className="flex mt-2 text-sm" style={{ color: 'rgba(245,240,232,0.5)' }}>
            <span className="text-center" style={{ flex: '80', minWidth: '3rem' }}>{t(prizesTranslations, 'criteriaJudge', lang)}</span>
            <span className="text-center" style={{ flex: '17', minWidth: '3rem' }}>{t(prizesTranslations, 'criteriaVote', lang)}</span>
            <span className="text-center" style={{ flex: '3', minWidth: '2.5rem' }}>{t(prizesTranslations, 'criteriaBonus', lang)}</span>
          </div>
        </div>

        {/* 가산점 */}
        <div className="arirang-animate max-w-6xl mx-auto">
          <h3
            className="font-bold text-2xl md:text-3xl text-center mb-3"
            style={{ color: 'var(--ar-cream)' }}
          >
            {t(prizesTranslations, 'bonusesTitle', lang)}
          </h3>
          <p className="text-center text-base mb-8" style={{ color: 'rgba(245,240,232,0.6)' }}>
            {t(prizesTranslations, 'bonusesNote', lang)}
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
                    >
                      <Check className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--ar-pine-light)' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-base md:text-lg" style={{ color: 'rgba(245,240,232,0.7)' }}>
                          {t(prizesTranslations, bonus.key, lang)}
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
                        aria-label={t(prizesTranslations, 'hulbertToggleLabel', lang)}
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
                            alt={t(prizesTranslations, 'hulbertAlt', lang)}
                            className="w-24 h-24 rounded-full object-cover object-[center_15%] flex-shrink-0"
                            style={{ border: '2px solid rgba(212,168,67,0.3)' }}
                          />
                          <div className="text-center sm:text-left">
                            <p className="text-sm mb-0.5" style={{ color: 'rgba(245,240,232,0.5)' }}>
                              {t(prizesTranslations, 'hulbertTagline', lang)}
                            </p>
                            <h4 className="text-xl font-bold mb-2" style={{ color: 'var(--ar-accent)' }}>
                              {t(prizesTranslations, 'hulbertName', lang)}
                            </h4>
                            <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(245,240,232,0.6)' }}>
                              {t(prizesTranslations, 'hulbertDesc', lang)}
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
                              {t(prizesTranslations, 'hulbertMore', lang)}
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
                        {t(prizesTranslations, bonus.key, lang)}
                      </p>
                      {/* bonus3에 전시 정보 추가 */}
                      {bonus.key === 'bonus3' && (
                        <div className="mt-2 text-sm space-y-1" style={{ color: 'rgba(245,240,232,0.5)' }}>
                          <p>{t(prizesTranslations, 'exhibitionDate', lang)}</p>
                          <p>{t(prizesTranslations, 'exhibitionPlace', lang)}</p>
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
              {t(prizesTranslations, 'hashtagsTitle', lang)}
            </p>
            <div className="flex flex-wrap gap-2">
              {hashtagList.map((tagKey) => (
                <span
                  key={tagKey}
                  className="inline-block px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-sm sm:text-base font-semibold"
                  style={{
                    backgroundColor: 'rgba(194,59,34,0.15)',
                    color: 'var(--ar-cream)',
                    border: '1px solid rgba(194,59,34,0.4)',
                  }}
                >
                  {t(prizesTranslations, tagKey, lang)}
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
              {t(prizesTranslations, 'verifyMethod', lang)}
            </p>
          </div>

          {/* 주의사항 */}
          <div
            className="p-5 rounded-xl"
            style={{ backgroundColor: 'rgba(194,59,34,0.1)', border: '1px solid rgba(194,59,34,0.3)' }}
          >
            <p className="text-base" style={{ color: 'rgba(245,240,232,0.7)' }}>
              {t(prizesTranslations, 'caution', lang)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}