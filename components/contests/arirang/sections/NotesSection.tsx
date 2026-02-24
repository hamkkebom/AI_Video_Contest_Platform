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
  Lock,
  Banknote,
} from 'lucide-react';
import { useLang } from '@/components/contests/arirang/lang-context';
import { t, translations } from '@/components/contests/arirang/translations';

/** 유의사항 섹션 항목 타입 */
interface NoteSection {
  key: string;
  title: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  bullets: string[];
}

/** 유의사항 11개 섹션 데이터 */
const noteSections: NoteSection[] = [
  {
    key: 'requirements',
    title: '1. 출품 요건',
    icon: FileCheck,
    bullets: [
      '본 공모전의 출품작은 반드시 AI툴을 활용하여 제작된 창작물이어야 합니다.',
      '사용한 AI툴은 신청서에 반드시 기재해 주세요.',
      'AI 활용 사실이 확인되지 않거나 허위로 기재한 경우 심사 제외 또는 실격 처리될 수 있습니다.',
      '직접 촬영 영상만으로 구성된 콘텐츠는 인정되지 않습니다.',
      '참가자 본인의 사진을 활용한 AI 생성은 가능합니다.',
    ],
  },
  {
    key: 'copyright',
    title: '2. 저작권 안내',
    icon: Shield,
    bullets: [
      '출품작의 저작권은 원칙적으로 출품자에게 귀속됩니다.',
      "단, 아래 '출품작 활용' 및 '수상작 권리' 항목에 명시된 범위에 대해서는 이용권이 부여됩니다.",
    ],
  },
  {
    key: 'usage',
    title: '3. 출품작의 게시 및 홍보 활용',
    icon: Megaphone,
    bullets: [
      '응모자는 공모전 운영, 심사, 홍보, 전시회 개최 및 공익적 행사 진행을 위해 회사가 출품작을 무상으로 활용하는 것에 동의합니다.',
      '활용 범위에는 전시, 상영, 복제, 공중송신, 온라인 게시, 홍보물 제작 등이 포함됩니다.',
      '제출된 작품은 함께봄 공모전 페이지 및 관련 온라인 채널에 게시될 수 있습니다.',
      '수상 발표 이전에도 공모전 기간 중 전시회 및 행사에서 공개 상영 또는 전시될 수 있습니다.',
      '전시회는 무료로 운영되며, 출품작 자체를 독립적인 판매 대상으로 활용하지 않습니다.',
      '다만, 전시 공간 내 굿즈 판매 또는 공익적 모금 활동과 병행될 수 있습니다.',
      '수상 발표 전에는 출품작을 별도의 독립적인 상업 판매 또는 영리사업의 주된 콘텐츠로 활용하지 않습니다.',
    ],
  },
  {
    key: 'winnerRights',
    title: '4. 수상작의 권리 및 상업적 활용',
    icon: ShoppingBag,
    bullets: [
      '수상자는 상금 수령과 동시에 회사에 해당 수상작에 대한 전 세계적, 독점적, 기간 제한 없는 이용권 및 2차적 저작물 작성권을 부여하는 것에 동의합니다.',
      '회사는 수상작을 수정·편집·재가공하여 광고, 홍보, 상품 제작, 온라인·오프라인 매체 게시 등 상업적 목적으로 활용할 수 있습니다.',
      '필요 시 제3자(광고대행사, 제작사, 유통사 등)에게 권리를 재허락할 수 있습니다.',
      '상금은 위 이용권 부여에 대한 정당한 대가로 지급됩니다.',
      '수상자는 동일 작품을 제3자에게 독점적으로 이용 허락할 수 없습니다.',
      '단, 수상자는 본인의 포트폴리오 및 개인 홍보 목적에 한하여 작품을 사용할 수 있습니다.',
    ],
  },
  {
    key: 'judging',
    title: '5. 심사 및 대중평가',
    icon: ThumbsUp,
    bullets: [
      "출품작은 공모전 페이지에 게시되며 '좋아요' 수 등 대중 평가 요소가 심사에 일부 반영될 수 있습니다.",
      '대중 평가 반영 비율 및 최종 수상작 선정은 회사의 심사 기준에 따릅니다.',
      '비정상적 트래픽, 매크로, 자동화 프로그램, 조직적 투표 등 부정행위가 확인될 경우 해당 점수는 제외되거나 실격 처리될 수 있습니다.',
    ],
  },
  {
    key: 'aiResponsibility',
    title: '6. AI 제작물 관련 책임',
    icon: Cpu,
    bullets: [
      '응모자는 AI툴의 이용약관을 위반하지 않았으며, 상업적 이용에 법적 제한이 없음을 보증합니다.',
      'AI 생성물의 저작권, 라이선스, 학습 데이터와 관련된 분쟁 발생 시 모든 책임은 출품자에게 있습니다.',
      '회사는 AI툴 약관 위반으로 인한 분쟁에 대해 책임을 부담하지 않습니다.',
    ],
  },
  {
    key: 'thirdParty',
    title: '7. 제3자 권리 침해 금지',
    icon: Scale,
    bullets: [
      '출품작은 제3자의 저작권, 초상권, 상표권, 디자인권, 음원·폰트 라이선스 등을 침해하지 않는 창작물이어야 합니다.',
      '관련 분쟁 발생 시 모든 민·형사상 책임은 출품자에게 있습니다.',
    ],
  },
  {
    key: 'participation',
    title: '8. 참여 제한',
    icon: Users,
    bullets: [
      '1인당 1작품만 응모 가능합니다.',
      '팀 단위 참여는 불가합니다.',
      '공동 제작 사실이 확인될 경우 수상이 취소될 수 있습니다.',
    ],
  },
  {
    key: 'disqualification',
    title: '9. 실격 및 수상 취소',
    icon: AlertTriangle,
    bullets: [
      '다음에 해당할 경우 실격 또는 수상 취소 처리됩니다.',
      '표절, 도용 등 권리 침해',
      '허위 정보 기재',
      'AI툴 라이선스 위반',
      '사회적 물의를 일으킬 수 있는 내용',
      '법령 위반 또는 공모전 취지에 부합하지 않는 경우',
      '중복 또는 팀 참여 사실이 확인된 경우',
      '수상 이후라도 위 사유가 확인될 경우 상금 반환이 요구될 수 있으며, 회사는 필요한 법적 조치를 취할 수 있습니다.',
    ],
  },
  {
    key: 'privacy',
    title: '10. 개인정보 수집·이용 안내',
    icon: Lock,
    bullets: [
      '수집 항목: 이름, 연락처, 이메일, (기업 참가 시) 사업자등록증 사본, (수상 시) 계좌 정보 및 주민등록번호',
      '이용 목적: 참가자 확인, 심사 진행, 결과 안내, 상금 지급 및 세무 처리',
      '보유 기간: 공모전 종료 후 3년간 보관 후 파기',
      '수상자의 경우 세무 관련 법령에 따라 보관 기간이 달라질 수 있습니다.',
      '개인정보 수집·이용에 동의하지 않을 경우 참여가 제한될 수 있습니다.',
    ],
  },
  {
    key: 'prize',
    title: '11. 상금 지급 및 세금',
    icon: Banknote,
    bullets: [
      '상금은 「소득세법」에 따른 기타소득으로 분류됩니다.',
      '관련 세법에 따라 제세공과금(8.8%)이 원천징수된 후 지급됩니다.',
      '제세공과금은 수상자 본인 부담입니다.',
      '상금 지급을 위해 세무 처리에 필요한 정보 제출이 요구될 수 있으며, 미제출 시 지급이 제한될 수 있습니다.',
    ],
  },
];

/** 유의사항 및 저작권 안내 섹션 */
export function NotesSection() {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const { lang } = useLang();
  const notesTranslations = translations.notes;

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
          {t(notesTranslations, 'title', lang)}
        </h2>

        <div className="arirang-animate space-y-3">
          {noteSections.map((section) => {
            const isOpen = openItems.includes(section.key);
            return (
              <div
                key={section.key}
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid rgba(245,240,232,0.08)' }}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(section.key)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors cursor-pointer"
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(27,20,100,0.2)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                >
                  <section.icon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--ar-accent)' }} />
                  <span className="flex-1 font-medium" style={{ color: 'var(--ar-cream)' }}>
                    {section.title}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'rgba(245,240,232,0.4)' }}
                  />
                </button>

                <div
                  className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-5 pb-4 pl-13">
                    <ul className="space-y-1.5">
                      {section.bullets.map((bullet, idx) => (
                        <li
                          key={`${section.key}-${idx}`}
                          className="text-sm leading-relaxed flex items-start gap-2"
                          style={{ color: 'rgba(245,240,232,0.6)' }}
                        >
                          <span
                            className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
                            style={{ backgroundColor: 'rgba(245,240,232,0.3)' }}
                          />
                          {bullet}
                        </li>
                      ))}
                    </ul>
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
