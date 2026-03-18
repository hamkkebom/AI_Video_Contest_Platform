import { ImageResponse } from 'next/og';

/** 사이트 기본 OG 이미지 (1200×630) — Next.js가 자동으로 og:image 메타태그 삽입 */
export const runtime = 'edge';
export const alt = 'AI꿈 — AI와 함께 꿈을 설계하고 완성하다';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 로고 영역 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <span style={{ fontSize: '64px' }}>🌳</span>
          <span
            style={{
              fontSize: '56px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-1px',
            }}
          >
            AI꿈
          </span>
        </div>

        {/* 타이틀 */}
        <div
          style={{
            fontSize: '32px',
            fontWeight: 600,
            color: '#e2e8f0',
            marginBottom: '16px',
          }}
        >
          AI와 함께 꿈을 설계하고 완성하다
        </div>

        {/* 서브타이틀 */}
        <div
          style={{
            fontSize: '20px',
            color: '#94a3b8',
          }}
        >
          AI 영상 공모전 전문 플랫폼
        </div>

        {/* 하단 URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            fontSize: '16px',
            color: '#64748b',
          }}
        >
          www.aikkumhub.com
        </div>
      </div>
    ),
    { ...size },
  );
}
