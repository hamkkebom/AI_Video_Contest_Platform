import { Music, Cpu, Sparkles } from 'lucide-react';

const keywords = [
  { icon: Music, label: '아리랑', desc: '한국인의 영원한 노래', color: 'var(--ar-point)' },
  { icon: Cpu, label: 'AI 기술', desc: '창의적 영상 제작', color: 'var(--ar-accent)' },
  { icon: Sparkles, label: '꿈', desc: '여러분의 이야기', color: 'var(--ar-pine-light)' },
];

/** 공모전 소개 섹션 */
export function AboutSection() {
  return (
    <section id="about" className="relative py-24 md:py-32" style={{ backgroundColor: 'var(--ar-primary-dark)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 타이틀 */}
        <h2 className="arirang-animate text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight mb-16">
          공모전 소개
        </h2>

        {/* 키워드 + 설명 */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          {/* 키워드 카드 */}
          <div className="space-y-4 arirang-animate">
            {keywords.map((kw) => (
              <div
                key={kw.label}
                className="flex items-center gap-4 p-5 rounded-2xl transition-colors"
                style={{ backgroundColor: 'rgba(27,20,100,0.3)', border: '1px solid rgba(245,240,232,0.05)' }}
              >
                <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--ar-primary-dark)', color: kw.color }}>
                  <kw.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: 'var(--ar-cream)' }}>{kw.label}</h3>
                  <p className="text-sm" style={{ color: 'rgba(245,240,232,0.6)' }}>{kw.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 메인 텍스트 */}
          <div className="arirang-animate">
            <p className="text-lg leading-relaxed mb-4" style={{ color: 'rgba(245,240,232,0.8)' }}>
              헐버트 박사의 아리랑 채보 130주년을 기념하여, 제1회 &lsquo;꿈꾸는 아리랑&rsquo; AI 영상 공모전으로 우리 아리랑을 다시 한번 세계로 알립니다.
            </p>
            <p className="leading-relaxed mb-4" style={{ color: 'rgba(245,240,232,0.6)' }}>
              이번 공모전은 한국의 전통 가락인 &lsquo;아리랑&rsquo;과 현대의 &lsquo;AI 기술&rsquo;, 그리고 여러분의 &lsquo;꿈&rsquo;을 하나로 연결하는 창의적인 시도를 목표로 합니다.
            </p>
            <p className="font-semibold text-lg" style={{ color: 'var(--ar-accent)' }}>
              여러분만의 독창적인 시선으로 아리랑의 새로운 꿈을 보여주세요!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
