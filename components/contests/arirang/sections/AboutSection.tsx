'use client';

import { Music, Cpu, Sparkles } from 'lucide-react';
import { useLang } from '@/components/contests/arirang/lang-context';
import { t, translations } from '@/components/contests/arirang/translations';

const keywords = [
  { icon: Music, labelKey: 'keywordArirangLabel', descKey: 'keywordArirangDesc', color: 'var(--ar-point)' },
  { icon: Cpu, labelKey: 'keywordAiLabel', descKey: 'keywordAiDesc', color: 'var(--ar-accent)' },
  { icon: Sparkles, labelKey: 'keywordDreamLabel', descKey: 'keywordDreamDesc', color: 'var(--ar-pine-light)' },
];

/** 공모전 소개 섹션 */
export function AboutSection() {
  const { lang } = useLang();
  const aboutTranslations = translations.about;

  return (
    <section id="about" className="relative py-24 md:py-32" style={{ backgroundColor: 'var(--ar-primary-dark)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 타이틀 */}
        <h2 className="arirang-animate text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight mb-16">
          {t(aboutTranslations, 'title', lang)}
        </h2>

        {/* 키워드 + 설명 */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          {/* 키워드 카드 */}
          <div className="space-y-4 arirang-animate">
            {keywords.map((kw) => (
              <div
                key={kw.labelKey}
                className="flex items-center gap-4 p-5 rounded-2xl transition-colors"
                style={{ backgroundColor: 'rgba(27,20,100,0.3)', border: '1px solid rgba(245,240,232,0.05)' }}
              >
                <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--ar-primary-dark)', color: kw.color }}>
                  <kw.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: 'var(--ar-cream)' }}>{t(aboutTranslations, kw.labelKey, lang)}</h3>
                  <p className="text-sm" style={{ color: 'rgba(245,240,232,0.6)' }}>{t(aboutTranslations, kw.descKey, lang)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 메인 텍스트 */}
          <div className="arirang-animate">
            <p className="text-lg leading-relaxed mb-4" style={{ color: 'rgba(245,240,232,0.8)' }}>
              {t(aboutTranslations, 'paragraph1', lang)}
            </p>
            <p className="leading-relaxed mb-4" style={{ color: 'rgba(245,240,232,0.6)' }}>
              {t(aboutTranslations, 'paragraph2', lang)}
            </p>
            <p className="font-semibold text-lg" style={{ color: 'var(--ar-accent)' }}>
              {t(aboutTranslations, 'paragraph3', lang)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}