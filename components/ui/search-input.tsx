'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  currentSearch?: string;
  currentStatus: string;
  currentSort: string;
}

/**
 * 공모전 검색 입력 UI (클라이언트 컴포넌트)
 */
export function SearchInput({ currentSearch, currentStatus, currentSort }: SearchInputProps) {
  const [searchValue, setSearchValue] = useState(currentSearch || '');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('status', currentStatus);
    params.set('sort', currentSort);
    if (searchValue.trim()) {
      params.set('search', searchValue.trim());
    }
    window.location.href = `/contests?${params.toString()}`;
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="공모전 검색..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10 pr-4 py-2 rounded-lg bg-background/80 border border-border text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all"
        />
      </div>
    </form>
  );
}
