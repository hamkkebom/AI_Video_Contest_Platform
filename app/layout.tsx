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

export const metadata: Metadata = {
  title: "꿈플 — AI로 꿈을 키우는 나무",
  description: "꿈플 — AI로 영상과 노래를 시도하며 꿈을 키워가는 나무",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌳</text></svg>",
  },
  verification: {
    google: "GmdzYkOhfANE8IQ3JXMd_BOqtXcAuykFU1CjDd3Wa1M",
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="signature" enableSystem>
          <AuthProvider>
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
