import { UserPlus, Upload } from 'lucide-react';

const steps = [
  { icon: UserPlus, num: '01', title: '홈페이지 가입', desc: '공식 홈페이지에 접속하여 회원가입을 완료하세요.' },
  { icon: Upload, num: '02', title: '콘텐츠 업로드', desc: '마이페이지 또는 공모전 접수 메뉴를 통해 영상 및 신청서를 제출하세요.' },
];

/** 참여 방법 섹션 */
export function HowToSection() {
  return (
    <section id="howto" className="relative py-24 md:py-32">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, var(--ar-primary-dark), rgba(27,20,100,0.15), var(--ar-primary-dark))' }} />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="arirang-animate text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight mb-16">
          참여 방법
        </h2>

        <div className="grid md:grid-cols-2 gap-6 md:gap-4 lg:gap-6 mb-12">
          {steps.map((step) => (
            <div key={step.num} className="arirang-animate relative">
              <div className="p-8 rounded-2xl text-center h-full transition-colors" style={{ backgroundColor: 'rgba(13,11,26,0.6)', border: '1px solid rgba(245,240,232,0.08)' }}>
                <span className="text-5xl font-bold mb-2 block" style={{ color: 'rgba(212,168,67,0.2)' }}>
                  {step.num}
                </span>
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(212,168,67,0.1)', color: 'var(--ar-accent)' }}>
                  <step.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg mb-3" style={{ color: 'var(--ar-cream)' }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,240,232,0.6)' }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
