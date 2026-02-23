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
} from 'lucide-react';
import { useLang } from '@/components/contests/arirang/lang-context';
import { t, translations } from '@/components/contests/arirang/translations';

/** 아코디언 항목 타입 */
interface NoteItem {
  key: string;
  titleKey: string;
  descKey: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  noteKey?: string;
}

/** 유의사항 및 저작권 안내 섹션 */
export function NotesSection() {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const { lang } = useLang();
  const notesTranslations = translations.notes;

  const items: NoteItem[] = [
    {
      key: 'copyright',
      titleKey: 'copyrightTitle',
      descKey: 'copyrightDesc',
      icon: Shield,
      noteKey: 'copyrightNote',
    },
    {
      key: 'usage',
      titleKey: 'usageTitle',
      descKey: 'usageDesc',
      icon: FileCheck,
    },
    {
      key: 'commercial',
      titleKey: 'commercialTitle',
      descKey: 'commercialDesc',
      icon: ShoppingBag,
    },
    {
      key: 'legal',
      titleKey: 'legalTitle',
      descKey: 'legalDesc',
      icon: Scale,
    },
    {
      key: 'duplicate',
      titleKey: 'duplicateTitle',
      descKey: 'duplicateDesc',
      icon: Users,
    },
    {
      key: 'disqualification',
      titleKey: 'disqualificationTitle',
      descKey: 'disqualificationDesc',
      icon: AlertTriangle,
    },
    {
      key: 'promotion',
      titleKey: 'promotionTitle',
      descKey: 'promotionDesc',
      icon: Megaphone,
    },
    {
      key: 'aiRequired',
      titleKey: 'aiRequiredTitle',
      descKey: 'aiRequiredDesc',
      icon: Cpu,
    },
    {
      key: 'publicVote',
      titleKey: 'publicVoteTitle',
      descKey: 'publicVoteDesc',
      icon: ThumbsUp,
    },
  ];

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
          {items.map((item) => {
            const isOpen = openItems.includes(item.key);
            return (
              <div
                key={item.key}
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid rgba(245,240,232,0.08)' }}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.key)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors cursor-pointer"
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(27,20,100,0.2)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--ar-accent)' }} />
                  <span className="flex-1 font-medium" style={{ color: 'var(--ar-cream)' }}>
                    {t(notesTranslations, item.titleKey, lang)}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'rgba(245,240,232,0.4)' }}
                  />
                </button>

                <div
                  className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-5 pb-4 pl-13">
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,240,232,0.6)' }}>
                      {t(notesTranslations, item.descKey, lang)}
                    </p>
                    {item.noteKey && (
                      <p className="mt-2 text-xs italic" style={{ color: 'rgba(245,240,232,0.4)' }}>
                        * {t(notesTranslations, item.noteKey, lang)}
                      </p>
                    )}
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
