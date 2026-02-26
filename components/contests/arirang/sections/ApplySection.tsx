'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

import { Send, CheckCircle2, Film, Clock, AlertCircle } from 'lucide-react';
import { useLang } from '@/components/contests/arirang/lang-context';
import { t, translations } from '@/components/contests/arirang/translations';
import { useSubmissionStatus } from '@/hooks/useSubmissionStatus';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

/** 공모전 접수 안내 섹션 (폼은 /contests/contest-1/submit 으로 이동) */
export function ApplySection() {
  const router = useRouter();
  const params = useParams();
  const contestId = params.id as string;
  const { lang } = useLang();
  const applyTranslations = translations.apply;

  const { hasSubmitted, loading: statusLoading } = useSubmissionStatus(contestId);
  const [dialogOpen, setDialogOpen] = useState(false);

  /** 접수 버튼 클릭 핸들러 */
  const handleApplyClick = () => {
    /* 제출 여부 쿼리 완료 + 이미 제출 → Dialog 표시 */
    if (!statusLoading && hasSubmitted) {
      setDialogOpen(true);
      return;
    }
    /* 쿼리 미완료면 그냥 이동 — submit 페이지에서 이중 체크 */
    router.push(`/contests/${contestId}/submit`);
  };
  return (
    <section id="apply" className="relative py-24 md:py-32">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, var(--ar-primary-dark), rgba(27,20,100,0.2), var(--ar-primary-dark))' }}
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="arirang-animate text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight mb-4"
          style={{ color: 'var(--ar-cream)' }}
        >
          {t(applyTranslations, 'title', lang)}
        </h2>
        <p className="arirang-animate text-center mb-12" style={{ color: 'rgba(245,240,232,0.5)' }}>
          {t(applyTranslations, 'subtitle', lang)}
        </p>

        {/* 접수 안내 카드 */}
        <div
          className="arirang-animate p-6 md:p-10 rounded-3xl backdrop-blur-sm space-y-8"
          style={{
            backgroundColor: 'rgba(13,11,26,0.8)',
            border: '1px solid rgba(245,240,232,0.1)',
          }}
        >
          {/* 접수 절차 안내 */}
          <div className="space-y-4">
            <h3
              className="text-lg font-semibold flex items-center gap-2"
              style={{ color: 'var(--ar-cream)' }}
            >
              <Film className="w-5 h-5" style={{ color: 'var(--ar-accent)' }} />
              {t(applyTranslations, 'guideTitle', lang)}
            </h3>
            <ul className="space-y-3">
              {[
                { icon: CheckCircle2, key: 'guide1' },
                { icon: CheckCircle2, key: 'guide2' },
                { icon: CheckCircle2, key: 'guide3' },
                { icon: CheckCircle2, key: 'guide4' },
              ].map((item) => (
                <li key={item.key} className="flex items-start gap-3">
                  <item.icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--ar-accent)' }} />
                  <span className="text-sm" style={{ color: 'rgba(245,240,232,0.7)' }}>
                    {t(applyTranslations, item.key, lang)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* 마감 안내 */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              backgroundColor: 'rgba(212,168,67,0.08)',
              border: '1px solid rgba(212,168,67,0.15)',
            }}
          >
            <Clock className="w-5 h-5 shrink-0" style={{ color: 'var(--ar-accent)' }} />
            <p className="text-sm" style={{ color: 'rgba(245,240,232,0.6)' }}>
              {t(applyTranslations, 'deadlinePrefix', lang)}{' '}
              <span className="font-semibold" style={{ color: 'var(--ar-cream)' }}>{t(applyTranslations, 'deadlineValue', lang)}</span>
              {' '}{t(applyTranslations, 'deadlineSuffix', lang)}
            </p>
          </div>

          {/* CTA 버튼 */}
          <button
            type="button"
            onClick={handleApplyClick}
            className="w-full py-4 font-bold text-lg rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--ar-accent)',
              color: 'var(--ar-primary-dark)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ar-accent-light)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ar-accent)'; }}
          >
            <Send className="w-5 h-5" />
            {t(applyTranslations, 'cta', lang)}
          </button>

          <p className="text-center text-xs" style={{ color: 'rgba(245,240,232,0.3)' }}>
            {t(applyTranslations, 'ctaHint', lang)}
          </p>
        </div>

      {/* 이미 제출한 경우 안내 Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-500" />
            </div>
            <DialogTitle className="text-center">이미 제출한 공모전입니다</DialogTitle>
            <DialogDescription className="text-center">
              이 공모전에는 이미 영상을 제출하셨습니다. 추가 제출은 불가합니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="cursor-pointer flex-1"
              onClick={() => setDialogOpen(false)}
            >
              확인
            </Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700 text-white cursor-pointer flex-1"
              onClick={() => { setDialogOpen(false); router.push('/my/submissions'); }}
            >
              내 출품작 보기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </section>
  );
}