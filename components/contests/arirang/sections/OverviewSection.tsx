import { Palette, Monitor, Clock, FileVideo, Globe, Wand2, Play, Check } from 'lucide-react';

const cards = [
  { icon: Palette, title: '주제', desc: '자신의 꿈을 담은 나만의 아리랑' },
  { icon: Monitor, title: '콘텐츠 형태', desc: '가로 영상' },
  { icon: Clock, title: '분량', desc: '30초 ~ 90초 내외' },
  { icon: FileVideo, title: '파일 형식', desc: 'MP4' },
  { icon: Globe, title: '참가 대상', desc: '아리랑과 한국 문화를 사랑하는 전 세계 누구나' },
];

const methodDetails = [
  '단, 참가자의 사진을 활용한 AI 영상은 사용 가능',
  '전통 민요 아리랑의 가사를 일부 활용하여 뮤직비디오 형식으로 제작',
  '"아리랑" 단어 필수 사용',
];

/** 공모 개요 섹션 */
export function OverviewSection() {
  return (
    <section id="overview" className="relative py-24 md:py-32">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, var(--ar-primary-dark), rgba(27,20,100,0.2), var(--ar-primary-dark))' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="arirang-animate text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight mb-14">
          공모 개요
        </h2>

        {/* 카드 5개 */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {cards.map((card) => (
            <div
              key={card.title}
              className="arirang-animate group p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
              style={{ backgroundColor: 'rgba(13,11,26,0.6)', border: '1px solid rgba(245,240,232,0.08)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(212,168,67,0.1)', color: 'var(--ar-accent)' }}>
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base leading-tight" style={{ color: 'var(--ar-cream)' }}>
                  {card.title}
                </h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,240,232,0.6)' }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>

        {/* 제작 방식 전용 카드 */}
        <div className="arirang-animate p-8 md:p-10 mb-12 rounded-2xl" style={{ background: 'linear-gradient(to bottom right, rgba(212,168,67,0.1), var(--ar-primary-dark))', border: '1px solid rgba(212,168,67,0.2)' }}>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(212,168,67,0.2)', color: 'var(--ar-accent)' }}>
              <Wand2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl md:text-2xl" style={{ color: 'var(--ar-cream)' }}>
              제작 방식
            </h3>
          </div>

          <p className="font-semibold text-lg md:text-xl mb-6" style={{ color: 'var(--ar-accent)' }}>
            100% AI 영상 생성 도구를 활용한 콘텐츠
          </p>

          <div className="space-y-3">
            {methodDetails.map((detail) => (
              <div key={detail} className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--ar-accent)' }} />
                <p className="text-base md:text-lg leading-relaxed" style={{ color: 'rgba(245,240,232,0.7)' }}>
                  {detail}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full transition-colors cursor-pointer"
              style={{ border: '2px solid rgba(212,168,67,0.5)', color: 'var(--ar-accent)' }}
            >
              <Play className="w-5 h-5" />
              예시 영상 감상하기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
