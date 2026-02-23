'use client';

import { useRef, useEffect, useState } from 'react';

interface AutoFitTitleProps {
    children: string;
    className?: string;
    maxLines?: number;
    maxFontSize?: number;
    minFontSize?: number;
}

/**
 * 제목이 maxLines 줄 안에 들어오도록 자동으로 폰트 크기를 조절하는 컴포넌트.
 * - maxFontSize에서 시작해서, 넘치면 0.5px씩 줄여가며 맞춤.
 * - 2줄인데 마지막 줄이 짧으면(애매한 줄바꿈) 폰트를 더 줄여 1줄로 만듦.
 * - minFontSize 이하로는 줄이지 않고 line-clamp로 잘라냄.
 */
export function AutoFitTitle({
    children,
    className = '',
    maxLines = 2,
    maxFontSize = 18,
    minFontSize = 13,
}: AutoFitTitleProps) {
    const ref = useRef<HTMLHeadingElement>(null);
    const [fontSize, setFontSize] = useState(maxFontSize);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // line-clamp 해제하고 max 사이즈로 리셋
        el.style.fontSize = `${maxFontSize}px`;
        el.style.webkitLineClamp = 'unset';

        const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || maxFontSize * 1.375;
        const oneLineHeight = lineHeight + 2; // 1줄 높이 (tolerance 포함)
        const maxHeight = lineHeight * maxLines + 2; // 최대 줄 수 높이

        let currentSize = maxFontSize;

        // Step 1: maxLines 안에 들어오게 맞춤
        while (el.scrollHeight > maxHeight && currentSize > minFontSize) {
            currentSize -= 0.5;
            el.style.fontSize = `${currentSize}px`;
        }

        // Step 2: 2줄인데 애매하게 줄바꿈된 경우 → 1줄로 줄이기 시도
        // 현재 2줄이고, 추가로 3px만 줄이면 1줄에 들어갈 수 있으면 줄임
        if (el.scrollHeight > oneLineHeight && currentSize > minFontSize) {
            const savedSize = currentSize;
            const shrinkLimit = Math.max(currentSize - 4, minFontSize);
            let fitsOneLine = false;

            while (currentSize > shrinkLimit) {
                currentSize -= 0.5;
                el.style.fontSize = `${currentSize}px`;
                // lineHeight도 폰트에 따라 달라지므로 재계산
                const newLineHeight = parseFloat(getComputedStyle(el).lineHeight) || currentSize * 1.375;
                if (el.scrollHeight <= newLineHeight + 2) {
                    fitsOneLine = true;
                    break;
                }
            }

            // 3px 줄여도 1줄 안 되면 원래 2줄 크기로 복원
            if (!fitsOneLine) {
                currentSize = savedSize;
                el.style.fontSize = `${currentSize}px`;
            }
        }

        // Step 3: 그래도 넘치면 line-clamp 적용
        if (el.scrollHeight > maxHeight) {
            el.style.webkitLineClamp = String(maxLines);
        }

        setFontSize(currentSize);
    }, [children, maxFontSize, minFontSize, maxLines]);

    // 2줄 기준 고정 높이 (lineHeight * maxLines)
    const fixedHeight = maxFontSize * 1.375 * maxLines;

    return (
        <div style={{ height: `${fixedHeight}px` }} className="flex items-start">
            <h3
                ref={ref}
                className={`keep-all-title ${className}`}
                style={{
                    fontSize: `${fontSize}px`,
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    wordBreak: 'keep-all',
                    overflowWrap: 'break-word',
                    overflow: 'hidden',
                }}
            >
                {children}
            </h3>
        </div >
    );
}
