import { ImageResponse } from 'next/og';

/** 사이트 아이콘 (32×32) — Next.js가 자동으로 <link rel="icon"> 삽입 */
export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #16a34a, #15803d)',
          borderRadius: '6px',
          fontSize: '22px',
        }}
      >
        🌳
      </div>
    ),
    { ...size },
  );
}
