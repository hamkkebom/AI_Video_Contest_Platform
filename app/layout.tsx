import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FloatingButtons } from "@/components/common/floating-buttons";
import { SitePopup } from '@/components/popup/site-popup';
import { AuthProvider } from '@/lib/supabase/auth-context';
import { Suspense } from 'react';
import { UtmTracker } from '@/components/tracking/utm-tracker';
import { ActivityTracker } from '@/components/tracking/activity-tracker';
import { SessionTimeoutGuard } from '@/components/auth/session-timeout-guard';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: "AI꿈 — AI와 함께 꿈을 설계하고 완성하다",
  description: "AI꿈 — AI와 함께 꿈을 설계하고 완성하다",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌳</text></svg>",
  },
  openGraph: {
    title: "AI꿈 — AI와 함께 꿈을 설계하고 완성하다",
    description: "AI 영상 공모전 플랫폼 · 꿈꾸는 아리랑",
    siteName: "AI꿈",
    type: "website",
    images: [],
  },
  twitter: {
    card: "summary",
    title: "AI꿈 — AI와 함께 꿈을 설계하고 완성하다",
    description: "AI 영상 공모전 플랫폼 · 꿈꾸는 아리랑",
    images: [],
  },
  verification: {
    google: "UHtj0SGkSHBwH2OJr5foPs3Y3diFWF2i9qyEIC9xOkc",
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

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Meta Pixel Code */}
        <script dangerouslySetInnerHTML={{ __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '746341501072587');
          fbq('track', 'PageView');
        `}} />
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=746341501072587&ev=PageView&noscript=1"
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="signature" enableSystem>
          <AuthProvider serverUser={serverUser} serverProfile={serverProfile}>
            <SessionTimeoutGuard>
              <Header />
              <main className="min-h-screen">
                {children}
              </main>
              <Footer />
              <SitePopup />
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
