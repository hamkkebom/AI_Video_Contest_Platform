'use client';

import { Calendar, Trophy } from 'lucide-react';
import { useLang } from '@/components/contests/arirang/lang-context';
import { t, translations } from '@/components/contests/arirang/translations';

const events = [
  { icon: Calendar, titleKey: 'eventApplyTitle', dateKey: 'eventApplyDate', color: 'var(--ar-accent)', active: true },
  { icon: Trophy, titleKey: 'eventAwardTitle', dateKey: 'eventAwardDate', extraKey: 'eventAwardExtra', color: 'var(--ar-point)', active: false },
];

/** 상세 일정 섹션 */
export function ScheduleSection() {
  const { lang } = useLang();
  const scheduleTranslations = translations.schedule;

  return (
    <section id="schedule" className="relative py-24 md:py-32" style={{ backgroundColor: 'var(--ar-primary-dark)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="arirang-animate text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight mb-16">
          {t(scheduleTranslations, 'title', lang)}
        </h2>

        <div className="relative">
          {/* 연결선 (데스크톱) */}
          <div className="hidden md:block absolute top-12 left-[25%] right-[25%] h-0.5" style={{ backgroundColor: 'rgba(245,240,232,0.1)' }} />

          <div className="grid md:grid-cols-2 gap-8 md:gap-4">
            {events.map((event) => (
              <div key={event.titleKey} className="arirang-animate relative flex flex-col items-center text-center">
                {/* 아이콘 원 */}
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                  style={event.active
                    ? { backgroundColor: event.color, boxShadow: '0 8px 20px rgba(212,168,67,0.3)' }
                    : { backgroundColor: 'var(--ar-primary)', border: '2px solid rgba(245,240,232,0.2)' }
                  }
                >
                  <event.icon className="w-10 h-10" style={{ color: event.active ? 'var(--ar-primary-dark)' : 'rgba(245,240,232,0.6)' }} />
                </div>

                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--ar-cream)' }}>{t(scheduleTranslations, event.titleKey, lang)}</h3>
                <p className="text-sm font-medium mb-2" style={{ color: event.active ? 'var(--ar-accent)' : 'rgba(245,240,232,0.6)' }}>
                  {t(scheduleTranslations, event.dateKey, lang)}
                </p>
                {event.extraKey && (
                  <p className="text-xs" style={{ color: 'rgba(245,240,232,0.5)' }}>{t(scheduleTranslations, event.extraKey, lang)}</p>
                )}
                {event.active && (
                  <span className="mt-3 px-3 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: 'rgba(212,168,67,0.2)', color: 'var(--ar-accent)' }}>
                    {t(scheduleTranslations, 'nowOpen', lang)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
