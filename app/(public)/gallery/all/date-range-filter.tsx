'use client';

interface DateRangeFilterProps {
  from?: string;
  to?: string;
}

export function DateRangeFilter({ from, to }: DateRangeFilterProps) {
  const handleChange = (key: 'from' | 'to', value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    window.location.href = `/gallery/all?${params.toString()}`;
  };

  return (
    <div className="flex items-center gap-1.5 ml-2 text-sm">
      <input
        type="date"
        defaultValue={from || ''}
        onChange={(e) => handleChange('from', e.target.value)}
        className="px-2 py-1.5 rounded-lg border border-border bg-background text-sm"
      />
      <span className="text-muted-foreground">~</span>
      <input
        type="date"
        defaultValue={to || ''}
        onChange={(e) => handleChange('to', e.target.value)}
        className="px-2 py-1.5 rounded-lg border border-border bg-background text-sm"
      />
    </div>
  );
}
