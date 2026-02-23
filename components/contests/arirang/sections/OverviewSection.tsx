'use client';

import { Palette, Monitor, Clock, FileVideo, Globe, Wand2, Play, Check } from 'lucide-react';
import { useLang } from '@/components/contests/arirang/lang-context';
import { t, translations } from '@/components/contests/arirang/translations';

const cards = [
  { icon: Palette, titleKey: 'cardTopicTitle', descKey: 'cardTopicDesc' },
  { icon: Monitor, titleKey: 'cardFormatTitle', descKey: 'cardFormatDesc' },
  { icon: Clock, titleKey: 'cardLengthTitle', descKey: 'cardLengthDesc' },
  { icon: FileVideo, titleKey: 'cardFileTypeTitle', descKey: 'cardFileTypeDesc' },
  { icon: Globe, titleKey: 'cardEligibilityTitle', descKey: 'cardEligibilityDesc' },
];

const methodDetails = [
  'methodDetail1',
  'methodDetail2',
  'methodDetail3',
];

/** 공모 개요 섹션 */
export function OverviewSection() {
  const { lang } = useLang();
  const overviewTranslations = translations.overview;

  return (
    <section id="overview" className="relative py-24 md:py-32">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, var(--ar-primary-dark), rgba(27,20,100,0.2), var(--ar-primary-dark))' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="arirang-animate text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight mb-14">
          {t(overviewTranslations, 'title', lang)}
        </h2>

        {/* 카드 5개 */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {cards.map((card) => (
              <div
                key={card.titleKey}
                className="arirang-animate group p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                style={{ backgroundColor: 'rgba(13,11,26,0.6)', border: '1px solid rgba(245,240,232,0.08)' }}
              >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(212,168,67,0.1)', color: 'var(--ar-accent)' }}>
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base leading-tight" style={{ color: 'var(--ar-cream)' }}>
                  {t(overviewTranslations, card.titleKey, lang)}
                </h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,240,232,0.6)' }}>
                {t(overviewTranslations, card.descKey, lang)}
              </p>
            </div>
          ))}
        </div>

        {/* 제작 방식 전용 카드 */}
        <div className="arirang-animate p-8 md:p-10 mb-12 rounded-2xl" style={{ background: 'linear-gradient(to bottom right, rgba(212,168,67,0.1), var(--ar-primary-dark))', border: '1px solid rgba(212,168,67,0.2)' }}>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(212,168,67,0.2)', color: 'var(--ar-accent)' }}>
              <Wand2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl md:text-2xl" style={{ color: 'var(--ar-cream)' }}>
              {t(overviewTranslations, 'productionMethodTitle', lang)}
            </h3>
          </div>

          <p className="font-semibold text-lg md:text-xl mb-6" style={{ color: 'var(--ar-accent)' }}>
            {t(overviewTranslations, 'productionMethodHeadline', lang)}
          </p>

          <div className="space-y-3">
            {methodDetails.map((detail) => (
              <div key={detail} className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--ar-accent)' }} />
                <p className="text-base md:text-lg leading-relaxed" style={{ color: 'rgba(245,240,232,0.7)' }}>
                  {t(overviewTranslations, detail, lang)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full transition-colors cursor-pointer"
              style={{ border: '2px solid rgba(212,168,67,0.5)', color: 'var(--ar-accent)' }}
            >
              <Play className="w-5 h-5" />
              {t(overviewTranslations, 'watchSample', lang)}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
