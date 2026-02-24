'use client';

import { useState, useEffect } from 'react';

interface ContestCountdownProps {
  /** 카운트다운 대상 시각 (ISO 문자열) */
  deadline: string;
  /** 타이머 위 라벨 (기본: "접수 마감까지 남은시간") */
  label?: string;
  /** 만료 후 표시 텍스트 (기본: "마감됨") */
  expiredText?: string;
  /** 크기: sm(기본), lg(리스트뷰 강조용) */
  size?: 'sm' | 'lg';
}

/**
 * 실시간 카운트다운 타이머
 * 접수 마감/접수 시작까지 남은시간을 초 단위로 갱신
 */
export function ContestCountdown({
  deadline,
  label = '접수 마감까지 남은시간',
  expiredText = '마감됨',
  size = 'sm',
}: ContestCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) return null;
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculate());
    const interval = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!timeLeft) {
    return <span className="text-neutral-500 text-sm">{expiredText}</span>;
  }

  if (size === 'lg') {
    return (
      <div>
        <p className="text-neutral-400 text-sm mb-1">{label}</p>
        <p className="text-white font-extrabold text-2xl md:text-3xl tabular-nums tracking-tight">
          {String(timeLeft.days).padStart(2, '0')}
          <span className="text-neutral-500 text-lg font-medium">일 </span>
          {String(timeLeft.hours).padStart(2, '0')}
          <span className="text-neutral-500 text-lg font-medium">시간 </span>
          {String(timeLeft.minutes).padStart(2, '0')}
          <span className="text-neutral-500 text-lg font-medium">분 </span>
          {String(timeLeft.seconds).padStart(2, '0')}
          <span className="text-neutral-500 text-lg font-medium">초</span>
        </p>
      </div>
    );
  }

  return (
    <div className="text-sm">
      <p className="text-neutral-500">{label}</p>
      <p className="text-white font-bold tabular-nums">
        {String(timeLeft.days).padStart(2, '0')}일{' '}
        {String(timeLeft.hours).padStart(2, '0')}시간{' '}
        {String(timeLeft.minutes).padStart(2, '0')}분{' '}
        {String(timeLeft.seconds).padStart(2, '0')}초
      </p>
    </div>
  );
}
