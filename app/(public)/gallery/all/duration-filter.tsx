'use client';

interface DurationFilterProps {
  minDur?: string;
  maxDur?: string;
}

const PRESETS = [
  { label: '전체', min: '', max: '' },
  { label: '~1분', min: '', max: '60' },
  { label: '1~3분', min: '60', max: '180' },
  { label: '3~5분', min: '180', max: '300' },
  { label: '5분~', min: '300', max: '' },
];

export function DurationFilter({ minDur, maxDur }: DurationFilterProps) {
  const handleClick = (min: string, max: string) => {
    const params = new URLSearchParams(window.location.search);
    if (min) params.set('minDur', min);
    else params.delete('minDur');
    if (max) params.set('maxDur', max);
    else params.delete('maxDur');
    window.location.href = `/gallery/all?${params.toString()}`;
  };

  const isActive = (min: string, max: string) => {
    return (minDur || '') === min && (maxDur || '') === max;
  };

  return (
    <div className="flex items-center gap-1 text-sm">
      {PRESETS.map((p) => (
        <button
          key={p.label}
          type="button"
          onClick={() => handleClick(p.min, p.max)}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            isActive(p.min, p.max)
              ? 'text-violet-500 font-bold bg-violet-500/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
