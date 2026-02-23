import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'public', 'images');

const WIDTH = 600;
const HEIGHT = 900; // 2:3 poster ratio

const posters = [
    {
        filename: 'contest-1.jpg',
        titleLines: ['제1회', 'AI 영상', '페스티벌'],
        subtitle: '2026 GLOBAL AI VIDEO FESTIVAL',
        prize: '총상금 2,000만원',
        deadline: '2026.04.30 마감',
        org: '한국AI영상협회',
        period: '2026.03.01 – 2026.04.30',
        bgDark: '#0f0d2e',
        grad1: { cx: '20%', cy: '15%', r: '60%', color1: '#4F46E5', color2: '#1E1B4B' },
        grad2: { cx: '85%', cy: '75%', r: '50%', color1: '#7C3AED', color2: '#1E1B4B' },
        accent: '#A78BFA',
        accentAlt: '#6366F1',
        decoSvg: Array.from({ length: 8 }, (_, i) =>
            `<circle cx="${WIDTH * 0.72 + i * 12}" cy="${HEIGHT * 0.25 + i * 10}" r="${30 + i * 28}" fill="none" stroke="#A78BFA" stroke-width="1.5" opacity="0.06"/>`
        ).join(''),
    },
    {
        filename: 'contest-2.jpg',
        titleLines: ['AI', '단편', '영화제'],
        subtitle: 'AI SHORT FILM AWARDS 2026',
        prize: '총상금 1,500만원',
        deadline: '2026.05.15 마감',
        org: '디지털영상진흥원',
        period: '2026.03.15 – 2026.05.15',
        bgDark: '#1a0505',
        grad1: { cx: '50%', cy: '15%', r: '70%', color1: '#DC2626', color2: '#450a0a' },
        grad2: { cx: '10%', cy: '85%', r: '40%', color1: '#F97316', color2: '#450a0a' },
        accent: '#FCA5A5',
        accentAlt: '#EF4444',
        decoSvg: (() => {
            let s = '';
            for (let y = 0; y < HEIGHT; y += 40) {
                s += `<rect x="${WIDTH - 55}" y="${y + 5}" width="18" height="24" rx="3" fill="#FCA5A5" opacity="0.07"/>`;
                s += `<rect x="37" y="${y + 15}" width="18" height="24" rx="3" fill="#FCA5A5" opacity="0.07"/>`;
            }
            s += `<line x1="${WIDTH - 65}" y1="0" x2="${WIDTH - 65}" y2="${HEIGHT}" stroke="#FCA5A5" stroke-width="1" opacity="0.07"/>`;
            s += `<line x1="${WIDTH - 32}" y1="0" x2="${WIDTH - 32}" y2="${HEIGHT}" stroke="#FCA5A5" stroke-width="1" opacity="0.07"/>`;
            s += `<line x1="32" y1="0" x2="32" y2="${HEIGHT}" stroke="#FCA5A5" stroke-width="1" opacity="0.07"/>`;
            s += `<line x1="60" y1="0" x2="60" y2="${HEIGHT}" stroke="#FCA5A5" stroke-width="1" opacity="0.07"/>`;
            return s;
        })(),
    },
    {
        filename: 'contest-3.jpg',
        titleLines: ['크리에이터', '챌린지', 'SEASON 3'],
        subtitle: 'CREATOR CHALLENGE',
        prize: '총상금 1,000만원',
        deadline: '2026.06.01 마감',
        org: '콘텐츠창작센터',
        period: '2026.04.01 – 2026.06.01',
        bgDark: '#1c0a02',
        grad1: { cx: '70%', cy: '20%', r: '60%', color1: '#EA580C', color2: '#431407' },
        grad2: { cx: '20%', cy: '80%', r: '50%', color1: '#D97706', color2: '#431407' },
        accent: '#FED7AA',
        accentAlt: '#F97316',
        decoSvg: Array.from({ length: 6 }, (_, i) => {
            const x = WIDTH * 0.6 + i * 18;
            const y = HEIGHT * 0.08 + i * 18;
            const s = 50 + i * 22;
            return `<polygon points="${x},${y} ${x + s},${y + s} ${x - s * 0.3},${y + s}" fill="none" stroke="#FED7AA" stroke-width="2" opacity="0.06"/>`;
        }).join(''),
    },
    {
        filename: 'contest-4.jpg',
        titleLines: ['AI 아트', '영상', '대전'],
        subtitle: 'AI ART VIDEO COMPETITION',
        prize: '총상금 3,000만원',
        deadline: '2026.07.20 마감',
        org: '예술과기술재단',
        period: '2026.05.01 – 2026.07.20',
        bgDark: '#021716',
        grad1: { cx: '30%', cy: '25%', r: '60%', color1: '#0D9488', color2: '#042f2e' },
        grad2: { cx: '80%', cy: '15%', r: '50%', color1: '#2563EB', color2: '#042f2e' },
        accent: '#5EEAD4',
        accentAlt: '#14B8A6',
        decoSvg: (() => {
            let s = '';
            for (let x = 0; x < WIDTH; x += 40) {
                s += `<line x1="${x}" y1="0" x2="${x}" y2="${HEIGHT}" stroke="#5EEAD4" stroke-width="0.5" opacity="0.05"/>`;
            }
            for (let y = 0; y < HEIGHT; y += 40) {
                s += `<line x1="0" y1="${y}" x2="${WIDTH}" y2="${y}" stroke="#5EEAD4" stroke-width="0.5" opacity="0.05"/>`;
            }
            for (let x = 0; x < WIDTH; x += 80) {
                for (let y = 0; y < HEIGHT; y += 80) {
                    if ((x * 7 + y * 13) % 160 < 80) {
                        s += `<circle cx="${x}" cy="${y}" r="2.5" fill="#5EEAD4" opacity="0.12"/>`;
                    }
                }
            }
            return s;
        })(),
    },
    {
        filename: 'contest-5.jpg',
        titleLines: ['대학생', 'AI 영상', '공모전'],
        subtitle: 'UNIVERSITY AI VIDEO CONTEST',
        prize: '총상금 500만원',
        deadline: '2026.08.31 마감',
        org: '교육부 · 과기부',
        period: '2026.06.01 – 2026.08.31',
        bgDark: '#1e0515',
        grad1: { cx: '50%', cy: '35%', r: '70%', color1: '#DB2777', color2: '#500724' },
        grad2: { cx: '90%', cy: '10%', r: '40%', color1: '#9333EA', color2: '#500724' },
        accent: '#F9A8D4',
        accentAlt: '#EC4899',
        decoSvg: (() => {
            let s = '';
            for (let i = 0; i < 40; i++) {
                const px = ((42 * (i + 1) * 7) % 1000) / 1000 * WIDTH;
                const py = ((42 * (i + 1) * 13) % 1000) / 1000 * HEIGHT;
                const sz = 2 + ((i * 3) % 5);
                // Simple diamond shape for stars
                s += `<polygon points="${px},${py - sz} ${px + sz * 0.6},${py} ${px},${py + sz} ${px - sz * 0.6},${py}" fill="#F9A8D4" opacity="0.1"/>`;
            }
            return s;
        })(),
    },
];

function generateSVG(poster) {
    const titleStartY = 200;
    const titleLineHeight = 80;
    const subtitleY = titleStartY + poster.titleLines.length * titleLineHeight + 15;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <radialGradient id="g1" cx="${poster.grad1.cx}" cy="${poster.grad1.cy}" r="${poster.grad1.r}" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="${poster.grad1.color1}" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="${poster.grad1.color2}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="${poster.grad2.cx}" cy="${poster.grad2.cy}" r="${poster.grad2.r}" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="${poster.grad2.color1}" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="${poster.grad2.color2}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow" cx="75%" cy="18%" r="30%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="${poster.accent}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${poster.accent}" stop-opacity="0"/>
    </radialGradient>
    <filter id="tshadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="2" stdDeviation="12" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${poster.bgDark}"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#g1)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#g2)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>

  <!-- Decorations -->
  ${poster.decoSvg}

  <!-- Organization -->
  <text x="38" y="60" fill="${poster.accent}" opacity="0.6" font-family="sans-serif" font-size="13">${poster.org}</text>

  <!-- Main Title -->
  ${poster.titleLines.map((line, i) =>
        `<text x="40" y="${titleStartY + i * titleLineHeight}" fill="#ffffff" font-family="sans-serif" font-size="64" font-weight="bold" filter="url(#tshadow)">${line}</text>`
    ).join('\n  ')}

  <!-- Subtitle -->
  <text x="42" y="${subtitleY}" fill="${poster.accent}" font-family="sans-serif" font-size="15" font-weight="600" letter-spacing="2">${poster.subtitle}</text>

  <!-- Divider 1 -->
  <line x1="40" y1="${HEIGHT - 260}" x2="${WIDTH - 40}" y2="${HEIGHT - 260}" stroke="${poster.accent}" stroke-width="1" opacity="0.2"/>

  <!-- Application Period -->
  <text x="40" y="${HEIGHT - 230}" fill="${poster.accent}" opacity="0.5" font-family="sans-serif" font-size="12">APPLICATION PERIOD</text>
  <text x="40" y="${HEIGHT - 208}" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="bold">${poster.period}</text>

  <!-- Eligibility -->
  <text x="40" y="${HEIGHT - 175}" fill="${poster.accent}" opacity="0.5" font-family="sans-serif" font-size="12">ELIGIBILITY</text>
  <text x="40" y="${HEIGHT - 155}" fill="#ffffff" font-family="sans-serif" font-size="15">AI 영상 제작에 관심있는 누구나</text>

  <!-- Divider 2 -->
  <line x1="40" y1="${HEIGHT - 120}" x2="${WIDTH - 40}" y2="${HEIGHT - 120}" stroke="${poster.accent}" stroke-width="1" opacity="0.15"/>

  <!-- Prize -->
  <text x="40" y="${HEIGHT - 90}" fill="${poster.accent}" opacity="0.6" font-family="sans-serif" font-size="12" font-weight="bold">TOTAL PRIZE</text>
  <text x="40" y="${HEIGHT - 52}" fill="#ffffff" font-family="sans-serif" font-size="34" font-weight="bold">${poster.prize}</text>

  <!-- Deadline Badge -->
  <rect x="${WIDTH - 40 - 150}" y="${HEIGHT - 90}" width="150" height="36" rx="8" fill="${poster.accentAlt}" opacity="0.25" stroke="${poster.accent}" stroke-width="1" stroke-opacity="0.3"/>
  <text x="${WIDTH - 40 - 75}" y="${HEIGHT - 67}" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="15" font-weight="bold">${poster.deadline}</text>
</svg>`;
}

async function main() {
    console.log('🎨 포스터 생성 시작... (비율 2:3, 세로형 포스터)\n');

    for (const poster of posters) {
        const svg = generateSVG(poster);
        const outputPath = join(OUTPUT_DIR, poster.filename);

        await sharp(Buffer.from(svg))
            .jpeg({ quality: 92 })
            .toFile(outputPath);

        const { size } = await sharp(outputPath).metadata();
        console.log(`  ✅ ${poster.filename} (${WIDTH}x${HEIGHT}, 저장됨)`);
    }

    console.log('\n🎉 포스터 5장 생성 완료!');
    console.log(`   저장 경로: ${OUTPUT_DIR}`);
}

main().catch(console.error);
