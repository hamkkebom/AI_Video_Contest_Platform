'use client';

import { useEffect, useRef } from 'react';

/**
 * UTM 파라미터 캡처 컴포넌트
 * URL에서 utm_source, utm_medium, utm_campaign, utm_term, utm_content를 읽어
 * /api/utm으로 전송합니다.
 * 
 * 페이지 로드 시 1회만 실행되며, sessionStorage로 중복 전송을 방지합니다.
 */
export function UtmTracker() {
  const sent = useRef(false);

  useEffect(() => {
    // 이미 전송했으면 무시
    if (sent.current) return;

    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');
    const utmTerm = params.get('utm_term');
    const utmContent = params.get('utm_content');
    const referrer = document.referrer || undefined;
    const landingPage = window.location.pathname + window.location.search;

    // UTM 파라미터가 하나도 없고 referrer도 없으면 전송하지 않음
    if (!utmSource && !utmMedium && !utmCampaign && !referrer) return;

    // 같은 세션에서 같은 UTM 조합이면 중복 전송 방지
    const utmKey = `utm_${utmSource}_${utmMedium}_${utmCampaign}`;
    if (sessionStorage.getItem(utmKey)) return;

    // 고유 세션 ID 생성 (없으면 새로 만듦)
    let sessionId = sessionStorage.getItem('utm_session_id');
    if (!sessionId) {
      sessionId = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('utm_session_id', sessionId);
    }

    sent.current = true;
    sessionStorage.setItem(utmKey, '1');

    // 비동기 전송 (실패해도 사용자에게 영향 없음)
    fetch('/api/utm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
        referrer,
        landingPage,
      }),
    }).catch(() => {
      // UTM 기록 실패는 무시 — 사용자 경험에 영향 없음
    });
  }, []);

  return null;
}
