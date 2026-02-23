'use client';

import { ExternalLink, Mail } from 'lucide-react';

/** 아리랑 랜딩 푸터 섹션 */
export function FooterSection() {
  return (
    <footer style={{ backgroundColor: '#060412', borderTop: '1px solid rgba(245,240,232,0.05)' }} className="py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          {/* 주최 */}
          <div>
            <h4 className="font-bold text-lg mb-3" style={{ color: 'var(--ar-accent)' }}>
              꿈꾸는 아리랑
            </h4>
            <p className="text-sm mb-2" style={{ color: 'rgba(245,240,232,0.5)' }}>
              주최: 함께봄
            </p>
            <p className="text-sm" style={{ color: 'rgba(245,240,232,0.5)' }}>
              후원: 헐버트박사 기념사업회
            </p>
          </div>

          {/* 링크 */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--ar-cream)' }}>Links</h4>
            <div className="space-y-2">
              <a
                href="http://hulbert.or.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm transition-colors"
                style={{ color: 'rgba(245,240,232,0.5)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--ar-accent)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(245,240,232,0.5)'; }}
              >
                <ExternalLink className="w-4 h-4" />
                헐버트박사 기념사업회
              </a>
            </div>
          </div>

          {/* 문의 */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--ar-cream)' }}>문의</h4>
            <a
              href="mailto:contest@hamkkebom.org"
              className="flex items-center gap-2 text-sm transition-colors"
              style={{ color: 'rgba(245,240,232,0.5)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--ar-accent)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(245,240,232,0.5)'; }}
            >
              <Mail className="w-4 h-4" />
              contest@hamkkebom.org
            </a>
          </div>
        </div>

        {/* 하단 카피라이트 */}
        <div className="pt-8 text-center" style={{ borderTop: '1px solid rgba(245,240,232,0.05)' }}>
          <p className="text-sm" style={{ color: 'rgba(245,240,232,0.3)' }}>
            2026 함께봄. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
