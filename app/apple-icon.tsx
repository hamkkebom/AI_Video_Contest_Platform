import { ImageResponse } from 'next/og';

/** Apple Touch Icon (180×180) — iOS 홈 화면 추가 시 사용 */
export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
          borderRadius: '36px',
          fontSize: '120px',
        }}
      >
        🌳
      </div>
    ),
    { ...size },
  );
}
