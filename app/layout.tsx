import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FloatingButtons } from "@/components/common/floating-buttons";
import { AuthProvider } from '@/lib/supabase/auth-context';
import { Suspense } from 'react';
import Script from 'next/script';
import { UtmTracker } from '@/components/tracking/utm-tracker';
import { ActivityTracker } from '@/components/tracking/activity-tracker';
import { SessionTimeoutGuard } from '@/components/auth/session-timeout-guard';
import { createClient } from '@/lib/supabase/server';
import { getSiteSettings } from '@/lib/data';
import { SITE_URL, SITE_NAME, DEFAULT_TITLE, DEFAULT_DESCRIPTION, BRAND_KEYWORDS } from '@/lib/seo';

/** GTM/GA4 환경변수 — .env.local에 설정하면 자동 활성화 */
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

/** viewport — Next.js 15 권장 분리 export */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

/**
 * 사이트 전역 메타데이터는 플랫폼 자체만 설명한다.
 * 개별 공모전명(예: 꿈꾸는 아리랑)을 여기 넣으면 그 공모전이 끝난 뒤에도
 * 사이트 전체가 그 이름으로 검색에 남고, 새 공모전이 열려도 갱신되지 않는다.
 * 공모전별 키워드는 각 공모전 페이지의 generateMetadata 가 DB 에서 만든다. (lib/seo.ts)
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [...BRAND_KEYWORDS],
  /* favicon.ico, apple-icon.png → app/ 폴더에 정적 파일로 배치, Next.js 자동 서빙 */
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'ko_KR',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'UHtj0SGkSHBwH2OJr5foPs3Y3diFWF2i9qyEIC9xOkc',
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  // 서버에서 인증 상태 미리 조회 (클라이언트 더블-페치 방지)
  // 미들웨어가 이미 JWT 검증 완료 → getSession()으로 쿠키에서 읽기 (네트워크 호출 없음)
  let serverUser: Parameters<typeof AuthProvider>[0]['serverUser'];
  let serverProfile: Parameters<typeof AuthProvider>[0]['serverProfile'];
  let siteSettings: Record<string, boolean> = {};

  try {
    const supabase = await createClient();
    if (supabase) {
      // 미들웨어에서 getUser()로 JWT 검증 완료 — getSession() 보안 경고 억제
      // (session.user 접근 시 Proxy가 경고를 발생시키므로 전체 블록에 적용)
      const _warn = console.warn;
      console.warn = (...args: unknown[]) => {
        if (typeof args[0] === 'string' && args[0].includes('Using the user object as returned from supabase.auth.getSession')) return;
        _warn.apply(console, args);
      };

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        serverUser = session.user;
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        serverProfile = data ?? null;
      } else {
        serverUser = null;
        serverProfile = null;
      }

      console.warn = _warn;
    }
  } catch {
    // 서버 인증 조회 실패 — 클라이언트에서 재시도 (serverUser=undefined)
  }

  try {
    siteSettings = await getSiteSettings();
  } catch {
    // 사이트 설정 조회 실패 시 기본값(모두 숨김) 유지
  }

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="naver-site-verification" content="41bf8699fb8e5b02f679b4c97b4661a2df984dc8" />
        <meta name="google-site-verification" content="yC3_lZ-RRahY-AjP5tIalXKVaXYGU9k6huandgzu17s" />
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} alt=""
            src="https://www.facebook.com/tr?id=746341501072587&ev=PageView&noscript=1"
          />
        </noscript>
      </head>
      <body>
        {/* GTM noscript — body 최상단 */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
              title="Google Tag Manager"
            />
          </noscript>
        )}

        {/* Google Tag Manager */}
        {GTM_ID && (
          <Script id="gtm-head" strategy="afterInteractive" src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`} />
        )}

        {/* Google Analytics 4 — GTM 없이 단독 사용 시 */}
        {GA4_ID && !GTM_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA4_ID}',{page_path:window.location.pathname,cookie_flags:'SameSite=None;Secure'});`}
            </Script>
          </>
        )}

        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive" src="https://connect.facebook.net/en_US/fbevents.js" />
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {"!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','746341501072587');fbq('track','PageView');"}
        </Script>
        <ThemeProvider attribute="data-theme" defaultTheme="signature" enableSystem>
          <AuthProvider serverUser={serverUser} serverProfile={serverProfile}>
            <SessionTimeoutGuard>
              <Header siteSettings={siteSettings} />
              <main className="min-h-screen">
                {children}
              </main>
              <Footer />
              <FloatingButtons />
              <Suspense fallback={null}>
                <UtmTracker />
              </Suspense>
              <Suspense fallback={null}>
                <ActivityTracker />
              </Suspense>
            </SessionTimeoutGuard>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
