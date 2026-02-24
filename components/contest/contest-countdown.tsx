'use client';

import { useState, useEffect } from 'react';

interface ContestCountdownProps {
  /** 마감 시각 (ISO 문자열) */
  deadline: string;
}

/**
 * 실시간 카운트다운 타이머
 * 접수 마감까지 남은시간을 초 단위로 갱신
 */
export function ContestCountdown({ deadline }: ContestCountdownProps) {
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
    return <span className="text-neutral-500 text-sm">마감됨</span>;
  }

  return (
    <div className="text-sm">
      <p className="text-neutral-500">접수 마감까지 남은시간</p>
      <p className="text-white font-bold tabular-nums">
        {String(timeLeft.days).padStart(2, '0')}일{' '}
        {String(timeLeft.hours).padStart(2, '0')}시간{' '}
        {String(timeLeft.minutes).padStart(2, '0')}분{' '}
        {String(timeLeft.seconds).padStart(2, '0')}초
      </p>
    </div>
  );
}