'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Popup } from '@/lib/types';

type PopupListResponse = {
  popups?: Popup[];
};

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDismissKey(userId: string, popupId: string, dateString: string) {
  return `popup_dismissed_${userId}_${popupId}_${dateString}`;
}

export function SitePopup() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useAuth();
  const userId = user?.id ?? 'anonymous';

  const todayString = useMemo(() => getTodayString(), []);

  useEffect(() => {
    const loadPopups = async () => {
      try {
        const response = await fetch('/api/popups', { cache: 'no-store' });
        if (!response.ok) return;

        const data = (await response.json()) as PopupListResponse;
        const rawPopups = data.popups ?? [];

        const filtered = rawPopups.filter((popup) => {
          const dismissed = localStorage.getItem(getDismissKey(userId, popup.id, todayString));
          return dismissed !== '1';
        });

        setPopups(filtered);
      } catch (error) {
        console.error('Failed to load site popups:', error);
      }
    };

    loadPopups();
  }, [todayString, userId]);

  const currentPopup = popups[currentIndex];

  const moveToNextPopup = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const handleDismissToday = () => {
    if (!currentPopup) return;
    localStorage.setItem(getDismissKey(userId, currentPopup.id, todayString), '1');
    moveToNextPopup();
  };

  const handleClose = () => {
    moveToNextPopup();
  };

  if (!currentPopup) {
    return null;
  }

  return (
    <Dialog open={!!currentPopup} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md overflow-hidden p-0 [&>button[class*='absolute']]:hidden">
        {/* 제목 헤더 + 닫기 */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <DialogHeader className="flex-1">
            <DialogTitle>{currentPopup.title}</DialogTitle>
            <DialogDescription className="sr-only">운영 팝업 안내</DialogDescription>
          </DialogHeader>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-sm opacity-70 transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">닫기</span>
          </button>
        </div>

        {/* 이미지 */}
        {currentPopup.imageUrl ? (
          <div className="overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentPopup.imageUrl} alt={currentPopup.title} className="h-auto w-full object-cover" />
          </div>
        ) : null}

        {/* 본문 */}
        <div className="space-y-4 p-6 pt-5">
          {currentPopup.content ? (
            <div
              className="max-h-[260px] overflow-y-auto text-sm leading-relaxed text-foreground/90"
              dangerouslySetInnerHTML={{ __html: currentPopup.content }}
            />
          ) : null}

          {currentPopup.linkUrl ? (
            <a
              href={currentPopup.linkUrl}
              target={currentPopup.linkTarget === '_blank' ? '_blank' : '_self'}
              rel={currentPopup.linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
              className="inline-flex"
            >
              <Button size="sm">자세히 보기</Button>
            </a>
          ) : null}

          <DialogFooter className="gap-2 sm:justify-between sm:space-x-0">
            <Button type="button" variant="outline" onClick={handleDismissToday}>
              오늘 하루 안보기
            </Button>
            <Button type="button" onClick={handleClose}>
              닫기
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
