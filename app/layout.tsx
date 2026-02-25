import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FloatingButtons } from "@/components/common/floating-buttons";
import { AuthProvider } from '@/lib/supabase/auth-context';
import { Suspense } from 'react';
import { UtmTracker } from '@/components/tracking/utm-tracker';
import { ActivityTracker } from '@/components/tracking/activity-tracker';
import { SessionTimeoutGuard } from '@/components/auth/session-timeout-guard';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: "꿈플 — AI로 꿈을 키우는 나무",
  description: "꿈플 — AI로 영상과 노래를 시도하며 꿈을 키워가는 나무",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌳</text></svg>",
  },
  openGraph: {
    title: "꿈플 — AI로 꿈을 키우는 나무",
    description: "AI 영상 공모전 플랫폼 · 꿈꾸는 아리랑",
    siteName: "꿈플",
    type: "website",
    images: [],
  },
  twitter: {
    card: "summary",
    title: "꿈플 — AI로 꿈을 키우는 나무",
    description: "AI 영상 공모전 플랫폼 · 꿈꾸는 아리랑",
    images: [],
  },
  verification: {
    google: "MmZsrGVkf7dm_tQpqGUq77hOgYrmVrvH9BUomSafY3M",
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
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        serverUser = session.user;
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        serverProfile = data ?? null;
      } else {
        serverUser = null;
        serverProfile = null;
      }
    }
  } catch {
    // 서버 인증 조회 실패 — 클라이언트에서 재시도 (serverUser=undefined)
  }

  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="signature" enableSystem>
          <AuthProvider serverUser={serverUser} serverProfile={serverProfile}>
            <SessionTimeoutGuard>
              <Header />
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
