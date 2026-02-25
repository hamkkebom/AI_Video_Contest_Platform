'use client';

import { useState } from 'react';
import {
  ChevronDown,
  Shield,
  FileCheck,
  Cpu,
  Scale,
  Users,
  ShoppingBag,
  AlertTriangle,
  Megaphone,
  ThumbsUp,
  Lock,
  Banknote,
} from 'lucide-react';
import { useLang } from '@/components/contests/arirang/lang-context';
import { t, translations } from '@/components/contests/arirang/translations';

/** 유의사항 섹션 항목 타입 (번역 키 기반) */
interface NoteSection {
  key: string;
  titleKey: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  bulletKeys: string[];
}

/** 유의사항 11개 섹션 데이터 (번역 키 참조) */
const noteSections: NoteSection[] = [
  {
    key: 'requirements',
    titleKey: 'requirementsTitle',
    icon: FileCheck,
    bulletKeys: ['requirementsBullet1', 'requirementsBullet2', 'requirementsBullet3', 'requirementsBullet4', 'requirementsBullet5'],
  },
  {
    key: 'copyright',
    titleKey: 'copyrightTitle',
    icon: Shield,
    bulletKeys: ['copyrightBullet1', 'copyrightBullet2'],
  },
  {
    key: 'usage',
    titleKey: 'usageTitle',
    icon: Megaphone,
    bulletKeys: ['usageBullet1', 'usageBullet2', 'usageBullet3', 'usageBullet4', 'usageBullet5', 'usageBullet6', 'usageBullet7'],
  },
  {
    key: 'winnerRights',
    titleKey: 'winnerRightsTitle',
    icon: ShoppingBag,
    bulletKeys: ['winnerRightsBullet1', 'winnerRightsBullet2', 'winnerRightsBullet3', 'winnerRightsBullet4', 'winnerRightsBullet5', 'winnerRightsBullet6'],
  },
  {
    key: 'judging',
    titleKey: 'judgingTitle',
    icon: ThumbsUp,
    bulletKeys: ['judgingBullet1', 'judgingBullet2', 'judgingBullet3'],
  },
  {
    key: 'aiResponsibility',
    titleKey: 'aiResponsibilityTitle',
    icon: Cpu,
    bulletKeys: ['aiResponsibilityBullet1', 'aiResponsibilityBullet2', 'aiResponsibilityBullet3'],
  },
  {
    key: 'thirdParty',
    titleKey: 'thirdPartyTitle',
    icon: Scale,
    bulletKeys: ['thirdPartyBullet1', 'thirdPartyBullet2'],
  },
  {
    key: 'participation',
    titleKey: 'participationTitle',
    icon: Users,
    bulletKeys: ['participationBullet1', 'participationBullet2', 'participationBullet3'],
  },
  {
    key: 'disqualification',
    titleKey: 'disqualificationTitle',
    icon: AlertTriangle,
    bulletKeys: ['disqualificationBullet1', 'disqualificationBullet2', 'disqualificationBullet3', 'disqualificationBullet4', 'disqualificationBullet5', 'disqualificationBullet6', 'disqualificationBullet7', 'disqualificationBullet8'],
  },
  {
    key: 'privacy',
    titleKey: 'privacyTitle',
    icon: Lock,
    bulletKeys: ['privacyBullet1', 'privacyBullet2', 'privacyBullet3', 'privacyBullet4', 'privacyBullet5'],
  },
  {
    key: 'prize',
    titleKey: 'prizeTitle',
    icon: Banknote,
    bulletKeys: ['prizeBullet1', 'prizeBullet2', 'prizeBullet3', 'prizeBullet4'],
  },
];

/** 유의사항 및 저작권 안내 섹션 */
export function NotesSection() {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const { lang } = useLang();
  const notesTranslations = translations.notes;

  const toggleItem = (key: string) => {
    setOpenItems((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  return (
    <section id="notes" className="relative py-24 md:py-32" style={{ backgroundColor: 'var(--ar-primary-dark)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="arirang-animate text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight mb-12"
          style={{ color: 'var(--ar-cream)' }}
        >
          {t(notesTranslations, 'title', lang)}
        </h2>

        <div className="arirang-animate space-y-3">
          {noteSections.map((section) => {
            const isOpen = openItems.includes(section.key);
            return (
              <div
                key={section.key}
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid rgba(245,240,232,0.08)' }}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(section.key)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors cursor-pointer"
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(27,20,100,0.2)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                >
                  <section.icon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--ar-accent)' }} />
                  <span className="flex-1 font-medium" style={{ color: 'var(--ar-cream)' }}>
                    {t(notesTranslations, section.titleKey, lang)}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'rgba(245,240,232,0.4)' }}
                  />
                </button>

                <div
                  className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-5 pb-4 pl-13">
                    <ul className="space-y-1.5">
                      {section.bulletKeys.map((bulletKey, idx) => (
                        <li
                          key={`${section.key}-${idx}`}
                          className="text-sm leading-relaxed flex items-start gap-2"
                          style={{ color: 'rgba(245,240,232,0.6)' }}
                        >
                          <span
                            className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
                            style={{ backgroundColor: 'rgba(245,240,232,0.3)' }}
                          />
                          {t(notesTranslations, bulletKey, lang)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}