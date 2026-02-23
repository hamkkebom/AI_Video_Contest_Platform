'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Route } from 'next';
import { ChevronDown, Check } from 'lucide-react';

interface SortOption {
    value: string;
    label: string;
}

interface SortSelectProps {
    /** 정렬 옵션 목록 */
    options?: SortOption[];
    /** 현재 선택된 값 (제어 컴포넌트) */
    value?: string;
    /** 값 변경 콜백 (제어 컴포넌트) */
    onChange?: (value: string) => void;
    /** URL 기반 네비게이션 경로 (비제어: searchParams 사용) */
    basePath?: string;
    /** URL searchParam key (기본: 'sort') */
    paramKey?: string;
    /** 기본값 */
    defaultValue?: string;
}

/** 기본 옵션 (공모전 페이지용) */
const DEFAULT_OPTIONS: SortOption[] = [
    { value: 'deadline', label: '마감임박순' },
    { value: 'latest', label: '최신순' },
];

/**
 * 커스텀 정렬 드롭다운
 * - 제어 모드: value + onChange
 * - 비제어 모드: basePath + searchParams (URL 기반)
 */
export function SortSelect({
    options = DEFAULT_OPTIONS,
    value,
    onChange,
    basePath,
    paramKey = 'sort',
    defaultValue,
}: SortSelectProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // 현재 선택값 결정
    const currentValue = value ?? searchParams.get(paramKey) ?? defaultValue ?? options[0]?.value ?? '';
    const currentLabel = options.find((o) => o.value === currentValue)?.label ?? '정렬';

    // 바깥 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (val: string) => {
        setOpen(false);
        if (onChange) {
            onChange(val);
        } else if (basePath) {
            const params = new URLSearchParams(searchParams.toString());
            params.set(paramKey, val);
            router.push(`${basePath}?${params.toString()}` as Route, { scroll: false });
        } else {
            // 기본 공모전 경로 (하위호환)
            const status = searchParams.get('status') || 'open';
            router.push(`/contests?status=${status}&sort=${val}` as Route, { scroll: false });
        }
    };

    return (
        <div ref={ref} className="relative">
            {/* 트리거 버튼 */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer
                           bg-white/5 border border-white/10 backdrop-blur-sm
                           hover:bg-white/10 hover:border-violet-500/30
                           transition-all duration-200"
            >
                <span className="text-muted-foreground mr-0.5">정렬</span>
                <span className="relative text-violet-500 font-semibold">
                    {/* 가장 긴 옵션에 맞춰 너비 고정 */}
                    <span className="invisible block h-0 leading-none" aria-hidden="true">
                        {options.reduce((a, b) => a.label.length >= b.label.length ? a : b).label}
                    </span>
                    <span>{currentLabel}</span>
                </span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {/* 드롭다운 메뉴 */}
            {open && (
                <div className="absolute right-0 top-full mt-2 min-w-[160px] z-50
                                rounded-xl border border-white/10 shadow-xl
                                backdrop-blur-xl bg-background/90
                                py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelect(opt.value)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer
                                        transition-colors duration-150
                                        ${currentValue === opt.value
                                    ? 'text-violet-500 font-semibold bg-violet-500/10'
                                    : 'text-foreground/80 hover:bg-white/5 hover:text-foreground'
                                }`}
                        >
                            {opt.label}
                            {currentValue === opt.value && (
                                <Check className="h-4 w-4 text-violet-500" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
