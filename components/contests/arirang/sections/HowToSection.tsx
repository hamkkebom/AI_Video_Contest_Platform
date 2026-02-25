'use client';

import { UserPlus, Upload } from 'lucide-react';
import { useLang } from '@/components/contests/arirang/lang-context';
import { t, translations } from '@/components/contests/arirang/translations';

const steps = [
  { icon: UserPlus, num: '01', titleKey: 'step1Title', descKey: 'step1Desc' },
  { icon: Upload, num: '02', titleKey: 'step2Title', descKey: 'step2Desc' },
];

/** 참여 방법 섹션 */
export function HowToSection() {
  const { lang } = useLang();
  const howToTranslations = translations.howTo;

  return (
    <section id="howto" className="relative py-24 md:py-32">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, var(--ar-primary-dark), rgba(27,20,100,0.15), var(--ar-primary-dark))' }} />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="arirang-animate text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight mb-16">
          {t(howToTranslations, 'title', lang)}
        </h2>

        <div className="grid md:grid-cols-2 gap-6 md:gap-4 lg:gap-6 mb-12">
          {steps.map((step) => (
            <div key={step.num} className="arirang-animate relative">
              <div className="p-8 rounded-2xl text-center h-full transition-colors" style={{ backgroundColor: 'rgba(13,11,26,0.6)', border: '1px solid rgba(245,240,232,0.08)' }}>
                <span className="text-5xl font-bold mb-2 block" style={{ color: 'rgba(212,168,67,0.2)' }}>
                  {step.num}
                </span>
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(212,168,67,0.1)', color: 'var(--ar-accent)' }}>
                  <step.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg mb-3" style={{ color: 'var(--ar-cream)' }}>{t(howToTranslations, step.titleKey, lang)}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,240,232,0.6)' }}>{t(howToTranslations, step.descKey, lang)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}