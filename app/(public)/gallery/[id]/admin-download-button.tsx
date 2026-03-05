'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CheckCircle2 } from 'lucide-react';

interface AdminDownloadButtonProps {
  videoUrl: string;
}

/**
 * 관리자 전용 영상 다운로드 버튼
 * Cloudflare Stream API를 통해 MP4 다운로드 URL을 생성/조회한 뒤 새 탭에서 열기
 */
export function AdminDownloadButton({ videoUrl }: AdminDownloadButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleDownload = async () => {
    setStatus('loading');
    setErrorMsg('');

    try {
      /* 1. 기존 다운로드 URL 확인 */
      const checkRes = await fetch(`/api/admin/stream/downloads?videoUrl=${encodeURIComponent(videoUrl)}`);
      const checkData = await checkRes.json();

      if (!checkData.isStreamUrl) {
        setStatus('error');
        setErrorMsg('Cloudflare Stream 영상이 아닙니다.');
        return;
      }

      /* 이미 다운로드가 준비되어 있으면 바로 열기 */
      if (checkData.download?.status === 'ready' && checkData.download.url) {
        window.open(checkData.download.url, '_blank');
        setStatus('ready');
        return;
      }

      /* 2. 다운로드 생성 요청 */
      const createRes = await fetch('/api/admin/stream/downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      });

      if (!createRes.ok) {
        const data = await createRes.json();
        setStatus('error');
        setErrorMsg(data.error || '다운로드 생성 실패');
        return;
      }

      const createData = await createRes.json();

      if (createData.download?.status === 'ready' && createData.download.url) {
        /* 바로 다운로드 가능 */
        window.open(createData.download.url, '_blank');
        setStatus('ready');
      } else {
        /* 인코딩 중 — 잠시 후 재시도 안내 */
        setStatus('ready');
        setErrorMsg(`MP4 변환 중 (${createData.download?.percentComplete ?? 0}%). 잠시 후 다시 시도해주세요.`);
      }
    } catch {
      setStatus('error');
      setErrorMsg('네트워크 오류');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={status === 'loading'}
        className="gap-1.5"
      >
        {status === 'loading' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : status === 'ready' && !errorMsg ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        영상 다운로드
      </Button>
      {errorMsg && (
        <p className={`text-xs ${status === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}>
          {errorMsg}
        </p>
      )}
    </div>
  );
}
