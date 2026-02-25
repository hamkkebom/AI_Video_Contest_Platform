'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  /** 폼 제출 시 이동할 기본 경로 (예: '/contests') */
  basePath: string;
  /** 현재 검색어 */
  currentSearch?: string;
  /** URL에 함께 전달할 추가 파라미터 */
  extraParams?: Record<string, string>;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
}

/**
 * 범용 검색 입력 UI (클라이언트 컴포넌트)
 * 공모전, 갤러리, 스토리 등 여러 페이지에서 사용
 */
export function SearchInput({ basePath, currentSearch, extraParams = {}, placeholder = '검색...' }: SearchInputProps) {
  const [searchValue, setSearchValue] = useState(currentSearch || '');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(extraParams);
    if (searchValue.trim()) {
      params.set('search', searchValue.trim());
    }
    const qs = params.toString();
    window.location.href = qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
      <div className="relative flex items-center w-full">
        <input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full pl-4 pr-10 py-2 rounded-lg bg-background/80 border border-border text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all"
        />
        <button
          type="submit"
          className="absolute right-2 p-1 rounded-md text-muted-foreground hover:text-violet-500 hover:bg-violet-500/10 transition-colors cursor-pointer"
          aria-label="검색"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
