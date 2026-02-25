'use client';

import { Mail } from 'lucide-react';
import { useLang } from '@/components/contests/arirang/lang-context';
import { t, translations } from '@/components/contests/arirang/translations';

/** 아리랑 랜딩 푸터 섹션 */
export function FooterSection() {
  const { lang } = useLang();
  const footerTranslations = translations.footer;

  return (
    <footer style={{ backgroundColor: '#060412', borderTop: '1px solid rgba(245,240,232,0.05)' }} className="py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* 주최 */}
          <div>
            <h4 className="font-bold text-lg mb-3" style={{ color: 'var(--ar-accent)' }}>
              {t(footerTranslations, 'title', lang)}
            </h4>
            <p className="text-sm mb-2" style={{ color: 'rgba(245,240,232,0.5)' }}>
              {t(footerTranslations, 'hostedBy', lang)}
            </p>
          </div>


          {/* 문의 */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--ar-cream)' }}>{t(footerTranslations, 'contactTitle', lang)}</h4>
            <a
              href="mailto:hamkkebom12@gmail.com"
              className="flex items-center gap-2 text-sm transition-colors"
              style={{ color: 'rgba(245,240,232,0.5)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--ar-accent)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(245,240,232,0.5)'; }}
            >
              <Mail className="w-4 h-4" />
              hamkkebom12@gmail.com
            </a>
          </div>
        </div>

        {/* 하단 카피라이트 */}
        <div className="pt-8 text-center" style={{ borderTop: '1px solid rgba(245,240,232,0.05)' }}>
          <p className="text-sm" style={{ color: 'rgba(245,240,232,0.3)' }}>
            {t(footerTranslations, 'copyright', lang)}
          </p>
        </div>
      </div>
    </footer>
  );
}