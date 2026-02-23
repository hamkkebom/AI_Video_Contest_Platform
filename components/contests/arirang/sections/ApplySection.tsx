'use client';

import { useRouter } from 'next/navigation';
import { Send, CheckCircle2, Film, Clock } from 'lucide-react';

/** 공모전 접수 안내 섹션 (폼은 /contests/contest-1/submit 으로 이동) */
export function ApplySection() {
  const router = useRouter();

  return (
    <section id="apply" className="relative py-24 md:py-32">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, var(--ar-primary-dark), rgba(27,20,100,0.2), var(--ar-primary-dark))' }}
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="arirang-animate text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight mb-4"
          style={{ color: 'var(--ar-cream)' }}
        >
          공모전 접수
        </h2>
        <p className="arirang-animate text-center mb-12" style={{ color: 'rgba(245,240,232,0.5)' }}>
          AI 영상으로 아리랑을 재해석해 주세요
        </p>

        {/* 접수 안내 카드 */}
        <div
          className="arirang-animate p-6 md:p-10 rounded-3xl backdrop-blur-sm space-y-8"
          style={{
            backgroundColor: 'rgba(13,11,26,0.8)',
            border: '1px solid rgba(245,240,232,0.1)',
          }}
        >
          {/* 접수 절차 안내 */}
          <div className="space-y-4">
            <h3
              className="text-lg font-semibold flex items-center gap-2"
              style={{ color: 'var(--ar-cream)' }}
            >
              <Film className="w-5 h-5" style={{ color: 'var(--ar-accent)' }} />
              접수 안내
            </h3>
            <ul className="space-y-3">
              {[
                { icon: CheckCircle2, text: 'AI를 활용하여 제작한 영상 (30초~90초, MP4)' },
                { icon: CheckCircle2, text: '작품 설명 및 제작과정 서술' },
                { icon: CheckCircle2, text: '썸네일 이미지 (JPG/PNG, 권장 1920×1080)' },
                { icon: CheckCircle2, text: '가산점 인증 자료 (선택, 추후 등록 가능)' },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3">
                  <item.icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--ar-accent)' }} />
                  <span className="text-sm" style={{ color: 'rgba(245,240,232,0.7)' }}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* 마감 안내 */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              backgroundColor: 'rgba(212,168,67,0.08)',
              border: '1px solid rgba(212,168,67,0.15)',
            }}
          >
            <Clock className="w-5 h-5 shrink-0" style={{ color: 'var(--ar-accent)' }} />
            <p className="text-sm" style={{ color: 'rgba(245,240,232,0.6)' }}>
              접수 마감: <span className="font-semibold" style={{ color: 'var(--ar-cream)' }}>2025년 8월 15일</span>
              {' '}· 1인 최대 3작품 제출 가능
            </p>
          </div>

          {/* CTA 버튼 */}
          <button
            type="button"
            onClick={() => router.push('/contests/contest-1/submit')}
            className="w-full py-4 font-bold text-lg rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--ar-accent)',
              color: 'var(--ar-primary-dark)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ar-accent-light)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ar-accent)'; }}
          >
            <Send className="w-5 h-5" />
            작품 접수하기
          </button>

          <p className="text-center text-xs" style={{ color: 'rgba(245,240,232,0.3)' }}>
            로그인 후 접수 페이지에서 작품을 제출할 수 있습니다
          </p>
        </div>
      </div>
    </section>
  );
}
