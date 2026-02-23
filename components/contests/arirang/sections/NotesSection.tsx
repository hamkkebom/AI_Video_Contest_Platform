'use client';

import { useState } from 'react';
import {
  ChevronDown,
  Shield,
  FileCheck,
  Cpu,
  Scale,
  Users,
  ShoppingBag,
  AlertTriangle,
  Megaphone,
  ThumbsUp,
} from 'lucide-react';

/** 아코디언 항목 타입 */
interface NoteItem {
  key: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  note?: string;
}

/** 유의사항 및 저작권 안내 섹션 */
export function NotesSection() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const items: NoteItem[] = [
    {
      key: 'copyright',
      title: '권리 귀속',
      desc: '출품작의 저작권은 제작자에게 있습니다. 단, 수상작에 한하여 저작권은 함께봄과 제작자가 각 50%씩 공동 소유합니다.',
      icon: Shield,
      note: '향후 AI콘텐츠저작권협회 설립 시 제작자에게 100% 양도 가능',
    },
    {
      key: 'usage',
      title: '사용권',
      desc: '출품작에 대한 사용권 및 2차적 저작물 작성권은 함께봄에 100% 귀속되며, 마케팅 및 홍보 목적으로 활용될 수 있습니다.',
      icon: FileCheck,
    },
    {
      key: 'commercial',
      title: '상업적 이용 보장',
      desc: '응모자는 AI툴로 제작된 결과물이 상업적 이용에 결격 사유가 없는 결과물이어야 합니다.',
      icon: ShoppingBag,
    },
    {
      key: 'legal',
      title: '법적 책임',
      desc: '모든 출품작은 제3자의 저작권, 초상권 등을 침해하지 않는 순수 창작물이어야 하며, 문제 발생 시 모든 책임은 출품자에게 있습니다.',
      icon: Scale,
    },
    {
      key: 'duplicate',
      title: '중복 참여 및 팀 참여 불가',
      desc: '1인당 1회 응모 가능하며, 팀으로 작업한 사실이 밝혀질 경우 수상은 취소될 수 있습니다.',
      icon: Users,
    },
    {
      key: 'disqualification',
      title: '즉시 실격 처리 대상',
      desc: '선정적, 차별적, 폭력적 내용 등이 포함된 작품은 즉시 실격 처리됩니다.',
      icon: AlertTriangle,
    },
    {
      key: 'promotion',
      title: '작품 활용 안내',
      desc: '제출된 작품은 행사 홍보·연출에 활용될 수 있습니다.',
      icon: Megaphone,
    },
    {
      key: 'aiRequired',
      title: 'AI 창작물 필수',
      desc: '제출 작품은 반드시 AI 활용 창작물이어야 하며, 저작권·초상권 문제 발생 시 실격 처리될 수 있습니다.',
      icon: Cpu,
    },
    {
      key: 'publicVote',
      title: '대중 평가 반영',
      desc: '제출된 작품은 함께봄 공모전 페이지에 게시되며, 좋아요 수 등 대중평가 점수가 심사에 반영됩니다.',
      icon: ThumbsUp,
    },
  ];

  const toggleItem = (key: string) => {
    setOpenItems((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  return (
    <section id="notes" className="relative py-24 md:py-32" style={{ backgroundColor: 'var(--ar-primary-dark)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="arirang-animate text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight mb-12"
          style={{ color: 'var(--ar-cream)' }}
        >
          유의사항 및 저작권 안내
        </h2>

        <div className="arirang-animate space-y-3">
          {items.map((item) => {
            const isOpen = openItems.includes(item.key);
            return (
              <div
                key={item.key}
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid rgba(245,240,232,0.08)' }}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.key)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors cursor-pointer"
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(27,20,100,0.2)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--ar-accent)' }} />
                  <span className="flex-1 font-medium" style={{ color: 'var(--ar-cream)' }}>
                    {item.title}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'rgba(245,240,232,0.4)' }}
                  />
                </button>

                <div
                  className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-5 pb-4 pl-13">
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,240,232,0.6)' }}>
                      {item.desc}
                    </p>
                    {item.note && (
                      <p className="mt-2 text-xs italic" style={{ color: 'rgba(245,240,232,0.4)' }}>
                        * {item.note}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
