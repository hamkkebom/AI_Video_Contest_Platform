import { cn } from '@/lib/utils';

/** 한 줄이 어떤 역할인지 */
type Line =
  | { kind: 'heading'; text: string }
  | { kind: 'bullet'; text: string }
  | { kind: 'text'; text: string };

/** "1. 공모 개요", "2) 상세일정", "■ 시상" — 번호·기호로 시작하는 줄 */
const NUMBERED = /^\s*(?:\d+\s*[.)]|[■▶◆●※])\s*(.+)$/;
/** "- 항목", "· 항목", "* 항목" */
const BULLET = /^\s*[-·•*]\s+(.+)$/;

/**
 * 번호가 붙었다고 다 제목은 아니다.
 * "1. 공모 개요"는 섹션이지만 "1. 포스터를 SNS에 업로드하고 인증 (1점)"은 열거 항목이다.
 * 실무적으로 섹션 제목은 짧은 명사구라 길이로 가른다 — 넘으면 열거 항목으로 취급한다.
 */
const HEADING_MAX_LENGTH = 24;

/**
 * 주최자가 평문으로 입력한 상세 안내를 구조로 읽어낸다.
 * 마크다운 파서를 붙이지 않는 이유: 입력 형식이 자유로워 마크다운이라는 보장이 없고,
 * 실제로 쓰이는 패턴은 "번호 붙은 섹션 + 하이픈 목록" 두 가지뿐이다.
 */
function parseLines(raw: string): Line[] {
  return raw.split('\n').map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return { kind: 'text', text: '' };

    const bullet = trimmed.match(BULLET);
    if (bullet) return { kind: 'bullet', text: bullet[1].trim() };

    const numbered = trimmed.match(NUMBERED);
    if (numbered) {
      const text = numbered[1].trim();
      return text.length <= HEADING_MAX_LENGTH
        ? { kind: 'heading', text }
        : { kind: 'bullet', text };
    }

    return { kind: 'text', text: trimmed };
  });
}

/** 연속된 bullet 을 하나의 목록으로 묶는다 */
type Block =
  | { kind: 'heading'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'paragraph'; text: string };

function toBlocks(lines: Line[]): Block[] {
  const blocks: Block[] = [];
  let bullets: string[] = [];
  let paragraph: string[] = [];

  const flushBullets = () => {
    if (bullets.length) {
      blocks.push({ kind: 'list', items: bullets });
      bullets = [];
    }
  };
  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: 'paragraph', text: paragraph.join('\n') });
      paragraph = [];
    }
  };

  for (const line of lines) {
    if (line.kind === 'bullet') {
      flushParagraph();
      bullets.push(line.text);
      continue;
    }
    flushBullets();
    if (line.kind === 'heading') {
      flushParagraph();
      blocks.push({ kind: 'heading', text: line.text });
      continue;
    }
    if (!line.text) {
      flushParagraph();
      continue;
    }
    paragraph.push(line.text);
  }
  flushBullets();
  flushParagraph();
  return blocks;
}

interface ContestDetailContentProps {
  content: string;
  className?: string;
}

/**
 * 공모전 상세 안내 본문.
 * 예전에는 `whitespace-pre-line` 으로 원문을 통째로 흘려서, 번호 섹션과 목록이
 * 전부 같은 회색 본문으로 보였다 — 가장 중요한 페이지의 가장 중요한 정보가 훑기 불가능했다.
 */
export function ContestDetailContent({ content, className }: ContestDetailContentProps) {
  const blocks = toBlocks(parseLines(content));

  return (
    <div className={cn('space-y-6', className)}>
      {blocks.map((block, i) => {
        if (block.kind === 'heading') {
          return (
            <h3
              key={i}
              className="flex items-center gap-2.5 pt-2 text-lg font-bold tracking-tight text-foreground first:pt-0"
            >
              <span className="h-5 w-1 shrink-0 rounded-full bg-brand" aria-hidden />
              {block.text}
            </h3>
          );
        }
        if (block.kind === 'list') {
          return (
            <ul key={i} className="space-y-2">
              {block.items.map((item, j) => (
                <li key={j} className="flex gap-3 text-[0.95rem] leading-relaxed text-muted-foreground">
                  <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand/50" aria-hidden />
                  <span className="min-w-0">{item}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="whitespace-pre-line text-[0.95rem] leading-relaxed text-muted-foreground">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
