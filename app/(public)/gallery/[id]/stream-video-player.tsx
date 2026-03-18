'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface StreamVideoPlayerProps {
  videoUid: string;
  title: string;
  posterUrl?: string;
}

type PlayerStatus = 'checking' | 'processing' | 'ready' | 'error';

interface StreamStatusResponse {
  readyToStream?: boolean;
  status?: {
    state?: 'uploading' | 'inprogress' | 'ready' | 'error';
    pctComplete?: number;
    errorReasonText?: string;
  } | null;
}

function isStreamUid(value: string) {
  return /^[a-f0-9]{32}$/.test(value);
}

export function StreamVideoPlayer({ videoUid, title, posterUrl }: StreamVideoPlayerProps) {
  const [status, setStatus] = useState<PlayerStatus>('checking');
  const [pctComplete, setPctComplete] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!isStreamUid(videoUid)) {
      setStatus('ready');
      return;
    }

    const clearPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const checkStatus = async (): Promise<'ready' | 'error' | 'processing'> => {
      try {
        const res = await fetch(`/api/stream/status?uid=${videoUid}`);
        if (!res.ok) throw new Error('status api failed');

        const data = (await res.json()) as StreamStatusResponse;
        if (cancelled) return 'processing';

        if (data.readyToStream || data.status?.state === 'ready') {
          setStatus('ready');
          clearPolling();
          return 'ready';
        }

        if (data.status?.state === 'error') {
          setStatus('error');
          setErrorMsg(data.status.errorReasonText || '영상 처리 중 오류가 발생했습니다.');
          clearPolling();
          return 'error';
        }

        setStatus('processing');
        setPctComplete(data.status?.pctComplete ?? 0);
        return 'processing';
      } catch {
        // 기존 동작 유지: 상태 확인 실패 시 재생 시도
        if (!cancelled) {
          setStatus('ready');
          clearPolling();
        }
        return 'ready';
      }
    };

    const init = async () => {
      const result = await checkStatus();
      if (!cancelled && result === 'processing') {
        intervalRef.current = setInterval(checkStatus, 10_000);
      }
    };

    void init();

    return () => {
      cancelled = true;
      clearPolling();
    };
  }, [videoUid]);

  if (status === 'checking') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-4 text-white px-4">
        <Loader2 className="h-10 w-10 animate-spin text-orange-400" />
        <div className="text-center space-y-2">
          <p className="font-medium">영상 인코딩 처리 중...</p>
          {pctComplete > 0 ? (
            <div className="w-48 mx-auto">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 transition-all duration-500" style={{ width: `${pctComplete}%` }} />
              </div>
              <p className="text-xs text-white/60 mt-1">{pctComplete}% 완료</p>
            </div>
          ) : null}
          <p className="text-sm text-white/60">잠시 후 자동으로 재생됩니다</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-2 text-white px-4 text-center">
        <p className="font-medium text-red-400">영상 처리 실패</p>
        <p className="text-sm text-white/60">{errorMsg}</p>
      </div>
    );
  }

  const iframeSrc = isStreamUid(videoUid)
    ? `https://iframe.videodelivery.net/${videoUid}${posterUrl ? `?poster=${encodeURIComponent(posterUrl)}` : ''}`
    : videoUid;

  return (
    <iframe
      src={iframeSrc}
      title={title}
      loading="lazy"
      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
      className="w-full h-full border-0"
    />
  );
}
