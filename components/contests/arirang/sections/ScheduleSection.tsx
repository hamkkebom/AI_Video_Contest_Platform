import { Calendar, Trophy } from 'lucide-react';

const events = [
  { icon: Calendar, title: '접수 기간', date: '2026. 2. 25(수) ~ 3. 28(토) 23:59', color: 'var(--ar-accent)', active: true },
  { icon: Trophy, title: '수상작 발표 및 시상식', date: '2026. 4. 11(토)', extra: '온라인 시상식', color: 'var(--ar-point)', active: false },
];

/** 상세 일정 섹션 */
export function ScheduleSection() {
  return (
    <section id="schedule" className="relative py-24 md:py-32" style={{ backgroundColor: 'var(--ar-primary-dark)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="arirang-animate text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight mb-16">
          상세 일정
        </h2>

        <div className="relative">
          {/* 연결선 (데스크톱) */}
          <div className="hidden md:block absolute top-12 left-[25%] right-[25%] h-0.5" style={{ backgroundColor: 'rgba(245,240,232,0.1)' }} />

          <div className="grid md:grid-cols-2 gap-8 md:gap-4">
            {events.map((event) => (
              <div key={event.title} className="arirang-animate relative flex flex-col items-center text-center">
                {/* 아이콘 원 */}
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                  style={event.active
                    ? { backgroundColor: event.color, boxShadow: '0 8px 20px rgba(212,168,67,0.3)' }
                    : { backgroundColor: 'var(--ar-primary)', border: '2px solid rgba(245,240,232,0.2)' }
                  }
                >
                  <event.icon className="w-10 h-10" style={{ color: event.active ? 'var(--ar-primary-dark)' : 'rgba(245,240,232,0.6)' }} />
                </div>

                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--ar-cream)' }}>{event.title}</h3>
                <p className="text-sm font-medium mb-2" style={{ color: event.active ? 'var(--ar-accent)' : 'rgba(245,240,232,0.6)' }}>
                  {event.date}
                </p>
                {event.extra && (
                  <p className="text-xs" style={{ color: 'rgba(245,240,232,0.5)' }}>{event.extra}</p>
                )}
                {event.active && (
                  <span className="mt-3 px-3 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: 'rgba(212,168,67,0.2)', color: 'var(--ar-accent)' }}>
                    NOW OPEN
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
