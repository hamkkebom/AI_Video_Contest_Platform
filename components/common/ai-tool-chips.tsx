'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface AiToolChipsProps {
  label: string;
  tools: readonly string[];
  selected: string[];
  onChange: (v: string[]) => void;
  /** 직접 입력 허용 여부 */
  allowCustom?: boolean;
}

/**
 * AI 도구 칩 선택 컴포넌트
 * 프리디파인드 도구 목록에서 선택 + 직접 입력 기능
 */
export function AiToolChips({
  label,
  tools,
  selected,
  onChange,
  allowCustom = false,
}: AiToolChipsProps) {
  const [customInput, setCustomInput] = useState('');

  const toggle = (tool: string) => {
    onChange(
      selected.includes(tool)
        ? selected.filter((t) => t !== tool)
        : [...selected, tool],
    );
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    setCustomInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustom();
    }
  };

  /* 프리디파인드 목록에 없는 커스텀 도구 */
  const customTools = selected.filter((t) => !(tools as readonly string[]).includes(t));

  return (
    <div className="space-y-2.5">
      <p className="text-sm font-semibold">{label}</p>
      <div className="flex flex-wrap gap-2">
        {tools.map((tool) => {
          const isActive = selected.includes(tool);
          return (
            <button
              key={tool}
              type="button"
              onClick={() => toggle(tool)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/40'
              }`}
            >
              {tool}
            </button>
          );
        })}
        {/* 커스텀 추가된 도구 */}
        {customTools.map((tool) => (
          <button
            key={tool}
            type="button"
            onClick={() => toggle(tool)}
            className="rounded-full border border-primary bg-primary/10 text-primary px-3 py-1 text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            {tool}
            <X className="h-3 w-3" />
          </button>
        ))}
      </div>
      {/* 직접 입력 */}
      {allowCustom && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="직접 입력 후 Enter"
            className="flex-1 h-8 rounded-lg border border-border bg-background/50 px-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!customInput.trim()}
            className="h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            추가
          </button>
        </div>
      )}
    </div>
  );
}